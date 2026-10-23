// bear：森の小道を歩くまめと友だち。木のあいだからクマが出てくるのを、まめが双眼鏡で見つける（例文 We saw a bear in the woods.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { scene, treeG, mark } from './nature.js';
import { beast } from './animal.js';
import { hp } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '森を歩く'], [1.6, '双眼鏡で見る'], [2.8, 'クマがいた！']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const { FY } = scene(k, { FY: 230, top: '#CFE8E0', bot: '#EEF7F2', ground: '#B6D99B', edge: '#A2CB86' });
  [[30, 0.9, FY - 40], [120, 0.7, FY - 46], [380, 1.0, FY - 40]].forEach(([x, s, y]) => tf(treeG(k, s, '#5DB36F', '#4FA562').g, x, y));
  const bear = beast(k, 'bear');
  [[250, 0.95, FY - 34], [330, 0.8, FY - 40]].forEach(([x, s, y]) => tf(treeG(k, s, '#6BBF84', '#5DB36F').g, x, y));
  el('path', { d: `M 0 ${FY + 40} Q 200 ${FY + 20} 400 ${FY + 50} L 400 ${FY + 70} Q 200 ${FY + 40} 0 ${FY + 62} Z`, fill: '#D9C4A0' });
  const fr = k.buddy({ x: -60, y: FY + 50, scale: 0.85, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: -10, y: FY + 56, scale: 0.9 });
  const bino = g({}); el('rect', { x: -12, y: -7, width: 10, height: 14, rx: 3, fill: pal.ink }, bino); el('rect', { x: 2, y: -7, width: 10, height: 14, rx: 3, fill: pal.ink }, bino); el('rect', { x: -3, y: -3, width: 6, height: 5, fill: '#55607A' }, bino);
  const ex = mark(k, '!', pal.coralDark);
  const xa = (t) => lerp(-10, 130, easeInOut(seg(t, 0.1, 1.5))), xb = (t) => xa(t) - 60;
  const bx = (t) => lerp(300, 262, easeInOut(seg(t, 1.6, 3.2)));
  return {
    update(t) {
      const x = bx(t), bm = seg(t, 1.6, 3.2) > 0 && t < 3.2 ? 1 : 0;
      bear.set({ x, y: FY - 22, s: 0.9, face: -1, ph: (300 - x) * 0.2, m: bm, head: t > 3.2 ? -6 + Math.sin(t * 4) * 3 : 0 });
      const wa = walkTo(xa, t, -10), wb = walkTo(xb, t, -70), up = easeInOut(seg(t, 1.5, 2.0));
      P(fr, { x: wb.x, y: FY + 50, walk: wb.walk, armL: wb.armL, armR: wb.armR, lean: wb.lean, look: 0.8, mood: t > 2.9 ? 'open' : 'smile', blink: blinkAt(t, 1) });
      P(me, { x: wa.x, y: FY + 56, walk: wa.walk, armL: lerp(wa.armL, -140, up), armR: lerp(wa.armR, 140, up), lean: wa.lean, look: 0.8, mood: t > 2.8 ? 'open' : 'smile', blink: blinkAt(t), lift: 5 * hump(seg(t, 2.8, 3.1)) });
      // 双眼鏡は両手のあいだ（顔の前）
      const r = hp(me, 0.9, 'R', 28), l = hp(me, 0.9, 'L', 28);
      tf(bino, wa.x + 6 * 0.9, FY + 56 - 66 * 0.9, 0, 0.9); bino.setAttribute('opacity', up > 0.05 ? 1 : 0);
      ex.show(seg(t, 2.8, 3.1), wa.x, FY - 60);
    }
  };
}
