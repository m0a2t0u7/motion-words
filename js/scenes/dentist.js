// dentist：歯が痛むまめがほおを押さえ、カレンダーの「明日」に歯医者の予約を見つける。頭に歯医者さんが浮かぶ（例文 I have to see the dentist tomorrow.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { BL, reach, P, blinkAt, wear, pop, sc } from './member.js';
import { homeBg } from './furniture.js';
import { cloud } from './look-over.js';
import { coat } from './hospital.js';

export const meta = { duration: 4.4, beats: [[0, '歯が痛い'], [1.2, '明日は歯医者'], [2.6, '行かなきゃ']] };

export function tooth(k, parent, s = 1) {
  const g = k.g({}, parent);
  k.el('path', { d: 'M -9 -8 Q -9 -14 -4 -13 Q 0 -11 4 -13 Q 9 -14 9 -8 Q 9 0 6 4 L 4 12 Q 2 14 1 8 L 0 4 L -1 8 Q -2 14 -4 12 L -6 4 Q -9 0 -9 -8 Z', fill: '#fff', stroke: '#6D7889', 'stroke-width': 1.8 }, g);
  k.tf(g, 0, 0, 0, s);
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.05, FY = 236;
  homeBg(k, { FY, winX: 300, winW: 80 });
  // カレンダー（今日と明日）
  const CX = 150, CY = 50;
  el('rect', { x: CX, y: CY, width: 110, height: 92, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: CX, y: CY, width: 110, height: 16, rx: 4, fill: pal.red });
  [['TODAY', 0], ['TOMORROW', 1]].forEach(([s, i]) => { el('rect', { x: CX + 8 + i * 50, y: CY + 24, width: 44, height: 60, rx: 3, fill: i ? '#FFF6D8' : pal.floor }); k.text(CX + 30 + i * 50, CY + 32, s, { 'font-size': 6.5, fill: pal.sub }); });
  const tt = tooth(k, k.root, 1.3); tf(tt, CX + 80, CY + 58);
  const circ = el('circle', { cx: CX + 80, cy: CY + 55, r: 22, fill: 'none', stroke: pal.red, 'stroke-width': 3, 'stroke-dasharray': '140 140' });
  const b = k.buddy({ x: 100, y: FY, scale: S, facing: 1 });
  // 腫れたほお
  const sw = el('ellipse', { cx: 20, cy: -44, rx: 7, ry: 6, fill: '#FF9C8C', opacity: 0.8 }, b.body.children[3]);
  const ache = [0, 1, 2].map(() => el('path', { d: 'M 0 0 l 4 -6 l 3 5 l 4 -7', stroke: pal.red, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }));
  const th = cloud(k, 96, 70, 1);
  const doc = k.buddy({ parent: th.c || th.g, x: -8, y: 26, scale: 0.42, facing: 1, ...BL(k) }); coat(k, doc); doc.g.firstChild.setAttribute('display', 'none');
  const mirror = el('g', {}, th.c || th.g); el('line', { x1: 10, y1: 4, x2: 22, y2: -10, stroke: '#9AA6B6', 'stroke-width': 2.5 }, mirror); el('circle', { cx: 23, cy: -12, r: 4, fill: '#DDEFFA', stroke: '#9AA6B6', 'stroke-width': 1.5 }, mirror);
  return {
    update(t) {
      const look = easeInOut(seg(t, 1.0, 1.4));
      P(b, { look: lerp(0.2, 1, look), lean: -4 + 8 * look, blink: blinkAt(t), mood: t > 2.2 ? 'flat' : 'sad', squash: 1 - 0.03 * Math.abs(Math.sin(t * 3)) });
      // 右手でほおを押さえる
      b.pose({ armR: reach(b, S, 'R', 100 + 24 * S, FY - 52 * S) + 4 * Math.sin(t * 4) });
      ache.forEach((a, i) => { const q = ((t * 1.2 + i * 0.33) % 1); tf(a, 128 + i * 6, FY - 80 - q * 20 - i * 4, -20 + i * 20, sc(hump(q) * (1 - seg(t, 3.6, 4.0)))); });
      k.set(circ, { 'stroke-dashoffset': 140 * (1 - easeInOut(seg(t, 1.4, 2.0))) });
      tf(tt, CX + 80, CY + 58 + -2 * hump(seg(t, 1.9, 2.3)), 0, 1.3);
      if (th.show) th.show(seg(t, 2.4, 2.8), 62, 66); else tf(th.g, 70, 70, 0, sc(pop(seg(t, 2.4, 2.8))));
      P(doc, { y: 26, look: 0.6, mood: 'smile', armR: 120, blink: blinkAt(t, 1) });
    }
  };
}
