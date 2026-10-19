// routine：朝7:00から7:30まで、顔を洗う→朝ごはん→かばんを持って出かける、の決まった流れ（例文 My morning routine takes about thirty minutes from start to finish.）
import { seg, lerp, easeInOut, hump, backOut } from '../ease.js';
import { reach, hp, gait } from './dig.js';
import { clock } from './run-after.js';
import { food } from './diet.js';
import { mark } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '顔を洗う'], [1.4, '朝ごはん'], [2.8, '出かける']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 238, mood: 'indoor' });
  const ck = clock(k, 200, 42, 24);
  // 洗面台
  el('rect', { x: 20, y: 70, width: 60, height: 64, rx: 6, fill: '#DCEBF5', stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 14, y: 168, width: 74, height: FY - 168, rx: 4, fill: '#E9EEF3' });
  el('ellipse', { cx: 51, cy: 168, rx: 34, ry: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  // テーブル
  el('rect', { x: 170, y: 184, width: 80, height: 8, rx: 3, fill: pal.wood });
  [176, 238].forEach((x) => el('rect', { x, y: 192, width: 6, height: FY - 192, fill: pal.woodDark }));
  k.shadow(210, FY + 1, 44, 4);
  const toast = food(k, 'toast'); tf(toast, 222, 184);
  // ドア
  el('rect', { x: 330, y: FY - 116, width: 62, height: 116, fill: '#E8EDF2' });
  const door = g({});
  el('rect', { x: 0, y: 0, width: 62, height: 116, rx: 3, fill: '#C9B08F' }, door);
  el('circle', { cx: 52, cy: 60, r: 4, fill: pal.yellowDark }, door);
  const checks = [0, 1, 2].map((i) => mark(k, 'check', null, 1.6));
  const S = 0.95, b = k.buddy({ x: 100, y: FY, scale: S, facing: -1 });
  const drops = [0, 1, 2].map(() => el('circle', { r: 2.6, fill: pal.water }));
  const xf = (t) => t < 2 ? lerp(100, 180, easeInOut(seg(t, 1.1, 1.6))) : lerp(180, 350, easeInOut(seg(t, 2.6, 3.8)));
  return {
    update(t) {
      ck.set(7, 30 * seg(t, 0, 4.2));
      const p = gait(xf, t, 100);
      const face = t < 1.0 ? -1 : 1;
      const wash = hump(seg(t, 0.1, 1.0)), eat = hump(seg(t, 1.6, 2.5));
      b.pose({ x: p.x, walk: p.walk, facing: face, lean: p.lean + 8 * wash, mood: wash > 0.3 ? 'flat' : 'smile', blink: wash > 0.3 ? 1 : 0, look: 0.4, armL: wash > 0 ? 120 + 20 * Math.sin(t * 20) * wash : p.armL });
      const my = FY - 54 * S - 10 * S;
      let ar = p.armR;
      if (wash > 0) ar = 120 + 20 * Math.sin(t * 20 + 1);
      if (eat > 0) ar = lerp(40, reach(b, S, 'R', p.x + 14, my), eat);
      b.pose({ armR: ar, mood: eat > 0.6 ? 'open' : b.state.mood });
      const h = hp(b, S, 'R', 28);
      if (t > 1.6 && t < 2.5) tf(toast, h.x, h.y + 10, 0, 1 - 0.5 * seg(t, 1.9, 2.4));
      else if (t < 1.6) tf(toast, 222, 184);
      toast.setAttribute('opacity', t < 2.45 ? 1 : 0);
      drops.forEach((d, i) => { const q = (t * 2 + i / 3) % 1; k.set(d, { cx: p.x - 20 + i * 8, cy: my + 10 + q * 26, opacity: wash > 0.3 ? 1 - q : 0 }); });
      tf(door, 330, FY - 116, 0, Math.max(0.12, 1 - 0.88 * easeInOut(seg(t, 3.4, 3.9))), 1);
      [1.05, 2.5, 3.9].forEach((a, i) => { const q = seg(t, a, a + 0.25); tf(checks[i], [51, 210, 361][i], [60, 150, 100][i], 0, q <= 0 ? 0.001 : backOut(q) * 1.6); });
    }
  };
}
