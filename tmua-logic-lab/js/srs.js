/* Spaced-review scheduler: a simplified variant of SuperMemo SM-2.
 *
 * Ratings map to SM-2 recall grades: Again = 1, Hard = 3, Good = 4, Easy = 5.
 * - Ease factor (EF) starts at 2.5, never below 1.3. After Hard/Good/Easy:
 *     EF ← EF + (0.1 − (5 − q)(0.08 + (5 − q)·0.02))   [SM-2 formula]
 * - Again: the card relapses: repetitions reset, EF falls by 0.2 (floor 1.3), and it returns in 10 minutes
 *   (within the same session if you keep going), then 1 day after the next successful recall.
 * - Successful recall intervals: 1st → 1 day (Easy: 3 days); 2nd → 6 days (Hard: 3); later → previous × EF
 *   (Hard ×0.8 of that, Easy ×1.3), rounded, at least previous + 1 day.
 * These intervals are standard defaults, not proven optimal for TMUA material.
 */
(function (TLL) {
  'use strict';
  const DAY = 86400000, MIN = 60000;
  const Q = { again: 1, hard: 3, good: 4, easy: 5 };

  function fresh(now) { return { status: 'learning', due: now, interval: 0, ef: 2.5, reps: 0, lapses: 0, last: null, suspended: false, bookmarked: false, added: now }; }

  function next(card, rating, now) {
    const c = Object.assign({}, card);
    const q = Q[rating];
    c.last = now;
    if (q < 3) {
      c.reps = 0; c.lapses = (c.lapses || 0) + 1; c.ef = Math.max(1.3, (c.ef || 2.5) - 0.2);
      c.interval = 0; c.due = now + 10 * MIN; c.status = 'learning';
      return c;
    }
    c.reps = (c.reps || 0) + 1;
    let days;
    if (c.reps === 1) days = q === 5 ? 3 : 1;
    else if (c.reps === 2) days = q === 3 ? 3 : 6;
    else {
      const base = (c.interval || 1) * (c.ef || 2.5);
      days = Math.round(base * (q === 3 ? 0.8 : q === 5 ? 1.3 : 1));
      days = Math.max(days, (c.interval || 0) + 1);
    }
    c.ef = Math.max(1.3, (c.ef || 2.5) + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    c.interval = days;
    c.due = now + days * DAY;
    c.status = 'review';
    return c;
  }

  function label(card, rating, now) {
    const n = next(card, rating, now);
    const ms = n.due - now;
    if (ms < DAY) return Math.round(ms / MIN) + ' min';
    const d = Math.round(ms / DAY);
    return d + (d === 1 ? ' day' : ' days');
  }

  TLL.srs = { fresh, next, label, Q };
})(window.TLL);
