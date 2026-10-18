// fall over：杖をついた老人が歩いていて石につまずき、横に倒れる（例文 The old man tripped and fell over.）
import { seg, lerp, easeInOut, easeIn, easeOut, wobble } from '../ease.js';
import { gait, streetBg } from './weigh.js';
import { held } from './dig.js';

export const meta = { duration: 3.8, beats: [[0, '歩いている'], [1.4, 'つまずく'], [2.6, '倒れた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  el('path', { d: 'M 222 237 Q 230 226 240 237 Z', fill: '#9AA3B2' });
  k.shadow(231, 238, 12, 2.5);
  const sh = k.shadow(0, 238, 30, 6);
  const P = g({});
  const B = k.buddy({ parent: P, x: 0, y: 0, scale: 0.85, color: '#9FD9C9', dark: '#6FB3A0' });
  B.g.children[0].setAttribute('opacity', 0);
  // 白い眉とひげ（老人）
  el('path', { d: 'M -16 -64 Q -10 -68 -4 -64 M 4 -64 Q 10 -68 16 -64', stroke: '#fff', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, B.body.children[3]);
  const cane = g({});
  el('path', { d: 'M 0 -2 L 0 38 M 0 -2 Q 0 -8 -6 -8', stroke: pal.coffee, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, cane);
  const xf = (t) => lerp(70, 214, seg(t, 0, 1.45));
  return {
    update(t) {
      const p = gait(xf, t, 70, 8);
      const trip = seg(t, 1.45, 1.75), fall = easeIn(seg(t, 1.6, 2.3)), land = seg(t, 2.3, 2.9);
      const rot = lerp(0, 90, fall) - 4 * wobble(land, 1.5, 5) + 8 * Math.sin(trip * Math.PI) * (1 - fall);
      const x = p.x + 14 * easeOut(trip);
      B.pose({ x: 0, walk: t < 1.45 ? p.walk : lerp(p.walk, p.walk + 1.2, trip), armL: lerp(p.armL, 150, easeOut(seg(t, 1.5, 1.9))), armR: t < 1.5 ? 50 : lerp(50, 120, easeOut(seg(t, 1.5, 1.9))), lean: 0, mood: t > 1.5 ? 'open' : 'flat', look: 0.6, squash: 1 - 0.06 * Math.abs(wobble(land, 2, 6)) });
      if (t > 2.4) B.pose({ mood: 'sad' });
      tf(P, x, FY - 27 * fall, rot);
      held(k, B, 0.85, cane, 'R', 0);
      const cf = seg(t, 1.6, 2.2);
      if (cf > 0) tf(cane, lerp(x + 30, x + 96, easeOut(cf)), lerp(FY - 40, FY - 3, easeIn(cf)), lerp(-10, -90, easeIn(cf)) + 4 * wobble(seg(t, 2.2, 2.7), 2, 6));
      else cane.setAttribute('transform', `translate(${x} ${FY}) rotate(${rot}) ` + cane.getAttribute('transform'));
      tf(sh, x + 40 * fall, 0, 0, lerp(1, 1.8, fall), 1);
    }
  };
}
