// weigh：カップの小麦粉をはかりの皿に注ぎ、針が上がって重さが分かる（例文 She weighed the flour on a scale.）
import { seg, lerp, easeInOut, easeOut, wobble, clamp } from '../ease.js';
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
// 共通ヘルパ（他のシーンから import して使う）：手先座標・手を目標へ伸ばす腕角
export function hp(b, s, side = 'R', len = 28) {
  const st = b.state, a = rad(side === 'R' ? -st.armR : st.armL);
  let x = (side === 'R' ? 27 : -27) - len * Math.sin(a), y = -46 + len * Math.cos(a);
  x *= 2 - st.squash; y *= st.squash;
  const l = rad(st.lean), c = Math.cos(l), sn = Math.sin(l);
  return { x: st.x + (x * c - y * sn) * st.facing * s, y: st.y + (x * sn + y * c - 10 - st.lift) * s };
}
export function reach(b, s, side, tx, ty) {
  const st = b.state, o = hp(b, s, side, 0);
  const phi = deg(Math.atan2(-(tx - o.x) * st.facing, ty - o.y));
  return side === 'R' ? st.lean - phi : phi - st.lean;
}
export const faceAt = (b, dx, dy = 0) => b.body.children[3].setAttribute('transform', `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
export function gait(xf, t, x0, amp = 18, kf = 0.107) {
  const x = xf(t), v = Math.abs(xf(t + 0.02) - xf(t - 0.02)) / 0.04;
  const ph = Math.abs(x - x0) * kf, m = clamp(v / 25);
  const w = lerp(Math.round(ph / Math.PI) * Math.PI, ph, m);
  return { x, walk: w, armL: 8 + Math.sin(w) * amp * m, armR: 8 - Math.sin(w) * amp * m, lean: 3 * m, m };
}
// 台所の背景（窓と棚）
export function kitchenBg(k, FY = 236) {
  const { el, pal } = k;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 40, y: 50, width: 90, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 85, y1: 50, x2: 85, y2: 114, stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 250, y: 80, width: 110, height: 6, rx: 3, fill: pal.woodDark });
  [[262, pal.yellow], [292, pal.coral], [322, pal.violet]].forEach(([x, c]) => el('rect', { x, y: 58, width: 20, height: 22, rx: 4, fill: c, opacity: 0.8 }));
  return FY;
}
export const meta = { duration: 4.6, beats: [[0, '粉を持つ'], [1.9, '皿に注ぐ'], [4.0, '重さが出た']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = kitchenBg(k);
  const b = k.buddy({ x: 228, y: FY, scale: 1.1 });
  // カウンター
  el('rect', { x: 120, y: 210, width: 290, height: FY - 204, fill: pal.wood });
  el('rect', { x: 114, y: 204, width: 296, height: 9, rx: 3, fill: pal.woodDark });
  k.shadow(260, FY + 2, 140, 5);
  // はかり本体
  el('ellipse', { cx: 300, cy: 205, rx: 38, ry: 4, fill: pal.shadow });
  el('rect', { x: 268, y: 168, width: 64, height: 36, rx: 10, fill: pal.blue });
  el('rect', { x: 268, y: 168, width: 64, height: 8, rx: 4, fill: '#fff', opacity: 0.3 });
  el('circle', { cx: 300, cy: 189, r: 13, fill: '#fff', stroke: pal.blueDark, 'stroke-width': 2.5 });
  for (let i = 0; i < 9; i++) { const a = rad(-120 + i * 30); el('line', { x1: 300 + Math.sin(a) * 9, y1: 189 - Math.cos(a) * 9, x2: 300 + Math.sin(a) * 11.5, y2: 189 - Math.cos(a) * 11.5, stroke: pal.sub, 'stroke-width': 1.3 }); }
  const needle = g({}); el('line', { x1: 0, y1: 2, x2: 0, y2: -10, stroke: pal.red, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, needle);
  el('circle', { r: 2.3, fill: pal.ink }, needle);
  // 皿（フチ）とこんもり盛り
  const pan = g({});
  el('path', { d: 'M -26 0 Q 0 16 26 0 Z', fill: '#C7D0DC' }, pan);
  const pile = el('ellipse', { cx: 0, cy: -1, rx: 14, ry: 0.1, fill: '#fff', stroke: '#E1E6EE', 'stroke-width': 1 }, pan);
  el('path', { d: 'M -26 0 Q 0 16 26 0', fill: 'none', stroke: '#A9B4C4', 'stroke-width': 2.4 }, pan);
  const S = 1.1;
  // カップ（手に持つ）
  const cup = g({});
  el('rect', { x: -11, y: -17, width: 22, height: 24, rx: 4, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, cup);
  const fl = el('rect', { x: -9, y: -17, width: 18, height: 8, rx: 2, fill: '#fff' }, cup);
  const hand2 = el('circle', { r: 6.5, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.5 }, cup);
  const stream0 = el('path', { d: '', stroke: '#C9D1DD', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' });
  const stream = el('path', { d: '', stroke: '#fff', 'stroke-width': 3.6, fill: 'none', 'stroke-linecap': 'round' });
  const dust = [0, 1, 2, 3, 4, 5].map(() => el('circle', { r: 1.8, fill: '#fff' }));
  const num = k.text(300, 126, '250 g', { 'font-size': 17, fill: pal.ink });
  const tag = el('rect', { x: 268, y: 112, width: 64, height: 26, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  num.parentNode.appendChild(num);
  return {
    update(t) {
      const up = easeInOut(seg(t, 1.0, 1.9));       // カップを皿の上へ
      const tilt = easeInOut(seg(t, 1.8, 2.5)) * (1 - easeInOut(seg(t, 3.5, 4.0)));
      const back = easeInOut(seg(t, 3.5, 4.1));
      const hx = lerp(lerp(262, 296, up), 262, back), hy = lerp(lerp(190, 150, up), 190, back);
      const th = tilt * 88 + (t > 1.9 && t < 3.5 ? 3 * Math.sin(t * 9) * tilt : 0);
      b.pose({ armR: 0, lean: 3 + 4 * up });
      b.pose({ armR: reach(b, S, 'R', hx, hy), armL: 10, mood: t > 4 ? 'smile' : 'flat', look: 0.6 + 0.2 * up, squash: 1 + 0.01 * Math.sin(t * 3) });
      const h = hp(b, S, 'R');
      tf(cup, h.x, h.y, th);
      // 粉の量：注ぐほど減る
      const pour = seg(t, 2.1, 3.5);
      const fillH = 8 * (1 - pour);
      fl.setAttribute('height', Math.max(0.01, fillH)); fl.setAttribute('opacity', fillH < 0.5 ? 0 : 1);
      const c = Math.cos(rad(th)), s = Math.sin(rad(th));
      const lip = { x: h.x + 11 * c + 17 * s, y: h.y + 11 * s - 17 * c };
      const flowing = th > 45 && pour < 1 ? 1 : 0;
      const pileTop = 168 - 10 * easeOut(pour);
      if (flowing) {
        stream.setAttribute('d', `M ${lip.x.toFixed(1)} ${lip.y.toFixed(1)} Q ${(lip.x + 2).toFixed(1)} ${((lip.y + pileTop) / 2).toFixed(1)} 298 ${pileTop.toFixed(1)}`);
        stream.setAttribute('opacity', 1); stream0.setAttribute('d', stream.getAttribute('d')); stream0.setAttribute('opacity', 1);
      } else { stream.setAttribute('opacity', 0); stream0.setAttribute('opacity', 0); }
      dust.forEach((d, i) => { const p = ((t * 2.2 + i / 6) % 1); d.setAttribute('cx', 298 + (i - 2.5) * 5 * p); d.setAttribute('cy', pileTop - 6 * Math.sin(p * Math.PI) * (1 + i % 2)); d.setAttribute('opacity', flowing ? 0.9 * (1 - p) : 0); });
      // 針：注ぐほど回り、最後に少し揺れて止まる
      const ang = -120 + 170 * easeOut(pour) + 7 * wobble(seg(t, 3.4, 4.3), 3, 4) * (pour >= 1 ? 1 : 0);
      tf(needle, 300, 189, ang);
      tf(pan, 300, 168);
      pile.setAttribute('ry', 11 * easeOut(pour) + 0.1); pile.setAttribute('cy', -1 - 5 * easeOut(pour) + 5);
      tf(pan, 300, 168 + 1.5 * (1 - Math.abs(1 - 2 * pour)) * 0);
      const sh = seg(t, 4.0, 4.4);
      tag.setAttribute('opacity', sh); num.setAttribute('opacity', sh);
      tf(num, 0, -6 * (1 - easeOut(sh)));
    }
  };
}
// 通りの背景（遠景の建物・木・歩道）
export function streetBg(k, FY = 236, mood = 'outdoor') {
  const { el, pal } = k;
  k.backdrop({ floorY: FY, mood });
  [[10, 70, 70, '#E4EEF7'], [96, 100, 60, '#F3E6DC'], [170, 84, 76, '#E6F1E8'], [256, 108, 64, '#F3E6DC'], [336, 78, 70, '#E4EEF7']].forEach(([x, y, w, c]) => {
    el('rect', { x, y: FY - y - 10, width: w, height: y + 10, rx: 4, fill: c });
    for (let i = 0; i < 2; i++) el('rect', { x: x + 10 + i * (w / 2 - 4), y: FY - y + 6, width: w / 2 - 16, height: 16, rx: 3, fill: '#fff', opacity: 0.8 });
  });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: '#E3E8EE' });
  return FY;
}
export function heart(k, parent, c) {
  return k.el('path', { d: 'M 0 6 C -12 -4 -8 -12 0 -6 C 8 -12 12 -4 0 6 Z', fill: c || k.pal.red }, parent);
}
export function bubble(k, w = 52, h = 32) {
  const b = k.g({});
  k.el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 12, fill: '#fff', stroke: k.pal.line, 'stroke-width': 2 }, b);
  k.el('path', { d: `M -4 ${h / 2 - 1} L 0 ${h / 2 + 9} L 6 ${h / 2 - 1} Z`, fill: '#fff' }, b);
  return b;
}
