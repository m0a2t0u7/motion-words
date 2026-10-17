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
// stare：緑のまめが相手をじっと見つめ続け、相手は居心地が悪くなる→禁止マーク（例文 Don't stare at people.）
export const meta = { duration: 4.2, beats: [[0, 'じっと見る'], [1.7, '相手が困る'], [3.2, 'ダメ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  const S = 0.95;
  // 街並み
  [[10, 70, 96, '#FBE9DC'], [100, 90, 120, '#E4F1F8'], [300, 60, 100, '#FFF1D2']].forEach(([x, w, h, c], i) => {
    el('rect', { x, y: FY - h - 20, width: w, height: h + 20, rx: 4, fill: c });
    for (let j = 0; j < 2; j++) el('rect', { x: x + 10 + j * (w / 2 - 4), y: FY - h - 4, width: w / 2 - 16, height: 26, rx: 3, fill: '#CFE9F7' });
  });
  el('rect', { x: 0, y: FY - 4, width: 400, height: 10, fill: '#E3E8EE' });
  const a = k.buddy({ x: 100, y: FY, scale: S });
  const c = k.buddy({ x: 300, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const beams = g({});
  const l1 = el('line', { stroke: pal.red, 'stroke-width': 2.4, 'stroke-dasharray': '6 7', 'stroke-linecap': 'round' }, beams);
  const l2 = el('line', { stroke: pal.red, 'stroke-width': 2.4, 'stroke-dasharray': '6 7', 'stroke-linecap': 'round' }, beams);
  const sweat = el('path', { d: 'M0 -7 Q6 2 0 6 Q-6 2 0 -7 Z', fill: pal.water, stroke: pal.blueDark, 'stroke-width': 1.5 });
  // 禁止マーク（目＋斜線）
  const sign = g({}); tf(sign, 200, 82);
  el('circle', { r: 30, fill: 'rgba(255,255,255,0.9)', stroke: pal.red, 'stroke-width': 7 }, sign);
  el('path', { d: 'M -17 0 Q 0 -14 17 0 Q 0 14 -17 0 Z', fill: '#fff', stroke: pal.ink, 'stroke-width': 3 }, sign);
  el('circle', { r: 6, fill: pal.ink }, sign);
  el('line', { x1: -21, y1: -21, x2: 21, y2: 21, stroke: pal.red, 'stroke-width': 7, 'stroke-linecap': 'round' }, sign);
  return {
    update(t) {
      const lk = easeInOut(seg(t, 0, 0.5));
      a.pose({ lean: 2 + 6 * seg(t, 0.4, 2.8), look: 1, mood: 'flat', blink: 0, armR: 8, armL: 8 });
      faceAt(a, 6, -1);
      const u = seg(t, 1.2, 2.2), away = easeInOut(seg(t, 1.6, 2.4));
      c.pose({ lean: -7 * away, squash: 1 - 0.03 * away, look: lerp(0.6, -0.9, away), mood: t < 1.3 ? 'smile' : 'sad',
        armR: lerp(8, 40, away), armL: 8, blink: 0.9 * hump(seg(t, 2.6, 2.9)) });
      // 視線の線
      const ey = FY - 10 - 54 * S;
      const bx = a.state.x + 18, ex = c.state.x + 8 - 7 * away * 2;
      const pulse = lk * (t < 3.4 ? 1 : 0.0);
      beams.setAttribute('opacity', pulse * (0.75 + 0.25 * Math.sin(t * 8)));
      k.set(l1, { x1: bx, y1: ey - 3, x2: ex, y2: ey - 3, 'stroke-dashoffset': -t * 20 });
      k.set(l2, { x1: bx, y1: ey + 4, x2: ex, y2: ey + 4, 'stroke-dashoffset': -t * 20 });
      tf(sweat, 322, ey - 22 + 12 * easeIn(seg(t, 1.5, 2.6)));
      sweat.setAttribute('opacity', seg(t, 1.5, 1.7) * (1 - seg(t, 2.5, 2.8)));
      const sp = backOut(seg(t, 3.0, 3.5));
      tf(sign, 200, 78, 0, sp);
      sign.setAttribute('opacity', seg(t, 3.0, 3.1));
    }
  };
}
