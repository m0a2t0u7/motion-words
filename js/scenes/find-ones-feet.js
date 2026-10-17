// find one's feet：新しい職場で最初はふらつくが、だんだん足元が定まり慣れていく（例文 She is finding her feet at the new job.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, backOut } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, 'ふらつく'], [1.6, '足が定まる'], [3.0, '慣れて自信']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 新しい職場：入口の看板と机
  el('rect', { x: 22, y: 50, width: 64, height: 26, rx: 6, fill: pal.mint });
  k.text(54, 63, 'NEW', { 'font-size': 14, fill: '#FFFFFF' });
  el('rect', { x: 292, y: FY - 44, width: 90, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 298, y: FY - 36, width: 8, height: 36, fill: pal.woodDark });
  el('rect', { x: 368, y: FY - 36, width: 8, height: 36, fill: pal.woodDark });
  el('rect', { x: 320, y: FY - 78, width: 40, height: 32, rx: 4, fill: '#DDEFFA', stroke: '#B9C3D2', 'stroke-width': 2 });
  el('rect', { x: 330, y: FY - 46, width: 20, height: 4, fill: '#B9C3D2' });
  el('rect', { x: 296, y: FY - 62, width: 12, height: 18, rx: 3, fill: pal.coralDark });
  el('circle', { cx: 302, cy: FY - 70, r: 9, fill: pal.green });
  const b = k.buddy({ x: 70, y: FY, scale: 1.1 });
  const base = { armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0, facing: 1 };
  const sweat = el('path', { d: 'M 0 -8 Q 5 0 0 5 Q -5 0 0 -8 Z', fill: pal.water, stroke: pal.blueDark, 'stroke-width': 1.3 });
  const stars = [0, 1, 2].map(() => el('path', { d: 'M 0 -8 L 2.4 -2.5 L 8 -2 L 3.6 1.8 L 5 7.5 L 0 4.5 L -5 7.5 L -3.6 1.8 L -8 -2 L -2.4 -2.5 Z', fill: pal.yellow }));

  return {
    update(t) {
      const wob = Math.max(0, 1 - seg(t, 0.6, 2.4));   // ふらつきの大きさ
      const sway = Math.sin(t * 7) * 16 * wob;
      const walkP = easeInOut(seg(t, 0.2, 3.2));
      const x = lerp(70, 232, walkP);
      const walking = t > 0.2 && t < 3.2;
      const conf = easeOut(seg(t, 2.4, 3.2));
      b.pose({ ...base, x, walk: walking ? t * lerp(5, 9, walkP) : 0, lean: sway * 0.6 + 4 * conf, armL: 40 * wob + Math.sin(t * 7 + 2) * 40 * wob + 8, armR: 40 * wob + Math.sin(t * 7) * 40 * wob + 8, mood: t < 1.8 ? 'sad' : 'smile', look: 0.3, squash: 1 + 0.02 * Math.sin(t * 7) * wob, blink: 0 });
      if (t > 3.2) b.pose({ armR: lerp(8, 160, easeOut(seg(t, 3.2, 3.7))), mood: 'grin', lean: -3 });
      tf(sweat, x + 26, FY - 100 + ((t * 2) % 1) * 14, 0, wob > 0.2 ? 1 : 0, 1);
      stars.forEach((s, i) => {
        const p = seg(t, 3.3 + i * 0.12, 4.0 + i * 0.12);
        tf(s, x - 26 + i * 26, FY - 110 - 20 * easeOut(p) - (i % 2) * 12, 0, p > 0 && p < 1 ? 1 : 0, 1);
      });
    }
  };
}
