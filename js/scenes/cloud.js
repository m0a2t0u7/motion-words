// cloud：晴れた空に黒い雲が両側から広がり、空をすっかりおおう。まめは不安そうに見上げる（例文 Dark clouds covered the sky.）
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';
import { scene, hills, sunG, cloudG, treeG, P, blinkAt } from './nature.js';

export const meta = { duration: 4.2, beats: [[0, '晴れた空'], [1.0, '黒い雲が来る'], [3.0, '空をおおった']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const { FY } = scene(k, { FY: 238, top: '#8FC8F2', bot: '#E2F2FC' });
  const sun = sunG(k, 22); tf(sun.g, 210, 60);
  const L = [], R = [];
  [[60, 1.4], [20, 1.1], [100, 1.2]].forEach(([y, s], i) => L.push([cloudG(k, 170 * s, 60 * s, i % 2 ? '#5D6577' : '#6C7486', undefined, false), y]));
  [[50, 1.3], [110, 1.2], [80, 1.0]].forEach(([y, s], i) => R.push([cloudG(k, 170 * s, 60 * s, i % 2 ? '#6C7486' : '#5D6577', undefined, false), y]));
  const dim = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#2E3647', opacity: 0 });
  hills(k, FY, '#C9DECB', '#BBD6BE');
  el('rect', { x: 0, y: FY, width: 400, height: 62, fill: '#BFE3C4' });
  tf(treeG(k, 1).g, 340, FY + 2);
  const b = k.buddy({ x: 160, y: FY, scale: S });
  const dim2 = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#2E3647', opacity: 0 });
  return {
    update(t) {
      const c = easeInOut(seg(t, 0.7, 3.2));
      L.forEach(([n, y], i) => tf(n, lerp(-140, 90 + i * 40, c), y + 3 * Math.sin(t * 1.5 + i)));
      R.forEach(([n, y], i) => tf(n, lerp(540, 300 - i * 30, c), y + 3 * Math.sin(t * 1.3 + i)));
      sun.rays.setAttribute('transform', `rotate(${t * 12})`);
      dim.setAttribute('opacity', 0.25 * c);
      dim2.setAttribute('opacity', 0.18 * c);
      const worry = easeInOut(seg(t, 1.4, 2.2));
      P(b, { look: 0.5, lean: -6 * worry, armL: lerp(8, 50, worry), armR: lerp(8, 50, worry), squash: 1 - 0.03 * worry, mood: t < 1.4 ? 'smile' : t < 2.6 ? 'open' : 'sad', blink: blinkAt(t) });
      b.body.children[3].setAttribute('transform', `translate(${(3 * worry).toFixed(1)} ${(-5 * worry).toFixed(1)})`);
    }
  };
}
