// jeans：平日はスーツ → 週末（土・日）になるとジーンズとTシャツに着替えてくつろぐ（例文 I usually wear jeans and a T-shirt on the weekend.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { wardrobe, P, blinkAt } from './skirt.js';
import { star } from './get-on-with.js';

export const meta = { duration: 4.4, beats: [[0, '平日はスーツ'], [1.3, '週末になる'], [2.6, 'ジーンズとTシャツ']] };

export function create(k) {
  const { el, pal, tf } = k, S = 1.45;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // 1週間の表（土日に色）
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'], X0 = 109, DW = 28;
  el('rect', { x: X0 - 8, y: 26, width: DW * 7 + 14, height: 40, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  days.forEach((d, i) => {
    if (i > 4) el('rect', { x: X0 + i * DW, y: 32, width: DW - 4, height: 28, rx: 5, fill: '#FFE9B0' });
    k.text(X0 + i * DW + 12, 47, d, { 'font-size': 14, fill: i > 4 ? pal.coralDark : pal.sub });
  });
  const ring = el('rect', { x: -14, y: -16, width: 28, height: 32, rx: 7, fill: 'none', stroke: pal.coral, 'stroke-width': 3 });
  // 窓とハンガー掛け
  el('rect', { x: 300, y: 92, width: 70, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('path', { d: 'M 314 196 q 10 -26 24 -8 q 14 -22 22 6', fill: 'none', stroke: '#9ED3B2', 'stroke-width': 0 });
  const b = k.buddy({ x: 200, y: FY, scale: S });
  const W = wardrobe(k, b);
  // 平日：スーツ
  const suitB = W.bottom({ kind: 'trousers', color: '#596377', dark: '#444D5F' });
  const suitT = W.top({ color: '#3E4A66', dark: '#2B3449', sleeve: 'long', to: -16, neck: 'v' });
  const tie = W.tie(pal.coral, pal.coralDark);
  // 週末：ジーンズ＋白いTシャツ
  const jB = W.bottom({ kind: 'jeans', color: '#4A78C2', dark: '#355C99' });
  const jT = W.top({ color: '#fff', dark: pal.line, sleeve: 'short', to: -16 });
  W.feet('shoe', '#fff');
  const show = (parts, on) => parts.forEach((n) => n && n.setAttribute('display', on ? 'inline' : 'none'));
  const suit = [suitB.g, ...suitB.lg, suitT.g, suitT.cl, ...suitT.sl.map((s) => s.s), tie];
  const casual = [jB.g, ...jB.lg, jT.g, jT.cl, ...jT.sl.map((s) => s.s)];
  const sp = [0, 1, 2].map(() => star(k, k.root, 8));
  return {
    update(t) {
      // 曜日の印：金 → 土 → 日
      const d = 4 + easeInOut(seg(t, 1.1, 1.5)) + easeInOut(seg(t, 3.3, 3.7));
      tf(ring, X0 + d * DW + 12, 46);
      // くるっと回って着替える
      const spin = seg(t, 1.6, 2.3), fc = Math.cos(spin * Math.PI * 2);
      const weekend = spin > 0.25;
      show(suit, !weekend); show(casual, weekend);
      const relax = easeInOut(seg(t, 2.6, 3.1)) * (1 - easeInOut(seg(t, 3.9, 4.3)));
      P(b, { x: 200, facing: Math.abs(fc) < 0.06 ? 0.06 * Math.sign(fc || 1) : fc, lift: 10 * hump(spin),
        squash: 1 + 0.04 * wobble(seg(t, 2.3, 2.9), 2, 5), armL: 8 + 150 * relax, armR: 8 + 150 * relax, look: t < 1.1 ? -0.3 : 0.2,
        mood: weekend ? 'grin' : 'flat', blink: relax > 0.5 ? 1 : blinkAt(t) });
      sp.forEach((s, i) => {
        const q = seg(t, 2.0 + i * 0.08, 2.7 + i * 0.08), a = i * 2.1 + 0.5;
        tf(s, 200 + Math.cos(a) * (40 + 30 * q), FY - 70 + Math.sin(a) * (40 + 30 * q), q * 90, hump(q) + 0.001);
      });
    }
  };
}
