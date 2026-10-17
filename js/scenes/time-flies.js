// time flies：楽しく風船をつき合っているうちに、窓の外は夕方に。時計は猛スピードで進み、羽ばたく（Time flies when you are having fun.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '遊び始め'], [2.0, '夢中で遊ぶ'], [4.0, '夕方になった']] };

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, p) => '#' + hex(a).map((v, i) => Math.round(lerp(v, hex(b)[i], p)).toString(16).padStart(2, '0')).join('');

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  // 窓：昼→夕焼け、太陽が沈む
  const sky = el('rect', { x: 28, y: 30, width: 110, height: 92, rx: 8, fill: '#DDEFFA' });
  const sun = el('circle', { cx: 60, cy: 52, r: 13, fill: pal.yellow });
  el('rect', { x: 28, y: 100, width: 110, height: 22, rx: 6, fill: '#9FC7A8', opacity: 0.8 });
  el('line', { x1: 83, y1: 30, x2: 83, y2: 122, stroke: '#fff', 'stroke-width': 4 });
  el('line', { x1: 28, y1: 76, x2: 138, y2: 76, stroke: '#fff', 'stroke-width': 4 });
  // 羽つき時計
  const cg = g({}); tf(cg, 252, 70);
  const wings = [-1, 1].map((s) => { const w = g({}, cg); el('path', { d: 'M 0 0 Q 18 -22 40 -8 Q 28 -2 36 8 Q 18 8 0 6 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, w); return w; });
  el('circle', { r: 24, fill: '#fff', stroke: pal.ink, 'stroke-width': 4 }, cg);
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; el('line', { x1: Math.sin(a) * 19, y1: -Math.cos(a) * 19, x2: Math.sin(a) * 21.5, y2: -Math.cos(a) * 21.5, stroke: pal.sub, 'stroke-width': 1.6 }, cg); }
  const hh = el('line', { x1: 0, y1: 0, x2: 0, y2: -11, stroke: pal.ink, 'stroke-width': 3.4, 'stroke-linecap': 'round' }, cg);
  const mh = el('line', { x1: 0, y1: 0, x2: 0, y2: -17, stroke: pal.red, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, cg);
  const me = k.buddy({ x: 140, y: 240 });
  const fr = k.buddy({ x: 290, y: 240, facing: -1, color: pal.coral, dark: pal.coralDark });
  const sh = k.shadow(0, 0, 16, 3.5);
  const ball = g({});
  el('path', { d: 'M 0 12 q 3 8 -2 14', fill: 'none', stroke: pal.sub, 'stroke-width': 1.6 }, ball);
  el('ellipse', { rx: 13, ry: 16, fill: pal.violet }, ball);
  el('ellipse', { cx: -4, cy: -6, rx: 3.5, ry: 5, fill: '#fff', opacity: 0.45 }, ball);
  const L = 0.88;
  return {
    update(t) {
      const n = Math.floor(t / L), p = (t - n * L) / L, right = n % 2 === 0;
      const x = lerp(172, 262, right ? p : 1 - p), y = 150 - 66 * Math.sin(Math.PI * p);
      tf(ball, x, y, Math.sin(t * 6) * 8);
      tf(sh, x, 238, 0, 1 - 0.3 * (1 - (y - 84) / 70) , 1);
      sh.setAttribute('opacity', 1);
      const act = (mine) => (mine ? right : !right) ? 1 - easeOut(seg(p, 0, 0.3)) : easeIn(seg(p, 0.65, 1));
      const hit = (mine) => ((mine ? right : !right) ? hump(seg(p, 0, 0.2)) : 0);
      me.pose({ armR: 8 + 165 * act(true), armL: 8, lift: 6 * hit(true), mood: 'grin', look: 0.5, squash: 1 - 0.04 * hit(true) });
      fr.pose({ armR: 8 + 165 * act(false), armL: 8, lift: 6 * hit(false), mood: 'grin', look: 0.5, squash: 1 - 0.04 * hit(false) });
      // 時間の経過：時計は猛スピード、空は夕焼け
      const tp = easeInOut(seg(t, 0, 4.3));
      sky.setAttribute('fill', mix('#DDEFFA', '#FFB98F', tp));
      k.set(sun, { cy: lerp(52, 106, tp), fill: mix('#FFCF5C', '#FF7A4D', tp) });
      k.set(hh, { transform: `rotate(${tp * 150})` });
      k.set(mh, { transform: `rotate(${tp * 1800})` });
      wings.forEach((w, i) => { const f = Math.sin(t * 16); tf(w, i ? 24 : -24, -2, (i ? 1 : -1) * 0, i ? 1 : -1, 0.7 + 0.45 * f); });
    }
  };
}
