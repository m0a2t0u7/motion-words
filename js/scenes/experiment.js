// experiment：私たち（まめと友だち）が水と塩で実験。ビーカーの水に塩を入れて溶かす（We did an experiment with water and salt.）
import { seg, lerp, easeInOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk } from './look-over.js';
import { hp } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '水のビーカー'], [1.2, '塩を入れる'], [3.2, '塩が溶ける']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = roomBg(k, 'home', 240);
  const fr = k.buddy({ x: 330, y: FY, scale: 0.9, facing: -1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 120, y: FY, scale: S });
  desk(k, 70, 320, 200);
  // ビーカー（机の上、x=225）
  const bk = g({}); tf(bk, 225, 197);
  const cp = k.clip((c) => el('path', { d: 'M -22 -50 L -20 -2 Q -20 0 -17 0 L 17 0 Q 20 0 20 -2 L 22 -50 Z' }, c));
  const wg = g({ 'clip-path': cp }, bk);
  el('rect', { x: -24, y: -34, width: 48, height: 36, fill: pal.water, opacity: 0.8 }, wg);
  const salt = el('ellipse', { cx: 0, cy: -3, rx: 12, ry: 3, fill: '#fff' }, wg);
  const sw = [0, 1, 2, 3, 4].map(() => el('circle', { r: 1.6, fill: '#fff' }, wg));
  el('path', { d: 'M -22 -50 L -20 -2 Q -20 0 -17 0 L 17 0 Q 20 0 20 -2 L 22 -50', fill: 'none', stroke: pal.blueDark, 'stroke-width': 2.5 }, bk);
  // 塩の容器（手に持つ）
  const jar = g({});
  el('rect', { x: -9, y: -20, width: 18, height: 22, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, jar);
  el('rect', { x: -9, y: -24, width: 18, height: 6, rx: 2, fill: pal.sub }, jar);
  const gr = [0, 1, 2, 3].map(() => el('circle', { r: 1.8, fill: '#fff', stroke: pal.line, 'stroke-width': 0.8 }));
  const nt = g({}); tf(nt, 290, 196);
  el('rect', { x: -22, y: -3, width: 44, height: 6, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, nt);
  return {
    update(t) {
      const lift = easeInOut(seg(t, 0.5, 1.3)), pour = hump(seg(t, 1.3, 3.2)), back = easeInOut(seg(t, 3.0, 3.8));
      const tilt = pour * 100;
      P(b, { armR: lerp(lerp(20, 105, lift), 20, back), armL: 14, lean: 4 + pour * 4, look: 0.6, mood: t > 3.2 ? 'grin' : 'smile', blink: blinkAt(t) });
      const h = hp(b, S, 'R');
      tf(jar, h.x, h.y + 4, tilt - 6);
      jar.setAttribute('opacity', 1);
      // 塩の粒（tから決まる）
      gr.forEach((c, i) => {
        const u = ((t - 1.6) * 1.4 + i / 4) % 1, on = t > 1.7 && t < 3.0 ? 1 : 0;
        k.set(c, { cx: h.x + 14 + (225 - h.x - 14) * u * 0.8, cy: h.y + 8 + (180 - h.y) * u * u, opacity: on });
      });
      const dis = seg(t, 2.2, 3.8);
      k.set(salt, { ry: 3 * (1 - dis), opacity: 1 - dis });
      sw.forEach((c, i) => k.set(c, { cx: -10 + i * 5, cy: -6 - ((t * 10 + i * 7) % 22) * dis * 0.6 - dis * 6, opacity: dis * (1 - seg(t, 3.8, 4.4)) }));
      P(fr, { armR: 8, armL: lerp(8, 70, hump(seg(t, 1.2, 3.4))), look: 0.5, mood: 'open', blink: blinkAt(t, 1) });
    }
  };
}
