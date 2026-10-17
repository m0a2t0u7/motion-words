// by the skin of one's teeth：合格ラインにぎりぎりで届き、ほっと胸をなでおろす（例文 He passed the test by the skin of his teeth.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '点数を待つ'], [1.6, 'ぎりぎり届く'], [3.0, 'ほっとする']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'indoor' });
  // 縦ゲージ
  const GX = 292, GB = 224, GT = 50, LINE = 108;
  el('rect', { x: GX - 22, y: GT, width: 44, height: GB - GT, rx: 10, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 3 });
  const fill = el('rect', { x: GX - 16, y: GB - 6, width: 32, height: 0, rx: 6, fill: pal.blue });
  el('line', { x1: GX - 40, y1: LINE, x2: GX + 40, y2: LINE, stroke: pal.red, 'stroke-width': 4, 'stroke-dasharray': '8 5', 'stroke-linecap': 'round' });
  k.text(GX + 62, LINE, 'PASS', { 'font-size': 13, fill: pal.red });
  // 虫めがね風の拡大（すき間が小さいことを示す）
  const gap = g({});
  el('path', { d: 'M -14 0 L -6 0 M 6 0 L 14 0', stroke: pal.ink, 'stroke-width': 2, 'stroke-linecap': 'round' }, gap);
  const tag = g({});
  el('rect', { x: -24, y: -13, width: 48, height: 26, rx: 13, fill: pal.green }, tag);
  el('path', { d: 'M -9 0 L -3 6 L 9 -6', fill: 'none', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, tag);

  const b = k.buddy({ x: 130, y: FY, scale: 1.1 });
  const base = { armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0.9, mood: 'flat', blink: 0, lift: 0 };
  const sweat = [0, 1].map(() => el('path', { d: 'M 0 -9 Q 6 0 0 6 Q -6 0 0 -9 Z', fill: pal.water, stroke: pal.blueDark, 'stroke-width': 1.5 }));

  return {
    update(t) {
      // ゲージ：上がって、ラインに「ぴったり少し上」でとまる
      const rise = easeOut(seg(t, 0.4, 2.0));
      const topY = lerp(GB - 6, LINE - 3, rise);
      const flick = t > 1.6 && t < 2.2 ? wobble(seg(t, 1.6, 2.2), 2, 5) * 2 : 0;
      const y = topY + flick;
      k.set(fill, { y: y, height: GB - 6 - y, fill: rise >= 1 ? pal.green : pal.blue });
      const tp = backOut(seg(t, 2.1, 2.5), 2);
      tf(tag, GX, LINE - 36, 0, tp, tp);
      // まめ：緊張→ほっとして胸をなでおろす
      const relief = easeInOut(seg(t, 2.4, 3.1));
      const tense = t < 2.4;
      b.pose({ ...base, armL: tense ? 150 : lerp(150, 30, relief), armR: tense ? 150 : lerp(150, 60, relief), lean: tense ? 4 : lerp(4, -8, relief), squash: tense ? 1 : 1 - 0.05 * hump(relief), mood: tense ? 'sad' : 'smile', blink: relief > 0.5 ? 0.8 : 0, look: 0.9 });
      sweat.forEach((s, i) => {
        const p = tense ? ((t * 1.3 + i * 0.5) % 1) : 0;
        tf(s, 150 + i * 28, 118 + 28 * p, 0, t > 0.8 && tense ? 1 : 0, 1);
      });
    }
  };
}
