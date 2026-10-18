// find out：閉まっている店の前へ行き、入口の札を顔を寄せて確かめる→開店時刻（10:00）がわかってうなずく（例文 I'll find out what time the store opens.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { faceAt, walkPose, say } from './look-over.js';
import { streetBg } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '閉まった店'], [1.6, '札を確かめる'], [3.2, '10時に開く']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const FY = streetBg(k, 240);
  el('rect', { x: 170, y: 84, width: 220, height: 156, fill: '#FFF1D2' });
  for (let i = 0; i < 11; i++) el('path', { d: `M ${170 + i * 20} 84 h 20 v 20 q -10 8 -20 0 Z`, fill: i % 2 ? '#fff' : pal.green });
  // 閉まったシャッター
  el('rect', { x: 230, y: 124, width: 120, height: 116, fill: '#C8D0DA' });
  for (let y = 132; y < 240; y += 10) el('line', { x1: 230, x2: 350, y1: y, y2: y, stroke: '#AEB7C3', 'stroke-width': 2 });
  // 営業時間の札
  el('rect', { x: 186, y: 140, width: 34, height: 40, rx: 4, fill: '#fff', stroke: pal.sub, 'stroke-width': 2 });
  const blur = el('g', {}); [150, 160, 170].forEach((y) => el('line', { x1: 192, x2: 214, y1: y, y2: y, stroke: '#C8D0DA', 'stroke-width': 3, 'stroke-linecap': 'round' }, blur));
  const b = k.buddy({ x: 40, y: FY, scale: S });
  const zoom = g({});
  el('circle', { r: 30, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 }, zoom);
  k.text(0, -8, 'OPEN', { 'font-size': 11, fill: pal.green }, zoom); k.text(0, 9, '10:00', { 'font-size': 15 }, zoom);
  const bub = say(k, 46, 40, -1);
  const C = g({}, bub.g); el('circle', { r: 13, fill: '#fff', stroke: pal.ink, 'stroke-width': 2.2 }, C);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -9, stroke: pal.ink, 'stroke-width': 2, 'stroke-linecap': 'round' }, C); el('line', { x1: 0, y1: 0, x2: -6, y2: -3.5, stroke: pal.ink, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, C);
  const xf = (t) => lerp(40, 150, easeInOut(seg(t, 0.2, 1.5)));
  return {
    update(t) {
      const p = walkPose(xf, t, 40), peer = easeInOut(seg(t, 1.5, 2.0)), nod = t > 2.8 ? Math.max(0, Math.sin((t - 2.8) * 6)) : 0;
      b.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: p.m > 0.05 ? p.armR : 8 + 60 * peer * (1 - seg(t, 2.8, 3.1)), lean: p.lean + 12 * peer * (1 - seg(t, 2.8, 3.1)) + 5 * nod, mood: t > 2.6 ? 'grin' : 'flat', look: 0.7 });
      faceAt(b, 5, -4 * peer);
      const z = seg(t, 1.9, 2.3);
      tf(zoom, 203, 160, 0, z <= 0 ? 0.001 : backOut(z) * (1 - 0.0 * seg(t, 3.0, 3.2)));
      zoom.setAttribute('opacity', z * (1 - seg(t, 3.0, 3.2)));
      bub.show(seg(t, 3.0, 3.25), 200, 112);
    }
  };
}
