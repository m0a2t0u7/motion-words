// switch on：暑くて汗をかく→壁のスイッチを押し上げる→扇風機が回り出して涼しくなる（例文 Please switch on the fan.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '暑い'], [1.1, 'スイッチを入れる'], [2.8, '扇風機が回る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 36, y: 40, width: 76, height: 66, rx: 8, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('circle', { cx: 74, cy: 70, r: 15, fill: pal.yellow });
  [0, 1, 2, 3, 4, 5, 6, 7].forEach((i) => { const a = i * Math.PI / 4; el('line', { x1: 74 + Math.cos(a) * 20, y1: 70 + Math.sin(a) * 20, x2: 74 + Math.cos(a) * 26, y2: 70 + Math.sin(a) * 26, stroke: pal.yellow, 'stroke-width': 3, 'stroke-linecap': 'round' }); });
  // 壁のスイッチ
  const plate = g({});
  el('rect', { x: -14, y: -24, width: 28, height: 48, rx: 6, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 }, plate);
  const led = el('circle', { cx: 0, cy: -17, r: 3, fill: pal.red }, plate);
  const rocker = g({}, plate);
  el('rect', { x: -9, y: -11, width: 18, height: 28, rx: 4, fill: '#E9EEF5', stroke: '#C5CDD9', 'stroke-width': 1.5 }, rocker);
  el('rect', { x: -9, y: -11, width: 18, height: 14, rx: 4, fill: '#C5CDD9' }, rocker);
  tf(plate, 150, 177);
  // 扇風機
  k.shadow(318, 237, 36, 6);
  el('ellipse', { cx: 318, cy: 232, rx: 30, ry: 7, fill: pal.sub });
  el('rect', { x: 313, y: 178, width: 10, height: 54, rx: 3, fill: '#A9B4C4' });
  const fan = g({});
  tf(fan, 318, 146);
  el('circle', { r: 38, fill: '#EAF3FB', opacity: 0.8 }, fan);
  const disc = el('circle', { r: 33, fill: pal.water, opacity: 0 }, fan);
  const blades = g({}, fan);
  [0, 120, 240].forEach((a) => { const bl = g({}, blades); tf(bl, 0, 0, a); el('path', { d: 'M 0 0 C 8 -6 14 -26 4 -32 C -6 -30 -8 -10 0 0 Z', fill: pal.blue }, bl); });
  el('circle', { r: 6, fill: pal.blueDark }, fan);
  el('circle', { r: 38, fill: 'none', stroke: '#8D98AA', 'stroke-width': 3 }, fan);
  el('circle', { r: 24, fill: 'none', stroke: '#B8C2D0', 'stroke-width': 1.5 }, fan);
  const wind = [0, 1, 2].map((i) => el('path', { d: `M 0 0 Q -14 ${-4 + i} -30 0`, fill: 'none', stroke: pal.water, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  const b = k.buddy({ x: 108, y: FY, scale: 0.85 });
  const sweat = [0, 1].map(() => el('path', { d: 'M 0 -6 Q 5 1 0 4 Q -5 1 0 -6 Z', fill: pal.water }));

  const T0 = 1.1, D = 1.2, W = 15;
  const speed = (t) => clamp((t - T0) / D);
  const ang = (t) => (t < T0 ? 0 : W * (t - T0 < D ? (t - T0) * (t - T0) / (2 * D) : D / 2 + (t - T0 - D)));
  return {
    update(t) {
      const press = easeOut(seg(t, 1.0, 1.12));
      const reach = easeOut(seg(t, 0.45, 0.95)), back = easeInOut(seg(t, 1.35, 1.9));
      const arm = lerp(lerp(12, 118, reach), 20, back) - 5 * press * (1 - back);
      const cool = seg(t, 1.8, 2.3);
      b.pose({ x: 108, armR: arm, armL: lerp(8, 4, cool), lean: 4 * reach * (1 - back), mood: t < 1.8 ? 'sad' : 'smile', blink: t > 2.0 ? 0.85 * hump(seg(t, 2.0, 3.0)) : 0, look: 0.6, squash: 1 + (t < 1.8 ? 0.015 * Math.sin(t * 6) : 0) });
      // スイッチ：押し上げて向きが反転、ランプが点く
      tf(rocker, 0, 3, 0, 1, lerp(1, -1, press));
      led.setAttribute('fill', press > 0.5 ? pal.green : pal.red);
      // 扇風機
      const s = speed(t);
      tf(blades, 0, 0, (ang(t) * 180) / Math.PI);
      blades.setAttribute('opacity', 1 - 0.55 * s);
      disc.setAttribute('opacity', 0.35 * s);
      wind.forEach((w, i) => {
        const u = (t * 1.6 + i / 3) % 1;
        tf(w, 270 - 50 * u, 130 + i * 16, 0, 1, 1);
        w.setAttribute('opacity', 0.9 * hump(u) * seg(s, 0.4, 1));
      });
      // 汗
      const sw = 1 - seg(t, 1.8, 2.3);
      sweat.forEach((d, i) => {
        const u = (t * 0.9 + i * 0.5) % 1;
        tf(d, 84 + i * 42, 152 + 22 * u, 0, 1.5 * hump(u * 0.9 + 0.1));
        d.setAttribute('opacity', sw);
      });
    }
  };
}
