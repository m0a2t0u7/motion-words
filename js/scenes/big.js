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
// big：大きな家の玄関で、小さなまめが家を見上げて手を振る（例文 He lives in a big house.）
export const meta = { duration: 4.2, beats: [[0, '小さな家の前'], [1.6, '大きな家へ'], [3.0, '家に着く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244 });
  const S = 0.8;
  el('rect', { x: 0, y: FY + 6, width: 400, height: 8, fill: '#E3E8EE' });
  // 隣の小さな家
  el('rect', { x: 8, y: FY - 48, width: 62, height: 48, rx: 3, fill: '#FFF1D2' });
  el('path', { d: `M 2 ${FY - 46} L 39 ${FY - 78} L 76 ${FY - 46} Z`, fill: pal.yellowDark });
  el('rect', { x: 18, y: FY - 30, width: 14, height: 30, rx: 2, fill: pal.woodDark });
  el('rect', { x: 42, y: FY - 36, width: 18, height: 16, rx: 2, fill: '#CFE9F7' });
  // 大きな家（画面の大半）
  const HX = 130, HW = 262;
  el('rect', { x: HX, y: 74, width: HW, height: FY - 74, rx: 6, fill: '#FBE3D5' });
  el('path', { d: `M ${HX - 14} 82 L ${HX + HW / 2} 14 L ${HX + HW + 14} 82 Z`, fill: pal.coral, stroke: pal.coral, 'stroke-width': 8, 'stroke-linejoin': 'round' });
  el('rect', { x: HX + HW - 52, y: 24, width: 22, height: 40, fill: pal.coralDark });
  el('rect', { x: HX, y: 118, width: HW, height: 5, fill: '#F2C9B3' });
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
    if (r === 1 && c === 1) continue;
    const x = HX + 18 + c * 60, y = 84 + r * 62 + (r ? 12 : 0);
    el('rect', { x, y, width: 38, height: 40, rx: 4, fill: '#CFE9F7', stroke: '#fff', 'stroke-width': 3 });
    el('line', { x1: x + 19, y1: y, x2: x + 19, y2: y + 40, stroke: '#fff', 'stroke-width': 2.5 });
  }
  // 玄関ドア（家の大きさに合わせて高い）
  const DX = HX + 72, DW = 52;
  el('rect', { x: DX - 6, y: FY - 100, width: DW + 12, height: 100, rx: 4, fill: '#fff' });
  const lit = el('rect', { x: DX, y: FY - 94, width: DW, height: 94, rx: 3, fill: '#FFD98A', opacity: 0 });
  const panel = g({});
  el('rect', { x: 0, y: 0, width: DW, height: 94, rx: 3, fill: pal.blue }, panel);
  el('rect', { x: 8, y: 8, width: DW - 16, height: 30, rx: 3, fill: '#fff', opacity: 0.3 }, panel);
  el('circle', { cx: DW - 8, cy: 52, r: 3.5, fill: pal.yellow }, panel);
  el('rect', { x: DX - 12, y: FY - 4, width: DW + 24, height: 8, rx: 3, fill: pal.woodDark });
  const sm = k.buddy({ x: 108, y: FY, scale: 0.8 });
  const sc = 0;
  return {
    update(t) {
      const xf = (u) => lerp(26, DX + DW / 2 - 8, easeInOut(seg(u, 0.3, 3.0)));
      const p = gait(xf, t, 26);
      const arrive = seg(t, 2.9, 3.2), wv = t > 3.1 ? 120 + 28 * Math.sin((t - 3.1) * 9) : p.armR;
      // 玄関ドアは中の灯りで「暮らしている」ことを示す
      tf(panel, DX, FY - 94, 0, lerp(1, 0.14, easeInOut(seg(t, 3.0, 3.6))), 1);
      lit.setAttribute('opacity', seg(t, 3.0, 3.4));
      sm.pose({ x: p.x, walk: p.walk, armL: t > 3.1 ? 8 : p.armL, armR: wv, lean: p.lean - 6 * hump(seg(t, 2.2, 3.1)) * 1, mood: t > 3.0 ? 'grin' : 'smile', look: 0.4 + 0.4 * hump(seg(t, 1.9, 2.9)) });
    }
  };
}
