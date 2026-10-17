import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
// 手先（len=0 で肩）のワールド座標。体の傾き・つぶれ・向きを反映
function hp(b, s, side = 'R', len = 27) {
  const st = b.state, a = rad(side === 'R' ? -st.armR : st.armL);
  let x = (side === 'R' ? 27 : -27) - len * Math.sin(a), y = -46 + len * Math.cos(a);
  x *= 2 - st.squash; y *= st.squash;
  const l = rad(st.lean), c = Math.cos(l), sn = Math.sin(l);
  return { x: st.x + (x * c - y * sn) * st.facing * s, y: st.y + (x * sn + y * c - 10 - st.lift) * s };
}
// 指定の点の方向へ腕を向ける角度
function reach(b, s, side, tx, ty) {
  const st = b.state, o = hp(b, s, side, 0);
  const phi = deg(Math.atan2(-(tx - o.x) * st.facing, ty - o.y));
  return side === 'R' ? st.lean - phi : phi - st.lean;
}
// 位置の関数から歩行の位相と腕振りを作る（止まると脚をそろえる）
function gait(xf, t, x0, amp = 18, kf = 0.107) {
  const x = xf(t), v = Math.abs(xf(t + 0.02) - xf(t - 0.02)) / 0.04;
  const ph = Math.abs(x - x0) * kf, m = clamp(v / 25);
  const w = lerp(Math.round(ph / Math.PI) * Math.PI, ph, m);
  return { x, walk: w, armL: 8 + Math.sin(w) * amp * m, armR: 8 - Math.sin(w) * amp * m, lean: 3 * m, m };
}
// 脚を個別に回す（pose の後に呼ぶ。i=0 奥脚 / 1 手前脚、正で後ろ）
function leg(b, i, ang) {
  const g = b.g.children[1].children[i];
  g.setAttribute('transform', `translate(${i ? 12 : -12} ${-14 - b.state.lift}) rotate(${ang.toFixed(2)})`);
}
function bubble(k, txt, w = 54) {
  const n = k.g();
  k.el('rect', { x: -w / 2, y: -14, width: w, height: 26, rx: 13, fill: '#fff', stroke: k.pal.line, 'stroke-width': 2 }, n);
  k.el('path', { d: 'M -5 11 L 0 21 L 7 11 Z', fill: '#fff', stroke: k.pal.line, 'stroke-width': 2, 'stroke-linejoin': 'round' }, n);
  k.el('rect', { x: -6, y: 9, width: 16, height: 4, fill: '#fff' }, n);
  k.text(0, 0, txt, { 'font-size': 14 }, n);
  return n;
}
const HEART = 'M 0 6 C -12 -2 -8 -12 0 -5 C 8 -12 12 -2 0 6 Z';
// dry：濡れた髪から水がしたたる。タオルでごしごしふくと、ふわっと乾く（例文 She dried her hair with a towel.）
export const meta = { duration: 4.2, beats: [[0, '濡れた髪'], [1.4, 'タオルでふく'], [3.4, '乾いた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.05;
  const FY = k.backdrop({ floorY: 244, mood: 'indoor' });
  // 洗面所：タイル壁と鏡、タオル掛け
  for (let r = 0; r < 6; r++) for (let c = 0; c < 10; c++) el('rect', { x: c * 40 + 1, y: r * 40 + 1, width: 38, height: 38, rx: 3, fill: (r + c) % 2 ? '#EEF6FA' : '#E6F1F7' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: 'none' });
  el('rect', { x: 276, y: 56, width: 78, height: 94, rx: 10, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 4 });
  el('rect', { x: 283, y: 63, width: 64, height: 80, rx: 6, fill: '#DDEFFA' });
  el('path', { d: 'M 292 130 L 318 74', stroke: '#fff', 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.7 });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#D5E3EA' });
  el('rect', { x: 0, y: FY - 4, width: 400, height: 4, fill: '#B9CAD4' });
  const b = k.buddy({ x: 170, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  b.g.firstChild.setAttribute('fill', pal.shadow);
  // 髪：濡れるとぺたんと暗く、乾くとふわっと明るく
  const hair = g({});
  const hp0 = el('path', { d: 'M -30 -62 Q -33 -88 0 -90 Q 33 -88 30 -62 Q 19 -73 8 -66 Q -4 -77 -14 -64 Q -24 -71 -30 -62 Z', fill: '#5A4338' }, hair);
  b.body.insertBefore(hair, b.body.children[3]);
  const drops = Array.from({ length: 6 }, () => el('path', { d: 'M 0 -6 Q 4.5 1 0 4.5 Q -4.5 1 0 -6 Z', fill: pal.water, stroke: pal.blueDark, 'stroke-width': 1 }));
  // タオル（両手のあいだ）
  const tw = g({});
  el('rect', { x: -1, y: -9, width: 2, height: 18, opacity: 0 }, tw);
  const tbody = el('rect', { x: 0, y: -9, width: 80, height: 18, rx: 7, fill: pal.blue, stroke: pal.blueDark, 'stroke-width': 2 }, tw);
  const stripes = [0.25, 0.75].map((f) => el('rect', { x: 0, y: -9, width: 5, height: 18, fill: '#fff', opacity: 0.8 }, tw));
  const sp = [0, 1, 2].map(() => el('path', { d: 'M 0 -7 L 2 -2 L 7 0 L 2 2 L 0 7 L -2 2 L -7 0 L -2 -2 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1 }));

  return {
    update(t) {
      const up = easeInOut(seg(t, 0.5, 1.1)), dn = easeInOut(seg(t, 3.2, 3.8));
      const rub = seg(t, 1.2, 3.1) * (1 - seg(t, 3.0, 3.1));
      const sw = Math.sin(t * 15) * 11 * rub;
      const a = lerp(8, 164, up) * (1 - dn) + lerp(164, 20, dn) * dn - sw * (1 - dn) * (up > 0.9 ? 1 : 0);
      const dry = easeInOut(seg(t, 2.6, 3.4));
      b.pose({ armR: a, armL: a, lean: 4 * Math.sin(t * 15) * rub - 2 * dn, mood: t < 0.5 ? 'sad' : dry > 0.6 ? 'grin' : 'smile', blink: rub > 0 ? 0.8 : 0, look: 0.3 });
      const p1 = hp(b, S, 'R'), p2 = hp(b, S, 'L');
      const dx = p1.x - p2.x, dy = p1.y - p2.y, len = Math.hypot(dx, dy) + 14;
      const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
      tf(tw, mx, my, deg(Math.atan2(dy, dx)), 1, 1);
      k.set(tbody, { x: -len / 2, width: len });
      stripes.forEach((s, i) => k.set(s, { x: -len / 2 + len * (i ? 0.76 : 0.2) }));
      tw.setAttribute('opacity', 1);
      // 髪の色と形
      hp0.setAttribute('fill', dry < 0.5 ? '#5A4338' : '#B98A5E');
      hp0.setAttribute('fill', `rgb(${Math.round(lerp(90, 196, dry))},${Math.round(lerp(67, 144, dry))},${Math.round(lerp(56, 96, dry))})`);
      const sx = 1 + 0.12 * dry, sy = 1 + 0.2 * dry;
      hair.setAttribute('transform', `translate(0 -62) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) translate(0 62)`);
      // しずく：濡れているあいだ落ちる（ふくと飛び散る）
      const wet = 1 - seg(t, 2.0, 3.0);
      drops.forEach((d, i) => {
        const ph = (t * (rub > 0 ? 1.8 : 0.9) + i * 0.29) % 1;
        const x = b.state.x + (i - 2.5) * 12 * S + (rub > 0 ? (i % 2 ? 1 : -1) * 18 * ph : 0);
        const y = FY - 92 * S + ph * (rub > 0 ? 50 : 70) * S;
        tf(d, x, y);
        d.setAttribute('opacity', wet > 0 ? clamp(wet * 2) * (1 - ph * 0.6) * (t > 0.2 ? 1 : 0.0 + seg(t, 0, 0.3)) : 0);
      });
      sp.forEach((s, i) => {
        const q = seg(t, 3.2 + i * 0.15, 3.8 + i * 0.15);
        tf(s, b.state.x - 30 + i * 30, FY - 118 * S - 6 * q - (i % 2) * 8, 0, hump(q) * 1.1 + 0.001);
      });
    }
  };
}
