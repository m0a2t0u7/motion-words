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
// swallow：錠剤を口に入れ、水で飲み込む（例文 Swallow the medicine with water.）
export const meta = { duration: 4.6, beats: [[0, '薬を持つ'], [1.5, '口に入れる'], [3.1, '水で飲む']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 0.95;
  win(k, 40, 46, 90, 70);
  // テーブル
  el('rect', { x: 218, y: 200, width: 182, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 230, y: 208, width: 8, height: 28, fill: pal.wood });
  el('rect', { x: 380, y: 208, width: 8, height: 28, fill: pal.wood });
  k.shadow(310, 237, 90, 4);
  // 薬びん
  const bt = g({}); tf(bt, 356, 200);
  el('rect', { x: -12, y: -36, width: 24, height: 36, rx: 5, fill: pal.yellow }, bt);
  el('rect', { x: -14, y: -42, width: 28, height: 8, rx: 3, fill: pal.coral }, bt);
  el('rect', { x: -9, y: -28, width: 18, height: 16, rx: 2, fill: '#fff' }, bt);
  el('path', { d: 'M0 -26 v12 M-6 -20 h12', stroke: pal.red, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, bt);
  const b = k.buddy({ x: 178, y: FY, scale: S });
  // 受け皿の位置を実際の手の位置から決める
  b.pose({ armR: 85, lean: 6, squash: 1 });
  const H0 = hp(b, S, 'R', 26);
  const gx = H0.x + 9, gy = H0.y;
  const gsh = k.shadow(gx, 201, 12, 3);
  const lump = el('ellipse', { rx: 6, ry: 5, fill: '#fff', opacity: 0 });
  const pill = g({});
  el('rect', { x: -8, y: -4, width: 16, height: 8, rx: 4, fill: '#fff', stroke: pal.red, 'stroke-width': 1.5 }, pill);
  el('path', { d: 'M0 -4 h4 a4 4 0 0 1 4 4 a4 4 0 0 1 -4 4 h-4 Z', fill: pal.red }, pill);
  const glass = g({});
  const water = el('path', { d: '', fill: pal.water, opacity: 0.85 }, glass);
  el('path', { d: 'M -10 -16 L 10 -16 L 8 16 L -8 16 Z', fill: 'rgba(255,255,255,0.28)', stroke: '#9FB4C7', 'stroke-width': 2, 'stroke-linejoin': 'round' }, glass);
  function setWater(level, tilt) {
    const yt = 14 - 28 * level, sl = Math.tan(rad(tilt));
    const yy = (x) => clamp(yt + x * sl, -15, 14);
    water.setAttribute('d', `M -8 14 L 8 14 L 9.6 ${yy(9.6)} L -9.6 ${yy(-9.6)} Z`);
  }
  return {
    update(t) {
      const e = easeInOut;
      let arm, lean = 0, tilt = 0, mood = 'flat', held = false, onCounter = t < 2.45;
      if (t < 1.0) arm = -55;
      else if (t < 1.6) arm = lerp(-55, -98, e(seg(t, 1.0, 1.6)));
      else if (t < 1.75) arm = -98;
      else if (t < 2.45) arm = lerp(-98, 85, e(seg(t, 1.75, 2.45)));
      else if (t < 3.1) arm = lerp(85, -98, e(seg(t, 2.45, 3.1)));
      else if (t < 4.0) arm = -98;
      else arm = lerp(-98, -40, e(seg(t, 4.0, 4.5)));
      const drink = e(seg(t, 3.05, 3.5)) * (1 - e(seg(t, 3.9, 4.3)));
      lean = lerp(0, -14, drink);
      if (t > 1.8 && t < 2.45) lean = 6 * e(seg(t, 1.8, 2.2));
      if (t > 2.45 && t < 3.05) lean = lerp(6, 0, e(seg(t, 2.45, 3.0)));
      tilt = -52 * drink;
      mood = t > 1.35 && t < 1.8 ? 'open' : t > 4.1 ? 'grin' : 'flat';
      b.pose({ armR: arm, armL: 8, lean, mood, squash: 1 - 0.02 * hump(seg(t, 3.3, 3.9)) });
      faceAt(b, 0, t < 1.0 ? 2 : 0);
      const h = hp(b, S, 'R', 26);
      // 錠剤：手→口→消える
      tf(pill, h.x, h.y - 2, -20);
      tag(pill, t < 1.72);
      // コップ
      const off = onCounter ? 9 : lerp(9, 0, e(seg(t, 2.5, 3.0)));
      const lvl = t < 3.2 ? 0.8 : lerp(0.8, 0.12, e(seg(t, 3.2, 3.85)));
      setWater(lvl, tilt);
      if (onCounter) tf(glass, gx, gy, 0); else tf(glass, h.x + off, h.y + 1 - 4 * drink, tilt);
      gsh.setAttribute('opacity', onCounter ? 1 : 0);
      // ごくん
      const gp = seg(t, 3.3, 3.85);
      tf(lump, 178 + 2, FY - 10 - lerp(38, 14, easeInOut(gp)) * S);
      lump.setAttribute('opacity', gp > 0 && gp < 1 ? 0.5 : 0);
    }
  };
}
