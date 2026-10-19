// blanket：ソファで眠る子どもに、母親がたたんだ毛布を広げて、ふわりと掛けてあげる（例文 She put a blanket over the child.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { reach, hp } from './dig.js';
import { gait } from './weigh.js';
import { P, blinkAt } from './run-after.js';
import { lie } from './surgery.js';
import { homeBg, sofaProp } from './furniture.js';

export const meta = { duration: 4.4, beats: [[0, '毛布を持つ'], [1.1, '広げる'], [2.9, '掛けてあげた']] };

const L4 = (a, b, p) => a.map((v, i) => lerp(v, b[i], p));

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9, CS = 0.7;
  const FY = homeBg(k, { winX: 60, winW: 80, mood: 'evening', sky: '#F7D9B8' });
  el('ellipse', { cx: 200, cy: FY + 24, rx: 140, ry: 13, fill: '#E6D3C0' });
  const sofa = g({}); tf(sofa, 196, FY); k.shadow(0, 0, 92, 6, sofa); sofaProp(k, sofa, 176, '#B7A5EE', '#9883DC');
  const OX = 226, OY = FY - 34 - 21;
  const kid = lie(k, { scale: CS });
  const cloth = el('path', { fill: '#FFCF5C', stroke: '#E9B43A', 'stroke-width': 2, 'stroke-linejoin': 'round' });
  const stripe = el('path', { fill: 'none', stroke: '#fff', 'stroke-width': 3, opacity: 0.55 });
  const mom = k.buddy({ x: 370, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const fold = g({});
  el('rect', { x: -15, y: -10, width: 30, height: 18, rx: 4, fill: '#FFCF5C', stroke: '#E9B43A', 'stroke-width': 2 }, fold);
  el('path', { d: 'M -15 -2 H 15 M -15 3 H 15', stroke: '#E9B43A', 'stroke-width': 1.2 }, fold);
  const zz = [0, 1].map(() => k.text(0, 0, 'z', { 'font-size': 13, fill: pal.violet }));
  const F = [OX - 24, FY - 22, OX - 36, OY - 42, OX + 40, OY - 40, OX + 34, FY - 22];
  const xf = (t) => lerp(370, 296, easeInOut(seg(t, 0.2, 1.0)));
  return {
    update(t) {
      kid.set(OX, OY + 0.6 * Math.sin(t * 2.4), -90);
      kid.b.pose({ blink: 1, mood: 'smile', squash: 1 + 0.02 * Math.sin(t * 2.4) });
      const w = gait(xf, t, 370, 0, 0.12);
      const s1 = easeOut(seg(t, 1.0, 1.4)), s2 = easeOut(seg(t, 1.6, 2.1)), s3 = easeInOut(seg(t, 2.2, 2.9));
      const pose = { x: w.x, facing: -1, walk: w.walk, lean: w.lean + 10 * s3, look: 0.5, mood: 'smile', blink: blinkAt(t) };
      P(mom, pose);
      const back = easeInOut(seg(t, 3.0, 3.5));
      let arm = lerp(lerp(70, 120, s1), 150, s2 * (1 - s3));
      if (s3 > 0) arm = lerp(150, reach(mom, S, 'R', F[6], F[7] - 4), s3);
      arm = lerp(arm, 20, back);
      P(mom, { ...pose, armR: arm, armL: lerp(8, 30, s1) * (1 - back) + 8 * back, lean: pose.lean * (1 - back) });
      const h = hp(mom, S, 'R', 30);
      tf(fold, h.x - 6, h.y - 2, 0, 1 - s1 * 0.99);
      // 毛布の形：たたんだ→手から垂れる→ふわっと舞う→子どもの上に落ちる
      const hang = [h.x - 32, h.y + 46, h.x - 36, h.y - 2, h.x + 2, h.y - 2, h.x, h.y + 46];
      const fl = 6 * Math.sin(t * 9) * (1 - s3);
      const fly = [OX - 30, OY - 34 + fl, OX - 44, OY - 92, h.x - 20, h.y - 40, h.x, h.y + 6];
      let p = L4(L4(hang, fly, s2), F, s3);
      if (t > 2.9) p = F;
      const land = wobble(seg(t, 2.9, 3.5), 2, 6);
      p = p.map((v, i) => (i === 3 || i === 5 ? v + 3 * land : v));
      const vis = s1 > 0.02 ? 1 : 0;
      k.set(cloth, { d: `M ${p[0]} ${p[1]} C ${p[2]} ${p[3]} ${p[4]} ${p[5]} ${p[6]} ${p[7]} Z`, opacity: vis });
      k.set(stripe, { d: `M ${lerp(p[0], p[2], 0.5)} ${lerp(p[1], p[3], 0.6)} C ${p[2] + 6} ${p[3] + 12} ${p[4] - 6} ${p[5] + 12} ${lerp(p[6], p[4], 0.5)} ${lerp(p[7], p[5], 0.6)}`, opacity: vis * 0.55 });
      zz.forEach((z, i) => { const q = ((t * 0.5 + i * 0.5) % 1); tf(z, OX - 56 - 10 * q + i * 4, OY - 34 - 26 * q, 0, 0.7 + 0.5 * q); z.setAttribute('opacity', Math.sin(q * Math.PI) * (t > 3.0 ? 1 : 0.5)); });
    }
  };
}
