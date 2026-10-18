// at stake：カードゲームの台の中央に札束と金袋がどんどん積まれる。勝敗はまだ決まらず、汗をかいて山を見つめる（A lot of money is at stake in this game.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, clamp, backOut } from '../ease.js';
import { bill, coin } from './run-after.js';
import { hp } from './dig.js';
import { P, blinkAt, drop } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '勝負の前'], [1.2, 'お金を積む'], [3.0, '大金が懸かる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'evening' });
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#3A3F55' });
  el('path', { d: 'M 170 0 L 230 0 L 330 230 L 70 230 Z', fill: '#FFF3C4', opacity: 0.12 });
  el('rect', { x: 0, y: 236, width: 400, height: 64, fill: '#2C3044' });
  const G = k.buddy({ x: 70, y: 236 });
  const C = k.buddy({ x: 330, y: 236, facing: -1, color: pal.coral, dark: pal.coralDark });
  // 台
  k.shadow(200, 237, 130, 6);
  el('rect', { x: 80, y: 176, width: 240, height: 14, rx: 6, fill: '#2F8A5E', stroke: pal.woodDark, 'stroke-width': 4 });
  el('rect', { x: 186, y: 190, width: 28, height: 46, fill: pal.woodDark });
  const cards = (x, f) => { const c = g({}); [0, 1].forEach((i) => el('rect', { x: -8 + i * 8, y: -12, width: 14, height: 20, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5, transform: `rotate(${(i - 0.5) * 16})` }, c)); return c; };
  const cg = cards(), cc = cards();
  const pile = [];
  for (let i = 0; i < 9; i++) { const b = bill(k); pile.push(b); }
  const bag = g({}); el('path', { d: 'M -16 0 Q -20 -22 -6 -26 L 6 -26 Q 20 -22 16 0 Z', fill: '#C9A577' }, bag); el('rect', { x: -8, y: -32, width: 16, height: 8, rx: 3, fill: '#B08A5A' }, bag); k.text(0, -11, '$', { 'font-size': 14, fill: '#fff' }, bag);
  const coins = [0, 1, 2, 3, 4].map(() => coin(k));
  const sw = [0, 1].map(() => drop(k));
  return {
    update(t) {
      const push = (a) => hump(seg(t, a, a + 0.5));
      const pg = Math.max(push(0.6), push(1.6), push(2.6)), pc = Math.max(push(1.1), push(2.1));
      P(G, { facing: 1, armR: 70 + 20 * pg, armL: 60, lean: 6 + 8 * pg, look: t > 3 ? 0.7 : 0.5, mood: t > 2.2 ? 'flat' : 'smile', squash: 1 - 0.02 * Math.sin(t * 40) * seg(t, 3, 3.5), blink: blinkAt(t) });
      P(C, { facing: -1, armR: 70 + 20 * pc, armL: 60, lean: 6 + 8 * pc, look: 0.5, mood: t > 2.4 ? 'flat' : 'grin', blink: blinkAt(t, 1) });
      const h1 = hp(G, 1, 'L'), h2 = hp(C, 1, 'L');
      tf(cg, h1.x + 4, h1.y - 10, -10); tf(cc, h2.x - 4, h2.y - 10, 10);
      const n = Math.floor(lerp(1, 9.99, easeOut(seg(t, 0.6, 3.1))));
      pile.forEach((b, i) => { tf(b, 196 + ((i * 7) % 11) - 5, 166 - i * 5, (i % 3 - 1) * 8, 1.3); b.setAttribute('opacity', i < n ? 1 : 0); });
      tf(bag, 228, 176, 0, Math.max(0.001, backOut(seg(t, 2.6, 2.95))));
      coins.forEach((c, i) => { tf(c, 162 + i * 7, 170 - (i % 2) * 6); c.setAttribute('opacity', t > 1.1 + i * 0.3 ? 1 : 0); });
      sw.forEach((d, i) => { const q = ((t - 2.6 - i * 0.5) % 1); tf(d, 70 + (i ? 28 : -28), 150 + q * 26); d.setAttribute('opacity', t > 2.6 + i * 0.5 && q < 0.8 ? 1 : 0); });
    }
  };
}
