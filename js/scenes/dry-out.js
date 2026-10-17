// dry out：ぬれた靴が、日なたに置かれて朝までに内側まですっかり乾く（例文 The wet shoes dried out by morning.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, 'ぬれた靴'], [1.6, '乾いていく'], [3.2, 'すっかり乾く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const sky = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#8B87B8' });
  const day = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#FFF1D8', opacity: 0 });
  const FY = 232;
  el('rect', { x: 0, y: FY, width: 400, height: 68, fill: pal.wood });
  el('rect', { x: 0, y: FY, width: 400, height: 6, fill: pal.woodDark });
  const sun = g({});
  el('circle', { r: 26, fill: pal.yellow }, sun);
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; el('line', { x1: Math.cos(a) * 34, y1: Math.sin(a) * 34, x2: Math.cos(a) * 46, y2: Math.sin(a) * 46, stroke: pal.yellow, 'stroke-width': 4, 'stroke-linecap': 'round' }, sun); }
  const moon = el('path', { d: 'M 0 -22 a 22 22 0 1 0 14 40 a 18 18 0 1 1 -14 -40 Z', fill: '#FFE9A8' });
  const shoe = (x) => {
    const s = g({});
    el('path', { d: 'M -46 0 L -46 -34 Q -46 -42 -38 -40 L -8 -30 Q 8 -18 30 -14 Q 48 -12 48 0 Z', fill: pal.blueDark }, s);
    el('path', { d: 'M -46 -4 L 48 -4 L 48 4 L -46 4 Z', fill: '#fff' }, s);
    el('path', { d: 'M -22 -33 L -8 -24 M -12 -37 L 2 -26', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round' }, s);
    const dark = el('path', { d: 'M -46 0 L -46 -34 Q -46 -42 -38 -40 L -8 -30 Q 8 -18 30 -14 Q 48 -12 48 0 Z', fill: '#2F3F66', opacity: 0.55 }, s);
    return { s, dark };
  };
  const A = shoe(), B = shoe();
  const puddles = [[130, 130], [270, 270]].map(([a, b], i) => el('ellipse', { cx: i ? 280 : 150, cy: FY + 6, rx: 44, ry: 6, fill: pal.water, opacity: 0.8 }));
  const drops = [0, 1, 2, 3].map(() => el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6', fill: pal.water, stroke: pal.blueDark, 'stroke-width': 1 }));
  const steam = [0, 1, 2, 3].map((i) => el('path', { d: 'M 0 0 q 6 -8 0 -16 q -6 -8 0 -16', fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0 }));
  return {
    update(t) {
      const dry = easeInOut(seg(t, 1.2, 3.4));
      const dayP = easeInOut(seg(t, 0.6, 3.0));
      day.setAttribute('opacity', dayP);
      tf(sun, lerp(60, 330, easeInOut(seg(t, 0.4, 4.0))), lerp(150, 70, hump(seg(t, 0.4, 4.0))) + lerp(40, -10, dayP), 0, dayP, dayP);
      tf(moon, 330, 60, 0, 1 - dayP, 1 - dayP);
      tf(A.s, 150, FY + 2, -3); tf(B.s, 280, FY + 2, 3);
      A.dark.setAttribute('opacity', 0.55 * (1 - dry)); B.dark.setAttribute('opacity', 0.55 * (1 - dry));
      puddles.forEach((p) => { p.setAttribute('rx', 44 * (1 - dry) + 1); p.setAttribute('opacity', 0.8 * (1 - dry)); });
      drops.forEach((d, i) => {
        const x = i < 2 ? 120 + i * 48 : 250 + (i - 2) * 50;
        const ph = (t * 1.4 + i * 0.3) % 1;
        tf(d, x, FY - 30 + ph * 30);
        d.setAttribute('opacity', (1 - dry) * (ph < 0.9 ? 1 : 0));
      });
      steam.forEach((s, i) => {
        const x = [130, 160, 260, 295][i];
        const ph = (t * 0.9 + i * 0.25) % 1;
        tf(s, x, FY - 46 - ph * 20);
        s.setAttribute('opacity', 0.9 * Math.sin(Math.PI * ph) * hump(seg(t, 0.8, 3.8)) * (1 - seg(t, 3.4, 4.0)));
      });
    }
  };
}
