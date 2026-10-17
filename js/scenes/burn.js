// burn：暖炉の薪が何時間も燃え続け、炎が小さくなって薪が灰になっていく。壁の時計が進む（例文 The wood burned for hours.）
import { seg, lerp, easeInOut, easeOut, smooth, clamp } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, '火がつく'], [1.8, '燃え続ける'], [3.9, '灰と残り火']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'evening' });
  // 暖炉
  el('rect', { x: 120, y: 76, width: 170, height: 160, rx: 6, fill: '#C98A6A' });
  for (let r = 0; r < 8; r++) for (let c = 0; c < 6; c++) el('rect', { x: 124 + c * 27 + (r % 2) * 13, y: 80 + r * 19, width: 25, height: 17, rx: 2, fill: r % 2 ? '#BF7E5E' : '#D49677', opacity: 0.9 });
  el('rect', { x: 108, y: 68, width: 194, height: 14, rx: 4, fill: pal.woodDark });
  el('rect', { x: 150, y: 128, width: 110, height: 108, rx: 10, fill: '#3A2E2A' });
  const gcl = k.clip((c) => el('rect', { x: 150, y: 128, width: 110, height: 108, rx: 10 }, c));
  const glow = el('ellipse', { cx: 205, cy: 222, rx: 70, ry: 50, fill: '#FF8A3D', opacity: 0, 'clip-path': gcl });
  // 時計（時間の経過）
  const CKX = 346, CKY = 64, rad = (d) => (d * Math.PI) / 180;
  el('circle', { cx: CKX, cy: CKY, r: 26, fill: '#fff', stroke: pal.ink, 'stroke-width': 4 });
  for (let i = 0; i < 12; i++) { const a = rad(i * 30); el('line', { x1: CKX + Math.sin(a) * 20, y1: CKY - Math.cos(a) * 20, x2: CKX + Math.sin(a) * 23, y2: CKY - Math.cos(a) * 23, stroke: pal.sub, 'stroke-width': 2 }); }
  const hh = el('line', { x1: CKX, y1: CKY, x2: CKX, y2: CKY - 13, stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' });
  const mh = el('line', { x1: CKX, y1: CKY, x2: CKX, y2: CKY - 19, stroke: pal.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round' });
  // 薪
  const logs = [[-22, 0, 4, 58], [22, 0, -4, 58], [0, -13, 0, 70]].map(([x, y, rot, len]) => { const l = g({}); const body = el('rect', { x: -len / 2, y: -7, width: len, height: 14, rx: 7, fill: '#8B5A3C' }, l); const ends = el('circle', { cx: len / 2, cy: 0, r: 5, fill: '#D9B98A' }, l); const hot = el('rect', { x: -len / 2 + 6, y: -2, width: len - 12, height: 4, rx: 2, fill: '#FF8A3D', opacity: 0 }, l); return { l, body, ends, hot, x, y, rot, len }; });
  const BX = 205, BY = 224;
  // 炎
  const flames = [[-22, 0.8, 0], [0, 1.1, 1.7], [24, 0.85, 3.3]].map(([x, s, ph]) => { const f = g({}); el('path', { d: 'M 0 0 C -18 -4 -18 -26 0 -52 C 6 -36 20 -28 18 -10 C 16 -2 8 2 0 0 Z', fill: '#FF8A3D' }, f); el('path', { d: 'M 0 0 C -9 -2 -9 -14 0 -28 C 3 -20 11 -16 9 -6 C 8 -1 4 1 0 0 Z', fill: '#FFD35C' }, f); return { f, x, s, ph }; });
  const sparks = [0, 1, 2, 3].map(() => el('circle', { r: 1.8, fill: '#FFD35C' }));
  const ash = el('ellipse', { cx: BX, cy: 230, rx: 0, ry: 0, fill: '#6E6860' });
  const b = k.buddy({ x: 70, y: 236, facing: 1 });
  return {
    update(t) {
      const burn = smooth(seg(t, 0.8, 4.0)), ign = smooth(seg(t, 0.2, 0.8));
      // 炎の大きさ：点火→安定→小さくなる
      const fs = ign * (1 - 0.82 * smooth(seg(t, 2.8, 4.0))) ;
      flames.forEach((o, i) => {
        const fl = 1 + 0.18 * Math.sin(t * 11 + o.ph) + 0.1 * Math.sin(t * 19 + o.ph * 2);
        tf(o.f, BX + o.x * (1 - 0.3 * burn), BY - 6, 5 * Math.sin(t * 7 + o.ph), o.s * fs * (1 - fl * 0.0) * (0.95 + 0.1 * Math.sin(t * 13 + o.ph)), o.s * fs * fl);
        o.f.setAttribute('opacity', fs > 0.02 ? 1 : 0);
      });
      logs.forEach((o, i) => {
        const sh = 1 - 0.5 * burn;
        tf(o.l, BX + o.x * (1 - 0.15 * burn), BY + o.y + 3 * burn, o.rot * (1 - 0.3 * burn), sh, 1 - 0.35 * burn);
        o.body.setAttribute('fill', burn < 0.7 ? `rgb(${Math.round(lerp(139, 90, burn / 0.7))},${Math.round(lerp(90, 60, burn / 0.7))},${Math.round(lerp(60, 48, burn / 0.7))})` : `rgb(${Math.round(lerp(90, 52, (burn - 0.7) / 0.3))},${Math.round(lerp(60, 44, (burn - 0.7) / 0.3))},${Math.round(lerp(48, 42, (burn - 0.7) / 0.3))})`);
        o.hot.setAttribute('opacity', smooth(seg(t, 2.8, 3.6)) * (0.5 + 0.4 * Math.sin(t * 6 + i)));
        o.ends.setAttribute('fill', burn > 0.6 ? '#3A3430' : '#D9B98A');
      });
      k.set(ash, { rx: 52 * burn, ry: 8 * burn, opacity: burn });
      k.set(glow, { opacity: 0.35 * ign * (0.7 + 0.3 * Math.sin(t * 9)) * (1 - 0.5 * smooth(seg(t, 3.0, 4.0))) });
      sparks.forEach((s, i) => { const u = ((t * 0.9 + i * 0.27) % 1); k.set(s, { cx: BX - 20 + i * 14 + Math.sin(t * 5 + i) * 6, cy: BY - 40 - u * 70, opacity: fs * (1 - u) }); });
      // 時計：数時間分がぐんぐん進む
      const hr = seg(t, 0.4, 4.2);
      hh.setAttribute('transform', `rotate(${(hr * 100).toFixed(1)} ${CKX} ${CKY})`);
      mh.setAttribute('transform', `rotate(${(hr * 1200).toFixed(1)} ${CKX} ${CKY})`);
      // まめ：火にあたる→あくびをして温まる
      const wm = 1 - 0.6 * burn;
      b.pose({ armR: lerp(60, 78, ign), armL: 8, lean: 3 * ign, look: 0.8, mood: t > 3.9 ? 'open' : 'smile', squash: 1 - 0.015 * Math.sin(t * 2), blink: t > 4.2 ? 0.8 : 0 });
    }
  };
}
