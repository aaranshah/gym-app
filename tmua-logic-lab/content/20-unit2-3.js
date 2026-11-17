/* Unit 2: Necessary and sufficient (Arg2). Unit 3: Quantifiers and negation (Arg3, Arg4). */
(function () {
  const r = String.raw;

  TLL.units.push(
    { id: 'U2', title: 'Necessary and sufficient', summary: 'Conditions that guarantee, conditions that are required, and how to classify them quickly.', spec: ['Arg2'] },
    { id: 'U3', title: 'Quantifiers and negation', summary: '“For all”, “some”, “there exists”, and negating any statement accurately.', spec: ['Arg3', 'Arg4'] }
  );

  /* ------------------------------------------------------------------ L2-1 */
  TLL.lessons.push({
    id: 'L2-1', unit: 'U2', title: 'Necessary and sufficient conditions', mins: 9, spec: ['Arg2'], prereq: ['L1-5'],
    objectives: [
      { id: 'L21a', text: 'Translate “A is sufficient for B” and “A is necessary for B” into implications.' },
      { id: 'L21b', text: 'Classify a condition as necessary, sufficient, both or neither by testing two directions.' }
    ],
    purpose: 'Classification questions appear regularly and reward a fixed two-direction routine.',
    refs: ['spec2026', 'notesLogic'],
    steps: [
      { k: 'predict', stem: r`Being in London is ______ for being in England.`,
        options: [r`necessary but not sufficient`, r`sufficient but not necessary`, r`necessary and sufficient`, r`neither`], answer: 1,
        notes: [r`You can be in England without being in London (in Leeds, say), so it is not necessary.`, r`Correct: being in London guarantees being in England, but England does not require London.`, r`Leeds shows it is not necessary.`, r`It is sufficient.`] },
      { k: 'idea', title: 'Two translations to memorise', body: r`- “A is **sufficient** for B” means **A guarantees B**: if A then B.
- “A is **necessary** for B” means **B cannot happen without A**: if B then A (equivalently, “B only if A”).
- “A is necessary and sufficient for B” means A if and only if B.

**Routine.** Write the two implications “if A then B” and “if B then A” and test each.

- If A then B true → A is sufficient.
- If B then A true → A is necessary.

Think in sets: if every case of A is a case of B, then A is the *smaller* condition, and it is sufficient for B.` },
      { k: 'diagram', d: { type: 'subset', inner: 'x > 3', outer: 'x > 1' }, alt: 'A small region labelled x greater than 3 drawn inside a larger region labelled x greater than 1. The inner condition is sufficient for the outer one; the outer condition is necessary for the inner one.', caption: 'Inner set: sufficient for the outer. Outer set: necessary for the inner.' },
      { k: 'worked', id: 'W10' },
      { k: 'worked', id: 'W11' },
      { k: 'guided', title: 'Your turn, with support', problem: r`For real $a$, $b$: is “$ab > 0$” necessary, sufficient, both or neither for “$a > 0$ and $b > 0$”?`,
        parts: [
          { ask: { stem: r`Is “if $ab > 0$ then $a > 0$ and $b > 0$” true?`, options: [r`Yes`, r`No`], answer: 1,
            notes: [r`Try two negative numbers.`, r`Correct: $a = b = -1$ gives $ab = 1 > 0$. So $ab > 0$ is not sufficient.`] } },
          { ask: { stem: r`Is “if $a > 0$ and $b > 0$ then $ab > 0$” true?`, options: [r`Yes`, r`No`], answer: 0,
            notes: [r`Correct: the product of two positives is positive. So $ab > 0$ is necessary.`, r`Two positive numbers always have a positive product.`] } },
          { show: r`Therefore “$ab > 0$” is **necessary but not sufficient** for “$a > 0$ and $b > 0$”.` }
        ] },
      { k: 'practice', ids: ['P211', 'P213'] },
      { k: 'check' },
      { k: 'summary', body: r`Sufficient: A guarantees B. Necessary: B needs A. Always test both implications.` }
    ]
  });

  TLL.worked.push(
    { id: 'W10', lesson: 'L2-1', title: 'Classifying a condition about squares',
      problem: r`For real $x$, classify “$x > 3$” as a condition for “$x^2 > 9$”.`,
      steps: [
        { do: r`Sufficient? If $x > 3$ then $x^2 > 9$: true, since squaring preserves order for positive numbers.`, why: 'Test “if A then B”.' },
        { do: r`Necessary? If $x^2 > 9$ then $x > 3$: false, since $x = -4$ gives $x^2 = 16 > 9$.`, why: 'Test “if B then A”.' },
        { do: r`So “$x > 3$” is **sufficient but not necessary** for “$x^2 > 9$”.`, why: '' }
      ],
      takeaway: 'Two tests, two conclusions. Do not stop after the first.' },
    { id: 'W11', lesson: 'L2-1', title: 'A condition that is both',
      problem: r`For integers $n$, classify “$n$ is even” as a condition for “$n^2$ is a multiple of 4”.`,
      steps: [
        { do: r`Sufficient? If $n = 2k$ then $n^2 = 4k^2$, a multiple of 4. True.`, why: 'Use the definition of even.' },
        { do: r`Necessary? If $n^2$ is a multiple of 4 then $n^2$ is even, so $n$ is even (an odd $n$ would give odd $n^2$). True.`, why: r`Using the contrapositive: odd $n$ gives odd $n^{2}$.` },
        { do: r`So “$n$ is even” is **necessary and sufficient**.`, why: '' }
      ],
      takeaway: 'When both directions hold, the two conditions are equivalent.' }
  );

  TLL.questions.push(
    { id: 'P211', lesson: 'L2-1', obj: 'L21b', spec: ['Arg2'], diff: 1, type: 'ns',
      stem: r`For real $x$, the condition “$x = 3$” is ______ for “$x^2 = 9$”.`,
      fwd: { t: true, why: r`If $x = 3$ then $x^2 = 9$.` },
      bwd: { t: false, why: r`$x = -3$ gives $x^2 = 9$ but $x \ne 3$.` },
      key: r`$x = 3$ guarantees $x^{2} = 9$, but $x^{2} = 9$ has another solution.`,
      sol: r`If $x = 3$ then $x^2 = 9$, so the condition is sufficient. But $x^2 = 9$ also allows $x = -3$, so it is not necessary.`,
      hints: [r`Test “if $x = 3$ then $x^{2} = 9$”.`, r`Test “if $x^{2} = 9$ then $x = 3$”.`, r`Does $x^{2} = 9$ have another solution?`],
      mis: ['nec-suff-swap'], tip: 'Sufficient = guarantees; necessary = required.' },

    { id: 'P212', lesson: 'L2-1', obj: 'L21a', spec: ['Arg2'], diff: 1, type: 'ns',
      stem: r`For a quadrilateral, “all four angles are right angles” is ______ for “it is a square”.`,
      fwd: { t: false, why: 'A 2 by 1 rectangle has four right angles but is not a square.' },
      bwd: { t: true, why: 'Every square has four right angles.' },
      key: 'Squares need right angles, but right angles alone give rectangles.',
      sol: 'Every square has four right angles, so the condition is necessary. A non-square rectangle shows it is not sufficient.',
      hints: ['Does four right angles guarantee a square?', 'Does every square have four right angles?', 'Think of a rectangle.'],
      mis: ['nec-suff-swap'], tip: 'A requirement that is not enough on its own is necessary but not sufficient.' },

    { id: 'P213', lesson: 'L2-1', obj: 'L21b', spec: ['Arg2'], diff: 2, type: 'ns',
      stem: r`For integers $n$, “$n$ is a multiple of 6” is ______ for “$n$ is a multiple of 4”.`,
      fwd: { t: false, why: r`$n = 6$ is a multiple of 6 but not of 4.` },
      bwd: { t: false, why: r`$n = 4$ is a multiple of 4 but not of 6.` },
      key: 'Find one number for each direction.',
      sol: r`$6$ shows the condition is not sufficient; $4$ shows it is not necessary. So it is neither.`,
      hints: ['Is every multiple of 6 a multiple of 4?', 'Is every multiple of 4 a multiple of 6?', 'Try 4 and 6 themselves.'],
      mis: ['nec-suff-swap'], tip: '“Neither” is a real option: test both directions honestly.' },

    { id: 'P214', lesson: 'L2-1', obj: 'L21b', spec: ['Arg2'], diff: 2, type: 'ns',
      stem: r`For positive integers $n$, “$n$ is odd” is ______ for “$n^2 + 1$ is even”.`,
      fwd: { t: true, why: r`$n$ odd ⇒ $n^2$ odd ⇒ $n^2 + 1$ even.` },
      bwd: { t: true, why: r`$n^2 + 1$ even ⇒ $n^2$ odd ⇒ $n$ odd (an even $n$ gives even $n^2$).` },
      key: r`$n^{2}$ has the same parity as $n$.`,
      sol: r`$n^2$ has the same parity as $n$, so $n^2 + 1$ is even exactly when $n$ is odd. Both directions hold.`,
      hints: [r`What is the parity of $n^{2}$ compared with $n$?`, 'Check both directions.', r`Even $n$ gives even $n^{2}$.`],
      mis: ['nec-suff-swap'], tip: r`Parity of $n^{2}$ always matches parity of $n$.` },

    { id: 'P215', lesson: 'L2-1', obj: 'L21a', spec: ['Arg2'], diff: 3, type: 'roman',
      stem: r`For real $x$, which of the following conditions are **necessary but not sufficient** for $x > 2$?`,
      parts: [
        { s: r`$x > 1$`, t: true, why: r`If $x > 2$ then $x > 1$ (necessary); $x = 1.5$ shows it is not sufficient.` },
        { s: r`$x^2 > 4$`, t: true, why: r`If $x > 2$ then $x^2 > 4$ (necessary); $x = -3$ shows it is not sufficient.` },
        { s: r`$x > 3$`, t: false, why: r`$x = 2.5$ satisfies $x > 2$ but not $x > 3$, so it is not necessary (it is sufficient).` }
      ],
      key: r`A necessary condition must hold for every $x > 2$.`,
      sol: r`I and II both hold whenever $x > 2$, and each also holds for some $x \le 2$ ($1.5$ and $-3$). III is sufficient but not necessary. So I and II only.`,
      hints: [r`Necessary for $x > 2$ means: every $x > 2$ satisfies it.`, r`Not sufficient means: some $x$ satisfies it without $x > 2$.`, r`Check each statement against $x = 2.5$.`],
      mis: ['nec-suff-swap'], tip: 'Necessary conditions are the bigger sets that contain the target.' },

    { id: 'P216', lesson: 'L2-1', obj: 'L21b', spec: ['Arg2', 'Prf2'], diff: 3, type: 'mcq', transfer: true,
      stem: r`Consider the equation $x^3 + kx = 0$, where $k$ is a real constant. Which statement is correct?`,
      options: [r`“$k > 0$” is necessary and sufficient for the equation to have exactly one real solution.`, r`“$k \ge 0$” is necessary and sufficient for the equation to have exactly one real solution.`, r`“$k \ge 0$” is sufficient but not necessary for the equation to have exactly one real solution.`, r`“$k \ge 0$” is necessary but not sufficient for the equation to have exactly one real solution.`], answer: 1,
      notes: [r`At $k = 0$ the equation is $x^3 = 0$, which has exactly one solution, so $k > 0$ is not necessary.`, r`Correct: $x(x^2 + k) = 0$ has the single solution $x = 0$ exactly when $x^2 = -k$ has no non-zero solution, that is $k \ge 0$.`, r`It is also necessary: if $k < 0$ there are three solutions.`, r`It is also sufficient.`],
      key: r`Factorise: $x(x^2 + k) = 0$; extra roots exist exactly when $-k > 0$.`,
      sol: r`$x^3 + kx = x(x^2 + k)$. The root $x = 0$ is always present. If $k < 0$, $x = \pm\sqrt{-k}$ are two further roots. If $k \ge 0$, $x^2 + k = 0$ has no non-zero real solution (at $k = 0$ the only solution is again $x = 0$). So exactly one real solution occurs if and only if $k \ge 0$.`,
      hints: ['Factorise the cubic.', r`When does $x^2 + k = 0$ have real solutions other than 0?`, r`Do not forget the boundary case $k = 0$.`],
      mis: ['missing-case', 'nec-suff-swap'], tip: r`Boundary values (here $k = 0$) often separate “necessary” from “sufficient”.` }
  );

  /* ------------------------------------------------------------------ L2-2 */
  TLL.lessons.push({
    id: 'L2-2', unit: 'U2', title: 'Conditions on intervals and in mathematical contexts', mins: 8, spec: ['Arg2'], prereq: ['L2-1'],
    objectives: [
      { id: 'L22a', text: 'Use number lines and solution sets to decide necessity and sufficiency.' },
      { id: 'L22b', text: 'Interpret wording such as “a necessary condition for P is Q” in algebra, trigonometry and functions.' }
    ],
    purpose: 'Paper 2 wraps necessary/sufficient around inequalities, trigonometric equations and quadratics. Solving each condition first turns it into a comparison of sets.',
    refs: ['spec2026', 'mayer2014'],
    steps: [
      { k: 'predict', stem: r`Is “$x > 5$” sufficient for “$x > 2$”?`,
        options: [r`Yes`, r`No`], answer: 0,
        notes: [r`Correct: every number greater than 5 is greater than 2. The set $x > 5$ sits inside the set $x > 2$.`, r`Every $x > 5$ also satisfies $x > 2$.`] },
      { k: 'idea', title: 'Solve, then compare sets', body: r`1. Solve each condition so you know its **solution set**.
2. If set A lies inside set B, then A is **sufficient** for B and B is **necessary** for A.
3. If the sets are equal, each is necessary and sufficient for the other.

Wording to translate carefully:

- “A necessary condition for P is Q” means **if P then Q**.
- “Q is a sufficient condition for P” means **if Q then P**.
- “P only if Q” means Q is necessary for P.` },
      { k: 'diagram', d: { type: 'numberline', min: -1, max: 7, marks: [2, 3], rows: [
        { label: '|x − 1| < 2  (−1 < x < 3)', from: -1, to: 3, openLeft: true, openRight: true },
        { label: '0 < x < 3', from: 0, to: 3, openLeft: true, openRight: true }
      ] }, alt: 'Two number lines. Top: the interval from −1 to 3, both ends open. Bottom: the interval from 0 to 3, both ends open, which lies inside the top interval.', caption: r`The interval $0 < x < 3$ lies inside $-1 < x < 3$, so “$0 < x < 3$” is sufficient for $|x - 1| < 2$ but not necessary.` },
      { k: 'worked', id: 'W12' },
      { k: 'worked', id: 'W13' },
      { k: 'guided', title: 'Your turn, with support', problem: r`For $0^\circ \le x < 360^\circ$, classify “$x = 30^\circ$” as a condition for “$\sin x = \tfrac{1}{2}$”.`,
        parts: [
          { show: r`Solution set of $\sin x = \tfrac{1}{2}$ in this interval: $x = 30^\circ$ or $x = 150^\circ$.` },
          { ask: { stem: r`So “$x = 30^\circ$” is…`, options: [r`sufficient but not necessary`, r`necessary but not sufficient`, r`necessary and sufficient`], answer: 0,
            notes: [r`Correct: $\{30^\circ\}$ lies inside $\{30^\circ, 150^\circ\}$, and $150^\circ$ shows it is not necessary.`, r`It guarantees the equation, so it is sufficient; $150^\circ$ shows it is not necessary.`, r`$x = 150^\circ$ also satisfies the equation.`] } }
        ] },
      { k: 'practice', ids: ['P221', 'P224'] },
      { k: 'check' },
      { k: 'summary', body: r`Solve each condition, then compare solution sets: the inner set is sufficient, the outer set is necessary.` }
    ]
  });

  TLL.worked.push(
    { id: 'W12', lesson: 'L2-2', title: 'Comparing a modulus inequality with an interval',
      problem: r`Classify “$0 < x < 3$” as a condition for “$|x - 1| < 2$”.`,
      steps: [
        { do: r`$|x - 1| < 2 \iff -2 < x - 1 < 2 \iff -1 < x < 3$.`, why: 'Solve each condition before comparing.' },
        { do: r`Every $x$ in $0 < x < 3$ lies in $-1 < x < 3$, so the condition is **sufficient**.`, why: 'Inner set → sufficient.' },
        { do: r`$x = -\tfrac{1}{2}$ satisfies $|x - 1| < 2$ but not $0 < x < 3$, so it is **not necessary**.`, why: 'A point in the outer set but not the inner set.' }
      ],
      takeaway: 'Turn each condition into an interval; then the classification is a picture.' },
    { id: 'W13', lesson: 'L2-2', title: 'A quadratic inequality as a condition',
      problem: r`Classify “$x^2 - 5x + 6 < 0$” as a condition for “$x > 1$”.`,
      steps: [
        { do: r`$x^2 - 5x + 6 = (x - 2)(x - 3) < 0 \iff 2 < x < 3$.`, why: 'Factorise and use the shape of the parabola.' },
        { do: r`Every $x$ with $2 < x < 3$ has $x > 1$: **sufficient**.`, why: '' },
        { do: r`$x = 5$ has $x > 1$ but $(5-2)(5-3) = 6 > 0$: **not necessary**.`, why: '' }
      ],
      takeaway: 'The smaller solution set is the sufficient condition.' }
  );

  TLL.questions.push(
    { id: 'P221', lesson: 'L2-2', obj: 'L22a', spec: ['Arg2'], diff: 2, type: 'mcq',
      stem: r`Which of the following is a **necessary** condition for $x^2 < 4$?`,
      options: [r`$x < 2$`, r`$0 < x < 2$`, r`$x > -1$`, r`$x^2 < 1$`], answer: 0,
      notes: [r`Correct: $x^2 < 4 \iff -2 < x < 2$, and every such $x$ is less than 2.`, r`$x = -1$ has $x^2 < 4$ but is not in $0 < x < 2$.`, r`$x = -1.5$ has $x^2 < 4$ but is not greater than $-1$.`, r`$x = 1.5$ has $x^2 < 4$ but $x^2 \ge 1$. (This condition is sufficient, not necessary.)`],
      key: r`A necessary condition must contain the whole solution set $-2 < x < 2$.`,
      sol: r`$x^2 < 4$ means $-2 < x < 2$. A necessary condition must hold for every such $x$. Only $x < 2$ contains the whole interval.`,
      hints: [r`Solve $x^2 < 4$.`, 'A necessary condition must be true for every solution.', 'Which option’s set contains the whole interval?'],
      mis: ['nec-suff-swap'], tip: 'Necessary = contains the target set.' },

    { id: 'P222', lesson: 'L2-2', obj: 'L22a', spec: ['Arg2'], diff: 1, type: 'ns',
      stem: r`For real $x$, “$x^3 > 8$” is ______ for “$x > 2$”.`,
      fwd: { t: true, why: r`Cubing is strictly increasing, so $x^3 > 8 = 2^3$ gives $x > 2$.` },
      bwd: { t: true, why: r`If $x > 2$ then $x^3 > 8$, again because cubing is strictly increasing.` },
      key: 'Cubing preserves order for all real numbers.',
      sol: r`Because $t \mapsto t^3$ is strictly increasing on all real numbers, $x^3 > 2^3 \iff x > 2$. The two conditions are equivalent.`,
      hints: ['Is cubing order-preserving for negative numbers too?', 'Compare with squaring, which is not.', 'Check both directions.'],
      mis: ['nec-suff-swap', 'many-to-one'], tip: 'Odd powers preserve order; even powers do not.' },

    { id: 'P223', lesson: 'L2-2', obj: 'L22b', spec: ['Arg2'], diff: 2, type: 'mcq', pre: ['R6'],
      stem: r`Complete the sentence correctly: “A necessary condition for $2^x > 8$ is …”`,
      options: [r`$x > 4$`, r`$x > 2$`, r`$3 < x < 5$`, r`$x < 3$`], answer: 1,
      notes: [r`$x = 3.5$ gives $2^x > 8$ but not $x > 4$, so $x > 4$ is not necessary.`, r`Correct: $2^x > 8 \iff x > 3$, and every $x > 3$ has $x > 2$.`, r`$x = 6$ gives $2^x > 8$ but is outside this interval.`, r`No solution of $2^x > 8$ satisfies this.`],
      key: r`$2^x > 8 \iff x > 3$; a necessary condition must contain all of $x > 3$.`,
      sol: r`Since $2^x$ is increasing, $2^x > 8 = 2^3 \iff x > 3$. “A necessary condition for P is Q” means “if P then Q”. If $x > 3$ then $x > 2$, so $x > 2$ is necessary.`,
      hints: [r`Solve $2^{x} > 8$ first.`, '“A necessary condition for P is Q” means “if P then Q”.', r`Which option holds for every $x > 3$?`],
      mis: ['nec-suff-swap'], tip: 'Translate “a necessary condition for P is Q” as “P only if Q”.' },

    { id: 'P224', lesson: 'L2-2', obj: 'L22b', spec: ['Arg2'], diff: 2, type: 'ns', pre: ['R5'],
      stem: r`For $0^\circ \le x < 360^\circ$, “$\cos x = 0$” is ______ for “$x = 90^\circ$”.`,
      fwd: { t: false, why: r`$x = 270^\circ$ also has $\cos x = 0$.` },
      bwd: { t: true, why: r`If $x = 90^\circ$ then $\cos x = 0$.` },
      key: r`$\cos x = 0$ has two solutions here: $90^\circ$ and $270^\circ$.`,
      sol: r`If $x = 90^\circ$ then $\cos x = 0$, so the condition is necessary. But $\cos 270^\circ = 0$ too, so it is not sufficient.`,
      hints: [r`Solve $\cos  x = 0$ in the interval.`, r`Does $\cos  x = 0$ guarantee $x = 90^\circ$?`, r`Does $x = 90^\circ$ guarantee $\cos  x = 0$?`],
      mis: ['nec-suff-swap', 'many-to-one'], tip: 'Trigonometric equations usually have several solutions in an interval.' },

    { id: 'P225', lesson: 'L2-2', obj: 'L22a', spec: ['Arg2'], diff: 2, type: 'mcq',
      stem: r`Let $a$ and $b$ be real numbers. Which of the following is **sufficient** for $a^2 > b^2$?`,
      options: [r`$a > b$`, r`$a > b > 0$`, r`$|a| \ge |b|$`, r`$a \ne b$`], answer: 1,
      notes: [r`$a = 1$, $b = -2$: $a > b$ but $a^2 < b^2$.`, r`Correct: $a^2 - b^2 = (a - b)(a + b)$ is a product of two positive numbers.`, r`$a = b = 1$ gives $|a| \ge |b|$ but $a^2 = b^2$.`, r`$a = 1$, $b = -1$ gives $a^2 = b^2$.`],
      key: r`$a^2 - b^2 = (a-b)(a+b)$: both factors positive when $a > b > 0$.`,
      sol: r`If $a > b > 0$ then $a - b > 0$ and $a + b > 0$, so $a^2 - b^2 > 0$. Each other option has a counterexample shown beside it.`,
      hints: [r`A sufficient condition must guarantee $a^{2} > b^{2}$ in every case.`, 'Try negative values and equal values.', r`Factorise $a^2 - b^2$.`],
      mis: ['nec-suff-swap', 'counterexample-form'], tip: 'To reject a “sufficient” option, find one case where it holds but the target fails.' },

    { id: 'P226', lesson: 'L2-2', obj: 'L22b', spec: ['Arg2'], diff: 3, type: 'tfset', pre: ['R6'],
      stem: r`For real $x$, decide whether each statement is true or false.`,
      statements: [
        { s: r`“$x > 0$” is sufficient for $\sqrt{x}$ to be defined.`, t: true, why: r`$\sqrt{x}$ is defined for $x \ge 0$, which includes every $x > 0$.` },
        { s: r`“$x \ge 0$” is necessary for $\log_{10} x$ to be defined.`, t: true, why: r`$\log_{10} x$ needs $x > 0$, and $x > 0$ implies $x \ge 0$.` },
        { s: r`“$x \ne 2$” is sufficient for $\dfrac{1}{x-2}$ to be positive.`, t: false, why: r`$x = 1$ gives $\dfrac{1}{-1} = -1 < 0$.` },
        { s: r`“$x > 2$” is necessary and sufficient for $\dfrac{1}{x-2} > 0$.`, t: true, why: r`A reciprocal is positive exactly when the denominator is positive.` }
      ],
      key: 'Compare each condition with the exact set where the expression is defined or positive.',
      sol: r`Statements 1, 2 and 4 are true; statement 3 is false $(x = 1)$.`,
      hints: [r`Where is $\sqrt{x}$ defined? Where is $\log  x$ defined?`, 'When is a reciprocal positive?', 'For “sufficient”, look for a case where the condition holds but the target fails.'],
      mis: ['domain', 'nec-suff-swap'], tip: 'Domain conditions are natural necessary conditions.' }
  );

  /* ------------------------------------------------------------------ L3-1 */
  TLL.lessons.push({
    id: 'L3-1', unit: 'U3', title: 'All, some and there exists', mins: 8, spec: ['Arg3'], prereq: ['L1-3'],
    objectives: [
      { id: 'L31a', text: 'Interpret “for all”, “for some” (at least one) and “there exists”.' },
      { id: 'L31b', text: 'Decide truth: one counterexample disproves “for all”; one example proves “there exists”.' },
      { id: 'L31c', text: 'Recognise that swapping “for every” and “there exists” changes the meaning.' }
    ],
    purpose: 'Quantifiers decide what kind of evidence you need: a proof for every case, or a single example.',
    refs: ['spec2026', 'notesLogic'],
    steps: [
      { k: 'predict', stem: r`“Some prime numbers are even.” Is this true?`,
        options: [r`Yes`, r`No, only one prime is even`], answer: 0,
        notes: [r`Correct: in mathematics “some” means **at least one**, and 2 is an even prime.`, r`One is enough: “some” means at least one.`] },
      { k: 'idea', title: 'What evidence each quantifier needs', body: r`- “**For all** $x$, P($x$)” (also “every”, “any”): true only if P holds in **every** case. One counterexample makes it false.
- “**For some** $x$, P($x$)” or “**there exists** $x$ such that P($x$)”: true if P holds in **at least one** case. One example makes it true; to make it false, you must show P fails in every case.

“Some” does **not** imply “not all”, and it does not mean “exactly one”.

**Order matters.** “For every $x$ there exists $y$ with $y > x$” lets $y$ depend on $x$ (true for real numbers). “There exists $y$ such that for every $x$, $y > x$” demands one $y$ that beats everything (false).` },
      { k: 'worked', id: 'W14' },
      { k: 'worked', id: 'W15' },
      { k: 'guided', title: 'Your turn, with support', problem: r`For integers $m$, $n$: decide (a) “for every $n$ there exists $m$ with $n + m = 0$”; (b) “there exists $m$ such that for every $n$, $n + m = 0$”.`,
        parts: [
          { ask: { stem: r`Is (a) true?`, options: [r`Yes: choose $m = -n$`, r`No`], answer: 0,
            notes: [r`Correct: $m$ may depend on $n$.`, r`For each $n$, $m = -n$ works.`] } },
          { ask: { stem: r`Is (b) true?`, options: [r`Yes`, r`No: a single $m$ cannot work for both $n = 0$ and $n = 1$`], answer: 1,
            notes: [r`$n = 0$ forces $m = 0$, but then $n = 1$ gives $1 \ne 0$.`, r`Correct: one fixed $m$ would have to equal $-n$ for every $n$ at once.`] } }
        ] },
      { k: 'practice', ids: ['P311', 'P313'] },
      { k: 'check' },
      { k: 'summary', body: r`“For all” needs every case; “some/there exists” needs one case. Swapping the order of quantifiers changes the meaning.` }
    ]
  });

  TLL.worked.push(
    { id: 'W14', lesson: 'L3-1', title: 'An existence claim and a universal claim about one quadratic',
      problem: r`Decide: (a) there exists a real $x$ with $x^2 + x + 1 = 0$; (b) for all real $x$, $x^2 + x + 1 > 0$.`,
      steps: [
        { do: r`Discriminant: $1^2 - 4 \times 1 \times 1 = -3 < 0$, so there are no real roots. (a) is **false**.`, why: r`To disprove an existence claim we must rule out every $x$: the discriminant does this at once.` },
        { do: r`Complete the square: $x^2 + x + 1 = \left(x + \tfrac{1}{2}\right)^2 + \tfrac{3}{4}$.`, why: 'Shows the minimum value directly.' },
        { do: r`A square is $\ge 0$, so the expression is $\ge \tfrac{3}{4} > 0$ for every $x$. (b) is **true**.`, why: '' }
      ],
      takeaway: 'Disproving “there exists” and proving “for all” both need an argument that covers every case.' },
    { id: 'W15', lesson: 'L3-1', title: 'Swapping quantifiers',
      problem: r`For real numbers, decide: (a) for every $x$ there exists $y$ with $y > x$; (b) there exists $y$ such that for every $x$, $y > x$.`,
      steps: [
        { do: r`(a) Given any $x$, choose $y = x + 1$. Then $y > x$. **True**.`, why: r`Here $y$ may depend on $x$.` },
        { do: r`(b) Suppose such a $y$ existed. Take $x = y$: then $y > y$, which is false. **False**.`, why: r`A single $y$ must beat every $x$, including $x = y$.` }
      ],
      takeaway: r`“For every $x$ there is $y$” allows $y$ to change with $x$; “there is $y$ for every $x$” does not.` }
  );

  TLL.questions.push(
    { id: 'P311', lesson: 'L3-1', obj: 'L31a', spec: ['Arg3'], diff: 1, type: 'mcq',
      stem: r`Which one of the following statements is true?`,
      options: [r`For all real $x$, $x^2 > 0$.`, r`There exists a real $x$ with $x^2 < 0$.`, r`For some real $x$, $x^2 = x$.`, r`For all real $x$, $x^2 \ge x$.`], answer: 2,
      notes: [r`False at $x = 0$.`, r`No real square is negative.`, r`Correct: $x = 0$ or $x = 1$.`, r`False at $x = \tfrac{1}{2}$.`],
      key: 'For “some”, one example is enough.',
      sol: r`$x = 1$ gives $x^2 = x$, so “for some real $x$, $x^2 = x$” is true. The others fail at $x = 0$, for every $x$, and at $x = \tfrac{1}{2}$ respectively.`,
      hints: ['For “for all”, look for one failure.', 'For “there exists”/“some”, look for one success.', r`Try $x = 0, 1$ and $\tfrac{1}{2}$.`],
      mis: ['examples-prove'], tip: r`Test 0, 1 and $\tfrac{1}{2}$ first for claims about squares.` },

    { id: 'P312', lesson: 'L3-1', obj: 'L31a', spec: ['Arg3'], diff: 1, type: 'mcq',
      stem: r`In mathematics, “Some multiples of 4 are multiples of 6” means:`,
      options: [r`at least one multiple of 4 is a multiple of 6`, r`exactly one multiple of 4 is a multiple of 6`, r`not every multiple of 4 is a multiple of 6`, r`more than one multiple of 4 is a multiple of 6`], answer: 0,
      notes: [r`Correct: “some” means “at least one”.`, r`“Some” does not mean “exactly one”.`, r`This is a separate (also true) claim; “some” does not say “not all”.`, r`“Some” only promises one.`],
      key: '“Some” = “at least one”.',
      sol: 'The specification defines “for some” as “for at least one”. (The statement is true: 12 is a multiple of both.)',
      hints: ['How many examples does “some” promise?', 'Does “some” rule out “all”?', 'Recall the specification’s wording.'],
      mis: ['some-not-all'], tip: '“Some” promises one; it neither denies nor asserts more.' },

    { id: 'P313', lesson: 'L3-1', obj: 'L31c', spec: ['Arg3'], diff: 3, type: 'tfset',
      stem: r`All variables are real numbers. Decide whether each statement is true or false.`,
      statements: [
        { s: r`For every $x$ there is a $y$ with $y^2 = x$.`, t: false, why: r`$x = -1$: no real $y$ has $y^2 = -1$.` },
        { s: r`For every $y$ there is an $x$ with $x = y^2$.`, t: true, why: r`Take $x = y^2$.` },
        { s: r`There is a $y$ such that $y \le x^2$ for every $x$.`, t: true, why: r`$y = 0$ works since $x^2 \ge 0$.` },
        { s: r`For every $x$ there exists $y$ with $xy = 1$.`, t: false, why: r`$x = 0$: $0 \times y = 0 \ne 1$.` }
      ],
      key: 'Ask who chooses first and whether the later choice may depend on the earlier one.',
      sol: 'Statements 2 and 3 are true; 1 and 4 are false (reasons beside each).',
      hints: ['Read left to right: the first quantifier chooses first.', 'Look for a troublesome first choice (negative numbers, zero).', r`For “there is $y$ for every $x$”, try $y = 0$.`],
      mis: ['quantifier-order'], tip: r`Zero and negative numbers are the usual troublemakers for “for every $x$, there is $y$”.` },

    { id: 'P314', lesson: 'L3-1', obj: 'L31b', spec: ['Arg3', 'Prf1'], diff: 3, type: 'mcq', pre: ['R1'],
      stem: r`Consider the statement: “There exists a positive integer $n$ such that $n^2 + 1$ is a multiple of 3.” Which is correct?`,
      options: [r`True: $n = 5$ gives $26$.`, r`False, because every square leaves remainder 0 or 1 when divided by 3.`, r`False, because $n^2 + 1$ is always even.`, r`It cannot be decided without checking every positive integer.`], answer: 1,
      notes: [r`$26 = 3 \times 8 + 2$ is not a multiple of 3.`, r`Correct: so $n^2 + 1$ leaves remainder 1 or 2, never 0.`, r`For even $n$, $n^2 + 1$ is odd; and evenness is irrelevant anyway.`, r`A remainder argument covers every $n$ at once.`],
      key: 'Cases by remainder mod 3 cover all integers.',
      sol: r`Every integer is $3k$, $3k + 1$ or $3k + 2$. Their squares are $9k^2$, $9k^2 + 6k + 1$ and $9k^2 + 12k + 4$, leaving remainders $0$, $1$, $1$. So $n^2 + 1$ leaves remainder $1$ or $2$, never $0$. The statement is false.`,
      hints: [r`To show “there exists” is false, you need an argument covering every $n$.`, r`Consider the remainder of $n$ when divided by 3.`, r`Square each of $3k, 3k + 1, 3k + 2$.`],
      mis: ['examples-prove', 'calc-slip'], tip: 'Remainder cases turn infinitely many checks into three.' },

    { id: 'P315', lesson: 'L3-1', obj: 'L31b', spec: ['Arg3'], diff: 2, type: 'mcq', pre: ['R4'],
      stem: r`Let $f(x) = x^2 - 2x$. Which one of the following statements is **false**?`,
      options: [r`There exists $x$ with $f(x) < 0$.`, r`For all $x$, $f(x) \ge -1$.`, r`There exists $x$ with $f(x) = -2$.`, r`For all $x > 2$, $f(x) > 0$.`], answer: 2,
      notes: [r`True: $f(1) = -1$.`, r`True: $f(x) = (x - 1)^2 - 1 \ge -1$.`, r`Correct (this is false): the minimum value of $f$ is $-1$.`, r`True: $f(x) = x(x - 2)$, and both factors are positive for $x > 2$.`],
      key: r`Completing the square: $f(x) = (x-1)^2 - 1$, minimum $-1$.`,
      sol: r`$f(x) = (x - 1)^2 - 1$ takes every value $\ge -1$ and no value below. So $f(x) = -2$ is impossible, and the third statement is false.`,
      hints: ['Complete the square.', r`What is the range of $f$?`, 'Which value is outside the range?'],
      mis: ['calc-slip'], tip: 'A function’s range answers many existence questions at once.' },

    { id: 'P316', lesson: 'L3-1', obj: 'L31c', spec: ['Arg3'], diff: 4, type: 'mcq', transfer: true,
      stem: r`Consider the two statements:

S: For every positive real number $\varepsilon$ there exists a positive integer $N$ such that $\dfrac{1}{N} < \varepsilon$.

T: There exists a positive integer $N$ such that for every positive real number $\varepsilon$, $\dfrac{1}{N} < \varepsilon$.

Which is correct?`,
      options: [r`S and T are both true.`, r`S is true and T is false.`, r`S is false and T is true.`, r`S and T are both false.`], answer: 1,
      notes: [r`T requires one fixed $N$ to work for every $\varepsilon$, including tiny ones.`, r`Correct: in S, $N$ may depend on $\varepsilon$; in T it may not.`, r`S is true: choose any integer $N > \tfrac{1}{\varepsilon}$.`, r`S is true.`],
      key: r`In T a single $N$ must beat every $\varepsilon$, including $\varepsilon = \dfrac{1}{N}$.`,
      sol: r`S: given $\varepsilon > 0$, choose an integer $N > \tfrac{1}{\varepsilon}$; then $\tfrac{1}{N} < \varepsilon$. True. T: for any fixed $N$, take $\varepsilon = \tfrac{1}{N}$; then $\tfrac{1}{N} < \tfrac{1}{N}$ is false. So T is false.`,
      hints: ['In which statement may N depend on ε?', 'In T, fix N first. Can you choose an ε that defeats it?', r`Try $\varepsilon = \tfrac{1}{N}$.`],
      mis: ['quantifier-order'], tip: 'To refute “there is one N for all ε”, let ε depend on the N you are given.' }
  );

  /* ------------------------------------------------------------------ L3-2 */
  TLL.lessons.push({
    id: 'L3-2', unit: 'U3', title: 'Negating “and”, “or” and inequalities', mins: 7, spec: ['Arg4'], prereq: ['L1-2'],
    objectives: [
      { id: 'L32a', text: 'Negate “A and B” as “not A or not B”, and “A or B” as “not A and not B”.' },
      { id: 'L32b', text: r`Negate compound inequalities and conditions such as $ab = 0$.` }
    ],
    purpose: 'Negations appear as answer options, inside contrapositives and at the start of proofs by contradiction.',
    refs: ['spec2026', 'notesLogic'],
    steps: [
      { k: 'predict', stem: r`What is the negation of “$n$ is even **and** $n > 10$” (for integers $n$)?`,
        options: [r`$n$ is odd and $n \le 10$`, r`$n$ is odd or $n \le 10$`, r`$n$ is odd and $n < 10$`], answer: 1,
        notes: [r`$n = 4$ is not “even and $> 10$”, yet it is not “odd and $\le 10$”. The connective must change.`, r`Correct: the original fails as soon as either part fails.`, r`Wrong connective and wrong boundary.`] },
      { k: 'idea', title: 'Swap the connective, negate each part', body: r`- not (A **and** B) = (not A) **or** (not B)
- not (A **or** B) = (not A) **and** (not B)

Why: “A and B” fails as soon as **either** part fails; “A or B” fails only when **both** parts fail.

Useful cases:

- $ab = 0$ means “$a = 0$ or $b = 0$”, so $ab \ne 0$ means “$a \ne 0$ **and** $b \ne 0$”.
- $-2 < x \le 5$ means “$-2 < x$ and $x \le 5$”, so its negation is “$x \le -2$ **or** $x > 5$”.

(These are often called De Morgan’s laws. You do not need the name.)` },
      { k: 'worked', id: 'W16' },
      { k: 'worked', id: 'W17' },
      { k: 'guided', title: 'Your turn, with support', problem: r`Negate: “the triangle is isosceles or right-angled”.`,
        parts: [
          { ask: { stem: r`Which is the negation?`, options: [r`The triangle is not isosceles and not right-angled.`, r`The triangle is not isosceles or not right-angled.`, r`The triangle is scalene or obtuse.`], answer: 0,
            notes: [r`Correct: an “or” statement fails only when both parts fail.`, r`An isosceles triangle that is not right-angled satisfies this and the original, so it is not the negation.`, r`“Not right-angled” does not mean “obtuse” (it could be acute).`] } }
        ] },
      { k: 'practice', ids: ['P321', 'P324'] },
      { k: 'check' },
      { k: 'summary', body: r`Negate each part and swap and ↔ or. Keep boundaries: the negation of $<$ is $\ge$.` }
    ]
  });

  TLL.worked.push(
    { id: 'W16', lesson: 'L3-2', title: 'Negating an “or” of inequalities',
      problem: r`Negate “$x > 1$ or $x < -1$” and simplify.`,
      steps: [
        { do: r`not ($x > 1$ or $x < -1$) = ($x \le 1$) and ($x \ge -1$).`, why: 'Negate each part and change “or” to “and”.' },
        { do: r`That is $-1 \le x \le 1$, or equivalently $|x| \le 1$.`, why: 'Combine the two inequalities.' }
      ],
      takeaway: r`The original says $|x| > 1$; its negation is $|x| \le 1$.` },
    { id: 'W17', lesson: 'L3-2', title: 'When is a product non-zero?',
      problem: r`A student writes: “$(x - 1)(x - 5) \ne 0$, so $x \ne 1$ or $x \ne 5$.” Correct the statement.`,
      steps: [
        { do: r`$(x - 1)(x - 5) = 0$ means “$x = 1$ or $x = 5$”.`, why: 'A product is zero when at least one factor is zero.' },
        { do: r`So $(x - 1)(x - 5) \ne 0$ means “$x \ne 1$ **and** $x \ne 5$”.`, why: 'Negating “or” gives “and”.' },
        { do: r`The student’s version is satisfied by $x = 1$ (since $1 \ne 5$), where the product is $0$. It is wrong.`, why: 'Test a value to confirm.' }
      ],
      takeaway: 'Non-zero product: every factor non-zero (“and”).' }
  );

  TLL.questions.push(
    { id: 'P321', lesson: 'L3-2', obj: 'L32a', spec: ['Arg4'], diff: 1, type: 'mcq',
      stem: r`What is the negation of “$x \ge 2$ and $y < 3$”?`,
      options: [r`$x < 2$ and $y \ge 3$`, r`$x < 2$ or $y \ge 3$`, r`$x \le 2$ or $y > 3$`, r`$x < 2$ or $y > 3$`], answer: 1,
      notes: [r`The connective must change to “or”.`, r`Correct: negate each part and swap “and” for “or”.`, r`Boundaries are wrong: $x = 2$ satisfies $x \ge 2$.`, r`$y = 3$ is missing: it makes $y < 3$ false.`],
      key: 'not (A and B) = not A or not B.',
      sol: r`not ($x \ge 2$) is $x < 2$; not ($y < 3$) is $y \ge 3$; “and” becomes “or”.`,
      hints: ['Negate each part separately.', 'Then decide which connective joins them.', 'Check boundary values.'],
      mis: ['negation-swap', 'negation-extreme'], tip: 'Swap the connective and keep the boundaries.' },

    { id: 'P322', lesson: 'L3-2', obj: 'L32a', spec: ['Arg4'], diff: 1, type: 'mcq',
      stem: r`For a positive integer $n$, “It is not true that ($n$ is prime or $n$ is even)” is equivalent to:`,
      options: [r`$n$ is not prime or $n$ is odd`, r`$n$ is not prime and $n$ is odd`, r`$n$ is prime and $n$ is odd`, r`$n$ is not prime and $n$ is even`], answer: 1,
      notes: [r`The connective must change to “and”.`, r`Correct.`, r`A prime would satisfy the original “or”.`, r`An even number satisfies the original.`],
      key: 'not (A or B) = not A and not B.',
      sol: r`“Prime or even” fails only when $n$ is neither prime nor even: $n$ is not prime and $n$ is odd (for example 1, 9, 15).`,
      hints: ['When is an “or” statement false?', 'Both parts must fail.', 'Not even = odd for integers.'],
      mis: ['negation-swap'], tip: '“Or” fails only when everything fails.' },

    { id: 'P323', lesson: 'L3-2', obj: 'L32b', spec: ['Arg4'], diff: 1, type: 'mcq',
      stem: r`Which values of real $x$ make “not ($x < 1$ or $x > 4$)” true?`,
      options: [r`$1 \le x \le 4$`, r`$1 < x < 4$`, r`$x \le 1$ or $x \ge 4$`, r`$x \ge 1$`], answer: 0,
      notes: [r`Correct: $x \ge 1$ and $x \le 4$.`, r`$x = 1$ and $x = 4$ also work.`, r`This is close to the original statement, not its negation.`, r`$x = 5$ satisfies $x \ge 1$ but $5 > 4$.`],
      key: 'not (A or B) = not A and not B.',
      sol: r`not ($x < 1$) and not ($x > 4$): $x \ge 1$ and $x \le 4$, so $1 \le x \le 4$.`,
      hints: ['Negate each part.', 'Change “or” to “and”.', 'Include the endpoints?'],
      mis: ['negation-swap', 'negation-extreme'], tip: 'Draw both parts on a number line.' },

    { id: 'P324', lesson: 'L3-2', obj: 'L32b', spec: ['Arg4'], diff: 2, type: 'mcq',
      stem: r`For real $x$, the statement $(x - 1)(x - 5) \ne 0$ means:`,
      options: [r`$x \ne 1$ or $x \ne 5$`, r`$x \ne 1$ and $x \ne 5$`, r`$x = 1$ and $x = 5$`, r`$x \ne 1$ only`], answer: 1,
      notes: [r`$x = 1$ satisfies this (since $1 \ne 5$), yet the product is $0$.`, r`Correct: a product is non-zero only when every factor is non-zero.`, r`Impossible, and not a negation.`, r`$x = 5$ also makes the product zero.`],
      key: r`Product $= 0 \iff$ ($x = 1$ or $x = 5$); negate to get “and”.`,
      sol: r`$(x - 1)(x - 5) = 0 \iff x = 1$ or $x = 5$. Negating gives $x \ne 1$ and $x \ne 5$.`,
      hints: ['When is the product zero?', 'Negate that “or” statement.', r`Test $x = 1$ in each option.`],
      mis: ['negation-swap'], tip: 'Non-zero product ⇔ all factors non-zero.' },

    { id: 'P325', lesson: 'L3-2', obj: 'L32a', spec: ['Arg4'], diff: 2, type: 'tfset',
      stem: r`Each line shows a statement and a proposed negation. Decide whether each proposed negation is correct.`,
      labels: ['Correct', 'Incorrect'],
      statements: [
        { s: r`“$x$ is positive and even” → “$x$ is not positive or $x$ is not even”`, t: true, why: 'Negate each part and swap “and” for “or”.' },
        { s: r`“$f(0) = 0$ or $f(1) = 0$” → “$f(0) \ne 0$ or $f(1) \ne 0$”`, t: false, why: r`It should be “$f(0) \ne 0$ and $f(1) \ne 0$”.` },
        { s: r`“$-3 < x \le 2$” → “$x \le -3$ or $x > 2$”`, t: true, why: 'Negate each inequality, keep boundaries, change “and” to “or”.' },
        { s: r`“both $a$ and $b$ are rational” → “both $a$ and $b$ are irrational”`, t: false, why: 'It should be “at least one of a, b is irrational”.' }
      ],
      key: 'Swap the connective; “both” negates to “at least one is not”.',
      sol: '1 and 3 are correct negations; 2 and 4 are not.',
      hints: ['Check whether the connective was swapped.', '“Both” is an “and”.', 'Check boundaries.'],
      mis: ['negation-swap', 'negation-extreme'], tip: '“Both are” negates to “at least one is not”.' },

    { id: 'P326', lesson: 'L3-2', obj: 'L32a', spec: ['Arg4', 'Prf2'], diff: 2, type: 'mcq', transfer: true,
      stem: r`Let $p(x)$ be a polynomial. It is known to be **false** that “$p(1) > 0$ and $p(2) > 0$”. Which of the following must be true?`,
      options: [r`$p(1) \le 0$ and $p(2) \le 0$`, r`$p(1) \le 0$ or $p(2) \le 0$`, r`$p(1) < 0$ or $p(2) < 0$`, r`$p(x) = 0$ has a root between 1 and 2`], answer: 1,
      notes: [r`$p(1) = -1$, $p(2) = 5$ makes the original false but this option false.`, r`Correct: negating “and” gives “or”, and $>$ negates to $\le$.`, r`$p(1) = 0$, $p(2) = 5$ makes the original false but this option false.`, r`$p(x) = x - 5$ has $p(1), p(2) < 0$ and no root between 1 and 2.`],
      key: 'not (A and B) = not A or not B.',
      sol: r`The negation of “$p(1) > 0$ and $p(2) > 0$” is “$p(1) \le 0$ or $p(2) \le 0$”, which is exactly what must be true.`,
      hints: ['Write the negation of the given “and” statement.', r`What is the negation of $p(1) > 0$?`, 'Test each other option with a simple polynomial.'],
      mis: ['negation-swap', 'negation-extreme'], tip: 'A false “and” tells you only that at least one part fails.' }
  );

  /* ------------------------------------------------------------------ L3-3 */
  TLL.lessons.push({
    id: 'L3-3', unit: 'U3', title: 'Negating implications and quantified statements', mins: 9, spec: ['Arg4', 'Arg3'], prereq: ['L3-1', 'L3-2'],
    objectives: [
      { id: 'L33a', text: 'Negate “for all” as “there exists … not”, and “there exists” as “for all … not”.' },
      { id: 'L33b', text: 'Negate “if A then B” as “A and not B”.' },
      { id: 'L33c', text: 'Negate statements with several quantifiers or an implication inside a quantifier.' }
    ],
    purpose: 'These negations are the core of Arg4 and are needed to set up proofs by contradiction correctly.',
    refs: ['spec2026', 'notesLogic'],
    steps: [
      { k: 'predict', stem: r`What is the negation of “All swans are white”?`,
        options: [r`No swans are white.`, r`At least one swan is not white.`, r`All swans are not white.`], answer: 1,
        notes: [r`That is far stronger than needed; one non-white swan is enough to make the original false.`, r`Correct: “for all” negates to “there exists … not”.`, r`This means “no swan is white”, again too strong.`] },
      { k: 'idea', title: 'Rules for negation', body: r`- not (for all $x$, P) = **there exists** $x$ such that **not** P.
- not (there exists $x$ such that P) = **for all** $x$, **not** P.
- not (if A then B) = **A and not B**. (An implication fails exactly when A holds and B fails.)

For a universal implication: not (for all $x$, if A then B) = there exists $x$ with A **and** not B. That is precisely a counterexample.

With several quantifiers, work from left to right, switching each quantifier and moving “not” inwards:

not (for every $x$ there exists $y$ with P) = there exists $x$ such that for every $y$, not P.` },
      { k: 'worked', id: 'W18' },
      { k: 'worked', id: 'W19' },
      { k: 'guided', title: 'Your turn, with support', problem: r`Negate: “Every student in the class passed at least one exam.”`,
        parts: [
          { show: r`Structure: for every student, there exists an exam that they passed.` },
          { ask: { stem: r`Which is the negation?`, options: [r`Some student passed no exam.`, r`Every student failed at least one exam.`, r`Some student failed at least one exam.`], answer: 0,
            notes: [r`Correct: there exists a student such that for every exam, they did not pass it.`, r`This keeps “every student” and is not the negation.`, r`Failing one exam is compatible with passing another.`] } }
        ] },
      { k: 'practice', ids: ['P331', 'P332'] },
      { k: 'check' },
      { k: 'summary', body: r`Switch each quantifier, move “not” inwards, and remember: the negation of “if A then B” is “A and not B”.` }
    ]
  });

  TLL.worked.push(
    { id: 'W18', lesson: 'L3-3', title: 'Negating a universal implication',
      problem: r`Negate: “For every real $x$, if $x > 1$ then $x^2 > x$.”`,
      steps: [
        { do: r`Switch the quantifier: “There exists a real $x$ such that not (if $x > 1$ then $x^2 > x$).”`, why: 'not (for all) = there exists … not.' },
        { do: r`Negate the implication: “$x > 1$ and $x^2 \le x$”.`, why: 'not (if A then B) = A and not B.' },
        { do: r`Result: “There exists a real $x$ with $x > 1$ and $x^2 \le x$.” (This negation is false, since the original is true.)`, why: 'The negation is not another implication.' }
      ],
      takeaway: 'The negation of a universal implication is the existence of a counterexample.' },
    { id: 'W19', lesson: 'L3-3', title: 'Negating a statement with two quantifiers',
      problem: r`Negate: “For every positive integer $n$ there is a prime greater than $n$.”`,
      steps: [
        { do: r`Structure: for every $n$, there exists a prime $p$ with $p > n$.`, why: 'Identify each quantifier in order.' },
        { do: r`Negation: there exists $n$ such that for every prime $p$, $p \le n$.`, why: 'Switch both quantifiers and negate the inside.' },
        { do: r`In words: “There is a positive integer $n$ that is at least as large as every prime”, that is, there are only finitely many primes.`, why: 'Translating back helps you check the meaning.' }
      ],
      takeaway: 'Switch every quantifier, then negate the final condition.' }
  );

  TLL.questions.push(
    { id: 'P331', lesson: 'L3-3', obj: 'L33a', spec: ['Arg4'], diff: 1, type: 'mcq',
      stem: r`What is the negation of “Every integer $n$ satisfies $n^2 \ge n$”?`,
      options: [r`Every integer $n$ satisfies $n^2 < n$.`, r`No integer $n$ satisfies $n^2 \ge n$.`, r`There is an integer $n$ with $n^2 < n$.`, r`There is an integer $n$ with $n^2 \le n$.`], answer: 2,
      notes: [r`Too strong: one failure is enough to negate “every”.`, r`Also too strong.`, r`Correct: “for all” negates to “there exists … not”.`, r`$n^2 \le n$ is not the negation of $n^2 \ge n$ (both hold at $n = 1$).`],
      key: 'not (for all, P) = there exists, not P.',
      sol: r`The negation of “for every $n$, $n^2 \ge n$” is “there exists $n$ with $n^2 < n$”.`,
      hints: ['How many failures does it take to make “every” false?', 'Negate the inequality carefully.', 'Switch “every” to “there is”.'],
      mis: ['quantifier-negation', 'negation-extreme'], tip: 'Negating “every” needs only one exception.' },

    { id: 'P332', lesson: 'L3-3', obj: 'L33b', spec: ['Arg4'], diff: 1, type: 'mcq',
      stem: r`What is the negation of “If it rains, then the match is cancelled”?`,
      options: [r`If it rains, then the match is not cancelled.`, r`If it does not rain, then the match is cancelled.`, r`It rains and the match is not cancelled.`, r`It does not rain and the match is cancelled.`], answer: 2,
      notes: [r`This is another implication; the negation is not an “if … then” statement.`, r`Unrelated to the negation.`, r`Correct: an implication fails exactly when A holds and B fails.`, r`This situation is compatible with the original.`],
      key: 'not (if A then B) = A and not B.',
      sol: 'The statement is false exactly when it rains and the match is not cancelled, so that is the negation.',
      hints: ['When is the original statement broken?', 'The negation describes that situation.', 'It will not be an “if … then …” statement.'],
      mis: ['implication-negation'], tip: 'Negation of an implication = “A and not B”.' },

    { id: 'P333', lesson: 'L3-3', obj: 'L33a', spec: ['Arg4'], diff: 1, type: 'mcq',
      stem: r`What is the negation of “There exists a real $x$ such that $f(x) = 0$”?`,
      options: [r`For every real $x$, $f(x) \ne 0$.`, r`There exists a real $x$ such that $f(x) \ne 0$.`, r`For every real $x$, $f(x) = 0$.`, r`There is no real $x$ such that $f(x) \ne 0$.`], answer: 0,
      notes: [r`Correct: “there exists” negates to “for all … not”.`, r`This can be true at the same time as the original.`, r`This is not a negation.`, r`This means $f(x) = 0$ for all $x$.`],
      key: 'not (there exists, P) = for all, not P.',
      sol: r`To deny that a root exists, every real $x$ must fail to be a root: for every real $x$, $f(x) \ne 0$.`,
      hints: ['What would show that no root exists?', 'Switch the quantifier.', 'Negate the equation.'],
      mis: ['quantifier-negation'], tip: r`“No $x$ does P” = “every $x$ does not P”.` },

    { id: 'P334', lesson: 'L3-3', obj: 'L33c', spec: ['Arg4', 'Arg3'], diff: 3, type: 'mcq',
      stem: r`What is the negation of “For every real $x$, there exists a real $y$ with $x + y = 0$”?`,
      options: [r`For every real $x$, there exists a real $y$ with $x + y \ne 0$.`, r`There exists a real $x$ such that for every real $y$, $x + y \ne 0$.`, r`There exists a real $y$ such that for every real $x$, $x + y \ne 0$.`, r`For every real $y$, there exists a real $x$ with $x + y \ne 0$.`], answer: 1,
      notes: [r`Quantifiers must be switched.`, r`Correct: switch both quantifiers in order and negate the equation.`, r`The order of the variables has been changed.`, r`Quantifiers switched and reordered; not the negation.`],
      key: 'Switch each quantifier, keep the order, negate the inner condition.',
      sol: r`not (for every $x$, there exists $y$, $x + y = 0$) = there exists $x$ such that not (there exists $y$, $x + y = 0$) = there exists $x$ such that for every $y$, $x + y \ne 0$.`,
      hints: ['Work from left to right.', r`“For every $x$” becomes “there exists $x$”.`, r`“There exists $y$” becomes “for every $y$”.`],
      mis: ['quantifier-negation', 'quantifier-order'], tip: 'Keep the variables in the same order when negating.' },

    { id: 'P335', lesson: 'L3-3', obj: 'L33b', spec: ['Arg4', 'Arg3'], diff: 2, type: 'mcq',
      stem: r`Statement: “For all positive integers $n$, if $n$ is prime then $n$ is odd.” Which option gives the negation **and** correctly says which of the statement and its negation is true?`,
      options: [r`Negation: “There is a positive integer $n$ that is prime and even.” The negation is true.`, r`Negation: “Every prime is even.” The original is true.`, r`Negation: “There is a prime $n$ that is odd.” The negation is true.`, r`Negation: “There is a positive integer $n$ that is not prime and is odd.” The original is true.`], answer: 0,
      notes: [r`Correct: $n = 2$ is prime and even, so the negation is true and the original is false.`, r`Wrong negation, and the original is false.`, r`This is not the negation; it agrees with the original.`, r`This negates the wrong part.`],
      key: r`Negation of “for all $n$, if A then B” is “there exists $n$ with A and not B”.`,
      sol: r`The negation is “there exists a positive integer $n$ which is prime and not odd”, that is, prime and even. Since $2$ is prime and even, the negation is true and the original statement is false.`,
      hints: ['Negate the quantifier, then negate the implication.', 'not (if A then B) = A and not B.', 'Is there an even prime?'],
      mis: ['implication-negation', 'quantifier-negation'], tip: 'A true negation means you have found a counterexample to the original.' },

    { id: 'P336', lesson: 'L3-3', obj: 'L33c', spec: ['Arg4'], diff: 3, type: 'mcq',
      stem: r`What is the negation of: “Some function in the set has a maximum point and no minimum point”?`,
      options: [r`Every function in the set has a minimum point and no maximum point.`, r`No function in the set has a maximum point.`, r`Every function in the set has no maximum point or has a minimum point.`, r`Some function in the set has a minimum point and no maximum point.`], answer: 2,
      notes: [r`This swaps the two features instead of negating them.`, r`Too strong: a function with both a maximum and a minimum would also make the original false for it.`, r`Correct: for every function, not (maximum and no minimum) = no maximum or has a minimum.`, r`This is not a negation.`],
      key: 'not (some, A and B) = every, (not A or not B).',
      sol: r`“Some $f$ has (max and no min)” negates to “every $f$ fails to have (max and no min)”, which is “every $f$ has no max or has a min”.`,
      hints: ['First switch “some” to “every”.', 'Then negate “A and not B”.', 'not (A and not B) = not A or B.'],
      mis: ['quantifier-negation', 'negation-swap'], tip: 'Do the quantifier first, then the connective.' }
  );
})();
