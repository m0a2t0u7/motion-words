// bury the hatchet：けんかしていた二人が、斧を穴に埋めて仲直りの握手（例文 They finally buried the hatchet.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, 'にらみ合い'], [1.4, '斧を埋める'], [3.1, '握手で仲直り']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  const GX = 200;
  const a = k.buddy({ x: 105, y: FY, scale: 1 });
  const c = k.buddy({ x: 295, y: FY, scale: 1, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const base = { armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'flat', blink: 0, lift: 0 };

  // 穴と土
  el('ellipse', { cx: GX, cy: FY + 14, rx: 34, ry: 8, fill: '#6B5240' });
  const axeNode = () => {
    const h = g({});
    el('line', { x1: 0, y1: -10, x2: 0, y2: 26, stroke: pal.woodDark, 'stroke-width': 5, 'stroke-linecap': 'round' }, h);
    el('path', { d: 'M 2 -10 Q 16 -12 15 2 Q 10 -2 2 0 Z', fill: '#A9B3C2', stroke: '#7E8899', 'stroke-width': 1.5 }, h);
    return h;
  };
  const axeA = axeNode(), axeC = axeNode();
  const mound = g({});
  el('path', { d: 'M -40 0 Q -20 -26 0 -26 Q 22 -26 40 0 Z', fill: '#8A6A4E' }, mound);
  el('path', { d: 'M -22 -4 Q -10 -14 0 -14', fill: 'none', stroke: '#A68466', 'stroke-width': 3, 'stroke-linecap': 'round' }, mound);
  const heart = el('path', { d: 'M 0 8 C -16 -6 -8 -20 0 -10 C 8 -20 16 -6 0 8 Z', fill: pal.red });
  const clouds = el('path', { d: 'M 150 70 l 12 -8 l -4 10 l 14 -4', fill: 'none', stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0 });

  return {
    update(t) {
      const angry = t < 1.4;
      const toss = seg(t, 1.2, 2.0);
      const peace = seg(t, 3.0, 3.4);
      const dig = seg(t, 2.0, 2.9);
      // 近づいて握手
      const ax = lerp(105, 150, easeInOut(seg(t, 2.8, 3.4)));
      const cx = lerp(295, 250, easeInOut(seg(t, 2.8, 3.4)));
      const raise = angry ? 120 + 15 * Math.sin(t * 10) : lerp(120, 8, easeOut(seg(t, 1.2, 1.7)));
      const shake = peace > 0.5 ? Math.sin(t * 14) * 7 : 0;
      a.pose({ ...base, x: ax, armR: peace > 0 ? lerp(8, 82, peace) + shake : raise, armL: 10, lean: angry ? 8 : 0, look: 0.5, mood: peace > 0 ? 'grin' : angry ? 'flat' : 'smile' });
      c.pose({ ...base, x: cx, armR: peace > 0 ? lerp(8, 82, peace) - shake : raise, armL: 10, lean: angry ? 8 : 0, look: 0.5, mood: peace > 0 ? 'grin' : angry ? 'flat' : 'smile' });
      // 斧：手→放物線で穴へ→消える
      const hA = a.handPos('R'), hC = c.handPos('R');
      const pa = easeInOut(toss);
      const fA = lerp(hA.x, GX - 6, pa), yA = lerp(hA.y - 10, FY + 10, pa) - 70 * hump(toss);
      const fC = lerp(hC.x, GX + 6, pa), yC = lerp(hC.y - 10, FY + 10, pa) - 70 * hump(toss);
      tf(axeA, fA, yA, lerp(-20, 120, pa), 1, 1);
      tf(axeC, fC, yC, lerp(20, -120, pa), -1, 1);
      axeA.setAttribute('opacity', toss >= 1 ? 0 : 1);
      axeC.setAttribute('opacity', toss >= 1 ? 0 : 1);
      const mp = easeOut(dig);
      tf(mound, GX, FY + 12, 0, mp, mp);
      clouds.setAttribute('opacity', angry ? 0.8 : 0);
      const hp = backOut(seg(t, 3.3, 3.7), 2);
      tf(heart, GX, FY - 100 - 8 * Math.sin(t * 4), 0, hp, hp);
    }
  };
}
