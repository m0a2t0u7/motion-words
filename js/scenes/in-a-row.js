// in a row：窓の外は毎日雨。まめがカレンダーの1・2・3日目に続けて雨マークを貼る（例文 It rained three days in a row.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, reach, popIn } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '1日目も雨'], [1.6, '2日目も雨'], [3.4, '3日連続']] };

const RD = 'M 0 -9 Q 7 0 0 7 Q -7 0 0 -9 Z';

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // 窓（中で雨が降る）
  const WX = 34, WY = 46, WW = 120, WH = 110;
  const sky = el('rect', { x: WX, y: WY, width: WW, height: WH, fill: '#B9C8D8' });
  const inner = g({}); inner.setAttribute('clip-path', k.clip((c) => el('rect', { x: WX, y: WY, width: WW, height: WH }, c)));
  [[70, 70, 30], [118, 64, 26]].forEach(([x, y, r]) => { el('circle', { cx: x, cy: y, r, fill: '#94A3B6' }, inner); el('circle', { cx: x + 20, cy: y + 6, r: r * 0.8, fill: '#94A3B6' }, inner); });
  const drops = Array.from({ length: 18 }, () => el('line', { x1: 0, y1: 0, x2: -3, y2: 10, stroke: '#EAF4FB', 'stroke-width': 2, 'stroke-linecap': 'round' }, inner));
  const night = el('rect', { x: WX, y: WY, width: WW, height: WH, fill: '#2C3554', opacity: 0 });
  el('rect', { x: WX, y: WY, width: WW, height: WH, rx: 6, fill: 'none', stroke: '#fff', 'stroke-width': 6 });
  el('line', { x1: WX + WW / 2, y1: WY, x2: WX + WW / 2, y2: WY + WH, stroke: '#fff', 'stroke-width': 4 });
  // カレンダー（動かない）
  const CX = 216, CY = 118;
  el('rect', { x: CX, y: CY, width: 160, height: 74, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: CX, y: CY, width: 160, height: 16, rx: 6, fill: pal.blue });
  [CX + 40, CX + 120].forEach((x) => el('circle', { cx: x, cy: CY, r: 4, fill: pal.ink }));
  const cells = [0, 1, 2].map((i) => {
    const x = CX + 10 + i * 48;
    el('rect', { x, y: CY + 22, width: 44, height: 46, rx: 4, fill: '#F4F7FA', stroke: pal.line });
    k.text(x + 9, CY + 31, String(i + 1), { 'font-size': 11, fill: pal.sub });
    const st = g({}); el('circle', { r: 14, fill: '#DDEFFA' }, st); el('path', { d: RD, fill: pal.blue }, st);
    return { x: x + 22, y: CY + 48, st };
  });
  const under = el('rect', { x: CX + 10, y: CY + 74, width: 0, height: 5, rx: 2.5, fill: pal.red });
  const b = k.buddy({ x: 270, y: FY, scale: 0.9 });
  const day = (t) => Math.min(2, Math.floor(t / 1.35));
  const stick = (i) => 0.75 + i * 1.35;
  const sticker = g({}); el('circle', { r: 14, fill: '#DDEFFA' }, sticker); el('path', { d: RD, fill: pal.blue }, sticker);
  return {
    update(t) {
      // 日の区切り：窓が一瞬夜になる
      const nt = [1.3, 2.65].reduce((m, a) => Math.max(m, hump(seg(t, a - 0.2, a + 0.25))), 0);
      night.setAttribute('opacity', 0.75 * nt);
      drops.forEach((d, i) => {
        const y = ((t * (240 + (i * 31) % 70) + i * 37) % (WH + 20)) + WY - 14;
        const x = WX + ((i * 41.7) % (WW + 20)) + (y - WY) * 0.3 - 10;
        d.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      });
      const i = day(t), s0 = stick(i);
      const bx = lerp(cells[Math.max(0, i - 1)].x, cells[i].x, easeInOut(seg(t, s0 - 0.75, s0 - 0.3))) - 46;
      const back = easeInOut(seg(t, 3.45, 4.1));
      const x = lerp(i === 0 ? cells[0].x - 46 : bx, 166, back);
      const up = hump(seg(t, s0 - 0.35, s0 + 0.35));
      P(b, { x, walk: x * 0.107, facing: back > 0 && back < 1 ? -1 : 1, look: back > 0 && back < 1 ? 0 : 0.7, mood: t > 3.4 ? 'sad' : 'flat', lift: 4 * up });
      // 手に雨シールを持って、セルに貼る
      const hand = { x: lerp(x + 34, cells[i].x, easeOut(seg(t, s0 - 0.35, s0))), y: lerp(196, cells[i].y, easeOut(seg(t, s0 - 0.35, s0))) };
      const reaching = t > s0 - 0.4 && t < s0 + 0.35;
      b.pose({ armR: reaching ? reach(b, 0.9, 'R', hand.x, hand.y + 4) : 15 });
      if (t > 3.45) b.pose({ armR: 8, armL: 8, lean: back >= 1 ? -4 : 3 });
      tf(sticker, hand.x, hand.y, 0, reaching && t < s0 ? 0.85 : 0.001);
      cells.forEach((c, j) => tf(c.st, c.x, c.y, 0, popIn(seg(t, stick(j), stick(j) + 0.25))));
      k.set(under, { width: 140 * easeOut(seg(t, 3.6, 4.1)) });
    }
  };
}
