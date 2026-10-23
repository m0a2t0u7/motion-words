// glass：「お水を1杯もらえますか」と手をあげると、店員が空のグラスに水を注いでくれる（例文 Can I have a glass of water?）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, dinner, vessel, iconSay, P, blinkAt, C } from './jam.js';
import { gait } from './weigh.js';
import { lamp, dish } from './restaurant.js';

export const meta = { duration: 4.4, beats: [[0, 'お水ください'], [1.4, '店員が注ぐ'], [3.4, '1杯の水']] };

export function create(k) {
  const { el, pal } = k, S = 1.15;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: 236, fill: '#F7EFE4' });
  lamp(k, 120, 30); lamp(k, 300, 30);
  const b = k.buddy({ x: 110, y: 236, scale: S });
  const w = k.buddy({ x: 480, y: 236, scale: 1.1, facing: -1, ...C(k, 'blue') });
  el('rect', { x: 0, y: 0, width: 0, height: 0 });
  dinner(k, 60, 260, 198, '#fff', '#6AA8F7');
  const d = dish(k); k.tf(d.g, 120, 198); d.set(0.5);
  const GX = 180;
  const gl = vessel(k, null, { w: 22, h: 32, taper: 0.8, glass: true, liquid: '#8FD3F4' }); k.tf(gl.g, GX, 200, 0, 1.15);
  // 水差し（店員の右手。原点＝取っ手、注ぎ口は左）
  const jug = k.g({});
  el('path', { d: 'M -6 -4 L -34 -4 L -38 -30 L -44 -34 L -30 -34 L -10 -34 Z', fill: 'rgba(200,232,250,0.7)', stroke: '#A9CDE3', 'stroke-width': 1.5 }, jug);
  el('rect', { x: -35, y: -24, width: 24, height: 18, fill: '#8FD3F4', opacity: 0.8 }, jug);
  el('path', { d: 'M -10 -30 Q 2 -30 2 -18 Q 2 -8 -8 -8', stroke: '#A9CDE3', 'stroke-width': 3.5, fill: 'none' }, jug);
  const stream = el('path', { stroke: '#8FD3F4', 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' });
  const A = arms(k, b, S, { back: ['L'] }), W = arms(k, w, 1.1, { col: pal.blue, dark: pal.blueDark, back: ['L'] });
  const ask = iconSay(k, 64, 40, -1, (g) => { const c = vessel(k, g, { w: 14, h: 20, taper: 0.8, glass: true, liquid: '#8FD3F4' }); k.tf(c.g, -6, 10); c.set(0.8); k.text(14, 0, '?', { 'font-size': 18, fill: pal.blueDark }, g); });
  const xf = (t) => lerp(480, 236, easeInOut(seg(t, 0.8, 1.8)));
  return {
    update(t) {
      const raise = easeOut(seg(t, 0.2, 0.6)) * (1 - easeInOut(seg(t, 1.6, 2.0)));
      const pour = easeInOut(seg(t, 2.0, 2.3)) * (1 - easeInOut(seg(t, 3.1, 3.4)));
      const g = gait(xf, t, 480);
      P(b, { lean: 0, look: 0.6, blink: blinkAt(t), mood: t > 3.3 ? 'grin' : t < 1.4 ? 'open' : 'smile', armL: 8 });
      P(w, { x: g.x, walk: g.walk, lean: g.lean + 6 * pour, look: 0.5, blink: blinkAt(t, 1), facing: -1, mood: 'smile' });
      A.to('R', lerp(150, 146, raise), lerp(212, 112, raise));
      A.to('L', 100, 202);
      // 店員：右手（奥）に水差し → 注ぐ
      const hx = g.x - 14 - 22 * easeInOut(seg(t, 1.6, 1.95)), hy = lerp(176, 144, easeInOut(seg(t, 1.7, 2.0)));
      W.to('R', hx, hy); W.to('L', g.x - 20, 204);
      k.tf(jug, hx + 6, hy + 14, -50 * pour);
      const a = (-50 * pour * Math.PI) / 180, sx = hx + 6 + (-44 * Math.cos(a) + 34 * Math.sin(a)), sy = hy + 14 + (-44 * Math.sin(a) - 34 * Math.cos(a));
      const lv = easeInOut(seg(t, 2.25, 3.1));
      gl.set(0.8 * lv);
      k.set(stream, { d: `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${GX + 4} ${sy} ${GX} ${200 - 36 + 30 * lv * 0.8}`, opacity: pour > 0.9 ? 1 : 0 });
      ask.show(seg(t, 0.3, 0.6) * (1 - seg(t, 1.6, 1.8)), 140, 70);
    }
  };
}
