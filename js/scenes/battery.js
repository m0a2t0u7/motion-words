// battery：置き時計の秒針が動かず止まっている。裏から電池を取り出すと、残量が空っぽ（例文 The battery in this clock is dead, so it has stopped.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { reach, hp, P, blinkAt, face, homeBg, backTable } from './bag.js';
import { mark } from './so-far-so-good.js';

export function cell(k, parent, level = 0) {
  const g = k.g({}, parent), { el, pal } = k;
  el('rect', { x: -6, y: -12, width: 12, height: 24, rx: 2, fill: '#5A6472' }, g);
  el('rect', { x: -6, y: -12, width: 12, height: 8, rx: 2, fill: '#E9B43A' }, g);
  el('rect', { x: -2.5, y: -15, width: 5, height: 3, fill: '#C9D1DC' }, g);
  el('rect', { x: -3.5, y: 6, width: 7, height: 3, rx: 1, fill: pal.red }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '時計が止まってる'], [1.4, '電池を出す'], [2.8, '電池が切れてる']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.15, FY = 236, X = 160;
  homeBg(k, { FY, winX: 30, winW: 80 });
  const TY = backTable(k, 200, 340, 192, FY);
  const CX = 262;
  // 置き時計（中の電池入れは下）
  const ck = k.g({});
  el('rect', { x: -26, y: -58, width: 52, height: 58, rx: 10, fill: pal.blue }, ck);
  el('circle', { cx: 0, cy: -32, r: 20, fill: '#fff' }, ck);
  el('line', { x1: 0, y1: -32, x2: -8, y2: -38, stroke: pal.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }, ck);
  el('line', { x1: 0, y1: -32, x2: 0, y2: -48, stroke: pal.ink, 'stroke-width': 2, 'stroke-linecap': 'round' }, ck);
  const sec = el('line', { x1: 0, y1: -32, x2: 12, y2: -44, stroke: pal.red, 'stroke-width': 1.4 }, ck);
  el('rect', { x: -14, y: -9, width: 28, height: 7, rx: 2, fill: pal.blueDark }, ck);
  tf(ck, CX, TY);
  const bat = cell(k);
  const b = k.buddy({ x: X, y: FY, scale: S });
  const q = mark(k, 'q', k.root, 1.2);
  return {
    update(t) {
      // 秒針は少し震えるだけで進まない
      sec.setAttribute('transform', `rotate(${(t < 1.6 ? Math.sin(t * 20) * 2 * (Math.sin(t * 3) > 0.6) : 0).toFixed(2)} 0 -32)`);
      const reachP = easeInOut(seg(t, 1.2, 1.6)), pull = easeInOut(seg(t, 1.7, 2.3)), show = easeInOut(seg(t, 2.4, 2.9));
      P(b, { x: X + 30 * reachP, lean: 10 * reachP * (1 - show), look: 0.8, blink: blinkAt(t), mood: t > 2.9 ? 'sad' : t > 0.5 ? 'flat' : 'smile' });
      face(b, 5, t < 1.2 ? 1 : 2);
      tf(q, X + 10, FY - 120, 0, Math.max(0.001, hump(seg(t, 0.4, 1.3)) * 1.4));
      const P0 = { x: CX - 6, y: TY - 6 };
      let tx = lerp(X + 60, P0.x, reachP), ty = lerp(FY - 50, P0.y, reachP);
      if (t > 1.7) { tx = lerp(P0.x, P0.x - 14, pull); ty = lerp(P0.y, TY - 30, pull); }
      if (t > 2.4) { tx = lerp(P0.x - 14, X + 74, show); ty = lerp(TY - 30, FY - 104, show); }
      b.pose({ armR: reach(b, S, 'R', tx, ty) });
      const h = hp(b, S, 'R');
      if (t < 1.7) tf(bat, CX - 6, TY - 6, 90, 0.6); else tf(bat, h.x, h.y - 6, lerp(90, 0, pull), lerp(0.6, 1.2, show));
      bat.parentNode.appendChild(bat);
    }
  };
}
