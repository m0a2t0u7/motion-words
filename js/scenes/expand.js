// expand：会議で、まめが計画ボードの地図を指しながら、1店舗から周りの町へ店を広げる計画を説明する（例文 The company plans to expand its business.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { reach } from './dig.js';
import { officeBg } from './get-on-with.js';
import { P, blinkAt } from './run-after.js';

// 小さな店のアイコン（中心原点）
export function shopIcon(k, parent, c) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('rect', { x: -9, y: -6, width: 18, height: 14, rx: 2, fill: '#fff', stroke: c || pal.blueDark, 'stroke-width': 2 }, g);
  k.el('path', { d: 'M -11 -6 L -8 -13 L 8 -13 L 11 -6 Z', fill: c || pal.blueDark }, g);
  k.el('rect', { x: -3, y: 1, width: 6, height: 7, fill: c || pal.blueDark }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '今は1店'], [1.2, '周りへ広げる'], [3.2, '広げる計画']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236;
  officeBg(k, FY, 290);
  // 計画ボード（地図）
  const BX = 150, BY = 30, BW = 210, BH = 150;
  el('rect', { x: BX - 4, y: BY - 4, width: BW + 8, height: BH + 8, rx: 8, fill: pal.sub });
  el('rect', { x: BX, y: BY, width: BW, height: BH, rx: 5, fill: '#EEF6E8' });
  el('path', { d: `M ${BX} ${BY + 100} Q ${BX + 90} ${BY + 70} ${BX + BW} ${BY + 110}`, stroke: '#CFE3F5', 'stroke-width': 10, fill: 'none' });
  el('path', { d: `M ${BX + 60} ${BY} L ${BX + 80} ${BY + BH}`, stroke: '#fff', 'stroke-width': 6 });
  el('rect', { x: BX + 30, y: BY + BH + 4, width: 6, height: FY - BY - BH - 4, fill: pal.sub });
  el('rect', { x: BX + BW - 36, y: BY + BH + 4, width: 6, height: FY - BY - BH - 4, fill: pal.sub });
  const CX = BX + 105, CY = BY + 75;
  const area = el('circle', { cx: CX, cy: CY, r: 22, fill: pal.mint, opacity: 0.25, stroke: pal.mintDark, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
  tf(shopIcon(k, k.root, pal.red), CX, CY);
  const outs = [[-70, -40], [72, -44], [-76, 42], [76, 40], [0, -58], [4, 58]].map(([dx, dy]) => {
    const ar = el('line', { x1: CX, y1: CY, x2: CX, y2: CY, stroke: pal.coralDark, 'stroke-width': 2.5, 'stroke-dasharray': '4 4', 'stroke-linecap': 'round' });
    const s = shopIcon(k, k.root); return { dx, dy, ar, s };
  });
  outs.forEach((o) => o.s.parentNode || null);
  const me = k.buddy({ x: 96, y: FY, scale: 1.0, facing: 1 });
  const guest = k.buddy({ x: 30, y: FY, scale: 0.85, facing: 1, color: pal.coral, dark: pal.coralDark });
  return {
    update(t) {
      // 指す点：中心の店 → 外へ広がる矢印の先
      const p1 = easeInOut(seg(t, 0.3, 0.8));
      const sweep = seg(t, 1.2, 3.0);
      const ang = sweep * Math.PI * 2;
      const tx = lerp(CX, CX + Math.cos(ang - 1.2) * 60, easeOut(seg(t, 1.2, 1.5))), ty = lerp(CY, CY + Math.sin(ang - 1.2) * 40, easeOut(seg(t, 1.2, 1.5)));
      const talking = t > 0.8 && t < 3.4 && Math.sin(t * 20) > -0.2;
      P(me, { look: -0.2, blink: blinkAt(t), armL: 10, armR: 10, lean: -3 * p1, mood: talking ? 'open' : 'grin' });
      me.pose({ armR: lerp(10, reach(me, 1.0, 'R', t < 1.2 ? CX : tx, t < 1.2 ? CY : ty), p1 * (1 - easeInOut(seg(t, 3.5, 3.9)))) + 0 });
      if (t > 3.5) me.pose({ armR: lerp(10, 150, easeOut(seg(t, 3.5, 3.8))) });
      P(guest, { look: 0.8, blink: blinkAt(t, 1), mood: t > 3.4 ? 'grin' : 'smile', armL: 10, armR: 10 });
      guest.body.children[3].setAttribute('transform', `translate(5 ${(t > 3.3 && t < 4 ? 3 * Math.abs(Math.sin(t * 10)) : 0).toFixed(2)})`);
      // 範囲の円が広がり、店が順に増える
      const grow = easeInOut(seg(t, 1.2, 3.2));
      area.setAttribute('r', (22 + 72 * grow).toFixed(2));
      area.setAttribute('transform', `translate(${CX} ${CY}) scale(1 ${lerp(1, 0.78, grow).toFixed(3)}) translate(${-CX} ${-CY})`);
      outs.forEach((o, i) => {
        const q = seg(t, 1.3 + i * 0.28, 1.8 + i * 0.28);
        k.set(o.ar, { x2: CX + o.dx * 0.8 * easeOut(q), y2: CY + o.dy * 0.8 * easeOut(q) });
        tf(o.s, CX + o.dx, CY + o.dy, 0, q > 0.6 ? Math.max(0.001, backOut(seg(q, 0.6, 1))) : 0.001);
      });
    }
  };
}
