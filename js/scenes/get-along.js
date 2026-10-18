// get along：職場で同僚と笑って話し、ハイタッチする仲の良い関係（例文 I get along well with my coworkers.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { person, officeBg, pop } from './queue-up.js';
import { heart } from './weigh.js';

export const meta = { duration: 4.2, beats: [[0, '同僚と話す'], [1.8, 'ハイタッチ'], [3.6, '仲良し']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236);
  // 机（奥）
  [[20, 120], [262, 120]].forEach(([x, w]) => { el('rect', { x, y: 176, width: w, height: 8, rx: 3, fill: pal.wood }); el('rect', { x: x + 8, y: 184, width: 6, height: 52, fill: pal.woodDark }); el('rect', { x: x + w - 14, y: 184, width: 6, height: 52, fill: pal.woodDark }); el('rect', { x: x + 30, y: 146, width: 46, height: 30, rx: 3, fill: '#56607A' }); });
  const S = 0.85;
  const C2 = person(k, 'blue', { x: 330, y: FY + 6, scale: S, facing: -1 });
  const me = k.buddy({ x: 170, y: FY + 6, scale: S });
  const C1 = person(k, 'coral', { x: 232, y: FY + 6, scale: S, facing: -1 });
  const clap = g({});
  [0, 60, 120, 180, 240, 300].forEach((a) => el('line', { x1: 0, y1: -9, x2: 0, y2: -15, stroke: pal.yellowDark, 'stroke-width': 2.4, 'stroke-linecap': 'round', transform: `rotate(${a})` }, clap));
  const hs = [0, 1].map(() => { const h = g({}); heart(k, h, pal.coral); return h; });
  return {
    update(t) {
      const laugh = t < 1.6 ? Math.abs(Math.sin(t * 7)) : 0;
      const up = easeOut(seg(t, 1.5, 1.9)), down = easeInOut(seg(t, 2.3, 2.8));
      const hf = up * (1 - down);
      me.pose({ armR: lerp(20, 152, hf), lean: 4 * hf, look: 0.6, mood: t < 1.6 ? (laugh > 0.5 ? 'grin' : 'open') : 'grin', squash: 1 - 0.04 * laugh, lift: 5 * hump(seg(t, 1.85, 2.2)) });
      C1.pose({ armR: lerp(20, 152, hf), lean: 4 * hf, look: 0.6, mood: 'grin', squash: 1 - 0.04 * laugh, lift: 5 * hump(seg(t, 1.85, 2.2)) });
      C2.pose({ look: 0.7, mood: t > 1.9 ? 'grin' : 'smile', armR: 20 + 30 * hump(seg(t, 1.9, 2.5)), squash: 1 - 0.03 * laugh });
      const c = seg(t, 1.85, 2.3);
      clap.setAttribute('opacity', c > 0 && c < 1 ? 1 - c : 0); tf(clap, 201, FY - 84, 0, 0.6 + c);
      hs.forEach((h, i) => { const q = seg(t, 2.4 + i * 0.4, 3.8 + i * 0.4); h.setAttribute('opacity', q > 0 && q < 1 ? hump(q) : 0); tf(h, 186 + i * 34, FY - 100 - 34 * q, 0, pop(Math.min(1, q * 3))); });
    }
  };
}
