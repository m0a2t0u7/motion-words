// move on：ボードの第1問が済み、スライドが横へ動いて次の問題へ進む（例文 Let's move on to the next question.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble } from '../ease.js';

export const meta = { duration: 3.8, beats: [[0, '第1問が済む'], [1.4, '次へ進める'], [2.8, '第2問へ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'indoor' });
  // ボード枠
  el('rect', { x: 120, y: 34, width: 262, height: 160, rx: 10, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 6 });
  const cp = k.clip((c) => el('rect', { x: 126, y: 40, width: 250, height: 148, rx: 6 }, c));
  const wrap = g({ 'clip-path': cp });
  const slide = g({}, wrap);
  const card = (x, n, done) => {
    const c = g({ transform: `translate(${x} 0)` }, slide);
    el('rect', { x: 150, y: 62, width: 56, height: 56, rx: 12, fill: n === 1 ? pal.blue : pal.coral }, c);
    k.text(178, 91, 'Q' + n, { 'font-size': 26, fill: '#fff' }, c);
    [0, 1, 2].forEach((i) => el('rect', { x: 222, y: 70 + i * 18, width: 120 - i * 26, height: 9, rx: 4, fill: '#DCE2EB' }, c));
    return c;
  };
  card(0, 1); card(250, 2);
  const chk = el('path', { d: 'M 320 140 l 12 12 l 26 -30', fill: 'none', stroke: pal.green, 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1 }, slide);
  // 矢印
  const arrow = g({});
  el('path', { d: 'M -22 0 L 14 0 M 4 -12 L 18 0 L 4 12', fill: 'none', stroke: pal.coralDark, 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, arrow);
  const b = k.buddy({ x: 62, y: FY, scale: 1.0 });
  return {
    update(t) {
      const done = seg(t, 0.4, 0.9);
      chk.setAttribute('stroke-dashoffset', 1 - done);
      const sl = easeInOut(seg(t, 1.7, 2.7));
      tf(slide, -250 * sl, 0);
      const go = seg(t, 1.0, 1.6) * (1 - seg(t, 2.7, 3.0));
      tf(arrow, 250, 214 + 0, 0, 1 + 0.15 * Math.sin(t * 8) * go, 1);
      arrow.setAttribute('opacity', go);
      const push = seg(t, 1.3, 1.8), rel = seg(t, 2.7, 3.3);
      const lean = lerp(0, 8, easeOut(push)) * (1 - rel);
      b.pose({
        armR: lerp(8, 100, easeOut(push)) * (1 - rel) + 8 * rel + 6 * Math.sin(t * 6) * go,
        armL: 8, lean, look: 0.8,
        mood: t < 0.9 ? 'smile' : t < 2.7 ? 'open' : 'grin',
        x: 62 + 20 * easeOut(push) * (1 - rel)
      });
    }
  };
}
