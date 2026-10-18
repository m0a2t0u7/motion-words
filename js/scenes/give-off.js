// give off：花びんの花から甘い香り（ピンクの波線）が立ちのぼり、近づいたまめが香りをかいでうっとりする（例文 The flowers give off a sweet smell.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { gait } from './dig.js';
import { table } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, '咲いた花'], [1.4, '香りが広がる'], [3.2, 'いいにおい']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const TY = table(k, 230);
  const FY = 236;
  el('rect', { x: 40, y: 50, width: 90, height: 70, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // 花びんと花
  const vx = 300;
  el('path', { d: `M ${vx - 14} ${TY - 2} Q ${vx - 20} ${TY - 26} ${vx - 8} ${TY - 38} L ${vx + 8} ${TY - 38} Q ${vx + 20} ${TY - 26} ${vx + 14} ${TY - 2} Z`, fill: pal.blue });
  el('ellipse', { cx: vx, cy: TY - 1, rx: 18, ry: 3, fill: pal.shadow });
  const fl = [[-22, -86, pal.coral], [0, -100, pal.violet], [22, -84, pal.coral], [-10, -72, pal.yellow], [12, -70, pal.violet]];
  const heads = fl.map(([dx, dy, c], i) => {
    el('path', { d: `M ${vx} ${TY - 36} Q ${vx + dx * 0.4} ${TY - 60} ${vx + dx} ${TY + dy + 8}`, stroke: pal.green, 'stroke-width': 3, fill: 'none' });
    const h = g({});
    for (let j = 0; j < 5; j++) el('ellipse', { cx: 0, cy: -7, rx: 5, ry: 7, fill: c, transform: `rotate(${j * 72})` }, h);
    el('circle', { r: 4, fill: pal.yellowDark }, h);
    return [h, vx + dx, TY + dy];
  });
  el('ellipse', { cx: vx - 30, cy: TY - 52, rx: 9, ry: 4, fill: pal.green, transform: `rotate(-30 ${vx - 30} ${TY - 52})` });
  // 香りの波線
  const waves = Array.from({ length: 6 }, (_, i) => el('path', { d: '', stroke: '#F59BB5', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }));
  const b = k.buddy({ x: 60, y: FY, scale: 0.95 });
  const xf = (t) => lerp(60, 200, easeInOut(seg(t, 1.0, 2.2)));
  return {
    update(t) {
      heads.forEach(([h, x, y], i) => tf(h, x + Math.sin(t * 1.5 + i) * 1.2, y, Math.sin(t * 1.2 + i) * 6));
      // 波線：花から立ちのぼり、左（まめの方）へ流れる
      waves.forEach((w, i) => {
        const ph = (t * 0.45 + i / waves.length) % 1, on = clamp(seg(t, 0.2, 1.0) * 3 - i * 0.4);
        const x0 = vx - ph * 130 - i * 3, y0 = TY - 100 - ph * 30 + (i % 3) * 10;
        let d = `M ${x0} ${y0}`;
        for (let s = 1; s <= 4; s++) d += ` q 5 ${s % 2 ? -6 : 6} 10 0`;
        k.set(w, { d, opacity: (on > 0 ? 1 : 0) * hump(ph) * 0.9 });
      });
      const p = gait(xf, t, 60);
      const sniff = easeInOut(seg(t, 2.3, 2.8));
      const breathe = sniff * Math.max(0, Math.sin((t - 2.3) * 7)) * (1 - seg(t, 3.4, 3.6));
      b.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: p.armR, lean: p.lean + 14 * sniff, look: 0.7, squash: 1 + 0.04 * breathe,
        blink: t > 2.9 ? 0.9 : 0, mood: t > 3.0 ? 'grin' : 'smile', lift: 0 });
    }
  };
}
