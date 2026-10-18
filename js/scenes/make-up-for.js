// make up for：遅れた分（グラフの足りない所）を、夜まで残業して埋め合わせる（例文 I'll work late to make up for lost time.）
import { seg, lerp, easeInOut, easeOut, backOut } from '../ease.js';
import { P, blinkAt, clock, win, star } from './run-after.js';
import { frontL } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '遅れがある'], [1.4, '遅くまで働く'], [3.7, '取り戻した']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const w = win(k, 24, 40, 96, 74, '#FCD9B8');
  const stars = [[44, 58], [96, 70], [70, 92]].map(([x, y]) => el('circle', { cx: x, cy: y, r: 2, fill: '#FFF3C4' }, w.inner));
  w.frame();
  const ck = clock(k, 170, 64, 22);
  // 予定表：目標ライン、遅れた所（赤）を青で埋めていく
  el('rect', { x: 232, y: 34, width: 146, height: 92, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  el('rect', { x: 246, y: 62, width: 118, height: 18, rx: 4, fill: '#EEF1F5' });
  el('rect', { x: 246, y: 62, width: 64, height: 18, rx: 4, fill: pal.blue });
  const gap = el('rect', { x: 310, y: 62, width: 54, height: 18, fill: '#FFD3CC', stroke: pal.red, 'stroke-width': 2, 'stroke-dasharray': '4 3' });
  const fill = el('rect', { x: 306, y: 62, width: 0, height: 18, rx: 4, fill: pal.blue });
  el('line', { x1: 364, y1: 50, x2: 364, y2: 92, stroke: pal.ink, 'stroke-width': 2.5 });
  const ok = k.text(318, 106, '✓', { 'font-size': 20, fill: pal.green, opacity: 0 });
  const S = 0.9;
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const L = frontL(b, S);
  // 机・ノートPC・ライト
  el('rect', { x: 170, y: 176, width: 160, height: 10, rx: 4, fill: pal.wood });
  el('rect', { x: 312, y: 186, width: 8, height: 50, fill: pal.woodDark });
  el('path', { d: 'M 200 176 L 214 140 L 262 140 L 254 176 Z', fill: '#8F9BB0' });
  el('rect', { x: 196, y: 172, width: 66, height: 5, rx: 2, fill: '#C4CCD8' });
  const glow = el('path', { d: 'M 302 140 L 280 176 L 330 176 Z', fill: '#FFF3C4', opacity: 0 });
  el('path', { d: 'M 300 176 L 300 132 L 312 124', stroke: pal.ink, 'stroke-width': 3, fill: 'none' });
  el('path', { d: 'M 306 122 L 322 126 L 314 138 Z', fill: pal.yellow });
  k.shadow(250, 237, 86, 5);
  const sp = [0, 1].map(() => star(k));
  return {
    update(t) {
      const night = easeInOut(seg(t, 0.8, 2.6));
      const c1 = [252, 217, 184], c2 = [52, 64, 98];
      w.sky.setAttribute('fill', `rgb(${c1.map((v, i) => Math.round(lerp(v, c2[i], night))).join(',')})`);
      stars.forEach((s) => s.setAttribute('opacity', seg(night, 0.6, 1)));
      glow.setAttribute('opacity', 0.7 * seg(night, 0.3, 0.6));
      ck.set(6, 180 * easeInOut(seg(t, 0.6, 3.6)));
      const work = t > 0.6 && t < 3.6;
      const ty = Math.sin(t * 22) * (work ? 10 : 0);
      P(b, { x: 150, armR: work ? 70 + ty : lerp(20, 70, seg(t, 0.3, 0.6)), lean: 6, mood: t > 3.7 ? 'grin' : 'flat', look: 0.6, blink: blinkAt(t), squash: 1 - (t > 2.4 && t < 3.6 ? 0.02 * Math.sin(t * 3) : 0) });
      L.set(work ? 70 - ty : 40);
      const f = easeInOut(seg(t, 0.8, 3.6));
      k.set(fill, { width: 58 * f });
      gap.setAttribute('opacity', 1 - seg(f, 0.85, 1));
      const q = seg(t, 3.6, 3.9); ok.setAttribute('opacity', q); tf(ok, 0, 6 * (1 - easeOut(q)));
      sp.forEach((s, i) => s.set(330 + i * 34, 60 + i * 12, seg(t, 3.6 + i * 0.15, 4.3 + i * 0.15)));
    }
  };
}
