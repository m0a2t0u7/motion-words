// highway：何車線もある高速道路を、まめの運転する車が何時間も走り続ける（太陽が動き、時計が進む）（例文 We drove on the highway for hours.）
import { seg, lerp, hump } from '../ease.js';
import { car } from './run-after.js';
import { clock as wallClock } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, '高速道路'], [1.4, '走り続ける'], [3.0, '何時間も']] };

export function create(k) {
  const { el, tf, pal } = k, FY = 250;
  const sky = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#EAF4FB' });
  const sun = el('circle', { r: 18, fill: '#FFE07A' });
  const hills = k.g({});
  for (let i = 0; i < 4; i++) el('path', { d: `M ${i * 200 - 20} 170 Q ${i * 200 + 80} 110 ${i * 200 + 180} 170 Z`, fill: '#D6ECD3' }, hills);
  el('rect', { x: 0, y: 170, width: 400, height: 130, fill: '#B3BCC8' });
  const lines = k.g({});
  [196, 222].forEach((y) => { for (let i = 0; i < 12; i++) el('rect', { x: i * 50, y, width: 26, height: 3, fill: '#fff' }, lines); });
  // ガードレールの支柱と案内標識
  const rail = k.g({});
  for (let i = 0; i < 14; i++) el('rect', { x: i * 40, y: 158, width: 4, height: 14, fill: '#9AA6B6' }, rail);
  el('rect', { x: 0, y: 160, width: 800, height: 5, fill: '#C9D1DC' }, rail);
  const signG = k.g({});
  el('rect', { x: -2, y: -70, width: 4, height: 70, fill: '#9AA6B6' }, signG);
  el('rect', { x: -40, y: -96, width: 80, height: 30, rx: 4, fill: pal.green }, signG);
  el('path', { d: 'M -10 -88 h 14 v -4 l 8 7 l -8 7 v -4 h -14 Z', fill: '#fff' }, signG);
  const c = car(k, pal.blue, pal.blueDark, true);
  // 窓の中の運転手
  const drv = el('circle', { r: 8, fill: pal.mint });
  const ck = wallClock(k, 360, 40, 20);
  return {
    update(t) {
      const p = t / 4.4;
      // 空：昼 → 夕方
      sky.setAttribute('fill', p < 0.6 ? '#EAF4FB' : '#FCE6D6');
      tf(sun, lerp(40, 340, p), 90 - 50 * Math.sin(p * Math.PI) + 0);
      tf(hills, -((t * 30) % 200), 0);
      tf(lines, -((t * 260) % 50), 0);
      tf(rail, -((t * 200) % 40), 0);
      tf(signG, 520 - ((t * 200) % 700), 170);
      c.set(170, t * 600, FY - 12, Math.sin(t * 18) * 0.8);
      tf(drv, 170 - 6, FY - 12 - 50 + Math.sin(t * 18) * 0.8);
      ck.set(1 + p * 4, (p * 4 * 60) % 60);
    }
  };
}
