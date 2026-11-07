// Video export: renders every frame offline and encodes MP4 (H.264 + AAC/Opus) with
// WebCodecs via mediabunny. Falls back to real-time MediaRecorder capture on browsers
// without WebCodecs encoders.
import {
  Output, Mp4OutputFormat, WebMOutputFormat, BufferTarget, CanvasSource, AudioBufferSource,
  QUALITY_HIGH, getFirstEncodableVideoCodec, getFirstEncodableAudioCodec,
} from '../vendor/vendor.js';
import { renderFrame, segmentIndexAt } from './render.js';
import { getDecoded, peekDecoded } from './gif.js';
import { sliceBuffer, audioContext } from './beats.js';

async function ensureDecoded(edit, i) {
  const ids = edit.assignments;
  const keep = new Set([ids[i], ids[i + 1], ids[i + 2]].filter(Boolean));
  if (ids[i]) await getDecoded(ids[i], keep).catch(() => null);
  // prefetch the next one in the background
  if (ids[i + 1]) getDecoded(ids[i + 1], keep).catch(() => null);
}

async function pickFormat(W, H, fps, audio) {
  if (typeof VideoEncoder === 'undefined' || typeof AudioEncoder === 'undefined') return null;
  const opts = { width: W, height: H, frameRate: fps, quality: QUALITY_HIGH };
  const aopts = { numberOfChannels: audio.numberOfChannels, sampleRate: audio.sampleRate, quality: QUALITY_HIGH };
  const mp4 = new Mp4OutputFormat({ fastStart: 'in-memory' });
  const vMp4 = await getFirstEncodableVideoCodec(['avc', 'hevc'], opts);
  const aMp4 = await getFirstEncodableAudioCodec(['aac', 'opus'], aopts);
  if (vMp4 && aMp4) return { format: mp4, video: vMp4, audio: aMp4, ext: 'mp4', mime: 'video/mp4' };
  const webm = new WebMOutputFormat();
  const vWebm = await getFirstEncodableVideoCodec(['vp9', 'vp8', 'av1'], opts);
  const aWebm = await getFirstEncodableAudioCodec(['opus', 'vorbis'], aopts);
  if (vWebm && aWebm) return { format: webm, video: vWebm, audio: aWebm, ext: 'webm', mime: 'video/webm' };
  return null;
}

async function exportWebCodecs(plan, opts) {
  const { audioBuffer, edit, start, end, W, H, fps, onProgress, signal } = opts;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { alpha: false });

  const output = new Output({ format: plan.format, target: new BufferTarget() });
  const video = new CanvasSource(canvas, { codec: plan.video, quality: QUALITY_HIGH, keyFrameInterval: 1 });
  const audio = new AudioBufferSource({ codec: plan.audio, quality: QUALITY_HIGH });
  output.addVideoTrack(video, { frameRate: fps });
  output.addAudioTrack(audio);
  await output.start();

  const audioDone = audio.add(sliceBuffer(audioBuffer, start, end)).then(() => audio.close());

  const total = Math.max(1, Math.round((end - start) * fps));
  let lastSeg = -1;
  for (let f = 0; f < total; f++) {
    if (signal && signal.aborted) {
      await output.cancel();
      throw new DOMException('Export cancelled', 'AbortError');
    }
    const tOut = f / fps;
    const t = start + tOut;
    const i = segmentIndexAt(edit.segments, t);
    if (i !== lastSeg) {
      await ensureDecoded(edit, i);
      lastSeg = i;
    }
    renderFrame(ctx, W, H, t, edit, peekDecoded);
    await video.add(tOut, 1 / fps);
    if (f % 5 === 0) onProgress && onProgress(f / total);
  }
  video.close();
  await audioDone;
  await output.finalize();
  onProgress && onProgress(1);
  return { blob: new Blob([output.target.buffer], { type: plan.mime }), ext: plan.ext };
}

/** Real-time fallback: play the edit into a canvas + audio stream and record it. */
async function exportRealtime(opts) {
  const { audioBuffer, edit, start, end, W, H, fps, onProgress, signal } = opts;
  if (typeof MediaRecorder === 'undefined') throw new Error('This browser cannot export video. Try Chrome, Edge or Safari 17+.');
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { alpha: false });

  // pre-decode everything (realtime needs frames ready)
  const ids = [...new Set(edit.assignments.filter(Boolean))];
  for (let k = 0; k < ids.length; k++) {
    await getDecoded(ids[k], new Set(ids)).catch(() => null);
    onProgress && onProgress((k / ids.length) * 0.1);
  }

  const actx = audioContext();
  await actx.resume();
  const dest = actx.createMediaStreamDestination();
  const src = actx.createBufferSource();
  src.buffer = audioBuffer;
  src.connect(dest);
  const stream = new MediaStream([...canvas.captureStream(fps).getVideoTracks(), ...dest.stream.getAudioTracks()]);
  const types = ['video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'];
  const mimeType = types.find((m) => MediaRecorder.isTypeSupported(m)) || '';
  const rec = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
  const chunks = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const stopped = new Promise((r) => (rec.onstop = r));

  renderFrame(ctx, W, H, start, edit, peekDecoded);
  rec.start(250);
  const t0 = actx.currentTime + 0.05;
  src.start(t0, start, end - start);
  await new Promise((resolve) => {
    const tick = () => {
      const t = start + Math.max(0, actx.currentTime - t0);
      if ((signal && signal.aborted) || t >= end) return resolve();
      renderFrame(ctx, W, H, t, edit, peekDecoded);
      onProgress && onProgress(0.1 + 0.9 * ((t - start) / (end - start)));
      requestAnimationFrame(tick);
    };
    tick();
  });
  try { src.stop(); } catch { /* already stopped */ }
  rec.stop();
  await stopped;
  if (signal && signal.aborted) throw new DOMException('Export cancelled', 'AbortError');
  const type = rec.mimeType || mimeType || 'video/webm';
  return { blob: new Blob(chunks, { type }), ext: type.includes('mp4') ? 'mp4' : 'webm' };
}

export async function exportVideo(opts) {
  const plan = await pickFormat(opts.W, opts.H, opts.fps, opts.audioBuffer).catch(() => null);
  if (plan) {
    try {
      return await exportWebCodecs(plan, opts);
    } catch (e) {
      if (e.name === 'AbortError') throw e;
      console.warn('WebCodecs export failed, falling back to realtime capture', e);
    }
  }
  return exportRealtime(opts);
}
