// journey：電車の窓辺に座るまめ。外の景色が町→畑→山→夕方→夜と移り変わり、長い道のりが続く（例文 It was a long journey by train.）
import { seg, lerp, easeInOut, clamp } from '../ease.js';
import { blinkAt } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, '町を出る'], [1.6, '山をこえる'], [3.2, 'まだまだ続く']] };

const mix = (a, b, p) => { const h = (s) => [1, 3, 5].map((i) => parseInt(s.substr(i, 2), 16)); const A = h(a), B = h(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(p))).toString(16).padStart(2, '0')).join(''); };

export function create(k) {
  const { el, g, pal } = k;
  k.backdrop({ floorY: 300, mood: 'indoor' });
  // 窓の中の景色（クリップ）
  const cp = k.clip((c) => el('rect', { x: 40, y: 40, width: 320, height: 150, rx: 16 }, c));
  const view = g({ 'clip-path': cp });
  const sky = el('rect', { x: 0, y: 0, width: 400, height: 200, fill: '#EAF4FB' }, view);
  const land = g({}, view);
  // 長い景色（左へ流れる）：町 → 畑 → 山 → 海
  for (let i = 0; i < 6; i++) el('rect', { x: i * 60, y: 120 - (i % 3) * 20, width: 50, height: 80 + (i % 3) * 20, fill: '#DCE3EE' }, land);
  el('rect', { x: 360, y: 150, width: 600, height: 50, fill: '#BFE3A8' }, land);
  for (let i = 0; i < 10; i++) el('line', { x1: 380 + i * 60, y1: 160, x2: 400 + i * 60, y2: 190, stroke: '#9ED38A', 'stroke-width': 3 }, land);
  el('path', { d: 'M 900 190 L 1000 80 L 1100 190 Z M 1040 190 L 1160 60 L 1280 190 Z M 1220 190 L 1300 110 L 1400 190 Z', fill: '#9DB7C9' }, land);
  el('rect', { x: 1400, y: 150, width: 800, height: 50, fill: '#8FC9E8' }, land);
  const ground = el('rect', { x: 0, y: 186, width: 400, height: 20, fill: '#B9A58C' }, view);
  const shade = el('rect', { x: 0, y: 0, width: 400, height: 200, fill: '#1E2A44', opacity: 0 }, view);
  const moon = el('circle', { cx: 300, cy: 70, r: 12, fill: '#FFF4C8', opacity: 0 }, view);
  el('rect', { x: 40, y: 40, width: 320, height: 150, rx: 16, fill: 'none', stroke: '#E6EAF0', 'stroke-width': 12 });
  // 座席とまめ
  el('rect', { x: 0, y: 200, width: 400, height: 100, fill: '#E9E4DA' });
  el('rect', { x: 230, y: 170, width: 120, height: 120, rx: 18, fill: '#7FB5F5' });
  const me = k.buddy({ x: 280, y: 268, scale: 0.95, facing: -1 }); me.g.firstChild.setAttribute('display', 'none');
  el('rect', { x: 220, y: 250, width: 140, height: 40, rx: 12, fill: '#6AA8F7' });
  el('rect', { x: 120, y: 214, width: 90, height: 8, rx: 3, fill: pal.woodDark });
  return {
    update(t) {
      k.tf(land, -lerp(0, 1500, t / 4.4), 0);
      const ev = seg(t, 2.6, 3.6), nt = seg(t, 3.4, 4.2);
      k.set(sky, { fill: mix(mix('#EAF4FB', '#F8C9A0', ev), '#33446A', nt) });
      k.set(shade, { opacity: 0.45 * nt }); k.set(moon, { opacity: nt });
      const sleepy = seg(t, 3.0, 4.0);
      me.pose({ look: 0.9 - 0.4 * sleepy, lean: -8 * sleepy, mood: sleepy > 0.5 ? 'flat' : 'smile', blink: sleepy > 0.6 ? 0.85 : blinkAt(t), armR: 30, armL: 30, squash: 1 - 0.04 * sleepy });
      void easeInOut; void ground;
    }
  };
}
