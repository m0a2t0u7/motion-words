// pull away：バス停に止まっていたバスがドアを閉め、ゆっくり動き出して離れていく（例文 The bus pulled away from the stop.）
import { seg, lerp, easeIn, easeOut, wobble, clamp } from '../ease.js';
import { car } from './pull-up.js';
import { streetBg } from './weigh.js';

export const meta = { duration: 4.0, beats: [[0, 'バス停に停車'], [1.4, '動き出す'], [3.0, '離れていった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 210);
  el('rect', { x: 0, y: 216, width: 400, height: 84, fill: '#9AA3B2' });
  [20, 140, 260, 380].forEach((x) => el('rect', { x, y: 262, width: 60, height: 4, fill: '#fff', opacity: 0.8 }));
  // バス停（静止）
  el('rect', { x: 66, y: 120, width: 5, height: 92, fill: '#8C96A8' });
  el('circle', { cx: 68, cy: 116, r: 14, fill: '#fff', stroke: pal.blueDark, 'stroke-width': 4 });
  el('rect', { x: 60, y: 112, width: 16, height: 8, rx: 2, fill: pal.blueDark });
  k.shadow(68, 211, 10, 2);
  const bus = car(k, { color: pal.blue, dark: pal.blueDark, kind: 'bus' });
  const door = el('rect', { x: 0, y: -98, width: 22, height: 84, rx: 3, fill: '#DDE3EA' }, bus.body);
  const B = k.buddy({ x: 36, y: 212, scale: 0.6 });
  return {
    update(t) {
      const close = clamp(seg(t, 0.3, 0.8));
      k.set(door, { x: 60 + 11 * (1 - close), width: 22 * close + 0.1 });
      const p = seg(t, 1.0, 4.0);
      const x = 150 + 420 * easeIn(p) * 0.9;
      const pitch = -1.5 * Math.sin(seg(t, 1.0, 1.5) * Math.PI);
      bus.update(x, 256, x, pitch, 1);
      B.pose({ armR: t > 1.4 ? 120 + 20 * Math.sin(t * 9) : 10, look: 0.6, mood: 'smile' });
    }
  };
}
