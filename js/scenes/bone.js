// bone：犬がほねのおもちゃを前足でおさえて、ガジガジかんでいる（例文 The dog is chewing a bone.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './body.js';
import { parkBg } from './bench.js';

export const meta = { duration: 4.2, beats: [[0, 'ほねを見つける'], [1.2, 'ガジガジ'], [3.0, 'かみ続ける']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236;
  parkBg(k, FY);
  // 犬小屋
  el('path', { d: `M 290 ${FY} V ${FY - 60} L 330 ${FY - 96} L 370 ${FY - 60} V ${FY} Z`, fill: '#E57B6E' });
  el('path', { d: `M 280 ${FY - 58} L 330 ${FY - 104} L 380 ${FY - 58}`, stroke: '#B85A50', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' });
  el('path', { d: `M 314 ${FY} V ${FY - 30} Q 330 ${FY - 46} 346 ${FY - 30} V ${FY} Z`, fill: '#5A3E36' });
  // ふせた犬（横向き、頭が左）
  const dog = g({});
  k.shadow(0, 0, 50, 6, dog);
  el('path', { d: 'M 40 -14 q 16 -4 20 -18', stroke: '#D9A46C', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, dog);
  const tail = dog.lastChild;
  el('ellipse', { cx: 14, cy: -16, rx: 34, ry: 15, fill: '#D9A46C' }, dog);
  [[-14, 1], [-24, 0]].forEach(([x]) => el('ellipse', { cx: x, cy: -3, rx: 12, ry: 5, fill: '#C38F57' }, dog));
  const head = g({}, dog);
  el('circle', { cx: 0, cy: 0, r: 15, fill: '#D9A46C' }, head);
  el('ellipse', { cx: -13, cy: 5, rx: 9, ry: 7, fill: '#F2D2AE' }, head);
  el('circle', { cx: -20, cy: 2, r: 3, fill: pal.ink }, head);
  const eye = el('ellipse', { cx: -5, cy: -4, rx: 2.4, ry: 2.8, fill: pal.ink }, head);
  el('ellipse', { cx: 6, cy: -6, rx: 5, ry: 11, fill: '#B07C47', transform: 'rotate(20 6 -6)' }, head);
  const jaw = el('path', { d: 'M -20 9 Q -12 14 -4 9', stroke: pal.ink, 'stroke-width': 2, fill: 'none' }, head);
  // ほね（前足の間）
  const bone = g({}, dog);
  el('rect', { x: -14, y: -3.5, width: 28, height: 7, rx: 3, fill: '#fff', stroke: '#D5DCE5', 'stroke-width': 1.5 }, bone);
  [[-14, -4], [-14, 4], [14, -4], [14, 4]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 5, fill: '#fff', stroke: '#D5DCE5', 'stroke-width': 1.5 }, bone));
  el('rect', { x: -13, y: -2.5, width: 26, height: 5, fill: '#fff' }, bone);
  const pawF = el('ellipse', { rx: 9, ry: 5, fill: '#C38F57' }, dog);
  return {
    update(t) {
      tf(dog, 190, FY, 0, 1.6);
      const chew = t > 1.0 ? Math.sin(t * 16) : 0;
      const tilt = t > 1.0 ? 10 * Math.sin(t * 3) : 0;
      tf(head, -30, -22 + 2 * chew, -20 + tilt);
      jaw.setAttribute('transform', `translate(0 ${(1.5 * chew).toFixed(2)})`);
      eye.setAttribute('ry', t > 1.0 && chew > 0.6 ? 0.8 : 2.8);
      tail.setAttribute('transform', `rotate(${(20 * Math.sin(t * 10)).toFixed(1)} 40 -14)`);
      // ほねを口の横でくわえ、前足でおさえる
      const pick = easeOut(seg(t, 0.4, 1.0));
      tf(bone, lerp(-62, -50, pick), lerp(-4, -12 + 2 * chew, pick), lerp(0, -30 + tilt, pick));
      k.set(pawF, { cx: lerp(-30, -42, pick), cy: -4 });
    }
  };
}
