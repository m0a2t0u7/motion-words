// fuel：走るトラックの燃料計の針が E まで下がり、ガクガクして止まってしまう（例文 The truck ran out of fuel.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { auto, blinkAt, tree, popIn } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, '燃料が少ない'], [1.6, '針が E に'], [3.2, '止まった']] };

export function gauge(k) {
  const { el, pal } = k, g = k.g({});
  el('circle', { r: 40, fill: '#fff', stroke: pal.line, 'stroke-width': 3 }, g);
  el('path', { d: 'M -28 8 A 30 30 0 0 1 28 8', stroke: pal.line, 'stroke-width': 6, fill: 'none' }, g);
  el('path', { d: 'M -28 8 A 30 30 0 0 1 -21 -12', stroke: pal.red, 'stroke-width': 6, fill: 'none' }, g);
  k.text(-26, 22, 'E', { 'font-size': 13, fill: pal.red }, g); k.text(26, 22, 'F', { 'font-size': 13 }, g);
  // 給油機のマーク
  el('rect', { x: -6, y: 12, width: 10, height: 13, rx: 2, fill: pal.sub }, g); el('path', { d: 'M 4 15 l 4 3 v 6', stroke: pal.sub, 'stroke-width': 2, fill: 'none' }, g);
  const nd = el('line', { x1: 0, y1: 8, x2: 0, y2: -22, stroke: pal.ink, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g);
  el('circle', { cx: 0, cy: 8, r: 4, fill: pal.ink }, g);
  const warn = el('circle', { cx: 0, cy: -30, r: 4, fill: pal.red }, g);
  return { g, set(x, y, ang, w) { k.tf(g, x, y); nd.setAttribute('transform', `rotate(${ang.toFixed(1)} 0 8)`); warn.setAttribute('opacity', w ? 1 : 0.15); } };
}

export function create(k) {
  const { el, g, pal } = k;
  const FY = 186, GY = 266;
  k.backdrop({ floorY: FY });
  el('path', { d: `M 0 ${FY} L 70 ${FY - 60} L 140 ${FY} Z M 160 ${FY} L 250 ${FY - 80} L 340 ${FY} Z`, fill: '#E1E9F2' });
  el('rect', { x: 0, y: FY, width: 400, height: 114, fill: '#C8B9A6' });
  el('rect', { x: 0, y: FY, width: 400, height: 5, fill: '#B5A48E' });
  const trees = [0, 1, 2].map(() => tree(k, 0, FY, 0.6, '#9FD9A9', '#88CB95'));
  const dashes = [0, 1, 2, 3, 4, 5, 6].map(() => el('rect', { y: GY + 16, width: 34, height: 5, rx: 2, fill: '#fff', opacity: 0.7 }));
  const tr = auto(k, { kind: 'truck', color: pal.blue, dark: pal.blueDark, driver: { color: pal.mint, dark: pal.mintDark }, ds: 0.55 });
  el('rect', { x: -100, y: -116, width: 136, height: 88, rx: 4, fill: '#F5F7FA' }, tr.body);
  const gg = gauge(k);
  const T1 = 1.8, T2 = 3.2;
  // 燃料切れでガクッ、ガクッと失速
  const D = (t) => 140 * Math.min(t, T1) + 140 * (T2 - T1) / 2 * (1 - Math.pow(1 - seg(t, T1, T2), 2));
  return {
    update(t) {
      const d = D(t);
      trees.forEach((tt, i) => k.tf(tt.t, ((i * 170 + 40 - d * 0.5) % 510 + 510) % 510 - 60, FY, 0, 0.6));
      dashes.forEach((n, i) => k.set(n, { x: ((i * 64 - d) % 448 + 448) % 448 - 40 }));
      const jerk = t > T1 && t < T2 ? Math.max(0, Math.sin((t - T1) * 14)) * 2.5 * (1 - seg(t, T1, T2)) : 0;
      tr.set(170, GY, d * 4, Math.sin(t * 34) * 0.4 * (t < T2 ? 1 : 0), -jerk, 1.05);
      const nd = lerp(-30, -62, easeInOut(seg(t, 0.2, T1)));
      gg.set(320, 70, nd, t > 1.2 && Math.sin(t * 10) > 0);
      tr.d.pose({ look: t > 1.0 && t < 2.6 ? 1 : 0.6, mood: t > T2 ? 'sad' : t > T1 ? 'open' : 'flat', blink: blinkAt(t), lean: 8 * hump(seg(t, T2 - 0.2, T2 + 0.4)) });
      void wobble; void popIn; void g; void easeOut;
    }
  };
}
