/* Local-first storage. Progress lives in this browser only (localStorage), with export/import for backup.
 * There is no cloud sync. If storage is unavailable (private mode, blocked), the app runs from memory and says so.
 */
(function (TLL) {
  'use strict';
  const KEY = 'tmua-logic-lab.v1';
  const DAY = 86400000;

  const defaults = () => ({
    version: 1,
    created: Date.now(),
    settings: {
      size: 'm', theme: 'system', leading: 'normal', motion: 'system', drillTimer: true,
      mastery: { minItems: 4, accuracy: 80, needDelayed: true, delayHours: 20, needTransfer: true },
      newCardsPerDay: 10
    },
    attempts: [],          // {qid, lesson, ctx, ts, ok, first, hints, conf, ms, choice, solutionShown}
    lessons: {},           // id -> {started, revealed, completedAt, stepAnswers:{}}
    diagnostic: null,      // {ts, results:{qid:{ok,conf}}, recommended:[lessonIds], secure:[lessonIds]}
    testedOut: {},         // unitId -> ts
    cards: {},             // cardId -> {status:'new'|'learning'|'review', due, interval, ef, reps, lapses, last, suspended, bookmarked, added}
    cardEdits: {},         // cardId -> {front, back}
    cardLog: [],           // {id, ts, rating}
    mistakes: {},          // qid -> {ts, due, resolved, count}
    bookmarks: {},         // qid -> ts
    mocks: {},             // mockId -> attempt state (see app.js)
    mockHistory: [],       // completed attempts
    lastVisit: Date.now()
  });

  let state = defaults();
  let available = true;
  let timer = null;

  function merge(base, saved) {
    for (const k of Object.keys(saved)) {
      if (saved[k] && typeof saved[k] === 'object' && !Array.isArray(saved[k]) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) merge(base[k], saved[k]);
      else base[k] = saved[k];
    }
    return base;
  }

  function load() {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) state = merge(defaults(), JSON.parse(raw));
    } catch (e) { available = false; }
    return state;
  }
  function saveNow() {
    clearTimeout(timer); timer = null;
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); available = true; }
    catch (e) { available = false; }
  }
  function save() { if (!timer) timer = setTimeout(saveNow, 150); }

  function exportJSON() { return JSON.stringify({ app: 'tmua-logic-lab', exported: new Date().toISOString(), data: state }, null, 1); }
  function importJSON(text) {
    const obj = JSON.parse(text);
    const data = obj && obj.app === 'tmua-logic-lab' ? obj.data : obj;
    if (!data || data.version !== 1 || !Array.isArray(data.attempts) || typeof data.settings !== 'object') throw new Error('This file does not look like a TMUA Logic Lab backup (version 1).');
    state = merge(defaults(), data);
    saveNow();
    return state;
  }
  function reset() { state = defaults(); saveNow(); return state; }

  /* ---------- attempts ---------- */
  function attemptsFor(qid) { return state.attempts.filter(a => a.qid === qid); }
  function recordAttempt(a) {
    const prior = state.attempts.some(x => x.qid === a.qid && x.ctx !== 'mock');
    const rec = Object.assign({ ts: Date.now(), first: !prior, hints: 0 }, a);
    state.attempts.push(rec);
    const isPractice = !/^M\d/.test(a.qid) && !/^D\d/.test(a.qid);
    if (isPractice) {
      const m = state.mistakes[a.qid];
      if (!rec.ok) state.mistakes[a.qid] = { ts: rec.ts, due: rec.ts + DAY, resolved: false, count: (m ? m.count : 0) + 1 };
      else if (m && !m.resolved && rec.ts >= m.due - 60000 && !rec.hints) { m.resolved = true; m.resolvedAt = rec.ts; }
    }
    save();
    return rec;
  }

  TLL.store = {
    load, save, saveNow, exportJSON, importJSON, reset, recordAttempt, attemptsFor, DAY,
    get state() { return state; },
    get available() { return available; }
  };
})(window.TLL);
