// soft：ベッドを手で押すとふわっと沈み、体を預けるとあたたかい（例文 The bed is soft and warm.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';

export const meta = { duration: 4.0, beats: [[0, '手で押す'], [1.3, 'ふわっと沈む'], [2.8, 'あたたかい']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const BT = FY - 46;                                // マットレスの上面
  el('rect', { x: 168, y: BT - 40, width: 14, height: 60, rx: 6, fill: pal.woodDark });
  const b = k.buddy({ x: 100, y: FY + 4, scale: 1 });
  // マットレス：押された位置 cx、深さ d で上面がへこむ
  const mat = el('path', { d: '', fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  const blanket = el('path', { d: '', fill: pal.coral });
  el('rect', { x: 164, y: BT + 16, width: 236, height: 14, fill: pal.woodDark });
  const glow = [0, 1, 2].map((i) => el('path', { d: 'M 0 0 q -6 -8 0 -16 q 6 -8 0 -16', stroke: pal.coral, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }));
  const dent = (cx, d, w = 46) => {
    const x0 = Math.max(172, cx - w), x1 = cx + w, ctl = (a, y) => `${a} ${y}`;
    return `M 172 ${BT + 18} L 172 ${BT} L ${x0} ${BT} Q ${cx} ${BT + d * 2} ${x1} ${BT} L 400 ${BT} L 400 ${BT + 18} Z`;
  };
  return {
    update(t) {
      const press = seg(t, 0.4, 0.9) * (1 - seg(t, 1.3, 1.7));            // 手で押す
      const sink = easeInOut(seg(t, 1.9, 2.8));                             // 体を預ける
      const px = lerp(150, 218, sink);
      mat.setAttribute('d', dent(px, press * 9 + sink * 10 + hump(seg(t, 1.6, 2.4)) * 2));
      const bx = lerp(100, 214, easeInOut(seg(t, 1.8, 2.8)));
      // 毛布は人物の手前に重ねる（座った体の下半身を包む）
      blanket.setAttribute('d', `M ${px - 38} ${BT + sink * 12 + 6} Q ${px} ${BT + 24 + sink * 10} ${px + 70} ${BT + 6 + sink * 4} L ${px + 70} ${BT + 28} L ${px - 38} ${BT + 28} Z`);
      blanket.setAttribute('opacity', sink > 0.3 ? 1 : 0);
      P(b, { x: bx, y: lerp(FY + 4, BT + 14, easeOut(sink)), armR: lerp(8, 62, seg(t, 0.2, 0.5)) * (1 - sink) + 8 * sink, squash: lerp(1, 0.72, sink), lean: lerp(6 * press, 0, sink), mood: sink > 0.6 ? 'grin' : 'open', look: 0.5, blink: blinkAt(t) + 0, facing: 1, walk: 0 });
      // へこむ位置は手の位置に合わせる
      if (press > 0) mat.setAttribute('d', dent(158, press * 9));
      glow.forEach((n, i) => { const p = ((t * 0.5 + i / 3) % 1), on = seg(t, 2.8, 3.3); tf(n, 260 + i * 36, BT - 10 - p * 36); n.setAttribute('opacity', on * (1 - p)); });
    }
  };
}
