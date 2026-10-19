// seed：庭の畑で、まめが種を穴に1粒ずつ落とし、彼女が土をかぶせていく（例文 We planted some seeds in the garden.）
import { seg, lerp, easeInOut, easeOut, easeIn, clamp, hump } from '../ease.js';
import { scene, hp, reach, P, blinkAt, gait } from './nature.js';

export const meta = { duration: 4.4, beats: [[0, '畑の穴'], [1.0, '種をまく'], [3.2, '土をかぶせた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const { FY } = scene(k, { FY: 236, ground: '#B98E64', edge: '#A47A52' });
  // 庭の柵
  for (let x = 6; x < 400; x += 24) el('rect', { x, y: FY - 50, width: 12, height: 50, rx: 3, fill: '#fff', stroke: pal.line });
  el('rect', { x: 0, y: FY - 38, width: 400, height: 6, fill: '#fff' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#B98E64' });
  const HX = [150, 200, 250, 300];
  const holes = HX.map((x) => el('ellipse', { cx: x, cy: FY + 18, rx: 9, ry: 4, fill: '#6E4F33' }));
  const mounds = HX.map((x) => el('path', { d: `M ${x - 12} ${FY + 20} Q ${x} ${FY + 8} ${x + 12} ${FY + 20} Z`, fill: '#9C7550', opacity: 0 }));
  const seeds = HX.map(() => el('ellipse', { rx: 2.6, ry: 3.6, fill: '#F2D7AE', stroke: '#C9A577' }));
  const a = k.buddy({ x: 110, y: FY + 8, scale: S });
  const c = k.buddy({ x: 40, y: FY + 8, scale: S * 0.9, color: pal.coral, dark: pal.coralDark });
  // 種の袋（左手）
  const bag = g({});
  el('rect', { x: -8, y: 0, width: 16, height: 20, rx: 2, fill: '#FFF1D6', stroke: '#E3CFA8' }, bag);
  el('circle', { cx: 0, cy: 10, r: 4, fill: '#59C27A' }, bag);
  const T0 = 0.8, DT = 0.5;
  const xa = (t) => lerp(110, 266, easeInOut(seg(t, T0, T0 + DT * 3)));
  const xc = (t) => lerp(40, 236, easeInOut(seg(t, 1.6, 3.6)));
  return {
    update(t) {
      const wa = gait(xa, t, 110, 6, 0.12);
      P(a, { x: wa.x, y: FY + 8, walk: wa.walk, lean: 22, squash: 0.94, look: 0.6, mood: t > 3.4 ? 'grin' : 'smile', blink: blinkAt(t), armL: 40 });
      const i = clamp(Math.floor((t - T0) / DT), 0, 3), q = seg(t - T0 - i * DT, 0, DT);
      a.pose({ armR: reach(a, S, 'R', HX[i], FY - 4) });
      const h = hp(a, S, 'R', 28), hl = hp(a, S, 'L', 28);
      tf(bag, hl.x, hl.y - 4, 0, S);
      seeds.forEach((s, j) => {
        const td = T0 + j * DT + 0.25;
        if (t < T0 + j * DT) tf(s, 0, 0, 0, 0.001);
        else if (t < td) tf(s, h.x, h.y + 2);
        else tf(s, HX[j], lerp(h.y + 2, FY + 17, easeIn(seg(t, td, td + 0.2))), 0, 1 - seg(t, 1.0 + td, 1.2 + td) * 0.0);
      });
      const wc = gait(xc, t, 40, 6, 0.12);
      const pat = Math.abs(Math.sin(t * 9)) * seg(t, 1.8, 3.6) * (t < 3.6 ? 1 : 0);
      P(c, { x: wc.x, y: FY + 8, walk: wc.walk, lean: 24, squash: 0.94, look: 0.6, mood: t > 3.4 ? 'grin' : 'smile', blink: blinkAt(t, 1), armR: 60 - 30 * pat, armL: 40 });
      HX.forEach((x, j) => { const cov = clamp((wc.x + 40 - x) / 20); mounds[j].setAttribute('opacity', cov); holes[j].setAttribute('opacity', 1 - cov); if (cov > 0.5) seeds[j].setAttribute('opacity', 0); else seeds[j].setAttribute('opacity', 1); });
    }
  };
}
