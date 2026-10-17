// out of one's depth：会議で難しい資料が次々に出て、自分には手に負えず、頭を抱えて小さくなる（I felt out of my depth in the meeting.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '聞いている'], [1.6, '難しくなる'], [3.4, '手に負えない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: 150, width: 400, height: 6, fill: pal.line, opacity: 0.6 });
  // ホワイトボード
  el('rect', { x: 186, y: 36, width: 156, height: 112, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 4 });
  const draw = (d, a, b, extra = {}) => { const p = el('path', { d, fill: 'none', stroke: pal.blueDark, 'stroke-width': 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1, ...extra }); return { p, a, b }; };
  const items = [
    draw('M 200 130 L 200 52 M 200 130 L 330 130', 0.6, 1.0),
    draw('M 206 120 Q 230 60 256 100 T 322 62', 1.0, 1.6, { stroke: pal.red }),
    draw('M 214 92 L 214 86 M 232 92 L 232 78 M 250 92 L 250 70', 1.3, 1.8, { 'stroke-width': 7 }),
    draw('M 262 48 q 8 -8 14 0 t 14 0 t 14 0 M 262 66 h 56 M 262 78 q 10 -10 20 0 t 20 0', 1.7, 2.3, { stroke: pal.violet }),
    draw('M 290 110 a 16 16 0 1 0 0.1 0 M 300 100 L 322 88 L 316 100 M 322 88 L 310 86', 2.1, 2.7, { stroke: pal.green }),
    draw('M 222 112 l 14 -10 l 10 12 l 16 -14', 2.5, 3.0, { stroke: pal.yellowDark })
  ];
  const pres = k.buddy({ x: 358, y: 238, facing: -1, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: 96, y: 238 });
  // 机（手前）と資料
  el('rect', { x: 20, y: 214, width: 150, height: 8, rx: 4, fill: pal.wood });
  el('rect', { x: 30, y: 222, width: 130, height: 14, fill: pal.woodDark });
  el('rect', { x: 36, y: 206, width: 34, height: 9, rx: 2, fill: '#fff', stroke: pal.line });
  const qs = [0, 1, 2].map(() => { const q = g({}); k.text(0, 0, '?', { 'font-size': 26, fill: pal.violet }, q); return q; });
  return {
    update(t) {
      items.forEach((o) => o.p.setAttribute('stroke-dashoffset', 1 - easeInOut(seg(t, o.a, o.b))));
      const pt = Math.sin(t * 5) * 6;
      pres.pose({ armR: lerp(8, 100, easeOut(seg(t, 0.3, 0.8))) + (t > 0.8 ? pt : 0), armL: 8, mood: 'open', look: -0.8, lean: -3 });
      const h = easeOut(seg(t, 2.6, 3.3)), dz = seg(t, 1.2, 2.4);
      me.pose({
        mood: t < 1.3 ? 'smile' : t < 2.7 ? 'flat' : 'sad', look: 0.6 - 0.9 * h,
        armL: lerp(8, 150, h), armR: lerp(8, 150, h),
        lean: lerp(0, -6, dz) + Math.sin(t * 6) * 1.5 * h, squash: 1 - 0.1 * h, blink: hump(seg(t, 2.8, 3.0))
      });
      qs.forEach((q, i) => {
        const p = easeOut(seg(t, 2.0 + i * 0.35, 2.5 + i * 0.35));
        tf(q, 70 + i * 28, lerp(150, 112 - (i % 2) * 14, p) + Math.sin(t * 3 + i) * 3, Math.sin(t * 2 + i) * 14, p, p);
      });
    }
  };
}
