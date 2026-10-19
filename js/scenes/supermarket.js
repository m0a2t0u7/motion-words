// supermarket：カートを押して棚の間を進み、りんごと牛乳を取ってカートに入れる（例文 I buy food at the supermarket.）
// 共有：cart（ショッピングカート）、shelves（商品棚の背景）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, reach, P, blinkAt, signBoard } from './restaurant.js';
import { gait } from './dig.js';
import { food } from './diet.js';

// カート（原点＝持ち手、右へ進む向き）。basket の中に物を入れられる
export function cart(k, parent) {
  const g = k.g({}, parent), c = '#8C96A4';
  k.el('path', { d: 'M 0 0 L 10 4 L 16 40', stroke: c, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }, g);
  const basket = k.g({}, g);
  k.el('path', { d: 'M 10 8 H 74 L 66 40 H 16 Z', fill: 'rgba(170,184,200,0.35)', stroke: c, 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
  [26, 38, 50, 62].forEach((x) => k.el('line', { x1: x, y1: 9, x2: x - 2, y2: 39, stroke: c, 'stroke-width': 1.5 }, g));
  k.el('line', { x1: 13, y1: 24, x2: 70, y2: 24, stroke: c, 'stroke-width': 1.5 }, g);
  k.el('path', { d: 'M 18 40 L 20 54 M 64 40 L 62 54 M 18 50 H 64', stroke: c, 'stroke-width': 3 }, g);
  [20, 62].forEach((x) => k.el('circle', { cx: x, cy: 57, r: 4.5, fill: k.pal.ink }, g));
  k.el('rect', { x: -6, y: -3, width: 12, height: 6, rx: 3, fill: k.pal.red }, g);
  g.insertBefore(basket, g.children[2]);
  return { g, basket };
}
export function shelves(k, FY, x0 = 0, x1 = 400) {
  const { el, pal } = k, cols = [pal.red, pal.yellow, pal.green, pal.blue, pal.violet, '#F7A9B4'];
  [104, 144, 184].forEach((y, r) => {
    el('rect', { x: x0, y, width: x1 - x0, height: 6, fill: '#B8C2CE' });
    for (let x = x0 + 8, i = r; x < x1 - 16; x += 22, i++) el('rect', { x, y: y - 22 + (i % 2) * 4, width: 16, height: 22 - (i % 2) * 4, rx: 3, fill: cols[i % cols.length] });
  });
  el('rect', { x: x0, y: 190, width: x1 - x0, height: FY - 190, fill: '#DCE3EB' });
}

export const meta = { duration: 4.4, beats: [[0, 'カートを押す'], [1.4, '食べ物を取る'], [3.4, 'カートに入れた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.15, FY = 246;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 54, fill: '#E7ECF1' });
  for (let x = 0; x < 400; x += 50) el('rect', { x, y: FY, width: 25, height: 54, fill: '#DEE4EB' });
  el('rect', { x: 0, y: 40, width: 400, height: 160, fill: '#F2F5F8' });
  shelves(k, 200);
  signBoard(k, 200, 26, 110, 24, 'FOOD', pal.green);
  // 取る物：りんご（上の棚）と牛乳（中の棚）
  const apple = food(k, 'apple'), milk = g({});
  el('rect', { x: -7, y: -22, width: 14, height: 22, rx: 2, fill: '#fff', stroke: pal.blue, 'stroke-width': 2 }, milk);
  el('path', { d: 'M -7 -22 L 0 -29 L 7 -22 Z', fill: pal.blue }, milk);
  const b = k.buddy({ x: 70, y: FY, scale: S });
  // 取る2品のまわりは棚をあけておく
  k.root.insertBefore(el('rect', { x: 232, y: 160, width: 44, height: 23, fill: '#F2F5F8' }), apple);
  const ct = cart(k);
  const xf = (t) => lerp(60, 196, easeInOut(seg(t, 0, 1.3)));
  const A0 = { x: 244, y: 184 }, M0 = { x: 262, y: 184 };
  return {
    update(t) {
      const gt = gait(xf, t, 60, 4), x = gt.x, cx = x + 52;
      tf(ct.g, cx, FY - 60);
      P(b, { x, walk: gt.walk, lean: 8 * gt.m + 2, look: t > 1.2 ? 0.6 : 0.2, blink: blinkAt(t), mood: t > 3.6 ? 'grin' : 'smile' });
      b.pose({ armL: reach(b, S, 'L', cx, FY - 60) });
      // 右手：棚→カートを2回
      const tA = easeInOut(seg(t, 1.3, 1.8)), bA = easeInOut(seg(t, 1.9, 2.5));
      const tM = easeInOut(seg(t, 2.7, 3.1)), bM = easeInOut(seg(t, 3.2, 3.7)), back = easeInOut(seg(t, 3.8, 4.2));
      const inA = { x: cx + 36, y: FY - 34 }, inM = { x: cx + 52, y: FY - 30 };
      let tgt = { x: x + 40, y: FY - 30 };
      if (t < 1.9) tgt = { x: lerp(x + 40, A0.x, tA), y: lerp(FY - 30, A0.y - 8, tA) };
      else if (t < 2.7) tgt = { x: lerp(A0.x, inA.x, bA), y: lerp(A0.y - 8, inA.y - 14, bA) - 20 * hump(bA) };
      else if (t < 3.2) tgt = { x: lerp(inA.x, M0.x, tM), y: lerp(inA.y - 14, M0.y - 10, tM) };
      else if (t < 3.8) tgt = { x: lerp(M0.x, inM.x, bM), y: lerp(M0.y - 10, inM.y - 14, bM) - 20 * hump(bM) };
      else tgt = { x: lerp(inM.x, x + 44, back), y: lerp(inM.y - 14, FY - 40, back) };
      b.pose({ armR: reach(b, S, 'R', tgt.x, tgt.y), lean: t > 1.3 && t < 3.8 ? 6 : b.state.lean });
      b.pose({ armR: reach(b, S, 'R', tgt.x, tgt.y) });
      const h = hp(b, S, 'R', 26);
      if (t < 1.8) tf(apple, A0.x, A0.y); else if (t < 2.55) tf(apple, h.x, h.y + 9); else tf(apple, inA.x, inA.y + 4 * easeOut(seg(t, 2.55, 2.7)));
      if (t < 3.1) tf(milk, M0.x, M0.y); else if (t < 3.75) tf(milk, h.x, h.y + 11); else tf(milk, inM.x, inM.y + 6 + 4 * easeOut(seg(t, 3.75, 3.9)));
    }
  };
}
