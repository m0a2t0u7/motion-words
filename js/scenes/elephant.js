// elephant：ゾウが鼻を水に入れて吸い上げ、鼻を高く上げて水をシャーッとふき出す。まめは水しぶきを浴びて大笑い（例文 The elephant sprayed water with its trunk.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { scene, sunG, treeG } from './nature.js';
import { beast } from './animal.js';

export const meta = { duration: 4.4, beats: [[0, '水を吸う'], [1.6, '鼻を上げて'], [2.2, '水をふき出す']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const { FY } = scene(k, { FY: 236, top: '#FFE6BC', bot: '#FFF7E8', ground: '#E3CF98', edge: '#D2BC80' });
  tf(sunG(k, 16).g, 360, 40); tf(treeG(k, 0.9, '#8CC973', '#7AB862').g, 40, FY - 20);
  el('ellipse', { cx: 300, cy: 262, rx: 90, ry: 18, fill: '#6CBFE6' }); el('ellipse', { cx: 290, cy: 258, rx: 60, ry: 8, fill: '#8FD3F4' });
  const E = beast(k, 'elephant'), S = 1.15, X = 210, Y = 246;
  const drops = Array.from({ length: 22 }, () => el('circle', { r: 3, fill: '#8FD3F4' }));
  const rip = el('ellipse', { rx: 1, ry: 1, fill: 'none', stroke: '#fff', 'stroke-width': 2 });
  const me = k.buddy({ x: 340, y: 222, scale: 0.75, facing: -1 });
  return {
    update(t) {
      const dip = easeInOut(seg(t, 0.2, 0.7)) * (1 - easeInOut(seg(t, 1.3, 1.7)));
      const up = easeInOut(seg(t, 1.4, 2.0)) * (1 - easeInOut(seg(t, 3.8, 4.4)));
      const tr = up - 0.25 * dip;
      E.set({ x: X, y: Y, s: S, head: 10 * dip - 10 * up, trunk: tr, tail: Math.sin(t * 3) * 10, squash: 1 + 0.03 * Math.sin(t * 2) });
      const hd = E.headAt({ x: X, y: Y, s: S }), hr = (10 * dip - 10 * up) * Math.PI / 180;
      const lx = 18 + 30 * tr, ly = 42 - 82 * tr, tip = { x: hd.x + (lx * Math.cos(hr) - ly * Math.sin(hr)) * S, y: hd.y + (lx * Math.sin(hr) + ly * Math.cos(hr)) * S };
      const rp = seg(t, 0.6, 1.4); k.set(rip, { cx: tip.x, cy: 262, rx: 4 + 24 * rp, ry: 1 + 5 * rp, opacity: rp > 0 && rp < 1 ? 1 - rp : 0 });
      const sp = t > 2.1 && t < 3.6;
      drops.forEach((d, i) => {
        const q = ((t * 1.4 + i / drops.length) % 1), start = 2.1 + (i / drops.length) * 0.7;
        const on = sp && t > start, vx = 120 + (i % 5) * 12, vy = -150 - (i % 3) * 18;
        k.set(d, { cx: tip.x + vx * q, cy: tip.y + vy * q + 300 * q * q, opacity: on ? 0.9 : t > 3.6 && q < 0.6 ? 0.9 * (1 - (t - 3.6) * 3) : 0 });
      });
      const wet = t > 2.6;
      P(me, { x: 340, y: 222, facing: -1, armL: wet ? 140 + Math.sin(t * 12) * 16 : 8, armR: wet ? 140 - Math.sin(t * 12) * 16 : 8, lift: wet ? 8 * Math.abs(Math.sin(t * 6)) : 0, look: 0.6, mood: wet ? 'grin' : t > 1.9 ? 'open' : 'smile', blink: wet ? 0.8 : blinkAt(t) });
    }
  };
}
