// In-memory library state backed by IndexedDB.
import * as db from './db.js';
import { probeGif } from './gif.js';
import { uid, shuffle } from './util.js';

export const library = {
  items: [],          // metadata objects
  byId: new Map(),
  hashes: new Set(),
};

const listeners = new Set();
export function onLibraryChange(fn) { listeners.add(fn); }
function emit() { for (const fn of listeners) fn(); }

const thumbUrls = new Map();
export function thumbUrl(item) {
  let u = thumbUrls.get(item.id);
  if (!u && item.thumb) {
    u = URL.createObjectURL(item.thumb);
    thumbUrls.set(item.id, u);
  }
  return u || '';
}

const fullUrls = new Map();
export async function fullUrl(id) {
  if (fullUrls.has(id)) return fullUrls.get(id);
  const blob = await db.getBlob(id);
  if (!blob) return '';
  const u = URL.createObjectURL(blob);
  fullUrls.set(id, u);
  return u;
}

export async function loadLibrary() {
  const items = await db.getAllMeta();
  library.items = items;
  library.byId = new Map(items.map((m) => [m.id, m]));
  library.hashes = new Set(items.map((m) => m.hash).filter(Boolean));
  emit();
}

async function hashBlob(blob) {
  try {
    const d = await crypto.subtle.digest('SHA-1', await blob.arrayBuffer());
    return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return `${blob.size}-${blob.type}`;
  }
}

export function normalizeName(name) {
  return (name || '').trim().replace(/\s+/g, ' ');
}

/**
 * Add one GIF (Blob/File) to the library.
 * defaults: { name, gender, tags, source }
 * Returns the new item, or null if it was a duplicate.
 */
export async function addGif(blob, defaults = {}, { silent = false } = {}) {
  const hash = await hashBlob(blob);
  if (library.hashes.has(hash)) return null;
  library.hashes.add(hash); // reserve now so parallel imports of the same file dedupe
  let info;
  try {
    info = await probeGif(blob);
  } catch (e) {
    library.hashes.delete(hash);
    throw e;
  }
  const item = {
    id: uid(),
    hash,
    name: normalizeName(defaults.name),
    gender: defaults.gender || '',
    tags: (defaults.tags || []).map((t) => t.trim().toLowerCase()).filter(Boolean),
    source: defaults.source || (blob.name ? `file:${blob.name}` : ''),
    width: info.width,
    height: info.height,
    frameCount: info.frameCount,
    duration: info.duration,
    size: blob.size,
    addedAt: Date.now() + Math.random(), // keep insertion order stable within a batch
    thumb: info.thumb,
  };
  const stored = blob.type ? blob : new Blob([blob], { type: 'image/gif' });
  await db.putGif(item, stored);
  library.items.push(item);
  library.byId.set(item.id, item);
  if (!silent) emit();
  return item;
}

/** Import many blobs with a concurrency limit; reports progress. */
export async function addMany(blobs, defaults, onProgress) {
  let done = 0, added = 0, dupes = 0, failed = 0;
  const queue = blobs.slice();
  const worker = async () => {
    while (queue.length) {
      const b = queue.shift();
      try {
        const d = typeof defaults === 'function' ? defaults(b) : defaults;
        const item = await addGif(b, d, { silent: true });
        if (item) added++; else dupes++;
      } catch (e) {
        console.warn('Import failed', b.name || '', e);
        failed++;
      }
      done++;
      onProgress && onProgress(done, blobs.length);
      if (done % 25 === 0) emit();
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  emit();
  return { added, dupes, failed };
}

export async function updateItems(ids, patch) {
  const changed = [];
  for (const id of ids) {
    const it = library.byId.get(id);
    if (!it) continue;
    if ('name' in patch) it.name = normalizeName(patch.name);
    if ('gender' in patch) it.gender = patch.gender;
    if ('tags' in patch) it.tags = patch.tags;
    if (patch.addTags) it.tags = [...new Set([...(it.tags || []), ...patch.addTags])];
    changed.push(it);
  }
  await db.putMeta(changed);
  emit();
}

export async function removeItems(ids) {
  await db.deleteGifs(ids);
  const set = new Set(ids);
  library.items = library.items.filter((m) => !set.has(m.id));
  for (const id of ids) {
    const m = library.byId.get(id);
    if (m && m.hash) library.hashes.delete(m.hash);
    library.byId.delete(id);
    for (const map of [thumbUrls, fullUrls]) {
      if (map.has(id)) { URL.revokeObjectURL(map.get(id)); map.delete(id); }
    }
  }
  emit();
}

export function people() {
  const counts = new Map();
  for (const m of library.items) {
    if (!m.name) continue;
    const key = m.name.toLowerCase();
    const cur = counts.get(key) || { name: m.name, count: 0, gender: m.gender };
    cur.count++;
    counts.set(key, cur);
  }
  return [...counts.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function allTags() {
  const s = new Map();
  for (const m of library.items) for (const t of m.tags || []) s.set(t, (s.get(t) || 0) + 1);
  return [...s.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
}

// stable random order per "shuffle seed"
let randomOrder = new Map();
export function reshuffle() {
  randomOrder = new Map(shuffle(library.items.map((m) => m.id)).map((id, i) => [id, i]));
}

/**
 * Filter + sort.
 * f: { gender: 'all'|'female'|'male'|'untagged', person: '', search: '', sort: 'newest'|'oldest'|'name'|'random' }
 */
export function query(f = {}) {
  const q = (f.search || '').trim().toLowerCase();
  const person = (f.person || '').toLowerCase();
  let out = library.items.filter((m) => {
    if (f.gender === 'female' && m.gender !== 'female') return false;
    if (f.gender === 'male' && m.gender !== 'male') return false;
    if (f.gender === 'untagged' && (m.gender || m.name)) return false;
    if (person === '__none__' ? m.name : person && m.name.toLowerCase() !== person) return false;
    if (q) {
      const hay = `${m.name} ${(m.tags || []).join(' ')} ${m.source || ''}`.toLowerCase();
      if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  });
  switch (f.sort) {
    case 'oldest': out.sort((a, b) => a.addedAt - b.addedAt); break;
    case 'name': out.sort((a, b) => (a.name || '￿').localeCompare(b.name || '￿') || b.addedAt - a.addedAt); break;
    case 'random':
      if (randomOrder.size < library.items.length) reshuffle();
      out.sort((a, b) => (randomOrder.get(a.id) ?? 0) - (randomOrder.get(b.id) ?? 0));
      break;
    default: out.sort((a, b) => b.addedAt - a.addedAt);
  }
  return out;
}
