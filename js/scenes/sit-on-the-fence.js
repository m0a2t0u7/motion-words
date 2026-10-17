// sit on the fence：柵の上に座ったまま、左のA・右のBを見比べて、どちらにも降りない（例文 Don't sit on the fence. Choose one.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '柵の上に座る'], [1.5, 'AとBで迷う'], [3.2, '決められない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 200, mood: 'outdoor' });
  el('rect', { x: 0, y: 200, width: 400, height: 100, fill: '#DDF1DF' });
  // 左右の看板
  const mkSign = (x, label, col) => {
    const s = g({});
    tf(s, x, 150);
    el('rect', { x: -3, y: 0, width: 6, height: 52, fill: pal.woodDark }, s);
    el('rect', { x: -26, y: -26, width: 52, height: 40, rx: 8, fill: col }, s);
    k.text(0, -6, label, { 'font-size': 28, fill: '#fff' }, s);
    return s;
  };
  const sA = mkSign(62, 'A', pal.blue), sB = mkSign(338, 'B', pal.coral);
  const sweat = el('path', { d: 'M 0 -6 Q 5 2 0 7 Q -5 2 0 -6 Z', fill: pal.water });
  // まめは柵の上（足は柵の後ろ）
  const TOP = 168;
  const b = k.buddy({ x: 200, y: TOP + 20, scale: 1.1 });
  // 柵（手前）
  k.shadow(200, 244, 190, 5);
  [30, 110, 200, 290, 370].forEach((x) => el('rect', { x: x - 7, y: TOP, width: 14, height: 78, rx: 3, fill: pal.wood }));
  el('rect', { x: 10, y: TOP + 2, width: 380, height: 14, rx: 5, fill: pal.woodDark });
  el('rect', { x: 10, y: TOP + 38, width: 380, height: 12, rx: 5, fill: pal.wood });
  el('rect', { x: 10, y: TOP + 2, width: 380, height: 4, rx: 2, fill: '#E8D2B0' });
  const arrowL = el('path', { d: 'M 150 120 L 112 120 M 124 110 L 112 120 L 124 130', fill: 'none', stroke: pal.blueDark, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const arrowR = el('path', { d: 'M 250 120 L 288 120 M 276 110 L 288 120 L 276 130', fill: 'none', stroke: pal.coralDark, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const q = k.text(200, 70, '?', { 'font-size': 32, fill: pal.sub });
  return {
    update(t) {
      const s = t < 1.3 ? 0 : Math.sin((t - 1.3) * 2.6);
      const sw = easeInOut(seg(t, 1.3, 4.0));
      const look = t < 1.3 ? 0 : Math.sin((t - 1.3) * 2.6 + 0.0);
      const lean = look * 6;
      b.pose({
        look: look, lean: lean, mood: t < 1.3 ? 'smile' : 'flat',
        armR: t < 1.3 ? 8 : 70 + 20 * Math.sin(t * 3), armL: t < 1.3 ? 8 : 70 - 20 * Math.sin(t * 3),
        walk: 0, lift: 0, squash: 1, blink: 0
      });
      // 目線の矢印はまめが見る向きに強調
      arrowL.setAttribute('opacity', t < 1.3 ? 0 : 0.35 + 0.65 * Math.max(0, -look));
      arrowR.setAttribute('opacity', t < 1.3 ? 0 : 0.35 + 0.65 * Math.max(0, look));
      tf(sA, 62, 150, 0, 1 + 0.1 * Math.max(0, -look));
      tf(sB, 338, 150, 0, 1 + 0.1 * Math.max(0, look));
      const qp = backOut(seg(t, 2.4, 2.9), 2);
      tf(q, 200, 82, 0, qp, qp); q.setAttribute('opacity', t < 2.4 ? 0 : 1);
      tf(sweat, 224, lerp(FY - 40, FY - 24, seg(t, 2.0, 3.2)));
      sweat.setAttribute('opacity', t > 2.0 ? 1 : 0);
    }
  };
}
