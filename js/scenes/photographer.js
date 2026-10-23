// photographer：写真家のまめが三脚の大きなカメラで枝の小鳥を撮る。パシャッと光って鳥の写真が出る（例文 The photographer took pictures of birds.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { reach, P, blinkAt, wear, sc, pop } from './member.js';
import { scene, hills, birdG, treeG } from './nature.js';

export const meta = { duration: 4.4, beats: [[0, '鳥をねらう'], [1.6, 'パシャッ'], [2.8, '鳥が撮れた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1, FY = 236;
  scene(k, { FY });
  hills(k, FY);
  // 枝と小鳥
  el('path', { d: 'M 400 90 Q 330 96 280 118 M 330 100 Q 320 86 304 84', stroke: '#9C7A57', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' });
  [[372, 82, 18], [300, 80, -10], [350, 102, 10]].forEach(([x, y, r]) => el('ellipse', { cx: x, cy: y, rx: 14, ry: 7, fill: '#7FCB92', transform: `rotate(${r} ${x} ${y})` }));
  const birds = [[318, 96, '#6AA8F7'], [292, 114, '#FFCF5C']].map(([x, y, c]) => { const bd = birdG(k, c); return { bd, x, y }; });
  // 三脚とカメラ
  const TX = 150, TY = 160;
  [[-22, FY], [0, FY], [22, FY]].forEach(([dx, y]) => el('line', { x1: TX, y1: TY + 8, x2: TX + dx, y2: y, stroke: pal.ink, 'stroke-width': 3 }));
  const cam = g({}); tf(cam, TX, TY);
  el('rect', { x: -16, y: -14, width: 30, height: 22, rx: 4, fill: pal.ink }, cam);
  el('rect', { x: 12, y: -10, width: 30, height: 15, rx: 3, fill: '#4A5466' }, cam);
  el('rect', { x: 40, y: -12, width: 6, height: 19, rx: 2, fill: '#2A3242' }, cam);
  const b = k.buddy({ x: 112, y: FY, scale: S, facing: 1 }); wear(k, b, 'hat', '#8FA36B');
  const flash = el('circle', { r: 26, fill: '#FFFDE8' });
  const photos = [0, 1].map((i) => { const p = g({}); el('rect', { x: -22, y: -18, width: 44, height: 36, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, p); el('rect', { x: -18, y: -14, width: 36, height: 24, fill: '#DCEFD9' }, p); const bb = birdG(k, i ? '#FFCF5C' : '#6AA8F7', p); bb.set(2, 8, 0, 1); return p; });
  return {
    update(t) {
      const near = easeInOut(seg(t, 0.2, 0.9));
      P(b, { lean: 10 * near, look: 1, blink: t > 1 ? 1 : blinkAt(t), mood: t > 2.8 ? 'grin' : 'flat', squash: 1 - 0.03 * near });
      b.pose({ armR: reach(b, S, 'R', TX + 2, TY - 16 + 2 * hump(seg(t, 1.5, 1.7)) + 2 * hump(seg(t, 2.4, 2.6))), armL: reach(b, S, 'L', TX - 14, TY + 4) });
      const f1 = seg(t, 1.55, 1.8), f2 = seg(t, 2.45, 2.7);
      const f = Math.max(hump(f1), hump(f2));
      tf(flash, TX + 46, TY - 3, 0, sc(f)); flash.setAttribute('opacity', 0.9 * f);
      birds.forEach(({ bd, x, y }, i) => { const hop = Math.max(0, Math.sin(t * 4 + i * 2)) * 3; bd.set(x, y - hop, 0, -1); });
      photos.forEach((p, i) => { const q = easeOut(seg(t, 1.9 + i * 0.9, 2.4 + i * 0.9)); tf(p, 60 + i * 56 + 20 * (1 - q), 50 + 10 * (1 - q), i ? 6 : -6, pop(seg(t, 1.9 + i * 0.9, 2.4 + i * 0.9))); });
    }
  };
}
