/* Content model: turns compact question types into a uniform shape.
 * Shared by the app and by scripts/validate.mjs, so what is validated is what is shown.
 */
(function (TLL) {
  'use strict';
  const ROMAN = ['I', 'II', 'III'];

  function normalise(q) {
    if (q._norm) return q;
    const out = Object.assign({}, q);
    if (q.type === 'roman') {
      const truthSet = q.parts.map((p, i) => (p.t ? i + 1 : 0)).filter(Boolean);
      out.options = TLL.ROMAN_OPTIONS.map(o => o.label);
      out.answer = TLL.ROMAN_OPTIONS.findIndex(o => o.set.length === truthSet.length && o.set.every(v => truthSet.includes(v)));
      out.notes = TLL.ROMAN_OPTIONS.map((o, idx) => {
        if (idx === out.answer) {
          return 'Correct. ' + q.parts.map((p, i) => `${ROMAN[i]} is ${p.t ? 'true' : 'false'}: ${p.why}`).join(' ');
        }
        // first statement whose truth disagrees with this option
        for (let i = 0; i < q.parts.length; i++) {
          const inOpt = o.set.includes(i + 1);
          if (inOpt !== q.parts[i].t) {
            return `${ROMAN[i]} is ${q.parts[i].t ? 'true' : 'false'}, so this option ${q.parts[i].t ? 'should include' : 'cannot include'} it. ${q.parts[i].why}`;
          }
        }
        return '';
      });
      out.stemParts = q.parts.map((p, i) => ({ label: ROMAN[i], s: p.s }));
    } else if (q.type === 'ns') {
      const f = q.fwd.t, b = q.bwd.t;
      out.options = TLL.NS_OPTIONS.slice();
      out.answer = f && b ? 2 : (!f && b ? 0 : (f && !b ? 1 : 3));
      const suff = `Sufficient? ${f ? 'Yes' : 'No'}: ${q.fwd.why}`;
      const nec = `Necessary? ${b ? 'Yes' : 'No'}: ${q.bwd.why}`;
      out.notes = out.options.map((_, idx) => idx === out.answer ? `Correct. ${suff} ${nec}` :
        ({ 0: [true, false], 1: [false, true], 2: [true, true], 3: [false, false] }[idx][0] !== b ? nec : suff));
    }
    out._norm = true;
    return out;
  }

  function allQuestions() {
    const mocks = [];
    TLL.mocks.forEach(m => m.questions.forEach(q => mocks.push(q)));
    return { practice: TLL.questions, diagnostic: TLL.diagnostic, mocks };
  }

  /* Deterministic shuffle (for order questions), seeded by question id. */
  function seededShuffle(arr, seedStr) {
    let h = 2166136261;
    for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
    const a = arr.map((v, i) => i);
    for (let i = a.length - 1; i > 0; i--) {
      h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
      const j = h % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    // never present in already-correct order
    if (a.every((v, i) => v === i) && a.length > 1) a.push(a.shift());
    return a;
  }

  TLL.model = { normalise, allQuestions, seededShuffle };
})(window.TLL);
