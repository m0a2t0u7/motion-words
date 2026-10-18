// for a change：いつもの道（足跡だらけの灰色の道）の分かれ道で、「たまには」と花の咲く別の道を指さし、二人でそちらへ歩く（Let's walk a different way for a change.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { gait } from './dig.js';
import { tree } from './run-after.js';
import { P, blinkAt, talk } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, 'いつもの道'], [1.4, '別の道へ'], [3.0, 'たまには']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#DCEFD9' });
  // 分かれ道：まっすぐ（いつもの・灰色）と上り（花の道）
  el('path', { d: `M 0 ${FY} L 400 ${FY} L 400 ${FY + 16} L 0 ${FY + 16} Z`, fill: '#C9CFD8' });
  for (let x = 220; x < 400; x += 26) el('ellipse', { cx: x, cy: FY + 8, rx: 4, ry: 2.5, fill: '#A9B2BF' });
  el('path', { d: `M 200 ${FY} Q 280 ${FY - 30} 400 ${FY - 50} L 400 ${FY - 34} Q 280 ${FY - 14} 214 ${FY} Z`, fill: '#EBD9B4' });
  [[300, FY - 40, pal.coral], [330, FY - 52, pal.yellow], [360, FY - 46, pal.violet], [380, FY - 66, pal.coral], [270, FY - 30, pal.yellow]].forEach(([x, y, c]) => { el('line', { x1: x, y1: y, x2: x, y2: y + 10, stroke: pal.green, 'stroke-width': 2 }); el('circle', { cx: x, cy: y, r: 5, fill: c }); });
  tree(k, 350, FY - 52, 0.7);
  el('rect', { x: 330, y: 40, width: 60, height: 80, fill: '#C4CCD8' });
  const G = k.buddy({ x: 40, y: FY, scale: 0.85 });
  const C = k.buddy({ x: 0, y: FY, scale: 0.8, color: pal.coral, dark: pal.coralDark });
  const bub = talk(k, 'This way!', 84, 32, -1, 13);
  const path = (x0) => (t) => {
    if (t < 1.3) return { x: lerp(x0, x0 + 150, easeInOut(seg(t, 0, 1.3))), y: FY };
    const q = easeInOut(seg(t, 2.1, 4.3)), x = lerp(x0 + 150, x0 + 330, q);
    return { x, y: FY - clamp((x - 210) / 190) * 42 };
  };
  const pg = path(40), pc = path(-6);
  return {
    update(t) {
      const a = pg(t), b = pc(t);
      const wg = gait((tt) => pg(tt).x, t, 40), wc = gait((tt) => pc(tt).x, t, -6);
      const point = hump(seg(t, 1.3, 2.3));
      P(G, { x: a.x, y: a.y, walk: wg.walk, armL: wg.armL, armR: t > 1.3 && t < 2.3 ? 8 + 140 * clamp(point * 2) : wg.armR, lean: wg.lean,
        look: t > 1.2 && t < 1.6 ? -0.8 : 0.6, mood: t > 1.3 ? 'grin' : 'flat', blink: blinkAt(t) });
      P(C, { x: b.x, y: b.y, walk: wc.walk, armL: wc.armL, armR: wc.armR, lean: wc.lean, look: 0.6, mood: t > 1.8 ? 'grin' : 'flat', blink: blinkAt(t, 1) });
      bub.show(seg(t, 1.4, 1.7) * (t < 2.6 ? 1 : 0), a.x + 40, 118);
    }
  };
}
