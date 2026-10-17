// stand：係の人に示され、客が行列の最後尾に歩いていって立って並ぶ（例文 Please stand in line.）
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
export const meta = { duration: 4.2, beats: [[0, '案内される'], [1.3, '列へ向かう'], [3.2, '並んで立つ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 232, mood: 'indoor' });
  // 窓口カウンター
  el('rect', { x: 336, y: 96, width: 64, height: 136, fill: '#E3E8EE' });
  el('rect', { x: 346, y: 112, width: 50, height: 46, rx: 4, fill: '#CFE9F7' });
  el('rect', { x: 336, y: 170, width: 64, height: 10, fill: pal.woodDark });
  // 床の並び線（テープ）と矢印
  el('rect', { x: 150, y: FY + 12, width: 186, height: 4, rx: 2, fill: pal.yellow });
  [190, 250, 310].forEach((x) => el('path', { d: `M ${x} ${FY + 22} l 12 -6 v 12 z`, fill: pal.yellowDark }));
  const colors = [[pal.blue, pal.blueDark], [pal.violet, '#8467DB'], [pal.yellow, pal.yellowDark]];
  const line = [312, 256, 200].map((x, i) => {
    const y = FY - 4 + i * 0; const s = 0.85;
    return k.buddy({ x, y, scale: s, color: colors[i][0], dark: colors[i][1] });
  });
  const staff = k.buddy({ x: 56, y: FY - 6, scale: 0.85, color: pal.coral, dark: pal.coralDark });
  const guest = k.buddy({ x: -40, y: FY, scale: 0.85 });
  const XT = 144;
  const xf = (t) => lerp(-40, XT, easeInOut(seg(t, 0.5, 2.8)));
  return {
    update(t) {
      const p = gait(xf, t, -40, 18, 0.1);
      const arrive = seg(t, 2.7, 3.2);
      guest.pose({ x: p.x, y: FY + 3 * (1 - arrive), walk: p.walk, armL: p.armL, armR: p.armR, lean: p.lean, look: 0.6, mood: 'smile', squash: 1 + 0.015 * Math.sin(t * 4) * arrive });
      const pt = easeOut(seg(t, 0.15, 0.6)) * (1 - seg(t, 2.6, 3.2));
      staff.pose({ armR: 8 + 82 * pt + 5 * Math.sin(t * 6) * pt, look: 0.6, mood: 'grin', squash: 1 + 0.012 * Math.sin(t * 4) });
      line.forEach((b, i) => b.pose({ look: 0.7, mood: 'flat', squash: 1 + 0.012 * Math.sin(t * 2.5 + i), armL: 8, armR: 8 }));
      // 並んだ後、先頭が窓口に進む…のではなく、最後尾がそろって待つ
      guest.pose({});
    }
  };
}
