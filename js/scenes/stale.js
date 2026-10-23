// stale：パンをかじろうとしたがパサパサで固い。「古くなっている」と首を振り、ごみ箱に捨てる（例文 This bread is stale. Let's throw it away.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, wobble } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';
import { held } from './dig.js';

export const meta = { duration: 3.8, beats: [[0, 'パンを見る'], [1.2, 'ダメだった'], [2.5, '捨てる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 230, y: FY + 8, scale: 1 });
  // パン（食パン1枚、origin＝にぎる所）
  const br = g({});
  el('path', { d: 'M -14 -6 Q -18 -22 -6 -22 Q 0 -28 6 -22 Q 18 -22 14 -6 L 13 6 L -13 6 Z', fill: '#E3B66F', stroke: '#B8873F', 'stroke-width': 2, 'stroke-linejoin': 'round' }, br);
  el('path', { d: 'M -8 -14 L -2 -8 L -6 -3 M 6 -12 L 3 -6 L 8 -1', stroke: '#B8873F', 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round' }, br);
  const crumbs = [0, 1, 2, 3].map(() => el('circle', { r: 1.8, fill: '#C99A55' }));
  // ごみ箱（パンが入る間は前面の板で隠す）
  k.shadow(330, FY + 4, 28, 4);
  el('rect', { x: 306, y: 196, width: 48, height: 44, rx: 5, fill: pal.sub });
  el('ellipse', { cx: 330, cy: 196, rx: 24, ry: 5, fill: '#4B5563' });
  const fall = g({}); tf(fall, 0, 0);
  const bin = el('rect', { x: 306, y: 199, width: 48, height: 41, rx: 5, fill: pal.sub });
  el('rect', { x: 314, y: 208, width: 4, height: 26, rx: 2, fill: '#fff', opacity: 0.35 }); el('rect', { x: 342, y: 208, width: 4, height: 26, rx: 2, fill: '#fff', opacity: 0.35 });
  const lid = g({}); el('rect', { x: -27, y: -4, width: 54, height: 6, rx: 3, fill: '#4B5563' }, lid);
  return {
    update(t) {
      const sniff = hump(seg(t, 0.5, 1.2)), shake = hump(seg(t, 1.2, 2.0)) * Math.sin(t * 16), toss = easeInOut(seg(t, 2.2, 2.7)), rel = seg(t, 2.8, 3.0);
      const A = lerp(70, 40, sniff) + toss * 55;
      P(b, { armR: A, armL: 20, lean: 6 * sniff - 4 * toss, look: lerp(-0.2, 0.5, toss), mood: t < 2.1 ? 'sad' : 'flat', blink: blinkAt(t), x: 230 + shake * 1.5 });
      if (rel < 1 && t < 2.9) { held(k, b, 1, br, 'R', b.state.armR - b.state.lean + shake * 2); }
      else { const u = seg(t, 2.9, 3.6), x0 = b.state.x + 27 + 28 * Math.sin(95 * Math.PI / 180); tf(br, lerp(300, 330, easeOut(u)), lerp(188, 232, easeIn(u)), u * 40, 0.8, 0.8); }
      br.setAttribute('opacity', 1);
      crumbs.forEach((c, i) => { const u = (t * 0.9 + i * 0.25) % 1; const on = t < 2.8 ? sniff + shake : 0; tf(c, b.state.x + 52 + i * 5, 190 + u * 40); c.setAttribute('opacity', on * (1 - u)); });
      tf(lid, 330, 196 - 10 * hump(seg(t, 2.5, 3.4)), -8 * hump(seg(t, 2.5, 3.4)));
    }
  };
}
