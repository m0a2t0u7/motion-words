// read between the lines：丁寧な文面の行と行のすきまに、書かれていない本音が浮かび上がる。それを読み取る（I read between the lines of his polite email.）
import { seg, lerp, easeOut, backOut, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '丁寧なメール'], [1.3, '行間を見る'], [3.2, '本音に気づく']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  // 書いた人（右端、にこやか）
  const wr = k.buddy({ x: 366, y: 238, facing: -1, color: pal.coral, dark: pal.coralDark });
  // メール用紙
  el('rect', { x: 146, y: 34, width: 180, height: 156, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  el('path', { d: 'M 158 46 L 176 60 L 194 46', fill: 'none', stroke: pal.sub, 'stroke-width': 2.4, 'stroke-linejoin': 'round' });
  const lines = [[68, 150], [98, 130], [128, 150], [158, 110]];
  lines.forEach(([y, w]) => el('rect', { x: 160, y, width: w, height: 8, rx: 4, fill: pal.blue, opacity: 0.55 }));
  // 行間に浮かぶ本音
  const hid = [83, 113, 143].map((y, i) => {
    const gp = g({}); tf(gp, 166, y);
    const p = el('path', { d: 'M 0 0 q 6 -7 12 0 t 12 0 t 12 0 t 12 0', fill: 'none', stroke: pal.red, 'stroke-width': 3, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, gp);
    const mk = k.text(i === 1 ? 118 : 86, 0, i === 0 ? '!' : i === 1 ? '?!' : '...', { 'font-size': 17, fill: pal.red }, gp);
    return { gp, p, mk };
  });
  const me = k.buddy({ x: 84, y: 238 });
  const bulb = g({});
  el('circle', { r: 12, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2.5 }, bulb);
  el('rect', { x: -5, y: 11, width: 10, height: 7, rx: 2, fill: pal.sub }, bulb);
  for (let i = 0; i < 5; i++) { const a = (-90 + (i - 2) * 40) * Math.PI / 180; el('line', { x1: Math.cos(a) * 18, y1: Math.sin(a) * 18, x2: Math.cos(a) * 25, y2: Math.sin(a) * 25, stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linecap': 'round' }, bulb); }
  const gaps = [83, 113, 143];
  return {
    update(t) {
      let target = 0;
      const idx = t < 1.2 ? -1 : t < 1.9 ? 0 : t < 2.6 ? 1 : t < 3.2 ? 2 : -1;
      if (idx >= 0) target = gaps[idx];
      const ptP = easeOut(seg(t, 1.0, 1.4));
      const angle = idx >= 0 ? Math.atan2(150 - 111, target - 182) * 180 / Math.PI : 20;
      const sw = seg(t, 3.2, 3.5);
      me.pose({
        armR: lerp(8, idx >= 0 ? angle : 70, ptP) * (1 - sw) + 160 * sw * 0 + sw * 8,
        armL: 8, lean: 3 * ptP * (1 - sw), look: 0.8, mood: t < 1.3 ? 'smile' : t < 3.2 ? 'flat' : 'grin',
        squash: 1 + 0.02 * Math.sin(t * 5) * sw
      });
      wr.pose({ mood: 'smile', look: -0.4, armL: 8, armR: 8 });
      hid.forEach((h, i) => {
        const p = easeOut(seg(t, 1.2 + i * 0.7, 1.8 + i * 0.7));
        h.p.setAttribute('stroke-dashoffset', 1 - p);
        h.mk.setAttribute('opacity', p);
      });
      const bp = backOut(seg(t, 3.3, 3.7), 2);
      tf(bulb, 100, lerp(124, 98, easeOut(seg(t, 3.3, 3.7))), 0, bp, bp);
    }
  };
}
