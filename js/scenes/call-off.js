// call off：雨が降り出し、係の二人が試合のポスターに大きな×の札を貼って中止にする（例文 They called off the game because of rain.）
import { seg, lerp, easeInOut, easeOut, hump, backOut, wobble } from '../ease.js';
import { faceAt, walkPose, hp } from './look-over.js';

export const meta = { duration: 4.6, beats: [[0, '雨が降り出す'], [1.6, '×の札を持つ'], [3.4, '試合は中止']] };

export function ball(k, parent) {
  const n = k.g({}, parent);
  k.el('circle', { r: 12, fill: '#fff', stroke: k.pal.ink, 'stroke-width': 2 }, n);
  k.el('path', { d: 'M 0 -5 L 5 -1 L 3 5 L -3 5 L -5 -1 Z', fill: k.pal.ink }, n);
  return n;
}

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.85;
  k.backdrop({ floorY: 236 });
  const sky = el('rect', { x: 0, y: 0, width: 400, height: 236, fill: '#8C9AB0', opacity: 0 });
  el('rect', { x: 0, y: 236, width: 400, height: 64, fill: '#BFE5B5' });
  el('path', { d: 'M 20 236 L 20 160 L 110 160 L 110 236', fill: 'none', stroke: '#fff', 'stroke-width': 5 });
  // ポスター看板
  el('rect', { x: 282, y: 160, width: 6, height: 78, fill: pal.woodDark });
  el('rect', { x: 236, y: 70, width: 100, height: 96, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  el('rect', { x: 236, y: 70, width: 100, height: 20, rx: 6, fill: pal.blue });
  const bl = ball(k); tf(bl, 286, 124, 0, 1.3);
  const cl = el('ellipse', { cx: 200, cy: 40, rx: 120, ry: 26, fill: '#A9B4C4', opacity: 0 });
  const co = k.buddy({ x: 90, y: 240, scale: S, color: pal.coral, dark: pal.coralDark });
  const umb = g({});
  el('line', { x1: 0, y1: 0, x2: 0, y2: -46, stroke: pal.ink, 'stroke-width': 3 }, umb);
  el('path', { d: 'M -36 -44 Q 0 -80 36 -44 Q 24 -50 12 -44 Q 0 -50 -12 -44 Q -24 -50 -36 -44 Z', fill: pal.violet }, umb);
  const b = k.buddy({ x: 150, y: 240, scale: S });
  const X = g({});
  el('path', { d: 'M -34 -34 L 34 34 M 34 -34 L -34 34', stroke: pal.red, 'stroke-width': 13, 'stroke-linecap': 'round' }, X);
  const drops = Array.from({ length: 34 }, () => el('line', { x1: 0, y1: 0, x2: -3, y2: 12, stroke: '#7FA6D8', 'stroke-width': 2, 'stroke-linecap': 'round' }));
  const xf = (t) => lerp(150, 236, easeInOut(seg(t, 1.6, 2.6)));
  return {
    update(t) {
      const rain = seg(t, 0.2, 1.2);
      sky.setAttribute('opacity', 0.25 * rain); cl.setAttribute('opacity', rain);
      drops.forEach((d, i) => { const x = (i * 53) % 400, y = ((i * 97) % 300 + t * 320) % 320 - 20; tf(d, x + 6 - y * 0.1, y); d.setAttribute('opacity', rain * (i % 34 < 34 * rain ? 0.8 : 0)); });
      co.pose({ armR: 110, armL: 10, mood: 'flat', look: 0.6 });
      const ch = hp(co, S, 'R'); tf(umb, ch.x, ch.y + 4, -6);
      const p = walkPose(xf, t, 150), lift = easeOut(seg(t, 1.0, 1.4)), slap = easeOut(seg(t, 2.7, 3.1));
      const ar = p.m > 0 ? 60 : lerp(60, 150, slap) * lift + 8 * (1 - lift);
      b.pose({ x: p.x, walk: p.walk, armR: t < 1.0 ? 10 : ar, armL: p.armL, lean: p.lean - 4 * hump(seg(t, 3.0, 3.3)), mood: t > 3.3 ? 'flat' : 'flat', look: t < 1.0 ? -0.4 : 0.6 });
      faceAt(b, t < 1.0 ? 0 : 4, t < 1.0 ? -6 : -2);
      const h = hp(b, S, 'R');
      const stuck = t > 3.1;
      const sx = stuck ? 286 : h.x + 6, sy = stuck ? 118 : h.y - 4;
      tf(X, sx, sy, 0, (stuck ? 1 + 0.06 * wobble(seg(t, 3.1, 3.8)) : 0.45) * (t > 1.0 ? 1 : 0.001));
    }
  };
}
