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
// thirsty：暑くて喉がからから→水差しとコップに気づき、「お水をください」と手を伸ばす（例文 I'm thirsty. Can I have some water?）
export const meta = { duration: 4.6, beats: [[0, '喉がかわく'], [1.8, '水に気づく'], [3.2, 'お水ください']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 0.95;
  // 暑い日差し
  el('rect', { x: 36, y: 36, width: 96, height: 76, rx: 6, fill: '#FFF3C9', stroke: '#fff', 'stroke-width': 5 });
  const sun = g({}); tf(sun, 84, 74);
  el('circle', { r: 17, fill: pal.yellow }, sun);
  for (let i = 0; i < 8; i++) { const a = rad(i * 45); el('line', { x1: Math.cos(a) * 22, y1: Math.sin(a) * 22, x2: Math.cos(a) * 29, y2: Math.sin(a) * 29, stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linecap': 'round' }, sun); }
  // テーブル：水差しとコップ
  el('rect', { x: 236, y: 190, width: 160, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 248, y: 198, width: 8, height: 38, fill: pal.wood }); el('rect', { x: 376, y: 198, width: 8, height: 38, fill: pal.wood });
  k.shadow(316, 238, 84, 4);
  const pj = g({}); tf(pj, 290, 190);
  el('path', { d: 'M -16 0 L 16 0 L 13 -50 L -13 -50 Z', fill: 'rgba(143,211,244,0.55)', stroke: '#8FB4CC', 'stroke-width': 2 }, pj);
  el('path', { d: 'M -14.5 -4 L 14.5 -4 L 13 -40 L -13 -40 Z', fill: pal.water, opacity: 0.9 }, pj);
  el('path', { d: 'M 14 -40 q 14 4 0 30', fill: 'none', stroke: '#8FB4CC', 'stroke-width': 3 }, pj);
  const gl = g({}); tf(gl, 345, 190);
  el('path', { d: 'M -10 0 L 10 0 L 12 -26 L -12 -26 Z', fill: 'rgba(143,211,244,0.4)', stroke: '#8FB4CC', 'stroke-width': 2 }, gl);
  el('path', { d: 'M -9 -2 L 9 -2 L 10.5 -18 L -10.5 -18 Z', fill: pal.water }, gl);
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const sw = [0, 1].map(() => el('path', { d: 'M0 -7 Q6 2 0 6 Q-6 2 0 -7 Z', fill: pal.water, stroke: pal.blueDark, 'stroke-width': 1.5 }));
  const bub = g({}); tf(bub, 215, 118);
  el('path', { d: 'M -26 -20 H 26 Q 34 -20 34 -12 V 12 Q 34 20 26 20 H -10 L -22 32 L -20 20 H -26 Q -34 20 -34 12 V -12 Q -34 -20 -26 -20 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, bub);
  el('path', { d: 'M -10 -10 L 10 -10 L 8 10 L -8 10 Z', fill: pal.water, stroke: '#8FB4CC', 'stroke-width': 2 }, bub);
  el('path', { d: 'M 14 -12 L 24 -12 M 14 -4 L 24 -4', stroke: pal.sub, 'stroke-width': 0 }, bub);
  return {
    update(t) {
      const droop = t < 1.8 ? 1 : 1 - easeInOut(seg(t, 1.8, 2.4)) * 0.5;
      const sway = Math.sin(t * 2.2) * 3 * (1 - seg(t, 1.8, 2.4));
      const ask = easeInOut(seg(t, 2.6, 3.3));
      const th = t < 0.4 ? 0 : easeInOut(seg(t, 0.4, 1.0));
      // 喉を押さえる→水に気づく→手を差し出す
      const armR = lerp(8, -75, th) * (1 - seg(t, 1.9, 2.4)) + ask * (84 - 0);
      b.pose({ lean: sway + 6 * th * (1 - ask) + 4 * ask, squash: 1 - 0.05 * droop * (1 - ask), armR: t < 2.4 ? armR : lerp(-75 * 0, 8, 0) + ask * 80, armL: 8 + 0,
        mood: t < 1.8 ? 'sad' : t < 2.6 ? 'open' : 'open', look: lerp(0.2, 1, seg(t, 1.8, 2.3)), blink: t < 1.8 ? 0.4 : 0 });
      faceAt(b, 6 * seg(t, 1.8, 2.3), t < 1.8 ? 2 : -1);
      sw.forEach((s, i) => { const q = ((t * 0.9 + i * 0.5) % 1); tf(s, 120 + i * 62, 140 + 40 * q); s.setAttribute('opacity', t < 2.4 ? Math.sin(q * Math.PI) : 0); });
      tf(sun, 84, 74, t * 20); 
      const bp = backOut(seg(t, 3.0, 3.5));
      tf(bub, 215, 120, 0, bp, bp);
      bub.setAttribute('opacity', seg(t, 3.0, 3.1));
      // 水差しが気づきを促すようにきらり
      tf(pj, 290, 190, 0, 1 + 0.03 * hump(seg(t, 1.6, 2.2)), 1);
    }
  };
}
