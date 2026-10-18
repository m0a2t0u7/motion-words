// reply：届いたメールを読み、すぐにキーボードで返信を送り返す（例文 I replied to her email right away.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { hp } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, 'メールが届く'], [1.5, '打ち返す'], [3.2, '返信済み']] };

function laptop(k, x, y, flip) {
  const L = k.g({}); k.tf(L, x, y);
  k.shadow(0, 2, 40, 5, L);
  k.el('path', { d: 'M -34 0 L 34 0 L 40 -7 L -28 -7 Z', fill: '#C8D0DC' }, L);
  k.el('rect', { x: -30, y: -50, width: 60, height: 44, rx: 4, fill: '#E4E9F1', stroke: '#B5BFCE', 'stroke-width': 2 }, L);
  const scr = k.el('rect', { x: -26, y: -46, width: 52, height: 36, rx: 2, fill: '#fff' }, L);
  const ic = k.g({}, L); k.tf(ic, 0, -28);
  return { L, scr, ic };
}
function env(k, c, parent) {
  const e = k.g({}, parent);
  k.el('rect', { x: -12, y: -8, width: 24, height: 16, rx: 2.5, fill: '#fff', stroke: c, 'stroke-width': 2 }, e);
  k.el('path', { d: 'M -12 -7 L 0 2 L 12 -7', stroke: c, 'stroke-width': 2, fill: 'none', 'stroke-linejoin': 'round' }, e);
  return e;
}
export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 150, y: 40, width: 100, height: 56, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const G = k.buddy({ x: 78, y: FY, facing: 1 });
  const C = k.buddy({ x: 322, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  el('rect', { x: 0, y: 200, width: 400, height: 8, fill: pal.wood });
  el('rect', { x: 0, y: 208, width: 400, height: 40, fill: '#F6D9B3' });
  const A = laptop(k, 150, 200), B = laptop(k, 250, 200);
  const eA = env(k, pal.coral, A.ic), eB = env(k, pal.blue, B.ic);
  const arrow = el('path', { d: 'M 8 -6 L -8 0 L 8 6 M -8 0 L 12 0', stroke: pal.blueDark, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, A.ic);
  const eC = env(k, pal.coral, B.ic);
  const fly1 = env(k, pal.coral, k.root), fly2 = env(k, pal.blue, k.root);
  const P = (b, o) => b.pose({ armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0, ...o });
  const arc = (p, x0, y0, x1, y1, h) => ({ x: lerp(x0, x1, easeInOut(p)), y: lerp(y0, y1, p) - h * Math.sin(p * Math.PI) });
  return {
    update(t) {
      const p1 = seg(t, 0.4, 1.3), p2 = seg(t, 2.5, 3.4);
      const typing = t > 1.5 && t < 2.5 ? 1 : 0;
      const ty = Math.sin(t * 22);
      P(C, { armR: t < 0.6 ? 20 + 50 * Math.abs(Math.sin(t * 14)) : 8, look: -0.6, mood: t > 3.4 ? 'grin' : 'smile', lean: 5 * (t < 0.6 ? 1 : 0) });
      P(G, { look: t < 1.4 ? lerp(0.2, 0.7, p1) : 0.5, armR: typing ? 55 + 8 * ty : t > 2.5 ? 8 : 40, armL: typing ? -45 - 8 * ty : 8, lean: 5 * typing, mood: t > 1.3 && t < 1.5 ? 'open' : 'smile', squash: 1 + 0.012 * Math.sin(t * 3) });
      // Cの画面：送信前はメールなし、返信が届くとメール
      eA.setAttribute('opacity', seg(t, 1.2, 1.35)); eB.setAttribute('opacity', t > 3.3 ? 1 : 0);
      k.set(arrow, { opacity: seg(t, 2.4, 2.5) });
      tf(eA, 0, 0, 0, t > 2.4 ? 0.001 : 1); tf(eC, 0, 0, 0, t < 0.45 ? 1 : 0.001); tf(eB, 0, 0, 0, 1);
      const f1 = arc(p1, 250, 160, 150, 160, 40); tf(fly1, f1.x, f1.y, 0, p1 > 0 && p1 < 1 ? 1 : 0.001);
      const f2 = arc(p2, 150, 160, 250, 160, 44); tf(fly2, f2.x, f2.y, 0, p2 > 0 && p2 < 1 ? 1 : 0.001);
      tf(B.ic, 0, -28, 0, t > 3.3 ? backOut(seg(t, 3.3, 3.7)) + 0.001 : t < 0.45 ? 1 : 0.001);
      tf(A.ic, 0, -28, 0, t < 1.3 ? 0.001 : 1);
    }
  };
}
