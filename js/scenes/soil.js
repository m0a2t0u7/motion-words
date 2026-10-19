// soil：畑の黒くふかふかした土を、まめが手ですくって確かめる。土からニンジンとキャベツが大きく育ち、親指を立てる（例文 This soil is good for vegetables.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { scene, hills, hp, reach, P, blinkAt, popIn } from './nature.js';

export const meta = { duration: 4.4, beats: [[0, '畑の土'], [1.0, 'ふかふか'], [2.6, '野菜がよく育つ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const { FY } = scene(k, { FY: 236, ground: '#C9B08A', edge: '#B89C74' });
  hills(k, FY);
  // 畝（断面）：黒い土、ミミズ
  el('path', { d: `M 150 ${FY + 4} Q 260 ${FY - 30} 380 ${FY + 4} V 300 H 150 Z`, fill: '#5A3E2B' });
  [[200, FY + 30], [300, FY + 44], [240, FY + 50], [340, FY + 22]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 2.5, fill: '#7A5A40' }));
  const worm = el('path', { d: '', stroke: '#E89A9A', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' });
  // 野菜
  const vegs = [190, 250, 310].map((x, i) => {
    const v = g({});
    if (i !== 1) { el('path', { d: 'M -7 0 L 0 34 L 7 0 Z', fill: '#FF8A3C' }, v); [-6, 0, 6].forEach((dx) => el('path', { d: `M 0 0 Q ${dx * 2} -16 ${dx * 3} -26`, stroke: '#4FAE5F', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, v)); }
    else { el('circle', { cx: 0, cy: -4, r: 18, fill: '#8FD07A' }, v); el('circle', { cx: -8, cy: -6, r: 12, fill: '#A8DD92' }, v); el('circle', { cx: 8, cy: -6, r: 12, fill: '#7BC468' }, v); }
    return { v, x, y: FY - 14 - (i === 1 ? 0 : 0) };
  });
  const b = k.buddy({ x: 100, y: FY, scale: S });
  const clump = el('ellipse', { rx: 8, ry: 5, fill: '#5A3E2B' });
  return {
    update(t) {
      const dip = hump(seg(t, 0.4, 1.4)), hold = seg(t, 0.9, 2.4);
      P(b, { lean: 18 * dip, squash: 1 - 0.06 * dip, look: 0.6, mood: t > 2.6 ? 'grin' : 'smile', blink: blinkAt(t), armL: 10 });
      const tx = t < 0.9 ? lerp(140, 170, seg(t, 0.4, 0.9)) : lerp(170, 128, easeInOut(seg(t, 0.9, 1.4)));
      const ty = t < 0.9 ? lerp(FY - 30, FY - 6, seg(t, 0.4, 0.9)) : lerp(FY - 6, FY - 60, easeInOut(seg(t, 0.9, 1.4)));
      const thumb = easeOut(seg(t, 3.0, 3.4));
      b.pose({ armR: lerp(reach(b, S, 'R', tx, ty), 150, thumb) });
      const h = hp(b, S, 'R', 30);
      tf(clump, h.x, h.y - 3, 0, hold > 0 && t < 3.0 ? 1 + 0.1 * Math.sin(t * 10) * (t > 1.4 ? 1 : 0) : 0.001);
      vegs.forEach(({ v, x, y }, i) => { const p = easeOut(seg(t, 1.6 + i * 0.3, 2.4 + i * 0.3)); tf(v, x, FY - 8, 0, Math.max(0.001, 0.3 + 0.9 * popIn(p))); });
      const wp = t * 3;
      worm.setAttribute('d', `M 270 ${FY + 36} q 6 ${-4 * Math.sin(wp)} 12 0 t 12 0`);
    }
  };
}
