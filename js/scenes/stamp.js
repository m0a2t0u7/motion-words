// stamp：あて名を書いた封筒の右上に、切手シートからはがした切手を貼って押さえる（例文 I need a stamp for this letter.）
import { seg, lerp, easeInOut, hump, wobble } from '../ease.js';
import { reach, hp, P, blinkAt, face } from './bag.js';
import { studyDesk } from './notebook.js';

export function stampProp(k, parent) {
  const g = k.g({}, parent), { el, pal } = k;
  el('rect', { x: -8, y: -9, width: 16, height: 18, fill: '#fff', stroke: pal.line, 'stroke-width': 1, 'stroke-dasharray': '1.5 1' }, g);
  el('rect', { x: -6, y: -7, width: 12, height: 14, fill: '#BFE3F7' }, g);
  el('path', { d: 'M -6 7 L -1 0 L 2 3 L 4 1 L 6 7 Z', fill: pal.green }, g);
  el('circle', { cx: 3, cy: -3, r: 2, fill: pal.yellow }, g);
  return g;
}

export const meta = { duration: 4.2, beats: [[0, '切手がいる'], [1.0, '切手をはがす'], [2.4, '封筒に貼った']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.1;
  const { FY, top, SX, SY, SW } = studyDesk(k, { SX: 196, SY: 118, SW: 84, SH: 66, room: 'home' });
  const EY = SY + 14;
  el('rect', { x: SX, y: EY, width: SW, height: 50, rx: 2, fill: '#F6ECD9', stroke: '#CDB892', 'stroke-width': 1.5 });
  [0, 1, 2].forEach((i) => el('path', { d: `M ${SX + 20} ${EY + 26 + i * 7} h ${34 - i * 6}`, stroke: pal.blueDark, 'stroke-width': 1.8 }));
  const slot = el('rect', { x: SX + SW - 22, y: EY + 4, width: 18, height: 20, fill: 'none', stroke: pal.sub, 'stroke-width': 1.4, 'stroke-dasharray': '3 2' });
  // 机の上の切手シート
  const sheetX = 236;
  el('rect', { x: sheetX - 22, y: top - 4, width: 44, height: 4, fill: '#fff', stroke: pal.line });
  [-12, 0, 12].forEach((dx, i) => { if (i < 2) { const s = stampProp(k); tf(s, sheetX + dx + 6, top - 12, 0, 0.7); } });
  const st = stampProp(k);
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const q = el('text', {}); q.remove();
  return {
    update(t) {
      P(b, { x: 150, lean: 16, look: 0.9, blink: blinkAt(t), mood: t > 2.6 ? 'grin' : t < 0.8 ? 'flat' : 'smile' });
      face(b, 5, 2);
      const peel = easeInOut(seg(t, 0.8, 1.3)), move = easeInOut(seg(t, 1.4, 2.2)), press = hump(seg(t, 2.3, 2.7));
      const T0 = { x: sheetX - 6, y: top - 12 }, T1 = { x: SX + SW - 13, y: EY + 14 };
      let tx = lerp(SX + 30, T0.x, peel), ty = lerp(EY + 10, T0.y - 4, peel);
      if (t > 1.3) { tx = lerp(T0.x, T1.x, move); ty = lerp(T0.y - 4, T1.y - 6, move) - 20 * Math.sin(move * Math.PI) + 4 * press; }
      if (t > 2.9) { const r = easeInOut(seg(t, 2.9, 3.3)); tx = lerp(T1.x, T1.x - 30, r); ty = lerp(T1.y - 6, T1.y - 30, r); }
      b.pose({ armR: reach(b, S, 'R', tx, ty), squash: 1 - 0.03 * press });
      const h = hp(b, S, 'R');
      if (t < 1.25) tf(st, T0.x, T0.y, 0, 0.7);
      else if (t < 2.4) tf(st, h.x, h.y + 6, 0, lerp(0.7, 1, move));
      else tf(st, T1.x, T1.y, 0, 1 + 0.08 * wobble(seg(t, 2.4, 3.0), 2, 5));
      slot.setAttribute('opacity', t > 2.4 ? 0 : 1);
      st.parentNode.appendChild(st);
    }
  };
}
