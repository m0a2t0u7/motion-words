// hold out：水につかった家の屋根の上で、2人が寄りそって耐え、最後に救助のボートが来る（例文 They held out until help arrived.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { rain } from './work-on.js';

export const meta = { duration: 4.6, beats: [[0, '屋根で待つ'], [2.0, '耐えつづける'], [3.8, '助けが来た']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 300, mood: 'outdoor' });
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#5A6480', opacity: 0.25 });
  [[60, 50], [300, 40]].forEach(([x, y]) => [[0, 0, 26], [26, 6, 20], [-24, 8, 18]].forEach(([dx, dy, r]) => el('circle', { cx: x + dx, cy: y + dy, r, fill: '#AEB8C6' })));
  // 家（下は水の中）
  el('rect', { x: 110, y: 190, width: 140, height: 110, fill: '#FBE9DC' });
  el('rect', { x: 130, y: 210, width: 30, height: 26, rx: 3, fill: '#CFE9F7' });
  el('path', { d: 'M 96 196 L 180 150 L 264 196 Z', fill: pal.coral, stroke: pal.coral, 'stroke-width': 8, 'stroke-linejoin': 'round' });
  const S = 0.72;
  const A = k.buddy({ x: 162, y: 162, scale: S }), B = k.buddy({ x: 198, y: 162, scale: S, color: pal.coral, dark: pal.coralDark, facing: -1 });
  [A, B].forEach((b) => b.g.children[0].setAttribute('opacity', 0));
  // 救助ボート
  const boat = g({});
  const R = k.buddy({ parent: boat, x: 4, y: -12, scale: 0.6, color: pal.blue, dark: pal.blueDark, facing: -1 });
  R.g.children[0].setAttribute('opacity', 0);
  el('path', { d: 'M -46 -14 L 46 -14 L 36 6 L -36 6 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, boat);
  el('rect', { x: -46, y: -16, width: 92, height: 5, rx: 2, fill: pal.red }, boat);
  const oar = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: pal.woodDark, 'stroke-width': 4, 'stroke-linecap': 'round' });
  const water = el('path', { d: '', fill: '#7FB3E0', opacity: 0.92 });
  const drops = rain(k, 30, 300);
  return {
    update(t) {
      const lv = 238;
      let d = `M 0 300 L 0 ${lv}`;
      for (let x = 0; x <= 400; x += 20) d += ` L ${x} ${(lv + 4 * Math.sin(x * 0.05 + t * 3)).toFixed(1)}`;
      k.set(water, { d: d + ' L 400 300 Z' });
      drops(t, 1);
      const shiv = Math.sin(t * 40) * 0.8 * (1 - seg(t, 3.6, 3.9));
      const cheer = easeOut(seg(t, 3.8, 4.1));
      A.pose({ x: 164 + shiv, armR: lerp(60, 160, cheer), armL: 10, lean: lerp(6, -4, cheer), squash: 0.94, look: lerp(0.5, 1, cheer), mood: cheer > 0.5 ? 'grin' : 'flat' });
      B.pose({ x: 196 - shiv, armR: lerp(60, 30, cheer), armL: 10, lean: lerp(6, -2, cheer), squash: 0.94, facing: cheer > 0.3 ? 1 : -1, look: lerp(0.5, 1, cheer), mood: cheer > 0.5 ? 'grin' : 'flat' });
      const bx = lerp(470, 300, easeOut(seg(t, 2.8, 4.2)));
      const by = lv + 6 + 3 * Math.sin(t * 3);
      tf(boat, bx, by, 2 * Math.sin(t * 2.4));
      const row = Math.sin(t * 6) * (t < 4.2 ? 1 : 0.2);
      R.pose({ armR: 70 + 30 * row, armL: 10, look: 0.5, mood: 'smile', lean: 6 });
      k.set(oar, { x1: bx - 8 + 10 * row, y1: by - 46, x2: bx + 6 - 18 * row, y2: by + 14 });
    }
  };
}
