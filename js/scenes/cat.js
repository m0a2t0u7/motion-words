// cat：ソファの上で猫が丸くなってすやすや眠っている。まめがそっと近づいて「しーっ」とする（例文 The cat is sleeping on the sofa.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo, sofa } from './run-after.js';
import { cat } from './in-general.js';
import { roomBg } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, 'ソファの上'], [1.2, 'そっと近づく'], [2.8, '猫が寝ている']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'home', 240);
  el('ellipse', { cx: 200, cy: FY + 14, rx: 150, ry: 12, fill: '#F1D9CF' });
  const so = sofa(k, 250, FY, 170, '#7FB3E8', '#5C93CF');
  so.front();
  el('rect', { x: 300, y: FY - 56, width: 30, height: 24, rx: 8, fill: '#FFCF5C', transform: `rotate(-12 315 ${FY - 44})` });
  const c = cat(k, '#F2B880', '#C98B4F');
  const zs = [0, 1, 2].map((i) => k.text(0, 0, 'z', { 'font-size': 12 + i * 4, fill: pal.sub }));
  const me = k.buddy({ x: 40, y: FY, scale: S });
  const xf = (t) => lerp(40, 120, easeInOut(seg(t, 0.8, 2.2)));
  return {
    update(t) {
      const br = 0.5 + 0.5 * Math.sin(t * 2.6);
      c.set(240, FY - 34, br, 0, 1.05);
      zs.forEach((z, i) => { const p = ((t * 0.5 + i / 3) % 1); tf(z, 228 - 10 * p + i * 4, FY - 66 - 40 * p); z.setAttribute('opacity', hump(p)); });
      const w = walkTo(xf, t, 40), tip = w.m;
      const sh = easeInOut(seg(t, 2.6, 3.0));
      P(me, { x: w.x, walk: w.walk * 0.7, armL: w.armL, armR: lerp(w.armR, 168, sh), lean: w.lean + 6 * tip + 4 * sh, lift: 4 * tip, look: 0.8, mood: sh > 0.5 ? 'flat' : 'smile', blink: blinkAt(t) });
    }
  };
}
