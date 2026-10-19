// posture：机に向かって猫背で座るまめの腰が痛む→背すじを伸ばすと痛みが消える（例文 Good posture while sitting at your desk helps prevent back pain.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, backOut } from '../ease.js';
import { officeBg } from './get-on-with.js';
import { star } from './get-on-with.js';
import { mark } from './so-far-so-good.js';

export const meta = { duration: 4.2, beats: [[0, '猫背で痛い'], [1.6, '背すじを伸ばす'], [2.8, '良い姿勢']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236, 240);
  // いす
  el('rect', { x: 96, y: FY - 120, width: 8, height: 84, rx: 3, fill: '#5C6B85' });
  el('rect', { x: 96, y: FY - 44, width: 66, height: 10, rx: 4, fill: '#5C6B85' });
  el('rect', { x: 125, y: FY - 34, width: 6, height: 28, fill: '#9AA4B4' });
  el('rect', { x: 106, y: FY - 6, width: 44, height: 5, rx: 2, fill: '#9AA4B4' });
  const S = 1, b = k.buddy({ x: 134, y: FY - 38, scale: S });
  b.g.children[0].setAttribute('opacity', 0);
  // 机とノートPC
  el('rect', { x: 186, y: FY - 76, width: 160, height: 8, rx: 3, fill: pal.wood });
  [192, 334].forEach((x) => el('rect', { x, y: FY - 68, width: 7, height: 68, fill: pal.woodDark }));
  k.shadow(266, FY + 1, 86, 4);
  el('path', { d: `M 214 ${FY - 76} L 250 ${FY - 76} L 262 ${FY - 116} L 226 ${FY - 116} Z`, fill: pal.ink });
  el('rect', { x: 200, y: FY - 80, width: 56, height: 4, rx: 2, fill: '#AEB7C4' });
  const pains = [0, 1, 2].map(() => star(k, null, 8, pal.red));
  const spine = el('path', { fill: 'none', stroke: pal.red, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-dasharray': '4 5' });
  const ok = mark(k, 'check', null, 2);
  return {
    update(t) {
      const fix = easeInOut(seg(t, 1.6, 2.3));
      const slouch = 26 * (1 - fix);
      b.pose({ lean: slouch + 2 * wobble(seg(t, 2.3, 3.0), 2, 4), squash: lerp(0.9, 1.03, fix), armR: lerp(60, 72, fix), armL: 10, look: lerp(0.2, 0.7, fix),
        mood: t < 1.6 ? 'sad' : fix > 0.6 ? 'grin' : 'flat', blink: t > 0.4 && t < 1.4 && Math.sin(t * 9) > 0.6 ? 1 : 0 });
      const bx = 134 - 26, by = FY - 38 - 40;
      const c = slouch * 0.9;
      k.set(spine, { d: `M ${bx + 4} ${by + 30} Q ${bx - 6 + c * 0.1} ${by} ${bx + 6 + c} ${by - 30 + c * 0.2}`, stroke: fix > 0.5 ? pal.green : pal.red, opacity: 0.85 });
      pains.forEach((p, i) => { const q = (t * 1.6 + i / 3) % 1; tf(p, bx - 10 - 6 * i, by + 14 - 10 * q, 20 * q, (1 - fix) * (0.6 + 0.5 * hump(q)) + 0.001); p.setAttribute('opacity', 1 - fix); });
      const op = seg(t, 2.6, 2.9);
      tf(ok, 70, 70, 0, op <= 0 ? 0.001 : backOut(op) * 2);
    }
  };
}
