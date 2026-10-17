// hand over：まめが書類を相手に差し出し、相手が受け取る（例文 Please hand over the papers to him.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';

export const meta = { duration: 3.8, beats: [[0, '書類を持つ'], [1.5, '差し出す'], [3.1, '受け取った']] };

// 共有ヘルパー（他の手渡し系シーンからも使う）：手先のワールド座標
export function hp(b, s, side = 'R') {
  const st = b.state, th = ((side === 'R' ? st.armR : st.armL) * Math.PI) / 180, d = side === 'R' ? 1 : -1;
  let lx = d * 27 + d * Math.sin(th) * 26, ly = -46 + Math.cos(th) * 26;
  lx *= 2 - st.squash; ly *= st.squash;
  const r = (st.lean * Math.PI) / 180, bob = Math.abs(Math.sin(st.walk)) * 3;
  const x = lx * Math.cos(r) - ly * Math.sin(r), y = lx * Math.sin(r) + ly * Math.cos(r) - 10 - st.lift - bob;
  return { x: st.x + x * st.facing * s, y: st.y + y * s };
}
// 物の上に重ねる手（つかんでいるように見せる）
export function grip(k, color, dark, s) {
  const c = k.el('circle', { r: 6.5 * s, fill: color, stroke: dark, 'stroke-width': 2.5 * s });
  return (p) => k.set(c, { cx: p.x, cy: p.y });
}
export function decor(k, FY) {
  const { el, pal } = k;
  el('rect', { x: 40, y: 48, width: 76, height: 70, rx: 8, fill: '#DDEFFA' });
  el('line', { x1: 78, y1: 48, x2: 78, y2: 118, stroke: '#fff', 'stroke-width': 4 });
  el('line', { x1: 40, y1: 83, x2: 116, y2: 83, stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  el('path', { d: 'M 352 ' + FY + ' L 358 ' + (FY - 26) + ' L 382 ' + (FY - 26) + ' L 388 ' + FY + ' Z', fill: pal.coral });
  [[-12, -48, -20], [0, -56, 0], [12, -46, 22]].forEach(([dx, dy, r]) =>
    el('ellipse', { cx: 370 + dx, cy: FY + dy, rx: 7, ry: 17, fill: pal.green, transform: `rotate(${r} ${370 + dx} ${FY + dy + 12})` }));
}
export function papers(k, n = 3) {
  const g = k.g();
  for (let i = 0; i < n; i++) k.el('rect', { x: -13 + i * 1.6, y: -9 - i * 1.6, width: 26, height: 18, rx: 2, fill: '#fff', stroke: k.pal.line, 'stroke-width': 1.5 }, g);
  [-5, -1, 3].forEach((y) => k.el('line', { x1: -7 + (n - 1) * 1.6, x2: 7 + (n - 1) * 1.6, y1: y - (n - 1) * 1.6, y2: y - (n - 1) * 1.6, stroke: k.pal.blue, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, g));
  return g;
}

export function create(k) {
  const { pal, tf } = k;
  const FY = k.backdrop({ floorY: 246, mood: 'indoor' });
  decor(k, FY);
  const S = 1;
  const a = k.buddy({ x: 130, y: FY, scale: S });
  const c = k.buddy({ x: 330, y: FY, scale: S, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const doc = papers(k, 3);
  const ga = grip(k, pal.mint, pal.mintDark, S), gc = grip(k, pal.coral, pal.coralDark, S);
  return {
    update(t) {
      const walk = easeOut(seg(t, 0.2, 1.2));
      const moving = t > 0.2 && t < 1.2;
      const rA = lerp(lerp(22, 88, easeInOut(seg(t, 0.8, 1.4))), 18, easeInOut(seg(t, 2.0, 2.7)));
      const rC = lerp(lerp(14, 90, easeInOut(seg(t, 1.0, 1.5))), 42, easeInOut(seg(t, 2.1, 2.8)));
      const hop = hump(seg(t, 1.9, 2.3)) * 0.06;
      a.pose({ armR: rA, armL: 10, look: 0.4, mood: t > 2.6 ? 'grin' : 'smile', lean: 3 * hump(seg(t, 0.8, 2.2)) });
      c.pose({ x: lerp(330, 240, walk), walk: moving ? (t - 0.2) * 9 : 0, armR: rC, armL: 10 + (moving ? Math.sin(t * 9) * 14 : 0), look: 0.4,
        mood: t > 1.9 ? 'grin' : 'smile', squash: 1 - hop, lean: 3 * hump(seg(t, 1.0, 2.2)) });
      const ha = hp(a, S), hc = hp(c, S);
      const m = easeInOut(seg(t, 1.6, 1.95));
      const px = lerp(ha.x + 3, hc.x - 3, m), py = lerp(ha.y - 9, hc.y - 9, m);
      tf(doc, px, py, lerp(-6, 5, m));
      ga(ha); gc(hc);
    }
  };
}
