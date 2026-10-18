// look to：まわりの人たちが「？」を抱えて彼の方を向き、彼が答え（電球）を出す（例文 Many people look to him for advice.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { roomBg, say, faceAt } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '困っている人たち'], [1.4, '彼の方を向く'], [3.0, '助言をもらう']] };

export function bulb(k, parent) {
  const n = k.g({}, parent);
  k.el('circle', { cy: -4, r: 9, fill: k.pal.yellow, stroke: k.pal.yellowDark, 'stroke-width': 2 }, n);
  k.el('rect', { x: -4.5, y: 4, width: 9, height: 7, rx: 2, fill: k.pal.sub }, n);
  return n;
}

export function create(k) {
  const { pal } = k;
  roomBg(k, 'office', 240);
  const P = [[60, 1, pal.mint, pal.mintDark], [120, 1, pal.blue, pal.blueDark], [300, -1, pal.yellow, pal.yellowDark], [354, -1, pal.violet, '#8A6FD8']];
  const ppl = P.map(([x, f, c, d]) => k.buddy({ x, y: 240, scale: 0.72, facing: -f, color: c, dark: d }));
  const him = k.buddy({ x: 210, y: 240, scale: 0.95, color: pal.coral, dark: pal.coralDark });
  const qs = P.map(() => { const s = say(k, 26, 26, 0); k.text(0, 1, '?', { 'font-size': 18, fill: pal.blueDark }, s.g); return s; });
  const ans = say(k, 40, 36, 0); bulb(k, ans.g);
  return {
    update(t) {
      const turn = seg(t, 1.0, 1.5);
      ppl.forEach((p, i) => {
        const f = P[i][1], tt = seg(t, 1.0 + i * 0.12, 1.4 + i * 0.12), lean = 8 * easeInOut(seg(t, 1.5 + i * 0.1, 2.1 + i * 0.1));
        p.pose({ facing: tt > 0.5 ? f : -f, lean, armR: 8 + 30 * hump(seg(t, 0.2 + i * 0.2, 1.0 + i * 0.2)), armL: 10, mood: t > 3.3 ? 'grin' : t > 1.5 ? 'open' : 'flat', look: 0.6, squash: 1 - 0.05 * hump(seg(t, 3.2, 3.6)) });
        faceAt(p, tt > 0.5 ? 4 : -2, -1);
        qs[i].show(seg(t, 0.2 + i * 0.15, 0.4 + i * 0.15) * (1 - seg(t, 3.1, 3.3)), P[i][0], 150 + (i % 2) * 8);
      });
      him.pose({ armR: 8 + 110 * easeOut(seg(t, 2.5, 2.9)), armL: 8 + 30 * hump(seg(t, 2.0, 3.6)), mood: t > 2.4 ? 'grin' : 'smile', lift: 6 * hump(seg(t, 2.5, 2.9)), look: Math.sin(t * 2) * 0.6 });
      ans.show(seg(t, 2.7, 3.0), 210, 120);
    }
  };
}
