// push through：混み合った人の間を、まめが手で押し分けながら進み、いちばん前に出る（例文 She pushed through the crowd to the front.）
import { seg, lerp, easeInOut, easeOut, wobble, clamp } from '../ease.js';
import { gait } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '人混みの後ろ'], [1.6, '押し分ける'], [3.6, '最前列に出た']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  // 前方のステージ
  el('rect', { x: 330, y: 150, width: 70, height: 86, fill: '#E9DCF5' });
  el('rect', { x: 330, y: 140, width: 70, height: 12, fill: pal.violet });
  el('rect', { x: 314, y: 200, width: 4, height: 36, fill: '#8C96A8' });
  el('line', { x1: 316, y1: 204, x2: 400, y2: 204, stroke: pal.red, 'stroke-width': 3 });
  const cols = [[pal.blue, pal.blueDark], [pal.coral, pal.coralDark], [pal.yellow, pal.yellowDark], [pal.violet, '#8467D8'], [pal.coral, pal.coralDark], [pal.blue, pal.blueDark]];
  const XS = [128, 166, 204, 236, 270, 300];
  const crowd = XS.map((x, i) => ({ b: k.buddy({ x, y: FY + (i % 2) * 6, scale: 0.68 + (i % 3) * 0.03, facing: 1, color: cols[i][0], dark: cols[i][1] }), x, i }));
  const me = k.buddy({ x: 50, y: FY + 4, scale: 0.7 });
  const xf = (t) => lerp(50, 300, easeInOut(seg(t, 0.3, 3.8)));
  return {
    update(t) {
      const p = gait(xf, t, 50, 6, 0.09);
      const mx = p.x;
      // 近くの人は押されて横へよけ、通り過ぎると戻る
      crowd.forEach((c) => {
        const d = c.x - mx;
        const push = Math.exp(-(d * d) / 500);
        const dir = c.i % 2 ? 1 : -1;
        c.b.pose({ x: c.x + push * 10 * Math.sign(d || 1), lean: push * 14 * dir, look: lerp(0.8, -0.6, push), mood: push > 0.4 ? 'open' : 'smile', armL: 8, armR: 8 });
      });
      const wedge = clamp(1 - Math.abs(mx - 200) / 160) * (t < 3.6 ? 1 : 0);
      me.pose({ x: mx, walk: p.walk, lean: 10 * wedge + p.lean, armL: lerp(p.armL, 100 + 14 * Math.sin(t * 9), wedge), armR: lerp(p.armR, 100 - 14 * Math.sin(t * 9), wedge), mood: t > 3.8 ? 'grin' : 'flat', look: 0.8, squash: 1 - 0.03 * wedge * Math.abs(Math.sin(t * 9)) });
    }
  };
}
