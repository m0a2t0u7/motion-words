// want：古くて破れたかばんを持ったまめが、店のショーウィンドウの新しいかばんを見つけ、窓に手を当てて「欲しい」と見つめる（例文 I want a new bag.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { hp } from './dig.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { path } from './queue-up.js';
import { thought } from './work-on.js';
import { heart } from './weigh.js';
import { star } from './get-on-with.js';

function bag(k, color, dark, old, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('path', { d: 'M -10 0 Q -10 -16 0 -16 Q 10 -16 10 0', stroke: dark, 'stroke-width': 3.5, fill: 'none' }, g);
  k.el('rect', { x: -17, y: 0, width: 34, height: 26, rx: 5, fill: color }, g);
  k.el('rect', { x: -17, y: 6, width: 34, height: 6, fill: dark, opacity: 0.6 }, g);
  if (old) { k.el('path', { d: 'M 6 18 L 10 22 L 7 26 M 6 18 L 2 24', stroke: pal.ink, 'stroke-width': 1.5, fill: 'none', opacity: 0.6 }, g); k.el('rect', { x: -12, y: 15, width: 10, height: 8, rx: 1, fill: '#D9D2C3', stroke: '#B8AE99', 'stroke-dasharray': '2 1.5' }, g); }
  else { k.el('rect', { x: -3, y: 4, width: 6, height: 6, rx: 1.5, fill: pal.yellow }, g); k.el('path', { d: 'M -12 3 Q 0 1 12 3', stroke: '#fff', 'stroke-width': 2, opacity: 0.5, fill: 'none' }, g); }
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '古いかばん'], [1.4, '見つける'], [2.6, '新しいのが欲しい']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: '#E3E8EE' });
  // 店先とショーウィンドウ（動かない）
  el('rect', { x: 150, y: 40, width: 250, height: FY - 46, fill: '#FFF1D2' });
  for (let i = 0; i < 10; i++) el('path', { d: `M ${150 + i * 25} 40 h 25 v 18 q -12.5 8 -25 0 Z`, fill: i % 2 ? '#fff' : pal.violet });
  el('rect', { x: 180, y: 80, width: 200, height: 130, rx: 4, fill: '#E4F2FA', stroke: '#fff', 'stroke-width': 5 });
  el('rect', { x: 250, y: 170, width: 70, height: 36, rx: 3, fill: pal.wood });
  const nb = bag(k, pal.coral, pal.coralDark, false); tf(nb, 285, 136, 0, 1.3);
  const sp = [0, 1, 2].map(() => star(k, k.root, 6, '#fff'));
  el('path', { d: 'M 196 100 L 226 90 M 196 120 L 240 104', stroke: '#fff', 'stroke-width': 4, opacity: 0.6, 'stroke-linecap': 'round' });
  el('rect', { x: 180, y: FY - 26, width: 200, height: 20, fill: '#F0D9AE' });
  const me = k.buddy({ x: -40, y: FY, scale: 0.95 });
  const ob = bag(k, '#B8A98E', '#8F8167', true);
  const th = thought(k, 70, 52, -1);
  const tb = bag(k, pal.coral, pal.coralDark, false, th.inner); tf(tb, -6, -12, 0, 0.75);
  const hr = heart(k, th.inner, pal.red); tf(hr, 18, -4, 0, 0.9);
  const xf = path([[0.1, -40], [1.4, 148], [2.0, 148], [2.5, 160]]);
  return {
    update(t) {
      const w = walkTo(xf, t, -40, 1);
      const turn = easeInOut(seg(t, 1.5, 1.9)), press = easeInOut(seg(t, 2.0, 2.5));
      const sway = 2 * Math.sin(t * 3) * press;
      P(me, { x: w.x, walk: w.walk, armL: w.armL, armR: lerp(w.armR, 20, turn), lean: w.lean + 6 * press + sway * 0.4, look: lerp(0.2, 1, turn), mood: t > 1.6 ? (t > 2.6 ? 'open' : 'grin') : 'flat', blink: blinkAt(t, 0.4), lift: 3 * hump(seg(t, 1.5, 1.8)) });
      // 片手は窓へ（手先を窓に当てる）
      me.pose({ armR: lerp(lerp(w.armR, 20, turn), 112, press) });
      const lh = hp(me, 0.95, 'L', 24); tf(ob, lh.x, lh.y - 2, 0, 0.8);
      sp.forEach((s, i) => { const q = ((t * 0.7 + i * 0.33) % 1); tf(s, 262 + i * 22, 118 + (i % 2) * 22, q * 90, Math.max(0.001, hump(q))); });
      const tp = seg(t, 2.6, 2.95);
      tf(th.g, 104, 90, 0, Math.max(0.001, easeOut(tp))); th.g.setAttribute('opacity', tp > 0 ? 1 : 0);
      tf(hr, 18, -4 - 2 * Math.abs(Math.sin(t * 5)) * (t > 3), 0, 0.9 + 0.1 * Math.abs(Math.sin(t * 5)));
    }
  };
}
