// work：父（スーツのまめ）が銀行の窓口で、お札を数えてお客さんに渡す（例文 My father works at a bank.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P } from './run-after.js';
import { hp } from './dig.js';
import { top } from './shirt.js';
import { bill } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, '銀行の窓口'], [1.2, 'お札を数える'], [2.8, 'お客さんに渡す']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9, SD = 1.05;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#EEF2F6' });
  // 銀行の看板（柱のある建物マーク＋BANK）
  const sg = g({}); tf(sg, 120, 46);
  el('rect', { x: -70, y: -22, width: 140, height: 44, rx: 8, fill: pal.blueDark }, sg);
  el('path', { d: 'M -60 -6 L -46 -15 L -32 -6 Z', fill: '#fff' }, sg);
  [-56, -49, -42, -36].forEach((x) => el('rect', { x, y: -5, width: 3, height: 12, fill: '#fff' }, sg));
  el('rect', { x: -60, y: 7, width: 28, height: 3, fill: '#fff' }, sg);
  k.text(16, 1, 'BANK', { 'font-size': 22, fill: '#fff', 'letter-spacing': 2 }, sg);
  // 金庫の扉（奥）
  el('circle', { cx: 330, cy: 92, r: 34, fill: '#C9D1DC', stroke: '#A9B3C2', 'stroke-width': 5 });
  el('circle', { cx: 330, cy: 92, r: 8, fill: '#A9B3C2' });
  const dad = k.buddy({ x: 150, y: FY, scale: SD });
  top(k, dad, 'suit', '#46536E', '#2F3A52');
  el('path', { d: 'M -10 -40 Q -5 -45 0 -41 Q 5 -45 10 -40 Q 5 -37 0 -39 Q -5 -37 -10 -40 Z', fill: '#5A3B2A' }, dad.body.children[dad.body.children.length - 1]);
  // カウンター（父の腰から下を隠す）とガラス
  el('rect', { x: 0, y: 198, width: 270, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 0, y: 206, width: 270, height: 34, fill: '#E7D2B2' });
  el('rect', { x: 250, y: 198, width: 20, height: 42, fill: pal.woodDark, opacity: 0.4 });
  el('rect', { x: 0, y: 108, width: 240, height: 5, fill: '#C9D1DC' });
  const cust = k.buddy({ x: 340, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const stack = g({}); tf(stack, 206, 198);
  for (let i = 0; i < 4; i++) { const n = bill(k, stack); tf(n, 0, -4 - i * 3, 0, 0.9); }
  const fly = [0, 1, 2].map(() => bill(k));
  const hand = g({}); const handBills = bill(k, hand);
  return {
    update(t) {
      // お札をはじいて数える（3枚）
      const cnt = t > 0.6 && t < 2.2 ? Math.sin((t - 0.6) * 12) : 0;
      const give = easeInOut(seg(t, 2.5, 3.2)), back = easeInOut(seg(t, 3.6, 4.2));
      P(dad, { x: 150, armR: lerp(60 + 8 * cnt, 92, give) - 30 * back, armL: 30, lean: 6 + 10 * give * (1 - back), look: t < 2.3 ? 0.9 : 1, mood: t > 2.6 ? 'grin' : 'flat', blink: t < 2.3 ? 0.3 : 0 });
      fly.forEach((f, i) => { const q = seg(t, 0.7 + i * 0.5, 1.1 + i * 0.5);
        tf(f, lerp(206, 232, easeOut(q)), 192 - 16 * hump(q) - i * 3, -20 * hump(q), q > 0 ? 0.9 : 0.001); });
      const h = hp(dad, SD, 'R', 30);
      const taken = t > 3.25;
      // 渡す札束：父の手 → お客さんの手
      const ch = hp(cust, S, 'R', 30);
      tf(hand, taken ? ch.x - 4 : h.x + 6, taken ? ch.y - 2 : h.y - 4, 0, t > 2.3 ? 1 : 0.001);
      fly.forEach((f) => f.setAttribute('opacity', t > 2.3 ? 0 : 1));
      const reach = easeInOut(seg(t, 2.9, 3.25)) * (1 - easeInOut(seg(t, 3.4, 3.9)));
      P(cust, { x: 340 - 62 * easeInOut(seg(t, 2.0, 2.9)), facing: -1, armR: lerp(8, 90, reach) + (taken ? 30 : 0) * (1 - reach), armL: 8, look: -0.6, mood: taken ? 'grin' : 'smile', lean: 6 * reach });
    }
  };
}
