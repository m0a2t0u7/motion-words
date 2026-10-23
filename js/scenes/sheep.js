// sheep：丘の牧場で、3頭の羊が頭を下げて草をむしゃむしゃ食べる。まめが羊のあいだでながめる（例文 The sheep are eating grass.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { scene, cloudG, sunG } from './nature.js';
import { beast } from './animal.js';
import { grassTuft } from './field.js';

export const meta = { duration: 4.2, beats: [[0, '羊たち'], [1.2, '草を食べる'], [3.0, 'むしゃむしゃ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const { FY } = scene(k, { FY: 200, top: '#CDE9FA', bot: '#F2FAFE', ground: '#A9D88F', edge: '#97CB7E' });
  tf(sunG(k, 16).g, 340, 40); tf(cloudG(k, 70, 26), 120, 46);
  el('path', { d: `M 0 ${FY} Q 140 ${FY - 50} 260 ${FY - 10} T 400 ${FY - 20} V 300 H 0 Z`, fill: '#B7DE9E' });
  el('path', { d: `M 0 ${FY + 30} Q 200 ${FY + 10} 400 ${FY + 26} V 300 H 0 Z`, fill: '#A2D586' });
  const list = [[230, 232, 0.8, 0, 1], [110, 262, 0.95, 0.5, 1], [320, 274, 1.05, 1.0, -1]];
  const items = [];
  let me;
  list.forEach(([x, y, s, off, face], i) => { if (i === 1) me = k.buddy({ x: 190, y: 250, scale: 0.75 }); items.push({ b: beast(k, 'sheep'), x, y, s, off, face, gr: [0, 1].map(() => grassTuft(k, undefined, '#5FB35F')) }); });
  return {
    update(t) {
      items.forEach(({ b, x, y, s, off, face, gr }, i) => {
        const dn = easeInOut(seg(t, 0.6 + off, 1.3 + off)), chew = t > 1.3 + off ? Math.sin((t + i) * 12) : 0;
        b.set({ x, y, s, face, head: 14 * dn + 6 * chew * dn, drop: 18 * dn, tilt: 3 * dn });
        const hd = b.headAt({ x, y, s, face });
        gr.forEach((q, j) => q.set(hd.x + face * (16 + j * 10) * s, y + 1, 1 - 0.65 * seg(t, 1.4 + off + j * 0.5, 4.0)));
      });
      P(me, { x: 190, y: 250, armL: 8, armR: 8, look: Math.sin(t * 0.9) * 0.8, mood: t > 2.6 ? 'grin' : 'smile', blink: blinkAt(t) });
    }
  };
}
