// keep：「ドアを閉めておいてね」と頼まれる。風でドアが少し開きかけるが、まめが押して閉め、手で押さえて閉じたままにする（例文 Keep the door closed, please.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { reach } from './dig.js';
import { P, blinkAt, win } from './run-after.js';
import { path, walk, door } from './queue-up.js';
import { cue, talk } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '閉めておいて'], [1.7, '押して閉める'], [3.0, '閉じたまま']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 窓の外で木が風に揺れる
  const w = win(k, 30, 50, 90, 70);
  const tr = g({}, w.inner);
  el('rect', { x: 66, y: 96, width: 8, height: 30, fill: pal.woodDark }, tr);
  const crown = el('ellipse', { cx: 70, cy: 90, rx: 24, ry: 18, fill: '#7FD3A0' }, tr);
  const gust = [0, 1, 2].map((i) => el('path', { d: 'M 0 0 Q 12 -4 24 0', stroke: '#B9D8EE', 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }, w.inner));
  w.frame();
  // ドア枠と戸（右開き）
  const D = { x: 268, y: FY - 128, w: 76, h: 128 };
  el('rect', { x: D.x - 8, y: D.y - 8, width: D.w + 16, height: D.h + 8, rx: 4, fill: '#E9DCC8' });
  el('rect', { x: D.x, y: D.y, width: D.w, height: D.h, fill: '#C8D6E4' });
  const dr = door(k, { x: D.x, y: D.y, w: D.w, h: D.h, hinge: 'L', color: pal.blue });
  const mom = k.buddy({ x: 70, y: FY, scale: 0.95, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: 150, y: FY, scale: 0.92 });
  const bub = cue(k, 'please', 70, 30, -1, 14);
  const xf = path([[1.2, 150], [2.0, 232]]);
  return {
    update(t) {
      const sway = Math.sin(t * 5) * 0.6 + Math.sin(t * 8.3) * 0.4;
      k.set(crown, { cx: 70 + 4 * sway });
      gust.forEach((gp, i) => { const u = ((t * 0.9 + i / 3) % 1); tf(gp, 30 + u * 80, 64 + i * 18); gp.setAttribute('opacity', hump(u) * 0.9); });
      // ドア：風で少し開きかける（0.7-1.5）→ まめが押して閉める（1.9-2.3）→ 押さえている間はわずかに震えるだけ
      const ajar = 0.32 * easeOut(seg(t, 0.3, 1.0)) * (1 - easeInOut(seg(t, 2.0, 2.45)));
      const hold = t > 2.45 ? 0.008 * Math.max(0, Math.sin(t * 9)) * (1 - seg(t, 2.45, 3.6)) : 0;
      dr.set(ajar + hold);
      const p = walk(me, xf, t, {});
      const kn = dr.knob(ajar);
      const pushA = easeInOut(seg(t, 1.7, 2.1));
      P(me, { x: p.x, walk: p.walk, armL: 10, armR: lerp(p.armR, reach(me, 0.92, 'R', Math.min(kn.x, D.x + 20) + 0, FY - 60 + 26), pushA), lean: p.lean + 10 * pushA, look: t < 0.5 ? -0.4 : 0.6, mood: t > 2.5 ? 'smile' : 'flat', squash: 1 - 0.03 * hump(seg(t, 2.25, 2.5)), blink: blinkAt(t, 0.4) });
      P(mom, { armR: 8 + 70 * hump(seg(t, 0.7, 1.9)) + 60 * easeOut(seg(t, 3.2, 3.6)), look: 0.6, mood: talk(t, 0.9, 1.7) || 'smile', blink: blinkAt(t, 1.3) });
      bub.show(seg(t, 0.9, 1.15) * (1 - seg(t, 2.1, 2.3)), 82, 110);
    }
  };
}
