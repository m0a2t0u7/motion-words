// slipper：冷たい床でつま先立ちのまめに、家族がスリッパを指さす → スリッパをはいて温まる（例文 Put on your slippers. The floor is cold.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { wardrobe, gait, P, blinkAt } from './skirt.js';

export const meta = { duration: 4.4, beats: [[0, '床が冷たい'], [1.2, 'スリッパを指す'], [2.8, 'はいて温かい']] };

function slipperProp(k) {
  const g = k.g({});
  k.shadow(2, 1, 14, 2.5, g);
  k.el('path', { d: 'M -10 -2 L 13 -2 Q 16 -2 16 1 L -10 1 Z', fill: '#C05A86' }, g);
  k.el('path', { d: 'M 0 -1.5 Q 0 -10 8 -9 Q 15 -8 15 -1.5 Z', fill: '#F28DB8' }, g);
  return g;
}

export function create(k) {
  const { el, g, pal, tf } = k, S = 1.3;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 冷たい床（青みのタイル）
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#DCEBF7' });
  for (let x = 0; x < 400; x += 50) el('line', { x1: x, y1: FY, x2: x - 20, y2: 300, stroke: '#C4D9EC', 'stroke-width': 2 });
  el('rect', { x: 150, y: 56, width: 90, height: 66, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const cold = [0, 1, 2, 3].map(() => el('path', { d: 'M 0 0 q 4 -6 0 -12 q -4 -6 0 -12', fill: 'none', stroke: '#8FC3EC', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
  const SX = 168;
  const props = [-12, 12].map((dx) => { const p = slipperProp(k); tf(p, SX + dx * S, FY + 4, 0, S); return p; });
  const glow = el('circle', { r: 60, fill: pal.yellow, opacity: 0 });
  const mom = k.buddy({ x: 320, y: FY, scale: 1.15, facing: -1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 90, y: FY, scale: S });
  const W = wardrobe(k, b);
  W.top({ color: pal.yellow, dark: pal.yellowDark, sleeve: 'long', to: -16 });
  W.bottom({ kind: 'trousers', color: pal.violet, dark: '#8C70DD', from: -16 });
  const bare = W.feet('foot');
  const worn = W.feet('slipper', '#F28DB8', '#C05A86');
  const xf = (t) => lerp(90, SX, easeInOut(seg(t, 1.9, 2.6)));
  return {
    update(t) {
      const on = t > 2.6;
      props.forEach((p) => p.setAttribute('display', on ? 'none' : 'inline'));
      worn.forEach((w) => w.setAttribute('display', on ? 'inline' : 'none'));
      const c = 1 - easeOut(seg(t, 2.7, 3.2));
      const p = gait(xf, t, 90, 14, 0.15);
      const hop = (t < 1.9 ? Math.abs(Math.sin(t * 9)) * 4 : 0) * c;
      P(b, { x: p.x + Math.sin(t * 45) * 1.2 * c, walk: p.walk, lean: p.lean, lift: hop, armL: lerp(-25, 8, 1 - c) + p.armL * 0.3, armR: lerp(-25, 8, 1 - c),
        squash: 1 - 0.03 * c * Math.abs(Math.sin(t * 40)) + 0.03 * wobble(seg(t, 2.6, 3.2), 2, 5), look: t < 2.6 ? 0.4 : 0.2,
        mood: c > 0.5 ? (Math.sin(t * 30) > 0 ? 'flat' : 'open') : 'grin', blink: blinkAt(t) });
      // 家族：スリッパを指さす
      const pt = easeOut(seg(t, 0.9, 1.3)) * (1 - easeInOut(seg(t, 2.6, 3.0)));
      P(mom, { x: 320, armR: 8 + 100 * pt, lean: 6 * pt, look: 0.5, mood: t > 0.9 && t < 2.0 && Math.sin(t * 22) > -0.2 ? 'open' : 'smile', blink: blinkAt(t, 1) });
      cold.forEach((n, i) => {
        const q = (t * 0.8 + i / 4) % 1;
        tf(n, 40 + i * 90 + (i === 1 ? 20 : 0), FY + 20 - q * 30);
        n.setAttribute('opacity', hump(q) * 0.9 * (t < 2.6 ? 1 : 0.25));
      });
      k.set(glow, { cx: p.x, cy: FY - 60, opacity: 0.18 * easeOut(seg(t, 2.8, 3.4)) });
      void bare; void g;
    }
  };
}
