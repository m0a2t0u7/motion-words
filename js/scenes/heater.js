// heater：雪の降る冬の日、寒さに震える2人がヒーターをつけ、赤く光る熱で手を温める（例文 We use a heater in winter.）
import { seg, lerp, easeInOut, easeOut } from '../ease.js';
import { reach } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { homeBg } from './furniture.js';

export const meta = { duration: 4.2, beats: [[0, '冬で寒い'], [1.2, 'ヒーターをつける'], [2.4, 'あたたかい']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = homeBg(k, { winX: 40, winW: 100, winH: 76, sky: '#C9D8EA', curtain: '#C7B8E8' });
  const cp = k.clip((c) => el('rect', { x: 40, y: 44, width: 100, height: 76 }, c));
  const snowG = g({ 'clip-path': cp });
  el('rect', { x: 40, y: 104, width: 100, height: 16, fill: '#fff' }, snowG);
  const flakes = Array.from({ length: 10 }, () => el('circle', { r: 2.2, fill: '#fff' }, snowG));
  // ヒーター（電気ストーブ）
  const HX = 236, HT = 150;
  k.shadow(HX, FY + 1, 40, 5);
  el('rect', { x: HX - 36, y: HT, width: 72, height: FY - HT - 6, rx: 10, fill: '#E3E8EE', stroke: '#C3CCD8', 'stroke-width': 2 });
  el('rect', { x: HX - 28, y: FY - 8, width: 10, height: 8, fill: '#AEB7C4' }); el('rect', { x: HX + 18, y: FY - 8, width: 10, height: 8, fill: '#AEB7C4' });
  el('rect', { x: HX - 26, y: HT + 12, width: 52, height: 54, rx: 4, fill: '#4A5468' });
  const coils = [0, 1, 2].map((i) => el('rect', { x: HX - 22, y: HT + 18 + i * 17, width: 44, height: 6, rx: 3, fill: '#8892A3' }));
  for (let i = 0; i < 5; i++) el('line', { x1: HX - 20 + i * 10, y1: HT + 12, x2: HX - 20 + i * 10, y2: HT + 66, stroke: '#C9D2DE', 'stroke-width': 1.5 });
  const knob = g({}); tf(knob, HX - 24, HT + 74);
  el('circle', { r: 5, fill: '#fff', stroke: pal.sub, 'stroke-width': 1.5 }, knob); el('line', { x1: 0, y1: 0, x2: 0, y2: -4, stroke: pal.ink, 'stroke-width': 2 }, knob);
  const glow = el('ellipse', { cx: HX, cy: HT + 40, rx: 70, ry: 60, fill: '#FFB070', opacity: 0 });
  const waves = [0, 1, 2].map(() => el('path', { d: 'M 0 0 q -5 -7 0 -14 q 5 -7 0 -14', fill: 'none', stroke: '#FF9F4A', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
  const a = k.buddy({ x: 140, y: FY, scale: 0.86 });
  const c = k.buddy({ x: 330, y: FY, scale: 0.86, facing: -1, color: pal.coral, dark: pal.coralDark });
  return {
    update(t) {
      flakes.forEach((f, i) => { const q = ((t * 0.25 + i * 0.1) % 1); k.set(f, { cx: 46 + ((i * 37) % 92) + 6 * Math.sin(t * 2 + i), cy: 40 + q * 80 }); });
      const turn = easeInOut(seg(t, 0.9, 1.3)), heat = easeOut(seg(t, 1.5, 2.3)), warm = easeOut(seg(t, 2.2, 2.8));
      const shiver = (1 - warm) * Math.sin(t * 40) * 1.6;
      tf(knob, HX - 24, HT + 74, 120 * turn);
      coils.forEach((cl, i) => cl.setAttribute('fill', heat > 0.05 ? `rgb(${Math.round(lerp(136, 255, heat))},${Math.round(lerp(146, 110 + 10 * Math.sin(t * 5 + i), heat))},${Math.round(lerp(163, 60, heat))})` : '#8892A3'));
      glow.setAttribute('opacity', 0.25 * heat * (0.9 + 0.1 * Math.sin(t * 4)));
      waves.forEach((w, i) => { const q = ((t - 1.8) * 0.7 + i * 0.33) % 1; tf(w, HX - 18 + i * 18, HT - 4 - 16 * q); w.setAttribute('opacity', t > 1.8 ? Math.sin(q * Math.PI) * heat : 0); });
      const ax = lerp(140, 168, easeInOut(seg(t, 0.4, 0.9)));
      const pa = { x: ax + shiver, look: 0.6, blink: blinkAt(t), mood: warm > 0.5 ? 'grin' : 'sad', squash: lerp(0.94, 1, warm), lean: 10 * turn * (1 - warm) + 6 * warm };
      P(a, pa);
      P(a, { ...pa, armR: lerp(lerp(30, reach(a, 0.86, 'R', HX - 24, HT + 74), turn), 78, warm), armL: lerp(30, 10, warm) });
      const cx = lerp(340, 306, easeInOut(seg(t, 2.0, 2.6)));
      P(c, { x: cx - shiver, facing: -1, look: 0.6, blink: blinkAt(t, 1), mood: warm > 0.5 ? 'grin' : 'sad', squash: lerp(0.94, 1, warm), armR: lerp(30, 78, warm), armL: lerp(30, 10, warm), lean: 6 * warm });
    }
  };
}
