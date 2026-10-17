// look through：まめが報告書を持ち、ページをぱらぱらめくって内容にざっと目を通す（例文 She looked through the report quickly.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 3.6, beats: [[0, '報告書を持つ'], [1.0, 'ざっとめくる'], [2.8, '見終える']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 本棚
  el('rect', { x: 262, y: 120, width: 110, height: 116, rx: 4, fill: pal.wood });
  el('rect', { x: 268, y: 126, width: 98, height: 48, fill: '#F4E8D6' });
  el('rect', { x: 268, y: 180, width: 98, height: 50, fill: '#F4E8D6' });
  const bc = [pal.coral, pal.blue, pal.yellow, pal.mint, pal.violet, pal.coral];
  bc.forEach((c, i) => { el('rect', { x: 272 + i * 15, y: 138, width: 12, height: 36, rx: 2, fill: c }); el('rect', { x: 276 + i * 14, y: 196, width: 11, height: 34, rx: 2, fill: bc[(i + 2) % 6] }); });
  el('rect', { x: 36, y: 46, width: 70, height: 60, rx: 6, fill: '#DDEFFA' });
  el('line', { x1: 71, y1: 46, x2: 71, y2: 106, stroke: '#fff', 'stroke-width': 4 });

  const b = k.buddy({ x: 150, y: FY, scale: 1 });
  const doc = g({});
  const pages = [];
  const mk = (i) => {
    const pg = g({}, doc);
    const front = g({}, pg), back = g({}, pg);
    const base = (p, fill) => el('rect', { x: 0, y: 0, width: 60, height: 78, rx: 4, fill, stroke: pal.line, 'stroke-width': 1.5 }, p);
    base(front, i === 0 ? pal.blue : '#fff');
    base(back, '#EEF1F5');
    [16, 28, 40].forEach((y) => el('rect', { x: 12, y, width: 36, height: 3, rx: 1.5, fill: pal.line }, back));
    if (i === 0) {
      el('rect', { x: 10, y: 14, width: 40, height: 8, rx: 3, fill: '#fff' }, front);
      el('rect', { x: 10, y: 28, width: 26, height: 5, rx: 2.5, fill: '#fff', opacity: 0.6 }, front);
      el('circle', { cx: 30, cy: 56, r: 10, fill: '#fff', opacity: 0.35 }, front);
    } else if (i === 1) {
      el('rect', { x: 8, y: 8, width: 30, height: 6, rx: 3, fill: pal.ink, opacity: 0.7 }, front);
      for (let r = 0; r < 6; r++) el('rect', { x: 8, y: 22 + r * 8, width: 44 - (r % 3) * 8, height: 3.5, rx: 1.75, fill: pal.line }, front);
    } else if (i === 2) {
      el('rect', { x: 8, y: 8, width: 30, height: 6, rx: 3, fill: pal.ink, opacity: 0.7 }, front);
      [14, 26, 18, 32].forEach((h, j) => el('rect', { x: 10 + j * 12, y: 66 - h, width: 8, height: h, rx: 2, fill: [pal.mint, pal.blue, pal.yellow, pal.coral][j] }, front));
    } else if (i === 3) {
      el('rect', { x: 8, y: 8, width: 30, height: 6, rx: 3, fill: pal.ink, opacity: 0.7 }, front);
      el('circle', { cx: 30, cy: 44, r: 18, fill: pal.violet }, front);
      el('path', { d: 'M 30 44 L 30 26 A 18 18 0 0 1 46 52 Z', fill: pal.yellow }, front);
    } else {
      el('rect', { x: 8, y: 8, width: 30, height: 6, rx: 3, fill: pal.ink, opacity: 0.7 }, front);
      el('path', { d: 'M 8 62 L 22 50 L 34 56 L 52 30', stroke: pal.green, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, front);
      [8, 22, 34, 52].forEach((x, j) => el('circle', { cx: x, cy: [62, 50, 56, 30][j], r: 3, fill: pal.green }, front));
    }
    return { pg, front, back };
  };
  for (let i = 4; i >= 0; i--) pages[i] = mk(i);
  const lines = g({});
  [0, 1, 2].forEach((i) => el('line', { x1: 0, y1: i * 7, x2: 12 - i * 3, y2: i * 7, stroke: pal.sub, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, lines));

  const F = [0.9, 1.3, 1.7, 2.1];
  return {
    update(t) {
      const hold = easeOut(seg(t, 0.1, 0.6));
      // 見ている間は目線が左右に動く
      const scan = t > 0.8 && t < 2.5 ? Math.sin((t - 0.8) * 9) : 0;
      b.pose({ armR: lerp(8, 88, hold), armL: 8, lean: lerp(0, 4, hold), look: t < 0.8 ? 0.4 : t < 2.5 ? 0.55 + 0.4 * scan : 0.5, mood: t > 2.7 ? 'open' : 'flat', blink: t > 0.3 && t < 0.4 ? 1 : 0, squash: 1 - 0.04 * hump(seg(t, 2.5, 3.1)) });
      const h = b.handPos('R');
      const hx = h.x - 6, hy = h.y - 76 + 6;
      tf(doc, hx, hy, 0, 1);
      let flipping = 0;
      pages.forEach((p, i) => {
        const q = i < 4 ? easeInOut(seg(t, F[i], F[i] + 0.34)) : 0;
        if (q > 0 && q < 1) flipping = 1;
        const c = Math.cos(Math.PI * q);
        const lift = Math.sin(Math.PI * q) * 6;
        tf(p.pg, 0, -lift - (q > 0.5 ? (i % 2) * 1.5 : 0), 0, 1, Math.abs(c) < 0.02 ? 0.02 : c);
        p.front.setAttribute('display', c >= 0 ? 'inline' : 'none');
        p.back.setAttribute('display', c < 0 ? 'inline' : 'none');
      });
      tf(lines, hx + 66, hy - 4, 0, 1);
      lines.setAttribute('opacity', flipping ? 0.8 : 0);
    }
  };
}
