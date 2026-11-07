// GIF probing (metadata + thumbnail on import) and full decoding (for preview/export).
import { parseGIF, decompressFrames } from '../vendor/vendor.js';
import { getBlob } from './db.js';

const MIN_DELAY = 20;       // browsers treat tiny GIF delays as 100ms
const DEFAULT_DELAY = 100;
const MAX_DIM = 1280;       // decoded frames are capped at this size to save memory

function fixDelay(ms) {
  return !ms || ms < MIN_DELAY ? DEFAULT_DELAY : ms;
}

function isGif(blob, bytes) {
  if (blob.type === 'image/gif') return true;
  return bytes && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46; // "GIF"
}

async function firstFrameBitmap(blob) {
  try {
    return await createImageBitmap(blob);
  } catch {
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }
}

async function makeThumb(source, w, h) {
  const TW = 240;
  const scale = Math.min(1, TW / w);
  const cw = Math.max(1, Math.round(w * scale));
  const ch = Math.max(1, Math.round(h * scale));
  const c = document.createElement('canvas');
  c.width = cw;
  c.height = ch;
  c.getContext('2d').drawImage(source, 0, 0, cw, ch);
  return new Promise((res) => c.toBlob((b) => res(b), 'image/jpeg', 0.8));
}

/** Reads dimensions, frame count, loop duration and makes a static thumbnail. */
export async function probeGif(blob) {
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let width, height, frameCount = 1, duration = 0;
  if (isGif(blob, bytes)) {
    const gif = parseGIF(buf);
    width = gif.lsd.width;
    height = gif.lsd.height;
    const frames = gif.frames.filter((f) => f.image);
    frameCount = frames.length;
    for (const f of frames) duration += fixDelay(f.gce ? f.gce.delay * 10 : 0);
  }
  const bmp = await firstFrameBitmap(blob);
  width = width || bmp.width || bmp.naturalWidth;
  height = height || bmp.height || bmp.naturalHeight;
  if (!width || !height) throw new Error('Not a readable image');
  const thumb = await makeThumb(bmp, width, height);
  if (bmp.close) bmp.close();
  return { width, height, frameCount, duration: duration / 1000, thumb };
}

// ---------------------------------------------------------------------------
// Full decode

function targetSize(w, h) {
  const s = Math.min(1, MAX_DIM / Math.max(w, h));
  return { w: Math.round(w * s), h: Math.round(h * s), scaled: s < 1 };
}

async function toBitmap(src, size) {
  return size.scaled
    ? createImageBitmap(src, { resizeWidth: size.w, resizeHeight: size.h, resizeQuality: 'high' })
    : createImageBitmap(src);
}

async function decodeWithImageDecoder(buf, type) {
  const dec = new ImageDecoder({ data: buf, type });
  try {
    await dec.tracks.ready;
    await dec.completed;
    const n = dec.tracks.selectedTrack.frameCount || 1;
    const frames = [];
    let t = 0, w = 0, h = 0, size = null;
    for (let i = 0; i < n; i++) {
      const { image } = await dec.decode({ frameIndex: i });
      if (!size) {
        w = image.displayWidth;
        h = image.displayHeight;
        size = targetSize(w, h);
      }
      const dur = n === 1 ? 1e9 : fixDelay(image.duration ? image.duration / 1000 : 0) / 1000;
      const bmp = await toBitmap(image, size);
      image.close();
      frames.push({ bmp, t0: t, dur });
      t += dur;
    }
    return { width: size.w, height: size.h, frames, duration: t };
  } finally {
    dec.close();
  }
}

async function decodeWithGifuct(buf) {
  const gif = parseGIF(buf);
  const raw = decompressFrames(gif, true);
  const W = gif.lsd.width, H = gif.lsd.height;
  const size = targetSize(W, H);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const patchCanvas = document.createElement('canvas');
  const pctx = patchCanvas.getContext('2d');
  const frames = [];
  let t = 0;
  let prev = null;
  let saved = null;
  for (const f of raw) {
    if (prev) {
      if (prev.disposalType === 2) ctx.clearRect(prev.dims.left, prev.dims.top, prev.dims.width, prev.dims.height);
      else if (prev.disposalType === 3 && saved) ctx.putImageData(saved, 0, 0);
    }
    saved = f.disposalType === 3 ? ctx.getImageData(0, 0, W, H) : null;
    const { width, height, left, top } = f.dims;
    if (width > 0 && height > 0) {
      patchCanvas.width = width;
      patchCanvas.height = height;
      pctx.putImageData(new ImageData(f.patch, width, height), 0, 0);
      ctx.drawImage(patchCanvas, left, top);
    }
    const dur = raw.length === 1 ? 1e9 : fixDelay(f.delay) / 1000;
    frames.push({ bmp: await toBitmap(canvas, size), t0: t, dur });
    t += dur;
    prev = f;
  }
  return { width: size.w, height: size.h, frames, duration: t };
}

async function decodeStill(blob) {
  const bmp = await createImageBitmap(blob);
  const size = targetSize(bmp.width, bmp.height);
  const out = size.scaled ? await toBitmap(bmp, size) : bmp;
  if (out !== bmp) bmp.close();
  return { width: out.width, height: out.height, frames: [{ bmp: out, t0: 0, dur: 1e9 }], duration: 1e9 };
}

export async function decodeBlob(blob) {
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf, 0, Math.min(4, buf.byteLength));
  const gif = isGif(blob, bytes);
  const type = gif ? 'image/gif' : blob.type;
  if (typeof ImageDecoder !== 'undefined' && type) {
    try {
      if (await ImageDecoder.isTypeSupported(type)) return await decodeWithImageDecoder(buf, type);
    } catch (e) {
      console.warn('ImageDecoder failed, falling back', e);
    }
  }
  if (gif) return decodeWithGifuct(buf);
  return decodeStill(blob);
}

/** Returns the frame bitmap visible `t` seconds after the GIF started (looping). */
export function frameAt(decoded, t) {
  const { frames, duration } = decoded;
  if (frames.length === 1) return frames[0].bmp;
  let lt = t % duration;
  if (lt < 0) lt += duration;
  let lo = 0, hi = frames.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (frames[mid].t0 <= lt) lo = mid;
    else hi = mid - 1;
  }
  return frames[lo].bmp;
}

// ---------------------------------------------------------------------------
// LRU cache of decoded GIFs (decoded frames are big; keep a byte budget).

const BUDGET = 320 * 1024 * 1024;
const cache = new Map(); // id -> { promise, bytes, decoded }
let used = 0;

function release(entry) {
  if (entry.decoded) for (const f of entry.decoded.frames) f.bmp.close && f.bmp.close();
}

function evict(keep) {
  for (const [id, entry] of cache) {
    if (used <= BUDGET) break;
    if (keep.has(id) || !entry.decoded) continue;
    cache.delete(id);
    used -= entry.bytes;
    release(entry);
  }
}

/** Decode (or fetch from cache) a library GIF by id. `keep` = ids that must not be evicted. */
export function getDecoded(id, keep = new Set()) {
  let entry = cache.get(id);
  if (entry) {
    cache.delete(id); // refresh LRU position
    cache.set(id, entry);
    return entry.promise;
  }
  entry = { bytes: 0, decoded: null };
  entry.promise = (async () => {
    const blob = await getBlob(id);
    if (!blob) throw new Error('GIF missing from library');
    const decoded = await decodeBlob(blob);
    entry.decoded = decoded;
    entry.bytes = decoded.width * decoded.height * 4 * decoded.frames.length;
    used += entry.bytes;
    evict(new Set([...keep, id]));
    return decoded;
  })();
  entry.promise.catch(() => cache.delete(id));
  cache.set(id, entry);
  return entry.promise;
}

/** Synchronous lookup — returns decoded data if already ready, else null. */
export function peekDecoded(id) {
  const e = cache.get(id);
  return e && e.decoded ? e.decoded : null;
}

export function forgetDecoded(id) {
  const e = cache.get(id);
  if (!e) return;
  cache.delete(id);
  used -= e.bytes;
  release(e);
}
