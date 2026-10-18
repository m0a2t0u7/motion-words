// easier said than done：夜「5時に起きる！」と張り切る→朝5時に目覚ましが鳴るが、止めて布団をかぶり寝てしまう（例文 Waking up at five is easier said than done.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, cue, clock, reach } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '5時に起きる！'], [2.0, '目覚ましが鳴る'], [3.4, '起きられない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  const wx = 40, wy = 40;
  const sky = el('rect', { x: wx, y: wy, width: 90, height: 70, fill: '#3C4670' });
  const moon = el('circle', { cx: wx + 66, cy: wy + 22, r: 9, fill: '#FFF3C4' });
  el('rect', { x: wx, y: wy, width: 90, height: 70, rx: 6, fill: 'none', stroke: '#fff', 'stroke-width': 5 });
  const dim = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#2C3554', opacity: 0 });
  // ベッド（枕は左）
  el('rect', { x: 140, y: 150, width: 12, height: FY - 150, rx: 4, fill: pal.woodDark });
  el('rect', { x: 146, y: 196, width: 220, height: 24, rx: 4, fill: pal.wood });
  el('rect', { x: 150, y: 184, width: 44, height: 16, rx: 7, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  const lay = g({});
  const A = k.buddy({ x: 0, y: 0, scale: 0.78, parent: lay });
  const blanket = g({}); el('path', { d: 'M -20 0 Q -20 -26 0 -28 L 168 -28 Q 176 -28 176 -16 L 176 0 Z', fill: pal.blue }, blanket);
  el('path', { d: 'M -20 -10 L 176 -10', stroke: pal.blueDark, 'stroke-width': 2, opacity: 0.4 }, blanket);
  el('rect', { x: 356, y: 180, width: 12, height: FY - 180, rx: 4, fill: pal.woodDark });
  // 目覚まし（台の上）
  el('rect', { x: 92, y: 176, width: 40, height: FY - 176, rx: 3, fill: pal.wood });
  const al = g({}); const ck = clock(k, 0, 0, 13, al);
  [-9, 9].forEach((x) => el('circle', { cx: x, cy: -13, r: 4.5, fill: pal.red }, al));
  ck.set(5, 0);
  const ring = [0, 1, 2, 3].map((i) => el('path', { d: 'M 0 0 Q 4 -4 0 -8', stroke: pal.red, 'stroke-width': 2.5, fill: 'none' }));
  const brag = cue(k, '5:00 !', 66, 30, -1, 15);
  const zz = [0, 1].map(() => k.text(0, 0, 'z', { 'font-size': 15, fill: pal.violet }));
  return {
    update(t) {
      // 夜：ベッドに座って宣言→横になる→朝（窓が明るく）
      const lie = easeInOut(seg(t, 1.2, 1.7));
      const night = hump(seg(t, 1.5, 2.1));
      const morning = seg(t, 1.8, 2.1);
      k.set(sky, { fill: morning > 0.5 ? '#FFD9A8' : '#3C4670' }); moon.setAttribute('opacity', morning > 0.5 ? 0 : 1);
      dim.setAttribute('opacity', 0.55 * night);
      tf(lay, lerp(206, 186, lie), lerp(198, 194, lie), lerp(0, -84, lie));
      const ringing = t > 2.1 && t < 2.95;
      const slap = easeInOut(seg(t, 2.5, 2.9)) * (1 - easeInOut(seg(t, 3.0, 3.3)));
      P(A, { x: 0, y: 0, look: 0.4, mood: t < 1.2 ? (Math.sin(t * 18) > 0 && t > 0.3 ? 'open' : 'grin') : t < 2.4 ? 'flat' : 'sad', blink: t > 1.6 && t < 2.2 ? 1 : t > 3.3 ? 1 : 0, armR: t < 1.2 ? lerp(8, 160, easeOut(seg(t, 0.3, 0.6))) : 8 + 100 * slap, armL: 8 });
      brag.show(seg(t, 0.3, 0.55) * (1 - seg(t, 1.1, 1.25)), 236, 100);
      // 布団：横になるとかかり、最後は頭までかぶる
      const cover = easeInOut(seg(t, 3.2, 3.7));
      tf(blanket, 188, 202, 0, 1, lerp(0.001, 1, lie) * lerp(1, 1.5, cover));
      tf(al, 112 + (ringing ? 2 * Math.sin(t * 60) : 0), 162, ringing ? 6 * Math.sin(t * 50) : 0);
      ck.set(5, lerp(0, 8, seg(t, 2.1, 4.4)));
      ring.forEach((r, i) => { tf(r, 112 + (i < 2 ? -20 - i * 6 : 20 + (i - 2) * 6), 160, i < 2 ? 180 : 0); r.setAttribute('opacity', ringing && Math.sin(t * 30 + i) > 0 ? 1 : 0); });
      zz.forEach((z, i) => { const q = ((t - 3.5) * 0.8 + i * 0.5) % 1; tf(z, 210 + 14 * q + i * 8, 150 - 20 * q); z.setAttribute('opacity', t > 3.5 ? Math.sin(q * Math.PI) : 0); });
    }
  };
}
