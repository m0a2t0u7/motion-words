// get over：かぜで寝込んでいた人が、1週間の日にちが進むうちに熱が下がり、元気に立ち直る（例文 It took her a week to get over the cold.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, 'かぜをひいた'], [2.0, '1週間たつ'], [4.0, '元気になった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 1週間のカレンダー
  const days = [];
  for (let i = 0; i < 7; i++) {
    const x = 50 + i * 40;
    el('rect', { x, y: 36, width: 32, height: 34, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
    k.text(x + 16, 46, String(i + 1), { 'font-size': 10, fill: pal.sub });
    days.push(el('path', { d: `M ${x + 8} 58 l 6 6 l 11 -12`, stroke: pal.green, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  }
  // 体温計（壁）
  el('rect', { x: 352, y: 90, width: 14, height: 110, rx: 7, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('circle', { cx: 359, cy: 204, r: 11, fill: pal.red });
  const merc = el('rect', { x: 355, width: 8, rx: 4, fill: pal.red });
  // 布団
  el('rect', { x: 80, y: 212, width: 190, height: 24, rx: 8, fill: '#E4F3FB' });
  k.shadow(175, 237, 100, 4);
  const S = 0.9;
  const b = k.buddy({ x: 170, y: FY - 6, scale: S });
  const quilt = el('rect', { x: 92, y: 192, width: 166, height: 44, rx: 12, fill: pal.blue });
  const blush = g({});
  [-1, 1].forEach((d) => el('circle', { cx: d * 18, cy: -44, r: 6, fill: pal.red, opacity: 0.55 }, blush));
  const towel = el('rect', { x: -18, y: -86, width: 36, height: 10, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  const sparks = [0, 1, 2].map(() => el('path', { d: 'M 0 -8 L 2.5 -2.5 L 8 0 L 2.5 2.5 L 0 8 L -2.5 2.5 L -8 0 L -2.5 -2.5 Z', fill: pal.yellow }));
  return {
    update(t) {
      const wk = seg(t, 0.4, 3.2);
      days.forEach((d, i) => { const q = seg(wk * 7, i, i + 0.6); d.setAttribute('stroke-dasharray', `${(30 * q).toFixed(1)} 40`); d.setAttribute('opacity', q > 0 ? 1 : 0); });
      const fever = 1 - easeInOut(seg(t, 0.6, 3.2));
      const top = lerp(176, 100, fever);
      k.set(merc, { y: top, height: 204 - top });
      const rise = easeOut(seg(t, 3.3, 3.8));
      const jump = hump(seg(t, 3.8, 4.25));
      const by = lerp(FY - 6, FY, rise);
      b.pose({ y: by, lift: 16 * jump, mood: fever > 0.5 ? 'sad' : rise > 0.5 ? 'grin' : 'flat', blink: fever > 0.6 ? 0.7 : 0, armR: lerp(10, 150, jump) + 10 * rise, armL: lerp(10, 150, jump) + 10 * rise, squash: 1 - 0.06 * hump(seg(t, 3.25, 3.5)) });
      quilt.setAttribute('opacity', 1 - seg(t, 3.2, 3.45));
      tf(blush, b.state.x, by - 10 * S - 16 * jump * S, 0, S);
      blush.setAttribute('opacity', fever);
      tf(towel, b.state.x, by - 10 * S, 0, S);
      towel.setAttribute('opacity', fever > 0.15 ? 1 : 0);
      sparks.forEach((s, i) => { const q = seg(t, 3.9 + i * 0.12, 4.5 + i * 0.12); s.setAttribute('opacity', q > 0 && q < 1 ? 1 : 0); tf(s, 120 + i * 50, 140 - 18 * q, q * 90, 0.3 + hump(q)); });
    }
  };
}
