// headache：頭がズキズキして両手で頭を押さえ、ソファまで歩いて横になる（例文 I have a headache, so I'm going to lie down.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { P, gait } from './hospital.js';
import { sofa } from './run-after.js';
import { roomBg } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '頭が痛い'], [1.5, 'ソファへ'], [3.0, '横になる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  el('rect', { x: 210, y: 70, width: 50, height: 40, rx: 3, fill: '#FFF1D6', stroke: pal.woodDark, 'stroke-width': 4 });
  el('path', { d: 'M 216 104 L 230 88 L 240 98 L 248 90 L 256 104 Z', fill: '#B9DDB8' });
  const so = sofa(k, 300, FY, 150);
  so.front();
  const S = 0.9;
  const b = k.buddy({ x: 110, y: FY, scale: S });
  // ズキズキ線（頭のまわり）
  const throb = g({});
  [[-38, -6, -30], [38, -6, 30], [-30, -30, -55], [30, -30, 55]].forEach(([x, y, r]) => {
    const z = g({}, throb); tf(z, x, y, r);
    el('path', { d: 'M 0 -7 L 4 -2 L -3 2 L 1 7', fill: 'none', stroke: pal.red, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, z);
  });
  const zz = g({});
  ['Z', 'z'].forEach((s, i) => k.text(i * 12, -i * 14, s, { 'font-size': 18 - i * 5, fill: pal.sub }, zz));
  const xf = (t) => lerp(110, 262, easeInOut(seg(t, 1.4, 2.7)));
  return {
    update(t) {
      const p = gait(xf, t, 110, 0);
      const lie = easeInOut(seg(t, 2.75, 3.4));
      const hold = t < 2.75 ? 1 : 1 - seg(t, 2.75, 3.1);
      const pulse = 0.5 + 0.5 * Math.sin(t * 9);
      P(b, { x: p.x, walk: p.walk, lean: p.lean * 0.5 + 4, squash: 1 - 0.03 * pulse * hold, mood: t < 3.3 ? 'sad' : 'flat',
        blink: t > 3.3 ? 1 : 0.5 * hold, armL: lerp(8, 160, hold), armR: lerp(8, 160, hold), look: 0 });
      // ソファに横になる（足元を支点に、頭は左のひじ掛けへ）
      if (lie > 0) {
        const x = lerp(p.x, 336, lie), y = lerp(FY, FY - 58, lie), r = -90 * lie;
        b.g.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${r.toFixed(2)}) scale(${S})`);
        b.g.firstChild.setAttribute('opacity', 1 - lie);
      } else b.g.firstChild.setAttribute('opacity', 1);
      const hx = lie > 0 ? lerp(p.x, 336 - 60, lie) : p.x, hy = lerp(FY - 68 * S, FY - 58, lie);
      tf(throb, hx, hy, 0, 0.9 + 0.2 * pulse);
      throb.setAttribute('opacity', (t < 3.0 ? 1 : 1 - seg(t, 3.0, 3.9)) * (0.6 + 0.4 * pulse));
      tf(zz, 262, FY - 104 - 4 * Math.sin(t * 3));
      zz.setAttribute('opacity', seg(t, 3.6, 4.0));
    }
  };
}
