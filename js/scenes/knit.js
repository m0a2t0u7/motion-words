// knit：おばあさんが毛糸と2本の棒針で編み進め、できあがったセーターを「私」に差し出す（例文 Grandma knitted a sweater for me.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { hp } from './dig.js';

export const meta = { duration: 4.8, beats: [[0, '毛糸と針'], [1.4, '編み進める'], [3.6, '私に渡す']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 238, mood: 'indoor' });
  el('rect', { x: 150, y: 44, width: 90, height: 66, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('ellipse', { cx: 200, cy: 256, rx: 150, ry: 13, fill: '#F1D9CF' });
  const gm = k.buddy({ x: 110, y: FY, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: 268, y: FY, scale: 0.8, facing: -1 });
  // おばあさん：丸めがねとお団子
  const face = gm.body.children[3];
  [-10, 10].forEach((x) => el('circle', { cx: x, cy: -54, r: 8, fill: 'none', stroke: pal.ink, 'stroke-width': 1.8 }, face));
  el('line', { x1: -2, y1: -54, x2: 2, y2: -54, stroke: pal.ink, 'stroke-width': 1.8 }, face);
  el('circle', { cx: 0, cy: -86, r: 9, fill: '#E5E8EE' }, gm.body); el('path', { d: 'M -22 -76 Q 0 -96 22 -76 Q 0 -84 -22 -76 Z', fill: '#E5E8EE' }, gm.body);
  // 毛糸玉と糸
  const ball = g({}); tf(ball, 60, FY - 2);
  el('circle', { r: 11, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, ball);
  el('path', { d: 'M -9 -4 Q 0 -10 9 -4 M -10 2 Q 0 -4 10 3 M -6 8 Q 0 4 6 8', fill: 'none', stroke: pal.yellowDark, 'stroke-width': 1.4 }, ball);
  const yarn = el('path', { d: '', fill: 'none', stroke: pal.yellowDark, 'stroke-width': 2, 'stroke-linecap': 'round' });
  // 編み地
  const clipN = g({});
  const piece = el('rect', { width: 40, height: 0, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, clipN);
  const rows = Array.from({ length: 7 }, () => el('line', { x1: 3, x2: 37, stroke: pal.yellowDark, 'stroke-width': 1.2, opacity: 0.7 }, clipN));
  const ned = [0, 1].map(() => el('line', { stroke: pal.woodDark, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  // セーター
  const sw = g({});
  el('path', { d: 'M -18 -30 Q 0 -24 18 -30 L 44 -14 L 36 4 L 22 -6 L 22 28 L -22 28 L -22 -6 L -36 4 L -44 -14 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, sw);
  el('path', { d: 'M -10 -29 Q 0 -20 10 -29', fill: 'none', stroke: pal.yellowDark, 'stroke-width': 4, 'stroke-linecap': 'round' }, sw);
  [-4, 6, 16].forEach((y) => el('line', { x1: -21, y1: y, x2: 21, y2: y, stroke: '#fff', 'stroke-width': 3, opacity: 0.8 }, sw));
  const hearts = [0, 1, 2].map(() => el('path', { d: 'M 0 6 C -12 -4 -8 -12 0 -6 C 8 -12 12 -4 0 6 Z', fill: pal.red }));
  return {
    update(t) {
      const kn = seg(t, 0.6, 2.6), fin = easeInOut(seg(t, 2.6, 3.3)), show = easeOut(seg(t, 3.2, 3.9));
      const st = Math.sin(t * 9) * (t > 0.6 && t < 2.6 ? 1 : 0);
      gm.pose({ armR: lerp(8, 72 + 9 * st, easeOut(seg(t, 0.2, 0.7))) * (1 - fin) + 105 * fin, armL: lerp(8, 70 - 9 * st, easeOut(seg(t, 0.2, 0.7))) * (1 - fin) + 105 * fin, lean: 3 * (1 - fin), mood: 'smile', look: 0.6 + 0 * fin, squash: 1 });
      const hr = hp(gm, 1, 'R', 28), hl = hp(gm, 1, 'L', 28), mx = (hr.x + hl.x) / 2 + 6, my = (hr.y + hl.y) / 2;
      // 編み地は針の下に伸びる
      const ph = 4 + 34 * kn;
      tf(clipN, mx - 20 + 6, my + 8);
      k.set(piece, { height: ph }); rows.forEach((r, i) => k.set(r, { y1: 5 + i * 5, y2: 5 + i * 5, opacity: 5 + i * 5 < ph ? 0.7 : 0 }));
      clipN.setAttribute('opacity', fin > 0 ? 0 : 1);
      ned.forEach((n, i) => { const h = i ? hr : hl; k.set(n, { x1: h.x, y1: h.y, x2: mx + (i ? 20 : -14) + 6, y2: my - 12 - 6 * i, opacity: fin > 0 ? 0 : 1 }); });
      k.set(yarn, { d: `M ${mx + 4} ${my + 14} Q ${(mx + 60) / 2} ${FY + 4} 70 ${FY - 6}`, opacity: fin > 0 ? 0 : kn > 0 ? 1 : 0 });
      // できあがったセーターを両手で広げて渡す
      const sx = lerp(mx + 6, hr.x + 20, show), sy = lerp(my + 10, my - 16, show);
      tf(sw, sx, sy, 0, 0.9 * fin + 0.001, 0.9 * fin + 0.001);
      me.pose({ armL: lerp(8, 150, seg(t, 3.5, 4.1)), armR: lerp(8, 150, seg(t, 3.5, 4.1)), mood: t > 3.3 ? 'grin' : 'smile', look: 0.6, squash: 1 + 0.03 * hump(seg(t, 3.5, 4.2)) });
      hearts.forEach((h, i) => { const q = seg(t, 4.0 + i * 0.15, 4.8); tf(h, 250 + i * 18, FY - 110 - 18 * q + (i % 2) * 8, 0, hump(q) * 1.1 + 0.001); });
    }
  };
}
