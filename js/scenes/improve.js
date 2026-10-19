// improve：英語の本で練習するたびに、英語力のグラフが目標の旗に近づいていく（例文 I want to improve my English.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, backOut } from '../ease.js';
import { hp } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { cue } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, 'もっと上手に'], [1.0, '練習する'], [3.2, '上達してきた']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236, S = 1.05;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // 壁のグラフ：英語力（ABC）と目標の旗
  const GX = 210, GY = 186, GH = 136;
  el('rect', { x: GX - 14, y: GY - GH - 10, width: 186, height: GH + 26, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  k.text(GX + 10, GY - GH + 4, 'ABC', { 'font-size': 13, fill: pal.blueDark });
  el('line', { x1: GX, y1: GY, x2: GX + 160, y2: GY, stroke: pal.sub, 'stroke-width': 2 });
  const goalY = GY - 110;
  el('line', { x1: GX + 4, y1: goalY, x2: GX + 156, y2: goalY, stroke: pal.coral, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' });
  el('line', { x1: GX + 150, y1: goalY, x2: GX + 150, y2: goalY - 26, stroke: pal.ink, 'stroke-width': 2.5 });
  el('path', { d: `M ${GX + 150} ${goalY - 26} L ${GX + 170} ${goalY - 20} L ${GX + 150} ${goalY - 13} Z`, fill: pal.red });
  const H = [26, 50, 74, 98];
  const bars = H.map((h, i) => el('rect', { x: GX + 14 + i * 32, y: GY, width: 22, height: 0, rx: 3, fill: i === 3 ? pal.green : pal.mint }));
  const me = k.buddy({ x: 100, y: FY, scale: S, facing: 1 });
  // 英語の本（両手で持つ）
  const book = g({});
  el('rect', { x: -24, y: -16, width: 48, height: 32, rx: 3, fill: pal.blueDark }, book);
  el('rect', { x: -22, y: -14, width: 21, height: 28, rx: 2, fill: '#fff' }, book);
  el('rect', { x: 1, y: -14, width: 21, height: 28, rx: 2, fill: '#fff' }, book);
  k.text(-11, -4, 'A', { 'font-size': 10, fill: pal.ink }, book); k.text(11, -4, 'B', { 'font-size': 10, fill: pal.ink }, book);
  [5, 9].forEach((y) => el('path', { d: `M -18 ${y} h 13 M 5 ${y} h 13`, stroke: pal.line, 'stroke-width': 2 }, book));
  const words = ['Hi', 'Hello', 'Hello!'].map((s, i) => cue(k, s, 46 + i * 10, 28, -1, 13));
  return {
    update(t) {
      // 3回の練習。そのたびに読み上げ → 棒が1本伸びる
      const reps = [1.0, 1.8, 2.6];
      let mouth = 'smile';
      reps.forEach((a, i) => { words[i].show(seg(t, a, a + 0.2) * (1 - seg(t, a + 0.7, a + 0.8)), 148, 106); if (t > a && t < a + 0.6 && Math.sin(t * 22) > -0.2) mouth = 'open'; });
      const lvl = (i) => i === 0 ? 1 : easeOut(seg(t, reps[i - 1] + 0.4, reps[i - 1] + 0.8));
      bars.forEach((b, i) => { const h = H[i] * lvl(i) * (1 + 0.04 * wobble(seg(t, (reps[i - 1] || 0) + 0.8, (reps[i - 1] || 0) + 1.4), 2, 5)); k.set(b, { y: GY - h, height: Math.max(0, h) }); });
      const yay = easeOut(seg(t, 3.5, 3.8));
      P(me, { look: t < 3.5 ? 0.3 : 0.9, blink: blinkAt(t), armL: lerp(40, 30, yay), armR: lerp(40, 150, yay), lean: 4, mood: t > 3.5 ? 'grin' : mouth, lift: 10 * hump(seg(t, 3.5, 3.95)) });
      const L = hp(me, S, 'L');
      tf(book, (L.x + me.state.x + 22 * S) / 2 + 6, L.y - 8, -6 * yay, 0.95, 0.95);
    }
  };
}
