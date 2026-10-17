// you can say that again：「今日はすごく暑いね」→相手が大きくうなずき、「まったくその通り！」と強く同意する（"It's so hot today." "You can say that again!"）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '暑いね'], [1.6, 'うなずく'], [2.6, 'その通り！']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  // 太陽（強い日差し）
  const sun = g({}); tf(sun, 330, 56);
  const rays = g({}, sun);
  for (let i = 0; i < 10; i++) el('line', { x1: 0, y1: -30, x2: 0, y2: -42, stroke: pal.yellow, 'stroke-width': 5, 'stroke-linecap': 'round', transform: `rotate(${i * 36})` }, rays);
  el('circle', { r: 24, fill: pal.yellow }, sun);
  // 温度計の吹き出し
  const bubble = (parent) => {
    const bb = g({}, parent);
    el('path', { d: 'M -22 -26 h 44 a 8 8 0 0 1 8 8 v 28 a 8 8 0 0 1 -8 8 h -16 l -6 10 l -6 -10 h -16 a 8 8 0 0 1 -8 -8 v -28 a 8 8 0 0 1 8 -8 z', fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, bb);
    el('rect', { x: -4, y: -20, width: 8, height: 28, rx: 4, fill: pal.line }, bb);
    const mer = el('rect', { x: -2.2, y: -4, width: 4.4, height: 12, rx: 2, fill: pal.red }, bb);
    el('circle', { cx: 0, cy: 10, r: 6, fill: pal.red }, bb);
    return { bb, mer };
  };
  const B1 = bubble(), B2 = bubble();
  const bang = k.text(0, 0, '!!', { 'font-size': 26, fill: pal.red });
  const sweat = [0, 1].map(() => el('path', { d: 'M 0 -6 Q 5 1 0 5 Q -5 1 0 -6 Z', fill: pal.water }));

  const a = k.buddy({ x: 130, y: FY, facing: 1 });
  const c = k.buddy({ x: 270, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  return {
    update(t) {
      rays.setAttribute('transform', `rotate(${t * 20})`);
      tf(sun, 358, 44, 0, 0.8 + 0.03 * Math.sin(t * 4));
      const sp1 = easeOut(seg(t, 0.5, 0.8)) * (1 - easeOut(seg(t, 1.9, 2.1)));
      const sp2 = easeOut(seg(t, 2.4, 2.7));
      // 発言者：手であおぎながら言う
      a.pose({
        armR: 120 + 25 * Math.sin(t * 14) * (t < 2.2 ? 1 : 0.2), lean: -3, look: 0.5,
        mood: t > 0.5 && t < 1.5 ? 'open' : 'flat', squash: 1 - 0.015 * Math.sin(t * 5)
      });
      // 相手：二度大きくうなずき、相手を指して強く同意
      const nod = hump(seg(t, 1.6, 2.0)) + hump(seg(t, 2.05, 2.45));
      const point = easeOut(seg(t, 2.4, 2.8));
      c.pose({
        armR: lerp(8, 75, point) + 6 * Math.sin(t * 18) * point * 0, armL: 8 + 60 * point * 0,
        lean: 7 * nod * 0.5 + 6 * point, squash: 1 - 0.06 * nod - 0.04 * hump(seg(t, 2.4, 2.9)),
        lift: 10 * hump(seg(t, 2.5, 3.0)), mood: t < 1.6 ? 'flat' : 'grin', look: -0.6
      });
      tf(B1.bb, 130, FY - 112 - 3 * Math.sin(t * 3), 0, sp1 * 1.0);
      B1.bb.setAttribute('opacity', sp1);
      B1.mer.setAttribute('y', -12); B1.mer.setAttribute('height', 20);
      tf(B2.bb, 270, FY - 112 - 8 * sp2, 0, 0.3 + 0.9 * sp2 * (1 + 0.1 * Math.sin(t * 10)));
      B2.bb.setAttribute('opacity', sp2);
      B2.mer.setAttribute('y', lerp(-4, -16, sp2)); B2.mer.setAttribute('height', lerp(12, 24, sp2));
      tf(bang, 326, FY - 132, 10, sp2);
      bang.setAttribute('opacity', sp2);
      sweat.forEach((s, i) => {
        const p = (t * 0.7 + i * 0.5) % 1;
        tf(s, (i ? 292 : 108) + (i ? 14 : -14), FY - 84 + 22 * p, 0, 1);
        s.setAttribute('opacity', 1 - p);
      });
    }
  };
}
