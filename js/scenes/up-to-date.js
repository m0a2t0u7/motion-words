// up to date：スマホに更新のお知らせ。まめがタップして更新バーが満ち、最新の状態（チェック）になる（例文 Keep your phone up to date.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, held, popIn, roomBg } from './in-common.js';
import { frontL } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, '更新のお知らせ'], [1.4, '更新中'], [3.2, '最新の状態']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const A = k.buddy({ x: 150, y: FY, scale: 0.95 });
  const L = frontL(A, 0.95);
  // 大きめのスマホ（手に持つ）
  const ph = g({});
  el('rect', { x: -24, y: -44, width: 48, height: 88, rx: 8, fill: pal.ink }, ph);
  const scr = el('rect', { x: -20, y: -38, width: 40, height: 74, rx: 4, fill: '#E8F2FB' }, ph);
  const appIc = [[-10, -26, pal.coral], [4, -26, pal.blue], [-10, -12, pal.yellow], [4, -12, pal.green]].map(([x, y, c]) => el('rect', { x, y, width: 10, height: 10, rx: 3, fill: c }, ph));
  const barBg = el('rect', { x: -14, y: 10, width: 28, height: 6, rx: 3, fill: '#C9D1DC' }, ph);
  const bar = el('rect', { x: -14, y: 10, width: 0, height: 6, rx: 3, fill: pal.mint }, ph);
  const arrow = el('path', { d: 'M 0 -6 L 0 6 M -6 0 L 0 6 L 6 0', stroke: pal.blue, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ph);
  const ok = g({}, ph); el('circle', { r: 11, fill: pal.green }, ok); el('path', { d: 'M -5 0 L -1 4 L 6 -4', stroke: '#fff', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, ok);
  const badge = g({}, ph); el('circle', { r: 7, fill: pal.red }, badge); k.text(0, 1, '1', { 'font-size': 10, fill: '#fff' }, badge);
  const ring = el('circle', { r: 0, fill: 'none', stroke: pal.mint, 'stroke-width': 2.5 });
  return {
    update(t) {
      const up = easeOut(seg(t, 0.1, 0.5));
      P(A, { armR: lerp(8, 62, up), look: 0.7, mood: t > 3.2 ? 'grin' : t > 0.6 && t < 1.2 ? 'open' : 'smile', lean: -2 + 2 * Math.sin(t * 2) });
      const h = held(k, A, 0.95, ph, 'R', 0, 30);
      tf(ph, h.x + 16, h.y - 34, 0, 0.92);
      // 左手でタップ（1.0〜1.3）
      const tap = hump(seg(t, 1.0, 1.4));
      L.set(lerp(20, 78, easeOut(seg(t, 0.6, 1.0))) * (1 - easeOut(seg(t, 3.4, 3.8))) + 8 * tap);
      const prog = easeInOut(seg(t, 1.4, 3.0));
      k.set(bar, { width: 28 * prog });
      const done = t > 3.05;
      [barBg, bar].forEach((n) => n.setAttribute('opacity', t > 1.3 && !done ? 1 : 0));
      arrow.setAttribute('transform', `translate(0 ${(-1 + 3 * Math.sin(t * 8)).toFixed(1)})`);
      arrow.setAttribute('opacity', t > 1.3 && !done ? 1 : 0);
      appIc.forEach((a) => a.setAttribute('opacity', t > 1.3 && !done ? 0.25 : 1));
      tf(ok, 0, 22, 0, popIn(seg(t, 3.05, 3.4)));
      tf(badge, 22, -42, 0, t < 1.3 ? 1 + 0.15 * Math.max(0, Math.sin(t * 9)) : 0.001);
      const c = { x: h.x + 16, y: h.y - 34 };
      const rp = seg(t, 1.15, 1.6);
      k.set(ring, { cx: c.x, cy: c.y, r: 6 + 18 * rp, opacity: rp > 0 && rp < 1 ? 1 - rp : 0 });
    }
  };
}
