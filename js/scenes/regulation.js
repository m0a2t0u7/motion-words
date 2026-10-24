// regulation：プールサイドの「NO RUNNING」の看板を見て、走りかけたまめが止まり、歩く（例文 Pool regulations say no running.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';
import { P, blinkAt, walkTo, run } from './run-after.js';
import { say } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '走りかける'], [1.2, '看板で止まる'], [2.4, '歩いて進む']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.85;
  const FY = k.backdrop({ floorY: 244, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#F1E7D3' });
  // プール
  el('rect', { x: 0, y: 120, width: 400, height: 80, fill: '#6EC6EA' });
  el('rect', { x: 0, y: 196, width: 400, height: 10, fill: '#E8F4FA' });
  el('rect', { x: 0, y: 206, width: 400, height: 38, fill: '#EAD9BA' });
  [30, 110, 190, 270, 350].forEach((x, i) => el('path', { d: `M ${x} ${140 + (i % 2) * 14} q 10 -6 20 0 t 20 0`, fill: 'none', stroke: '#BFE8F7', 'stroke-width': 3, 'stroke-linecap': 'round' }));
  [0, 1, 2].forEach((i) => el('line', { x1: 0, y1: 160 + i * 14, x2: 400, y2: 160 + i * 14, stroke: '#9AD8F0', 'stroke-width': 1.5, opacity: 0.6 }));
  el('path', { d: 'M 60 190 L 60 150 Q 60 138 72 138 M 74 190 L 74 150 Q 74 142 80 142', fill: 'none', stroke: '#C9D1DC', 'stroke-width': 4, 'stroke-linecap': 'round' });
  // 看板
  const sx = 318;
  k.shadow(sx, FY + 2, 22, 5);
  el('rect', { x: sx - 3, y: FY - 90, width: 6, height: 92, fill: pal.sub });
  el('rect', { x: sx - 44, y: FY - 142, width: 88, height: 56, rx: 8, fill: '#fff', stroke: pal.red, 'stroke-width': 5 });
  k.text(sx, FY - 112, 'NO', { 'font-size': 20, fill: pal.red });
  k.text(sx, FY - 94, 'RUNNING', { 'font-size': 14, fill: pal.red });
  const b = k.buddy({ x: 30, y: FY + 2, scale: S });
  const bub = say(k, 36, 32, -1); k.text(0, 7, '!', { 'font-size': 22, fill: pal.red }, bub.g);

  // 走りかけ→減速して止まる→ゆっくり歩く
  const xf = (t) => (t < 1.5 ? lerp(30, 150, easeOut(seg(t, 0.0, 1.5)) * 0.6 + seg(t, 0, 1.5) * 0.4 * (1 - seg(t, 1, 1.5))) : lerp(150, 250, easeInOut(seg(t, 2.2, 4.4))));
  return {
    update(t) {
      const w = t < 1.9 ? run(xf, t, 30) : walkTo(xf, t, 150);
      const brake = hump(seg(t, 0.95, 1.9)), sprint = seg(t, 0, 0.5) * (1 - seg(t, 0.95, 1.5));
      const looky = t > 1.1 && t < 2.3;
      P(b, { ...w, lean: (w.lean || 0) - 16 * brake + 0, look: looky ? 0.8 : 0.3, mood: looky ? 'open' : t > 2.3 ? 'smile' : 'grin',
        squash: 1 - 0.05 * hump(seg(t, 1.0, 1.4)), armL: looky ? lerp(8, 70, easeOut(seg(t, 1.1, 1.4))) : w.armL, armR: looky ? lerp(8, 70, easeOut(seg(t, 1.1, 1.4))) : w.armR, blink: blinkAt(t) });
      bub.show(seg(t, 1.25, 1.55) * (1 - seg(t, 2.2, 2.4)), b.state.x - 6, FY - 112);
    }
  };
}
