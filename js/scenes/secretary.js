// secretary：秘書のまめの机で電話が鳴る。受話器を取って耳に当て、用件を聞いてメモする（例文 The secretary answered the phone.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, reach, held, P, blinkAt, wear, deskFront } from './member.js';
import { officeBg } from './get-on-with.js';
import { talk } from './in-common.js';

export const meta = { duration: 4.2, beats: [[0, '電話が鳴る'], [1.2, '受話器を取る'], [2.4, '用件を聞く']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.05, FY = 236;
  officeBg(k, FY, 40);
  el('rect', { x: 300, y: 60, width: 60, height: FY - 74, rx: 3, fill: '#C9A577' });
  el('rect', { x: 312, y: 74, width: 36, height: 12, rx: 2, fill: '#fff' }); k.text(330, 80, 'BOSS', { 'font-size': 8, fill: pal.ink });
  el('circle', { cx: 350, cy: 150, r: 3, fill: pal.yellowDark });
  const b = k.buddy({ x: 150, y: FY, scale: S, facing: 1 }); wear(k, b, 'badge', '#DCEBFF');
  const TOP = FY - 46;
  deskFront(k, 120, 150, TOP, FY);
  // 電話機（本体）と受話器
  const base = g({}); tf(base, 230, TOP);
  el('path', { d: 'M -22 0 L -18 -16 L 18 -16 L 22 0 Z', fill: pal.ink }, base);
  for (let i = 0; i < 6; i++) el('rect', { x: -10 + (i % 3) * 7, y: -13 + Math.floor(i / 3) * 5, width: 5, height: 3, rx: 1, fill: '#9FB4CC' }, base);
  const rcv = g({});
  el('rect', { x: -4, y: -14, width: 8, height: 28, rx: 4, fill: pal.ink }, rcv);
  el('rect', { x: -6, y: -18, width: 12, height: 8, rx: 3, fill: pal.ink }, rcv); el('rect', { x: -6, y: 10, width: 12, height: 8, rx: 3, fill: pal.ink }, rcv);
  const cord = el('path', { stroke: pal.ink, 'stroke-width': 1.5, fill: 'none' });
  const ring = [0, 1].map(() => el('path', { d: 'M -6 -8 Q 0 -14 6 -8', stroke: pal.coral, 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }));
  const memo = g({}); el('rect', { x: -14, y: -6, width: 28, height: 6, rx: 1, fill: '#FFF6B8', stroke: pal.yellowDark }, memo);
  const lines = [0, 1, 2].map((i) => el('line', { x1: -10, y1: -12 - i * 0, x2: -10, y2: -12, stroke: pal.blueDark, 'stroke-width': 1.6 }));
  tf(memo, 180, TOP);
  return {
    update(t) {
      const ringing = t < 1.1, pick = easeInOut(seg(t, 1.0, 1.6));
      const shake = ringing ? Math.sin(t * 60) * 1.5 : 0;
      tf(base, 230 + shake, TOP);
      ring.forEach((r, i) => { tf(r, 230 + (i ? 16 : -16), TOP - 20, i ? 30 : -30, ringing ? 1 + 0.2 * Math.sin(t * 20) : 0.001); });
      P(b, { look: ringing ? 0.9 : 0.4, blink: blinkAt(t), mood: talk(t, 2.0, 3.8) || (ringing ? 'open' : 'smile'), lean: 4 * pick });
      // 受話器：電話の上 → 耳（顔の横）
      const ear = { x: 150 + 30 * S, y: FY - 62 * S };
      const rest = { x: 230, y: TOP - 20 };
      const tgt = { x: lerp(rest.x, ear.x + 6, pick), y: lerp(rest.y, ear.y, pick) };
      b.pose({ armR: t < 0.6 ? 20 : lerp(20, reach(b, S, 'R', tgt.x, tgt.y), easeInOut(seg(t, 0.6, 1.0))) });
      tf(rcv, tgt.x, tgt.y, lerp(90, 10, pick), S * 0.9);
      k.set(cord, { d: `M 252 ${TOP - 6} Q ${(tgt.x + 252) / 2} ${TOP + 20} ${tgt.x + 6} ${tgt.y + 12}` });
      // 左手でメモ（手前のペン先が動く）
      lines.forEach((l, i) => { const p = seg(t, 2.2 + i * 0.5, 2.6 + i * 0.5); k.set(l, { x1: 170, x2: 170 + 20 * p * (1 - i * 0.2), y1: TOP - 2, y2: TOP - 2, transform: `translate(0 ${-i * 0})`, opacity: p > 0 ? 1 : 0 }); });
    }
  };
}
