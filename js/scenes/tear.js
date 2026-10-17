// tear：紙の両端を引っぱり合っているところで、一方が手を放して止める。紙は破れず、「破るな」の印が出る（例文 Don't tear the paper.）
import { seg, lerp, easeInOut, easeOut, smooth, backOut, wobble } from '../ease.js';
import { hp, gait } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, '紙を引っぱる'], [1.5, 'ぴんと張る'], [3.2, '破かない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  // 机の上の額・本棚（部屋らしさ）
  el('rect', { x: 150, y: 50, width: 100, height: 56, rx: 4, fill: '#E9E2D6' });
  el('rect', { x: 158, y: 58, width: 84, height: 40, rx: 2, fill: '#DDEFFA' });
  el('path', { d: 'M 158 98 L 180 76 L 196 90 L 214 70 L 242 98 Z', fill: pal.green, opacity: 0.8 });
  const A = k.buddy({ x: 115, y: 236 });
  const B = k.buddy({ x: 285, y: 236, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const paper = g({});
  const shape = el('path', { d: '', fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, paper);
  const lines = [0, 1, 2].map(() => el('path', { d: '', fill: 'none', stroke: '#E5EAF1', 'stroke-width': 1.4 }, paper));
  [0, 1].forEach((i) => el('line', { x1: 8, y1: 12 + i * 8, x2: 40 - i * 10, y2: 12 + i * 8, stroke: '#C9D1DC', 'stroke-width': 2, 'stroke-linecap': 'round' }, paper));
  // 禁止マーク（破れた紙の絵に斜線）
  const no = g({});
  el('circle', { r: 30, fill: '#fff', stroke: pal.red, 'stroke-width': 6 }, no);
  el('path', { d: 'M -14 -10 L -2 -10 L 0 -4 L 3 -12 L 14 -10 L 14 12 L 4 10 L 0 14 L -3 8 L -14 12 Z', fill: '#C9D1DC' }, no);
  el('path', { d: 'M -3 -14 L 1 -4 L -2 2 L 2 8 L -1 14', fill: 'none', stroke: pal.ink, 'stroke-width': 1.6 }, no);
  el('line', { x1: -21, y1: -21, x2: 21, y2: 21, stroke: pal.red, 'stroke-width': 6, 'stroke-linecap': 'round' }, no);
  const W = 72, Hh = 46;
  return {
    update(t) {
      const tug = smooth(seg(t, 0.5, 1.2)) * (1 - smooth(seg(t, 1.8, 2.0)));
      const pull = tug * (0.65 + 0.35 * Math.sin(t * 13));
      const rel = smooth(seg(t, 1.9, 2.3));
      A.pose({ x: 115 - 6 * pull, armR: 85, armL: 8, lean: -6 * pull + 2 * rel, look: 0.2, mood: tug > 0.4 ? 'flat' : 'smile', squash: 1 - 0.02 * pull });
      B.pose({ x: 285 + 6 * pull + 4 * rel, armR: lerp(85, 98, rel), armL: 8, lean: -6 * pull * (1 - rel), look: 0.2, mood: rel > 0.3 ? 'open' : tug > 0.4 ? 'flat' : 'smile', squash: 1 - 0.02 * pull * (1 - rel) });
      const hA = hp(A, 1, 'R', 26), hB = hp(B, 1, 'R', 26);
      let ang, top;
      if (t < 1.9) { ang = (Math.atan2(hB.y - hA.y, hB.x - hA.x) * 180) / Math.PI; top = Math.hypot(hB.x - hA.x, hB.y - hA.y); }
      else { ang = lerp((Math.atan2(hB.y - hA.y, hB.x - hA.x) * 180) / Math.PI, 90, easeOut(seg(t, 1.9, 2.5))) + wobble(seg(t, 2.1, 3.4), 2.5, 3.5) * 14 * (seg(t, 1.9, 2.0) > 0 ? 1 : 0); top = W; }
      tf(paper, hA.x, hA.y, ang);
      const sag = Math.max(0, W - top) * 0.9 + (t > 1.9 ? 0 : 0);
      const L = t < 1.9 ? top : W;
      k.set(shape, { d: `M 0 0 Q ${L / 2} ${sag * 1.2 + 0} ${L} 0 L ${L} ${Hh} L 0 ${Hh} Z` });
      const st = pull > 0.2 ? 1 : 0;
      lines.forEach((l, i) => k.set(l, { d: `M ${L * (0.25 + i * 0.25)} 2 L ${L * (0.25 + i * 0.25) + (i - 1) * 3} ${Hh - 4}`, opacity: st * 0.9 }));
      const s = backOut(seg(t, 2.7, 3.2));
      tf(no, 335, 95, 0, Math.max(0.001, s));
    }
  };
}
