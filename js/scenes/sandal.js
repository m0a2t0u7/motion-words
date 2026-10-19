// sandal：サンダルをはいて砂浜を波打ちぎわに沿って歩く。砂に足あと（例文 I like to wear sandals when I walk along the beach.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { wardrobe, gait, P, blinkAt } from './skirt.js';
import { heart } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, 'サンダルで'], [1.2, '浜辺を歩く'], [3.4, '気持ちいい']] };

export function beachBg(k, FY = 236) {
  const { el, pal } = k;
  k.backdrop({ floorY: FY });
  el('rect', { x: 0, y: 150, width: 400, height: FY - 150, fill: '#7CC6EC' });
  el('rect', { x: 0, y: 150, width: 400, height: 6, fill: '#A6DAF3' });
  el('rect', { x: 0, y: FY - 30, width: 400, height: 330, fill: '#F6E3B9' });
  const wave = el('path', { fill: '#BFE6F7' });
  el('circle', { cx: 64, cy: 60, r: 24, fill: pal.yellow });
  return (t) => k.set(wave, { d: `M 0 ${FY - 30} L 400 ${FY - 30} L 400 ${FY - 24 + 4 * Math.sin(t * 2)} ` + Array.from({ length: 9 }, (_, i) => `Q ${400 - i * 50 - 25} ${FY - 18 + 4 * Math.sin(t * 2 + i)} ${400 - (i + 1) * 50} ${FY - 24 + 4 * Math.sin(t * 2)}`).join(' ') + ' Z' });
}

export function create(k) {
  const { el, pal, tf } = k, S = 1.5;
  const FY = 240;
  const waves = beachBg(k, FY);
  const prints = Array.from({ length: 10 }, (_, i) => {
    const g = k.g({});
    el('rect', { x: -10, y: -2.5, width: 20, height: 5, rx: 2.5, fill: '#E3C892' }, g);
    el('path', { d: 'M -3 -2 L 1 2 M 3 -2 L 1 2', stroke: '#D4B47A', 'stroke-width': 1.4 }, g);
    return g;
  });
  const b = k.buddy({ x: 60, y: FY, scale: S });
  const W = wardrobe(k, b);
  W.top({ color: '#fff', dark: pal.line, sleeve: 'short', to: -15 });
  W.bottom({ kind: 'shorts', color: pal.blue, dark: pal.blueDark, from: -15 });
  W.feet('sandal', pal.coral, pal.coralDark);
  const hs = [0, 1].map(() => heart(k, k.root, pal.coral));
  const xf = (t) => lerp(60, 300, easeInOut(seg(t, 0.2, 3.5)));
  return {
    update(t) {
      waves(t);
      const p = gait(xf, t, 60, 18, 0.09);
      P(b, { x: p.x, walk: p.walk, lean: p.lean, armL: p.armL, armR: p.armR, look: 0.3, mood: t > 3.4 ? 'grin' : 'smile', blink: blinkAt(t) });
      prints.forEach((n, i) => {
        const x = 70 + i * 24;
        tf(n, x + (i % 2) * 6, FY + 8 + (i % 2) * 5);
        n.setAttribute('opacity', p.x > x + 22 ? 0.9 : 0);
      });
      hs.forEach((h, i) => { const q = seg(t, 3.5 + i * 0.25, 4.3 + i * 0.1); tf(h, 300 + (i ? 22 : -18), FY - 140 - 16 * q, 0, hump(q) + 0.001); });
    }
  };
}
