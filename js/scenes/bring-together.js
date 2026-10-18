// bring together：ちょうちんと太鼓のお祭り。左右からばらばらに来た人たちが、祭りの真ん中に集まり一緒に踊る（例文 The festival brings people together.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { gait } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, 'お祭り'], [1.6, '人が集まる'], [3.4, 'みんな一緒']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'evening' });
  el('path', { d: 'M 0 50 Q 200 90 400 50', stroke: pal.ink, 'stroke-width': 2, fill: 'none' });
  const lan = [40, 100, 160, 240, 300, 360].map((x) => { const y = 50 + 40 * (1 - Math.pow((x - 200) / 200, 2)); const l = g({}); el('ellipse', { rx: 11, ry: 14, fill: pal.red }, l); el('rect', { x: -6, y: -16, width: 12, height: 4, fill: pal.ink }, l); el('ellipse', { rx: 5, ry: 8, fill: pal.yellow, opacity: 0.6 }, l); return [l, x, y + 14]; });
  // 中央のやぐらと太鼓
  el('rect', { x: 160, y: 150, width: 80, height: 86, fill: '#B98A5E' });
  el('rect', { x: 150, y: 142, width: 100, height: 10, rx: 3, fill: '#8E6440' });
  const drum = g({}); tf(drum, 200, 128);
  el('ellipse', { rx: 22, ry: 14, fill: pal.coralDark }, drum); el('ellipse', { cx: 0, cy: -2, rx: 18, ry: 10, fill: '#F6E5C8' }, drum);
  const ppl = [[-40, 130, 0], [-90, 80, 1], [440, 270, 1], [490, 320, 0]].map(([x0, x1, c], i) => ({ b: k.buddy({ x: x0, y: FY + 4, scale: 0.7, facing: x0 < 0 ? 1 : -1, color: c ? pal.coral : pal.mint, dark: c ? pal.coralDark : pal.mintDark }), xf: (t) => lerp(x0, x1, easeInOut(seg(t, 0.3 + i * 0.15, 2.2 + i * 0.1))), x0 }));
  return {
    update(t) {
      lan.forEach(([l, x, y], i) => tf(l, x, y, Math.sin(t * 2 + i) * 6));
      tf(drum, 200, 128 - Math.abs(Math.sin(t * 6)) * 2);
      const dance = seg(t, 2.6, 2.9);
      ppl.forEach(({ b, xf, x0 }, i) => {
        const p = gait(xf, t, x0, 18);
        const ph = t * 6 + i;
        b.pose({ x: p.x, walk: p.walk, armL: lerp(p.armL, 130 + Math.sin(ph) * 30, dance), armR: lerp(p.armR, 130 - Math.sin(ph) * 30, dance), lift: dance * Math.abs(Math.sin(ph)) * 8, lean: p.lean, mood: dance > 0.5 ? 'grin' : 'smile', look: 0.4 });
      });
    }
  };
}
