// mountain：夏、リュックを背負った2人が山の斜面を登り、山頂の旗のところで両手を上げる（例文 We climbed a mountain last summer.）
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';
import { scene, sunG, cloudG, P, blinkAt, gait } from './nature.js';

export const meta = { duration: 4.4, beats: [[0, 'ふもと'], [1.0, '山を登る'], [3.2, '山頂に着いた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.62;
  scene(k, { FY: 300, top: '#86C7F2', bot: '#E5F4FC' });
  const sun = sunG(k, 18); tf(sun.g, 60, 50);
  tf(cloudG(k, 80, 26), 320, 60);
  // 山（左下から右上の頂上へ）
  el('path', { d: 'M -20 300 L 290 70 L 420 300 Z', fill: '#7FB98A' });
  el('path', { d: 'M 290 70 L 420 300 L 330 300 Z', fill: '#000', opacity: 0.08 });
  el('path', { d: 'M -20 300 L 290 70 L 420 300 Z', fill: 'none' });
  [[60, 270], [120, 240], [200, 190]].forEach(([x, y]) => { el('circle', { cx: x, cy: y - 16, r: 12, fill: '#5FA872' }); el('rect', { x: x - 2, y: y - 6, width: 4, height: 8, fill: '#8E6B5A' }); });
  el('rect', { x: 296, y: 30, width: 3, height: 40, fill: pal.ink });
  const flag = el('path', { d: '', fill: pal.red });
  const slope = (x) => 300 - (x + 20) * (230 / 310);
  const pack = (b) => { const p = g({}, b.armBack ? b.body : b.body); el('rect', { x: -38, y: -66, width: 16, height: 36, rx: 6, fill: '#E9B43A' }, p); b.body.insertBefore(p, b.body.firstChild); };
  const a = k.buddy({ x: 20, y: slope(20), scale: S });
  const c = k.buddy({ x: -20, y: slope(-20), scale: S * 0.95, color: pal.coral, dark: pal.coralDark });
  pack(a); pack(c);
  const fa = (t) => lerp(20, 274, easeInOut(seg(t, 0.2, 3.2)));
  const fc = (t) => lerp(-20, 246, easeInOut(seg(t, 0.35, 3.3)));
  return {
    update(t) {
      const yay = easeOut(seg(t, 3.3, 3.7));
      [[a, fa, 20, 0], [c, fc, -20, 1]].forEach(([b, f, x0, off]) => {
        const w = gait(f, t, x0, 14, 0.2);
        P(b, { x: w.x, y: slope(w.x), walk: w.walk, lean: 16 * w.m, armL: lerp(w.armL, 160, yay), armR: lerp(w.armR, 160, yay), look: 0.5, mood: yay > 0.3 ? 'grin' : w.m > 0.3 ? 'flat' : 'smile', blink: blinkAt(t, off) });
      });
      const wv = Math.sin(t * 6) * 3;
      flag.setAttribute('d', `M 299 31 Q 312 ${32 + wv} 326 ${34 - wv} L 324 46 Q 312 ${48 + wv} 299 46 Z`);
    }
  };
}
