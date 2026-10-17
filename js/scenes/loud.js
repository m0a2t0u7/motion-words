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
// loud：スピーカーから大きな音が出て、まめは耳をふさぐ（例文 The music is too loud.）
export const meta = { duration: 4.4, beats: [[0, '音楽が流れる'], [1.5, '音量が上がる'], [2.9, '耳をふさぐ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 0.95;
  const frame = g({}); tf(frame, 120, 70);
  el('rect', { x: -28, y: -22, width: 56, height: 44, rx: 3, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 5 }, frame);
  el('path', { d: 'M -20 14 L -6 -4 L 4 6 L 12 -2 L 22 14 Z', fill: '#BDE5C8' }, frame);
  el('circle', { cx: 12, cy: -10, r: 5, fill: pal.yellow }, frame);
  // スピーカー（右）
  const sp = g({}); tf(sp, 318, FY);
  k.shadow(0, 2, 50, 6, sp);
  el('rect', { x: -44, y: -150, width: 88, height: 150, rx: 8, fill: '#3B4256' }, sp);
  el('rect', { x: -38, y: -144, width: 76, height: 138, rx: 5, fill: '#4A526B' }, sp);
  const tw = el('circle', { cx: 0, cy: -118, r: 11, fill: '#2E3447', stroke: '#6A7390', 'stroke-width': 2 }, sp);
  const cone = g({}); tf(cone, 318, FY - 62);
  el('circle', { r: 32, fill: '#2E3447', stroke: '#6A7390', 'stroke-width': 4 }, cone);
  const cc = el('circle', { r: 20, fill: '#1F2433' }, cone);
  el('circle', { r: 8, fill: '#566082' }, cone);
  // 音量ランプ
  const leds = [0, 1, 2, 3, 4].map((i) => el('rect', { x: 292 + i * 12, y: FY - 24, width: 8, height: 7, rx: 2, fill: '#6A7390' }));
  const rings = [0, 1, 2, 3].map(() => el('path', { fill: 'none', 'stroke-linecap': 'round' }));
  const notes = [0, 1, 2].map(() => { const n = g({}); el('ellipse', { cx: 0, cy: 0, rx: 5, ry: 3.6, fill: pal.violet, transform: 'rotate(-20)' }, n); el('line', { x1: 4, y1: -1, x2: 4, y2: -16, stroke: pal.violet, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, n); return n; });
  const b = k.buddy({ x: 150, y: FY, scale: S });
  return {
    update(t) {
      const vol = t < 1.5 ? 0.25 : lerp(0.25, 1, easeInOut(seg(t, 1.5, 2.7)));
      const beat = Math.abs(Math.sin(t * (6 + vol * 4))), thump = 1 + 0.06 * vol * beat;
      tf(cone, 318, FY - 62, 0, thump);
      k.set(cc, { r: 20 - 4 * vol * beat });
      leds.forEach((l, i) => k.set(l, { fill: vol * 5 > i + 0.5 ? (i >= 3 ? pal.red : pal.green) : '#6A7390' }));
      // 音の輪（強くなるほど太く大きい）
      rings.forEach((r, i) => {
        const q = ((t * (1.2 + vol) + i * 0.25) % 1);
        const rad2 = 30 + q * (70 + 40 * vol);
        k.set(r, { d: `M ${318 - rad2 * 0.9} ${FY - 62 - rad2 * 0.55} Q ${318 - rad2 * 1.15} ${FY - 62} ${318 - rad2 * 0.9} ${FY - 62 + rad2 * 0.55}`, stroke: vol > 0.6 ? pal.red : pal.violet, 'stroke-width': 2 + 4 * vol, opacity: (1 - q) * 0.9 });
      });
      notes.forEach((n, i) => { const q = ((t * 0.7 + i * 0.33) % 1); tf(n, 270 - 60 * q, FY - 120 - 10 * Math.sin(q * 9 + i) - 20 * q, 0, 0.9); n.setAttribute('opacity', Math.sin(q * Math.PI)); });
      // まめ：楽しむ→顔をしかめる→耳をふさぐ
      const cover = easeOut(seg(t, 2.5, 3.0));
      const flinch = hump(seg(t, 2.2, 2.7));
      b.pose({ squash: 1 - 0.05 * cover + 0.03 * Math.sin(t * 20) * cover, lean: -5 * cover - 4 * flinch, look: -0.3 * (1 - cover),
        armR: lerp(8, 168, cover), armL: lerp(8, 168, cover), mood: t < 1.5 ? 'smile' : cover > 0.4 ? 'open' : 'flat', blink: cover > 0.2 ? cover : 0,
        x: 150 + (cover > 0.5 ? 1.2 * Math.sin(t * 40) : 0) });
      // 壁の額縁が低音で揺れる
      tf(frame, 120, 70, 3 * vol * Math.sin(t * 30) * beat);
    }
  };
}
