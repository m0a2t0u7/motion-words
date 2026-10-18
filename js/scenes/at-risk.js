// at risk：池で泳ぐ魚や水鳥。工場の排水で水がにごっていき、生き物が弱って危険のマークが出る（Many animals are at risk because of pollution.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, backOut } from '../ease.js';
import { P, blinkAt } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '池の生き物'], [1.2, '汚れが広がる'], [3.0, '危険な状態']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  // 工場
  el('rect', { x: 0, y: 90, width: 110, height: 112, fill: '#C9CFD8' });
  el('path', { d: 'M 0 90 L 30 70 L 30 90 L 60 70 L 60 90 L 90 70 L 90 90 Z', fill: '#B4BCC8' });
  el('rect', { x: 70, y: 30, width: 18, height: 60, fill: '#A9B2BF' });
  const smoke = [0, 1, 2].map(() => el('circle', { r: 12, fill: '#9AA3B0', opacity: 0.5 }));
  el('rect', { x: 100, y: 176, width: 40, height: 10, fill: '#8C96A5' });
  // 池
  const P0 = 'M 120 202 Q 130 186 260 188 Q 392 190 400 200 L 400 300 L 120 300 Z';
  el('rect', { x: 0, y: 200, width: 400, height: 100, fill: '#DCEFD9' });
  const water = el('path', { d: P0, fill: '#8FD3F4' });
  const cp = k.clip((c) => el('path', { d: P0 }, c));
  const dirt = g({ 'clip-path': cp });
  const blob = el('ellipse', { cx: 140, cy: 210, rx: 0, ry: 0, fill: '#6B6A5A', opacity: 0.75 }, dirt);
  const flow = el('path', { d: 'M 140 182 Q 150 190 146 204', stroke: '#6B6A5A', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' });
  const fish = [[230, 240, pal.coral], [300, 262, pal.yellow], [350, 232, pal.coral]].map(([x, y, c]) => {
    const f = g({}); el('ellipse', { cx: 0, cy: 0, rx: 14, ry: 8, fill: c }, f); el('path', { d: 'M -12 0 L -22 -7 L -22 7 Z', fill: c }, f); el('circle', { cx: 7, cy: -2, r: 1.8, fill: pal.ink }, f);
    return [f, x, y];
  });
  const duck = g({}); el('ellipse', { cx: 0, cy: 0, rx: 18, ry: 10, fill: '#fff' }, duck); el('circle', { cx: 12, cy: -12, r: 8, fill: '#fff' }, duck); el('path', { d: 'M 19 -12 L 27 -10 L 19 -8 Z', fill: pal.yellow }, duck); el('circle', { cx: 14, cy: -14, r: 1.5, fill: pal.ink }, duck);
  const warn = g({}); el('path', { d: 'M 0 -20 L 20 14 L -20 14 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linejoin': 'round' }, warn); k.text(0, 4, '!', { 'font-size': 20, fill: pal.ink }, warn);
  const G = k.buddy({ x: 58, y: 262, scale: 0.7, facing: 1 });
  return {
    update(t) {
      const d = easeInOut(seg(t, 0.8, 3.4));
      k.set(blob, { rx: 300 * d, ry: 70 * d });
      flow.setAttribute('opacity', t > 0.6 ? 1 : 0);
      smoke.forEach((s, i) => { const q = (t * 0.5 + i / 3) % 1; tf(s, 79 + q * 30, 26 - q * 30, 0, 0.6 + q); s.setAttribute('opacity', 0.5 * (1 - q)); });
      fish.forEach(([f, x, y], i) => {
        const sp = lerp(1, 0.25, d);
        const sick = d > 0.6 + i * 0.1;
        tf(f, x + Math.sin(t * 2 * sp + i) * 18, y + Math.sin(t * 3 + i) * 3 * sp, sick ? 25 : 0);
        f.setAttribute('opacity', 1 - 0.35 * d);
      });
      tf(duck, 270, 196 + 2 * Math.sin(t * 3), lerp(0, 8, d));
      tf(warn, 270, 130, 0, Math.max(0.001, backOut(seg(t, 3.0, 3.3))));
      P(G, { facing: 1, look: 0.5, mood: d < 0.3 ? 'smile' : d < 0.8 ? 'flat' : 'sad', lean: 6 * d, armR: 8 + 30 * d, blink: blinkAt(t) });
    }
  };
}
