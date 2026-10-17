// better late than never：時計は遅い時刻→しょんぼり→気持ちを切り替えて机に向かい、遅くても勉強を始める（I started studying late, but better late than never.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
const rad = (d) => (d * Math.PI) / 180;

export const meta = { duration: 4.2, beats: [[0, '遅い時刻'], [1.4, 'よし始める'], [3.0, '勉強中']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 14, width: 400, height: 14, fill: '#EDE6DB' });
  // 壁の時計（夜遅い時刻）とカレンダー
  const cg = g({}); tf(cg, 90, 78);
  el('circle', { r: 30, fill: '#fff', stroke: pal.ink, 'stroke-width': 4 }, cg);
  for (let i = 0; i < 12; i++) el('line', { x1: 0, y1: -24, x2: 0, y2: -27, stroke: pal.sub, 'stroke-width': 2, transform: `rotate(${i * 30})` }, cg);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -15, stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round', transform: 'rotate(325)' }, cg);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -23, stroke: pal.ink, 'stroke-width': 2.6, 'stroke-linecap': 'round', transform: 'rotate(30)' }, cg);
  const cal = g({}); tf(cal, 320, 50);
  el('rect', { width: 64, height: 70, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 3 }, cal);
  el('rect', { width: 64, height: 16, rx: 6, fill: pal.red }, cal);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) el('rect', { x: 8 + c * 14, y: 24 + r * 14, width: 9, height: 8, rx: 2, fill: r === 2 && c === 3 ? pal.red : pal.line }, cal);
  // 机と椅子（奥）、本
  el('rect', { x: 246, y: 150, width: 10, height: 86, rx: 4, fill: pal.woodDark });
  const bookClosed = g({}); tf(bookClosed, 175, 208);
  el('rect', { x: -22, y: -7, width: 44, height: 14, rx: 3, fill: pal.blue }, bookClosed);
  el('rect', { x: -20, y: -3, width: 40, height: 4, fill: '#fff' }, bookClosed);
  const b = k.buddy({ x: 335, y: FY, facing: -1 });
  // 机（手前）
  const desk = g({});
  el('rect', { x: 140, y: 208, width: 140, height: 10, rx: 3, fill: pal.wood }, desk);
  el('rect', { x: 147, y: 218, width: 8, height: 18, fill: pal.woodDark }, desk);
  el('rect', { x: 265, y: 218, width: 8, height: 18, fill: pal.woodDark }, desk);
  const bookOpen = g({}); tf(bookOpen, 190, 206);
  el('path', { d: 'M -26 0 L 0 -6 L 26 0 L 26 -3 L 0 -9 L -26 -3 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, bookOpen);
  [0, 1, 2].forEach((i) => { el('line', { x1: -20, y1: -2 - i * 0.2, x2: -5, y2: -4, stroke: pal.sub, 'stroke-width': 1, opacity: 0.6 }, bookOpen); });
  // 進み具合の星
  const stars = [0, 1, 2].map((i) => { const s = g({}); el('path', { d: 'M 0 -9 L 2.6 -3 L 9 -2.6 L 4 1.6 L 5.5 8 L 0 4.5 L -5.5 8 L -4 1.6 L -9 -2.6 L -2.6 -3 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, s); return s; });
  const pencil = g({});
  el('rect', { x: -1.5, y: -14, width: 3, height: 14, fill: pal.yellowDark }, pencil);
  el('path', { d: 'M -1.5 0 L 1.5 0 L 0 4 Z', fill: pal.ink }, pencil);
  const sigh = el('path', { d: 'M 0 0 q 6 -6 12 0 t 12 0', fill: 'none', stroke: pal.sub, 'stroke-width': 2.5, 'stroke-linecap': 'round' });

  return {
    update(t) {
      // 手前の机を最後に重ねる（描画順のため一度だけ末尾へ）
      const down = easeOut(seg(t, 0.4, 0.9));
      const walk = easeInOut(seg(t, 1.9, 2.6));
      const x = lerp(335, 215, walk);
      const sit = easeOut(seg(t, 2.6, 3.0));
      const v = Math.abs(lerp(335, 215, easeInOut(seg(t + 0.02, 1.9, 2.6))) - lerp(335, 215, easeInOut(seg(t - 0.02, 1.9, 2.6)))) / 0.04, m = clamp(v / 25);
      const resolve = hump(seg(t, 1.4, 2.1));
      b.pose({
        x, walk: (335 - x) * 0.107, facing: -1,
        armL: 8 + Math.sin((335 - x) * 0.107) * 18 * m + 20 * down * (1 - walk) * 0,
        armR: resolve > 0 ? lerp(8, 100, resolve) : 8 + sit * 50 + (sit > 0.5 ? 14 * Math.sin(t * 9) : 0) - Math.sin((335 - x) * 0.107) * 18 * m * (1 - sit),
        lean: lerp(-4 * down, 0, seg(t, 1.4, 1.8)) + 3 * m + 12 * sit, squash: 1 - 0.1 * sit - 0.04 * hump(seg(t, 1.4, 1.7)) + 0.04 * down * 0,
        lift: 0, look: 0.5, mood: t < 1.4 ? 'sad' : t < 2.6 ? 'grin' : 'smile', blink: 0
      });
      b.g.setAttribute('transform', b.g.getAttribute('transform') + ` translate(0 ${(6 * sit).toFixed(1)})`);
      // 机・本・鉛筆・星
      bookClosed.setAttribute('opacity', sit > 0.3 ? 0 : 1);
      bookOpen.setAttribute('opacity', sit > 0.3 ? 1 : 0);
      tf(pencil, 180 + 12 * Math.sin(t * 7), 202, 40);
      pencil.setAttribute('opacity', sit > 0.8 ? 1 : 0);
      stars.forEach((s, i) => {
        const p = easeOut(seg(t, 3.2 + i * 0.3, 3.5 + i * 0.3));
        tf(s, 186 + i * 24, 118 - 8 * p, 0, p);
      });
      k.set(sigh, { transform: `translate(${300} ${150 - 10 * seg(t, 0.4, 1.3)})`, opacity: t < 1.4 ? hump(seg(t, 0.3, 1.4)) : 0 });
      // 時計の秒針代わりに小さく揺れ
      tf(cg, 90, 78, 2 * Math.sin(t * 8) * (t < 1.4 ? 1 : 0));
    }
  };
}
