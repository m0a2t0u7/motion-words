// bring：明日お弁当を持ってきてと頼まれ、日付が進み、翌日お弁当を持って現れる（例文 Please bring your lunch tomorrow.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { gait, hp } from './dig.js';

export const meta = { duration: 4.6, beats: [[0, 'お願いされる'], [1.7, '次の日'], [3.6, '持ってきた']] };

function bento(k, parent) {
  const n = k.g({}, parent);
  k.el('rect', { x: -15, y: -9, width: 30, height: 18, rx: 5, fill: k.pal.blue }, n);
  k.el('rect', { x: -15, y: -9, width: 30, height: 6, rx: 3, fill: k.pal.blueDark }, n);
  k.el('rect', { x: -2, y: -9, width: 4, height: 18, fill: '#fff', opacity: 0.7 }, n);
  return n;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  // 壁のカレンダー
  const cal = g({}); tf(cal, 60, 80);
  el('rect', { x: -44, y: -36, width: 88, height: 72, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, cal);
  el('rect', { x: -44, y: -36, width: 88, height: 14, rx: 6, fill: pal.red }, cal);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) el('rect', { x: -34 + j * 24, y: -16 + i * 17, width: 18, height: 12, rx: 3, fill: '#EEF1F5' }, cal);
  const ring = el('circle', { r: 10, fill: 'none', stroke: pal.red, 'stroke-width': 3 }, cal);
  const sun = g({}); tf(sun, 0, 0);
  const pic = el('rect', { x: 150, y: 50, width: 70, height: 46, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 0, y: FY - 4, width: 400, height: 4, fill: pal.floorEdge });
  const ask = k.buddy({ x: 130, y: FY, facing: 1, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: 290, y: FY, facing: -1 });
  // 吹き出し：お弁当
  const bb = g({});
  el('rect', { x: -28, y: -22, width: 56, height: 40, rx: 14, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, bb);
  el('path', { d: 'M -14 17 L -20 30 L -2 17 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 2, 'stroke-linejoin': 'round' }, bb);
  el('rect', { x: -20, y: -17, width: 40, height: 30, fill: '#fff' }, bb);
  const bi = bento(k, bb); tf(bi, 0, -4, 0, 1.2);
  const lunch = bento(k, g({})).parentNode;
  const mx = (t) => t < 1.5 ? lerp(290, 450, easeInOut(seg(t, 1.0, 1.5))) : lerp(450, 262, easeInOut(seg(t, 2.1, 3.5)));
  const cell = (n) => [-25 + 24 * (n % 3), -10 + 17 * Math.floor(n / 3)];
  return {
    update(t) {
      const talk = seg(t, 0.2, 0.5) * (1 - seg(t, 1.5, 1.8));
      tf(bb, 215, FY - 125 - 4 * Math.sin(t * 3), 0, easeOut(seg(t, 0.2, 0.6)) * (1 - seg(t, 1.5, 1.8)) + 0.001);
      ask.pose({ armR: lerp(8, 90, seg(t, 0.3, 0.7)) * (1 - seg(t, 3.3, 3.7)) + 8, mood: t > 3.5 ? 'grin' : 'open', look: 0.3, lean: 3 * talk });
      const a = gait(mx, t, 290, 14);
      const back = t > 1.8;
      me.pose({ x: a.x, walk: a.walk, armL: back ? 8 : a.armL, armR: back ? lerp(a.armR, 70, seg(t, 3.0, 3.6)) : a.armR, lean: a.lean, facing: back ? -1 : (t < 1.0 ? -1 : 1), mood: t > 3.6 ? 'grin' : 'smile', look: -0.3 });
      if (t >= 1.0 && t < 1.8) me.pose({ facing: 1 });
      // カレンダー：丸が今日から明日へ
      const [x0, y0] = cell(4), [x1, y1] = cell(5), p = easeInOut(seg(t, 1.6, 2.1));
      tf(ring, lerp(x0, x1, p) + 9, lerp(y0, y1, p) + 6, 0, 1 + 0.25 * hump(p));
      // 手に持つお弁当（戻ってきた後）
      const hr = hp(me, 1, 'R', 24), carry = t > 2.0 ? 1 : 0;
      tf(lunch, hr.x, hr.y + 8, 0, carry ? 1 : 0.001);
    }
  };
}
