// envelope：手紙を封筒に入れてふたを閉じ、表にあて名を書く（例文 She put the letter in an envelope and wrote his address on it.）
import { seg, lerp, easeInOut, clamp } from '../ease.js';
import { held, reach, hp, P, blinkAt, face } from './bag.js';
import { pen as penProp } from './work-on.js';
import { studyDesk, ink } from './notebook.js';

export const meta = { duration: 4.4, beats: [[0, '手紙を入れる'], [1.6, 'ふたを閉じる'], [2.4, 'あて名を書く']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.1;
  const { FY, top, SX, SY, SW } = studyDesk(k, { SX: 196, SY: 118, SW: 84, SH: 66, room: 'home' });
  const EY = SY + 22, EH = 44;
  el('rect', { x: SX, y: EY, width: SW, height: EH, rx: 2, fill: '#EFE3CC', stroke: '#CDB892', 'stroke-width': 1.5 });
  const letter = k.g({});
  el('rect', { x: -18, y: -24, width: 36, height: 48, rx: 2, fill: '#fff', stroke: pal.line }, letter);
  [0, 1, 2, 3].forEach((i) => el('line', { x1: -13, y1: -16 + i * 8, x2: 12 - (i % 2) * 6, y2: -16 + i * 8, stroke: pal.sub, 'stroke-width': 1.2 }, letter));
  const front = el('path', { d: `M ${SX} ${EY + 6} L ${SX + SW / 2} ${EY + 24} L ${SX + SW} ${EY + 6} V ${EY + EH} H ${SX} Z`, fill: '#F6ECD9', stroke: '#CDB892', 'stroke-width': 1.5 });
  const flap = el('path', { d: `M ${SX} ${EY} L ${SX + SW / 2} ${EY + 22} L ${SX + SW} ${EY} Z`, fill: '#E8D8B8', stroke: '#CDB892', 'stroke-width': 1.5 });
  const addr = [0, 1, 2].map((i) => ink(k, SX + 26, EY + 26 + i * 6, 34 - i * 6, pal.blueDark));
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const pn = penProp(k, pal.blueDark);
  return {
    update(t) {
      P(b, { x: 150, lean: 16, look: 0.9, blink: blinkAt(t), mood: t > 3.8 ? 'grin' : 'smile' });
      face(b, 5, 2);
      const ins = easeInOut(seg(t, 0.4, 1.4));
      const close = easeInOut(seg(t, 1.6, 2.1));
      let tx, ty;
      if (t < 1.5) { tx = SX + SW / 2; ty = lerp(EY - 44, EY - 4, ins); }
      else if (t < 2.2) { tx = lerp(SX + SW / 2, SX + SW / 2, close); ty = lerp(EY - 18, EY + 10, close); }
      else { const i = clamp(Math.floor((t - 2.4) / 0.55), 0, 2), q = seg(t - 2.4 - i * 0.55, 0, 0.5); tx = SX + 26 + (34 - i * 6) * q; ty = EY + 24 + i * 6; if (t < 2.4) { tx = SX + 26; ty = EY + 20; } }
      b.pose({ armR: reach(b, S, 'R', tx, ty) });
      const h = hp(b, S, 'R');
      tf(letter, SX + SW / 2, lerp(EY - 30, EY + 22, ins), 0, 1);
      letter.setAttribute('opacity', 1);
      k.set(flap, { transform: `translate(0 ${EY}) scale(1 ${lerp(-1, 1, close).toFixed(3)}) translate(0 ${-EY})` });
      flap.parentNode.appendChild(flap);
      if (t > 2.2) held(k, b, S, pn, 'R', 0); else tf(pn, SX - 6, top - 4, 90, S);
      addr.forEach((a, i) => a.set(seg(t, 2.4 + i * 0.55, 2.9 + i * 0.55)));
      addr.forEach((a) => a.n.parentNode.appendChild(a.n));
      void h; void front;
    }
  };
}
