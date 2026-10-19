// cafe：カフェの小さなテーブルで、2人がコーヒーを飲みながら話す（例文 Let's talk at the cafe.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, held, reach, P, blinkAt, bp, signBoard, sideTable, lamp } from './restaurant.js';
import { cup } from './cabinet.js';
import { say } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, 'カフェで'], [1.3, 'ひと口飲む'], [2.4, 'おしゃべり']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95, FY = 240;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#EFE3D3' });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#C9A37E' });
  for (let x = 0; x < 400; x += 26) el('rect', { x, y: FY, width: 13, height: 60, fill: '#BE9772' });
  // 奥のカウンターとコーヒーマシン、黒板メニュー
  el('rect', { x: 250, y: 150, width: 150, height: 40, fill: '#9C6B4A' });
  el('rect', { x: 246, y: 146, width: 158, height: 7, rx: 2, fill: '#7A5236' });
  el('rect', { x: 330, y: 112, width: 40, height: 34, rx: 4, fill: '#B8C2CE' });
  el('rect', { x: 340, y: 128, width: 20, height: 4, fill: pal.ink });
  el('rect', { x: 262, y: 40, width: 120, height: 64, rx: 4, fill: '#3E4A45', stroke: pal.woodDark, 'stroke-width': 5 });
  k.text(322, 58, 'CAFE', { 'font-size': 16, fill: '#fff' });
  [74, 88].forEach((y) => el('line', { x1: 278, y1: y, x2: 366, y2: y, stroke: '#fff', 'stroke-width': 2, opacity: 0.5, 'stroke-dasharray': '30 8' }));
  el('rect', { x: 26, y: 50, width: 90, height: 84, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  lamp(k, 180, 70, '#F2A65A');
  const TOP = FY - 58;
  [[112, 1], [248, -1]].forEach(([x, f]) => { el('rect', { x: x - 24, y: FY - 26, width: 48, height: 8, rx: 3, fill: '#7A5236' }); el('rect', { x: x - 3, y: FY - 18, width: 6, height: 18, fill: '#7A5236' }); });
  const A = k.buddy({ x: 112, y: FY - 22, scale: S, facing: 1 });
  const B = k.buddy({ x: 248, y: FY - 22, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  sideTable(k, 180, TOP, 96, FY, '#F4E6D4');
  const cA = cup(k, null, '#fff'), cB = cup(k, null, '#fff');
  const steam = [0, 1].map(() => el('path', { d: 'M 0 0 q -4 -6 0 -12 q 4 -6 0 -12', stroke: '#C8CED6', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }));
  const sA = say(k, 54, 34, -1), sB = say(k, 54, 34, 1);
  const dotsA = [0, 1, 2].map((i) => el('circle', { cx: -12 + i * 12, cy: 0, r: 3.2, fill: pal.mintDark }, sA.g));
  const dotsB = [0, 1, 2].map((i) => el('circle', { cx: -12 + i * 12, cy: 0, r: 3.2, fill: pal.coralDark }, sB.g));
  const sip = (b, c, s, t, t0, ox) => {
    const up = easeInOut(seg(t, t0, t0 + 0.4)) * (1 - easeInOut(seg(t, t0 + 0.9, t0 + 1.3)));
    const m = bp(b, S, 6, -40), rest = { x: ox, y: TOP - 2 };
    const tgt = { x: lerp(rest.x, m.x + 14 * b.state.facing, up), y: lerp(rest.y, m.y + 8, up) };
    b.pose({ armR: reach(b, S, 'R', tgt.x, tgt.y + 2) });
    const h = hp(b, S, 'R', 27);
    k.tf(c, h.x - 2 * b.state.facing, h.y + 6, -b.state.facing * 22 * up, b.state.facing * 1.1, 1.1);
    tf(s, rest.x, TOP - 22 - 4 * Math.sin(t * 3 + ox), 0, 1); s.setAttribute('opacity', up > 0.1 ? 0 : 0.7);
    return up;
  };
  return {
    update(t) {
      const talkA = t > 2.2 && t < 3.2, talkB = t > 3.2;
      P(A, { lean: 6, look: 0.5, armL: 10, blink: blinkAt(t), mood: talkA && Math.sin(t * 22) > 0 ? 'open' : 'smile' });
      P(B, { lean: 6, look: 0.5, armL: 10, blink: blinkAt(t, 1.1), mood: talkB && Math.sin(t * 22) > 0 ? 'open' : t > 3.2 ? 'grin' : 'smile' });
      const ua = sip(A, cA, steam[0], t, 0.7, 158), ub = sip(B, cB, steam[1], t, 1.1, 202);
      if (ua > 0.6) A.pose({ blink: 1 }); if (ub > 0.6) B.pose({ blink: 1 });
      sA.show(seg(t, 2.1, 2.4) * (1 - seg(t, 3.3, 3.5)) + seg(t, 3.9, 4.1) * 0, 138, 96);
      sB.show(seg(t, 3.2, 3.5), 222, 96);
      dotsA.forEach((d, i) => d.setAttribute('opacity', 0.35 + 0.65 * hump(((t * 2.5 - i * 0.3) % 1 + 1) % 1)));
      dotsB.forEach((d, i) => d.setAttribute('opacity', 0.35 + 0.65 * hump(((t * 2.5 - i * 0.3) % 1 + 1) % 1)));
    }
  };
}
