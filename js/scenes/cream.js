// cream：友だちがミルクピッチャーを見せて「クリーム入れる？」。まめがうなずくと、コーヒーに白いクリームが注がれて色が変わる（例文 Do you want cream in your coffee?）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { hp, reach } from './dig.js';
import { mugG } from './flour.js';
import { cloth } from './spinach.js';
import { pourFrom } from './oil.js';
import { balloon } from './animal.js';

export function pitcherG(k, parent, col = '#fff') {
  const g = k.g({}, parent);
  k.el('path', { d: 'M -8 -12 Q -10 0 -6 4 L 6 4 Q 10 0 8 -12 L 12 -16 L -8 -16 Z', fill: col, stroke: '#D9DFE7', 'stroke-width': 1.5 }, g);
  k.el('path', { d: 'M -8 -10 q -7 2 -5 8 q 2 3 5 2', stroke: '#D9DFE7', 'stroke-width': 2.4, fill: 'none' }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, 'クリームは？'], [1.4, 'うん！'], [2.2, 'コーヒーに入れる']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#F6EDE2' });
  el('rect', { x: 150, y: 40, width: 100, height: 70, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const me = k.buddy({ x: 100, y: FY - 2, scale: S });
  const fr = k.buddy({ x: 300, y: FY - 2, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const TY = 212; cloth(k, 40, 360, TY, FY, '#FFF7EC', '#C98A5A');
  const M = mugG(k, undefined, '#fff', '#6B3F2A'); tf(M.g, 186, TY, 0, 1.3);
  const swirl = el('path', { d: 'M -8 0 q 4 -3 8 0 q 4 3 8 0', stroke: '#fff', 'stroke-width': 2, fill: 'none' });
  const steam = [0, 1].map(() => el('path', { d: 'M 0 0 q -4 -6 0 -12 q 4 -6 0 -12', stroke: '#fff', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }));
  const pc = pitcherG(k);
  const stream = el('path', { stroke: '#FFFDF6', 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' });
  const q = balloon(k, 58, 40, 1); const ic = pitcherG(k, q.c); tf(ic, -8, 6, 0, 0.9); k.text(14, 0, '?', { 'font-size': 20, fill: pal.coralDark }, q.c);
  const y = balloon(k, 40, 32, -1); k.text(0, 1, 'YES', { 'font-size': 11, fill: pal.mintDark }, y.c);
  const c0 = [0x6B, 0x3F, 0x2A], c1 = [0xC8, 0x9A, 0x6E];
  return {
    update(t) {
      const show = easeOut(seg(t, 0.2, 0.6)), go = easeInOut(seg(t, 1.8, 2.3)) * (1 - easeInOut(seg(t, 3.5, 3.9))), tilt = easeInOut(seg(t, 2.3, 2.6)) * (1 - easeInOut(seg(t, 3.2, 3.5)));
      P(fr, { x: 300, y: FY - 2, facing: -1, look: 0.6, mood: t < 1.3 && t > 0.3 && Math.sin(t * 20) > 0 ? 'open' : 'smile', blink: blinkAt(t, 1), lean: 4 * go });
      fr.pose({ armR: lerp(lerp(8, 60, show), reach(fr, S, 'R', 206, TY - 58), go) });
      const h = hp(fr, S, 'R', 28), rot = -100 * tilt;
      tf(pc, h.x, h.y + 6, rot, S * 1.1);
      const m = pourFrom({ x: h.x, y: h.y + 6 }, rot, { x: -12, y: -16 }, S * 1.1);
      const pouring = tilt > 0.85;
      k.set(stream, { d: `M ${m.x} ${m.y} Q ${m.x - 2} ${(m.y + TY - 30) / 2} ${190} ${TY - 30}`, opacity: pouring ? 1 : 0 });
      const mix = easeInOut(seg(t, 2.6, 3.6));
      const col = '#' + c0.map((v, i) => Math.round(lerp(v, c1[i], mix)).toString(16).padStart(2, '0')).join('');
      M.liq.setAttribute('fill', col);
      tf(swirl, 186, TY - 30, (t * 120) % 360, 0.9); swirl.setAttribute('opacity', mix > 0.05 && mix < 0.95 ? 0.9 : 0);
      steam.forEach((s, i) => { const p = ((t * 0.6 + i / 2) % 1); tf(s, 180 + i * 12, TY - 38 - 14 * p); s.setAttribute('opacity', 0.7 * hump(p)); });
      q.show(seg(t, 0.4, 0.7) * (1 - seg(t, 1.6, 1.8)), 280, FY - 108);
      const nod = Math.sin(seg(t, 1.3, 1.9) * Math.PI * 2);
      P(me, { x: 100, y: FY - 2, look: 0.6, lean: 6 * Math.max(0, nod), mood: t > 1.3 ? 'grin' : 'smile', blink: blinkAt(t), armR: t > 3.6 ? 60 : 8 });
      y.show(seg(t, 1.4, 1.7) * (1 - seg(t, 2.4, 2.6)), 120, FY - 108);
    }
  };
}
