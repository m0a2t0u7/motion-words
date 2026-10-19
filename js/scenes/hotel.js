// hotel：海辺のホテルのバルコニーで、まめが海をながめる。日が沈んで夜になり、部屋の明かりが消えて泊まる（例文 We stayed at a hotel by the sea.）
import { seg, lerp, easeInOut, hump, clamp } from '../ease.js';
import { blinkAt } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, '海辺のホテル'], [1.6, '日が沈む'], [3.4, 'ホテルで一泊']] };

const mix = (a, b, p) => { const h = (s) => [1, 3, 5].map((i) => parseInt(s.substr(i, 2), 16)); const A = h(a), B = h(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(p))).toString(16).padStart(2, '0')).join(''); };

export function create(k) {
  const { el, g, pal } = k;
  const sky = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#EAF4FB' });
  const sun = el('circle', { r: 20, fill: '#FFC46B' }), moon = el('circle', { cx: 120, cy: 50, r: 12, fill: '#FFF4C8' });
  el('rect', { x: 0, y: 170, width: 230, height: 130, fill: '#7CC7EC' });
  el('path', { d: 'M 0 250 Q 120 236 230 246 L 230 300 L 0 300 Z', fill: '#F3DEB0' });
  // ホテル（右）
  el('rect', { x: 230, y: 30, width: 170, height: 270, fill: '#F6EDE2' });
  el('rect', { x: 236, y: 16, width: 110, height: 22, rx: 4, fill: pal.coral }); k.text(291, 27, 'HOTEL', { 'font-size': 13, fill: '#fff' });
  const wins = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) if (!(r === 2 && c === 0)) wins.push(el('rect', { x: 300 + c * 50, y: 50 + r * 60, width: 32, height: 36, rx: 3, fill: '#CFE3F2' }));
  // まめの部屋のバルコニー
  const room = el('rect', { x: 240, y: 160, width: 50, height: 54, rx: 3, fill: '#FFE9B0' });
  const me = k.buddy({ x: 262, y: 214, scale: 0.6, facing: -1 }); me.g.firstChild.setAttribute('display', 'none');
  el('rect', { x: 232, y: 192, width: 66, height: 4, fill: pal.ink });
  for (let x = 236; x < 298; x += 8) el('rect', { x, y: 196, width: 2.5, height: 18, fill: pal.ink });
  el('rect', { x: 232, y: 214, width: 66, height: 5, fill: pal.ink });
  const shade = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#1E2A44', opacity: 0, 'pointer-events': 'none' });
  const waves = [0, 1, 2].map(() => el('path', { d: 'M 0 0 q 10 -5 20 0 q 10 5 20 0', stroke: '#fff', 'stroke-width': 2.5, fill: 'none' }));
  void g;
  return {
    update(t) {
      const sp = seg(t, 0.2, 2.6), nt = seg(t, 1.8, 3.0), off = seg(t, 3.4, 3.6);
      k.set(sun, { cx: lerp(80, 150, sp), cy: lerp(80, 186, easeInOut(sp)), opacity: 1 - seg(t, 2.4, 2.8) });
      k.set(sky, { fill: mix(mix('#EAF4FB', '#F8B68A', seg(t, 0.6, 1.8)), '#2E3D63', nt) });
      k.set(shade, { opacity: 0.4 * nt }); k.set(moon, { opacity: nt });
      shade.parentNode.appendChild(moon);
      wins.forEach((w, i) => k.set(w, { fill: nt > 0.5 && (i % 3) ? '#FFE08A' : '#CFE3F2' }));
      k.set(room, { fill: off > 0.5 ? '#3C4558' : nt > 0.3 ? '#FFE08A' : '#FFE9B0' });
      shade.parentNode.insertBefore(room, shade.nextSibling);
      const yawn = hump(seg(t, 2.8, 3.4));
      me.pose({ look: 0.7, mood: yawn > 0.3 ? 'open' : 'smile', blink: t > 3.4 ? 1 : blinkAt(t), armL: 8 + 140 * yawn, armR: 8 + 140 * yawn });
      me.g.setAttribute('display', t > 3.5 ? 'none' : 'inline');
      shade.parentNode.insertBefore(me.g, room.nextSibling);
      waves.forEach((w, i) => k.tf(w, (i * 80 + t * 15) % 240 - 20, 196 + i * 16));
    }
  };
}
