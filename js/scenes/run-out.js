// run out：印刷の途中でインクの残量がゼロになり、文字がかすれて出なくなる（例文 The ink ran out in the middle of printing.）
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '印刷を始める'], [1.8, 'インクが減る'], [3.4, 'インク切れ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 150, y: 196, width: 200, height: 10, rx: 3, fill: pal.wood });
  el('rect', { x: 160, y: 206, width: 8, height: 34, fill: pal.woodDark });
  el('rect', { x: 332, y: 206, width: 8, height: 34, fill: pal.woodDark });
  // 出てくる紙（プリンターの下から手前へ）
  const pc = g({ 'clip-path': k.clip((c) => el('rect', { x: 0, y: 180, width: 400, height: 120 }, c)) });
  const paper = g({}, pc);
  el('rect', { x: -40, y: 0, width: 80, height: 100, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, paper);
  const lines = Array.from({ length: 8 }, (_, i) => el('rect', { x: -30, y: 10 + i * 11, width: 60 - (i % 3) * 10, height: 4, rx: 2, fill: pal.ink }, paper));
  // プリンター本体（紙の上に重なる）
  el('rect', { x: 196, y: 120, width: 120, height: 66, rx: 10, fill: '#E7E9EE', stroke: '#C9CED8', 'stroke-width': 2 });
  el('rect', { x: 206, y: 176, width: 100, height: 8, rx: 3, fill: '#9AA3B2' });
  el('rect', { x: 214, y: 134, width: 40, height: 10, rx: 3, fill: '#C9CED8' });
  // インク残量計
  el('rect', { x: 268, y: 132, width: 36, height: 14, rx: 3, fill: '#fff', stroke: pal.ink, 'stroke-width': 1.5 });
  const bar = el('rect', { x: 270, y: 134, width: 32, height: 10, rx: 2, fill: pal.ink });
  const warn = el('circle', { cx: 300, cy: 162, r: 5, fill: pal.red });
  const B = k.buddy({ x: 90, y: FY, scale: 0.85 });
  return {
    update(t) {
      const feed = easeInOut(seg(t, 0.4, 3.2));
      // 紙は上から下へ送られる：見えるのはプリンターの下
      tf(paper, 256, lerp(80, 178, feed));
      const ink = clamp(1 - seg(t, 0.4, 2.2));
      k.set(bar, { width: 32 * ink, fill: ink < 0.25 ? pal.red : pal.ink });
      // 印字：紙の上の方の行ほど先に刷られる。インクが減ると薄く、切れたら空白
      lines.forEach((l, i) => {
        // 下の行から先に出てくる（紙は下へ伸びる）
        const tline = 0.4 + (8 - i) / 8 * 2.8;
        const inkAt = clamp(1 - seg(Math.min(t, tline), 0.4, 2.2));
        l.setAttribute('opacity', t < tline ? 0 : inkAt < 0.05 ? 0 : 0.2 + 0.8 * inkAt);
      });
      warn.setAttribute('opacity', ink <= 0 ? (Math.sin(t * 12) > 0 ? 1 : 0.2) : 0);
      const puz = seg(t, 2.6, 3.0);
      B.pose({ look: 0.8, mood: t > 2.6 ? 'open' : 'smile', armR: lerp(8, 40, easeOut(puz)), lean: 4 * puz, squash: 1 });
    }
  };
}
