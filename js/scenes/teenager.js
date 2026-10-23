// teenager：兄の誕生日。ケーキの数字が12→13になり、背がのびてティーンエイジャーになる（例文 My brother is a teenager now.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, wear, pops, P, blinkAt, C } from './jam.js';
import { homeBg } from './furniture.js';
import { cake } from './so-far-so-good.js';
import { backTable } from './bag.js';

export const meta = { duration: 4.6, beats: [[0, '12さい'], [1.4, '13さいに'], [3.0, 'ティーンだ']] };

export function create(k) {
  const { el, pal } = k;
  const FY = homeBg(k, { winX: 160, winW: 80 });
  // 飾り
  el('path', { d: 'M 10 30 Q 100 60 200 30 T 390 30', stroke: '#FFCF5C', 'stroke-width': 3, fill: 'none' });
  [30, 70, 110, 150, 250, 290, 330, 370].forEach((x, i) => el('path', { d: `M ${x - 8} ${36 + Math.sin(x / 32) * 8} l 8 14 l 8 -14 Z`, fill: [pal.coral, pal.blue, pal.yellow, pal.mint][i % 4] }));
  const TY = backTable(k, 250, 360, 190, FY);
  const ck = cake(k); k.tf(ck, 305, TY, 0, 1.6);
  const n12 = k.text(305, TY - 52, '12', { 'font-size': 22, fill: pal.coralDark });
  const n13 = k.text(305, TY - 52, '13', { 'font-size': 26, fill: pal.coralDark });
  const sis = k.buddy({ x: 70, y: FY, scale: 0.75, ...C(k, 'coral') });
  const bro = k.buddy({ x: 170, y: FY, scale: 0.8 });
  // ヘッドホン（ティーンらしさ）
  const hp = wear(k, bro, (g) => { el('path', { d: 'M -32 -56 Q -32 -96 0 -96 Q 32 -96 32 -56', stroke: pal.ink, 'stroke-width': 5, fill: 'none' }, g); el('rect', { x: -38, y: -66, width: 10, height: 18, rx: 4, fill: pal.violet }, g); el('rect', { x: 28, y: -66, width: 10, height: 18, rx: 4, fill: pal.violet }, g); });
  return {
    update(t) {
      const grow = easeOut(seg(t, 1.6, 2.6));
      const s = lerp(0.8, 1.2, grow);
      const up = easeOut(seg(t, 2.7, 3.1));
      P(bro, { x: 0, y: 0, look: 0.4, blink: blinkAt(t), mood: t > 2.6 ? 'grin' : 'smile', squash: 1 + 0.04 * hump(seg(t, 2.5, 2.9)), armL: lerp(10, 150, up), armR: lerp(10, 150, up) });
      bro.g.setAttribute('transform', `translate(170 ${FY}) scale(${s.toFixed(3)})`);
      hp.setAttribute('opacity', grow > 0.9 ? 1 : 0);
      n12.setAttribute('opacity', 1 - seg(t, 1.3, 1.5));
      n13.setAttribute('transform', `translate(305 ${TY - 52}) scale(${pops(seg(t, 1.4, 1.8)).toFixed(3)}) translate(-305 ${-(TY - 52)})`);
      P(sis, { look: 0.6, blink: blinkAt(t, 1), mood: t > 2.4 ? 'open' : 'smile', lean: -4 * grow, armL: 10 + 30 * grow, armR: 10 + 30 * grow });
    }
  };
}
