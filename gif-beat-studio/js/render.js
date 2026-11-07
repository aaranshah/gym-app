// Draws one output frame of the edit onto a 2D canvas context.
import { frameAt } from './gif.js';

const blurCanvas = document.createElement('canvas');
blurCanvas.width = 24;
blurCanvas.height = 42;
const blurCtx = blurCanvas.getContext('2d');

export function segmentIndexAt(segments, t) {
  let lo = 0, hi = segments.length - 1;
  if (hi < 0) return -1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (segments[mid].start <= t) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

function drawFitted(ctx, img, iw, ih, W, H, fit, zoom) {
  const s = (fit === 'contain' ? Math.min(W / iw, H / ih) : Math.max(W / iw, H / ih)) * zoom;
  const dw = iw * s, dh = ih * s;
  ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
}

/**
 * @param ctx      CanvasRenderingContext2D
 * @param W,H      output size
 * @param t        absolute time in the audio (seconds)
 * @param edit     { segments, assignments, fit, effect }
 * @param lookup   (gifId) => decoded | null
 */
export function renderFrame(ctx, W, H, t, edit, lookup) {
  const { segments, assignments, fit = 'cover', effect = 'none' } = edit;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  const i = segmentIndexAt(segments, t);
  if (i < 0) return;
  const seg = segments[i];
  const local = Math.max(0, t - seg.start);
  const id = assignments[i];
  const decoded = id ? lookup(id) : null;

  if (!decoded) {
    ctx.fillStyle = '#16161d';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = `600 ${Math.round(W / 12)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(id ? 'Loading…' : `Clip ${i + 1}`, W / 2, H / 2);
    return;
  }

  const img = frameAt(decoded, local);
  const iw = decoded.width, ih = decoded.height;
  const k = Math.max(0, 1 - local / 0.2);
  const zoom = effect === 'zoom' ? 1 + 0.12 * k * k : 1;

  if (fit === 'contain') {
    // blurred, darkened copy as background
    blurCtx.clearRect(0, 0, blurCanvas.width, blurCanvas.height);
    drawFitted(blurCtx, img, iw, ih, blurCanvas.width, blurCanvas.height, 'cover', 1);
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(blurCanvas, -W * 0.05, -H * 0.05, W * 1.1, H * 1.1);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  drawFitted(ctx, img, iw, ih, W, H, fit, zoom);

  if (effect === 'flash' && local < 0.15) {
    ctx.fillStyle = `rgba(255,255,255,${0.55 * (1 - local / 0.15)})`;
    ctx.fillRect(0, 0, W, H);
  }
}
