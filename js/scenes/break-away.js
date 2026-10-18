// break away：集団で走っていたランナーのうち、まめ一人がスピードを上げて抜け出す（例文 One runner broke away from the group.）
import { seg, lerp, easeInOut, easeIn, smooth } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '集団で走る'], [1.4, '一人が加速'], [3.2, '抜け出した']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: 214, width: 400, height: 50, fill: '#E9927A' });
  [222, 240, 256].forEach((y) => el('rect', { x: 0, y, width: 400, height: 2, fill: '#fff', opacity: 0.8 }));
  el('rect', { x: 0, y: 160, width: 400, height: 54, fill: '#BFE0B0' });
  [30, 120, 210, 300, 390].forEach((x) => { el('circle', { cx: x, cy: 150, r: 22, fill: '#8FCB9A' }); });
  const cols = [[pal.blue, pal.blueDark], [pal.coral, pal.coralDark], [pal.violet, '#8467D8'], [pal.yellow, pal.yellowDark]];
  const runners = [[50, 246, 0.6], [86, 250, 0.62], [24, 252, 0.62], [70, 256, 0.64]].map(([x, y, s], i) => ({ b: k.buddy({ x, y, scale: s, color: cols[i][0], dark: cols[i][1] }), x, y, s, ph: i * 1.3 }));
  const me = k.buddy({ x: 108, y: 254, scale: 0.64 });
  const lines = [0, 1, 2].map(() => el('line', { stroke: pal.mintDark, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  return {
    update(t) {
      const gx = 40 * (t / 4);
      runners.forEach((r) => {
        const ph = t * 13 + r.ph;
        r.b.pose({ x: r.x + gx, walk: ph, armL: 10 + Math.sin(ph) * 40, armR: 10 - Math.sin(ph) * 40, lean: 10, mood: 'flat', look: 0.8 });
      });
      // 抜け出す：最初は同じ速さ→ためて加速
      const acc = seg(t, 1.3, 4.0);
      const dx = 40 * (t / 4) + 200 * easeIn(acc) * 0.5 + 200 * smooth(acc) * 0.5;
      const ph = t * 13 + acc * acc * 18;
      const pr = lerp(0, 1, seg(t, 1.2, 1.5));
      me.pose({ x: 108 + dx, walk: ph, armL: 10 + Math.sin(ph) * lerp(40, 60, pr), armR: 10 - Math.sin(ph) * lerp(40, 60, pr), lean: lerp(10, 18, pr), mood: t > 1.3 ? 'grin' : 'flat', look: 0.8 });
      lines.forEach((l, i) => { const on = t > 1.6; k.set(l, { x1: 108 + dx - 40 - i * 4, x2: 108 + dx - 62 - i * 10, y1: 210 + i * 12, y2: 210 + i * 12, opacity: on ? 0.6 : 0 }); });
    }
  };
}
