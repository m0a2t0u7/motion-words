// scrub off：ブラシでフライパンをごしごしこすり、こびりついた汚れを落とす（例文 He scrubbed off the dirt from the pan.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, 'こげついた鍋'], [1.5, 'ごしごし'], [3.6, 'ぴかぴか']] };

const hand = (b) => {
  const m = b.armR.hand.getCTM && b.armR.hand.getCTM();
  if (!m) return b.handPos('R');
  return { x: m.c * 26 + m.e, y: m.d * 26 + m.f };
};

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  for (let y = 60; y < 150; y += 22) for (let x = (y / 22) % 2 ? 0 : -20; x < 400; x += 40) el('rect', { x: x + 2, y: y + 2, width: 36, height: 18, rx: 3, fill: '#fff', opacity: 0.7 });
  el('rect', { x: 0, y: 150, width: 400, height: 28, fill: '#F5F0E8' });
  el('rect', { x: 0, y: 176, width: 400, height: 60, fill: pal.wood });
  el('rect', { x: 0, y: 176, width: 400, height: 4, fill: pal.woodDark });
  [60, 150, 240, 330].forEach((x) => { el('rect', { x: x - 38, y: 186, width: 76, height: 44, rx: 4, fill: pal.woodDark, opacity: 0.35 }); el('rect', { x: x - 6, y: 192, width: 12, height: 4, rx: 2, fill: pal.yellowDark }); });
  // フライパン（上から見た形）
  const pan = g({});
  el('rect', { x: 46, y: -4, width: 56, height: 9, rx: 4.5, fill: '#6F7A8C' }, pan);
  el('ellipse', { cx: 0, cy: 3, rx: 52, ry: 14, fill: '#8D98AA' }, pan);
  el('ellipse', { cx: 0, cy: 0, rx: 52, ry: 14, fill: '#C3CCDA' }, pan);
  const inner = el('ellipse', { cx: 0, cy: 0, rx: 44, ry: 11, fill: '#DCE3EC' }, pan);
  const dirtG = g({}, pan);
  const dirts = [[-26, -2, 10, 4], [-4, 4, 12, 4.5], [20, -3, 11, 4], [30, 4, 8, 3], [-34, 5, 7, 3], [8, -6, 9, 3]].map(([x, y, rx, ry], i) => ({
    e: el('ellipse', { cx: x, cy: y, rx, ry, fill: '#8A5A2E' }, dirtG), x, a: 0.7 + i * 0.28
  }));
  const shine = g({}, pan);
  el('path', { d: 'M -30 -5 Q -14 -9 0 -8', stroke: '#fff', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, shine);
  el('path', { d: 'M 10 -7 Q 20 -8 28 -4', stroke: '#fff', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }, shine);
  tf(pan, 282, 158);
  const b = k.buddy({ x: 205, y: FY, scale: 0.85 });
  const brush = g({});
  el('rect', { x: -13, y: -8, width: 26, height: 7, rx: 3.5, fill: pal.red }, brush);
  el('rect', { x: -12, y: -1, width: 24, height: 5, rx: 1, fill: '#F2D49A' }, brush);
  [-9, -4, 1, 6, 10].forEach((x) => el('line', { x1: x, y1: 4, x2: x, y2: 8, stroke: '#D9B56E', 'stroke-width': 1.6 }, brush));
  const foam = [0, 1, 2, 3, 4].map((i) => el('circle', { r: 4 + (i % 3), fill: '#fff', stroke: '#D7E8F5', 'stroke-width': 1.2 }));
  const flecks = [0, 1, 2, 3].map(() => el('circle', { r: 1.8, fill: '#8A5A2E' }));
  const star = g({});
  el('path', { d: 'M 0 -9 L 3 -3 L 9 0 L 3 3 L 0 9 L -3 3 L -9 0 L -3 -3 Z', fill: '#fff', stroke: pal.yellowDark, 'stroke-width': 1.2 }, star);

  return {
    update(t) {
      const sc = t > 0.8 && t < 3.4;
      const sway = sc ? Math.sin(t * 17) : 0;
      const drift = lerp(0, 60, seg(t, 0.8, 3.3));
      const arm = t < 0.8 ? lerp(20, 160, easeOut(seg(t, 0.15, 0.75))) : t < 3.5 ? 160 : lerp(160, 12, easeInOut(seg(t, 3.5, 4.0)));
      const bx = 205 + (sc ? drift : t >= 3.4 ? 60 : 0) + 7 * sway;
      b.pose({ x: bx, armR: arm, armL: sc ? 8 + 12 * sway : 8, walk: 0, lean: sc ? 6 : 0, squash: 1 - (sc ? 0.02 * Math.abs(sway) : 0), mood: t > 3.5 ? 'grin' : 'flat', look: 0.5 });
      const h = hand(b);
      const bp = t < 3.5 ? 1 : 1 - easeInOut(seg(t, 3.5, 4.0));
      tf(brush, h.x, h.y + 1 - 14 * (1 - bp), 0);
      dirts.forEach((d) => {
        const c = seg(t, 0.8 + (d.x + 40) / 90 * 1.2, 0.8 + (d.x + 40) / 90 * 1.2 + 0.7);
        d.e.setAttribute('opacity', 1 - c);
      });
      const f = hump(seg(t, 0.8, 3.7));
      foam.forEach((c, i) => {
        const a = i * 1.7;
        c.setAttribute('cx', h.x + Math.cos(a) * (10 + 4 * (i % 2)));
        c.setAttribute('cy', h.y + 3 + Math.sin(a) * 3 - (i % 2) * 3);
        c.setAttribute('opacity', Math.min(1, f * 1.5));
      });
      flecks.forEach((c, j) => {
        const u = (t * 2.4 + j * 0.25) % 1;
        c.setAttribute('cx', h.x + 6 + 26 * u);
        c.setAttribute('cy', h.y - 4 - 30 * u + 44 * u * u);
        c.setAttribute('opacity', sc && t < 3.0 ? hump(u) : 0);
      });
      shine.setAttribute('opacity', seg(t, 2.6, 3.4));
      const q = seg(t, 3.5, 4.2);
      tf(star, 276, 138 - 8 * q, q * 90, 0.2 + hump(q) * 1.2);
      star.setAttribute('opacity', q > 0 && q < 1 ? 1 : 0);
    }
  };
}
