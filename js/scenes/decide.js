// decide：ピアノとギターのどちらを習うか迷い、考えが行ったり来たり。「よし！」と決めてギターの案を消し、ピアノの前で鍵盤を弾き始める（例文 I decided to learn the piano.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { reach } from './dig.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg } from './look-over.js';
import { path } from './queue-up.js';
import { thought } from './work-on.js';
import { mark } from './so-far-so-good.js';
import { icon } from './in-common.js';

function keysIcon(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('rect', { x: -14, y: -9, width: 28, height: 18, rx: 2, fill: '#fff', stroke: pal.ink, 'stroke-width': 2 }, g);
  [-7, 0, 7].forEach((x) => k.el('line', { x1: x, y1: -9, x2: x, y2: 9, stroke: pal.ink, 'stroke-width': 1.2 }, g));
  [-10, -3, 4, 11].forEach((x) => k.el('rect', { x: x - 1.8, y: -9, width: 3.6, height: 10, fill: pal.ink }, g));
  return g;
}
function guitar(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('rect', { x: 2, y: -16, width: 4, height: 16, fill: pal.woodDark, transform: 'rotate(30)' }, g);
  k.el('circle', { cx: -3, cy: 6, r: 8, fill: '#E9A45B' }, g); k.el('circle', { cx: 3, cy: -1, r: 6, fill: '#E9A45B' }, g);
  k.el('circle', { cx: -1, cy: 3, r: 2.5, fill: pal.ink }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, 'どっちにしよう'], [1.6, '決めた！'], [2.6, 'ピアノを習う']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  // ピアノ（動かない）
  const PX = 296;
  k.shadow(PX, FY + 1, 70, 5);
  el('rect', { x: PX - 60, y: FY - 104, width: 120, height: 104, rx: 6, fill: pal.ink });
  el('rect', { x: PX - 66, y: FY - 60, width: 132, height: 10, rx: 3, fill: '#3A4458' });
  el('rect', { x: PX - 58, y: FY - 62, width: 116, height: 8, fill: '#fff' });
  for (let i = 0; i < 14; i++) el('line', { x1: PX - 58 + i * 8.3, y1: FY - 62, x2: PX - 58 + i * 8.3, y2: FY - 54, stroke: pal.line, 'stroke-width': 1 });
  for (let i = 0; i < 13; i++) if (i % 7 !== 2 && i % 7 !== 6) el('rect', { x: PX - 55 + i * 8.3, y: FY - 62, width: 4, height: 5, fill: pal.ink });
  el('rect', { x: PX - 54, y: FY - 96, width: 108, height: 26, rx: 3, fill: '#3A4458' });
  el('rect', { x: PX - 14, y: FY - 92, width: 28, height: 18, rx: 2, fill: '#fff' });
  const me = k.buddy({ x: 120, y: FY, scale: 0.9 });
  const th = thought(k, 110, 56, -1);
  const kI = keysIcon(k, th.inner), gI = guitar(k, th.inner);
  const xm = mark(k, 'x', th.inner, 1.2);
  const bang = mark(k, 'bang', null, 1.6);
  const notes = [0, 1, 2].map(() => icon(k, 'note'));
  const xf = path([[2.1, 120], [2.9, 226]]);
  return {
    update(t) {
      // 迷い：視線と体が左右に揺れ、思考の中の強調が交互に
      const dither = t < 1.6 ? Math.sin(t * 5) : 0;
      const pick = seg(t, 1.6, 1.9);
      tf(th.g, 104, 82, 0, Math.max(0.001, easeOut(seg(t, 0.1, 0.4)) * (1 - seg(t, 2.6, 2.9))));
      th.g.setAttribute('opacity', t < 2.9 ? 1 : 0);
      tf(kI, -24, 0, 0, t < 1.6 ? 1 + 0.15 * Math.max(0, dither) : 1.25);
      tf(gI, 24, 0, 0, t < 1.6 ? 1 + 0.15 * Math.max(0, -dither) : 0.9);
      tf(xm, 24, 0); xm.setAttribute('opacity', seg(t, 1.8, 1.95));
      gI.setAttribute('opacity', 1 - 0.6 * seg(t, 1.8, 2.0));
      const bq = seg(t, 1.6, 1.85);
      tf(bang, 150, 120 - 6 * easeOut(bq), 0, Math.max(0.001, easeOut(bq) * 1.4 * (1 - seg(t, 2.3, 2.5))));
      const w = walkTo(xf, t, 120, 1);
      const play = t > 3.0 ? 1 : 0, pp = easeInOut(seg(t, 2.85, 3.1));
      P(me, { x: w.x, walk: w.walk, look: t < 1.6 ? dither * 0.8 : 0.6, lean: w.lean + 3 * dither + 8 * pp, mood: t < 1.6 ? 'flat' : t < 3.0 ? 'grin' : 'smile', squash: 1 - 0.06 * hump(seg(t, 1.6, 1.8)), lift: 8 * hump(seg(t, 1.65, 1.95)), armL: t < 2.1 ? 8 + 120 * hump(seg(t, 1.6, 2.1)) : w.armL, blink: blinkAt(t, 0.6) });
      const kx = 246 + 10 * Math.sin(t * 9), ky = FY - 62 + 3 * Math.max(0, Math.sin(t * 18));
      me.pose({ armR: t < 2.85 ? (t < 1.6 ? 8 + 20 * Math.abs(dither) : w.armR) : lerp(w.armR, reach(me, 0.9, 'R', kx, ky), pp) });
      notes.forEach((n, i) => { const q = ((t - 3.05) * 0.9 + i / 3) % 1; tf(n, 290 + i * 16 + 6 * Math.sin(q * 6), FY - 120 - 40 * q, 0, 0.8); n.setAttribute('opacity', play * hump(q)); });
    }
  };
}
