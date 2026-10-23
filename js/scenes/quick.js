// quick：作業の手を止め、お茶をひと口飲んで、すぐ作業にもどる短い休憩。右上のタイマーはすぐ減る（例文 Let's take a quick break.）
import { seg, lerp, easeInOut } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';
import { held } from './dig.js';

export const meta = { duration: 3.8, beats: [[0, '作業中'], [1.0, 'お茶をひと口'], [2.9, 'すぐ戻る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  k.shadow(260, FY + 2, 70, 5);
  el('rect', { x: 185, y: 211, width: 150, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 192, y: 219, width: 7, height: 21, fill: pal.woodDark }); el('rect', { x: 321, y: 219, width: 7, height: 21, fill: pal.woodDark });
  el('rect', { x: 262, y: 168, width: 56, height: 38, rx: 4, fill: pal.ink }); el('rect', { x: 266, y: 172, width: 48, height: 30, rx: 2, fill: '#9FB4CC' }); el('rect', { x: 256, y: 206, width: 68, height: 5, rx: 2, fill: pal.sub });
  const lines = [0, 1, 2].map((i) => el('rect', { x: 270, y: 177 + i * 8, width: 10, height: 3, rx: 1.5, fill: '#fff' }));
  const b = k.buddy({ x: 165, y: FY + 8, scale: 1 });
  const cup = g({}); el('rect', { x: -7, y: -6.5, width: 14, height: 13, rx: 3, fill: '#fff', stroke: pal.sub, 'stroke-width': 1.5 }, cup); el('rect', { x: -5.5, y: -5, width: 11, height: 4, fill: pal.coffee }, cup);
  // タイマー
  el('circle', { cx: 350, cy: 52, r: 24, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 });
  const pie = el('path', { d: '', fill: pal.coral });
  return {
    update(t) {
      const typing = t < 0.5 || t > 3.3 ? Math.sin(t * 22) : 0;
      const grab = easeInOut(seg(t, 0.5, 0.95)), sip = easeInOut(seg(t, 1.0, 1.6)) - easeInOut(seg(t, 2.2, 2.8)), back = easeInOut(seg(t, 2.8, 3.3));
      const arm = typing !== 0 && t < 0.5 ? 40 + typing * 10 : t > 3.3 ? 40 + typing * 10 : lerp(40, 60, grab) + sip * 90 - back * 20 * (t > 2.8 ? 1 : 0);
      P(b, { armR: arm, armL: 40 - typing * 10, lean: 3 + 5 * sip, look: 0.5, mood: sip > 0.5 ? 'grin' : 'smile', blink: blinkAt(t) });
      if (t > 0.9 && t < 2.8) held(k, b, 1, cup, 'R', b.state.armR - b.state.lean + sip * 30); else tf(cup, 216, 205);
      lines.forEach((l, i) => l.setAttribute('width', 10 + 24 * (0.5 + 0.5 * Math.sin(t * 5 + i * 2)) * (typing ? 1 : 0.4)));
      const a = Math.PI * 2 * seg(t, 0.4, 3.0) * 0.17;
      pie.setAttribute('d', a < 0.01 ? '' : `M 350 52 L 350 28 A 24 24 0 0 1 ${(350 + 24 * Math.sin(a)).toFixed(2)} ${(52 - 24 * Math.cos(a)).toFixed(2)} Z`);
    }
  };
}
