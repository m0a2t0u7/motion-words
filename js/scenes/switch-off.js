// switch off：回っている扇風機のスイッチを切り、羽根がゆっくり止まってベッドへ向かう（例文 He switched off the fan before bed.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, '扇風機が回る'], [1.3, 'スイッチを切る'], [3.2, '止まった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'evening' });
  el('rect', { x: 190, y: 36, width: 76, height: 66, rx: 8, fill: '#C9D3F2', stroke: '#fff', 'stroke-width': 5 });
  el('path', { d: 'M 236 54 A 15 15 0 1 0 250 76 A 12 12 0 1 1 236 54 Z', fill: '#FFF6D6' });
  [[204, 52], [254, 90], [210, 88]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 2, fill: '#fff' }));
  // ベッド
  el('rect', { x: 10, y: 150, width: 12, height: 86, rx: 4, fill: pal.woodDark });
  el('rect', { x: 18, y: 198, width: 108, height: 22, rx: 6, fill: pal.wood });
  el('rect', { x: 20, y: 218, width: 8, height: 18, fill: pal.woodDark });
  el('rect', { x: 114, y: 218, width: 8, height: 18, fill: pal.woodDark });
  el('rect', { x: 20, y: 184, width: 104, height: 18, rx: 7, fill: '#EAF2FA' });
  el('rect', { x: 52, y: 180, width: 72, height: 20, rx: 8, fill: pal.violet });
  el('ellipse', { cx: 38, cy: 182, rx: 15, ry: 8, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 });
  k.shadow(70, 237, 62, 5);
  // 壁のスイッチ
  const plate = g({});
  el('rect', { x: -14, y: -24, width: 28, height: 48, rx: 6, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 }, plate);
  const led = el('circle', { cx: 0, cy: -17, r: 3, fill: pal.red }, plate);
  const rocker = g({}, plate);
  el('rect', { x: -9, y: -11, width: 18, height: 28, rx: 4, fill: '#E9EEF5', stroke: '#C5CDD9', 'stroke-width': 1.5 }, rocker);
  el('rect', { x: -9, y: -11, width: 18, height: 14, rx: 4, fill: '#C5CDD9' }, rocker);
  tf(plate, 210, 177);
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
  const b = k.buddy({ x: 168, y: FY, scale: 0.85 });
  const zz = g({});
  k.text(0, 0, 'Z', { 'font-size': 20, fill: pal.violet }, zz);
  k.text(14, -14, 'z', { 'font-size': 14, fill: pal.violet }, zz);

  const T0 = 1.3, D = 1.7, W = 15;
  const speed = (t) => (t < T0 ? 1 : Math.pow(1 - clamp((t - T0) / D), 2));
  const ang = (t) => (t < T0 ? W * t : W * T0 + W * D * (1 - Math.pow(1 - clamp((t - T0) / D), 3)) / 3);
  return {
    update(t) {
      const press = easeOut(seg(t, 1.3, 1.42));
      const stretch = easeInOut(seg(t, 0.0, 0.35)) * (1 - easeInOut(seg(t, 0.75, 1.0)));
      const reach = easeOut(seg(t, 0.85, 1.25)), back = easeInOut(seg(t, 1.65, 2.2));
      let arm = lerp(lerp(lerp(12, 150, stretch), 118, reach), 20, back) - 5 * press * (1 - back);
      const walkP = easeInOut(seg(t, 2.6, 3.4));
      const x = lerp(168, 140, walkP);
      const yawn2 = hump(seg(t, 3.5, 4.4));
      arm = lerp(arm, 150, yawn2);
      b.pose({ x, facing: 1, armR: arm, armL: lerp(8, 150, Math.max(stretch, yawn2)), lean: 4 * reach * (1 - back), mood: stretch > 0.2 || yawn2 > 0.2 ? 'open' : 'smile', blink: t > 3.0 ? 0.7 * seg(t, 3.0, 4.0) : 0, look: 0.2, walk: walkP > 0 && walkP < 1 ? -t * 9 : 0 });
      tf(rocker, 0, 3, 0, 1, lerp(-1, 1, press));
      led.setAttribute('fill', press > 0.5 ? pal.red : pal.green);
      const s = speed(t);
      tf(blades, 0, 0, (ang(t) * 180) / Math.PI);
      blades.setAttribute('opacity', 1 - 0.55 * s);
      disc.setAttribute('opacity', 0.35 * s);
      wind.forEach((w, i) => {
        const u = (t * 1.6 + i / 3) % 1;
        tf(w, 270 - 50 * u, 130 + i * 16, 0, 1, 1);
        w.setAttribute('opacity', 0.9 * hump(u) * seg(s, 0.3, 0.8));
      });
      const zq = seg(t, 3.7, 4.5);
      tf(zz, 70, 168 - 14 * zq, 0, 0.6 + 0.6 * zq);
      zz.setAttribute('opacity', zq > 0 ? Math.min(1, zq * 3) : 0);
    }
  };
}
