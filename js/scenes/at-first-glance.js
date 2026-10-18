// at first glance：部屋を見回すと片づいていて満足→押し入れの戸を開けると物がどっと崩れ出る。一見きれいに見えただけ（At first glance, the room looked clean.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, clamp, wobble, backOut } from '../ease.js';
import { roomBg } from './look-over.js';
import { sofa } from './run-after.js';
import { gait, hp } from './dig.js';
import { P, blinkAt, mark } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '一見きれい'], [1.8, '戸を開ける'], [2.6, '実は散らかり']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  el('ellipse', { cx: 160, cy: FY + 14, rx: 110, ry: 10, fill: '#E9DDF5' });
  const sf = sofa(k, 150, FY, 120); sf.front();
  el('circle', { cx: 230, cy: 70, r: 14, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  // 押し入れ
  el('rect', { x: 290, y: FY - 160, width: 100, height: 160, fill: '#E8D3B6' });
  const drL = g({}), drR = g({});
  [drL, drR].forEach((d) => { el('rect', { x: 0, y: 0, width: 50, height: 160, fill: '#F6E9D6', stroke: pal.woodDark, 'stroke-width': 3 }, d); el('rect', { x: 8, y: 14, width: 34, height: 132, rx: 3, fill: 'none', stroke: pal.woodDark, 'stroke-width': 1.5, opacity: 0.5 }, d); });
  const items = [[pal.coral, 'box', 20, 24], [pal.blue, 'shirt', 0, 0], [pal.yellow, 'ball', 0, 0], [pal.violet, 'box', 26, 18], [pal.green, 'shirt', 0, 0], [pal.coralDark, 'ball', 0, 0], [pal.yellowDark, 'box', 24, 20], [pal.blueDark, 'shirt', 0, 0], [pal.wood, 'box', 30, 22]].map(([c, kind, w, h]) => {
    const n = g({});
    if (kind === 'box') el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 2, fill: c }, n);
    if (kind === 'shirt') el('path', { d: 'M -14 -8 L -6 -12 Q 0 -8 6 -12 L 14 -8 L 10 -2 L 7 -4 L 7 10 L -7 10 L -7 -4 L -10 -2 Z', fill: c }, n);
    if (kind === 'ball') el('circle', { r: 8, fill: c }, n);
    return n;
  });
  const home = [[312, FY - 120], [340, FY - 130], [366, FY - 118], [318, FY - 90], [350, FY - 96], [374, FY - 80], [330, FY - 60], [360, FY - 50], [340, FY - 30]];
  const land = [[262, FY - 16], [290, FY - 12], [246, FY - 10], [314, FY - 14], [338, FY - 10], [270, FY - 38], [300, FY - 36], [326, FY - 34], [356, FY - 14]];
  const G = k.buddy({ x: 60, y: FY });
  const bang = mark(k, 'bang');
  const xf = (t) => lerp(60, 210, easeInOut(seg(t, 1.0, 1.9)));
  return {
    update(t) {
      const op = easeOut(seg(t, 2.0, 2.3));
      tf(drL, 290 - 40 * op, FY - 160, 0, 1, 1);
      tf(drR, 340 + 40 * op, FY - 160, 0, 1, 1);
      items.forEach((n, i) => {
        const p = seg(t, 2.15 + i * 0.07, 2.75 + i * 0.07);
        const [x0, y0] = home[i], [x1, y1] = land[i];
        const x = lerp(x0, x1, easeOut(p)), y = lerp(y0, y1, easeIn(p)) - 8 * Math.abs(wobble(seg(t, 2.75 + i * 0.07, 3.6), 1.5, 4));
        tf(n, x, y, p * (i % 2 ? 200 : -160), 1.4); n.setAttribute('opacity', t > 2.12 ? 1 : 0);
      });
      const p = gait(xf, t, 60);
      const nod = Math.max(0, Math.sin(seg(t, 0.2, 0.9) * Math.PI * 2));
      const shock = easeOut(seg(t, 2.3, 2.5));
      P(G, { x: p.x - 18 * shock, walk: p.walk, armL: p.armL, lean: p.lean + 8 * nod - 12 * shock, lift: 8 * hump(seg(t, 2.3, 2.7)),
        armR: t < 1.9 ? (t < 1.0 ? 8 : p.armR) : t < 2.3 ? lerp(8, 80, seg(t, 1.9, 2.1)) : lerp(80, 150, shock), look: t < 1.0 ? Math.sin(t * 4) * 0.8 : 0.7,
        mood: t < 2.3 ? 'grin' : 'open', blink: blinkAt(t) });
      tf(bang, p.x - 18 * shock + 4, FY - 112, 0, Math.max(0.001, backOut(seg(t, 2.35, 2.6))));
    }
  };
}
