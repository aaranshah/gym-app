/* Ink layer: write on any screen with Apple Pencil (or a mouse, or optionally a finger).
 * - In ink mode the pencil draws; a finger still scrolls and taps (palm-friendly). "Finger draws" is optional.
 * - Ink is stored as vector strokes per screen/question in IndexedDB on this device, positioned relative to the
 *   content column so it stays aligned when the window width changes.
 * - Tools: pen (3 colours), highlighter, stroke eraser, undo, clear, and "add space" for blank working room.
 */
(function (TLL) {
  'use strict';
  const COLORS = { ink: 'var(--ink)', blue: '#2563EB', red: '#DC2626', hi: '#F59E0B' };
  const st = { on: false, tool: 'pen', color: 'ink', finger: false, key: null, data: null, main: null, canvas: null, ctx: null, stroke: null, undo: [], drewAt: 0, clearArm: 0 };
  let db = null; const mem = {};

  /* ---------- storage (IndexedDB, falls back to memory) ---------- */
  function openDb() {
    return new Promise((res) => {
      try {
        const r = indexedDB.open('tmua-logic-lab-ink', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('pages');
        r.onsuccess = () => { db = r.result; res(db); };
        r.onerror = () => res(null);
      } catch (e) { res(null); }
    });
  }
  const ready = openDb();
  async function load(key) {
    await ready;
    if (!db) return mem[key] || null;
    return new Promise((res) => { try { const g = db.transaction('pages').objectStore('pages').get(key); g.onsuccess = () => res(g.result || null); g.onerror = () => res(null); } catch (e) { res(mem[key] || null); } });
  }
  let saveT = null;
  function save() {
    clearTimeout(saveT);
    const key = st.key, data = st.data;
    saveT = setTimeout(() => {
      mem[key] = data;
      if (!db) return;
      try { const tx = db.transaction('pages', 'readwrite'); if (data.strokes.length || data.space) tx.objectStore('pages').put(data, key); else tx.objectStore('pages').delete(key); } catch (e) { /* memory only */ }
    }, 250);
  }

  /* ---------- geometry ---------- */
  const colLeft = () => { const p = st.main && st.main.querySelector('.page'); return p ? p.offsetLeft : 0; };
  function size() {
    if (!st.main || !st.canvas) return;
    const spacer = st.main.querySelector('.ink-space');
    if (spacer) spacer.style.height = (st.data && st.data.space ? st.data.space : 0) + 'px';
    const w = st.main.clientWidth, h = st.main.scrollHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, Math.sqrt(14e6 / Math.max(1, w * h)));
    const c = st.canvas;
    if (c._w !== w || c._h !== h || c._d !== dpr) {
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); c.style.width = w + 'px'; c.style.height = h + 'px';
      c._w = w; c._h = h; c._d = dpr; st.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    redraw();
  }
  function resolve(color) {
    if (!color.startsWith('var(')) return color;
    return getComputedStyle(document.documentElement).getPropertyValue(color.slice(4, -1)).trim() || '#000';
  }
  function drawStroke(ctx, s, ox) {
    const pts = s.p; if (!pts.length) return;
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = resolve(COLORS[s.c] || COLORS.ink);
    ctx.globalAlpha = s.t === 'hi' ? 0.32 : 1;
    if (s.t === 'hi') ctx.globalCompositeOperation = 'multiply';
    const base = s.t === 'hi' ? 18 : 2.6;
    if (pts.length === 1) { ctx.beginPath(); ctx.arc(pts[0][0] + ox, pts[0][1], base / 2, 0, 7); ctx.fillStyle = ctx.strokeStyle; ctx.fill(); ctx.restore(); return; }
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      ctx.lineWidth = s.t === 'hi' ? base : base * (0.45 + (b[2] || 0.5) * 1.1);
      ctx.beginPath();
      const m0 = i > 1 ? [(pts[i - 2][0] + a[0]) / 2, (pts[i - 2][1] + a[1]) / 2] : a;
      const m1 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      ctx.moveTo(m0[0] + ox, m0[1]); ctx.quadraticCurveTo(a[0] + ox, a[1], m1[0] + ox, m1[1]);
      if (i === pts.length - 1) ctx.lineTo(b[0] + ox, b[1]);
      ctx.stroke();
    }
    ctx.restore();
  }
  function redraw() {
    const c = st.canvas, ctx = st.ctx; if (!c) return;
    ctx.clearRect(0, 0, c._w || c.width, c._h || c.height);
    if (!st.data) return;
    const ox = colLeft();
    st.data.strokes.forEach(s => drawStroke(ctx, s, ox));
    if (st.stroke) drawStroke(ctx, st.stroke, ox);
  }

  /* ---------- attach to a screen ---------- */
  let ro = null;
  function attach(main, key) {
    st.main = main;
    if (!main.querySelector('.ink-canvas')) {
      main.insertAdjacentHTML('beforeend', '<div class="ink-space" aria-hidden="true"></div><canvas class="ink-canvas" aria-hidden="true"></canvas>');
    }
    st.canvas = main.querySelector('.ink-canvas'); st.ctx = st.canvas.getContext('2d');
    if (!ro && window.ResizeObserver) { ro = new ResizeObserver(() => size()); }
    if (ro) { ro.disconnect(); ro.observe(main); const p = main.querySelector('.page'); if (p) ro.observe(p); }
    setKey(key);
  }
  async function setKey(key) {
    st.key = key; st.undo = []; st.stroke = null;
    st.data = { strokes: [], space: 0 };
    size();
    const d = await load(key);
    if (st.key !== key) return;
    st.data = d && Array.isArray(d.strokes) ? d : { strokes: [], space: 0 };
    size(); updateBar();
  }

  /* ---------- input ---------- */
  function wants(e) {
    if (!st.on || !st.main) return false;
    if (e.pointerType === 'pen') return true;
    if (e.pointerType === 'mouse') return st.finger || !matchMedia('(hover: none)').matches;
    if (e.pointerType === 'touch') return st.finger;
    return false;
  }
  function pos(e) { const r = st.main.getBoundingClientRect(); return [Math.round((e.clientX - r.left - colLeft()) * 10) / 10, Math.round((e.clientY - r.top) * 10) / 10, e.pointerType === 'pen' ? Math.round((e.pressure || 0.5) * 100) / 100 : 0.5]; }
  function inMain(t) { return st.main && st.main.contains(t) && !t.closest('.ink-bar'); }

  function down(e) {
    if (!wants(e) || !inMain(e.target) || e.button > 0) return;
    e.preventDefault(); e.stopPropagation();
    if (st.tool === 'erase') { st.erasing = true; erase(pos(e)); return; }
    st.stroke = { t: st.tool === 'hi' ? 'hi' : 'pen', c: st.tool === 'hi' ? 'hi' : st.color, p: [pos(e)] };
    redraw();
  }
  function move(e) {
    if (!st.stroke && !st.erasing) return;
    e.preventDefault();
    let evs = e.getCoalescedEvents ? e.getCoalescedEvents() : null; if (!evs || !evs.length) evs = [e];
    if (st.erasing) { evs.forEach(ev => erase(pos(ev))); return; }
    evs.forEach(ev => { const p = pos(ev); const l = st.stroke.p[st.stroke.p.length - 1]; if (Math.abs(p[0] - l[0]) + Math.abs(p[1] - l[1]) > 0.8) st.stroke.p.push(p); });
    redraw();
  }
  function up() {
    if (st.erasing) { st.erasing = false; st.drewAt = Date.now(); save(); return; }
    if (!st.stroke) return;
    st.data.strokes.push(st.stroke); st.undo.push({ add: st.stroke }); st.stroke = null; st.drewAt = Date.now();
    redraw(); save(); updateBar();
  }
  function erase(p) {
    const r = 14; let hit = false;
    st.data.strokes = st.data.strokes.filter(s => {
      const touch = s.p.some(q => Math.abs(q[0] - p[0]) < r && Math.abs(q[1] - p[1]) < r);
      if (touch) { st.undo.push({ del: s }); hit = true; }
      return !touch;
    });
    if (hit) { redraw(); updateBar(); }
  }
  document.addEventListener('pointerdown', down, { capture: true, passive: false });
  window.addEventListener('pointermove', move, { passive: false });
  window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  // iPad: stop the pencil from scrolling or selecting text while ink mode is on; fingers keep scrolling.
  document.addEventListener('touchstart', (e) => {
    if (!st.on || !inMain(e.target)) return;
    const t = e.touches[0];
    if ((t && t.touchType === 'stylus') || st.finger) e.preventDefault();
  }, { passive: false, capture: true });
  document.addEventListener('touchmove', (e) => { if (st.on && (st.stroke || st.erasing)) e.preventDefault(); }, { passive: false, capture: true });
  // swallow the click that follows a stroke, so writing over an option does not select it
  document.addEventListener('click', (e) => { if (st.on && Date.now() - st.drewAt < 400 && inMain(e.target)) { e.preventDefault(); e.stopPropagation(); } }, true);

  /* ---------- toolbar ---------- */
  const bar = document.createElement('div');
  bar.className = 'ink-bar';
  bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', 'Handwriting');
  function updateBar() {
    if (!st.on) {
      bar.innerHTML = '<button type="button" class="btn ink-toggle" data-ink="on" aria-pressed="false" title="Write on this screen with Apple Pencil">✎ Write</button>';
      document.documentElement.classList.remove('ink-on'); return;
    }
    document.documentElement.classList.add('ink-on');
    const b = (id, label, txt, pressed) => `<button type="button" class="btn btn-small ink-tool" data-ink="${id}" aria-label="${label}" title="${label}" ${pressed != null ? `aria-pressed="${pressed}"` : ''}>${txt}</button>`;
    const n = st.data ? st.data.strokes.length : 0;
    bar.innerHTML = `<div class="ink-tools">
      ${b('pen-ink', 'Pen, black', '<span class="sw" style="background:var(--ink)"></span>', st.tool === 'pen' && st.color === 'ink')}
      ${b('pen-blue', 'Pen, blue', '<span class="sw" style="background:#2563EB"></span>', st.tool === 'pen' && st.color === 'blue')}
      ${b('pen-red', 'Pen, red', '<span class="sw" style="background:#DC2626"></span>', st.tool === 'pen' && st.color === 'red')}
      ${b('hi', 'Highlighter', 'Highlight', st.tool === 'hi')}
      ${b('erase', 'Eraser (removes whole strokes)', 'Erase', st.tool === 'erase')}
      ${b('undo', 'Undo', 'Undo')}
      ${b('space', 'Add blank working space below', '+ Space')}
      ${b('clear', st.clearArm > Date.now() ? 'Tap again to clear this page' : 'Clear this page', st.clearArm > Date.now() ? 'Confirm clear' : 'Clear')}
      ${b('finger', 'Let a finger draw too (otherwise only the pencil draws)', 'Finger draws', st.finger)}
      <button type="button" class="btn btn-small btn-primary" data-ink="off">Done</button></div>
      <span class="ink-note">${matchMedia('(hover: none)').matches ? 'Pencil writes; finger scrolls and taps.' : 'Mouse or pen writes; press Done to click the page again.'} ${n} stroke${n === 1 ? '' : 's'} on this page.</span>`;
  }
  bar.addEventListener('click', (e) => {
    const t = e.target.closest('[data-ink]'); if (!t) return;
    const a = t.dataset.ink;
    if (a === 'on') { st.on = true; size(); }
    else if (a === 'off') st.on = false;
    else if (a.startsWith('pen-')) { st.tool = 'pen'; st.color = a.slice(4); }
    else if (a === 'hi' || a === 'erase') st.tool = a;
    else if (a === 'finger') st.finger = !st.finger;
    else if (a === 'undo') {
      const u = st.undo.pop();
      if (u && u.add) st.data.strokes = st.data.strokes.filter(s => s !== u.add);
      else if (u && u.del) st.data.strokes.push(u.del);
      else if (u && u.clear) st.data.strokes = u.clear;
      redraw(); save();
    } else if (a === 'space') { st.data.space = (st.data.space || 0) + 500; size(); save(); setTimeout(() => window.scrollBy({ top: 400 }), 30); }
    else if (a === 'clear') {
      if (st.clearArm > Date.now()) { st.undo.push({ clear: st.data.strokes }); st.data.strokes = []; st.data.space = 0; st.clearArm = 0; size(); save(); }
      else { st.clearArm = Date.now() + 3000; setTimeout(updateBar, 3100); }
    }
    updateBar();
    const again = bar.querySelector(`[data-ink="${a}"]`) || bar.querySelector('[data-ink]'); if (again) again.focus({ preventScroll: true });
  });
  function mount() { if (!bar.isConnected) document.body.appendChild(bar); updateBar(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  window.addEventListener('resize', () => size());
  // repaint after theme changes so black ink follows the theme
  new MutationObserver(() => redraw()).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  TLL.ink = { attach, setKey, get state() { return st; }, refresh: size };
})(window.TLL);
