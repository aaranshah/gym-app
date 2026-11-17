/* Sources, verification status and the evidence table.
 * check: how the source was consulted during the build (17 November 2026).
 *   'read'     – the document itself was read.
 *   'extract'  – publisher/abstract/repository records and search extracts were read; full text was not accessible
 *                from the build environment (network policy blocked the publisher host).
 *   'link'     – official resource linked for learners; not accessible from the build environment, so nothing in the
 *                course relies on its specific wording.
 */
(function () {
  const S = (o) => TLL.sources.push(o);
  const CHECKED = '17 November 2026';

  S({ id: 'spec2026', kind: 'official', check: 'read', checked: CHECKED,
    cite: 'UAT-UK (2026). Test of Mathematics for University Admission (TMUA): Content Specification. For assessment in October 2026 and January 2027.',
    url: 'https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/03165619/TMUA_Content_Specification.pdf',
    note: 'Read in full. Source of the paper structure (two 75-minute papers, 20 multiple-choice questions each, no calculator, no penalty, no formula booklet), Section 1 content and the Arg1–Arg4, Prf1–Prf5, Err1–Err2 wording, including the note that symbolic notation and formal truth tables are not expected.' });
  S({ id: 'uatTest', kind: 'official', check: 'extract', checked: CHECKED,
    cite: 'UAT-UK. TMUA test overview and Test Results pages.',
    url: 'https://esat-tmua.ac.uk/about-the-tests/tmua-test/',
    note: 'Site blocked from the build environment; indexed extracts confirmed the format, no penalty, and a reported score scale of 1.0–9.0. Extracts from two UAT-UK pages gave different anchor percentiles for the scale, so this app does not convert marks to that scale.' });
  S({ id: 'uatPrep', kind: 'official', check: 'link', checked: CHECKED,
    cite: 'UAT-UK. TMUA preparation materials (past papers, specimen papers, worked answers).',
    url: 'https://esat-tmua.ac.uk/tmua-preparation-materials/',
    note: 'Use these for authentic practice. This course does not reproduce official questions.' });
  S({ id: 'notesLogic', kind: 'official', check: 'link', checked: CHECKED,
    cite: 'Cambridge Assessment Admissions Testing (2021). TMUA Notes on Logic and Proof.',
    url: 'https://esat-tmua.ac.uk/tmua-preparation-materials/',
    note: 'Official further reading on Paper 2 logic. Not accessible from the build environment; lessons were written from the specification and standard mathematics.' });
  S({ id: 'notesMaths', kind: 'official', check: 'link', checked: CHECKED,
    cite: 'UAT-UK. TMUA Notes on Mathematics (preparation materials).',
    url: 'https://esat-tmua.ac.uk/tmua-preparation-materials/',
    note: 'Official further reading for Section 1 content. Not accessible from the build environment.' });

  S({ id: 'ies2007', kind: 'research', check: 'extract', checked: CHECKED,
    cite: 'Pashler, H., Bain, P., Bottge, B., Graesser, A., Koedinger, K., McDaniel, M., & Metcalfe, J. (2007). Organizing Instruction and Study to Improve Student Learning (NCER 2007-2004). Institute of Education Sciences, US Department of Education.',
    url: 'https://ies.ed.gov/ncee/wwc/PracticeGuide/1',
    note: 'Seven recommendations, each with a level-of-evidence rating. Extracts confirmed “strong” ratings for quizzing to promote learning and for prompting deep-level questions, and a “moderate” rating for interleaving worked examples with problem solving. Other ratings were not verified here.' });
  S({ id: 'karpicke2008', kind: 'research', check: 'extract', checked: CHECKED,
    cite: 'Karpicke, J. D., & Roediger, H. L. (2008). The critical importance of retrieval for learning. Science, 319(5865), 966–968.',
    url: 'https://doi.org/10.1126/science.1152408',
    note: 'Undergraduates learning Swahili–English word pairs: after items could be recalled, repeated retrieval produced large gains in recall a week later, whereas repeated studying did not. Students’ predictions of their performance did not track actual recall.' });
  S({ id: 'dunlosky2013', kind: 'research', check: 'extract', checked: CHECKED,
    cite: 'Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students’ learning with effective learning techniques. Psychological Science in the Public Interest, 14(1), 4–58.',
    url: 'https://doi.org/10.1177/1529100612453266',
    note: 'Review rating ten techniques: practice testing and distributed practice “high” utility; interleaved practice, self-explanation and elaborative interrogation “moderate”; highlighting and rereading “low”.' });
  S({ id: 'cepeda2006', kind: 'research', check: 'extract', checked: CHECKED,
    cite: 'Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. Psychological Bulletin, 132(3), 354–380.',
    url: 'https://doi.org/10.1037/0033-2909.132.3.354',
    note: 'Meta-analysis (839 assessments, 317 experiments): spaced study beats massed study, and the best gap between sessions grows with how long the material must be retained.' });
  S({ id: 'rohrer2007', kind: 'research', check: 'extract', checked: CHECKED,
    cite: 'Rohrer, D., & Taylor, K. (2007). The shuffling of mathematics problems improves learning. Instructional Science, 35, 481–498.',
    url: 'https://doi.org/10.1007/s11251-007-9015-8',
    note: 'Mixed (shuffled) practice of mathematics problems produced better delayed test performance than blocked practice, attributed partly to learning which method fits which problem.' });
  S({ id: 'sweller2019', kind: 'research', check: 'extract', checked: CHECKED,
    cite: 'Sweller, J., van Merriënboer, J. J. G., & Paas, F. (2019). Cognitive architecture and instructional design: 20 years later. Educational Psychology Review, 31, 261–292.',
    url: 'https://doi.org/10.1007/s10648-019-09465-5',
    note: 'Review of cognitive load theory, including the worked-example and split-attention effects and expertise reversal. Only the abstract and indexing were checked here.' });
  S({ id: 'renkl2003', kind: 'research', check: 'extract', checked: CHECKED,
    cite: 'Renkl, A., & Atkinson, R. K. (2003). Structuring the transition from example study to problem solving in cognitive skills acquisition: A cognitive load perspective. Educational Psychologist, 38(1), 15–22.',
    url: 'https://doi.org/10.1207/S15326985EP3801_3',
    note: 'Proposes fading worked-out steps until learners solve problems alone. Related experiments found reliable near-transfer benefits of fading, less reliable far-transfer benefits.' });
  S({ id: 'chi1989', kind: 'research', check: 'extract', checked: CHECKED,
    cite: 'Chi, M. T. H., Bassok, M., Lewis, M. W., Reimann, P., & Glaser, R. (1989). Self-explanations: How students study and use examples in learning to solve problems. Cognitive Science, 13(2), 145–182.',
    url: 'https://doi.org/10.1207/s15516709cog1302_1',
    note: 'Small think-aloud study in physics: stronger students generated more self-explanations of worked examples. Correlational; later experimental work (for example Bisra et al., 2018) supports prompting self-explanation.' });
  S({ id: 'bisra2018', kind: 'research', check: 'extract', checked: CHECKED,
    cite: 'Bisra, K., Liu, Q., Nesbit, J. C., Salimi, F., & Winne, P. H. (2018). Inducing self-explanation: A meta-analysis. Educational Psychology Review, 30, 703–725.',
    url: 'https://doi.org/10.1007/s10648-018-9434-x',
    note: 'Meta-analysis reporting benefits from prompting learners to self-explain. Exact study counts and effect sizes were not verified here.' });
  S({ id: 'mayer2014', kind: 'research', check: 'extract', checked: CHECKED,
    cite: 'Mayer, R. E., & Fiorella, L. (2014). Principles for reducing extraneous processing in multimedia learning: Coherence, signaling, redundancy, spatial contiguity, and temporal contiguity principles. In R. E. Mayer (Ed.), The Cambridge Handbook of Multimedia Learning (2nd ed.). Cambridge University Press.',
    url: 'https://www.cambridge.org/core/books/cambridge-handbook-of-multimedia-learning/',
    note: 'Summarises experiments supporting coherence (remove extraneous material), signalling (highlight essential material) and spatial contiguity (place words next to the graphics they describe). Effect sizes reported in secondary summaries were not checked against the chapter.' });
  S({ id: 'hattie2007', kind: 'research', check: 'extract', checked: CHECKED,
    cite: 'Hattie, J., & Timperley, H. (2007). The power of feedback. Review of Educational Research, 77(1), 81–112.',
    url: 'https://doi.org/10.3102/003465430298487',
    note: 'Feedback framed by three questions (where am I going, how am I going, where to next) at task, process, self-regulation and self levels; feedback about the self (praise) is the least useful for learning.' });
  S({ id: 'shute2008', kind: 'research', check: 'extract', checked: CHECKED,
    cite: 'Shute, V. J. (2008). Focus on formative feedback. Review of Educational Research, 78(1), 153–189.',
    url: 'https://doi.org/10.3102/0034654307313795',
    note: 'Review of formative feedback with guidelines such as focusing feedback on the task rather than the learner; notes that findings on feedback are often mixed.' });
  S({ id: 'pashler2008', kind: 'research', check: 'extract', checked: CHECKED,
    cite: 'Pashler, H., McDaniel, M., Rohrer, D., & Bjork, R. (2008). Learning styles: Concepts and evidence. Psychological Science in the Public Interest, 9(3), 105–119.',
    url: 'https://doi.org/10.1111/j.1539-6053.2009.01038.x',
    note: 'Found no adequate evidence base for matching instruction to “learning styles”. This app therefore does not offer style-based modes.' });
  S({ id: 'w3cwcag22', kind: 'accessibility', check: 'read', checked: CHECKED,
    cite: 'W3C (2023). Web Content Accessibility Guidelines (WCAG) 2.2. W3C Recommendation.',
    url: 'https://www.w3.org/TR/WCAG22/',
    note: 'Success-criterion text read from the W3C’s own source repository (github.com/w3c/wcag): 1.4.1, 1.4.3, 1.4.4, 1.4.8 (AAA), 1.4.10, 1.4.11, 1.4.12, 2.1.1, 2.2.1, 2.3.3 (AAA), 2.4.7, 2.4.11, 2.5.7, 2.5.8.' });
  S({ id: 'katex', kind: 'technical', check: 'read', checked: CHECKED,
    cite: 'KaTeX documentation: Options (output: html, mathml, htmlAndMathml).',
    url: 'https://katex.org/docs/options',
    note: 'Read from the KaTeX source repository. The default output “htmlAndMathml” renders visual HTML plus MathML for assistive technology; this app uses it.' });
  S({ id: 'sm2', kind: 'technical', check: 'extract', checked: CHECKED,
    cite: 'Woźniak, P. (1990). SuperMemo SM-2 algorithm (as published by SuperMemo World).',
    url: 'https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method',
    note: 'Initial ease 2.5; first intervals 1 and 6 days; later intervals multiply by ease; ease updated from a 0–5 recall grade with a floor of 1.3; failed recall restarts the interval. The app uses a simplified variant (see Method).' });

  const E = (o) => TLL.evidence.push(o);
  E({ decision: 'Retrieval practice throughout: prediction questions, practice without notes, retrieval checks and flashcards that require an answer before revealing.',
    type: 'Research finding', sources: ['karpicke2008', 'dunlosky2013', 'ies2007'], strength: 'Strong for retrieval practice in general (many experiments; IES rating “strong” for quizzing).',
    limits: 'Karpicke and Roediger used word pairs; transfer to TMUA reasoning is plausible but not directly tested. Recall of a rule is not evidence of reasoning skill, so flashcards never count towards mastery.',
    impl: 'Every lesson starts with a prediction and ends with a retrieval check; flashcards hide the answer until you type or confirm an attempt.' });
  E({ decision: 'Spaced review: scheduled flashcards and delayed re-tests of mistakes; mastery requires a correct answer at least a day after first learning.',
    type: 'Research finding', sources: ['cepeda2006', 'dunlosky2013'], strength: 'Strong for spacing in general (large meta-analysis).',
    limits: 'Mostly verbal-recall studies; optimal gaps depend on the retention interval and are not known for TMUA. The intervals used here are reasonable defaults, not optimal values.',
    impl: 'SM-2-style scheduler with saved due dates; mistakes return after one day in a different form when available; the delayed-check criterion is configurable.' });
  E({ decision: 'Interleaved (mixed) practice after initial blocked learning, and mixed mocks.',
    type: 'Research finding', sources: ['rohrer2007', 'dunlosky2013'], strength: 'Moderate (rated moderate utility; good evidence in mathematics problem sets).',
    limits: 'Interleaving is usually harder during practice and can feel less productive; benefits appear on delayed tests.',
    impl: 'Each lesson’s retrieval check mixes in an earlier lesson; Practice offers a “mixed” mode; mocks mix all topics.' });
  E({ decision: 'Worked examples before independent problems, with fading (guided problem with some steps left to you) and both step-by-step and complete-solution views.',
    type: 'Research finding', sources: ['sweller2019', 'renkl2003', 'ies2007'], strength: 'Moderate to strong for novices (worked-example effect; IES “moderate”).',
    limits: 'Expertise reversal: worked examples help less as expertise grows, so learners can skip ahead or test out.',
    impl: 'Lesson sequence: idea → example/non-example → worked example → guided problem → independent problems. Test-out per unit.' });
  E({ decision: 'Self-explanation prompts: “why does this step follow?” questions inside guided problems and worked-example “why” lines.',
    type: 'Research finding', sources: ['chi1989', 'bisra2018', 'dunlosky2013'], strength: 'Moderate.',
    limits: 'Original study was small and correlational; prompted self-explanation has meta-analytic support but effects vary.',
    impl: 'Guided steps ask you to choose the justification; each worked step shows its reason.' });
  E({ decision: 'Elaborated, task-focused feedback: verdict, decisive observation, full solution, why each distractor fails, possible misconception, and next-time strategy. No praise-only feedback.',
    type: 'Research finding', sources: ['hattie2007', 'shute2008'], strength: 'Moderate; feedback research is heterogeneous.',
    limits: 'Effects depend on content and learner; immediate versus delayed timing findings are mixed. Mocks withhold feedback until submission to match exam conditions.',
    impl: 'Feedback panel after every answer outside exam mode; misconceptions phrased as possibilities (“you may have…”).' });
  E({ decision: 'Signalling and spatial contiguity: decisive words emphasised in teaching text only; diagram labels placed beside the parts they describe; feedback shown directly under the question.',
    type: 'Research finding', sources: ['mayer2014', 'sweller2019'], strength: 'Moderate (multimedia experiments, mostly short lessons).',
    limits: 'Mostly lab studies of short multimedia lessons. Emphasis is removed in exam mode so it cannot act as a clue.',
    impl: 'Selective bold for words like “only”, “all”, “not”; no emphasis in mock questions.' });
  E({ decision: 'No learning-styles personalisation.',
    type: 'Research finding (negative)', sources: ['pashler2008'], strength: 'Strong conclusion that evidence is lacking.',
    limits: 'Absence of evidence for a specific hypothesis.',
    impl: 'Adaptation uses performance evidence (accuracy, hints, delayed retention), not self-reported style.' });
  E({ decision: 'Colour is never the only signal; text contrast at least 4.5:1; UI component contrast at least 3:1; visible focus; targets at least 24 by 24 CSS px (44 px used); no dragging required; content reflows at 320 px; works with 200% text and increased text spacing.',
    type: 'Accessibility requirement', sources: ['w3cwcag22'], strength: 'Normative W3C standard (WCAG 2.2 AA).',
    limits: 'Automated checks cover part of WCAG; a full audit with assistive-technology users has not been done.',
    impl: 'Correct/incorrect use icon + word + colour; contrast verified by script; proof ordering uses Move up/Move down buttons; text size control.' });
  E({ decision: 'Timers: hidden in learning mode; optional in drills; mock timer can be extended (accommodated mode) and accommodated attempts are labelled.',
    type: 'Accessibility requirement + design choice', sources: ['w3cwcag22', 'spec2026'], strength: 'WCAG 2.2.1 Timing Adjustable (Level A); exam timing from the specification.',
    limits: 'A standard timed mock reproduces exam timing, which is an essential time limit for that mode.',
    impl: 'Settings and mock start screen.' });
  E({ decision: 'Reduced motion, no autoplay audio, no streaks or intrusive pop-ups.',
    type: 'Accessibility requirement + design choice', sources: ['w3cwcag22'], strength: 'WCAG 2.3.3 (AAA) for motion from interactions; the rest is a design choice.',
    limits: 'No direct evidence that removing streaks improves learning; chosen to avoid pressure and distraction.',
    impl: 'Respects the system reduced-motion setting plus an in-app switch.' });
  E({ decision: 'Typography: about 18 px body text, line height about 1.6, content column under about 70 characters, left-aligned, generous paragraph spacing; text size and theme controls.',
    type: 'Design choice informed by accessibility guidance', sources: ['w3cwcag22'], strength: 'WCAG 1.4.8 (AAA) suggests line width ≤ 80 characters, line spacing ≥ 1.5 and unjustified text; specific values here are practical starting points.',
    limits: 'No claim that a particular font, colour or size improves memory or TMUA performance.',
    impl: 'Atkinson Hyperlegible typeface with system fallbacks; light, dark and high-contrast themes.' });
  E({ decision: 'Mathematics rendered by KaTeX with HTML + MathML output; display style for fractions; wide expressions scroll locally.',
    type: 'Technical / accessibility choice', sources: ['katex', 'w3cwcag22'], strength: 'Documented library behaviour.',
    limits: 'Screen-reader support for MathML varies by browser and reader.',
    impl: 'All content passes through one renderer; a validation script parses every expression and fails on errors.' });
  E({ decision: 'Accuracy first, then speed: untimed learning by default; timed drills and mocks are optional.',
    type: 'Design choice', sources: ['spec2026'], strength: 'Reasonable design choice; no direct experimental evidence for TMUA.',
    limits: 'Speed matters in the real test; mocks provide practice under time pressure.',
    impl: 'Practice modes: untimed, timed drill, mixed; full mocks.' });
  E({ decision: 'Lessons of about 5–10 minutes.',
    type: 'Design choice', sources: [], strength: 'Design default, not a research-established attention limit.',
    limits: 'Should be evaluated with real learners; harder lessons run longer.',
    impl: 'Each lesson shows an estimated time; content is not cut to fit.' });
  E({ decision: 'Mastery rule: several varied independent first-attempt answers, high accuracy, at least one delayed correct answer, and at least one unfamiliar-context item.',
    type: 'Design choice (app rule)', sources: ['karpicke2008', 'cepeda2006'], strength: 'Grounded in retrieval and spacing research; thresholds are app rules, not TMUA standards.',
    limits: 'Not calibrated against real TMUA outcomes.',
    impl: 'Thresholds configurable in Settings; criteria shown on the Progress page.' });
})();
