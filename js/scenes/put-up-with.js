// put up with（否定）：窓の外の工事のドリル音（ギザギザ線）。まめは耳をふさいでしばらく耐えるが、ついに立ち上がって怒り、もう我慢できない（例文 I can't put up with this noise any longer.）
import { seg, lerp, easeInOut, easeOut, hump, backOut, clamp } from '../ease.js';
import { say, desk } from './get-on-with.js';

export const meta = { duration: 4.4, beats: [[0, 'うるさい音'], [1.4, '耐える'], [3.2, 'もう限界']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 大きな窓と、外で工事する人
  const win = g({});
  el('rect', { x: 210, y: 40, width: 170, height: 130, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 6 }, win);
  el('rect', { x: 216, y: 136, width: 158, height: 28, fill: '#D6D9DE' }, win);
  const clip = k.clip((cp) => el('rect', { x: 213, y: 43, width: 164, height: 124 }, cp));
  const outside = g({ 'clip-path': clip });
  const w = k.buddy({ parent: outside, x: 300, y: 160, scale: 0.6, color: pal.coral, dark: pal.coralDark, facing: -1 });
  el('path', { d: 'M -30 -66 Q -28 -96 0 -96 Q 28 -96 30 -66 Z', fill: pal.yellow }, w.body);
  const drill = g({}, outside);
  el('rect', { x: -6, y: -30, width: 12, height: 26, rx: 3, fill: pal.sub }, drill);
  el('rect', { x: -16, y: -34, width: 32, height: 6, rx: 3, fill: pal.ink }, drill);
  el('rect', { x: -2, y: -4, width: 4, height: 12, fill: pal.ink }, drill);
  const dust = [0, 1, 2].map(() => el('circle', { r: 4, fill: '#C2B6A3' }, outside));
  el('line', { x1: 295, y1: 43, x2: 295, y2: 167, stroke: '#fff', 'stroke-width': 5 });
  // 音のギザギザ（窓から部屋へ）
  const zig = [0, 1, 2].map(() => el('path', { d: 'M 0 0 l 8 -10 l 8 10 l 8 -10 l 8 10', stroke: pal.red, 'stroke-width': 3, fill: 'none', 'stroke-linejoin': 'round' }));
  const b = k.buddy({ x: 110, y: FY - 4, scale: 0.95 });
  const top = desk(k, 40, 140, FY);
  const book = g({}); tf(book, 140, top - 2);
  el('path', { d: 'M -16 0 L 0 -4 L 16 0 L 16 -3 L 0 -7 L -16 -3 Z', fill: pal.blue }, book);
  const fume = g({});
  [[-14, 0], [0, -6], [14, 0]].forEach(([x, y]) => el('path', { d: `M ${x} ${y} q -4 -6 0 -12 q 4 -6 0 -12`, stroke: pal.red, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, fume));
  const bub = say(k, 44, 40);
  k.text(0, 2, '!!', { 'font-size': 24, fill: pal.red }, bub.inner);
  return {
    update(t) {
      const jack = Math.sin(t * 40);
      w.pose({ armL: 60, armR: 60, lean: 8, lift: Math.abs(jack) * 2, mood: 'flat', look: 0.3 });
      tf(drill, 272, 154 + Math.abs(jack) * 2);
      dust.forEach((d, i) => { const q = (t * 1.5 + i / 3) % 1; k.set(d, { cx: 272 + (i - 1) * 14 * q * 2, cy: 162 - q * 20, opacity: 1 - q }); });
      zig.forEach((z, i) => { const q = (t * 0.9 + i / 3) % 1; tf(z, 210 - q * 70, 80 + i * 26, 0, 0.7 + q * 0.5); z.setAttribute('opacity', hump(q)); });
      // まめ：読書→耳をふさいで震えながら耐える→立ち上がって怒る
      const cover = easeInOut(seg(t, 0.5, 0.9)), snap = easeOut(seg(t, 2.6, 2.9));
      const tremble = cover * (1 - snap) * Math.sin(t * 50) * 1.6 * seg(t, 1.2, 2.5);
      b.pose({ y: FY - 4 - 16 * snap, armR: lerp(lerp(60, 160, cover), 120 + 20 * Math.sin(t * 16), snap), armL: lerp(lerp(20, 160, cover), 120 + 20 * Math.sin(t * 16 + 1), snap),
        lean: tremble - 8 * cover * (1 - snap), squash: 1 - 0.08 * cover * (1 - snap) + 0.04 * snap, blink: cover * (1 - snap) * 0.8, mood: snap > 0.3 ? 'open' : cover > 0.3 ? 'flat' : 'smile', look: lerp(-0.2, 0.8, snap), lift: hump(seg(t, 2.6, 3.0)) * 10 });
      tf(fume, b.state.x, FY - 120 - 16 * snap, 0, 1 + 0.1 * Math.sin(t * 12));
      fume.setAttribute('opacity', snap);
      bub.show(170, 96, backOut(seg(t, 2.8, 3.1)));
    }
  };
}
