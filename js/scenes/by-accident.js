// by accident：自販機で青いボタンを押そうとした瞬間くしゃみで手がすべり、隣の赤いボタンを押してしまう→違う飲み物が出る（I pressed the wrong button by accident.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, clamp, backOut, wobble } from '../ease.js';
import { reach, hp } from './dig.js';
import { P, blinkAt, mark } from './so-far-so-good.js';

export const meta = { duration: 4.2, beats: [[0, '青を押したい'], [1.4, 'くしゃみで…'], [2.4, '赤を押した']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY, width: 400, height: 10, fill: '#E3E8EE' });
  k.shadow(280, FY + 1, 60, 5);
  el('rect', { x: 226, y: 50, width: 110, height: FY - 50, rx: 8, fill: '#E9EEF4', stroke: '#C4CCD8', 'stroke-width': 4 });
  el('rect', { x: 238, y: 64, width: 60, height: 80, rx: 4, fill: '#CFE9F7' });
  [[250, pal.blue], [270, pal.red], [250, pal.blue], [270, pal.red]].forEach(([x, c], i) => el('rect', { x: x - 6 + (i > 1 ? 18 : 0), y: i % 2 ? 104 : 74, width: 12, height: 22, rx: 3, fill: i % 2 ? pal.red : pal.blue }));
  const BB = [240, 160], BR = [240, 184];
  const bB = el('circle', { cx: BB[0], cy: BB[1], r: 7, fill: pal.blue, stroke: '#fff', 'stroke-width': 2 });
  const bR = el('circle', { cx: BR[0], cy: BR[1], r: 7, fill: pal.red, stroke: '#fff', 'stroke-width': 2 });
  el('rect', { x: 240, y: 200, width: 70, height: 22, rx: 4, fill: '#56607A' });
  const can = el('rect', { x: -7, y: -11, width: 14, height: 22, rx: 3, fill: pal.red });
  const G = k.buddy({ x: 196, y: FY });
  const bang = mark(k, 'bang');
  const puff = [0, 1, 2].map(() => el('circle', { r: 4, fill: '#DDE4EC' }));
  return {
    update(t) {
      const SN = 1.5;
      const sneeze = hump(seg(t, SN - 0.25, SN + 0.25));
      P(G, { facing: 1, look: 0.6, lean: t < SN ? -6 * seg(t, 1.0, SN) : 12 * hump(seg(t, SN, SN + 0.4)), squash: 1 - 0.06 * sneeze,
        mood: t < 1.0 ? 'smile' : t < SN ? 'open' : t < 2.3 ? 'flat' : 'open', blink: t > 1.1 && t < SN + 0.15 ? 0.8 : blinkAt(t), armL: 8 });
      const toB = easeInOut(seg(t, 0.3, 1.0));
      const slip = easeOut(seg(t, SN, SN + 0.15));
      const tx = BB[0], ty = lerp(BB[1], BR[1], slip);
      const a = reach(G, 1, 'R', tx, ty);
      const press = t > SN ? 1 - 0.0 * seg(t, 2.0, 2.4) : toB * 0.92;
      G.pose({ armR: t > 2.1 ? lerp(a, 8, easeInOut(seg(t, 2.1, 2.5))) : lerp(8, a, t > SN ? 1 : press) });
      bR.setAttribute('r', t > SN + 0.1 && t < SN + 0.4 ? 5.5 : 7);
      const df = seg(t, 2.0, 2.4);
      tf(can, 274, lerp(150, 212, easeIn(df)) - 6 * Math.abs(wobble(seg(t, 2.4, 3.0), 1.5, 4)), df * 90);
      can.setAttribute('opacity', df > 0 ? 1 : 0);
      puff.forEach((p, i) => { const q = seg(t, SN, SN + 0.5); tf(p, 206 + i * 12 + 20 * q, 160 - i * 4 - 10 * q, 0, 1 + q); p.setAttribute('opacity', q > 0 && q < 1 ? 1 - q : 0); });
      tf(bang, 176, 116, 0, Math.max(0.001, backOut(seg(t, 2.5, 2.8))));
    }
  };
}
