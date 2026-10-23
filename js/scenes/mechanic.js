// mechanic：煙を出して止まった車のボンネットを開け、整備士のまめがレンチで直す。煙が止まりライトがつく（例文 The mechanic fixed our car.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, reach, held, P, blinkAt, wear, sc, pop } from './member.js';
import { auto, puffs } from './vehicle.js';
import { mark } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '車が故障'], [1.0, 'レンチで直す'], [3.2, '直った！']] };

function wrench(k) {
  const g = k.g({});
  k.el('rect', { x: -2.5, y: -4, width: 5, height: 22, rx: 2.5, fill: '#9AA6B6' }, g);
  k.el('path', { d: 'M -7 18 L 7 18 L 7 28 L 3 28 L 3 22 L -3 22 L -3 28 L -7 28 Z', fill: '#9AA6B6' }, g);
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#E9EDF2' });
  el('rect', { x: 0, y: 28, width: 400, height: 10, fill: '#C9D1DC' });
  for (let i = 0; i < 4; i++) el('rect', { x: 18 + i * 18, y: 70, width: 10, height: 40, rx: 2, fill: ['#F2685B', '#6AA8F7', '#FFCF5C', '#9AA6B6'][i] });
  el('rect', { x: 10, y: 110, width: 90, height: 6, fill: pal.woodDark });
  const own = k.buddy({ x: 40, y: FY, scale: 0.8, facing: 1, ...CO(k) });
  const car = auto(k, { kind: 'car', color: pal.blue, dark: pal.blueDark });
  const CX = 190, s = 1.05; car.set(CX, FY, 0, 0, 0, s);
  // エンジンルームとボンネット（前の窓下を支点に開く）
  const hx = CX + 46 * s, hy = FY - 42 * s;
  el('rect', { x: hx, y: hy - 2, width: 22 * s, height: 10, rx: 2, fill: '#5A6472' });
  const hood = g({}); el('rect', { x: 0, y: -4, width: 26 * s, height: 5, rx: 2, fill: pal.blueDark }, hood);
  const lamp = el('ellipse', { cx: CX + 72 * s, cy: FY - 34 * s, rx: 10, ry: 5, fill: '#FFF2A8' });
  const smoke = puffs(k, 5);
  const b = k.buddy({ x: 330, y: FY, scale: S, facing: -1 }); wear(k, b, 'cap', '#3F60B5');
  const wr = wrench(k);
  const ok = mark(k, 'check', null, 1.6);
  return {
    update(t) {
      tf(hood, hx, hy, -60);
      const fixed = t > 2.8;
      smoke(hx + 12, hy - 6, t, () => !fixed, 0.3);
      const turn = t > 1.0 && t < 2.8 ? Math.sin((t - 1.0) * 10) : 0;
      P(b, { lean: 18 * seg(t, 0.4, 1.0) * (1 - seg(t, 2.9, 3.2)), look: 0.6, blink: blinkAt(t), mood: fixed ? 'grin' : 'flat', armL: 20 });
      const tg = { x: hx + 16 + 3 * turn, y: hy + 2 + 2 * Math.cos((t - 1) * 10) };
      b.pose({ armR: t > 2.9 ? lerp(reach(b, S, 'R', tg.x, tg.y), 150, easeInOut(seg(t, 2.9, 3.3))) : lerp(20, reach(b, S, 'R', tg.x, tg.y), easeInOut(seg(t, 0.4, 1.0))) });
      held(k, b, S, wr, 'R', 20 * turn, 26);
      lamp.setAttribute('opacity', fixed ? 0.6 + 0.4 * Math.abs(Math.sin(t * 5)) : 0);
      tf(ok, CX, FY - 120, 0, pop(seg(t, 3.0, 3.4)));
      P(own, { look: 0.7, blink: blinkAt(t, 1), mood: fixed ? 'grin' : 'sad', lift: 10 * hump(seg(t, 3.2, 3.7)), armR: fixed ? 8 + 140 * hump(seg(t, 3.1, 4.3)) : 8, squash: fixed ? 1 : 0.97 });
    }
  };
}
