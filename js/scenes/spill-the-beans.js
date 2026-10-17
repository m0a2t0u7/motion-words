// spill the beans：パーティーの秘密（風船）を入れた瓶をうっかり倒して豆がこぼれ、秘密が相手に伝わる（例文 Don't spill the beans about the party.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '秘密を内緒に'], [1.5, '豆がこぼれる'], [3.0, '相手に伝わる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  const A = k.buddy({ x: 105, y: FY, scale: 1.0 });
  const B = k.buddy({ x: 305, y: FY, scale: 1.0, facing: -1, color: pal.coral, dark: pal.coralDark });
  // 瓶（原点＝瓶の底中央）
  const jar = g({});
  el('path', { d: 'M -16 -44 L -16 -4 Q -16 0 -12 0 L 12 0 Q 16 0 16 -4 L 16 -44 Z', fill: '#EAF6FB', stroke: '#B8CBD8', 'stroke-width': 2.5 }, jar);
  const fill = el('rect', { x: -13, y: -26, width: 26, height: 23, rx: 4, fill: pal.coffee }, jar);
  el('rect', { x: -18, y: -52, width: 36, height: 9, rx: 3, fill: pal.sub }, jar);
  const bal = g({ transform: 'translate(0 -36)' }, jar);
  el('ellipse', { cx: 0, cy: -3, rx: 6, ry: 7.5, fill: pal.red }, bal);
  const beans = [];
  for (let i = 0; i < 9; i++) {
    beans.push(el('ellipse', { rx: 4.5, ry: 3, fill: pal.coffee, stroke: '#6B4129', 'stroke-width': 1 }));
  }
  // 内緒のしるし
  const shh = g({});
  el('circle', { r: 14, fill: '#fff', stroke: pal.sub, 'stroke-width': 2 }, shh);
  k.text(0, 1, 'shh', { 'font-size': 11, fill: pal.sub }, shh);
  // 伝わる吹き出し（風船）
  const bub = g({});
  el('ellipse', { rx: 34, ry: 26, fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 2.5 }, bub);
  el('path', { d: 'M 0 16 L -8 40 L 12 24 Z', fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 2.5 }, bub);
  el('ellipse', { rx: 33, ry: 24, fill: '#fff' }, bub);
  el('ellipse', { cx: -8, cy: -4, rx: 8, ry: 10, fill: pal.red }, bub);
  el('ellipse', { cx: 10, cy: -2, rx: 8, ry: 10, fill: pal.blue }, bub);
  el('line', { x1: -8, y1: 6, x2: -2, y2: 16, stroke: pal.sub, 'stroke-width': 1.5 }, bub);
  el('line', { x1: 10, y1: 8, x2: -2, y2: 16, stroke: pal.sub, 'stroke-width': 1.5 }, bub);
  const ex = g({});
  k.text(0, 0, '!', { 'font-size': 28, fill: pal.red }, ex);
  return {
    update(t) {
      const tip = easeInOut(seg(t, 1.2, 1.9));
      const oops = t >= 1.2;
      A.pose({
        armR: t < 0.6 ? lerp(8, 140, easeOut(seg(t, 0.3, 0.6))) : t < 1.0 ? 140 : lerp(140, 95, easeOut(seg(t, 1.0, 1.4))),
        armL: t < 1.0 ? 8 : 8,
        mood: t < 1.0 ? 'flat' : t < 2.9 ? 'open' : 'sad', look: 0.2,
        lean: oops ? 8 * easeOut(seg(t, 1.2, 1.6)) : 0, blink: 0
      });
      B.pose({ armR: 8, armL: 8, look: -0.4, mood: t > 3.0 ? 'open' : 'smile', lift: 12 * hump(seg(t, 3.0, 3.5)), squash: 1 - 0.0 });
      // 指を口に（ひみつ）
      const hp = A.handPos('R');
      tf(shh, hp.x + 8, hp.y - 18, 0, t < 1.1 ? backOut(seg(t, 0.4, 0.7), 2) : 1 - easeOut(seg(t, 1.1, 1.4)));
      // 瓶：持つ → 傾く
      if (t < 1.2) { tf(jar, 160, FY - 62 + 1.2 * Math.sin(t * 20) * (t > 0.7 ? 1 : 0), 0); }
      else {
        const h = A.handPos('R');
        tf(jar, 160 + 8 * tip, FY - 62 + 8 * tip, tip * 100);
      }
      fill.setAttribute('height', lerp(23, 4, easeIn(seg(t, 1.4, 2.4))));
      fill.setAttribute('y', -3 - parseFloat(fill.getAttribute('height')));
      bal.setAttribute('opacity', t < 1.45 ? 1 : 0);
      beans.forEach((b, i) => {
        const s = 1.4 + i * 0.12, p = seg(t, s, s + 0.65);
        const x = lerp(176, 196 + i * 11, p), y = lerp(FY - 56, FY - 4, easeIn(p)) - Math.sin(Math.min(1, p * 1.2) * Math.PI) * 6;
        tf(b, x, y - 3 * Math.abs(wobble(seg(p, 0.9, 1.5), 2, 4)), p * 360 + i * 30);
        b.setAttribute('opacity', p > 0 ? 1 : 0);
      });
      // 秘密が相手へ
      const bp = backOut(seg(t, 2.6, 3.1), 1.8);
      tf(bub, 210, 82, 0, bp, bp);
      bub.setAttribute('opacity', t < 2.6 ? 0 : 1);
      const ep = backOut(seg(t, 3.1, 3.5), 2.2);
      tf(ex, 305, FY - 112, 0, ep, ep);
      ex.setAttribute('opacity', t < 3.1 ? 0 : 1);
    }
  };
}
