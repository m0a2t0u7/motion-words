// strike：まめが蹴ったボールが家の窓に強く当たり、ガラスにひびが入る（例文 The ball struck the window.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, wobble } from '../ease.js';
import { P } from './run-after.js';
import { icon } from './in-common.js';
import { frontL } from './dig.js';

export const meta = { duration: 3.8, beats: [[0, 'ボールを蹴る'], [1.3, '窓に当たる'], [2.2, 'ひびが入った']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.75;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#BFE3C6' });
  // 家
  k.shadow(320, FY + 1, 92, 5);
  el('path', { d: 'M 220 104 L 320 44 L 420 104 Z', fill: pal.coralDark });
  el('rect', { x: 232, y: 102, width: 176, height: 134, fill: '#F6E6CF' });
  el('rect', { x: 352, y: 160, width: 34, height: 76, rx: 3, fill: pal.wood });
  const WX = 270, WY = 124;
  const glass = g({}); tf(glass, WX + 30, WY + 28);
  el('rect', { x: -30, y: -28, width: 60, height: 56, fill: '#CFE9F7' }, glass);
  el('path', { d: 'M -22 -18 L -8 -24 M -24 -6 L -2 -18', stroke: '#fff', 'stroke-width': 3, opacity: 0.7 }, glass);
  const crack = el('path', { d: 'M 0 0 L -12 -20 M 0 0 L 16 -16 M 0 0 L 22 6 M 0 0 L 6 24 M 0 0 L -18 14 M 0 0 L -26 -2 M -8 -13 L -16 -10 M 10 -10 L 16 -4 M 13 4 L 14 14', stroke: pal.ink, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, glass);
  el('rect', { x: WX - 4, y: WY - 4, width: 68, height: 64, rx: 3, fill: 'none', stroke: '#fff', 'stroke-width': 6 });
  el('line', { x1: WX + 30, y1: WY, x2: WX + 30, y2: WY + 56, stroke: '#fff', 'stroke-width': 3 });
  const b = k.buddy({ x: 70, y: FY, scale: S });
  const fl = frontL(b, S, -16, -44);
  const ball = icon(k, 'ball'), bsh = k.shadow(0, 0, 10, 2.5);
  const hit = { x: WX + 30, y: WY + 28 };
  const lines = [0, 1, 2, 3].map(() => el('line', { stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  return {
    update(t) {
      const kl = Math.sin(seg(t, 0.3, 0.8) * Math.PI);
      const shock = easeOut(seg(t, 1.4, 1.8));
      P(b, { x: 70, lean: 8 * kl - 6 * shock, look: 1, mood: shock > 0.2 ? 'open' : 'smile', armR: lerp(20 * kl, -40, shock), armL: 8 });
      fl.set(lerp(-6, 40, shock));
      b.g.children[1].children[1].setAttribute('transform', `translate(12 -14) rotate(${(-60 * kl).toFixed(1)})`);
      // ボール：蹴られて窓へ → 当たって跳ね返り落ちる
      let x = 96, y = FY - 9, r = 0;
      if (t > 0.6 && t <= 1.4) { const p = seg(t, 0.6, 1.4); x = lerp(96, hit.x - 8, p); y = lerp(FY - 9, hit.y, p) - 70 * hump(p * 0.82); r = p * 720; }
      else if (t > 1.4) { const p = seg(t, 1.4, 2.1); x = lerp(hit.x - 8, 220, easeOut(p)); y = lerp(hit.y, FY - 9, easeIn(p)); r = 720 - p * 300;
        if (t > 2.1) { const q = seg(t, 2.1, 3.2); x = 220 - 26 * easeOut(q); y = FY - 9 - 18 * hump(seg(t, 2.1, 2.5)) - 5 * hump(seg(t, 2.5, 2.7)); r = 420 - 200 * easeOut(q); } }
      tf(ball, x, y, r);
      tf(bsh, x, FY + 1, 0, Math.max(0.2, 1 - (FY - y) / 160));
      // ガラスの震えとひび
      const sh = t > 1.4 ? wobble(seg(t, 1.4, 2.0), 4, 5) : 0;
      tf(glass, hit.x + sh * 1.5, hit.y);
      crack.setAttribute('opacity', t > 1.4 ? 1 : 0);
      lines.forEach((l, i) => { const q = seg(t, 1.4, 1.75), a = (i * 90 + 45) * Math.PI / 180;
        k.set(l, { x1: hit.x + Math.cos(a) * (36 + 8 * q), y1: hit.y + Math.sin(a) * (36 + 8 * q), x2: hit.x + Math.cos(a) * (44 + 12 * q), y2: hit.y + Math.sin(a) * (44 + 12 * q), opacity: q > 0 && q < 1 ? 1 - q : 0 }); });
    }
  };
}
