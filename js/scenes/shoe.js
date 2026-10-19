// shoe：小さすぎる靴を履いて、かかとがはみ出し、よろよろとしか歩けない（例文 These shoes are too small for me, so I can't walk well.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { wardrobe, P, blinkAt } from './skirt.js';
import { star } from './get-on-with.js';
import { mark } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '小さい靴'], [1.0, 'よろよろ歩く'], [3.2, 'うまく歩けない']] };

export function create(k) {
  const { el, g, pal, tf } = k, S = 1.6;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#E9EDF2' });
  for (let x = 0; x < 400; x += 50) el('rect', { x, y: FY + 2, width: 48, height: 62, fill: '#F3F5F8' });
  // ベンチ
  k.shadow(330, FY + 1, 50, 4);
  el('rect', { x: 284, y: 196, width: 94, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 284, y: 180, width: 94, height: 7, rx: 3, fill: pal.wood });
  [292, 368].forEach((x) => el('rect', { x: x - 3, y: 204, width: 6, height: 32, fill: pal.woodDark }));
  // 拡大図：足が靴に入りきらない
  const zoom = g({}); tf(zoom, 318, 92);
  el('circle', { r: 44, fill: '#fff', stroke: pal.line, 'stroke-width': 3 }, zoom);
  el('path', { d: 'M -32 2 Q -34 -14 -18 -14 L 10 -12 Q 32 -8 32 6 Q 32 16 20 16 L -24 16 Q -34 16 -32 2 Z', fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2 }, zoom);
  el('path', { d: 'M -4 -8 L 12 -9 Q 34 -6 34 8 Q 34 18 22 18 L -4 18 Z', fill: pal.red }, zoom);
  el('rect', { x: -5, y: 16, width: 40, height: 5, rx: 2.5, fill: pal.ink }, zoom);
  const lines = g({}, zoom);
  [[-6, -24, -12, -32], [6, -26, 8, -35], [18, -22, 26, -30]].forEach(([a, b2, c, d]) => el('line', { x1: a, y1: b2, x2: c, y2: d, stroke: pal.coralDark, 'stroke-width': 3, 'stroke-linecap': 'round' }, lines));
  const b = k.buddy({ x: 100, y: FY, scale: S });
  const W = wardrobe(k, b);
  W.top({ color: pal.blue, dark: pal.blueDark, sleeve: 'short', to: -16 });
  W.bottom({ kind: 'trousers', color: '#596377', dark: '#444D5F', from: -16 });
  // 大きな足に小さな靴（かかとが出る）
  W.legs.forEach((l) => {
    el('path', { d: 'M -11 13 L 6 13 Q 16 14 16 19 Q 16 22.5 11 22.5 L -11 22.5 Q -14 22.5 -14 18 Q -14 13 -11 13 Z', fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 1.5 }, l);
    el('path', { d: 'M 0 15 L 7 14.5 Q 17 15 17 19.5 Q 17 23.5 12 23.5 L 0 23.5 Z', fill: pal.red }, l);
    el('rect', { x: -1, y: 21.5, width: 19, height: 3, rx: 1.5, fill: pal.ink }, l);
  });
  const pain = [0, 1].map(() => star(k, k.root, 7, pal.yellowDark));
  const ex = mark(k, 'bang', k.root, 1.3);
  // 小刻みに少しずつしか進めない
  const xf = (t) => 100 + 70 * easeInOut(seg(t, 0.8, 3.1)) + 4 * Math.sin(seg(t, 0.8, 3.1) * Math.PI * 6);
  return {
    update(t) {
      const w = seg(t, 0.8, 3.1);
      const ph = w * Math.PI * 6;
      const wob = Math.sin(ph) * 9 * hump(w);
      const stop = easeOut(seg(t, 3.1, 3.4));
      P(b, { x: xf(t), lean: wob + 4 * stop, squash: 1 - 0.05 * Math.abs(Math.sin(ph)) * hump(w), armL: 40 + 30 * Math.abs(Math.sin(ph)) * hump(w), armR: 40 + 30 * Math.abs(Math.cos(ph)) * hump(w),
        lift: 0, look: lerp(0, 0.6, stop), mood: t > 0.6 ? (t > 3.2 ? 'sad' : 'open') : 'flat', blink: blinkAt(t) });
      // 片足ずつ少しだけ持ち上げる（ちょこちょこ）
      W.legs.forEach((l, i) => {
        const up = Math.max(0, Math.sin(ph + i * Math.PI)) * 4 * hump(w);
        l.setAttribute('transform', `translate(${i ? 12 : -12} ${-14 - up}) rotate(${(i ? -1 : 1) * 6 * hump(w)})`);
      });
      pain.forEach((s, i) => {
        const q = seg(t, 1.2 + i * 0.9, 1.9 + i * 0.9);
        tf(s, xf(t) + (i ? 34 : -30), FY - 6, q * 60, hump(q) * 1.2 + 0.001);
      });
      tf(ex, xf(t) + 40, FY - 150, 0, t > 3.2 ? easeOut(seg(t, 3.2, 3.5)) * 1.4 : 0.001);
      tf(zoom, 318, 92, 0, t < 0.3 ? 0.001 : easeOut(seg(t, 0.3, 0.7)));
      lines.setAttribute('opacity', Math.sin(t * 14) > 0 ? 1 : 0.3);
      void wobble;
    }
  };
}
