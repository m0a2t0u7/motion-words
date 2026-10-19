// crosswalk：まめは横断歩道まで歩き、信号が青なのを見て左右を確かめてから、しま模様の上を渡る（例文 Always use the crosswalk.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt, walkTo, face } from './bag.js';
import { car } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, '横断歩道へ'], [1.5, '左右を見る'], [2.4, '横断歩道を渡る']] };

export function create(k) {
  const { el, tf, pal } = k;
  k.backdrop({ floorY: 300 });
  el('rect', { x: 0, y: 0, width: 400, height: 110, fill: '#EAF4FB' });
  [[20, 60, '#F3E6DC'], [110, 40, '#E4EEF7'], [260, 50, '#FCE6D6'], [330, 30, '#E6F1E8']].forEach(([x, h, c]) => el('rect', { x, y: 110 - h - 20, width: 70, height: h + 20, rx: 3, fill: c }));
  el('rect', { x: 0, y: 110, width: 400, height: 40, fill: '#E3E8EE' });
  el('rect', { x: 0, y: 150, width: 400, height: 90, fill: '#AEB7C4' });
  el('rect', { x: 0, y: 240, width: 400, height: 60, fill: '#E3E8EE' });
  // 横断歩道（しま）
  for (let i = 0; i < 6; i++) el('rect', { x: 210, y: 156 + i * 14, width: 70, height: 8, fill: '#fff' });
  // 歩行者信号
  el('rect', { x: 296, y: 200, width: 4, height: 60, fill: pal.sub });
  el('rect', { x: 288, y: 176, width: 20, height: 34, rx: 3, fill: pal.ink });
  el('circle', { cx: 298, cy: 185, r: 5, fill: '#5A3030' });
  const green = el('circle', { cx: 298, cy: 200, r: 5, fill: pal.green });
  // 止まって待つ車
  const cr = car(k, pal.yellow, pal.yellowDark); cr.set(110, 0, 196);
  const b = k.buddy({ x: 40, y: 272, scale: 0.85 });
  const xf = (t) => lerp(40, 245, easeInOut(seg(t, 0, 1.5)));
  return {
    update(t) {
      const w = walkTo(xf, t, 40);
      const cross = easeInOut(seg(t, 2.4, 4.2));
      const y = lerp(272, 148, cross), sc = lerp(0.85, 0.7, cross);
      const look = t > 1.5 && t < 2.4 ? (t < 1.95 ? -1 : 1) : 0.5;
      P(b, { x: w.x, y, walk: t > 2.4 && t < 4.2 ? t * 9 : w.walk, armL: w.armL, armR: w.armR, lean: 0, look, blink: blinkAt(t), mood: t > 2.4 ? 'smile' : 'flat', facing: t > 1.5 && t < 1.95 ? -1 : 1 });
      tf(b.g, w.x, y, 0, sc);
      face(b, look * 4, 0);
      green.setAttribute('opacity', 0.6 + 0.4 * (Math.sin(t * 6) > -0.5));
      cr.set(110, 0, 196, Math.sin(t * 20) * 0.3);
    }
  };
}
