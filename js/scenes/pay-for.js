// pay for：カフェのレジで、友だちが財布を出す前に、まめが2人分のコーヒー代を払う（例文 I'll pay for the coffee today.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt, coin, star } from './run-after.js';
import { reach, hp, heart } from './weigh.js';
import { room } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, 'コーヒー2つ'], [1.4, 'まめが払う'], [3.2, 'ごちそう']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const R = room(k, 'indoor');
  // メニュー板
  el('rect', { x: 250, y: 36, width: 120, height: 64, rx: 6, fill: '#3E4A5E' });
  [0, 1, 2].forEach((i) => { el('rect', { x: 262, y: 50 + i * 15, width: 60, height: 5, rx: 2, fill: '#fff', opacity: 0.7 }); el('circle', { cx: 350, cy: 52 + i * 15, r: 3, fill: pal.yellow }); });
  const S = 0.85;
  const staff = k.buddy({ x: 330, y: R.TY + 30, scale: S, facing: -1, color: pal.blue, dark: pal.blueDark });
  R.front();
  // レジとコーヒー2つ
  el('rect', { x: 240, y: 168, width: 44, height: 28, rx: 4, fill: '#5A6480' }); el('rect', { x: 246, y: 172, width: 32, height: 10, rx: 2, fill: '#9FE8C9' });
  const tray = el('rect', { x: 226, y: 192, width: 30, height: 4, rx: 2, fill: '#8F9BB0' });
  [190, 208].forEach((x) => { el('path', { d: `M ${x - 7} 180 L ${x + 7} 180 L ${x + 5} 196 L ${x - 5} 196 Z`, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }); el('rect', { x: x - 7, y: 177, width: 14, height: 4, rx: 2, fill: pal.coffee }); });
  const a = k.buddy({ x: 120, y: 236, scale: S });
  const f = k.buddy({ x: 50, y: 236, scale: S * 0.95, color: pal.coral, dark: pal.coralDark });
  const wallet = g({}); el('rect', { x: -9, y: -6, width: 18, height: 12, rx: 3, fill: pal.violet }, wallet);
  const cn = coin(k);
  const hz = g({}); heart(k, hz);
  const sp = [0, 1].map(() => star(k));
  return {
    update(t) {
      // 友だちが財布を出しかける→まめが手で制して、自分の硬貨をトレーへ
      const fw = easeInOut(seg(t, 0.3, 0.8)) * (1 - easeInOut(seg(t, 1.4, 1.8)));
      P(f, { x: 50, facing: 1, armR: lerp(8, 70, fw), look: 0.6, mood: t > 3.0 ? 'grin' : t > 1.2 ? 'open' : 'smile', blink: blinkAt(t, 1) });
      const hf = hp(f, S * 0.95, 'R');
      tf(wallet, hf.x + 4, hf.y - 2); wallet.setAttribute('opacity', fw > 0.05 ? 1 : 0);
      const stopL = easeInOut(seg(t, 0.9, 1.2)) * (1 - easeInOut(seg(t, 1.6, 1.9)));
      const pay = easeInOut(seg(t, 1.8, 2.4)), back = easeInOut(seg(t, 2.7, 3.1));
      P(a, { x: 120, facing: 1, armR: 30, lean: 4 * pay, look: 0.6, mood: t > 2.6 ? 'grin' : 'smile', blink: blinkAt(t) });
      const r = reach(a, S, 'R', 238, 186);
      P(a, { x: 120, facing: 1, armR: lerp(lerp(10, 30, seg(t, 1.2, 1.6)), r, pay) * (1 - back) + 12 * back, armL: lerp(8, 90, stopL), lean: 4 * pay * (1 - back), look: stopL > 0.3 ? -0.5 : 0.6, mood: t > 2.6 ? 'grin' : 'smile', blink: blinkAt(t) });
      const h = hp(a, S, 'R');
      const drop = seg(t, 2.4, 2.6);
      const onTray = t > 2.4;
      tf(cn, onTray ? lerp(h.x, 240, drop) : h.x, onTray ? lerp(h.y - 3, 186, drop) : h.y - 3, 0, 0.8);
      cn.setAttribute('opacity', t > 1.4 ? 1 : 0);
      P(staff, { x: 330, y: R.TY + 30, facing: -1, armR: lerp(8, 30, seg(t, 2.6, 3.0)), lean: 6 * hump(seg(t, 2.7, 3.3)), look: 0.6, mood: 'smile', blink: blinkAt(t, 2) });
      const hq = seg(t, 3.1, 3.6);
      tf(hz, 50, 120 - 14 * easeOut(hq), 0, 1.4 * backOut(hq)); hz.setAttribute('opacity', hq > 0 ? 1 : 0);
      sp.forEach((s, i) => s.set(190 + i * 18, 166, seg(t, 2.7 + i * 0.12, 3.4 + i * 0.12)));
    }
  };
}
