// thank：同僚が重い箱を押して運んでくれ、ありがとうと頭を下げる（例文 I want to thank you for your help.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble } from '../ease.js';
import { gait, heart, bubble } from './weigh.js';

export const meta = { duration: 5.0, beats: [[0, '運んでくれる'], [2.8, '頭を下げる'], [3.9, '感謝を伝える']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 40, y: 50, width: 90, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // ドア（右）
  el('rect', { x: 318, y: FY - 112, width: 66, height: 112, rx: 4, fill: pal.blue });
  el('circle', { cx: 372, cy: FY - 54, r: 4, fill: pal.yellow });
  const S = 1.1;
  const me = k.buddy({ x: 338, y: FY, scale: S, facing: -1 });
  const he = k.buddy({ x: 20, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  // 荷物の箱（押される）
  const box = g({});
  k.shadow(0, 0, 36, 5, box);
  el('rect', { x: -34, y: -58, width: 68, height: 58, rx: 4, fill: '#D7AE78', stroke: '#B88C55', 'stroke-width': 2 }, box);
  el('rect', { x: -8, y: -58, width: 16, height: 58, fill: '#E9C998' }, box);
  const bub = bubble(k, 92, 36); k.text(-12, 0, 'Thanks!', { 'font-size': 16 }, bub);
  heart(k, g({}, bub), pal.red); bub.lastChild.setAttribute('transform', 'translate(32 0)');
  return {
    update(t) {
      const bx = (tt) => lerp(70, 236, easeInOut(seg(tt, 0.2, 2.0)));
      const gt = gait((tt) => bx(tt) - 62, t, 8, 6, 0.1);
      const push = 1 - seg(t, 2.0, 2.4);
      he.pose({ x: bx(t) - 62 + 0, walk: gt.walk, lean: lerp(4, 16, gt.m) * push + 3 * (1 - push), armR: lerp(60, 82, push) , armL: 8, look: 0.4, mood: t < 2.1 ? 'open' : 'smile', squash: 1 - 0.03 * push });
      tf(box, bx(t) + 0, FY, 0);
      // 手を振って「どういたしまして」
      if (t > 2.6) he.pose({ armR: lerp(88, 120 + 18 * Math.sin((t - 2.6) * 9), easeOut(seg(t, 2.6, 3.1))), lean: 0 });
      // 自分：深くお辞儀して、顔を上げてありがとう
      const bow = easeInOut(seg(t, 2.1, 2.9)) * (1 - easeInOut(seg(t, 3.2, 3.8)));
      me.pose({ lean: 28 * bow, armR: lerp(8, 55, bow), armL: 8 + 10 * bow, squash: 1 - 0.05 * bow, look: 0.3, mood: t < 3.4 ? 'smile' : 'grin' });
      tf(bub, 318, 98 - 3 * easeOut(seg(t, 3.4, 3.8)));
      bub.setAttribute('opacity', easeOut(seg(t, 3.3, 3.6)));
    }
  };
}
