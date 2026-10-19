// connection：スーツケースを引いて空港を全力で走るまめ。閉まりかけた乗り継ぎ便のゲートにぎりぎり間に合う（例文 I almost missed my connection.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hall, board, suitcase, pullCase, drop, path } from './vehicle.js';
import { run } from './run-after.js';

export const meta = { duration: 4.2, beats: [[0, '乗り継ぎ便へ'], [1.2, '全力で走る'], [3.0, 'ぎりぎり間に合った']] };

export function create(k) {
  const { el, pal } = k;
  const FY = 236;
  hall(k, FY, { win: false });
  board(k, 20, 30, 210, [['GATE 9', '12:15', 'LAST CALL']]);
  // ゲートの扉（閉まりかけ）
  el('rect', { x: 300, y: 90, width: 100, height: FY - 90, fill: '#C9D1DC' });
  el('rect', { x: 300, y: 70, width: 100, height: 24, rx: 4, fill: pal.blue }); k.text(350, 82, 'GATE 9', { 'font-size': 13, fill: '#fff' });
  el('rect', { x: 312, y: 100, width: 76, height: FY - 100, fill: '#2B3446' });
  const door = el('rect', { y: 100, width: 76, height: FY - 100, fill: '#9AA5B4' });
  const agent = k.buddy({ x: 280, y: FY + 4, scale: 0.85, facing: -1, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: -40, y: FY + 8, scale: 0.9 });
  const cs = suitcase(k, pal.violet, '#7F63D6');
  const sw = [0, 1].map(() => drop(k));
  const X = path([[0, -40], [2.8, 336]]);
  return {
    update(t) {
      // 扉が閉まっていき、まめが入った直後に閉まる
      const c = easeInOut(seg(t, 0.4, 3.3)) * 0.75 + 0.25 * easeOut(seg(t, 3.2, 3.6));
      k.set(door, { x: 312, width: 76 * c });
      const r = run(X, t, -40, 1);
      P(me, { ...r, mood: t > 2.8 ? 'grin' : 'open', look: 0.8, blink: 0, armL: 30 });
      pullCase(k, cs, { x: me.state.x - 30, y: me.state.y - 50 }, FY + 16, 0.85, -1);
      const hide = t > 3.05 ? 'none' : 'inline'; me.g.setAttribute('display', hide); cs.setAttribute('display', hide);
      P(agent, { x: 280, look: -0.8, mood: t > 2.6 ? 'grin' : 'open', armL: 8 + 120 * hump(seg(t, 1.0, 3.0)) * (0.8 + 0.2 * Math.sin(t * 14)), blink: blinkAt(t) });
      sw.forEach((s, i) => { const p = ((t * 2 + i / 2) % 1); k.tf(s, me.state.x - 20 - 16 * p, FY - 80 + 10 * p); s.setAttribute('opacity', t < 3 ? 1 - p : 0); });
      void lerp;
    }
  };
}
