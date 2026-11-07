// Beat Editor tab: sound → beats → clips → preview/export.
import { $, $$, el, toast, download, debounce, fmtTime, shuffle } from './util.js';
import { library, onLibraryChange, query, people, thumbUrl, reshuffle } from './store.js';
import { PagedGrid } from './grid.js';
import { bindSeg, setSeg, segValue } from './library.js';
import { decodeAudioFile, analyze, cutPoints, toWav, audioContext } from './beats.js';
import { renderFrame, segmentIndexAt } from './render.js';
import { getDecoded, peekDecoded } from './gif.js';
import { exportVideo } from './export.js';
import { kvGet, kvSet } from './db.js';

const MIN_SEG = 0.05;

const proj = {
  audioFile: null,
  audioName: '',
  cuts: [],
  trimStart: 0,
  trimEnd: 0,
  assignments: [],
  mode: 'beats',
  every: 1,
  sensitivity: 0.5,
  settings: { aspect: '9:16', res: '1080', fps: '30', fit: 'cover', effect: 'none' },
};

const rt = {
  buffer: null,
  analysis: null,
  peaks: null,        // high-res peak envelope (PEAK_RATE per second)
  segments: [],
  active: -1,
  selectedCut: -1,
  playhead: 0,
  playing: false,
  src: null,
  startedAt: 0,
  startOffset: 0,
  raf: 0,
  exporting: null,
  resultBlob: null,
  resultExt: 'mp4',
};
const PEAK_RATE = 400;

let picker;
const pickFilter = { gender: 'all', person: '', search: '', sort: 'newest' };

// ------------------------------------------------------------------ persistence

const save = debounce(() => {
  kvSet('project', { ...proj }).catch((e) => console.warn('Could not save project', e));
}, 400);

// ------------------------------------------------------------------ model helpers

function rebuildSegments() {
  const { trimStart: s, trimEnd: e } = proj;
  const bounds = [s];
  for (const c of proj.cuts) {
    if (c > s + MIN_SEG && c < e - MIN_SEG && c - bounds[bounds.length - 1] >= MIN_SEG) bounds.push(c);
  }
  bounds.push(e);
  rt.segments = [];
  for (let i = 0; i < bounds.length - 1; i++) rt.segments.push({ start: bounds[i], end: bounds[i + 1] });
  if (rt.active >= rt.segments.length) rt.active = rt.segments.length - 1;
}

function validId(id) {
  return id && library.byId.has(id) ? id : null;
}

function editModel() {
  return {
    segments: rt.segments,
    assignments: rt.segments.map((_, i) => validId(proj.assignments[i])),
    fit: proj.settings.fit,
    effect: proj.settings.effect,
  };
}

function segIndexForCut(c) {
  return rt.segments.findIndex((s) => Math.abs(s.start - c) < 1e-6);
}

function addCut(t) {
  if (!rt.buffer) return;
  t = Math.max(0, Math.min(rt.buffer.duration, t));
  if (proj.cuts.some((c) => Math.abs(c - t) < MIN_SEG)) return;
  const k = segmentIndexAt(rt.segments, t);
  proj.cuts.push(t);
  proj.cuts.sort((a, b) => a - b);
  if (t > proj.trimStart + MIN_SEG && t < proj.trimEnd - MIN_SEG && k >= 0) {
    proj.assignments.splice(k + 1, 0, null);
  }
  rt.selectedCut = proj.cuts.indexOf(t);
  changed();
}

function removeCut(idx) {
  if (idx < 0 || idx >= proj.cuts.length) return;
  const c = proj.cuts[idx];
  const k = segIndexForCut(c);
  proj.cuts.splice(idx, 1);
  if (k > 0) proj.assignments.splice(k, 1);
  rt.selectedCut = -1;
  changed();
}

function changed({ slots = true } = {}) {
  rebuildSegments();
  drawWave();
  if (slots) renderSlots();
  updateCutButtons();
  save();
}

// ------------------------------------------------------------------ sound

async function loadSound(file, { restore = false } = {}) {
  stop();
  $('#soundInfo').hidden = false;
  $('#soundInfo').replaceChildren(el('span.muted', {}, `Extracting audio from ${file.name || 'file'}…`));
  try {
    const buffer = await decodeAudioFile(file);
    rt.buffer = buffer;
    proj.audioFile = file;
    proj.audioName = file.name || proj.audioName || 'sound';
    $('#soundInfo').replaceChildren(el('span.muted', {}, 'Finding beats…'));
    await new Promise((r) => setTimeout(r, 20));
    rt.analysis = await analyze(buffer);
    rt.peaks = computePeaks(buffer);
    if (!restore) {
      proj.trimStart = 0;
      proj.trimEnd = buffer.duration;
      proj.cuts = cutPoints(rt.analysis, proj);
    } else {
      proj.trimEnd = Math.min(proj.trimEnd || buffer.duration, buffer.duration);
    }
    rt.playhead = proj.trimStart;
    showSound();
    changed();
    renderPreview();
    if (!restore) toast(`Found ${rt.segments.length} clips at ~${Math.round(rt.analysis.bpm)} BPM`);
  } catch (e) {
    console.error(e);
    $('#soundInfo').replaceChildren(el('span', { style: { color: 'var(--danger)' } },
      `Couldn't read audio from that file (${e.message}). Try an MP3/M4A or an MP4 video.`));
  }
}

function showSound() {
  const has = !!rt.buffer;
  $('#audioDrop').hidden = has;
  $('#btnDownloadAudio').hidden = !has;
  $('#btnReplaceAudio').hidden = !has;
  for (const id of ['#beatsCard', '#clipsCard', '#previewCard']) $(id).hidden = !has;
  if (!has) return;
  $('#soundInfo').hidden = false;
  $('#soundInfo').replaceChildren(
    el('span.name', {}, proj.audioName),
    el('span.muted', {}, `${fmtTime(rt.buffer.duration)} · ${rt.buffer.sampleRate / 1000} kHz · ${rt.buffer.numberOfChannels === 1 ? 'mono' : 'stereo'}`),
  );
  $('#bpmLabel').textContent = `≈ ${Math.round(rt.analysis.bpm)} BPM`;
  setSeg($('#beatMode'), proj.mode);
  setSeg($('#beatEvery'), String(proj.every));
  $('#sens').value = proj.sensitivity;
  $('#everyCtl').hidden = proj.mode !== 'beats';
  $('#sensCtl').hidden = proj.mode !== 'hits';
  $('#trimStart').max = $('#trimEnd').max = rt.buffer.duration.toFixed(2);
  syncTrimInputs();
  const s = proj.settings;
  $('#optAspect').value = s.aspect;
  $('#optRes').value = s.res;
  $('#optFps').value = s.fps;
  $('#optFit').value = s.fit;
  $('#optEffect').value = s.effect;
  sizePreview();
}

function syncTrimInputs() {
  $('#trimStart').value = proj.trimStart.toFixed(2);
  $('#trimEnd').value = proj.trimEnd.toFixed(2);
}

function redetect() {
  if (!rt.analysis) return;
  proj.cuts = cutPoints(rt.analysis, proj);
  rt.selectedCut = -1;
  changed();
  toast(`${rt.segments.length} clips`);
}

// ------------------------------------------------------------------ waveform

function computePeaks(buffer) {
  const n = Math.ceil(buffer.duration * PEAK_RATE);
  const out = new Float32Array(n);
  const chans = Array.from({ length: buffer.numberOfChannels }, (_, c) => buffer.getChannelData(c));
  const step = buffer.sampleRate / PEAK_RATE;
  for (let i = 0; i < n; i++) {
    const s = Math.floor(i * step), e = Math.min(buffer.length, Math.floor((i + 1) * step));
    let m = 0;
    for (const d of chans) for (let j = s; j < e; j += 2) { const v = Math.abs(d[j]); if (v > m) m = v; }
    out[i] = m;
  }
  return out;
}

function waveGeom() {
  const wrap = $('#waveWrap');
  const zoom = parseFloat($('#zoom').value);
  const viewW = wrap.clientWidth;
  const totalW = viewW * zoom;
  const dur = rt.buffer ? rt.buffer.duration : 1;
  const pps = totalW / dur;
  return { wrap, viewW, totalW, pps, left: wrap.scrollLeft, dur };
}

function drawWave() {
  const canvas = $('#wave');
  if (!rt.buffer || canvas.offsetParent === null) return;
  const g = waveGeom();
  $('#waveSpacer').style.width = `${g.totalW}px`;
  const dpr = window.devicePixelRatio || 1;
  const H = 150;
  if (canvas.width !== Math.round(g.viewW * dpr) || canvas.height !== H * dpr) {
    canvas.width = Math.round(g.viewW * dpr);
    canvas.height = H * dpr;
    canvas.style.width = `${g.viewW}px`;
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, g.viewW, H);
  const tToX = (t) => t * g.pps - g.left;
  const top = 18, mid = top + (H - top) / 2, amp = (H - top) / 2 - 4;

  // segment backgrounds + numbers
  rt.segments.forEach((s, i) => {
    const x0 = tToX(s.start), x1 = tToX(s.end);
    if (x1 < 0 || x0 > g.viewW) return;
    ctx.fillStyle = i === rt.active ? 'rgba(255,45,111,0.16)' : i % 2 ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.055)';
    ctx.fillRect(x0, top, x1 - x0, H - top);
    if (x1 - x0 > 18) {
      ctx.fillStyle = proj.assignments[i] && validId(proj.assignments[i]) ? '#38d39f' : '#9a9aab';
      ctx.font = '600 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(i + 1), (Math.max(x0, 0) + Math.min(x1, g.viewW)) / 2, 12);
    }
  });

  // waveform
  const peaks = rt.peaks;
  ctx.fillStyle = '#5b5b70';
  for (let x = 0; x < g.viewW; x++) {
    const t0 = (x + g.left) / g.pps, t1 = (x + 1 + g.left) / g.pps;
    const a = Math.floor(t0 * PEAK_RATE), b = Math.max(a + 1, Math.floor(t1 * PEAK_RATE));
    let m = 0;
    for (let i = a; i < b && i < peaks.length; i++) if (peaks[i] > m) m = peaks[i];
    const h = Math.max(1, m * amp);
    const inTrim = t0 >= proj.trimStart && t0 <= proj.trimEnd;
    ctx.fillStyle = inTrim ? '#8c8ca6' : '#3a3a48';
    ctx.fillRect(x, mid - h, 1, h * 2);
  }

  // trimmed-out shading
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  const ts = tToX(proj.trimStart), te = tToX(proj.trimEnd);
  if (ts > 0) ctx.fillRect(0, 0, ts, H);
  if (te < g.viewW) ctx.fillRect(te, 0, g.viewW - te, H);

  // cuts
  proj.cuts.forEach((c, i) => {
    const x = Math.round(tToX(c)) + 0.5;
    if (x < -5 || x > g.viewW + 5) return;
    const sel = i === rt.selectedCut;
    ctx.strokeStyle = sel ? '#fff' : '#ff2d6f';
    ctx.lineWidth = sel ? 2 : 1.25;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, H);
    ctx.stroke();
    ctx.fillStyle = sel ? '#fff' : '#ff2d6f';
    ctx.beginPath();
    ctx.moveTo(x - 5, top);
    ctx.lineTo(x + 5, top);
    ctx.lineTo(x, top + 7);
    ctx.closePath();
    ctx.fill();
  });

  // playhead
  const px = tToX(rt.playhead);
  ctx.fillStyle = '#25d9e6';
  ctx.fillRect(Math.round(px) - 1, 0, 2, H);
  $('#timeLabel').textContent = fmtTime(rt.playhead);
}

function initWave() {
  const wrap = $('#waveWrap');
  wrap.replaceChildren(el('div#waveSpacer', {}, $('#wave')));
  const canvas = $('#wave');
  canvas.style.position = 'sticky';
  canvas.style.left = '0';
  canvas.style.touchAction = 'none';
  wrap.addEventListener('scroll', () => drawWave());
  new ResizeObserver(() => drawWave()).observe(wrap);
  $('#zoom').addEventListener('input', () => {
    const g0 = waveGeom();
    const center = rt.playhead;
    drawWave();
    const g = waveGeom();
    wrap.scrollLeft = Math.max(0, center * g.pps - g.viewW / 2);
    drawWave();
    void g0;
  });

  let drag = null;
  const tAt = (e) => {
    const r = canvas.getBoundingClientRect();
    const g = waveGeom();
    return (e.clientX - r.left + g.left) / g.pps;
  };
  const hitCut = (e) => {
    const r = canvas.getBoundingClientRect();
    const g = waveGeom();
    const x = e.clientX - r.left;
    const tol = e.pointerType === 'touch' ? 14 : 7;
    let best = -1, bd = tol;
    proj.cuts.forEach((c, i) => {
      const d = Math.abs(c * g.pps - g.left - x);
      if (d <= bd) { bd = d; best = i; }
    });
    return best;
  };
  canvas.addEventListener('pointerdown', (e) => {
    if (!rt.buffer) return;
    canvas.setPointerCapture(e.pointerId);
    const ci = hitCut(e);
    if (ci >= 0) {
      rt.selectedCut = ci;
      drag = { type: 'cut', idx: ci, moved: false };
      updateCutButtons();
      drawWave();
    } else if (e.pointerType === 'touch') {
      drag = { type: 'pan', x0: e.clientX, s0: wrap.scrollLeft, moved: false };
    } else {
      drag = { type: 'seek' };
      rt.selectedCut = -1;
      updateCutButtons();
      seek(tAt(e));
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (drag.type === 'cut') {
      const i = drag.idx;
      const lo = i > 0 ? proj.cuts[i - 1] + MIN_SEG : 0;
      const hi = i < proj.cuts.length - 1 ? proj.cuts[i + 1] - MIN_SEG : rt.buffer.duration;
      proj.cuts[i] = Math.max(lo, Math.min(hi, tAt(e)));
      drag.moved = true;
      rebuildSegments();
      drawWave();
    } else if (drag.type === 'pan') {
      const dx = e.clientX - drag.x0;
      if (Math.abs(dx) > 4) drag.moved = true;
      wrap.scrollLeft = drag.s0 - dx;
    } else if (drag.type === 'seek') {
      seek(tAt(e));
    }
  });
  const end = (e) => {
    if (!drag) return;
    if (drag.type === 'cut' && drag.moved) changed();
    if (drag.type === 'pan' && !drag.moved) {
      rt.selectedCut = -1;
      updateCutButtons();
      seek(tAt(e));
    }
    drag = null;
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', () => (drag = null));
  canvas.addEventListener('dblclick', (e) => addCut(tAt(e)));
  canvas.addEventListener('contextmenu', (e) => {
    const ci = hitCut(e);
    if (ci >= 0) { e.preventDefault(); removeCut(ci); }
  });
}

function updateCutButtons() {
  $('#btnDelCut').disabled = rt.selectedCut < 0;
}

// ------------------------------------------------------------------ playback + preview

function exportDims() {
  const short = parseInt(proj.settings.res, 10);
  const [a, b] = proj.settings.aspect.split(':').map(Number);
  const even = (n) => Math.round(n / 2) * 2;
  return a >= b ? { W: even((short * a) / b), H: short } : { W: short, H: even((short * b) / a) };
}

function sizePreview() {
  const { W, H } = exportDims();
  const c = $('#preview');
  const scale = 960 / Math.max(W, H);
  c.width = Math.round(W * scale);
  c.height = Math.round(H * scale);
  const [a, b] = proj.settings.aspect.split(':').map(Number);
  $('#slots').style.setProperty('--ar', `${a} / ${b}`);
  $$('.slot').forEach((s) => (s.style.aspectRatio = `${a} / ${b}`));
  renderPreview();
}

function drawPreviewNow() {
  const c = $('#preview');
  renderFrame(c.getContext('2d'), c.width, c.height, rt.playhead, editModel(), peekDecoded);
}

function prefetchAround(i) {
  const model = editModel();
  const keep = new Set([0, 1, 2, 3].map((k) => model.assignments[i + k]).filter(Boolean));
  const jobs = [];
  for (let k = 0; k < 4; k++) {
    const id = model.assignments[i + k];
    if (id) jobs.push(getDecoded(id, keep).catch(() => null));
  }
  return jobs;
}

async function renderPreview() {
  if (!rt.buffer) return;
  const i = segmentIndexAt(rt.segments, rt.playhead);
  drawPreviewNow();
  await Promise.all(prefetchAround(Math.max(0, i)).slice(0, 1));
  if (!rt.playing) drawPreviewNow();
}

function seek(t) {
  if (!rt.buffer) return;
  rt.playhead = Math.max(0, Math.min(rt.buffer.duration, t));
  if (rt.playing) {
    stop();
    play();
  } else {
    drawWave();
    renderPreview();
    markPlayingSlot();
  }
}

async function play() {
  if (!rt.buffer || rt.playing) return;
  const actx = audioContext();
  await actx.resume();
  if (rt.playhead < proj.trimStart || rt.playhead >= proj.trimEnd - 0.05) rt.playhead = proj.trimStart;
  await Promise.all(prefetchAround(Math.max(0, segmentIndexAt(rt.segments, rt.playhead))).slice(0, 2));
  const src = actx.createBufferSource();
  src.buffer = rt.buffer;
  src.connect(actx.destination);
  rt.startOffset = rt.playhead;
  rt.startedAt = actx.currentTime + 0.03;
  src.start(rt.startedAt, rt.playhead, Math.max(0.01, proj.trimEnd - rt.playhead));
  rt.src = src;
  rt.playing = true;
  $('#btnPlay').textContent = '❚❚';
  let lastSeg = -1;
  const tick = () => {
    if (!rt.playing) return;
    rt.playhead = rt.startOffset + Math.max(0, actx.currentTime - rt.startedAt);
    if (rt.playhead >= proj.trimEnd) {
      rt.playhead = proj.trimEnd;
      stop();
      drawWave();
      return;
    }
    const i = segmentIndexAt(rt.segments, rt.playhead);
    if (i !== lastSeg) {
      lastSeg = i;
      prefetchAround(i);
      markPlayingSlot(i);
    }
    drawPreviewNow();
    // keep playhead visible when zoomed
    const g = waveGeom();
    const px = rt.playhead * g.pps - g.left;
    if (px > g.viewW * 0.85 || px < 0) g.wrap.scrollLeft = rt.playhead * g.pps - g.viewW * 0.15;
    drawWave();
    rt.raf = requestAnimationFrame(tick);
  };
  rt.raf = requestAnimationFrame(tick);
}

function stop() {
  if (rt.src) {
    try { rt.src.stop(); } catch { /* not started */ }
    rt.src.disconnect();
    rt.src = null;
  }
  rt.playing = false;
  cancelAnimationFrame(rt.raf);
  $('#btnPlay').textContent = '▶';
  markPlayingSlot(-1);
}

function togglePlay() {
  if (rt.playing) stop();
  else play();
}

function markPlayingSlot(i = rt.playing ? segmentIndexAt(rt.segments, rt.playhead) : -1) {
  $$('.slot').forEach((s, k) => s.classList.toggle('playing', k === i));
}

// ------------------------------------------------------------------ clips

function renderSlots() {
  const box = $('#slots');
  const [a, b] = proj.settings.aspect.split(':').map(Number);
  box.replaceChildren(...rt.segments.map((s, i) => {
    const id = validId(proj.assignments[i]);
    const item = id ? library.byId.get(id) : null;
    const slot = el('div.slot', { style: { aspectRatio: `${a} / ${b}` }, title: item ? item.name || 'Untagged' : 'Empty — pick a GIF' },
      item ? el('img', { src: thumbUrl(item), alt: '' }) : el('span.plus', {}, '+'),
      el('span.num', {}, i + 1),
      el('span.dur', {}, `${(s.end - s.start).toFixed(2)}s`),
      item ? el('button.x', {
        title: 'Clear', onclick: (e) => { e.stopPropagation(); assign(i, null, false); },
      }, '✕') : null);
    slot.classList.toggle('active', i === rt.active);
    slot.onclick = () => {
      setActive(i);
      seek(s.start + 0.001);
      openPicker();
    };
    slot.addEventListener('dragover', (e) => {
      if ([...e.dataTransfer.types].includes('text/gif-id')) { e.preventDefault(); slot.classList.add('dragover'); }
    });
    slot.addEventListener('dragleave', () => slot.classList.remove('dragover'));
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.classList.remove('dragover');
      const gid = e.dataTransfer.getData('text/gif-id');
      if (gid) assign(i, gid, false);
    });
    return slot;
  }));
  const filled = rt.segments.filter((_, i) => validId(proj.assignments[i])).length;
  $('#clipCount').textContent = `· ${filled}/${rt.segments.length} filled`;
  markPlayingSlot();
  updatePickerTitle();
  picker && picker.redecorate();
}

function setActive(i) {
  rt.active = i;
  $$('.slot').forEach((s, k) => s.classList.toggle('active', k === i));
  updatePickerTitle();
  drawWave();
}

function assign(i, id, advance = true) {
  while (proj.assignments.length < rt.segments.length) proj.assignments.push(null);
  proj.assignments[i] = id;
  if (advance) {
    // jump to the next empty slot after i (or simply the next one)
    let next = -1;
    for (let k = i + 1; k < rt.segments.length; k++) if (!validId(proj.assignments[k])) { next = k; break; }
    if (next < 0 && i + 1 < rt.segments.length) next = i + 1;
    rt.active = next < 0 ? i : next;
  }
  renderSlots();
  drawWave();
  save();
  if (!rt.playing) {
    rt.playhead = rt.segments[i].start + 0.001;
    renderPreview();
    drawWave();
  }
}

function firstEmpty() {
  for (let k = 0; k < rt.segments.length; k++) if (!validId(proj.assignments[k])) return k;
  return -1;
}

function randomFill(all) {
  if (!rt.segments.length) return;
  const pool = query({ ...pickFilter, sort: 'newest' }).map((m) => m.id);
  if (!pool.length) return toast('No GIFs match the picker filter', 'error');
  const used = new Set(all ? [] : proj.assignments.filter(validId));
  let bag = shuffle(pool.filter((id) => !used.has(id)));
  let n = 0;
  for (let k = 0; k < rt.segments.length; k++) {
    if (!all && validId(proj.assignments[k])) continue;
    if (!bag.length) bag = shuffle(pool);
    // avoid the same GIF twice in a row
    let pickIdx = bag.findIndex((id) => id !== proj.assignments[k - 1]);
    if (pickIdx < 0) pickIdx = 0;
    proj.assignments[k] = bag.splice(pickIdx, 1)[0];
    n++;
  }
  renderSlots();
  drawWave();
  renderPreview();
  save();
  toast(n ? `Filled ${n} clips` : 'All clips are already filled');
}

// ------------------------------------------------------------------ picker

function openPicker() { $('#picker').classList.add('open'); }
function closePicker() { $('#picker').classList.remove('open'); }

function updatePickerTitle() {
  const n = rt.segments.length;
  $('#pickerTitle').textContent = rt.active >= 0 && n
    ? `Pick GIF for clip ${rt.active + 1} / ${n}`
    : 'GIF picker';
}

function usageCounts() {
  const m = new Map();
  rt.segments.forEach((_, i) => {
    const id = validId(proj.assignments[i]);
    if (id) m.set(id, (m.get(id) || 0) + 1);
  });
  return m;
}

let usageCache = null;
function decoratePick(item, tile) {
  if (!usageCache) {
    usageCache = usageCounts();
    queueMicrotask(() => (usageCache = null));
  }
  const n = usageCache.get(item.id) || 0;
  tile.classList.toggle('used', n > 0);
  if (n) tile.dataset.used = n > 1 ? `×${n}` : '✓';
}

function refreshPicker() {
  const items = query(pickFilter);
  picker.set(items);
  $('#pickEmpty').hidden = items.length > 0;
  const sel = $('#pickPerson');
  const cur = pickFilter.person;
  sel.replaceChildren(el('option', { value: '' }, 'Everyone'),
    ...people().map((p) => el('option', { value: p.name, selected: p.name === cur }, `${p.name} (${p.count})`)));
}

function initPicker() {
  picker = new PagedGrid($('#pickGrid'), $('#pickSentinel'), {
    decorate: decoratePick,
    scrollRoot: null,
    onClick: (item) => {
      if (!rt.buffer) return toast('Add a sound first (step 1)');
      if (rt.active < 0) rt.active = Math.max(0, firstEmpty());
      assign(rt.active, item.id, true);
    },
  });
  bindSeg($('#pickGender'), (v) => { pickFilter.gender = v; refreshPicker(); });
  $('#pickPerson').onchange = (e) => { pickFilter.person = e.target.value; refreshPicker(); };
  $('#pickSearch').addEventListener('input', debounce((e) => { pickFilter.search = e.target.value; refreshPicker(); }, 150));
  $('#pickShuffle').onclick = () => { reshuffle(); pickFilter.sort = 'random'; refreshPicker(); };
  $('#btnOpenPicker').onclick = () => {
    if (rt.active < 0) setActive(Math.max(0, firstEmpty()));
    openPicker();
  };
  $('#btnClosePicker').onclick = closePicker;
}

// ------------------------------------------------------------------ export

async function doExport() {
  if (!rt.buffer || rt.exporting) return;
  const empty = rt.segments.filter((_, i) => !validId(proj.assignments[i])).length;
  if (empty && !confirm(`${empty} of ${rt.segments.length} clips have no GIF and will show as blank. Export anyway?\n\nTip: use "🎲 Fill empty" to fill them randomly.`)) return;
  stop();
  const { W, H } = exportDims();
  const fps = parseInt(proj.settings.fps, 10);
  const ac = new AbortController();
  rt.exporting = ac;
  $('#btnExport').disabled = true;
  $('#exportProgress').hidden = false;
  $('#exportResult').hidden = true;
  const t0 = performance.now();
  try {
    const { blob, ext } = await exportVideo({
      audioBuffer: rt.buffer,
      edit: editModel(),
      start: proj.trimStart,
      end: proj.trimEnd,
      W, H, fps,
      signal: ac.signal,
      onProgress: (p) => {
        $('#exportBar').style.width = `${(p * 100).toFixed(1)}%`;
        $('#exportLabel').textContent = `Rendering ${Math.round(p * 100)}%`;
      },
    });
    rt.resultBlob = blob;
    rt.resultExt = ext;
    const v = $('#resultVideo');
    if (v.src) URL.revokeObjectURL(v.src);
    v.src = URL.createObjectURL(blob);
    $('#exportResult').hidden = false;
    const file = new File([blob], fileName(), { type: blob.type });
    $('#btnShareVideo').hidden = !(navigator.canShare && navigator.canShare({ files: [file] }));
    toast(`Exported ${W}×${H} ${ext.toUpperCase()} in ${((performance.now() - t0) / 1000).toFixed(1)}s`);
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error(e);
      toast(`Export failed: ${e.message}`, 'error');
    }
  } finally {
    rt.exporting = null;
    $('#btnExport').disabled = false;
    $('#exportProgress').hidden = true;
  }
}

function fileName() {
  const base = (proj.audioName || 'edit').replace(/\.[^.]+$/, '').replace(/[^\w\- ]+/g, '').trim().slice(0, 40) || 'edit';
  return `${base}-beat-edit.${rt.resultExt}`;
}

// ------------------------------------------------------------------ public API (used by library tab)

export const editorApi = {
  hasActive: () => rt.buffer && rt.active >= 0,
  useInActive(id) {
    if (!rt.buffer) return toast('Add a sound in the Beat Editor first');
    assign(rt.active, id, true);
  },
  fillWith(ids) {
    if (!rt.buffer) return toast('Add a sound in the Beat Editor first');
    let k = rt.active >= 0 && !validId(proj.assignments[rt.active]) ? rt.active : firstEmpty();
    if (k < 0) return toast('All clips are already filled — clear some first');
    let n = 0;
    for (const id of ids) {
      while (k < rt.segments.length && validId(proj.assignments[k])) k++;
      if (k >= rt.segments.length) break;
      while (proj.assignments.length <= k) proj.assignments.push(null);
      proj.assignments[k++] = id;
      n++;
    }
    renderSlots();
    drawWave();
    renderPreview();
    save();
    toast(`Placed ${n} GIFs into clips`);
    document.querySelector('.tab[data-tab="editor"]').click();
  },
  onShow() {
    drawWave();
    renderPreview();
    refreshPicker();
  },
  handleDroppedFile(file) {
    if (file.type.startsWith('audio/') || file.type.startsWith('video/') || /\.(mp3|m4a|aac|wav|ogg|mp4|mov|webm)$/i.test(file.name)) {
      loadSound(file);
      return true;
    }
    return false;
  },
};

// ------------------------------------------------------------------ init

export async function initEditor() {
  initWave();
  initPicker();

  $('#audioInput').onchange = (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (f) loadSound(f);
  };
  const drop = $('#audioDrop');
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    drop.classList.remove('over');
    const f = e.dataTransfer.files[0];
    if (f) loadSound(f);
  });
  $('#btnReplaceAudio').onclick = () => $('#audioInput').click();
  $('#btnDownloadAudio').onclick = () => {
    if (!rt.buffer) return;
    const base = (proj.audioName || 'sound').replace(/\.[^.]+$/, '');
    download(toWav(rt.buffer), `${base}.wav`);
  };

  bindSeg($('#beatMode'), (v) => {
    proj.mode = v;
    $('#everyCtl').hidden = v !== 'beats';
    $('#sensCtl').hidden = v !== 'hits';
    redetect();
  });
  bindSeg($('#beatEvery'), (v) => { proj.every = parseFloat(v); redetect(); });
  $('#sens').addEventListener('change', (e) => { proj.sensitivity = parseFloat(e.target.value); redetect(); });
  $('#btnRedetect').onclick = redetect;
  const trimChanged = () => {
    if (!rt.buffer) return;
    let s = parseFloat($('#trimStart').value) || 0;
    let e = parseFloat($('#trimEnd').value) || rt.buffer.duration;
    s = Math.max(0, Math.min(s, rt.buffer.duration - 0.2));
    e = Math.max(s + 0.2, Math.min(e, rt.buffer.duration));
    proj.trimStart = s;
    proj.trimEnd = e;
    syncTrimInputs();
    changed();
  };
  $('#trimStart').addEventListener('change', trimChanged);
  $('#trimEnd').addEventListener('change', trimChanged);
  $('#btnTrimStartHere').onclick = () => { $('#trimStart').value = rt.playhead.toFixed(2); trimChanged(); };
  $('#btnTrimEndHere').onclick = () => { $('#trimEnd').value = rt.playhead.toFixed(2); trimChanged(); };

  $('#btnPlay').onclick = togglePlay;
  $('#btnAddCut').onclick = () => addCut(rt.playhead);
  $('#btnDelCut').onclick = () => removeCut(rt.selectedCut);

  $('#btnAutofill').onclick = () => randomFill(false);
  $('#btnShuffleAll').onclick = () => randomFill(true);
  $('#btnClearAll').onclick = () => {
    if (!confirm('Remove all GIFs from the clips?')) return;
    proj.assignments = [];
    renderSlots();
    drawWave();
    renderPreview();
    save();
  };

  const setOpt = (key, sel, after) => $(sel).addEventListener('change', (e) => {
    proj.settings[key] = e.target.value;
    save();
    after && after();
    renderPreview();
  });
  setOpt('aspect', '#optAspect', sizePreview);
  setOpt('res', '#optRes', sizePreview);
  setOpt('fps', '#optFps');
  setOpt('fit', '#optFit');
  setOpt('effect', '#optEffect');

  $('#btnExport').onclick = doExport;
  $('#btnCancelExport').onclick = () => rt.exporting && rt.exporting.abort();
  $('#btnDownloadVideo').onclick = () => rt.resultBlob && download(rt.resultBlob, fileName());
  $('#btnShareVideo').onclick = async () => {
    try {
      await navigator.share({ files: [new File([rt.resultBlob], fileName(), { type: rt.resultBlob.type })] });
    } catch { /* cancelled */ }
  };

  document.addEventListener('keydown', (e) => {
    if (!$('#tab-editor').classList.contains('active')) return;
    if (e.target.closest('input, textarea, select, dialog')) return;
    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    else if (e.key === 'b' || e.key === 'B') { e.preventDefault(); addCut(rt.playhead); }
    else if ((e.key === 'Delete' || e.key === 'Backspace') && rt.selectedCut >= 0) { e.preventDefault(); removeCut(rt.selectedCut); }
    else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && rt.selectedCut >= 0) {
      e.preventDefault();
      const i = rt.selectedCut;
      const d = (e.key === 'ArrowLeft' ? -1 : 1) * (e.shiftKey ? 0.1 : 0.01);
      const lo = i > 0 ? proj.cuts[i - 1] + MIN_SEG : 0;
      const hi = i < proj.cuts.length - 1 ? proj.cuts[i + 1] - MIN_SEG : rt.buffer.duration;
      proj.cuts[i] = Math.max(lo, Math.min(hi, proj.cuts[i] + d));
      changed();
    }
  });

  onLibraryChange(debounce(() => {
    if ($('#tab-editor').classList.contains('active')) refreshPicker();
    if (rt.buffer) { renderSlots(); drawWave(); }
  }, 80));

  // restore last project
  try {
    const saved = await kvGet('project');
    if (saved && saved.audioFile) {
      Object.assign(proj, saved, { settings: { ...proj.settings, ...(saved.settings || {}) } });
      await loadSound(saved.audioFile, { restore: true });
    }
  } catch (e) {
    console.warn('Could not restore project', e);
  }
  refreshPicker();
}
