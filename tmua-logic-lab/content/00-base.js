/* TMUA Logic Lab — content registry.
 * All course content lives in structured data with stable IDs.
 * Text markup used inside content strings:
 *   $...$        inline maths (KaTeX)        $$...$$  display maths
 *   **word**     decisive-word emphasis (teaching only; stripped in exam mode)
 *   blank line   new paragraph               "- " at line start: bullet
 * Write content with String.raw (r`...`) so LaTeX backslashes stay single.
 */
window.TLL = {
  meta: {
    title: 'TMUA Logic Lab',
    contentVersion: '1.0.0',
    specChecked: '17 November 2026',
    specEdition: 'TMUA Content Specification, UAT-UK, "For assessment in October 2026 and January 2027"'
  },
  units: [],
  lessons: [],
  worked: [],
  questions: [],   // practice/teaching pool (pool: 'practice')
  diagnostic: [],  // diagnostic pool (never shown in practice)
  mocks: [],       // { id, title, questions: [...] } — kept out of the practice pool
  cards: [],
  glossary: [],
  sources: [],
  evidence: [],
  misconceptions: {}
};

/* Standard TMUA-style options for "which of I, II, III are true" items. */
TLL.ROMAN_OPTIONS = [
  { set: [], label: 'none of them' },
  { set: [1], label: 'I only' },
  { set: [2], label: 'II only' },
  { set: [3], label: 'III only' },
  { set: [1, 2], label: 'I and II only' },
  { set: [1, 3], label: 'I and III only' },
  { set: [2, 3], label: 'II and III only' },
  { set: [1, 2, 3], label: 'I, II and III' }
];

TLL.NS_OPTIONS = [
  'necessary but not sufficient',
  'sufficient but not necessary',
  'necessary and sufficient',
  'neither necessary nor sufficient'
];

TLL.SPEC = {
  Arg1: 'Understand and be able to use mathematical logic in simple situations: true and false; and, or (inclusive), not; if A then B, A if B, A only if B, A if and only if B; the converse and contrapositive and their relationship to the truth of the statement.',
  Arg2: 'Understand and use the terms necessary and sufficient.',
  Arg3: 'Understand and use the terms for all, for some (meaning for at least one), and there exists.',
  Arg4: 'Be able to negate statements that use any of the above terms.',
  Prf1: 'Follow a proof of the following types, and in simple cases know how to construct such a proof: direct deductive proof; proof by cases; proof by contradiction; disproof by counterexample.',
  Prf2: 'Deduce implications from given statements.',
  Prf3: 'Make conjectures based on small cases, and then justify these conjectures.',
  Prf4: 'Rearrange a sequence of statements into the correct order to give a proof for a statement.',
  Prf5: 'Problems requiring a sophisticated chain of reasoning to solve.',
  Err1: 'Identifying errors in purported proofs.',
  Err2: "Be aware of common mathematical errors in purported proofs; for example, claiming 'if ab = ac, then b = c' or assuming 'if sin A = sin B, then A = B', neither of which are valid deductions."
};

TLL.misconceptions = {
  'converse': { label: 'Reversing an implication', text: "treated 'if A then B' as though it also meant 'if B then A' (the converse)", cards: ['F05', 'F06'] },
  'only-if': { label: "Direction of 'only if'", text: "read 'A only if B' as 'if B then A' instead of 'if A then B'", cards: ['F03', 'F04'] },
  'if-direction': { label: "Direction of 'A if B'", text: "read 'A if B' as 'if A then B' instead of 'if B then A'", cards: ['F02'] },
  'iff-one-way': { label: 'Checking only one direction of “if and only if”', text: "checked only one direction of an 'if and only if' statement", cards: ['F07'] },
  'inclusive-or': { label: "Exclusive reading of 'or'", text: "read 'or' as 'one or the other but not both' (in mathematics 'or' is inclusive)", cards: ['F01'] },
  'negation-swap': { label: "Negating 'and'/'or'", text: "negated each part but kept the same connective ('and' must become 'or', and vice versa)", cards: ['F15', 'F16'] },
  'negation-extreme': { label: 'Negating to the opposite extreme', text: "negated by jumping to the opposite extreme (for example $x > 3$ to $x < 3$, or ‘all’ to ‘none’)", cards: ['F14', 'F17'] },
  'quantifier-negation': { label: 'Negating quantifiers', text: "negated 'for all' without switching to 'there exists … not' (or the reverse)", cards: ['F17', 'F18'] },
  'implication-negation': { label: 'Negating an implication', text: "negated 'if A then B' as another 'if … then' statement; its negation is 'A and not B'", cards: ['F19'] },
  'vacuous': { label: 'Cases where the condition fails', text: "thought a case where the 'if' part is false could break (or confirm) an implication", cards: ['F08'] },
  'examples-prove': { label: 'Examples as proof', text: 'treated a few examples as proof of a claim about every case', cards: ['F24', 'F25'] },
  'nec-suff-swap': { label: 'Swapping necessary and sufficient', text: "swapped necessary and sufficient ('A is sufficient for B' means A guarantees B)", cards: ['F10', 'F11'] },
  'divide-zero': { label: 'Dividing by something that might be zero', text: 'divided by an expression that could be zero', cards: ['F30'] },
  'irreversible': { label: 'Irreversible steps', text: 'used a one-way step (such as squaring both sides) as if it could be reversed', cards: ['F31', 'F32'] },
  'inequality-sign': { label: 'Inequality direction', text: 'multiplied or divided an inequality by a negative or unknown-sign quantity without considering the sign', cards: ['F33'] },
  'domain': { label: 'Domain restrictions', text: 'ignored a domain restriction (square roots, logarithms or division)', cards: ['F34'] },
  'missing-case': { label: 'Omitted case', text: 'missed a case (for example zero, negative values or a remainder)', cards: ['F27'] },
  'many-to-one': { label: 'Many-to-one functions', text: 'assumed that $f(a) = f(b)$ forces $a = b$, which fails for many-to-one functions such as squaring or sine', cards: ['F35', 'F36'] },
  'quantifier-order': { label: 'Order of quantifiers', text: "swapped the order of 'for every' and 'there exists', which changes the meaning", cards: ['F20'] },
  'contradiction-setup': { label: 'Setting up a contradiction', text: 'started a proof by contradiction by assuming something other than the exact negation of the claim', cards: ['F26'] },
  'integral-area': { label: 'Integral versus area', text: 'treated a definite integral as an area even though part of the curve is below the axis', cards: ['F37'] },
  'some-not-all': { label: "Meaning of 'some'", text: "read 'some' as 'exactly one' or 'some but not all'; in mathematics it means 'at least one'", cards: ['F13'] },
  'deny-antecedent': { label: 'Denying the antecedent', text: "concluded 'not B' from 'not A' and 'if A then B'", cards: ['F22'] },
  'affirm-consequent': { label: 'Affirming the consequent', text: "concluded 'A' from 'B' and 'if A then B'", cards: ['F21'] },
  'stop-early': { label: 'Stopping too early', text: 'stopped after finding one solution or one case', cards: ['F36'] },
  'calc-slip': { label: 'Calculation slip', text: 'made an arithmetic or algebra slip', cards: [] },
  'counterexample-form': { label: 'What a counterexample needs', text: "chose a value that does not make the 'if' part true and the 'then' part false", cards: ['F23'] },
  'strategy': { label: 'Exam strategy', text: 'may benefit from the exam-technique ideas (eliminate, guess, flag and move on)', cards: ['F40'] }
};
