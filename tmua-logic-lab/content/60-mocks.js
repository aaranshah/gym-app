/* Three original Paper 2-style mock papers (20 questions each).
 * These questions are kept OUT of the practice pool and are never used as lesson items.
 * No teaching emphasis (**) is used in mock text. Hints are withheld in exam mode.
 */
(function () {
  const r = String.raw;
  const M = (id, title, qs) => TLL.mocks.push({ id, title, questions: qs.map((q, i) => Object.assign({ pool: id, mis: [], prov: 'original', num: i + 1, hints: [] }, q)) });

  /* ================================================================ MOCK 1 */
  M('M1', 'Mock paper 1', [
    { id: 'M1-01', lesson: 'L1-5', spec: ['Arg1'], diff: 1, type: 'mcq',
      stem: r`Which of the following is the contrapositive of the statement: “If a triangle has two equal angles, then it has two equal sides”?`,
      options: [r`If a triangle has two equal sides, then it has two equal angles.`, r`If a triangle does not have two equal angles, then it does not have two equal sides.`, r`If a triangle does not have two equal sides, then it does not have two equal angles.`, r`A triangle has two equal angles and does not have two equal sides.`, r`A triangle has two equal angles if and only if it has two equal sides.`], answer: 2,
      notes: [r`This is the converse.`, r`This negates both parts without swapping them.`, r`Correct: “if not B then not A”.`, r`This is the negation of the statement.`, r`This combines the statement with its converse.`],
      key: 'Contrapositive: swap the parts and negate both.', sol: 'With A = “two equal angles” and B = “two equal sides”, the contrapositive is “if not B then not A”.', mis: ['converse'] },

    { id: 'M1-02', lesson: 'L2-1', spec: ['Arg2'], diff: 2, type: 'ns',
      stem: r`For a positive integer $n$, the condition “$n$ is a multiple of 9” is ______ for the condition “the sum of the digits of $n$ is a multiple of 3”.`,
      fwd: { t: true, why: r`A multiple of 9 has digit sum a multiple of 9, hence a multiple of 3.` },
      bwd: { t: false, why: r`$n = 3$ has digit sum 3 but is not a multiple of 9.` },
      key: r`The digit sum is a multiple of 3 exactly when $n$ is a multiple of 3.`, sol: 'A number is a multiple of 3 exactly when its digit sum is. Multiples of 9 are multiples of 3 (sufficient), but 3 shows the condition is not necessary.', mis: ['nec-suff-swap'] },

    { id: 'M1-03', lesson: 'L3-3', spec: ['Arg4', 'Arg3'], diff: 3, type: 'mcq',
      stem: r`Which of the following is the negation of the statement: “For every positive integer $n$, there is a prime $p$ with $n < p < 2n$”?`,
      options: [r`For every positive integer $n$, there is no prime $p$ with $n < p < 2n$.`, r`There is a positive integer $n$ such that every prime $p$ satisfies $p \le n$ or $p \ge 2n$.`, r`There is a prime $p$ such that every positive integer $n$ satisfies $p \le n$ or $p \ge 2n$.`, r`For every positive integer $n$, there is a prime $p$ with $p \le n$ or $p \ge 2n$.`, r`There is a positive integer $n$ and a prime $p$ with $p \le n$ or $p \ge 2n$.`], answer: 1,
      notes: [r`The first quantifier must change to “there is”.`, r`Correct: switch both quantifiers, then negate $n < p < 2n$.`, r`The order of the quantified variables has been changed.`, r`The quantifiers have not been switched.`, r`The second quantifier must become “every prime”.`],
      key: r`Switch each quantifier in order; not $(n < p < 2n)$ is ($p \le  n$ or $p \ge  2n$).`, sol: r`not (for every $n$, there is $p$ with P) = there is $n$ such that for every $p$, not P; and not ($n < p$ and $p < 2n$) is ($p \le n$ or $p \ge 2n$).`, mis: ['quantifier-negation', 'quantifier-order'] },

    { id: 'M1-04', lesson: 'L5-4', spec: ['Prf1'], diff: 2, type: 'mcq',
      stem: r`Which of the following pairs $(a, b)$ is a counterexample to the statement: “For all real numbers $a$ and $b$, if $a > b$ then $a^2 > b^2$”?`,
      options: [r`$(3, 2)$`, r`$(-2, -3)$`, r`$(2, -1)$`, r`$(1, 0)$`, r`$(-3, -2)$`], answer: 1,
      notes: [r`$9 > 4$: the statement holds.`, r`Correct: $-2 > -3$ but $4 < 9$.`, r`$4 > 1$: holds.`, r`$1 > 0$: holds.`, r`$-3 > -2$ is false, so this pair does not test the statement.`],
      key: 'Two negative numbers reverse order when squared.', sol: r`For $(-2, -3)$: $a > b$ is true, but $a^2 = 4$ is not greater than $b^2 = 9$.`, mis: ['counterexample-form'] },

    { id: 'M1-05', lesson: 'L7-1', spec: ['Arg1', 'Prf5'], diff: 2, type: 'roman',
      stem: r`Let $f(x) = x^2 - 2x - 3$. Which of the following statements are true?`,
      parts: [
        { s: r`$f(x) < 0$ only if $-1 < x < 3$.`, t: true, why: r`Translation: if $f(x) < 0$ then $-1 < x < 3$; and $f(x) = (x-3)(x+1) < 0 \iff -1 < x < 3$.` },
        { s: r`$f(x) > 0$ if $x > 3$.`, t: true, why: r`Translation: if $x > 3$ then $f(x) > 0$; both factors are positive.` },
        { s: r`$f(x) > -4$ for all real $x$.`, t: false, why: r`$f(1) = -4$, so the strict inequality fails.` }
      ],
      key: r`$f(x) = (x - 3)(x + 1) = (x - 1)^2 - 4$.`, sol: r`I and II follow from the factorised form after translating “only if” and “if”. The minimum value is $-4$ at $x = 1$, so III fails. I and II only.`, mis: ['only-if', 'if-direction'] },

    { id: 'M1-06', lesson: 'L6-3', spec: ['Err1', 'Err2'], diff: 2, type: 'mcq',
      stem: r`A student attempts to prove that for all real $x$, if $x^2 = 2x$ then $x = 2$.

(1) $x^2 = 2x$
(2) $x^2 - 2x = 0$
(3) $x(x - 2) = 0$
(4) $x - 2 = 0$
(5) $x = 2$

Which of the following best describes the argument?`,
      options: [r`The argument is correct.`, r`The first error is in line (2).`, r`The first error is in line (3).`, r`The first error is in line (4).`, r`The first error is in line (5).`], answer: 3,
      notes: [r`$x = 0$ satisfies $x^2 = 2x$ but not $x = 2$.`, r`Subtracting $2x$ is valid.`, r`A correct factorisation.`, r`Correct: from $x(x-2) = 0$ we only get $x = 0$ or $x = 2$.`, r`(5) follows from (4).`],
      key: 'A zero product gives “first factor zero or second factor zero”.', sol: r`From (3), $x = 0$ or $x - 2 = 0$. Line (4) discards $x = 0$, effectively dividing by $x$. The claim is false ($x = 0$).`, mis: ['divide-zero', 'missing-case'] },

    { id: 'M1-07', lesson: 'L4-1', spec: ['Prf2'], diff: 2, type: 'roman',
      stem: r`In a club, every member who plays chess also plays go, and no member who plays go plays bridge. Priya is a member who plays bridge. Which of the following must be true?`,
      parts: [
        { s: r`Priya does not play go.`, t: true, why: 'Members who play go do not play bridge; Priya plays bridge.' },
        { s: r`Priya plays chess.`, t: false, why: 'Chess would imply go, which is impossible for Priya.' },
        { s: r`No member plays both chess and bridge.`, t: true, why: 'Chess ⇒ go ⇒ not bridge, for every member.' }
      ],
      key: 'Chain: chess ⇒ go ⇒ not bridge.', sol: 'From the two rules, every chess player plays go and so does not play bridge. Priya plays bridge, so she plays neither go nor chess. I and III only.', mis: ['converse'] },

    { id: 'M1-08', lesson: 'L1-4', spec: ['Arg1'], diff: 3, type: 'mcq',
      stem: r`For real $x$, which one of the following statements is true?`,
      options: [r`$x^2 < x$ if and only if $0 < x < 1$.`, r`$x^3 < x$ if and only if $0 < x < 1$.`, r`$|x| < x$ if and only if $x > 0$.`, r`$x^2 > 1$ if and only if $x > 1$.`, r`$\dfrac{1}{x} < 1$ if and only if $x > 1$.`], answer: 0,
      notes: [r`Correct: $x^2 - x = x(x-1) < 0 \iff 0 < x < 1$.`, r`$x = -2$: $-8 < -2$ but $x$ is not in $0 < x < 1$.`, r`$|x| < x$ is never true, but $x > 0$ sometimes is.`, r`$x = -2$: $4 > 1$ but $x < 1$.`, r`$x = -1$: $-1 < 1$ but $x < 1$.`],
      key: 'For each “iff”, look for a negative value breaking the “only if” direction.', sol: r`$x^2 < x \iff x(x - 1) < 0 \iff 0 < x < 1$, so both directions hold. Each other statement fails for a negative $x$ (or, for the third, for any positive $x$).`, mis: ['iff-one-way'] },

    { id: 'M1-09', lesson: 'L5-5', spec: ['Prf3'], diff: 3, type: 'mcq',
      stem: r`Let $T_n$ be the number of ways to cover a 2 by $n$ rectangle with $n$ dominoes, each 1 by 2 (dominoes may be placed either way round). It is known that $T_1 = 1$, $T_2 = 2$, $T_3 = 3$ and $T_4 = 5$. What is $T_8$?`,
      options: [r`$21$`, r`$32$`, r`$34$`, r`$40$`, r`$55$`], answer: 2,
      notes: [r`That is $T_7$.`, r`Doubling does not fit $T_3 = 3$.`, r`Correct.`, r`$T_4 \times 8$: no basis.`, r`That is $T_9$.`],
      key: r`Consider the left end: one vertical domino ($T_{n-1}$ ways) or two horizontal dominoes ($T_{n-2}$ ways).`,
      sol: r`At the left-hand end there is either one vertical domino, leaving a 2 by $(n - 1)$ rectangle, or two stacked horizontal dominoes, leaving a 2 by $(n - 2)$ rectangle. So $T_n = T_{n-1} + T_{n-2}$, giving $1, 2, 3, 5, 8, 13, 21, 34$. Hence $T_8 = 34$.`, mis: ['examples-prove'] },

    { id: 'M1-10', lesson: 'L6-2', spec: ['Err2'], diff: 3, type: 'mcq',
      stem: r`A student argues: “If $\sin 2\theta = \sin\theta$, then $2\theta = \theta$, so $\theta = 0$. Hence the equation has no solutions with $0 < \theta < \pi$.” How many solutions does $\sin 2\theta = \sin\theta$ actually have with $0 < \theta < \pi$?`,
      options: [r`$0$`, r`$1$`, r`$2$`, r`$3$`], answer: 1,
      notes: [r`The student’s first step assumes sine is one-to-one.`, r`Correct: $\theta = \dfrac{\pi}{3}$.`, r`$\sin\theta = 0$ gives no solutions strictly inside the interval.`, r`Too many.`],
      key: r`$\sin\theta(2\cos\theta - 1) = 0$.`, sol: r`$2\sin\theta\cos\theta - \sin\theta = \sin\theta(2\cos\theta - 1) = 0$. For $0 < \theta < \pi$, $\sin\theta \ne 0$, so $\cos\theta = \tfrac{1}{2}$, giving $\theta = \dfrac{\pi}{3}$ only.`, mis: ['many-to-one'] },

    { id: 'M1-11', lesson: 'L5-2', spec: ['Prf1', 'Prf3'], diff: 3, type: 'mcq',
      stem: r`What is the largest integer that divides $n^5 - n$ for every integer $n$?`,
      options: [r`$4$`, r`$5$`, r`$7$`, r`$30$`, r`$60$`], answer: 3,
      notes: [r`$n = 3$: $240$, but $n = 2$: $30$, not a multiple of 4.`, r`5 always divides it, but a larger number does too.`, r`$n = 2$ gives $30$.`, r`Correct.`, r`$n = 2$ gives $30$.`],
      key: r`$n = 2$ gives $30$, so the answer divides 30; then show 2, 3 and 5 always divide.`,
      sol: r`$n = 2$ gives $30$, so the answer is at most 30. $n^5 - n = (n - 1)n(n + 1)(n^2 + 1)$: three consecutive integers give factors 2 and 3. For 5: if $n$ leaves remainder 0, 1 or 4 on division by 5, one of $n$, $n - 1$, $n + 1$ is a multiple of 5; if the remainder is 2 or 3, $n^2 + 1$ is a multiple of 5 (since $4 + 1 = 5$ and $9 + 1 = 10$). So 30 always divides $n^5 - n$.`, mis: ['examples-prove', 'missing-case'] },

    { id: 'M1-12', lesson: 'L2-2', spec: ['Arg2'], diff: 2, type: 'mcq',
      stem: r`For $0^\circ \le x \le 360^\circ$, which of the following is a necessary but not sufficient condition for $\sin x > \tfrac{1}{2}$?`,
      options: [r`$0^\circ < x < 180^\circ$`, r`$30^\circ < x < 150^\circ$`, r`$45^\circ < x < 135^\circ$`, r`$\cos x > 0$`, r`$30^\circ < x < 120^\circ$`], answer: 0,
      notes: [r`Correct: it contains $30^\circ < x < 150^\circ$, and $x = 10^\circ$ shows it is not sufficient.`, r`This is necessary and sufficient.`, r`Sufficient but not necessary ($x = 140^\circ$).`, r`$x = 100^\circ$: $\sin x > \tfrac{1}{2}$ but $\cos x < 0$, so not necessary.`, r`Sufficient but not necessary.`],
      key: r`$\sin x > \tfrac{1}{2} \iff 30^\circ < x < 150^\circ$ here; a necessary condition must contain this interval.`, sol: r`The solution set is $30^\circ < x < 150^\circ$. Only $0^\circ < x < 180^\circ$ strictly contains it.`, mis: ['nec-suff-swap'] },

    { id: 'M1-13', lesson: 'L5-6', spec: ['Prf4', 'Arg1'], diff: 3, type: 'mcq',
      stem: r`The following statements can be arranged to prove that, for every integer $n$, if $n^2$ is a multiple of 3 then $n$ is a multiple of 3.

P: Then $n^2 = 9k^2 + 6k + 1$ or $n^2 = 9k^2 + 12k + 4$.
Q: Suppose $n$ is not a multiple of 3, so $n = 3k + 1$ or $n = 3k + 2$ for some integer $k$.
R: So $n^2$ leaves remainder 1 when divided by 3, and is not a multiple of 3.
S: We prove the contrapositive.
T: Hence if $n^2$ is a multiple of 3, then $n$ is a multiple of 3.

Which order gives a correct proof?`,
      options: [r`S, Q, P, R, T`, r`Q, P, R, S, T`, r`S, Q, R, P, T`, r`Q, S, P, R, T`, r`S, P, Q, R, T`, r`T, Q, P, R, S`], answer: 0,
      notes: [r`Correct.`, r`The method should be stated before it is used.`, r`R depends on P.`, r`The strategy statement should come first.`, r`P uses $k$, which Q introduces.`, r`The conclusion cannot come first.`],
      key: 'Strategy → assumption → computation → consequence → conclusion.', sol: r`S announces the method; Q makes the assumption and introduces $k$; P computes $n^{2}$; R draws the consequence; T concludes.`, mis: [] },

    { id: 'M1-14', lesson: 'L7-2', spec: ['Prf5'], diff: 3, type: 'roman',
      stem: r`Positive real numbers $a$ and $b$ satisfy $a + b = 1$. Which of the following must be true?`,
      parts: [
        { s: r`$ab \le \tfrac{1}{4}$`, t: true, why: r`$ab = a(1 - a) = \tfrac{1}{4} - \left(a - \tfrac{1}{2}\right)^2$.` },
        { s: r`$a^2 + b^2 \ge \tfrac{1}{2}$`, t: true, why: r`$a^2 + b^2 = (a + b)^2 - 2ab = 1 - 2ab \ge 1 - \tfrac{1}{2}$.` },
        { s: r`$\dfrac{1}{a} + \dfrac{1}{b} \ge 4$`, t: true, why: r`$\dfrac{1}{a} + \dfrac{1}{b} = \dfrac{a + b}{ab} = \dfrac{1}{ab} \ge 4$.` }
      ],
      key: r`Express everything in terms of $ab$, then use $ab \le \tfrac{1}{4}$.`, sol: r`From $a + b = 1$: $ab = \tfrac{1}{4} - \left(a - \tfrac{1}{2}\right)^2 \le \tfrac{1}{4}$. Then II and III follow by rewriting each in terms of $ab$. I, II and III.`, mis: [] },

    { id: 'M1-15', lesson: 'L3-2', spec: ['Arg4'], diff: 2, type: 'mcq',
      stem: r`Which of the following is the negation of the statement: “The equation $f(x) = 0$ has at most two real solutions”?`,
      options: [r`The equation $f(x) = 0$ has at least two real solutions.`, r`The equation $f(x) = 0$ has exactly three real solutions.`, r`The equation $f(x) = 0$ has at most one real solution.`, r`The equation $f(x) = 0$ has at least three real solutions.`, r`The equation $f(x) = 0$ has no real solutions.`], answer: 3,
      notes: [r`Exactly two solutions satisfies both this and the original.`, r`Too narrow: four solutions also contradicts the original.`, r`This is consistent with the original.`, r`Correct: “at most 2” fails exactly when there are 3 or more.`, r`This is consistent with the original.`],
      key: '“At most two” = “0, 1 or 2”; its negation is “3 or more”.', sol: 'The original allows 0, 1 or 2 solutions. Its negation must cover every other case: 3 or more (including infinitely many).', mis: ['negation-extreme'] },

    { id: 'M1-16', lesson: 'L6-3', spec: ['Err1', 'Err2'], diff: 3, type: 'mcq',
      stem: r`A student attempts to prove that for all non-zero real $x$ and $y$, if $x > y$ then $\dfrac{1}{x} < \dfrac{1}{y}$.

(1) $x > y$.
(2) Dividing both sides by $xy$ gives $\dfrac{1}{y} > \dfrac{1}{x}$.
(3) Hence $\dfrac{1}{x} < \dfrac{1}{y}$.

Which of the following is correct?`,
      options: [r`The proof is correct.`, r`Line (2) is invalid because $xy$ may be negative, and the statement is false.`, r`Line (2) is invalid because $xy$ may be negative, but the statement is true.`, r`Line (3) is invalid.`, r`Line (1) should be $x \ge y$.`], answer: 1,
      notes: [r`Dividing by $xy$ keeps the direction only if $xy > 0$.`, r`Correct: $x = 1$, $y = -1$ gives $\tfrac{1}{x} = 1 > -1 = \tfrac{1}{y}$.`, r`The statement is false: $x = 1$, $y = -1$.`, r`(3) just rewrites (2).`, r`The claim is about $x > y$.`],
      key: 'Dividing an inequality by an unknown-sign quantity.', sol: r`Line (2) is only valid when $xy > 0$. For $x = 1$, $y = -1$: $x > y$ but $\tfrac{1}{x} = 1 > \tfrac{1}{y} = -1$, so the statement is false.`, mis: ['inequality-sign'] },

    { id: 'M1-17', lesson: 'L3-1', spec: ['Arg3'], diff: 3, type: 'roman',
      stem: r`Let $f(x) = x^2$ for all real $x$. Which of the following statements are true?`,
      parts: [
        { s: r`For every real $y \ge 0$, there exists a real $x$ with $f(x) = y$.`, t: true, why: r`Take $x = \sqrt{y}$.` },
        { s: r`There exists a real $x$ such that $f(x) \le f(t)$ for every real $t$.`, t: true, why: r`$x = 0$: $0 \le t^2$.` },
        { s: r`There exists a real $t$ such that $f(t) > f(x)$ for every real $x$.`, t: false, why: r`Taking $x = t$ gives $f(t) > f(t)$, impossible.` }
      ],
      key: 'Check whether the “there exists” object must work for every choice, including itself.', sol: 'I: square roots of non-negative numbers exist. II: 0 is a minimum. III: no value can exceed itself. I and II only.', mis: ['quantifier-order'] },

    { id: 'M1-18', lesson: 'L7-2', spec: ['Prf5', 'Prf2'], diff: 4, type: 'mcq',
      stem: r`What is the sum of all positive integers $n$ for which $n^2 + 5$ is a multiple of $n + 1$?`,
      options: [r`$3$`, r`$5$`, r`$8$`, r`$9$`, r`$11$`], answer: 2,
      notes: [r`Misses $n = 5$.`, r`$n = 5$ alone; $1$ and $2$ also work.`, r`Correct: $n = 1, 2, 5$.`, r`Includes a value that fails.`, r`Includes values that fail.`],
      key: r`$n^2 + 5 = (n + 1)(n - 1) + 6$, so $n + 1$ must divide 6.`,
      sol: r`$n^2 + 5 = (n + 1)(n - 1) + 6$. So $n + 1$ divides $n^2 + 5$ exactly when $n + 1$ divides 6. With $n + 1 \ge 2$: $n + 1 \in \{2, 3, 6\}$, so $n \in \{1, 2, 5\}$, with sum $8$.`, mis: ['missing-case'] },

    { id: 'M1-19', lesson: 'L2-2', spec: ['Arg2'], diff: 3, type: 'ns',
      stem: r`Let $f$ be a polynomial. The condition “$f(x) > 0$ for all $x$ with $0 \le x \le 1$” is ______ for the condition “$\displaystyle\int_0^1 f(x)\,dx > 0$”.`,
      fwd: { t: true, why: 'If the graph is above the axis on the whole interval, the integral is positive.' },
      bwd: { t: false, why: r`$f(x) = x - \tfrac{1}{4}$: integral $= \tfrac{1}{2} - \tfrac{1}{4} = \tfrac{1}{4} > 0$, but $f(0) < 0$.` },
      key: 'A positive integral allows negative parts that are outweighed.', sol: r`Positive on $[0, 1]$ gives positive integral (sufficient). But $f(x) = x - \tfrac{1}{4}$ has positive integral while $f(0) < 0$ (not necessary).`, mis: ['nec-suff-swap', 'integral-area'] },

    { id: 'M1-20', lesson: 'L1-5', spec: ['Arg1', 'Prf1'], diff: 3, type: 'mcq',
      stem: r`How many of the following four statements are true?

1. If $x$ is irrational, then $x^2$ is irrational.
2. If $x^2$ is irrational, then $x$ is irrational.
3. If $x$ and $y$ are irrational, then $x + y$ is irrational.
4. If $x$ is rational and $y$ is irrational, then $x + y$ is irrational.`,
      options: [r`$0$`, r`$1$`, r`$2$`, r`$3$`, r`$4$`], answer: 2,
      notes: [r`Statements 2 and 4 are true.`, r`Two are true.`, r`Correct: statements 2 and 4.`, r`Statements 1 and 3 are false.`, r`Statements 1 and 3 are false.`],
      key: r`Statement 2 is the contrapositive of “rational $x$ gives rational $x^{2}$”.`, sol: r`1 is false ($x = \sqrt{2}$). 2 is true: its contrapositive “if $x$ is rational then $x^2$ is rational” holds. 3 is false ($\sqrt{2}$ and $-\sqrt{2}$). 4 is true: if $x + y$ were rational, $y = (x + y) - x$ would be rational. So 2 statements.`, mis: ['converse'] }
  ]);

  /* ================================================================ MOCK 2 */
  M('M2', 'Mock paper 2', [
    { id: 'M2-01', lesson: 'L1-4', spec: ['Arg1'], diff: 2, type: 'mcq',
      stem: r`For positive integers $n$, which of the following is equivalent to: “$n$ is prime only if $n$ is not a multiple of 4”?`,
      options: [r`If $n$ is not a multiple of 4, then $n$ is prime.`, r`If $n$ is not prime, then $n$ is a multiple of 4.`, r`If $n$ is a multiple of 4, then $n$ is not prime.`, r`$n$ is prime if and only if $n$ is not a multiple of 4.`, r`If $n$ is prime, then $n$ is a multiple of 4.`], answer: 2,
      notes: [r`This is the converse.`, r`Equivalent to the converse.`, r`Correct: the contrapositive of “if prime then not a multiple of 4”.`, r`“Only if” gives one direction.`, r`This contradicts the original.`],
      key: '“A only if B” = “if A then B”, which is equivalent to “if not B then not A”.', sol: '“Prime only if not a multiple of 4” means “if prime then not a multiple of 4”. Its contrapositive is “if a multiple of 4 then not prime”.', mis: ['only-if', 'converse'] },

    { id: 'M2-02', lesson: 'L2-2', spec: ['Arg2'], diff: 2, type: 'ns',
      stem: r`For real $x$, the condition “$|x| < 1$” is ______ for the condition “$x^2 < x$”.`,
      fwd: { t: false, why: r`$x = -\tfrac{1}{2}$: $|x| < 1$ but $x^2 = \tfrac{1}{4} > -\tfrac{1}{2}$.` },
      bwd: { t: true, why: r`$x^2 < x \iff 0 < x < 1$, and then $|x| < 1$.` },
      key: r`$x^2 < x \iff 0 < x < 1$, which lies inside $-1 < x < 1$.`, sol: r`$x^2 < x$ means $0 < x < 1$, which is inside $|x| < 1$ (necessary). $x = -\tfrac{1}{2}$ shows it is not sufficient.`, mis: ['nec-suff-swap'] },

    { id: 'M2-03', lesson: 'L3-1', spec: ['Arg3'], diff: 2, type: 'mcq',
      stem: r`Which one of the following statements about integers is false?`,
      options: [r`For every integer $n$ there is an integer $m$ with $m > n^2$.`, r`There is an integer $m$ such that $m \le n^2$ for every integer $n$.`, r`For every integer $n$ there is an integer $m$ with $m^2 = n$.`, r`There is an integer $n$ such that $n^2 = n$.`], answer: 2,
      notes: [r`True: $m = n^2 + 1$.`, r`True: $m = 0$.`, r`Correct (this is false): $n = 2$ has no integer square root.`, r`True: $n = 0$ or $n = 1$.`],
      key: r`Find one integer $n$ with no integer square root.`, sol: r`The third statement fails for $n = 2$ (or any negative $n$). The others are true by the examples given.`, mis: ['quantifier-order'] },

    { id: 'M2-04', lesson: 'L3-3', spec: ['Arg4'], diff: 3, type: 'mcq',
      stem: r`Which of the following is the negation of: “There is a real number $M$ such that $f(x) \le M$ for all real $x$”?`,
      options: [r`There is a real number $M$ such that $f(x) > M$ for all real $x$.`, r`For every real number $M$, $f(x) > M$ for all real $x$.`, r`For every real number $M$, there is a real $x$ with $f(x) > M$.`, r`There is a real $x$ such that $f(x) > M$ for every real number $M$.`, r`For every real number $M$, there is a real $x$ with $f(x) \ge M$.`], answer: 2,
      notes: [r`The first quantifier must switch.`, r`The second quantifier must switch.`, r`Correct: switch both quantifiers and negate $\le$.`, r`The order has changed.`, r`The negation of $\le$ is $>$, not $\ge$.`],
      key: 'Switch each quantifier and negate the inequality.', sol: r`not (there is $M$, for all $x$, $f(x) \le M$) = for every $M$, there is $x$ with $f(x) > M$. (In words: $f$ is not bounded above.)`, mis: ['quantifier-negation', 'negation-extreme'] },

    { id: 'M2-05', lesson: 'L5-3', spec: ['Prf1', 'Arg4'], diff: 3, type: 'mcq',
      stem: r`A proof by contradiction is used to show: “If $a + b$ is irrational, then at least one of $a$ and $b$ is irrational.” What should the proof assume at the start?`,
      options: [r`$a + b$ is rational.`, r`$a$ and $b$ are both irrational.`, r`$a + b$ is irrational, and $a$ and $b$ are both rational.`, r`If $a + b$ is irrational, then $a$ and $b$ are both rational.`, r`$a + b$ is irrational, and at least one of $a$ and $b$ is rational.`], answer: 2,
      notes: [r`This denies the condition rather than the conclusion.`, r`Not the negation.`, r`Correct: “A and not B”, where not (at least one irrational) = both rational.`, r`The negation of an implication is not an implication.`, r`“Not (at least one irrational)” is “both rational”.`],
      key: 'Negation of “if A then B” is “A and not B”.', sol: r`“At least one irrational” negates to “both rational”. So assume $a + b$ irrational and a, b both rational (then $a + b$ is rational: contradiction).`, mis: ['contradiction-setup', 'implication-negation'] },

    { id: 'M2-06', lesson: 'L6-1', spec: ['Err1', 'Err2'], diff: 2, type: 'mcq',
      stem: r`A student solves $2\sin^2 x = \sin x$ for $0 \le x < 2\pi$ as follows: “Dividing by $\sin x$ gives $\sin x = \tfrac{1}{2}$, so $x = \dfrac{\pi}{6}$ or $x = \dfrac{5\pi}{6}$.” How many solutions does the equation actually have in this interval?`,
      options: [r`$1$`, r`$2$`, r`$3$`, r`$4$`, r`$5$`], answer: 3,
      notes: [r`Too few.`, r`Dividing by $\sin x$ lost the solutions where $\sin x = 0$.`, r`$\sin x = 0$ gives two solutions in this interval.`, r`Correct: $0, \dfrac{\pi}{6}, \dfrac{5\pi}{6}, \pi$.`, r`Too many.`],
      key: r`$\sin x(2\sin x - 1) = 0$.`, sol: r`$\sin x(2\sin x - 1) = 0$. $\sin x = 0$: $x = 0, \pi$. $\sin x = \tfrac{1}{2}$: $x = \dfrac{\pi}{6}, \dfrac{5\pi}{6}$. Four solutions.`, mis: ['divide-zero', 'stop-early'] },

    { id: 'M2-07', lesson: 'L4-1', spec: ['Prf2', 'Arg1'], diff: 2, type: 'roman',
      stem: r`It is known that: if it is sunny, Ann cycles to work; Ann cycles to work only if Ben walks to work; and today Ben does not walk to work. Which of the following must be true today?`,
      parts: [
        { s: r`It is not sunny.`, t: true, why: 'Ben not walking ⇒ Ann not cycling ⇒ not sunny.' },
        { s: r`Ann does not cycle to work.`, t: true, why: '“Ann cycles only if Ben walks” = “if Ann cycles then Ben walks”; contrapositive.' },
        { s: r`If Ben walks to work, then it is sunny.`, t: false, why: 'This reverses the given chain.' }
      ],
      key: 'Translate “only if”, then push “Ben does not walk” backwards.', sol: 'Sunny ⇒ Ann cycles ⇒ Ben walks. Ben does not walk, so Ann does not cycle and it is not sunny. III reverses the chain. I and II only.', mis: ['only-if', 'converse'] },

    { id: 'M2-08', lesson: 'L6-2', spec: ['Err2', 'Prf1'], diff: 2, type: 'roman',
      stem: r`Real numbers $a$ and $b$ satisfy $0 < a < b$. Which of the following must be true?`,
      parts: [
        { s: r`$a^2 < b$`, t: false, why: r`$a = 2$, $b = 3$: $4 < 3$ is false.` },
        { s: r`$\sqrt{a} < \sqrt{b}$`, t: true, why: 'The square root function is increasing on non-negative numbers.' },
        { s: r`$\dfrac{1}{a} - \dfrac{1}{b} < 0$`, t: false, why: r`$\dfrac{1}{a} - \dfrac{1}{b} = \dfrac{b - a}{ab} > 0$.` }
      ],
      key: 'Square roots preserve order for positives; reciprocals reverse it.', sol: r`I fails for $a = 2, b = 3$. II holds as the square-root function is increasing. III: the difference is positive. II only.`, mis: ['inequality-sign'] },

    { id: 'M2-09', lesson: 'L5-5', spec: ['Prf3'], diff: 3, type: 'mcq',
      stem: r`The sums $1^3$, $1^3 + 2^3$, $1^3 + 2^3 + 3^3$, $1^3 + 2^3 + 3^3 + 4^3$ are $1, 9, 36, 100$. Assuming the pattern these suggest continues, what is $1^3 + 2^3 + \cdots + 10^3$?`,
      options: [r`$385$`, r`$2025$`, r`$3000$`, r`$3025$`, r`$5050$`], answer: 3,
      notes: [r`That is $1^2 + \cdots + 10^2$.`, r`That is $45^2$, the case $n = 9$.`, r`No basis.`, r`Correct: $(1 + 2 + \cdots + 10)^2 = 55^2$.`, r`That is $1 + 2 + \cdots + 100$.`],
      key: r`$1, 9, 36, 100$ are $1^2, 3^2, 6^2, 10^2$: squares of triangular numbers.`, sol: r`The sums are $1^2, 3^2, 6^2, 10^2$, the squares of $1, 1+2, 1+2+3, 1+2+3+4$. So the sum to $10^3$ is $55^2 = 3025$. (This pattern can be proved, but the question only asks you to continue it.)`, mis: ['calc-slip'] },

    { id: 'M2-10', lesson: 'L6-2', spec: ['Err2'], diff: 2, type: 'mcq',
      stem: r`For which real $x$ is it true that $\log_{10}(x^2 - 1) = \log_{10}(x - 1) + \log_{10}(x + 1)$, with every logarithm defined?`,
      options: [r`$|x| > 1$`, r`$x > 1$`, r`$x < -1$`, r`all real $x \ne \pm 1$`, r`$x > 0$`], answer: 1,
      notes: [r`For $x < -1$ the right-hand logarithms are undefined.`, r`Correct: both $x - 1$ and $x + 1$ must be positive.`, r`Here $\log_{10}(x - 1)$ is undefined.`, r`For $|x| < 1$ even the left side is undefined.`, r`$x = \tfrac{1}{2}$ makes every term undefined.`],
      key: 'Every logarithm in the identity must be defined.', sol: r`The right side needs $x - 1 > 0$ and $x + 1 > 0$, i.e. $x > 1$; then $x^2 - 1 > 0$ too, and the identity holds by the product law.`, mis: ['domain'] },

    { id: 'M2-11', lesson: 'L5-2', spec: ['Prf1'], diff: 2, type: 'mcq',
      stem: r`Which one of the following is true for every positive integer $n$?`,
      options: [r`$n(n + 1)(2n + 1)$ is a multiple of 6.`, r`$n^2 - n$ is a multiple of 4.`, r`$n^3 + 2n$ is a multiple of 6.`, r`$2^n + 1$ is a multiple of 3.`, r`$n^4 - 1$ is a multiple of 5.`], answer: 0,
      notes: [r`Correct.`, r`$n = 2$ gives 2.`, r`$n = 1$ gives 3.`, r`$n = 2$ gives 5.`, r`$n = 5$ gives 624.`],
      key: r`Eliminate with small $n$, then prove the survivor by cases mod 3.`, sol: r`$n(n + 1)$ is even. For 3: if $n = 3k$, $3 \mid n$; if $n = 3k + 1$, $2n + 1 = 6k + 3$; if $n = 3k + 2$, $n + 1 = 3k + 3$. So 6 divides the product. The others fail at the values shown.`, mis: ['examples-prove'] },

    { id: 'M2-12', lesson: 'L2-1', spec: ['Arg2'], diff: 2, type: 'ns',
      stem: r`For a quadrilateral ABCD, the condition “its diagonals bisect each other” is ______ for the condition “ABCD is a rectangle”.`,
      fwd: { t: false, why: 'A parallelogram that is not a rectangle has diagonals that bisect each other.' },
      bwd: { t: true, why: 'The diagonals of every rectangle bisect each other.' },
      key: 'Diagonals bisecting each other characterises parallelograms.', sol: 'Every rectangle has diagonals that bisect each other (necessary), but so does every parallelogram, so it is not sufficient.', mis: ['nec-suff-swap'] },

    { id: 'M2-13', lesson: 'L5-6', spec: ['Prf4', 'Prf1'], diff: 3, type: 'mcq',
      stem: r`The following statements can be arranged to prove that there are no positive integers $x$ and $y$ with $x^2 - y^2 = 6$.

P: So $x - y$ and $x + y$ are both even or both odd.
Q: Suppose positive integers $x$ and $y$ satisfy $x^2 - y^2 = 6$, so $(x - y)(x + y) = 6$.
R: If both are odd, their product is odd, but 6 is even; if both are even, their product is a multiple of 4, but 6 is not.
S: The numbers $x - y$ and $x + y$ differ by $2y$, which is even.
T: This contradiction shows that no such integers exist.

Which order gives a correct proof?`,
      options: [r`Q, S, P, R, T`, r`Q, P, S, R, T`, r`S, Q, P, R, T`, r`Q, S, R, P, T`, r`Q, R, S, P, T`], answer: 0,
      notes: [r`Correct.`, r`P is a consequence of S.`, r`S uses $x$ and $y$ before Q introduces them.`, r`R depends on P.`, r`R depends on P and S.`],
      key: 'Assume → difference is even → same parity → both cases impossible → conclude.', sol: 'Q sets up the assumption; S notes the difference is even; P deduces equal parity; R rules out both parities; T concludes.', mis: [] },

    { id: 'M2-14', lesson: 'L7-2', spec: ['Prf5'], diff: 3, type: 'roman',
      stem: r`The curve $y = x^3 + ax^2 + bx$ has a stationary point at $(1, -1)$. Which of the following are true?`,
      parts: [
        { s: r`$a = -1$`, t: true, why: r`$3 + 2a + b = 0$ and $1 + a + b = -1$ give $a = -1$, $b = -1$.` },
        { s: r`The curve has another stationary point at $x = -\tfrac{1}{3}$.`, t: true, why: r`$\dfrac{dy}{dx} = 3x^2 - 2x - 1 = (3x + 1)(x - 1)$.` },
        { s: r`The curve meets the $x$-axis at exactly three points.`, t: true, why: r`$x(x^2 - x - 1) = 0$, and $x^2 - x - 1$ has discriminant $5 > 0$ with non-zero roots.` }
      ],
      key: 'Two equations from “stationary” and “passes through”.', sol: r`$y'(1) = 3 + 2a + b = 0$ and $y(1) = 1 + a + b = -1$. Subtracting: $2 + a = 1$, so $a = -1$ and $b = -1$. Then $y' = (3x + 1)(x - 1)$ and $y = x(x^2 - x - 1)$, which has three distinct roots. I, II and III.`, mis: ['calc-slip'] },

    { id: 'M2-15', lesson: 'L1-5', spec: ['Arg1'], diff: 2, type: 'mcq',
      stem: r`Which one of the following statements is true but has a false converse?`,
      options: [r`If $n$ is an even integer, then $n^2$ is even.`, r`If $x > 2$, then $x^2 > 4$.`, r`If $n$ is an odd integer, then $n + 1$ is even.`, r`If $x^2 = 4$, then $x = 2$.`, r`If a triangle has three equal sides, then it has three equal angles.`], answer: 1,
      notes: [r`The converse (“if $n^2$ even then $n$ even”) is true.`, r`Correct: the converse fails at $x = -3$.`, r`The converse is true for integers.`, r`The statement itself is false ($x = -2$).`, r`The converse is true.`],
      key: 'Check the statement, then write and test its converse.', sol: r`“If $x > 2$ then $x^2 > 4$” is true; its converse “if $x^2 > 4$ then $x > 2$” fails at $x = -3$.`, mis: ['converse'] },

    { id: 'M2-16', lesson: 'L6-1', spec: ['Err1', 'Err2'], diff: 3, type: 'mcq',
      stem: r`A student solves $\dfrac{x}{x - 1} = \dfrac{1}{x - 1} + 2$ by multiplying both sides by $x - 1$, obtaining $x = 1 + 2(x - 1)$ and hence $x = 1$. What is the solution set of the original equation?`,
      options: [r`$x = 1$`, r`there are no solutions`, r`$x = -1$`, r`all real $x \ne 1$`, r`$x = 2$`], answer: 1,
      notes: [r`At $x = 1$ the original equation is undefined.`, r`Correct.`, r`$-\tfrac{1}{2} \ne -\tfrac{1}{2} + 2$.`, r`$x = 2$: $2 \ne 1 + 2$.`, r`$2 \ne 3$.`],
      key: 'The only candidate makes a denominator zero.', sol: r`Multiplying by $x - 1$ is only valid for $x \ne 1$, and the only candidate is $x = 1$, which is excluded. So there are no solutions.`, mis: ['domain', 'divide-zero'] },

    { id: 'M2-17', lesson: 'L4-1', spec: ['Prf2'], diff: 3, type: 'roman',
      stem: r`A function $f$ satisfies $f(0) = 3$ and $f'(x) < 0$ for all real $x$. Which of the following must be true?`,
      parts: [
        { s: r`$f(1) < 3$`, t: true, why: r`$f$ is strictly decreasing.` },
        { s: r`The equation $f(x) = 0$ has exactly one real solution.`, t: false, why: r`$f(x) = 2 + 2^{-x}$ has $f(0) = 3$, is decreasing, and is never 0.` },
        { s: r`$f(-1) > f(1)$`, t: true, why: r`$f$ is strictly decreasing.` }
      ],
      key: 'Decreasing gives order information, not the existence of a root.', sol: 'A function with negative derivative everywhere is strictly decreasing, giving I and III. II fails: a decreasing function can stay above the axis. I and III only.', mis: ['examples-prove'] },

    { id: 'M2-18', lesson: 'L2-2', spec: ['Arg2'], diff: 2, type: 'ns',
      stem: r`A geometric series has first term $a \ne 0$ and common ratio $r$. The condition “$|r| < 1$” is ______ for the condition “the series has a sum to infinity”.`,
      fwd: { t: true, why: r`If $|r| < 1$ the sum to infinity is $\dfrac{a}{1 - r}$.` },
      bwd: { t: true, why: r`If $|r| \ge 1$ and $a \ne 0$, the terms do not tend to 0, so there is no sum to infinity.` },
      key: r`Convergence of a geometric series with $a \ne  0$ is exactly $|r| < 1$.`, sol: r`With $a \ne 0$, the series converges exactly when $|r| < 1$. Necessary and sufficient.`, mis: ['nec-suff-swap'] },

    { id: 'M2-19', lesson: 'L7-2', spec: ['Prf5', 'Prf2'], diff: 4, type: 'mcq',
      stem: r`Each of A, B and C either always tells the truth or always lies.

A says: “B is a liar.”
B says: “A and C are both liars.”
C says: “A is a liar or B is a liar.”

Who tells the truth?`,
      options: [r`A only`, r`B only`, r`C only`, r`A and B only`, r`A and C only`, r`B and C only`, r`all three`, r`none of them`], answer: 4,
      notes: [r`If only A tells the truth, C’s statement is true, so C would be truthful.`, r`If B tells the truth, A is a liar, so A’s claim “B is a liar” is false, consistent; but then C must lie, and C’s statement “A is a liar or …” would be true. Contradiction.`, r`Then A lies, so B is truthful: contradiction.`, r`A says B lies.`, r`Correct.`, r`B says C lies.`, r`A says B lies.`, r`If A lies, B is truthful.`],
      key: 'Case on whether A is truthful.', sol: r`If A is truthful, B lies; B’s claim is then false (fine, since A is truthful); C’s claim “A or B is a liar” is true, so C is truthful. Check: consistent. If A lies, B is truthful, so A and C are liars; but then C’s claim is true (A is a liar), contradiction. So A and C tell the truth.`, mis: ['missing-case'] },

    { id: 'M2-20', lesson: 'L5-4', spec: ['Prf1', 'Arg4'], diff: 3, type: 'mcq',
      stem: r`The statement “For every real $k$, there is a real $x$ with $x^2 + kx + k = 0$” is false. Which value of $k$ demonstrates this?`,
      options: [r`$k = -1$`, r`$k = 0$`, r`$k = 2$`, r`$k = 4$`, r`$k = 5$`], answer: 2,
      notes: [r`Discriminant $1 + 4 = 5 > 0$.`, r`$x = 0$ is a solution.`, r`Correct: discriminant $4 - 8 = -4 < 0$.`, r`Discriminant $16 - 16 = 0$: one solution exists.`, r`Discriminant $25 - 20 = 5 > 0$.`],
      key: r`No real solution $\iff k^2 - 4k < 0 \iff 0 < k < 4$.`, sol: r`We need a $k$ with no real solution: $k^2 - 4k < 0$, i.e. $0 < k < 4$. Only $k = 2$ is in this interval.`, mis: ['counterexample-form'] }
  ]);

  /* ================================================================ MOCK 3 */
  M('M3', 'Mock paper 3', [
    { id: 'M3-01', lesson: 'L1-4', spec: ['Arg1'], diff: 1, type: 'mcq',
      stem: r`Consider the statement, for real $x$: “$x > 0$ if $x^2 > 0$”. Which of the following is correct?`,
      options: [r`The statement is true.`, r`The statement is false, as shown by $x = -1$.`, r`The statement is false, as shown by $x = 0$.`, r`The statement is false, as shown by $x = 1$.`], answer: 1,
      notes: [r`$x = -1$ breaks it.`, r`Correct: translation “if $x^2 > 0$ then $x > 0$”, and $x = -1$ gives $1 > 0$ but $x < 0$.`, r`$x^2 > 0$ is false at $x = 0$, so this does not test the statement.`, r`At $x = 1$ both parts are true.`],
      key: '“A if B” means “if B then A”.', sol: r`The statement means “if $x^2 > 0$ then $x > 0$”. At $x = -1$ the condition holds and the conclusion fails.`, mis: ['if-direction', 'vacuous'] },

    { id: 'M3-02', lesson: 'L2-1', spec: ['Arg2'], diff: 1, type: 'ns',
      stem: r`For integers $m$ and $n$, the condition “$m$ and $n$ are both odd” is ______ for the condition “$mn$ is odd”.`,
      fwd: { t: true, why: 'An odd number times an odd number is odd.' },
      bwd: { t: true, why: 'If either factor were even, the product would be even.' },
      key: 'A product is odd exactly when every factor is odd.', sol: 'Both directions hold, so the condition is necessary and sufficient.', mis: ['nec-suff-swap'] },

    { id: 'M3-03', lesson: 'L3-1', spec: ['Arg3'], diff: 2, type: 'roman',
      stem: r`Which of the following statements are true? (All angles are in degrees.)`,
      parts: [
        { s: r`There exists a real $x$ with $\sin x = 2$.`, t: false, why: r`$-1 \le \sin x \le 1$.` },
        { s: r`For all real $x$, $\sin(x + 180^\circ) = \sin x$.`, t: false, why: r`$\sin(x + 180^\circ) = -\sin x$; e.g. $x = 90^\circ$.` },
        { s: r`For every real $x$, there is a real $y \ne x$ with $\sin y = \sin x$.`, t: true, why: r`$y = x + 360^\circ$.` }
      ],
      key: 'Range and period of sine.', sol: r`I fails since sine never exceeds 1. II fails at $x = 90^\circ$. III: add 360°. III only.`, mis: ['many-to-one'] },

    { id: 'M3-04', lesson: 'L3-3', spec: ['Arg4'], diff: 2, type: 'mcq',
      stem: r`What is the negation of the statement: “If $n$ is prime and $n > 2$, then $n$ is odd”?`,
      options: [r`$n$ is not prime or $n \le 2$, and $n$ is even.`, r`If $n$ is prime and $n > 2$, then $n$ is even.`, r`$n$ is prime and $n > 2$ and $n$ is even.`, r`$n$ is not prime and $n \le 2$ and $n$ is even.`, r`$n$ is prime or $n > 2$, and $n$ is even.`], answer: 2,
      notes: [r`The condition should be kept, not negated.`, r`The negation of an implication is not an implication.`, r`Correct: “A and not B”.`, r`The condition should be kept.`, r`The condition is an “and”.`],
      key: 'not (if A then B) = A and not B.', sol: r`“A and not B”: $n$ is prime and $n > 2$, and $n$ is not odd (even).`, mis: ['implication-negation'] },

    { id: 'M3-05', lesson: 'L5-1', spec: ['Prf1'], diff: 2, type: 'mcq',
      stem: r`Which of the following is a valid proof that $n^2 - 3n$ is even for every integer $n$?`,
      options: [r`$n^2 - 3n = n(n - 3)$. The integers $n$ and $n - 3$ differ by an odd number, so one of them is even, and so the product is even.`, r`$n^2$ is even and $3n$ is even, so their difference is even.`, r`When $n = 1, 2, 3$ the values are $-2, -2, 0$, all even.`, r`$n^2 - 3n = n(n - 3)$, and both factors are even.`, r`$n^2$ and $3n$ always have opposite parity.`], answer: 0,
      notes: [r`Correct.`, r`False when $n$ is odd.`, r`Examples are not a proof.`, r`False: $n = 1$ gives factors 1 and $-2$.`, r`They always have the same parity, which is why the difference is even.`],
      key: 'Two integers differing by an odd number have opposite parity.', sol: r`$n$ and $n - 3$ differ by 3, so they have opposite parity; one is even, so $n(n - 3)$ is even.`, mis: ['examples-prove'] },

    { id: 'M3-06', lesson: 'L4-2', spec: ['Err2'], diff: 2, type: 'mcq',
      stem: r`Which one of the following deductions is valid for all real numbers $a$, $b$ and $x$?`,
      options: [r`If $x^2 = x$, then $x = 1$.`, r`If $(x - 2)^2 = (x - 2)(x + 1)$, then $x - 2 = x + 1$.`, r`If $2^a = 2^b$, then $a = b$.`, r`If $\cos a = \cos b$, then $a = b$.`, r`If $|a| = |b|$, then $a = b$.`], answer: 2,
      notes: [r`$x = 0$ also works.`, r`Dividing by $x - 2$ loses $x = 2$ (and the conclusion is never true).`, r`Correct: $2^x$ is strictly increasing, hence one-to-one.`, r`$\cos(-a) = \cos a$.`, r`$a = 1$, $b = -1$.`],
      key: 'Only one-to-one functions can be cancelled.', sol: r`$y = 2^x$ is strictly increasing, so equal outputs force equal inputs. The other deductions involve dividing by a possibly zero quantity or a many-to-one function.`, mis: ['many-to-one', 'divide-zero'] },

    { id: 'M3-07', lesson: 'L4-1', spec: ['Prf2'], diff: 3, type: 'roman',
      stem: r`In a school year group: every student who takes Physics also takes Maths; some students who take Maths take Art; and no student who takes Art takes Physics. Which of the following must be true?`,
      parts: [
        { s: r`Some students who take Maths do not take Physics.`, t: true, why: 'The Maths students who take Art cannot take Physics.' },
        { s: r`Some students who take Art take Physics.`, t: false, why: 'This contradicts the third fact.' },
        { s: r`Every student who does not take Maths does not take Physics.`, t: true, why: 'Contrapositive of the first fact.' }
      ],
      key: 'Use the Maths-and-Art students as witnesses.', sol: 'The Maths students who take Art exist and cannot take Physics (I). II contradicts the third fact. III is the contrapositive of the first fact. I and III only.', mis: ['converse', 'some-not-all'] },

    { id: 'M3-08', lesson: 'L2-1', spec: ['Arg2', 'Arg1'], diff: 1, type: 'mcq',
      stem: r`Which of the following is equivalent to: “Being over 18 is necessary to vote”?`,
      options: [r`If you are over 18, then you can vote.`, r`You can vote if you are over 18.`, r`If you vote, then you are over 18.`, r`If you are not over 18, then you can vote.`, r`You can vote if and only if you are over 18.`], answer: 2,
      notes: [r`That would make it sufficient.`, r`Same as the first option.`, r`Correct: voting requires being over 18.`, r`Contradicts the statement.`, r`That claims sufficiency too.`],
      key: '“A is necessary for B” = “if B then A”.', sol: 'Being over 18 is required for voting: anyone who votes is over 18.', mis: ['nec-suff-swap'] },

    { id: 'M3-09', lesson: 'L5-5', spec: ['Prf3'], diff: 2, type: 'mcq',
      stem: r`A sequence is defined by $a_1 = 1$ and $a_{n+1} = a_n + 2n + 1$ for $n \ge 1$. What is $a_{20}$?`,
      options: [r`$380$`, r`$399$`, r`$400$`, r`$420$`, r`$441$`], answer: 2,
      notes: [r`No basis.`, r`An off-by-one slip.`, r`Correct: $a_n = n^2$.`, r`No basis.`, r`That is $a_{21}$.`],
      key: r`Terms $1, 4, 9, 16$ suggest $a_n = n^2$; check: $n^2 + 2n + 1 = (n + 1)^2$.`, sol: r`$a_1 = 1, a_2 = 4, a_3 = 9, a_4 = 16$. If $a_n = n^2$ then $a_{n+1} = n^2 + 2n + 1 = (n + 1)^2$, so the formula continues. $a_{20} = 400$.`, mis: ['calc-slip'] },

    { id: 'M3-10', lesson: 'L6-3', spec: ['Err1'], diff: 2, type: 'mcq',
      stem: r`A student claims that $\sqrt{a + b} = \sqrt{a} + \sqrt{b}$ for all positive real $a$ and $b$, and argues:

(1) $\left(\sqrt{a} + \sqrt{b}\right)^2 = a + b$.
(2) Taking square roots, $\sqrt{a} + \sqrt{b} = \sqrt{a + b}$.

Which of the following is correct?`,
      options: [r`The argument is correct.`, r`Line (1) is false, because it omits the term $2\sqrt{ab}$.`, r`Line (2) is invalid because square roots cannot be taken of both sides.`, r`The argument is correct only when $a = b$.`], answer: 1,
      notes: [r`$a = b = 1$: $\sqrt{2} \ne 2$.`, r`Correct: $\left(\sqrt{a} + \sqrt{b}\right)^2 = a + 2\sqrt{ab} + b$.`, r`Both sides are positive, so (2) would follow from a true (1).`, r`For $a = b = 1$ the claim is false too.`],
      key: r`$(p + q)^2 \ne p^2 + q^2$.`, sol: r`$\left(\sqrt{a} + \sqrt{b}\right)^2 = a + 2\sqrt{ab} + b > a + b$ for positive $a$, $b$. So (1) is false, and so is the claim.`, mis: ['calc-slip'] },

    { id: 'M3-11', lesson: 'L5-3', spec: ['Prf1'], diff: 3, type: 'mcq',
      stem: r`A proof that $\sqrt[3]{2}$ is irrational begins: “Suppose $\sqrt[3]{2} = \dfrac{p}{q}$ where $p$ and $q$ are positive integers with no common factor. Then $p^3 = 2q^3$.” Which fact is needed to deduce next that $p$ is even?`,
      options: [r`If $p^3$ is even, then $p$ is even.`, r`If $p$ is even, then $p^3$ is even.`, r`$2q^3$ is a multiple of 8.`, r`Every cube is a multiple of 2.`, r`If $p^3$ is even, then $p^3$ is a multiple of 8.`], answer: 0,
      notes: [r`Correct: $p^3 = 2q^3$ is even.`, r`This is the converse; it does not help here.`, r`Not true in general ($q = 1$).`, r`False ($1^3 = 1$).`, r`True, but it does not give that $p$ is even.`],
      key: r`We know $p^{3}$ is even and want $p$ even.`, sol: r`$p^3 = 2q^3$ is even. The fact “if $p^3$ is even then $p$ is even” (contrapositive of “odd cubed is odd”) gives $p$ even. Then $p = 2r$ gives $q^3 = 4r^3$, so $q$ is even too: contradiction.`, mis: ['converse'] },

    { id: 'M3-12', lesson: 'L2-2', spec: ['Arg2'], diff: 2, type: 'ns',
      stem: r`For real $k$, the condition “$k > 3$” is ______ for the condition “the equation $x^2 + 2kx + 9 = 0$ has two distinct real roots”.`,
      fwd: { t: true, why: r`$k > 3 \Rightarrow 4k^2 - 36 > 0$.` },
      bwd: { t: false, why: r`$k = -4$ gives $64 - 36 > 0$ but $k < 3$.` },
      key: r`Two distinct roots $\iff 4k^2 > 36 \iff |k| > 3$.`, sol: r`The discriminant $4k^2 - 36 > 0 \iff |k| > 3$. $k > 3$ is inside this set (sufficient); $k = -4$ shows it is not necessary.`, mis: ['nec-suff-swap', 'missing-case'] },

    { id: 'M3-13', lesson: 'L5-6', spec: ['Prf4', 'Prf1'], diff: 3, type: 'mcq',
      stem: r`The following statements can be arranged to prove that if integers $a$, $b$, $c$ satisfy $a^2 + b^2 = c^2$, then at least one of $a$ and $b$ is even.

P: Suppose $a$ and $b$ are both odd.
Q: Then $a^2$ and $b^2$ each leave remainder 1 on division by 4, so $c^2$ leaves remainder 2.
R: But every square leaves remainder 0 or 1 on division by 4.
S: This contradiction shows that at least one of $a$ and $b$ is even.

Which of the following orders gives a correct proof?`,
      options: [r`P, Q, R, S`, r`Q, P, R, S`, r`P, S, Q, R`, r`R, Q, P, S`, r`S, P, Q, R`], answer: 0,
      notes: [r`Correct.`, r`Q uses the assumption made in P.`, r`The conclusion S must come last.`, r`Q uses the assumption in P, which comes later here.`, r`The conclusion cannot come first.`],
      key: 'Assumption, consequence, clash with a known fact, conclusion.', sol: r`P makes the assumption; Q deduces the remainder of $c^{2}$; R states the fact it contradicts; S concludes. (R is a general fact and could appear earlier, but among the listed orders only P, Q, R, S works.)`, mis: ['contradiction-setup'] },

    { id: 'M3-14', lesson: 'L7-2', spec: ['Prf5'], diff: 3, type: 'mcq',
      stem: r`Real numbers $x$ and $y$ satisfy $x + y = 2$ and $xy = k$. For which values of $k$ do such real numbers exist?`,
      options: [r`$k \le 1$`, r`$k < 1$`, r`$k \ge 1$`, r`$0 \le k \le 1$`, r`all real $k$`], answer: 0,
      notes: [r`Correct.`, r`$k = 1$ works with $x = y = 1$.`, r`$k = 2$ fails.`, r`$k = -3$ works with $x = 3$, $y = -1$.`, r`$k = 2$ fails.`],
      key: r`$x$ and $y$ are roots of $t^2 - 2t + k = 0$.`, sol: r`$x$ and $y$ are the roots of $t^2 - 2t + k = 0$, which has real roots iff $4 - 4k \ge 0$, i.e. $k \le 1$.`, mis: ['missing-case'] },

    { id: 'M3-15', lesson: 'L3-3', spec: ['Arg4', 'Arg3'], diff: 1, type: 'mcq',
      stem: r`Which of the following is the negation of: “Every even number greater than 2 is the sum of two primes”?`,
      options: [r`No even number greater than 2 is the sum of two primes.`, r`There is an even number greater than 2 that is not the sum of two primes.`, r`There is an odd number greater than 2 that is the sum of two primes.`, r`Every even number greater than 2 is not the sum of two primes.`, r`There is an even number greater than 2 that is the sum of two primes.`], answer: 1,
      notes: [r`Too strong.`, r`Correct.`, r`Odd numbers are not the subject.`, r`Too strong (same as “no even number …”).`, r`Consistent with the original.`],
      key: 'not (every X is P) = some X is not P.', sol: 'One even number greater than 2 that is not the sum of two primes would make the original false.', mis: ['quantifier-negation', 'negation-extreme'] },

    { id: 'M3-16', lesson: 'L6-2', spec: ['Err2'], diff: 1, type: 'mcq',
      stem: r`A student says: “Since $x < 3$, it follows that $x^2 < 9$.” Which of the following is correct?`,
      options: [r`The deduction is valid.`, r`The deduction is invalid, as $x = -4$ shows.`, r`The deduction is invalid, as $x = 3$ shows.`, r`The deduction is valid for integers only.`], answer: 1,
      notes: [r`Squaring does not preserve order for negative numbers.`, r`Correct: $-4 < 3$ but $16 > 9$.`, r`$x = 3$ does not satisfy $x < 3$.`, r`$x = -4$ is an integer.`],
      key: 'Squaring preserves order only for non-negative numbers.', sol: r`$x = -4$ satisfies $x < 3$ but $x^2 = 16 > 9$.`, mis: ['inequality-sign', 'counterexample-form'] },

    { id: 'M3-17', lesson: 'L1-2', spec: ['Arg1', 'Arg3'], diff: 2, type: 'roman',
      stem: r`Which of the following statements are true for all real $x$?`,
      parts: [
        { s: r`$x \ge 0$ or $x \le 0$`, t: true, why: 'Every real number is non-negative or non-positive.' },
        { s: r`$x > 1$ or $x < 1$`, t: false, why: r`$x = 1$.` },
        { s: r`$x^2 \ge 0$ and $x^3 \ge 0$`, t: false, why: r`$x = -1$: $x^3 = -1$.` }
      ],
      key: 'Check boundary values and negatives.', sol: r`I always holds. II fails at $x = 1$. III fails at $x = -1$. I only.`, mis: ['inclusive-or', 'missing-case'] },

    { id: 'M3-18', lesson: 'L7-2', spec: ['Prf5', 'Prf2'], diff: 4, type: 'roman',
      stem: r`Integers $x$ and $y$ satisfy $3x + 5y = 1$. Which of the following must be true?`,
      parts: [
        { s: r`$x$ and $y$ are not both even.`, t: true, why: r`If both were even, $3x + 5y$ would be even.` },
        { s: r`$y + 1$ is a multiple of 3.`, t: true, why: r`$5y = 1 - 3x$, so $5y + 5 = 3(2 - x)$; hence $3 \mid 5(y + 1)$, so $3 \mid y + 1$.` },
        { s: r`At least one of $x$ and $y$ is negative.`, t: true, why: r`If both were non-negative, $3x + 5y$ would be 0 (both zero) or at least 3.` }
      ],
      key: 'Parity, divisibility by 3, and size each settle one statement.', sol: r`I: both even gives an even left side. II: $5(y + 1) = 6 - 3x = 3(2 - x)$, and 3 does not divide 5, so $3 \mid y + 1$. III: non-negative $x, y$ give $3x + 5y \in \{0\} \cup [3, \infty)$, never 1. I, II and III.`, mis: [] },

    { id: 'M3-19', lesson: 'L2-2', spec: ['Arg2'], diff: 3, type: 'ns',
      stem: r`Let $f$ be a function that is differentiable for all real $x$. The condition “$f'(a) = 0$” is ______ for the condition “$f$ has a local maximum at $x = a$”.`,
      fwd: { t: false, why: r`$f(x) = x^3$ has $f'(0) = 0$ but no maximum at 0.` },
      bwd: { t: true, why: 'At a local maximum of a function differentiable everywhere, the tangent is horizontal.' },
      key: 'Every local maximum of a differentiable function is stationary, but not every stationary point is a maximum.', sol: r`A local maximum (for a function differentiable everywhere) has $f'(a) = 0$, so the condition is necessary. $f(x) = x^3$ at $0$ shows it is not sufficient.`, mis: ['nec-suff-swap'] },

    { id: 'M3-20', lesson: 'L7-3', spec: ['Prf5'], diff: 3, type: 'mcq',
      stem: r`Find the number of real values of $x$ for which $|x^2 - 4| = 3$.`,
      options: [r`$0$`, r`$1$`, r`$2$`, r`$3$`, r`$4$`, r`$6$`], answer: 4,
      notes: [r`There are solutions.`, r`Too few.`, r`The case $x^2 - 4 = -3$ has been missed.`, r`Count again.`, r`Correct: $x = \pm\sqrt{7}$ and $x = \pm 1$.`, r`Too many.`],
      key: r`$x^2 - 4 = 3$ or $x^2 - 4 = -3$.`, sol: r`$x^2 - 4 = 3$ gives $x = \pm\sqrt{7}$; $x^2 - 4 = -3$ gives $x = \pm 1$. Four solutions.`, mis: ['missing-case', 'stop-early'] }
  ]);
})();
