// take along：旅行かばんを引くまめと相手が、子どもたちと手をつなぎ、一緒にバス停へ向かう（例文 We took our kids along on the trip.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { gait, hp } from './dig.js';
import { streetBg } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '旅行に出る'], [1.4, '子どもも一緒に'], [3.6, '連れて出発']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  // バス停
  el('rect', { x: 368, y: 150, width: 5, height: 86, fill: pal.sub });
  el('circle', { cx: 370, cy: 144, r: 16, fill: pal.blue });
  el('rect', { x: 361, y: 136, width: 18, height: 12, rx: 3, fill: '#fff' });
  el('circle', { cx: 365, cy: 150, r: 2, fill: '#fff' }); el('circle', { cx: 375, cy: 150, r: 2, fill: '#fff' });
  // 左の家
  el('rect', { x: -10, y: 120, width: 90, height: 116, rx: 4, fill: '#FBE9DC' });
  el('rect', { x: 26, y: 170, width: 32, height: 66, rx: 3, fill: pal.blue });
  const S = 0.85, s2 = 0.55;
  const bag = g({}), bagSh = k.shadow(0, FY + 6, 16, 3);
  el('line', { x1: 0, y1: -30, x2: 0, y2: -48, stroke: pal.sub, 'stroke-width': 3 }, bag);
  el('rect', { x: -14, y: -32, width: 28, height: 30, rx: 5, fill: pal.yellow }, bag);
  el('rect', { x: -14, y: -22, width: 28, height: 4, fill: pal.yellowDark }, bag);
  [-8, 8].forEach((x) => el('circle', { cx: x, cy: 0, r: 3, fill: pal.ink }, bag));
  const kidA = k.buddy({ x: 40, y: FY + 6, scale: s2 }), kidB = k.buddy({ x: 50, y: FY + 6, scale: s2 * 0.95, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: 212, y: FY + 4, scale: S }), mate = k.buddy({ x: 60, y: FY + 4, scale: S, color: pal.coral, dark: pal.coralDark });
  const go = (t) => easeInOut(seg(t, 1.6, 4.2));
  const xme = (t) => 212 + 130 * go(t), xmt = (t) => 60 + 130 * go(t);
  const xa = (t) => lerp(40, 150, easeOut(seg(t, 0.6, 1.4))) + 130 * go(t), xb = (t) => lerp(50, 116, easeOut(seg(t, 0.8, 1.5))) + 130 * go(t);
  return {
    update(t) {
      const pm = gait(xme, t, 212), pt = gait(xmt, t, 60);
      const call = t < 1.4 ? hump(seg(t, 0.2, 1.2)) : 0;
      // まめ：振り向いて子どもを呼ぶ→かばんを引いて歩く（左手は子どもと手をつなぐ）
      me.pose({ x: pm.x, walk: pm.walk, facing: call > 0.1 ? -1 : 1, armR: 34, armL: call > 0.1 ? 120 + Math.sin(t * 12) * 20 : 30, lean: pm.lean, look: 0.4, mood: 'grin' });
      mate.pose({ x: pt.x, walk: pt.walk, armR: 34, armL: 10, lean: pt.lean, look: 0.4, mood: 'smile' });
      const bx = pm.x + 40;
      tf(bag, bx, FY + 4, pm.m > 0.2 ? -6 : 0);
      k.set(bagSh, { cx: bx });
      [[kidA, xa, 40], [kidB, xb, 50]].forEach(([c, xf, x0]) => {
        const p = gait(xf, t, x0, 20, 0.17);
        c.pose({ x: p.x, y: FY + 6, walk: p.walk, armR: t > 1.4 && c === kidA ? 70 : p.armR, armL: t > 1.4 && c === kidB ? 34 : p.armL, lean: p.lean, lift: Math.abs(Math.sin(t * 7)) * 3 * (t > 1.6 ? 1 : 0), look: 0.6, mood: 'grin' });
      });
    }
  };
}
