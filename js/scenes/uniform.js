// uniform：同じ制服を着た生徒たちが、毎日そろって校門へ向かう（例文 Students at my school have to wear a uniform every day.）
import { seg, lerp, easeInOut } from '../ease.js';
import { top } from './shirt.js';
import { gait } from './dig.js';
import { calendar } from './so-far-so-good.js';

export const meta = { duration: 4.2, beats: [[0, '毎朝'], [1.4, '同じ制服で'], [3.0, '学校へ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 238, mood: 'outdoor' });
  // 校舎と時計・校門
  el('rect', { x: 150, y: 70, width: 250, height: FY - 70, fill: '#F3E6D2' });
  el('rect', { x: 150, y: 64, width: 250, height: 10, fill: '#E0CDB0' });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) el('rect', { x: 164 + c * 46, y: 90 + r * 40, width: 32, height: 24, rx: 3, fill: '#CFE6F5' });
  el('circle', { cx: 275, cy: 46, r: 16, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 });
  el('path', { d: 'M 275 46 V 36 M 275 46 L 282 50', stroke: pal.ink, 'stroke-width': 2.5, 'stroke-linecap': 'round' });
  el('rect', { x: 0, y: FY - 26, width: 150, height: 26, fill: '#E6E1D8' });
  [300, 384].forEach((x) => { el('rect', { x: x - 9, y: FY - 92, width: 18, height: 92, rx: 2, fill: '#B9B2A6' }); el('rect', { x: x - 12, y: FY - 98, width: 24, height: 8, rx: 2, fill: '#A39B8E' }); });
  const cal = calendar(k, 44, 30, 46);
  const NV = '#2E3F6E', ND = '#1E2B50';
  const kids = [
    { x0: -70, s: 0.8, c: pal.coral, d: pal.coralDark },
    { x0: 10, s: 0.92 },
    { x0: -150, s: 0.78, c: pal.blue, d: pal.blueDark }
  ].map((o) => {
    const b = k.buddy({ x: o.x0, y: FY, scale: o.s, color: o.c, dark: o.d });
    top(k, b, 'uniform', NV, ND, { sleeve: NV, legs: NV, tie: '#D9474F' });
    return { b, ...o };
  });
  const days = ['MON', 'TUE', 'WED'];
  return {
    update(t) {
      const di = Math.min(2, Math.floor(t / 1.4)), fp = (t % 1.4) > 1.2 && di < 2 ? seg(t % 1.4, 1.2, 1.4) : 0;
      cal.set(days[di], fp);
      kids.forEach((q, i) => {
        const xf = (u) => q.x0 + 62 * u + 6 * Math.sin(u * 0.8 + i);
        const p = gait(xf, t, q.x0, 18, 0.12);
        q.b.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: p.armR, lean: 3, look: 0.4, mood: 'smile', blink: (t + i * 0.9) % 2.6 > 2.45 ? 1 : 0 });
      });
    }
  };
}
