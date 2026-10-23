// grandfather：白髪とひげのおじいちゃんが畑で野菜を育て、大きなにんじんを引き抜く（例文 My grandfather grows vegetables.）
import { seg, lerp, easeInOut, easeOut, easeIn, clamp, hump, wobble } from '../ease.js';
import { arms, grayHair, mustache, wear, P, blinkAt, C } from './jam.js';

export const meta = { duration: 4.4, beats: [[0, 'おじいちゃんの畑'], [1.2, 'ぐっと引く'], [2.6, 'とれた']] };

export function create(k) {
  const { el, pal } = k, FY = 220;
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: k.gradient([[0, '#CFE8FA'], [1, '#F3FAFE']]) });
  el('rect', { x: 0, y: FY, width: 400, height: 80, fill: '#B98A5E' });
  for (let x = 20; x < 400; x += 60) el('path', { d: `M ${x} ${FY + 18} q 20 -8 40 0`, stroke: '#9E7148', 'stroke-width': 4, fill: 'none' });
  // トマトとキャベツ
  [40, 80].forEach((x) => { el('line', { x1: x, y1: FY, x2: x, y2: FY - 60, stroke: '#6BBF84', 'stroke-width': 3 }); [[-8, -46], [8, -34], [-6, -20]].forEach(([dx, dy]) => el('circle', { cx: x + dx, cy: FY + dy, r: 6, fill: pal.red })); });
  [330, 372].forEach((x) => { el('circle', { cx: x, cy: FY - 12, r: 16, fill: '#9ADBA8' }); el('circle', { cx: x, cy: FY - 12, r: 9, fill: '#7FCB92' }); });
  const gp = k.buddy({ x: 196, y: FY, scale: 1.15 });
  grayHair(k, gp); mustache(k, gp, '#E4E7EC');
  wear(k, gp, (g) => { el('path', { d: 'M -40 -78 Q 0 -96 40 -78 Q 0 -86 -40 -78 Z', fill: '#E9C46A' }, g); el('path', { d: 'M -24 -80 Q 0 -110 24 -80 Z', fill: '#E9C46A' }, g); });
  const kid = k.buddy({ x: 100, y: FY, scale: 0.65, ...C(k, 'coral') });
  // にんじん（原点＝葉の付け根、根は下へ）
  const car = k.g({});
  el('path', { d: 'M -9 0 Q -6 30 0 44 Q 6 30 9 0 Z', fill: '#FF8A3D' }, car);
  [8, 18, 28].forEach((y) => el('line', { x1: -6, y1: y, x2: -1, y2: y + 1, stroke: '#E06F2A', 'stroke-width': 1.5 }, car));
  [[-8, -22], [0, -28], [8, -22]].forEach(([x, y]) => el('path', { d: `M 0 0 Q ${x} ${y / 2} ${x} ${y}`, stroke: '#59C27A', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, car));
  el('rect', { x: 0, y: FY, width: 400, height: 80, fill: '#B98A5E', 'clip-path': k.clip((c) => k.el('rect', { x: 230, y: FY, width: 60, height: 60 }, c)) });
  const dirt = [0, 1, 2, 3].map(() => el('circle', { r: 3, fill: '#9E7148' }));
  const A = arms(k, gp, 1.15);
  const CX = 258;
  return {
    update(t) {
      const grab = easeInOut(seg(t, 0.4, 1.0));
      const tug = t > 1.2 && t < 2.4 ? Math.abs(Math.sin((t - 1.2) * 9)) : 0;
      const out = easeOut(seg(t, 2.4, 2.8)), lift = easeInOut(seg(t, 2.8, 3.4));
      const y0 = FY - 2 - 6 * tug * 0.5 - 50 * out - 40 * lift;
      P(gp, { look: 0.6, lean: 18 * grab - 14 * tug * 0.4 - 22 * out + 4 * lift, squash: 1 - 0.04 * tug, blink: tug > 0.5 ? 1 : blinkAt(t), mood: t > 2.6 ? 'grin' : tug > 0.3 ? 'flat' : 'smile' });
      k.tf(car, CX - 10 * lift, y0 + 2 * wobble(seg(t, 2.8, 3.6), 2, 5));
      const top = { x: CX - 10 * lift, y: y0 - 8 };
      A.to('R', lerp(230, top.x + 6, grab), lerp(190, top.y, grab)); A.to('L', lerp(170, top.x - 4, grab), lerp(190, top.y + 4, grab));
      dirt.forEach((d, i) => { const q = seg(t, 2.4, 3.1); k.set(d, { cx: CX + (i - 1.5) * 10 * (1 + q), cy: FY - 30 * hump(q) * (1 - i * 0.15) + 4, opacity: q > 0 && q < 1 ? 1 : 0 }); });
      P(kid, { look: 0.8, blink: blinkAt(t, 1), mood: t > 2.7 ? 'grin' : 'open', armL: t > 2.8 ? 160 : 10, armR: t > 2.8 ? 160 : 10, lift: t > 2.8 ? Math.abs(Math.sin(t * 8)) * 6 : 0 });
    }
  };
}
