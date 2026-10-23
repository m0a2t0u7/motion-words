// sea：まめと友だちが、波のある海の中をクロールで泳いで進む（例文 We swam in the sea.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { sunG, cloudG } from './nature.js';

export const meta = { duration: 4.2, beats: [[0, '海の中'], [1.2, 'いっしょに泳ぐ'], [3.4, '泳いだ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.85;
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: k.gradient([[0, '#9ED6F7'], [1, '#E9F7FD']]) });
  tf(sunG(k, 18).g, 340, 44); tf(cloudG(k, 80, 30), 90, 50);
  // 砂浜（左奥）と海
  el('path', { d: 'M 0 120 L 70 120 Q 50 140 0 146 Z', fill: '#F6E3B9' });
  el('rect', { x: 0, y: 120, width: 400, height: 180, fill: k.gradient([[0, '#5FB6E8'], [1, '#2F8FD0']]) });
  el('path', { d: 'M 0 120 L 60 120 Q 40 134 0 138 Z', fill: '#F6E3B9' });
  const back = el('path', { d: '', stroke: '#fff', 'stroke-width': 2, fill: 'none', opacity: 0.5 });
  const WL = 198;
  const a = k.buddy({ x: 70, y: 0, scale: S, facing: 1 });
  const b = k.buddy({ x: 20, y: 0, scale: S, facing: 1, color: pal.coral, dark: pal.coralDark });
  // 手前の水（胸から下を隠す）
  const front = el('path', { fill: '#3E9CDA', opacity: 0.94 });
  const foam = el('path', { stroke: '#fff', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
  const drops = Array.from({ length: 8 }, () => el('circle', { r: 2.6, fill: '#fff' }));
  const wave = (x, t) => WL + Math.sin(x / 40 + t * 2.4) * 4;
  return {
    update(t) {
      let d = `M 0 ${wave(0, t)}`, f = '';
      for (let x = 0; x <= 400; x += 10) d += ` L ${x} ${wave(x, t).toFixed(1)}`;
      for (let x = 0; x <= 400; x += 10) f += `${x ? 'L' : 'M'} ${x} ${(wave(x, t) - 1).toFixed(1)} `;
      k.set(front, { d: d + ' L 400 300 L 0 300 Z' }); k.set(foam, { d: f });
      let bk = ''; for (let i = 0; i < 6; i++) { const y = 150 + i * 8; bk += `M ${((i * 70 + t * 16) % 440) - 40} ${y} q 10 -3 20 0 `; } k.set(back, { d: bk });
      const sw = seg(t, 0.4, 3.6), out = easeOut(seg(t, 3.4, 3.9));
      [[a, 150, 0], [b, 80, 0.5]].forEach(([c, x0, off], i) => {
        const x = x0 + 150 * easeInOut(sw), ph = (t + off) * 4.6 * (1 - out), y = wave(x, t) + 30 * S + Math.sin(ph * 2) * 2;
        const A = sw > 0 && sw < 1 ? ((ph * 57.3) % 360) : 0;
        const armR = sw > 0 && sw < 1 ? A : lerp(8, 150, out), armL = sw > 0 && sw < 1 ? (A + 180) % 360 : lerp(8, 150, out);
        P(c, { x, y, armR, armL, lean: 22 * (sw > 0 && sw < 1 ? 1 : 0), mood: t > 3.4 ? 'grin' : 'open', blink: blinkAt(t, i), look: 0.8 });
        if (i === 0) drops.forEach((n, j) => { const q = ((t * 2.3 + j * 0.13) % 1); n.setAttribute('cx', x + 30 * S - 20 * q + (j % 3) * 6); n.setAttribute('cy', wave(x, t) - 18 * hump(q) - 2); n.setAttribute('opacity', sw > 0 && sw < 0.97 ? 0.9 * (1 - q) : 0); });
      });
    }
  };
}
