// husband：彼女の夫は消防士。ヘルメットの夫がホースで火を消し、妻が誇らしく手をふる（例文 Her husband is a firefighter.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, wear, heartP, pops, P, blinkAt, C } from './jam.js';

export const meta = { duration: 4.4, beats: [[0, '彼女の夫'], [1.0, '消防士'], [2.6, '火を消した']] };

export function create(k) {
  const { el, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'outdoor' });
  // 消防署
  el('rect', { x: 10, y: 60, width: 150, height: 176, fill: '#F3E1D3' });
  el('rect', { x: 0, y: 46, width: 170, height: 18, fill: '#E8574A' });
  el('rect', { x: 26, y: 120, width: 118, height: 116, rx: 4, fill: '#C9D2DD' });
  for (let y = 132; y < 236; y += 14) el('line', { x1: 26, y1: y, x2: 144, y2: y, stroke: '#AEB8C6', 'stroke-width': 2 });
  // 燃えているごみ箱（小さな火）
  const BX = 340;
  el('rect', { x: BX - 18, y: FY - 34, width: 36, height: 34, rx: 3, fill: '#8E9BAD' });
  k.shadow(BX, FY, 22, 3);
  const flames = [0, 1, 2].map((i) => el('path', { d: 'M 0 0 Q -10 -14 0 -30 Q 10 -14 0 0 Z', fill: i === 1 ? '#FFC93C' : '#FF8A3D' }));
  const smoke = [0, 1, 2].map(() => el('circle', { r: 8, fill: '#C9D2DD' }));
  const wife = k.buddy({ x: 70, y: FY, scale: 1.05, ...C(k, 'coral') });
  const hub = k.buddy({ x: 220, y: FY, scale: 1.15 });
  // ヘルメット
  wear(k, hub, (g) => { el('path', { d: 'M -34 -64 Q -34 -98 0 -98 Q 34 -98 34 -64 Z', fill: '#E8574A' }, g); el('rect', { x: -40, y: -68, width: 80, height: 7, rx: 3.5, fill: '#C9433A' }, g); el('rect', { x: -7, y: -94, width: 14, height: 14, rx: 3, fill: '#FFCF5C' }, g); });
  // ホース（ノズルは右手）
  const hose = el('path', { stroke: '#566070', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' });
  const nozzle = k.g({}); el('rect', { x: -4, y: -2, width: 22, height: 8, rx: 3, fill: '#FFCF5C' }, nozzle);
  const spray = [0, 1, 2, 3, 4, 5].map(() => el('circle', { r: 3.5, fill: pal.water }));
  const A = arms(k, hub, 1.15), W = arms(k, wife, 1.05, { col: pal.coral, dark: pal.coralDark });
  const h = heartP(k);
  return {
    update(t) {
      const aim = easeInOut(seg(t, 0.6, 1.0));
      const on = t > 1.0 && t < 3.0;
      const out = seg(t, 1.6, 2.8);
      P(hub, { look: 0.7, lean: 4 * aim, blink: blinkAt(t), mood: t > 2.8 ? 'grin' : 'flat' });
      P(wife, { look: 0.6, blink: blinkAt(t, 1), mood: t > 2.8 ? 'grin' : 'smile' });
      const nx = lerp(250, 262, aim), ny = lerp(196, 170, aim);
      A.to('R', nx, ny); A.to('L', nx - 18, ny + 6);
      k.tf(nozzle, nx, ny - 2, -8 * aim);
      k.set(hose, { d: `M ${nx - 4} ${ny + 2} Q ${nx - 40} ${FY + 10} 150 ${FY - 4}` });
      spray.forEach((s, i) => { const u = ((t - 1.0) * 2.4 + i / 6) % 1; k.set(s, { cx: nx + 20 + u * (BX - nx - 20), cy: ny - 4 - 26 * hump(u) + u * 24, opacity: on ? 1 : 0 }); });
      flames.forEach((f, i) => { const s = (1 - out) * (0.8 + 0.25 * Math.sin(t * 15 + i * 2)); k.tf(f, BX - 10 + i * 10, FY - 34, Math.sin(t * 9 + i) * 6, Math.max(0.001, s * (i === 1 ? 1.1 : 0.8))); });
      smoke.forEach((s, i) => { const u = (t * 0.6 + i / 3) % 1; k.set(s, { cx: BX + Math.sin(u * 6) * 6, cy: FY - 50 - u * 50, opacity: (0.6 * hump(u) * (out > 0.1 ? 1 - seg(t, 3, 4) : 0)).toFixed(2) }); });
      // 妻：手をふる
      const wave = t > 2.8 ? Math.sin(t * 10) * 12 : 0;
      W.ang('R', t > 2.6 ? 150 + wave : 10); W.ang('L', 10);
      const q = seg(t, 3.0, 3.5); k.tf(h, 145, 110 - 10 * q, 0, pops(q) * 1.3);
    }
  };
}
