// put in：まめが鍵盤をひたすら練習する。壁の時計の針がぐるぐる回り、窓の外は昼から夕方、夜へ。練習した時間の印が積み上がる（例文 She put in many hours of practice.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '練習を始める'], [1.8, '何時間も'], [3.8, '長い時間を注いだ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 窓（空の色が変わる）
  const sky = el('rect', { x: 250, y: 46, width: 110, height: 80, rx: 5, fill: '#BFE3F5' });
  const sun = el('circle', { cx: 330, cy: 70, r: 10, fill: pal.yellow });
  el('rect', { x: 250, y: 46, width: 110, height: 80, rx: 5, fill: 'none', stroke: '#fff', 'stroke-width': 6 });
  el('line', { x1: 305, y1: 46, x2: 305, y2: 126, stroke: '#fff', 'stroke-width': 4 });
  // 時計
  el('circle', { cx: 170, cy: 70, r: 26, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 });
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; el('line', { x1: 170 + Math.sin(a) * 20, y1: 70 - Math.cos(a) * 20, x2: 170 + Math.sin(a) * 23, y2: 70 - Math.cos(a) * 23, stroke: pal.sub, 'stroke-width': 1.8 }); }
  const hh = el('line', { x1: 170, y1: 70, x2: 170, y2: 58, stroke: pal.ink, 'stroke-width': 3.5, 'stroke-linecap': 'round' });
  const mh = el('line', { x1: 170, y1: 70, x2: 170, y2: 51, stroke: pal.ink, 'stroke-width': 2.2, 'stroke-linecap': 'round' });
  // 時間の印（正の字のような棒）
  const ticks = Array.from({ length: 8 }, (_, i) => el('line', { x1: 30 + i * 10 + (i >= 4 ? 8 : 0), y1: 60, x2: 30 + i * 10 + (i >= 4 ? 8 : 0), y2: 84, stroke: pal.coralDark, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0 }));
  // 鍵盤
  const KX = 230;
  k.shadow(KX + 50, 237, 60, 4);
  el('rect', { x: KX + 6, y: 186, width: 8, height: 50, fill: pal.ink }); el('rect', { x: KX + 86, y: 186, width: 8, height: 50, fill: pal.ink });
  el('rect', { x: KX - 10, y: 168, width: 120, height: 20, rx: 3, fill: pal.ink });
  const keys = Array.from({ length: 10 }, (_, i) => el('rect', { x: KX - 6 + i * 11.2, y: 170, width: 10, height: 14, rx: 1.5, fill: '#fff' }));
  for (let i = 0; i < 10; i++) if (i % 7 !== 2 && i % 7 !== 6) el('rect', { x: KX - 6 + i * 11.2 + 7, y: 170, width: 6, height: 8, fill: pal.ink });
  const b = k.buddy({ x: 186, y: FY, scale: 0.95 });
  const sweat = el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6 Z', fill: pal.water });
  return {
    update(t) {
      const hours = seg(t, 0.5, 3.8) * 8;
      const ang = hours * 360;
      k.set(mh, { x2: 170 + Math.sin(ang * Math.PI / 180) * 19, y2: 70 - Math.cos(ang * Math.PI / 180) * 19 });
      k.set(hh, { x2: 170 + Math.sin((ang / 12 + 60) * Math.PI / 180) * 12, y2: 70 - Math.cos((ang / 12 + 60) * Math.PI / 180) * 12 });
      ticks.forEach((tk, i) => tk.setAttribute('opacity', hours > i + 0.5 ? 1 : 0));
      const d = hours / 8;
      const c1 = [191, 227, 245], c2 = [252, 196, 150], c3 = [70, 80, 120];
      const mix = (a, b, p) => a.map((v, i) => Math.round(lerp(v, b[i], p)));
      const col = d < 0.5 ? mix(c1, c2, d * 2) : mix(c2, c3, (d - 0.5) * 2);
      k.set(sky, { fill: `rgb(${col.join(',')})` });
      k.set(sun, { cy: 70 + d * 60, fill: d > 0.75 ? '#FFF3C4' : pal.yellow, cx: 330 - d * 40 });
      // まめ：両手で鍵盤をたたき続ける（だんだん汗）
      const play = seg(t, 0.3, 0.5);
      const ar = 112 + Math.sin(t * 18) * 8 * play, al = 96 + Math.sin(t * 18 + 2) * 8 * play;
      b.pose({ armR: lerp(10, ar, play), armL: 10, lean: 6 * play + Math.sin(t * 6) * 2, look: 0.6, mood: d > 0.6 ? 'flat' : 'smile', squash: 1 - 0.02 * Math.abs(Math.sin(t * 9)) });
      keys.forEach((kk, i) => k.set(kk, { fill: play > 0 && Math.floor(t * 9 + i * 3.3) % 5 === 0 ? '#E3E8EE' : '#fff' }));
      k.set(sweat, { transform: `translate(${b.state.x - 26} ${170 + ((t * 0.8) % 1) * 20})`, opacity: d > 0.5 ? 1 - ((t * 0.8) % 1) : 0 });
    }
  };
}
