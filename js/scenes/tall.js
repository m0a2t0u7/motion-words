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
// tall：背の高い兄（コーラル）が高い棚の本を楽々取る。小さな自分は見上げる（例文 My brother is very tall.）
export const meta = { duration: 4.4, beats: [[0, '並んで立つ'], [1.4, '高い棚へ'], [3.0, '手が届く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'indoor' });
  const SB = 1.6, SM = 0.8;
  win(k, 40, 40, 80, 64);
  // 身長の目盛り（壁）
  el('rect', { x: 340, y: 40, width: 22, height: FY - 40, rx: 4, fill: pal.wood });
  for (let i = 0; i <= 9; i++) el('line', { x1: 340, y1: FY - 20 * i, x2: i % 5 === 0 ? 358 : 350, y2: FY - 20 * i, stroke: pal.woodDark, 'stroke-width': 2 });
  // 高い棚と本
  el('rect', { x: 196, y: 70, width: 110, height: 6, rx: 2, fill: pal.woodDark });
  [[204, 22, pal.blue], [222, 26, pal.green], [242, 20, pal.violet]].forEach(([x, h, c]) => el('rect', { x, y: 70 - h, width: 16, height: h, rx: 2, fill: c }));
  el('rect', { x: 260, y: 48, width: 20, height: 22, rx: 2, fill: pal.yellow });
  const book = g({});
  el('rect', { x: -9, y: -12, width: 18, height: 24, rx: 2, fill: pal.red }, book);
  el('rect', { x: -6, y: -8, width: 8, height: 2.5, fill: '#fff', opacity: 0.8 }, book);
  const bro = k.buddy({ x: 250, y: FY, scale: SB, facing: -1, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: 120, y: FY, scale: SM });
  const bookRest = { x: 270, y: 70 - 12 };
  const q = (t) => easeInOut(seg(t, 1.2, 2.2)), dn = (t) => easeInOut(seg(t, 2.8, 3.8));
  return {
    update(t) {
      const up = q(t) * (1 - dn(t));
      const grab = seg(t, 2.1, 2.4);
      // 兄：腕を真上に伸ばす
      bro.pose({ armR: lerp(8, 172, up) + (t > 2.8 ? 0 : 0), armL: 8, lean: -3 * up, squash: 1 + 0.03 * up, lift: 4 * up, look: 0.4, mood: t > 2.3 ? 'grin' : 'smile' });
      const h = hp(bro, SB, 'R', 26);
      let pos = bookRest;
      if (t > 2.1) pos = { x: h.x, y: h.y - 10 };
      if (t > 2.1 && t < 2.5) { const f = seg(t, 2.1, 2.5); pos = { x: lerp(bookRest.x, h.x, f), y: lerp(bookRest.y, h.y - 10, f) }; }
      if (t > 3.2) pos = { x: h.x, y: h.y + 6 };
      tf(book, pos.x, pos.y, t > 3.2 ? 12 : 0);
      // 自分：見上げて指さす
      me.pose({ armR: lerp(8, 150, easeOut(seg(t, 0.2, 0.8))) - 0 + 6 * Math.sin(t * 5) * (t > 0.8 ? 1 : 0), armL: 8, lean: -6 * easeOut(seg(t, 0.2, 0.8)), look: 0.2, mood: 'open', squash: 1 });
      faceAt(me, 3, -2.5);
    }
  };
}
