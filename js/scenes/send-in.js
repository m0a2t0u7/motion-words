import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';
const D = Math.PI / 180;
// 手(R/L)を点(tx,ty)へ向ける腕の角度
function aim(b, S, tx, ty, side = 'R') {
  const s = b.state, f = s.facing, o = side === 'R' ? 1 : -1;
  return Math.atan2((tx - (s.x + 27 * S * f * o)) * f * o, ty - (s.y - 56 * S - s.lift)) / D;
}
function cursor(k, parent) {
  return k.el('path', { d: 'M0 0 L0 15 L4 11.5 L7 18 L10 16.5 L7 10.5 L12 10.5 Z', fill: k.pal.ink, stroke: '#fff', 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, parent);
}
function pen(k, parent, c) {
  const p = k.g({}, parent);
  k.el('line', { x1: 0, y1: 0, x2: -22, y2: -6, stroke: c || k.pal.coralDark, 'stroke-width': 5, 'stroke-linecap': 'round' }, p);
  k.el('path', { d: 'M 0 0 L 6 1.6 L 0 3 Z', fill: '#F4D9B5' }, p);
  k.el('circle', { cx: 5.2, cy: 1.7, r: 1.1, fill: k.pal.ink }, p);
  return p;
}

// send-in：書類（申込書）を封筒に入れてポストへ投函し、提出先へ届ける（I sent in my application yesterday.）
export const meta = { duration: 4.4, beats: [[0, '書類を持つ'], [1.5, 'ポストへ入れる'], [3.4, '提出先に届く']] };

function envelope(k, parent) {
  const e = k.g({}, parent);
  k.el('rect', { x: -14, y: -9, width: 28, height: 18, rx: 3, fill: '#fff', stroke: '#B8C2D1', 'stroke-width': 2 }, e);
  k.el('path', { d: 'M -13 -8 L 0 3 L 13 -8', fill: 'none', stroke: '#B8C2D1', 'stroke-width': 2, 'stroke-linejoin': 'round' }, e);
  return e;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  const S = 1.1;
  // 提出先の建物
  const bd = g({});
  k.shadow(360, FY, 44, 5, bd);
  el('rect', { x: 330, y: 120, width: 62, height: 116, rx: 4, fill: '#E9EDF3', stroke: '#CBD3DE', 'stroke-width': 2 }, bd);
  el('rect', { x: 326, y: 112, width: 70, height: 12, rx: 3, fill: pal.violet }, bd);
  [[340, 136], [366, 136], [340, 166], [366, 166]].forEach(([x, y]) => el('rect', { x, y, width: 18, height: 18, rx: 3, fill: '#CFE6F7' }, bd));
  el('rect', { x: 350, y: 200, width: 22, height: 36, rx: 3, fill: pal.violetDark || '#8B73DC' }, bd);
  const tray = el('rect', { x: 340, y: 100, width: 42, height: 10, rx: 3, fill: '#B9C2CF' });
  // ポスト
  k.shadow(270, FY, 34, 5);
  el('rect', { x: 246, y: 140, width: 48, height: 96, rx: 14, fill: pal.red });
  el('rect', { x: 246, y: 140, width: 48, height: 16, rx: 8, fill: '#D9534F' });
  el('rect', { x: 258, y: 168, width: 24, height: 5, rx: 2.5, fill: '#7C2A27' });
  el('rect', { x: 250, y: 214, width: 40, height: 8, fill: '#fff', opacity: 0.35 });
  // 封筒
  const env = envelope(k);
  const b = k.buddy({ x: 120, y: FY, scale: S });
  const ring = el('circle', { r: 10, fill: 'none', stroke: pal.green, 'stroke-width': 3 });
  const ck = el('path', { d: 'M -6 0 L -2 5 L 7 -6', stroke: pal.green, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  return {
    update(t) {
      const walk = easeInOut(seg(t, 0.3, 1.5));
      const x = lerp(120, 205, walk);
      const walking = walk > 0 && walk < 1;
      const put = easeInOut(seg(t, 1.5, 2.0));
      const back = easeInOut(seg(t, 2.1, 2.6));
      b.pose({ x, walk: walking ? t * 9 : 0, armR: lerp(30, aim({ state: { x, y: FY, lift: 0, facing: 1 } }, S, 262, 170), put) * (1 - back) + 8 * back, lean: 5 * put * (1 - back), look: 1, mood: t > 3.3 ? 'grin' : 'smile', blink: t > 0.15 && t < 0.25 ? 1 : 0 });
      const h = b.handPos('R');
      // 封筒：手 → ポスト投入口 → 建物の受け皿へ
      const inSlot = seg(t, 1.9, 2.3);
      const fly = easeInOut(seg(t, 2.5, 3.5));
      let ex = h.x + 8, ey = h.y - 4, rot = -10, sc = 1, op = 1;
      if (t >= 1.9) { ex = lerp(h.x + 8, 270, inSlot); ey = lerp(h.y - 4, 168, inSlot); rot = -10 * (1 - inSlot); sc = 1 - 0.1 * inSlot; }
      if (t >= 2.3) { ex = 270; ey = 168; }
      if (t >= 2.5) { ex = lerp(270, 361, fly); ey = lerp(168, 98, fly) - Math.sin(Math.PI * fly) * 50; sc = 0.9; rot = fly * 8; }
      tf(env, ex, ey, rot, sc);
      // 投函中はポストに隠れる（投入口より下を隠す）
      k.set(env, { opacity: t >= 2.15 && t < 2.5 ? 0 : 1 });
      const arrive = seg(t, 3.5, 3.7);
      tf(ring, 361, 90, 0, 0.6 + arrive);
      k.set(ring, { opacity: hump(arrive) * 0.0 });
      tf(ck, 361, 84, 0, backOut(seg(t, 3.55, 3.9)));
      k.set(ck, { opacity: seg(t, 3.55, 3.65) });
    }
  };
}
