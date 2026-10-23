// fox：しげみの中にキツネがかくれていて、耳と目だけをそっと出す。気配に気づいたまめが「？」としげみを見る（例文 A fox was hiding in the bushes.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { scene, treeG, mark } from './nature.js';
import { beast } from './animal.js';

export const meta = { duration: 4.4, beats: [[0, 'しげみ'], [1.4, 'ガサッ'], [2.6, 'かくれている']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const { FY } = scene(k, { FY: 236, top: '#D3EBDD', bot: '#F2FAF5', ground: '#B6D99B', edge: '#A2CB86' });
  tf(treeG(k, 1.0, '#6BBF84', '#5DB36F').g, 330, FY - 30);
  const fg = g({}); fg.setAttribute('clip-path', k.clip((c) => el('rect', { x: 0, y: 0, width: 400, height: FY + 2 }, c)));
  const F = beast(k, 'fox', fg);
  // しげみ（キツネより手前）
  const bush = g({}); tf(bush, 250, FY + 4);
  k.shadow(0, 0, 80, 6, bush);
  const leaves = g({}, bush);
  [[-56, -20, 26], [-22, -30, 28], [22, -28, 28], [58, -18, 24], [0, -14, 30]].forEach(([x, y, r], i) => el('circle', { cx: x, cy: y, r, fill: i % 2 ? '#5DB36F' : '#6BBF84' }, leaves));
  [[-30, -40], [10, -46], [40, -30], [-50, -16]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 3, fill: '#F2685B' }, leaves));
  const tip = g({}); el('ellipse', { cx: 0, cy: 0, rx: 9, ry: 6, fill: '#F08A3E' }, tip); el('ellipse', { cx: -6, cy: 0, rx: 5, ry: 5, fill: '#fff' }, tip);
  const me = k.buddy({ x: -20, y: FY + 20, scale: 0.9 });
  const q = mark(k, '?', pal.blueDark);
  const xf = (t) => lerp(-20, 120, easeInOut(seg(t, 0.1, 1.4)));
  return {
    update(t) {
      const rustle = hump(seg(t, 1.3, 1.9));
      tf(leaves, Math.sin(t * 40) * 2 * rustle, 0, Math.sin(t * 30) * 2 * rustle);
      // 顔を出す→少し引っこめる（しげみの中）
      const peek = easeOut(seg(t, 1.9, 2.4)) - 0.15 * easeInOut(seg(t, 3.4, 3.8));
      F.set({ x: 250, y: FY + 40 - 62 * peek, s: 1.15, face: -1, head: -14 });
      tf(tip, 312, FY - 6 + Math.sin(t * 5) * 1.5, Math.sin(t * 5) * 10); tip.setAttribute('opacity', t > 2.0 ? 1 : 0);
      const w = walkTo(xf, t, -20);
      P(me, { x: w.x, y: FY + 20, walk: w.walk, armL: w.armL, armR: w.armR, lean: w.lean + 6 * easeInOut(seg(t, 2.4, 2.8)), look: 0.8, mood: t > 1.4 ? 'open' : 'smile', blink: blinkAt(t), lift: 5 * hump(seg(t, 1.3, 1.6)) });
      q.show(seg(t, 2.6, 3.0), w.x + 6, FY - 72);
    }
  };
}
