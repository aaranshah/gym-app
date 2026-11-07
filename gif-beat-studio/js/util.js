export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** el('div.card#x', { onclick, title }, children...) */
export function el(spec, attrs = {}, ...children) {
  const [, tag = 'div', rest = ''] = spec.match(/^([a-z0-9-]*)(.*)$/i);
  const node = document.createElement(tag || 'div');
  for (const part of rest.match(/[.#][^.#]+/g) || []) {
    if (part[0] === '.') node.classList.add(part.slice(1));
    else node.id = part.slice(1);
  }
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k in node && k !== 'list') node[k] = v;
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

export function uid() {
  return (crypto.randomUUID && crypto.randomUUID()) || Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function fmtTime(s) {
  if (!isFinite(s)) return '–';
  const m = Math.floor(s / 60);
  const sec = s - m * 60;
  return `${m}:${sec.toFixed(2).padStart(5, '0')}`;
}

export function fmtBytes(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(0)} KB`;
  if (b < 1024 ** 3) return `${(b / 1024 ** 2).toFixed(1)} MB`;
  return `${(b / 1024 ** 3).toFixed(2)} GB`;
}

let toastTimer = null;
export function toast(msg, kind = '') {
  const t = $('#toast');
  t.textContent = msg;
  t.className = `toast show ${kind}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.className = 'toast'), 3200);
}

/** True when running as a published claude.ai artifact (set by the artifact build). */
export const IN_ARTIFACT = !!window.GBS_ARTIFACT;

/**
 * Save a file to the user's device. Inside a claude.ai artifact this goes through the
 * viewer's `downloads` capability (a save prompt / the phone's share sheet); elsewhere it
 * is a normal browser download.
 */
export async function download(blob, name) {
  if (window.claude && typeof window.claude.use === 'function') {
    const dl = await window.claude.use('downloads').catch(() => null);
    if (dl) {
      try {
        await dl.save({ filename: name, data: blob });
        toast('Saved');
      } catch (e) {
        if (e && e.code !== 'declined') toast(`Couldn't save: ${e.message || e.code}`, 'error');
      }
      return;
    }
    if (IN_ARTIFACT) {
      toast('Saving files is not available in this view', 'error');
      return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** In-page yes/no question (window.confirm is blocked inside artifacts). */
export function askConfirm(message, okLabel = 'OK', danger = false) {
  const dlg = document.getElementById('dlgConfirm');
  document.getElementById('confirmText').textContent = message;
  const ok = document.getElementById('confirmOk');
  ok.textContent = okLabel;
  ok.classList.toggle('danger-fill', danger);
  dlg.returnValue = '';
  dlg.showModal();
  return new Promise((r) => dlg.addEventListener('close', () => r(dlg.returnValue === 'ok'), { once: true }));
}

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/** Opens a <dialog>; resolves when it closes. */
export function openDialog(dlg) {
  if (!dlg.open) dlg.showModal();
  return new Promise((r) => dlg.addEventListener('close', () => r(dlg.returnValue), { once: true }));
}
