// spring：春、桜の花びらが舞う中、花壇のつぼみが次々にひらく。まめはしゃがんでながめる（例文 The flowers bloom in spring.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { scene, hills, treeG, flowerG, P, blinkAt, tufts } from './nature.js';

export const meta = { duration: 4.2, beats: [[0, 'つぼみ'], [1.0, '花がひらく'], [3.0, '春の花']] };

export function create(k) {
  const { el, tf, pal } = k, S = 0.95;
  const { FY } = scene(k, { FY: 236, top: '#CFE8FA', bot: '#FFF2F5' });
  hills(k, FY, '#DFF0D8', '#D3EBCB');
  const tr = treeG(k, 1.2, '#F9C4D2', '#F5B0C3'); tf(tr.g, 60, FY + 2);
  const cols = ['#FF8FB1', '#FFCF5C', '#A58BF3', '#FF8FB1', '#F2685B', '#FFCF5C'];
  const fl = cols.map((c, i) => { const f = flowerG(k, c, undefined, 26 + (i % 2) * 8); tf(f.g, 190 + i * 30, FY + 4); return f; });
  const b = k.buddy({ x: 130, y: FY, scale: S });
  tufts(k, FY, 170, 380);
  const pet = [0, 1, 2, 3, 4, 5].map(() => el('ellipse', { rx: 4, ry: 2.6, fill: '#F9B9CB' }));
  return {
    update(t) {
      fl.forEach((f, i) => { const p = easeOut(seg(t, 0.8 + i * 0.32, 1.4 + i * 0.32)); f.set(0.15 + 0.85 * p); tf(f.head, 0, -(26 + (i % 2) * 8), 4 * Math.sin(t * 2 + i)); });
      const sq = easeInOut(seg(t, 0.3, 0.9));
      P(b, { squash: 1 - 0.1 * sq, lean: 14 * sq, look: 0.8, armL: 30 * sq, armR: 40 * sq, mood: t > 2.0 ? 'grin' : 'open', blink: blinkAt(t) });
      b.body.children[3].setAttribute('transform', 'translate(4 2)');
      pet.forEach((p, i) => { const q = ((t * 0.25 + i / 6) % 1); tf(p, 40 + q * 330 + 10 * Math.sin(t * 3 + i), 40 + q * 180 + i * 6, q * 400); });
    }
  };
}
