// accept：差し出された招待状を、彼女が手を伸ばして受け取り、うれしそうに胸に抱く（例文 She accepted the invitation.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, wobble } from '../ease.js';
import { hp, reach } from './dig.js';
import { bubble, heart } from './weigh.js';
import { STAR } from './agree.js';

export const meta = { duration: 4.0, beats: [[0, '招待状を渡される'], [1.5, '受け取る'], [3.0, 'よろこぶ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 150, y: 46, width: 100, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 200, y1: 46, x2: 200, y2: 110, stroke: '#fff', 'stroke-width': 4 });
  el('ellipse', { cx: 200, cy: 262, rx: 150, ry: 14, fill: '#F1D9CF' });
  const G = k.buddy({ x: 148, y: FY, facing: 1 });
  const C = k.buddy({ x: 252, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  const P = (b, o) => b.pose({ armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0, ...o });
  const card = g({});
  el('rect', { x: -15, y: -10, width: 30, height: 20, rx: 3, fill: '#fff', stroke: pal.blue, 'stroke-width': 2.5 }, card);
  el('path', { d: STAR, fill: pal.yellow, transform: 'scale(0.7)' }, card);
  el('rect', { x: -15, y: -2, width: 30, height: 4, fill: pal.coral, opacity: 0.7 }, card);
  const hands = [0, 1].map((i) => el('circle', { r: 6.5, fill: i ? pal.coral : pal.mint, stroke: i ? pal.coralDark : pal.mintDark, 'stroke-width': 2.5 }));
  const ok = bubble(k, 46, 36);
  el('circle', { r: 11, fill: 'none', stroke: pal.green, 'stroke-width': 4 }, ok);
  const hs = [0, 1, 2].map(() => heart(k, k.root));
  return {
    update(t) {
      const ext = easeInOut(seg(t, 0.5, 1.4)), take = easeInOut(seg(t, 1.5, 2.1)), back = easeInOut(seg(t, 2.2, 2.9));
      const gl = ext * (1 - seg(t, 2.0, 2.5));
      P(G, { armR: lerp(55, 88, ext) * (1 - seg(t, 2.1, 2.7)) + 8 * seg(t, 2.1, 2.7), lean: 4 * ext, look: 0.5, mood: 'smile' });
      const hg = hp(G, 1, 'R');
      P(C, { armR: lerp(8, 88, easeInOut(seg(t, 1.2, 1.9))) - 50 * back, look: 0.4, lean: 3 * back, squash: 1 - 0.05 * wobble(seg(t, 2.6, 3.6), 3, 4), mood: t > 2.5 ? 'grin' : 'smile', blink: t > 2.7 ? 0.8 : 0 });
      const hc = hp(C, 1, 'R');
      const pos = take < 1 ? { x: lerp(hg.x + 5, hc.x - 4, take), y: lerp(hg.y, hc.y, take) } : { x: hc.x - 4, y: hc.y };
      tf(card, pos.x, pos.y - 4, lerp(-10, 6, take) + 8 * back, 1);
      k.set(hands[0], { cx: hg.x, cy: hg.y, opacity: take < 0.99 ? 1 : 0 }); k.set(hands[1], { cx: hc.x, cy: hc.y });
      tf(ok, 252, 108, 0, Math.max(0.001, backOut(seg(t, 2.9, 3.3))));
      hs.forEach((h, i) => { const q = seg(t, 3.0 + i * 0.2, 3.9 + i * 0.1); tf(h, 232 + i * 20, 138 - 22 * q - i * 4, 0, hump(q) * 1.1 + 0.001); });
    }
  };
}
