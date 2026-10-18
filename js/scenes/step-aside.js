// step aside：廊下の真ん中にいた人が横（奥）へ一歩よけ、相手を先に通す（例文 He stepped aside to let her pass.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { person, path, walk } from './queue-up.js';

export const meta = { duration: 4.2, beats: [[0, '通り道に立つ'], [1.4, '脇へよける'], [3.4, '相手が通った']] };

export function create(k) {
  const { el, pal } = k;
  const FY = k.backdrop({ floorY: 196, mood: 'indoor' });
  for (let x = 20; x < 400; x += 120) { el('rect', { x, y: 70, width: 70, height: 126, rx: 3, fill: '#E9DCCB' }); el('circle', { cx: x + 60, cy: 136, r: 4, fill: pal.woodDark }); }
  el('rect', { x: 0, y: 228, width: 400, height: 3, fill: pal.floorEdge });
  const b = k.buddy({ x: 190, y: 250, scale: 0.85 });
  const her = person(k, 'coral', { x: 460, y: 250, scale: 0.85, facing: -1 });
  const hxf = path([[0.6, 460], [3.8, -60]]);
  return {
    update(t) {
      const s = easeInOut(seg(t, 1.0, 1.7));
      const y = lerp(250, 214, s), sc = lerp(0.85, 0.74, s);
      const ph = hump(seg(t, 1.0, 1.7));
      b.pose({ x: lerp(190, 176, s), y, walk: ph * 1.4, lean: -4 * ph, look: t < 2.6 ? 0.6 : -0.6, mood: t > 1.7 ? 'smile' : 'flat', armR: t > 1.8 && t < 3.4 ? lerp(8, 70, easeOut(seg(t, 1.8, 2.2))) : 8 });
      b.g.setAttribute('transform', `translate(${b.state.x} ${y}) scale(${sc})`);
      walk(her, hxf, t, { y: 250, facing: -1, look: t > 2.0 && t < 2.8 ? 0.6 : -0.3, mood: t > 2.2 ? 'grin' : 'smile' });
    }
  };
}
