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
// heavy：重いかばんを持ち上げようとして、ほとんど上がらず、下ろしてしまう（例文 This bag is too heavy.）
export const meta = { duration: 4.4, beats: [[0, '持とうとする'], [1.5, '上がらない'], [3.2, '手放す']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 0.95;
  win(k, 240, 40, 90, 66);
  const BX = 245;
  const bs = g({}); k.shadow(0, 0, 34, 6, bs);
  const bag = g({});
  const bd = g({}, bag);
  el('path', { d: 'M -30 0 L 30 0 L 26 -44 Q 0 -50 -26 -44 Z', fill: pal.violet }, bd);
  el('rect', { x: -30, y: -6, width: 60, height: 6, rx: 3, fill: '#8C72DE' }, bd);
  el('rect', { x: -14, y: -34, width: 28, height: 16, rx: 3, fill: '#fff', opacity: 0.9 }, bd);
  k.text(0, -26, 'kg', { 'font-size': 12, fill: pal.ink }, bd);
  el('path', { d: 'M -14 -46 Q 0 -74 14 -46', fill: 'none', stroke: '#8C72DE', 'stroke-width': 5, 'stroke-linecap': 'round' }, bag);
  const dust = [0, 1].map(() => el('circle', { r: 4, fill: '#E3E8EE' }));
  const sweat = el('path', { d: 'M0 -7 Q6 2 0 6 Q-6 2 0 -7 Z', fill: pal.water, stroke: pal.blueDark, 'stroke-width': 1.5 });
  const b = k.buddy({ x: 168, y: FY, scale: S });
  return {
    update(t) {
      // 近づく→構える→引き上げる（ほんの少し）→落とす→腕をぶらぶら
      const x = lerp(110, 176, easeInOut(seg(t, 0.2, 1.0)));
      const p = gait((u) => lerp(110, 176, easeInOut(seg(u, 0.2, 1.0))), t, 110, 14, 0.1);
      const set = easeInOut(seg(t, 1.0, 1.4));
      const pull = easeInOut(seg(t, 1.6, 2.3)), drop = seg(t, 2.6, 2.8);
      const lift = pull * (1 - easeIn(drop)); // 0..1 少ししか上がらない
      const strain = (t > 1.6 && t < 2.65) ? 1 : 0;
      const jt = strain * Math.sin(t * 46) * 1.2;
      const rel = seg(t, 2.8, 3.3);
      const shake = t > 3.0 ? Math.sin((t - 3.0) * 16) * 18 * (1 - seg(t, 3.7, 4.2)) : 0;
      b.pose({
        x: p.x + jt * 0.5, walk: t < 1.0 ? p.walk : 0,
        lean: lerp(p.lean, 30, set) * (1 - rel) - 14 * lift,
        squash: 1 - 0.1 * set * (1 - rel) - 0.04 * lift,
        armR: t < 1.0 ? p.armR : lerp(p.armR, 60, set) * (1 - rel) + (t > 2.8 ? (20 + shake) * rel : 0),
        armL: t > 3.0 ? 8 + shake : 8,
        mood: t < 1.6 ? 'flat' : t < 2.8 ? 'open' : 'sad', look: 0.6
      });
      // 取っ手へ手を伸ばす
      const bagLift = 7 * lift;
      const hy = FY - 54 - bagLift;
      if (t > 0.9 && t < 2.9) {
        const a = reach(b, S, 'R', BX - 2, hy);
        b.pose({ armR: lerp(b.state.armR, a, seg(t, 0.9, 1.4)) });
      }
      const bounce = wobble(seg(t, 2.7, 3.4), 3, 6);
      tf(bag, BX, FY - bagLift + 2 * Math.abs(bounce) * 0, 0, 1 + 0.06 * bounce, 1 - 0.08 * bounce + 0.03 * lift);
      tf(bs, BX, FY + 1, 0, 1 - 0.1 * lift, 1);
      dust.forEach((d, i) => {
        const q = seg(t, 2.75, 3.4);
        tf(d, BX + (i ? 34 : -34) * (0.5 + q), FY - 4 - 8 * q);
        d.setAttribute('opacity', q > 0 && q < 1 ? 0.8 * (1 - q) : 0);
      });
      tf(sweat, 188 - 4, FY - 90 + 14 * ((t * 1.2) % 1));
      sweat.setAttribute('opacity', t > 1.6 && t < 3.6 ? 1 : 0);
    }
  };
}
