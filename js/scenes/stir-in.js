import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';
const D = Math.PI / 180;
// 手(R/L)を点(tx,ty)へ向ける腕の角度
function aim(b, S, tx, ty, side = 'R') {
  const s = b.state, f = s.facing, o = side === 'R' ? 1 : -1;
  return Math.atan2((tx - (s.x + 27 * S * f * o)) * f * o, ty - (s.y - 56 * S - s.lift)) / D;
}
function cursor(k, parent) {
  return k.el('path', { d: 'M0 0 L0 15 L4 11.5 L7 18 L10 16.5 L7 10.5 L12 10.5 Z', fill: k.pal.ink, stroke: '#fff', 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, parent);
}
function pen(k, parent, c) {
  const p = k.g({}, parent);
  k.el('line', { x1: 0, y1: 0, x2: -22, y2: -6, stroke: c || k.pal.coralDark, 'stroke-width': 5, 'stroke-linecap': 'round' }, p);
  k.el('path', { d: 'M 0 0 L 6 1.6 L 0 3 Z', fill: '#F4D9B5' }, p);
  k.el('circle', { cx: 5.2, cy: 1.7, r: 1.1, fill: k.pal.ink }, p);
  return p;
}

// stir-in：牛乳を少しずつ注ぎながらかき混ぜ、中に溶け込ませる（Stir in the milk slowly.）
export const meta = { duration: 4.2, beats: [[0, '生地だけ'], [1.2, '注ぎながら混ぜる'], [3.4, '溶け込んだ']] };

function counter(k, FY) {
  const { el, pal } = k;
  el('rect', { x: 0, y: 214, width: 400, height: 22, fill: '#D9C3A0' });
  el('rect', { x: 0, y: 194, width: 400, height: 20, fill: '#F0DFC2' });
  el('rect', { x: 0, y: 214, width: 400, height: 3, fill: '#B89F78' });
}
function knife(k, parent) {
  const n = k.g({}, parent);
  k.el('rect', { x: -4, y: -14, width: 8, height: 16, rx: 3, fill: k.pal.woodDark }, n);
  k.el('path', { d: 'M -5 2 L 5 2 L 5 26 Q 2 32 -5 28 Z', fill: '#DDE3EA', stroke: '#9AA6B6', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, n);
  return n;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = 232, S = 1.1;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  const BX = 200;
  const b = k.buddy({ x: BX, y: FY, scale: S });
  counter(k, FY);
  // ボウル
  const clip = k.clip((cp) => el('ellipse', { cx: BX, cy: 198, rx: 54, ry: 11 }, cp));
  const bowl = g({});
  el('path', { d: `M ${BX - 62} 190 Q ${BX - 58} 232 ${BX} 232 Q ${BX + 58} 232 ${BX + 62} 190 Z`, fill: '#9CC4EF' }, bowl);
  el('ellipse', { cx: BX, cy: 190, rx: 62, ry: 12, fill: '#C9E0F8' }, bowl);
  el('ellipse', { cx: BX, cy: 192, rx: 55, ry: 10, fill: '#F6D77C' }, bowl);
  // 牛乳の渦（生地に混ざる）
  const sw = g({ 'clip-path': k.clip((cp) => el('ellipse', { cx: BX, cy: 192, rx: 55, ry: 10 }, cp)) }, bowl);
  const arms = [0, 1, 2].map((i) => el('path', { d: `M ${BX} 192 q 18 -6 34 0 q -10 6 -34 4`, fill: '#fff', opacity: 0, transform: `rotate(${i * 120} ${BX} 192)` }, sw));
  const mix = el('ellipse', { cx: BX, cy: 192, rx: 55, ry: 10, fill: '#FFF0C4', opacity: 0 }, bowl);
  // 注ぐ牛乳
  const stream = el('rect', { x: BX - 52, y: 130, width: 5, height: 0, rx: 2.5, fill: '#fff', stroke: '#DCE6F0', 'stroke-width': 1 });
  const jug = g({});
  el('path', { d: 'M -10 -18 L 12 -18 L 14 14 L -12 14 Z', fill: '#fff', stroke: '#C7CFDA', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, jug);
  el('path', { d: 'M -10 -18 L -16 -22 L -10 -14 Z', fill: '#C7CFDA' }, jug);
  el('rect', { x: -9, y: -4, width: 20, height: 7, fill: pal.blue, opacity: 0.4 }, jug);
  const spoon = g({});
  el('line', { x1: 0, y1: 0, x2: 0, y2: 38, stroke: pal.woodDark, 'stroke-width': 5, 'stroke-linecap': 'round' }, spoon);
  el('ellipse', { cx: 0, cy: 40, rx: 6, ry: 9, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 2 }, spoon);
  return {
    update(t) {
      const act = easeInOut(seg(t, 0.3, 0.9)) * (1 - easeInOut(seg(t, 3.5, 4.0)));
      const pour = seg(t, 1.0, 1.3) * (1 - seg(t, 2.9, 3.2));
      const circ = t * 5.5;
      b.pose({ armL: lerp(10, 120, act), armR: lerp(8, 100, act), lean: 3 * act, look: 0.4, mood: t > 3.4 ? 'grin' : 'smile', blink: t > 0.2 && t < 0.3 ? 1 : 0 });
      const hl = b.handPos('L'), hr = b.handPos('R');
      k.set(jug, { opacity: act > 0.05 ? 1 : 0 });
      tf(jug, hl.x - 6, hl.y - 8, lerp(0, -54, easeInOut(seg(t, 0.8, 1.2)) * (1 - seg(t, 3.0, 3.4))));
      // 注ぎ口から落ちる牛乳
      const sx = hl.x - 16, sy = hl.y - 14 + 4;
      k.set(stream, { x: sx - 2.5, y: sy, height: Math.max(0, (192 - sy) * pour), opacity: pour > 0 ? 1 : 0 });
      // スプーンで円を描く
      const cx = BX + Math.cos(circ) * 20, cy = 194 + Math.sin(circ) * 4;
      const ang = Math.atan2(cy - hr.y, cx - hr.x) / D - 90;
      tf(spoon, hr.x, hr.y, ang, 1);
      k.set(spoon, { opacity: act > 0.05 ? 1 : 0 });
      const mk = seg(t, 1.2, 2.2), done = seg(t, 2.2, 3.4);
      arms.forEach((a, i) => { k.set(a, { opacity: 0.9 * mk * (1 - done), transform: `rotate(${i * 120 + circ * 57} ${BX} 192)` }); });
      k.set(mix, { opacity: 0.85 * done });
    }
  };
}
