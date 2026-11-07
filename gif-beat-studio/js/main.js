import { $, $$, toast } from './util.js';
import { loadLibrary } from './store.js';
import { initLibrary, setEditorHooks, importFiles } from './library.js';
import { initEditor, editorApi } from './editor.js';
import { requestPersistence } from './db.js';

function showTab(name) {
  $$('.tab').forEach((t) => {
    const on = t.dataset.tab === name;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', on);
  });
  $$('.tabpane').forEach((p) => p.classList.toggle('active', p.id === `tab-${name}`));
  try { localStorage.setItem('tab', name); } catch { /* ignore */ }
  if (name === 'editor') editorApi.onShow();
}

function initDragDrop() {
  const veil = $('#dropVeil');
  let depth = 0;
  const hasFiles = (e) => [...(e.dataTransfer?.types || [])].includes('Files');
  window.addEventListener('dragenter', (e) => {
    if (!hasFiles(e) || $('dialog[open]')) return;
    depth++;
    veil.querySelector('div').textContent = $('#tab-editor').classList.contains('active')
      ? 'Drop a sound/video to use it, or GIFs to add them to your library'
      : 'Drop GIFs (or a .zip) to add them to your library';
    veil.classList.add('show');
  });
  window.addEventListener('dragleave', () => {
    if (--depth <= 0) { depth = 0; veil.classList.remove('show'); }
  });
  window.addEventListener('dragover', (e) => { if (hasFiles(e)) e.preventDefault(); });
  window.addEventListener('drop', async (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    depth = 0;
    veil.classList.remove('show');
    const files = [...e.dataTransfer.files];
    const rest = [];
    for (const f of files) {
      if (!editorApi.handleDroppedFile(f)) rest.push(f);
    }
    if (rest.length) {
      toast(`Importing ${rest.length} file${rest.length > 1 ? 's' : ''}…`);
      await importFiles(rest);
    }
  });
}

async function main() {
  $$('.tab').forEach((t) => (t.onclick = () => showTab(t.dataset.tab)));
  setEditorHooks(editorApi);
  initLibrary();
  await loadLibrary();
  await initEditor();
  initDragDrop();
  requestPersistence();
  let tab = 'library';
  try { tab = localStorage.getItem('tab') || 'library'; } catch { /* ignore */ }
  showTab(tab);
}

main().catch((e) => {
  console.error(e);
  toast(`Startup error: ${e.message}`, 'error');
});
