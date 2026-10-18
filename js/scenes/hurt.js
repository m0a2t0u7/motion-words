// hurt：長く座って作業していると時計が進み、腰を押さえて顔をしかめる（例文 My back hurts when I sit too long.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
const rad = (d) => (d * Math.PI) / 180;

export const meta = { duration: 4.4, beats: [[0, '座って作業'], [1.7, '時間が経つ'], [2.8, '腰が痛い']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 壁の時計と窓
  const clk = g({}); tf(clk, 80, 76);
  el('circle', { r: 26, fill: '#fff', stroke: pal.ink, 'stroke-width': 3.5 }, clk);
  for (let i = 0; i < 12; i++) { const a = rad(i * 30); el('line', { x1: Math.sin(a) * 20, y1: -Math.cos(a) * 20, x2: Math.sin(a) * 23, y2: -Math.cos(a) * 23, stroke: pal.sub, 'stroke-width': 1.8 }, clk); }
  const hh = el('line', { x1: 0, y1: 0, x2: 0, y2: -13, stroke: pal.ink, 'stroke-width': 3.4, 'stroke-linecap': 'round' }, clk);
  const mh = el('line', { x1: 0, y1: 0, x2: 0, y2: -19, stroke: pal.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, clk);
  el('rect', { x: 250, y: 44, width: 90, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('ellipse', { cx: 200, cy: 266, rx: 170, ry: 12, fill: '#F1D9CF' });
  // 机（横から見る）：天板と奥の脚
  el('rect', { x: 296, y: 212, width: 8, height: 38, fill: pal.woodDark });
  // いす
  el('rect', { x: 104, y: 164, width: 14, height: 84, rx: 6, fill: '#8C96AD' });
  el('rect', { x: 104, y: 228, width: 100, height: 12, rx: 5, fill: '#8C96AD' });
  el('rect', { x: 150, y: 240, width: 6, height: 20, fill: '#6F7A93' });
  const b = k.buddy({ x: 160, y: 246, facing: 1 });
  const lg = b.g.children[1].children;
  const leg = (i, a) => lg[i].setAttribute('transform', `translate(${i ? 12 : -12} -14) rotate(${a})`);
  el('rect', { x: 196, y: 208, width: 140, height: 9, rx: 3, fill: pal.wood });
  el('rect', { x: 196, y: 206, width: 140, height: 3, rx: 1.5, fill: '#fff', opacity: 0.4 });
  el('rect', { x: 316, y: 217, width: 8, height: 34, fill: pal.woodDark });
  // ノートPC
  const pc = g({}); tf(pc, 256, 208);
  el('path', { d: 'M -32 0 L 32 0 L 36 -6 L -28 -6 Z', fill: '#C8D0DC' }, pc);
  el('rect', { x: -28, y: -44, width: 56, height: 38, rx: 4, fill: '#E4E9F1', stroke: '#B5BFCE', 'stroke-width': 2 }, pc);
  el('rect', { x: -24, y: -40, width: 48, height: 30, rx: 2, fill: '#fff' }, pc);
  [-32, -24, -16].forEach((y, i) => el('line', { x1: -18, y1: y + 8, x2: 14 - i * 6, y2: y + 8, stroke: pal.blue, 'stroke-width': 2, 'stroke-linecap': 'round' }, pc));
  // 痛みの印
  const pain = g({});
  el('path', { d: 'M 0 -16 L 4 -5 L 15 -8 L 8 1 L 16 9 L 5 8 L 2 18 L -3 8 L -13 12 L -8 2 L -16 -6 L -5 -6 Z', fill: pal.red, stroke: '#C9483C', 'stroke-width': 2, 'stroke-linejoin': 'round' }, pain);
  const P = (o) => b.pose({ armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0, ...o });
  return {
    update(t) {
      const sp = easeInOut(seg(t, 0.2, 1.9)), hurt = easeOut(seg(t, 1.9, 2.5)), rub = t > 2.5 ? Math.sin((t - 2.5) * 7) * 5 : 0;
      const ty = Math.sin(t * 22) * (1 - seg(t, 1.8, 2.1));
      P({ armR: lerp(62 + 6 * ty, 40, hurt), armL: lerp(-30 - 6 * ty, 22 + rub, hurt), lean: 4 * (1 - hurt) + 9 * hurt, mood: hurt > 0.3 ? 'sad' : 'smile', blink: 0.6 * hurt, look: 0.5, squash: 1 - 0.02 * hurt });
      leg(0, -86); leg(1, -90);
      tf(mh, 0, 0, sp * 360 * 5); tf(hh, 0, 0, 40 + sp * 360 * 5 / 12);
      const pp = backOut(seg(t, 1.9, 2.3));
      tf(pain, 120, 202, 0, (pp > 0 ? pp * (1 + 0.12 * Math.sin(t * 16)) : 0) + 0.001);
      pain.setAttribute('opacity', hurt > 0 ? 1 : 0);
    }
  };
}
