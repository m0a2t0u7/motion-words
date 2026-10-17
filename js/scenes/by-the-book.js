// by the book：マニュアルを確認しながら、手順どおりにきっちり並べる（例文 He does everything by the book.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '本を確認'], [1.3, '手順どおり'], [3.2, 'きっちり完了']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 本（台の上、開いたマニュアル）
  const bk = g({});
  tf(bk, 62, FY - 78);
  el('rect', { x: -4, y: 44, width: 8, height: 34, fill: pal.woodDark }, bk);
  el('path', { d: 'M -44 0 L 0 6 L 44 0 L 44 46 L 0 52 L -44 46 Z', fill: '#FFFFFF', stroke: '#B9C3D2', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, bk);
  el('line', { x1: 0, y1: 6, x2: 0, y2: 52, stroke: '#B9C3D2', 'stroke-width': 2 }, bk);
  const checks = [0, 1, 2].map((i) => {
    k.text(-32, 15 + i * 12, String(i + 1), { 'font-size': 8, fill: pal.sub }, bk);
    el('line', { x1: -24, y1: 15 + i * 12, x2: -6, y2: 15 + i * 12, stroke: '#D5DBE5', 'stroke-width': 3, 'stroke-linecap': 'round' }, bk);
    return el('path', { d: `M 8 ${15 + i * 12} L 12 ${19 + i * 12} L 20 ${10 + i * 12}`, fill: 'none', stroke: pal.green, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 }, bk);
  });
  // 棚（並べる場所）
  el('rect', { x: 236, y: FY - 6, width: 140, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 236, y: FY - 100, width: 140, height: 3, fill: pal.line, opacity: 0.8 });
  const slots = [262, 306, 350];
  const colors = [pal.blue, pal.mint, pal.yellow];
  const blocks = slots.map((x, i) => {
    const bl = g({});
    el('rect', { x: -15, y: -30, width: 30, height: 30, rx: 5, fill: colors[i] }, bl);
    return bl;
  });
  el('rect', { x: 192, y: FY - 26, width: 40, height: 5, rx: 2, fill: pal.wood });
  el('rect', { x: 196, y: FY - 21, width: 5, height: 21, fill: pal.woodDark });
  el('rect', { x: 223, y: FY - 21, width: 5, height: 21, fill: pal.woodDark });
  const b = k.buddy({ x: 150, y: FY, scale: 1 });
  const base = { armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'flat', blink: 0, lift: 0 };
  const T = [0.9, 1.8, 2.7];

  return {
    update(t) {
      // どの段階か
      let cur = 0;
      T.forEach((tt, i) => { if (t >= tt) cur = i + 1; });
      const i = Math.min(cur, 2);
      const phase = t - T[i];
      const peek = cur === 0 || (cur < 3 && phase < 0.35); // 本を見る
      const lastDone = cur === 3 && t > T[2] + 0.7;
      const putP = easeInOut(seg(t, T[i] + 0.35, T[i] + 0.8));
      const holding = cur < 3 || t < T[2] + 0.8;
      b.pose({ ...base, facing: peek ? -1 : 1, armR: peek ? 8 : lerp(80, 95, putP) , armL: peek ? 8 : lerp(70, 80, putP), look: peek ? 0.2 : 0, mood: lastDone ? 'grin' : 'flat', lean: peek ? 3 : 0, squash: 1 });
      const hR = b.handPos('R');
      blocks.forEach((bl, n) => {
        const done = t >= T[n] + 0.8;
        const p = easeInOut(seg(t, T[n] + 0.35, T[n] + 0.8));
        if (done) tf(bl, slots[n], FY - 6, 0, 1, 1);
        else if (n === cur || (cur === 3 && n === 2)) tf(bl, lerp(212, slots[n], p), lerp(FY - 26, FY - 6, p) - 30 * hump(p), 0, 1, 1);
        else tf(bl, 212, FY - 26, 0, 0.0001, 0.0001);
        bl.setAttribute('opacity', done || n === cur ? 1 : 0);
      });
      checks.forEach((c, n) => c.setAttribute('opacity', t >= T[n] + 0.8 ? 1 : 0));
      tf(bk, 62, FY - 78 - 3 * (peek ? 1 : 0));
    }
  };
}
