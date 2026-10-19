// alarm：算数のテスト中、壁の火災報知ベルが鳴り出す。まめはびっくりして耳をふさぐ（例文 The fire alarm went off in the middle of our math test.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, held, reach, P, blinkAt, face, desk } from './bag.js';
import { pencil, sheet, tap } from './check.js';

// 非常ベル（中心原点）。ring(on, t)
export function bell(k, x, y) {
  const { el, pal } = k, g = k.g({}); k.tf(g, x, y);
  el('rect', { x: -24, y: -24, width: 48, height: 48, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, g);
  const dome = k.g({}, g);
  el('circle', { r: 18, fill: pal.red }, dome);
  el('circle', { r: 11, fill: '#F58E84' }, dome);
  el('circle', { r: 4, fill: pal.ink }, dome);
  const lamp = el('circle', { cx: 0, cy: -38, r: 8, fill: '#C9D1DC' }, g);
  el('rect', { x: -10, y: -32, width: 20, height: 6, rx: 2, fill: pal.sub }, g);
  const arcs = [-1, 1].flatMap((d) => [0, 1].map((i) => ({ d, i, n: el('path', { d: 'M 0 -12 Q 7 0 0 12', stroke: pal.red, 'stroke-width': 3.2, fill: 'none', 'stroke-linecap': 'round' }, g) })));
  return { g, ring(on, t) {
    k.tf(dome, on ? Math.sin(t * 70) * 2 : 0, 0);
    lamp.setAttribute('fill', on && Math.sin(t * 14) > 0 ? '#FF5A4A' : '#C9D1DC');
    arcs.forEach(({ d, i, n }) => { const u = (t * 2.2 + i * 0.5) % 1; k.tf(n, d * (30 + u * 22), 0, 0, d * (0.7 + u * 0.6), 0.7 + u * 0.6); n.setAttribute('opacity', on ? 1 - u : 0); });
  } };
}

export const meta = { duration: 4.4, beats: [[0, '算数のテスト'], [1.4, 'ベルが鳴った！'], [2.6, '耳をふさぐ']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.1, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 14, y: 34, width: 156, height: 90, rx: 4, fill: '#3E6B5A', stroke: pal.woodDark, 'stroke-width': 6 });
  k.text(92, 66, '12 + 7 =', { 'font-size': 20, fill: '#fff', opacity: 0.85 });
  k.text(92, 98, '9 × 3 =', { 'font-size': 20, fill: '#fff', opacity: 0.85 });
  const bl = bell(k, 330, 92);
  const top = desk(k, 120, 230, FY);
  const SX = 206, SY = 116, SW = 70, SH = 74;
  el('rect', { x: SX + 26, y: SY + SH - 2, width: 22, height: top - SY - SH + 2, fill: pal.woodDark });
  sheet(k, SX, SY, SW, SH, 4);
  k.text(SX + SW / 2, SY + 12, 'TEST', { 'font-size': 10, fill: pal.sub });
  [0, 1, 2].forEach((i) => k.text(SX + 14, SY + 30 + i * 16, ['7+5', '8-3', '4×2'][i], { 'font-size': 9, fill: pal.ink, 'text-anchor': 'start' }));
  const b = k.buddy({ x: 168, y: FY, scale: S });
  const pen = pencil(k);
  return {
    update(t) {
      const on = t > 1.4;
      bl.ring(on, t);
      const jump = hump(seg(t, 1.45, 1.8));
      const cover = easeInOut(seg(t, 2.0, 2.5));
      P(b, { x: 168, lean: 8 * (1 - seg(t, 1.4, 1.6)) - 4 * cover, lift: 10 * jump, look: on ? 0.9 : 0.8, blink: on ? 0 : blinkAt(t), mood: on ? 'open' : 'flat', squash: 1 + 0.06 * jump });
      face(b, on ? 6 : 4, on ? -2 : 1);
      if (!on) {
        const q = (t * 2.2) % 1;
        b.pose({ armR: reach(b, S, 'R', SX + 30 + 26 * q, SY + 32 + Math.floor(t * 2.2) % 3 * 16 - 3 * tap(q, 0.5, 0.4)) });
      } else {
        const ear = { y: FY - 72 * S };
        b.pose({ armR: lerp(lerp(60, 150, jump), reach(b, S, 'R', 168 + 30 * S, ear.y), cover), armL: lerp(lerp(8, 150, jump), reach(b, S, 'L', 168 - 30 * S, ear.y), cover) });
      }
      // 鉛筆：書いている間は手に、驚いたら机に落ちる
      if (t < 1.45) { held(k, b, S, pen, 'R', 0); }
      else { const f = easeOut(seg(t, 1.45, 1.8)); tf(pen, SX - 6, lerp(SY + 60, top - 3, f), lerp(0, 90, f) + wobble(seg(t, 1.8, 2.4), 2, 5) * 8, S); }
    }
  };
}
