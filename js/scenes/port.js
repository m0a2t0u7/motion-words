// port：港に止まった船。空が昼→夜→昼→夜と2回めぐり、カレンダーが1日目→2日目になっても船は港にいる（例文 The ship stayed in port for two days.）
import { seg, lerp, hump, clamp } from '../ease.js';
import { calendar } from './vehicle.js';
import { P, blinkAt } from './body.js';

export const meta = { duration: 4.4, beats: [[0, '港に入る'], [1.6, '1日目'], [3.2, '2日目もいる']] };

const mix = (a, b, p) => { const h = (s) => [1, 3, 5].map((i) => parseInt(s.substr(i, 2), 16)); const A = h(a), B = h(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], p)).toString(16).padStart(2, '0')).join(''); };

export function create(k) {
  const { el, g, pal } = k;
  const WY = 200;
  const sky = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#EAF4FB' });
  const sun = el('circle', { r: 18, fill: '#FFD57A' }), moon = el('circle', { r: 14, fill: '#FFF4C8' });
  el('rect', { x: 0, y: WY, width: 400, height: 100, fill: '#7CC7EC' });
  // 岸壁・クレーン
  el('rect', { x: 260, y: WY - 20, width: 140, height: 40, fill: '#B9A58C' });
  el('path', { d: 'M 330 180 L 330 60 L 270 60 M 330 80 L 300 60', stroke: pal.yellowDark, 'stroke-width': 6, fill: 'none' });
  el('line', { x1: 280, y1: 60, x2: 280, y2: 110, stroke: pal.ink, 'stroke-width': 2 });
  el('rect', { x: 236, y: WY - 30, width: 6, height: 20, fill: pal.ink }); el('path', { d: 'M 239 172 Q 220 182 214 190', stroke: pal.ink, 'stroke-width': 2, fill: 'none' });
  const me = k.buddy({ x: 360, y: WY - 20, scale: 0.6 });
  const ship = g({});
  el('path', { d: 'M -120 -20 L 110 -20 L 96 18 L -110 18 Z', fill: pal.blueDark }, ship);
  el('rect', { x: -120, y: -20, width: 230, height: 6, fill: '#fff' }, ship);
  el('rect', { x: -80, y: -56, width: 90, height: 36, rx: 4, fill: '#fff' }, ship);
  const wins = [0, 1, 2, 3].map((i) => el('rect', { x: -70 + i * 20, y: -46, width: 12, height: 10, rx: 2, fill: '#9FC4E6' }, ship));
  el('rect', { x: -50, y: -80, width: 18, height: 24, fill: pal.red }, ship);
  const dark = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#1E2A44', opacity: 0, 'pointer-events': 'none' });
  const cal = calendar(k, 360, 20, 44);
  return {
    update(t) {
      // 1日＝1.6秒。0.6 秒目から始まる
      const d = clamp((t - 0.6) / 1.7, 0, 2), ph = d % 1;
      const night = t < 0.6 ? 0 : hump(clamp((ph - 0.45) / 0.55)) * (d >= 2 ? 0 : 1);
      const nf = d >= 2 ? 1 : night;
      k.set(dark, { opacity: 0.5 * nf });
      k.set(sky, { fill: mix('#EAF4FB', '#33446A', nf) });
      const a = Math.PI * (t < 0.6 ? 0.3 : clamp(ph / 0.5)) , am = Math.PI * clamp((ph - 0.5) / 0.5);
      k.set(sun, { cx: 40 + 320 * a / Math.PI, cy: 150 - 110 * Math.sin(a), opacity: (ph < 0.55 || t < 0.6) && d < 2 ? 1 : 0 });
      k.set(moon, { cx: 40 + 320 * am / Math.PI, cy: 150 - 100 * Math.sin(am), opacity: ph > 0.5 && d < 2 ? 1 : d >= 2 ? 1 : 0 });
      if (d >= 2) k.set(moon, { cx: 200, cy: 60 });
      wins.forEach((w) => k.set(w, { fill: nf > 0.4 ? '#FFE08A' : '#9FC4E6' }));
      const x = lerp(-140, 150, 1 - Math.pow(1 - seg(t, 0, 0.6), 3));
      k.tf(ship, x, WY + 2 + Math.sin(t * 2.5) * 1.5);
      P(me, { x: 360, armR: t > 0.7 ? 150 + 25 * Math.sin(t * 8) : 10, armL: 10, mood: 'smile', blink: blinkAt(t), look: -1 });
      cal.set(t < 1.7 ? '1' : '2', seg(t, 1.7, 2.0));
      dark.parentNode.appendChild(sun); dark.parentNode.appendChild(moon); dark.parentNode.appendChild(cal.g);
    }
  };
}
