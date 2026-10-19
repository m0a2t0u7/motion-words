// blouse：ピンクのブラウスと黒いスカートを着たまめが、鏡の前でくるりと回る（例文 She wore a pink blouse and a black skirt.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { top } from './shirt.js';

export const meta = { duration: 4.0, beats: [[0, '鏡の前で'], [1.2, 'くるりと回る'], [2.7, 'ピンクのブラウス']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  // 洋服だんす
  el('rect', { x: 24, y: 70, width: 96, height: FY - 70, rx: 4, fill: '#E9CFAE' });
  el('line', { x1: 72, y1: 74, x2: 72, y2: FY - 4, stroke: pal.woodDark, 'stroke-width': 2 });
  [66, 78].forEach((x) => el('rect', { x: x - 2, y: 140, width: 4, height: 18, rx: 2, fill: pal.woodDark }));
  k.shadow(72, FY + 1, 54, 4);
  // 姿見
  const MX = 312;
  k.shadow(MX, FY + 1, 44, 4);
  el('rect', { x: MX - 40, y: 74, width: 80, height: 160, rx: 10, fill: pal.wood });
  el('rect', { x: MX - 6, y: 232, width: 12, height: 8, fill: pal.woodDark });
  const glass = el('rect', { x: MX - 33, y: 81, width: 66, height: 146, rx: 6, fill: k.gradient([[0, '#E4F2FA'], [1, '#CFE4F1']]) });
  const refl = g({});
  refl.setAttribute('clip-path', k.clip((c) => el('rect', { x: MX - 33, y: 81, width: 66, height: 146, rx: 6 }, c)));
  const R = k.buddy({ parent: refl, x: MX, y: 222, scale: 0.84, facing: -1 });
  const tr = top(k, R, 'blouse', '#FF9EC0', '#E26A98', { skirt: '#2A3242' });
  el('path', { d: `M ${MX - 26} 100 L ${MX - 14} 88 M ${MX - 26} 116 L ${MX - 4} 94`, stroke: '#fff', 'stroke-width': 3, opacity: 0.7, 'stroke-linecap': 'round' });
  const S = 1.08, b = k.buddy({ x: 196, y: FY, scale: S });
  const tb = top(k, b, 'blouse', '#FF9EC0', '#E26A98', { skirt: '#2A3242' });
  return {
    update(t) {
      const spin = easeInOut(seg(t, 1.2, 2.5)), fl = hump(spin);
      const c = Math.cos(spin * Math.PI * 2), f = Math.sign(c || 1) * Math.max(0.08, Math.abs(c));
      const smooth = hump(seg(t, 0.2, 1.1)), pose = easeOut(seg(t, 2.5, 2.9));
      const sw = -48 + 26 * (0.5 - 0.5 * Math.cos(seg(t, 0.3, 1.0) * Math.PI * 4));
      const lift = 4 * fl, bounce = 0.03 * wobble(seg(t, 2.5, 3.4), 2, 4);
      const armR = lerp(lerp(8, sw, smooth) + 50 * fl, 32, pose), armL = 8 + 50 * fl + 24 * pose;
      const o = { armR, armL, lean: -2 * pose, mood: t > 1.2 ? 'grin' : 'smile', look: 0.6, lift, squash: 1 + bounce, blink: hump(seg(t, 3.5, 3.65)) };
      b.pose({ ...o, facing: f });
      R.pose({ ...o, facing: -f, look: 0.6 });
      [tb, tr].forEach((q) => tf(q.hem, 0, 0, 0, 1 + 0.35 * fl, 1 - 0.1 * fl));
    }
  };
}
