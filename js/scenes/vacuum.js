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
// vacuum：リビングで掃除機をかけ、ごみがなくなる（例文 He ran the vacuum in the living room.）
export const meta = { duration: 4.6, beats: [[0, 'ごみがある'], [1.6, '掃除機をかける'], [3.9, 'きれいに']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 200, mood: 'indoor' });
  const S = 0.95, Y = 258;
  win(k, 40, 36, 90, 70);
  // ソファ・観葉植物
  el('rect', { x: 230, y: 118, width: 150, height: 56, rx: 14, fill: pal.violet });
  el('rect', { x: 222, y: 150, width: 166, height: 44, rx: 12, fill: '#B9A4F6' });
  el('rect', { x: 226, y: 190, width: 8, height: 8, fill: pal.woodDark }); el('rect', { x: 376, y: 190, width: 8, height: 8, fill: pal.woodDark });
  el('rect', { x: 160, y: 168, width: 30, height: 30, rx: 5, fill: pal.wood });
  el('path', { d: 'M 175 168 Q 160 138 150 134 M 175 168 Q 178 130 182 120 M 175 168 Q 192 140 202 138', stroke: pal.green, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' });
  // ラグ
  el('ellipse', { cx: 210, cy: 252, rx: 190, ry: 30, fill: '#F4D3C8' });
  el('ellipse', { cx: 210, cy: 252, rx: 176, ry: 24, fill: 'none', stroke: '#fff', 'stroke-width': 2, opacity: 0.7 });
  const crumbs = [[150, 250], [196, 260], [240, 252], [286, 261], [330, 254]].map(([x, y], i) => {
    const c = g({}); tf(c, x, y);
    el('circle', { r: 3.2, fill: pal.coffee }, c);
    el('circle', { cx: 5, cy: 2, r: 2.2, fill: pal.sub }, c);
    return { c, x, y };
  });
  const b = k.buddy({ x: 60, y: Y, scale: S });
  const vac = g({});
  const vs = k.shadow(0, 0, 24, 4, vac);
  el('rect', { x: -22, y: -12, width: 44, height: 12, rx: 5, fill: pal.red }, vac);
  el('rect', { x: -22, y: -4, width: 44, height: 4, fill: pal.ink, opacity: 0.35 }, vac);
  const dust = el('circle', { r: 3, fill: '#fff', opacity: 0 });
  const handle = el('line', { stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' });
  const bag = g({});
  el('rect', { x: -10, y: -34, width: 20, height: 28, rx: 8, fill: pal.red }, bag);
  const sparkle = [0, 1, 2].map(() => { const s = g({}); el('path', { d: 'M 0 -9 L 3 -3 L 9 0 L 3 3 L 0 9 L -3 3 L -9 0 L -3 -3 Z', fill: pal.yellow }, s); return s; });
  // 体の位置：右へ押す→手前へ引く→もう一度右へ→止まる
  const bxf = (t) => t < 0.6 ? 60 : t < 2.0 ? lerp(60, 270, easeInOut(seg(t, 0.6, 2.0))) : t < 3.2 ? lerp(270, 130, easeInOut(seg(t, 2.0, 3.2))) : lerp(130, 200, easeInOut(seg(t, 3.2, 3.9)));
  const D = 64;
  return {
    update(t) {
      const x = bxf(t), v = (bxf(t + 0.03) - bxf(t - 0.03)) / 0.06;
      const m = clamp(Math.abs(v) / 30);
      const ph = x * 0.1;
      const w = lerp(Math.round(ph / Math.PI) * Math.PI, ph, m);
      const vx = x + D + 6 * Math.sin(t * 40) * 0 , vy = Y + 6;
      b.pose({ x, walk: w, armR: lerp(8, 62, easeOut(seg(t, 0.2, 0.6))) - 5 * v / 100, armL: 8, lean: lerp(0, 8, easeOut(seg(t, 0.2, 0.6))) * (v > 5 ? 1 : 0.5), mood: t > 4.0 ? 'grin' : 'smile', look: 0.5 });
      const h = hp(b, S, 'R', 26);
      // 掃除機の本体：手の先から床へ伸びる柄
      const tx = h.x + 6;
      k.set(handle, { x1: h.x, y1: h.y, x2: tx - 8, y2: vy - 10 });
      tf(vac, tx, vy);
      tf(bag, tx - 8, vy - 10 + 0, 0);
      bag.setAttribute('opacity', 0);
      // ごみ：吸い込み口が通ったら消える
      crumbs.forEach((cr) => {
        let gone = false;
        for (let s = 0; s <= t && !gone; s += 0.05) { const bx = bxf(s) + D; if (Math.abs(bx - cr.x) < 14) gone = true; }
        cr.c.setAttribute('transform', `translate(${cr.x} ${cr.y})`);
        tag(cr.c, !gone);
      });
      // ほこりの吸い込み演出
      const dd = (t * 5) % 1;
      tf(dust, tx + 18 - 16 * dd, vy - 6 - 4 * dd);
      dust.setAttribute('opacity', t > 0.8 && t < 3.9 ? 0.8 * (1 - dd) : 0);
      const sp = seg(t, 4.0, 4.6);
      [[110, 235], [215, 240], [290, 232]].forEach(([sx, sy2], i) => { const q = seg(sp, i * 0.12, i * 0.12 + 0.6); tf(sparkle[i], sx, sy2 - 8 * q, q * 80, 0.2 + hump(q)); tag(sparkle[i], q > 0 && q < 1); });
    }
  };
}
