// meet：駅の前で待つ人のところへ、友だちが歩いてきて顔を合わせる（例文 I will meet my friend at the station.）
import { seg, lerp, easeInOut, hump, wobble } from '../ease.js';
import { gait } from './dig.js';
import { heart } from './weigh.js';

export const meta = { duration: 4.2, beats: [[0, '駅で待つ'], [1.6, '友だち到着'], [3.4, '会えた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'outdoor' });
  // 駅舎
  el('rect', { x: 50, y: 70, width: 300, height: 140, rx: 6, fill: '#F3E6DC' });
  el('rect', { x: 40, y: 58, width: 320, height: 18, rx: 6, fill: pal.blueDark });
  el('rect', { x: 70, y: 150, width: 70, height: 60, rx: 4, fill: '#CFE9F7' });
  el('rect', { x: 260, y: 150, width: 70, height: 60, rx: 4, fill: '#CFE9F7' });
  el('rect', { x: 160, y: 130, width: 80, height: 80, rx: 6, fill: '#8FA9C2' });
  el('rect', { x: 166, y: 136, width: 68, height: 74, rx: 4, fill: '#DDEFFA' });
  const cl = g({}); tf(cl, 200, 100);
  el('circle', { r: 17, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 }, cl);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -10, stroke: pal.ink, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, cl);
  el('line', { x1: 0, y1: 0, x2: 7, y2: 3, stroke: pal.ink, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, cl);
  // 電車の看板
  const sg = g({}); tf(sg, 98, 108);
  el('rect', { x: -22, y: -16, width: 44, height: 32, rx: 7, fill: pal.blue }, sg);
  el('rect', { x: -14, y: -10, width: 28, height: 15, rx: 4, fill: '#fff' }, sg);
  el('circle', { cx: -8, cy: 11, r: 2.5, fill: '#fff' }, sg); el('circle', { cx: 8, cy: 11, r: 2.5, fill: '#fff' }, sg);
  el('rect', { x: 0, y: FY - 4, width: 400, height: 4, fill: pal.floorEdge });

  const me = k.buddy({ x: 130, y: FY, facing: 1 });
  const fr = k.buddy({ x: 470, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  const hg = [0, 1, 2].map(() => { const h = g({}); heart(k, h); return h; });
  const fx = (t) => lerp(470, 240, easeInOut(seg(t, 0.3, 3.0)));
  return {
    update(t) {
      const p = gait(fx, t, 470, 16, 0.107);
      const near = seg(t, 2.2, 3.0), wv = Math.sin(t * 11), see = seg(t, 0.9, 1.4);
      me.pose({ look: lerp(-0.6, 0.7, see), mood: near > 0.2 ? 'grin' : 'smile', armR: see > 0.2 ? 110 + 22 * wv : 8, armL: 8, lean: 2 + 4 * near });
      fr.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: t > 2.4 ? 110 - 22 * wv : p.armR, lean: p.lean, look: 0.5, mood: near > 0.2 ? 'grin' : 'smile', squash: 1 - 0.03 * Math.abs(wobble(seg(t, 3.0, 3.6), 2, 4)) });
      hg.forEach((h, i) => {
        const q = seg(t, 3.0 + i * 0.18, 3.9 + i * 0.1);
        tf(h, 168 + i * 24 + (i % 2) * 6, FY - 140 - 26 * q, 0, hump(q) * 1.1 + 0.001);
      });
    }
  };
}
