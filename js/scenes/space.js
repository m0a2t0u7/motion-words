// space：おもちゃのロケットを掲げた彼女が、ロケットで宇宙へ飛んでいく自分を思い描く（例文 She wants to travel to space.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { scene, held, hang, thinkCloud, P, blinkAt, popIn } from './nature.js';
import { planetG } from './planet.js';
import { starShape } from './star.js';

export function rocket(k, parent, s = 1) {
  const g = k.g({}, parent), r = k.g({}, g); k.tf(r, 0, 0, 0, s);
  const flame = k.el('path', { d: 'M -5 14 Q 0 30 5 14 Z', fill: '#FFB547' }, r);
  k.el('path', { d: 'M -8 14 L -14 20 L -8 4 Z M 8 14 L 14 20 L 8 4 Z', fill: '#F2685B' }, r);
  k.el('path', { d: 'M -8 14 L -8 -6 Q 0 -24 8 -6 L 8 14 Z', fill: '#fff', stroke: '#C9D2DE', 'stroke-width': 1.5 }, r);
  k.el('circle', { cx: 0, cy: -2, r: 3.6, fill: '#6AA8F7', stroke: '#C9D2DE', 'stroke-width': 1.2 }, r);
  return { g, flame };
}

export const meta = { duration: 4.4, beats: [[0, 'ロケットを持つ'], [1.4, '宇宙を思う'], [2.8, '宇宙へ行きたい']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const { FY } = scene(k, { FY: 240, top: '#F2EEF9', bot: '#FBFAF7', ground: '#E4DCCF', edge: '#D6CDBE' });
  // 部屋の窓（星空）とポスター
  el('rect', { x: 24, y: 40, width: 80, height: 70, rx: 6, fill: '#26335C', stroke: '#fff', 'stroke-width': 5 });
  [[40, 60], [70, 52], [88, 84], [52, 92]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 1.6, fill: '#fff' }));
  const her = k.buddy({ x: 120, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  const toy = rocket(k);
  const th = thinkCloud(k, 176, 128, -1);
  el('rect', { x: -70, y: -50, width: 140, height: 98, rx: 40, fill: '#1F2A4D' }, th.g);
  const pl = planetG(k, 11, th.g); tf(pl.g, 36, 18);
  [[-46, -26], [-20, 30], [50, -30], [8, -38], [-56, 14]].forEach(([x, y]) => tf(starShape(k, 4, '#FFE27A', th.g), x, y));
  const win = g({}, th.g); win.setAttribute('clip-path', k.clip((c) => el('rect', { x: -70, y: -50, width: 140, height: 98, rx: 40 }, c)));
  const R = rocket(k, win, 0.8);
  // 雲の中の小さな彼女（ロケットの窓から顔）
  return {
    update(t) {
      const up = easeOut(seg(t, 0.3, 1.0)), dream = easeInOut(seg(t, 1.2, 1.8));
      P(her, { armR: lerp(8, 160, up), lean: -3 * up, look: lerp(0.4, 0.7, dream), mood: dream > 0.5 ? 'grin' : 'smile', blink: blinkAt(t), armL: 8 + 12 * dream });
      her.body.children[3].setAttribute('transform', `translate(3 ${(-4 * dream).toFixed(1)})`);
      hang(k, her, S, toy.g, 'R');
      toy.flame.setAttribute('opacity', 0);
      th.show(seg(t, 1.2, 1.8), 272, 98);
      const f = easeInOut(seg(t, 1.8, 4.2));
      tf(R.g, lerp(-52, 44, f), lerp(30, -34, f) + 3 * Math.sin(t * 10), 45);
      R.flame.setAttribute('transform', `scale(1 ${(0.8 + 0.3 * Math.sin(t * 30)).toFixed(2)})`);
    }
  };
}
