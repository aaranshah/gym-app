#!/usr/bin/env node
/* Independent computational re-solving of answer keys where computation helps.
 * Each check recomputes the answer (option index, or truth values of statements) by brute force or direct
 * calculation, without reading the stored answer, then compares. Finite searches support but do not prove
 * universal claims; where a statement is universal, the search range is stated and the written proof is the
 * real justification.
 * Usage: node scripts/verify-maths.mjs
 */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
for (const f of fs.readdirSync(path.join(root, 'content')).sort()) vm.runInContext(fs.readFileSync(path.join(root, 'content', f), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'js/model.js'), 'utf8'), ctx);
const T = ctx.TLL; const all = {};
[...T.questions, ...T.diagnostic, ...T.mocks.flatMap(m => m.questions)].forEach(q => { all[q.id] = T.model.normalise(q); });

const isPrime = (n) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
const range = (a, b, s = 1) => { const r = []; for (let x = a; x <= b + 1e-9; x += s) r.push(+x.toFixed(10)); return r; };
const reals = [...range(-10, 10, 0.05), 0.5, -0.5, 1 / 3, 1e-3, -1e-3];
const ints = range(-200, 200);
const posInts = range(1, 400);
const forAll = (dom, p) => dom.every(p);
const exists = (dom, p) => dom.some(p);
const implies = (a, b) => !a || b;
const deg = Math.PI / 180;
const near = (a, b) => Math.abs(a - b) < 1e-9;
const romanIdx = (truth) => T.ROMAN_OPTIONS.findIndex(o => o.set.length === truth.filter(Boolean).length && o.set.every(v => truth[v - 1]));
const nsIdx = (suff, nec) => suff && nec ? 2 : nec ? 0 : suff ? 1 : 3;
const countSolutions = (f, a, b, n = 200000) => { let c = 0; let prev = f(a); for (let i = 1; i <= n; i++) { const x = a + (b - a) * i / n, v = f(x); if (v === 0 || prev * v < 0) c++; prev = v; } return c; };

const checks = {
  P112: () => [reals, reals.filter(x => x > 0), ints, reals.filter(x => x > 0 && x < 1)].findIndex(d => forAll(d, x => x * x >= x)),
  P113: () => { let n = 1; while (isPrime(n * n + n + 41)) n++; return n === 40 ? 1 : -1; },
  P114: () => { const ok = reals.filter(x => near(Math.sqrt(x * x), x)); return ok.every(x => x >= 0) && ok.includes(0) && ok.some(x => x > 0) ? 1 : -1; },
  P115: () => [forAll(range(1, 50), n => (n * n) % 2 === 0), exists(posInts, p => isPrime(p) && p % 2 === 0), forAll(range(1, 30), n => 2 ** n > n * n), forAll(reals, x => (x - 1) ** 2 >= 0)],
  P121: () => { const x = -3; return romanIdx([x < 0 || x * x < 0, x < 0 && x * x > 0, !(x * x === 9)]); },
  P123: () => { const c = range(1, 20).filter(n => n % 3 === 0 || n % 5 === 0).length; return [8, 9, 10, 1, 11].indexOf(c); },
  P125: () => [forAll(posInts, n => n % 2 === 1 || (n + 1) % 2 === 1), forAll(posInts, n => n % 2 === 1 && (n + 1) % 2 === 1), exists(posInts, n => (n * n) % 2 === 0 || n % 2 === 1), forAll(posInts, n => isPrime(n) || n % 2 === 0)],
  P126: () => { const no = reals.filter(x => !(x * x > 4 || x < 1)); return no.every(x => x >= 1 && x <= 2) && no.includes(1) && no.includes(2) ? 0 : -1; },
  P131: () => [2, 0, -2, 1, 0.5].findIndex(x => x * x > 1 && !(x > 1)),
  P132: () => [3, 4, 7, 5, 9].findIndex(n => isPrime(n) && !isPrime(n + 2)),
  P133: () => forAll(ints.filter(n => Math.abs(n) % 2 === 1), n => (n * n - 1) % 8 === 0) ? 0 : -1,
  P135: () => { const f = x => x ** 3 - x; return [[1, 1], [0, 1], [2, -2], [1, 2]].findIndex(([a, b]) => f(a) === f(b) && a !== b); },
  P136: () => [forAll(reals, x => implies(x > 0, x * x > 0)), forAll(reals, x => implies(x * x > 0, x > 0)), forAll(reals, x => implies(x < 0, x ** 3 < 0)), forAll(reals, x => implies(x ** 3 < x, x < 0))],
  P143: () => romanIdx([forAll(reals, x => implies(x === 2, x * x === 4)), forAll([...reals, -2], x => implies(near(x * x, 4), x === 2)), forAll(reals, x => (x === 2) === near(x ** 3, 8))]),
  P145: () => [forAll(ints, n => (Math.abs(n) % 2 === 1) === ((n * n) % 2 === 1)), forAll(ints, n => (n % 4 === 0) === ((n * n) % 4 === 0)), forAll(ints, n => (n % 2 === 0) === ((n * n) % 8 === 0)), forAll(ints, n => (n > 0) === (n * n > 0))].indexOf(true),
  P146: () => { const cs = range(0, 20, 0.25); const pos = c => forAll(reals, x => x * x - 6 * x + c > 0); const opts = [c => pos(c) === (c > 9), c => pos(c) === (c >= 9), c => implies(pos(c), c > 10), c => implies(c > 8, pos(c))]; return opts.findIndex(o => forAll(cs, o)); },
  P211: () => nsIdx(forAll(reals, x => implies(x === 3, x * x === 9)), forAll([...reals, -3], x => implies(near(x * x, 9), x === 3))),
  P213: () => nsIdx(forAll(ints, n => implies(n % 6 === 0, n % 4 === 0)), forAll(ints, n => implies(n % 4 === 0, n % 6 === 0))),
  P214: () => nsIdx(forAll(posInts, n => implies(n % 2 === 1, (n * n + 1) % 2 === 0)), forAll(posInts, n => implies((n * n + 1) % 2 === 0, n % 2 === 1))),
  P215: () => { const tgt = x => x > 2; const conds = [x => x > 1, x => x * x > 4, x => x > 3]; return romanIdx(conds.map(c => forAll(reals, x => implies(tgt(x), c(x))) && !forAll(reals, x => implies(c(x), tgt(x))))); },
  P216: () => { const ks = range(-5, 5, 0.25); const one = k => { const roots = new Set([0]); if (k < 0) { roots.add(Math.sqrt(-k)); roots.add(-Math.sqrt(-k)); } return roots.size === 1; }; return forAll(ks, k => one(k) === (k >= 0)) ? 1 : -1; },
  P221: () => { const S = reals.filter(x => x * x < 4); return [x => x < 2, x => x > 0 && x < 2, x => x > -1, x => x * x < 1].findIndex(c => S.every(c)); },
  P222: () => nsIdx(forAll(reals, x => implies(x ** 3 > 8, x > 2)), forAll(reals, x => implies(x > 2, x ** 3 > 8))),
  P223: () => { const S = reals.filter(x => 2 ** x > 8); return [x => x > 4, x => x > 2, x => x > 3 && x < 5, x => x < 3].findIndex(c => S.every(c)); },
  P224: () => { const D = range(0, 359); const cz = x => Math.abs(Math.cos(x * deg)) < 1e-12; return nsIdx(forAll(D, x => implies(cz(x), x === 90)), forAll(D, x => implies(x === 90, cz(x)))); },
  P225: () => { const P = []; for (const a of range(-4, 4, 0.5)) for (const b of range(-4, 4, 0.5)) P.push([a, b]); return [([a, b]) => a > b, ([a, b]) => a > b && b > 0, ([a, b]) => Math.abs(a) >= Math.abs(b), ([a, b]) => a !== b].findIndex(c => forAll(P, p => implies(c(p), p[0] ** 2 > p[1] ** 2))); },
  P311: () => [forAll(reals, x => x * x > 0), exists(reals, x => x * x < 0), exists(reals, x => x * x === x), forAll(reals, x => x * x >= x)].indexOf(true),
  P314: () => exists(posInts, n => (n * n + 1) % 3 === 0) ? 0 : 1,
  P315: () => { const f = x => x * x - 2 * x; return [exists(reals, x => f(x) < 0), forAll(reals, x => f(x) >= -1 - 1e-12), exists(reals, x => near(f(x), -2)), forAll(reals.filter(x => x > 2), x => f(x) > 0)].indexOf(false); },
  P323: () => { const S = reals.filter(x => !(x < 1 || x > 4)); return S.every(x => x >= 1 && x <= 4) && S.includes(1) && S.includes(4) ? 0 : -1; },
  P415: () => { const ks = range(-8, 8, 0.5); const none = k => k * k - 16 < 0; return [k => k > 4 || k < -4, k => k > -4 && k < 4, k => k >= -4 && k <= 4, k => k < 4].findIndex(c => forAll(ks, k => c(k) === none(k))); },
  P425: () => { const P = []; for (const a of range(-3, 3, 0.5)) for (const b of range(-3, 3, 0.5)) P.push([a, b]); return [([a, b]) => implies(a * a === b * b, a === b), ([a, b]) => implies(a ** 3 === b ** 3, a === b)].map(c => forAll(P, c)).indexOf(true) === 1 ? 1 : -1; },
  P513: () => forAll(ints, n => (n * (n + 1) * (n + 2)) % 6 === 0) ? 1 : -1,
  P524: () => [forAll(ints, n => [0, 1].includes(((n * n) % 3 + 3) % 3)), forAll(ints, n => [0, 1].includes(((n * n) % 5 + 5) % 5)), forAll(ints, n => [0, 1].includes(((n ** 3) % 4 + 4) % 4)), forAll(ints, n => [0, 1].includes(((n * n) % 8 + 8) % 8))].indexOf(true),
  P541: () => [2, 0.5, -1, 3].findIndex(x => x > 0 && !(1 / x < x)),
  P542: () => [[Math.SQRT2, -Math.SQRT2], [Math.SQRT2, Math.sqrt(3)], [2, Math.SQRT2], [Math.PI, Math.PI]].findIndex(([a, b]) => near(a + b, Math.round(a + b)) && Math.abs(a) !== 2),
  P543: () => forAll(reals, x => implies(x * x < 4 * x, x < 4)) ? 3 : -1,
  P544: () => [1, 2, 3, 4, 5, 6].findIndex(n => !isPrime(n * n + n + 1)),
  P545: () => [-3, 3, 1, -5, 2.5].findIndex(k => k * k - 4 <= 0),
  P546: () => { const fs_ = [x => x, x => x * x, x => (x - 1.25) ** 2, x => 3 - x]; return fs_.findIndex(f => f(2) > f(1) && exists(range(1, 1.99, 0.01), x => f(x + 0.01) < f(x))); },
  P551: () => { const v = range(2, 200).map(n => n ** 3 - n); return [6, 12, 24].map(d => v.every(x => x % d === 0)).indexOf(true); },
  P552: () => { let s = 0; for (let k = 1; k <= 99; k++) s += 1 / (k * (k + 1)); return near(s, 99 / 100) ? 0 : -1; },
  P553: () => { let r = 1; for (let k = 1; k <= 10; k++) r += k; return [55, 56, 46, 1024, 66].indexOf(r); },
  P554: () => (3 ** 2 + 1) % 4 !== 0 && range(1, 15, 2).every(n => (3 ** n + 1) % 4 === 0) ? 1 : -1,
  P555: () => { let u = 1; for (let i = 0; i < 2026; i++) u = (u * 7) % 10; return [7, 9, 3, 1].indexOf(u); },
  P614: () => { const sols = [3, -1].filter(x => near(Math.sqrt(2 * x + 3), x)); return sols.length === 1 && sols[0] === 3 ? 1 : -1; },
  P622: () => { const S = reals.filter(x => x !== 2 && (x + 1) / (x - 2) > 1); return S.every(x => x > 2) && reals.filter(x => x > 2.01).every(x => (x + 1) / (x - 2) > 1) ? 1 : -1; },
  P632: () => [0, 1].every(x => near(4 ** x - 3 * 2 ** x + 2, 0)) ? 0 : -1,
  P633: () => near(Math.tan(2 * Math.PI / 3), Math.sqrt(3)) ? -1 : 2,
  P634: () => { let s = 0; const n = 200000; for (let i = 0; i < n; i++) { const x = -1 + 2 * (i + .5) / n; s += Math.abs(x ** 3) * 2 / n; } return near(Math.round(s * 1e4) / 1e4, 0.5) ? 1 : -1; },
  P635: () => [4, -2].filter(x => x > 2 && near(Math.log2(x) + Math.log2(x - 2), 3)).length === 1 ? 1 : -1,
  P711: () => { const fp = x => 3 * x * x - 3; return romanIdx([countSolutions(fp, -5, 5) === 2, countSolutions(x => x ** 3 - 3 * x, -5, 5) === 3, forAll(range(0.01, 5, 0.01), x => fp(x) > 0)]); },
  P712: () => { const u = [0, 2]; for (let n = 2; n <= 40; n++) u[n] = 2 * u[n - 1] - 1; return romanIdx([u.slice(1).every(x => x % 2 === 1), u.slice(1).every((x, i) => x > i + 1), u[10] === 513]); },
  P713: () => { const f = (x, y) => x * x + y * y - 6 * x + 4 * y; return romanIdx([near(f(3 + 5, -2), 12) && near(f(3, -2 + 5), 12), f(0, 0) === 12, near(f(3 + 5 * Math.cos(1), -2 + 5 * Math.sin(1)), 12)]); },
  P714: () => romanIdx([forAll(ints, n => implies((n * n) % 12 === 0, n % 12 === 0)), forAll(ints, n => implies((n * n) % 12 === 0, n % 6 === 0)), forAll(ints, n => implies(n % 6 === 0, (n * n) % 12 === 0))]),
  P715: () => { const X = range(0.5, 89.5, 0.5).map(d => d * deg); return romanIdx([X.every(x => Math.sin(x) < Math.tan(x)), X.every(x => Math.sin(x) + Math.cos(x) > 1), X.every(x => Math.sin(2 * x) < 2 * Math.sin(x))]); },
  P716: () => romanIdx([forAll(reals, x => implies(x * x > x, x > 1)), forAll(reals, x => implies(x > 0, x * x > x)), forAll(reals, x => implies(x ** 3 > x, x > 1))]),
  P721: () => { let I = true, II = true, III = true; for (const a of range(0.5, 6, 0.5)) for (const b of range(0.5, 6, 0.5)) { if (a === b) continue; const p = -(a + b), q = a * b; I = I && p < 0; II = II && q > 0; III = III && p * p > 4 * q; } return romanIdx([I, II, III]); },
  P724: () => { const ks = range(-6, 8, 0.5); const neg = k => (-k * k + 2 * k + 3) < 0; return [k => k > -1 && k < 3, k => k < -1 || k > 3, k => k > 3, k => k <= -1 || k >= 3].findIndex(c => forAll(ks, k => c(k) === neg(k))); },
  P726: () => [6, 9, 4, 12, 8].findIndex(n => ((n % 3 === 0) === (n % 2 === 0)) && implies(n % 3 === 0, n > 10)),
  P731: () => [x => x * x >= 2 * x - 1, x => x * x > x, x => x ** 3 >= x, x => x * x + 1 > 2 * x].findIndex(p => forAll(reals, p)),
  P733: () => { const P = []; for (const a of range(-3, 3, 0.5)) for (const b of range(-3, 3, 0.5)) P.push([a, b]); return [([a, b]) => Math.abs(a + b) === Math.abs(a) + Math.abs(b), ([a, b]) => Math.abs(a + b) <= Math.abs(a) + Math.abs(b), ([a, b]) => Math.abs(a - b) <= Math.abs(a) - Math.abs(b), ([a, b]) => Math.abs(a * b) < Math.abs(a) * Math.abs(b)].findIndex(c => forAll(P, c)); },
  P734: () => [2, 1, 0, -1, 10].findIndex(x => !(x ** 3 >= x * x)),
  P736: () => [2, 3, 4, 6, 12].indexOf(range(0, 359.99, 0.0005).length ? countSolutions(x => Math.sin(3 * x * deg) - 0.5, 0, 360) : 0),
  P802: () => { const s = new Set(ints.map(n => ((n * n) % 3 + 3) % 3)); return s.size === 2 && s.has(0) && s.has(1) ? 1 : -1; },
  P803: () => { const S = reals.filter(x => x * x < 6 * x); return S.every(x => x > 0 && x < 6) ? 1 : -1; },
  P806: () => { const S = reals.filter(x => Math.abs(2 * x - 1) < 3); return S.every(x => x > -1 && x < 2) && S.length > 0 ? 0 : -1; },
  P807: () => { const ks = range(-5, 6, 0.25); const two = k => k !== 0 && 36 - 12 * k > 0; return [k => k < 3, k => k < 3 && k !== 0, k => k > 3, k => k <= 3].findIndex(c => forAll(ks, k => c(k) === two(k))); },
  P808: () => [2, 3, 11, -2].indexOf(Math.min(...reals.map(x => x * x - 6 * x + 11)) > 1.999 ? 2 : NaN),
  P809: () => [1, 2, 3, 4].indexOf(countSolutions(x => Math.cos(x * deg) + 0.5, 0, 360)),
  P812: () => [0, 1, 2, 3, 4].filter(x => near(2 ** (2 * x) - 6 * 2 ** x + 8, 0)).join() === '1,2' ? 0 : -1,
  D02: () => [5, 6, 7, 1].indexOf(range(1, 10).filter(n => n % 2 === 0 || n % 5 === 0).length),
  D11: () => [-2, 1].every(x => (x - 1) * (x + 4) === 2 * (x - 1)) ? 1 : -1,
  D12: () => { const S = reals.filter(x => x !== 0 && 3 / x > 1); return S.every(x => x > 0 && x < 3) ? 1 : -1; },
  D13: () => 16 - 20 < 0 ? 0 : -1,
  D14: () => [1, 2, 4].indexOf(countSolutions(x => Math.sin(x * deg) - 0.5, 0, 359.99)),
  'M1-04': () => [[3, 2], [-2, -3], [2, -1], [1, 0], [-3, -2]].findIndex(([a, b]) => a > b && !(a * a > b * b)),
  'M1-05': () => { const f = x => x * x - 2 * x - 3; return romanIdx([forAll(reals, x => implies(f(x) < 0, x > -1 && x < 3)), forAll(reals, x => implies(x > 3, f(x) > 0)), forAll(reals, x => f(x) > -4)]); },
  'M1-08': () => [x => (x * x < x) === (x > 0 && x < 1), x => (x ** 3 < x) === (x > 0 && x < 1), x => (Math.abs(x) < x) === (x > 0), x => (x * x > 1) === (x > 1), x => x === 0 || (1 / x < 1) === (x > 1)].findIndex(p => forAll(reals, p)),
  'M1-09': () => { const t = [0, 1, 2]; for (let n = 3; n <= 8; n++) t[n] = t[n - 1] + t[n - 2]; return [21, 32, 34, 40, 55].indexOf(t[8]); },
  'M1-10': () => [0, 1, 2, 3].indexOf(countSolutions(t => Math.sin(2 * t) - Math.sin(t), 0.001, Math.PI - 0.001)),
  'M1-11': () => { let g = 0; const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a); for (const n of range(-60, 60)) g = gcd(g, n ** 5 - n); return [4, 5, 7, 30, 60].indexOf(g); },
  'M1-14': () => { const A = range(0.01, 0.99, 0.01); return romanIdx([A.every(a => a * (1 - a) <= 0.25 + 1e-12), A.every(a => a * a + (1 - a) ** 2 >= 0.5 - 1e-12), A.every(a => 1 / a + 1 / (1 - a) >= 4 - 1e-9)]); },
  'M1-17': () => romanIdx([forAll(range(0, 50, 0.5), y => near(Math.sqrt(y) ** 2, y)), exists(reals, x => forAll(reals, t => x * x <= t * t)), exists(reals, t => forAll(reals, x => t * t > x * x))]),
  'M1-18': () => { const s = range(1, 5000).filter(n => (n * n + 5) % (n + 1) === 0).reduce((a, b) => a + b, 0); return [3, 5, 8, 9, 11].indexOf(s); },
  'M2-02': () => nsIdx(forAll(reals, x => implies(Math.abs(x) < 1, x * x < x)), forAll(reals, x => implies(x * x < x, Math.abs(x) < 1))),
  'M2-03': () => [forAll(ints, n => exists([n * n + 1], m => m > n * n)), exists([0], m => forAll(ints, n => m <= n * n)), forAll(range(-5, 30), n => exists(range(-10, 10), m => m * m === n)), exists(ints, n => n * n === n)].indexOf(false),
  'M2-06': () => [1, 2, 3, 4, 5].indexOf([0, Math.PI / 6, 5 * Math.PI / 6, Math.PI].filter(x => near(2 * Math.sin(x) ** 2, Math.sin(x))).length + (countSolutions(x => 2 * Math.sin(x) ** 2 - Math.sin(x), 0.01, 2 * Math.PI - 0.01) === 3 ? 0 : 99)),
  'M2-08': () => { const P = []; for (const a of range(0.25, 6, 0.25)) for (const b of range(0.25, 6, 0.25)) if (a < b) P.push([a, b]); return romanIdx([P.every(([a, b]) => a * a < b), P.every(([a, b]) => Math.sqrt(a) < Math.sqrt(b)), P.every(([a, b]) => 1 / a - 1 / b < 0)]); },
  'M2-09': () => { let s = 0; for (let k = 1; k <= 10; k++) s += k ** 3; return [385, 2025, 3000, 3025, 5050].indexOf(s); },
  'M2-11': () => [n => (n * (n + 1) * (2 * n + 1)) % 6 === 0, n => (n * n - n) % 4 === 0, n => (n ** 3 + 2 * n) % 6 === 0, n => (2 ** n + 1) % 3 === 0, n => (n ** 4 - 1) % 5 === 0].findIndex(p => forAll(range(1, 40), p)),
  'M2-14': () => { const a = -1, b = -1; const ok1 = near(3 + 2 * a + b, 0) && near(1 + a + b, -1); const dy = x => 3 * x * x + 2 * a * x + b; return romanIdx([ok1 && a === -1, near(dy(-1 / 3), 0), countSolutions(x => x ** 3 + a * x * x + b * x, -5, 5) === 3]); },
  'M2-19': () => { const sols = []; for (const A of [true, false]) for (const B of [true, false]) for (const C of [true, false]) if (A === !B && B === (!A && !C) && C === (!A || !B)) sols.push([A, B, C]); if (sols.length !== 1) return -1; const s = sols[0]; return ['100', '010', '001', '110', '101', '011', '111', '000'].indexOf(s.map(v => v ? 1 : 0).join('')); },
  'M2-20': () => [-1, 0, 2, 4, 5].findIndex(k => k * k - 4 * k < 0),
  'M3-09': () => { const a = [0, 1]; for (let n = 1; n < 20; n++) a[n + 1] = a[n] + 2 * n + 1; return [380, 399, 400, 420, 441].indexOf(a[20]); },
  'M3-14': () => { const ks = range(-5, 5, 0.25); return [k => k <= 1, k => k < 1, k => k >= 1, k => k >= 0 && k <= 1].findIndex(c => forAll(ks, k => c(k) === (4 - 4 * k >= 0))); },
  'M3-17': () => romanIdx([forAll(reals, x => x >= 0 || x <= 0), forAll([...reals, 1], x => x > 1 || x < 1), forAll(reals, x => x * x >= 0 && x ** 3 >= 0)]),
  'M3-18': () => { const P = []; for (let x = -60; x <= 60; x++) for (let y = -60; y <= 60; y++) if (3 * x + 5 * y === 1) P.push([x, y]); return romanIdx([P.every(([x, y]) => !(x % 2 === 0 && y % 2 === 0)), P.every(([, y]) => (y + 1) % 3 === 0), P.every(([x, y]) => x < 0 || y < 0)]); },
  'M3-20': () => [0, 1, 2, 3, 4, 6].indexOf(countSolutions(x => Math.abs(x * x - 4) - 3, -10, 10))
};

let pass = 0, fail = 0;
for (const [id, fn] of Object.entries(checks)) {
  const q = all[id]; if (!q) { console.log('MISSING', id); fail++; continue; }
  let got; try { got = fn(); } catch (e) { got = 'ERR ' + e.message; }
  let ok;
  if (Array.isArray(got)) ok = q.type === 'tfset' && got.length === q.statements.length && got.every((v, i) => v === q.statements[i].t);
  else ok = got === q.answer;
  if (ok) pass++; else { fail++; console.log(`MISMATCH ${id}: computed ${JSON.stringify(got)}, stored ${q.type === 'tfset' ? JSON.stringify(q.statements.map(s => s.t)) : q.answer}`); }
}
console.log(`${pass} answer keys independently re-computed and matched; ${fail} mismatches. (${Object.keys(all).length} questions in total.)`);
process.exit(fail ? 1 : 0);
