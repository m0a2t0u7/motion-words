// look down on（否定）：台の上の彼女は、下の人を見下ろさず、台を降りて同じ目の高さで握手する（例文 She never looks down on other people.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { roomBg, faceAt, walkPose } from './look-over.js';
import { hp } from './hand-over.js';

export const meta = { duration: 4.4, beats: [[0, '台の上と下'], [1.4, '降りていく'], [3.3, '同じ目線で握手']] };

export function create(k) {
  const { el, pal } = k;
  const FY = roomBg(k, 'office', 240);
  // ステージ（台）と階段
  el('rect', { x: 20, y: 190, width: 130, height: 50, fill: pal.wood });
  el('rect', { x: 20, y: 190, width: 130, height: 6, fill: pal.woodDark });
  el('rect', { x: 150, y: 207, width: 26, height: 33, fill: pal.wood }); el('rect', { x: 150, y: 207, width: 26, height: 4, fill: pal.woodDark });
  el('rect', { x: 176, y: 224, width: 26, height: 16, fill: pal.wood }); el('rect', { x: 176, y: 224, width: 26, height: 4, fill: pal.woodDark });
  const she = k.buddy({ x: 100, y: 192, scale: 0.85 });
  const o = k.buddy({ x: 300, y: FY, scale: 0.85, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const eye = el('line', { stroke: pal.blue, 'stroke-width': 2.5, 'stroke-dasharray': '6 6', 'stroke-linecap': 'round' });
  const xf = (t) => lerp(100, 244, easeInOut(seg(t, 0.9, 2.7)));
  const yAt = (x) => x < 158 ? 192 : x < 186 ? lerp(192, 209, easeInOut(seg(x, 158, 170))) : lerp(209, 226, easeInOut(seg(x, 186, 196))) + (x > 205 ? lerp(0, 14, easeInOut(seg(x, 205, 215))) : 0);
  return {
    update(t) {
      const p = walkPose(xf, t, 100);
      const shake = seg(t, 3.0, 3.4), sw = Math.sin((t - 3.2) * 16) * 6 * seg(t, 3.2, 3.4) * (1 - seg(t, 3.9, 4.2));
      she.pose({ x: p.x, y: yAt(p.x), walk: p.walk, armL: p.armL, armR: p.m > 0.1 ? p.armR : 8 + 72 * easeOut(shake) + sw, lean: p.lean, look: 0.6, mood: 'grin' });
      faceAt(she, 4, t < 0.9 ? 0 : 0);
      o.pose({ armR: 8 + 72 * easeOut(seg(t, 3.0, 3.4)) - sw, mood: t > 3.0 ? 'grin' : 'smile', look: 0.6 });
      const a = hp(she, 0.85), b = hp(o, 0.85);
      const on = seg(t, 3.5, 3.8);
      k.set(eye, { x1: she.state.x + 4, x2: o.state.x - 4, y1: FY - 54, y2: FY - 54, opacity: on * 0.8 });
    }
  };
}
