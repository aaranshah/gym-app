/* Unit 6: Errors in proofs (Err1, Err2). Unit 7: Mixed reasoning and exam technique (Prf5).
   Unit 8: Maths toolkit refreshers (Section 1 content that Paper 2 relies on). */
(function () {
  const r = String.raw;

  TLL.units.push(
    { id: 'U6', title: 'Errors in proofs', summary: 'Division by zero, irreversible steps, inequalities, many-to-one functions, domains, and finding the first invalid step.', spec: ['Err1', 'Err2'] },
    { id: 'U7', title: 'Mixed reasoning and exam technique', summary: 'Several statements at once, long chains, strategic testing and time management.', spec: ['Prf5'] },
    { id: 'U8', title: 'Maths toolkit', summary: 'Short refreshers of Section 1 content that Paper 2 questions lean on. Not a full Section 1 course.', spec: [] }
  );

  /* ------------------------------------------------------------------ L6-1 */
  TLL.lessons.push({
    id: 'L6-1', unit: 'U6', title: 'Algebra errors: zero, cancelling and squaring', mins: 9, spec: ['Err2', 'Err1'], prereq: ['L4-2'],
    objectives: [
      { id: 'L61a', text: 'Spot division by an expression that might be zero (for example, concluding b = c from ab = ac).' },
      { id: 'L61b', text: 'Recognise one-way steps (squaring, taking square roots) that lose or create solutions.' }
    ],
    purpose: r`The specification names “if $ab = ac$ then $b = c$” as a common invalid deduction. These errors appear in many purported proofs.`,
    refs: ['spec2026', 'notesLogic'],
    steps: [
      { k: 'predict', stem: r`Solve $x^2 = 3x$. A student divides by $x$ and gets $x = 3$. Is that complete?`,
        options: [r`Yes`, r`No: $x = 0$ is also a solution`], answer: 1,
        notes: [r`Dividing by $x$ assumes $x \ne 0$.`, r`Correct: $x^2 - 3x = x(x - 3) = 0$ gives $x = 0$ or $x = 3$.`] },
      { k: 'idea', title: 'One-way steps', body: r`Some algebraic steps only work in one direction.

- **Dividing by an expression** is only valid if it is non-zero. From $ab = ac$ you may conclude “$a = 0$ or $b = c$”, not “$b = c$”. Safer: move everything to one side and factorise.
- **Squaring both sides** is one-way: $a = b \Rightarrow a^2 = b^2$, but not the reverse. Solving equations by squaring can create **extra (extraneous) solutions**, so check answers in the original equation.
- **Square-rooting both sides**: $a^2 = b^2$ gives $a = \pm b$, that is $|a| = |b|$.

An argument made of one-way steps proves only the direction it travels in.` },
      { k: 'worked', id: 'W35' },
      { k: 'worked', id: 'W36' },
      { k: 'guided', title: 'Your turn, with support', problem: r`Solve $x(x - 2) = 3(x - 2)$.`,
        parts: [
          { ask: { stem: r`What is the safest first step?`, options: [r`Rearrange to $(x - 2)(x - 3) = 0$.`, r`Divide both sides by $x - 2$.`, r`Expand and divide by $x$.`], answer: 0,
            notes: [r`Correct: factorising keeps every solution.`, r`This loses $x = 2$.`, r`Dividing by $x$ is also risky.`] } },
          { show: r`So $x = 2$ or $x = 3$.` }
        ] },
      { k: 'practice', ids: ['P611', 'P614'] },
      { k: 'check' },
      { k: 'summary', body: r`Never divide by something that might be zero: factorise instead. Squaring can create solutions, so check them. Square roots give $\pm$.` }
    ]
  });

  TLL.worked.push(
    { id: 'W35', lesson: 'L6-1', title: r`The classic “proof” that $2 = 1$`,
      problem: r`Find the error: Let $a = b$. Then $a^2 = ab$, so $a^2 - b^2 = ab - b^2$, so $(a + b)(a - b) = b(a - b)$, so $a + b = b$, so $2b = b$, so $2 = 1$.`,
      steps: [
        { do: r`Check each step. Up to $(a + b)(a - b) = b(a - b)$, every step is valid.`, why: 'Work line by line from the top.' },
        { do: r`The next step divides both sides by $a - b$.`, why: '' },
        { do: r`But $a = b$, so $a - b = 0$. Division by zero is invalid; this is the **first invalid step**.`, why: r`This is the error “$ab = ac \Rightarrow b = c$” with $a - b$ playing the role of the zero factor.` },
        { do: r`(The later step from $2b = b$ to $2 = 1$ also divides by $b$, which could be zero too; but the first error is earlier.)`, why: 'Questions usually ask for the first error.' }
      ],
      takeaway: 'When a “proof” reaches nonsense, look for a division by an expression that is zero.' },
    { id: 'W36', lesson: 'L6-1', title: 'Squaring creates an extra solution',
      problem: r`Solve $\sqrt{x + 2} = x$.`,
      steps: [
        { do: r`Square: $x + 2 = x^2$, so $x^2 - x - 2 = 0$, so $(x - 2)(x + 1) = 0$.`, why: 'Squaring is allowed, but only in the forward direction.' },
        { do: r`Candidates: $x = 2$ or $x = -1$.`, why: '' },
        { do: r`Check in the original: $x = 2$: $\sqrt{4} = 2$ ✓. $x = -1$: $\sqrt{1} = 1 \ne -1$ ✗.`, why: r`The square root is never negative, so $x = -1$ cannot work.` },
        { do: r`So the only solution is $x = 2$.`, why: '' }
      ],
      takeaway: 'After squaring, substitute every candidate back into the original equation.' }
  );

  TLL.questions.push(
    { id: 'P611', lesson: 'L6-1', obj: 'L61a', spec: ['Err2'], diff: 1, type: 'mcq',
      stem: r`A student solves $x^2 = 5x$ by writing “divide both sides by $x$: $x = 5$”. What is the error?`,
      options: [r`There is no error.`, r`The solution $x = 0$ has been lost by dividing by $x$.`, r`The answer should be $x = -5$.`, r`Equations with $x^2$ always have two different positive solutions.`], answer: 1,
      notes: [r`$x = 0$ is a solution that has been lost.`, r`Correct: $x(x - 5) = 0$ gives $x = 0$ or $x = 5$.`, r`$(-5)^2 = 25 \ne -25$.`, r`False in general.`],
      key: r`Dividing by $x$ assumes $x \ne  0$.`,
      sol: r`$x^2 - 5x = x(x - 5) = 0$, so $x = 0$ or $x = 5$. Dividing by $x$ silently assumes $x \ne 0$ and loses $x = 0$.`,
      hints: [r`What does dividing by $x$ assume?`, r`Check $x = 0$ in the original.`, 'Factorise instead.'],
      mis: ['divide-zero'], tip: 'Factorise rather than divide by a variable.' },

    { id: 'P612', lesson: 'L6-1', obj: 'L61a', spec: ['Err2', 'Err1'], diff: 2, type: 'mcq',
      stem: r`“(1) $x(x - 2) = 3(x - 2)$. (2) Therefore $x = 3$.” Which statement about this argument is correct?`,
      options: [r`It is correct and complete.`, r`Step (2) divides by $x - 2$, which might be zero, and loses the solution $x = 2$.`, r`Step (2) should give $x = -3$.`, r`Step (1) is false for every $x$.`], answer: 1,
      notes: [r`$x = 2$ also satisfies (1).`, r`Correct.`, r`No sign change is involved.`, r`Both $x = 2$ and $x = 3$ satisfy (1).`],
      key: r`$ab = ac$ does not imply $b = c$ when $a = 0$.`,
      sol: r`Rearranging: $(x - 2)(x - 3) = 0$, so $x = 2$ or $x = 3$. Dividing by $x - 2$ loses $x = 2$.`,
      hints: ['Which expression was divided by?', 'Could it be zero?', r`Substitute $x = 2$.`],
      mis: ['divide-zero'], tip: 'Look for the cancelled factor and set it to zero.' },

    { id: 'P613', lesson: 'L6-1', obj: 'L61b', spec: ['Err2', 'Err1'], diff: 2, type: 'mcq',
      stem: r`A student argues: “$a^2 = b^2 \;\Rightarrow\; \sqrt{a^2} = \sqrt{b^2} \;\Rightarrow\; a = b$.” Where is the error?`,
      options: [r`In the first step: you cannot take square roots of both sides.`, r`In the second step: $\sqrt{a^2} = |a|$, not $a$.`, r`There is no error.`, r`The error is that $a^2$ might be negative.`], answer: 1,
      notes: [r`Taking square roots is fine here since both sides are non-negative.`, r`Correct: the argument only gives $|a| = |b|$.`, r`$a = 1$, $b = -1$ is a counterexample to the conclusion.`, r`Real squares are never negative.`],
      key: r`$\sqrt{a^2} = |a|$.`,
      sol: r`$\sqrt{a^2} = \sqrt{b^2}$ means $|a| = |b|$, so $a = \pm b$. The step to $a = b$ is invalid ($a = 1$, $b = -1$).`,
      hints: [r`Test $a = 1, b = -1$.`, r`What is $\sqrt{(-1)^2}$?`, 'Which step fails for that pair?'],
      mis: ['irreversible', 'many-to-one'], tip: r`$\sqrt{a^{2}} = |a|$ always.` },

    { id: 'P614', lesson: 'L6-1', obj: 'L61b', spec: ['Err2'], diff: 2, type: 'mcq',
      stem: r`What are the real solutions of $\sqrt{2x + 3} = x$?`,
      options: [r`$x = 3$ and $x = -1$`, r`$x = 3$ only`, r`$x = -1$ only`, r`There are no real solutions.`], answer: 1,
      notes: [r`$x = -1$ gives $\sqrt{1} = 1 \ne -1$; it was created by squaring.`, r`Correct.`, r`$x = -1$ fails in the original equation.`, r`$x = 3$ works: $\sqrt{9} = 3$.`],
      key: 'Squaring may introduce extra solutions; check in the original.',
      sol: r`Squaring: $2x + 3 = x^2$, so $(x - 3)(x + 1) = 0$, giving candidates $3$ and $-1$. In the original, $x = 3$ gives $3 = 3$ but $x = -1$ gives $1 = -1$. Only $x = 3$.`,
      hints: ['Square both sides and solve.', 'Check each candidate in the original equation.', 'Can a square root equal a negative number?'],
      mis: ['irreversible'], tip: r`In $\sqrt{\ldots} = \text{RHS}$, a solution needs $\text{RHS} \ge 0$.` },

    { id: 'P615', lesson: 'L6-1', obj: 'L61b', spec: ['Err2', 'Arg1'], diff: 1, type: 'mcq',
      stem: r`Consider: “$x = -2 \;\Rightarrow\; x^2 = 4 \;\Rightarrow\; x = 2$.” Which implication is false?`,
      options: [r`The first: $x = -2 \Rightarrow x^2 = 4$.`, r`The second: $x^2 = 4 \Rightarrow x = 2$.`, r`Both are false.`, r`Neither is false.`], answer: 1,
      notes: [r`$(-2)^2 = 4$, so this is true.`, r`Correct: $x^2 = 4$ also allows $x = -2$.`, r`The first is true.`, r`The chain ends with $x = 2$ despite starting from $x = -2$.`],
      key: 'Squaring is one-way.',
      sol: r`$x = -2 \Rightarrow x^2 = 4$ is true. $x^2 = 4 \Rightarrow x = 2$ is false, because $x = -2$ satisfies $x^2 = 4$.`,
      hints: ['Test each arrow separately.', r`Does $x^{2} = 4$ force $x = 2$?`, 'Which arrow is the reverse of squaring?'],
      mis: ['irreversible', 'converse'], tip: 'Check each arrow in a chain separately.' },

    { id: 'P616', lesson: 'L6-1', obj: 'L61a', spec: ['Err1', 'Err2'], diff: 3, type: 'mcq', transfer: true,
      stem: r`A “proof” that $4 = 3$:

(1) Suppose $a + b = c$.
(2) Then $4a + 4b - 4c = 3a + 3b - 3c$.
(3) So $4(a + b - c) = 3(a + b - c)$.
(4) Dividing by $a + b - c$ gives $4 = 3$.

Which is the first incorrect step?`,
      options: [r`(1)`, r`(2)`, r`(3)`, r`(4)`], answer: 3,
      notes: [r`An assumption, not an error.`, r`Both sides equal $0$ when $a + b = c$, so (2) is true.`, r`A correct factorisation of (2).`, r`Correct: $a + b - c = 0$ by (1), so this divides by zero.`],
      key: 'Any expression that the assumption forces to be 0 cannot be divided by.',
      sol: r`From (1), $a + b - c = 0$. Steps (2) and (3) are true statements ($0 = 0$). Step (4) divides by $a + b - c = 0$, which is invalid.`,
      hints: [r`What is $a + b - c$ equal to?`, 'Check whether (2) is true.', 'Which step divides?'],
      mis: ['divide-zero'], tip: 'If a proof reaches nonsense, find where it divided by zero.' }
  );

  /* ------------------------------------------------------------------ L6-2 */
  TLL.lessons.push({
    id: 'L6-2', unit: 'U6', title: 'Errors with inequalities, functions and graphs', mins: 9, spec: ['Err2', 'Err1'], prereq: ['L6-1'],
    objectives: [
      { id: 'L62a', text: 'Handle inequalities correctly when multiplying by negatives or unknown-sign quantities, and with reciprocals.' },
      { id: 'L62b', text: r`Avoid errors with many-to-one functions ($\sin$, squaring) and domain restrictions (logs, roots).` }
    ],
    purpose: r`The specification’s own example “$\sin  A = \sin  B \Rightarrow  A = B$” comes from this family of errors.`,
    refs: ['spec2026', 'notesMaths'],
    steps: [
      { k: 'predict', stem: r`A student solves $\dfrac{1}{x} < 2$ by multiplying by $x$ to get $x > \tfrac{1}{2}$. Is $x = -1$ a solution of the original inequality?`,
        options: [r`Yes`, r`No`], answer: 0,
        notes: [r`Correct: $\dfrac{1}{-1} = -1 < 2$. The student’s answer misses all negative $x$.`, r`Check: $-1 < 2$.`] },
      { k: 'idea', title: 'Know the sign before you multiply', body: r`**Inequalities**

- Multiplying or dividing by a **negative** number reverses the inequality.
- Multiplying by an expression of **unknown sign** (such as $x$) needs cases, or multiply by its square (which is positive when non-zero).
- $a > b \Rightarrow \dfrac{1}{a} < \dfrac{1}{b}$ only when $a$ and $b$ have the **same sign**.
- Squaring an inequality is only safe when both sides are non-negative.

**Functions**

- A many-to-one function can take equal values at different inputs: $\sin A = \sin B$ does **not** give $A = B$ (for example $\sin 30^\circ = \sin 150^\circ$).
- Logarithm laws such as $\log(x^2) = 2\log x$ need $x > 0$; square roots need non-negative inputs; denominators must be non-zero. Check the domain **before** combining.` },
      { k: 'diagram', d: { type: 'sinegraph' }, alt: 'Graph of y = sin x from 0° to 360° with a horizontal line at y = one half crossing the curve at 30° and 150°.', caption: r`The line $y = \tfrac{1}{2}$ meets $y = \sin  x$ twice between 0° and 360°: equal outputs, different inputs.` },
      { k: 'worked', id: 'W37' },
      { k: 'worked', id: 'W38' },
      { k: 'practice', ids: ['P622', 'P625'] },
      { k: 'check' },
      { k: 'summary', body: r`Know the sign before multiplying an inequality. Equal outputs of sin or squaring do not mean equal inputs. Check domains before using log or root rules.` }
    ]
  });

  TLL.worked.push(
    { id: 'W37', lesson: 'L6-2', title: 'Solving a reciprocal inequality correctly',
      problem: r`Solve $\dfrac{1}{x} < 2$.`,
      steps: [
        { do: r`$x \ne 0$. Multiply both sides by $x^2$, which is positive: $x < 2x^2$.`, why: 'Multiplying by a positive quantity keeps the direction.' },
        { do: r`$2x^2 - x > 0 \iff x(2x - 1) > 0$.`, why: '' },
        { do: r`So $x < 0$ or $x > \tfrac{1}{2}$.`, why: 'A product of two factors is positive when they have the same sign.' },
        { do: r`Check: $x = -1$ gives $-1 < 2$ ✓; $x = \tfrac{1}{4}$ gives $4 < 2$ ✗; $x = 1$ gives $1 < 2$ ✓.`, why: 'Quick checks in each region.' }
      ],
      takeaway: 'Multiply by the square of an unknown-sign denominator, or split into cases.' },
    { id: 'W38', lesson: 'L6-2', title: 'An invalid “cancellation” of sine',
      problem: r`A student solves $\sin 2x = \sin x$ for $0^\circ \le x < 360^\circ$ by writing “$2x = x$, so $x = 0^\circ$”. Find all solutions.`,
      steps: [
        { do: r`“$\sin 2x = \sin x \Rightarrow 2x = x$” assumes sine is one-to-one, which is false.`, why: 'Name the error.' },
        { do: r`Use $\sin 2x = 2\sin x \cos x$: $2\sin x \cos x - \sin x = 0$, so $\sin x\,(2\cos x - 1) = 0$.`, why: r`Factorise instead of dividing by $\sin  x$.` },
        { do: r`$\sin x = 0$: $x = 0^\circ, 180^\circ$. $\cos x = \tfrac{1}{2}$: $x = 60^\circ, 300^\circ$.`, why: '' },
        { do: r`Solutions: $0^\circ, 60^\circ, 180^\circ, 300^\circ$.`, why: '' }
      ],
      takeaway: 'Bring everything to one side and factorise; never “cancel” a function.' }
  );

  TLL.questions.push(
    { id: 'P621', lesson: 'L6-2', obj: 'L62a', spec: ['Err2'], diff: 1, type: 'mcq',
      stem: r`A student writes: “$-2x > 6$, so $x > -3$.” What is the correct conclusion?`,
      options: [r`$x > -3$`, r`$x < -3$`, r`$x > 3$`, r`$x < 3$`], answer: 1,
      notes: [r`Dividing by $-2$ must reverse the inequality.`, r`Correct.`, r`The sign of 3 is wrong.`, r`Both the sign and the value are wrong.`],
      key: 'Dividing by a negative reverses the inequality.',
      sol: r`Dividing both sides by $-2$ reverses the inequality: $x < -3$. Check: $x = -4$ gives $8 > 6$ ✓.`,
      hints: ['What happens when you divide an inequality by a negative?', r`Test $x = -4$ and $x = 0$.`, 'Which option do the tests support?'],
      mis: ['inequality-sign'], tip: 'Test one value to check the direction.' },

    { id: 'P622', lesson: 'L6-2', obj: 'L62a', spec: ['Err2', 'Err1'], diff: 3, type: 'mcq',
      stem: r`A student multiplies both sides of $\dfrac{x + 1}{x - 2} > 1$ by $x - 2$ to get $x + 1 > x - 2$, which is always true, and concludes the solution is “all $x \ne 2$”. What is the correct solution set?`,
      options: [r`all $x \ne 2$`, r`$x > 2$`, r`$x < 2$`, r`$x > -1$`], answer: 1,
      notes: [r`$x = 0$ gives $\dfrac{1}{-2} > 1$, which is false.`, r`Correct: $\dfrac{x+1}{x-2} - 1 = \dfrac{3}{x-2} > 0 \iff x > 2$.`, r`For $x < 2$ the left side is less than 1.`, r`$x = 0$ fails.`],
      key: r`Bring to one side: the difference simplifies to $\dfrac{3}{x - 2}$.`,
      sol: r`$\dfrac{x+1}{x-2} - 1 = \dfrac{(x+1) - (x-2)}{x-2} = \dfrac{3}{x-2}$. This is positive exactly when $x - 2 > 0$, so $x > 2$. The student’s step is invalid when $x - 2 < 0$.`,
      hints: [r`When is multiplying by $x - 2$ safe?`, 'Subtract 1 from both sides and combine into one fraction.', r`When is $\dfrac{3}{x - 2}$ positive?`],
      mis: ['inequality-sign'], tip: 'Compare with zero using a single fraction.' },

    { id: 'P623', lesson: 'L6-2', obj: 'L62a', spec: ['Err2'], diff: 2, type: 'mcq',
      stem: r`For non-zero real numbers $a$ and $b$ with $a > b$, when is it true that $\dfrac{1}{a} < \dfrac{1}{b}$?`,
      options: [r`Always.`, r`Exactly when $a$ and $b$ have the same sign.`, r`Exactly when $a$ and $b$ are both positive.`, r`Never.`], answer: 1,
      notes: [r`$a = 1$, $b = -1$: $\dfrac{1}{1} > \dfrac{1}{-1}$.`, r`Correct: $\dfrac{1}{b} - \dfrac{1}{a} = \dfrac{a - b}{ab}$, positive when $ab > 0$.`, r`Both negative also works: $a = -1$, $b = -2$ gives $-1 < -\tfrac{1}{2}$.`, r`$a = 2$, $b = 1$ works.`],
      key: r`$\dfrac{1}{b} - \dfrac{1}{a} = \dfrac{a - b}{ab}$.`,
      sol: r`$\dfrac{1}{b} - \dfrac{1}{a} = \dfrac{a - b}{ab}$. Since $a - b > 0$, this is positive exactly when $ab > 0$, that is, when $a$ and $b$ have the same sign.`,
      hints: [r`Compute $\dfrac{1}{b} - \dfrac{1}{a}$ as one fraction.`, 'Its numerator is positive. What about the denominator?', 'Test both negative.'],
      mis: ['inequality-sign', 'missing-case'], tip: 'Reciprocals reverse order within each sign, not across signs.' },

    { id: 'P624', lesson: 'L6-2', obj: 'L62b', spec: ['Err2'], diff: 2, type: 'mcq', pre: ['R6'],
      stem: r`A student writes “$\log_{10}(x^2) = 2\log_{10} x$ for all $x \ne 0$”. Which is correct?`,
      options: [r`The statement is correct.`, r`It is valid only for $x > 0$; for $x < 0$, $\log_{10} x$ is undefined, and in fact $\log_{10}(x^2) = 2\log_{10}|x|$.`, r`It is valid only for $x > 1$.`, r`It is never valid.`], answer: 1,
      notes: [r`At $x = -10$ the right side is undefined.`, r`Correct.`, r`It also holds for $0 < x \le 1$.`, r`It holds for all $x > 0$.`],
      key: 'Log laws need positive arguments.',
      sol: r`$\log_{10}(x^2)$ is defined for all $x \ne 0$, but $\log_{10} x$ only for $x > 0$. The identity holds for $x > 0$; in general $\log_{10}(x^2) = 2\log_{10}|x|$.`,
      hints: [r`For which $x$ is $\log  x$ defined?`, r`Try $x = -10$.`, r`What about $\log (x^{2})$?`],
      mis: ['domain'], tip: r`Check the domain of each side of a logarithm identity.` },

    { id: 'P625', lesson: 'L6-2', obj: 'L62b', spec: ['Err2'], diff: 2, type: 'mcq', pre: ['R5'],
      stem: r`Angles $A$ and $B$ satisfy $0^\circ \le A \le 180^\circ$, $0^\circ \le B \le 180^\circ$ and $\sin A = \sin B$. What can be concluded?`,
      options: [r`$A = B$`, r`$A = B$ or $A + B = 180^\circ$`, r`$A + B = 180^\circ$`, r`$A = 180^\circ - 2B$`], answer: 1,
      notes: [r`$A = 30^\circ$, $B = 150^\circ$ is another possibility.`, r`Correct: $\sin(180^\circ - B) = \sin B$.`, r`$A = B = 30^\circ$ is possible.`, r`No basis.`],
      key: r`$\sin(180^\circ - \theta) = \sin\theta$.`,
      sol: r`On $0^\circ \le \theta \le 180^\circ$, each value of $\sin\theta$ in $[0, 1)$ is taken at $\theta$ and $180^\circ - \theta$. So $A = B$ or $A = 180^\circ - B$.`,
      hints: [r`Sketch $y = \sin  x$ from 0° to 180°.`, 'Is sine one-to-one on this interval?', 'Use symmetry about 90°.'],
      mis: ['many-to-one'], tip: r`$\sin  A = \sin  B$ usually allows two relationships.` },

    { id: 'P626', lesson: 'L6-2', obj: 'L62b', spec: ['Err2'], diff: 1, type: 'mcq',
      stem: r`Let $f(x) = x^2$. If $f(a) = f(b)$, what can be concluded?`,
      options: [r`$a = b$`, r`$a = b$ or $a = -b$`, r`$a = -b$`, r`$a = b = 0$`], answer: 1,
      notes: [r`$a = 2$, $b = -2$ is another possibility.`, r`Correct: $a^2 - b^2 = (a - b)(a + b) = 0$.`, r`$a = b = 3$ is possible.`, r`Far too strong.`],
      key: r`$a^2 = b^2 \iff (a-b)(a+b) = 0$.`,
      sol: r`$a^2 = b^2 \iff (a - b)(a + b) = 0 \iff a = b$ or $a = -b$.`,
      hints: ['Rearrange and factorise.', 'Is squaring one-to-one?', r`Try $a = 2, b = -2$.`],
      mis: ['many-to-one'], tip: 'Equal squares: equal or opposite.' }
  );

  /* ------------------------------------------------------------------ L6-3 */
  TLL.lessons.push({
    id: 'L6-3', unit: 'U6', title: 'Finding the first invalid step', mins: 9, spec: ['Err1'], prereq: ['L6-2'],
    objectives: [
      { id: 'L63a', text: 'Check each line of a purported proof for a valid justification, in order.' },
      { id: 'L63b', text: 'Distinguish an invalid step from a valid but unhelpful step, and recognise when an argument is correct.' }
    ],
    purpose: 'Err1 questions present a full argument and ask where (or whether) it goes wrong.',
    refs: ['spec2026', 'chi1989'],
    steps: [
      { k: 'predict', stem: r`An argument reaches a false conclusion. Must at least one of its steps be invalid (or a premise false)?`,
        options: [r`Yes`, r`No`], answer: 0,
        notes: [r`Correct: valid steps from true premises always give true conclusions.`, r`If every premise is true and every step valid, the conclusion is true.`] },
      { k: 'idea', title: 'Line-by-line checking', body: r`For each line ask: **does this follow from the lines above (and known facts)?** Say the justification to yourself, in words.

Common culprits:

- dividing by something that may be zero;
- squaring or square-rooting both sides (one-way);
- multiplying an inequality by a quantity of unknown sign;
- “cancelling” a function: $\sin A = \sin B \Rightarrow A = B$;
- an omitted case, or a domain ignored;
- a claim about “all” justified by one example.

Do not stop at the first line that *looks* odd: check that it is actually invalid. And remember the answer can be “the argument is correct”.` },
      { k: 'worked', id: 'W39' },
      { k: 'practice', ids: ['P631', 'P632'] },
      { k: 'check' },
      { k: 'summary', body: r`Justify each line in words, in order. The first line you cannot justify is the error; sometimes there is none.` }
    ]
  });

  TLL.worked.push(
    { id: 'W39', lesson: 'L6-3', title: 'Locating a sign-pattern error',
      problem: r`Claim: for all real $x$, $x^2 \ge x$. “Proof”: (I) $x^2 - x = x(x - 1)$. (II) $x$ and $x - 1$ always have the same sign. (III) So their product is non-negative. (IV) Hence $x^2 \ge x$. Find the first invalid step.`,
      steps: [
        { do: r`(I) is a correct factorisation.`, why: '' },
        { do: r`(II): test $x = \tfrac{1}{2}$: $x > 0$ but $x - 1 < 0$. So (II) is false.`, why: 'A claim about “always” fails with one example.' },
        { do: r`(III) would follow from (II), and (IV) from (III). So the **first invalid step is (II)**.`, why: 'Later steps may be logically fine given earlier ones.' },
        { do: r`(The claim itself is false: $x = \tfrac{1}{2}$.)`, why: '' }
      ],
      takeaway: 'Test the general claim made by each line with a strategic value.' }
  );

  TLL.questions.push(
    { id: 'P631', lesson: 'L6-3', obj: 'L63a', spec: ['Err1'], diff: 2, type: 'mcq',
      stem: r`Claim: if $x^2 > 9$ then $x > 3$. “Proof”:

(1) $x^2 > 9$.
(2) So $x^2 - 9 > 0$.
(3) So $(x - 3)(x + 3) > 0$.
(4) So $x - 3 > 0$.
(5) So $x > 3$.

Which is the first incorrect step?`,
      options: [r`(2)`, r`(3)`, r`(4)`, r`(5)`], answer: 2,
      notes: [r`Subtracting 9 is valid.`, r`A correct factorisation.`, r`Correct: the product is also positive when both factors are negative ($x < -3$).`, r`Follows from (4).`],
      key: 'A positive product allows both factors negative.',
      sol: r`From $(x - 3)(x + 3) > 0$, either both factors are positive ($x > 3$) or both negative ($x < -3$). Step (4) ignores the second case. (The claim is false: $x = -4$.)`,
      hints: ['When is a product of two numbers positive?', r`Test $x = -4$ in each line.`, r`Which line fails first for $x = -4$?`],
      mis: ['missing-case'], tip: 'Positive product: same signs (two cases).' },

    { id: 'P632', lesson: 'L6-3', obj: 'L63b', spec: ['Err1'], diff: 2, type: 'mcq', pre: ['R6'],
      stem: r`An argument to solve $4^x - 3 \times 2^x + 2 = 0$:

(1) Let $y = 2^x$, so $4^x = y^2$.
(2) Then $y^2 - 3y + 2 = 0$.
(3) So $(y - 1)(y - 2) = 0$, giving $y = 1$ or $y = 2$.
(4) So $2^x = 1$ or $2^x = 2$, giving $x = 0$ or $x = 1$.

Which is correct?`,
      options: [r`The argument is correct.`, r`Step (1) is wrong: $4^x \ne (2^x)^2$.`, r`Step (3) is wrong: the roots are $-1$ and $-2$.`, r`Step (4) is wrong: it should also include a negative solution.`], answer: 0,
      notes: [r`Correct: every step is valid and both answers check.`, r`$4^x = (2^2)^x = (2^x)^2$.`, r`$(y-1)(y-2) = y^2 - 3y + 2$.`, r`$2^x$ is positive, and both values are already found.`],
      key: r`$4^x = (2^x)^2$, and $2^x = 1, 2$ give $x = 0, 1$.`,
      sol: r`Each step is valid: $4^x = (2^x)^2$; the quadratic factorises as shown; $y = 1$ and $y = 2$ are both positive, so both give solutions, $x = 0$ and $x = 1$. Check: $1 - 3 + 2 = 0$ and $4 - 6 + 2 = 0$.`,
      hints: ['Check each line on its own.', r`Is $4^{x} = (2^{x})^{2}$?`, 'Substitute the final answers.'],
      mis: ['domain'], tip: '“The argument is correct” is sometimes the answer: check, do not assume an error.' },

    { id: 'P633', lesson: 'L6-3', obj: 'L63a', spec: ['Err1', 'Err2'], diff: 3, type: 'mcq', pre: ['R5'],
      stem: r`An attempt to solve $\tan x = \sqrt{3}$ for $0 \le x \le 2\pi$:

(1) One solution is $x = \dfrac{\pi}{3}$.
(2) $\tan$ has period $\pi$, so $x = \dfrac{\pi}{3} + \pi = \dfrac{4\pi}{3}$ is also a solution.
(3) Also $\tan(\pi - x) = \tan x$, so $x = \pi - \dfrac{\pi}{3} = \dfrac{2\pi}{3}$ is a solution.
(4) So the solutions are $\dfrac{\pi}{3}, \dfrac{2\pi}{3}, \dfrac{4\pi}{3}$.

Which is the first incorrect step?`,
      options: [r`(1)`, r`(2)`, r`(3)`, r`(4)`], answer: 2,
      notes: [r`$\tan \dfrac{\pi}{3} = \sqrt{3}$.`, r`$\tan$ does have period $\pi$.`, r`Correct: $\tan(\pi - x) = -\tan x$, so $\tan \dfrac{2\pi}{3} = -\sqrt{3}$.`, r`(4) is wrong too, but because of (3).`],
      key: r`$\tan(\pi - x) = -\tan x$ (the sine identity does not transfer).`,
      sol: r`(1) and (2) are correct. (3) uses $\tan(\pi - x) = \tan x$, which is false: $\tan(\pi - x) = -\tan x$. The solutions are $\dfrac{\pi}{3}$ and $\dfrac{4\pi}{3}$ only.`,
      hints: ['Check each identity used.', r`Compute $\tan \dfrac{2\pi}{3}$ using a sketch of $y = \tan x$.`, 'Which identity holds for sine but not tangent?'],
      mis: ['many-to-one'], tip: 'Identities for sine do not automatically hold for tangent.' },

    { id: 'P634', lesson: 'L6-3', obj: 'L63a', spec: ['Err1', 'Err2'], diff: 3, type: 'mcq',
      stem: r`A student finds the area enclosed between $y = x^3$, the $x$-axis and the lines $x = -1$ and $x = 1$ by writing:

(1) Area $= \displaystyle\int_{-1}^{1} x^3 \, dx$.
(2) $= \left[\dfrac{x^4}{4}\right]_{-1}^{1}$.
(3) $= \dfrac{1}{4} - \dfrac{1}{4} = 0$.

What is the true area, and where is the error?`,
      options: [r`Area $0$; there is no error.`, r`Area $\tfrac{1}{2}$; step (1) is wrong because the curve is below the axis for $x < 0$.`, r`Area $\tfrac{1}{4}$; step (2) has the wrong antiderivative.`, r`Area $\tfrac{1}{2}$; step (3) is an arithmetic slip.`], answer: 1,
      notes: [r`A region with positive size cannot have area 0.`, r`Correct: area $= 2\displaystyle\int_0^1 x^3\,dx = \tfrac{1}{2}$.`, r`$\dfrac{x^4}{4}$ is the correct antiderivative.`, r`Step (3) evaluates (2) correctly.`],
      key: 'Integrals below the axis are negative; area must be counted positively.',
      sol: r`The integral counts the part below the axis negatively, so it gives 0. The area is $\displaystyle\int_0^1 x^3\,dx + \left|\int_{-1}^0 x^3\,dx\right| = \tfrac{1}{4} + \tfrac{1}{4} = \tfrac{1}{2}$. The error is in (1).`,
      hints: [r`Sketch $y = x^{3}$ between $-1$ and 1.`, 'What sign does the integral give to the part below the axis?', r`Split at $x = 0$.`],
      mis: ['integral-area'], tip: r`Integral $\ne$ area when the curve crosses the axis.` },

    { id: 'P635', lesson: 'L6-3', obj: 'L63b', spec: ['Err1', 'Err2'], diff: 3, type: 'mcq', pre: ['R6'],
      stem: r`A student solves $\log_2 x + \log_2(x - 2) = 3$:

(1) $\log_2\bigl(x(x - 2)\bigr) = 3$.
(2) $x^2 - 2x = 8$.
(3) $(x - 4)(x + 2) = 0$.
(4) So $x = 4$ or $x = -2$.

What is the correct solution set of the **original** equation?`,
      options: [r`$x = 4$ or $x = -2$`, r`$x = 4$ only`, r`$x = -2$ only`, r`There is no solution.`], answer: 1,
      notes: [r`$\log_2(-2)$ is undefined, so $-2$ cannot be a solution.`, r`Correct: the original requires $x > 2$.`, r`$x = -2$ is outside the domain.`, r`$x = 4$ works: $2 + 1 = 3$.`],
      key: r`The original equation needs $x > 0$ and $x - 2 > 0$.`,
      sol: r`Combining logs in (1) enlarges the domain (the product can be positive when both factors are negative). The original needs $x > 2$, so $x = -2$ must be rejected. Check $x = 4$: $\log_2 4 + \log_2 2 = 2 + 1 = 3$ ✓.`,
      hints: ['Where is each logarithm in the original defined?', r`Does $x = -2$ satisfy the original?`, r`Check $x = 4$.`],
      mis: ['domain', 'irreversible'], tip: 'Find the domain before combining logs, then check answers.' },

    { id: 'P636', lesson: 'L6-3', obj: 'L63b', spec: ['Err1', 'Prf1'], diff: 3, type: 'mcq',
      stem: r`Claim: for positive real $a$ and $b$, $\dfrac{a + b}{2} \ge \sqrt{ab}$. “Proof”:

(1) $\left(\sqrt{a} - \sqrt{b}\right)^2 \ge 0$.
(2) So $a - 2\sqrt{ab} + b \ge 0$.
(3) So $a + b \ge 2\sqrt{ab}$.
(4) Dividing by 2 gives the result.

Which statement is correct?`,
      options: [r`The proof is valid.`, r`Step (1) assumes what is to be proved.`, r`Step (2) is expanded incorrectly.`, r`The proof only works when $a = b$.`], answer: 0,
      notes: [r`Correct: every step is justified.`, r`(1) is just the fact that a real square is non-negative.`, r`$(\sqrt{a} - \sqrt{b})^2 = a - 2\sqrt{ab} + b$ for positive $a$, $b$.`, r`Equality holds when $a = b$; the inequality holds for all positive $a$, $b$.`],
      key: 'A square is non-negative; the rest is rearrangement.',
      sol: r`(1) is true since a real square is non-negative (and $\sqrt{a}$, $\sqrt{b}$ exist because $a, b > 0$). (2) expands correctly, (3) rearranges, (4) divides by the positive number 2. The proof is valid.`,
      hints: ['Check each line’s justification.', 'Is (1) a fact or an assumption?', r`Expand $(\sqrt{a} - \sqrt{b})^{2}$ yourself.`],
      mis: [], tip: 'A correct proof can be an answer option; do not invent an error.' }
  );

  /* ------------------------------------------------------------------ L7-1 */
  TLL.lessons.push({
    id: 'L7-1', unit: 'U7', title: 'Several statements at once (I, II, III)', mins: 8, spec: ['Prf5', 'Prf2'], prereq: ['L2-1', 'L5-4'],
    objectives: [
      { id: 'L71a', text: 'Evaluate each statement independently and map the results to the answer options.' },
      { id: 'L71b', text: 'Use each settled statement to eliminate options before evaluating the rest.' }
    ],
    purpose: 'Many Paper 2 questions ask which of several statements are true. Treating each as a mini-question and eliminating as you go saves time.',
    refs: ['spec2026', 'rohrer2007'],
    steps: [
      { k: 'predict', stem: r`You find that statement II is false. Which options can you eliminate immediately?`,
        options: [r`Every option that includes II`, r`Only “I, II and III”`, r`None`], answer: 0,
        notes: [r`Correct: this typically removes half of the options at once.`, r`Every option containing II is now impossible.`, r`Several options can go.`] },
      { k: 'idea', title: 'One statement at a time', body: r`1. Treat each statement as a separate true/false question.
2. Start with the statement that looks **quickest** to settle (often by a counterexample).
3. After each verdict, cross out every option that disagrees.
4. Stop as soon as one option remains.

Watch for statements that look similar but differ in one word (“some”/“all”, “if”/“only if”) or in a boundary ($<$ versus $\le$).` },
      { k: 'worked', id: 'W40' },
      { k: 'practice', ids: ['P711', 'P714'] },
      { k: 'check' },
      { k: 'summary', body: r`Evaluate the easiest statement first and eliminate after every verdict.` }
    ]
  });

  TLL.worked.push(
    { id: 'W40', lesson: 'L7-1', title: 'Three statements about a quadratic',
      problem: r`Let $f(x) = x^2 - 4x + 3$. Which are true? I: $f(x) < 0$ for some $x$. II: $f(x) \ge -1$ for all $x$. III: $f(x) = 0$ only if $x = 1$.`,
      steps: [
        { do: r`Write $f(x) = (x - 1)(x - 3) = (x - 2)^2 - 1$.`, why: 'Both forms will be useful.' },
        { do: r`III first (quick): translation “if $f(x) = 0$ then $x = 1$”. But $f(3) = 0$. **False.** Eliminate every option containing III.`, why: 'Start with the quickest to settle.' },
        { do: r`I: $f(2) = -1 < 0$. **True.** Eliminate options without I.`, why: '' },
        { do: r`II: minimum value is $-1$, so $f(x) \ge -1$. **True.**`, why: '' },
        { do: r`Answer: I and II only.`, why: '' }
      ],
      takeaway: 'Settle the quickest statement first; each verdict removes several options.' }
  );

  TLL.questions.push(
    { id: 'P711', lesson: 'L7-1', obj: 'L71a', spec: ['Prf5'], diff: 2, type: 'roman', pre: ['R4'],
      stem: r`Let $f(x) = x^3 - 3x$. Which of the following statements are true?`,
      parts: [
        { s: r`$f$ has exactly two stationary points.`, t: true, why: r`$f'(x) = 3x^2 - 3 = 0 \iff x = \pm 1$.` },
        { s: r`The equation $f(x) = 0$ has three distinct real solutions.`, t: true, why: r`$x(x^2 - 3) = 0$: $x = 0, \pm\sqrt{3}$.` },
        { s: r`$f$ is increasing for all $x > 0$.`, t: false, why: r`$f'(x) < 0$ for $0 < x < 1$.` }
      ],
      key: 'Differentiate once and factorise once.',
      sol: r`$f'(x) = 3(x - 1)(x + 1)$, zero at $x = \pm 1$ (I true) and negative on $-1 < x < 1$ (III false). $f(x) = x(x^2 - 3)$ has roots $0, \pm\sqrt{3}$ (II true). I and II only.`,
      hints: [r`Differentiate $f$.`, 'Where is f′(x) negative?', r`Factorise $f(x)$.`],
      mis: ['calc-slip'], tip: 'One derivative answers several statements.' },

    { id: 'P712', lesson: 'L7-1', obj: 'L71b', spec: ['Prf5', 'Prf3'], diff: 3, type: 'roman',
      stem: r`A sequence is defined by $u_1 = 2$ and $u_{n+1} = 2u_n - 1$ for $n \ge 1$. Which of the following statements are true?`,
      parts: [
        { s: r`Every term of the sequence is odd.`, t: false, why: r`$u_1 = 2$ is even.` },
        { s: r`$u_n > n$ for every positive integer $n$.`, t: true, why: r`$u_n = 2^{n-1} + 1$, and $2^{n-1} \ge n$ for all $n \ge 1$, so $u_n > n$.` },
        { s: r`$u_{10} = 513$.`, t: true, why: r`$u_{10} = 2^9 + 1 = 513$.` }
      ],
      key: r`Terms $2, 3, 5, 9, 17$ suggest $u_n = 2^{n-1} + 1$.`,
      sol: r`Terms: $2, 3, 5, 9, 17, \ldots$ Conjecture $u_n = 2^{n-1} + 1$; check: $2(2^{n-1} + 1) - 1 = 2^n + 1$ ✓. I is false at $u_1$. II: $2^{n-1} \ge n$ for $n \ge 1$, so $u_n > n$. III: $2^9 + 1 = 513$. II and III only.`,
      hints: ['Write out the first five terms.', 'Guess a formula and check it satisfies the recurrence.', 'Statement I can be settled by the first term.'],
      mis: ['calc-slip', 'examples-prove'], tip: 'Check the first term before believing “every term” statements.' },

    { id: 'P713', lesson: 'L7-1', obj: 'L71a', spec: ['Prf5'], diff: 2, type: 'roman',
      stem: r`The circle C has equation $x^2 + y^2 - 6x + 4y = 12$. Which of the following statements are true?`,
      parts: [
        { s: r`The centre of C is $(3, -2)$.`, t: true, why: r`$(x - 3)^2 + (y + 2)^2 = 25$.` },
        { s: r`C passes through the origin.`, t: false, why: r`$0 + 0 - 0 + 0 = 0 \ne 12$.` },
        { s: r`The radius of C is 5.`, t: true, why: r`$12 + 9 + 4 = 25 = 5^2$.` }
      ],
      key: r`Complete the square in $x$ and in $y$.`,
      sol: r`$(x - 3)^2 - 9 + (y + 2)^2 - 4 = 12$, so $(x - 3)^2 + (y + 2)^2 = 25$: centre $(3, -2)$, radius 5. Substituting $(0, 0)$ gives $0 \ne 12$. I and III only.`,
      hints: ['Complete the square twice.', 'Substitute (0, 0) into the original equation.', 'Remember the constants you subtract.'],
      mis: ['calc-slip'], tip: 'Substitution is the fastest test of “passes through”.' },

    { id: 'P714', lesson: 'L7-1', obj: 'L71a', spec: ['Prf5', 'Arg1'], diff: 3, type: 'roman',
      stem: r`For integers $n$, which of the following statements are true?`,
      parts: [
        { s: r`If $n^2$ is a multiple of 12, then $n$ is a multiple of 12.`, t: false, why: r`$n = 6$: $36 = 3 \times 12$ but 6 is not a multiple of 12.` },
        { s: r`If $n^2$ is a multiple of 12, then $n$ is a multiple of 6.`, t: true, why: r`$4 \mid n^2 \Rightarrow 2 \mid n$; $3 \mid n^2 \Rightarrow 3 \mid n$ (3 is prime); so $6 \mid n$.` },
        { s: r`If $n$ is a multiple of 6, then $n^2$ is a multiple of 12.`, t: true, why: r`$n = 6k \Rightarrow n^2 = 36k^2 = 12(3k^2)$.` }
      ],
      key: r`Square-free part: $12 = 4 \times  3$, so $n$ must contain 2 and 3.`,
      sol: r`I fails at $n = 6$. II: $n^2$ divisible by 4 forces $n$ even; divisible by 3 forces $3 \mid n$ since 3 is prime; so $6 \mid n$. III: $(6k)^2 = 36k^2$. II and III only.`,
      hints: [r`Test $n = 6$ in each statement.`, r`If a prime divides $n^{2}$, what divides $n$?`, r`Write $12 = 4 \times  3$.`],
      mis: ['converse'], tip: r`Prime $p$ dividing $n^{2}$ forces $p$ to divide $n$.` },

    { id: 'P715', lesson: 'L7-1', obj: 'L71a', spec: ['Prf5'], diff: 3, type: 'roman', pre: ['R5'],
      stem: r`For $0^\circ < x < 90^\circ$, which of the following statements are true?`,
      parts: [
        { s: r`$\sin x < \tan x$`, t: true, why: r`$\tan x = \dfrac{\sin x}{\cos x}$ with $0 < \cos x < 1$ and $\sin x > 0$.` },
        { s: r`$\sin x + \cos x > 1$`, t: true, why: r`$(\sin x + \cos x)^2 = 1 + 2\sin x\cos x > 1$ and the sum is positive.` },
        { s: r`$\sin 2x < 2\sin x$`, t: true, why: r`$\sin 2x = 2\sin x\cos x < 2\sin x$ since $\cos x < 1$ and $\sin x > 0$.` }
      ],
      key: r`In this interval $\sin  x$ and $\cos  x$ are both strictly between 0 and 1.`,
      sol: r`All three follow from $0 < \sin x < 1$ and $0 < \cos x < 1$ (see the reasons). I, II and III.`,
      hints: [r`What are the signs and sizes of $\sin  x$ and $\cos  x$ here?`, r`Square $\sin  x + \cos  x$.`, r`Use $\sin  2x = 2 \sin  x \cos  x$.`],
      mis: ['calc-slip'], tip: '“All three” is a legitimate answer; do not force one to be false.' },

    { id: 'P716', lesson: 'L7-1', obj: 'L71b', spec: ['Prf5', 'Prf1'], diff: 2, type: 'roman',
      stem: r`For real $x$, which of the following statements are true?`,
      parts: [
        { s: r`If $x^2 > x$ then $x > 1$.`, t: false, why: r`$x = -1$: $1 > -1$ but $x < 1$.` },
        { s: r`If $x > 0$ then $x^2 > x$.`, t: false, why: r`$x = \tfrac{1}{2}$.` },
        { s: r`If $x^3 > x$ then $x > 1$.`, t: false, why: r`$x = -\tfrac{1}{2}$: $-\tfrac{1}{8} > -\tfrac{1}{2}$ but $x < 1$.` }
      ],
      key: 'Try negatives and fractions on each.',
      sol: r`Each has a counterexample: $x = -1$, $x = \tfrac{1}{2}$, $x = -\tfrac{1}{2}$. None of them.`,
      hints: [r`Try $x = -1, \tfrac{1}{2}$ and $-\tfrac{1}{2}$.`, 'Remember that “none” is an option.', 'Condition true, conclusion false.'],
      mis: ['counterexample-form'], tip: '“None of them” is a legitimate answer.' }
  );

  /* ------------------------------------------------------------------ L7-2 */
  TLL.lessons.push({
    id: 'L7-2', unit: 'U7', title: 'Long chains: translate first', mins: 9, spec: ['Prf5', 'Prf2', 'Arg2'], prereq: ['L7-1', 'L2-2'],
    objectives: [
      { id: 'L72a', text: 'Translate wordy conditions into algebra before calculating.' },
      { id: 'L72b', text: 'Combine several conditions and deductions into a chain that reaches the answer.' }
    ],
    purpose: 'Prf5 questions need a “sophisticated chain of reasoning”. Translation into precise algebraic conditions is usually the first link.',
    refs: ['spec2026', 'sweller2019'],
    steps: [
      { k: 'predict', stem: r`“The equation $x^2 + px + q = 0$ has two distinct positive roots.” Which is the most useful first translation?`,
        options: [r`Roots $\alpha \ne \beta$, both positive, with $\alpha + \beta = -p$ and $\alpha\beta = q$`, r`$p$ and $q$ are positive`, r`Try $p = 1$, $q = 1$`], answer: 0,
        notes: [r`Correct: this turns the words into conditions you can use.`, r`Not justified (and $p$ must actually be negative).`, r`Testing comes after translating.`] },
      { k: 'idea', title: 'Translate, then chain', body: r`1. **Translate** every phrase into a precise condition: “two distinct real roots” → discriminant $> 0$; “minimum value is negative” → value at the vertex $< 0$; “$a$ divides $b$” → $b = ak$.
2. **List** the conditions and what is asked.
3. **Chain**: combine conditions, using earlier results as you go.
4. **Check boundaries**: strict or non-strict? Are extra conditions (such as $a \ne 0$) hidden?

For a quadratic with roots $\alpha$ and $\beta$: $x^2 + px + q = (x - \alpha)(x - \beta)$, so $\alpha + \beta = -p$ and $\alpha\beta = q$.` },
      { k: 'worked', id: 'W41' },
      { k: 'practice', ids: ['P721', 'P724'] },
      { k: 'check' },
      { k: 'summary', body: r`Translate words into exact conditions first; then chain them, checking boundaries and hidden assumptions.` }
    ]
  });

  TLL.worked.push(
    { id: 'W41', lesson: 'L7-2', title: 'When does a line meet a parabola?',
      problem: r`For which real $k$ does the line $y = kx$ meet the curve $y = x^2 + 1$?`,
      steps: [
        { do: r`Translate “meet” into algebra: there is a real $x$ with $kx = x^2 + 1$, that is $x^2 - kx + 1 = 0$.`, why: 'Intersection = simultaneous solution.' },
        { do: r`A real solution exists $\iff$ discriminant $\ge 0$: $k^2 - 4 \ge 0$.`, why: r`“Meet” includes touching, so $\ge$ not $>$.` },
        { do: r`So $k \le -2$ or $k \ge 2$. At $k = \pm 2$ the line is a tangent.`, why: '' },
        { do: r`Logic layer: “the line meets the curve **only if** $|k| \ge 2$” and “**if** $|k| \ge 2$ then the line meets the curve” are both true.`, why: 'The algebra settles both directions.' }
      ],
      takeaway: 'Translate geometric words into an equation, then into a discriminant condition.' }
  );

  TLL.questions.push(
    { id: 'P721', lesson: 'L7-2', obj: 'L72a', spec: ['Prf5', 'Prf2'], diff: 3, type: 'roman', pre: ['R4'],
      stem: r`The equation $x^2 + px + q = 0$ has two distinct positive real roots. Which of the following must be true?`,
      parts: [
        { s: r`$p < 0$`, t: true, why: r`Sum of roots $= -p > 0$.` },
        { s: r`$q > 0$`, t: true, why: r`Product of roots $= q > 0$.` },
        { s: r`$p^2 > 4q$`, t: true, why: r`Two distinct real roots need a positive discriminant.` }
      ],
      key: r`$\alpha + \beta = -p$, $\alpha\beta = q$, discriminant $> 0$.`,
      sol: r`If the roots are $\alpha, \beta > 0$ with $\alpha \ne \beta$: $-p = \alpha + \beta > 0$, $q = \alpha\beta > 0$, and distinct real roots need $p^2 - 4q > 0$. I, II and III.`,
      hints: ['Write the quadratic as (x − α)(x − β).', 'Compare coefficients.', 'What does “distinct real” require?'],
      mis: ['calc-slip'], tip: 'Sum and product of roots translate sign conditions quickly.' },

    { id: 'P722', lesson: 'L7-2', obj: 'L72b', spec: ['Prf5', 'Arg2'], diff: 4, type: 'mcq', pre: ['R4'],
      stem: r`Which is a necessary and sufficient condition for $x^2 + px + q = 0$ to have two distinct positive real roots?`,
      options: [r`$p^2 > 4q$`, r`$p < 0$ and $q > 0$`, r`$p < 0$, $q > 0$ and $p^2 > 4q$`, r`$q > 0$ and $p^2 > 4q$`], answer: 2,
      notes: [r`$p = 3$, $q = 1$: distinct roots, both negative.`, r`$p = -1$, $q = 1$: no real roots.`, r`Correct: necessary (previous reasoning) and sufficient (see solution).`, r`$p = 3$, $q = 1$: roots are negative.`],
      key: 'Necessity from sum/product/discriminant; sufficiency because real roots with positive sum and product are both positive.',
      sol: r`Necessary: shown by sum $-p > 0$, product $q > 0$, discriminant $> 0$. Sufficient: if $p^2 > 4q$ there are two distinct real roots; $q > 0$ means they have the same sign; $p < 0$ means their sum is positive; so both are positive.`,
      hints: ['Each option must be checked in both directions.', 'For sufficiency: real roots with positive product have the same sign.', 'Find counterexamples for the weaker options.'],
      mis: ['nec-suff-swap', 'missing-case'], tip: 'A necessary-and-sufficient condition must rule out every bad case.' },

    { id: 'P723', lesson: 'L7-2', obj: 'L72b', spec: ['Prf5', 'Prf2'], diff: 3, type: 'mcq',
      stem: r`Positive integers $a$, $b$, $c$ satisfy: $a$ divides $b$, $b$ divides $c$, and $c$ divides $a$. What can be deduced?`,
      options: [r`$a = b = c$`, r`$a < b < c$`, r`$a = c$, but $b$ could differ`, r`Nothing more`], answer: 0,
      notes: [r`Correct.`, r`Divisibility of positive integers gives $\le$, and the cycle forces equality.`, r`The chain also forces $b$ to equal them.`, r`The chain of inequalities forces equality.`],
      key: r`For positive integers, $x$ divides $y$ implies $x \le  y$.`,
      sol: r`For positive integers, $x \mid y$ implies $x \le y$. So $a \le b \le c \le a$, which forces $a = b = c$.`,
      hints: [r`If $x$ divides $y$ and both are positive, how do $x$ and $y$ compare in size?`, 'Chain the three inequalities.', r`$a \le  b \le  c \le  a$.`],
      mis: ['examples-prove'], tip: r`Translate “divides” into “$\le$” for positive integers.` },

    { id: 'P724', lesson: 'L7-2', obj: 'L72a', spec: ['Prf5'], diff: 3, type: 'mcq', pre: ['R4'],
      stem: r`Let $f(x) = x^2 - 2kx + 2k + 3$. The minimum value of $f$ is negative if and only if:`,
      options: [r`$-1 < k < 3$`, r`$k < -1$ or $k > 3$`, r`$k > 3$`, r`$k \le -1$ or $k \ge 3$`], answer: 1,
      notes: [r`This is where the minimum is positive.`, r`Correct: minimum $= -k^2 + 2k + 3 < 0$.`, r`$k = -2$ also works: minimum $-5$.`, r`At $k = -1$ or $3$ the minimum is $0$, not negative.`],
      key: r`Minimum $= f(k) = 3 + 2k - k^2$.`,
      sol: r`$f(x) = (x - k)^2 - k^2 + 2k + 3$, so the minimum is $-k^2 + 2k + 3$. Negative $\iff k^2 - 2k - 3 > 0 \iff (k - 3)(k + 1) > 0 \iff k < -1$ or $k > 3$.`,
      hints: ['Complete the square.', r`Write the minimum value in terms of $k$.`, r`Solve the quadratic inequality in $k$.`],
      mis: ['negation-extreme', 'calc-slip'], tip: 'A quadratic inequality “> 0” gives the outside regions.' },

    { id: 'P725', lesson: 'L7-2', obj: 'L72b', spec: ['Prf5', 'Prf2', 'Arg1'], diff: 4, type: 'roman', transfer: true,
      stem: r`Functions $f$ and $g$ satisfy: (A) $f(x) \ge g(x)$ for all real $x$; (B) $g(x) \ge 0$ only if $x \ge 1$. Which of the following must be true?`,
      parts: [
        { s: r`If $x < 1$ then $g(x) < 0$.`, t: true, why: 'This is the contrapositive of (B).' },
        { s: r`If $x < 1$ then $f(x) < 0$.`, t: false, why: r`(A) only bounds $f$ below by $g$; for example $g(x) = x - 1$ and $f(x) = 5$ satisfy both conditions, and $f(0) = 5$.` },
        { s: r`If $g(x) \ge 0$ then $f(x) \ge 0$ and $x \ge 1$.`, t: true, why: r`$f \ge  g \ge  0$ by (A), and $x \ge  1$ by (B).` }
      ],
      key: r`Translate (B): “if $g(x) \ge  0$ then $x \ge  1$”.`,
      sol: r`(B) translates to “if $g(x) \ge  0$ then $x \ge  1$”; I is its contrapositive. II would need an upper bound on $f$, which (A) does not give $(f = 5, g = x - 1)$. III combines (A) and (B). I and III only.`,
      hints: ['Translate (B) into “if … then …”.', r`Does (A) give an upper or a lower bound on $f$?`, r`Build a simple $f$ and $g$ to test II.`],
      mis: ['only-if', 'converse'], tip: 'Build simple example functions to test abstract claims.' },

    { id: 'P726', lesson: 'L7-2', obj: 'L72b', spec: ['Prf5', 'Arg1'], diff: 3, type: 'mcq',
      stem: r`A positive integer $n$ satisfies both of the following: “$n$ is a multiple of 3 if and only if $n$ is even” and “$n$ is a multiple of 3 only if $n > 10$”. Which value of $n$ is possible?`,
      options: [r`$6$`, r`$9$`, r`$4$`, r`$12$`, r`$8$`], answer: 3,
      notes: [r`6 is a multiple of 3 but not greater than 10.`, r`9 is a multiple of 3 but odd.`, r`4 is even but not a multiple of 3.`, r`Correct: a multiple of 3, even, and greater than 10.`, r`8 is even but not a multiple of 3.`],
      key: r`Translate: (multiple of 3 if and only if even) and (if a multiple of 3 then $n > 10$).`,
      sol: r`Check each: 6 fails the second condition; 9 and 4 and 8 fail the first. 12 is a multiple of 3, is even, and exceeds 10, so both conditions hold.`,
      hints: ['Translate each condition.', 'For the “iff”, both parts must have the same truth value.', 'Check each option against both conditions.'],
      mis: ['iff-one-way', 'only-if'], tip: '“A iff B” means A and B are both true or both false.' }
  );

  /* ------------------------------------------------------------------ L7-3 */
  TLL.lessons.push({
    id: 'L7-3', unit: 'U7', title: 'Exam technique: strategic testing and time', mins: 8, spec: ['Prf5'], prereq: ['L7-1'],
    objectives: [
      { id: 'L73a', text: 'Choose efficient strategies: translate first, check domains early, test strategic values to eliminate options.' },
      { id: 'L73b', text: 'Manage time: average 3¾ minutes per question, skip and return, and answer every question.' }
    ],
    purpose: 'With no penalty for wrong answers and an average of 3¾ minutes per question, decisions about when to move on matter.',
    refs: ['spec2026', 'shute2008'],
    steps: [
      { k: 'predict', stem: r`There is no penalty for wrong answers. You have 30 seconds left and two unanswered questions. What should you do?`,
        options: [r`Leave them blank`, r`Enter a guess for both`, r`Spend the time checking an earlier answer`], answer: 1,
        notes: [r`A blank scores nothing; a guess might score.`, r`Correct: a guess can only help.`, r`Fill in the blanks first.`] },
      { k: 'idea', title: 'Strategies and when they are valid', body: r`- **Translate before calculating.** Rewrite “only if”, “necessary”, “for some” as precise conditions first.
- **Check domains early.** Logs, roots and division often decide the answer.
- **Test strategic values** ($0$, $1$, $-1$, $\tfrac{1}{2}$, boundary values) to **eliminate** options. Valid for disproving “always” claims. *Not* valid for proving them: if an option survives your tests, either the other options are all eliminated or you need a reason.
- **Use the options.** If options are numerical, substituting them may be faster than solving.
- **Skip and return.** If a question has taken over about five minutes with no clear route, make a provisional choice, flag it, and move on.
- **Answer everything.** No penalty means a guess never lowers your score.

These are habits, not rules: the 3¾-minute average is a budget across the paper, not a limit for each question.` },
      { k: 'worked', id: 'W42' },
      { k: 'practice', ids: ['P731', 'P734'] },
      { k: 'check' },
      { k: 'summary', body: r`Translate, check domains, test strategic values to eliminate, and keep moving: flag, guess, return.` }
    ]
  });

  TLL.worked.push(
    { id: 'W42', lesson: 'L7-3', title: 'Eliminating with strategic values, and where it stops working',
      problem: r`Which is true for all real $x > 0$? (A) $x^2 > x$ (B) $x + \dfrac{1}{x} \ge 2$ (C) $\sqrt{x} < x$ (D) $2^x > x^2$`,
      steps: [
        { do: r`Try $x = \tfrac{1}{2}$: (A) $\tfrac{1}{4} > \tfrac{1}{2}$ ✗; (C) $\tfrac{1}{\sqrt{2}} \approx 0.71 < 0.5$ ✗. Eliminate A and C.`, why: 'Fractions break claims about powers.' },
        { do: r`Try $x = 3$ for (D): $8 > 9$ ✗. Eliminate D.`, why: r`Small integers break exponential claims ($2^{x}$ is below $x^{2}$ for $2 < x < 4$).` },
        { do: r`Only (B) remains. A reason confirms it: $x + \dfrac{1}{x} - 2 = \dfrac{(x - 1)^2}{x} \ge 0$ for $x > 0$.`, why: 'Testing eliminated; a reason confirms.' }
      ],
      takeaway: 'Tests eliminate quickly; a short reason confirms the survivor when time allows.' }
  );

  TLL.questions.push(
    { id: 'P731', lesson: 'L7-3', obj: 'L73a', spec: ['Prf5', 'Prf1'], diff: 2, type: 'mcq',
      stem: r`Which one of the following is true for all real $x$?`,
      options: [r`$x^2 \ge 2x - 1$`, r`$x^2 > x$`, r`$x^3 \ge x$`, r`$x^2 + 1 > 2x$`], answer: 0,
      notes: [r`Correct: $x^2 - 2x + 1 = (x - 1)^2 \ge 0$.`, r`Fails at $x = \tfrac{1}{2}$ (and at $0$, $1$).`, r`Fails at $x = -2$ and at $x = \tfrac{1}{2}$.`, r`Fails at $x = 1$: $2 > 2$ is false.`],
      key: r`Equal values $(x = 1)$ break strict inequalities.`,
      sol: r`$x^2 - (2x - 1) = (x - 1)^2 \ge 0$ for all $x$. The others fail at $x = \tfrac{1}{2}$, $x = -2$ and $x = 1$ respectively.`,
      hints: [r`Test $x = 1, x = \tfrac{1}{2}$ and $x = -2$.`, 'Which option survives?', 'Confirm it by completing the square.'],
      mis: ['examples-prove', 'counterexample-form'], tip: 'Test the value where both sides are equal to kill strict inequalities.' },

    { id: 'P732', lesson: 'L7-3', obj: 'L73b', spec: ['Prf5'], diff: 1, type: 'mcq',
      stem: r`In Paper 2 there is no penalty for wrong answers. You have spent six minutes on a question and eliminated two of six options, but cannot finish. What is the best action?`,
      options: [r`Keep working until you finish, however long it takes.`, r`Leave it blank and move on.`, r`Choose one of the remaining options, flag the question, and move on.`, r`Restart the question from the beginning.`], answer: 2,
      notes: [r`This risks running out of time on questions you could answer quickly.`, r`A blank can never score; a guess among four might.`, r`Correct: bank a reasonable guess, keep time for other questions, return if time allows.`, r`Rarely efficient.`],
      key: 'No penalty: always record an answer.',
      sol: 'With no penalty, an educated guess among the remaining four options is better than a blank. Flagging it lets you return later with fresh eyes.',
      hints: ['Is there a penalty for wrong answers?', 'What is the average time per question?', 'Can you return later?'],
      mis: ['strategy'], tip: 'Guess, flag, move on, return.' },

    { id: 'P733', lesson: 'L7-3', obj: 'L73a', spec: ['Prf5'], diff: 2, type: 'mcq',
      stem: r`Which one of the following is true for all real $a$ and $b$?`,
      options: [r`$|a + b| = |a| + |b|$`, r`$|a + b| \le |a| + |b|$`, r`$|a - b| \le |a| - |b|$`, r`$|ab| < |a|\,|b|$`], answer: 1,
      notes: [r`$a = 1$, $b = -1$: $0 \ne 2$.`, r`Correct: this is the triangle inequality.`, r`$a = 0$, $b = 1$: $1 \le -1$ is false.`, r`$|ab| = |a|\,|b|$ always, so the strict inequality never holds.`],
      key: 'Test opposite signs and zero.',
      sol: r`The triangle inequality $|a + b| \le |a| + |b|$ holds for all real $a$, $b$ (consider the cases where $a$, $b$ have the same or opposite signs). The other options fail for the values shown.`,
      hints: [r`Try $a = 1, b = -1$.`, r`Try $a = 0, b = 1$.`, 'Is |ab| ever different from |a||b|?'],
      mis: ['examples-prove'], tip: 'Opposite signs are the natural test for modulus claims.' },

    { id: 'P734', lesson: 'L7-3', obj: 'L73a', spec: ['Prf5', 'Prf1'], diff: 1, type: 'mcq',
      stem: r`Which single test value disproves “for all real $x$, $x^3 \ge x^2$”?`,
      options: [r`$x = 2$`, r`$x = 1$`, r`$x = 0$`, r`$x = -1$`, r`$x = 10$`], answer: 3,
      notes: [r`$8 \ge 4$.`, r`$1 \ge 1$.`, r`$0 \ge 0$.`, r`Correct: $-1 \ge 1$ is false.`, r`$1000 \ge 100$.`],
      key: r`Negative $x$ makes $x^{3}$ negative but $x^{2}$ positive.`,
      sol: r`$x = -1$: $x^3 = -1$ and $x^2 = 1$, and $-1 \ge 1$ is false.`,
      hints: [r`When is $x^{3}$ negative?`, r`Is $x^{2}$ ever negative?`, 'Try a negative value.'],
      mis: ['counterexample-form'], tip: 'Negative numbers separate odd and even powers.' },

    { id: 'P735', lesson: 'L7-3', obj: 'L73a', spec: ['Prf5'], diff: 2, type: 'mcq', pre: ['R2'],
      stem: r`Let $f(x) = (x - a)(x - b)(x - c)$ where $a < b < c$. Which one of the following statements is **false**?`,
      options: [r`$f(x) > 0$ for all $x > c$.`, r`$f(x) < 0$ for all $x < a$.`, r`$f(x) > 0$ for all $x$ with $b < x < c$.`, r`The equation $f(x) = 0$ has exactly three real solutions.`], answer: 2,
      notes: [r`True: all three factors are positive.`, r`True: all three factors are negative.`, r`Correct (this is false): for $b < x < c$ the signs are $(+)(+)(-)$, so $f(x) < 0$.`, r`True: $a$, $b$, $c$ are distinct.`],
      key: 'Count negative factors in each interval.',
      sol: r`For $b < x < c$: $x - a > 0$, $x - b > 0$, $x - c < 0$, so $f(x) < 0$. The third statement is false.`,
      hints: ['Sketch a positive cubic with three roots.', 'Count the negative factors in each interval.', 'Which interval has exactly one negative factor?'],
      mis: ['inequality-sign'], tip: 'Sign of a product = parity of the number of negative factors.' },

    { id: 'P736', lesson: 'L7-3', obj: 'L73a', spec: ['Prf5'], diff: 3, type: 'mcq', pre: ['R5'],
      stem: r`How many solutions does $\sin 3x = \tfrac{1}{2}$ have for $0^\circ \le x < 360^\circ$?`,
      options: [r`$2$`, r`$3$`, r`$4$`, r`$6$`, r`$12$`], answer: 3,
      notes: [r`That is the count for $\sin x = \tfrac{1}{2}$.`, r`An unlikely miscount.`, r`Only two of the three periods counted.`, r`Correct: $3x$ runs over three full periods, with two solutions in each.`, r`Double counting.`],
      key: r`$3x$ ranges over $0^\circ \le 3x < 1080^\circ$, three periods.`,
      sol: r`Let $\theta = 3x$, with $0^\circ \le \theta < 1080^\circ$. $\sin\theta = \tfrac{1}{2}$ has two solutions per $360^\circ$ ($30^\circ$ and $150^\circ$ plus multiples of $360^\circ$), giving $6$ values of $\theta$, hence 6 values of $x$.`,
      hints: [r`Substitute $\theta  = 3x$ and find its range.`, 'How many solutions per 360°?', 'How many periods are covered?'],
      mis: ['stop-early'], tip: r`For $\sin(kx)$, multiply the interval by $k$ first.` },

    { id: 'P737', lesson: 'L7-3', obj: 'L73b', spec: ['Prf5'], diff: 1, type: 'mcq',
      stem: r`In Paper 2 (20 questions, 75 minutes, no penalty), after 40 minutes you have answered 8 questions and flagged 3 hard ones that you skipped. 9 questions remain unseen. Which plan is most sensible?`,
      options: [r`Return to the 3 flagged questions now and finish them before looking at the rest.`, r`Work through the 9 unseen questions first, aiming for about 3 to 4 minutes each, then use any time left on the flagged ones, entering a guess for anything still unanswered before time ends.`, r`Leave the flagged questions blank, because wrong answers lose marks.`, r`Give every remaining question exactly 3 minutes 45 seconds, whatever its difficulty.`], answer: 1,
      notes: [r`The unseen questions may be quicker marks; the hard ones have already resisted you.`, r`Correct: 35 minutes for 9 unseen questions is just under 4 minutes each, and no penalty means every blank should be filled.`, r`There is no penalty for wrong answers.`, r`The average is a budget across the paper, not a rule for each question.`],
      key: 'Bank the accessible marks first; never leave a blank.',
      sol: r`35 minutes remain. Seeing all 9 unseen questions first secures the marks that are quickest for you. Then return to the flagged questions, and before time ends enter a guess for anything unanswered, since there is no penalty.`,
      hints: ['How much time is left, and for how many unseen questions?', 'Which questions are most likely to give quick marks?', 'Is there a penalty for guessing?'],
      mis: ['strategy'], tip: 'Unseen questions first, flagged ones second, guesses last.' }
  );

  /* ================================================================== U8 toolkit */
  const refresher = (id, title, mins, objective, idea, worked, qs) => {
    TLL.lessons.push({
      id, unit: 'U8', title, mins, spec: [], prereq: [], refresher: true,
      objectives: [{ id: id.replace('-', '') + 'a', text: objective }],
      purpose: 'A quick refresher of Section 1 content that Paper 2 questions rely on. If this feels unfamiliar, revise the topic more fully from your A-level resources.',
      refs: ['spec2026'],
      steps: [
        { k: 'idea', title: 'Key facts', body: idea },
        { k: 'worked', id: worked.id },
        { k: 'practice', ids: qs.map(q => q.id) },
        { k: 'summary', body: 'Return to this refresher whenever a lesson links to it.' }
      ]
    });
    TLL.worked.push(Object.assign({ lesson: id }, worked));
    qs.forEach(q => TLL.questions.push(Object.assign({ lesson: id, obj: id.replace('-', '') + 'a', spec: [], type: 'mcq' }, q)));
  };

  refresher('R1', 'Parity, divisibility and remainders', 4,
    'Use even/odd forms and remainders to reason about integers.',
    r`- Even: $2k$. Odd: $2k + 1$. Multiple of $m$: $mk$.
- Every integer leaves exactly one remainder $0, 1, \ldots, m - 1$ on division by $m$: write $n = mk + r$.
- Products of consecutive integers: among $m$ consecutive integers, one is a multiple of $m$.
- If a **prime** $p$ divides $ab$ then $p$ divides $a$ or $b$; in particular $p \mid n^2 \Rightarrow p \mid n$.`,
    { id: 'W43', title: 'Squares modulo 4', problem: r`Show that no perfect square leaves remainder 2 or 3 on division by 4.`,
      steps: [
        { do: r`$n = 2k$: $n^2 = 4k^2$, remainder 0.`, why: '' },
        { do: r`$n = 2k + 1$: $n^2 = 4(k^2 + k) + 1$, remainder 1.`, why: '' },
        { do: r`So squares leave remainder 0 or 1 only.`, why: 'Parity cases cover all integers.' }
      ], takeaway: 'Remainder arguments settle “never” claims about integers.' },
    [
      { id: 'P801', obj: 'R1a', diff: 1, stem: r`Which expression is odd for **every** integer $n$?`,
        options: [r`$2n + 1$`, r`$3n + 1$`, r`$n^2 + 1$`, r`$n^2 + n$`], answer: 0,
        notes: [r`Correct: twice an integer plus one.`, r`$n = 1$ gives 4.`, r`$n = 1$ gives 2.`, r`Always even: $n(n + 1)$.`],
        key: r`Odd means $2 \times (\text{integer}) + 1$.`, sol: r`$2n + 1$ is odd by definition. The others are even for $n = 1$.`,
        hints: [r`Try $n = 1$.`, r`Which option is already in the form $2k + 1$?`, r`$n^{2} + n = n(n + 1)$.`], mis: [], tip: r`Test $n = 1$ and $n = 2$ to eliminate quickly.` },
      { id: 'P802', obj: 'R1a', diff: 2, stem: r`When the square of an integer is divided by 3, the possible remainders are:`,
        options: [r`0 only`, r`0 or 1`, r`0, 1 or 2`, r`1 or 2`], answer: 1,
        notes: [r`$1^2 = 1$ leaves remainder 1.`, r`Correct.`, r`Remainder 2 never occurs.`, r`$3^2 = 9$ leaves remainder 0.`],
        key: r`$(3k)^2$, $(3k \pm 1)^2$ leave 0, 1, 1.`, sol: r`$(3k)^2 = 9k^2$; $(3k + 1)^2 = 3(3k^2 + 2k) + 1$; $(3k + 2)^2 = 3(3k^2 + 4k + 1) + 1$. Remainders 0 or 1.`,
        hints: ['Square 0, 1 and 2.', r`Do the remainders depend on more than $n$ mod 3?`, 'List them.'], mis: ['missing-case'], tip: 'Squares mod 3 are 0 or 1.' }
    ]);

  refresher('R2', 'Inequalities and signs', 4,
    'Solve linear and quadratic inequalities and manipulate them safely.',
    r`- Multiplying or dividing by a negative number reverses an inequality.
- Quadratic inequalities: find the roots, sketch, read off. For $(x - \alpha)(x - \beta) < 0$ with $\alpha < \beta$: $\alpha < x < \beta$; for $> 0$: $x < \alpha$ or $x > \beta$.
- Do not divide by an unknown: $x^2 < 5x$ is **not** equivalent to $x < 5$.`,
    { id: 'W44', title: 'A quadratic inequality without dividing', problem: r`Solve $x^2 < 5x$.`,
      steps: [
        { do: r`$x^2 - 5x < 0 \iff x(x - 5) < 0$.`, why: r`Compare with zero instead of dividing by $x$.` },
        { do: r`Roots $0$ and $5$; the parabola is below the axis between them: $0 < x < 5$.`, why: '' },
        { do: r`(Dividing by $x$ would wrongly include all negative $x$.)`, why: '' }
      ], takeaway: 'Rearrange to compare with zero, factorise, sketch.' },
    [
      { id: 'P803', obj: 'R2a', diff: 1, stem: r`Solve $x^2 < 6x$.`,
        options: [r`$x < 6$`, r`$0 < x < 6$`, r`$x < 0$ or $x > 6$`, r`$x > 6$`], answer: 1,
        notes: [r`Dividing by $x$ is invalid; $x = -1$ gives $1 < -6$, false.`, r`Correct: $x(x - 6) < 0$.`, r`This is where $x^2 > 6x$.`, r`$x = 7$: $49 < 42$ is false.`],
        key: 'Factorise, do not divide.', sol: r`$x(x - 6) < 0 \iff 0 < x < 6$.`,
        hints: ['Bring everything to one side.', 'Factorise.', 'Between or outside the roots?'], mis: ['divide-zero', 'inequality-sign'], tip: r`Never divide an inequality by $x$.` },
      { id: 'P804', obj: 'R2a', diff: 1, stem: r`If $a < b$ and $c < 0$, which of the following must be true?`,
        options: [r`$ac < bc$`, r`$ac > bc$`, r`$ac = bc$`, r`$a + c > b + c$`], answer: 1,
        notes: [r`Multiplying by a negative reverses the inequality.`, r`Correct.`, r`Only if $a = b$.`, r`Adding preserves the inequality: $a + c < b + c$.`],
        key: 'Multiplying by a negative reverses.', sol: r`$b - a > 0$ and $c < 0$, so $(b - a)c < 0$, i.e. $bc < ac$.`,
        hints: [r`Test $a = 1, b = 2, c = -1$.`, 'What does multiplying by a negative do?', 'Compare ac and bc.'], mis: ['inequality-sign'], tip: 'Test with small numbers to check direction.' }
    ]);

  refresher('R3', 'Roots, powers and modulus', 4,
    'Work accurately with square roots, indices and the modulus function.',
    r`- $\sqrt{x}$ means the **non-negative** root, so $\sqrt{x^2} = |x|$.
- $|x| < a \iff -a < x < a$ (for $a > 0$); $|x - c| < a$ means “within $a$ of $c$”.
- $x^{-n} = \dfrac{1}{x^n}$, $x^{1/n} = \sqrt[n]{x}$, $(x^a)^b = x^{ab}$.
- Odd powers preserve order and sign; even powers do not.`,
    { id: 'W45', title: 'A modulus inequality as an interval', problem: r`Solve $|2x - 1| < 3$.`,
      steps: [
        { do: r`$-3 < 2x - 1 < 3$.`, why: r`$|y| < 3$ means $-3 < y < 3$.` },
        { do: r`$-2 < 2x < 4$, so $-1 < x < 2$.`, why: 'Add 1, divide by the positive number 2.' }
      ], takeaway: '|expression| < a becomes a double inequality.' },
    [
      { id: 'P805', obj: 'R3a', diff: 1, stem: r`For real $x$, $\sqrt{x^2}$ is equal to:`,
        options: [r`$x$`, r`$-x$`, r`$|x|$`, r`$\pm x$`], answer: 2,
        notes: [r`Fails for negative $x$.`, r`Fails for positive $x$.`, r`Correct.`, r`$\sqrt{\phantom{x}}$ gives a single non-negative value.`],
        key: 'The root symbol means the non-negative root.', sol: r`$\sqrt{x^2}$ is the non-negative number whose square is $x^2$, which is $|x|$.`,
        hints: [r`Try $x = -3$.`, r`Can $\sqrt{x}$ ever be negative?`, 'Which option is always non-negative?'], mis: ['domain'], tip: r`$\sqrt{x^{2}} = |x|$.` },
      { id: 'P806', obj: 'R3a', diff: 1, stem: r`Solve $|2x - 1| < 3$.`,
        options: [r`$-1 < x < 2$`, r`$x < 2$`, r`$-2 < x < 1$`, r`$x < -1$ or $x > 2$`], answer: 0,
        notes: [r`Correct.`, r`$x = -5$: $|{-11}| = 11$, not less than 3.`, r`Signs reversed.`, r`This is where $|2x - 1| > 3$.`],
        key: r`$-3 < 2x - 1 < 3$.`, sol: r`$-3 < 2x - 1 < 3 \iff -2 < 2x < 4 \iff -1 < x < 2$.`,
        hints: ['Write as a double inequality.', 'Add 1 throughout.', 'Divide by 2.'], mis: ['missing-case'], tip: 'Modulus less than a number: one interval.' }
    ]);

  refresher('R4', 'Quadratics and the discriminant', 4,
    'Use completing the square and the discriminant to reason about quadratics.',
    r`- $ax^2 + bx + c = 0$ (with $a \ne 0$) has two distinct real roots if $b^2 - 4ac > 0$, one repeated root if $= 0$, none if $< 0$.
- Completing the square: $x^2 + bx + c = \left(x + \tfrac{b}{2}\right)^2 + c - \tfrac{b^2}{4}$ gives the minimum value and where it occurs.
- **Hidden assumption:** if the coefficient of $x^2$ could be $0$, the equation is not quadratic.`,
    { id: 'W46', title: 'A hidden condition', problem: r`For which $k$ does $kx^2 + 4x + 1 = 0$ have two distinct real roots?`,
      steps: [
        { do: r`It must be a quadratic: $k \ne 0$. (At $k = 0$ it is linear, with one root.)`, why: 'Check the leading coefficient first.' },
        { do: r`Discriminant: $16 - 4k > 0 \iff k < 4$.`, why: '' },
        { do: r`Answer: $k < 4$ and $k \ne 0$.`, why: '' }
      ], takeaway: 'Always ask whether the leading coefficient could be zero.' },
    [
      { id: 'P807', obj: 'R4a', diff: 2, stem: r`The equation $kx^2 + 6x + 3 = 0$ has two distinct real roots exactly when:`,
        options: [r`$k < 3$`, r`$k < 3$ and $k \ne 0$`, r`$k > 3$`, r`$k \le 3$`], answer: 1,
        notes: [r`At $k = 0$ the equation is linear with one root.`, r`Correct.`, r`These give no real roots.`, r`$k = 3$ gives a repeated root, and $k = 0$ is linear.`],
        key: 'Discriminant > 0 and the equation must be quadratic.', sol: r`Need $k \ne 0$ and $36 - 12k > 0$, i.e. $k < 3$. So $k < 3$, $k \ne 0$.`,
        hints: [r`What if $k = 0$?`, 'Compute the discriminant.', 'Strict inequality for distinct roots.'], mis: ['missing-case'], tip: 'Check the leading coefficient before using the discriminant.' },
      { id: 'P808', obj: 'R4a', diff: 1, stem: r`What is the minimum value of $x^2 - 6x + 11$?`,
        options: [r`$2$`, r`$3$`, r`$11$`, r`$-2$`], answer: 0,
        notes: [r`Correct: $(x - 3)^2 + 2$.`, r`That is where the minimum occurs ($x = 3$).`, r`That is the value at $x = 0$.`, r`Sign error.`],
        key: r`$(x - 3)^2 + 2$.`, sol: r`$x^2 - 6x + 11 = (x - 3)^2 + 2 \ge 2$, with equality at $x = 3$.`,
        hints: ['Complete the square.', 'The minimum of a square is 0.', 'Do not confuse the x-value with the minimum value.'], mis: ['calc-slip'], tip: 'Minimum value vs where it occurs: read the question.' }
    ]);

  refresher('R5', 'Trigonometric values, graphs and solution counts', 5,
    'Use exact values, symmetries and periodicity to solve trigonometric equations in an interval.',
    r`- Exact values: $\sin 30^\circ = \tfrac{1}{2}$, $\cos 60^\circ = \tfrac{1}{2}$, $\tan 45^\circ = 1$, $\sin 60^\circ = \tfrac{\sqrt{3}}{2}$, $\tan 60^\circ = \sqrt{3}$.
- Symmetries: $\sin(180^\circ - x) = \sin x$, $\cos(360^\circ - x) = \cos x$, $\tan(180^\circ + x) = \tan x$.
- Periods: $\sin$ and $\cos$ have period $360^\circ$ ($2\pi$); $\tan$ has period $180^\circ$ ($\pi$).
- For $\sin(kx)$, the interval for $kx$ is $k$ times the interval for $x$.`,
    { id: 'W47', title: 'Counting solutions with a symmetry', problem: r`Solve $\cos x = -\tfrac{1}{2}$ for $0^\circ \le x \le 360^\circ$.`,
      steps: [
        { do: r`$\cos 60^\circ = \tfrac{1}{2}$, so the reference angle is $60^\circ$.`, why: '' },
        { do: r`Cosine is negative in the second and third quadrants: $x = 180^\circ - 60^\circ = 120^\circ$ and $x = 180^\circ + 60^\circ = 240^\circ$.`, why: 'Use a sketch or the symmetries.' }
      ], takeaway: 'Reference angle + sign + symmetry gives every solution.' },
    [
      { id: 'P809', obj: 'R5a', diff: 1, stem: r`How many solutions does $\cos x = -\tfrac{1}{2}$ have for $0^\circ \le x \le 360^\circ$?`,
        options: [r`$1$`, r`$2$`, r`$3$`, r`$4$`], answer: 1,
        notes: [r`There are two.`, r`Correct: $120^\circ$ and $240^\circ$.`, r`Too many.`, r`Too many.`],
        key: r`Two solutions per period for a value strictly between $-1$ and 1.`, sol: r`$x = 120^\circ$ and $x = 240^\circ$.`,
        hints: ['Reference angle?', r`Which quadrants have $\cos$ negative?`, 'Count.'], mis: ['stop-early'], tip: r`Values strictly between $-1$ and 1 give two solutions per period.` },
      { id: 'P810', obj: 'R5a', diff: 1, stem: r`For all $x$, $\sin(180^\circ - x)$ equals:`,
        options: [r`$\sin x$`, r`$-\sin x$`, r`$\cos x$`, r`$-\cos x$`], answer: 0,
        notes: [r`Correct: the sine graph is symmetric about $x = 90^\circ$.`, r`That is $\sin(-x)$.`, r`That is $\sin(90^\circ - x)$.`, r`Not an identity for this expression.`],
        key: 'Symmetry of the sine graph about 90°.', sol: r`$\sin(180^\circ - x) = \sin x$ (for example $\sin 150^\circ = \sin 30^\circ = \tfrac{1}{2}$).`,
        hints: [r`Test $x = 30^\circ$.`, r`Sketch $y = \sin  x$.`, 'Where is the line of symmetry?'], mis: ['many-to-one'], tip: r`Check identities with $x = 30^\circ$.` }
    ]);

  refresher('R6', 'Logarithms, exponentials and domains', 4,
    'Use laws of logarithms with attention to domains, and solve exponential equations.',
    r`- $a^b = c \iff b = \log_a c$ (for $a > 0$, $a \ne 1$, $c > 0$).
- $\log_a x + \log_a y = \log_a(xy)$, $\log_a x - \log_a y = \log_a \tfrac{x}{y}$, $k \log_a x = \log_a(x^k)$: valid for **positive** $x$, $y$.
- $a^x > 0$ always; $y = a^x$ is increasing for $a > 1$.
- Equations like $4^x - 5 \times 2^x + 4 = 0$: substitute $y = 2^x$ (remember $y > 0$).`,
    { id: 'W48', title: 'A disguised quadratic', problem: r`Solve $2^{2x} - 5 \times 2^x + 4 = 0$.`,
      steps: [
        { do: r`Let $y = 2^x > 0$: $y^2 - 5y + 4 = 0$, so $(y - 1)(y - 4) = 0$.`, why: '' },
        { do: r`$2^x = 1 \Rightarrow x = 0$; $2^x = 4 \Rightarrow x = 2$.`, why: 'Both y-values are positive, so both are allowed.' }
      ], takeaway: r`Substitute, solve, and reject any negative value of $2^{x}$.` },
    [
      { id: 'P811', obj: 'R6a', diff: 1, stem: r`The law $\log_a x + \log_a y = \log_a(xy)$ holds for which real $x$ and $y$?`,
        options: [r`all real $x$, $y$`, r`$x > 0$ and $y > 0$`, r`$xy > 0$`, r`$x \ne 0$ and $y \ne 0$`], answer: 1,
        notes: [r`$\log_a$ of a non-positive number is undefined.`, r`Correct: both sides must be defined.`, r`$x = y = -1$ makes the right side defined but the left undefined.`, r`Negative values are not allowed.`],
        key: 'Each logarithm on the left needs a positive argument.', sol: r`The left side needs $x > 0$ and $y > 0$; then both sides are defined and equal.`,
        hints: [r`For which inputs is $\log$ defined?`, 'Check the left-hand side.', r`Try $x = y = -1$.`], mis: ['domain'], tip: r`Check every $\log$ in the original expression.` },
      { id: 'P812', obj: 'R6a', diff: 2, stem: r`Solve $2^{2x} - 6 \times 2^x + 8 = 0$.`,
        options: [r`$x = 1$ or $x = 2$`, r`$x = 2$ or $x = 4$`, r`$x = 1$ only`, r`$x = \log_2 6$`], answer: 0,
        notes: [r`Correct: $2^x = 2$ or $2^x = 4$.`, r`These are the values of $2^x$, not $x$.`, r`$x = 2$ also works: $16 - 24 + 8 = 0$.`, r`No basis.`],
        key: r`Let $y = 2^x$: $(y - 2)(y - 4) = 0$.`, sol: r`$y^2 - 6y + 8 = 0$ gives $y = 2$ or $4$, so $x = 1$ or $x = 2$.`,
        hints: [r`Let $y = 2^{x}$.`, r`Solve the quadratic in $y$.`, r`Convert back to $x$.`], mis: ['calc-slip'], tip: r`Do not stop at the value of $y$.` }
    ]);
})();
