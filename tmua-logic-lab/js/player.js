/* Question player and worked-example viewer.
 * Modes: 'learn' (feedback after answering, progressive hints), 'inline' (lesson prediction/guided step: feedback,
 * not recorded as a bank attempt), 'diagnostic' (no hints/feedback, confidence required), 'exam' (selection only),
 * 'review' (static marked solution, used after mocks).
 */
(function (TLL) {
  'use strict';
  const R = () => TLL.render;
  const LET = 'ABCDEFGH';
  const DIFF = { 1: 'Foundation', 2: 'Core', 3: 'Exam standard', 4: 'Stretch' };
  const TYPE = { mcq: 'Multiple choice', roman: 'Several statements', ns: 'Necessary / sufficient', tfset: 'Evaluate each statement', order: 'Order the proof' };
  let uid = 0;

  const ICON = {
    ok: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" style="fill:var(--ok)"/><path d="M6.5 12.5l3.5 3.5 7.5-8" style="fill:none;stroke:var(--bg);stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round"/></svg>',
    bad: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" style="fill:var(--bad)"/><path d="M8 8l8 8M16 8l-8 8" style="fill:none;stroke:var(--bg);stroke-width:2.6;stroke-linecap:round"/></svg>'
  };

  function el(html) { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; }
  function toast(msg) {
    const t = el(`<div class="toast" role="status">${R().esc(msg)}</div>`);
    document.body.appendChild(t); setTimeout(() => t.remove(), 2600);
  }

  function lessonTitle(id) { const l = TLL.lessons.find(x => x.id === id); return l ? l.title : id; }

  /* ---------------------------------------------------------------- question */
  function question(q0, opt) {
    opt = Object.assign({ mode: 'learn', ctx: 'practice' }, opt || {});
    const q = TLL.model.normalise(q0);
    const exam = opt.mode === 'exam' || opt.mode === 'review';
    const n = ++uid;
    const st = { choice: null, order: null, tf: {}, hints: 0, conf: null, start: Date.now(), done: false };
    const inp = (s) => R().inline(s, { exam });
    const blk = (s) => R().block(s, { exam });

    let meta = '';
    if (opt.mode === 'learn' || opt.mode === 'review') {
      meta = `<div class="q-meta">${(q.spec || []).map(s => `<span class="chip">${s}</span>`).join('')}
        <span class="chip" title="Editorial estimate, not calibrated">${DIFF[q.diff] || ''} <span class="sr-only">(editorial difficulty estimate)</span></span>
        <span class="chip">${TYPE[q.type] || ''}</span>${q.transfer ? '<span class="chip accent">Unfamiliar context</span>' : ''}</div>`;
    }
    let partsHtml = '';
    if (q.stemParts) partsHtml = `<ol class="q-parts">${q.stemParts.map(p => `<li><span class="lab">${p.label}</span><span>${inp(p.s)}</span></li>`).join('')}</ol>`;

    const root = el(`<section class="q fade-in" aria-labelledby="qs${n}">
      ${meta}
      <div class="q-stem prose" id="qs${n}">${blk(q.stem)}${partsHtml}</div>
      <div class="q-input"></div>
      <div class="q-conf"></div>
      <div class="q-actions"></div>
      <div class="q-hints" aria-live="polite"></div>
      <div class="q-feedback" aria-live="polite"></div>
      <div class="q-after"></div>
    </section>`);
    const $ = (s) => root.querySelector(s);

    /* ---- inputs ---- */
    if (['mcq', 'roman', 'ns'].includes(q.type)) {
      $('.q-input').innerHTML = `<fieldset class="options"><legend class="sr-only">Answer options</legend>
        ${q.options.map((o, i) => `<label class="opt" data-i="${i}"><input type="radio" name="q${n}" value="${i}" ${opt.selected === i ? 'checked' : ''}>
        <span class="letter" aria-hidden="true">${LET[i]}</span><span class="otext"><span class="sr-only">Option ${LET[i]}: </span>${inp(o)}</span></label>`).join('')}</fieldset>`;
      if (opt.selected != null) st.choice = opt.selected;
      $('.q-input').addEventListener('change', (e) => {
        if (e.target.name !== 'q' + n) return;
        st.choice = +e.target.value; updateActions();
        if (opt.onSelect) opt.onSelect(st.choice);
      });
    } else if (q.type === 'tfset') {
      const labels = q.labels || ['True', 'False'];
      $('.q-input').innerHTML = `<div class="tf">${q.statements.map((s, i) => `<div class="tf-item" data-i="${i}">
        <div class="prose"><strong>${i + 1}.</strong> ${inp(s.s)}</div>
        <fieldset class="seg"><legend class="sr-only">Statement ${i + 1}</legend>
          <label><input type="radio" name="q${n}s${i}" value="1"> ${labels[0]}</label>
          <label><input type="radio" name="q${n}s${i}" value="0"> ${labels[1]}</label></fieldset></div>`).join('')}</div>`;
      $('.q-input').addEventListener('change', (e) => {
        const m = e.target.name.match(/s(\d+)$/); if (!m) return; st.tf[m[1]] = e.target.value === '1'; updateActions();
      });
    } else if (q.type === 'order') {
      st.order = TLL.model.seededShuffle(q.steps, q.id);
      st.orderTouched = false;
      drawOrder();
    }
    function drawOrder(marks) {
      const list = st.order.map((si, pos) => `<li class="order-item ${marks ? (marks[pos] ? 'is-correct' : 'is-wrong') : ''}" data-pos="${pos}">
        <span class="pos" aria-hidden="true">${pos + 1}</span>
        <span class="prose">${marks ? `<span class="sr-only">${marks[pos] ? 'Correct position.' : 'Wrong position.'}</span>` : ''}${inp(q.steps[si])}</span>
        ${marks ? `<span class="mark small">${marks[pos] ? '✓ correct place' : '✗ belongs at ' + (si + 1)}</span>` :
          `<span class="moves"><button type="button" class="btn btn-small" data-move="-1" data-pos="${pos}" aria-label="Move step ${pos + 1} up" ${pos === 0 ? 'disabled' : ''}>Up</button>
          <button type="button" class="btn btn-small" data-move="1" data-pos="${pos}" aria-label="Move step ${pos + 1} down" ${pos === st.order.length - 1 ? 'disabled' : ''}>Down</button></span>`}
      </li>`).join('');
      $('.q-input').innerHTML = `<p class="muted small">Use Up and Down to put the statements in order (step 1 at the top).</p><ol class="order-list" aria-label="Proof steps in current order">${list}</ol>`;
    }
    $('.q-input').addEventListener('click', (e) => {
      const b = e.target.closest('[data-move]'); if (!b || st.done) return;
      const pos = +b.dataset.pos, d = +b.dataset.move, to = pos + d;
      [st.order[pos], st.order[to]] = [st.order[to], st.order[pos]];
      st.orderTouched = true; drawOrder(); updateActions();
      const again = $(`.order-list [data-pos="${to}"][data-move="${d}"]`) || $(`.order-list [data-pos="${to}"][data-move]`);
      if (again) again.focus();
      R().fixScroll(root);
    });

    /* ---- confidence ---- */
    if (opt.mode === 'learn' || opt.mode === 'diagnostic') {
      $('.q-conf').innerHTML = `<fieldset class="seg conf"><legend>How sure are you?${opt.mode === 'diagnostic' ? '' : ' <span class="muted small">(optional)</span>'}</legend>
        ${['Guessing', 'Unsure', 'Sure'].map((c, i) => `<label><input type="radio" name="c${n}" value="${i}"> ${c}</label>`).join('')}</fieldset>`;
      $('.q-conf').addEventListener('change', (e) => { st.conf = +e.target.value; updateActions(); });
    }

    /* ---- actions ---- */
    const hints = q.hints || [];
    function answered() {
      if (['mcq', 'roman', 'ns'].includes(q.type)) return st.choice != null;
      if (q.type === 'tfset') return Object.keys(st.tf).length === q.statements.length;
      if (q.type === 'order') return true;
      return false;
    }
    function updateActions() {
      const b = $('[data-act="check"]'); if (!b) return;
      const ok = answered() && (opt.mode !== 'diagnostic' || st.conf != null);
      b.disabled = !ok;
    }
    if (opt.mode === 'learn' || opt.mode === 'inline' || opt.mode === 'diagnostic') {
      const bm = TLL.store.state.bookmarks[q.id];
      $('.q-actions').innerHTML = `<button type="button" class="btn btn-primary" data-act="check" disabled>${opt.mode === 'diagnostic' ? 'Save and continue' : 'Check answer'}</button>
        ${opt.mode === 'learn' && hints.length ? `<button type="button" class="btn" data-act="hint">Hint <span class="muted small">(${hints.length} available)</span></button>` : ''}
        ${opt.mode === 'learn' ? `<button type="button" class="btn btn-quiet" data-act="giveup">Show solution</button>
        <button type="button" class="btn btn-quiet" data-act="bm" aria-pressed="${bm ? 'true' : 'false'}">${bm ? 'Bookmarked' : 'Bookmark'}</button>` : ''}`;
      if (opt.drill && TLL.store.state.settings.drillTimer) {
        $('.q-actions').insertAdjacentHTML('beforeend', `<span class="timer" data-timer aria-hidden="true">0:00 · target about 3:45</span>`);
        const tick = setInterval(() => {
          const t = $('[data-timer]'); if (!t || !root.isConnected || st.done) { clearInterval(tick); return; }
          const s = Math.floor((Date.now() - st.start) / 1000); t.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} · target about 3:45`;
          t.classList.toggle('low', s > 225);
        }, 1000);
      }
      $('.q-actions').addEventListener('click', (e) => {
        const b = e.target.closest('[data-act]'); if (!b) return;
        const a = b.dataset.act;
        if (a === 'check') check(false);
        else if (a === 'giveup') check(true);
        else if (a === 'hint') showHint(b);
        else if (a === 'bm') {
          const s = TLL.store.state.bookmarks;
          if (s[q.id]) delete s[q.id]; else s[q.id] = Date.now();
          TLL.store.save(); b.setAttribute('aria-pressed', s[q.id] ? 'true' : 'false'); b.textContent = s[q.id] ? 'Bookmarked' : 'Bookmark';
        }
      });
      updateActions();
    }
    function showHint(btn) {
      if (st.hints >= hints.length) return;
      st.hints++;
      const names = ['A small nudge', 'A stronger hint', 'Part of the method'];
      $('.q-hints').insertAdjacentHTML('beforeend', `<div class="hint-box" style="margin-top:.6rem"><span class="hint-title">Hint ${st.hints} of ${hints.length}: ${names[st.hints - 1] || ''}</span>${inp(hints[st.hints - 1])}</div>`);
      if (st.hints >= hints.length) { btn.disabled = true; btn.innerHTML = 'No more hints'; }
      else btn.innerHTML = `Next hint <span class="muted small">(${hints.length - st.hints} left)</span>`;
      R().fixScroll(root);
    }

    /* ---- marking ---- */
    function isCorrect() {
      if (['mcq', 'roman', 'ns'].includes(q.type)) return st.choice === q.answer;
      if (q.type === 'tfset') return q.statements.every((s, i) => st.tf[i] === s.t);
      if (q.type === 'order') return st.order.every((v, i) => v === i);
      return false;
    }
    function check(gaveUp) {
      if (st.done) return;
      st.done = true;
      const ok = !gaveUp && isCorrect();
      const ms = Date.now() - st.start;
      root.querySelectorAll('.q-input input, .q-conf input').forEach(i => { i.disabled = true; });
      $('.q-actions').innerHTML = '';
      let rec = null;
      if (opt.mode === 'learn' || opt.mode === 'diagnostic') {
        rec = TLL.store.recordAttempt({ qid: q.id, lesson: q.lesson, ctx: opt.ctx, ok, hints: st.hints, conf: st.conf, ms,
          choice: q.type === 'order' ? st.order.slice() : q.type === 'tfset' ? Object.assign({}, st.tf) : st.choice, solutionShown: !!gaveUp });
      }
      if (opt.mode !== 'diagnostic') { mark(); renderFeedback(ok, gaveUp); }
      if (opt.onAnswer) opt.onAnswer({ ok, rec, gaveUp, hints: st.hints, choice: st.choice, after: $('.q-after') });
    }
    function mark() {
      if (['mcq', 'roman', 'ns'].includes(q.type)) {
        root.querySelectorAll('.opt').forEach(o => {
          const i = +o.dataset.i; o.setAttribute('aria-disabled', 'true');
          if (i === q.answer) { o.classList.add('is-correct'); o.insertAdjacentHTML('beforeend', '<span class="mark">✓ Correct answer</span>'); }
          else if (i === st.choice) { o.classList.add('is-wrong'); o.insertAdjacentHTML('beforeend', '<span class="mark">✗ Your answer</span>'); }
        });
      } else if (q.type === 'tfset') {
        const labels = q.labels || ['True', 'False'];
        root.querySelectorAll('.tf-item').forEach(it => {
          const i = +it.dataset.i, s = q.statements[i], good = st.tf[i] === s.t;
          it.classList.add(good ? 'is-correct' : 'is-wrong');
          it.insertAdjacentHTML('beforeend', `<p class="small" style="margin-top:.4rem"><strong style="color:var(--${good ? 'ok' : 'bad'})">${good ? '✓' : '✗'} ${s.t ? labels[0] : labels[1]}.</strong> ${inp(s.why)}</p>`);
        });
      } else if (q.type === 'order') {
        drawOrder(st.order.map((v, i) => v === i));
      }
    }
    function renderFeedback(ok, gaveUp) {
      $('.q-feedback').innerHTML = feedbackHtml(q, { ok, gaveUp, choice: st.choice, exam, inline: opt.mode === 'inline' });
      wireFeedback(root.querySelector('.q-feedback'), q);
      R().fixScroll(root);
    }

    root.api = { check, getChoice: () => st.choice, state: st };
    if (opt.mode === 'review') { st.choice = opt.selected; st.done = true; root.querySelectorAll('input').forEach(i => i.disabled = true); mark(); renderFeedback(st.choice === q.answer, st.choice == null); }
    setTimeout(() => R().fixScroll(root), 0);
    return root;
  }

  function feedbackHtml(q, f) {
    const inp = (s) => R().inline(s, { exam: false });
    const blk = (s) => R().block(s, { exam: false });
    if (f.inline) {
      const note = q.notes && f.choice != null ? q.notes[f.choice] : '';
      return `<div class="feedback ${f.ok ? 'ok' : 'bad'}"><div class="verdict">${f.ok ? ICON.ok + ' Correct' : ICON.bad + ' Not quite'}</div>
        <div class="prose">${inp(note)}${!f.ok ? `<p style="margin-top:.5rem"><strong>Correct answer: ${LET[q.answer]}.</strong> ${inp(q.notes[q.answer])}</p>` : ''}</div></div>`;
    }
    const verdict = f.gaveUp ? `${ICON.bad} Solution shown` : f.ok ? `${ICON.ok} Correct` : `${ICON.bad} Not quite`;
    let why = '';
    if (q.notes) {
      why = `<details class="fb-section"><summary>Why each option is right or wrong</summary><ul class="opt-notes">${q.options.map((o, i) =>
        `<li><strong>${LET[i]}${i === q.answer ? ' ✓' : ''}</strong><span>${inp(q.notes[i])}</span></li>`).join('')}</ul></details>`;
    }
    const choiceNote = (!f.ok && q.notes && f.choice != null) ? `<div class="fb-section"><h3>About your choice (${LET[f.choice]})</h3><div class="prose">${inp(q.notes[f.choice])}</div></div>` : '';
    const mis = (!f.ok && q.mis && q.mis.length) ? `<div class="fb-section"><h3>A possible misconception</h3><div class="prose"><p>You may have ${inp(q.mis.map(t => TLL.misconceptions[t] ? TLL.misconceptions[t].text : '').filter(Boolean).slice(0, 2).join('; or you may have '))}.</p></div></div>` : '';
    const cards = (!f.ok && q.mis) ? suggestCards(q.mis) : [];
    const cardsHtml = cards.length ? `<div class="fb-section"><h3>Card for spaced review</h3>${cards.map(c => `<div class="row" style="margin:.3rem 0"><span class="prose" style="flex:1 1 14rem">${inp(c.front)}</span><button type="button" class="btn btn-small" data-addcard="${c.id}">Add to review</button></div>`).join('')}</div>` : '';
    return `<div class="feedback ${f.ok ? 'ok' : 'bad'}">
      <div class="verdict">${verdict}</div>
      ${choiceNote}
      <div class="fb-section"><h3>Decisive observation</h3><div class="prose">${inp(q.key)}</div></div>
      <div class="fb-section"><h3>Solution</h3><div class="prose">${blk(q.sol)}</div></div>
      ${why}
      ${mis}
      ${q.tip ? `<div class="fb-section"><h3>Next time</h3><div class="prose">${inp(q.tip)}</div></div>` : ''}
      ${cardsHtml}
      ${q.prov === 'official' ? '' : '<p class="small muted" style="margin-top:.8rem">Original question written for TMUA Logic Lab.</p>'}
    </div>`;
  }
  function suggestCards(tags) {
    const have = TLL.store.state.cards;
    const ids = [];
    tags.forEach(t => (TLL.misconceptions[t] ? TLL.misconceptions[t].cards : []).forEach(id => { if (!have[id] && !ids.includes(id)) ids.push(id); }));
    return ids.slice(0, 2).map(id => TLL.cards.find(c => c.id === id)).filter(Boolean);
  }
  function wireFeedback(box) {
    box.addEventListener('click', (e) => {
      const b = e.target.closest('[data-addcard]'); if (!b) return;
      TLL.app.addCard(b.dataset.addcard);
      b.disabled = true; b.textContent = 'Added'; toast('Card added to your review deck');
    });
  }

  /* ---------------------------------------------------------------- worked example */
  function worked(w, opts) {
    opts = opts || {};
    const inp = (s) => R().inline(s);
    const root = el(`<article class="worked" aria-labelledby="w-${w.id}">
      <p class="eyebrow">Worked example ${w.id.replace('W', '')}</p>
      <h3 id="w-${w.id}">${R().inline(w.title)}</h3>
      <div class="prose">${R().block(w.problem)}</div>
      <div class="row" style="margin-top:.6rem">
        <button type="button" class="btn" data-w="next">Reveal next step</button>
        <button type="button" class="btn btn-quiet" data-w="all">Show complete solution</button>
      </div>
      <ol aria-live="polite"></ol>
      <div class="takeaway" hidden><strong>Takeaway.</strong> ${inp(w.takeaway)}</div>
    </article>`);
    let shown = 0;
    const list = root.querySelector('ol');
    function reveal(k) {
      while (shown < k && shown < w.steps.length) {
        const s = w.steps[shown++];
        list.insertAdjacentHTML('beforeend', `<li><div><div class="prose">${R().block(s.do)}</div>${s.why ? `<div class="why">Why: ${inp(s.why)}</div>` : ''}</div></li>`);
      }
      if (shown >= w.steps.length) {
        root.querySelector('.takeaway').hidden = false;
        root.querySelector('.row').innerHTML = '<span class="muted small">All steps shown.</span>';
        if (opts.onDone) opts.onDone();
      }
      R().fixScroll(root);
    }
    root.querySelector('.row').addEventListener('click', (e) => {
      const b = e.target.closest('[data-w]'); if (!b) return;
      reveal(b.dataset.w === 'all' ? w.steps.length : shown + 1);
    });
    if (opts.expanded) reveal(w.steps.length);
    return root;
  }

  TLL.player = { question, worked, feedbackHtml, el, toast, LET, DIFF, lessonTitle };
})(window.TLL);
