# TMUA Logic Lab

A structured, interactive course in the logic and mathematical reasoning assessed by **TMUA Paper 2**, with active
lessons, a checked question bank, explanatory feedback, spaced review, and three full mock papers.

Built against the official **UAT-UK TMUA Content Specification “For assessment in October 2026 and January 2027”**
(checked 17 November 2026): two 75-minute papers of 20 multiple-choice questions, no calculator, no formula booklet,
no penalty for wrong answers. Paper 2 tests Arg1–Arg4, Prf1–Prf5 and Err1–Err2 using the Section 1 mathematics.
Symbolic logic notation and formal truth tables are **not** required, so they appear here only as optional aids.

## Launch

No build step and no dependencies. From this folder:

```bash
node scripts/serve.mjs        # then open http://localhost:8080/
# or: python3 -m http.server 8080
```

Open it in Safari on an iPad, or any modern browser. (Opening `index.html` directly from disk also works in most
browsers.) To use it on an iPad without a computer, host the folder on any static host (for example GitHub Pages).

## Quick guide

1. **Home** shows one next step: the diagnostic first, then due reviews, then the next lesson.
2. **Diagnostic** (14 questions, no hints, confidence rating) marks lessons as *Recommended*. The route is optional.
3. **Course**: 31 lessons in 7 units plus a maths toolkit, with prerequisites, times and objectives. Each lesson:
   prediction → one idea → example and non-example → worked example (step-by-step or complete) → guided problem →
   independent problems → retrieval check mixing in an earlier lesson. You can *test out* of a unit.
4. **Practice**: filter by unit, lesson, specification code, difficulty, type or status; untimed, timed drill, or
   mixed (interleaved). Wrong answers offer a fresh question on the same idea and return for review a day later.
5. **Review**: SM-2-style flashcards (type or confirm an attempt before the answer shows; Again/Hard/Good/Easy),
   plus earlier mistakes. Cards can be edited, bookmarked and suspended.
6. **Mocks**: 20 questions, 75 minutes, navigation, flags, review screen; no hints or marking until submission.
   The timer survives reloads; accommodated (+25%, +50%, untimed, pausable) attempts are labelled.
   Results give raw marks, per-code breakdown, timing, misconception patterns and next steps (no 1–9 conversion).
7. **Progress** separates independent first attempts, assisted attempts and retries, and shows delayed retention,
   confidence calibration and the evidence behind each lesson’s mastery status.
8. **Write (Apple Pencil)**: the ✎ Write button on every screen turns on a handwriting layer. The pencil writes
   over the page (pressure-sensitive pen in three colours, highlighter, stroke eraser, undo, clear, and “+ Space” for
   blank working room); your finger still scrolls and taps, or switch on “Finger draws”. Each screen, practice
   question and mock question keeps its own ink, saved on the device (IndexedDB, not included in backups). Press Done
   to use the page normally again.
9. **More**: glossary, all worked examples, method and sources (evidence table, coverage map), settings, backup.

Progress is stored **on this device only** (browser localStorage). There is no account or cloud sync.
Use **Settings → Export backup** (file or copyable text) and **Import** to move or protect it.

## Content (actual counts, from `content-report.json`)

| Item | Count |
|---|---|
| Lessons (24 core + 6 maths refreshers + orientation) | 31 |
| Fully worked examples | 48 |
| Practice questions (multiple choice 122, several-statement 15, necessary/sufficient 6, evaluate-each 10, proof ordering 4) | 157 |
| Diagnostic questions (separate pool) | 14 |
| Mock papers × questions (separate pool) | 3 × 20 = 60 |
| Flashcards | 50 |
| Glossary terms | 36 |
| Sources / evidence-table rows | 21 / 16 |

All questions are **original**. No official or commercial questions are reproduced; use the official
[UAT-UK preparation materials](https://esat-tmua.ac.uk/tmua-preparation-materials/) for authentic papers.
Difficulty labels are editorial estimates, not calibrated.

## Specification coverage (lessons / practice questions / mock questions)

| Code | Lessons | Practice | Mock |
|---|---|---|---|
| Arg1 and, or, not, if / only if / iff, converse, contrapositive | 5 | 33 | 11 |
| Arg2 necessary and sufficient | 3 | 14 | 10 |
| Arg3 for all, for some, there exists | 3 | 10 | 6 |
| Arg4 negation | 4 | 17 | 7 |
| Prf1 direct, cases, contradiction, counterexample | 6 | 38 | 11 |
| Prf2 deducing implications | 4 | 15 | 7 |
| Prf3 conjectures from small cases | 1 | 8 | 4 |
| Prf4 ordering proof steps | 1 | 6 | 3 |
| Prf5 sophisticated chains | 3 | 19 | 8 |
| Err1 errors in purported proofs | 3 | 14 | 5 |
| Err2 common invalid deductions | 3 | 23 | 9 |

The full map with official wording and links is in the app under **More → Method and sources**.

## Structure

```
index.html            app shell
css/app.css           design system (light, dark, warm, high-contrast themes; tokens; components)
content/*.js          all course content as structured data with stable IDs (one file per unit)
js/model.js           normalises compact question types (shared with the validator)
js/render.js          the single text + maths renderer (KaTeX, HTML + MathML)
js/player.js          question player and worked-example viewer
js/ink.js             Apple Pencil handwriting layer
js/store.js, srs.js   local storage, export/import, spaced-review scheduler
js/app.js             router, lessons, practice, review, mocks, progress, settings
vendor/katex          KaTeX 0.16.11 (MIT), served locally
scripts/validate.mjs  content validator        scripts/verify-maths.mjs  independent answer re-computation
tests/e2e.cjs         Playwright learner-journey test (writes screenshots to tests/screenshots)
```

### Adding or correcting a question

Add an object to the relevant `content/*.js` file (copy a neighbour). Write text with `r\`...\`` so LaTeX stays
readable; put maths in `$…$` (or `$$…$$` for display) and decisive words in `**…**`. Required fields for practice
questions: `id`, `lesson`, `obj`, `spec`, `diff` (1–4), `type`, `stem`, options/answer/notes (or `parts`, `fwd/bwd`,
`statements`, `steps` for the other types), `key`, `sol`, three `hints`, `mis` tags and `tip`. Then run
`npm run validate` — it fails on unknown references, bad answer indices, missing explanations, KaTeX errors, raw
LaTeX or maths typed as plain text, and mock/practice overlap.

## Checks performed (all passing at the time of writing)

- `node scripts/validate.mjs`: 0 errors. Every one of ~4,750 maths expressions parses in KaTeX; answer indices and
  per-option explanations exist for every option; IDs and references resolve; every objective has ≥ 2 practice
  items and every spec code ≥ 6; mock questions are checked for near-duplicate wording against practice and other
  mocks; theme contrast is computed (text ≥ 4.5:1, UI ≥ 3:1) for all four themes. Remaining warnings are reviewed
  false positives (for example `2^{p/q}`, an index, not a fraction).
- `node scripts/verify-maths.mjs`: 99 answer keys (practice, diagnostic and mock) independently recomputed by brute
  force or direct calculation, all matching; a planted wrong key is detected. Finite searches support, but do not
  prove, universal claims; the written solutions carry the proofs. The remaining items are conceptual logic
  questions that were re-solved by hand.
- `node tests/e2e.cjs`: 94 checks (including pencil ink: pressure strokes, no accidental option selection, undo,
  working space, per-question pages, persistence after reload) — diagnostic → recommendations; lesson flow; hints recorded separately; wrong
  answer → misconception, fresh question, card suggestion, delayed mistake queue; lesson resume after reload;
  flashcard attempt-before-reveal and scheduling; practice filters; mock with no hints, answers/flags surviving a
  reload, review screen, submission, correct scoring, solutions; timer expiry while away; accommodated pause;
  export/import; settings persistence; stacked fractions with MathML `<mfrac>`; no raw LaTeX anywhere; no page-level
  horizontal scroll or clipped options at iPad portrait/landscape, 375 px phone and desktop, at default and 150% text;
  keyboard proof ordering.
- Screenshots in `tests/screenshots/` were inspected (lessons, feedback, dark theme, large text on a phone).

## Limitations

- No learner has used it yet, so no effectiveness claims are made. A small evaluation is suggested: about five
  learners, think-aloud on one lesson and one practice set, then an unseen mixed test and a delayed test a week later,
  comparing accuracy and transfer rather than completion.
- Several research sources could not be opened from the build environment (publisher sites were blocked); they are
  labelled in the app as “abstract/summary checked”, and the official *Notes on Logic and Proof* is linked as further
  reading only. The specification itself was read in full.
- Covers Paper 2 reasoning plus short Section 1 refreshers; it is not a complete Section 1 course.
- Mastery thresholds are app rules, not TMUA standards. Mocks give raw marks only.
- MathML support in screen readers varies by browser. Atkinson Hyperlegible loads from Google Fonts when online;
  otherwise the system font is used.
- Progress is per device; export to back up.
