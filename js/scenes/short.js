// short：長かった髪を切って短くなる（例文 She has short hair.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';

export const meta = { duration: 3.8, beats: [[0, '長い髪'], [1.3, '切る'], [2.8, '短い髪']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 200, y: FY + 4, scale: 1, color: pal.coral, dark: pal.coralDark });
  const hc = '#7A4A2B';
  // 後ろ髪（体の後ろ）と前髪（体の前）
  const back = g({}); b.body.insertBefore(back, b.body.children[1]);
  const front = g({}, b.body);
  const strands = [-1, 1].map((s) => { const n = g({}, back); el('rect', { x: s * 33 - 6, y: 0, width: 12, height: 84, rx: 6, fill: hc }, n); return n; });
  el('path', { d: 'M -31 -62 Q -32 -94 0 -94 Q 32 -94 31 -62 Q 18 -78 0 -76 Q -18 -78 -31 -62 Z', fill: hc }, front);
  // 切った毛と、切る合図
  const bits = [0, 1, 2, 3].map(() => el('rect', { width: 9, height: 4, rx: 2, fill: hc }));
  return {
    update(t) {
      const cut = easeInOut(seg(t, 1.5, 2.2));
      const len = lerp(1, 0.16, cut);
      strands.forEach((n, i) => { tf(n, 0, -76, 0, 1, len); });
      const wave = Math.sin(t * 12) * 6 * hump(seg(t, 1.3, 2.3));
      const hand = seg(t, 0.9, 1.4) * (1 - seg(t, 2.3, 2.8));
      P(b, { y: FY + 4, armR: lerp(8, 150 + wave, hand), lean: 2 * hump(seg(t, 1.3, 2.3)), mood: t < 1.3 ? 'flat' : t < 2.5 ? 'open' : 'grin', look: 0.2, blink: blinkAt(t), armL: 8 + 4 * Math.sin(t * 3) * seg(t, 2.6, 3.8) });
      bits.forEach((n, i) => {
        const p = seg(t, 1.7 + i * 0.12, 2.8 + i * 0.1), x = 150 + i * 28 + Math.sin(p * 9 + i) * 6, y = lerp(112, FY + 2, p * p);
        n.setAttribute('opacity', p > 0 ? 1 : 0); tf(n, x, y, p * 200 + i * 40);
      });
    }
  };
}
