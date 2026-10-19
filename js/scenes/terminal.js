// terminal：「T1」と「T2」の建物が並ぶ空港で、スーツケースを引いたまめが T1 を通り過ぎ、T2 の入口へ入る（例文 Our flight leaves from Terminal 2.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt, walk, path, suitcase, pullCase, plane, sign } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, 'ターミナル1'], [1.6, '通り過ぎる'], [3.4, 'ターミナル2へ']] };

export function create(k) {
  const { el, pal } = k;
  const FY = 236;
  k.backdrop({ floorY: FY });
  const pl = plane(k);
  const bld = (x, w, label, c) => {
    el('rect', { x, y: FY - 110, width: w, height: 110, rx: 6, fill: '#E4EEF7' });
    el('rect', { x: x + 8, y: FY - 100, width: w - 16, height: 50, rx: 4, fill: '#CFE3F2' });
    el('rect', { x: x + w / 2 - 34, y: FY - 136, width: 68, height: 30, rx: 6, fill: c });
    k.text(x + w / 2, FY - 120, label, { 'font-size': 18, fill: '#fff' });
    el('rect', { x: x + w / 2 - 20, y: FY - 44, width: 40, height: 44, rx: 3, fill: '#9FC4E6', stroke: '#fff', 'stroke-width': 3 });
  };
  bld(10, 140, 'T1', pal.sub); bld(230, 160, 'T2', pal.blue);
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#E6EAF0' });
  const me = k.buddy({ x: 40, y: FY + 10, scale: 0.8 });
  const cs = suitcase(k, pal.coral, pal.coralDark);
  const X = path([[0.2, 40], [3.6, 300]]);
  return {
    update(t) {
      pl.set(lerp(-60, 460, t / 4.4), 70 - 30 * t / 4.4, -8, 0, 0.35);
      const inside = t > 4.0;
      walk(me, X, t, { mood: 'smile', look: t > 0.4 && t < 1.6 ? 0 : 0.6, blink: blinkAt(t), armL: 30 });
      me.body.children[3].setAttribute('transform', t > 0.4 && t < 1.4 ? 'translate(0 -6)' : 'translate(0 0)');
      pullCase(k, cs, { x: me.state.x - 30, y: me.state.y - 50 }, FY + 12, 0.8, -1);
      const a = 1 - seg(t, 3.7, 4.0);
      me.g.setAttribute('opacity', a); cs.setAttribute('opacity', a);
      void inside; void hump; void easeInOut; void P; void sign;
    }
  };
}
