// bring about：しおれた畑。まめが新しいやり方（回るスプリンクラー）を据えて動かすと、作物がぐんぐん育ち、畑の様子が大きく変わる（例文 The new method brought about great changes.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { hp } from './dig.js';
import { star } from './get-on-with.js';

export const meta = { duration: 4.4, beats: [[0, 'しおれた畑'], [1.4, '新しいやり方'], [3.4, '大きく変わった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: 236, width: 400, height: 64, fill: '#D9C3A3' });
  for (let i = 0; i < 4; i++) el('rect', { x: 0, y: 246 + i * 13, width: 400, height: 3, fill: '#C9AF8C' });
  // 作物（しおれ→元気）
  const plants = [150, 200, 250, 300, 350].map((x, i) => {
    const p = g({});
    const stem = el('path', { d: '', stroke: pal.green, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, p);
    const leafL = el('ellipse', { rx: 9, ry: 4, fill: pal.green }, p), leafR = el('ellipse', { rx: 9, ry: 4, fill: pal.green }, p);
    const fruit = el('circle', { r: 7, fill: pal.red }, p);
    return { p, stem, leafL, leafR, fruit, x, i };
  });
  // スプリンクラー（新しい道具）
  const sp = g({}), head = g({}, sp);
  el('rect', { x: -3, y: -40, width: 6, height: 40, fill: pal.sub }, sp);
  el('rect', { x: -12, y: -4, width: 24, height: 6, rx: 2, fill: pal.ink }, sp);
  el('rect', { x: -14, y: -3, width: 28, height: 6, rx: 3, fill: pal.blueDark }, head);
  el('circle', { r: 5, fill: pal.blue }, head);
  const tag = g({}, sp); star(k, tag, 7, pal.yellow); tf(tag, 10, -24);
  const drops = Array.from({ length: 14 }, () => el('circle', { r: 2.6, fill: pal.water }));
  const b = k.buddy({ x: 70, y: FY, scale: 0.9 });
  const sparks = [0, 1, 2].map(() => { const s = g({}); star(k, s, 8); return s; });
  return {
    update(t) {
      // まめ：スプリンクラーを持って来て地面に挿す→スイッチを入れる
      const carry = easeInOut(seg(t, 0.2, 1.1)), plant = easeOut(seg(t, 1.1, 1.4));
      b.pose({ x: lerp(40, 70, carry), walk: carry > 0 && carry < 1 ? t * 9 : 0, armR: lerp(60, 30, plant) + 30 * hump(seg(t, 1.5, 1.8)), lean: 8 * plant * (1 - seg(t, 1.8, 2.1)), look: 0.6, mood: t > 2.6 ? 'grin' : 'smile', lift: hump(seg(t, 3.4, 3.8)) * 10 });
      const h = hp(b, 0.9);
      const sx = plant < 1 ? h.x + 6 : 118, sy = plant < 1 ? lerp(h.y + 30, 248, plant) : 248;
      tf(sp, sx, sy, 0);
      const on = seg(t, 1.8, 2.0);
      tf(head, 0, -40, on > 0 ? (t - 1.8) * 400 : 0, 1, 1);
      drops.forEach((d, i) => {
        const q = (t * 1.6 + i / drops.length) % 1, dir = i % 2 ? 1 : 0.6;
        k.set(d, { cx: sx + q * 240 * dir, cy: sy - 40 - Math.sin(q * Math.PI) * 60 + q * 30, opacity: on * hump(q) });
      });
      // 作物：水がかかると順に起き上がり、大きく育って実がなる
      plants.forEach((pl) => {
        const g0 = easeOut(seg(t, 2.0 + pl.i * 0.2, 3.4 + pl.i * 0.15));
        const H = lerp(20, 70, g0), droop = lerp(16, 0, g0);
        const tx = pl.x + droop, ty = 238 - H + droop * 0.6;
        k.set(pl.stem, { d: `M ${pl.x} 238 Q ${pl.x} ${238 - H * 0.6} ${tx} ${ty}`, stroke: g0 > 0.3 ? pal.green : '#A9A57A' });
        [pl.leafL, pl.leafR].forEach((lf, j) => k.set(lf, { cx: pl.x + (j ? 9 : -9) * (0.6 + g0 * 0.6), cy: 238 - H * 0.4, rx: 6 + 6 * g0, transform: `rotate(${(j ? 1 : -1) * lerp(40, -20, g0)} ${pl.x + (j ? 9 : -9)} ${238 - H * 0.4})`, fill: g0 > 0.3 ? pal.green : '#A9A57A' }));
        k.set(pl.fruit, { cx: tx, cy: ty - 4, r: 8 * backOut(seg(g0, 0.6, 1)), opacity: g0 > 0.6 ? 1 : 0 });
      });
      sparks.forEach((s, i) => { const q = seg(t, 3.5 + i * 0.15, 4.2 + i * 0.15); tf(s, 190 + i * 70, 140 - q * 16, q * 90, easeOut(q) * (1 - seg(q, 0.8, 1))); s.setAttribute('opacity', q > 0 ? 1 : 0); });
    }
  };
}
