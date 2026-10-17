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
// alone：公園の道をひとりで気持ちよく歩く（遠くには二人連れ）（例文 I like to walk alone.）
export const meta = { duration: 4.6, beats: [[0, '歩き出す'], [1.8, '気分よく歩く'], [3.6, 'ひとりで']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  const S = 0.95;
  // 丘・木・ベンチ・道
  el('ellipse', { cx: 100, cy: 200, rx: 200, ry: 46, fill: '#CDEBD5' });
  el('ellipse', { cx: 320, cy: 204, rx: 180, ry: 40, fill: '#BDE5C8' });
  el('rect', { x: 0, y: 206, width: 400, height: 30, fill: '#DDF3E2' });
  const tree = (x, y, s) => { const t = g({}); tf(t, x, y, 0, s); k.shadow(0, 0, 22, 4, t); el('rect', { x: -4, y: -36, width: 8, height: 36, rx: 3, fill: pal.woodDark }, t); el('circle', { cx: 0, cy: -52, r: 24, fill: '#7FD3A0' }, t); el('circle', { cx: -13, cy: -40, r: 16, fill: '#6BC48F' }, t); el('circle', { cx: 14, cy: -42, r: 17, fill: '#6BC48F' }, t); };
  tree(40, 204, 0.9); tree(330, 206, 1);
  // 遠くのベンチと二人連れ
  el('rect', { x: 226, y: 192, width: 34, height: 5, rx: 2, fill: pal.woodDark }); el('rect', { x: 228, y: 197, width: 3, height: 8, fill: pal.woodDark }); el('rect', { x: 255, y: 197, width: 3, height: 8, fill: pal.woodDark });
  // 道
  el('rect', { x: 0, y: FY + 6, width: 400, height: 56, fill: '#F1E7D6' });
  el('rect', { x: 0, y: FY + 6, width: 400, height: 3, fill: '#E3D5BC' });
  const pair = [k.buddy({ x: 150, y: 214, scale: 0.4, facing: -1, color: pal.coral, dark: pal.coralDark }), k.buddy({ x: 170, y: 214, scale: 0.4, facing: -1, color: pal.blue, dark: pal.blueDark })];
  const b = k.buddy({ x: 20, y: 262, scale: S });
  const nt = [0, 1].map(() => { const n = g({}); el('ellipse', { cx: 0, cy: 0, rx: 4.5, ry: 3.2, fill: pal.violet, transform: 'rotate(-20)' }, n); el('line', { x1: 3.5, y1: -1, x2: 3.5, y2: -13, stroke: pal.violet, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, n); return n; });
  const bird = el('path', { d: 'M -7 0 q 4 -6 7 0 q 3 -6 7 0', fill: 'none', stroke: pal.sub, 'stroke-width': 2, 'stroke-linecap': 'round' });
  const xf = (t) => lerp(24, 330, easeInOut(seg(t, 0.2, 4.3)));
  return {
    update(t) {
      const p = gait(xf, t, 24, 20, 0.1);
      const bob = Math.abs(Math.sin(p.walk));
      b.pose({ x: p.x, walk: p.walk, armL: p.armL + 6, armR: p.armR, lean: p.lean, mood: t < 0.6 ? 'smile' : 'grin', look: 0.3 + 0.2 * Math.sin(t * 1.3), squash: 1 });
      // 遠くの二人連れ：ゆっくり左へ（一緒）
      pair.forEach((q, i) => {
        const dx = lerp(260, 190, seg(t, 0, 4.6)) + i * 20, ph = dx * 0.35;
        q.pose({ x: dx, walk: ph, armL: 8 + 14 * Math.sin(ph), armR: 8 - 14 * Math.sin(ph), mood: 'smile', look: i ? 0.5 : -0.5 });
      });
      nt.forEach((n, i) => { const q = ((t * 0.6 + i * 0.5) % 1); tf(n, p.x + 14 + 12 * q, 262 - 92 - 24 * q + 4 * Math.sin(t * 6 + i)); n.setAttribute('opacity', Math.sin(q * Math.PI)); });
      tf(bird, 100 + 60 * Math.sin(t * 0.8) + 100, 80 + 6 * Math.sin(t * 8), 0, 1, 1 - 0.5 * Math.max(0, Math.sin(t * 8)));
    }
  };
}
