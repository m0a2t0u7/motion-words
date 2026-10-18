// look on：作業員2人が道路の穴を直すのを、柵の向こうの人たちがただ見ている（例文 The crowd looked on as the workers fixed the road.）
import { seg, lerp, easeInOut, easeOut, smooth, hump } from '../ease.js';
import { hat, faceAt, held } from './look-over.js';
import { road } from './look-out.js';

export const meta = { duration: 4.6, beats: [[0, '道路の穴'], [1.6, '作業を見守る'], [3.9, '道が直った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 200 });
  [[0, 70, '#E4EEF7'], [96, 96, '#F3E6DC'], [196, 60, '#E6F1E8'], [290, 90, '#E4EEF7']].forEach(([x, h, c]) => el('rect', { x, y: 170 - h, width: 92, height: h, rx: 4, fill: c }));
  el('rect', { x: 0, y: 170, width: 400, height: 40, fill: '#E9ECF1' });
  // 見物人（奥の歩道）
  const crowd = [[60, pal.mint, pal.mintDark], [110, pal.blue, pal.blueDark], [160, pal.yellow, pal.yellowDark], [330, pal.violet, '#8A6FD8']].map(([x, c, d], i) => k.buddy({ x, y: 204, scale: 0.6, color: c, dark: d, facing: x > 250 ? -1 : 1 }));
  // 柵
  for (let x = 20; x < 400; x += 46) { el('rect', { x, y: 186, width: 5, height: 22, fill: pal.sub }); }
  el('rect', { x: 0, y: 188, width: 400, height: 6, rx: 3, fill: pal.red, opacity: 0.85 });
  for (let x = 0; x < 400; x += 24) el('rect', { x: x + 6, y: 188, width: 10, height: 6, fill: '#fff' });
  road(k, 212);
  const patch = el('ellipse', { cx: 232, cy: 252, rx: 38, ry: 9, fill: '#4A5260' });
  const fill = el('ellipse', { cx: 232, cy: 252, rx: 38, ry: 9, fill: '#8C95A2' });
  const W = [k.buddy({ x: 172, y: 256, scale: 0.85, color: pal.coral, dark: pal.coralDark }), k.buddy({ x: 300, y: 256, scale: 0.85, color: pal.blue, dark: pal.blueDark, facing: -1 })];
  W.forEach((w) => hat(k, w, pal.yellow, pal.yellowDark));
  // 道具：スコップと突き固め棒
  const tools = W.map((w, i) => { const n = g({}); el('rect', { x: -2, y: -10, width: 4, height: 44, rx: 2, fill: pal.woodDark }, n); el(i ? 'rect' : 'path', i ? { x: -9, y: 32, width: 18, height: 8, rx: 2, fill: pal.sub } : { d: 'M -9 32 L 9 32 L 6 50 Q 0 54 -6 50 Z', fill: pal.sub }, n); return n; });
  const grain = el('circle', { r: 4, fill: '#8C95A2' });
  return {
    update(t) {
      const prog = smooth(seg(t, 0.6, 3.8));
      k.set(fill, { rx: 38 * prog, ry: 9 * prog });
      W.forEach((w, i) => {
        const on = t > 0.5 && t < 3.9, u = ((t - 0.5) * (i ? 1.6 : 1.1)) % 1;
        const m = on ? (i ? Math.abs(Math.sin(u * Math.PI)) : u < 0.5 ? easeInOut(u * 2) : 1 - easeInOut((u - 0.5) * 2)) : 0;
        w.pose({ armR: lerp(60, 30, m) + (i ? 20 : 0), armL: 50, lean: 10 + 12 * m, squash: 1 - 0.03 * m, mood: on ? 'flat' : 'grin', look: 0.6 });
        held(k, w, 0.85, tools[i], 'R', i ? 0 : 10);
      });
      const ug = ((t - 0.5) * 1.1) % 1;
      k.set(grain, { cx: lerp(200, 226, seg(ug, 0.5, 1)), cy: 240 - 14 * Math.sin(seg(ug, 0.5, 1) * Math.PI), opacity: t > 0.6 && t < 3.6 && ug > 0.5 ? 1 : 0 });
      // 見物人は加わらず、首だけで作業を追う
      crowd.forEach((c, i) => {
        c.pose({ armL: i === 1 ? 8 : 12, armR: 8 + (i === 2 ? 4 : 0), look: 0.8, mood: t > 4.0 ? 'smile' : 'flat', blink: hump(seg(t, 1.6 + i * 0.5, 1.75 + i * 0.5)), squash: 1 + 0.01 * Math.sin(t * 3 + i) });
        faceAt(c, 5, 4 + Math.sin(t * 2.2 + i) * 1.5);
      });
    }
  };
}
