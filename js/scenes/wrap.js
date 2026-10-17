// wrap：贈り物の箱を青い包み紙で包み、リボンをかける（例文 I wrapped the gift in blue paper.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, clamp } from '../ease.js';
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
export const meta = { duration: 4.0, beats: [[0, '紙の上に箱'], [1.6, '紙を折る'], [3.3, '包み終わる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 40, y: 40, width: 80, height: 70, rx: 6, fill: '#DDEFFA' });
  el('line', { x1: 80, y1: 40, x2: 80, y2: 110, stroke: '#fff', 'stroke-width': 4 });
  const TY = 206;
  const b = k.buddy({ x: 200, y: 214 });
  // カウンター（手前）
  el('rect', { x: 70, y: TY, width: 260, height: 36, fill: pal.wood });
  el('rect', { x: 70, y: TY, width: 260, height: 5, fill: pal.woodDark });
  // 包み紙（下に敷かれた紙＋左右のフラップ）と箱
  const sheetCol = pal.blue, edge = pal.blueDark;
  el('rect', { x: 170, y: TY - 3, width: 60, height: 3, fill: edge });
  const box = el('rect', { x: 174, y: TY - 34, width: 52, height: 34, rx: 3, fill: pal.coral });
  el('rect', { x: 196, y: TY - 34, width: 8, height: 34, fill: pal.coralDark, opacity: 0.6 });
  const wrapped = el('rect', { x: 174, y: TY - 34, width: 52, height: 34, rx: 3, fill: sheetCol, opacity: 0 });
  const fl = [-1, 1].map(() => el('path', { fill: 'none', stroke: sheetCol, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  const fl2 = [-1, 1].map(() => el('path', { fill: 'none', stroke: edge, 'stroke-width': 1.5, 'stroke-linecap': 'round', opacity: 0.0 }));
  const bow = g({});
  [-1, 1].forEach((s) => el('ellipse', { cx: s * 9, cy: -4, rx: 9, ry: 6, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2, transform: `rotate(${s * -20} ${s * 9} -4)` }, bow));
  el('circle', { cx: 0, cy: 0, r: 4, fill: pal.yellowDark }, bow);
  const rib = el('rect', { x: 197, y: TY - 34, width: 6, height: 34, fill: pal.yellow, opacity: 0 });
  
  return {
    update(t) {
      const t1 = 90 * easeInOut(seg(t, 0.9, 1.9)), t2 = 90 * easeInOut(seg(t, 1.9, 2.7));
      const tips = [];
      [-1, 1].forEach((s, i) => {
        const C = [200 + s * 26, TY];
        // s=-1 が左：左は左向きに伸びる（dir の符号を合わせる）
        const dd1 = [s * Math.cos(rad(t1)), -Math.sin(rad(t1))];
        const e1 = [C[0] + 34 * dd1[0], C[1] + 34 * dd1[1]];
        const dd2 = [s * Math.cos(rad(t1 + t2)), -Math.sin(rad(t1 + t2))];
        const e2 = [e1[0] + 26 * dd2[0], e1[1] + 26 * dd2[1]];
        fl[i].setAttribute('d', `M ${C[0]} ${C[1] - 2} L ${e1[0]} ${e1[1]} L ${e2[0]} ${e2[1]}`);
        tips.push(t2 > 0.5 ? e2 : e1);
      });
      wrapped.setAttribute('opacity', 0.95 * seg(t, 2.6, 2.8));
      const bp = backOut(seg(t, 3.0, 3.4));
      tf(bow, 200, TY - 37, 0, bp);
      bow.setAttribute('opacity', bp > 0 ? 1 : 0);
      rib.setAttribute('opacity', seg(t, 3.0, 3.2));
      const end = seg(t, 3.5, 3.9);
      const aL = reach(b, 1, 'L', tips[0][0], tips[0][1]);
      const aR = reach(b, 1, 'R', tips[1][0], tips[1][1]);
      b.pose({ armL: lerp(aL, 150, easeOut(end)), armR: lerp(aR, 150, easeOut(end)), look: 0, lean: 5 * seg(t, 0.8, 1.5) * (1 - seg(t, 2.8, 3.2)), mood: t > 3.0 ? 'grin' : 'smile', squash: 1 + 0.01 * Math.sin(t * 3) });
      // 手が届く位置から再計算
      const aL2 = reach(b, 1, 'L', tips[0][0], tips[0][1]);
      const aR2 = reach(b, 1, 'R', tips[1][0], tips[1][1]);
      b.pose({ armL: lerp(aL2, 150, easeOut(end)), armR: lerp(aR2, 150, easeOut(end)) });
    }
  };
}
