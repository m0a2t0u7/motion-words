// earth：太陽のまわりを、まめを乗せた地球が自転しながら1周する（例文 The earth goes around the sun.）
import { seg, lerp, easeInOut, clamp } from '../ease.js';
import { nightBg, sunG, globe, P, blinkAt } from './nature.js';

export const meta = { duration: 4.4, beats: [[0, '太陽と地球'], [1.2, 'まわっていく'], [3.6, '1周した']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  nightBg(k, { FY: 320, n: 40, top: '#141C33', bot: '#232F52' });
  const CX = 200, CY = 158, RX = 150, RY = 62;
  el('ellipse', { cx: CX, cy: CY, rx: RX, ry: RY, fill: 'none', stroke: '#8FA3C8', 'stroke-width': 2, 'stroke-dasharray': '6 7', opacity: 0.7 });
  const back = g({});
  const sun = sunG(k, 34); tf(sun.g, CX, CY);
  el('circle', { cx: CX, cy: CY, r: 60, fill: '#FFD86B', opacity: 0.12 });
  const front = g({});
  const E = g({}, front);
  const glob = globe(k, 20, E);
  const rider = k.buddy({ x: 0, y: -19, scale: 0.2, parent: E });
  const trail = el('path', { d: '', stroke: '#BFD3F5', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', opacity: 0.8 });
  const pos = (a) => ({ x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a) });
  return {
    update(t) {
      // 手前（下）から始まり、反時計回りに見える向きで1周
      const p = easeInOut(seg(t, 0.4, 4.0)), a = Math.PI / 2 - p * Math.PI * 2;
      const q = pos(a), sc = 0.85 + 0.25 * Math.sin(a);
      tf(E, q.x, q.y, 0, sc);
      (Math.sin(a) < 0 ? back : front).appendChild(E);
      glob.spin(t * 260);
      P(rider, { y: -19, armR: 140 + 20 * Math.sin(t * 8), look: 0.5, mood: 'grin', blink: blinkAt(t) });
      let d = '';
      for (let i = 0; i <= 24; i++) { const s = Math.PI / 2 - p * Math.PI * 2 * (i / 24); const r = pos(s); d += (i ? 'L' : 'M') + ` ${r.x.toFixed(1)} ${r.y.toFixed(1)} `; }
      trail.setAttribute('d', p > 0.01 ? d : '');
      sun.rays.setAttribute('transform', `rotate(${t * 15})`);
    }
  };
}
