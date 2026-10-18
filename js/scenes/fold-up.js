// fold up：開いた折りたたみ椅子を手でたたみ、持ち上げて物置へしまう（例文 Fold up the chair and put it away.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { hp } from './dig.js';
import { path, walk } from './queue-up.js';

export const meta = { duration: 4.4, beats: [[0, '開いた椅子'], [1.4, 'たたむ'], [3.8, 'しまった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 40, y: 50, width: 86, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 4 });
  // 物置（右）：奥の暗がり
  el('rect', { x: 318, y: 96, width: 72, height: 140, rx: 3, fill: '#5A6480' });
  el('rect', { x: 310, y: 90, width: 88, height: 8, fill: pal.woodDark });
  const S = 0.95;
  const shC = k.shadow(0, FY + 1, 30, 4);
  const ch = g({});
  const back = g({}, ch), front = g({}, ch), seat = g({}, ch);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -96, stroke: '#7D8798', 'stroke-width': 5, 'stroke-linecap': 'round' }, back);
  el('rect', { x: -4, y: -96, width: 8, height: 30, rx: 3, fill: pal.blue }, back);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -58, stroke: '#9AA4B5', 'stroke-width': 5, 'stroke-linecap': 'round' }, front);
  el('rect', { x: 0, y: -4, width: 44, height: 8, rx: 3, fill: pal.blue }, seat);
  const b = k.buddy({ x: 150, y: FY, scale: S });
  // 物置の扉枠（手前）
  el('rect', { x: 312, y: 96, width: 6, height: 140, fill: pal.woodDark });
  const xf = path([[0, 150], [0.5, 170], [2.2, 170], [3.4, 300], [4.4, 300]]);
  return {
    update(t) {
      const f = easeInOut(seg(t, 0.8, 1.9));
      const lift = easeOut(seg(t, 2.0, 2.3)) * (1 - easeInOut(seg(t, 3.4, 3.8)));
      const p = walk(b, xf, t, { look: 0.4, mood: t > 3.9 ? 'grin' : 'flat' });
      // 椅子の形：後ろ脚（背もたれ）は前に傾き、前脚は閉じ、座面は上へ跳ね上がる
      const carry = t > 2.2;
      let cx = 245, cy = FY;
      if (t > 2.0) { const h = hp(b, S, 'R'); cx = lerp(245, h.x + 6, easeOut(seg(t, 2.0, 2.3))); cy = lerp(FY, Math.min(FY - 4, h.y + 30), easeOut(seg(t, 2.0, 2.3))); }
      if (t > 3.4) { cx = lerp(cx, 352, easeInOut(seg(t, 3.4, 3.8))); cy = lerp(cy, FY, easeInOut(seg(t, 3.4, 3.8))) + 2 * wobble(seg(t, 3.75, 4.2), 2, 6); }
      tf(ch, cx, cy, carry ? 0 : 0);
      tf(back, 0, 0, lerp(-10, 0, f));
      tf(front, 34 * (1 - f), 0, lerp(-34, -2, f));
      tf(seat, 0, lerp(-44, -50, f), lerp(0, -86, f));
      tf(shC, cx + 10 * (1 - f), 0, 0, lerp(1, 0.4, f) * (1 - lift * 0.6), 1);
      // 手：たたむ間は座面の先、持つ間は背もたれ
      if (t < 2.0) {
        const tip = { x: 245 + Math.cos(-86 * f * Math.PI / 180) * 40, y: FY - lerp(44, 50, f) + Math.sin(-86 * f * Math.PI / 180) * 40 };
        const reachIn = easeOut(seg(t, 0.4, 0.8));
        b.pose({ armR: lerp(12, lerp(62, 120, f), reachIn), lean: 10 * reachIn * (1 - f * 0.5) });
        void tip;
      } else b.pose({ armR: lerp(70, 84, lift), lean: 2 * lift, armL: p.armL });
      if (t > 3.5) b.pose({ armR: lerp(60, 15, easeInOut(seg(t, 3.7, 4.1))) });
      ch.setAttribute('opacity', 1);
      void hump;
    }
  };
}
