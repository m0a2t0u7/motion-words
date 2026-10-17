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
// quiet：図書館で大声の相手に、緑のまめが「しーっ」→相手が静かになる（例文 Please be quiet in the library.）
export const meta = { duration: 4.6, beats: [[0, 'うるさい'], [1.6, 'しーっ'], [3.4, '静か']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 0.95;
  // 本棚
  const cols = [pal.blue, pal.coral, pal.green, pal.violet, pal.yellow, '#9FB4D2'];
  [[0, 26], [140, 26]].forEach(([x0, y0]) => {
    el('rect', { x: x0 + 14, y: y0, width: 116, height: 130, rx: 4, fill: pal.wood });
    for (let r = 0; r < 3; r++) {
      el('rect', { x: x0 + 18, y: y0 + 42 + r * 42 - 2, width: 108, height: 4, fill: pal.woodDark });
      for (let i = 0; i < 8; i++) el('rect', { x: x0 + 22 + i * 13, y: y0 + 8 + r * 42 + (i % 3) * 3, width: 10, height: 30 - (i % 3) * 3, rx: 1.5, fill: cols[(i + r * 2) % 6] });
    }
  });
  el('rect', { x: 296, y: 40, width: 80, height: 46, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('circle', { cx: 336, cy: 63, r: 15, fill: 'none', stroke: pal.sub, 'stroke-width': 3 });
  el('path', { d: 'M 331 69 q 5 5 10 0', fill: 'none', stroke: pal.sub, 'stroke-width': 2.4, 'stroke-linecap': 'round' });
  el('line', { x1: 336, y1: 52, x2: 336, y2: 62, stroke: pal.sub, 'stroke-width': 0 });
  const me = k.buddy({ x: 110, y: FY, scale: S });
  const him = k.buddy({ x: 290, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const bb = [0, 1, 2].map((i) => {
    const n = g({});
    el('path', { d: 'M -22 -12 H 22 Q 28 -12 28 -6 V 8 Q 28 14 22 14 H -12 L -22 24 L -20 14 H -22 Q -28 14 -28 8 V -6 Q -28 -12 -22 -12 Z', fill: '#fff', stroke: pal.red, 'stroke-width': 2 }, n);
    el('path', { d: 'M -14 -2 l 6 0 M -2 -2 l 6 0 M 10 -2 l 6 0 M -14 6 l 24 0', stroke: pal.red, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, n);
    return n;
  });
  return {
    update(t) {
      // 相手：大声で話して腕をばたばた。しーっで縮み、口を押さえて静かに本を持つ
      const calm = easeInOut(seg(t, 2.0, 2.8)), talk = t < 2.2 ? 1 : 0;
      const open = talk && Math.sin(t * 14) > -0.2;
      him.pose({ squash: 1 + 0.03 * Math.sin(t * 14) * talk - 0.04 * calm, lean: -5 * calm, look: 0.6,
        mood: t < 2.0 ? (open ? 'grin' : 'smile') : t < 2.8 ? 'open' : 'smile',
        armR: t < 2.0 ? 30 + 24 * Math.sin(t * 9) : lerp(30, -98, calm) * (t < 2.8 ? 1 : 0) + (t >= 2.8 ? -98 : 0), armL: t < 2.0 ? 30 + 24 * Math.sin(t * 9 + 2) : lerp(30, 8, calm), blink: t > 2.8 ? 0.7 * hump(seg(t, 3.0, 3.4)) : 0 });
      // 吹き出し（大声）
      bb.forEach((n, i) => {
        const q = seg(t, 0.2 + i * 0.35, 1.5 + i * 0.35), f = seg(t, 1.6 + i * 0.1, 2.1 + i * 0.1);
        const s = backOut(q) * (1 - f);
        tf(n, 215 - i * 22 + 4 * Math.sin(t * 12 + i), 98 + i * 22 - 8 * q, 0, s * (0.7 + 0.1 * i) + 0.001);
      });
      // 自分：指を口に（しーっ）。顔の前に手を上げる
      const up = easeInOut(seg(t, 1.2, 1.8)) * (1 - easeInOut(seg(t, 3.8, 4.3)));
      me.pose({ armR: lerp(8, -102, up), armL: 8, mood: up > 0.5 ? 'flat' : 'smile', look: 0.7, lean: -3 * up, squash: 1 });
    }
  };
}
