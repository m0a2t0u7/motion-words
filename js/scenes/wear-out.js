// wear out：毎日はいた靴が、1年（カレンダー1→12月）のうちにすり減って穴があく（例文 My shoes wore out after one year.）
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';
import { gait } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '新しい靴'], [1.6, '毎日はく'], [3.6, 'すり減った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // カレンダー（月の数字だけ変わる）
  el('rect', { x: 290, y: 46, width: 70, height: 66, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 290, y: 46, width: 70, height: 16, rx: 6, fill: pal.red });
  const mon = k.text(325, 90, '1', { 'font-size': 30 });
  const B = k.buddy({ x: 120, y: FY, scale: 0.9 });
  // 靴（足先にかぶせる）
  const legs = B.g.children[1].children;
  const shoes = [0, 1].map((i) => {
    const s = g({}, legs[i]);
    const body = el('path', { d: 'M -8 10 Q -8 4 0 4 L 8 6 Q 16 8 16 14 L 16 20 L -8 20 Z', fill: pal.blue }, s);
    const sole = el('rect', { x: -9, y: 19, width: 26, height: 4, rx: 2, fill: '#fff' }, s);
    const hole = el('ellipse', { cx: 10, cy: 12, rx: 3, ry: 2.4, fill: pal.ink }, s);
    const flap = el('path', { d: 'M 6 22 L 17 22 L 17 26 Z', fill: '#DAD6CF' }, s);
    return { body, sole, hole, flap };
  });
  // 足の位置を左右に行き来させる（同じ道を毎日歩く）
  const xf = (t) => 120 + 70 * Math.sin(Math.max(0, t - 0.3) * 2.2) * (1 - seg(t, 3.3, 3.6));
  return {
    update(t) {
      const w = easeInOut(seg(t, 0.4, 3.4));
      mon.textContent = String(1 + Math.min(11, Math.floor(w * 12)));
      const p = gait(xf, t, 120);
      const sy = Math.cos(Math.max(0, t - 0.3) * 2.2) >= 0;
      const look = seg(t, 3.5, 3.9);
      B.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: p.armR, lean: p.lean + 14 * look, facing: t > 3.3 ? 1 : sy ? 1 : -1, look: 0.2, mood: t > 3.6 ? 'sad' : 'smile' });
      shoes.forEach((s) => {
        k.set(s.body, { fill: w < 0.5 ? pal.blue : '#7FA9D9', opacity: 1 - 0.25 * w });
        s.sole.setAttribute('height', lerp(4, 1.5, w));
        k.set(s.hole, { opacity: clamp((w - 0.6) * 4), rx: 1 + 3 * w });
        s.flap.setAttribute('opacity', clamp((w - 0.8) * 5));
      });
    }
  };
}
