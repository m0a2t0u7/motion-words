// sit：「どうぞ座って」と手で示され、客がいすの前で向きを変えて腰をおろす（例文 Please sit on this chair.）
import { seg, lerp, easeInOut, easeOut, wobble, clamp } from '../ease.js';
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
// 目標点へ腕を向ける角度
function reach(b, s, side, tx, ty) {
  const st = b.state, o = hp(b, s, side, 0);
  const phi = deg(Math.atan2(-(tx - o.x) * st.facing, ty - o.y));
  return side === 'R' ? st.lean - phi : phi - st.lean;
}
const mix = (a, b, p) => { const f = (h, i) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16); return '#' + [0, 1, 2].map((i) => Math.round(f(a, i) + (f(b, i) - f(a, i)) * p).toString(16).padStart(2, '0')).join(''); };
function gait(xf, t, x0, amp = 18, kf = 0.107) {
  const x = xf(t), v = Math.abs(xf(t + 0.02) - xf(t - 0.02)) / 0.04;
  const ph = Math.abs(x - x0) * kf, m = clamp(v / 25);
  const w = lerp(Math.round(ph / Math.PI) * Math.PI, ph, m);
  return { x, walk: w, armL: 8 + Math.sin(w) * amp * m, armR: 8 - Math.sin(w) * amp * m, lean: 3 * m, m };
}
export const meta = { duration: 4.2, beats: [[0, 'どうぞ'], [1.4, '向きを変える'], [3.0, '座った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 300, y: 50, width: 70, height: 62, rx: 6, fill: '#DDEFFA' });
  const CX = 236, SY = 222;
  // いす（左向き：背もたれは右）
  k.shadow(CX, FY + 1, 38, 5);
  el('rect', { x: CX + 20, y: 148, width: 10, height: 80, rx: 4, fill: pal.woodDark });
  el('rect', { x: CX - 24, y: FY - 14, width: 7, height: 14, fill: pal.woodDark });
  el('rect', { x: CX + 20, y: FY - 14, width: 7, height: 14, fill: pal.woodDark });
  const host = k.buddy({ x: 50, y: FY, color: pal.coral, dark: pal.coralDark });
  const legG = g({});
  const mk = () => el('path', { fill: 'none', stroke: pal.mintDark, 'stroke-width': 10, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, legG);
  const legs = [mk(), mk()];
  const guest = k.buddy({ x: 125, y: FY });
  el('rect', { x: CX - 30, y: SY, width: 60, height: 8, rx: 3, fill: pal.wood });
  const gl = [0, 1].map((i) => guest.g.children[1].children[i]);
  const xf = (t) => t < 1.0 ? 125 : lerp(125, CX, easeInOut(seg(t, 1.0, 1.9)));
  return {
    update(t) {
      const p = gait(xf, t, 125);
      const turn = easeInOut(seg(t, 1.95, 2.35));
      const facing = lerp(1, -1, turn);
      const s = easeInOut(seg(t, 2.45, 3.0));
      const depth = 7 * (1 - seg(t, 1.9, 2.4));
      const gy = lerp(FY + depth, SY + 10, s);
      guest.pose({ x: lerp(p.x, CX + 4, s), y: gy, walk: p.walk * (1 - s), facing, armL: lerp(p.armL, 20, s), armR: lerp(p.armR, 55, s), lean: p.lean * (1 - s), squash: 1 - 0.06 * s + 0.03 * wobble(seg(t, 3.0, 3.6), 2, 5), look: 0.5 * facing, mood: s > 0.5 ? 'grin' : 'smile' });
      gl.forEach((l) => l.setAttribute('opacity', s > 0.001 ? 0 : 1));
      legG.setAttribute('opacity', s > 0.001 ? 1 : 0);
      const f = facing < 0 ? -1 : 1, gx = guest.state.x;
      [-1, 1].forEach((d, i) => {
        const hx = gx + d * 12 * 0.9, hy = gy - 14 + 2;
        const kx = hx + f * 22 * s, ky = hy + 4 * s;
        legs[i].setAttribute('d', `M ${hx} ${hy} L ${kx} ${ky} L ${kx} ${FY + 1 - (1 - s) * 0 - 3 * s - 0}`);
      });
      // ホスト：手で席を示して、座るのを見守る
      const pt = easeOut(seg(t, 0.2, 0.7)) * (1 - seg(t, 2.9, 3.5));
      host.pose({ armR: 8 + 82 * pt + 6 * Math.sin(t * 5) * pt, look: 0.6, mood: 'grin', lean: 4 * pt, squash: 1 + 0.015 * Math.sin(t * 4) });
    }
  };
}
