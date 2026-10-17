// get something off one's chest：胸につかえた重い石を、友だちに話して外に出し、すっきりする（I need to get this off my chest.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '胸が重い'], [1.6, '打ち明ける'], [3.5, 'すっきり']] };

const rad = (d) => (d * Math.PI) / 180;
// 共通：正確な手先座標（体の傾き・つぶれ・向きを反映）
export function hp(b, s, side = 'R', len = 28) {
  const st = b.state, a = rad(side === 'R' ? -st.armR : st.armL);
  let x = (side === 'R' ? 27 : -27) - len * Math.sin(a), y = -46 + len * Math.cos(a);
  x *= 2 - st.squash; y *= st.squash;
  const l = rad(st.lean), c = Math.cos(l), sn = Math.sin(l);
  return { x: st.x + (x * c - y * sn) * st.facing * s, y: st.y + (x * sn + y * c - 10 - st.lift) * s };
}
// 共通：吹き出し（原点＝中心、尾は (tx,ty) へ）
export function bubble(k, w, h, tx, ty, parent) {
  const g = k.g({}, parent);
  const b = Math.max(-w / 2 + 18, Math.min(w / 2 - 18, tx * 0.5));
  k.el('polygon', { points: `${b - 7},${h / 2 - 2} ${tx},${ty} ${b + 7},${h / 2 - 2}`, fill: '#fff', stroke: '#CBD3DF', 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
  k.el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 16, fill: '#fff', stroke: '#CBD3DF', 'stroke-width': 2 }, g);
  k.el('rect', { x: b - 6, y: h / 2 - 3, width: 12, height: 4, fill: '#fff' }, g);
  return g;
}
export function spark(k, parent, color) {
  return k.el('path', { d: 'M0 -9 L2.5 -2.5 L9 0 L2.5 2.5 L0 9 L-2.5 2.5 L-9 0 L-2.5 -2.5Z', fill: color || k.pal.yellow }, parent);
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 36, y: 44, width: 80, height: 70, rx: 8, fill: '#DDEFFA' });
  el('line', { x1: 76, y1: 44, x2: 76, y2: 114, stroke: '#fff', 'stroke-width': 4 });
  el('line', { x1: 36, y1: 79, x2: 116, y2: 79, stroke: '#fff', 'stroke-width': 4 });
  el('ellipse', { cx: 210, cy: FY + 18, rx: 150, ry: 11, fill: '#EDE5D8' });
  // 観葉植物
  k.shadow(368, FY + 2, 22, 5);
  [[-14, -48], [0, -62], [14, -46]].forEach(([dx, dy]) => el('ellipse', { cx: 368 + dx, cy: FY - 26 + dy / 1.4, rx: 8, ry: 20, fill: pal.green, transform: `rotate(${dx * 1.6} ${368 + dx} ${FY - 26})` }));
  el('path', { d: `M 352 ${FY - 26} L 384 ${FY - 26} L 378 ${FY} L 358 ${FY} Z`, fill: pal.coralDark });
  const mint = k.buddy({ x: 130, y: FY });
  const coral = k.buddy({ x: 292, y: FY, color: pal.coral, dark: pal.coralDark, facing: -1 });
  // 重い石
  const rock = g({});
  el('path', { d: 'M -22 8 Q -26 -12 -8 -18 Q 12 -24 22 -6 Q 28 8 14 14 Q -8 18 -22 8 Z', fill: '#8993A4' }, rock);
  el('path', { d: 'M -14 -8 Q -4 -16 8 -12', stroke: '#B4BCC9', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, rock);
  el('path', { d: 'M 2 0 L 8 8 M 8 8 L 4 12', stroke: '#6A7384', 'stroke-width': 2.2, fill: 'none' }, rock);
  // 吹き出し
  const bub = bubble(k, 124, 58, -64, 54);
  const lines = [0, 1, 2].map((i) => el('path', { pathLength: 1, d: `M ${-46} ${-14 + i * 14} q 10 -8 20 0 t 20 0 t 20 0 t ${20 - i * 8} 0`, fill: 'none', stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, bub));
  const sp = [0, 1, 2].map((i) => spark(k, g({}), i === 1 ? pal.coral : pal.yellow));
  return {
    update(t) {
      const mx = 130;
      const stand = easeInOut(seg(t, 1.3, 1.9)), talk = t > 1.6 && t < 3.3;
      const open = easeOut(seg(t, 3.1, 3.7));
      mint.pose({
        lean: lerp(15, 0, stand) - 5 * open, squash: lerp(0.94, 1, stand) + 0.03 * Math.sin(t * 2) * (1 - stand),
        armL: lerp(22, 70, stand) + (talk ? 14 * Math.sin(t * 7) : 0) + 60 * open,
        armR: lerp(22, 80, stand) + (talk ? 14 * Math.sin(t * 7 + 1.5) : 0) + 60 * open,
        look: 0.7, mood: t < 1.5 ? 'sad' : t < 3.2 ? (Math.sin(t * 14) > 0 ? 'open' : 'smile') : 'grin', blink: 0
      });
      const nod = t > 1.9 ? Math.sin(t * 5) * 3 * (1 - seg(t, 3.2, 3.6)) : 0;
      coral.pose({ lean: 3 + nod, look: 0.5, mood: t < 1.5 ? 'flat' : 'smile', armR: lerp(8, 150, easeOut(seg(t, 3.4, 3.9))), armL: 8 });
      // 石：胸にのっている→吹き出しの中を通って上へ消える
      const p = easeInOut(seg(t, 1.9, 3.3));
      const sway = (1 - stand) * Math.sin(t * 3) * 1.5;
      tf(rock, lerp(mx + 20, mx - 52, p), lerp(FY - 36 + sway, 54, p), p * -30, lerp(1, 0.35, p));
      rock.setAttribute('opacity', 1 - seg(t, 3.0, 3.5));
      tf(bub, 218, 92, 0, easeOut(seg(t, 1.5, 1.8)));
      bub.setAttribute('opacity', t > 3.3 ? 1 - seg(t, 3.3, 3.7) : seg(t, 1.5, 1.7));
      lines.forEach((l, i) => l.setAttribute('stroke-dashoffset', 1 - seg(t, 1.8 + i * 0.35, 2.4 + i * 0.35)));
      sp.forEach((s, i) => {
        const q = seg(t, 3.5 + i * 0.1, 4.0 + i * 0.1);
        tf(s.parentNode, mx + (i - 1) * 46, FY - 150 + (i === 1 ? -12 : 4) - 8 * q, 0, hump(q) * 1.2);
      });
    }
  };
}
