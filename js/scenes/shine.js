// shine：雲が流れて太陽が顔を出し、光の輪と光線で明るく輝く（例文 The sun was shining brightly.）
import { seg, lerp, easeInOut, easeOut, hump, smooth } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '雲に隠れる'], [1.4, '顔を出す'], [3.2, 'まぶしく輝く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  const sky = el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#FFF3C9', opacity: 0 });
  // 丘と花
  el('path', { d: `M 0 ${FY} Q 100 ${FY - 40} 200 ${FY - 14} T 400 ${FY - 20} L 400 ${FY} Z`, fill: '#BDE5C4' });
  [[70, 12], [150, 8], [300, 14], [350, 8]].forEach(([x, h], i) => { const f = g({}); tf(f, x, FY - 4); el('line', { x1: 0, y1: 0, x2: 0, y2: -h - 6, stroke: pal.green, 'stroke-width': 2.4 }, f); el('circle', { cy: -h - 8, r: 5.5, fill: i % 2 ? pal.coral : pal.violet }, f); el('circle', { cy: -h - 8, r: 2.2, fill: pal.yellow }, f); });
  // 太陽（光の輪・光線）
  const sun = g({}); tf(sun, 210, 86);
  const halo = el('circle', { r: 56, fill: '#FFE08A', opacity: 0 }, sun);
  const rays = g({}, sun);
  for (let i = 0; i < 12; i++) el('line', { x1: 0, y1: -40, x2: 0, y2: -58, stroke: pal.yellow, 'stroke-width': 6, 'stroke-linecap': 'round', transform: `rotate(${i * 30})` }, rays);
  el('circle', { r: 32, fill: pal.yellow }, sun);
  el('circle', { r: 32, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3, opacity: 0.5 }, sun);
  el('ellipse', { cx: -9, cy: -10, rx: 8, ry: 5, fill: '#fff', opacity: 0.45 }, sun);
  const spk = [0, 1, 2, 3].map(() => { const s = g({}); el('path', { d: 'M 0 -9 L 2.6 -2.6 L 9 0 L 2.6 2.6 L 0 9 L -2.6 2.6 L -9 0 L -2.6 -2.6 Z', fill: '#fff' }, s); return s; });
  // 雲（太陽の前を横切って去る）
  const cloud = g({});
  [[0, 0, 40, 22], [-34, 8, 28, 16], [34, 8, 30, 17], [0, 12, 50, 14]].forEach(([x, y, rx, ry]) => el('ellipse', { cx: x, cy: y, rx, ry, fill: '#F4F7FA', stroke: '#E1E7EE', 'stroke-width': 1.5 }, cloud));
  // 地面の光
  const dim = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#8798B0', opacity: 0.22 });
  const b = k.buddy({ x: 110, y: FY, scale: 1.1, color: pal.coral, dark: pal.coralDark });
  const tr = g({}); tf(tr, 320, FY - 8);
  k.shadow(0, 8, 24, 5, tr); el('rect', { x: -5, y: -42, width: 10, height: 44, rx: 3, fill: pal.woodDark }, tr); el('circle', { cx: 0, cy: -58, r: 28, fill: '#7FD3A0' }, tr); el('circle', { cx: -16, cy: -44, r: 18, fill: '#6BC48F' }, tr);
  return {
    update(t) {
      const clear = easeInOut(seg(t, 1.0, 2.6));
      const glow = smooth(seg(t, 1.3, 3.0));
      const pulse = 1 + 0.07 * Math.sin(t * 5) * glow;
      tf(cloud, lerp(212, 380, clear), lerp(88, 70, clear), 0, 1.15);
      cloud.setAttribute('opacity', 1);
      dim.setAttribute('opacity', 0.24 * (1 - glow));
      sky.setAttribute('opacity', 0.55 * glow);
      halo.setAttribute('opacity', 0.55 * glow); halo.setAttribute('r', 58 * pulse);
      rays.setAttribute('transform', `rotate(${t * 12})`);
      rays.setAttribute('opacity', 0.25 + 0.75 * glow);
      tf(sun, 210, 86, 0, (0.9 + 0.1 * glow) * pulse);
      spk.forEach((s, i) => { const p = ((t * 0.9 + i / 4) % 1) * glow; const a = i * 1.7; tf(s, 210 + Math.cos(a) * (62 + 20 * p), 86 + Math.sin(a) * (62 + 20 * p), 0, Math.sin(p * Math.PI) * 0.9); });
      // 見上げて、まぶしくて手でひさしをつくる
      const sq = seg(t, 1.6, 2.6);
      b.pose({ armR: lerp(8, 148, easeOut(sq)), armL: 8, look: 0.6, blink: 0.55 * sq, mood: t < 1.5 ? 'flat' : 'smile', lean: -3 * sq });
    }
  };
}
