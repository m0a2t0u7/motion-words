// world：スーツケースを持った彼女が、飛行機で地球をぐるっと1周する旅を思い描く（例文 She wants to travel around the world.）
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';
import { scene, hills, globe, hang, thinkCloud, P, blinkAt } from './nature.js';

export function plane(k, parent, col = '#fff') {
  const g = k.g({}, parent);
  k.el('path', { d: 'M -12 0 Q -12 -3 -8 -3 L 10 -3 Q 14 -1 10 1.5 L -8 1.5 Z', fill: col, stroke: '#9FB0C6', 'stroke-width': 1.2 }, g);
  k.el('path', { d: 'M -2 -2 L -6 -10 L -2 -10 L 4 -2 Z M -2 1 L -6 8 L -2 8 L 4 1 Z M -11 -2 L -13 -8 L -9 -8 L -7 -2 Z', fill: '#F2685B' }, g);
  return g;
}
export function suitcase(k, parent, col = '#F2685B', dark = '#C94C40') {
  const g = k.g({}, parent);
  k.el('path', { d: 'M -6 6 V -1 H 6 V 6', stroke: k.pal.ink, 'stroke-width': 3, fill: 'none', 'stroke-linejoin': 'round' }, g);
  k.el('rect', { x: -18, y: 6, width: 36, height: 30, rx: 5, fill: col }, g);
  k.el('rect', { x: -18, y: 6, width: 36, height: 30, rx: 5, fill: 'none', stroke: dark, 'stroke-width': 2 }, g);
  k.el('path', { d: 'M -8 6 V 36 M 8 6 V 36', stroke: dark, 'stroke-width': 2 }, g);
  k.el('circle', { cx: 10, cy: 20, r: 4, fill: '#FFCF5C' }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, 'スーツケース'], [1.3, '世界を思う'], [2.6, '世界一周したい']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1;
  const { FY } = scene(k, { FY: 240, top: '#DCEEFB', ground: '#E8E2D8', edge: '#D6CEC0' });
  hills(k, FY, '#E3F0E4', '#D7EBD8');
  const her = k.buddy({ x: 110, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  const bag = suitcase(k);
  const th = thinkCloud(k, 170, 130, -1);
  const gl = globe(k, 38, th.g);
  el('ellipse', { cx: 0, cy: 0, rx: 62, ry: 24, fill: 'none', stroke: '#9FB0C6', 'stroke-width': 2, 'stroke-dasharray': '5 5' }, th.g);
  const pl = plane(k, th.g);
  return {
    update(t) {
      const r = easeOut(seg(t, 0.2, 0.8)), dream = easeInOut(seg(t, 1.0, 1.7));
      P(her, { armR: 10, armL: lerp(8, 24, dream), lean: -4 * dream, look: lerp(0.3, 0.8, dream), mood: dream > 0.5 ? 'grin' : 'smile', blink: blinkAt(t), lift: 3 * Math.abs(Math.sin(t * 6)) * seg(t, 2.6, 2.8) });
      hang(k, her, S, bag, 'R');
      th.show(seg(t, 1.0, 1.6), 270, 92);
      gl.spin(t * 60);
      const a = Math.PI / 2 + easeInOut(seg(t, 1.6, 4.2)) * Math.PI * 2, x = 62 * Math.cos(a), y = 24 * Math.sin(a);
      tf(pl, x, y, -Math.sin(a) > 0 ? 0 : 0, Math.cos(a) < 0 ? 1 : -1, 1);
      pl.setAttribute('opacity', Math.sin(a) < -0.35 ? 0.35 : 1);
      tf(pl, x, y, (Math.atan2(24 * Math.cos(a), -62 * Math.sin(a)) * 180) / Math.PI);
      void r;
    }
  };
}
