// put away：床に散らかったおもちゃを、まめが1つずつおもちゃ箱へしまう（例文 Put away your toys, please.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '散らかっている'], [1.6, '箱へ運ぶ'], [3.2, 'すっきり']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 232, mood: 'indoor' });
  el('rect', { x: 0, y: FY + 40, width: 400, height: 4, fill: pal.floorEdge });
  const SC = 0.95, BXc = 336;
  // おもちゃ箱（奥側）
  el('rect', { x: BXc - 38, y: FY - 44, width: 76, height: 50, rx: 6, fill: pal.violet });
  const toy = (c) => g({});
  const mk = (kind) => {
    const t = g({});
    if (kind === 0) { el('circle', { r: 11, fill: pal.red }, t); el('path', { d: 'M -11 0 H 11', stroke: '#fff', 'stroke-width': 3 }, t); }
    if (kind === 1) { el('rect', { x: -11, y: -11, width: 22, height: 22, rx: 3, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, t); k.text(0, 1, 'A', { 'font-size': 13, fill: pal.ink }, t); }
    if (kind === 2) { el('rect', { x: -15, y: -6, width: 30, height: 12, rx: 4, fill: pal.blue }, t); el('circle', { cx: -8, cy: 7, r: 4, fill: pal.ink }, t); el('circle', { cx: 8, cy: 7, r: 4, fill: pal.ink }, t); }
    return t;
  };
  const toys = [0, 1, 2].map(mk);
  const home = [[110, FY + 24], [170, FY + 30], [60, FY + 32]];
  const b = k.buddy({ x: 90, y: FY + 10, scale: SC });
  const front = el('rect', { x: BXc - 42, y: FY - 20, width: 84, height: 30, rx: 6, fill: '#8C72E0' });
  el('rect', { x: BXc - 42, y: FY - 20, width: 84, height: 8, rx: 4, fill: '#B8A5F7' });
  const sp = [0, 1, 2].map(() => el('path', { d: 'M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z', fill: pal.yellow }));
  const T0 = [0.4, 1.7, 3.0], D = 1.2;
  return {
    update(t) {
      // 現在のおもちゃ番号
      let cur = t < T0[1] ? 0 : t < T0[2] ? 1 : 2;
      const lt = (t - T0[cur]) / D;
      const pick = seg(lt, 0, 0.25), carry = easeInOut(seg(lt, 0.25, 0.8)), drop = seg(lt, 0.8, 1.0);
      const [hx, hy] = home[cur];
      const bx = lerp(hx - 30, BXc - 50, carry);
      const done = t > T0[cur] + D;
      const doneAll = t > T0[2] + D - 0.1;
      const walking = lt > 0.25 && lt < 0.8;
      b.pose({
        x: t < T0[0] ? 90 : lt < 0.25 ? hx - 30 : bx,
        y: FY + 10,
        walk: walking ? t * 11 : 0,
        armR: lerp(8, 50, pick) * (1 - 0) , armL: lerp(8, 50, pick),
        lean: lerp(0, 18, hump(pick)) * (lt < 0.25 ? 1 : 0) + 4, look: 0.8,
        mood: doneAll ? 'grin' : 'smile'
      });
      toys.forEach((tg, i) => {
        const [x, y] = home[i];
        let X = x, Y = y, R = i * 20;
        if (i < cur || (i === cur && lt >= 1)) { X = BXc; Y = FY - 6; R = 0; tg.setAttribute('opacity', 0); }
        else if (i === cur && lt > 0) {
          const hp = b.handPos('R');
          if (lt < 0.25) { X = lerp(x, hp.x + 6, pick); Y = lerp(y, hp.y - 4, pick); }
          else if (lt < 0.8) { X = hp.x + 6; Y = hp.y - 6; }
          else { X = lerp(hp.x + 6, BXc, drop); Y = lerp(hp.y - 6, FY - 20, drop) - 30 * hump(drop); }
          tg.setAttribute('opacity', 1);
        } else tg.setAttribute('opacity', 1);
        tf(tg, X, Y, R, 1, 1);
      });
      sp.forEach((s, i) => { const p = seg(t, T0[2] + D - 0.1 + i * 0.1, T0[2] + D + 0.6 + i * 0.1); tf(s, 120 + i * 60, FY + 20 - 10 * p, 0, hump(p) * 1.2, hump(p) * 1.2); });
    }
  };
}
