import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
// 手先の座標（体の傾き・つぶれ・向きを反映）
function hp(b, s, side = 'R', len = 28) {
  const st = b.state, a = rad(side === 'R' ? -st.armR : st.armL);
  let x = (side === 'R' ? 27 : -27) - len * Math.sin(a), y = -46 + len * Math.cos(a);
  x *= 2 - st.squash; y *= st.squash;
  const l = rad(st.lean), c = Math.cos(l), sn = Math.sin(l);
  return { x: st.x + (x * c - y * sn) * st.facing * s, y: st.y + (x * sn + y * c - 10 - st.lift) * s };
}
function reach(b, s, side, tx, ty) {
  const st = b.state, o = hp(b, s, side, 0);
  const phi = deg(Math.atan2(-(tx - o.x) * st.facing, ty - o.y));
  return side === 'R' ? st.lean - phi : phi - st.lean;
}
const faceAt = (b, dx, dy = 0) => b.body.children[3].setAttribute('transform', `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
function gait(xf, t, x0, amp = 18, kf = 0.107) {
  const x = xf(t), v = Math.abs(xf(t + 0.02) - xf(t - 0.02)) / 0.04;
  const ph = Math.abs(x - x0) * kf, m = clamp(v / 25);
  const w = lerp(Math.round(ph / Math.PI) * Math.PI, ph, m);
  return { x, walk: w, armL: 8 + Math.sin(w) * amp * m, armR: 8 - Math.sin(w) * amp * m, lean: 3 * m, m };
}
function win(k, x, y, w, h, night) {
  const { el, pal } = k;
  el('rect', { x, y, width: w, height: h, rx: 6, fill: night ? '#2F3A5C' : '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: x + w / 2, y1: y, x2: x + w / 2, y2: y + h, stroke: '#fff', 'stroke-width': 4 });
}
const tag = (n, on) => n.setAttribute('opacity', on ? 1 : 0);
// iron：しわだらけのシャツにアイロンをかけて、ぴんとさせる（例文 I need to use the iron on this shirt.）
export const meta = { duration: 4.6, beats: [[0, 'しわのシャツ'], [2.2, 'アイロンをかける'], [4.1, 'ぴんと']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 0.95, TY = 223;
  win(k, 230, 36, 100, 70);
  const b = k.buddy({ x: 96, y: FY - 2, scale: S });
  // アイロン台（斜め上から見た面）。キャラはこの向こう側に立つ
  const board = g({});
  el('path', { d: 'M 140 234 L 392 234 L 374 206 L 158 206 Z', fill: '#9FB4D2' }, board);
  el('rect', { x: 140, y: 234, width: 252, height: 7, rx: 3, fill: '#7F96B8' }, board);
  el('path', { d: 'M 190 241 L 174 266 M 340 241 L 356 266', stroke: pal.sub, 'stroke-width': 4, 'stroke-linecap': 'round' }, board);
  k.shadow(266, 268, 100, 4, board);
  const shirt = g({}, board);
  el('path', { d: 'M 212 210 L 182 217 L 190 232 L 212 229 Z', fill: '#A9C8F2' }, shirt);
  el('rect', { x: 208, y: 208, width: 140, height: 24, rx: 6, fill: '#BBD6F6' }, shirt);
  el('path', { d: 'M 342 208 L 352 220 L 342 232 Z', fill: '#fff' }, shirt);
  [0, 1, 2].forEach((i) => el('circle', { cx: 326, cy: 213 + i * 7, r: 1.6, fill: '#fff' }, shirt));
  const WX = [226, 252, 278, 304];
  const wr = WX.map((x) => el('path', { d: `M ${x - 5} 210 l 5 5 l -5 5 l 5 5`, fill: 'none', stroke: pal.blueDark, 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, board));
  const iron = g({});
  el('path', { d: 'M -20 0 L 22 0 Q 28 0 22 -8 L 12 -17 L -20 -17 Q -22 -8 -20 0 Z', fill: pal.violet }, iron);
  el('rect', { x: -20, y: -3, width: 44, height: 3, fill: '#D6D9E3' }, iron);
  el('path', { d: 'M -10 -17 Q 0 -32 12 -17', fill: 'none', stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }, iron);
  const puffs = [0, 1].map(() => el('circle', { r: 4, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 1.5 }));
  const sp = [0, 1, 2].map(() => { const s = g({}); el('path', { d: 'M 0 -9 L 3 -3 L 9 0 L 3 3 L 0 9 L -3 3 L -9 0 L -3 -3 Z', fill: pal.yellow }, s); return s; });
  // アイロンの位置：右へ→左へ→右へ。台の端に置いてある状態から手に取る
  const ix = (t) => t < 1.3 ? 365 : t < 1.9 ? lerp(365, 228, easeInOut(seg(t, 1.3, 1.9))) : t < 2.5 ? lerp(228, 272, easeInOut(seg(t, 1.9, 2.5))) : t < 3.0 ? lerp(272, 232, easeInOut(seg(t, 2.5, 3.0))) : lerp(232, 324, easeInOut(seg(t, 3.0, 3.9)));
  const D = 50;
  return {
    update(t) {
      const x = t < 0.2 ? 96 : t < 1.1 ? lerp(96, 365 - D, easeInOut(seg(t, 0.2, 1.1))) : ix(t) - D;
      const grab = easeInOut(seg(t, 1.0, 1.3)), done = easeOut(seg(t, 4.0, 4.4));
      const v = (ix(t + 0.03) - ix(t - 0.03)) / 0.06;
      b.pose({ x, armL: 8, armR: 40, lean: 8 * grab - 8 * done, mood: t > 3.95 ? 'grin' : 'flat', look: 0.6, squash: 1 - 0.015 * Math.abs(Math.sin(t * 5)) * clamp(Math.abs(v) / 30) });
      // 手を台の上のアイロンの取っ手へ
      const lift = 12 * done;
      const ironPos = { x: ix(t), y: TY - lift };
      tf(iron, ironPos.x, ironPos.y);
      const a = reach(b, S, 'R', ironPos.x, ironPos.y - 21);
      b.pose({ armR: t < 1.0 ? lerp(8, a, easeInOut(seg(t, 0.6, 1.0))) : a });
      // しわ：アイロンが通った所から消える
      let far = 0;
      for (let s = 1.9; s <= t; s += 0.05) far = Math.max(far, ix(s));
      wr.forEach((w, i) => tag(w, !(far - 12 > WX[i])));
      const st = t > 1.9 && t < 3.9 ? 1 : 0;
      puffs.forEach((p, i) => { const q = ((t * 1.6 + i * 0.5) % 1); tf(p, ironPos.x - 10 + i * 14 + 3 * Math.sin(t * 5 + i), TY - 24 - 22 * q); p.setAttribute('opacity', st * (1 - q) * 0.9); });
      const q = seg(t, 3.95, 4.6);
      [[236, 190], [286, 182], [330, 192]].forEach(([sx, sy], i) => { const r = seg(q, i * 0.12, i * 0.12 + 0.6); tf(sp[i], sx, sy - 8 * r, r * 80, 0.2 + hump(r)); tag(sp[i], r > 0 && r < 1); });
    }
  };
}
