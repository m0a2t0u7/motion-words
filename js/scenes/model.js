// model：台に古い機種と新しい機種の携帯電話。新しい方を手に取って掲げる（例文 This is the newest model of the phone.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk, hp, reach } from './look-over.js';

export const meta = { duration: 3.8, beats: [[0, '2つの機種'], [1.3, '新型を持つ'], [2.6, '最新モデル']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 250, y: FY, scale: S, facing: -1 });
  desk(k, 20, 250, 200);
  // 古い機種：厚くて小さい画面
  const old = g({}); tf(old, 100, 178);
  k.shadow(100, 200, 20, 3);
  el('rect', { x: -17, y: -22, width: 34, height: 44, rx: 6, fill: '#9AA6B8' }, old);
  el('rect', { x: -12, y: -17, width: 24, height: 16, rx: 2, fill: '#CFE0D0' }, old);
  [[-7, 6], [0, 6], [7, 6], [-7, 13], [0, 13], [7, 13]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 2.4, fill: '#fff' }, old));
  const sh = g({}); tf(sh, 200, 200); k.shadow(0, 0, 14, 3, sh);
  // 新しい機種：薄くて大きい画面
  const nw = g({}); tf(nw, 200, 178);
  el('rect', { x: -13, y: -24, width: 26, height: 48, rx: 5, fill: pal.ink }, nw);
  const scr = el('rect', { x: -11, y: -21, width: 22, height: 42, rx: 3, fill: '#9FB4CC' }, nw);
  el('circle', { cx: 0, cy: -2, r: 6, fill: pal.yellow }, nw);
  const tag = g({}); el('rect', { x: -20, y: -9, width: 40, height: 18, rx: 9, fill: pal.coral }, tag);
  k.text(0, 4, 'NEW', { 'font-size': 12, fill: '#fff', 'font-weight': 700 }, tag);
  const sp = [0, 1, 2].map(() => el('path', { d: 'M 0 -6 L 1.8 -1.8 L 6 0 L 1.8 1.8 L 0 6 L -1.8 1.8 L -6 0 L -1.8 -1.8 Z', fill: pal.yellow }));
  return {
    update(t) {
      const grab = easeInOut(seg(t, 1.2, 1.7)), up = easeInOut(seg(t, 1.9, 2.6));
      const o = { x: 250, facing: -1, lean: 3, armL: 8, look: t < 1.2 ? Math.sin(t * 3) * 0.8 : 0.3, mood: up > 0.5 ? 'grin' : 'smile', blink: blinkAt(t) };
      P(b, { ...o, armR: 8 });
      const s = hp(b, S, 'R', 0);
      const a = reach(b, S, 'R', s.x - 24, lerp(182, 140, up));
      P(b, { ...o, armR: lerp(8, a, easeOut(seg(t, 0.8, 1.3))) });
      const h = hp(b, S, 'R'), hold = grab > 0.01;
      tf(nw, hold ? h.x - 3 : 200, hold ? h.y - 2 : 178);
      sh.setAttribute('opacity', hold ? 0 : 1);
      scr.setAttribute('fill', up > 0.3 ? '#BFE6FF' : '#9FB4CC');
      tf(tag, h.x - 3, h.y - 44, 0, up <= 0 ? 0.001 : backOut(seg(t, 2.4, 2.9)));
      sp.forEach((p, i) => { const u = seg(t, 2.5 + i * 0.15, 3.1 + i * 0.15); tf(p, h.x - 3 + (i - 1) * 24, h.y - 24 - (i % 2) * 14, 0, hump(u) * 1.2 + 0.001, hump(u) * 1.2 + 0.001); });
    }
  };
}
