// suffer：ひどい頭痛がズキズキ続き、まめが頭を抱えて苦しむ（例文 He suffers from a bad headache.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { reach } from './dig.js';
import { P, blinkAt, sofa } from './run-after.js';
import { roomBg } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '頭が痛い'], [1.2, '頭を抱える'], [2.6, 'ずっと苦しい']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const so = sofa(k, 300, FY, 140);
  so.front();
  const S = 1.05;
  const me = k.buddy({ x: 170, y: FY, scale: S });
  // 頭のズキズキ（ギザギザ線と赤い光）
  const ache = el('ellipse', { cx: 0, cy: -66, rx: 24, ry: 14, fill: pal.red, opacity: 0 }, me.body.children[3]);
  const zz = [-1, 1].map((d) => {
    const z = g({});
    el('path', { d: 'M 0 0 L 8 -6 L 4 -10 L 14 -16 L 10 -20 L 20 -26', stroke: pal.red, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', transform: `scale(${d} 1)` }, z);
    return [z, d];
  });
  return {
    update(t) {
      const hit = seg(t, 0.5, 0.75);
      const grab = easeOut(seg(t, 0.7, 1.2));
      const pulse = t > 0.5 ? Math.pow(Math.max(0, Math.sin((t - 0.5) * 7)), 3) : 0;
      const sway = Math.sin(t * 2.4) * 4 * seg(t, 1.5, 2.2);
      P(me, { x: 170, lean: 14 * grab + sway - 6 * hump(hit), squash: 1 - 0.07 * grab - 0.03 * pulse, look: 0,
        mood: t < 0.5 ? 'smile' : 'sad', blink: t < 0.5 ? blinkAt(t) : 0.7 + 0.25 * pulse, lift: 0 });
      // 両手で頭を押さえる
      const st = me.state;
      const hx = 170 + Math.sin(st.lean * Math.PI / 180) * 70 * S;
      const target = { L: hx - 22 * S, R: hx + 22 * S, y: FY - 82 * S };
      me.pose({ armL: lerp(8, reach(me, S, 'L', target.L, target.y), grab), armR: lerp(8, reach(me, S, 'R', target.R, target.y), grab) });
      ache.setAttribute('opacity', 0.08 + 0.22 * pulse * (t > 0.5 ? 1 : 0));
      zz.forEach(([z, d]) => {
        tf(z, hx + d * 40 * S, FY - 92 * S, 0, 0.8 + 0.4 * pulse);
        z.setAttribute('opacity', t > 0.5 ? 0.35 + 0.65 * pulse : 0);
      });
    }
  };
}
