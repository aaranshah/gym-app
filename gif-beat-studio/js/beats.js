// Audio extraction + beat detection.
//
// Pipeline (similar in spirit to librosa / CapCut "auto beat"):
//   1. decode the uploaded file (audio OR video, e.g. a TikTok .mp4) to PCM
//   2. mix to mono and resample to 22.05 kHz
//   3. onset-strength envelope = log-compressed spectral flux over mel-like bands
//   4. tempo = autocorrelation of the envelope, weighted towards ~120 BPM
//   5. beat positions = dynamic-programming beat tracker (Ellis 2007)
//   6. "hits" mode = adaptive peak picking on the envelope instead of a tempo grid
import { Input, ALL_FORMATS, BlobSource, AudioBufferSink } from '../vendor/vendor.js';

const SR = 22050;
const N_FFT = 1024;
const HOP = 256;
export const ENV_RATE = SR / HOP; // onset-envelope frames per second (~86.13)

let sharedCtx = null;
export function audioContext() {
  if (!sharedCtx) sharedCtx = new (window.AudioContext || window.webkitAudioContext)();
  return sharedCtx;
}

/** Decode any audio/video file into an AudioBuffer (extracts the sound track from videos). */
export async function decodeAudioFile(file) {
  const ctx = audioContext();
  try {
    const buf = await file.arrayBuffer();
    return await ctx.decodeAudioData(buf);
  } catch (err) {
    // Fallback: demux with mediabunny and decode through WebCodecs.
    const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
    const track = await input.getPrimaryAudioTrack();
    if (!track) throw new Error('No audio track found in this file');
    const sink = new AudioBufferSink(track);
    const parts = [];
    for await (const { buffer, timestamp } of sink.buffers()) parts.push({ buffer, timestamp });
    if (!parts.length) throw err;
    const sr = parts[0].buffer.sampleRate;
    const ch = parts[0].buffer.numberOfChannels;
    const end = parts.reduce((m, p) => Math.max(m, p.timestamp + p.buffer.duration), 0);
    const out = new AudioBuffer({ length: Math.ceil(end * sr), sampleRate: sr, numberOfChannels: ch });
    for (const p of parts) {
      const offset = Math.max(0, Math.round(p.timestamp * sr));
      for (let c = 0; c < ch; c++) {
        const data = p.buffer.getChannelData(Math.min(c, p.buffer.numberOfChannels - 1));
        out.copyToChannel(data.subarray(0, Math.max(0, out.length - offset)), c, offset);
      }
    }
    return out;
  }
}

async function toMono22k(buffer) {
  const length = Math.max(1, Math.ceil(buffer.duration * SR));
  const off = new OfflineAudioContext(1, length, SR);
  const src = off.createBufferSource();
  src.buffer = buffer;
  src.connect(off.destination);
  src.start();
  const rendered = await off.startRendering();
  return rendered.getChannelData(0);
}

// --- FFT (in-place radix-2) -------------------------------------------------
function makeFFT(n) {
  const levels = Math.log2(n);
  const cos = new Float32Array(n / 2), sin = new Float32Array(n / 2);
  for (let i = 0; i < n / 2; i++) {
    cos[i] = Math.cos((2 * Math.PI * i) / n);
    sin[i] = Math.sin((2 * Math.PI * i) / n);
  }
  const rev = new Uint32Array(n);
  for (let i = 0; i < n; i++) {
    let r = 0;
    for (let b = 0; b < levels; b++) r = (r << 1) | ((i >>> b) & 1);
    rev[i] = r;
  }
  return (re, im) => {
    for (let i = 0; i < n; i++) {
      const j = rev[i];
      if (j > i) {
        let t = re[i]; re[i] = re[j]; re[j] = t;
        t = im[i]; im[i] = im[j]; im[j] = t;
      }
    }
    for (let size = 2; size <= n; size *= 2) {
      const half = size / 2, step = n / size;
      for (let i = 0; i < n; i += size) {
        for (let j = i, k = 0; j < i + half; j++, k += step) {
          const l = j + half;
          const tre = re[l] * cos[k] + im[l] * sin[k];
          const tim = -re[l] * sin[k] + im[l] * cos[k];
          re[l] = re[j] - tre; im[l] = im[j] - tim;
          re[j] += tre; im[j] += tim;
        }
      }
    }
  };
}

function melBands(nBands, nBins) {
  // triangular filters spaced on the mel scale between 30 Hz and 11 kHz
  const hzToMel = (f) => 2595 * Math.log10(1 + f / 700);
  const melToHz = (m) => 700 * (10 ** (m / 2595) - 1);
  const lo = hzToMel(30), hi = hzToMel(SR / 2);
  const pts = [];
  for (let i = 0; i < nBands + 2; i++) pts.push(melToHz(lo + ((hi - lo) * i) / (nBands + 1)));
  const binHz = SR / N_FFT;
  return Array.from({ length: nBands }, (_, b) => {
    const [f0, f1, f2] = [pts[b], pts[b + 1], pts[b + 2]];
    const w = new Float32Array(nBins);
    for (let k = 0; k < nBins; k++) {
      const f = k * binHz;
      if (f > f0 && f < f2) w[k] = f <= f1 ? (f - f0) / (f1 - f0) : (f2 - f) / (f2 - f1);
    }
    return w;
  });
}

// time (s) of envelope frame i — frames are centred on their analysis window
export const frameTime = (i) => (i * HOP + N_FFT / 2) / SR;

function detrendNormalize(env) {
  const n = env.length;
  const out = new Float32Array(n);
  const r = Math.round(ENV_RATE * 0.2);
  const pre = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) pre[i + 1] = pre[i] + env[i];
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - r), b = Math.min(n, i + r + 1);
    out[i] = Math.max(0, env[i] - (pre[b] - pre[a]) / (b - a));
  }
  let max = 0;
  for (const v of out) max = Math.max(max, v);
  if (max > 0) for (let i = 0; i < n; i++) out[i] /= max;
  return out;
}

/** Returns { env, low }: full-band onset strength and a bass-only (<200 Hz) onset strength. */
function onsetEnvelope(x) {
  const nFrames = Math.max(1, Math.floor((x.length - N_FFT) / HOP) + 1);
  const nBins = N_FFT / 2 + 1;
  const fft = makeFFT(N_FFT);
  const win = new Float32Array(N_FFT);
  for (let i = 0; i < N_FFT; i++) win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N_FFT);
  const NB = 40;
  const bands = melBands(NB, nBins).map((w) => {
    let lo = 0, hi = nBins - 1;
    while (lo < nBins && !w[lo]) lo++;
    while (hi > lo && !w[hi]) hi--;
    return { w, lo, hi };
  });
  const binHz = SR / N_FFT;
  const lowBands = bands.map((b) => ((b.lo + b.hi) / 2) * binHz < 200);
  const re = new Float32Array(N_FFT), im = new Float32Array(N_FFT);
  const mag = new Float32Array(nBins);
  const db = new Float32Array(nFrames * NB);
  let peak = -Infinity;
  for (let f = 0; f < nFrames; f++) {
    const o = f * HOP;
    for (let i = 0; i < N_FFT; i++) { re[i] = (x[o + i] || 0) * win[i]; im[i] = 0; }
    fft(re, im);
    for (let k = 0; k < nBins; k++) mag[k] = re[k] * re[k] + im[k] * im[k];
    for (let b = 0; b < NB; b++) {
      const { w, lo, hi } = bands[b];
      let s = 0;
      for (let k = lo; k <= hi; k++) s += w[k] * mag[k];
      const v = 10 * Math.log10(1e-10 + s);
      db[f * NB + b] = v;
      if (v > peak) peak = v;
    }
  }
  // like librosa's power_to_db(ref=max, top_db=80): ignore changes in near-silent bands
  const floor = peak - 80;
  for (let i = 0; i < db.length; i++) if (db[i] < floor) db[i] = floor;
  const env = new Float32Array(nFrames), low = new Float32Array(nFrames);
  for (let f = 1; f < nFrames; f++) {
    let all = 0, lo = 0;
    for (let b = 0; b < NB; b++) {
      const d = db[f * NB + b] - db[(f - 1) * NB + b];
      if (d > 0) { all += d; if (lowBands[b]) lo += d; }
    }
    env[f] = all / NB;
    low[f] = lo;
  }
  return { env: detrendNormalize(env), low: detrendNormalize(low) };
}

function estimateTempo(env) {
  const minBpm = 60, maxBpm = 200;
  const minLag = Math.floor((60 * ENV_RATE) / maxBpm);
  const maxLag = Math.ceil((60 * ENV_RATE) / minBpm);
  let best = 0, bestLag = Math.round((60 * ENV_RATE) / 120);
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0;
    for (let i = lag; i < env.length; i++) s += env[i] * env[i - lag];
    s /= env.length - lag;
    const bpm = (60 * ENV_RATE) / lag;
    const prior = Math.exp(-0.5 * (Math.log2(bpm / 120) / 1.0) ** 2);
    if (s * prior > best) { best = s * prior; bestLag = lag; }
  }
  // refine with parabolic interpolation for sub-frame accuracy
  const ac = (lag) => {
    let s = 0;
    for (let i = lag; i < env.length; i++) s += env[i] * env[i - lag];
    return s / (env.length - lag);
  };
  const a = ac(bestLag - 1), b = ac(bestLag), c = ac(bestLag + 1);
  const denom = a - 2 * b + c;
  const shift = denom !== 0 ? Math.max(-0.5, Math.min(0.5, (0.5 * (a - c)) / denom)) : 0;
  return (60 * ENV_RATE) / (bestLag + shift);
}

function trackBeats(env, bpm, tightness = 100) {
  const period = (60 * ENV_RATE) / bpm;
  const n = env.length;
  // normalize by std like librosa
  let mean = 0;
  for (const v of env) mean += v;
  mean /= n;
  let sd = 0;
  for (const v of env) sd += (v - mean) ** 2;
  sd = Math.sqrt(sd / n) || 1;
  // smooth local score with a gaussian of width ~period/32
  const local = new Float32Array(n);
  const gw = Math.max(1, Math.round(period / 32));
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let k = -2 * gw; k <= 2 * gw; k++) {
      const j = i + k;
      if (j >= 0 && j < n) s += (env[j] / sd) * Math.exp(-0.5 * (k / gw) ** 2);
    }
    local[i] = s;
  }
  const score = new Float32Array(n);
  const back = new Int32Array(n).fill(-1);
  const lo = Math.round(period / 2), hi = Math.round(period * 2);
  for (let i = 0; i < n; i++) {
    let best = -Infinity, arg = -1;
    for (let d = lo; d <= hi; d++) {
      const j = i - d;
      if (j < 0) break;
      const pen = -tightness * Math.log(d / period) ** 2;
      const v = score[j] + pen;
      if (v > best) { best = v; arg = j; }
    }
    score[i] = local[i] + (arg >= 0 ? best : 0);
    back[i] = arg;
  }
  // last beat: highest score among local maxima that are above half the median of maxima
  const maxima = [];
  for (let i = 1; i < n - 1; i++) if (score[i] > score[i - 1] && score[i] >= score[i + 1]) maxima.push(score[i]);
  maxima.sort((a, b) => a - b);
  const thresh = maxima.length ? 0.5 * maxima[Math.floor(maxima.length / 2)] : 0;
  let last = n - 1;
  for (let i = n - 1; i >= 1; i--) {
    if (i < n - 1 && score[i] > score[i - 1] && score[i] >= score[i + 1] && score[i] >= thresh) { last = i; break; }
  }
  const beats = [];
  for (let i = last; i >= 0; i = back[i]) beats.push(i);
  beats.reverse();
  // trim weak beats at the edges (silence/fades)
  const strength = beats.map((b) => local[b]);
  const sorted = [...strength].sort((a, b) => a - b);
  const med = sorted[Math.floor(sorted.length / 2)] || 0;
  let s = 0, e = beats.length;
  while (s < e && strength[s] < 0.15 * med) s++;
  while (e > s && strength[e - 1] < 0.15 * med) e--;
  const kept = beats.slice(s, e);
  // drop edge beats that break the grid (artifacts at the very start/end of the file)
  const off = (a, b) => Math.abs(b - a - period) > 0.15 * period;
  while (kept.length > 2 && off(kept[kept.length - 2], kept[kept.length - 1])) kept.pop();
  while (kept.length > 2 && off(kept[0], kept[1])) kept.shift();
  return kept.map(frameTime);
}

function pickOnsets(env, sensitivity) {
  // sensitivity 0..1 → lower threshold = more hits
  const delta = 0.02 + (1 - sensitivity) * 0.25;
  const minGap = 0.1 + (1 - sensitivity) * 0.15;
  const pre = Math.round(0.03 * ENV_RATE), post = Math.round(0.03 * ENV_RATE);
  const avgPre = Math.round(0.1 * ENV_RATE), avgPost = Math.round(0.1 * ENV_RATE);
  const hits = [];
  let lastT = -Infinity;
  for (let i = 1; i < env.length - 1; i++) {
    let isMax = true;
    for (let k = Math.max(0, i - pre); k <= Math.min(env.length - 1, i + post); k++) {
      if (env[k] > env[i]) { isMax = false; break; }
    }
    if (!isMax) continue;
    let s = 0, c = 0;
    for (let k = Math.max(0, i - avgPre); k <= Math.min(env.length - 1, i + avgPost); k++) { s += env[k]; c++; }
    if (env[i] < s / c + delta) continue;
    const t = frameTime(i);
    if (t - lastT < minGap) continue;
    hits.push(t);
    lastT = t;
  }
  return hits;
}

/** Mean of the strongest envelope value within ±r frames of each time. */
function sumAt(env, times, r = 3) {
  let s = 0;
  for (const t of times) {
    const i = Math.round((t * SR - N_FFT / 2) / HOP);
    let m = 0;
    for (let k = i - r; k <= i + r; k++) if (k >= 0 && k < env.length && env[k] > m) m = env[k];
    s += m;
  }
  return times.length ? s / times.length : 0;
}

/** Full analysis. Returns envelope + tempo + beat times. */
export async function analyze(buffer) {
  const mono = await toMono22k(buffer);
  const { env: full, low } = onsetEnvelope(mono);
  // emphasise bass hits (kicks / 808s) — that's where edits usually cut
  const env = new Float32Array(full.length);
  for (let i = 0; i < env.length; i++) env[i] = full[i] + 1.5 * low[i];
  let m = 0;
  for (const v of env) m = Math.max(m, v);
  if (m > 0) for (let i = 0; i < env.length; i++) env[i] /= m;
  const bpm = estimateTempo(env);
  let beats = trackBeats(env, bpm);
  // if the bass lands between our beats, we locked onto the off-beat: shift by half a beat
  const half = 30 / bpm;
  const shifted = beats.map((t) => t + half).filter((t) => t < buffer.duration);
  if (low.some((v) => v > 0) && sumAt(low, shifted) > 1.25 * sumAt(low, beats)) {
    beats = [beats[0] - half, ...shifted].filter((t) => t >= 0);
  }
  return { env, bpm, beats };
}

/** Strength of the envelope around time t (used to pick the downbeat phase). */
function strengthAt(env, t) {
  const i = Math.round((t * SR - N_FFT / 2) / HOP);
  let m = 0;
  for (let k = i - 2; k <= i + 2; k++) if (k >= 0 && k < env.length) m = Math.max(m, env[k]);
  return m;
}

/**
 * Turn an analysis into cut points.
 * mode: 'beats' | 'hits'
 * every: 0.5 | 1 | 2 | 4  (beats mode: cut every N beats; 0.5 = also cut on off-beats)
 * sensitivity: 0..1 (hits mode)
 */
export function cutPoints(analysis, { mode = 'beats', every = 1, sensitivity = 0.5 } = {}) {
  const { env, beats } = analysis;
  if (mode === 'hits') return pickOnsets(env, sensitivity);
  if (every === 0.5) {
    const out = [];
    for (let i = 0; i < beats.length; i++) {
      out.push(beats[i]);
      if (i + 1 < beats.length) out.push((beats[i] + beats[i + 1]) / 2);
    }
    return out;
  }
  if (every <= 1) return beats.slice();
  // choose the phase whose beats are strongest (≈ downbeats)
  let bestPhase = 0, best = -1;
  for (let p = 0; p < every; p++) {
    let s = 0;
    for (let i = p; i < beats.length; i += every) s += strengthAt(env, beats[i]);
    s /= Math.ceil((beats.length - p) / every);
    if (s > best) { best = s; bestPhase = p; }
  }
  return beats.filter((_, i) => i % every === bestPhase);
}

/** Copy [start, end) of a buffer into a new AudioBuffer, with tiny fades to avoid clicks. */
export function sliceBuffer(buffer, start, end, fade = 0.03) {
  const sr = buffer.sampleRate;
  const s = Math.max(0, Math.floor(start * sr));
  const e = Math.min(buffer.length, Math.ceil(end * sr));
  const length = Math.max(1, e - s);
  const out = new AudioBuffer({ length, sampleRate: sr, numberOfChannels: buffer.numberOfChannels });
  const f = Math.min(Math.floor(fade * sr), Math.floor(length / 2));
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const d = buffer.getChannelData(c).slice(s, e);
    for (let i = 0; i < f; i++) { d[i] *= i / f; d[length - 1 - i] *= i / f; }
    out.copyToChannel(d, c);
  }
  return out;
}

/** Encode an AudioBuffer as a 16-bit PCM WAV blob. */
export function toWav(buffer) {
  const ch = buffer.numberOfChannels, sr = buffer.sampleRate, n = buffer.length;
  const bytes = 44 + n * ch * 2;
  const v = new DataView(new ArrayBuffer(bytes));
  const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, bytes - 8, true); str(8, 'WAVE');
  str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * ch * 2, true); v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true);
  str(36, 'data'); v.setUint32(40, n * ch * 2, true);
  const chans = Array.from({ length: ch }, (_, c) => buffer.getChannelData(c));
  let o = 44;
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < ch; c++) {
      const s = Math.max(-1, Math.min(1, chans[c][i]));
      v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      o += 2;
    }
  }
  return new Blob([v.buffer], { type: 'audio/wav' });
}
