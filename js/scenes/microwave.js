// microwave：スープの器を電子レンジに入れて扉を閉め、ボタンを押すと中が光って回り、湯気が立つ（例文 Heat the soup in the microwave.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { reach, hp } from './dig.js';
import { gait } from './weigh.js';
import { P, blinkAt } from './run-after.js';
import { kitchenWall } from './cabinet.js';

// スープの器（原点＝底の中央）
export function soupBowl(k, parent) {
  const g = k.g({}, parent), { el } = k;
  el('path', { d: 'M -16 -12 H 16 Q 15 0 0 0 Q -15 0 -16 -12 Z', fill: '#fff', stroke: '#C9D2DE', 'stroke-width': 1.6 }, g);
  el('ellipse', { cx: 0, cy: -12, rx: 15, ry: 3.2, fill: '#F2A65A' }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, 'スープを持つ'], [1.0, 'レンジに入れる'], [2.4, '温まった']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.88;
  const kw = kitchenWall(k, { x0: 150, x1: 400 });
  const FY = kw.FY, CT = kw.CT;
  kw.counter();
  // 電子レンジ（調理台の上）
  const M0 = 214, M1 = 336, MT = CT - 62, D1 = 304;
  k.shadow((M0 + M1) / 2, CT, 64, 3);
  el('rect', { x: M0, y: MT, width: M1 - M0, height: CT - MT, rx: 6, fill: '#E3E8EE', stroke: '#C3CCD8', 'stroke-width': 2 });
  const cave = el('rect', { x: M0 + 8, y: MT + 8, width: D1 - M0 - 14, height: CT - MT - 16, rx: 3, fill: '#5A6579' });
  const light = el('rect', { x: M0 + 8, y: MT + 8, width: D1 - M0 - 14, height: CT - MT - 16, rx: 3, fill: '#FFE7A0', opacity: 0 });
  el('ellipse', { cx: (M0 + D1) / 2 - 4, cy: CT - 11, rx: 30, ry: 3.5, fill: '#C9D2DE' });
  el('rect', { x: D1 + 6, y: MT + 10, width: 20, height: 10, rx: 2, fill: '#2F3747' });
  const disp = k.text(D1 + 16, MT + 15.5, '', { 'font-size': 7, fill: '#7CF2B0' });
  const btn = el('circle', { cx: D1 + 16, cy: MT + 38, r: 5, fill: pal.green });
  el('circle', { cx: D1 + 16, cy: MT + 26, r: 3, fill: '#AEB7C4' });
  const bowl = soupBowl(k);
  // 扉（左に蝶番）
  const door = g({}), DW = D1 - M0;
  const face = el('path', { d: `M 0 ${MT + 3} h ${DW} v ${CT - MT - 6} h ${-DW} Z M 8 ${MT + 9} v ${CT - MT - 18} h ${DW - 20} v ${-(CT - MT - 18)} Z`, 'fill-rule': 'evenodd', fill: '#D3DAE3', stroke: '#AEB7C4', 'stroke-width': 2 }, door);
  const glass = el('rect', { x: 8, y: MT + 9, width: DW - 20, height: CT - MT - 18, fill: '#2F3747', opacity: 0.5 }, door);
  el('rect', { x: DW - 8, y: MT + 12, width: 4, height: CT - MT - 24, rx: 2, fill: '#8892A3' }, door);
  const steam = [0, 1, 2].map(() => el('path', { d: 'M 0 0 q 5 -7 0 -14 q -5 -7 0 -14', fill: 'none', stroke: '#C9D3E0', 'stroke-width': 3, 'stroke-linecap': 'round' }));
  const b = k.buddy({ x: 50, y: FY, scale: S });
  const xf = (t) => lerp(50, 150, easeInOut(seg(t, 0.15, 0.85)));
  const spot = { x: (M0 + D1) / 2 - 4, y: CT - 12 };
  return {
    update(t) {
      const w = gait(xf, t, 50, 0, 0.12);
      const open = easeInOut(seg(t, 0.85, 1.15)) * (1 - easeInOut(seg(t, 1.8, 2.05)));
      const put = easeInOut(seg(t, 1.15, 1.65)), press = easeInOut(seg(t, 2.05, 2.35)) * (1 - easeInOut(seg(t, 2.55, 2.85)));
      const sx = lerp(1, -0.35, open);
      door.setAttribute('transform', `translate(${M0} 0) scale(${sx.toFixed(3)} 1)`);
      face.setAttribute('fill', sx < 0 ? '#C3CCD8' : '#D3DAE3');
      glass.setAttribute('opacity', sx < 0 ? 0 : 0.45 - 0.35 * seg(t, 2.3, 2.5));
      const pose = { x: w.x, walk: w.walk, lean: w.lean + 6 * put, look: 0.6, blink: blinkAt(t), mood: t > 3.4 ? 'grin' : 'smile' };
      P(b, pose);
      let armR = 70;
      if (t > 1.15) armR = lerp(70, reach(b, S, 'R', spot.x - 18, spot.y - 6), put);
      if (t > 1.65) armR = lerp(armR, 30, easeInOut(seg(t, 1.65, 1.95)));
      if (t > 2.0) armR = lerp(30, reach(b, S, 'R', D1 + 10, MT + 38), press);
      P(b, { ...pose, armR, armL: 8, lean: pose.lean + 6 * press });
      k.set(btn, { r: 5 - 1 * hump(seg(t, 2.25, 2.45)) });
      const h = hp(b, S, 'R', 30);
      const run = seg(t, 2.35, 4.2), on = t > 2.35 && t < 4.0;
      if (t < 1.65) tf(bowl, lerp(h.x + 14, spot.x, put), lerp(h.y + 8, spot.y + 3, put));
      else tf(bowl, spot.x + (on ? 6 * Math.sin((t - 2.35) * 3) : 0), spot.y + 3, 0, on ? 1 - 0.1 * Math.abs(Math.sin((t - 2.35) * 3)) : 1, 1);
      light.setAttribute('opacity', on ? 0.75 : 0);
      disp.textContent = t > 2.35 ? (t > 4.0 ? '0:00' : '0:' + String(Math.max(0, 59 - Math.floor(run * 59))).padStart(2, '0')) : '';
      steam.forEach((s, i) => { const q = (((t - 3.0) * 0.8 + i * 0.33) % 1 + 1) % 1; tf(s, spot.x - 10 + i * 10, MT - 2 - 16 * q); s.setAttribute('opacity', t > 3.0 ? Math.sin(q * Math.PI) * 0.9 : 0); });
    }
  };
}
