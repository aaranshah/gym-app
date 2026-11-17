/* TMUA Logic Lab — application shell, views and learning logic. */
(function (TLL) {
  'use strict';
  const R = TLL.render, P = TLL.player, S = TLL.store;
  const DAY = 86400000, MIN = 60000;
  const LET = 'ABCDEFGH';
  const esc = R.esc, inl = (s, o) => R.inline(s, o), blk = (s, o) => R.block(s, o);
  const $main = () => document.getElementById('main');
  const st = () => S.state;
  const lessonsById = {}; TLL.lessons.forEach(l => { lessonsById[l.id] = l; });
  const qById = {}; TLL.questions.forEach(q => { qById[q.id] = q; });
  TLL.diagnostic.forEach(q => { qById[q.id] = q; });
  TLL.mocks.forEach(m => m.questions.forEach(q => { qById[q.id] = q; }));
  const cardById = {}; TLL.cards.forEach(c => { cardById[c.id] = c; });
  const ORDER = TLL.lessons.filter(l => !l.refresher).map(l => l.id);

  /* ================================================================ settings */
  function applySettings() {
    const s = st().settings, h = document.documentElement;
    h.dataset.size = s.size;
    // Only remove a theme attribute this app set itself, so a host page's own light/dark choice is respected.
    if (s.theme === 'system') { if (h.dataset.tllTheme) { h.removeAttribute('data-theme'); delete h.dataset.tllTheme; } }
    else { h.dataset.theme = s.theme; h.dataset.tllTheme = '1'; }
    h.dataset.leading = s.leading;
    if (s.motion === 'reduce') h.dataset.motion = 'reduce'; else h.removeAttribute('data-motion');
  }

  /* ================================================================ learning model */
  function independentAttempts(lessonId) {
    // first attempt at each question, no hints, solution not shown, not diagnostic/mock pools
    const seen = new Set(), out = [];
    st().attempts.forEach(a => {
      if (a.lesson !== lessonId || seen.has(a.qid) || a.ctx === 'mock' || /^D/.test(a.qid)) return;
      seen.add(a.qid);
      if (!a.hints && !a.solutionShown) out.push(a);
    });
    return out;
  }
  function mastery(lessonId) {
    const cfg = st().settings.mastery;
    const ind = independentAttempts(lessonId);
    const recent = ind.slice(-8);
    const acc = recent.length ? recent.filter(a => a.ok).length / recent.length : 0;
    const firstTs = ind.length ? ind[0].ts : null;
    const delayed = st().attempts.some(a => a.lesson === lessonId && a.ok && !a.hints && !a.solutionShown && firstTs && a.ts - firstTs >= cfg.delayHours * 3600000);
    const transfer = st().attempts.some(a => a.lesson === lessonId && a.ok && !a.hints && !a.solutionShown && ((qById[a.qid] && qById[a.qid].transfer) || a.ctx === 'mixed' || a.ctx === 'mistakes'));
    const crit = {
      items: { ok: ind.length >= cfg.minItems, text: `${ind.length} of ${cfg.minItems} independent first attempts` },
      accuracy: { ok: recent.length >= cfg.minItems && acc * 100 >= cfg.accuracy, text: `${Math.round(acc * 100)}% accuracy on recent independent attempts (target ${cfg.accuracy}%)` },
      delayed: { ok: !cfg.needDelayed || delayed, text: cfg.needDelayed ? (delayed ? 'Correct on a later day ✓' : `Needs a correct answer at least ${cfg.delayHours} hours after first practice`) : 'Delayed check not required' },
      transfer: { ok: !cfg.needTransfer || transfer, text: cfg.needTransfer ? (transfer ? 'Correct in an unfamiliar or mixed context ✓' : 'Needs a correct answer in an unfamiliar or mixed context') : 'Transfer check not required' }
    };
    const secure = Object.values(crit).every(c => c.ok);
    let level = 'none';
    if (secure) level = 'secure'; else if (ind.length >= cfg.minItems) level = 'developing'; else if (ind.length) level = 'learning';
    return { level, crit, n: ind.length, acc };
  }
  function lessonState(id) { return st().lessons[id] || (st().lessons[id] = { revealed: 0, answers: {} }); }
  function isDone(id) { const l = st().lessons[id]; const u = lessonsById[id] && lessonsById[id].unit; return !!(l && l.completedAt) || !!(u && st().testedOut[u]); }
  function statusChip(id) {
    const m = mastery(id), l = st().lessons[id] || {};
    if (m.level === 'secure') return '<span class="chip ok">✓ Secure</span>';
    if (m.level === 'developing') return '<span class="chip accent">Developing</span>';
    if (st().testedOut[lessonsById[id].unit] && !l.completedAt) return '<span class="chip">Tested out</span>';
    if (l.completedAt) return '<span class="chip">Lesson done</span>';
    if (l.revealed) return '<span class="chip">In progress</span>';
    return '<span class="chip">Not started</span>';
  }
  function recommended() { return (st().diagnostic && st().diagnostic.recommended) || []; }
  function nextLesson() {
    const rec = recommended();
    const pick = ORDER.find(id => rec.includes(id) && !isDone(id)) || ORDER.find(id => !isDone(id));
    return pick ? lessonsById[pick] : null;
  }

  /* ================================================================ cards */
  function addCard(id) {
    if (st().cards[id]) { st().cards[id].suspended = false; S.save(); return; }
    st().cards[id] = TLL.srs.fresh(Date.now()); S.save();
  }
  function cardText(c) { const e = st().cardEdits[c.id]; return { front: e && e.front || c.front, back: e && e.back || c.back }; }
  function dueCards(now) { now = now || Date.now(); return Object.entries(st().cards).filter(([, s]) => !s.suspended && s.due <= now).map(([id]) => id).filter(id => cardById[id]); }
  function unlockCards(lessonId) {
    const today = new Date().toDateString();
    const addedToday = Object.values(st().cards).filter(c => new Date(c.added).toDateString() === today).length;
    let room = Math.max(0, st().settings.newCardsPerDay - addedToday);
    TLL.cards.filter(c => c.lesson === lessonId && !st().cards[c.id]).forEach(c => { if (room-- > 0) addCard(c.id); });
  }
  function dueMistakes(now) { now = now || Date.now(); return Object.entries(st().mistakes).filter(([, m]) => !m.resolved && m.due <= now).map(([id]) => id).filter(id => qById[id]); }

  /* ================================================================ question picking */
  function attemptedSet() { return new Set(st().attempts.map(a => a.qid)); }
  function freshFor(lessonId, exclude, misTags) {
    const tried = attemptedSet();
    const pool = TLL.questions.filter(q => !exclude.includes(q.id) && !tried.has(q.id));
    return pool.find(q => q.lesson === lessonId) || pool.find(q => misTags && q.mis && q.mis.some(t => misTags.includes(t)) && q.lesson !== lessonId) || null;
  }
  function retrievalPair(lesson) {
    const tried = attemptedSet();
    const inLesson = new Set(lesson.steps.filter(s => s.k === 'practice').flatMap(s => s.ids));
    const own = TLL.questions.filter(q => q.lesson === lesson.id && !inLesson.has(q.id) && !tried.has(q.id));
    const idx = ORDER.indexOf(lesson.id);
    const earlier = ORDER.slice(0, Math.max(0, idx)).filter(id => id !== 'L0-1' && (isDone(id) || st().lessons[id]));
    let other = null;
    for (const id of earlier.reverse()) { other = TLL.questions.find(q => q.lesson === id && !tried.has(q.id)); if (other) break; }
    const out = [];
    if (own[0]) out.push(own[0]);
    if (other) out.push(other); else if (own[1]) out.push(own[1]);
    return out;
  }

  /* ================================================================ router */
  const routes = [];
  function route(re, fn, nav) { routes.push({ re, fn, nav }); }
  let cleanup = [];
  function onLeave(fn) { cleanup.push(fn); }
  function go(hash) { if (location.hash === '#' + hash) render(); else location.hash = hash; }
  function render() {
    cleanup.forEach(f => { try { f(); } catch (e) { /* ignore */ } }); cleanup = [];
    const h = (location.hash || '#home').slice(1) || 'home';
    let r = routes.find(x => x.re.test(h)) || routes[0];
    const m = h.match(r.re) || [];
    document.querySelectorAll('.nav a').forEach(a => a.setAttribute('aria-current', a.dataset.nav === r.nav ? 'page' : 'false'));
    document.querySelector('.nav').classList.remove('open');
    document.querySelector('.menu-btn').setAttribute('aria-expanded', 'false');
    const main = $main();
    main.innerHTML = '';
    r.fn(main, m);
    updateBadges();
    const h1 = main.querySelector('h1');
    if (h1) { h1.setAttribute('tabindex', '-1'); if (render.moved) h1.focus({ preventScroll: true }); document.title = (h1.dataset.title || h1.textContent).trim() + ' · TMUA Logic Lab'; }
    render.moved = true;
    window.scrollTo(0, 0);
    R.fixScroll(main);
  }
  function updateBadges() {
    const n = dueCards().length + dueMistakes().length;
    const b = document.querySelector('[data-badge="review"]');
    if (b) { b.textContent = n ? String(n) : ''; b.hidden = !n; b.setAttribute('aria-label', n + ' due'); }
  }

  function html(main, s) { main.innerHTML = s; if (TLL.ink) TLL.ink.attach(main, 'screen-' + ((location.hash || '#home').slice(1) || 'home')); return main; }
  const pct = (x) => Math.round(x * 100) + '%';
  const fmtDate = (ts) => new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtTime = (ms) => { const s = Math.max(0, Math.round(ms / 1000)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); };

  /* ================================================================ HOME */
  route(/^home$/, (main) => {
    const s = st();
    const inProgressMock = Object.entries(s.mocks).find(([, m]) => m.status === 'active');
    const due = dueCards().length, mis = dueMistakes().length;
    const nl = nextLesson();
    let action;
    if (inProgressMock) action = { t: 'Resume your mock', d: `${TLL.mocks.find(m => m.id === inProgressMock[0]).title} is in progress. ${inProgressMock[1].mode === 'standard' ? 'The timer kept running while you were away.' : ''}`, href: '#mock-' + inProgressMock[0], b: 'Resume mock' };
    else if (!s.diagnostic) action = { t: 'Start with a short diagnostic', d: '14 questions, about 12–15 minutes, no hints. It checks logic and the maths Paper 2 relies on, then suggests a route. You can skip it.', href: '#diagnostic', b: 'Start the diagnostic', alt: { href: '#lesson-L0-1', t: 'Skip to the first lesson' } };
    else if (due + mis > 0) action = { t: 'Review what is due', d: `${due} flashcard${due === 1 ? '' : 's'} and ${mis} earlier mistake${mis === 1 ? '' : 's'} are ready. Short reviews spread over days help retention.`, href: '#review', b: 'Start review' };
    else if (nl) action = { t: 'Continue the course', d: `Next: ${nl.title} (about ${nl.mins} minutes).`, href: '#lesson-' + nl.id, b: 'Open lesson' };
    else action = { t: 'Mixed practice and mocks', d: 'You have worked through every lesson. Keep skills fresh with mixed practice, then sit a mock under exam conditions.', href: '#practice', b: 'Mixed practice' };
    const done = ORDER.filter(isDone).length, secure = ORDER.filter(id => mastery(id).level === 'secure').length;
    html(main, `<div class="page wide stack-lg">
      <div><p class="eyebrow">TMUA Paper 2 · Mathematical reasoning</p><h1>TMUA Logic Lab</h1>
      <p class="lead">A structured course in the logic and proof skills of Paper 2, with practice that tells you why, spaced review, and full mock papers.</p></div>
      <section class="card next-action stack" aria-labelledby="na"><p class="eyebrow">Your next step</p><h2 id="na">${esc(action.t)}</h2><p>${esc(action.d)}</p>
        <div class="row"><a class="btn btn-primary" href="${action.href}">${esc(action.b)}</a>${action.alt ? `<a class="btn btn-quiet" href="${action.alt.href}">${esc(action.alt.t)}</a>` : ''}</div></section>
      <div class="grid">
        <section class="card stat"><span class="muted small">Lessons completed</span><span class="big">${done} / ${ORDER.length}</span><div class="meter" aria-hidden="true"><span style="width:${done / ORDER.length * 100}%"></span></div></section>
        <section class="card stat"><span class="muted small">Lessons secure (app rule)</span><span class="big">${secure}</span><a href="#progress" class="small">What “secure” means</a></section>
        <section class="card stat"><span class="muted small">Due for review</span><span class="big">${due + mis}</span><a href="#review" class="small">Open review</a></section>
        <section class="card stat"><span class="muted small">Mocks completed</span><span class="big">${s.mockHistory.length} / ${TLL.mocks.length}</span><a href="#mocks" class="small">Mock papers</a></section>
      </div>
      <section class="stack"><h2>Ways in</h2><div class="grid">
        <a class="card" href="#course" style="text-decoration:none;color:inherit"><h3>Course map</h3><p class="muted">${ORDER.length} lessons in 7 units plus a maths toolkit, with prerequisites and estimated times.</p></a>
        <a class="card" href="#practice" style="text-decoration:none;color:inherit"><h3>Practice</h3><p class="muted">Filter by topic, specification code or difficulty; untimed, timed drill or mixed.</p></a>
        <a class="card" href="#review" style="text-decoration:none;color:inherit"><h3>Review</h3><p class="muted">Flashcards on a spaced schedule, and earlier mistakes in a fresh form.</p></a>
        <a class="card" href="#mocks" style="text-decoration:none;color:inherit"><h3>Mock papers</h3><p class="muted">Three original 20-question papers, 75 minutes, with analysis afterwards.</p></a>
      </div></section>
      ${S.available ? '' : '<p class="panel">Saving is unavailable in this browser window (for example a private window), so progress will be lost when you close it. Use Settings → Export to keep a copy.</p>'}
      <p class="small muted">Progress is saved on this device only. Use <a href="#prefs">Settings</a> to export a backup.</p>
    </div>`);
  }, 'home');

  /* ================================================================ COURSE */
  route(/^course$/, (main) => {
    const rec = recommended();
    const units = TLL.units.map(u => {
      const ls = TLL.lessons.filter(l => l.unit === u.id);
      const canTest = u.id !== 'U0' && u.id !== 'U8';
      return `<section class="unit card" aria-labelledby="u-${u.id}">
        <div class="row" style="justify-content:space-between"><div><p class="eyebrow">${u.id === 'U0' ? 'Start' : u.id === 'U8' ? 'Toolkit' : 'Unit ' + u.id.slice(1)}${u.spec ? ' · ' + u.spec.join(', ') : ''}</p><h2 id="u-${u.id}">${esc(u.title)}</h2></div>
        ${canTest ? `<a class="btn btn-small" href="#testout-${u.id}">${st().testedOut[u.id] ? 'Tested out ✓' : 'Test out of this unit'}</a>` : ''}</div>
        <p class="muted">${esc(u.summary)}</p>
        <ol class="lesson-list">${ls.map(l => `<li class="lesson-item ${rec.includes(l.id) && !isDone(l.id) ? 'recommended' : ''}">
          <div><a class="title" href="#lesson-${l.id}">${esc(l.title)}</a>
          <div class="meta">${l.id} · about ${l.mins} min${l.spec.length ? ' · ' + l.spec.join(', ') : ''}${l.prereq.length ? ' · after ' + l.prereq.map(p => esc(lessonsById[p].title)).join('; ') : ''}</div>
          <div class="meta">${l.objectives.map(o => inl(o.text)).join(' ')}</div></div>
          <div class="chips">${rec.includes(l.id) && !isDone(l.id) ? '<span class="chip accent">Recommended</span>' : ''}${statusChip(l.id)}</div></li>`).join('')}</ol></section>`;
    }).join('');
    html(main, `<div class="page wide stack-lg"><div><h1>Course map</h1>
      <p class="lead">The suggested order runs top to bottom. You can open any lesson directly, or test out of a unit.${rec.length ? ' Lessons marked “Recommended” come from your diagnostic.' : ''}</p>
      <p class="small"><a href="#worked">Browse all worked examples</a> · <a href="#diagnostic">${st().diagnostic ? 'Retake' : 'Take'} the diagnostic</a></p></div>${units}
      <p class="small muted">This course covers Paper 2 reasoning (Arg, Prf and Err requirements) and refreshes the maths it relies on. It does not teach all of Section 1, so use the official preparation materials as well.</p></div>`);
  }, 'course');

  /* ================================================================ LESSON */
  route(/^lesson-(.+)$/, (main, m) => {
    const l = lessonsById[m[1]];
    if (!l) return html(main, '<div class="page"><h1>Lesson not found</h1><p><a href="#course">Back to the course map</a></p></div>');
    const ls = lessonState(l.id);
    if (!ls.started) { ls.started = Date.now(); S.save(); }
    const idx = ORDER.indexOf(l.id);
    const unit = TLL.units.find(u => u.id === l.unit);
    const srcs = (l.refs || []).map(id => TLL.sources.find(s => s.id === id)).filter(Boolean);
    html(main, `<div class="page stack-lg">
      <header class="lesson-head"><p class="eyebrow">${esc(unit.title)} · ${l.id} · about ${l.mins} min</p><h1 data-title="${esc(R.text(l.title))}">${inl(l.title)}</h1>
        <div class="chips">${l.spec.map(s => `<span class="chip">${s}</span>`).join('')}${statusChip(l.id)}</div>
        ${l.prereq.length ? `<p class="small muted">Builds on: ${l.prereq.map(p => `<a href="#lesson-${p}">${esc(lessonsById[p].title)}</a>`).join(', ')}</p>` : ''}
        <div class="panel"><p class="small" style="margin-bottom:.3rem"><strong>By the end you should be able to:</strong></p><ul class="small" style="margin:0">${l.objectives.map(o => `<li>${inl(o.text)}</li>`).join('')}</ul>
        <p class="small" style="margin-top:.5rem"><strong>Why it matters in TMUA:</strong> ${inl(l.purpose)}</p></div></header>
      <div class="steps stack-lg"></div>
      <div class="lesson-end"></div>
      ${srcs.length ? `<p class="citations">Built on: ${srcs.map(s => `<a href="#sources">${esc(s.cite.split('(')[0].trim())}${s.check === 'link' ? ' (further reading)' : ''}</a>`).join('; ')}.</p>` : ''}
    </div>`);
    const stepsEl = main.querySelector('.steps');
    let i = 0;
    const kinds = { predict: 'Predict', idea: 'The idea', examples: 'Example and non-example', diagram: 'Picture it', worked: 'Worked example', guided: 'Guided problem', practice: 'On your own', check: 'Retrieval check', summary: 'Summary' };
    function next() {
      if (i >= l.steps.length) return finish();
      const s = l.steps[i], k = i++;
      const wrap = P.el(`<section class="step" aria-label="${kinds[s.k]}"><p class="step-label">${kinds[s.k]}</p></section>`);
      stepsEl.appendChild(wrap);
      const gate = renderStep(s, k, wrap);
      R.fixScroll(wrap);
      if (k >= ls.revealed) { ls.revealed = k + 1; S.save(); }
      if (!gate) next();
    }
    function cont(wrap) {
      const b = P.el('<div class="row" style="margin-top:1rem"><button type="button" class="btn btn-primary">Continue</button></div>');
      b.querySelector('button').addEventListener('click', () => { b.remove(); next(); const last = stepsEl.lastElementChild; if (last) { last.scrollIntoView({ behavior: 'auto', block: 'start' }); const lab = last.querySelector('.step-label'); if (lab) { lab.setAttribute('tabindex', '-1'); lab.focus({ preventScroll: true }); } } });
      wrap.appendChild(b);
    }
    function renderStep(s, k, wrap) {
      const replay = k < ls.revealed - 1; // already passed before: show without gating
      if (s.k === 'idea') { wrap.insertAdjacentHTML('beforeend', `<h2>${esc(s.title)}</h2><div class="prose">${blk(s.body)}</div>`); return false; }
      if (s.k === 'summary') { wrap.insertAdjacentHTML('beforeend', `<div class="takeaway prose">${blk(s.body)}</div>`); return false; }
      if (s.k === 'diagram') {
        wrap.insertAdjacentHTML('beforeend', `<figure class="diagram" role="group" aria-label="${esc(s.alt)}"><div class="diagram-wrap">${TLL.diagram(s.d)}</div><figcaption>${inl(s.caption)} <details style="margin-top:.4rem"><summary>Text description</summary><p>${esc(s.alt)}</p></details></figcaption></figure>`);
        return false;
      }
      if (s.k === 'examples') {
        wrap.insertAdjacentHTML('beforeend', `<div class="ex-pair"><div class="ex yes"><h3>✓ ${esc(s.yes.title)}</h3><div class="prose">${blk(s.yes.body)}</div></div><div class="ex no"><h3>✗ ${esc(s.no.title)}</h3><div class="prose">${blk(s.no.body)}</div></div></div>`);
        return false;
      }
      if (s.k === 'worked') { wrap.appendChild(P.worked(TLL.worked.find(w => w.id === s.id), { expanded: replay })); return false; }
      if (s.k === 'predict') {
        const q = { id: `${l.id}-p${k}`, type: 'mcq', stem: s.stem, options: s.options, answer: s.answer, notes: s.notes };
        const prev = ls.answers[k];
        const qe = P.question(q, { mode: 'inline', onAnswer: (r) => { ls.answers[k] = { choice: r.choice, ok: r.ok }; S.save(); cont(wrap); } });
        wrap.appendChild(qe);
        if (prev != null && replay) autoAnswer(qe, prev.choice);
        return true;
      }
      if (s.k === 'guided') {
        wrap.insertAdjacentHTML('beforeend', `<h2>${esc(s.title)}</h2><div class="prose">${blk(s.problem)}</div><div class="gparts stack"></div>`);
        const gp = wrap.querySelector('.gparts');
        let j = 0;
        const step = () => {
          if (j >= s.parts.length) { cont(wrap); return; }
          const p = s.parts[j], jj = j++;
          if (p.show) { gp.insertAdjacentHTML('beforeend', `<div class="prose">${blk(p.show)}</div>`); step(); return; }
          const key = k + '.' + jj, prev = ls.answers[key];
          const q = { id: `${l.id}-g${key}`, type: 'mcq', stem: p.ask.stem, options: p.ask.options, answer: p.ask.answer, notes: p.ask.notes };
          const qe = P.question(q, { mode: 'inline', onAnswer: (r) => { ls.answers[key] = { choice: r.choice, ok: r.ok }; S.save(); step(); } });
          gp.appendChild(qe);
          if (prev != null && replay) autoAnswer(qe, prev.choice);
          R.fixScroll(gp);
        };
        step();
        return true;
      }
      if (s.k === 'practice' || s.k === 'check') {
        const qs = s.k === 'practice' ? s.ids.map(id => qById[id]) : (ls.checkIds ? ls.checkIds.map(id => qById[id]).filter(Boolean) : retrievalPair(l));
        if (s.k === 'check') { ls.checkIds = qs.map(q => q.id); S.save(); }
        if (!qs.length) { wrap.insertAdjacentHTML('beforeend', '<p class="muted">No unseen questions left for this check. Use Practice for more.</p>'); return false; }
        wrap.insertAdjacentHTML('beforeend', s.k === 'practice' ? '<p class="muted small">No scaffolding now. Use a hint only if you are stuck; hint use is recorded separately from independent success.</p>' :
          `<p class="muted small">One question on this lesson${qs.length > 1 && qs[1].lesson !== l.id ? ' and one from an earlier lesson, mixed in on purpose' : ''}.</p>`);
        let j = 0;
        const done = (ls.answers[k] || {});
        const nextQ = () => {
          if (j >= qs.length) { cont(wrap); return; }
          const q = qs[j++];
          if (done[q.id] && replay) { wrap.insertAdjacentHTML('beforeend', `<p class="small">✓ Answered earlier: <a href="#practice-${q.id}">${esc(q.id)}</a> (${done[q.id].ok ? 'correct' : 'incorrect'}).</p>`); nextQ(); return; }
          const qe = P.question(q, { mode: 'learn', ctx: s.k === 'check' ? 'retrieval' : 'lesson', onAnswer: (r) => {
            done[q.id] = { ok: r.ok }; ls.answers[k] = done; S.save();
            afterAnswer(q, r, nextQ);
          } });
          wrap.appendChild(qe); R.fixScroll(qe);
        };
        nextQ();
        return true;
      }
      return false;
    }
    function autoAnswer(scope, choice) {
      const qEl = scope;
      const inp = qEl && qEl.querySelector(`input[type=radio][value="${choice}"]`);
      if (inp) { inp.checked = true; inp.dispatchEvent(new Event('change', { bubbles: true })); qEl.api.check(false); }
    }
    function finish() {
      const end = main.querySelector('.lesson-end');
      const nl = ORDER[idx + 1] ? lessonsById[ORDER[idx + 1]] : null;
      const done = !!ls.completedAt;
      end.innerHTML = `<section class="card stack"><h2>${done ? 'Lesson complete' : 'Finish the lesson'}</h2>
        <p>${done ? 'You have completed this lesson. Its flashcards are in your review deck.' : 'Mark the lesson complete to add its flashcards to your spaced-review deck. Mastery is judged separately, from varied questions over time.'}</p>
        <div class="row">${done ? '' : '<button type="button" class="btn btn-primary" data-finish>Mark lesson complete</button>'}
        ${nl ? `<a class="btn ${done ? 'btn-primary' : ''}" href="#lesson-${nl.id}">Next: ${esc(nl.title)}</a>` : '<a class="btn" href="#practice">Mixed practice</a>'}
        <a class="btn btn-quiet" href="#practice-lesson-${l.id}">More practice on this lesson</a></div></section>`;
      const b = end.querySelector('[data-finish]');
      if (b) b.addEventListener('click', () => { ls.completedAt = Date.now(); unlockCards(l.id); S.save(); P.toast('Lesson complete. Flashcards added to review.'); finish(); });
    }
    function afterAnswer(q, r, nextQ) {
      const box = r.after;
      const fresh = !r.ok ? freshFor(q.lesson, [q.id], q.mis) : null;
      box.innerHTML = `<div class="row" style="margin-top:.4rem"><button type="button" class="btn btn-primary" data-next>Continue</button>
        ${fresh ? `<button type="button" class="btn" data-fresh>Try a fresh question on this idea</button>` : ''}</div>
        ${!r.ok ? '<p class="small muted" style="margin-top:.4rem">This question will come back in your review in a day or so.</p>' : ''}`;
      box.querySelector('[data-next]').addEventListener('click', () => { box.innerHTML = ''; nextQ(); });
      const fb = box.querySelector('[data-fresh]');
      if (fb) fb.addEventListener('click', () => {
        box.innerHTML = '';
        const qe = P.question(fresh, { mode: 'learn', ctx: 'retry-fresh', onAnswer: (r2) => afterAnswer(fresh, r2, nextQ) });
        box.appendChild(qe); qe.scrollIntoView({ block: 'start' }); R.fixScroll(qe);
      });
    }
    // replay previously revealed steps, then continue gating from where the learner left off
    next();
    // fast-forward through steps revealed in an earlier visit
    let guard = 0;
    while (i < ls.revealed && guard++ < 50) {
      const btn = stepsEl.querySelector('.step:last-child .row > .btn-primary');
      if (btn && btn.textContent === 'Continue') btn.click(); else break;
    }
    if (ls.completedAt || i >= l.steps.length) finish();
  }, 'course');

  /* ================================================================ WORKED LIBRARY */
  route(/^worked(?:-(.+))?$/, (main, m) => {
    if (m[1]) {
      const w = TLL.worked.find(x => x.id === m[1]);
      html(main, `<div class="page stack"><p><a href="#worked">All worked examples</a></p><h1 data-title="${esc(w ? R.text(w.title) : 'Not found')}">${w ? inl(w.title) : 'Not found'}</h1></div>`);
      if (w) { main.querySelector('.page').appendChild(P.worked(w)); main.querySelector('.page').insertAdjacentHTML('beforeend', `<p>From lesson: <a href="#lesson-${w.lesson}">${esc(lessonsById[w.lesson].title)}</a></p>`); }
      return;
    }
    html(main, `<div class="page stack"><h1>Worked examples</h1><p class="lead">${TLL.worked.length} fully worked examples. Each opens with step-by-step reveal and a complete-solution view.</p>
      <ol class="lesson-list">${TLL.worked.map(w => `<li class="lesson-item"><div><a class="title" href="#worked-${w.id}">${inl(w.title)}</a><div class="meta">${w.id} · ${esc(lessonsById[w.lesson].title)}</div></div></li>`).join('')}</ol></div>`);
  }, 'course');

  /* ================================================================ PRACTICE */
  let session = null;
  route(/^practice(?:-(.+))?$/, (main, m) => {
    const arg = m[1] || '';
    if (arg.startsWith('lesson-')) { session = null; return practiceSetup(main, { lesson: arg.slice(7) }); }
    if (arg && qById[arg] && !/^[MD]/.test(arg)) return runSession(main, { queue: [arg], mode: 'untimed', title: 'Single question', ctx: 'practice' });
    if (session && session.active) return runSession(main, session);
    practiceSetup(main, {});
  }, 'practice');

  function practiceSetup(main, pre) {
    const f = Object.assign({ unit: '', lesson: '', spec: '', diff: '', type: '', status: 'all', mode: 'untimed', len: 10 }, pre);
    const opts = (arr, sel) => arr.map(([v, t]) => `<option value="${v}" ${String(sel) === String(v) ? 'selected' : ''}>${esc(t)}</option>`).join('');
    html(main, `<div class="page stack-lg"><div><h1>Practice</h1><p class="lead">${TLL.questions.length} original questions. Choose what to practise, or mix everything you have studied. Mock-paper questions are kept separate.</p></div>
      <form class="card stack" id="pf">
        <div class="fields">
          <div class="field"><label for="f-unit">Unit</label><select id="f-unit">${opts([['', 'All units']].concat(TLL.units.filter(u => u.id !== 'U0').map(u => [u.id, u.title])), f.unit)}</select></div>
          <div class="field"><label for="f-lesson">Lesson</label><select id="f-lesson">${opts([['', 'All lessons']].concat(TLL.lessons.filter(l => l.id !== 'L0-1').map(l => [l.id, l.id + ' ' + l.title])), f.lesson)}</select></div>
          <div class="field"><label for="f-spec">Specification code</label><select id="f-spec">${opts([['', 'Any']].concat(Object.keys(TLL.SPEC).map(c => [c, c])), f.spec)}</select></div>
          <div class="field"><label for="f-diff">Difficulty <span class="help">(editorial estimate)</span></label><select id="f-diff">${opts([['', 'Any'], [1, 'Foundation'], [2, 'Core'], [3, 'Exam standard'], [4, 'Stretch']], f.diff)}</select></div>
          <div class="field"><label for="f-type">Question type</label><select id="f-type">${opts([['', 'Any'], ['mcq', 'Multiple choice'], ['roman', 'Several statements'], ['ns', 'Necessary / sufficient'], ['tfset', 'Evaluate each statement'], ['order', 'Order the proof']], f.type)}</select></div>
          <div class="field"><label for="f-status">Show</label><select id="f-status">${opts([['all', 'All questions'], ['unseen', 'Not yet attempted'], ['wrong', 'Answered incorrectly before'], ['bookmarked', 'Bookmarked']], f.status)}</select></div>
        </div>
        <fieldset class="seg"><legend>Mode</legend>
          ${[['untimed', 'Untimed'], ['drill', 'Timed drill'], ['mixed', 'Mixed (studied topics)']].map(([v, t]) => `<label><input type="radio" name="mode" value="${v}" ${f.mode === v ? 'checked' : ''}> ${t}</label>`).join('')}</fieldset>
        <p class="small muted" style="margin:0">Timed drill shows a small timer against the 3¾-minute paper average (a budget, not a limit). Mixed mode interleaves questions from lessons you have started, ignoring the filters above.</p>
        <div class="field" style="max-width:12rem"><label for="f-len">Questions</label><select id="f-len">${opts([[5, '5'], [10, '10'], [20, '20']], f.len)}</select></div>
        <p class="small" aria-live="polite" data-count></p>
        <div class="row"><button class="btn btn-primary" type="submit">Start practice</button></div>
      </form>
      <section class="card stack"><h2>Earlier mistakes</h2><p class="muted">${Object.values(st().mistakes).filter(x => !x.resolved).length} unresolved. They return on the Review page a day after the mistake, so that success reflects memory rather than recognition.</p><div class="row"><a class="btn" href="#review">Go to review</a></div></section>
    </div>`);
    const form = main.querySelector('#pf');
    const read = () => ({ unit: form.querySelector('#f-unit').value, lesson: form.querySelector('#f-lesson').value, spec: form.querySelector('#f-spec').value, diff: form.querySelector('#f-diff').value, type: form.querySelector('#f-type').value, status: form.querySelector('#f-status').value, mode: form.querySelector('[name=mode]:checked').value, len: +form.querySelector('#f-len').value });
    const pool = (c) => {
      const tried = attemptedSet();
      const wrong = new Set(st().attempts.filter(a => !a.ok).map(a => a.qid));
      if (c.mode === 'mixed') {
        const studied = new Set(Object.keys(st().lessons).filter(id => st().lessons[id].revealed));
        let p = TLL.questions.filter(q => studied.has(q.lesson));
        if (!p.length) p = TLL.questions.slice();
        return p;
      }
      return TLL.questions.filter(q => (!c.unit || lessonsById[q.lesson].unit === c.unit) && (!c.lesson || q.lesson === c.lesson) && (!c.spec || (q.spec || []).includes(c.spec)) && (!c.diff || q.diff === +c.diff) && (!c.type || q.type === c.type) &&
        (c.status === 'all' || (c.status === 'unseen' && !tried.has(q.id)) || (c.status === 'wrong' && wrong.has(q.id)) || (c.status === 'bookmarked' && st().bookmarks[q.id])));
    };
    const upd = () => { const n = pool(read()).length; form.querySelector('[data-count]').textContent = `${n} question${n === 1 ? '' : 's'} match.`; };
    form.addEventListener('change', upd); upd();
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const c = read(); let p = pool(c);
      if (!p.length) { P.toast('No questions match these filters.'); return; }
      const tried = attemptedSet();
      // unseen first, then least recently attempted; mixed mode shuffles across lessons (interleaving)
      const lastTs = {}; st().attempts.forEach(a => { lastTs[a.qid] = a.ts; });
      p = p.slice().sort((a, b) => (tried.has(a.id) - tried.has(b.id)) || ((lastTs[a.id] || 0) - (lastTs[b.id] || 0)));
      let q = p.slice(0, Math.max(c.len * 2, c.len));
      q = shuffle(q).slice(0, c.len);
      if (c.mode !== 'mixed') q.sort((a, b) => TLL.questions.indexOf(a) - TLL.questions.indexOf(b));
      session = { active: true, queue: q.map(x => x.id), pos: 0, results: [], mode: c.mode, ctx: c.mode === 'mixed' ? 'mixed' : (c.mode === 'drill' ? 'drill' : 'practice'), title: c.mode === 'mixed' ? 'Mixed practice' : 'Practice' };
      runSession(main, session);
    });
  }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function runSession(main, s) {
    s.pos = s.pos || 0; s.results = s.results || [];
    if (s.pos >= s.queue.length) return sessionSummary(main, s);
    const q = qById[s.queue[s.pos]];
    html(main, `<div class="page stack"><div class="row" style="justify-content:space-between"><p class="eyebrow" style="margin:0">${esc(s.title)} · question ${s.pos + 1} of ${s.queue.length}</p>
      <button type="button" class="btn btn-quiet btn-small" data-end>End session</button></div>
      <h1 class="sr-only">${esc(s.title)}: question ${s.pos + 1}</h1>
      <p class="small muted">From: <a href="#lesson-${q.lesson}">${esc(lessonsById[q.lesson].title)}</a></p><div data-q></div></div>`);
    if (TLL.ink) TLL.ink.setKey('question-' + q.id);
    main.querySelector('[data-end]').addEventListener('click', () => { s.pos = s.queue.length; runSession(main, s); });
    const qe = P.question(q, { mode: 'learn', ctx: s.ctx, drill: s.mode === 'drill', onAnswer: (r) => {
      s.results.push({ qid: q.id, ok: r.ok, hints: r.hints, gaveUp: r.gaveUp });
      const fresh = !r.ok ? freshFor(q.lesson, s.queue, q.mis) : null;
      r.after.innerHTML = `<div class="row" style="margin-top:.4rem"><button type="button" class="btn btn-primary" data-next>${s.pos + 1 < s.queue.length ? 'Next question' : 'See summary'}</button>
        ${fresh ? '<button type="button" class="btn" data-fresh>Add a fresh question on this idea</button>' : ''}</div>`;
      r.after.querySelector('[data-next]').addEventListener('click', () => { s.pos++; runSession(main, s); });
      const fb = r.after.querySelector('[data-fresh]');
      if (fb) fb.addEventListener('click', () => { s.queue.splice(s.pos + 1, 0, fresh.id); fb.disabled = true; fb.textContent = 'Added as the next question'; });
    } });
    main.querySelector('[data-q]').appendChild(qe);
    R.fixScroll(main);
  }
  function sessionSummary(main, s) {
    const n = s.results.length, ok = s.results.filter(r => r.ok).length, ind = s.results.filter(r => r.ok && !r.hints && !r.gaveUp).length;
    const wrongLessons = [...new Set(s.results.filter(r => !r.ok).map(r => qById[r.qid].lesson))];
    s.active = false;
    html(main, `<div class="page stack-lg"><h1>Session summary</h1>
      <div class="grid"><div class="card stat"><span class="muted small">Correct</span><span class="big">${ok} / ${n}</span></div>
      <div class="card stat"><span class="muted small">Correct without hints</span><span class="big">${ind}</span></div></div>
      ${wrongLessons.length ? `<section class="card"><h2>Worth revisiting</h2><ul>${wrongLessons.map(id => `<li><a href="#lesson-${id}">${esc(lessonsById[id].title)}</a></li>`).join('')}</ul><p class="small muted">Questions you missed will reappear in Review after a day.</p></section>` : ''}
      <div class="row"><a class="btn btn-primary" href="#practice">New practice session</a><a class="btn" href="#progress">View progress</a></div></div>`);
    session = null;
  }

  /* ================================================================ REVIEW (cards + mistakes) */
  route(/^review$/, (main) => {
    const due = dueCards(), mis = dueMistakes();
    const total = Object.keys(st().cards).length;
    const upcoming = Object.values(st().cards).filter(c => !c.suspended && c.due > Date.now()).sort((a, b) => a.due - b.due)[0];
    const unresolved = Object.entries(st().mistakes).filter(([, x]) => !x.resolved);
    const waiting = unresolved.filter(([, x]) => x.due > Date.now()).sort((a, b) => a[1].due - b[1].due)[0];
    html(main, `<div class="page stack-lg"><div><h1>Review</h1><p class="lead">Spaced review of key rules, and earlier mistakes brought back after a delay.</p></div>
      <section class="card stack"><h2>Flashcards</h2>
        <p>${due.length ? `<strong>${due.length}</strong> card${due.length === 1 ? '' : 's'} due now.` : 'No cards due right now.'} ${total} in your deck.${upcoming && !due.length ? ` Next due ${fmtDue(upcoming.due)}.` : ''}</p>
        <p class="small muted">Lessons add their cards when you mark them complete. Cards check that you remember a rule; your mastery is judged only from new problems.</p>
        <div class="row">${due.length ? '<a class="btn btn-primary" href="#cards">Review due cards</a>' : ''}<a class="btn" href="#deck">Browse and edit deck</a></div></section>
      <section class="card stack"><h2>Earlier mistakes</h2>
        <p>${mis.length ? `<strong>${mis.length}</strong> ready for another attempt.` : 'None ready right now.'} ${unresolved.length} unresolved in total.${waiting && !mis.length ? ` Next ready ${fmtDue(waiting[1].due)}.` : ''}</p>
        <p class="small muted">Each mistake comes back after a day. You see the original question again only after trying a fresh question on the same idea when one is available, so that success reflects understanding rather than recognising the wording.</p>
        <div class="row">${mis.length ? '<button type="button" class="btn btn-primary" data-mis>Start mistake review</button>' : ''}</div></section></div>`);
    const b = main.querySelector('[data-mis]');
    if (b) b.addEventListener('click', () => {
      const queue = [];
      mis.slice(0, 10).forEach(id => {
        const q = qById[id];
        const fresh = TLL.questions.find(x => x.lesson === q.lesson && x.id !== id && !attemptedSet().has(x.id) && !queue.includes(x.id));
        if (fresh) queue.push(fresh.id);
        queue.push(id);
      });
      session = { active: true, queue, pos: 0, results: [], mode: 'untimed', ctx: 'mistakes', title: 'Mistake review' };
      go('practice');
    });
  }, 'review');
  function fmtDue(ts) { const d = ts - Date.now(); if (d < 3600000) return 'in ' + Math.max(1, Math.round(d / MIN)) + ' min'; if (d < DAY) return 'in ' + Math.round(d / 3600000) + ' h'; return 'on ' + fmtDate(ts); }

  route(/^cards$/, (main) => {
    const queue = dueCards();
    if (!queue.length) return html(main, '<div class="page stack"><h1>Flashcards</h1><p>No cards are due. <a href="#review">Back to review</a></p></div>');
    let k = 0, reviewed = 0;
    html(main, `<div class="page stack"><div class="row" style="justify-content:space-between"><h1 style="margin:0">Flashcards</h1><span class="muted small" data-left></span></div><div data-card></div></div>`);
    const host = main.querySelector('[data-card]');
    function show() {
      const left = dueCards();
      main.querySelector('[data-left]').textContent = left.length + ' due';
      if (!left.length) { host.innerHTML = `<div class="card stack"><h2>Done for now</h2><p>You reviewed ${reviewed} card${reviewed === 1 ? '' : 's'}. Cards you marked “Again” return in about 10 minutes.</p><div class="row"><a class="btn btn-primary" href="#home">Home</a><a class="btn" href="#deck">Deck</a></div></div>`; return; }
      const id = left[k % left.length]; const c = cardById[id]; const t = cardText(c); const cs = st().cards[id];
      host.innerHTML = `<article class="card flash" aria-labelledby="cf">
        <p class="eyebrow">${c.kind === 'apply' ? 'Apply it' : 'Recall'} · ${esc(lessonsById[c.lesson].title)}</p>
        <div class="front prose" id="cf">${blk(t.front)}</div>
        <div class="field"><label for="attempt">Your answer</label><textarea id="attempt" placeholder="Type your answer, or say it aloud and tick the box below."></textarea></div>
        <label class="check"><input type="checkbox" id="aloud"> I answered in my head or aloud</label>
        <div class="row"><button type="button" class="btn btn-primary" data-reveal disabled>Show answer</button>
          <button type="button" class="btn btn-quiet btn-small" data-bm aria-pressed="${cs.bookmarked ? 'true' : 'false'}">${cs.bookmarked ? 'Bookmarked' : 'Bookmark'}</button>
          <button type="button" class="btn btn-quiet btn-small" data-suspend>Suspend card</button></div>
        <div class="back" hidden></div></article>`;
      const ta = host.querySelector('#attempt'), al = host.querySelector('#aloud'), rv = host.querySelector('[data-reveal]');
      const en = () => { rv.disabled = !(ta.value.trim() || al.checked); };
      ta.addEventListener('input', en); al.addEventListener('change', en);
      ta.focus({ preventScroll: true });
      rv.addEventListener('click', () => {
        const back = host.querySelector('.back'); back.hidden = false; rv.remove();
        const now = Date.now();
        back.innerHTML = `<p class="eyebrow">Answer</p><div class="prose">${blk(t.back)}</div>${c.ex ? `<div class="prose small muted" style="margin-top:.5rem">${blk(c.ex)}</div>` : ''}
          ${ta.value.trim() ? `<p class="small" style="margin-top:.6rem"><strong>You wrote:</strong> ${esc(ta.value.trim())}</p>` : ''}
          <p style="margin-top:1rem"><strong>How well did you recall it?</strong></p>
          <div class="rate">${[['again', 'Again', 'did not recall'], ['hard', 'Hard', 'with effort'], ['good', 'Good', 'recalled'], ['easy', 'Easy', 'instantly']].map(([r, l, d]) =>
            `<button type="button" class="btn" data-rate="${r}">${l}<small>${d} · next ${TLL.srs.label(cs, r, now)}</small></button>`).join('')}</div>`;
        back.querySelector('.rate').addEventListener('click', (e) => {
          const b = e.target.closest('[data-rate]'); if (!b) return;
          st().cards[id] = TLL.srs.next(cs, b.dataset.rate, Date.now());
          st().cardLog.push({ id, ts: Date.now(), rating: b.dataset.rate }); S.save(); reviewed++;
          if (b.dataset.rate !== 'again') k = 0; else k++;
          show(); updateBadges();
        });
        back.querySelector('[data-rate="good"]').focus();
        R.fixScroll(host);
      });
      host.querySelector('[data-bm]').addEventListener('click', (e) => { cs.bookmarked = !cs.bookmarked; S.save(); e.target.setAttribute('aria-pressed', cs.bookmarked); e.target.textContent = cs.bookmarked ? 'Bookmarked' : 'Bookmark'; });
      host.querySelector('[data-suspend]').addEventListener('click', () => { cs.suspended = true; S.save(); P.toast('Card suspended. Restore it from the deck.'); show(); updateBadges(); });
      R.fixScroll(host);
    }
    show();
  }, 'review');

  route(/^deck$/, (main) => {
    const rows = TLL.cards.map(c => {
      const s = st().cards[c.id], t = cardText(c);
      const status = !s ? 'Not in deck' : s.suspended ? 'Suspended' : s.due <= Date.now() ? 'Due now' : 'Due ' + fmtDue(s.due).replace(/^on /, '');
      return `<li class="card stack" data-id="${c.id}" style="gap:.5rem"><div class="row" style="justify-content:space-between"><span class="eyebrow" style="margin:0">${c.id} · ${esc(lessonsById[c.lesson].title)}${st().cardEdits[c.id] ? ' · edited' : ''}</span>
        <span class="chips"><span class="chip ${s && !s.suspended && s.due <= Date.now() ? 'accent' : ''}">${status}</span>${s && s.bookmarked ? '<span class="chip hint">Bookmarked</span>' : ''}</span></div>
        <div class="prose"><strong>Q.</strong> ${inl(t.front)}</div><div class="prose muted"><strong>A.</strong> ${inl(t.back)}</div>
        <div class="row">${!s ? `<button type="button" class="btn btn-small" data-a="add">Add to review</button>` : `<button type="button" class="btn btn-small" data-a="suspend">${s.suspended ? 'Restore' : 'Suspend'}</button><button type="button" class="btn btn-small" data-a="bm">${s.bookmarked ? 'Remove bookmark' : 'Bookmark'}</button>`}
        <button type="button" class="btn btn-small btn-quiet" data-a="edit">Edit</button></div><div data-edit></div></li>`;
    }).join('');
    html(main, `<div class="page stack-lg"><div><h1>Flashcard deck</h1><p class="lead">${TLL.cards.length} cards on rules and distinctions worth remembering. One retrieval task per card. Edit wording to suit you; your edits stay on this device.</p>
      <div class="row"><label class="check" style="padding:0"><input type="checkbox" id="onlyMine"> Only cards in my deck</label></div></div><ol class="stack" style="list-style:none;padding:0;margin:0">${rows}</ol></div>`);
    main.querySelector('#onlyMine').addEventListener('change', (e) => main.querySelectorAll('[data-id]').forEach(li => { li.hidden = e.target.checked && !st().cards[li.dataset.id]; }));
    main.addEventListener('click', (e) => {
      const b = e.target.closest('[data-a]'); if (!b) return;
      const li = b.closest('[data-id]'), id = li.dataset.id, s = st().cards[id];
      if (b.dataset.a === 'add') { addCard(id); render(); }
      else if (b.dataset.a === 'suspend') { s.suspended = !s.suspended; S.save(); render(); }
      else if (b.dataset.a === 'bm') { s.bookmarked = !s.bookmarked; S.save(); render(); }
      else if (b.dataset.a === 'edit') {
        const t = cardText(cardById[id]); const box = li.querySelector('[data-edit]');
        box.innerHTML = `<form class="stack" style="gap:.6rem"><div class="field"><label for="ef-${id}">Front</label><textarea id="ef-${id}">${esc(t.front)}</textarea></div>
          <div class="field"><label for="eb-${id}">Back</label><textarea id="eb-${id}">${esc(t.back)}</textarea><span class="help">Maths goes between $ signs, for example $x^2 \\ge 0$.</span></div>
          <div class="row"><button class="btn btn-primary btn-small" type="submit">Save</button><button class="btn btn-small" type="button" data-reset>Restore original</button></div></form>`;
        box.querySelector('form').addEventListener('submit', (ev) => { ev.preventDefault(); st().cardEdits[id] = { front: box.querySelector('#ef-' + id).value, back: box.querySelector('#eb-' + id).value }; S.save(); render(); });
        box.querySelector('[data-reset]').addEventListener('click', () => { delete st().cardEdits[id]; S.save(); render(); });
        box.querySelector('textarea').focus();
      }
    });
  }, 'review');

  /* ================================================================ DIAGNOSTIC */
  route(/^diagnostic$/, (main) => {
    html(main, `<div class="page stack-lg"><div><h1>Diagnostic</h1><p class="lead">${TLL.diagnostic.length} short questions covering logic and the maths Paper 2 relies on. No hints and no marking until the end. Rate your confidence honestly: a lucky guess should not let you skip a lesson.</p></div>
      <div class="card stack"><ul><li>About 12–15 minutes; untimed.</li><li>Results suggest lessons to prioritise and ones you might test out of.</li><li>The route is a suggestion; you can open any lesson at any time.</li><li>Studying Further Maths does not mean you have met formal logic, so the diagnostic does not assume it.</li></ul>
      <div class="row"><button type="button" class="btn btn-primary" data-go>Begin</button><a class="btn btn-quiet" href="#course">Skip to the course</a></div></div></div>`);
    main.querySelector('[data-go]').addEventListener('click', () => {
      const results = {}; let k = 0;
      const step = () => {
        if (k >= TLL.diagnostic.length) return diagResults(main, results);
        const q = TLL.diagnostic[k];
        html(main, `<div class="page stack"><p class="eyebrow">Diagnostic · question ${k + 1} of ${TLL.diagnostic.length}</p><h1 class="sr-only">Diagnostic question ${k + 1}</h1><div class="meter" aria-hidden="true"><span style="width:${k / TLL.diagnostic.length * 100}%"></span></div><div data-q></div></div>`);
        main.querySelector('[data-q]').appendChild(P.question(q, { mode: 'diagnostic', ctx: 'diagnostic', onAnswer: (r) => { results[q.id] = { ok: r.ok, conf: r.rec.conf, choice: r.choice }; k++; step(); } }));
        R.fixScroll(main);
      };
      step();
    });
  }, 'course');
  function diagResults(main, results) {
    const rec = [], secure = [];
    TLL.diagnostic.forEach(q => { const r = results[q.id]; if (!r.ok || r.conf < 2) rec.push(q.lesson); else secure.push(q.lesson); });
    st().diagnostic = { ts: Date.now(), results, recommended: [...new Set(rec)], secure: [...new Set(secure)] }; S.save();
    const ok = Object.values(results).filter(r => r.ok).length;
    html(main, `<div class="page stack-lg"><h1>Diagnostic results</h1><p class="lead">${ok} of ${TLL.diagnostic.length} correct. This is a starting point, not a grade.</p>
      <section class="card stack"><h2>Suggested priorities</h2>${rec.length ? `<ul>${[...new Set(rec)].map(id => `<li><a href="#lesson-${id}">${esc(lessonsById[id].title)}</a></li>`).join('')}</ul>` : '<p>Nothing stood out. Start at the beginning and move quickly, or test out of units on the course map.</p>'}
      <p class="small muted">Included if the answer was wrong or you were not sure. These are marked “Recommended” on the course map.</p></section>
      ${secure.length ? `<section class="card stack"><h2>Looking secure</h2><ul>${[...new Set(secure)].map(id => `<li>${esc(lessonsById[id].title)}</li>`).join('')}</ul><p class="small muted">One confident correct answer is limited evidence. You may skim these lessons or use “Test out of this unit”.</p></section>` : ''}
      <details><summary>See each question with its solution</summary><div class="stack" data-rev style="margin-top:.6rem"></div></details>
      <div class="row"><a class="btn btn-primary" href="#course">Open the course map</a><a class="btn" href="#home">Home</a></div></div>`);
    const box = main.querySelector('[data-rev]');
    TLL.diagnostic.forEach(q => box.appendChild(P.question(q, { mode: 'review', selected: results[q.id].choice })));
  }

  /* ================================================================ TEST OUT */
  route(/^testout-(U\d)$/, (main, m) => {
    const u = TLL.units.find(x => x.id === m[1]);
    const tried = attemptedSet();
    const ls = TLL.lessons.filter(l => l.unit === u.id).map(l => l.id);
    const qs = shuffle(TLL.questions.filter(q => ls.includes(q.lesson) && q.diff >= 2 && !tried.has(q.id)));
    const pick = []; ls.forEach(id => { const q = qs.find(x => x.lesson === id && !pick.includes(x)); if (q && pick.length < 4) pick.push(q); });
    while (pick.length < 4 && qs.length > pick.length) { const q = qs.find(x => !pick.includes(x)); if (!q) break; pick.push(q); }
    html(main, `<div class="page stack-lg"><div><h1>Test out: ${esc(u.title)}</h1><p class="lead">${pick.length} unseen questions from this unit, without hints. Get all of them right first time and the unit is marked “tested out”: its lessons count as done and its cards join your deck. Mastery still needs later, varied evidence.</p></div><div data-q class="stack-lg"></div></div>`);
    if (pick.length < 3) { main.querySelector('[data-q]').innerHTML = '<p>Not enough unseen questions remain in this unit to test out fairly. Use Practice instead.</p>'; return; }
    let k = 0, allOk = true;
    const host = main.querySelector('[data-q]');
    const step = () => {
      if (k >= pick.length) {
        if (allOk) { st().testedOut[u.id] = Date.now(); ls.forEach(unlockCards); S.save(); }
        host.insertAdjacentHTML('beforeend', `<div class="card stack"><h2>${allOk ? 'Unit tested out' : 'Not this time'}</h2><p>${allOk ? 'All correct. The unit is marked as tested out.' : 'At least one answer was incorrect or assisted. Work through the lessons you found harder, then try again with fresh questions.'}</p><div class="row"><a class="btn btn-primary" href="#course">Course map</a></div></div>`);
        return;
      }
      const q = pick[k++];
      const qe = P.question(q, { mode: 'learn', ctx: 'testout', onAnswer: (r) => { if (!r.ok || r.hints || r.gaveUp) allOk = false; const b = P.el('<div class="row"><button type="button" class="btn btn-primary">Continue</button></div>'); r.after.appendChild(b); b.querySelector('button').addEventListener('click', () => { b.remove(); step(); }); } });
      qe.querySelectorAll('[data-act="hint"], [data-act="giveup"]').forEach(b => b.remove());
      host.appendChild(qe); R.fixScroll(qe);
    };
    step();
  }, 'course');

  /* ================================================================ MOCKS */
  const MOCK_MIN = 75;
  route(/^mocks$/, (main) => {
    html(main, `<div class="page wide stack-lg"><div><h1>Mock papers</h1><p class="lead">Three original papers in the Paper 2 format: 20 multiple-choice questions, 75 minutes, no calculator. Questions here never appear in practice.</p></div>
      <div class="grid">${TLL.mocks.map(mk => {
        const a = st().mocks[mk.id]; const hist = st().mockHistory.filter(h => h.mock === mk.id);
        return `<section class="card stack"><h2>${esc(mk.title)}</h2>
          <p class="muted">${hist.length ? `Last result: ${hist[hist.length - 1].score} / 20 (${esc(hist[hist.length - 1].modeLabel)}), ${fmtDate(hist[hist.length - 1].submittedAt)}` : 'Not attempted yet.'}</p>
          <div class="row">${a && a.status === 'active' ? `<a class="btn btn-primary" href="#mock-${mk.id}">Resume</a>` : `<a class="btn btn-primary" href="#mockstart-${mk.id}">${hist.length ? 'Sit again' : 'Start'}</a>`}
          ${hist.length ? `<a class="btn" href="#mockresult-${mk.id}-${hist.length - 1}">Review results</a>` : ''}</div></section>`;
      }).join('')}</div>
      <section class="card stack"><h2>Exam rules (checked ${esc(TLL.meta.specChecked)})</h2>
        <ul><li>Paper 2 has 20 multiple-choice questions in 75 minutes. Calculators are not allowed and there is no formula booklet.</li><li>There is no penalty for wrong answers, so answer every question.</li>
        <li>75 ÷ 20 = 3¾ minutes per question on average. It is a budget for the paper, not a limit per question.</li>
        <li>Mocks do not give a 1.0–9.0 TMUA score: official scaling depends on the whole cohort and cannot be reproduced from one sitting.</li></ul>
        <p class="small muted">Source: UAT-UK TMUA Content Specification for October 2026 and January 2027 assessments. Check the official site before your test in case anything changes.</p></section></div>`);
  }, 'mocks');

  route(/^mockstart-(M\d)$/, (main, m) => {
    const mk = TLL.mocks.find(x => x.id === m[1]);
    html(main, `<div class="page stack-lg"><div><h1>${esc(mk.title)}</h1><p class="lead">20 questions. Hints and marking are withheld until you submit. You can move between questions, flag them and change answers.</p></div>
      <form class="card stack" id="ms"><fieldset class="seg" style="flex-direction:column;align-items:flex-start"><legend>Timing</legend>
        <label><input type="radio" name="mode" value="standard" checked> Standard: 75 minutes, timer keeps running if you leave</label>
        <label><input type="radio" name="mode" value="extra25"> Accommodated: 25% extra time (93 min 45 s), can pause</label>
        <label><input type="radio" name="mode" value="extra50"> Accommodated: 50% extra time (112 min 30 s), can pause</label>
        <label><input type="radio" name="mode" value="untimed"> Untimed, can pause</label></fieldset>
        <p class="small muted" style="margin:0">Accommodated and untimed attempts are labelled as such in your results, so you can compare like with like.</p>
        <div class="row"><button class="btn btn-primary" type="submit">Start the paper</button><a class="btn btn-quiet" href="#mocks">Back</a></div></form></div>`);
    main.querySelector('#ms').addEventListener('submit', (e) => {
      e.preventDefault();
      const mode = main.querySelector('[name=mode]:checked').value;
      const factor = { standard: 1, extra25: 1.25, extra50: 1.5, untimed: 0 }[mode];
      st().mocks[mk.id] = { status: 'active', mode, limitMs: factor ? Math.round(MOCK_MIN * factor * MIN) : 0, startedAt: Date.now(), pausedTotal: 0, pausedAt: null, answers: {}, flags: {}, timeOn: {}, current: 0, lastSwitch: Date.now() };
      S.saveNow(); go('mock-' + mk.id);
    });
  }, 'mocks');

  function mockRemaining(a, now) {
    if (!a.limitMs) return Infinity;
    const paused = a.pausedTotal + (a.pausedAt ? now - a.pausedAt : 0);
    return a.limitMs - (now - a.startedAt - paused);
  }
  function modeLabel(a) { return { standard: 'Standard timed', extra25: 'Accommodated +25%', extra50: 'Accommodated +50%', untimed: 'Untimed' }[a.mode]; }

  route(/^mock-(M\d)$/, (main, m) => {
    const mk = TLL.mocks.find(x => x.id === m[1]);
    const a = st().mocks[mk.id];
    if (!a || a.status !== 'active') { go('mockstart-' + mk.id); return; }
    if (mockRemaining(a, Date.now()) <= 0) return submitMock(mk, a, true);
    let hideTimer = false;
    html(main, `<div class="page stack"><h1 class="sr-only">${esc(mk.title)}</h1>
      <div class="exam-bar"><strong>${esc(mk.title)}</strong><span class="chip">${esc(modeLabel(a))}</span>
        <span class="row" style="gap:.4rem"><span class="timer" data-t aria-live="off"></span><button type="button" class="btn btn-small btn-quiet" data-hide>Hide timer</button>
        ${a.mode !== 'standard' ? '<button type="button" class="btn btn-small" data-pause>Pause</button>' : ''}</span></div>
      <div data-body></div>
      <p class="sr-only" aria-live="polite" data-announce></p></div>`);
    const tEl = main.querySelector('[data-t]'), body = main.querySelector('[data-body]');
    const announce = (s) => { main.querySelector('[data-announce]').textContent = s; };
    const warned = {};
    function tick() {
      const now = Date.now(), rem = mockRemaining(a, now);
      if (rem <= 0) { submitMock(mk, a, true); return; }
      tEl.textContent = hideTimer ? 'Timer hidden' : (a.limitMs ? fmtTime(rem) + ' left' : 'Untimed · ' + fmtTime(now - a.startedAt - a.pausedTotal - (a.pausedAt ? now - a.pausedAt : 0)) + ' used');
      tEl.classList.toggle('low', a.limitMs && rem < 5 * MIN);
      [10, 5, 1].forEach(w => { if (a.limitMs && rem < w * MIN && !warned[w]) { warned[w] = true; announce(`${w} minute${w > 1 ? 's' : ''} left.`); } });
    }
    const iv = setInterval(tick, 1000); onLeave(() => { clearInterval(iv); logTime(); S.saveNow(); });
    tick();
    main.querySelector('[data-hide]').addEventListener('click', (e) => { hideTimer = !hideTimer; e.target.textContent = hideTimer ? 'Show timer' : 'Hide timer'; tick(); });
    const pb = main.querySelector('[data-pause]');
    if (pb) pb.addEventListener('click', () => {
      if (a.pausedAt) { a.pausedTotal += Date.now() - a.pausedAt; a.pausedAt = null; a.lastSwitch = Date.now(); pb.textContent = 'Pause'; draw(); }
      else { logTime(); a.pausedAt = Date.now(); pb.textContent = 'Resume'; body.innerHTML = '<div class="card"><h2>Paused</h2><p>The paper is hidden while paused. This attempt is labelled as accommodated.</p></div>'; }
      S.saveNow(); tick();
    });
    if (a.pausedAt && pb) { pb.textContent = 'Resume'; body.innerHTML = '<div class="card"><h2>Paused</h2><p>Press Resume to continue.</p></div>'; }
    function logTime() { const q = mk.questions[a.current]; if (q && a.lastSwitch && !a.pausedAt) { a.timeOn[q.id] = (a.timeOn[q.id] || 0) + (Date.now() - a.lastSwitch); } a.lastSwitch = Date.now(); }
    function goto(i) { logTime(); a.current = i; S.save(); draw(); body.querySelector('.q-stem').setAttribute('tabindex', '-1'); body.querySelector('.q-stem').focus(); }
    function draw() {
      if (a.current === 'review') return drawReview();
      const q = mk.questions[a.current];
      if (TLL.ink) TLL.ink.setKey(`mock-${mk.id}-${a.startedAt}-${q.id}`);
      body.innerHTML = `<div class="stack"><div class="row" style="justify-content:space-between"><h2 style="margin:0">Question ${a.current + 1} <span class="muted small">of 20</span></h2>
        <button type="button" class="btn btn-small ${a.flags[q.id] ? 'flag-on' : ''}" data-flag aria-pressed="${a.flags[q.id] ? 'true' : 'false'}">${a.flags[q.id] ? '⚑ Flagged' : '⚐ Flag for review'}</button></div>
        <div data-q></div>
        <div class="row" style="justify-content:space-between"><button type="button" class="btn" data-prev ${a.current === 0 ? 'disabled' : ''}>Previous</button>
        <button type="button" class="btn btn-quiet" data-review>Review and submit</button>
        <button type="button" class="btn btn-primary" data-next>${a.current === 19 ? 'Review answers' : 'Next'}</button></div>
        <nav aria-label="Question navigation"><div class="qgrid">${mk.questions.map((x, i) => `<button type="button" class="btn ${a.answers[x.id] != null ? 'answered' : ''} ${i === a.current ? 'current' : ''}" data-go="${i}" aria-label="Question ${i + 1}${a.answers[x.id] != null ? ', answered' : ', not answered'}${a.flags[x.id] ? ', flagged' : ''}" ${i === a.current ? 'aria-current="true"' : ''}>${i + 1}<span class="st" aria-hidden="true">${a.flags[x.id] ? '⚑' : a.answers[x.id] != null ? '●' : ''}</span></button>`).join('')}</div>
        <p class="small muted">● answered · ⚑ flagged</p></nav></div>`;
      body.querySelector('[data-q]').appendChild(P.question(q, { mode: 'exam', selected: a.answers[q.id], onSelect: (v) => { a.answers[q.id] = v; S.save(); const g = body.querySelector(`[data-go="${a.current}"]`); g.classList.add('answered'); g.querySelector('.st').textContent = a.flags[q.id] ? '⚑' : '●'; g.setAttribute('aria-label', `Question ${a.current + 1}, answered${a.flags[q.id] ? ', flagged' : ''}`); } }));
      body.querySelector('[data-flag]').addEventListener('click', () => { if (a.flags[q.id]) delete a.flags[q.id]; else a.flags[q.id] = true; S.save(); draw(); body.querySelector('[data-flag]').focus(); });
      body.querySelector('[data-prev]').addEventListener('click', () => goto(a.current - 1));
      body.querySelector('[data-next]').addEventListener('click', () => a.current === 19 ? (logTime(), a.current = 'review', S.save(), draw()) : goto(a.current + 1));
      body.querySelector('[data-review]').addEventListener('click', () => { logTime(); a.current = 'review'; S.save(); draw(); });
      body.querySelector('.qgrid').addEventListener('click', (e) => { const g = e.target.closest('[data-go]'); if (g) goto(+g.dataset.go); });
      R.fixScroll(body);
    }
    function drawReview() {
      const un = mk.questions.filter(q => a.answers[q.id] == null), fl = mk.questions.filter(q => a.flags[q.id]);
      body.innerHTML = `<div class="card stack"><h2>Review before submitting</h2>
        <p>${20 - un.length} of 20 answered. ${un.length ? `<strong>Unanswered: ${un.map(q => q.num).join(', ')}.</strong> There is no penalty for guessing.` : 'Every question has an answer.'}</p>
        ${fl.length ? `<p>Flagged: ${fl.map(q => `<button type="button" class="btn btn-small" data-go="${q.num - 1}">${q.num}</button>`).join(' ')}</p>` : ''}
        <div class="qgrid">${mk.questions.map((x, i) => `<button type="button" class="btn ${a.answers[x.id] != null ? 'answered' : ''}" data-go="${i}" aria-label="Question ${i + 1}${a.answers[x.id] != null ? ', answered' : ', not answered'}${a.flags[x.id] ? ', flagged' : ''}">${i + 1}<span class="st" aria-hidden="true">${a.flags[x.id] ? '⚑' : a.answers[x.id] != null ? '●' : ''}</span></button>`).join('')}</div>
        <div class="row"><button type="button" class="btn btn-primary" data-submit>Submit paper</button><button type="button" class="btn" data-go="0">Back to question 1</button></div>
        <div data-confirm></div></div>`;
      body.addEventListener('click', onReviewClick);
    }
    function onReviewClick(e) {
      const g = e.target.closest('[data-go]'); if (g) { body.removeEventListener('click', onReviewClick); a.lastSwitch = Date.now(); goto(+g.dataset.go); return; }
      if (e.target.closest('[data-submit]')) {
        body.querySelector('[data-confirm]').innerHTML = `<div class="panel stack" role="alertdialog" aria-labelledby="cfm"><p id="cfm"><strong>Submit now?</strong> You cannot change answers afterwards.</p><div class="row"><button type="button" class="btn btn-primary" data-yes>Yes, submit</button><button type="button" class="btn" data-no>Keep working</button></div></div>`;
        body.querySelector('[data-yes]').focus();
      }
      if (e.target.closest('[data-yes]')) { body.removeEventListener('click', onReviewClick); submitMock(mk, a, false); }
      if (e.target.closest('[data-no]')) body.querySelector('[data-confirm]').innerHTML = '';
    }
    if (!a.pausedAt) draw();
  }, 'mocks');

  function submitMock(mk, a, timeUp) {
    const now = Date.now();
    if (a.pausedAt) { a.pausedTotal += now - a.pausedAt; a.pausedAt = null; }
    const results = mk.questions.map(q0 => { const q = TLL.model.normalise(q0); const ch = a.answers[q.id]; return { qid: q.id, choice: ch == null ? null : ch, ok: ch === q.answer, ms: a.timeOn[q.id] || 0, flagged: !!a.flags[q.id] }; });
    results.forEach(r => TLL.store.recordAttempt({ qid: r.qid, lesson: qById[r.qid].lesson, ctx: 'mock', ok: r.ok, hints: 0, ms: r.ms, choice: r.choice }));
    const used = Math.min(now - a.startedAt - a.pausedTotal, a.limitMs || Infinity);
    const entry = { mock: mk.id, mode: a.mode, modeLabel: modeLabel(a), score: results.filter(r => r.ok).length, results, startedAt: a.startedAt, submittedAt: now, usedMs: used, timeUp };
    st().mockHistory.push(entry);
    delete st().mocks[mk.id];
    S.saveNow();
    go(`mockresult-${mk.id}-${st().mockHistory.filter(h => h.mock === mk.id).length - 1}`);
  }

  route(/^mockresult-(M\d)-(\d+)$/, (main, m) => {
    const mk = TLL.mocks.find(x => x.id === m[1]);
    const h = st().mockHistory.filter(x => x.mock === mk.id)[+m[2]];
    if (!h) return html(main, '<div class="page"><h1>Result not found</h1><p><a href="#mocks">Mocks</a></p></div>');
    const bySpec = {}; Object.keys(TLL.SPEC).forEach(c => bySpec[c] = { n: 0, ok: 0 });
    const misCount = {}; const wrongLessons = {};
    h.results.forEach(r => { const q = qById[r.qid]; (q.spec || []).forEach(c => { bySpec[c].n++; if (r.ok) bySpec[c].ok++; }); if (!r.ok) { (q.mis || []).forEach(t => misCount[t] = (misCount[t] || 0) + 1); wrongLessons[q.lesson] = (wrongLessons[q.lesson] || 0) + 1; } });
    const strengths = Object.entries(bySpec).filter(([, v]) => v.n >= 2 && v.ok / v.n >= 0.8).map(([k]) => k);
    const gaps = Object.entries(bySpec).filter(([, v]) => v.n >= 1 && v.ok / v.n < 0.6).map(([k]) => k);
    const unanswered = h.results.filter(r => r.choice == null).length;
    const slow = h.results.filter(r => r.ms > 6 * MIN).map(r => qById[r.qid].num);
    html(main, `<div class="page wide stack-lg"><div><p class="eyebrow">${esc(mk.title)} · ${esc(h.modeLabel)} · ${fmtDate(h.submittedAt)}</p><h1>Mock results</h1>
      ${h.timeUp ? '<p class="panel">Time ran out, so the paper was submitted automatically.</p>' : ''}</div>
      <div class="grid"><div class="card stat"><span class="muted small">Score</span><span class="big">${h.score} / 20</span><span class="small muted">Raw marks only. No 1.0–9.0 conversion.</span></div>
        <div class="card stat"><span class="muted small">Time used</span><span class="big">${fmtTime(h.usedMs)}</span><span class="small muted">${h.mode === 'standard' ? 'of 75:00' : esc(h.modeLabel)}</span></div>
        <div class="card stat"><span class="muted small">Unanswered</span><span class="big">${unanswered}</span><span class="small muted">${unanswered ? 'A guess would have cost nothing.' : 'All answered.'}</span></div></div>
      <section class="card stack"><h2>What this suggests</h2>
        <p><strong>Strengths:</strong> ${strengths.length ? strengths.map(c => `${c} (${bySpec[c].ok}/${bySpec[c].n})`).join(', ') : 'not enough evidence yet in any single area.'}</p>
        <p><strong>Gaps:</strong> ${gaps.length ? gaps.map(c => `${c} (${bySpec[c].ok}/${bySpec[c].n})`).join(', ') : 'no specification area below 60% on this paper.'}</p>
        ${Object.keys(misCount).length ? `<p><strong>Possible patterns in wrong answers:</strong> ${Object.entries(misCount).sort((x, y) => y[1] - x[1]).slice(0, 4).map(([t, n]) => `${esc(TLL.misconceptions[t].label)} (${n})`).join('; ')}.</p>` : ''}
        ${slow.length ? `<p><strong>Time:</strong> questions ${slow.join(', ')} took over six minutes each. Consider flagging and moving on sooner.</p>` : ''}
        <h3>Next steps</h3><ul>${Object.entries(wrongLessons).sort((x, y) => y[1] - x[1]).slice(0, 5).map(([id]) => `<li>Revisit <a href="#lesson-${id}">${esc(lessonsById[id].title)}</a>, then do a short <a href="#practice-lesson-${id}">practice set</a>.</li>`).join('') || '<li>Keep skills fresh with mixed practice and spaced review.</li>'}
        <li>One paper is a small sample. Judge progress across several unseen papers and over time.</li></ul></section>
      <section class="stack"><h2>By specification code</h2><div class="table-wrap"><table><thead><tr><th>Code</th><th class="num">Questions</th><th class="num">Correct</th></tr></thead><tbody>${Object.entries(bySpec).filter(([, v]) => v.n).map(([c, v]) => `<tr><td>${c}</td><td class="num">${v.n}</td><td class="num">${v.ok}</td></tr>`).join('')}</tbody></table></div></section>
      <section class="stack"><h2>Question by question</h2><div class="table-wrap"><table><thead><tr><th>Q</th><th>Your answer</th><th>Correct</th><th>Result</th><th class="num">Time</th><th>Flag</th></tr></thead><tbody>
        ${h.results.map(r => { const q = TLL.model.normalise(qById[r.qid]); return `<tr><td>${q.num}</td><td>${r.choice == null ? '—' : LET[r.choice]}</td><td>${LET[q.answer]}</td><td>${r.ok ? '<span class="chip ok">✓ Correct</span>' : '<span class="chip bad">✗ ' + (r.choice == null ? 'Blank' : 'Incorrect') + '</span>'}</td><td class="num">${fmtTime(r.ms)}</td><td>${r.flagged ? '⚑' : ''}</td></tr>`; }).join('')}</tbody></table></div></section>
      <section class="stack"><h2>Full solutions</h2><div class="stack" data-sol></div></section>
      <div class="row"><a class="btn btn-primary" href="#mocks">Back to mocks</a><a class="btn" href="#progress">Progress</a></div></div>`);
    const box = main.querySelector('[data-sol]');
    h.results.forEach(r => {
      const q = qById[r.qid];
      const d = P.el(`<details><summary>Question ${q.num}: ${r.ok ? '✓ correct' : r.choice == null ? 'blank' : '✗ incorrect'}</summary><div></div></details>`);
      d.addEventListener('toggle', () => { if (d.open && !d.dataset.done) { d.dataset.done = 1; d.querySelector('div').appendChild(P.question(q, { mode: 'review', selected: r.choice })); R.fixScroll(d); } });
      box.appendChild(d);
    });
  }, 'mocks');

  /* ================================================================ PROGRESS */
  route(/^progress$/, (main) => {
    const A = st().attempts.filter(a => a.ctx !== 'mock' && !/^D/.test(a.qid));
    const firsts = A.filter(a => a.first);
    const indep = firsts.filter(a => !a.hints && !a.solutionShown);
    const assisted = firsts.filter(a => a.hints || a.solutionShown);
    const retries = A.filter(a => !a.first);
    const r = (arr) => arr.length ? pct(arr.filter(a => a.ok).length / arr.length) : '—';
    // delayed retention: attempts on a lesson made ≥ 1 day after the learner's first attempt on that lesson
    const firstByLesson = {}; A.forEach(a => { if (!(a.lesson in firstByLesson)) firstByLesson[a.lesson] = a.ts; });
    const delayed = A.filter(a => a.ts - firstByLesson[a.lesson] >= DAY && !a.hints);
    const conf = [0, 1, 2].map(c => A.filter(a => a.conf === c));
    const mis = {}; A.filter(a => !a.ok).forEach(a => (qById[a.qid].mis || []).forEach(t => mis[t] = (mis[t] || 0) + 1));
    const cfg = st().settings.mastery;
    const rows = TLL.units.filter(u => u.id !== 'U0').map(u => TLL.lessons.filter(l => l.unit === u.id).map(l => {
      const ms = mastery(l.id);
      return `<tr><td><a href="#lesson-${l.id}">${esc(l.title)}</a><div class="small muted">${esc(u.title)}</div></td><td>${statusChip(l.id)}</td><td><ul class="criteria">${Object.values(ms.crit).map(c => `<li>${c.ok ? '✓' : '○'} ${esc(c.text)}</li>`).join('')}</ul></td></tr>`;
    }).join('')).join('');
    const secureN = ORDER.filter(id => mastery(id).level === 'secure').length;
    const weak = ORDER.filter(id => { const m = mastery(id); return m.n >= 2 && m.acc < 0.6; });
    html(main, `<div class="page wide stack-lg"><div><h1>Progress</h1><p class="lead">Evidence from your answers on this device. Completion is not the goal: accuracy on unseen questions, after a delay, is a better guide.</p></div>
      <div class="grid">
        <div class="card stat"><span class="muted small">Independent first-attempt accuracy</span><span class="big">${r(indep)}</span><span class="small muted">${indep.length} questions, no hints</span></div>
        <div class="card stat"><span class="muted small">Assisted first attempts</span><span class="big">${r(assisted)}</span><span class="small muted">${assisted.length} with hints or solution shown</span></div>
        <div class="card stat"><span class="muted small">Retries and later attempts</span><span class="big">${r(retries)}</span><span class="small muted">${retries.length} attempts</span></div>
        <div class="card stat"><span class="muted small">Delayed retention</span><span class="big">${r(delayed)}</span><span class="small muted">${delayed.length} answers a day or more after first meeting the topic</span></div>
        <div class="card stat"><span class="muted small">Hint use</span><span class="big">${firsts.length ? pct(firsts.filter(a => a.hints).length / firsts.length) : '—'}</span><span class="small muted">of first attempts</span></div>
        <div class="card stat"><span class="muted small">Lessons secure</span><span class="big">${secureN} / ${ORDER.length}</span><span class="small muted">app rule, see below</span></div>
      </div>
      <section class="card stack"><h2>Strengths, gaps and next steps</h2>
        <p><strong>Secure:</strong> ${secureN ? ORDER.filter(id => mastery(id).level === 'secure').map(id => esc(lessonsById[id].title)).join('; ') : 'none yet. Secure needs varied evidence over more than one day.'}</p>
        <p><strong>Needs attention:</strong> ${weak.length ? weak.map(id => `<a href="#lesson-${id}">${esc(lessonsById[id].title)}</a>`).join('; ') : 'no lesson with at least two independent attempts is below 60%.'}</p>
        <p><strong>Suggested next step:</strong> ${dueCards().length + dueMistakes().length ? '<a href="#review">clear your due reviews</a>, then continue the course.' : nextLesson() ? `<a href="#lesson-${nextLesson().id}">${esc(nextLesson().title)}</a>.` : '<a href="#mocks">sit a mock paper</a> under exam conditions.'}</p></section>
      <section class="card stack"><h2>Confidence and accuracy</h2><p class="small muted">If “Sure” answers are often wrong, slow down on that kind of question. If “Guessing” answers are usually right, trust your reasoning a little more.</p>
        <div class="table-wrap"><table><thead><tr><th>Your confidence</th><th class="num">Answers</th><th class="num">Accuracy</th></tr></thead><tbody>${['Guessing', 'Unsure', 'Sure'].map((c, i) => `<tr><td>${c}</td><td class="num">${conf[i].length}</td><td class="num">${r(conf[i])}</td></tr>`).join('')}</tbody></table></div></section>
      ${Object.keys(mis).length ? `<section class="card stack"><h2>Patterns in wrong answers</h2><p class="small muted">Based on the misconception tags of questions you got wrong. These are possibilities, not diagnoses.</p><ul>${Object.entries(mis).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t, n]) => `<li>${esc(TLL.misconceptions[t].label)}: ${n}</li>`).join('')}</ul></section>` : ''}
      <section class="stack"><h2>Lessons and mastery evidence</h2>
        <p class="small muted">App rule (adjust in Settings): at least ${cfg.minItems} different questions answered independently first time; at least ${cfg.accuracy}% correct on the most recent of them${cfg.needDelayed ? `; a correct answer at least ${cfg.delayHours} hours after first practice` : ''}${cfg.needTransfer ? '; a correct answer in an unfamiliar or mixed context' : ''}. This is a rule of this app, not an official TMUA standard. Flashcard recall does not count.</p>
        <div class="table-wrap"><table><thead><tr><th>Lesson</th><th>Status</th><th>Evidence</th></tr></thead><tbody>${rows}</tbody></table></div></section>
      <section class="stack"><h2>Mock history</h2>${st().mockHistory.length ? `<div class="table-wrap"><table><thead><tr><th>Paper</th><th>Date</th><th>Mode</th><th class="num">Score</th></tr></thead><tbody>${st().mockHistory.map((h, i) => `<tr><td><a href="#mockresult-${h.mock}-${st().mockHistory.filter(x => x.mock === h.mock).indexOf(h)}">${esc(TLL.mocks.find(m => m.id === h.mock).title)}</a></td><td>${fmtDate(h.submittedAt)}</td><td>${esc(h.modeLabel)}</td><td class="num">${h.score} / 20</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No mocks yet.</p>'}</section>
      <section class="card stack"><h2>Flashcards</h2><p>${Object.keys(st().cards).length} in deck; ${dueCards().length} due; ${st().cardLog.length} reviews logged.</p></section></div>`);
  }, 'progress');

  /* ================================================================ GLOSSARY */
  route(/^glossary$/, (main) => {
    html(main, `<div class="page stack-lg"><div><h1>Glossary</h1><div class="field" style="max-width:24rem"><label for="gq">Search terms</label><input type="search" id="gq" autocomplete="off"></div><p class="small" aria-live="polite" data-n></p></div>
      <dl class="stack" style="margin:0">${TLL.glossary.map(g => `<div class="card" data-term="${esc((g.term + ' ' + R.text(g.def)).toLowerCase())}"><dt><strong>${esc(g.term)}</strong></dt><dd style="margin:.3rem 0 0" class="prose">${inl(g.def)}${g.see.length ? `<br><span class="small">See: ${g.see.map(s => `<a href="#lesson-${s}">${esc(lessonsById[s].title)}</a>`).join(', ')}</span>` : ''}</dd></div>`).join('')}</dl></div>`);
    const inp = main.querySelector('#gq');
    inp.addEventListener('input', () => { const v = inp.value.trim().toLowerCase(); let n = 0; main.querySelectorAll('[data-term]').forEach(d => { const show = !v || d.dataset.term.includes(v); d.hidden = !show; if (show) n++; }); main.querySelector('[data-n]').textContent = v ? `${n} matching term${n === 1 ? '' : 's'}` : ''; });
  }, 'more');

  /* ================================================================ SOURCES & METHOD */
  route(/^sources$/, (main) => {
    const checkLabel = { read: 'Read in full', extract: 'Abstract/summary checked', link: 'Linked, not accessed' };
    const kinds = { official: 'Official assessment material', research: 'Learning research', accessibility: 'Accessibility standard', technical: 'Technical documentation' };
    const cover = Object.keys(TLL.SPEC).map(c => {
      const ls = TLL.lessons.filter(l => l.spec.includes(c)); const pq = TLL.questions.filter(q => (q.spec || []).includes(c)).length;
      const mq = TLL.mocks.flatMap(m => m.questions).filter(q => (q.spec || []).includes(c)).length;
      return `<tr><td><strong>${c}</strong></td><td>${esc(TLL.SPEC[c])}</td><td>${ls.map(l => `<a href="#lesson-${l.id}">${l.id}</a>`).join(', ')}</td><td class="num">${pq}</td><td class="num">${mq}</td></tr>`;
    }).join('');
    const counts = [['Lessons (including 6 maths refreshers and orientation)', TLL.lessons.length], ['Worked examples', TLL.worked.length], ['Practice questions', TLL.questions.length], ['Diagnostic questions (separate pool)', TLL.diagnostic.length], ['Mock papers × questions (separate pool)', `${TLL.mocks.length} × 20 = ${TLL.mocks.length * 20}`], ['Flashcards', TLL.cards.length], ['Glossary terms', TLL.glossary.length]];
    html(main, `<div class="page wide stack-lg"><div><h1>Method and sources</h1><p class="lead">How the course was built, what the evidence does and does not say, and where everything comes from. Sources checked on ${esc(TLL.meta.specChecked)}.</p></div>
      <section class="card stack"><h2>The test</h2><p>Verified against the <a href="${TLL.sources[0].url}" target="_blank" rel="noopener">UAT-UK TMUA Content Specification for October 2026 and January 2027 assessments</a>: two 75-minute papers, each with 20 multiple-choice questions; no calculator; no formula booklet; no penalty for wrong answers. Paper 2 tests Arg1–Arg4, Prf1–Prf5 and Err1–Err2 using the Section 1 mathematics. Candidates are not expected to use symbolic logic notation or complete formal truth tables, so this course uses them only as optional aids.</p>
      <p>All questions in this app are <strong>original</strong>, written for these skills. No official or commercial questions are reproduced. For authentic practice use the <a href="https://esat-tmua.ac.uk/tmua-preparation-materials/" target="_blank" rel="noopener">official preparation materials</a>.</p></section>
      <section class="stack"><h2>Specification coverage</h2><div class="table-wrap"><table><thead><tr><th>Code</th><th>Requirement (official wording)</th><th>Lessons</th><th class="num">Practice</th><th class="num">Mock</th></tr></thead><tbody>${cover}</tbody></table></div>
        <p class="small muted">Section 1 maths is refreshed in the toolkit unit and used throughout, but this course is not a complete Section 1 course.</p></section>
      <section class="stack"><h2>Content</h2><div class="table-wrap"><table><tbody>${counts.map(([k, v]) => `<tr><td>${k}</td><td class="num">${v}</td></tr>`).join('')}</tbody></table></div>
        <p class="small muted">Difficulty labels are editorial estimates; they are not calibrated against learner data.</p></section>
      <section class="stack"><h2>Evidence table</h2><p class="small muted">Research findings, accessibility requirements and design choices are labelled separately. Research on word lists or short lab lessons is not presented as proof of better TMUA scores.</p>
        <div class="table-wrap"><table><thead><tr><th>Decision</th><th>Type</th><th>Source</th><th>Strength</th><th>Limitations</th><th>How it is implemented</th></tr></thead><tbody>
        ${TLL.evidence.map(e => `<tr><td>${esc(e.decision)}</td><td>${esc(e.type)}</td><td>${e.sources.map(id => { const s = TLL.sources.find(x => x.id === id); return `<a href="#src-${id}">${esc(s.cite.split('(')[0].trim())}</a>`; }).join('; ') || '—'}</td><td>${esc(e.strength)}</td><td>${esc(e.limits)}</td><td>${esc(e.impl)}</td></tr>`).join('')}</tbody></table></div></section>
      <section class="card stack"><h2>Spaced-review method</h2><p>A simplified SuperMemo SM-2 scheduler. Ratings: Again, Hard, Good, Easy. Each card has an ease factor (starting 2.5, minimum 1.3). Successful recalls give intervals of 1 day, then 6 days (3 if Hard), then the previous interval × ease (× 0.8 for Hard, × 1.3 for Easy). Again resets the card to return in 10 minutes and lowers the ease by 0.2. Due dates are saved on this device. These are reasonable defaults, not proven optimal intervals.</p></section>
      <section class="card stack"><h2>Mastery and adaptation</h2><p>A lesson is “secure” when, by default, you have answered at least 4 different questions independently at the first attempt, at least 80% of the recent ones correctly, at least one correctly 20 hours or more after first practice, and at least one in an unfamiliar or mixed context. Hints, shown solutions, retries and flashcards do not count as independent success. You can change these thresholds in Settings. They are app rules, not official standards.</p>
        <p>Wrong answers trigger a targeted explanation, the offer of a fresh question on the same idea, and a delayed return of the original after a day.</p></section>
      <section class="card stack"><h2>Checks performed</h2><ul>
        <li>Every mathematical expression in every lesson, question, option, hint, solution and card is parsed by KaTeX in an automated check; any failure blocks release.</li>
        <li>Every answer index, option explanation and generated option list is validated; mock questions are checked for overlap with practice questions.</li>
        <li>Theme colour contrast is computed for text, controls and states in all four themes.</li>
        <li>An automated browser test runs the learner journey: diagnostic, lesson, answers, hints, mistake follow-up, flashcard scheduling, mock submission and restoring progress after reload, at iPad and phone sizes.</li>
        <li>Answers were re-solved independently, with numerical checks where useful. Finite numerical checks support but cannot prove universal claims.</li></ul></section>
      <section class="card stack"><h2>Limitations</h2><ul>
        <li>No real learners have used this app yet; no claims are made about its effectiveness. A small usability study is suggested: for example 5 learners, a think-aloud on one lesson and one practice set, then an unseen mixed test a week later.</li>
        <li>Progress is stored on this device only. There is no account or cloud sync; use Export to back up or move devices.</li>
        <li>Some sources could not be opened from the build environment; these are marked below. Nothing in the course depends on wording that was not checked.</li>
        <li>Screen-reader support for mathematics (MathML) varies between browsers and readers.</li></ul></section>
      <section class="stack"><h2>Sources</h2><ol class="stack" style="padding-left:1.2rem">${TLL.sources.map(s => `<li id="src-${s.id}"><span class="chip">${checkLabel[s.check]}</span> <span class="chip">${kinds[s.kind]}</span><p style="margin:.3rem 0">${esc(s.cite)} <a href="${esc(s.url)}" target="_blank" rel="noopener">Link</a></p><p class="small muted">${esc(s.note)} Checked ${esc(s.checked)}.</p></li>`).join('')}</ol></section></div>`);
  }, 'more');

  /* ================================================================ SETTINGS (route name avoids reserved words) */
  route(/^prefs$/, (main) => {
    const s = st().settings, c = s.mastery;
    const seg = (name, vals, cur) => vals.map(([v, t]) => `<label><input type="radio" name="${name}" value="${v}" ${String(cur) === String(v) ? 'checked' : ''}> ${t}</label>`).join('');
    html(main, `<div class="page stack-lg"><h1>Settings</h1>
      <form class="card stack" id="vis"><h2>Reading</h2>
        <fieldset class="seg"><legend>Text size</legend>${seg('size', [['s', 'Small'], ['m', 'Default'], ['l', 'Large'], ['xl', 'Larger'], ['xxl', 'Largest']], s.size)}</fieldset>
        <fieldset class="seg"><legend>Theme</legend>${seg('theme', [['system', 'Match device'], ['light', 'Light'], ['dark', 'Dark'], ['sepia', 'Warm'], ['contrast', 'High contrast']], s.theme)}</fieldset>
        <fieldset class="seg"><legend>Line spacing</legend>${seg('leading', [['normal', 'Default'], ['relaxed', 'More space']], s.leading)}</fieldset>
        <fieldset class="seg"><legend>Motion</legend>${seg('motion', [['system', 'Match device'], ['reduce', 'Reduce motion']], s.motion)}</fieldset>
        <label class="check"><input type="checkbox" name="drillTimer" ${s.drillTimer ? 'checked' : ''}> Show the small timer in timed drills</label></form>
      <form class="card stack" id="mst"><h2>Mastery rule</h2><p class="small muted">These thresholds decide when a lesson shows as “secure”. They are this app’s rules, not TMUA standards.</p>
        <div class="fields"><div class="field"><label for="m-min">Minimum different questions</label><input type="number" id="m-min" min="2" max="10" value="${c.minItems}"></div>
        <div class="field"><label for="m-acc">Accuracy target (%)</label><input type="number" id="m-acc" min="50" max="100" step="5" value="${c.accuracy}"></div>
        <div class="field"><label for="m-dh">Delayed check after (hours)</label><input type="number" id="m-dh" min="4" max="168" value="${c.delayHours}"></div>
        <div class="field"><label for="m-cards">New flashcards per day</label><input type="number" id="m-cards" min="1" max="50" value="${s.newCardsPerDay}"></div></div>
        <label class="check"><input type="checkbox" id="m-del" ${c.needDelayed ? 'checked' : ''}> Require a correct answer on a later day</label>
        <label class="check"><input type="checkbox" id="m-tr" ${c.needTransfer ? 'checked' : ''}> Require a correct answer in an unfamiliar or mixed context</label>
        <div class="row"><button class="btn btn-primary" type="submit">Save mastery rule</button></div></form>
      <section class="card stack"><h2>Backup</h2><p>Your progress is stored in this browser on this device only. Export a backup file to keep it safe or move it to another device, then import it there.</p>
        <div class="row"><button type="button" class="btn btn-primary" data-export>Export backup</button><label class="btn" for="imp">Import backup file</label><input type="file" id="imp" accept="application/json,.json" class="sr-only"></div>
        <details><summary>Copy or paste backup text instead</summary><div class="stack" style="margin-top:.6rem"><div class="field"><label for="bt">Backup text</label><textarea id="bt" rows="5" spellcheck="false"></textarea></div><div class="row"><button type="button" class="btn btn-small" data-showtext>Fill with current backup</button><button type="button" class="btn btn-small" data-copy>Copy</button><button type="button" class="btn btn-small" data-pastein>Import from this text</button></div></div></details>
        <p aria-live="polite" class="small" data-msg></p></section>
      <section class="card stack"><h2>Reset</h2><p>Erase all progress, attempts, flashcard schedules and settings on this device.</p><div class="row"><button type="button" class="btn" data-reset>Erase all progress…</button></div><div data-confirm></div></section></div>`);
    main.querySelector('#vis').addEventListener('change', (e) => {
      const t = e.target; if (t.name === 'drillTimer') s.drillTimer = t.checked; else s[t.name] = t.value;
      S.saveNow(); applySettings();
    });
    main.querySelector('#mst').addEventListener('submit', (e) => {
      e.preventDefault();
      const v = (id, lo, hi, d) => { const n = +main.querySelector(id).value; return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; };
      c.minItems = v('#m-min', 2, 10, 4); c.accuracy = v('#m-acc', 50, 100, 80); c.delayHours = v('#m-dh', 4, 168, 20); s.newCardsPerDay = v('#m-cards', 1, 50, 10);
      c.needDelayed = main.querySelector('#m-del').checked; c.needTransfer = main.querySelector('#m-tr').checked; S.saveNow(); P.toast('Mastery rule saved');
    });
    const msg = (t) => { main.querySelector('[data-msg]').textContent = t; };
    main.querySelector('[data-export]').addEventListener('click', () => {
      const text = S.exportJSON();
      main.querySelector('#bt').value = text;
      try {
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
        a.download = 'tmua-logic-lab-backup-' + new Date().toISOString().slice(0, 10) + '.json'; document.body.appendChild(a); a.click(); a.remove();
        msg('Backup file created. If no download appeared, copy the backup text below instead.');
      } catch (err) { msg('Downloads are blocked here: copy the backup text below instead.'); }
      main.querySelector('details').open = true;
    });
    const doImport = (text) => { try { S.importJSON(text); applySettings(); msg('Backup imported.'); P.toast('Backup imported'); setTimeout(render, 400); } catch (err) { msg('Import failed: ' + err.message); } };
    main.querySelector('#imp').addEventListener('change', (e) => { const f = e.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => doImport(rd.result); rd.readAsText(f); });
    main.querySelector('[data-showtext]').addEventListener('click', () => { main.querySelector('#bt').value = S.exportJSON(); });
    main.querySelector('[data-copy]').addEventListener('click', () => { const ta = main.querySelector('#bt'); if (!ta.value) ta.value = S.exportJSON(); navigator.clipboard && navigator.clipboard.writeText(ta.value).then(() => msg('Copied.'), () => { ta.select(); msg('Select-all done: copy with your keyboard or the Edit menu.'); }); });
    main.querySelector('[data-pastein]').addEventListener('click', () => doImport(main.querySelector('#bt').value));
    main.querySelector('[data-reset]').addEventListener('click', () => {
      const box = main.querySelector('[data-confirm]');
      box.innerHTML = `<div class="panel stack" role="alertdialog" aria-labelledby="rc"><p id="rc"><strong>Erase everything?</strong> This cannot be undone. Export a backup first if you might want it.</p><div class="row"><button type="button" class="btn" data-yes style="border-color:var(--bad);color:var(--bad)">Yes, erase</button><button type="button" class="btn btn-primary" data-no>Cancel</button></div></div>`;
      box.querySelector('[data-no]').focus();
      box.querySelector('[data-no]').addEventListener('click', () => { box.innerHTML = ''; });
      box.querySelector('[data-yes]').addEventListener('click', () => { S.reset(); applySettings(); P.toast('All progress erased'); go('home'); });
    });
  }, 'more');

  route(/^more$/, (main) => {
    html(main, `<div class="page stack-lg"><h1>More</h1><div class="grid">
      <a class="card" href="#glossary" style="text-decoration:none;color:inherit"><h2>Glossary</h2><p class="muted">Searchable definitions of every logical term used.</p></a>
      <a class="card" href="#worked" style="text-decoration:none;color:inherit"><h2>Worked examples</h2><p class="muted">All ${TLL.worked.length} worked examples in one place.</p></a>
      <a class="card" href="#sources" style="text-decoration:none;color:inherit"><h2>Method and sources</h2><p class="muted">Evidence table, specification coverage, references and limitations.</p></a>
      <a class="card" href="#prefs" style="text-decoration:none;color:inherit"><h2>Settings</h2><p class="muted">Text size, themes, motion, mastery rule, backup and reset.</p></a></div>
      <section class="card stack"><h2>How to use this app</h2><ol><li>Take the diagnostic (or skip it) and follow the suggested route on the course map.</li><li>Work through lessons actively: predict, read, try the guided problem, then answer alone.</li><li>Come back daily for Review: it brings cards and earlier mistakes back at spaced intervals.</li><li>Use Practice (mixed mode) to interleave topics once several lessons are done.</li><li>Sit the mocks under exam conditions, spaced out, and act on the next steps they suggest.</li></ol></section></div>`);
  }, 'more');

  /* ================================================================ boot */
  function boot() {
    S.load(); applySettings();
    const nav = document.querySelector('.nav'), mb = document.querySelector('.menu-btn');
    mb.addEventListener('click', () => { const o = nav.classList.toggle('open'); mb.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    window.addEventListener('hashchange', render);
    // A link to the current hash would otherwise do nothing (for example "New practice session" from the summary).
    document.querySelector('.skip').addEventListener('click', (e) => { e.preventDefault(); const m = $main(); m.focus(); m.scrollIntoView(); });
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (a && a.getAttribute('href') === (location.hash || '#home') && a.getAttribute('href') !== '#main') { e.preventDefault(); if (a.getAttribute('href') === '#practice') session = null; render(); }
    });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') S.saveNow(); });
    window.addEventListener('pagehide', () => S.saveNow());
    window.addEventListener('resize', () => R.fixScroll($main()));
    render.moved = false;
    render();
  }
  TLL.app = { addCard, mastery, go, render, dueCards, dueMistakes, boot };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window.TLL);
