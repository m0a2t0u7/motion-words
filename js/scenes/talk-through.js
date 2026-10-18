// talk through：相手がボードの手順1→2→3を順に指しながら説明し、まめが1つずつうなずいて分かっていく（例文 Can you talk me through the steps?）
const clampf = (v) => Math.min(1, Math.max(0, v));
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { roomBg, say, faceAt, held, reach } from './look-over.js';

export const meta = { duration: 4.6, beats: [[0, '手順のボード'], [1.6, '順に説明'], [3.9, '全部わかった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'office', 240);
  el('rect', { x: 150, y: 50, width: 236, height: 92, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  const xs = [190, 268, 346];
  const boxes = xs.map((x, i) => { el('rect', { x: x - 28, y: 72, width: 56, height: 46, rx: 8, fill: '#F2F5F9', stroke: pal.line, 'stroke-width': 2 }); k.text(x, 95, String(i + 1), { 'font-size': 22, fill: pal.blueDark }); return el('rect', { x: x - 28, y: 72, width: 56, height: 46, rx: 8, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 4, opacity: 0 }); });
  [229, 307].forEach((x) => el('path', { d: `M ${x - 8} 95 l 12 0 m -5 -5 l 5 5 l -5 5`, fill: 'none', stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  const chks = xs.map((x) => el('path', { d: `M ${x + 12} 66 l 5 5 l 10 -12`, fill: 'none', stroke: pal.green, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 }));
  const b = k.buddy({ x: 34, y: FY, scale: 0.85 });
  const o = k.buddy({ x: 140, y: FY, scale: 0.9, color: pal.coral, dark: pal.coralDark });
  const stick = g({}); el('line', { x1: 0, y1: 0, x2: 0, y2: 54, stroke: pal.woodDark, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, stick);
  return {
    update(t) {
      const idx = Math.min(2, Math.max(0, Math.floor((t - 0.8) / 1.0)));
      const pi = Math.max(0, Math.min(2, (t - 0.8) / 1.0)), fi = Math.floor(pi), fr = easeInOut(clampf((pi - fi) / 0.35));
      const tx = lerp(xs[fi], xs[Math.min(2, fi + 1)], t > 0.8 ? 0 : 0) , txx = fi < 2 && pi - fi > 0.65 ? xs[fi] : xs[fi];
      o.pose({ x: 140, facing: 1, armL: 10, mood: t > 0.8 && Math.sin(t * 13) > 0 ? 'open' : 'smile', look: 0.6 });
      const prev = fi > 0 ? xs[fi - 1] : 140, aim = lerp(prev, xs[fi], t > 0.8 ? fr : 0);
      o.pose({ armR: t > 0.5 ? lerp(20, reach(o, 0.9, 'R', aim, 118), easeOut(seg(t, 0.5, 0.8))) + 3 * Math.sin(t * 7) : 20 });
      faceAt(o, -4, -4);
      held(k, o, 0.9, stick, 'R', 0);
      boxes.forEach((r, i) => r.setAttribute('opacity', t > 0.8 + i && t < 1.8 + i ? 1 : 0));
      chks.forEach((c, i) => c.setAttribute('opacity', seg(t, 1.5 + i, 1.7 + i)));
      const nod = Math.max(0, Math.sin((t - 1.5) * 6.28)) * (t > 1.5 && t < 4.0);
      b.pose({ lean: 4 + 5 * nod, mood: t > 3.8 ? 'grin' : 'smile', look: 0.8, armR: 8 + 120 * easeOut(seg(t, 3.9, 4.2)) * 0 + 10 });
      faceAt(b, 5, lerp(-4, -2, nod));
    }
  };
}
