// elevator：まめがボタンを押し、二人でエレベーターに乗ると、表示が1から5へ上がる（例文 Let's take the elevator to the fifth floor.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { gait, reach } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { say } from './look-over.js';

export const meta = { duration: 4.6, beats: [[0, 'ボタンを押す'], [1.7, '乗りこむ'], [3.2, '5階へ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: 240, fill: '#ECEFF3' });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#DCE1E8' });
  const L = 150, R = 260, TOP = FY - 156;
  // 外枠・中
  el('rect', { x: L - 12, y: TOP - 12, width: R - L + 24, height: FY - TOP + 12, rx: 4, fill: '#B8C1CE' });
  el('rect', { x: L, y: TOP, width: R - L, height: FY - TOP, fill: '#5C6678' });
  el('rect', { x: L, y: TOP, width: R - L, height: 10, fill: '#FFF3C4', opacity: 0.5 });
  el('rect', { x: L + 6, y: FY - 70, width: R - L - 12, height: 4, rx: 2, fill: '#8C96A8' });
  // 表示板
  el('rect', { x: 175, y: TOP - 40, width: 60, height: 24, rx: 5, fill: pal.ink });
  const arrow = el('path', { d: 'M 192 -12 L 199 -20 L 206 -12 Z', fill: pal.green, transform: `translate(0 ${TOP - 8})` });
  const nums = [1, 2, 3, 4, 5].map((n) => k.text(220, TOP - 27, String(n), { 'font-size': 18, fill: '#FFCF5C' }));
  // ボタン
  el('rect', { x: 112, y: FY - 112, width: 18, height: 30, rx: 4, fill: '#C9D1DC' });
  const btn = el('circle', { cx: 121, cy: FY - 97, r: 6, fill: '#fff', stroke: pal.sub, 'stroke-width': 1.5 });
  const S = 0.76;
  const fr = k.buddy({ x: -60, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: -20, y: FY, scale: S });
  // ドア（外枠の中だけに見える）
  const cp = k.clip((c) => el('rect', { x: L, y: TOP, width: R - L, height: FY - TOP }, c));
  const doors = g({ 'clip-path': cp });
  const dL = el('rect', { x: 0, y: TOP, width: (R - L) / 2, height: FY - TOP, fill: '#C9D1DC', stroke: '#AEB8C6', 'stroke-width': 2 }, doors);
  const dR = el('rect', { x: 0, y: TOP, width: (R - L) / 2, height: FY - TOP, fill: '#C9D1DC', stroke: '#AEB8C6', 'stroke-width': 2 }, doors);
  const bub = say(k, 52, 32, -1);
  k.text(0, 1, '5F', { 'font-size': 16, fill: pal.ink }, bub.g);
  const mx = (t) => t < 1.8 ? lerp(-20, 92, easeInOut(seg(t, 0, 1.0))) : lerp(92, 220, easeInOut(seg(t, 1.8, 2.7)));
  const fx = (t) => t < 1.8 ? lerp(-60, 50, easeInOut(seg(t, 0.1, 1.1))) : lerp(50, 184, easeInOut(seg(t, 1.9, 2.8)));
  return {
    update(t) {
      const open = easeInOut(seg(t, 1.3, 1.8)) * (1 - easeInOut(seg(t, 2.9, 3.4)));
      const hw = (R - L) / 2;
      k.set(dL, { x: L - hw * open * 0.95 }); k.set(dR, { x: L + hw + hw * open * 0.95 });
      const w = gait(mx, t, -20), f = gait(fx, t, -60);
      const inside = t > 2.75;
      const push = hump(seg(t, 1.0, 1.4));
      P(me, { x: w.x, walk: w.walk, armL: w.armL, armR: w.armR, lean: w.lean, facing: inside ? -1 : 1, look: 0.4, mood: t > 1.8 ? 'grin' : 'smile', blink: blinkAt(t) });
      if (push > 0) me.pose({ armL: 8, facing: -1, armR: lerp(8, reach(me, S, 'R', 121, FY - 97), Math.min(1, push * 1.6)) });
      P(fr, { x: f.x, walk: f.walk, armL: f.armL, armR: f.armR, lean: f.lean, facing: inside ? 1 : 1, look: inside ? 0.3 : 0.5, blink: blinkAt(t, 1) });
      [me.g, fr.g].forEach((n) => n.setAttribute('opacity', t > 3.3 ? 0 : 1));
      btn.setAttribute('fill', t > 1.2 && t < 2.9 ? '#FFCF5C' : '#fff');
      bub.show(seg(t, 0.3, 0.6) * (1 - seg(t, 1.1, 1.3)), 120, FY - 110);
      // 1 → 5
      const fl = t < 3.4 ? 1 : 1 + Math.min(4, Math.floor(seg(t, 3.4, 4.4) * 4.999));
      nums.forEach((n, i) => n.setAttribute('opacity', i + 1 === fl ? 1 : 0));
      arrow.setAttribute('opacity', t > 3.4 && t < 4.45 && Math.sin(t * 12) > -0.3 ? 1 : 0);
    }
  };
}
