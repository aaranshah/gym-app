#!/usr/bin/env node
/* Builds a single-page bundle (dist/artifact) for hosting where the page body is wrapped by the host:
 * the page file holds title, links and body content; scripts, styles and fonts are copied alongside. */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist', 'artifact');
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const head = html.match(/<head>([\s\S]*)<\/head>/)[1].replace(/<meta charset[^>]*>\s*/, '').replace(/<meta name="viewport"[^>]*>\s*/, '');
const body = html.match(/<body>([\s\S]*)<\/body>/)[1];
fs.writeFileSync(path.join(out, 'index.html'), head.replace('<title>TMUA Logic Lab</title>', '<title>TMUA Logic Lab</title>\n<meta name="claude:viewport-fit-sides" content="cover">') + body);
const copy = (rel) => { const s = path.join(root, rel), d = path.join(out, rel); fs.mkdirSync(path.dirname(d), { recursive: true }); fs.copyFileSync(s, d); };
for (const dir of ['content', 'js', 'css', 'vendor/katex', 'vendor/katex/fonts']) for (const f of fs.readdirSync(path.join(root, dir))) { const rel = path.join(dir, f); if (fs.statSync(path.join(root, rel)).isFile()) copy(rel); }
console.log('Built', out);
