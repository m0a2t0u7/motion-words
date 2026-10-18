// watch out：道を歩くまめに友だちが「気をつけて！」→まめが穴のふちで止まり、ふらついて下がる（例文 Watch out! There is a hole in the road.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { say, faceAt, walkPose } from './look-over.js';
import { streetBg } from './weigh.js';
import { road } from './look-out.js';

export const meta = { duration: 4.0, beats: [[0, '道を歩く'], [1.3, '気をつけて！'], [2.6, '穴の手前で止まる']] };

export function create(k) {
  const { el, pal } = k;
  k.backdrop({ floorY: 236 });
  [[10, 80, '#E4EEF7'], [110, 110, '#F3E6DC'], [220, 70, '#E6F1E8'], [320, 100, '#E4EEF7']].forEach(([x, h, c]) => el('rect', { x, y: 220 - h, width: 82, height: h, rx: 4, fill: c }));
  road(k, 222);
  // 穴（道に開いた穴）
  el('ellipse', { cx: 312, cy: 240, rx: 40, ry: 9, fill: '#7D8693' });
  el('ellipse', { cx: 312, cy: 242, rx: 34, ry: 6.5, fill: '#4A5260' });
  [[274, 236, -20], [350, 236, 20]].forEach(([x, y, r]) => el('path', { d: 'M -6 0 L 6 0 L 3 -5 Z', fill: '#9AA3AF', transform: `translate(${x} ${y}) rotate(${r})` }));
  const fr = k.buddy({ x: 70, y: 240, scale: 0.8, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 140, y: 240, scale: 0.85 });
  const bub = say(k, 34, 34, -1); k.text(0, 0, '!', { 'font-size': 24, fill: pal.red }, bub.g);
  const xf = (t) => lerp(130, 250, easeOut(seg(t, 0.2, 1.7))) - 14 * easeInOut(seg(t, 2.4, 3.0));
  return {
    update(t) {
      const p = walkPose(xf, t, 130);
      const tot = hump(seg(t, 1.6, 2.6));
      b.pose({ x: p.x, walk: p.walk, armL: p.armL + 70 * tot + 20 * wobble(seg(t, 1.6, 2.6), 2, 3), armR: p.armR + 90 * tot, lean: p.lean + 10 * wobble(seg(t, 1.6, 2.8), 1.5, 2.5) - 8 * hump(seg(t, 2.4, 3.0)),
        mood: t > 1.4 ? (t > 3.2 ? 'flat' : 'open') : 'smile', look: 0.6 });
      faceAt(b, t > 1.5 ? 5 : 3, t > 1.5 ? 7 : 0);
      fr.pose({ armR: 8 + 82 * easeOut(seg(t, 1.0, 1.2)), armL: 8 + 120 * hump(seg(t, 1.0, 2.0)), mood: t > 1.0 && t < 2.6 ? 'open' : 'smile', look: 0.6, lean: 6 * hump(seg(t, 1.0, 2.0)) });
      bub.show(seg(t, 1.05, 1.2) * (1 - seg(t, 2.8, 3.0)), 104, 138);
    }
  };
}
