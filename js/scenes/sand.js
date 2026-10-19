// sand：砂浜で子ども2人がバケツをひっくり返し、手でたたいて、砂のお城を作り上げる（例文 The kids built a castle in the sand.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { scene, sunG, water, P, blinkAt, popIn } from './nature.js';

export const meta = { duration: 4.4, beats: [[0, '砂浜'], [1.0, '砂を固める'], [3.2, '砂のお城']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.7;
  const { FY } = scene(k, { FY: 230, top: '#8FD0F5', bot: '#E5F5FD', ground: '#F3DFB5', edge: '#E3CB9A' });
  const sun = sunG(k, 16); tf(sun.g, 60, 44);
  const sea = water(k, 160, { h: 196 });
  el('path', { d: 'M 0 196 Q 120 188 240 196 T 400 194 V 300 H 0 Z', fill: '#F3DFB5' });
  const CX = 200, CY = 250, SC = '#E8C98F', SD = '#D4B077';
  // お城：3段（土台、塔2本、てっぺん）
  const parts = [
    () => { const n = g({}); el('rect', { x: -44, y: -22, width: 88, height: 22, rx: 3, fill: SC }, n); return n; },
    () => { const n = g({}); el('rect', { x: -38, y: -52, width: 22, height: 30, fill: SC }, n); el('path', { d: 'M -38 -52 h 6 v -6 h 4 v 6 h 4 v -6 h 4 v 6 h 4', fill: SC }, n); el('rect', { x: 16, y: -52, width: 22, height: 30, fill: SC }, n); el('path', { d: 'M 16 -52 h 6 v -6 h 4 v 6 h 4 v -6 h 4 v 6 h 4', fill: SC }, n); return n; },
    () => { const n = g({}); el('rect', { x: -14, y: -62, width: 28, height: 40, fill: SD }, n); el('path', { d: 'M -14 -62 L 0 -80 L 14 -62 Z', fill: SD }, n); el('rect', { x: -5, y: -36, width: 10, height: 14, rx: 5, fill: '#B48E58' }, n); el('line', { x1: 0, y1: -80, x2: 0, y2: -96, stroke: pal.ink, 'stroke-width': 2 }, n); el('path', { d: 'M 0 -96 L 12 -92 L 0 -88 Z', fill: pal.red }, n); return n; }
  ].map((f) => { const n = f(); tf(n, CX, CY, 0, 0.001); return n; });
  k.shadow(CX, CY + 2, 50, 5);
  const a = k.buddy({ x: 128, y: CY + 4, scale: S });
  const c = k.buddy({ x: 272, y: CY + 4, scale: S, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const bucket = g({});
  el('path', { d: 'M -14 -20 L 14 -20 L 11 6 L -11 6 Z', fill: pal.blue }, bucket);
  el('rect', { x: -15, y: -22, width: 30, height: 5, rx: 2, fill: pal.blueDark }, bucket);
  return {
    update(t) {
      sea(t);
      // 土台：バケツを持ち上げると現れる。塔・てっぺん：たたいて作る
      const lift = easeInOut(seg(t, 0.9, 1.4));
      tf(bucket, CX + 22, CY - 4 - 40 * lift - 14, 180 * (1 - easeInOut(seg(t, 0.3, 0.7))) + 180, 1.2);
      bucket.setAttribute('opacity', 1 - seg(t, 1.4, 1.7));
      tf(parts[0], CX, CY, 0, lift > 0 ? 1 : 0.001);
      tf(parts[1], CX, CY, 0, Math.max(0.001, easeOut(seg(t, 1.8, 2.5))));
      tf(parts[2], CX, CY, 0, Math.max(0.001, easeOut(seg(t, 2.6, 3.3))));
      const pat = Math.abs(Math.sin(t * 10)) * (t > 1.7 && t < 3.3 ? 1 : 0);
      P(a, { y: CY + 4, lean: 14, armR: 80 - 30 * pat, armL: 30, look: 0.6, mood: t > 3.3 ? 'grin' : 'smile', blink: blinkAt(t), lift: 8 * hump(seg(t, 3.4, 3.8)) });
      P(c, { y: CY + 4, facing: -1, lean: 14, armR: 70 + lerp(0, 40, lift) * (t < 1.5 ? 1 : 0) - 30 * pat, armL: 30, look: -0.6, mood: t > 3.3 ? 'grin' : 'smile', blink: blinkAt(t, 1), lift: 8 * hump(seg(t, 3.5, 3.9)) });
    }
  };
}
