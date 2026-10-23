// sugar：友だちが砂糖つぼを差し出すが、まめは手のひらを見せて首をふり「いらない」。そのまま紅茶を飲む（例文 I don't take sugar in my tea.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { hp, reach } from './dig.js';
import { mugG, spoonG } from './flour.js';
import { cloth, mouthOf } from './spinach.js';
import { balloon } from './animal.js';

export const meta = { duration: 4.4, beats: [[0, '砂糖は？'], [1.4, 'いらない'], [2.8, 'そのまま飲む']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 150, y: 40, width: 100, height: 70, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const me = k.buddy({ x: 100, y: FY - 2, scale: S });
  const fr = k.buddy({ x: 300, y: FY - 2, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const TY = 212; cloth(k, 40, 360, TY, FY, '#F3F8EE', '#59A85F');
  const M = mugG(k, undefined, '#fff', '#C9772E');
  // 砂糖つぼ（原点＝底）
  const pot = g({});
  el('path', { d: 'M -14 -20 L 14 -20 L 12 0 L -12 0 Z', fill: '#E3F0FB', stroke: '#9FC4E8', 'stroke-width': 1.5 }, pot);
  el('ellipse', { cx: 0, cy: -20, rx: 14, ry: 3.5, fill: '#fff', stroke: '#9FC4E8', 'stroke-width': 1.5 }, pot);
  [[-6, -24], [2, -25], [8, -23]].forEach(([x, y]) => el('rect', { x: x - 3, y: y - 3, width: 6, height: 6, rx: 1, fill: '#fff', stroke: '#C9DCEF' }, pot));
  k.text(0, -9, 'SUGAR', { 'font-size': 6, fill: pal.blueDark }, pot);
  const steam = [0, 1].map(() => el('path', { d: 'M 0 0 q -4 -6 0 -12 q 4 -6 0 -12', stroke: '#fff', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }));
  const q = balloon(k, 46, 36, 1); k.text(0, 1, '?', { 'font-size': 22, fill: pal.coralDark }, q.c);
  const no = balloon(k, 44, 36, -1); el('path', { d: 'M -8 -8 L 8 8 M 8 -8 L -8 8', stroke: pal.red, 'stroke-width': 4, 'stroke-linecap': 'round' }, no.c);
  return {
    update(t) {
      const off = easeInOut(seg(t, 0.2, 0.8)) * (1 - easeInOut(seg(t, 2.2, 2.7)));
      P(fr, { x: 300, y: FY - 2, facing: -1, look: 0.6, mood: t > 0.3 && t < 1.2 && Math.sin(t * 20) > 0 ? 'open' : 'smile', blink: blinkAt(t, 1), lean: 4 * off });
      fr.pose({ armR: lerp(30, reach(fr, S, 'R', 220, TY - 40), off) });
      const hf = hp(fr, S, 'R', 28);
      tf(pot, lerp(270, hf.x - 4, off), lerp(TY, hf.y + 14, off));
      q.show(seg(t, 0.5, 0.8) * (1 - seg(t, 1.5, 1.7)), 280, FY - 108);
      // 首をふる＋手のひら
      const shake = t > 1.3 && t < 2.3 ? Math.sin((t - 1.3) * 18) : 0;
      const palm = easeOut(seg(t, 1.3, 1.6)) * (1 - easeInOut(seg(t, 2.2, 2.5)));
      const drink = hump(seg(t, 2.8, 3.9));
      P(me, { x: 100, y: FY - 2, look: 0.6 + 0.4 * shake, mood: t > 1.3 && t < 2.4 ? 'flat' : t > 3.9 ? 'grin' : 'smile', blink: t > 3.1 && t < 3.6 ? 1 : blinkAt(t), armL: lerp(8, -110, palm) });
      no.show(seg(t, 1.4, 1.7) * (1 - seg(t, 2.3, 2.5)), 120, FY - 108);
      // 紅茶：テーブルの上 → 口へ
      const mo = mouthOf(me, S), rest = { x: 160, y: TY - 26 };
      me.pose({ armR: reach(me, S, 'R', lerp(rest.x, mo.x + 10, drink), lerp(rest.y, mo.y + 10, drink)) });
      const h = hp(me, S, 'R', 28);
      tf(M.g, h.x + 6, h.y + 24 * (1 - drink) + 12 * drink, -30 * drink, 1.1);
      steam.forEach((s, i) => { const p = ((t * 0.6 + i / 2) % 1); tf(s, h.x + 2 + i * 10, h.y - 4 - 14 * p); s.setAttribute('opacity', drink > 0.2 ? 0 : 0.7 * hump(p)); });
    }
  };
}
