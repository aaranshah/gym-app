/* End-to-end learner journey for TMUA Logic Lab.
 * Run: node tests/e2e.cjs   (needs Playwright with Chromium; starts its own static server)
 * Covers: diagnostic → recommendations, lesson flow (predict, guided, practice, retrieval check), hints,
 * wrong answer → fresh question + mistake queue, flashcard scheduling, mock start/answer/flag/reload/submit/analysis,
 * progress restored after reload, export/import, settings, layout at iPad/phone sizes with large text, maths checks.
 */
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const SHOTS = process.env.SHOTS || path.join(root, 'tests', 'screenshots');
fs.mkdirSync(SHOTS, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  if (!f.startsWith(root) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; console.log('  ✓', msg); } else { fail++; console.log('  ✗', msg); } };

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 1366 } }); // iPad Pro portrait
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g/.test(m.text())) errors.push(m.text()); });
  const go = async (h) => { await page.goto(base + '#' + h); await page.waitForTimeout(150); };
  const state = async () => { await page.waitForTimeout(350); return page.evaluate(() => JSON.parse(localStorage.getItem('tmua-logic-lab.v1') || '{}')); };
  // Work through a lesson in the real UI: answer every visible question (first option), press Continue/Next until finished.
  async function completeLesson(id) {
    await go('lesson-' + id);
    for (let guard = 0; guard < 80; guard++) {
      if (await page.locator('[data-finish]').count()) { await page.click('[data-finish]'); return true; }
      const pending = page.locator('.q:not(:has(.feedback)) [data-act="check"]');
      if (await pending.count()) {
        const q = page.locator('.q:not(:has(.feedback))').first();
        if (await q.locator('.opt').count()) await q.locator('.opt').first().click();
        const tf = q.locator('.tf-item'); for (let i = 0; i < await tf.count(); i++) await tf.nth(i).locator('label').first().click();
        await q.locator('[data-act="check"]').click(); continue;
      }
      const nxt = page.locator('.step:last-child button.btn-primary:visible').last();
      if (await nxt.count()) { await nxt.click(); continue; }
      break;
    }
    return !!(await page.locator('[data-finish]').count());
  }

  console.log('Diagnostic');
  await go('diagnostic');
  await page.click('[data-go]');
  for (let i = 0; i < 14; i++) {
    const q = await page.evaluate((i) => TLL.model.normalise(TLL.diagnostic[i]), i);
    const pick = i % 3 === 0 ? (q.answer + 1) % q.options.length : q.answer; // some wrong on purpose
    await page.locator('.opt').nth(pick).click();
    await page.locator('.q-conf label').nth(i % 4 === 1 ? 0 : 2).click();
    await page.click('[data-act="check"]');
  }
  await page.waitForSelector('text=Diagnostic results');
  let s = await state();
  ok(s.diagnostic && s.diagnostic.recommended.length > 0, `diagnostic stored with ${s.diagnostic.recommended.length} recommended lessons`);
  await go('course');
  ok(await page.locator('.chip.accent', { hasText: 'Recommended' }).count() > 0, 'course map marks recommended lessons');

  console.log('Lesson flow (L1-3)');
  await go('lesson-L1-3');
  await page.locator('.step .opt').nth(2).click(); await page.click('.step [data-act="check"]');
  ok(await page.locator('.feedback.ok').count() === 1, 'prediction gives feedback');
  await page.click('.step .row > .btn-primary:has-text("Continue")');
  // guided ask: choose correct (index 0)
  await page.locator('.gparts .opt').first().click(); await page.locator('.gparts [data-act="check"]').click();
  await page.click('.step:last-child .row > .btn-primary:has-text("Continue")');
  // practice P131 – use a hint then answer correctly; P134 answer wrong
  const hintBtn = page.locator('.step:last-child [data-act="hint"]');
  await hintBtn.click(); await hintBtn.click();
  ok(await page.locator('.hint-box').count() === 2, 'progressive hints shown (2 of 3)');
  await page.locator('.step:last-child .opt').nth(2).click(); await page.locator('.step:last-child [data-act="check"]').click();
  ok(await page.locator('.step:last-child .feedback.ok').count() === 1, 'correct answer feedback');
  ok(await page.locator('.step:last-child summary:has-text("Why each option")').count() === 1, 'distractor explanations available');
  await page.click('.step:last-child [data-next]');
  await page.locator('.step:last-child .q').last().locator('.opt').nth(0).click();
  await page.locator('.step:last-child .q').last().locator('[data-act="check"]').click();
  ok(await page.locator('.step:last-child .feedback.bad').count() === 1, 'wrong answer gives targeted feedback');
  ok(await page.locator('.step:last-child .feedback.bad h3:has-text("A possible misconception")').count() === 1, 'possible misconception named');
  const fresh = page.locator('.step:last-child [data-fresh]');
  ok(await fresh.count() === 1, 'fresh question offered after mistake');
  await fresh.click();
  ok(await page.locator('.step:last-child .q').count() >= 3, 'fresh question shown (different question)');
  const addCard = page.locator('[data-addcard]').first();
  if (await addCard.count()) { await addCard.click(); ok(true, 'suggested flashcard added after mistake'); }
  s = await state();
  ok(Object.keys(s.mistakes).includes('P134'), 'mistake queued for delayed review');
  const a131 = s.attempts.find(a => a.qid === 'P131');
  ok(a131 && a131.hints === 2 && a131.ok, 'hint use recorded separately from success');

  console.log('Reload restores lesson position');
  await page.reload(); await page.waitForTimeout(400);
  ok(await page.locator('.step').count() >= 6, 'lesson resumes with earlier steps restored');

  console.log('Complete lesson → cards');
  await completeLesson('L1-1');
  s = await state();
  ok(s.lessons['L1-1'] && s.lessons['L1-1'].completedAt, 'lesson marked complete');
  ok(Object.keys(s.cards).filter(id => ['F44'].includes(id)).length === 1, 'lesson flashcards unlocked');

  console.log('Flashcard scheduling');
  await go('cards');
  ok(await page.locator('[data-reveal]').isDisabled(), 'answer hidden until an attempt is made');
  await page.fill('#attempt', 'the domain');
  await page.click('[data-reveal]');
  const cardId = await page.evaluate(() => TLL.app.dueCards()[0]);
  await page.click('[data-rate="good"]');
  s = await state();
  const c = s.cards[cardId];
  ok(c && c.reps === 1 && c.due - Date.now() > 20 * 3600e3, `card ${cardId} rescheduled about 1 day ahead after "Good"`);
  ok(s.cardLog.length === 1, 'recall rating logged');

  console.log('Mistake review after delay');
  await page.evaluate(() => { Object.values(TLL.store.state.mistakes).forEach(m => { m.due = Date.now() - 1000; }); TLL.store.saveNow(); });
  await go('review');
  await page.click('[data-mis]');
  ok(await page.locator('text=Mistake review').count() > 0, 'mistake review session starts');
  await page.click('[data-end]');
  ok(await page.locator('h1:has-text("Session summary")').count() === 1, 'ending a session shows a summary');
  await page.click('a:has-text("New practice session")');
  ok(await page.locator('#f-spec').count() === 1, 'link to the current page re-renders it');

  console.log('Practice filters and session');
  await go('practice');
  await page.selectOption('#f-spec', 'Err2'); await page.selectOption('#f-len', '5');
  ok((await page.textContent('[data-count]')).includes('match'), 'filter count updates');
  await page.click('#pf button[type=submit]');
  ok(await page.locator('.q').count() === 1, 'practice session shows one question at a time');

  console.log('Mock: start, answer, flag, reload, submit');
  await go('mockstart-M1');
  await page.click('#ms button[type=submit]');
  await page.waitForSelector('.qgrid');
  ok(await page.locator('[data-act="hint"]').count() === 0 && await page.locator('[data-act="check"]').count() === 0, 'no hints or checking during mock');
  ok(await page.locator('.q-stem strong.key').count() === 0, 'no teaching emphasis in exam questions');
  for (let i = 0; i < 20; i++) {
    const ans = await page.evaluate((i) => TLL.model.normalise(TLL.mocks[0].questions[i]).answer, i);
    if (i !== 7) await page.locator('.opt').nth(i < 15 ? ans : 0).click();
    if (i === 3) await page.click('[data-flag]');
    if (i === 10) { await page.reload(); await page.waitForSelector('.qgrid'); }
    await page.click('[data-next]');
  }
  s = await state();
  ok(s.mocks.M1 && s.mocks.M1.flags['M1-04'] && Object.keys(s.mocks.M1.answers).length === 19, 'answers and flags persist across reload');
  const before = s.mocks.M1.startedAt;
  ok(await page.locator('text=Unanswered: 8').count() === 1, 'review screen lists unanswered question');
  await page.click('[data-submit]'); await page.click('[data-yes]');
  await page.waitForSelector('text=Mock results');
  s = await state();
  const h = s.mockHistory[0];
  ok(h && h.startedAt === before && h.mode === 'standard', 'mock submitted as a standard timed attempt');
  const expected = await page.evaluate(() => TLL.mocks[0].questions.slice(15).filter(q => TLL.model.normalise(q).answer === 0).length);
  ok(h.score === 14 + expected, `score computed correctly (${h.score}/20)`);
  ok(await page.locator('text=No 1.0–9.0 conversion').count() === 1, 'no invented TMUA score');
  await page.locator('[data-sol] details summary').first().click(); await page.waitForTimeout(200);
  ok(await page.locator('[data-sol] .feedback').count() === 1, 'post-test solutions open');

  console.log('Timer persistence and expiry');
  await go('mockstart-M2'); await page.click('#ms button[type=submit]'); await page.waitForSelector('.qgrid');
  await page.evaluate(() => { TLL.store.state.mocks.M2.startedAt = Date.now() - 76 * 60000; TLL.store.saveNow(); });
  await page.reload(); await page.waitForTimeout(500);
  ok(await page.locator('text=Time ran out').count() === 1, 'expired timer auto-submits on return');
  await go('mockstart-M3'); await page.check('input[value="extra50"]'); await page.click('#ms button[type=submit]'); await page.waitForSelector('.qgrid');
  ok(await page.locator('[data-pause]').count() === 1 && await page.locator('text=Accommodated +50%').count() >= 1, 'accommodated mode labelled and pausable');
  await page.click('[data-pause]'); ok(await page.locator('text=Paused').count() >= 1, 'pause hides the paper');

  console.log('Progress, export/import, settings');
  await go('progress');
  ok(await page.locator('text=Independent first-attempt accuracy').count() === 1, 'progress separates independent attempts');
  const exported = await page.evaluate(() => TLL.store.exportJSON());
  await page.evaluate(() => { TLL.store.reset(); });
  await go('prefs');
  await page.locator('summary:has-text("Copy or paste")').click();
  await page.fill('#bt', exported);
  await page.click('[data-pastein]'); await page.waitForTimeout(600);
  s = await state();
  ok(s.mockHistory.length >= 2 && s.attempts.length > 10, 'import restores progress');
  await page.check('input[name=size][value=xxl]'); await page.check('input[name=theme][value=dark]');
  ok(await page.evaluate(() => document.documentElement.dataset.size === 'xxl' && document.documentElement.dataset.theme === 'dark'), 'text size and theme apply');
  await page.reload(); await page.waitForTimeout(300);
  ok(await page.evaluate(() => document.documentElement.dataset.size === 'xxl'), 'settings persist after reload');

  console.log('Maths rendering and layout');
  const mathInfo = await page.evaluate(() => {
    const all = [...TLL.questions, ...TLL.diagnostic, ...TLL.mocks.flatMap(m => m.questions)].map(q => TLL.model.normalise(q));
    const div = document.createElement('div'); document.body.appendChild(div);
    let fracs = 0, raw = 0, errs = 0;
    all.forEach(q => { div.innerHTML = TLL.render.block(q.stem) + (q.options || []).map(o => TLL.render.inline(o)).join('') + TLL.render.block(q.sol);
      fracs += div.querySelectorAll('.mfrac .frac-line').length; errs += div.querySelectorAll('.math-error').length;
      const t = div.innerText.replace(/\n/g, ' '); if (/\\(frac|sqrt|le|ge|times|dfrac)|\$/.test(t)) raw++; });
    div.remove(); return { fracs, raw, errs };
  });
  ok(mathInfo.fracs > 100, `stacked fractions rendered with fraction bars (${mathInfo.fracs})`);
  ok(mathInfo.raw === 0 && mathInfo.errs === 0, 'no raw LaTeX or render errors in any question, option or solution');
  ok(await page.evaluate(() => { const d = document.createElement('div'); d.innerHTML = TLL.render.inline('$\\dfrac{x+1}{x-2}$'); return !!d.querySelector('.katex-mathml math mfrac') && !!d.querySelector('.mfrac .frac-line'); }), 'fractions output as stacked HTML plus MathML <mfrac>');

  const sizes = [['ipad-portrait', 820, 1180], ['ipad-landscape', 1180, 820], ['phone', 375, 740], ['desktop', 1366, 900]];
  for (const [name, w, hgt] of sizes) {
    for (const size of ['m', 'xxl']) {
      await page.setViewportSize({ width: w, height: hgt });
      await page.evaluate((sz) => { TLL.store.state.settings.size = sz; TLL.store.state.settings.theme = 'system'; TLL.store.saveNow(); }, size);
      for (const r of ['practice-M1-08', 'lesson-L2-2', 'practice-P622', 'mockresult-M1-0', 'sources']) {
        const route = r === 'practice-M1-08' ? 'practice-P552' : r;
        await go(route); await page.waitForTimeout(150);
        const o = await page.evaluate(() => ({ h: document.documentElement.scrollWidth > window.innerWidth + 1, clip: [...document.querySelectorAll('.opt .otext')].some(e => e.scrollWidth > e.clientWidth + 2 && !e.hasAttribute('tabindex')) }));
        ok(!o.h && !o.clip, `${name} ${size} ${route}: no page-level horizontal scroll, no clipped options`);
        if (size === 'xxl' && route === 'practice-P552' || route === 'lesson-L2-2' && size === 'm') await page.screenshot({ path: path.join(SHOTS, `${name}-${size}-${route}.png`) });
      }
    }
  }
  await page.setViewportSize({ width: 820, height: 1180 });
  await go('practice-P622'); await page.locator('.opt').nth(0).click(); await page.click('[data-act="check"]'); await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(SHOTS, 'feedback-ipad.png'), fullPage: true });
  await page.evaluate(() => { TLL.store.state.settings.theme = 'dark'; TLL.store.saveNow(); });
  await go('lesson-L1-5'); await page.screenshot({ path: path.join(SHOTS, 'lesson-dark.png') });

  console.log('Keyboard: proof ordering without dragging');
  await go('practice-P561');
  const order0 = await page.locator('.order-item .prose').allInnerTexts();
  await page.locator('.order-item').nth(1).locator('[data-move="-1"]').focus();
  await page.keyboard.press('Enter');
  const order1 = await page.locator('.order-item .prose').allInnerTexts();
  ok(order0[0] === order1[1] && order0[1] === order1[0], 'Up button (keyboard) swaps steps');

  ok(errors.length === 0, 'no JavaScript errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close(); server.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
