// cotton：綿の実のふわふわ → 綿のシャツのタグに。シャツの袖にほおを寄せ、ぎゅっと抱いて気持ちよさそう（例文 This shirt is made of soft cotton, so it feels comfortable.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { wardrobe, P, blinkAt } from './skirt.js';
import { frontL } from './dig.js';
import { heart } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '綿の実'], [1.3, '綿のシャツ'], [2.6, 'やわらかくて快適']] };

export function boll(k, parent, r = 1) {
  const g = k.g({}, parent);
  [[-7, 0], [7, 0], [0, -7], [0, 4], [-4, -4], [4, -4]].forEach(([x, y]) => k.el('circle', { cx: x * r, cy: y * r, r: 7 * r, fill: '#fff', stroke: '#E4E0D6', 'stroke-width': 1.2 }, g));
  k.el('path', { d: `M ${-8 * r} ${8 * r} L 0 ${3 * r} L ${8 * r} ${8 * r} L ${4 * r} ${12 * r} L ${-4 * r} ${12 * r} Z`, fill: '#9B7A55' }, g);
  return g;
}

export function create(k) {
  const { el, g, pal, tf } = k, S = 1.4;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  el('rect', { x: 170, y: 46, width: 84, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // 綿の木（鉢植え）
  k.shadow(70, FY + 1, 28, 4);
  el('path', { d: `M 50 ${FY} L 46 ${FY - 34} L 94 ${FY - 34} L 90 ${FY} Z`, fill: pal.coral });
  el('path', { d: `M 70 ${FY - 34} L 70 ${FY - 120} M 70 ${FY - 70} L 46 ${FY - 104} M 70 ${FY - 84} L 96 ${FY - 116}`, stroke: '#7A8F5A', 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none' });
  [[46, FY - 104], [96, FY - 116], [70, FY - 124]].forEach(([x, y]) => tf(boll(k), x, y));
  const b = k.buddy({ x: 220, y: FY, scale: S });
  const W = wardrobe(k, b);
  W.top({ color: '#F8F5EE', dark: '#E2DCCD', sleeve: 'long', to: -14, collar: true });
  W.bottom({ kind: 'trousers', color: '#8DA2C2', dark: '#6F84A6', from: -14 });
  W.feet('shoe', pal.ink);
  const fl = frontL(b, S);
  // 飛んでいく綿 → シャツのタグ
  const fluff = boll(k, k.root, 0.8);
  const tag = g({});
  el('line', { x1: 0, y1: -8, x2: -10, y2: -22, stroke: pal.sub, 'stroke-width': 1.4 }, tag);
  el('rect', { x: -16, y: -8, width: 34, height: 26, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, tag);
  tf(boll(k, tag, 0.55), 1, 3);
  const soft = [0, 1, 2].map(() => el('path', { d: 'M 0 0 q 5 -5 10 0 q 5 5 10 0', fill: 'none', stroke: '#F4C9D6', 'stroke-width': 3, 'stroke-linecap': 'round' }));
  const hs = [0, 1].map(() => heart(k, k.root, pal.coral));
  return {
    update(t) {
      const fly = easeInOut(seg(t, 0.4, 1.3));
      const tagOn = t > 1.3;
      const sx = lerp(70, 220 + 18 * S, fly), sy = lerp(FY - 124, FY - 40 * S, fly) - 50 * hump(fly);
      tf(fluff, sx, sy, fly * 120, 1 + 0.06 * Math.sin(t * 8));
      fluff.setAttribute('opacity', t < 1.3 ? 1 : 0);
      tf(tag, 220 + 50, FY - 104, 4 * wobble(seg(t, 1.3, 2.2), 2, 4), tagOn ? easeOut(seg(t, 1.3, 1.6)) : 0.001);
      // 袖をなでる → 自分を抱きしめてほおずり
      const touch = easeInOut(seg(t, 1.5, 1.9)) * (1 - easeInOut(seg(t, 2.4, 2.6)));
      const hug = easeInOut(seg(t, 2.6, 3.0));
      const sway = Math.sin((t - 2.6) * 4) * 5 * hug;
      P(b, { x: 220, lean: sway - 4 * hug, squash: 1 - 0.03 * hug + 0.015 * Math.sin(t * 4) * hug, look: lerp(0.3, -0.3, touch), mood: hug > 0.5 ? 'grin' : 'smile',
        blink: hug > 0.5 ? 1 : blinkAt(t), armR: lerp(lerp(8, 70, touch), -150, hug) });
      fl.set(lerp(lerp(8, 70 + 10 * Math.sin(t * 10) * touch, touch), 120, hug));
      soft.forEach((n, i) => {
        const q = seg(t, 2.9 + i * 0.2, 3.9 + i * 0.2);
        tf(n, 220 + (i - 1) * 40 - 10, FY - 130 - 18 * q - (i % 2) * 8);
        n.setAttribute('opacity', hump(q));
      });
      hs.forEach((h, i) => { const q = seg(t, 3.3 + i * 0.3, 4.3); tf(h, 220 + (i ? 44 : -44), FY - 150 - 14 * q, 0, hump(q) + 0.001); });
    }
  };
}
