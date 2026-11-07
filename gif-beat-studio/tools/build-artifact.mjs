// Builds dist/artifact.html: the whole app (HTML + CSS + JS + vendor libs) in one
// self-contained page, the shape claude.ai artifacts need (no external files, no
// <html>/<head>/<body> wrapper, title + style first).
//
//   node tools/build-artifact.mjs
//
// Needs network access for `npx esbuild` the first time.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const js = execFileSync('npx', ['--yes', 'esbuild@0.28.2', 'js/main.js', '--bundle', '--format=iife',
  '--minify', '--target=es2020', '--legal-comments=eof'], { cwd: root, maxBuffer: 64 * 1024 * 1024 }).toString()
  .replace(/<\/script/gi, '<\\/script');

const html = read('index.html');
const body = html.slice(html.indexOf('<body>') + 6, html.indexOf('<script type="module"')).trim();

// Phone / safe-area adjustments for the claude.ai viewer.
const artifactCss = `
.topbar { top: env(safe-area-inset-top, 0px); padding-top: 10px;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 25; background: var(--bg); }
.tabpane { padding-block: 16px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
.people, .ed-side { top: calc(70px + env(safe-area-inset-top, 0px)); }
@media (max-width: 1100px) {
  .picker { padding-left: max(14px, env(safe-area-inset-left, 0px)); padding-right: max(14px, env(safe-area-inset-right, 0px)); }
}
@media (max-width: 760px) {
  .tabpane { padding-block: 12px; }
  .topbar { padding-left: max(12px, env(safe-area-inset-left, 0px)); padding-right: max(12px, env(safe-area-inset-right, 0px)); }
}
`;

const out = `<title>GIF Beat Studio</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="theme-color" content="#0d0d12">
<style>
${read('css/app.css')}
${artifactCss}
</style>
${body}
<script>window.GBS_ARTIFACT = true;</script>
<script>
${js}
</script>
`;

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist/artifact.html'), out);
console.log(`dist/artifact.html  ${(out.length / 1024).toFixed(0)} KB`);
