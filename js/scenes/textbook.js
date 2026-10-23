// textbook：先生に言われて、まめが教科書を開いて10ページを出す（Please open your textbook to page ten.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk, say } from './look-over.js';
import { hp } from './dig.js';

export const meta = { duration: 3.8, beats: [[0, '閉じた本'], [1.2, 'めくる'], [2.8, '10ページ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = roomBg(k, 'home', 240);
  const tc = k.buddy({ x: 335, y: FY, scale: 0.9, facing: -1, color: pal.coral, dark: pal.coralDark });
  const bb = say(k, 80, 38, -1);
  k.text(0, 6, 'p.10', { 'font-size': 20, fill: pal.coralDark, 'text-anchor': 'middle' }, bb.g);
  const b = k.buddy({ x: 120, y: FY, scale: S });
  desk(k, 70, 230, 200);
  const bk = g({}); tf(bk, 200, 196);
  el('rect', { x: -44, y: -6, width: 88, height: 8, rx: 2, fill: pal.blueDark }, bk);
  // 右ページ
  el('rect', { x: 0, y: -10, width: 42, height: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, bk);
  const pg = k.text(22, -20, '', { 'font-size': 0 });
  const cov = g({}, bk);
  const left = g({}, cov);
  const fcover = el('rect', { x: 0, y: -12, width: 44, height: 8, rx: 2, fill: pal.blue }, left);
  const pgL = el('rect', { x: -44, y: -10, width: 44, height: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, bk);
  const num = k.text(-22, -12, '10', { 'font-size': 14, fill: pal.ink, 'text-anchor': 'middle' }, bk);
  return {
    update(t) {
      bb.show(seg(t, 0.2, 0.6) * (1 - seg(t, 2.3, 2.5)), 300, 70);
      const o = easeInOut(seg(t, 1.1, 2.5));
      const sx = Math.cos(o * Math.PI);
      tf(left, 0, 0, 0, sx, 1);
      k.set(fcover, { fill: o > 0.5 ? '#fff' : pal.blue });
      k.set(pgL, { opacity: o > 0.5 ? 1 : 0 });
      num.setAttribute('opacity', seg(t, 2.5, 2.8));
      const hx = lerp(0, 80, o);
      P(b, { armR: lerp(20, 60, easeInOut(seg(t, 0.8, 1.2))) - o * 14, armL: 20, lean: 4, look: 0.4, mood: t > 2.7 ? 'grin' : 'smile', blink: blinkAt(t) });
      P(tc, { armR: 8, armL: 8, look: 0.4, mood: 'open', blink: blinkAt(t, 1) });
    }
  };
}
