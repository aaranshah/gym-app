#!/usr/bin/env node
/* Content validator for TMUA Logic Lab.
 * Usage: node scripts/validate.mjs        (exit code 1 on any error)
 * Checks: unique IDs, references, answer/option mappings, required teaching fields, KaTeX parsing of every
 * maths segment (throwOnError), raw LaTeX outside delimiters, slash fractions, pool separation and near-duplicate
 * wording between practice and mocks, coverage of every specification code and objective, counts, theme contrast.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { console };
ctx.window = ctx;
vm.createContext(ctx);
const load = (f) => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
load('vendor/katex/katex.min.js');
const katex = ctx.katex;
const contentFiles = fs.readdirSync(path.join(root, 'content')).filter(f => f.endsWith('.js')).sort();
for (const f of contentFiles) load('content/' + f);
load('js/model.js');
const TLL = ctx.window.TLL;

const errors = [], warnings = [];
const err = (m) => errors.push(m), warn = (m) => warnings.push(m);

/* ---------- maths checking ---------- */
let mathCount = 0;
function checkText(txt, where) {
  if (typeof txt !== 'string') return;
  // split on $$...$$ then $...$
  const re = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g;
  let m, last = 0, outside = '';
  while ((m = re.exec(txt))) {
    outside += txt.slice(last, m.index); last = re.lastIndex;
    const tex = m[1] || m[2];
    mathCount++;
    try { katex.renderToString(tex, { throwOnError: true, strict: 'ignore', displayMode: !!m[1] }); }
    catch (e) { err(`${where}: KaTeX error in "${tex}": ${e.message.split('\n')[0]}`); }
    if (/[A-Za-z0-9)\]}]\s*\/\s*[A-Za-z0-9(\\]/.test(tex)) warn(`${where}: possible slash fraction in maths "${tex}"`);
  }
  outside += txt.slice(last);
  if (outside.includes('$')) err(`${where}: unbalanced $ delimiter`);
  if (/\\(frac|dfrac|sqrt|le|ge|ne|times|pi|theta|Rightarrow|iff|tfrac|left|right|varepsilon|cdots|ldots)\b/.test(outside)) err(`${where}: raw LaTeX outside maths delimiters`);
  if (/\*\*[^*]*$/.test(outside.replace(/\*\*[^*]+\*\*/g, ''))) err(`${where}: unbalanced ** emphasis`);
  if (!/\.(alt|label|labels\[\d\]|from|to)$|\.d\.|rows\[/.test(where)) {
    if (/[\^√²³½]|\b\d+\s?\/\s?[(a-z]|\b[a-z]\s?\/\s?[a-z(]\b/.test(outside.replace(/https?:\S+/g, '').replace(/\b(and|or|true|false|non|example|sum|product|necessary|sufficient|some|there)\/\w+/gi, ''))) err(`${where}: maths typed as plain text (use $…$): "${outside.trim().slice(0, 80)}"`);
  }
}
function walk(obj, where) {
  if (typeof obj === 'string') return checkText(obj, where);
  if (Array.isArray(obj)) return obj.forEach((v, i) => walk(v, `${where}[${i}]`));
  if (obj && typeof obj === 'object') for (const [k, v] of Object.entries(obj)) if (!k.startsWith('_')) walk(v, `${where}.${k}`);
}

/* ---------- ids ---------- */
const ids = new Map();
const reg = (id, kind) => { if (ids.has(id)) err(`Duplicate id ${id} (${kind} and ${ids.get(id)})`); ids.set(id, kind); };
TLL.units.forEach(u => reg(u.id, 'unit'));
TLL.lessons.forEach(l => reg(l.id, 'lesson'));
TLL.worked.forEach(w => reg(w.id, 'worked'));
TLL.questions.forEach(q => reg(q.id, 'question'));
TLL.diagnostic.forEach(q => reg(q.id, 'diagnostic'));
TLL.mocks.forEach(m => { reg(m.id, 'mock'); m.questions.forEach(q => reg(q.id, 'mock question')); });
TLL.cards.forEach(c => reg(c.id, 'card'));
TLL.sources.forEach(s => reg(s.id, 'source'));

const lessonIds = new Set(TLL.lessons.map(l => l.id));
const objIds = new Set(TLL.lessons.flatMap(l => l.objectives.map(o => o.id)));
const specCodes = Object.keys(TLL.SPEC);
const misTags = new Set(Object.keys(TLL.misconceptions));
const workedIds = new Set(TLL.worked.map(w => w.id));
const sourceIds = new Set(TLL.sources.map(s => s.id));
const cardIds = new Set(TLL.cards.map(c => c.id));

/* ---------- lessons ---------- */
TLL.lessons.forEach(l => {
  if (!TLL.units.find(u => u.id === l.unit)) err(`${l.id}: unknown unit ${l.unit}`);
  (l.prereq || []).forEach(p => { if (!lessonIds.has(p)) err(`${l.id}: unknown prereq ${p}`); });
  (l.refs || []).forEach(s => { if (!sourceIds.has(s)) err(`${l.id}: unknown source ${s}`); });
  (l.spec || []).forEach(s => { if (!specCodes.includes(s)) err(`${l.id}: unknown spec code ${s}`); });
  if (!l.mins || !l.objectives?.length) err(`${l.id}: missing time or objectives`);
  l.steps.forEach((s, i) => {
    if (s.k === 'worked' && !workedIds.has(s.id)) err(`${l.id} step ${i}: unknown worked example ${s.id}`);
    if (s.k === 'practice') s.ids.forEach(id => { const q = TLL.questions.find(x => x.id === id); if (!q) err(`${l.id}: practice ref ${id} missing`); else if (q.lesson !== l.id) err(`${l.id}: practice ref ${id} belongs to ${q.lesson}`); });
    if (s.k === 'predict' || (s.k === 'guided')) {
      const qs = s.k === 'predict' ? [s] : s.parts.filter(p => p.ask).map(p => p.ask);
      qs.forEach(q => { if (!(q.answer >= 0 && q.answer < q.options.length)) err(`${l.id} step ${i}: answer out of range`); if (q.notes.length !== q.options.length) err(`${l.id} step ${i}: notes/options length mismatch`); });
    }
  });
  walk(l, l.id);
});
TLL.worked.forEach(w => { if (!lessonIds.has(w.lesson)) err(`${w.id}: unknown lesson`); if (!w.steps?.length || !w.takeaway) err(`${w.id}: incomplete`); walk(w, w.id); });

/* ---------- questions ---------- */
function checkQuestion(q0, pool) {
  const q = TLL.model.normalise(q0);
  const w = `${q.id}`;
  if (!lessonIds.has(q.lesson)) err(`${w}: unknown lesson ${q.lesson}`);
  (q.spec || []).forEach(s => { if (!specCodes.includes(s)) err(`${w}: unknown spec ${s}`); });
  (q.mis || []).forEach(t => { if (!misTags.has(t)) err(`${w}: unknown misconception tag ${t}`); });
  (q.pre || []).forEach(p => { if (!lessonIds.has(p)) err(`${w}: unknown prerequisite ${p}`); });
  if (![1, 2, 3, 4].includes(q.diff)) err(`${w}: difficulty must be 1–4`);
  if (!q.stem) err(`${w}: no stem`);
  if (!q.sol || !q.key) err(`${w}: needs solution and decisive observation`);
  if (pool === 'practice') {
    if (!objIds.has(q.obj)) err(`${w}: unknown objective ${q.obj}`);
    if (!Array.isArray(q.hints) || q.hints.length !== 3 || q.hints.some(h => !h)) err(`${w}: needs exactly 3 non-empty hints`);
    if (!q.tip) err(`${w}: needs a "next time" tip`);
  }
  if (['mcq', 'roman', 'ns'].includes(q.type)) {
    if (!(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length)) err(`${w}: answer index invalid (${q.answer})`);
    if (!q.notes || q.notes.length !== q.options.length || q.notes.some(n => !n)) err(`${w}: every option needs an explanation`);
    const norm = q.options.map(o => o.replace(/\s+/g, ' ').trim());
    if (new Set(norm).size !== norm.length) err(`${w}: duplicate option text`);
    if (q.type === 'mcq' && q.notes[q.answer] && !/^Correct/.test(q.notes[q.answer])) warn(`${w}: note for correct option does not start with "Correct"`);
    q.notes.forEach((n, i) => { if (i !== q.answer && /^Correct\b/.test(n)) err(`${w}: wrong option ${i} explained as "Correct"`); });
  } else if (q.type === 'tfset') {
    if (!q.statements?.length || q.statements.some(s => typeof s.t !== 'boolean' || !s.why)) err(`${w}: tfset statements need truth and reason`);
  } else if (q.type === 'order') {
    if (!q.steps || q.steps.length < 3) err(`${w}: order needs ≥3 steps`);
  } else err(`${w}: unknown type ${q.type}`);
  if (q.type === 'roman' && q.answer < 0) err(`${w}: roman truth set does not match an option`);
  walk(q0, w);
}
TLL.questions.forEach(q => checkQuestion(q, 'practice'));
TLL.diagnostic.forEach(q => checkQuestion(q, 'diagnostic'));
TLL.mocks.forEach(m => { if (m.questions.length !== 20) err(`${m.id}: has ${m.questions.length} questions, expected 20`); m.questions.forEach(q => checkQuestion(q, 'mock')); });
TLL.cards.forEach(c => { if (!lessonIds.has(c.lesson)) err(`${c.id}: unknown lesson`); walk(c, c.id); });
Object.entries(TLL.misconceptions).forEach(([k, v]) => walk(v.text, 'misconception ' + k));
Object.entries(TLL.misconceptions).forEach(([k, v]) => v.cards.forEach(c => { if (!cardIds.has(c)) err(`misconception ${k}: unknown card ${c}`); }));
TLL.glossary.forEach(g => { g.see.forEach(s => { if (!lessonIds.has(s)) err(`glossary ${g.term}: unknown lesson ${s}`); }); walk(g, 'glossary ' + g.term); });
TLL.evidence.forEach((e, i) => e.sources.forEach(s => { if (!sourceIds.has(s)) err(`evidence ${i}: unknown source ${s}`); }));

/* ---------- pool separation & near duplicates ---------- */
const STOP = new Set(['which', 'following', 'statements', 'statement', 'true', 'false', 'must', 'the', 'and', 'for', 'all', 'real', 'that', 'are', 'with', 'then', 'only', 'none', 'them', 'this', 'there', 'every', 'integer', 'integers', 'number', 'numbers', 'positive', 'correct']);
const tokens = (s) => new Set(s.toLowerCase().replace(/\$[^$]*\$/g, m => m.replace(/\s+/g, '')).split(/[^a-z0-9\\^{}+\-=<>]+/).filter(t => t.length > 2 && !STOP.has(t)));
const qText = (q) => q.stem + ' ' + (q.type === 'roman' ? q.parts.map(p => p.s).join(' ') : q.type === 'ns' ? '' : q.type === 'tfset' ? q.statements.map(x => x.s).join(' ') : q.type === 'order' ? q.steps.join(' ') : (q.options || []).join(' '));
const jacc = (a, b) => { let i = 0; a.forEach(t => { if (b.has(t)) i++; }); return i / (a.size + b.size - i || 1); };
const practiceT = TLL.questions.map(q => [q.id, tokens(qText(q))]);
const allMock = TLL.mocks.flatMap(m => m.questions);
allMock.forEach(mq => {
  const t = tokens(qText(mq));
  practiceT.forEach(([id, pt]) => { const j = jacc(t, pt); if (j > 0.55) err(`Mock ${mq.id} too similar to practice ${id} (Jaccard ${j.toFixed(2)})`); else if (j > 0.42) warn(`Mock ${mq.id} somewhat similar to practice ${id} (${j.toFixed(2)})`); });
});
for (let i = 0; i < allMock.length; i++) for (let j = i + 1; j < allMock.length; j++) {
  const a = allMock[i], b = allMock[j];
  if (a.pool === b.pool) continue;
  const s = jacc(tokens(qText(a)), tokens(qText(b))); if (s > 0.55) err(`Mocks overlap: ${a.id} vs ${b.id} (${s.toFixed(2)})`);
}

/* ---------- coverage ---------- */
const cover = {}; specCodes.forEach(c => cover[c] = { lessons: 0, practice: 0, mock: 0 });
TLL.lessons.forEach(l => (l.spec || []).forEach(c => cover[c].lessons++));
TLL.questions.forEach(q => (q.spec || []).forEach(c => cover[c].practice++));
allMock.forEach(q => (q.spec || []).forEach(c => cover[c].mock++));
specCodes.forEach(c => { const v = cover[c]; if (!v.lessons || v.practice < 6 || !v.mock) err(`Spec ${c} under-covered: ${JSON.stringify(v)}`); });
TLL.lessons.forEach(l => l.objectives.forEach(o => {
  if (l.id === 'L0-1') return;
  const n = TLL.questions.filter(q => q.obj === o.id).length;
  if (n < 2) err(`Objective ${o.id} (${l.id}) has only ${n} practice question(s)`);
}));

/* ---------- answer balance ---------- */
TLL.mocks.forEach(m => {
  const counts = {};
  m.questions.forEach(q0 => { const q = TLL.model.normalise(q0); const L = 'ABCDEFGH'[q.answer]; counts[L] = (counts[L] || 0) + 1; });
  const max = Math.max(...Object.values(counts));
  if (max > 7) warn(`${m.id}: answer letter distribution uneven ${JSON.stringify(counts)}`);
  console.log(`${m.id} answer letters: ${JSON.stringify(counts)}`);
});

/* ---------- theme contrast ---------- */
const cssPath = path.join(root, 'css/app.css');
const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';
function themeBlock(sel) { const i = css.indexOf(sel); if (i < 0) return null; const s = css.indexOf('{', i), e = css.indexOf('}', s); return css.slice(s + 1, e); }
const lum = (hex) => { const c = hex.replace('#', ''); const v = [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16) / 255).map(x => x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const themes = { light: ':root {', dark: '/*theme-dark*/', contrast: '/*theme-contrast*/', sepia: '/*theme-sepia*/' };
for (const [name, marker] of Object.entries(themes)) {
  const block = themeBlock(marker); if (!block) { warn(`theme ${name} not found for contrast check`); continue; }
  const tok = {}; block.replace(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g, (_, k, v) => { tok[k] = v; });
  const pairs = [['ink', 'bg', 4.5], ['ink-soft', 'bg', 4.5], ['ink', 'surface', 4.5], ['ink-soft', 'surface', 4.5], ['accent', 'bg', 4.5], ['accent', 'surface', 4.5], ['on-accent', 'accent', 4.5],
    ['ok', 'ok-bg', 4.5], ['bad', 'bad-bg', 4.5], ['hint', 'hint-bg', 4.5], ['line-strong', 'bg', 3], ['line-strong', 'surface', 3], ['focus', 'bg', 3]];
  pairs.forEach(([a, b, min]) => { if (!tok[a] || !tok[b]) { warn(`theme ${name}: token ${a} or ${b} missing`); return; } const r = ratio(tok[a], tok[b]); if (r < min) err(`theme ${name}: contrast ${a}/${b} = ${r.toFixed(2)} < ${min}`); });
}

/* ---------- report ---------- */
const counts = {
  units: TLL.units.length, lessons: TLL.lessons.length, workedExamples: TLL.worked.length,
  practiceQuestions: TLL.questions.length, diagnosticQuestions: TLL.diagnostic.length,
  mockPapers: TLL.mocks.length, mockQuestions: allMock.length, flashcards: TLL.cards.length,
  glossary: TLL.glossary.length, sources: TLL.sources.length, evidenceRows: TLL.evidence.length, mathExpressions: mathCount
};
console.log('Counts:', JSON.stringify(counts));
console.log('Spec coverage (lessons / practice / mock):');
specCodes.forEach(c => console.log(`  ${c}: ${cover[c].lessons} / ${cover[c].practice} / ${cover[c].mock}`));
const byType = {}; TLL.questions.forEach(q => byType[q.type] = (byType[q.type] || 0) + 1); console.log('Practice by type:', JSON.stringify(byType));
const byDiff = {}; TLL.questions.forEach(q => byDiff[q.diff] = (byDiff[q.diff] || 0) + 1); console.log('Practice by difficulty:', JSON.stringify(byDiff));
if (counts.practiceQuestions < 150) err(`Need ≥150 practice questions (have ${counts.practiceQuestions})`);
if (counts.workedExamples < 30) err(`Need ≥30 worked examples`);
if (counts.flashcards < 40 || counts.flashcards > 60) err(`Flashcards should number 40–60`);
warnings.forEach(w => console.log('WARN', w));
errors.forEach(e => console.log('ERROR', e));
console.log(`${errors.length} error(s), ${warnings.length} warning(s).`);
fs.writeFileSync(path.join(root, 'content-report.json'), JSON.stringify({ counts, coverage: cover, byType, byDiff, errors, warnings }, null, 2));
process.exit(errors.length ? 1 : 0);
