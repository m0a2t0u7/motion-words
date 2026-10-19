// collar：朝は白いシャツの襟がきれい → 長い一日の仕事（時計が進み夕方に）→ 夜、襟が汚れているのに気づく（例文 The collar of his white shirt was dirty after the long day.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { wardrobe, reach, P, blinkAt } from './skirt.js';
import { desk, monitor } from './get-on-with.js';
import { clock } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, '朝、白い襟'], [1.0, '長い一日'], [3.0, '襟が汚れた']] };

export function create(k) {
  const { el, g, pal, tf } = k, S = 1.35;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 14, width: 400, height: 14, fill: '#ECE6DC' });
  const sky = el('rect', { x: 280, y: 40, width: 96, height: 76, rx: 6, fill: '#BFE3F7', stroke: '#fff', 'stroke-width': 5 });
  const sun = el('circle', { r: 10, fill: pal.yellow });
  const ck = clock(k, 220, 72, 22);
  const b = k.buddy({ x: 140, y: FY, scale: S });
  const W = wardrobe(k, b);
  const top = W.top({ color: '#fff', dark: pal.line, sleeve: 'long', to: -16, collar: true });
  W.bottom({ kind: 'trousers', color: '#3F4656', dark: '#2E3440', from: -16 });
  // 襟の汚れ（だんだん濃くなる）
  const dirt = g({}, top.cl);
  el('path', { d: 'M -10 -35 L -14 -31 M -12 -33 L -6 -26 M 10 -35 L 14 -31 M 12 -33 L 6 -26', stroke: '#9C8A6E', 'stroke-width': 2.6, 'stroke-linecap': 'round' }, dirt);
  el('path', { d: 'M -14 -31 L -5 -22 M 14 -31 L 5 -22', stroke: '#B8A487', 'stroke-width': 2, 'stroke-linecap': 'round' }, dirt);
  desk(k, 200, 160, FY);
  el('rect', { x: 214, y: FY - 52, width: 40, height: 6, rx: 2, fill: pal.sub });
  const mon = monitor(k, 276, FY - 46);
  // 拡大：襟の汚れ
  const zoom = g({});
  el('circle', { r: 38, fill: '#fff', stroke: pal.line, 'stroke-width': 3 }, zoom);
  el('path', { d: 'M -2 -4 L -26 -24 L -34 -12 L -12 12 Z M 2 -4 L 26 -24 L 34 -12 L 12 12 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 2, 'stroke-linejoin': 'round' }, zoom);
  el('path', { d: 'M -26 -22 L -32 -12 L -12 10 M 26 -22 L 32 -12 L 12 10', stroke: '#9C8A6E', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round', opacity: 0.8 }, zoom);
  return {
    update(t) {
      const day = easeInOut(seg(t, 0.9, 2.8));
      ck.set(9 + 10 * day, 0);
      // 空：昼 → 夕方 → 夜
      const c = day < 0.6 ? '#BFE3F7' : day < 0.9 ? '#F7C59F' : '#3B4669';
      sky.setAttribute('fill', c);
      k.set(sun, { cx: 300 + 56 * day, cy: 60 + 50 * hump(day * 0.5) + 30 * day, opacity: day < 0.9 ? 1 : 0 });
      sun.setAttribute('fill', day > 0.6 ? '#FF9E6B' : pal.yellow);
      mon.screen.setAttribute('fill', t > 0.9 && t < 2.8 && Math.sin(t * 20) > 0 ? '#B7DCF5' : '#9FD0F2');
      const tired = easeOut(seg(t, 2.4, 3.0));
      const lookDown = easeInOut(seg(t, 3.0, 3.4));
      const typing = t > 0.9 && t < 2.8 ? Math.sin(t * 24) * 6 : 0;
      P(b, { x: 140, lean: -3 * tired, squash: 1 - 0.05 * tired, look: lerp(0.3, -0.1, lookDown),
        mood: t < 2.6 ? 'smile' : 'sad', blink: t > 2.4 && t < 3.0 ? 0.5 : blinkAt(t),
        armR: 8, armL: 8 });
      const kb = reach(b, S, 'R', 222, FY - 54);
      b.pose({ armR: t < 2.8 ? kb + typing : lerp(kb, reach(b, S, 'R', 140 + 10 * S, FY - 40 * S), lookDown), armL: t < 2.8 ? 20 - typing * 0.5 : 8 });
      dirt.setAttribute('opacity', easeInOut(seg(t, 1.2, 2.9)));
      tf(zoom, 58, 100, 0, t > 3.3 ? easeOut(seg(t, 3.3, 3.7)) : 0.001);
    }
  };
}
