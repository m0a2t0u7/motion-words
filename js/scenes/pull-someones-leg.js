// pull someone's leg：まめが大げさな作り話（UFO を見た！）をして、相手が信じかけたところで「冗談だよ」と笑う（例文 Are you pulling my leg?）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '大げさな話'], [1.6, '信じかける'], [3.0, '冗談だよ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  const A = k.buddy({ x: 110, y: FY, scale: 1.0, color: pal.coral, dark: pal.coralDark });
  const B = k.buddy({ x: 290, y: FY, scale: 1.0, facing: -1 });
  // UFOの吹き出し
  const bub = g({});
  el('ellipse', { rx: 50, ry: 38, fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 2.5 }, bub);
  el('path', { d: 'M -14 30 L -28 52 L 4 34 Z', fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 2.5 }, bub);
  el('ellipse', { rx: 49, ry: 37, fill: '#fff' }, bub);
  el('ellipse', { cx: 0, cy: -6, rx: 13, ry: 11, fill: '#BFE0F8' }, bub);
  el('ellipse', { cx: 0, cy: 3, rx: 28, ry: 8, fill: pal.violet }, bub);
  [-16, 0, 16].forEach((x) => el('circle', { cx: x, cy: 4, r: 2.5, fill: pal.yellow }, bub));
  el('path', { d: 'M -12 12 L -18 28 L 18 28 L 12 12 Z', fill: pal.yellow, opacity: 0.4 }, bub);
  // はてな
  const q = g({});
  k.text(0, 0, '?', { 'font-size': 28, fill: pal.sub }, q);
  const ha = g({});
  k.text(0, 0, 'ha ha!', { 'font-size': 17, fill: pal.coralDark }, ha);
  return {
    update(t) {
      const tell = t < 3.0;
      const talk = tell ? Math.sin(t * 10) : 0;
      const bp = backOut(seg(t, 0.3, 0.9), 1.8) * (t < 3.0 ? 1 : 1 - easeOut(seg(t, 3.0, 3.4)));
      tf(bub, 150, 80, 0, bp, bp);
      bub.setAttribute('opacity', bp > 0.01 ? 1 : 0);
      const laugh = t > 3.0 ? Math.sin(t * 22) : 0;
      A.pose({
        armR: tell ? 110 + 20 * talk : 150 + 15 * laugh, armL: tell ? 8 : 130 - 15 * laugh,
        mood: tell ? (talk > 0 ? 'open' : 'smile') : 'grin',
        lean: tell ? 3 : -8 + 2 * laugh, lift: t > 3.0 ? 5 * Math.abs(laugh) : 0,
        blink: t > 3.1 ? 0.8 : 0, look: 0.2
      });
      const believe = seg(t, 1.2, 1.9);
      B.pose({
        armR: 8, armL: 8, look: -0.4,
        mood: t < 1.2 ? 'smile' : t < 2.8 ? (believe > 0.5 ? 'open' : 'flat') : 'flat',
        lean: -5 * hump(seg(t, 1.2, 2.0)), squash: 1 - 0.03 * hump(seg(t, 1.2, 1.8)),
        blink: t > 3.0 && t < 3.3 ? 1 : 0
      });
      // 相手：信じかける(！) → 疑う(？)
      const sp = backOut(seg(t, 1.6, 2.0), 2) * (1 - easeOut(seg(t, 2.6, 2.8)));
      const qp = backOut(seg(t, 2.8, 3.2), 2.2);
      tf(q, 292, FY - 118, 8 * wobble(seg(t, 2.8, 4.0), 2, 2), qp, qp);
      q.setAttribute('opacity', t < 2.8 ? 0 : 1);
      const hp = backOut(seg(t, 3.1, 3.5), 2);
      tf(ha, 118, FY - 124, -6, hp, hp);
      ha.setAttribute('opacity', t < 3.1 ? 0 : 1);
    }
  };
}
