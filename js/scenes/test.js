// test：金曜日にテストがある。カレンダーの金曜日を見て、机で単語のつづりを書く（We have a spelling test on Friday.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk } from './look-over.js';
import { hp } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, '金曜日'], [1.4, '問題が配られる'], [2.4, 'つづりを書く']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = roomBg(k, 'home', 240);
  const cal = g({}); tf(cal, 310, 80);
  el('rect', { x: -34, y: -28, width: 68, height: 60, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, cal);
  el('rect', { x: -34, y: -28, width: 68, height: 16, rx: 6, fill: pal.blue }, cal);
  k.text(0, 17, 'FRI', { 'font-size': 22, fill: pal.ink, 'text-anchor': 'middle' }, cal);
  const ring = el('circle', { cx: 0, cy: 8, r: 24, fill: 'none', stroke: pal.red, 'stroke-width': 3 }, cal);
  const b = k.buddy({ x: 140, y: FY, scale: S });
  desk(k, 90, 200, 200);
  const sh = g({});
  el('rect', { x: -30, y: -3, width: 60, height: 6, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, sh);
  const wr = k.text(212, 193, '', { 'font-size': 16, fill: pal.ink, 'text-anchor': 'start' });
  k.text(190, 193, '1.', { 'font-size': 13, fill: pal.sub, 'text-anchor': 'start' });
  const pn = g({});
  el('line', { x1: 0, y1: 0, x2: -18, y2: -5, stroke: pal.yellowDark, 'stroke-width': 4, 'stroke-linecap': 'round' }, pn);
  return {
    update(t) {
      ring.setAttribute('stroke-dasharray', `${(150 * easeInOut(seg(t, 0.2, 1.0))).toFixed(1)} 200`);
      const sl = easeInOut(seg(t, 1.2, 1.9));
      tf(sh, lerp(260, 215, sl), lerp(180, 196, sl));
      sh.setAttribute('opacity', seg(t, 1.2, 1.4));
      const n = Math.floor(seg(t, 2.4, 3.8) * 5);
      wr.textContent = 'apple'.slice(0, n);
      const writing = t > 2.4 && t < 3.9;
      P(b, { armR: lerp(20, 58, easeInOut(seg(t, 1.7, 2.4))) + (writing ? Math.sin(t * 15) * 5 : 0), armL: 20, lean: 5, look: t < 1.2 ? 0.8 : 0.1, mood: 'flat', blink: blinkAt(t) });
      const h = hp(b, S, 'R');
      tf(pn, h.x + 2, h.y + 2, 20);
    }
  };
}
