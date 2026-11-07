// Tiny IndexedDB wrapper.
// Stores:
//   meta  : GIF metadata + small static thumbnail (loaded in full at startup)
//   blobs : the original GIF file, keyed by the same id (loaded on demand)
//   kv    : misc key/value (current project, settings)

const DB_NAME = 'gif-beat-studio';
const DB_VERSION = 1;
let dbPromise = null;

function open() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('blobs')) db.createObjectStore('blobs');
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function wrap(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('Transaction aborted'));
  });
}

export async function getAllMeta() {
  const db = await open();
  return wrap(db.transaction('meta').objectStore('meta').getAll());
}

export async function putGif(meta, blob) {
  const db = await open();
  const tx = db.transaction(['meta', 'blobs'], 'readwrite');
  tx.objectStore('meta').put(meta);
  tx.objectStore('blobs').put(blob, meta.id);
  return txDone(tx);
}

export async function putMeta(metas) {
  const db = await open();
  const tx = db.transaction('meta', 'readwrite');
  const store = tx.objectStore('meta');
  for (const m of [].concat(metas)) store.put(m);
  return txDone(tx);
}

export async function getBlob(id) {
  const db = await open();
  return wrap(db.transaction('blobs').objectStore('blobs').get(id));
}

export async function deleteGifs(ids) {
  const db = await open();
  const tx = db.transaction(['meta', 'blobs'], 'readwrite');
  for (const id of ids) {
    tx.objectStore('meta').delete(id);
    tx.objectStore('blobs').delete(id);
  }
  return txDone(tx);
}

export async function kvGet(key) {
  const db = await open();
  return wrap(db.transaction('kv').objectStore('kv').get(key));
}

export async function kvSet(key, value) {
  const db = await open();
  const tx = db.transaction('kv', 'readwrite');
  tx.objectStore('kv').put(value, key);
  return txDone(tx);
}

export async function requestPersistence() {
  try {
    if (navigator.storage && navigator.storage.persist) await navigator.storage.persist();
  } catch { /* ignore */ }
}

export async function storageEstimate() {
  try {
    if (navigator.storage && navigator.storage.estimate) return await navigator.storage.estimate();
  } catch { /* ignore */ }
  return null;
}
