// save：おぼれかけた男の子を、救助員が海へ駆け込んで抱え、浜まで連れ戻す（例文 The lifeguard saved the boy.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { gait } from './dig.js';
import { heart } from './weigh.js';

export const meta = { duration: 5.2, beats: [[0, 'おぼれそう'], [1.8, '助けに行く'], [4.3, '助かった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = 238, SH = 214, WL = 198;
  k.backdrop({ floorY: FY, mood: 'outdoor' });
  el('rect', { x: 0, y: 150, width: 400, height: 50, fill: '#BFE3F5' });
  el('rect', { x: 0, y: FY - 2, width: 400, height: 70, fill: '#F2DFB5' });
  el('rect', { x: SH, y: 150, width: 400 - SH, height: 150, fill: '#8FD3F4' });
  // 監視台
  el('rect', { x: 20, y: 110, width: 40, height: 6, fill: pal.woodDark });
  el('rect', { x: 26, y: 116, width: 4, height: FY - 116, fill: pal.woodDark }); el('rect', { x: 50, y: 116, width: 4, height: FY - 116, fill: pal.woodDark });
  el('path', { d: 'M 14 110 L 40 88 L 66 110 Z', fill: pal.red });
  const guard = k.buddy({ x: 70, y: FY, facing: 1, scale: 1.05 });
  const hat = el('ellipse', { cx: 0, cy: -80, rx: 27, ry: 9, fill: pal.red }); guard.body.insertBefore(hat, guard.body.children[3]);
  const band = el('rect', { x: -30, y: -40, width: 60, height: 9, fill: pal.red }); guard.body.insertBefore(band, guard.body.children[2]);
  const boy = k.buddy({ x: 300, y: FY, facing: -1, scale: 0.66, color: pal.yellow, dark: pal.yellowDark });
  // 手前の水（足元を隠す）
  const wf = el('path', { d: '', fill: '#8FD3F4', opacity: 0.62 });
  const wl = el('path', { d: '', fill: 'none', stroke: '#fff', 'stroke-width': 2, opacity: 0.8, 'stroke-linecap': 'round' });
  const spl = [0, 1, 2].map(() => el('circle', { r: 3, fill: '#fff', opacity: 0 }));
  const hg = [0, 1, 2].map(() => { const h = g({}); heart(k, h); return h; });
  const gx = (t) => t < 2.8 ? lerp(70, 262, easeInOut(seg(t, 0.9, 2.5))) : lerp(262, 140, easeInOut(seg(t, 2.9, 4.4)));
  const bx = (t) => t < 2.9 ? 300 + 20 * easeInOut(seg(t, 2.5, 2.9)) : gx(t) + 58;
  return {
    update(t) {
      const a = gait(gx, t, 70, 16), c = gait(bx, t, 300, 6, 0.2);
      const face = t > 2.7 ? -1 : 1;
      const reachG = seg(t, 1.9, 2.4) * (1 - seg(t, 2.9, 3.0));
      const tow = seg(t, 2.9, 3.0);
      const safe = seg(t, 4.3, 4.6);
      const fl = Math.sin(t * 13);
      const drown = t < 2.6 ? 1 : 0;
      guard.pose({ x: a.x, facing: face, walk: a.walk, armL: lerp(a.armL, 80, tow), armR: lerp(a.armR, 95, Math.max(reachG, tow * 0)) - safe * 60 + 30 * safe, lean: a.lean + 6 * reachG, look: 0.5, mood: t > 4.2 ? 'grin' : t > 2.4 ? 'open' : 'flat', squash: 1 });
      boy.pose({ x: c.x, y: FY - (drown ? 4 + 3 * Math.sin(t * 5) : 0), facing: -1, walk: c.walk, armL: drown ? 150 + 25 * fl : lerp(150, 30, seg(t, 2.6, 3.2)), armR: drown ? 150 - 25 * fl : lerp(150, 65, seg(t, 2.6, 3.2)) * (1 - safe) + 8 * safe, lean: drown ? 8 * fl : 4, look: -0.4, mood: t > 4.0 ? 'smile' : 'open', squash: 1 - 0.04 * Math.abs(wobble(seg(t, 4.3, 5.0), 3, 3)) });
      // 手前の水（波打つ水面）
      let d = `M ${SH} ${WL}`;
      for (let x = SH; x <= 400; x += 10) d += ` L ${x} ${WL + 2.5 * Math.sin(x * 0.12 + t * 3)}`;
      k.set(wl, { d: d.replace(/^M/, 'M') });
      k.set(wf, { d: d + ' L 400 300 L ' + SH + ' 300 Z' });
      spl.forEach((s, i) => {
        const on = a.x > SH - 10 && a.x < 300 && t < 3.3 && a.m > 0.2;
        const q = ((t * 2.2 + i / 3) % 1);
        k.set(s, { cx: a.x - 10 + i * 12, cy: WL - 10 * hump(q), r: 2.5, opacity: on ? hump(q) : 0 });
      });
      hg.forEach((h, i) => { const q = seg(t, 4.4 + i * 0.15, 5.2); tf(h, 126 + i * 22, 100 - 18 * q + (i % 2) * 8, 0, hump(q) * 1.1 + 0.001); });
    }
  };
}
