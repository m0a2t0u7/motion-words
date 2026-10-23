// technical：ショーの最中の技術的なトラブル。舞台の大画面が映像から砂嵐と警告マークに変わり、まめが困る（例文 We had a technical problem during the show.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';

export const meta = { duration: 4.0, beats: [[0, 'ショーの最中'], [1.4, '画面が乱れる'], [2.6, 'トラブル発生']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'evening' });
  el('rect', { x: 0, y: FY - 10, width: 400, height: 20, fill: pal.wood });
  [[0, 1], [330, -1]].forEach(([x]) => { el('path', { d: `M ${x} 0 L ${x + 70} 0 Q ${x + 40} 120 ${x + 70} ${FY - 10} L ${x} ${FY - 10} Z`, fill: pal.red }); });
  el('rect', { x: 100, y: 34, width: 200, height: 118, rx: 8, fill: pal.ink });
  const pic = g({});
  el('rect', { x: 108, y: 42, width: 184, height: 102, rx: 4, fill: '#7FC4F2' }, pic);
  el('circle', { cx: 250, cy: 76, r: 14, fill: pal.yellow }, pic);
  el('path', { d: 'M 108 144 L 160 92 L 200 130 L 230 106 L 292 144 Z', fill: '#7FD3A0' }, pic);
  const noise = g({});
  for (let i = 0; i < 8; i++) el('rect', { x: 108, y: 42 + i * 13, width: 184, height: 13, fill: i % 2 ? '#555' : '#999' }, noise);
  const warn = g({}); tf(warn, 200, 93);
  el('path', { d: 'M 0 -32 L 34 26 L -34 26 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 4, 'stroke-linejoin': 'round' }, warn);
  k.text(0, 20, '!', { 'font-size': 36, 'font-weight': 800, fill: pal.ink, 'text-anchor': 'middle' }, warn);
  const b = k.buddy({ x: 200, y: FY, scale: 0.95 });
  const bars = noise.children;
  return {
    update(t) {
      const e = seg(t, 1.4, 1.6), fl = t > 1.4 && t < 2.4 ? 1 : 0;
      noise.setAttribute('opacity', e);
      for (let i = 0; i < bars.length; i++) k.set(bars[i], { fill: Math.floor(t * 12 + i) % 2 ? '#555' : '#B5B5B5' });
      pic.setAttribute('opacity', 1 - e);
      tf(warn, 200, 93, 0, backOut(seg(t, 2.2, 2.7)) * (t > 2.2 ? 1 : 0));
      const sc = seg(t, 2.4, 2.9);
      P(b, { x: 200 + 70 * easeInOut(seg(t, 0.2, 1.2)) * 0, armR: lerp(10, 150, sc), armL: 8, lean: -3 * sc, mood: t > 2.4 ? 'sad' : 'smile', look: lerp(0.1, 0, sc) + (t > 1.4 ? 0 : 0), blink: blinkAt(t) });
    }
  };
}
