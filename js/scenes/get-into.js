// get into：15歳の誕生日の部屋。レコードからジャズが流れ、まめが近づいて聞き入り、音符に包まれて夢中になる（例文 He got into jazz when he was fifteen.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { gait } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '音楽が流れる'], [1.6, '聞き入る'], [3.4, '夢中になった']] };

function note(k, parent) {
  const n = k.g({}, parent);
  k.el('ellipse', { cx: 0, cy: 0, rx: 5, ry: 3.8, fill: k.pal.ink, transform: 'rotate(-20)' }, n);
  k.el('line', { x1: 4.5, y1: -1, x2: 4.5, y2: -17, stroke: k.pal.ink, 'stroke-width': 2 }, n);
  k.el('path', { d: 'M 4.5 -17 q 7 3 6 10', stroke: k.pal.ink, 'stroke-width': 2, fill: 'none' }, n);
  return n;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 誕生日のガーランドと「15」
  el('path', { d: 'M 40 40 Q 200 76 360 40', stroke: pal.sub, 'stroke-width': 1.5, fill: 'none' });
  [70, 110, 150, 250, 290, 330].forEach((x, i) => { const y = 40 + 36 * (1 - Math.pow((x - 200) / 160, 2)) - 0; el('path', { d: `M ${x - 9} ${y - 3} L ${x + 9} ${y - 3} L ${x} ${y + 14} Z`, fill: [pal.coral, pal.yellow, pal.blue][i % 3] }); });
  el('rect', { x: 176, y: 58, width: 48, height: 34, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  k.text(200, 76, '15', { 'font-size': 20, fill: pal.coralDark });
  // レコードプレーヤー（右の台の上）
  k.shadow(330, 237, 46, 5);
  el('rect', { x: 286, y: 186, width: 88, height: 50, rx: 4, fill: pal.wood });
  el('rect', { x: 292, y: 194, width: 76, height: 36, rx: 3, fill: '#EAD3B0' });
  el('rect', { x: 290, y: 166, width: 80, height: 20, rx: 4, fill: pal.ink });
  const rec = g({}); el('ellipse', { cx: 0, cy: 0, rx: 32, ry: 7, fill: '#2B2B33' }, rec);
  el('ellipse', { cx: 0, cy: 0, rx: 9, ry: 2.4, fill: pal.coral }, rec);
  const glint = el('ellipse', { cx: 0, cy: 0, rx: 3, ry: 1.2, fill: '#fff', opacity: 0.6 }, rec);
  tf(rec, 326, 163);
  el('line', { x1: 362, y1: 160, x2: 344, y2: 164, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' });
  const b = k.buddy({ x: 60, y: FY, scale: 0.95 });
  const notes = Array.from({ length: 9 }, () => note(k));
  const xf = (t) => lerp(60, 205, easeInOut(seg(t, 0.2, 1.5)));
  return {
    update(t) {
      const a = t * 4;
      k.set(glint, { cx: Math.cos(a) * 22, cy: Math.sin(a) * 4.5 });
      const p = gait(xf, t, 60);
      const into = easeInOut(seg(t, 2.2, 3.2));
      const sway = Math.sin(t * 5) * 7 * into;
      b.pose({ x: p.x, walk: p.walk, lean: p.lean + sway, look: lerp(0.6, 0, into),
        armL: lerp(p.armL, 40 + Math.sin(t * 5) * 20, into), armR: lerp(p.armR, 40 - Math.sin(t * 5) * 20, into),
        blink: into * 0.9, mood: into > 0.4 ? 'grin' : 'smile', squash: 1 - 0.03 * into * Math.abs(Math.sin(t * 5)) });
      // 音符：最初はレコードから右上へ漂う→後半はまめの周りを回る
      notes.forEach((n, i) => {
        const ph = ((t * 0.5 + i / notes.length) % 1);
        const fx = lerp(326, 200 - i * 10, ph), fy = 150 - ph * 70 + Math.sin(ph * 9 + i) * 6;
        const ang = t * 1.6 + (i / notes.length) * Math.PI * 2;
        const ox = b.state.x + Math.cos(ang) * 62, oy = 150 + Math.sin(ang) * 34;
        const w = clamp(into * 1.3 - i * 0.03);
        tf(n, lerp(fx, ox, w), lerp(fy, oy, w), Math.sin(t * 3 + i) * 12, 0.9);
        n.setAttribute('opacity', (t < 0.4 ? seg(t, 0, 0.4) : 1) * (w > 0 ? 1 : hump(ph) * 1.2));
      });
    }
  };
}
