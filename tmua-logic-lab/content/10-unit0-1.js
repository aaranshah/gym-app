/* Unit 0 (orientation) and Unit 1: Statements and implications (Arg1) */
(function () {
  const r = String.raw;

  TLL.units.push(
    { id: 'U0', title: 'Start here', summary: 'What Paper 2 assesses, how this course works, and what it cannot do for you.' },
    { id: 'U1', title: 'Statements and implications', summary: 'Truth, domains, and/or/not, the three kinds of “if”, converse and contrapositive.', spec: ['Arg1'] }
  );

  /* ------------------------------------------------------------------ L0-1 */
  TLL.lessons.push({
    id: 'L0-1', unit: 'U0', title: 'How Paper 2 works', mins: 5, spec: [], prereq: [],
    objectives: [{ id: 'L01a', text: 'Describe the format of TMUA Paper 2 and what it assesses.' }, { id: 'L01b', text: 'Explain how to use this course: accuracy first, then speed.' }],
    purpose: 'Knowing the format lets you plan your time and recognise which skill a question is testing.',
    refs: ['spec2026', 'ies2007', 'dunlosky2013'],
    steps: [
      { k: 'predict', stem: r`Paper 2 has 20 multiple-choice questions in 75 minutes. What is the **average** time available per question?`,
        options: [r`2 minutes`, r`3 minutes`, r`3 minutes 45 seconds`, r`5 minutes`], answer: 2,
        notes: [r`That would be 40 minutes in total.`, r`That would be 60 minutes in total.`, r`$75 \div 20 = 3.75$ minutes, which is 3 minutes 45 seconds.`, r`That would be 100 minutes in total.`] },
      { k: 'idea', title: 'What Paper 2 tests', body: r`Paper 2 (“Mathematical Reasoning”) tests whether you can **construct and analyse mathematical arguments**. The official specification lists eleven reasoning requirements (Arg1–Arg4, Prf1–Prf5, Err1–Err2), and Paper 2 also draws on all the mathematical content of Section 1 (mostly AS pure maths and higher GCSE).

The rules for the current cycle (checked against the UAT-UK specification for October 2026 and January 2027 sittings):

- two papers of 75 minutes, each with 20 multiple-choice questions;
- **no calculator**, no formula booklet;
- **no penalty** for wrong answers, so answer every question.

You will **not** be asked to use symbolic logic notation or to complete formal truth tables. This course occasionally shows a symbol or a small table as an optional explanation, never as something you must learn.

$75 \div 20 = 3.75$ minutes is an **average**, not a per-question limit. Some questions take one minute, others six.` },
      { k: 'idea', title: 'How to use this course', body: r`Each lesson follows the same rhythm: a quick prediction, one idea, examples and a non-example, a worked example, a guided problem, then problems on your own. Later, short retrieval checks bring old ideas back.

- **Accuracy first.** Timers stay hidden until you choose a timed drill or a mock.
- **Try before you look.** Hints are available, but they are recorded separately from independent success.
- **Mastery needs evidence.** A lesson is marked “secure” only after several varied independent answers, including one at least a day later.

What this course cannot do: it focuses on Paper 2 reasoning. It includes short refreshers of the maths that Paper 2 uses, but it does **not** teach all of the Section 1 content. Use official past papers as well.` },
      { k: 'summary', body: r`20 questions, 75 minutes, no calculator, no penalty. Paper 2 rewards careful reading of logical words and secure AS-level algebra. Work for accuracy first; speed comes from recognising patterns you have practised.` }
    ]
  });

  /* ------------------------------------------------------------------ L1-1 */
  TLL.lessons.push({
    id: 'L1-1', unit: 'U1', title: 'Statements, truth and domains', mins: 7, spec: ['Arg1'], prereq: ['L0-1'],
    objectives: [
      { id: 'L11a', text: 'Decide whether a sentence is a statement and find its truth value.' },
      { id: 'L11b', text: 'Explain how the domain or stated assumptions change whether a claim is true.' }
    ],
    purpose: r`Many Paper 2 questions turn on a single phrase such as “for all real $x$” or “positive integer $n$”. Reading the domain first prevents wrong answers that are correct for a different domain.`,
    refs: ['spec2026', 'notesLogic'],
    steps: [
      { k: 'predict', stem: r`Is the sentence “$x^2 > x$” true?`,
        options: [r`Yes, always`, r`No, never`, r`It depends: we need to know which $x$ (or which values of $x$) it refers to`], answer: 2,
        notes: [r`It fails for $x = 1$, since $1 > 1$ is false.`, r`It holds for $x = 2$, since $4 > 2$.`, r`Correct. With an unspecified $x$ the sentence is not yet true or false. It becomes a statement once $x$ is given a value or a phrase such as “for all real $x$” is added.`] },
      { k: 'idea', title: 'Statements need a definite truth value', body: r`A **statement** is a sentence that is either true or false. “$\sqrt{2}$ is irrational” is a true statement. “Every prime is odd” is a false statement (2 is an even prime).

A sentence with a free variable, such as “$x + 1 = 5$”, is not true or false until we know what $x$ is. Paper 2 usually fixes this with a phrase such as “for **all** real numbers $x$” or “for **some** positive integer $n$”.

The **domain** matters. “$x^2 \ge x$” holds for every integer, but not for every real number: $x = \tfrac{1}{2}$ gives $\tfrac{1}{4} < \tfrac{1}{2}$.

**Habit:** before thinking about a claim, underline (mentally) the domain: integers? positive? real? non-zero?` },
      { k: 'examples', yes: { title: 'Statements', body: r`“91 is prime” (false: $91 = 7 \times 13$).

“For every real $x$, $(x-1)^2 \ge 0$” (true).` },
        no: { title: 'Not statements', body: r`“Is 91 prime?” is a question.

“$x^2 - 1 = 0$” has a free variable; it is true for $x = \pm 1$ and false otherwise, so on its own it has no single truth value.` } },
      { k: 'worked', id: 'W01' },
      { k: 'guided', title: 'Your turn, with support', problem: r`Is it true that $\dfrac{1}{x} < 1$ for all $x > 1$?`,
        parts: [
          { show: r`We are told $x > 1$, so in particular $x$ is **positive**.` },
          { ask: { stem: r`Why is it safe to multiply both sides of $\dfrac{1}{x} < 1$ by $x$ here?`,
            options: [r`Because $x$ is positive, so the inequality sign keeps its direction`, r`Because multiplying by $x$ never changes an inequality`, r`Because $x$ is an integer`],
            answer: 0, notes: [r`Correct: multiplying by a positive number preserves the inequality.`, r`False: multiplying by a negative number reverses it, and by zero destroys it.`, r`Nothing says $x$ is an integer, and it would not matter anyway.`] } },
          { show: r`Multiplying gives the equivalent inequality $1 < x$, which is exactly our assumption. Because each step can be reversed for positive $x$, the claim is **true**.` }
        ] },
      { k: 'practice', ids: ['P111', 'P112'] },
      { k: 'check' },
      { k: 'summary', body: r`A statement is either true or false. Read the domain before anything else: the same algebra can be true for integers and false for real numbers.` }
    ]
  });

  TLL.worked.push({
    id: 'W01', lesson: 'L1-1', title: 'The same inequality on two different domains',
    problem: r`Decide whether each statement is true: (a) $n^2 \ge n$ for every integer $n$; (b) $x^2 \ge x$ for every real number $x$.`,
    steps: [
      { do: r`Rewrite as $n^2 - n \ge 0$, that is $n(n-1) \ge 0$.`, why: 'Comparing with zero lets us use signs of factors.' },
      { do: r`For integers: if $n \ge 1$, both $n$ and $n-1$ are $\ge 0$; if $n \le 0$, both are $\le 0$. Either way the product is $\ge 0$.`, why: 'There is no integer strictly between 0 and 1, so these two cases cover every integer.' },
      { do: r`So (a) is **true**.`, why: '' },
      { do: r`For real numbers, try a value strictly between 0 and 1, say $x = \tfrac{1}{2}$: $x^2 = \tfrac{1}{4} < \tfrac{1}{2}$.`, why: 'The integer argument relied on there being no value between 0 and 1; reals do have such values.' },
      { do: r`So (b) is **false**, with counterexample $x = \tfrac{1}{2}$.`, why: '' }
    ],
    takeaway: 'Identify the domain first. A gap in the integer argument (no number between 0 and 1) is exactly where a real counterexample lives.'
  });

  TLL.questions.push(
    { id: 'P111', lesson: 'L1-1', obj: 'L11a', spec: ['Arg1'], diff: 1, type: 'mcq',
      stem: r`Which of the following is a statement (a sentence that is definitely either true or false)?`,
      options: [r`$x^2 - 1 = 0$`, r`Is 91 a prime number?`, r`91 is a prime number.`, r`Let $n$ be an integer.`], answer: 2,
      notes: [r`This depends on $x$, so it has no single truth value.`, r`A question is not a statement.`, r`Correct: this is a (false) statement, since $91 = 7 \times 13$.`, r`An instruction, not a claim that is true or false.`],
      key: 'A statement must have a single truth value, even if that value is “false”.',
      sol: r`Only “91 is a prime number” is definitely true or false. It is false, because $91 = 7 \times 13$, but a false statement is still a statement.`,
      hints: ['Ask of each option: could I say “that is true” or “that is false” without more information?', 'A false claim still counts as a statement.', 'Check whether the option contains a free variable or is not a claim at all.'],
      mis: [], tip: 'Being false does not stop something being a statement.' },

    { id: 'P112', lesson: 'L1-1', obj: 'L11b', spec: ['Arg1'], diff: 2, type: 'mcq',
      stem: r`For which domain is the statement “$x^2 \ge x$ for all $x$ in the domain” true?`,
      options: [r`all real numbers`, r`all positive real numbers`, r`all integers`, r`all real numbers strictly between 0 and 1`], answer: 2,
      notes: [r`Fails at $x = \tfrac{1}{2}$.`, r`$\tfrac{1}{2}$ is positive and $\tfrac{1}{4} < \tfrac{1}{2}$.`, r`Correct: $n(n-1) \ge 0$ for every integer because $n$ and $n-1$ never have opposite signs.`, r`Fails for every such $x$, since $x^2 < x$ when $0 < x < 1$.`],
      key: r`$x^2 \ge x \iff x(x-1) \ge 0$, which fails exactly when $0 < x < 1$.`,
      sol: r`$x^2 \ge x$ is equivalent to $x(x-1) \ge 0$, which is false exactly for $0 < x < 1$. The only domain listed that contains no number strictly between 0 and 1 is the integers, so “all integers” is correct.`,
      hints: ['Rearrange so that one side is zero.', r`Factorise $x^2 - x$ and decide when the product is negative.`, r`Which domain avoids every number strictly between 0 and 1?`],
      mis: ['domain', 'examples-prove'], tip: 'Find the exact set where a claim fails, then check whether the domain avoids it.' },

    { id: 'P113', lesson: 'L1-1', obj: 'L11a', spec: ['Arg1', 'Prf1'], diff: 2, type: 'mcq',
      stem: r`Consider the statement: “For every positive integer $n$, $n^2 + n + 41$ is prime.” Which of the following is correct?`,
      options: [r`It is true; checking $n = 1$ to $n = 10$ gives primes each time.`, r`It is false, and the smallest counterexample is $n = 40$.`, r`It is false, but every counterexample is at least 100.`, r`It cannot be decided without checking every positive integer.`], answer: 1,
      notes: [r`Ten examples cannot prove a claim about every positive integer.`, r`Correct: $40^2 + 40 + 41 = 40(40+1) + 41 = 41 \times 41$.`, r`$n = 40$ already fails.`, r`One counterexample decides it: the statement is false.`],
      key: r`Choose $n$ to make the expression factorise: $n = 40$ gives $40 \times 41 + 41 = 41^2$.`,
      sol: r`With $n = 40$: $n^2 + n + 41 = 40 \times 41 + 41 = 41 \times 41$, which is not prime. So the statement is false. (For $n = 1, 2, \ldots, 39$ the values happen to be prime, so 40 is the smallest counterexample.)`,
      hints: ['Examples cannot prove a “for every” claim, but one example can disprove it.', r`Look for a value of $n$ that makes every term share a factor.`, r`Try $n = 40$ and write $n^2 + n = n(n+1)$.`],
      mis: ['examples-prove'], tip: r`To break “always prime”, choose $n$ so that every term has a common factor.` },

    { id: 'P114', lesson: 'L1-1', obj: 'L11b', spec: ['Arg1'], diff: 2, type: 'mcq', pre: ['R3'],
      stem: r`The statement $\sqrt{x^2} = x$ is true for which real numbers $x$?`,
      options: [r`all real $x$`, r`$x \ge 0$ only`, r`$x > 0$ only`, r`$x \le 0$ only`], answer: 1,
      notes: [r`For $x = -3$: $\sqrt{9} = 3 \ne -3$.`, r`Correct: $\sqrt{x^2} = |x|$, which equals $x$ exactly when $x \ge 0$.`, r`This omits $x = 0$, where $\sqrt{0} = 0$ holds.`, r`For $x = -3$ it fails; it only works at $x = 0$ among non-positive values.`],
      key: r`The square-root symbol means the non-negative root, so $\sqrt{x^2} = |x|$.`,
      sol: r`$\sqrt{x^2}$ is the non-negative number whose square is $x^2$, which is $|x|$. And $|x| = x$ exactly when $x \ge 0$.`,
      hints: [r`Test a negative value such as $x = -3$.`, r`What does $\sqrt{\phantom{x}}$ always return: positive, negative or either?`, r`Write $\sqrt{x^2}$ using modulus notation.`],
      mis: ['domain', 'missing-case'], tip: r`Remember $\sqrt{x^2} = |x|$ whenever square roots and squares meet.` },

    { id: 'P115', lesson: 'L1-1', obj: 'L11a', spec: ['Arg1', 'Arg3'], diff: 2, type: 'tfset',
      stem: r`Decide whether each statement is true or false.`,
      statements: [
        { s: r`Every square number is even.`, t: false, why: r`$1$ and $9$ are odd square numbers.` },
        { s: r`There is a prime number that is even.`, t: true, why: r`$2$ is prime and even.` },
        { s: r`$2^n > n^2$ for every positive integer $n$.`, t: false, why: r`$n = 2$: $4 > 4$ is false (so is $n = 3$: $8 > 9$).` },
        { s: r`For every real $x$, $(x - 1)^2 \ge 0$.`, t: true, why: 'A square of a real number is never negative.' }
      ],
      key: 'One counterexample settles a “every” claim; one example settles a “there is” claim.',
      sol: 'Statements 2 and 4 are true; statements 1 and 3 are false (see the reason beside each).',
      hints: ['Test small values first, including 1 and 2.', 'For “there is”, one example is enough.', 'For “every”, look for a single failure.'],
      mis: ['examples-prove'], tip: r`Small values (0, 1, 2) are the fastest test for “for every $n$” claims.` },

    { id: 'P116', lesson: 'L1-1', obj: 'L11b', spec: ['Arg1', 'Err2'], diff: 3, type: 'mcq', transfer: true,
      stem: r`A student says: “The statement $\dfrac{x^2-4}{x-2} = x+2$ is true for all real numbers $x$.” Which is the best response?`,
      options: [r`The student is correct.`, r`The student is wrong: it fails at $x = -2$.`, r`The student is wrong: the left-hand side is undefined at $x = 2$, so it holds for all real $x$ except $2$.`, r`The student is wrong: it is never true.`], answer: 2,
      notes: [r`At $x = 2$ the left side is $\tfrac{0}{0}$, which is undefined.`, r`At $x = -2$ both sides equal $0$, so it holds there.`, r`Correct: $\dfrac{(x-2)(x+2)}{x-2} = x + 2$ needs $x - 2 \ne 0$.`, r`It holds for every $x \ne 2$.`],
      key: 'Cancelling a factor is only valid where that factor is non-zero.',
      sol: r`$\dfrac{x^2-4}{x-2} = \dfrac{(x-2)(x+2)}{x-2}$. Cancelling $x - 2$ is allowed only when $x \ne 2$. At $x = 2$ the left-hand side is undefined, so the identity holds for all real $x$ except $x = 2$.`,
      hints: ['Factorise the numerator.', 'When is it legal to cancel a common factor?', r`Substitute $x = 2$ into the left-hand side.`],
      mis: ['domain', 'divide-zero'], tip: 'Whenever you cancel, ask “could this factor be zero?”' }
  );

  /* ------------------------------------------------------------------ L1-2 */
  TLL.lessons.push({
    id: 'L1-2', unit: 'U1', title: 'And, inclusive or, not', mins: 7, spec: ['Arg1', 'Arg4'], prereq: ['L1-1'],
    objectives: [
      { id: 'L12a', text: 'Find the truth of “and” and (inclusive) “or” statements.' },
      { id: 'L12b', text: 'Negate simple statements and inequalities accurately.' }
    ],
    purpose: r`TMUA uses “or” in the inclusive sense, and many wrong answers come from negating “$x > 3$” as “$x < 3$”.`,
    refs: ['spec2026', 'notesLogic'],
    steps: [
      { k: 'predict', stem: r`Is “$n$ is even **or** $n$ is a multiple of 3” true when $n = 6$?`,
        options: [r`Yes`, r`No, because both parts are true`, r`It is neither true nor false`], answer: 0,
        notes: [r`Correct: in mathematics “or” means at least one part is true, and here both are.`, r`That would be the exclusive “or”, which mathematics does not use unless it says so.`, r`With $n = 6$ fixed, it is a definite statement.`] },
      { k: 'idea', title: 'Three building blocks', body: r`- “A **and** B” is true only when both A and B are true.
- “A **or** B” is true when **at least one** of A, B is true (including both). This is the *inclusive* or, and it is what the specification means.
- “**not** A” is true exactly when A is false.

Negating an inequality: the negation of $x > 3$ is $x \le 3$, **not** $x < 3$ (the value $3$ itself must go somewhere).

Negation depends on the domain: for integers, “not even” means “odd”; for real numbers there is no such pairing.` },
      { k: 'diagram', d: { type: 'numberline', min: -1, max: 7, marks: [3], rows: [
        { label: 'x > 3', from: 3, to: 'inf', openLeft: true },
        { label: 'not (x > 3), that is x ≤ 3', from: '-inf', to: 3, openRight: false }
      ] }, alt: 'Two number lines. Top: x greater than 3, an open circle at 3 with shading to the right. Bottom: its negation, x less than or equal to 3, a filled circle at 3 with shading to the left. Together they cover the whole line without overlap.', caption: 'A statement and its negation split every case between them: no overlap and no gap. The point 3 belongs to the negation.' },
      { k: 'worked', id: 'W02' },
      { k: 'worked', id: 'W03' },
      { k: 'guided', title: 'Your turn, with support', problem: r`Negate “$-2 < x \le 5$” for real $x$.`,
        parts: [
          { show: r`First rewrite the double inequality as two conditions joined by **and**: “$-2 < x$ and $x \le 5$”.` },
          { ask: { stem: r`Which is the negation?`, options: [r`$x \le -2$ or $x > 5$`, r`$x < -2$ or $x \ge 5$`, r`$x \le -2$ and $x > 5$`, r`$-2 \ge x > 5$`], answer: 0,
            notes: [r`Correct: “not (A and B)” is “not A or not B”, and each inequality is negated including its boundary.`, r`The boundaries are wrong: $x = -2$ is outside the original interval, and $x = 5$ is inside it.`, r`No number is both $\le -2$ and $> 5$; the connective must change to “or”.`, r`This describes no numbers at all.`] } },
          { show: r`Check with a picture: the original is a single interval; its negation is “everything to the left, or everything to the right”.` }
        ] },
      { k: 'practice', ids: ['P121', 'P123'] },
      { k: 'check' },
      { k: 'summary', body: r`“Or” is inclusive. Negating keeps the boundary: not $(x > 3)$ is $x \le 3$. Negating “and” produces “or”.` }
    ]
  });

  TLL.worked.push(
    { id: 'W02', lesson: 'L1-2', title: 'Counting with “and” versus “or”',
      problem: r`For how many integers $n$ with $1 \le n \le 12$ is (a) “$n$ is even and $n > 7$” true; (b) “$n$ is even or $n > 7$” true?`,
      steps: [
        { do: r`Even values: $2, 4, 6, 8, 10, 12$. Values greater than 7: $8, 9, 10, 11, 12$.`, why: 'List each condition separately first.' },
        { do: r`(a) “and” needs both: $8, 10, 12$, so **3** integers.`, why: 'Intersection of the two lists.' },
        { do: r`(b) “or” needs at least one: $2, 4, 6, 8, 9, 10, 11, 12$, so **8** integers.`, why: 'Union of the lists; values in both are counted once.' }
      ],
      takeaway: '“And” is the overlap; inclusive “or” is everything in either list, each counted once.' },
    { id: 'W03', lesson: 'L1-2', title: 'Negating an inequality can produce “or”',
      problem: r`Write the negation of “$x^2 < 9$” for real $x$ as simply as possible.`,
      steps: [
        { do: r`The negation of $x^2 < 9$ is $x^2 \ge 9$.`, why: r`Negating “$<$” gives “$\ge$”, keeping the boundary.` },
        { do: r`$x^2 \ge 9 \iff (x-3)(x+3) \ge 0$.`, why: 'Rearrange to compare with zero, then factorise.' },
        { do: r`The product is $\ge 0$ when both factors have the same sign or one is zero: $x \le -3$ **or** $x \ge 3$.`, why: r`A quadratic inequality “$\ge 0$” with positive leading coefficient gives the two outer regions.` }
      ],
      takeaway: r`$x^2 < 9$ is the single interval $-3 < x < 3$; its negation is two pieces joined by “or”.` }
  );

  TLL.questions.push(
    { id: 'P121', lesson: 'L1-2', obj: 'L12a', spec: ['Arg1'], diff: 2, type: 'roman',
      stem: r`Let $x = -3$. Which of the following statements are true?`,
      parts: [
        { s: r`$x < 0$ or $x^2 < 0$`, t: true, why: r`$x < 0$ is true, which is enough for “or”.` },
        { s: r`$x < 0$ and $x^2 > 0$`, t: true, why: r`Both parts hold: $-3 < 0$ and $9 > 0$.` },
        { s: r`not ($x^2 = 9$)`, t: false, why: r`$x^2 = 9$ is true, so its negation is false.` }
      ],
      key: '“Or” needs one true part; “and” needs both.',
      sol: r`With $x = -3$: I is true because its first part is true. II is true because both parts are true. III is false because $x^2 = 9$. So I and II only.`,
      hints: ['Evaluate each smaller statement first, then combine.', '“Or” only needs one part true.', r`Compute $x^2$ once and reuse it.`],
      mis: ['inclusive-or'], tip: 'Evaluate atomic parts first, then apply and/or/not.' },

    { id: 'P122', lesson: 'L1-2', obj: 'L12b', spec: ['Arg4'], diff: 1, type: 'mcq',
      stem: r`Which of these is the negation of “$x > 3$” for real $x$?`,
      options: [r`$x < 3$`, r`$x \le 3$`, r`$x \ge 3$`, r`$x < -3$`], answer: 1,
      notes: [r`This leaves out $x = 3$, which makes “$x > 3$” false.`, r`Correct: every real number satisfies exactly one of $x > 3$ and $x \le 3$.`, r`$x = 4$ satisfies both this and the original, so it is not the negation.`, r`Values such as $x = 0$ are in neither set.`],
      key: 'A negation must cover every case the original misses, including the boundary.',
      sol: r`“not ($x > 3$)” holds exactly when $x$ is not greater than 3, which is $x \le 3$.`,
      hints: ['Where does the number 3 itself belong?', 'The statement and its negation should never overlap and never both fail.', r`Test $x = 3$ in each option.`],
      mis: ['negation-extreme'], tip: 'Test the boundary value when negating an inequality.' },

    { id: 'P123', lesson: 'L1-2', obj: 'L12a', spec: ['Arg1'], diff: 2, type: 'mcq',
      stem: r`How many integers $n$ with $1 \le n \le 20$ make “$n$ is a multiple of 3 or $n$ is a multiple of 5” true?`,
      options: [r`8`, r`9`, r`10`, r`1`, r`11`], answer: 1,
      notes: [r`8 is the count for “one or the other but not both”, which excludes 15.`, r`Correct: $6 + 4 - 1 = 9$.`, r`This counts 15 twice.`, r`1 counts only the numbers satisfying both (“and”).`, r`Check the lists again: multiples of 3 are 3, 6, 9, 12, 15, 18.`],
      key: '“Or” is inclusive: count the union, removing double counting.',
      sol: r`Multiples of 3: $3, 6, 9, 12, 15, 18$ (6 numbers). Multiples of 5: $5, 10, 15, 20$ (4 numbers). 15 is in both. Inclusive “or” gives $6 + 4 - 1 = 9$.`,
      hints: ['List the multiples of 3 and of 5 separately.', 'Is any number on both lists?', 'Count each number once.'],
      mis: ['inclusive-or', 'calc-slip'], tip: 'Union count = first + second − both.' },

    { id: 'P124', lesson: 'L1-2', obj: 'L12b', spec: ['Arg4'], diff: 2, type: 'mcq',
      stem: r`For a real number $x$, the statement “not ($x \ge 2$ and $x \le 6$)” is equivalent to which of the following?`,
      options: [r`$x < 2$ and $x > 6$`, r`$x < 2$ or $x > 6$`, r`$x \le 2$ or $x \ge 6$`, r`$2 < x < 6$`], answer: 1,
      notes: [r`No number satisfies both; the connective must change to “or”.`, r`Correct: the negation of “A and B” is “not A or not B”.`, r`$x = 2$ satisfies the original, so it cannot satisfy the negation.`, r`This is (almost) the original condition, not its negation.`],
      key: '“not (A and B)” means “not A or not B”.',
      sol: r`The original is the interval $2 \le x \le 6$. Its negation is everything outside it: $x < 2$ or $x > 6$.`,
      hints: ['Sketch the original set on a number line.', 'The negation is everything outside that set.', 'Check the endpoints 2 and 6.'],
      mis: ['negation-swap', 'negation-extreme'], tip: 'Draw the set; its negation is the rest of the line.' },

    { id: 'P125', lesson: 'L1-2', obj: 'L12a', spec: ['Arg1', 'Arg3'], diff: 2, type: 'tfset',
      stem: r`Here $n$ is a positive integer. Decide whether each statement is true or false.`,
      statements: [
        { s: r`For every $n$, “$n$ is odd or $n + 1$ is odd”.`, t: true, why: r`Of two consecutive integers exactly one is odd.` },
        { s: r`For every $n$, “$n$ is odd and $n + 1$ is odd”.`, t: false, why: r`$n = 1$: $n + 1 = 2$ is even.` },
        { s: r`For some $n$, “$n^2$ is even or $n$ is odd”.`, t: true, why: r`$n = 1$ works ($n$ is odd), and so does every other $n$.` },
        { s: r`For every $n$, “$n$ is prime or $n$ is even”.`, t: false, why: r`$n = 9$ is neither prime nor even (so is $n = 1$).` }
      ],
      key: 'Inclusive “or” needs one true part; “and” needs both.',
      sol: 'Statements 1 and 3 are true; 2 and 4 are false.',
      hints: [r`Try $n = 1, 2, 3$ for each statement.`, 'For “for every”, one failure is enough to make it false.', 'For “for some”, one success is enough to make it true.'],
      mis: ['inclusive-or'], tip: 'Check small cases quickly, then think about why a pattern holds.' },

    { id: 'P126', lesson: 'L1-2', obj: 'L12b', spec: ['Arg4', 'Arg1'], diff: 3, type: 'mcq', transfer: true,
      stem: r`A computer program outputs YES if the input $x$ satisfies “$x^2 > 4$ or $x < 1$”, and NO otherwise. For which real inputs does it output NO?`,
      options: [r`$1 \le x \le 2$`, r`$-2 \le x < 1$`, r`$1 < x < 2$`, r`$x \ge 1$`, r`$-2 \le x \le 2$`], answer: 0,
      notes: [r`Correct: NO means “$x^2 \le 4$ and $x \ge 1$”, giving $1 \le x \le 2$.`, r`These values satisfy $x < 1$, so the output is YES.`, r`$x = 1$ and $x = 2$ also give NO, since $1 \not> 4$, $4 \not> 4$ and neither is less than 1.`, r`$x = 3$ gives $x^2 = 9 > 4$, so YES.`, r`Values in $-2 \le x < 1$ satisfy $x < 1$, so give YES.`],
      key: '“not (A or B)” means “not A and not B”.',
      sol: r`NO happens when the condition is false: not ($x^2 > 4$ or $x < 1$), which is $x^2 \le 4$ **and** $x \ge 1$. Now $x^2 \le 4$ means $-2 \le x \le 2$; combined with $x \ge 1$ this gives $1 \le x \le 2$.`,
      hints: ['NO happens when the whole “or” statement is false.', 'An “or” statement is false only when both parts are false.', r`Combine $x^2 \le 4$ with $x \ge 1$.`],
      mis: ['negation-swap', 'negation-extreme'], tip: 'An “or” is false only when every part is false.' }
  );

  /* ------------------------------------------------------------------ L1-3 */
  TLL.lessons.push({
    id: 'L1-3', unit: 'U1', title: 'When is “if A then B” true?', mins: 8, spec: ['Arg1', 'Prf1'], prereq: ['L1-2'],
    objectives: [
      { id: 'L13a', text: 'Decide whether “if A then B” is true: it fails only when A is true and B is false.' },
      { id: 'L13b', text: 'Recognise that cases where A is false neither break nor confirm the implication.' }
    ],
    purpose: 'Almost every Paper 2 question contains an implication. Knowing exactly what would break one tells you what counterexample to look for.',
    refs: ['spec2026', 'notesLogic'],
    steps: [
      { k: 'predict', stem: r`Claim: “If $n$ is a multiple of 4, then $n$ is even.” Does $n = 6$ show the claim is false?`,
        options: [r`Yes, because 6 is not a multiple of 4`, r`Yes, because 6 is even but not a multiple of 4`, r`No: the claim only makes a promise about multiples of 4`], answer: 2,
        notes: [r`When the “if” part is false, the claim promises nothing.`, r`The claim never says that every even number is a multiple of 4; that would be its converse.`, r`Correct. To break it you would need a multiple of 4 that is not even, and there is none.`] },
      { k: 'idea', title: 'An implication is a promise', body: r`“If A then B” promises: **whenever A is true, B is true**. The only way to break the promise is a case where **A is true and B is false**.

When A is false, the promise has not been tested, so the implication still counts as true for that case.

To **disprove** a universal claim “for all $x$, if A then B”, you need one $x$ that makes A true and B false. To **prove** it, you must show B follows from A in every case.

Optional shorthand: some books write $A \Rightarrow B$. TMUA does not require this symbol.` },
      { k: 'diagram', d: { type: 'truthgrid' }, alt: 'Optional table with four rows: A true, B true: implication true. A true, B false: implication false. A false, B true: true. A false, B false: true.', caption: 'Optional aid (not needed for TMUA): only the row “A true, B false” breaks “if A then B”.' },
      { k: 'examples', yes: { title: 'Breaks the claim', body: r`Claim: “If $x^2 > 4$ then $x > 2$.” The value $x = -3$ makes $x^2 > 4$ true and $x > 2$ false, so it **breaks** the claim.` },
        no: { title: 'Does not break the claim', body: r`For the same claim, $x = 1$ makes $x^2 > 4$ false. It tells us nothing, so it is **not** a counterexample.` } },
      { k: 'worked', id: 'W04' },
      { k: 'worked', id: 'W05' },
      { k: 'guided', title: 'Your turn, with support', problem: r`For integers $n$: is “if $n^2$ is odd then $n$ is odd” true?`,
        parts: [
          { ask: { stem: r`Which kind of integer would break this claim?`, options: [r`one with $n^2$ odd and $n$ even`, r`one with $n^2$ even and $n$ odd`, r`one with $n^2$ even and $n$ even`], answer: 0,
            notes: [r`Correct: A true ($n^2$ odd) and B false ($n$ even).`, r`Here A is false, so the claim is not tested.`, r`Here A is false again.`] } },
          { show: r`If $n$ is even, $n = 2k$ and $n^2 = 4k^2$ is even. So “$n^2$ odd and $n$ even” never happens, and the claim is **true**.` }
        ] },
      { k: 'practice', ids: ['P131', 'P134'] },
      { k: 'check' },
      { k: 'summary', body: r`“If A then B” fails only when A is true and B is false. A counterexample must satisfy the condition and fail the conclusion.` }
    ]
  });

  TLL.worked.push(
    { id: 'W04', lesson: 'L1-3', title: 'Testing an implication about squares',
      problem: r`Decide whether “if $x^2 > 4$ then $x > 2$” is true for all real $x$.`,
      steps: [
        { do: r`A counterexample needs $x^2 > 4$ (A true) and $x \le 2$ (B false).`, why: 'This is the only kind of case that breaks an implication.' },
        { do: r`$x^2 > 4$ means $x > 2$ or $x < -2$. Values with $x < -2$ make B false.`, why: 'Solve A first; look for the part of A outside B.' },
        { do: r`Take $x = -3$: $x^2 = 9 > 4$ but $-3 > 2$ is false.`, why: '' },
        { do: r`So the statement is **false**.`, why: 'One counterexample disproves a universal claim.' }
      ],
      takeaway: 'Find the set where A holds, then look for part of it where B fails.' },
    { id: 'W05', lesson: 'L1-3', title: 'Adding a condition can repair a false claim',
      problem: r`For real $a$ and $b$: (a) is “if $a > b$ then $a^2 > b^2$” true? (b) is “if $a > b > 0$ then $a^2 > b^2$” true?`,
      steps: [
        { do: r`(a) Try a negative $b$: $a = 1$, $b = -2$. Then $a > b$ but $a^2 = 1 < 4 = b^2$.`, why: 'Negative numbers are a standard source of counterexamples for squaring.' },
        { do: r`So (a) is **false**.`, why: '' },
        { do: r`(b) $a^2 - b^2 = (a - b)(a + b)$.`, why: 'Compare with zero using a factorisation.' },
        { do: r`If $a > b > 0$ then $a - b > 0$ and $a + b > 0$, so $a^2 - b^2 > 0$.`, why: 'A product of two positive numbers is positive.' },
        { do: r`So (b) is **true**.`, why: '' }
      ],
      takeaway: 'Squaring preserves order only when both numbers are non-negative.' }
  );

  TLL.questions.push(
    { id: 'P131', lesson: 'L1-3', obj: 'L13a', spec: ['Arg1', 'Prf1'], diff: 1, type: 'mcq',
      stem: r`Which value of $x$ shows that “if $x^2 > 1$ then $x > 1$” is false?`,
      options: [r`$x = 2$`, r`$x = 0$`, r`$x = -2$`, r`$x = 1$`, r`$x = \tfrac{1}{2}$`], answer: 2,
      notes: [r`Both parts are true, so the claim survives.`, r`$x^2 > 1$ is false here, so nothing is tested.`, r`Correct: $x^2 = 4 > 1$ but $-2 > 1$ is false.`, r`$x^2 = 1$ is not greater than 1, so the condition fails.`, r`$x^2 = \tfrac{1}{4}$, so the condition fails.`],
      key: 'A counterexample makes the condition true and the conclusion false.',
      sol: r`We need $x^2 > 1$ but $x \le 1$. The value $x = -2$ gives $x^2 = 4 > 1$ while $x = -2$ is not greater than 1.`,
      hints: ['Which part must be true and which false?', r`Solve $x^2 > 1$: where are the solutions?`, 'Look for a solution of the condition that is not greater than 1.'],
      mis: ['counterexample-form', 'vacuous'], tip: 'Negative numbers often break claims about squares.' },

    { id: 'P132', lesson: 'L1-3', obj: 'L13a', spec: ['Arg1', 'Prf1'], diff: 1, type: 'mcq',
      stem: r`Which value of $n$ is a counterexample to: “If $n$ is a prime number, then $n + 2$ is prime”?`,
      options: [r`$n = 3$`, r`$n = 4$`, r`$n = 7$`, r`$n = 5$`, r`$n = 9$`], answer: 2,
      notes: [r`$3$ and $5$ are both prime: no contradiction.`, r`$4$ is not prime, so the claim says nothing.`, r`Correct: $7$ is prime and $9 = 3 \times 3$ is not.`, r`$5$ and $7$ are both prime.`, r`$9$ is not prime, so the condition fails.`],
      key: r`Need $n$ prime (condition true) with $n + 2$ not prime (conclusion false).`,
      sol: r`$7$ is prime but $7 + 2 = 9$ is not prime, so $n = 7$ is a counterexample.`,
      hints: [r`First discard options where $n$ is not prime.`, r`For the remaining options, test whether $n + 2$ is prime.`, r`$9 = 3 \times  3$.`],
      mis: ['counterexample-form', 'vacuous'], tip: 'Discard options that fail the condition before testing the conclusion.' },

    { id: 'P133', lesson: 'L1-3', obj: 'L13b', spec: ['Arg1', 'Prf1'], diff: 3, type: 'mcq',
      stem: r`Consider: “If $n$ is an odd integer then $n^2 - 1$ is a multiple of 8.” Which of the following is correct?`,
      options: [r`The statement is true.`, r`It is false: $n = 2$ gives $3$.`, r`It is false: $n = 3$ gives $8$, which is not a multiple of 16.`, r`It is false: $n = -1$ gives $0$.`], answer: 0,
      notes: [r`Correct: $n^2 - 1 = 4k(k+1)$ and $k(k+1)$ is even.`, r`$n = 2$ is not odd, so it does not test the claim.`, r`The claim is about multiples of 8, and 8 is one.`, r`$0 = 8 \times 0$ is a multiple of 8.`],
      key: r`Write $n = 2k + 1$: $n^2 - 1 = 4k(k+1)$, and one of $k$, $k+1$ is even.`,
      sol: r`Let $n = 2k + 1$. Then $n^2 - 1 = 4k^2 + 4k = 4k(k+1)$. Since $k$ and $k + 1$ are consecutive integers, one of them is even, so $k(k+1) = 2m$ and $n^2 - 1 = 8m$. The statement is true.`,
      hints: [r`Check that each proposed counterexample really has $n$ odd and the conclusion false.`, 'Is 0 a multiple of 8?', r`Write $n = 2k+1$ and factorise $n^2 - 1$.`],
      mis: ['vacuous', 'counterexample-form'], tip: 'Before accepting a counterexample, check it satisfies the condition and really breaks the conclusion.' },

    { id: 'P134', lesson: 'L1-3', obj: 'L13b', spec: ['Arg1'], diff: 1, type: 'mcq',
      stem: r`A café has the rule: “If a customer orders a main course, then they get free bread.” Which observation would show that the rule was broken?`,
      options: [r`A customer with no main course got free bread.`, r`A customer with no main course got no bread.`, r`A customer ordered a main course and got no free bread.`, r`A customer ordered a main course and got free bread.`], answer: 2,
      notes: [r`The rule says nothing about customers without a main course.`, r`Again, the rule makes no promise here.`, r`Correct: the condition holds and the promised result does not.`, r`This is exactly what the rule promises.`],
      key: 'Only “condition true, result false” breaks an implication.',
      sol: 'The rule is broken only by a customer who ordered a main course (condition true) and did not get free bread (result false).',
      hints: ['What does the rule promise, and to whom?', 'Does the rule say anything about customers without a main course?', 'Look for condition true and result false.'],
      mis: ['vacuous', 'converse'], tip: 'Ask: who did the rule make a promise to?' },

    { id: 'P135', lesson: 'L1-3', obj: 'L13a', spec: ['Arg1', 'Err2'], diff: 2, type: 'mcq',
      stem: r`Let $f(x) = x^3 - x$. Which pair $(a, b)$ shows that the statement “if $f(a) = f(b)$ then $a = b$” is false?`,
      options: [r`$(1, 1)$`, r`$(0, 1)$`, r`$(2, -2)$`, r`$(1, 2)$`], answer: 1,
      notes: [r`Here $a = b$, so the conclusion holds.`, r`Correct: $f(0) = 0 = f(1)$ but $0 \ne 1$.`, r`$f(2) = 6$ and $f(-2) = -6$, so the condition fails.`, r`$f(1) = 0$ and $f(2) = 6$, so the condition fails.`],
      key: r`$f(x) = x(x-1)(x+1)$ has three roots, so different inputs share the output 0.`,
      sol: r`$f(x) = x(x - 1)(x + 1)$, so $f(0) = f(1) = 0$ while $0 \ne 1$. The pair $(0, 1)$ makes the condition true and the conclusion false.`,
      hints: [r`You need $f(a) = f(b)$ with $a \ne  b$.`, r`Factorise $f$.`, 'Which inputs give the same output 0?'],
      mis: ['many-to-one', 'counterexample-form'], tip: 'Roots of a polynomial give quick examples of different inputs with the same output.' },

    { id: 'P136', lesson: 'L1-3', obj: 'L13a', spec: ['Arg1'], diff: 2, type: 'tfset',
      stem: r`For real $x$, decide whether each statement is true or false.`,
      statements: [
        { s: r`If $x > 0$ then $x^2 > 0$.`, t: true, why: 'A positive number squared is positive.' },
        { s: r`If $x^2 > 0$ then $x > 0$.`, t: false, why: r`$x = -1$: $x^2 = 1 > 0$ but $x$ is not positive.` },
        { s: r`If $x < 0$ then $x^3 < 0$.`, t: true, why: 'A negative number cubed is negative.' },
        { s: r`If $x^3 < x$ then $x < 0$.`, t: false, why: r`$x = \tfrac{1}{2}$: $\tfrac{1}{8} < \tfrac{1}{2}$ but $x > 0$.` }
      ],
      key: 'For each false one, find a value making the condition true and the conclusion false.',
      sol: 'Statements 1 and 3 are true; 2 and 4 are false (counterexamples beside each).',
      hints: ['Try negative numbers and numbers between 0 and 1.', 'Remember that only “condition true, conclusion false” breaks an implication.', r`For the last statement, try $x = \tfrac{1}{2}$.`],
      mis: ['converse', 'counterexample-form'], tip: r`Standard test values: $-1, 0, \tfrac{1}{2}, 1, 2$.` }
  );

  /* ------------------------------------------------------------------ L1-4 */
  TLL.lessons.push({
    id: 'L1-4', unit: 'U1', title: '“If”, “only if” and “if and only if”', mins: 9, spec: ['Arg1'], prereq: ['L1-3'],
    objectives: [
      { id: 'L14a', text: 'Translate “A if B” and “A only if B” into “if … then …” with the correct direction.' },
      { id: 'L14b', text: 'Recognise that “A if and only if B” claims both directions, and check each one.' }
    ],
    purpose: 'Paper 2 routinely phrases implications as “only if”. Translating before thinking is the fastest reliable method.',
    refs: ['spec2026', 'notesLogic'],
    steps: [
      { k: 'predict', stem: r`“You can board the plane **only if** you have a ticket.” Which statement follows?`,
        options: [r`If you have a ticket, you can board.`, r`If you can board, you have a ticket.`, r`Both of the above.`], answer: 1,
        notes: [r`A ticket may not be enough (you also need a passport, say).`, r`Correct: boarding requires a ticket, so anyone boarding has one.`, r`Only the second direction is claimed.`] },
      { k: 'idea', title: 'Translate first, then think', body: r`Rewrite every implication in the form “**if** …, **then** …”.

- “If A then B”: A leads to B.
- “B **if** A”: the clause after “if” is the condition, so this is again “if A then B”.
- “A **only if** B”: A can only happen when B holds, so “if A then B”.
- “A **if and only if** B”: both “if A then B” and “if B then A”.

A memory hook: in “A only if B”, the arrow points **towards** the clause after “only if”.

To decide an “if and only if” statement, check **both directions separately**. If either fails, the whole statement is false.` },
      { k: 'diagram', d: { type: 'translations' }, alt: 'Table of translations. "If A then B" becomes A leads to B. "B if A" becomes A leads to B. "A only if B" becomes A leads to B. "A if and only if B" becomes arrows in both directions.', caption: 'Three different wordings, one meaning: A leads to B. “If and only if” adds the reverse arrow.' },
      { k: 'examples', yes: { title: 'Correct translation', body: r`“$n$ is divisible by 4 only if $n$ is even” means “if $n$ is divisible by 4 then $n$ is even”: **true**.` },
        no: { title: 'Common mistranslation', body: r`Reading it as “if $n$ is even then $n$ is divisible by 4” gives a different (false) statement: $n = 6$.` } },
      { k: 'worked', id: 'W06' },
      { k: 'worked', id: 'W07' },
      { k: 'guided', title: 'Your turn, with support', problem: r`Translate and decide: “$n^2$ is a multiple of 3 if $n$ is a multiple of 3.”`,
        parts: [
          { ask: { stem: r`Which “if … then …” form is this?`, options: [r`If $n$ is a multiple of 3, then $n^2$ is a multiple of 3.`, r`If $n^2$ is a multiple of 3, then $n$ is a multiple of 3.`], answer: 0,
            notes: [r`Correct: the clause after “if” is the condition.`, r`That is the converse. (It happens to be true as well, but it is not what this sentence says.)`] } },
          { show: r`If $n = 3k$ then $n^2 = 9k^2 = 3(3k^2)$, so the statement is **true**.` }
        ] },
      { k: 'practice', ids: ['P141', 'P143'] },
      { k: 'check' },
      { k: 'summary', body: r`“A only if B” and “B if A” both mean “if A then B”. “If and only if” claims both directions, so test both.` }
    ]
  });

  TLL.worked.push(
    { id: 'W06', lesson: 'L1-4', title: 'Checking both directions of “if and only if”',
      problem: r`Is “$x^2 = x$ if and only if $x = 1$” true for real $x$?`,
      steps: [
        { do: r`Direction 1 (“if”): if $x = 1$ then $x^2 = 1 = x$. True.`, why: '“A if B” means “if B then A”.' },
        { do: r`Direction 2 (“only if”): if $x^2 = x$ then $x = 1$?`, why: '“A only if B” means “if A then B”.' },
        { do: r`$x^2 = x \iff x(x - 1) = 0 \iff x = 0$ or $x = 1$. So $x = 0$ satisfies $x^2 = x$ but $x \ne 1$.`, why: r`Solve the condition fully rather than dividing by $x$.` },
        { do: r`Direction 2 fails, so the statement is **false**.`, why: 'An “if and only if” needs both directions.' }
      ],
      takeaway: 'Split an “if and only if” into two implications and test each; one failure is enough.' },
    { id: 'W07', lesson: 'L1-4', title: 'Translating “only if” in an inequality',
      problem: r`For real $a$ and $b$, is “$a^2 > b^2$ only if $a > b$” true?`,
      steps: [
        { do: r`Translate: “if $a^2 > b^2$ then $a > b$”.`, why: 'In “A only if B”, the arrow points to the clause after “only if”.' },
        { do: r`Look for $a^2 > b^2$ with $a \le b$. Try a negative $a$: $a = -3$, $b = 1$.`, why: 'Squares hide signs, so try negatives.' },
        { do: r`$a^2 = 9 > 1 = b^2$, but $-3 > 1$ is false. So the statement is **false**.`, why: '' }
      ],
      takeaway: 'Always translate “only if” before testing values.' }
  );

  TLL.questions.push(
    { id: 'P141', lesson: 'L1-4', obj: 'L14a', spec: ['Arg1'], diff: 1, type: 'mcq',
      stem: r`Which statement is equivalent to “$x > 2$ only if $x > 1$”?`,
      options: [r`If $x > 1$ then $x > 2$.`, r`If $x > 2$ then $x > 1$.`, r`$x > 2$ if and only if $x > 1$.`, r`If $x \le 2$ then $x \le 1$.`], answer: 1,
      notes: [r`This reverses the direction (it is the converse).`, r`Correct: “A only if B” means “if A then B”.`, r`“Only if” gives one direction, not both.`, r`This is the contrapositive of the converse, so it is equivalent to the converse, not the original.`],
      key: '“A only if B” = “if A then B”.',
      sol: r`With A = “$x > 2$” and B = “$x > 1$”, “A only if B” means “if A then B”: if $x > 2$ then $x > 1$.`,
      hints: ['Which clause comes after “only if”?', 'In “A only if B”, the arrow points to B.', 'Rewrite as “if … then …”.'],
      mis: ['only-if'], tip: '“Only if” points the arrow at what follows it.' },

    { id: 'P142', lesson: 'L1-4', obj: 'L14a', spec: ['Arg1'], diff: 1, type: 'mcq',
      stem: r`Which statement is equivalent to “A if B”?`,
      options: [r`If A then B.`, r`If B then A.`, r`A only if B.`, r`A if and only if B.`], answer: 1,
      notes: [r`That would be “A only if B” or “B if A”.`, r`Correct: the clause after “if” is the condition.`, r`“A only if B” means “if A then B”, the opposite direction.`, r`That claims both directions.`],
      key: 'The clause immediately after “if” is the condition.',
      sol: '“A if B” says that A holds whenever B holds: if B then A.',
      hints: ['Which part is the condition?', 'The word “if” introduces the condition.', 'Write “if B then …”.'],
      mis: ['if-direction'], tip: 'The clause after a bare “if” is always the condition.' },

    { id: 'P143', lesson: 'L1-4', obj: 'L14b', spec: ['Arg1'], diff: 2, type: 'roman',
      stem: r`For real $x$, which of the following statements are true?`,
      parts: [
        { s: r`$x^2 = 4$ if $x = 2$.`, t: true, why: r`Translation: if $x = 2$ then $x^2 = 4$. True.` },
        { s: r`$x^2 = 4$ only if $x = 2$.`, t: false, why: r`Translation: if $x^2 = 4$ then $x = 2$. False: $x = -2$.` },
        { s: r`$x = 2$ if and only if $x^3 = 8$.`, t: true, why: r`If $x = 2$ then $x^3 = 8$; and $x^3 = 8$ has the single real solution $x = 2$ because cubing is strictly increasing.` }
      ],
      key: 'Translate each statement before testing it.',
      sol: r`I: “if $x = 2$ then $x^2 = 4$”, true. II: “if $x^2 = 4$ then $x = 2$”, false ($x = -2$). III: both directions hold since $x^3 = 8$ has only the real solution $x = 2$. So I and III only.`,
      hints: ['Translate each into “if … then …”.', r`For II, does $x^2 = 4$ have another solution?`, r`For III, how many real solutions does $x^3 = 8$ have?`],
      mis: ['only-if', 'iff-one-way'], tip: 'Squares have two square roots; cubes have one real cube root.' },

    { id: 'P144', lesson: 'L1-4', obj: 'L14a', spec: ['Arg1'], diff: 2, type: 'mcq',
      stem: r`A teacher says: “You will pass only if you revise.” Pat revised but did not pass. Which of the following is correct?`,
      options: [r`The teacher’s statement must be false.`, r`Pat’s result is consistent with the statement: it says passing requires revising, not that revising guarantees passing.`, r`Pat cannot really have revised.`, r`The statement means that revising guarantees a pass.`], answer: 1,
      notes: [r`The statement is broken only by someone who passed without revising.`, r`Correct: “pass only if revise” means “if pass then revised”.`, r`Nothing in the statement lets us conclude this.`, r`That would be “you will pass if you revise”.`],
      key: '“Pass only if revise” = “if pass then revised”.',
      sol: '“You will pass only if you revise” translates to “if you pass, then you revised”. It is broken only by someone who passed without revising. Pat revised and failed, which is consistent with the statement.',
      hints: ['Translate the teacher’s sentence into “if … then …”.', 'Which case would break that implication?', 'Did Pat pass?'],
      mis: ['only-if', 'converse'], tip: 'A necessary step (revising) need not be enough on its own.' },

    { id: 'P145', lesson: 'L1-4', obj: 'L14b', spec: ['Arg1'], diff: 3, type: 'mcq',
      stem: r`For integers $n$, which one of the following statements is true?`,
      options: [r`$n$ is odd if and only if $n^2$ is odd.`, r`$n$ is a multiple of 4 if and only if $n^2$ is a multiple of 4.`, r`$n$ is even if and only if $n^2$ is a multiple of 8.`, r`$n > 0$ if and only if $n^2 > 0$.`], answer: 0,
      notes: [r`Correct: odd × odd is odd, and if $n$ is even then $n^2$ is even.`, r`$n = 2$: $n^2 = 4$ is a multiple of 4 but $n$ is not.`, r`$n = 2$: $n$ is even but $n^2 = 4$ is not a multiple of 8.`, r`$n = -1$: $n^2 > 0$ but $n$ is not positive.`],
      key: r`Test the “only if” direction of each with small values such as $n = 2$ and $n = -1$.`,
      sol: r`If $n$ is odd, $n^2$ is odd. If $n$ is even, $n = 2k$ and $n^2 = 4k^2$ is even; so $n^2$ odd forces $n$ odd. Both directions hold. Each other option fails in one direction: $n = 2$ for the second and third, $n = -1$ for the fourth.`,
      hints: ['Check each direction separately.', r`Try $n = 2$ and $n = -1$.`, 'For the first option, consider the even case.'],
      mis: ['iff-one-way'], tip: 'For “iff” options, look for a small value that breaks one direction.' },

    { id: 'P146', lesson: 'L1-4', obj: 'L14b', spec: ['Arg1', 'Arg2'], diff: 3, type: 'mcq', transfer: true, pre: ['R4'],
      stem: r`Let $f(x) = x^2 - 6x + c$, where $c$ is a real constant. Which of the following is true?`,
      options: [r`$f(x) > 0$ for all real $x$ if and only if $c > 9$.`, r`$f(x) > 0$ for all real $x$ if and only if $c \ge 9$.`, r`$f(x) > 0$ for all real $x$ only if $c > 10$.`, r`$f(x) > 0$ for all real $x$ if $c > 8$.`], answer: 0,
      notes: [r`Correct: $f(x) = (x-3)^2 + (c - 9)$, which is always positive exactly when $c > 9$.`, r`At $c = 9$, $f(3) = 0$, which is not $> 0$.`, r`Translation: “if $f > 0$ for all $x$ then $c > 10$”. False: $c = 9.5$ works.`, r`Translation: “if $c > 8$ then $f > 0$ for all $x$”. False: $c = 8.5$ gives $f(3) = -0.5$.`],
      key: r`Complete the square: $f(x) = (x - 3)^2 + c - 9$, minimum value $c - 9$.`,
      sol: r`$f(x) = (x - 3)^2 + (c - 9)$ has minimum value $c - 9$ at $x = 3$. So $f(x) > 0$ for all $x$ exactly when $c - 9 > 0$, that is $c > 9$. Both directions hold, so the first option is correct.`,
      hints: ['Complete the square.', r`What is the minimum value of $f$?`, 'Translate each option into “if … then …” before checking it.'],
      mis: ['only-if', 'if-direction', 'iff-one-way'], tip: 'Combine a maths fact (minimum value) with careful translation.' }
  );

  /* ------------------------------------------------------------------ L1-5 */
  TLL.lessons.push({
    id: 'L1-5', unit: 'U1', title: 'Converse and contrapositive', mins: 8, spec: ['Arg1', 'Prf1'], prereq: ['L1-4'],
    objectives: [
      { id: 'L15a', text: 'Form the converse and the contrapositive of an implication.' },
      { id: 'L15b', text: 'Use the fact that the contrapositive always has the same truth value, while the converse may not.' }
    ],
    purpose: 'Paper 2 often offers the converse as a tempting wrong answer, and proving the contrapositive is frequently the easiest route to a proof.',
    refs: ['spec2026', 'notesLogic'],
    steps: [
      { k: 'predict', stem: r`“If a shape is a square, then it is a rectangle” is true. Is “If a shape is a rectangle, then it is a square” true?`,
        options: [r`Yes`, r`No`], answer: 1,
        notes: [r`A 2 by 1 rectangle is not a square.`, r`Correct: reversing an implication can change its truth.`] },
      { k: 'idea', title: 'Converse and contrapositive', body: r`Start with “if A then B”.

- The **converse** is “if B then A”. Its truth is **independent**: it can be true or false whatever the original is.
- The **contrapositive** is “if not B then not A”. It is **always equivalent** to the original: both are true or both are false.

Why the contrapositive works: if “not B” held but A were true, then the original would force B, a contradiction.

You may also meet “if not A then not B” (sometimes called the *inverse*). It is the contrapositive of the converse, so it behaves like the converse. You do not need its name.` },
      { k: 'diagram', d: { type: 'square4' }, alt: 'Four statements in a square. Top left: if A then B. Top right: converse, if B then A. Bottom left: contrapositive, if not B then not A. Bottom right: if not A then not B. The two statements on the left always share truth; the two on the right always share truth.', caption: 'Left column: always the same truth value. Right column: the same as each other, but not necessarily the same as the left.' },
      { k: 'worked', id: 'W08' },
      { k: 'worked', id: 'W09' },
      { k: 'guided', title: 'Your turn, with support', problem: r`Form the contrapositive of “if $ab = 0$ then $a = 0$ or $b = 0$”.`,
        parts: [
          { show: r`The contrapositive is “if not ($a = 0$ or $b = 0$) then not ($ab = 0$)”.` },
          { ask: { stem: r`What is “not ($a = 0$ or $b = 0$)”?`, options: [r`$a \ne 0$ and $b \ne 0$`, r`$a \ne 0$ or $b \ne 0$`, r`$a = 0$ and $b = 0$`], answer: 0,
            notes: [r`Correct: negating “or” gives “and”.`, r`This allows $a = 0$, $b = 5$, where the original “or” statement is still true.`, r`This is not a negation at all.`] } },
          { show: r`So the contrapositive is “if $a \ne 0$ and $b \ne 0$ then $ab \ne 0$”, which is true: a product of non-zero real numbers is non-zero.` }
        ] },
      { k: 'practice', ids: ['P151', 'P153'] },
      { k: 'check' },
      { k: 'summary', body: r`Contrapositive: same truth, always. Converse: no guarantee. To prove “if A then B”, you may prove “if not B then not A” instead.` }
    ]
  });

  TLL.worked.push(
    { id: 'W08', lesson: 'L1-5', title: 'Proving a statement through its contrapositive',
      problem: r`Prove that for every integer $n$, if $n^2$ is even then $n$ is even.`,
      steps: [
        { do: r`A direct start (“$n^2$ is even, so $n^2 = 2m$”) is awkward: we cannot easily take square roots.`, why: 'Recognising when a direct proof stalls saves time.' },
        { do: r`Contrapositive: if $n$ is odd then $n^2$ is odd.`, why: 'Equivalent to the original, so proving it proves the original.' },
        { do: r`Let $n = 2k + 1$. Then $n^2 = 4k^2 + 4k + 1 = 2(2k^2 + 2k) + 1$, which is odd.`, why: 'Use the definition of odd and expand.' },
        { do: r`So the contrapositive is true, and therefore so is the original statement.`, why: '' }
      ],
      takeaway: 'If the conclusion of an implication is easier to work with as an assumption, prove the contrapositive.' },
    { id: 'W09', lesson: 'L1-5', title: 'A true statement with a false converse',
      problem: r`For real $x$, consider S: “if $x > 3$ then $x > 1$”. Decide the truth of S, its converse and its contrapositive.`,
      steps: [
        { do: r`S is true: any number greater than 3 is greater than 1.`, why: '' },
        { do: r`Converse: “if $x > 1$ then $x > 3$”. False: $x = 2$.`, why: 'Look for a value that makes the new condition true and the new conclusion false.' },
        { do: r`Contrapositive: “if $x \le 1$ then $x \le 3$”. True, as it must be.`, why: 'Negate both parts and swap their order.' }
      ],
      takeaway: 'True statement, true contrapositive; the converse needs separate checking.' }
  );

  TLL.questions.push(
    { id: 'P151', lesson: 'L1-5', obj: 'L15a', spec: ['Arg1'], diff: 1, type: 'mcq',
      stem: r`What is the contrapositive of “if $x$ is rational then $x^2$ is rational”?`,
      options: [r`If $x^2$ is rational then $x$ is rational.`, r`If $x$ is irrational then $x^2$ is irrational.`, r`If $x^2$ is irrational then $x$ is irrational.`, r`If $x^2$ is rational then $x$ is irrational.`], answer: 2,
      notes: [r`That is the converse.`, r`This negates both parts without swapping them; it behaves like the converse (and is false: $x = \sqrt{2}$).`, r`Correct: “if not B then not A”.`, r`This is not a standard relative of the statement.`],
      key: 'Contrapositive: negate both parts and swap their order.',
      sol: r`With A = “$x$ is rational” and B = “$x^2$ is rational”, the contrapositive “if not B then not A” is “if $x^2$ is irrational then $x$ is irrational”.`,
      hints: ['Identify A and B.', 'The contrapositive is “if not B then not A”.', 'Which part becomes the new condition?'],
      mis: ['converse'], tip: 'Contrapositive = swap and negate.' },

    { id: 'P152', lesson: 'L1-5', obj: 'L15b', spec: ['Arg1'], diff: 2, type: 'mcq',
      stem: r`S is the statement: “If a quadrilateral has four equal sides, then it is a square.” Which of the following is correct?`,
      options: [r`S is true and its converse is false.`, r`S is false and its converse is true.`, r`S and its converse are both true.`, r`S is false and its contrapositive is true.`], answer: 1,
      notes: [r`A rhombus that is not a square has four equal sides, so S is false.`, r`Correct: a rhombus breaks S; every square has four equal sides.`, r`S is false (a rhombus).`, r`A statement and its contrapositive always have the same truth value.`],
      key: 'A non-square rhombus breaks S; the converse “every square has four equal sides” is true.',
      sol: 'S is false: a rhombus with angles of 60° and 120° has four equal sides but is not a square. Its converse, “if it is a square then it has four equal sides”, is true. The contrapositive must be false like S.',
      hints: ['Can you draw a shape with four equal sides that is not a square?', 'Write down the converse and test it separately.', 'A statement and its contrapositive always agree.'],
      mis: ['converse'], tip: 'Use the fact that a statement and its contrapositive agree to eliminate options instantly.' },

    { id: 'P153', lesson: 'L1-5', obj: 'L15b', spec: ['Arg1'], diff: 2, type: 'roman',
      stem: r`It is known that “if P then Q” is true. Which of the following **must** also be true?`,
      parts: [
        { s: r`If not Q then not P.`, t: true, why: 'This is the contrapositive, which always shares the truth value.' },
        { s: r`If Q then P.`, t: false, why: 'This is the converse, which need not be true.' },
        { s: r`If not P then not Q.`, t: false, why: 'This is equivalent to the converse, so it need not be true.' }
      ],
      key: 'Only the contrapositive is guaranteed.',
      sol: r`Only I (the contrapositive) is guaranteed. II is the converse, and III is the contrapositive of the converse; neither is guaranteed. For example, P = “$x > 3$”, Q = “$x > 1$” makes II and III false.`,
      hints: ['Name each statement: converse, contrapositive, or something else?', 'Which one always has the same truth value as the original?', r`Test with P = “$x > 3$” and Q = “$x > 1$”.`],
      mis: ['converse', 'deny-antecedent'], tip: r`Keep a simple concrete pair $(x > 3, x > 1)$ ready to test abstract claims.` },

    { id: 'P154', lesson: 'L1-5', obj: 'L15b', spec: ['Arg1'], diff: 2, type: 'mcq',
      stem: r`For positive integers $n$, which of these statements has a **true converse**?`,
      options: [r`If $n$ is a multiple of 6, then $n$ is even.`, r`If $n$ is a multiple of 10, then the last digit of $n$ is 0.`, r`If $n$ is prime, then $n$ is odd.`, r`If $n > 5$, then $n > 3$.`], answer: 1,
      notes: [r`Converse: “if $n$ is even then it is a multiple of 6”. False: $n = 4$.`, r`Correct. Converse: “if the last digit is 0 then $n$ is a multiple of 10”, which is true.`, r`Converse: “if $n$ is odd then $n$ is prime”. False: $n = 9$.`, r`Converse: “if $n > 3$ then $n > 5$”. False: $n = 4$.`],
      key: 'Write each converse explicitly, then test it.',
      sol: r`The converse of the second statement is “if the last digit of $n$ is 0 then $n$ is a multiple of 10”, which is true since such an $n$ equals 10 times the number formed by its other digits. Each other converse has a small counterexample.`,
      hints: ['Swap the two parts of each statement.', 'Test each converse with a small number.', 'Which converse survives every test?'],
      mis: ['converse'], tip: 'The truth of the original tells you nothing about the converse.' },

    { id: 'P155', lesson: 'L1-5', obj: 'L15a', spec: ['Arg1', 'Prf1'], diff: 2, type: 'mcq',
      stem: r`To prove “if $n^3$ is odd then $n$ is odd” for integers $n$, which of the following is a valid approach?`,
      options: [r`Assume $n$ is odd and show that $n^3$ is odd.`, r`Assume $n$ is even and show that $n^3$ is even.`, r`Check that it works for $n = 1, 3, 5$.`, r`Assume $n^3$ is even and show that $n$ is even.`], answer: 1,
      notes: [r`This proves the converse, not the statement.`, r`Correct: this is the contrapositive.`, r`Examples cannot prove a statement about every integer.`, r`This proves “if $n^3$ is even then $n$ is even”, which is equivalent to the converse.`],
      key: r`Contrapositive of “if $n^{3}$ odd then $n$ odd” is “if $n$ even then $n^{3}$ even”.`,
      sol: r`The contrapositive is “if $n$ is even then $n^3$ is even”. If $n = 2k$ then $n^3 = 8k^3 = 2(4k^3)$, which is even. Proving the contrapositive proves the original.`,
      hints: ['Write the contrapositive.', 'Which option assumes “not B” and proves “not A”?', 'Be careful not to prove the converse.'],
      mis: ['converse', 'examples-prove'], tip: 'Match each option to “original”, “converse” or “contrapositive” before judging it.' },

    { id: 'P156', lesson: 'L1-5', obj: 'L15b', spec: ['Arg1', 'Prf1'], diff: 3, type: 'tfset', transfer: true,
      stem: r`Call a function $f$ *increasing* if $a < b$ always implies $f(a) < f(b)$. Let S be: “If $f$ is increasing on all real numbers, then the equation $f(x) = 0$ has at most one real solution.” Decide whether each statement is true or false.`,
      statements: [
        { s: r`S is true.`, t: true, why: r`If $a < b$ were two solutions then $f(a) < f(b)$, contradicting $f(a) = f(b) = 0$.` },
        { s: r`The converse of S is true.`, t: false, why: r`Converse: “if $f(x) = 0$ has at most one solution then $f$ is increasing”. False: $f(x) = x^2 + 1$ has no solutions but is not increasing.` },
        { s: r`“If $f(x) = 0$ has two different real solutions, then $f$ is not increasing on all real numbers” is true.`, t: true, why: 'This is the contrapositive of S, so it is true because S is.' }
      ],
      key: 'The contrapositive inherits truth from S; the converse needs its own check.',
      sol: r`S is true because two different solutions $a < b$ would give $f(a) < f(b)$ yet $f(a) = f(b)$. Its converse is false ($f(x) = x^2 + 1$). The third statement is the contrapositive of S, so it is true.`,
      hints: [r`Suppose there were two solutions $a < b$. What does “increasing” say?`, 'For the converse, think of a function with no roots that is not increasing.', 'Is the third statement the converse or the contrapositive?'],
      mis: ['converse'], tip: 'Spot the contrapositive and you get its truth value for free.' }
  );
})();
