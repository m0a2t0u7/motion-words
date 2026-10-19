// rain：傘をさしていると、午後（時計が12時→3時）に雨がやむ。傘を下ろし、手のひらで確かめる（例文 The rain stopped in the afternoon.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { scene, hills, sunG, fall, hang, P, blinkAt } from './nature.js';
import { clock } from './run-after.js';

export function umbrella(k, parent, col = '#6AA8F7', dark = '#4A8BE0') {
  const g = k.g({}, parent);
  k.el('path', { d: 'M 0 0 V -62', stroke: k.pal.ink, 'stroke-width': 3 }, g);
  k.el('path', { d: 'M 0 2 q 0 7 -6 7', stroke: k.pal.ink, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);
  k.el('path', { d: 'M -52 -56 Q -50 -96 0 -98 Q 50 -96 52 -56 Q 39 -64 26 -56 Q 13 -64 0 -56 Q -13 -64 -26 -56 Q -39 -64 -52 -56 Z', fill: col }, g);
  k.el('path', { d: 'M 0 -98 Q -12 -80 -26 -56 M 0 -98 Q 12 -80 26 -56', stroke: dark, 'stroke-width': 1.6, fill: 'none' }, g);
  k.el('circle', { cx: 0, cy: -100, r: 3, fill: dark }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '雨の中'], [1.4, '午後になる'], [3.0, '雨がやんだ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const { FY, sky } = scene(k, { FY: 238, top: '#A9C9E4', bot: '#EAF3FA' });
  const gray = el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#7D8798', opacity: 0.55 });
  const sun = sunG(k, 18); tf(sun.g, 340, 50);
  hills(k, FY);
  // 時計塔
  el('rect', { x: 36, y: FY - 150, width: 56, height: 150, fill: '#E9DCC9' });
  el('path', { d: `M 30 ${FY - 150} L 64 ${FY - 178} L 98 ${FY - 150} Z`, fill: pal.coralDark });
  const ck = clock(k, 64, FY - 118, 20);
  el('rect', { x: 52, y: FY - 40, width: 24, height: 40, rx: 3, fill: pal.woodDark });
  const puddle = el('ellipse', { cx: 250, cy: FY + 20, rx: 46, ry: 7, fill: '#9FC6E4' });
  const rain = fall(k, { n: 40, FY, kind: 'rain', speed: 300 });
  const b = k.buddy({ x: 210, y: FY, scale: S });
  const um = umbrella(k);
  return {
    update(t) {
      const stop = easeOut(seg(t, 2.6, 3.0));
      rain(t, 1 - stop);
      const hr = 12 + 3 * easeInOut(seg(t, 0.6, 2.4));
      ck.set(Math.floor(hr), (hr % 1) * 60);
      gray.setAttribute('opacity', 0.55 * (1 - easeInOut(seg(t, 2.8, 3.8))));
      sun.g.setAttribute('opacity', easeOut(seg(t, 3.2, 4.0)));
      const lower = easeInOut(seg(t, 3.0, 3.6)), palm = easeInOut(seg(t, 3.3, 3.8));
      P(b, { armR: lerp(150, 110, lower), armL: lerp(8, 95, palm), look: lerp(0.2, 0.6, lower), mood: t > 3.4 ? 'grin' : 'flat', blink: blinkAt(t) });
      b.body.children[3].setAttribute('transform', `translate(${(3 * lower).toFixed(1)} ${(-4 * lower).toFixed(1)})`);
      hang(k, b, S, um, 'R', 70 * lower);
      puddle.setAttribute('rx', 46 + 4 * Math.sin(t * 6) * (1 - stop));
    }
  };
}
