/* Unit 4: Deduction (Prf2, Err2). Unit 5: Proof methods (Prf1, Prf3, Prf4). */
(function () {
  const r = String.raw;

  TLL.units.push(
    { id: 'U4', title: 'Deduction', summary: 'Drawing valid conclusions from given statements, and spotting the invalid ones.', spec: ['Prf2', 'Err2'] },
    { id: 'U5', title: 'Proof methods', summary: 'Direct proof, cases, contradiction, counterexamples, conjectures and ordering proof steps.', spec: ['Prf1', 'Prf3', 'Prf4'] }
  );

  /* ------------------------------------------------------------------ L4-1 */
  TLL.lessons.push({
    id: 'L4-1', unit: 'U4', title: 'Valid deductions and chains of reasoning', mins: 8, spec: ['Prf2'], prereq: ['L1-5'],
    objectives: [
      { id: 'L41a', text: 'Deduce B from “if A then B” and A, and deduce “not A” from “if A then B” and “not B”.' },
      { id: 'L41b', text: 'Chain several given statements to reach a conclusion, and identify what cannot be concluded.' }
    ],
    purpose: 'Prf2 questions give several facts and ask what must follow. Two valid moves and the contrapositive handle almost all of them.',
    refs: ['spec2026', 'notesLogic'],
    steps: [
      { k: 'predict', stem: r`All squares are rectangles. Shape S is **not** a rectangle. What follows?`,
        options: [r`S is a square.`, r`S is not a square.`, r`Nothing can be concluded.`], answer: 1,
        notes: [r`A square would have to be a rectangle.`, r`Correct: if S were a square it would be a rectangle.`, r`Something does follow, by the contrapositive.`] },
      { k: 'idea', title: 'Two valid moves and a chain', body: r`Given “if A then B”:

- **Forward:** knowing A, conclude B.
- **Backward (contrapositive):** knowing not B, conclude not A.

**Chains:** from “if A then B” and “if B then C”, conclude “if A then C”.

What you **cannot** do: from B conclude A, or from not A conclude not B. (Next lesson.)

**Method for “which must be true?”:** write each given statement as an implication, mark what is known, and push forwards and backwards until nothing new appears.` },
      { k: 'diagram', d: { type: 'chain', items: ['A', 'B', 'C'] }, alt: 'A chain of arrows: A leads to B, and B leads to C, so A leads to C. Following the arrows backwards with negations: not C leads to not B, which leads to not A.', caption: 'Follow arrows forwards from what is true, or backwards from what is false.' },
      { k: 'worked', id: 'W20' },
      { k: 'worked', id: 'W21' },
      { k: 'guided', title: 'Your turn, with support', problem: r`Given: (1) every multiple of 6 is a multiple of 3; (2) $n$ is not a multiple of 3. What can be deduced?`,
        parts: [
          { ask: { stem: r`Which move applies?`, options: [r`Backward: not B, so not A`, r`Forward: A, so B`, r`No move applies`], answer: 0,
            notes: [r`Correct: (1) says “if multiple of 6 then multiple of 3”, and we know “not multiple of 3”.`, r`We do not know that n is a multiple of 6.`, r`The contrapositive applies.`] } },
          { show: r`So $n$ is **not a multiple of 6**.` }
        ] },
      { k: 'practice', ids: ['P411', 'P414'] },
      { k: 'check' },
      { k: 'summary', body: r`Forward from what is true, backward from what is false, and chain implications together.` }
    ]
  });

  TLL.worked.push(
    { id: 'W20', lesson: 'L4-1', title: 'Combining three facts',
      problem: r`Given: (1) if P then Q; (2) if R then not Q; (3) R is true. What can be deduced about P and Q?`,
      steps: [
        { do: r`From (3) and (2), forward: not Q.`, why: 'R is known, so its consequence follows.' },
        { do: r`From not Q and (1), backward: not P.`, why: 'Contrapositive of (1): if not Q then not P.' },
        { do: r`Conclusion: Q is false and P is false.`, why: '' }
      ],
      takeaway: 'Start from the facts you know for certain and push through each implication.' },
    { id: 'W21', lesson: 'L4-1', title: 'A deduction about a function',
      problem: r`It is given that $f(x) > 0$ whenever $x > 2$. You are told $f(a) \le 0$. What can be deduced about $a$?`,
      steps: [
        { do: r`Given: if $x > 2$ then $f(x) > 0$.`, why: 'Rewrite “whenever” as an implication.' },
        { do: r`Contrapositive: if $f(x) \le 0$ then $x \le 2$.`, why: 'Negate both parts and swap.' },
        { do: r`Since $f(a) \le 0$, we deduce $a \le 2$.`, why: '' }
      ],
      takeaway: r`“Whenever” is an implication; the contrapositive turns a failure of the conclusion into information about $x$.` }
  );

  TLL.questions.push(
    { id: 'P411', lesson: 'L4-1', obj: 'L41a', spec: ['Prf2'], diff: 1, type: 'mcq',
      stem: r`It is known that if $x$ is in set S then $x$ is in set T. The object $y$ is **not** in T. What can be deduced?`,
      options: [r`$y$ is in S.`, r`$y$ is not in S.`, r`$y$ may or may not be in S.`, r`T contains no elements.`], answer: 1,
      notes: [r`Anything in S would be in T.`, r`Correct: contrapositive, not in T so not in S.`, r`The contrapositive settles it.`, r`Nothing suggests this.`],
      key: 'Contrapositive: not in T ⇒ not in S.',
      sol: r`The given statement is equivalent to “if $x$ is not in T then $x$ is not in S”. Since $y$ is not in T, y is not in S.`,
      hints: ['Write the contrapositive of the given statement.', r`Which part do we know about $y$?`, 'Apply the contrapositive.'],
      mis: ['converse'], tip: 'A known failure of B lets you conclude not A.' },

    { id: 'P412', lesson: 'L4-1', obj: 'L41b', spec: ['Prf2'], diff: 2, type: 'mcq',
      stem: r`Given: every A is a B, and some B are C. Which of the following must be true?`,
      options: [r`Some A are C.`, r`No A is C.`, r`Every C is a B.`, r`None of these must be true.`], answer: 3,
      notes: [r`The B’s that are C might all be outside A.`, r`Some A might well be C.`, r`We only know some B are C.`, r`Correct: the facts are consistent with each of the other options being false.`],
      key: 'Draw a diagram that satisfies the facts and makes the option false.',
      sol: 'Let A = {1}, B = {1, 2}, C = {2, 3}. Every A is a B and some B are C, yet no A is C (so the first option fails) and not every C is a B (the third fails). With C = {1, 2} instead, some A is C (the second fails). So none must be true.',
      hints: ['Try to build an example where the option is false.', 'Small sets of numbers make good examples.', 'Check each option against your examples.'],
      mis: ['affirm-consequent'], tip: 'To refute “must be true”, build one situation satisfying the facts where it is false.' },

    { id: 'P413', lesson: 'L4-1', obj: 'L41a', spec: ['Prf2'], diff: 2, type: 'roman',
      stem: r`Given: (1) every polynomial function is continuous; (2) the function $g$ is not continuous; (3) the function $h$ is continuous. Which of the following must be true?`,
      parts: [
        { s: r`$g$ is not a polynomial.`, t: true, why: r`Contrapositive of (1) applied to $g$.` },
        { s: r`$h$ is a polynomial.`, t: false, why: r`This affirms the consequent: continuous functions need not be polynomials (for example $\sin  x$).` },
        { s: r`$h$ is not a polynomial.`, t: false, why: 'Nothing rules out h being a polynomial.' }
      ],
      key: 'From “continuous” nothing follows about being a polynomial.',
      sol: 'I follows by the contrapositive. Knowing h is continuous gives no information about whether h is a polynomial, so neither II nor III must be true. I only.',
      hints: ['Write (1) as “if polynomial then continuous”.', 'Which facts give “not B”, and which give “B”?', 'Knowing B tells you nothing about A.'],
      mis: ['affirm-consequent', 'converse'], tip: 'Knowing the conclusion is true tells you nothing about the condition.' },

    { id: 'P414', lesson: 'L4-1', obj: 'L41b', spec: ['Prf2'], diff: 2, type: 'roman',
      stem: r`It is given that: if P then Q; if Q then R; and R is false. Which of the following must be true?`,
      parts: [
        { s: r`Q is false.`, t: true, why: 'Contrapositive of “if Q then R” with R false.' },
        { s: r`P is false.`, t: true, why: 'From Q false, contrapositive of “if P then Q”.' },
        { s: r`If R then P.`, t: false, why: 'This is not implied; the given implications point the other way.' }
      ],
      key: 'Push “not R” backwards along the chain.',
      sol: 'From not R and “if Q then R”: not Q. From not Q and “if P then Q”: not P. III is a converse of the chain and is not implied. I and II only.',
      hints: ['Start from the fact you know: R is false.', 'Use contrapositives to move backwards.', 'Is III a consequence or a reversal?'],
      mis: ['converse'], tip: 'A false conclusion at the end of a chain falsifies everything before it.' },

    { id: 'P415', lesson: 'L4-1', obj: 'L41b', spec: ['Prf2'], diff: 2, type: 'mcq', pre: ['R4'],
      stem: r`The equation $x^2 + kx + 4 = 0$ is known to have **no** real roots. Which describes all possible values of the real constant $k$?`,
      options: [r`$k > 4$ or $k < -4$`, r`$-4 < k < 4$`, r`$-4 \le k \le 4$`, r`$k < 4$`], answer: 1,
      notes: [r`These values give two distinct real roots.`, r`Correct: no real roots $\iff k^2 - 16 < 0$.`, r`At $k = \pm 4$ there is a repeated real root.`, r`$k = -5$ gives two real roots.`],
      key: r`No real roots $\iff$ discriminant $< 0$.`,
      sol: r`No real roots exactly when $k^2 - 4 \times 1 \times 4 < 0$, that is $k^2 < 16$, so $-4 < k < 4$.`,
      hints: ['Use the discriminant.', 'Strict or non-strict inequality?', r`Solve $k^2 < 16$.`],
      mis: ['missing-case', 'negation-extreme'], tip: '“No real roots” means strictly negative discriminant.' },

    { id: 'P416', lesson: 'L4-1', obj: 'L41b', spec: ['Prf2'], diff: 2, type: 'tfset',
      stem: r`Given: “Every student who studies Further Maths also studies Maths.” Sam does not study Maths. Alex studies Maths. For each statement, decide whether it **must be true**.`,
      labels: ['Must be true', 'Not necessarily'],
      statements: [
        { s: r`Sam does not study Further Maths.`, t: true, why: 'Contrapositive applied to Sam.' },
        { s: r`Alex studies Further Maths.`, t: false, why: 'Affirming the consequent: Alex might study Maths without Further Maths.' },
        { s: r`It is possible that Alex does not study Further Maths.`, t: true, why: 'The given facts allow this, so the statement “it is possible” must be true.' },
        { s: r`Anyone who does not study Further Maths does not study Maths.`, t: false, why: 'This is equivalent to the converse.' }
      ],
      key: 'Only the contrapositive gives new certain information.',
      sol: '1 and 3 must be true; 2 and 4 are not guaranteed.',
      hints: ['Write the rule as an implication.', 'Which students give you “not B”?', 'Is statement 4 the contrapositive or something else?'],
      mis: ['affirm-consequent', 'converse'], tip: 'Distinguish “must be true” from “could be true”.' }
  );

  /* ------------------------------------------------------------------ L4-2 */
  TLL.lessons.push({
    id: 'L4-2', unit: 'U4', title: 'Invalid inference patterns', mins: 8, spec: ['Err2', 'Prf2'], prereq: ['L4-1'],
    objectives: [
      { id: 'L42a', text: 'Recognise affirming the consequent and denying the antecedent.' },
      { id: 'L42b', text: 'Recognise that examples cannot establish a universal claim, and that invalid reasoning can reach a true conclusion.' }
    ],
    purpose: 'Err2 asks you to recognise common invalid deductions. Naming the pattern makes it quick to reject.',
    refs: ['spec2026', 'notesLogic'],
    steps: [
      { k: 'predict', stem: r`“If $n$ is a multiple of 4 then $n$ is even. $n$ is even. Therefore $n$ is a multiple of 4.” Is this argument valid?`,
        options: [r`Valid`, r`Invalid`], answer: 1,
        notes: [r`$n = 6$ makes both premises true and the conclusion false.`, r`Correct: knowing B does not give A.`] },
      { k: 'idea', title: 'Three tempting invalid patterns', body: r`An argument is **valid** if the conclusion must be true whenever the premises are true. Given “if A then B”:

- **Affirming the consequent:** B, therefore A. Invalid (this uses the converse).
- **Denying the antecedent:** not A, therefore not B. Invalid.
- **Generalising from examples:** “it works for $n = 1, 2, 3, 4, 5$, so it always works”. Invalid for a universal claim.

To show an argument is invalid, find a situation where every premise is true and the conclusion is false.

An invalid argument can still reach a **true** conclusion by luck. Validity is about the reasoning, not the answer.` },
      { k: 'examples', yes: { title: 'Valid', body: r`If $x > 3$ then $x^2 > 9$. We know $x^2 \le 9$. Therefore $x \le 3$. (Contrapositive.)` },
        no: { title: 'Invalid', body: r`If $x > 3$ then $x^2 > 9$. We know $x \le 3$. Therefore $x^2 \le 9$. (Denying the antecedent: $x = -4$.)` } },
      { k: 'worked', id: 'W22' },
      { k: 'worked', id: 'W23' },
      { k: 'practice', ids: ['P421', 'P422'] },
      { k: 'check' },
      { k: 'summary', body: r`From “if A then B”: B does not give A, and not A does not give not B. Examples cannot prove “always”.` }
    ]
  });

  TLL.worked.push(
    { id: 'W22', lesson: 'L4-2', title: 'An invalid argument about continuity and differentiability',
      problem: r`Assess: “If a function is differentiable at a point, it is continuous there. $f(x) = |x|$ is continuous at $0$. Therefore $f$ is differentiable at $0$.”`,
      steps: [
        { do: r`Pattern: if A then B; B; therefore A. This is affirming the consequent.`, why: 'Name the pattern.' },
        { do: r`Check with this $f$: the graph of $y = |x|$ has a corner at $0$; the gradient is $-1$ just to the left and $+1$ just to the right, so there is no single tangent gradient.`, why: 'A concrete case where the premises hold and the conclusion fails.' },
        { do: r`So the argument is **invalid**, and here its conclusion is also false.`, why: '' }
      ],
      takeaway: 'Name the pattern, then confirm with a concrete case.' },
    { id: 'W23', lesson: 'L4-2', title: 'Why checking cases is not a proof',
      problem: r`A student checks $n^2 - n + 41$ for $n = 1, 2, \ldots, 10$, finds primes each time, and concludes it is prime for every positive integer $n$. Assess this.`,
      steps: [
        { do: r`The reasoning generalises from finitely many examples: invalid for a universal claim.`, why: '' },
        { do: r`Look for a value making the expression factorise: $n = 41$ gives $41^2 - 41 + 41 = 41^2$.`, why: r`Choose $n$ so every term shares a factor.` },
        { do: r`So the conclusion is false as well as unjustified.`, why: '' }
      ],
      takeaway: 'Examples can suggest a conjecture and can disprove a claim, but cannot prove “for all”.' }
  );

  TLL.questions.push(
    { id: 'P421', lesson: 'L4-2', obj: 'L42a', spec: ['Err2', 'Prf2'], diff: 1, type: 'mcq',
      stem: r`“If $x > 3$ then $x^2 > 9$. $x$ is not greater than 3. Therefore $x^2 \le 9$.” Which describes this argument?`,
      options: [r`Valid.`, r`Invalid: it denies the antecedent.`, r`Invalid, because the first statement is false.`, r`Valid, because it uses the contrapositive.`], answer: 1,
      notes: [r`$x = -4$ makes the premises true and the conclusion false.`, r`Correct: “not A, therefore not B” is invalid.`, r`The first statement is true.`, r`The contrapositive would be “not B, therefore not A”.`],
      key: 'Not A does not give not B.',
      sol: r`This is “if A then B; not A; therefore not B”, which is invalid. Counterexample: $x = -4$ is not greater than 3, but $x^2 = 16 > 9$.`,
      hints: ['Identify A and B.', 'Which part is denied?', r`Try a negative $x$.`],
      mis: ['deny-antecedent'], tip: 'Denying the condition tells you nothing about the result.' },

    { id: 'P422', lesson: 'L4-2', obj: 'L42a', spec: ['Err2', 'Prf2'], diff: 2, type: 'roman',
      stem: r`Which of the following arguments are valid?`,
      parts: [
        { s: r`If P then Q. Q. Therefore P.`, t: false, why: 'Affirming the consequent.' },
        { s: r`If P then Q. Not Q. Therefore not P.`, t: true, why: 'Contrapositive.' },
        { s: r`P only if Q. P. Therefore Q.`, t: true, why: '“P only if Q” means “if P then Q”; then forward.' }
      ],
      key: 'Translate “only if” first, then check the move.',
      sol: 'I affirms the consequent (invalid). II uses the contrapositive (valid). III: “P only if Q” is “if P then Q”, and with P we get Q (valid). II and III only.',
      hints: ['Translate III into “if … then”.', 'Which moves are forward or contrapositive?', 'Which move goes from B to A?'],
      mis: ['affirm-consequent', 'only-if'], tip: 'Translate, then classify the move.' },

    { id: 'P423', lesson: 'L4-2', obj: 'L42b', spec: ['Err2', 'Prf3'], diff: 2, type: 'mcq',
      stem: r`A student checks that $2^n + 1$ is prime for $n = 1, 2, 4, 8, 16$ and concludes that $2^n + 1$ is prime whenever $n$ is a power of 2. Which is the best evaluation?`,
      options: [r`The conclusion is proved, since every power of 2 up to 16 was checked.`, r`The reasoning is invalid: finitely many cases cannot establish a claim about infinitely many. (In fact the claim fails for $n = 32$.)`, r`The reasoning is valid but the conclusion is false.`, r`The reasoning would be valid if one more case were checked.`], answer: 1,
      notes: [r`There are infinitely many powers of 2.`, r`Correct. ($2^{32} + 1 = 641 \times 6700417$, found by Euler.)`, r`A valid argument from true premises cannot have a false conclusion.`, r`No finite number of checks proves a statement about infinitely many cases.`],
      key: 'Examples can suggest but not prove a universal statement.',
      sol: r`Checking finitely many cases never proves a statement about all powers of 2. Here the conjecture is in fact false: $2^{32} + 1$ is divisible by $641$. You do not need to know that fact to see the reasoning is invalid.`,
      hints: ['How many powers of 2 are there?', 'Can finitely many checks prove an infinite claim?', 'Validity concerns the reasoning.'],
      mis: ['examples-prove'], tip: 'You can judge reasoning invalid without knowing a counterexample.' },

    { id: 'P424', lesson: 'L4-2', obj: 'L42a', spec: ['Prf2', 'Err2'], diff: 3, type: 'mcq',
      stem: r`You are given only that “if $a$ is even then $a^2$ is even” is true, and that $a^2$ is even. Using **only these two facts**, what can be validly concluded?`,
      options: [r`$a$ is even.`, r`$a$ is odd.`, r`Nothing about the parity of $a$ follows from these two facts alone.`, r`$a^2$ is a multiple of 4.`], answer: 2,
      notes: [r`This affirms the consequent. (It happens to be true, but it does not follow from these two facts alone.)`, r`Nothing supports this.`, r`Correct: the given implication only runs from “$a$ even” to “$a^2$ even”.`, r`That would need “a is even” first.`],
      key: 'Affirming the consequent is invalid even when the conclusion happens to be true.',
      sol: r`The facts have the form “if A then B” and “B”. Concluding A is affirming the consequent, which is invalid. (Using further knowledge, such as the contrapositive of “if $a$ is odd then $a^2$ is odd”, you could conclude $a$ is even; but that is an extra fact.)`,
      hints: ['What pattern would “a is even” use?', 'Is affirming the consequent valid?', 'The question restricts you to the two given facts.'],
      mis: ['affirm-consequent'], tip: 'A true conclusion does not make the reasoning valid.' },

    { id: 'P425', lesson: 'L4-2', obj: 'L42a', spec: ['Err2'], diff: 2, type: 'mcq',
      stem: r`For real numbers $x$, $y$, $z$, which one of the following inferences is valid?`,
      options: [r`$x^2 = y^2$, so $x = y$.`, r`$x^3 = y^3$, so $x = y$.`, r`$\sin x = \sin y$, so $x = y$.`, r`$xy = xz$, so $y = z$.`], answer: 1,
      notes: [r`$x = 1$, $y = -1$.`, r`Correct: cubing is strictly increasing, so it is one-to-one.`, r`$x = 0$, $y = 180^\circ$ (or $\pi$).`, r`Fails when $x = 0$: $0 \times 1 = 0 \times 2$.`],
      key: 'Only one-to-one operations can be “undone” this way.',
      sol: r`Cubing is strictly increasing, so different inputs give different outputs, and $x^3 = y^3$ forces $x = y$. The other inferences fail: squaring and sine are many-to-one, and cancelling $x$ needs $x \ne 0$.`,
      hints: ['Which functions can give the same output for different inputs?', r`What if $x = 0$ in the last option?`, 'Is cubing one-to-one?'],
      mis: ['many-to-one', 'divide-zero'], tip: 'Ask: is this operation one-to-one on the domain?' },

    { id: 'P426', lesson: 'L4-2', obj: 'L42b', spec: ['Err2', 'Prf2'], diff: 3, type: 'tfset', transfer: true,
      stem: r`Decide whether each argument is valid.`,
      labels: ['Valid', 'Invalid'],
      statements: [
        { s: r`If a triangle is equilateral, it is isosceles. Triangle T is not isosceles. So T is not equilateral.`, t: true, why: 'Contrapositive.' },
        { s: r`If $f'(a) = 0$ then $f$ has a stationary point at $a$. $f$ has a stationary point at $a$. So $f'(a) = 0$.`, t: false, why: 'Affirming the consequent. (The conclusion is true by the definition of a stationary point, but it does not follow from these premises by this reasoning.)' },
        { s: r`All primes greater than 2 are odd. 91 is odd. So 91 is prime.`, t: false, why: r`Affirming the consequent; in fact $91 = 7 \times 13$.` },
        { s: r`Every multiple of 9 has digit sum a multiple of 9. The digit sum of $N$ is 20. So $N$ is not a multiple of 9.`, t: true, why: 'Contrapositive: 20 is not a multiple of 9.' }
      ],
      key: 'Judge the form of the reasoning, not whether you believe the conclusion.',
      sol: 'Arguments 1 and 4 are valid (contrapositive). Arguments 2 and 3 affirm the consequent, so they are invalid, even though the conclusion of argument 2 happens to be true.',
      hints: ['Write each as “if A then B” plus a known fact.', 'Which ones go from B to A?', 'Ignore whether the conclusion happens to be true.'],
      mis: ['affirm-consequent'], tip: 'Validity is about form: true conclusions can come from invalid arguments.' }
  );

  /* ------------------------------------------------------------------ L5-1 */
  TLL.lessons.push({
    id: 'L5-1', unit: 'U5', title: 'Direct proof', mins: 8, spec: ['Prf1'], prereq: ['L1-3'],
    objectives: [
      { id: 'L51a', text: 'Follow and construct a direct proof from definitions (even, odd, multiple).' },
      { id: 'L51b', text: 'Identify what a direct proof must assume at the start and establish at the end.' }
    ],
    purpose: 'Prf1 requires you to follow and construct simple proofs; Paper 2 often asks which line completes or justifies a proof.',
    refs: ['spec2026', 'sweller2019', 'renkl2003'],
    steps: [
      { k: 'predict', stem: r`To prove “the sum of two odd numbers is even”, what should the first line be?`,
        options: [r`Let the odd numbers be $2a + 1$ and $2b + 1$ for integers $a$ and $b$.`, r`Let the odd numbers be $2a + 1$ and $2a + 3$.`, r`For example, $3 + 5 = 8$.`], answer: 0,
        notes: [r`Correct: two independent letters keep the numbers general.`, r`This only covers consecutive odd numbers.`, r`An example is not a proof.`] },
      { k: 'idea', title: 'Assume, use definitions, reach the goal', body: r`A direct proof of “if A then B” has the shape:

**Assume A** → translate A using definitions → algebra → **show B** (in the form its definition requires).

Definitions you will use constantly (with $k$ an integer):

- even: $n = 2k$; odd: $n = 2k + 1$;
- multiple of $m$: $n = mk$;
- rational: $\dfrac{p}{q}$ with integers $p$, $q$ and $q \ne 0$.

Use **different letters** for different numbers, otherwise you prove a special case only.` },
      { k: 'worked', id: 'W24' },
      { k: 'worked', id: 'W25' },
      { k: 'guided', title: 'Your turn, with support', problem: r`Prove that if $n$ is odd then $n^2$ is odd.`,
        parts: [
          { show: r`Let $n = 2k + 1$ for some integer $k$.` },
          { ask: { stem: r`Which expression for $n^2$ shows it is odd?`, options: [r`$n^2 = 2(2k^2 + 2k) + 1$`, r`$n^2 = 4k^2 + 1$`, r`$n^2 = 2k^2 + 1$`], answer: 0,
            notes: [r`Correct: $(2k+1)^2 = 4k^2 + 4k + 1$, which is $2 \times$ (integer) $+ 1$.`, r`The middle term $4k$ has been lost.`, r`$(2k + 1)^2$ is not $2k^2 + 1$.`] } },
          { show: r`Since $2k^2 + 2k$ is an integer, $n^2$ has the form $2m + 1$, so it is odd.` }
        ] },
      { k: 'practice', ids: ['P511', 'P514'] },
      { k: 'check' },
      { k: 'summary', body: r`Direct proof: assume the condition, translate with definitions, manipulate, and finish in the exact form of the conclusion.` }
    ]
  });

  TLL.worked.push(
    { id: 'W24', lesson: 'L5-1', title: 'Sum of two odd numbers',
      problem: r`Prove that the sum of any two odd integers is even.`,
      steps: [
        { do: r`Let the integers be $2a + 1$ and $2b + 1$, where $a$ and $b$ are integers.`, why: 'Different letters keep the two numbers independent.' },
        { do: r`Their sum is $2a + 2b + 2 = 2(a + b + 1)$.`, why: 'Factor out 2 to match the definition of even.' },
        { do: r`Since $a + b + 1$ is an integer, the sum is even.`, why: 'State why the bracket is an integer.' }
      ],
      takeaway: r`Finish by matching the definition exactly: $2 \times (\text{an integer})$.` },
    { id: 'W25', lesson: 'L5-1', title: 'A quadratic that is always positive',
      problem: r`Prove that $x^2 - 6x + 10 > 0$ for all real $x$.`,
      steps: [
        { do: r`Complete the square: $x^2 - 6x + 10 = (x - 3)^2 + 1$.`, why: 'Reveals the minimum value.' },
        { do: r`For every real $x$, $(x - 3)^2 \ge 0$.`, why: 'A real square is never negative.' },
        { do: r`So $x^2 - 6x + 10 \ge 1 > 0$ for all real $x$.`, why: '' }
      ],
      takeaway: 'Completing the square is the standard direct proof that a quadratic is always positive.' }
  );

  TLL.questions.push(
    { id: 'P511', lesson: 'L5-1', obj: 'L51b', spec: ['Prf1'], diff: 1, type: 'mcq',
      stem: r`To prove directly that “if $n$ is odd then $n^2$ is odd”, the best first line is:`,
      options: [r`Let $n = 2k + 1$ for some integer $k$.`, r`Let $n^2 = 2k + 1$ for some integer $k$.`, r`Suppose $n$ is even.`, r`Let $n = 3$.`], answer: 0,
      notes: [r`Correct: a direct proof starts from the condition.`, r`This assumes the conclusion.`, r`That would begin a contrapositive or contradiction argument, not a direct proof of this statement.`, r`A single example is not a proof.`],
      key: 'Direct proof: start from the condition.',
      sol: r`The condition is “$n$ is odd”, so start with $n = 2k + 1$, then show $n^2 = 2(2k^2 + 2k) + 1$.`,
      hints: ['What does a direct proof assume?', r`Translate “$n$ is odd” using a definition.`, 'Do not assume the conclusion.'],
      mis: ['examples-prove'], tip: 'First line of a direct proof = the condition, written with a definition.' },

    { id: 'P512', lesson: 'L5-1', obj: 'L51a', spec: ['Prf1'], diff: 2, type: 'mcq',
      stem: r`A proof that the product of two odd integers is odd begins: “Let $m = 2a + 1$ and $n = 2b + 1$ for integers $a$ and $b$. Then $mn = \ldots$” Which continuation completes the proof correctly?`,
      options: [r`$4ab + 2a + 2b + 1 = 2(2ab + a + b) + 1$, which is odd since $2ab + a + b$ is an integer.`, r`$4ab + 1$, which is odd.`, r`$(2a + 1)^2$, which is odd.`, r`$4ab + 2a + 2b + 1$, which is odd because $4ab$ is even.`], answer: 0,
      notes: [r`Correct.`, r`The cross terms $2a$ and $2b$ are missing.`, r`This assumes $m = n$.`, r`The expansion is right, but the justification is incomplete: it needs the form $2 \times$ integer $+ 1$.`],
      key: r`Write the result as $2 \times (\text{integer}) + 1$.`,
      sol: r`$mn = (2a+1)(2b+1) = 4ab + 2a + 2b + 1 = 2(2ab + a + b) + 1$. Since $2ab + a + b$ is an integer, $mn$ is odd.`,
      hints: ['Expand carefully: four terms.', 'Factor 2 out of the even terms.', 'What form shows a number is odd?'],
      mis: ['calc-slip'], tip: 'A proof is complete only when the final form matches the definition.' },

    { id: 'P513', lesson: 'L5-1', obj: 'L51a', spec: ['Prf1'], diff: 3, type: 'mcq',
      stem: r`Which of the following is a valid proof that the product of any three consecutive integers is a multiple of 6?`,
      options: [r`$1 \times 2 \times 3 = 6$, $2 \times 3 \times 4 = 24$ and $3 \times 4 \times 5 = 60$ are all multiples of 6.`, r`Among any three consecutive integers at least one is even and exactly one is a multiple of 3. So the product is divisible by 2 and by 3, and hence by 6, since 2 and 3 have no common factor other than 1.`, r`$n(n+1)(n+2) = n^3 + 3n^2 + 2n$, and the coefficients $1 + 3 + 2 = 6$.`, r`The product is even, so it is a multiple of 6.`], answer: 1,
      notes: [r`Examples are not a proof.`, r`Correct.`, r`The sum of coefficients does not determine divisibility in general.`, r`Even numbers need not be multiples of 6 (for example 4).`],
      key: 'Divisible by 2 and by 3, with 2 and 3 coprime, gives divisible by 6.',
      sol: 'Every block of three consecutive integers contains a multiple of 3 and at least one even number. So the product is divisible by 2 and by 3. Since 2 and 3 share no factor other than 1, the product is divisible by 6.',
      hints: ['Which options are proofs at all, rather than examples?', 'Why is the product divisible by 2? By 3?', 'Why does 2 and 3 give 6?'],
      mis: ['examples-prove'], tip: 'For “multiple of 6”, prove “multiple of 2” and “multiple of 3”.' },

    { id: 'P514', lesson: 'L5-1', obj: 'L51a', spec: ['Prf1'], diff: 2, type: 'mcq',
      stem: r`Which line is the key step in a direct proof that $a^2 + b^2 \ge 2ab$ for all real $a$ and $b$?`,
      options: [r`$(a - b)^2 \ge 0$, and expanding gives $a^2 - 2ab + b^2 \ge 0$.`, r`Divide both sides by $ab$.`, r`Take $a = b = 1$: $2 \ge 2$.`, r`Square root both sides: $a + b \ge \sqrt{2ab}$.`], answer: 0,
      notes: [r`Correct: rearranging gives the result.`, r`Not valid when $ab = 0$, and dividing by a negative reverses the inequality.`, r`An example is not a proof.`, r`$\sqrt{a^2 + b^2} \ne a + b$, and square roots of negative quantities are undefined.`],
      key: 'Start from a square being non-negative.',
      sol: r`$(a - b)^2 \ge 0$ for all real $a$, $b$. Expanding gives $a^2 - 2ab + b^2 \ge 0$, so $a^2 + b^2 \ge 2ab$.`,
      hints: ['Move everything to one side.', 'Does the expression look like a square?', r`What do you know about $(a - b)^2$?`],
      mis: ['divide-zero', 'inequality-sign', 'examples-prove'], tip: r`Inequalities involving squares often start from $(\text{something})^2 \ge 0$.` },

    { id: 'P515', lesson: 'L5-1', obj: 'L51a', spec: ['Prf1'], diff: 2, type: 'mcq',
      stem: r`Which of the following correctly proves that if $x > 1$ then $x^3 > x$?`,
      options: [r`$x^3 - x = x(x - 1)(x + 1)$, and for $x > 1$ each factor is positive, so $x^3 - x > 0$.`, r`Divide both sides of $x^3 > x$ by $x$ to get $x^2 > 1$, which is true.`, r`$2^3 = 8 > 2$, so it is true.`, r`Since $x > 1$, $x^3 > 1$, so $x^3 > x$.`], answer: 0,
      notes: [r`Correct.`, r`This starts from the conclusion; it shows what would follow if the result were true, not that it is true.`, r`One example is not a proof.`, r`$x^3 > 1$ does not imply $x^3 > x$ (compare $x^3$ and $x$ directly).`],
      key: 'Factorise the difference and check the sign of each factor.',
      sol: r`$x^3 - x = x(x - 1)(x + 1)$. If $x > 1$ then $x > 0$, $x - 1 > 0$ and $x + 1 > 0$, so the product is positive and $x^3 > x$.`,
      hints: [r`Compare with zero: consider $x^{3} - x$.`, 'Factorise completely.', r`Check the sign of each factor when $x > 1$.`],
      mis: ['examples-prove'], tip: 'Do not start a proof from the statement you are proving.' },

    { id: 'P516', lesson: 'L5-1', obj: 'L51b', spec: ['Prf1', 'Err1'], diff: 3, type: 'mcq',
      stem: r`A student wants to prove: “If $n$ is a multiple of 4, then $n^2$ is a multiple of 16.” They write:

“Let $n^2 = 16k$. Then $n = 4\sqrt{k}$, so $n$ is a multiple of 4.”

What is wrong?`,
      options: [r`Nothing is wrong.`, r`It proves the converse, starting from the conclusion; and $\sqrt{k}$ need not be an integer anyway.`, r`It should start with $n = 16k$.`, r`The statement is false, so no proof is possible.`], answer: 1,
      notes: [r`It assumes the conclusion and argues towards the condition.`, r`Correct. A correct proof: $n = 4k$ so $n^2 = 16k^2$.`, r`The condition is “multiple of 4”, so $n = 4k$.`, r`The statement is true: $(4k)^2 = 16k^2$.`],
      key: 'Check which direction the proof argues in.',
      sol: r`The student assumed the conclusion ($n^2$ is a multiple of 16) and deduced the condition, which addresses the converse. Also $\sqrt{k}$ need not be an integer. A correct proof: $n = 4k \Rightarrow n^2 = 16k^2$, a multiple of 16.`,
      hints: ['What does the student assume at the start?', 'Is that the condition or the conclusion?', r`Is $\sqrt{k}$ necessarily an integer?`],
      mis: ['converse'], tip: 'Check the first line: does it assume the condition or the conclusion?' }
  );

  /* ------------------------------------------------------------------ L5-2 */
  TLL.lessons.push({
    id: 'L5-2', unit: 'U5', title: 'Proof by cases', mins: 8, spec: ['Prf1'], prereq: ['L5-1'],
    objectives: [
      { id: 'L52a', text: 'Split a proof into exhaustive cases (parity, sign, remainders).' },
      { id: 'L52b', text: 'Check that the cases cover every possibility and spot an omitted case.' }
    ],
    purpose: 'Cases are the standard tool for remainders, modulus and sign questions, and “omitted case” is a classic error in purported proofs.',
    refs: ['spec2026'],
    steps: [
      { k: 'predict', stem: r`A proof about all integers $n$ considers the cases $n = 3k$ and $n = 3k + 1$. Is that enough?`,
        options: [r`Yes`, r`No`], answer: 1,
        notes: [r`Numbers such as $2, 5, 8$ have the form $3k + 2$.`, r`Correct: the case $n = 3k + 2$ is missing.`] },
      { k: 'idea', title: 'Exhaustive cases', body: r`A proof by cases splits the situation into cases that together cover **everything**, proves the result in each, and concludes it always holds.

Standard splits:

- parity: $n = 2k$ or $n = 2k + 1$;
- remainders on division by $m$: $n = mk, mk + 1, \ldots, mk + (m - 1)$;
- sign: $x < 0$, $x = 0$, $x > 0$ (do not forget zero);
- modulus: split where the expression inside changes sign.

Cases may overlap, but they must not leave a gap.` },
      { k: 'worked', id: 'W26' },
      { k: 'worked', id: 'W27' },
      { k: 'guided', title: 'Your turn, with support', problem: r`Prove that $\max(a, b) + \min(a, b) = a + b$ for real $a$, $b$.`,
        parts: [
          { ask: { stem: r`Which cases should you use?`, options: [r`$a \ge b$ and $a < b$`, r`$a > 0$ and $a < 0$`, r`$a = b$ only`], answer: 0,
            notes: [r`Correct: these cover every pair and decide the max and min.`, r`These miss $a = 0$ and do not decide the max.`, r`Not exhaustive.`] } },
          { show: r`If $a \ge b$: $\max = a$, $\min = b$, sum $a + b$. If $a < b$: $\max = b$, $\min = a$, sum $b + a$. Both cases give $a + b$.` }
        ] },
      { k: 'practice', ids: ['P521', 'P522'] },
      { k: 'check' },
      { k: 'summary', body: r`Choose cases that cover everything, prove each, and check for forgotten cases such as zero or a remainder.` }
    ]
  });

  TLL.worked.push(
    { id: 'W26', lesson: 'L5-2', title: r`$n^{2} + n$ is always even`,
      problem: r`Prove that $n^2 + n$ is even for every integer $n$.`,
      steps: [
        { do: r`Case 1: $n = 2k$. Then $n^2 + n = 4k^2 + 2k = 2(2k^2 + k)$, even.`, why: '' },
        { do: r`Case 2: $n = 2k + 1$. Then $n^2 + n = 4k^2 + 4k + 1 + 2k + 1 = 2(2k^2 + 3k + 1)$, even.`, why: '' },
        { do: r`Every integer is even or odd, so $n^2 + n$ is always even.`, why: 'State why the cases are exhaustive.' },
        { do: r`(Alternative: $n^2 + n = n(n + 1)$, a product of consecutive integers, one of which is even.)`, why: 'Seeing a slicker route saves time in the exam.' }
      ],
      takeaway: 'Parity cases always work for “is it even?” questions; factorising may be quicker.' },
    { id: 'W27', lesson: 'L5-2', title: 'A modulus inequality by cases',
      problem: r`Prove that $|x| + |x - 2| \ge 2$ for all real $x$.`,
      steps: [
        { do: r`Split where the moduli change: $x < 0$, $0 \le x \le 2$, $x > 2$.`, why: 'Each modulus can then be removed.' },
        { do: r`$x < 0$: $-x + (2 - x) = 2 - 2x > 2$.`, why: 'Both expressions inside are negative.' },
        { do: r`$0 \le x \le 2$: $x + (2 - x) = 2$.`, why: '' },
        { do: r`$x > 2$: $x + (x - 2) = 2x - 2 > 2$.`, why: '' },
        { do: r`In every case the sum is at least 2.`, why: 'The three cases cover all real numbers.' }
      ],
      takeaway: 'Split at the points where expressions inside moduli change sign.' }
  );

  TLL.questions.push(
    { id: 'P521', lesson: 'L5-2', obj: 'L52b', spec: ['Prf1', 'Err1'], diff: 1, type: 'mcq',
      stem: r`A proof that $n^3 - n$ is divisible by 3 for every integer $n$ considers only the cases $n = 3k$ and $n = 3k + 1$. What is wrong with it?`,
      options: [r`Nothing: two cases are enough.`, r`It omits the case $n = 3k + 2$.`, r`It should use the cases $n$ even and $n$ odd.`, r`Proof by cases cannot be used for divisibility.`], answer: 1,
      notes: [r`Integers such as 2 and 5 are not covered.`, r`Correct: remainders 0, 1 and 2 must all be considered.`, r`Parity does not help with divisibility by 3.`, r`Remainder cases are ideal for divisibility.`],
      key: 'Division by 3 leaves remainder 0, 1 or 2: three cases.',
      sol: r`Every integer is $3k$, $3k + 1$ or $3k + 2$. Omitting $3k + 2$ leaves a gap. (In that case $n^3 - n = n(n-1)(n+1)$ and $n + 1 = 3k + 3$ is a multiple of 3, so the result still holds, but the proof must say so.)`,
      hints: ['What remainders are possible on division by 3?', 'Which remainder is missing?', 'Is 5 covered?'],
      mis: ['missing-case'], tip: r`Dividing by $m$ gives $m$ remainder cases.` },

    { id: 'P522', lesson: 'L5-2', obj: 'L52a', spec: ['Prf1'], diff: 2, type: 'mcq',
      stem: r`In a proof that $n^2$ leaves remainder 0 or 1 when divided by 4, the odd case begins “Let $n = 2k + 1$.” Which line correctly finishes this case?`,
      options: [r`$n^2 = 4k^2 + 4k + 1 = 4(k^2 + k) + 1$, so the remainder is 1.`, r`$n^2 = 4k^2 + 1$, so the remainder is 1.`, r`$n^2 = 2k^2 + 1$, so the remainder is 1.`, r`$n^2 = 4k + 1$, so the remainder is 1.`], answer: 0,
      notes: [r`Correct.`, r`The term $4k$ is missing (although the conclusion would survive, the algebra is wrong).`, r`Incorrect expansion.`, r`Incorrect expansion.`],
      key: r`$(2k+1)^2 = 4(k^2 + k) + 1$.`,
      sol: r`$(2k + 1)^2 = 4k^2 + 4k + 1 = 4(k^2 + k) + 1$, which leaves remainder 1 on division by 4. (The even case gives $4k^2$, remainder 0.)`,
      hints: [r`Expand $(2k + 1)^{2}$ carefully.`, 'Factor out 4 from as much as possible.', 'What is left over?'],
      mis: ['calc-slip'], tip: r`Write the result as $4 \times (\text{integer}) + \text{remainder}$.` },

    { id: 'P523', lesson: 'L5-2', obj: 'L52b', spec: ['Prf1', 'Err1'], diff: 2, type: 'mcq',
      stem: r`A student claims to prove that $|x - 3| < 5$ implies $-2 < x < 8$, writing: “Case $x \ge 3$: then $|x - 3| = x - 3 < 5$, so $x < 8$. Hence $-2 < x < 8$.” What is missing?`,
      options: [r`Nothing.`, r`The case $x < 3$, where $|x - 3| = 3 - x < 5$ gives $x > -2$.`, r`The case $x = 3$.`, r`A check that $x = 8$ fails.`], answer: 1,
      notes: [r`The lower bound $-2$ has not been justified.`, r`Correct: the second case gives the lower bound.`, r`$x = 3$ is already in the case $x \ge 3$.`, r`That is not where the gap is.`],
      key: 'Each case of the modulus gives one bound.',
      sol: r`The student only treated $x \ge 3$, which gives $x < 8$ (and $x \ge 3 > -2$). The case $x < 3$ is missing: then $|x - 3| = 3 - x < 5$, so $x > -2$. Together these give $-2 < x < 8$.`,
      hints: [r`Which values of $x$ does the proof cover?`, r`Where did $-2$ come from?`, r`Consider $x < 3$.`],
      mis: ['missing-case'], tip: 'A modulus proof needs both signs of the inside expression.' },

    { id: 'P524', lesson: 'L5-2', obj: 'L52a', spec: ['Prf1'], diff: 2, type: 'mcq', pre: ['R1'],
      stem: r`Which one of the following is true for every integer $n$?`,
      options: [r`$n^2$ leaves remainder 0 or 1 when divided by 3.`, r`$n^2$ leaves remainder 0 or 1 when divided by 5.`, r`$n^3$ leaves remainder 0 or 1 when divided by 4.`, r`$n^2$ leaves remainder 0 or 1 when divided by 8.`], answer: 0,
      notes: [r`Correct: $(3k)^2$, $(3k \pm 1)^2$ leave remainders 0, 1, 1.`, r`$n = 2$: $4$ leaves remainder 4.`, r`$n = 3$: $27 = 24 + 3$, remainder 3.`, r`$n = 2$: $4$ leaves remainder 4.`],
      key: 'Check every remainder case for the true one; one small counterexample kills each other option.',
      sol: r`For division by 3: $(3k)^2 = 9k^2$, $(3k + 1)^2 = 3(3k^2 + 2k) + 1$, $(3k + 2)^2 = 3(3k^2 + 4k + 1) + 1$, giving remainders 0, 1, 1. The others fail at $n = 2$, $n = 3$ and $n = 2$ respectively.`,
      hints: [r`Try $n = 2$ and $n = 3$ in each option.`, 'For the surviving option, consider all remainder cases.', 'Squares of 0, 1, 2 modulo 3.'],
      mis: ['examples-prove', 'calc-slip'], tip: 'Small values eliminate fast; a case argument confirms.' },

    { id: 'P525', lesson: 'L5-2', obj: 'L52a', spec: ['Prf1'], diff: 3, type: 'mcq', pre: ['R2'],
      stem: r`To prove that $x^2 - 4|x| + 4 \ge 0$ for all real $x$, which approach works?`,
      options: [r`Cases $x \ge 0$ and $x < 0$: the expression is $(x - 2)^2$ in the first case and $(x + 2)^2$ in the second, both $\ge 0$.`, r`Substitute $x = 0$, $1$, $2$ and $3$.`, r`Case $x \ge 0$ only, since $|x|$ is never negative.`, r`Divide by $|x|$ to obtain $|x| - 4 + \dfrac{4}{|x|} \ge 0$.`], answer: 0,
      notes: [r`Correct. (Alternatively, $x^2 = |x|^2$, so the expression is $(|x| - 2)^2$.)`, r`Examples are not a proof.`, r`Negative $x$ must be covered too: $|x|$ being non-negative does not make $x$ non-negative.`, r`Not valid at $x = 0$.`],
      key: r`Remove the modulus by cases, or note $x^2 = |x|^2$.`,
      sol: r`If $x \ge 0$, the expression is $x^2 - 4x + 4 = (x - 2)^2 \ge 0$. If $x < 0$, it is $x^2 + 4x + 4 = (x + 2)^2 \ge 0$. So it is non-negative for all real $x$.`,
      hints: ['How do you remove a modulus?', r`Consider the sign of $x$.`, 'Do the resulting quadratics factorise?'],
      mis: ['missing-case', 'divide-zero', 'examples-prove'], tip: r`Modulus → cases by sign (or use $|x|^{2} = x^{2}$).` },

    { id: 'P526', lesson: 'L5-2', obj: 'L52b', spec: ['Prf1'], diff: 2, type: 'tfset',
      stem: r`Each line describes the cases used in a proof. Decide whether the cases cover every possibility.`,
      labels: ['Covers everything', 'Leaves a gap'],
      statements: [
        { s: r`Real $x$: the cases $x < 0$ and $x > 0$.`, t: false, why: r`$x = 0$ is missing.` },
        { s: r`Integers $n$: the cases $n$ even and $n$ odd.`, t: true, why: 'Every integer is even or odd.' },
        { s: r`Integers $n$: the cases $n = 4k$, $4k + 1$ and $4k + 3$.`, t: false, why: r`$n = 4k + 2$ (for example 2, 6) is missing.` },
        { s: r`Real $x$: the cases $x \le 1$ and $x \ge 1$.`, t: true, why: 'Overlap at 1 is harmless; nothing is missed.' }
      ],
      key: 'Look for a missing boundary value or remainder.',
      sol: 'Lines 2 and 4 cover everything; lines 1 and 3 leave gaps.',
      hints: ['Check boundary values such as 0 and 1.', r`For remainders, list 0 to $m - 1$.`, 'Overlapping cases are fine.'],
      mis: ['missing-case'], tip: 'Overlap is fine; gaps are fatal.' }
  );

  /* ------------------------------------------------------------------ L5-3 */
  TLL.lessons.push({
    id: 'L5-3', unit: 'U5', title: 'Proof by contradiction', mins: 8, spec: ['Prf1', 'Arg4'], prereq: ['L3-3', 'L5-1'],
    objectives: [
      { id: 'L53a', text: 'Begin a proof by contradiction by assuming the exact negation of the claim.' },
      { id: 'L53b', text: 'Recognise the contradiction reached and state what it proves.' }
    ],
    purpose: 'Contradiction is the natural method for irrationality, “no largest” and “no solutions” claims, and its first line depends on correct negation.',
    refs: ['spec2026', 'notesLogic'],
    steps: [
      { k: 'predict', stem: r`To prove “there is no largest even number” by contradiction, you first assume:`,
        options: [r`there is a largest even number`, r`every even number is small`, r`there is a largest odd number`], answer: 0,
        notes: [r`Correct: assume the negation of the claim.`, r`Not the negation.`, r`Unrelated.`] },
      { k: 'idea', title: 'Assume the negation, reach an impossibility', body: r`1. **Assume the negation** of what you want to prove (use the rules from Unit 3).
2. Reason validly from that assumption.
3. Reach something impossible: a statement and its negation, or a clear falsehood such as “an even number equals an odd number”.
4. Conclude the assumption was false, so the original claim is **true**.

Negations you will need:

- “$x$ is irrational” → assume $x = \dfrac{p}{q}$, integers, $q \ne 0$, in lowest terms;
- “there is no …” → assume there is one;
- “if A then B” → assume A **and** not B.` },
      { k: 'worked', id: 'W28' },
      { k: 'worked', id: 'W29' },
      { k: 'guided', title: 'Your turn, with support', problem: r`Prove there are no integers $m$, $n$ with $6m + 9n = 100$.`,
        parts: [
          { show: r`Assume there are integers $m$, $n$ with $6m + 9n = 100$.` },
          { ask: { stem: r`Where is the contradiction?`, options: [r`$6m + 9n = 3(2m + 3n)$ is a multiple of 3, but 100 is not.`, r`$6m + 9n$ is even, but 100 is odd.`, r`$m$ and $n$ must be negative.`], answer: 0,
            notes: [r`Correct.`, r`$9n$ can be odd and 100 is even.`, r`Nothing forces this.`] } },
          { show: r`So the assumption is false: no such integers exist.` }
        ] },
      { k: 'practice', ids: ['P532', 'P535'] },
      { k: 'check' },
      { k: 'summary', body: r`Assume the exact negation, reason validly, reach an impossibility, conclude the claim.` }
    ]
  });

  TLL.worked.push(
    { id: 'W28', lesson: 'L5-3', title: 'The square root of 2 is irrational',
      problem: r`Prove that $\sqrt{2}$ is irrational.`,
      steps: [
        { do: r`Assume $\sqrt{2} = \dfrac{p}{q}$ with integers $p$, $q$, $q \ne 0$, and the fraction in lowest terms.`, why: 'Negation of “irrational”. Lowest terms will give the contradiction.' },
        { do: r`Then $p^2 = 2q^2$, so $p^2$ is even, so $p$ is even. Write $p = 2r$.`, why: r`If $p$ were odd, $p^{2}$ would be odd.` },
        { do: r`Then $4r^2 = 2q^2$, so $q^2 = 2r^2$; hence $q^2$ is even and $q$ is even.`, why: r`Same reasoning applied to $q$.` },
        { do: r`Both $p$ and $q$ are even, contradicting lowest terms. So $\sqrt{2}$ is irrational.`, why: '' }
      ],
      takeaway: 'Irrationality proofs: assume a fraction in lowest terms and find a common factor.' },
    { id: 'W29', lesson: 'L5-3', title: 'There are infinitely many primes',
      problem: r`Prove that there are infinitely many prime numbers.`,
      steps: [
        { do: r`Assume there are finitely many primes: $p_1, p_2, \ldots, p_k$.`, why: 'Negation of “infinitely many”.' },
        { do: r`Let $N = p_1 p_2 \cdots p_k + 1$. Dividing $N$ by any $p_i$ leaves remainder 1.`, why: 'N is built to avoid every listed prime.' },
        { do: r`$N > 1$, so $N$ has a prime factor. That factor cannot be any $p_i$.`, why: 'Every integer greater than 1 has a prime factor.' },
        { do: r`This contradicts the list containing every prime. So there are infinitely many primes.`, why: '' }
      ],
      takeaway: 'Note that N itself need not be prime; it only needs a prime factor not on the list.' }
  );

  TLL.questions.push(
    { id: 'P531', lesson: 'L5-3', obj: 'L53a', spec: ['Prf1', 'Arg4'], diff: 1, type: 'mcq',
      stem: r`To prove “there is no largest prime number” by contradiction, you should begin by assuming:`,
      options: [r`there is a largest prime number`, r`there is no largest prime number`, r`every prime number is odd`, r`there are infinitely many primes`], answer: 0,
      notes: [r`Correct: assume the negation of the claim.`, r`That is the claim itself.`, r`Not the negation (and false).`, r`That is (equivalent to) what you are proving.`],
      key: 'Contradiction starts from the negation of the claim.',
      sol: '“There is no largest prime” negates to “there is a largest prime”. Assume that, and derive a contradiction.',
      hints: ['What is the negation of the claim?', 'Do not assume the claim itself.', '“There is no X” negates to “there is an X”.'],
      mis: ['contradiction-setup'], tip: 'Write the negation explicitly before starting.' },

    { id: 'P532', lesson: 'L5-3', obj: 'L53a', spec: ['Prf1', 'Arg4'], diff: 2, type: 'mcq',
      stem: r`To prove “if $n^2$ is even then $n$ is even” (for integers $n$) by contradiction, you should assume:`,
      options: [r`$n^2$ is even and $n$ is odd`, r`$n^2$ is odd and $n$ is even`, r`if $n^2$ is even then $n$ is odd`, r`$n^2$ is odd`], answer: 0,
      notes: [r`Correct: the negation of “if A then B” is “A and not B”.`, r`Not the negation.`, r`The negation of an implication is not an implication.`, r`Not the negation.`],
      key: 'not (if A then B) = A and not B.',
      sol: r`Assume $n^2$ is even and $n$ is odd. Then $n = 2k + 1$ gives $n^2 = 2(2k^2 + 2k) + 1$, odd, contradicting $n^2$ even.`,
      hints: ['Negate the implication.', 'not (if A then B) = ?', 'The assumption should contain an “and”.'],
      mis: ['contradiction-setup', 'implication-negation'], tip: 'Contradiction for an implication: assume the condition and deny the conclusion.' },

    { id: 'P533', lesson: 'L5-3', obj: 'L53b', spec: ['Prf1'], diff: 3, type: 'mcq',
      stem: r`A proof that $\sqrt{3}$ is irrational begins: “Suppose $\sqrt{3} = \dfrac{p}{q}$ where $p$ and $q$ are positive integers with no common factor. Then $p^2 = 3q^2$.” Which continuation is correct?`,
      options: [r`So 3 divides $p^2$, hence 3 divides $p$. Write $p = 3r$; then $q^2 = 3r^2$, so 3 divides $q$. This contradicts “no common factor”.`, r`So $p^2$ is odd, hence $p$ is odd, which is a contradiction.`, r`So $p = 3$ and $q = 1$, but $3 \ne \sqrt{3}$.`, r`So $p^2$ is even, hence $p$ is even, and $q$ is even too.`], answer: 0,
      notes: [r`Correct: since 3 is prime, 3 dividing $p^2$ forces 3 to divide $p$.`, r`Nothing forces $p$ to be odd, and odd $p$ is no contradiction.`, r`$p^2 = 3q^2$ does not force $p = 3$.`, r`Nothing forces $p^2$ to be even.`],
      key: r`Use divisibility by 3 (a prime) as in the $\sqrt{2}$ proof.`,
      sol: r`From $p^2 = 3q^2$, 3 divides $p^2$; as 3 is prime, 3 divides $p$. With $p = 3r$: $9r^2 = 3q^2$, so $q^2 = 3r^2$ and 3 divides $q$. Then $p$ and $q$ share the factor 3, contradicting the assumption.`,
      hints: [r`Mirror the $\sqrt{2}$ proof, replacing 2 with 3.`, r`What divides $p^{2}$?`, r`Why does $3 \mid p^2$ give $3 \mid p$?`],
      mis: ['calc-slip'], tip: r`The $\sqrt{2}$ template adapts to $\sqrt{p}$ for any prime $p$.` },

    { id: 'P534', lesson: 'L5-3', obj: 'L53b', spec: ['Prf1'], diff: 2, type: 'mcq',
      stem: r`To show there are no integers $m$ and $n$ with $6m + 9n = 100$, a proof by contradiction assumes such integers exist. Which observation gives the contradiction?`,
      options: [r`The left-hand side is a multiple of 3 but 100 is not.`, r`The left-hand side is even but 100 is odd.`, r`$m$ must be negative.`, r`$6m + 9n$ is always greater than 100.`], answer: 0,
      notes: [r`Correct: $6m + 9n = 3(2m + 3n)$.`, r`100 is even, and $9n$ can be odd.`, r`Not forced and not a contradiction.`, r`False: $m = n = 0$ gives 0.`],
      key: 'Factor out the common factor of the coefficients.',
      sol: r`$6m + 9n = 3(2m + 3n)$ is a multiple of 3, while $100 = 3 \times 33 + 1$ is not. Contradiction.`,
      hints: ['What do 6 and 9 have in common?', 'Is 100 divisible by 3?', 'Factorise the left-hand side.'],
      mis: ['calc-slip'], tip: 'A common factor of the coefficients must divide the right-hand side.' },

    { id: 'P535', lesson: 'L5-3', obj: 'L53b', spec: ['Prf1'], diff: 3, type: 'mcq', pre: ['R6'],
      stem: r`A proof that $\log_2 3$ is irrational assumes $\log_2 3 = \dfrac{p}{q}$ with positive integers $p$ and $q$, and deduces $2^p = 3^q$. Why is this a contradiction?`,
      options: [r`$2^p$ is even and $3^q$ is odd.`, r`$2^p < 3^q$ for all positive integers.`, r`$p$ must equal $q$.`, r`$\log_2 3$ is negative.`], answer: 0,
      notes: [r`Correct: an even number cannot equal an odd number.`, r`False: $2^2 = 4 > 3^1$.`, r`Not forced, and $2^p = 3^p$ is impossible anyway.`, r`$\log_2 3 > 0$ because $3 > 1$.`],
      key: r`Parity: a positive power of 2 is even; any power of 3 is odd.`,
      sol: r`From $2^{p/q} = 3$, raising to the power $q$ gives $2^p = 3^q$. For $p \ge 1$ the left side is even and the right side is odd, which is impossible.`,
      hints: [r`Raise $2^{p/q} = 3$ to the power $q$.`, 'Compare the parity of both sides.', r`Why must $p$ be at least 1?`],
      mis: ['calc-slip'], tip: 'Parity is a quick source of contradictions.' },

    { id: 'P536', lesson: 'L5-3', obj: 'L53b', spec: ['Prf1', 'Err1'], diff: 3, type: 'mcq',
      stem: r`A student tries to prove a statement S by assuming S is true and then deriving the true statement $1 = 1$. What has been shown?`,
      options: [r`S is true.`, r`S is false.`, r`Nothing about the truth of S.`, r`The negation of S is true.`], answer: 2,
      notes: [r`Deriving something true from S says nothing about S; false statements can imply true ones.`, r`No contradiction was reached.`, r`Correct.`, r`No contradiction was reached.`],
      key: 'A contradiction proof must assume not S and reach something false.',
      sol: r`False statements can imply true ones (for example, from $1 = -1$, squaring gives $1 = 1$). So deriving a truth from S proves nothing. A contradiction proof must assume **not S** and derive something **false**.`,
      hints: ['What does a proof by contradiction assume?', 'Can a false statement lead to a true one?', r`Try squaring $1 = -1$.`],
      mis: ['contradiction-setup', 'irreversible'], tip: 'Reaching a true statement is not a contradiction.' }
  );

  /* ------------------------------------------------------------------ L5-4 */
  TLL.lessons.push({
    id: 'L5-4', unit: 'U5', title: 'Counterexamples', mins: 8, spec: ['Prf1', 'Arg3'], prereq: ['L1-3', 'L3-1'],
    objectives: [
      { id: 'L54a', text: 'Construct or select a counterexample: a case satisfying the condition and failing the conclusion.' },
      { id: 'L54b', text: 'Choose strategic test values and recognise when no counterexample exists.' }
    ],
    purpose: 'A well-chosen counterexample is often the fastest route through a Paper 2 question.',
    refs: ['spec2026', 'notesLogic'],
    steps: [
      { k: 'predict', stem: r`Claim: “for all real $x$, $x^2 \ge x$.” Which value is the quickest counterexample to try?`,
        options: [r`$x = 10$`, r`$x = \tfrac{1}{2}$`, r`$x = -5$`], answer: 1,
        notes: [r`$100 \ge 10$: no use.`, r`Correct: $\tfrac{1}{4} < \tfrac{1}{2}$. Numbers between 0 and 1 shrink when squared.`, r`$25 \ge -5$: no use.`] },
      { k: 'idea', title: 'Strategic values', body: r`A counterexample to “for all $x$, if A then B” is one $x$ with **A true and B false**.

Values that break careless claims:

- $0$ and $1$ (special for products and powers);
- **negative numbers** (squaring, inequalities, reciprocals);
- **fractions between 0 and 1** (powers make them smaller);
- **equal values** (strict inequalities);
- $2$ (the even prime), squares, and boundary values of a domain.

**When it fails:** if every sensible attempt fails, the claim may be true. Look for a reason (a proof) rather than testing forever. Testing can eliminate options; it cannot confirm a universal claim.` },
      { k: 'worked', id: 'W30' },
      { k: 'worked', id: 'W31' },
      { k: 'guided', title: 'Your turn, with support', problem: r`Find a counterexample to: “if $a$ and $b$ are irrational then $ab$ is irrational”.`,
        parts: [
          { ask: { stem: r`Which pair works?`, options: [r`$a = \sqrt{2}$, $b = \sqrt{2}$`, r`$a = \sqrt{2}$, $b = \sqrt{3}$`, r`$a = 2$, $b = \sqrt{2}$`], answer: 0,
            notes: [r`Correct: both irrational, and $ab = 2$ is rational.`, r`$\sqrt{6}$ is irrational, so the claim survives this pair.`, r`2 is rational, so the condition fails.`] } }
        ] },
      { k: 'practice', ids: ['P541', 'P543'] },
      { k: 'check' },
      { k: 'summary', body: r`A counterexample satisfies the condition and fails the conclusion. Try 0, 1, negatives, fractions and equal values first.` }
    ]
  });

  TLL.worked.push(
    { id: 'W30', lesson: 'L5-4', title: 'Reciprocals and order',
      problem: r`Disprove: “for all non-zero real $a$, $b$, if $a < b$ then $\dfrac{1}{a} > \dfrac{1}{b}$”.`,
      steps: [
        { do: r`The claim is true when $a$ and $b$ are both positive, so try opposite signs.`, why: 'Use what you know about where the rule works.' },
        { do: r`$a = -1$, $b = 1$: $a < b$, but $\dfrac{1}{a} = -1 < 1 = \dfrac{1}{b}$.`, why: 'Condition true, conclusion false.' },
        { do: r`So the claim is false.`, why: '' }
      ],
      takeaway: 'Reciprocals reverse order only when both numbers have the same sign.' },
    { id: 'W31', lesson: 'L5-4', title: 'A stationary point that is not a maximum or minimum',
      problem: r`Disprove: “if $f'(a) = 0$ then $f$ has a maximum or minimum at $x = a$”.`,
      steps: [
        { do: r`Try $f(x) = x^3$ at $a = 0$: $f'(x) = 3x^2$, so $f'(0) = 0$.`, why: 'A standard stationary point of inflexion.' },
        { do: r`But $f(x) < 0$ for $x < 0$ and $f(x) > 0$ for $x > 0$, so $0$ is neither a maximum nor a minimum.`, why: 'Check the conclusion fails.' },
        { do: r`So the claim is false.`, why: '' }
      ],
      takeaway: r`Keep a small stock of standard counterexample functions: $x^{3}, |x|, x^{2}, \sin  x$.` }
  );

  TLL.questions.push(
    { id: 'P541', lesson: 'L5-4', obj: 'L54a', spec: ['Prf1'], diff: 1, type: 'mcq',
      stem: r`Which value of $x$ is a counterexample to “if $x > 0$ then $\dfrac{1}{x} < x$”?`,
      options: [r`$x = 2$`, r`$x = \tfrac{1}{2}$`, r`$x = -1$`, r`$x = 3$`], answer: 1,
      notes: [r`$\tfrac{1}{2} < 2$: consistent with the claim.`, r`Correct: $\tfrac{1}{x} = 2 > \tfrac{1}{2}$.`, r`The condition $x > 0$ fails.`, r`$\tfrac{1}{3} < 3$.`],
      key: 'Numbers between 0 and 1 have reciprocals greater than themselves.',
      sol: r`$x = \tfrac{1}{2}$ satisfies $x > 0$, but $\tfrac{1}{x} = 2$, which is not less than $\tfrac{1}{2}$.`,
      hints: [r`The condition must hold: $x > 0$.`, r`Where is $\dfrac{1}{x}$ bigger than $x$?`, 'Try a fraction.'],
      mis: ['counterexample-form'], tip: 'Fractions between 0 and 1 break many “bigger than” claims.' },

    { id: 'P542', lesson: 'L5-4', obj: 'L54a', spec: ['Prf1'], diff: 2, type: 'mcq',
      stem: r`Which pair is a counterexample to: “if $a$ and $b$ are irrational, then $a + b$ is irrational”?`,
      options: [r`$a = \sqrt{2}$, $b = -\sqrt{2}$`, r`$a = \sqrt{2}$, $b = \sqrt{3}$`, r`$a = 2$, $b = \sqrt{2}$`, r`$a = \pi$, $b = \pi$`], answer: 0,
      notes: [r`Correct: both irrational, and $a + b = 0$ is rational.`, r`The sum $\sqrt{2} + \sqrt{3}$ is irrational, so this is not a counterexample.`, r`$a = 2$ is rational, so the condition fails.`, r`$2\pi$ is irrational.`],
      key: 'Choose irrationals that cancel.',
      sol: r`$\sqrt{2}$ and $-\sqrt{2}$ are both irrational, but their sum is $0$, which is rational.`,
      hints: ['Both numbers must be irrational.', 'How could the irrational parts disappear?', 'Think about cancellation.'],
      mis: ['counterexample-form'], tip: 'Irrational parts can cancel in sums and products.' },

    { id: 'P543', lesson: 'L5-4', obj: 'L54b', spec: ['Prf1'], diff: 2, type: 'mcq',
      stem: r`Claim: for real $x$, “if $x^2 < 4x$ then $x < 4$”. Which is correct?`,
      options: [r`$x = -1$ is a counterexample.`, r`$x = 5$ is a counterexample.`, r`$x = 2$ is a counterexample.`, r`There is no counterexample: the claim is true.`], answer: 3,
      notes: [r`$1 < -4$ is false, so the condition fails.`, r`$25 < 20$ is false, so the condition fails.`, r`$4 < 8$ and $2 < 4$: condition and conclusion both true.`, r`Correct: $x^2 < 4x \iff 0 < x < 4$.`],
      key: r`Solve the condition: $x(x - 4) < 0 \iff 0 < x < 4$.`,
      sol: r`$x^2 < 4x \iff x(x - 4) < 0 \iff 0 < x < 4$, and every such $x$ satisfies $x < 4$. The claim is true.`,
      hints: ['Solve the condition exactly.', 'Is every solution less than 4?', 'Check each proposed counterexample against the condition.'],
      mis: ['counterexample-form'], tip: 'Solving the condition can show no counterexample exists.' },

    { id: 'P544', lesson: 'L5-4', obj: 'L54a', spec: ['Prf1'], diff: 1, type: 'mcq',
      stem: r`Which value of $n$ shows that “$n^2 + n + 1$ is prime for every positive integer $n$” is false?`,
      options: [r`$n = 1$`, r`$n = 2$`, r`$n = 3$`, r`$n = 4$`, r`$n = 5$`, r`$n = 6$`], answer: 3,
      notes: [r`$3$ is prime.`, r`$7$ is prime.`, r`$13$ is prime.`, r`Correct: $21 = 3 \times 7$.`, r`$31$ is prime.`, r`$43$ is prime.`],
      key: 'Evaluate quickly and test for small factors.',
      sol: r`$n = 4$: $16 + 4 + 1 = 21 = 3 \times 7$, not prime.`,
      hints: ['Evaluate the expression for each option.', 'Check for divisibility by 3 and 7.', r`$n = 4$ gives 21.`],
      mis: ['calc-slip'], tip: 'Check divisibility by 3 via digit sums.' },

    { id: 'P545', lesson: 'L5-4', obj: 'L54a', spec: ['Prf1'], diff: 2, type: 'mcq', pre: ['R4'],
      stem: r`Which value of $k$ is a counterexample to: “For every real $k$, the equation $x^2 + kx + 1 = 0$ has two distinct real roots”?`,
      options: [r`$k = -3$`, r`$k = 3$`, r`$k = 1$`, r`$k = -5$`, r`$k = 2.5$`], answer: 2,
      notes: [r`Discriminant $9 - 4 = 5 > 0$: two roots.`, r`Discriminant $5 > 0$.`, r`Correct: discriminant $1 - 4 = -3 < 0$, no real roots.`, r`Discriminant $21 > 0$.`, r`Discriminant $6.25 - 4 = 2.25 > 0$.`],
      key: r`Two distinct real roots need $k^2 - 4 > 0$.`,
      sol: r`The discriminant is $k^2 - 4$. For $k = 1$ it is $-3 < 0$, so there are no real roots. Every other option gives a positive discriminant.`,
      hints: ['Use the discriminant.', r`For which $k$ is $k^2 - 4 \le 0$?`, 'Check each option.'],
      mis: ['calc-slip'], tip: r`For “every $k$” claims about roots, look at the discriminant as a function of $k$.` },

    { id: 'P546', lesson: 'L5-4', obj: 'L54b', spec: ['Prf1'], diff: 3, type: 'mcq', transfer: true,
      stem: r`Claim: “For any function $f$, if $f(2) > f(1)$ then $f$ is increasing on the interval $1 \le x \le 2$.” Which function is a counterexample?`,
      options: [r`$f(x) = x$`, r`$f(x) = x^2$`, r`$f(x) = \left(x - \tfrac{5}{4}\right)^2$`, r`$f(x) = 3 - x$`], answer: 2,
      notes: [r`Increasing everywhere, so not a counterexample.`, r`Increasing on $1 \le x \le 2$.`, r`Correct: $f(1) = \tfrac{1}{16} < f(2) = \tfrac{9}{16}$, but $f$ decreases on $1 \le x \le \tfrac{5}{4}$.`, r`$f(2) = 1 < 2 = f(1)$, so the condition fails.`],
      key: 'A function can rise overall while dipping first.',
      sol: r`For $f(x) = \left(x - \tfrac{5}{4}\right)^2$: $f(1) = \tfrac{1}{16}$, $f(2) = \tfrac{9}{16}$, so $f(2) > f(1)$. But the minimum is at $x = \tfrac{5}{4}$, so $f$ decreases on $1 \le x \le \tfrac{5}{4}$ and is not increasing on the whole interval.`,
      hints: ['The condition only compares the end points.', 'Look for a function that dips inside the interval.', 'Where is the minimum of each quadratic?'],
      mis: ['counterexample-form', 'examples-prove'], tip: 'Endpoint information says nothing about behaviour in between.' }
  );

  /* ------------------------------------------------------------------ L5-5 */
  TLL.lessons.push({
    id: 'L5-5', unit: 'U5', title: 'Conjectures from small cases', mins: 9, spec: ['Prf3'], prereq: ['L5-1', 'L4-2'],
    objectives: [
      { id: 'L55a', text: 'Generate small cases systematically and form a conjecture.' },
      { id: 'L55b', text: 'Justify a conjecture with a general argument, or refute it, knowing that small cases alone do not prove it.' }
    ],
    purpose: 'Prf3 asks you to make conjectures from small cases and justify them. Systematic small cases are also a strong exam tactic.',
    refs: ['spec2026'],
    steps: [
      { k: 'predict', stem: r`$1 = 1$, $1 + 3 = 4$, $1 + 3 + 5 = 9$, $1 + 3 + 5 + 7 = 16$. What is the sum of the first 10 odd numbers?`,
        options: [r`$100$`, r`$55$`, r`$110$`], answer: 0,
        notes: [r`Correct: the pattern suggests $n^2$.`, r`That is $1 + 2 + \cdots + 10$.`, r`That is $10 \times 11$.`] },
      { k: 'idea', title: 'Conjecture, then justify', body: r`1. **Generate** small cases in order, so patterns are visible.
2. **Conjecture** a general rule.
3. **Test** it on a fresh case, especially an awkward one.
4. **Justify** it with a general argument (algebra, a counting argument, or an explanation of why each step follows from the last).

A pattern in small cases is **evidence, not proof**. Some patterns break: the number of regions formed by joining $n$ points on a circle goes $1, 2, 4, 8, 16$ and then $31$.` },
      { k: 'worked', id: 'W32' },
      { k: 'worked', id: 'W33' },
      { k: 'practice', ids: ['P551', 'P554'] },
      { k: 'check' },
      { k: 'summary', body: r`Small cases suggest; general arguments prove. Test a conjecture on a fresh case before trusting it.` }
    ]
  });

  TLL.worked.push(
    { id: 'W32', lesson: 'L5-5', title: r`Sum of the first $n$ odd numbers`,
      problem: r`Conjecture and prove a formula for $1 + 3 + 5 + \cdots + (2n - 1)$.`,
      steps: [
        { do: r`Small cases: $1, 4, 9, 16$. Conjecture: the sum is $n^2$.`, why: '' },
        { do: r`It is an arithmetic series with $n$ terms, first term 1, last term $2n - 1$.`, why: 'Recognise a standard structure.' },
        { do: r`Sum $= \dfrac{n}{2}\bigl(1 + (2n - 1)\bigr) = \dfrac{n}{2} \times 2n = n^2$.`, why: 'Arithmetic series formula: number of terms multiplied by the average of the first and last terms.' }
      ],
      takeaway: 'Once the pattern is guessed, look for a standard tool that proves it.' },
    { id: 'W33', lesson: 'L5-5', title: 'Diagonals of a polygon',
      problem: r`How many diagonals does a convex polygon with $n$ sides have?`,
      steps: [
        { do: r`Small cases: triangle 0, quadrilateral 2, pentagon 5, hexagon 9.`, why: 'Draw and count.' },
        { do: r`Conjecture: $\dfrac{n(n - 3)}{2}$. Check: $n = 6$ gives $\dfrac{6 \times 3}{2} = 9$.`, why: '' },
        { do: r`Justify: each vertex joins by a diagonal to $n - 3$ others (not itself, not its two neighbours). That counts $n(n - 3)$ ends, and each diagonal has two ends.`, why: 'A counting argument explains why the formula holds.' }
      ],
      takeaway: 'Counting arguments (“each counted twice”) often justify conjectured formulas.' }
  );

  TLL.questions.push(
    { id: 'P551', lesson: 'L5-5', obj: 'L55a', spec: ['Prf3'], diff: 2, type: 'mcq',
      stem: r`The values of $n^3 - n$ for $n = 2, 3, 4, 5$ are $6, 24, 60, 120$. Which conjecture is supported by these values **and** true for all integers $n \ge 2$?`,
      options: [r`$n^3 - n$ is always a multiple of 6.`, r`$n^3 - n$ is always a multiple of 12.`, r`$n^3 - n$ is always a multiple of 24.`, r`$n^3 - n$ always ends in 0.`], answer: 0,
      notes: [r`Correct: $n^3 - n = (n - 1)n(n + 1)$, three consecutive integers.`, r`$6$ is not a multiple of 12.`, r`$6$ and $60$ are not multiples of 24.`, r`$6$ and $24$ do not end in 0.`],
      key: r`$n^3 - n = (n-1)n(n+1)$.`,
      sol: r`Only “multiple of 6” fits all four values. It is true for all $n$, since $(n-1)n(n+1)$ is a product of three consecutive integers, which is divisible by 2 and by 3.`,
      hints: ['First eliminate conjectures that the data already contradict.', r`Factorise $n^{3} - n$.`, 'What do you know about three consecutive integers?'],
      mis: ['examples-prove'], tip: 'Let the data eliminate options, then justify the survivor.' },

    { id: 'P552', lesson: 'L5-5', obj: 'L55b', spec: ['Prf3'], diff: 3, type: 'mcq',
      stem: r`The sum $S_n$ is defined by

$$S_n = \dfrac{1}{1 \times 2} + \dfrac{1}{2 \times 3} + \cdots + \dfrac{1}{n(n + 1)}.$$

Small cases give $S_1 = \dfrac{1}{2}$, $S_2 = \dfrac{2}{3}$, $S_3 = \dfrac{3}{4}$. What is $S_{99}$?`,
      options: [r`$\dfrac{99}{100}$`, r`$\dfrac{100}{101}$`, r`$\dfrac{98}{99}$`, r`$1$`], answer: 0,
      notes: [r`Correct: $S_n = \dfrac{n}{n+1}$.`, r`That is $S_{100}$.`, r`That is $S_{98}$.`, r`$S_n$ is always less than 1.`],
      key: r`$\dfrac{1}{k(k+1)} = \dfrac{1}{k} - \dfrac{1}{k+1}$, so the sum telescopes.`,
      sol: r`Conjecture $S_n = \dfrac{n}{n+1}$. Justification: $\dfrac{1}{k(k+1)} = \dfrac{1}{k} - \dfrac{1}{k+1}$, so $S_n = 1 - \dfrac{1}{n+1} = \dfrac{n}{n+1}$. Hence $S_{99} = \dfrac{99}{100}$.`,
      hints: [r`Guess a formula for $S_n$ from the three cases.`, r`Write $\dfrac{1}{k(k+1)}$ as a difference of two fractions.`, 'Most terms cancel.'],
      mis: ['calc-slip'], tip: 'Telescoping sums justify many fraction patterns.' },

    { id: 'P553', lesson: 'L5-5', obj: 'L55a', spec: ['Prf3'], diff: 3, type: 'mcq',
      stem: r`$n$ straight lines are drawn in a plane so that no two are parallel and no three meet at a point. For $n = 1, 2, 3, 4$ the plane is divided into $2, 4, 7, 11$ regions. How many regions are there when $n = 10$?`,
      options: [r`$55$`, r`$56$`, r`$46$`, r`$1024$`, r`$66$`], answer: 1,
      notes: [r`This is $1 + 2 + \cdots + 10$, forgetting the starting region.`, r`Correct: $1 + \dfrac{10 \times 11}{2} = 56$.`, r`An arithmetic slip.`, r`Doubling fits $2, 4$ but not $7$.`, r`An extra 10 has been added.`],
      key: r`The k-th line crosses $k - 1$ lines, so it adds $k$ regions.`,
      sol: r`The differences are $2, 3, 4$: the $k$-th line meets the previous $k - 1$ lines at distinct points, is cut into $k$ pieces, and each piece splits a region in two, adding $k$ regions. So the count is $1 + (1 + 2 + \cdots + n) = 1 + \dfrac{n(n+1)}{2}$. For $n = 10$: $56$.`,
      hints: ['Look at the differences between consecutive counts.', r`Why does the k-th line add $k$ regions?`, 'Start from 1 region with no lines.'],
      mis: ['calc-slip', 'examples-prove'], tip: 'Explain the differences, then sum them.' },

    { id: 'P554', lesson: 'L5-5', obj: 'L55b', spec: ['Prf3'], diff: 2, type: 'mcq',
      stem: r`A student computes $3^n + 1$ for $n = 1, 3, 5$, obtaining $4, 28, 244$, all multiples of 4, and conjectures that $3^n + 1$ is a multiple of 4 for **every** positive integer $n$. Which is correct?`,
      options: [r`The conjecture is true for all $n$.`, r`It is false: $n = 2$ gives 10. It is true for every odd $n$.`, r`It is false: $n = 4$ gives 82. It is false for every odd $n$ too.`, r`It cannot be checked without a calculator.`], answer: 1,
      notes: [r`$3^2 + 1 = 10$ is not a multiple of 4.`, r`Correct: $3 = 4 - 1$, so an odd power of 3 is one less than a multiple of 4.`, r`The odd cases all work.`, r`$3^2 + 1 = 10$ is easy by hand.`],
      key: r`The student only tested odd $n$.`,
      sol: r`$n = 2$ gives $10$, so the conjecture fails. For odd $n$: $3^n = (4 - 1)^n$; expanding, every term except $(-1)^n = -1$ is a multiple of 4, so $3^n + 1$ is a multiple of 4.`,
      hints: [r`Which values of $n$ did the student test?`, r`Try $n = 2$.`, r`Write 3 as $4 - 1$.`],
      mis: ['examples-prove'], tip: 'Check whether the small cases tested were representative.' },

    { id: 'P555', lesson: 'L5-5', obj: 'L55a', spec: ['Prf3'], diff: 2, type: 'mcq',
      stem: r`The units digits of $7^1, 7^2, 7^3, 7^4, 7^5$ are $7, 9, 3, 1, 7$. What is the units digit of $7^{2026}$?`,
      options: [r`$7$`, r`$9$`, r`$3$`, r`$1$`], answer: 1,
      notes: [r`That is the digit for exponents leaving remainder 1 on division by 4.`, r`Correct: $2026 = 4 \times 506 + 2$.`, r`Remainder 3 gives 3.`, r`Remainder 0 gives 1.`],
      key: 'The units digit cycles with period 4, because each units digit depends only on the previous one.',
      sol: r`The units digit of $7^{n+1}$ depends only on the units digit of $7^n$, so once a digit repeats the cycle $7, 9, 3, 1$ repeats forever. $2026$ leaves remainder 2 on division by 4, so the units digit is the second in the cycle: 9.`,
      hints: ['What is the length of the cycle?', 'Why must the cycle continue forever?', 'Find 2026 mod 4.'],
      mis: ['calc-slip'], tip: 'Justify a cycle by noting each step depends only on the previous state.' },

    { id: 'P556', lesson: 'L5-5', obj: 'L55b', spec: ['Prf3'], diff: 2, type: 'mcq',
      stem: r`In a group of $n$ people, each pair shakes hands once. For $n = 1, 2, 3, 4$ there are $0, 1, 3, 6$ handshakes. Which is a valid justification that there are $\dfrac{n(n-1)}{2}$ handshakes?`,
      options: [r`Each of the $n$ people shakes $n - 1$ hands, and this counts every handshake twice.`, r`The differences $1, 2, 3$ increase by 1 in the cases checked, so they always will.`, r`The formula is correct for $n = 1, 2, 3, 4$.`, r`Each person shakes $n$ hands, so there are $\dfrac{n^2}{2}$ handshakes, approximately.`], answer: 0,
      notes: [r`Correct: a general counting argument.`, r`This assumes the pattern continues without explaining why.`, r`Examples are not a justification.`, r`Nobody shakes their own hand.`],
      key: r`A justification must explain why, for every $n$.`,
      sol: r`Each person shakes hands with the $n - 1$ others, giving $n(n - 1)$ person–handshake pairs; each handshake involves two people, so it is counted twice. Hence $\dfrac{n(n-1)}{2}$.`,
      hints: [r`Which option works for every $n$, not just the cases shown?`, 'How many hands does each person shake?', 'Is anything double counted?'],
      mis: ['examples-prove'], tip: 'Justifications explain the mechanism, not the data.' }
  );

  /* ------------------------------------------------------------------ L5-6 */
  TLL.lessons.push({
    id: 'L5-6', unit: 'U5', title: 'Ordering the steps of a proof', mins: 8, spec: ['Prf4'], prereq: ['L5-1', 'L5-3'],
    objectives: [
      { id: 'L56a', text: 'Identify the first step (assumption) and last step (goal) of a proof.' },
      { id: 'L56b', text: 'Order intermediate steps so that each follows from earlier ones.' }
    ],
    purpose: 'Prf4 asks you to rearrange statements into a correct proof. Anchoring the first and last steps makes this quick.',
    refs: ['spec2026', 'w3cwcag22'],
    steps: [
      { k: 'predict', stem: r`In a proof that “if $n$ is odd then $n^2$ is odd”, which statement comes **first**?`,
        options: [r`Let $n = 2k + 1$ for some integer $k$.`, r`So $n^2$ is odd.`, r`$n^2 = 4k^2 + 4k + 1$.`], answer: 0,
        notes: [r`Correct: the proof starts from the assumption.`, r`This is the goal: it comes last.`, r`This needs $n = 2k + 1$ first.`] },
      { k: 'idea', title: 'Anchor the ends, then link', body: r`1. **First step:** the assumption (direct proof) or the negation (contradiction).
2. **Last step:** the statement to be proved.
3. For each remaining step, ask “what does this need?” A step can only appear after everything it uses.
4. Read the finished chain aloud: each line should follow from the ones above.

In this app you reorder steps with **Move up** and **Move down** buttons, which work by touch, mouse or keyboard.` },
      { k: 'worked', id: 'W34' },
      { k: 'practice', ids: ['P561', 'P562'] },
      { k: 'check' },
      { k: 'summary', body: r`Fix the first and last steps, then order the middle by dependence: each step after everything it uses.` }
    ]
  });

  TLL.worked.push(
    { id: 'W34', lesson: 'L5-6', title: 'Ordering a proof about a quadratic inequality',
      problem: r`Put in order a proof that if $x^2 - 5x + 6 < 0$ then $2 < x < 3$.`,
      steps: [
        { do: r`Assume $x^2 - 5x + 6 < 0$.`, why: 'The first step is the assumption.' },
        { do: r`Factorise: $(x - 2)(x - 3) < 0$.`, why: 'Needs only the assumption.' },
        { do: r`A product is negative exactly when its factors have opposite signs.`, why: 'A general fact used next.' },
        { do: r`Since $x - 2 > x - 3$, we must have $x - 2 > 0$ and $x - 3 < 0$.`, why: r`The other sign pattern would need $x - 2 < 0 < x - 3$, impossible.` },
        { do: r`Therefore $2 < x < 3$.`, why: 'The goal comes last.' }
      ],
      takeaway: 'Each line uses only lines above it; the conclusion is the final line.' }
  );

  TLL.questions.push(
    { id: 'P561', lesson: 'L5-6', obj: 'L56b', spec: ['Prf4'], diff: 1, type: 'order',
      stem: r`Arrange these statements into a proof that the sum of three consecutive integers is a multiple of 3.`,
      steps: [
        r`Let the integers be $n$, $n + 1$ and $n + 2$, where $n$ is an integer.`,
        r`Their sum is $n + (n + 1) + (n + 2)$.`,
        r`This simplifies to $3n + 3$.`,
        r`So the sum equals $3(n + 1)$.`,
        r`Since $n + 1$ is an integer, the sum is a multiple of 3.`
      ],
      key: 'Define, add, simplify, factorise, conclude.',
      sol: 'Introduce general consecutive integers, add them, simplify, factorise out 3, and conclude using the definition of a multiple.',
      hints: ['Which statement introduces the integers?', 'Which statement is the conclusion?', 'Factorising needs the simplified form first.'],
      mis: [], tip: 'Introduce letters before using them.' },

    { id: 'P562', lesson: 'L5-6', obj: 'L56b', spec: ['Prf4', 'Arg1'], diff: 2, type: 'order',
      stem: r`Arrange these statements into a proof that, for integers $n$, if $n^2$ is even then $n$ is even.`,
      steps: [
        r`We prove the contrapositive: if $n$ is odd then $n^2$ is odd.`,
        r`Suppose $n$ is odd, so $n = 2k + 1$ for some integer $k$.`,
        r`Then $n^2 = 4k^2 + 4k + 1$.`,
        r`So $n^2 = 2(2k^2 + 2k) + 1$, which is odd.`,
        r`Hence, by the contrapositive, if $n^2$ is even then $n$ is even.`
      ],
      key: 'State the strategy first, then carry it out.',
      sol: r`Announce the contrapositive, assume $n$ odd, expand, show $n^{2}$ is odd, and conclude the original statement.`,
      hints: ['Which statement explains the method?', 'The assumption of the contrapositive comes next.', 'The final line refers back to the original statement.'],
      mis: ['converse'], tip: 'A proof by contrapositive should say so at the start.' },

    { id: 'P563', lesson: 'L5-6', obj: 'L56a', spec: ['Prf4', 'Prf1'], diff: 3, type: 'order',
      stem: r`Arrange these statements into a proof by contradiction that $\sqrt{2}$ is irrational.`,
      steps: [
        r`Suppose $\sqrt{2} = \dfrac{p}{q}$, where $p$ and $q$ are positive integers with no common factor.`,
        r`Then $p^2 = 2q^2$, so $p^2$ is even.`,
        r`Hence $p$ is even, so $p = 2r$ for some integer $r$.`,
        r`Then $4r^2 = 2q^2$, so $q^2 = 2r^2$ and $q$ is even.`,
        r`So $p$ and $q$ have the common factor 2, which is a contradiction.`,
        r`Therefore $\sqrt{2}$ is irrational.`
      ],
      key: r`Assumption → $p$ even → $q$ even → contradiction → conclusion.`,
      sol: r`Assume a fraction in lowest terms, show $p$ is even, substitute to show $q$ is even, contradict lowest terms, and conclude.`,
      hints: ['Contradiction proofs start by assuming the negation.', r`You need $p$ even before you can substitute $p = 2r$.`, 'The contradiction comes just before the conclusion.'],
      mis: ['contradiction-setup'], tip: 'In a contradiction proof, the contradiction is the penultimate line.' },

    { id: 'P564', lesson: 'L5-6', obj: 'L56b', spec: ['Prf4'], diff: 2, type: 'order',
      stem: r`Arrange these statements into a proof that $x^2 - 6x + 10 > 0$ for all real $x$.`,
      steps: [
        r`Let $x$ be any real number.`,
        r`$x^2 - 6x + 10 = (x - 3)^2 + 1$.`,
        r`$(x - 3)^2 \ge 0$, because a square of a real number is non-negative.`,
        r`So $(x - 3)^2 + 1 \ge 1$.`,
        r`Therefore $x^2 - 6x + 10 > 0$.`
      ],
      key: r`Complete the square, use $(\text{square}) \ge 0$, conclude.`,
      sol: r`Fix an arbitrary $x$, complete the square, use non-negativity of squares, add 1, conclude.`,
      hints: ['Which line makes the proof general?', 'The square must be identified before using its sign.', 'The conclusion is last.'],
      mis: [], tip: r`For “for all $x$”, the first line fixes an arbitrary $x$.` },

    { id: 'P565', lesson: 'L5-6', obj: 'L56b', spec: ['Prf4', 'Prf1'], diff: 2, type: 'mcq',
      stem: r`In a correctly ordered proof that there are infinitely many primes, which statement comes immediately after “Let $N = p_1 p_2 \cdots p_k + 1$”?`,
      options: [r`$N$ leaves remainder 1 when divided by each $p_i$.`, r`So there are infinitely many primes.`, r`Suppose there are only finitely many primes $p_1, \ldots, p_k$.`, r`$N$ is prime.`], answer: 0,
      notes: [r`Correct: this is the first consequence of the definition of $N$.`, r`That is the final conclusion.`, r`This must come before $N$ can be defined.`, r`Not necessarily true, and not needed.`],
      key: 'Each step uses only what came before it.',
      sol: r`The order is: assume finitely many primes; define N; N leaves remainder 1 on division by each $p_i$; N has a prime factor not in the list; contradiction; conclusion.`,
      hints: ['What must come before N is defined?', 'What follows directly from the definition of N?', 'Is N necessarily prime?'],
      mis: [], tip: 'Ask “what does this line need?” to place it.' },

    { id: 'P566', lesson: 'L5-6', obj: 'L56a', spec: ['Prf4', 'Prf1'], diff: 1, type: 'mcq',
      stem: r`Which statement must come **first** in a proof by contradiction that there is no largest integer?`,
      options: [r`Suppose there is a largest integer, $N$.`, r`Then $N + 1$ is an integer.`, r`But $N + 1 > N$.`, r`So there is no largest integer.`], answer: 0,
      notes: [r`Correct: the assumption to be contradicted.`, r`Needs $N$ to exist first.`, r`This is the contradiction step.`, r`This is the conclusion.`],
      key: 'A contradiction proof starts by assuming the negation.',
      sol: 'Assume a largest integer N exists. Then N + 1 is an integer greater than N, contradicting the assumption.',
      hints: ['What does a contradiction proof assume?', 'Which line introduces N?', 'Which line is the conclusion?'],
      mis: ['contradiction-setup'], tip: 'Find the line that introduces the objects others refer to.' }
  );
})();
