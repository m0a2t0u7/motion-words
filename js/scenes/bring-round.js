// bring round：相手（彼女）がボードの図を指して説明する。最初は首を振っていたまめの考え（四角）が、くるりと回って彼女と同じ形（丸）に変わり、うなずく（例文 She brought him round to her point of view.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { say } from './get-on-with.js';

export const meta = { duration: 4.6, beats: [[0, '意見が違う'], [1.8, '説得する'], [3.6, '同じ考えに']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 150, y: 40, width: 100, height: 70, rx: 6, fill: '#fff', stroke: pal.sub, 'stroke-width': 3 });
  el('circle', { cx: 200, cy: 75, r: 20, fill: pal.coral, opacity: 0.8 });
  const she = k.buddy({ x: 290, y: FY, scale: 0.95, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const him = k.buddy({ x: 100, y: FY, scale: 0.95 });
  const bs = say(k, 50, 44); el('circle', { r: 13, fill: pal.coral }, bs.inner);
  const bh = say(k, 50, 44);
  const sq = el('rect', { x: -13, y: -13, width: 26, height: 26, rx: 2, fill: pal.mintDark }, bh.inner);
  const ring = el('path', { d: 'M 18 -10 A 20 20 0 1 1 10 -18', stroke: pal.sub, 'stroke-width': 2.5, fill: 'none', opacity: 0 }, bh.inner);
  return {
    update(t) {
      const talk = t > 0.8 && t < 3.2;
      she.pose({ armR: talk ? 120 + Math.sin(t * 5) * 20 : 15, armL: talk ? 30 + Math.sin(t * 6) * 15 : 10, lean: talk ? Math.sin(t * 3) * 3 : 0, mood: t > 3.5 ? 'grin' : 'open', look: 0.5 });
      bs.show(320, 100, seg(t, 0.2, 0.5));
      bh.show(80, 100, seg(t, 0.2, 0.5));
      const no = t < 1.8 ? Math.sin(t * 10) * 0.8 * seg(t, 0.3, 0.6) : 0;
      const turn = easeInOut(seg(t, 2.2, 3.2));
      // 四角が回りながら角が取れて丸になる
      k.set(sq, { rx: lerp(2, 13, turn), fill: turn > 0.6 ? pal.coral : pal.mintDark, transform: `rotate(${turn * 360})` });
      ring.setAttribute('opacity', hump(turn));
      const nod = hump(seg(t, 3.4, 3.7)) + hump(seg(t, 3.8, 4.1));
      him.pose({ look: no || 0.5, mood: t > 3.3 ? 'grin' : 'flat', armL: 10, armR: t < 1.8 ? 20 : 10, lean: 9 * nod, squash: 1 });
    }
  };
}
