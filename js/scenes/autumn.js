// autumn：秋、木の葉が緑から赤へ色づき、ひらひら落ちる。まめは落ちてきた赤い葉を手で受ける（例文 The leaves turn red in autumn.）
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';
import { scene, hills, treeG, hp, P, blinkAt } from './nature.js';

const mix = (a, b, p) => { const h = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16)); const A = h(a), B = h(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], p)).toString(16).padStart(2, '0')).join(''); };
export function leafShape(k, col, parent) { return k.el('path', { d: 'M 0 -8 Q 7 -2 0 8 Q -7 -2 0 -8 Z M 0 -6 V 8', fill: col, stroke: '#00000022', 'stroke-width': 1 }, parent); }

export const meta = { duration: 4.4, beats: [[0, '緑の葉'], [1.0, '赤く色づく'], [3.0, '秋の赤い葉']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1;
  const { FY } = scene(k, { FY: 238, top: '#CFE3F2', bot: '#FFF3E4', ground: '#E8D9B8', edge: '#D9C79F' });
  hills(k, FY, '#EADFC5', '#E2D3B4');
  const tr = treeG(k, 1.5); tf(tr.g, 150, FY + 2);
  const L = [0, 1, 2, 3].map(() => leafShape(k, '#E8603C'));
  const ground = [[90, 2], [200, 4], [230, 1], [120, 3]].map(([x, y]) => { const n = leafShape(k, '#E8603C'); tf(n, x, FY + 8 + y, 80); n.setAttribute('opacity', 0); return n; });
  const b = k.buddy({ x: 270, y: FY, scale: S, facing: -1 });
  return {
    update(t) {
      const red = easeInOut(seg(t, 0.6, 2.4));
      const cs = [['#7FCB92', '#E8603C'], ['#6BBF84', '#F28A4C'], ['#6BBF84', '#D9483B'], ['#7FCB92', '#F2A541']];
      tr.c.forEach((n, i) => n.setAttribute('fill', mix(cs[i][0], cs[i][1], clamp(red * 1.2 - i * 0.07))));
      ground.forEach((n, i) => n.setAttribute('opacity', easeOut(seg(t, 2.2 + i * 0.3, 2.6 + i * 0.3))));
      const catchT = easeOut(seg(t, 2.6, 3.2));
      P(b, { facing: -1, look: -0.4, armR: lerp(8, 70, catchT), lean: 4 * catchT, mood: t > 3.4 ? 'grin' : 'smile', blink: blinkAt(t) });
      b.body.children[3].setAttribute('transform', `translate(0 ${(-4 * (1 - catchT) + 2 * catchT).toFixed(1)})`);
      const h = hp(b, S, 'R', 28);
      L.forEach((n, i) => {
        const t0 = 1.8 + i * 0.35, p = seg(t, t0, t0 + 1.4);
        const sx = 150 + (i - 1.5) * 40, ex = i === 1 ? h.x : sx + 30, ey = i === 1 ? h.y - 6 : FY + 6;
        const x = lerp(sx, ex, p) + 16 * Math.sin(p * 9) * (1 - p), y = lerp(110, ey, p);
        tf(n, x, y, i === 1 && p >= 1 ? 30 : 40 * Math.sin(p * 9) + 60 * p, p > 0 ? 1 : 0.001);
        n.setAttribute('fill', mix('#F28A4C', '#D9483B', i / 3));
      });
    }
  };
}
