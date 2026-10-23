import { beast } from './animal.js';
export const meta = { duration: 3, beats: [[0, 'a']] };
export function create(k) {
  k.backdrop({});
  const ks = ['cow','pig','sheep','goat','horse','deer','fox','wolf','lion','tiger','bear','elephant','mouse','rat'];
  const bs = ks.map((n, i) => { const b = beast(k, n); return [b, 50 + (i % 4) * 100, 80 + Math.floor(i / 4) * 75]; });
  return { update(t) { bs.forEach(([b, x, y]) => b.set({ x, y, s: 0.6, ph: t * 8, m: t > 1.5 ? 1 : 0, trunk: t / 3 })); } };
}
