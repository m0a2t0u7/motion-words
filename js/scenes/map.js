// map：出発前に、2人で地図を広げて道順を確かめ、行く方向を指さす（例文 Let's check the map before we go.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, reach, P, blinkAt, face } from './bag.js';
import { parkBg, tree } from './run-after.js';
import { sign } from './queue-up.js';

export const meta = { duration: 4.4, beats: [[0, '地図を広げる'], [1.2, '道を確かめる'], [3.2, 'あっちへ行こう']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.1, FY = 236;
  parkBg(k, FY);
  tree(k, 40, FY - 4, 0.9); tree(k, 370, FY - 4, 0.8);
  sign(k, 330, FY, '', { w: 50, h: 22 });
  el('path', { d: `M 316 ${FY - 57} h 22 v -5 l 10 8 l -10 8 v -5 h -22 Z`, fill: pal.green });
  const a = k.buddy({ x: 130, y: FY, scale: S });
  const c = k.buddy({ x: 250, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const mp = k.g({});
  const sheet = k.g({}, mp);
  el('rect', { x: -40, y: -26, width: 80, height: 52, rx: 2, fill: '#F3EFD8', stroke: '#C9B98A', 'stroke-width': 1.5 }, sheet);
  [-13, 13].forEach((x) => el('line', { x1: x, y1: -26, x2: x, y2: 26, stroke: '#C9B98A', 'stroke-width': 1, opacity: 0.6 }, sheet));
  el('path', { d: 'M -40 8 Q -10 -4 10 10 T 40 -2', stroke: pal.water, 'stroke-width': 5, fill: 'none' }, sheet);
  el('circle', { cx: 18, cy: -14, r: 7, fill: '#9ED3B2' }, sheet);
  const route = el('path', { d: 'M -30 18 L -12 -6 L 8 -2 L 26 -16', stroke: pal.red, 'stroke-width': 2.4, fill: 'none', 'stroke-dasharray': 70, 'stroke-dashoffset': 70 }, sheet);
  el('circle', { cx: -30, cy: 18, r: 3, fill: pal.red }, sheet);
  const pin = el('path', { d: 'M 26 -16 l -4 -8 a 4 4 0 1 1 8 0 Z', fill: pal.red, opacity: 0 }, sheet);
  return {
    update(t) {
      const open = easeOut(seg(t, 0.2, 0.9));
      const fold = easeInOut(seg(t, 2.9, 3.3));
      const w = lerp(0.15, 1, open) * lerp(1, 0.2, fold);
      const M = { x: 190, y: FY - 76 };
      P(a, { x: 130, look: 0.6, blink: blinkAt(t), lean: 6, mood: t > 3.3 ? 'grin' : 'smile' });
      P(c, { x: 250, facing: -1, look: 0.6, blink: blinkAt(t, 1), lean: 6, mood: 'smile' });
      face(a, 4, 3); face(c, 4, 3);
      const half = 40 * w;
      a.pose({ armR: reach(a, S, 'R', M.x - half, M.y) });
      c.pose({ armR: reach(c, S, 'R', fold > 0 ? M.x - half : M.x + half, M.y) });
      tf(mp, M.x - (fold > 0 ? 40 - half : 0) * 0, M.y + 2, 0, 1);
      tf(sheet, 0, 0, 0, w, 1);
      route.setAttribute('stroke-dashoffset', 70 * (1 - easeInOut(seg(t, 1.1, 2.4))));
      pin.setAttribute('opacity', t > 2.4 ? 1 : 0);
      // うなずき合う → 地図をたたんで、まめが道の先を指す
      const nod = hump(seg(t, 2.4, 2.8));
      a.pose({ squash: 1 - 0.05 * nod });
      if (t > 3.3) {
        const pt = easeOut(seg(t, 3.3, 3.7));
        a.pose({ armR: lerp(reach(a, S, 'R', M.x - half, M.y), 95, pt), look: 1 });
        mp.setAttribute('opacity', 1);
        const ch = hp(c, S, 'R'); tf(mp, ch.x, ch.y + 2);
      }
    }
  };
}
