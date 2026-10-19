// cable：テレビのケーブルを壁のコンセントまで引っぱっても、あと少し届かない（例文 I need a longer cable for the TV.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { reach, hp } from './dig.js';
import { gait } from './weigh.js';
import { P, blinkAt } from './run-after.js';
import { homeBg } from './furniture.js';

export const meta = { duration: 4.4, beats: [[0, 'プラグを持つ'], [1.0, '引っぱる'], [2.8, '届かない…']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.88;
  const FY = homeBg(k, { winX: 160, winW: 84 });
  // コンセント（左の壁）
  const OX = 34, OY = FY - 26;
  el('rect', { x: OX - 10, y: OY - 14, width: 20, height: 28, rx: 3, fill: '#fff', stroke: '#C9D2DE', 'stroke-width': 2 });
  [-5, 5].forEach((dy) => { el('rect', { x: OX - 4, y: OY + dy - 3, width: 2, height: 5, fill: pal.ink }); el('rect', { x: OX + 2, y: OY + dy - 3, width: 2, height: 5, fill: pal.ink }); });
  // テレビ台とテレビ（右）
  const TX = 320;
  k.shadow(TX, FY + 1, 62, 5);
  el('rect', { x: TX - 60, y: FY - 34, width: 120, height: 34, rx: 4, fill: pal.wood });
  el('rect', { x: TX - 56, y: FY - 28, width: 54, height: 22, rx: 3, fill: '#EAD3B0' }); el('rect', { x: TX + 2, y: FY - 28, width: 54, height: 22, rx: 3, fill: '#EAD3B0' });
  el('rect', { x: TX - 8, y: FY - 44, width: 16, height: 10, fill: pal.ink });
  el('rect', { x: TX - 54, y: FY - 112, width: 108, height: 70, rx: 5, fill: pal.ink });
  el('rect', { x: TX - 49, y: FY - 107, width: 98, height: 60, rx: 3, fill: '#2F3A5C' });
  const cable = el('path', { fill: 'none', stroke: '#2F3747', 'stroke-width': 3.5, 'stroke-linecap': 'round' });
  const plug = g({});
  el('rect', { x: -7, y: -6, width: 10, height: 12, rx: 2, fill: '#E3E8EE', stroke: '#AEB7C4', 'stroke-width': 1.5 }, plug);
  el('rect', { x: -12, y: -4, width: 5, height: 2, fill: '#AEB7C4' }, plug); el('rect', { x: -12, y: 2, width: 5, height: 2, fill: '#AEB7C4' }, plug);
  const b = k.buddy({ x: 230, y: FY, scale: S, facing: -1 });
  const gapL = el('path', { fill: 'none', stroke: pal.red, 'stroke-width': 2, 'stroke-dasharray': '3 3' });
  const ends = [0, 1].map(() => el('line', { stroke: pal.red, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
  // ケーブルの長さはここまで（手の位置 x の最小値）
  const REACH = 92;
  const xf = (t) => lerp(230, 150, easeInOut(seg(t, 0.6, 1.8)));
  return {
    update(t) {
      const w = gait(xf, t, 230, 0, 0.12);
      const tug = t > 1.8 ? hump(seg(t, 1.9, 2.3)) + hump(seg(t, 2.4, 2.8)) : 0;
      const pose = { x: w.x, facing: -1, walk: w.walk, lean: w.lean + 10 * tug, look: t > 2.9 ? 0.5 : -0.6, blink: blinkAt(t), mood: t > 2.9 ? 'sad' : 'flat', squash: 1 - 0.04 * tug };
      P(b, pose);
      const hx = Math.max(REACH, b.state.x - 46), hy = OY + 4;
      P(b, { ...pose, armR: reach(b, S, 'R', hx - 4 * tug, hy) });
      const h = hp(b, S, 'R', 28);
      const px = Math.max(REACH - 2, h.x - 8);
      tf(plug, px, h.y);
      // ピンと張るほどたるみがなくなる
      const taut = seg(150 + 60 - w.x, 0, 60);
      const sag = lerp(18, 0, taut);
      k.set(cable, { d: `M ${TX - 30} ${FY - 60} Q ${TX - 70} ${FY - 60} ${TX - 70} ${FY - 8} L ${TX - 90} ${FY - 2} Q ${(TX - 90 + px) / 2} ${FY + sag - 4} ${px + 4} ${h.y + 1}` });
      // とどかない距離
      const show = seg(t, 2.9, 3.3);
      k.set(gapL, { d: `M ${OX + 12} ${OY + 12} H ${px - 12}`, opacity: show });
      ends.forEach((e, i) => { const x = i ? px - 12 : OX + 12; k.set(e, { x1: x, y1: OY + 6, x2: x, y2: OY + 18, opacity: show }); });
    }
  };
}
