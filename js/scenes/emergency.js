// emergency：家で人が倒れる緊急事態。まめがすぐ駆け寄り、電話で 911 にかける（例文 Call 911 right away if you are in an emergency situation.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { lie } from './surgery.js';
import { hp, gait } from './dig.js';
import { phone } from './look-over.js';
import { mark } from './so-far-so-good.js';

export const meta = { duration: 4.2, beats: [[0, '人が倒れた'], [1.2, 'すぐ電話'], [2.6, '911にかける']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 40, y: 50, width: 84, height: 62, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('rect', { x: 0, y: FY - 12, width: 400, height: 12, fill: '#ECE6DC' });
  el('ellipse', { cx: 150, cy: FY + 18, rx: 120, ry: 12, fill: '#E9D9CC' });
  const flash = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: pal.red, opacity: 0 });
  const P = lie(k, { scale: 0.86, color: pal.coral, dark: pal.coralDark });
  const fallen = g({}); // 転んだ物（湯のみ）
  el('path', { d: 'M -7 -9 L 7 -9 L 5 4 L -5 4 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, fallen);
  tf(fallen, 216, FY + 14, 80);
  const b = k.buddy({ x: 370, y: FY + 6, scale: 0.95, facing: -1 });
  const ph = phone(k);
  const bang = mark(k, 'bang', null, 1.6);
  // 電話の画面（拡大）
  const big = g({});
  el('rect', { x: -40, y: -60, width: 80, height: 120, rx: 12, fill: pal.ink }, big);
  el('rect', { x: -34, y: -50, width: 68, height: 96, rx: 6, fill: '#F4F7FB' }, big);
  const num = k.text(0, -24, '', { 'font-size': 24 }, big);
  const call = g({}, big); tf(call, 0, 20);
  el('circle', { r: 14, fill: pal.green }, call);
  el('path', { d: 'M -6 -5 Q -7 2 -1 7 L 2 5 L 0 1 L -2 2 Q -4 0 -3 -3 L -1 -4 L -3 -8 Z', fill: '#fff', transform: 'rotate(-10) scale(1.1)' }, call);
  const waves = [0, 1].map((i) => el('path', { d: `M ${18 + i * 6} -8 Q ${24 + i * 6} 0 ${18 + i * 6} 8`, fill: 'none', stroke: pal.green, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, call));
  const xf = (t) => lerp(370, 262, easeInOut(seg(t, 0.5, 1.2)));
  return {
    update(t) {
      P.set(180, FY + 2, -90);
      P.b.pose({ blink: 1, mood: 'flat', armL: 6, armR: 12 });
      flash.setAttribute('opacity', t < 2.6 ? 0.06 * Math.max(0, Math.sin(t * 8)) : 0);
      const p = gait(xf, t, 370, 26, 0.13);
      const call2 = easeInOut(seg(t, 1.3, 1.8)), kneel = easeOut(seg(t, 1.1, 1.4));
      b.pose({ x: p.x, walk: p.walk, lean: p.lean * 2 + 8 * kneel * (1 - call2), squash: 1 - 0.08 * kneel, armL: p.armL, armR: lerp(p.armR, 160, call2), mood: t < 1.3 ? 'open' : 'flat', look: t < 1.3 ? 0.6 : 0.2 });
      const h = hp(b, 0.95, 'R', 28);
      tf(ph.g, h.x, h.y - 2, 0, call2 > 0.02 ? 1.2 : 0.001);
      const bp = seg(t, 0.1, 0.4);
      tf(bang, 380, FY - 112, 0, bp <= 0 ? 0.001 : 1.6 * backOut(bp));
      bang.setAttribute('opacity', 1 - seg(t, 1.0, 1.3));
      const sp = seg(t, 1.8, 2.15);
      tf(big, 330, 104, 0, sp <= 0 ? 0.001 : backOut(sp) * 0.9);
      const n = t < 2.2 ? 0 : t < 2.5 ? 1 : t < 2.8 ? 2 : 3;
      num.textContent = '911'.slice(0, n);
      const ring = t > 3.0;
      tf(call, 0, 20, 0, ring ? 1 + 0.06 * Math.sin(t * 16) : 1);
      waves.forEach((w, i) => w.setAttribute('opacity', ring && Math.sin(t * 8 - i) > 0 ? 1 : 0));
      ph.scr.setAttribute('fill', t > 2.2 ? '#C6F0D2' : '#9FB4CC');
    }
  };
}
