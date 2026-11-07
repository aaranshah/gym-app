// Library tab: browse / filter / tag / import / backup.
import { $, $$, el, toast, download, openDialog, debounce, fmtBytes, askConfirm, IN_ARTIFACT } from './util.js';
import {
  library, onLibraryChange, query, people, addMany, updateItems, removeItems, reshuffle, fullUrl,
} from './store.js';
import { PagedGrid } from './grid.js';
import { readZip, writeZip } from './zip.js';
import { storageEstimate, getBlob } from './db.js';

const filter = { gender: 'all', person: '', search: '', sort: 'newest' };
let selectMode = false;
const selected = new Set();
let grid;
let editorHooks = { useInActive: null, fillWith: null, hasActive: () => false };

export function setEditorHooks(h) { editorHooks = { ...editorHooks, ...h }; }

function segValue(seg) {
  const on = seg.querySelector('button.on');
  return on ? on.dataset.v : '';
}
function bindSeg(seg, onChange) {
  seg.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    e.preventDefault();
    $$('button', seg).forEach((x) => x.classList.toggle('on', x === b));
    onChange && onChange(b.dataset.v);
  });
}
function setSeg(seg, v) {
  $$('button', seg).forEach((x) => x.classList.toggle('on', x.dataset.v === v));
}
export { bindSeg, setSeg, segValue };

function parseTags(s) {
  return (s || '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
}

// ------------------------------------------------------------------ rendering

function renderPeople() {
  const box = $('#peopleList');
  const list = people();
  const noName = library.items.filter((m) => !m.name).length;
  const btn = (label, value, count, gender) => el('button', {
    className: filter.person === value ? 'on' : '',
    onclick: () => { filter.person = value; renderAll(); },
  }, gender !== undefined ? el(`i.dot.${gender || 'none'}`) : null, label, el('span.n', {}, count));
  box.replaceChildren(...[
    btn('Everyone', '', library.items.length),
    noName ? btn('No name yet', '__none__', noName) : null,
    list.length ? el('div.sep') : null,
    list.length ? el('div.label', {}, `People · ${list.length}`) : null,
    ...list.map((p) => btn(p.name, p.name, p.count, p.gender)),
  ].filter(Boolean));
  $('#peopleNames').replaceChildren(...list.map((p) => el('option', { value: p.name })));
}

function renderGrid() {
  const items = query(filter);
  grid.set(items);
  const total = library.items.length;
  $('#libCount').textContent = total;
  $('#libEmpty').hidden = total > 0;
  $('#libStatus').textContent = total
    ? `${items.length.toLocaleString()} of ${total.toLocaleString()} GIFs${filter.person && filter.person !== '__none__' ? ` · ${filter.person}` : ''}`
    : '';
}

function renderAll() {
  renderPeople();
  renderGrid();
  updateBulkBar();
}

function decorate(item, tile) {
  tile.classList.toggle('sel', selected.has(item.id));
}

function updateBulkBar() {
  $('#bulkBar').hidden = !selectMode;
  $('#bulkCount').textContent = `${selected.size} selected`;
  $('#libSelectMode').classList.toggle('primary', selectMode);
}

// ------------------------------------------------------------------ item dialog

async function openItem(item) {
  const dlg = $('#dlgItem');
  $('#itemImg').src = await fullUrl(item.id);
  $('#itemName').value = item.name || '';
  $('#itemTags').value = (item.tags || []).join(', ');
  setSeg($('#itemGender'), item.gender || '');
  $('#itemMeta').textContent = [
    `${item.width}×${item.height}`,
    item.frameCount > 1 ? `${item.frameCount} frames · ${item.duration.toFixed(2)}s loop` : 'still image',
    fmtBytes(item.size || 0),
    item.source || '',
  ].filter(Boolean).join(' · ');
  $('#itemUse').hidden = !editorHooks.hasActive();
  dlg.dataset.id = item.id;
  openDialog(dlg);
}

function initItemDialog() {
  const dlg = $('#dlgItem');
  bindSeg($('#itemGender'));
  $('#itemSave').onclick = async () => {
    await updateItems([dlg.dataset.id], {
      name: $('#itemName').value,
      gender: segValue($('#itemGender')),
      tags: parseTags($('#itemTags').value),
    });
    dlg.close();
    toast('Saved');
  };
  $('#itemDelete').onclick = async () => {
    if (!(await askConfirm('Delete this GIF from your library?', 'Delete', true))) return;
    await removeItems([dlg.dataset.id]);
    dlg.close();
  };
  $('#itemUse').onclick = () => {
    editorHooks.useInActive && editorHooks.useInActive(dlg.dataset.id);
    dlg.close();
  };
}

// ------------------------------------------------------------------ bulk actions

function initBulk() {
  $('#libSelectMode').onclick = () => {
    selectMode = !selectMode;
    if (!selectMode) selected.clear();
    grid.redecorate();
    updateBulkBar();
  };
  $('#bulkDone').onclick = () => $('#libSelectMode').click();
  $('#bulkAll').onclick = () => {
    for (const m of grid.items) selected.add(m.id);
    grid.redecorate();
    updateBulkBar();
  };
  $('#bulkDelete').onclick = async () => {
    if (!selected.size) return;
    if (!(await askConfirm(`Delete ${selected.size} GIFs from your library?`, 'Delete', true))) return;
    await removeItems([...selected]);
    selected.clear();
    updateBulkBar();
    toast('Deleted');
  };
  $('#bulkToEditor').onclick = () => {
    if (!selected.size) return toast('Select some GIFs first');
    const ids = grid.items.filter((m) => selected.has(m.id)).map((m) => m.id);
    editorHooks.fillWith && editorHooks.fillWith(ids);
  };
  bindSeg($('#bulkGender'));
  $('#bulkTag').onclick = () => {
    if (!selected.size) return toast('Select some GIFs first');
    $('#bulkSetName').checked = false;
    $('#bulkSetGender').checked = false;
    $('#bulkName').value = '';
    $('#bulkTags').value = '';
    openDialog($('#dlgBulk'));
  };
  $('#bulkName').addEventListener('input', () => ($('#bulkSetName').checked = true));
  $('#bulkGender').addEventListener('click', () => ($('#bulkSetGender').checked = true));
  $('#bulkApply').onclick = async () => {
    const patch = {};
    if ($('#bulkSetName').checked) patch.name = $('#bulkName').value;
    if ($('#bulkSetGender').checked) patch.gender = segValue($('#bulkGender'));
    const tags = parseTags($('#bulkTags').value);
    if (tags.length) patch.addTags = tags;
    await updateItems([...selected], patch);
    $('#dlgBulk').close();
    toast(`Updated ${selected.size} GIFs`);
  };
}

// ------------------------------------------------------------------ import

function importDefaults() {
  return {
    name: $('#impName').value,
    gender: segValue($('#impGender')),
    tags: parseTags($('#impTags').value),
  };
}

function progress(prefix, done, total) {
  $('#importProgress').hidden = false;
  $('#importBar').style.width = `${(done / Math.max(1, total)) * 100}%`;
  $('#importLabel').textContent = `${prefix} ${done}/${total}`;
}

const IMG_RE = /\.(gif|webp|png|jpe?g)$/i;
const TYPES = { gif: 'image/gif', webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg' };

/** Expand a list of Files (GIFs and/or zips) into image Files. */
async function expandFiles(files, folderNames) {
  const out = [];
  for (const f of files) {
    if (/\.zip$/i.test(f.name) || f.type === 'application/zip' || f.type === 'application/x-zip-compressed') {
      const entries = await readZip(f);
      const metaEntry = entries.find((e) => e.name === 'library.json');
      if (metaEntry) {
        await restoreBackup(entries, metaEntry);
        continue;
      }
      for (const e of entries) {
        if (!IMG_RE.test(e.name) || e.name.includes('__MACOSX')) continue;
        const ext = e.name.split('.').pop().toLowerCase();
        const base = e.name.split('/').pop();
        const file = new File([await e.blob()], base, { type: TYPES[ext] });
        if (folderNames) {
          const parts = e.name.split('/');
          if (parts.length > 1) file.folderName = parts[parts.length - 2];
        }
        out.push(file);
      }
    } else if (f.type.startsWith('image/') || IMG_RE.test(f.name)) {
      out.push(f);
    }
  }
  return out;
}

export async function importFiles(fileList, defaults = importDefaults()) {
  const files = await expandFiles([...fileList], $('#impFolderNames').checked);
  if (!files.length) return;
  const res = await addMany(
    files,
    (f) => (f.folderName ? { ...defaults, name: defaults.name || f.folderName } : defaults),
    (d, t) => progress('Importing', d, t),
  );
  $('#importProgress').hidden = true;
  toast(`Added ${res.added} GIFs${res.dupes ? ` · ${res.dupes} duplicates skipped` : ''}${res.failed ? ` · ${res.failed} failed` : ''}`);
}

async function fetchAsBlob(url) {
  const r = await fetch(url, { mode: 'cors' });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const b = await r.blob();
  if (!b.type.startsWith('image/') && b.type !== 'application/octet-stream') throw new Error('Not an image');
  return b;
}

async function importUrls(urls, defaultsFor) {
  let done = 0;
  const blobs = [];
  const queue = urls.slice();
  const failed = [];
  const worker = async () => {
    while (queue.length) {
      const u = queue.shift();
      try {
        const b = await fetchAsBlob(typeof u === 'string' ? u : u.url);
        b.src = u;
        blobs.push(b);
      } catch (e) {
        failed.push(u);
      }
      progress('Downloading', ++done, urls.length);
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  const res = await addMany(blobs, (b) => defaultsFor(b.src), (d, t) => progress('Adding', d, t));
  $('#importProgress').hidden = true;
  toast(`Added ${res.added} GIFs${res.dupes ? ` · ${res.dupes} duplicates` : ''}${failed.length ? ` · ${failed.length} failed to download` : ''}`,
    failed.length && !res.added ? 'error' : '');
}

// --- GIPHY
const giphy = { q: '', offset: 0, results: [], selected: new Set() };

async function giphySearch(more = false) {
  const key = $('#giphyKey').value.trim();
  const q = $('#giphyQuery').value.trim();
  if (!key) return toast('Paste your free GIPHY API key first', 'error');
  if (!q) return;
  try { localStorage.setItem('giphyKey', key); } catch { /* ignore */ }
  if (!more) {
    giphy.q = q;
    giphy.offset = 0;
    giphy.results = [];
    giphy.selected.clear();
    $('#giphyGrid').replaceChildren();
  }
  $('#giphyStatus').textContent = 'Searching…';
  try {
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${encodeURIComponent(key)}&q=${encodeURIComponent(giphy.q)}&limit=50&offset=${giphy.offset}&rating=${$('#giphyRating').value}`;
    const r = await fetch(url);
    const json = await r.json();
    if (!r.ok) throw new Error(json.message || json.meta?.msg || `HTTP ${r.status}`);
    const data = json.data || [];
    giphy.offset += data.length;
    for (const g of data) {
      const img = g.images || {};
      const thumb = (img.fixed_width_small || img.fixed_width || img.preview_gif || {}).url;
      const full = (img.original || img.downsized_large || {}).url;
      if (!thumb || !full) continue;
      const item = { id: g.id, thumb, full, title: g.title };
      giphy.results.push(item);
      const t = el('div.tile', { title: g.title || '' }, el('img', { src: thumb, loading: 'lazy', alt: g.title || '' }));
      t.onclick = () => {
        if (giphy.selected.has(item.id)) giphy.selected.delete(item.id);
        else giphy.selected.add(item.id);
        t.classList.toggle('sel', giphy.selected.has(item.id));
        giphyButtons();
      };
      $('#giphyGrid').append(t);
    }
    const total = json.pagination ? json.pagination.total_count : giphy.offset;
    $('#giphyStatus').textContent = `${giphy.results.length} of ${total.toLocaleString()} results`;
    $('#giphyMore').hidden = giphy.offset >= total || !data.length;
  } catch (e) {
    $('#giphyStatus').textContent = `Search failed: ${e.message}`;
  }
  giphyButtons();
}

function giphyButtons() {
  $('#giphySelectAll').disabled = !giphy.results.length;
  $('#giphyImport').disabled = !giphy.selected.size;
  $('#giphyImport').textContent = giphy.selected.size ? `Import ${giphy.selected.size}` : 'Import selected';
}

function initImport() {
  const dlg = $('#dlgImport');
  $('#btnImport').onclick = () => openDialog(dlg);
  // artifact network policy blocks GIPHY and other sites, so only offer file import there
  if (IN_ARTIFACT) $$('.subtabs', dlg).forEach((x) => (x.hidden = true));
  bindSeg($('#impGender'));
  $$('.subtab', dlg).forEach((b) => (b.onclick = () => {
    $$('.subtab', dlg).forEach((x) => x.classList.toggle('active', x === b));
    $$('.subpane', dlg).forEach((p) => p.classList.toggle('active', p.dataset.sub === b.dataset.sub));
  }));
  $('#gifInput').onchange = async (e) => {
    await importFiles(e.target.files);
    e.target.value = '';
  };
  const drop = $('.drop', dlg);
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    drop.classList.remove('over');
    await importFiles(e.dataTransfer.files);
  });

  try { $('#giphyKey').value = localStorage.getItem('giphyKey') || ''; } catch { /* ignore */ }
  $('#giphySearch').onclick = () => giphySearch(false);
  $('#giphyQuery').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); giphySearch(false); } });
  $('#giphyMore').onclick = () => giphySearch(true);
  $('#giphySelectAll').onclick = () => {
    const all = giphy.selected.size < giphy.results.length;
    giphy.selected = new Set(all ? giphy.results.map((r) => r.id) : []);
    $$('#giphyGrid .tile').forEach((t, i) => t.classList.toggle('sel', giphy.selected.has(giphy.results[i].id)));
    giphyButtons();
  };
  $('#giphyImport').onclick = async () => {
    const d = importDefaults();
    const picks = giphy.results.filter((r) => giphy.selected.has(r.id));
    $('#giphyImport').disabled = true;
    await importUrls(picks.map((p) => ({ url: p.full, id: p.id, title: p.title })), (src) => ({
      ...d,
      source: `giphy:${src.id}`,
      tags: [...d.tags, ...(d.name ? [] : [giphy.q.toLowerCase()])],
    }));
    giphy.selected.clear();
    $$('#giphyGrid .tile').forEach((t) => t.classList.remove('sel'));
    giphyButtons();
  };

  $('#urlImport').onclick = async () => {
    const urls = $('#urlList').value.split(/\s+/).map((s) => s.trim()).filter((s) => /^https?:\/\//.test(s));
    if (!urls.length) return toast('Paste at least one https:// link');
    const d = importDefaults();
    await importUrls(urls, (u) => ({ ...d, source: typeof u === 'string' ? u : u.url }));
  };
}

// ------------------------------------------------------------------ backup

async function restoreBackup(entries, metaEntry) {
  const meta = JSON.parse(await (await metaEntry.blob()).text());
  const byFile = new Map(entries.map((e) => [e.name, e]));
  const files = [];
  for (const m of meta.items || []) {
    const e = byFile.get(m.file);
    if (!e) continue;
    const ext = m.file.split('.').pop().toLowerCase();
    const f = new File([await e.blob()], m.file.split('/').pop(), { type: TYPES[ext] || 'image/gif' });
    f.meta = m;
    files.push(f);
  }
  const res = await addMany(files, (f) => ({
    name: f.meta.name, gender: f.meta.gender, tags: f.meta.tags, source: f.meta.source,
  }), (d, t) => backupProgress('Restoring', d, t));
  toast(`Restored ${res.added} GIFs${res.dupes ? ` · ${res.dupes} already in library` : ''}`);
}

function backupProgress(label, d, t) {
  $('#backupProgress').hidden = false;
  $('#backupBar').style.width = `${(d / Math.max(1, t)) * 100}%`;
  $('#backupLabel').textContent = `${label} ${d}/${t}`;
}

function initBackup() {
  $('#btnBackup').onclick = async () => {
    const est = await storageEstimate();
    const bytes = library.items.reduce((s, m) => s + (m.size || 0), 0);
    $('#storageInfo').textContent = `${library.items.length.toLocaleString()} GIFs · ${fmtBytes(bytes)}` +
      (est && est.quota ? ` · browser storage used ${fmtBytes(est.usage || 0)} of ${fmtBytes(est.quota)}` : '');
    openDialog($('#dlgBackup'));
  };
  $('#backupExport').onclick = async () => {
    const files = [];
    const items = [];
    for (let i = 0; i < library.items.length; i++) {
      const m = library.items[i];
      const blob = await getBlob(m.id);
      if (!blob) continue;
      const ext = (blob.type.split('/')[1] || 'gif').replace('jpeg', 'jpg');
      const file = `gifs/${(m.name || 'untagged').replace(/[^\w\- ]+/g, '').slice(0, 40) || 'gif'}-${m.id.slice(0, 8)}.${ext}`;
      files.push({ name: file, blob });
      items.push({ file, name: m.name, gender: m.gender, tags: m.tags, source: m.source, addedAt: m.addedAt });
      if (i % 20 === 0) backupProgress('Collecting', i, library.items.length);
    }
    files.push({ name: 'library.json', blob: new Blob([JSON.stringify({ version: 1, items }, null, 1)]) });
    const zip = await writeZip(files, (p) => backupProgress('Packing', Math.round(p * files.length), files.length));
    $('#backupProgress').hidden = true;
    download(zip, `gif-library-${new Date().toISOString().slice(0, 10)}.zip`);
  };
  $('#backupInput').onchange = async (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try {
      const entries = await readZip(f);
      const metaEntry = entries.find((x) => x.name === 'library.json');
      if (metaEntry) await restoreBackup(entries, metaEntry);
      else await importFiles([f], {});
    } catch (err) {
      toast(`Could not read backup: ${err.message}`, 'error');
    }
    $('#backupProgress').hidden = true;
  };
}

// ------------------------------------------------------------------ init

export function initLibrary() {
  grid = new PagedGrid($('#libGrid'), $('#libSentinel'), {
    decorate,
    onClick: (item, tile) => {
      if (selectMode) {
        if (selected.has(item.id)) selected.delete(item.id);
        else selected.add(item.id);
        decorate(item, tile);
        updateBulkBar();
      } else {
        openItem(item);
      }
    },
  });
  bindSeg($('#libGender'), (v) => { filter.gender = v; renderGrid(); });
  $('#libSearch').addEventListener('input', debounce((e) => { filter.search = e.target.value; renderGrid(); }, 150));
  $('#libSort').onchange = (e) => { filter.sort = e.target.value; renderGrid(); };
  $('#libShuffle').onclick = () => {
    reshuffle();
    filter.sort = 'random';
    $('#libSort').value = 'random';
    renderGrid();
  };
  initItemDialog();
  initBulk();
  initImport();
  initBackup();
  onLibraryChange(debounce(renderAll, 50));
  renderAll();
}
