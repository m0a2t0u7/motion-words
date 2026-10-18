// bring along：まめが机の上の身分証を取って持ち、受付まで一緒に持って来る。受付の人に見せると、チェックが付く（例文 Please bring along your ID card.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { hp, gait } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '身分証を取る'], [1.6, '持って行く'], [3.4, '見せてOK']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 左：自宅の小机、右：受付カウンター
  el('rect', { x: 20, y: 186, width: 70, height: 6, rx: 2, fill: pal.wood });
  el('rect', { x: 28, y: 192, width: 6, height: 44, fill: pal.woodDark }); el('rect', { x: 76, y: 192, width: 6, height: 44, fill: pal.woodDark });
  el('line', { x1: 150, y1: 30, x2: 150, y2: 236, stroke: pal.line, 'stroke-width': 3, 'stroke-dasharray': '6 6' });
  const staff = k.buddy({ x: 340, y: FY - 10, scale: 0.85, color: pal.coral, dark: pal.coralDark, facing: -1 });
  el('rect', { x: 290, y: 176, width: 110, height: 60, fill: '#F6D9B3' });
  el('rect', { x: 286, y: 170, width: 114, height: 8, rx: 3, fill: pal.wood });
  // 身分証
  const id = g({});
  el('rect', { x: -12, y: -8, width: 24, height: 16, rx: 2.5, fill: '#fff', stroke: pal.blueDark, 'stroke-width': 2 }, id);
  el('circle', { cx: -5, cy: -1, r: 3.5, fill: pal.mint }, id);
  [-3, 2].forEach((y) => el('line', { x1: 1, x2: 8, y1: y, y2: y, stroke: pal.sub, 'stroke-width': 1.6 }, id));
  const b = k.buddy({ x: 120, y: FY, scale: 0.9, facing: -1 });
  const ok = g({});
  el('circle', { r: 14, fill: pal.green }, ok);
  el('path', { d: 'M -6 0 L -1 5 L 7 -5', stroke: '#fff', 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ok);
  const xf = (t) => lerp(120, 236, easeInOut(seg(t, 1.2, 2.8)));
  return {
    update(t) {
      const grab = easeInOut(seg(t, 0.3, 0.7)) * (1 - easeInOut(seg(t, 0.8, 1.1)));
      const p = gait(xf, t, 120);
      const show = easeOut(seg(t, 2.8, 3.1));
      b.pose({ x: p.x, walk: p.walk, facing: t < 1.1 ? -1 : 1, armR: t < 1.1 ? lerp(10, 70, grab) + 20 : lerp(40, 100, show), armL: p.armL, lean: p.lean + 8 * grab, look: 0.6, mood: t > 3.4 ? 'grin' : 'smile' });
      const h = hp(b, 0.9);
      const onDesk = t < 0.6;
      tf(id, onDesk ? 70 : h.x + 3 * b.state.facing, onDesk ? 182 : h.y - 6, onDesk ? 0 : -8);
      staff.pose({ lean: 6 * show, look: 0.5, armR: lerp(10, 60, easeOut(seg(t, 3.3, 3.6))), mood: t > 3.3 ? 'grin' : 'smile' });
      const q = seg(t, 3.3, 3.6);
      tf(ok, 300, 120, 0, backOut(q) || 0.001); ok.setAttribute('opacity', q > 0 ? 1 : 0);
    }
  };
}
