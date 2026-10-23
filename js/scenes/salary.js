// salary：上司から給料の封筒を受け取り、コインが出て積み上がる（例文 She gets a good salary.）
import { seg, lerp, easeOut, easeInOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk } from './look-over.js';
import { reach } from './weigh.js';

export const meta = { duration: 4.2, beats: [[0, '封筒を渡される'], [1.6, '受け取る'], [2.8, 'コインが貯まる']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const boss = k.buddy({ x: 300, y: FY, scale: 0.9, facing: -1, color: pal.coral, dark: pal.coralDark });
  desk(k, 240, 120, 200);
  const b = k.buddy({ x: 120, y: FY, scale: S });
  const env = g({});
  el('rect', { x: -15, y: -10, width: 30, height: 20, rx: 2, fill: '#F7EBD0', stroke: '#E2CC9C', 'stroke-width': 1.5 }, env);
  el('path', { d: 'M -15 -10 L 0 3 L 15 -10', fill: 'none', stroke: '#E2CC9C', 'stroke-width': 1.5 }, env);
  const coins = [0, 1, 2, 3, 4].map(() => { const c = g({}); el('ellipse', { rx: 11, ry: 4.5, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, c); return c; });
  const hand = [el('circle', { r: 5.5, fill: pal.coral, stroke: pal.coralDark, 'stroke-width': 2 }), el('circle', { r: 6, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2 })];
  return {
    update(t) {
      const hv = easeInOut(seg(t, 0.4, 1.6)), back = easeInOut(seg(t, 2.0, 2.6));
      const ex = lerp(lerp(262, 180, hv), 148, back), ey = lerp(172, 176, back);
      P(boss, { facing: -1, armL: 8, armR: 8, look: 0.8, mood: 'smile', blink: blinkAt(t) });
      boss.pose({ armR: lerp(20, reach(boss, 0.9, 'R', ex + 4, ey), easeOut(seg(t, 0.2, 0.8))) * (1 - seg(t, 1.7, 2.1)) + 8 * seg(t, 1.7, 2.1) });
      P(b, { armL: 8, armR: 8, look: 0.5, mood: t > 2.7 ? 'grin' : 'smile', blink: blinkAt(t), lean: 2 * seg(t, 0.8, 1.4) });
      b.pose({ armR: lerp(20, reach(b, S, 'R', ex - 4, ey), easeOut(seg(t, 0.9, 1.5))) });
      tf(env, ex, ey, 0, 1, 1);
      k.set(hand[0], { cx: ex + 12, cy: ey }); hand[0].setAttribute('opacity', t < 1.9 ? 1 : 0);
      k.set(hand[1], { cx: ex - 10, cy: ey }); hand[1].setAttribute('opacity', t > 1.0 ? 1 : 0);
      coins.forEach((c, i) => {
        const p = seg(t, 2.7 + i * 0.22, 3.2 + i * 0.22), ty = 196 - i * 5;
        tf(c, lerp(ex, 290 - i * 0, easeOut(p)), lerp(ey, ty, p * p) - 34 * hump(p), 0, 1, 1);
        c.setAttribute('opacity', p > 0 ? 1 : 0);
      });
      env.setAttribute('opacity', 1 - 0.0);
    }
  };
}
