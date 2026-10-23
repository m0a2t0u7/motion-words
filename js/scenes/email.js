// email：朝、パソコンで送信を押すとメールが相手の画面に届く（例文 I sent you an email this morning.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, desk } from './look-over.js';
import { hp, held, reach } from './dig.js';
function pz(b, S, o, R, L) { P(b, o); const a = {}; if (R) a.armR = reach(b, S, 'R', R[0], R[1]); if (L) a.armL = reach(b, S, 'L', L[0], L[1]); P(b, { ...o, ...a }); }

export const meta = { duration: 4.0, beats: [[0, '書き終えた'], [1.0, '送信'], [2.8, '相手に届いた']] };

function envelope(k, parent) {
  const e = k.g({}, parent);
  k.el('rect', { x: -14, y: -9, width: 28, height: 18, rx: 3, fill: '#fff', stroke: k.pal.blueDark, 'stroke-width': 2 }, e);
  k.el('path', { d: 'M -14 -8 L 0 3 L 14 -8', fill: 'none', stroke: k.pal.blueDark, 'stroke-width': 2, 'stroke-linejoin': 'round' }, e);
  return e;
}
export function create(k) {
  const { el, g, pal } = k;
  const FY = roomBg(k, 'home', 240, 'indoor');
  el('circle', { cx: 62, cy: 70, r: 11, fill: pal.yellow }); // 朝の太陽（窓の中）
  el('rect', { x: 40, y: 46, width: 84, height: 70, rx: 8, fill: 'none', stroke: '#fff', 'stroke-width': 5 });
  const S = 1.05;
  const b = k.buddy({ x: 135, y: FY, scale: S });
  const c = k.buddy({ x: 330, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  desk(k, 120, 90, 200);
  el('path', { d: 'M 136 200 L 142 168 H 188 L 194 200 Z', fill: '#3A4456' });
  el('rect', { x: 145, y: 171, width: 40, height: 26, fill: '#F7F9FC' });
  const btn = el('rect', { x: 150, y: 184, width: 30, height: 9, rx: 4.5, fill: pal.blue });
  desk(k, 265, 90, 200);
  el('rect', { x: 290, y: 162, width: 40, height: 32, rx: 4, fill: '#3A4456' });
  el('rect', { x: 293, y: 165, width: 34, height: 26, fill: '#F7F9FC' });
  const badge = el('circle', { cx: 327, cy: 165, r: 7, fill: pal.red });
  const env = envelope(k);
  const ping = k.text(327, 168.5, '1', { 'font-size': 10, fill: '#fff' });
  return {
    update(t) {
      const press = hump(seg(t, 0.9, 1.3));
      k.set(btn, { fill: press > 0.1 ? pal.blueDark : pal.blue });
      pz(b, S, { x: 135, facing: 1, lean: 8, look: 1, blink: blinkAt(t), mood: t > 1.4 ? 'grin' : 'smile' }, [165, 188 - 4 * press], null);
      // 封筒：送信後に画面から飛んで相手の画面へ
      const p = seg(t, 1.2, 2.7), q = easeInOut(p);
      const x = lerp(165, 310, q), y = lerp(176, 178, q) - Math.sin(q * Math.PI) * 60;
      env.setAttribute('opacity', p > 0 && p < 1 ? 1 : 0);
      k.tf(env, x, y, (q - 0.5) * 20, lerp(0.5, 1, hump(q)) + 0.3, lerp(0.5, 1, hump(q)) + 0.3);
      const arr = seg(t, 2.7, 3.0);
      k.tf(badge, 0, 0, 0, 1 + 0.4 * hump(arr), 1 + 0.4 * hump(arr)); badge.setAttribute('opacity', arr > 0 ? 1 : 0);
      ping.setAttribute('opacity', arr > 0 ? 1 : 0);
      pz(c, S, { x: 330, facing: -1, lean: 0, look: -1, blink: blinkAt(t, 1), mood: arr > 0.5 ? 'open' : 'smile' }, arr > 0.3 ? [310, 188] : null, null);
    }
  };
}
