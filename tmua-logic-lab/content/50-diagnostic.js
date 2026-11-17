/* Diagnostic pool: never used in practice or mocks. Each item maps to the lesson it diagnoses. */
(function () {
  const r = String.raw;
  const D = (o) => TLL.diagnostic.push(Object.assign({ type: 'mcq', pool: 'diagnostic', mis: [], prov: 'original' }, o));

  D({ id: 'D01', lesson: 'L1-1', spec: ['Arg1'], diff: 1,
    stem: r`Is “$x^3 \ge x$” true for every positive integer $x$?`,
    options: [r`Yes`, r`No, $x = 1$ fails`, r`No, it fails for large $x$`], answer: 0,
    notes: [r`Correct: for $x \ge 1$, $x^3 - x = x(x-1)(x+1) \ge 0$.`, r`$1 \ge 1$ is true.`, r`Cubes grow faster than $x$.`],
    key: 'Factorise and check signs on the given domain.', sol: r`$x^3 - x = x(x - 1)(x + 1) \ge 0$ when $x \ge 1$.`,
  });

  D({ id: 'D02', lesson: 'L1-2', spec: ['Arg1'], diff: 1,
    stem: r`How many integers $n$ with $1 \le n \le 10$ satisfy “$n$ is even or $n$ is a multiple of 5”?`,
    options: [r`5`, r`6`, r`7`, r`1`], answer: 1,
    notes: [r`This leaves out 5.`, r`Correct: 2, 4, 5, 6, 8, 10.`, r`10 counted twice.`, r`That counts “and”.`],
    key: '“Or” is inclusive.', sol: r`Evens: 2, 4, 6, 8, 10; multiples of 5: 5, 10. Union: 6 numbers.` });

  D({ id: 'D03', lesson: 'L1-3', spec: ['Arg1'], diff: 2,
    stem: r`Which value of $n$ would show that “if $n$ is odd then $n^2 + 1$ is even” is false?`,
    options: [r`$n = 2$`, r`$n = 3$`, r`$n = 1$`, r`No value: the statement is true`], answer: 3,
    notes: [r`2 is not odd, so it tests nothing.`, r`$10$ is even.`, r`$2$ is even.`, r`Correct: odd squared is odd, plus 1 is even.`],
    key: 'A counterexample must make the condition true and the conclusion false.', sol: r`If $n$ is odd, $n^2$ is odd and $n^2 + 1$ is even, so no counterexample exists.` });

  D({ id: 'D04', lesson: 'L1-4', spec: ['Arg1'], diff: 2,
    stem: r`Which is equivalent to “a number is divisible by 10 only if it is even”?`,
    options: [r`If a number is even, it is divisible by 10.`, r`If a number is divisible by 10, it is even.`, r`A number is divisible by 10 if and only if it is even.`], answer: 1,
    notes: [r`Direction reversed.`, r`Correct: “A only if B” means “if A then B”.`, r`Only one direction is claimed.`],
    key: '“A only if B” = “if A then B”.', sol: '“Divisible by 10 only if even” means “if divisible by 10 then even”.' });

  D({ id: 'D05', lesson: 'L1-5', spec: ['Arg1'], diff: 1,
    stem: r`What is the contrapositive of “If it is Tuesday, then I am at college”?`,
    options: [r`If I am at college, then it is Tuesday.`, r`If it is not Tuesday, then I am not at college.`, r`If I am not at college, then it is not Tuesday.`], answer: 2,
    notes: [r`That is the converse.`, r`That negates without swapping.`, r`Correct.`],
    key: 'Contrapositive: swap and negate.', sol: '“If not B then not A”: if I am not at college, then it is not Tuesday.' });

  D({ id: 'D06', lesson: 'L2-1', spec: ['Arg2'], diff: 2, type: 'ns',
    stem: r`For integers $n$, “$n$ is a multiple of 4” is ______ for “$n$ is even”.`,
    fwd: { t: true, why: r`A multiple of 4 is $4k = 2(2k)$, which is even.` },
    bwd: { t: false, why: r`$6$ is even but not a multiple of 4.` },
    key: 'Sufficient = guarantees.', sol: 'Multiples of 4 are always even (sufficient) but 6 shows it is not necessary.' });

  D({ id: 'D07', lesson: 'L3-1', spec: ['Arg3'], diff: 2,
    stem: r`Which statement is true?`,
    options: [r`For every real $x$, $x^2 + x > 0$.`, r`There exists a real $x$ with $x^2 = -x$.`, r`There exists a real $x$ with $x^2 + 1 = 0$.`], answer: 1,
    notes: [r`$x = 0$ gives $0$.`, r`Correct: $x = 0$ or $x = -1$.`, r`$x^2 + 1 \ge 1$.`],
    key: 'One example proves “there exists”.', sol: r`$x = 0$ satisfies $x^2 = -x$.` });

  D({ id: 'D08', lesson: 'L3-3', spec: ['Arg4'], diff: 2,
    stem: r`What is the negation of “every multiple of 3 is odd”?`,
    options: [r`Every multiple of 3 is even.`, r`Some multiple of 3 is even.`, r`No multiple of 3 is odd.`], answer: 1,
    notes: [r`Too strong.`, r`Correct: “for all” becomes “there exists … not”.`, r`Too strong.`],
    key: 'not (for all, P) = there exists, not P.', sol: 'One even multiple of 3 (such as 6) is enough to make the original false.' });

  D({ id: 'D09', lesson: 'L4-2', spec: ['Err2'], diff: 2,
    stem: r`“If a number is a multiple of 6, it is a multiple of 3. 15 is a multiple of 3. So 15 is a multiple of 6.” What is wrong?`,
    options: [r`The first statement is false.`, r`It reverses the implication (affirming the consequent).`, r`Nothing; 15 is a multiple of 6.`], answer: 1,
    notes: [r`The first statement is true.`, r`Correct.`, r`15 is not a multiple of 6.`],
    key: 'From B you cannot conclude A.', sol: 'Knowing the conclusion (multiple of 3) does not give the condition (multiple of 6).' });

  D({ id: 'D10', lesson: 'L5-3', spec: ['Prf1'], diff: 2,
    stem: r`To prove “$\sqrt{5}$ is irrational” by contradiction, you begin by assuming:`,
    options: [r`$\sqrt{5}$ is irrational`, r`$\sqrt{5} = \dfrac{p}{q}$ for integers $p$, $q$ with $q \ne 0$`, r`$5$ is prime`], answer: 1,
    notes: [r`That is what you want to prove.`, r`Correct: the negation of “irrational”.`, r`True, and useful later, but not the contradiction assumption.`],
    key: 'Assume the negation.', sol: r`Assume $\sqrt{5}$ is rational, written as a fraction (in lowest terms), and derive a contradiction.` });

  D({ id: 'D11', lesson: 'L6-1', spec: ['Err2'], diff: 2,
    stem: r`A student solves $(x - 1)(x + 4) = 2(x - 1)$ by dividing by $x - 1$ to get $x = -2$. What is the full solution set?`,
    options: [r`$x = -2$`, r`$x = 1$ or $x = -2$`, r`$x = 1$`], answer: 1,
    notes: [r`The student lost $x = 1$.`, r`Correct: $(x - 1)(x + 2) = 0$.`, r`$x = -2$ is also a solution.`],
    key: r`Dividing by $x - 1$ assumes $x \ne  1$.`, sol: r`$(x - 1)(x + 4 - 2) = 0$, so $x = 1$ or $x = -2$.` });

  D({ id: 'D12', lesson: 'L6-2', spec: ['Err2'], diff: 2,
    stem: r`Solve $\dfrac{3}{x} > 1$.`,
    options: [r`$x < 3$`, r`$0 < x < 3$`, r`$x > 3$`], answer: 1,
    notes: [r`Negative $x$ gives a negative left side.`, r`Correct: $x$ must be positive and less than 3.`, r`$x = 4$ gives $\tfrac{3}{4} < 1$.`],
    key: r`Multiplying by $x$ needs its sign.`, sol: r`If $x < 0$ the left side is negative: no. If $x > 0$: $3 > x$. So $0 < x < 3$.` });

  D({ id: 'D13', lesson: 'R4', spec: [], diff: 1,
    stem: r`How many real roots does $x^2 - 4x + 5 = 0$ have?`,
    options: [r`0`, r`1`, r`2`], answer: 0,
    notes: [r`Correct: discriminant $16 - 20 = -4 < 0$.`, r`That needs discriminant 0.`, r`That needs a positive discriminant.`],
    key: 'Discriminant.', sol: r`$b^2 - 4ac = 16 - 20 < 0$, so no real roots.` });

  D({ id: 'D14', lesson: 'R5', spec: [], diff: 1,
    stem: r`How many solutions does $\sin x = \tfrac{1}{2}$ have for $0^\circ \le x < 360^\circ$?`,
    options: [r`1`, r`2`, r`4`], answer: 1,
    notes: [r`$150^\circ$ also works.`, r`Correct: $30^\circ$ and $150^\circ$.`, r`Too many.`],
    key: 'Two solutions per period.', sol: r`$x = 30^\circ$ and $x = 150^\circ$.` });
})();
