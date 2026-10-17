// at the drop of a hat：帽子が落ちるとほぼ同時に、荷物を持ってすぐ出発（She'd travel at the drop of a hat.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '帽子を掲げる'], [1.3, '帽子が落ちる'], [2.6, '即出発']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  const sg = k.buddy({ x: 70, y: FY, scale: 0.85, color: pal.blue, dark: pal.blueDark });
  const me = k.buddy({ x: 215, y: FY, scale: 0.95, color: pal.coral, dark: pal.coralDark });
  const hat = g({});
  el('ellipse', { rx: 22, ry: 5, fill: pal.violet }, hat);
  el('path', { d: 'M -13 0 Q -13 -17 0 -17 Q 13 -17 13 0 Z', fill: pal.violet }, hat);
  el('rect', { x: -13, y: -6, width: 26, height: 5, fill: pal.yellow }, hat);
  const bag = g({});
  el('path', { d: 'M -8 -22 q 0 -8 8 -8 q 8 0 8 8', fill: 'none', stroke: pal.woodDark, 'stroke-width': 3 }, bag);
  el('rect', { x: -16, y: -22, width: 32, height: 24, rx: 5, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 2 }, bag);
  el('rect', { x: -16, y: -12, width: 32, height: 3, fill: pal.woodDark }, bag);
  const lines = [0, 1, 2, 3].map(() => el('line', { stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round' }));
  const dust = [0, 1, 2].map(() => el('circle', { fill: '#D7DDE5' }));
  sg.pose({ armR: 168, armL: 8 });
  const hx0 = sg.handPos('R').x, hy0 = sg.handPos('R').y;
  return {
    update(t) {
      const rel = 1.1;
      const down = t > rel ? easeIn(seg(t, rel, 1.65)) : 0;
      const land = seg(t, 1.65, 2.1);
      const hy = lerp(hy0 - 10, FY - 6, down);
      tf(hat, hx0 + 6 + (down > 0 ? 6 * down : 0), hy, down > 0 ? 40 * down - 40 * land * 0.4 : -8, 1 + 0.12 * wobble(land, 2, 6), 1 - 0.1 * wobble(land, 2, 6));
      const drop = easeOut(seg(t, rel, rel + 0.4));
      sg.pose({ armR: lerp(168, 8, drop) + (t > rel + 0.5 ? 35 * easeOut(seg(t, rel + 0.5, rel + 0.9)) : 0), armL: t > rel + 0.5 ? 35 * easeOut(seg(t, rel + 0.5, rel + 0.9)) : 8, mood: t < rel + 0.5 ? 'smile' : 'open', look: 0.7 });
      const go = seg(t, 1.2, 3.2);
      const x = lerp(215, 372, smooth(go));
      const run = go > 0 && go < 1;
      const prep = hump(seg(t, 0.95, 1.2));
      const sw = Math.sin(t * 15) * 30;
      me.pose({
        x, walk: run ? t * 15 : 0,
        armR: run ? 8 + sw : 8 + 0 * prep, armL: run ? 20 - sw * 0.6 : 8,
        lean: run ? 16 : -6 * prep, look: t < 1.2 ? -0.7 : 0.8, squash: 1 - 0.07 * prep,
        mood: t < 1.1 ? 'smile' : 'grin', lift: 0
      });
      const hp = me.handPos('L');
      tf(bag, x - 22 - (run ? 8 : 0), FY - 12 + (run ? Math.abs(Math.sin(t * 15)) * -4 : 0), run ? 12 : 0);
      lines.forEach((l, i) => {
        const o = run ? (go < 0.9 ? 1 : 0) * smooth(seg(go, 0.05, 0.3)) : 0;
        k.set(l, { x1: x - 60 - i * 18, y1: FY - 30 - i * 14, x2: x - 98 - i * 18, y2: FY - 30 - i * 14, opacity: o * 0.8 });
      });
      dust.forEach((d, i) => {
        const p = seg(t, 1.3 + i * 0.12, 2.0 + i * 0.12);
        k.set(d, { cx: lerp(215, x, 0.3) - 10 - i * 12, cy: FY - 4 - 12 * p, r: 4 + 8 * p, opacity: 0.8 * (1 - p) * (p > 0 ? 1 : 0) });
      });
    }
  };
}
