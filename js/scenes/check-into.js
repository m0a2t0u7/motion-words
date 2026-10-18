// check into：煙を出して止まった機械。ふたりはすぐにふたを開け、虫めがねで中を詳しく調べる（例文 We'll check into the problem right away.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { reach, hp } from './weigh.js';
import { held } from './dig.js';

export const meta = { duration: 4.6, beats: [[0, '機械の不具合'], [1.6, 'ふたを開ける'], [3.2, '中を調べる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // 機械：内部（歯車）とふた
  const MX = 236, MY = 104;
  el('rect', { x: MX, y: MY, width: 120, height: 132, rx: 8, fill: '#C9D3E0' });
  el('rect', { x: MX + 14, y: MY + 20, width: 92, height: 66, rx: 4, fill: '#2F3A4D' });
  const gear = g({}); tf(gear, MX + 46, MY + 54);
  for (let i = 0; i < 8; i++) if (i !== 2) el('rect', { x: -3, y: -17, width: 6, height: 8, fill: pal.yellow, transform: `rotate(${i * 45})` }, gear);
  el('circle', { r: 12, fill: pal.yellow }, gear); el('circle', { r: 4, fill: '#2F3A4D' }, gear);
  const g2 = g({}); tf(g2, MX + 78, MY + 44); el('circle', { r: 9, fill: '#8F9BB0' }, g2);
  const lamp = el('circle', { cx: MX + 104, cy: MY + 108, r: 7, fill: pal.red });
  el('rect', { x: MX + 14, y: MY + 100, width: 40, height: 14, rx: 3, fill: '#8F9BB0' });
  k.shadow(MX + 60, 237, 66, 5);
  const lid = g({}); el('rect', { x: 0, y: 0, width: 92, height: 66, rx: 4, fill: '#AEB9C9', stroke: '#8F9BB0', 'stroke-width': 2 }, lid); el('rect', { x: 80, y: 28, width: 6, height: 12, rx: 2, fill: pal.ink }, lid);
  const smoke = [0, 1, 2].map(() => el('circle', { r: 8, fill: '#B8C1CE' }));
  const S = 0.85;
  const c = k.buddy({ x: -40, y: FY, scale: S * 0.94, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 10, y: FY, scale: S });
  const mag = g({}); el('line', { x1: 0, y1: 0, x2: 0, y2: 16, stroke: pal.woodDark, 'stroke-width': 5, 'stroke-linecap': 'round' }, mag);
  el('circle', { cx: 0, cy: 30, r: 14, fill: '#DDF1FB', 'fill-opacity': 0.55, stroke: pal.ink, 'stroke-width': 3.5 }, mag);
  const bx = (t) => lerp(10, 186, easeInOut(seg(t, 0.3, 1.4))), cx = (t) => lerp(-40, 128, easeInOut(seg(t, 0.4, 1.5)));
  return {
    update(t) {
      smoke.forEach((s, i) => { const p = (t * 0.6 + i / 3) % 1; tf(s, MX + 96 + 6 * Math.sin(p * 6), MY - 4 - p * 50, 0, 0.6 + p); s.setAttribute('opacity', 0.8 * (1 - p)); });
      lamp.setAttribute('opacity', 0.5 + 0.5 * Math.sin(t * 10));
      const wb = walkTo(bx, t, 10, 1), wc = walkTo(cx, t, -40, 1);
      // ふたを左手で開ける（右端の取っ手を持って左へ回す）
      const open = easeInOut(seg(t, 1.6, 2.2));
      lid.setAttribute('transform', `translate(${MX + 14} ${MY + 20}) scale(${(1 - 0.9 * open).toFixed(3)} 1)`);
      const peer = easeInOut(seg(t, 2.4, 2.9));
      const sweep = Math.sin((t - 2.9) * 2.4) * seg(t, 2.9, 3.2);
      P(b, { ...wb, facing: 1, armR: 30, lean: wb.lean + 10 * peer, look: 0.9, mood: t > 3.2 ? 'open' : 'flat', blink: blinkAt(t) });
      const handleX = MX + 14 + 86 * (1 - 0.9 * open), r1 = reach(b, S, 'R', handleX, MY + 54);
      const r2 = reach(b, S, 'R', MX + 50 + 18 * sweep, MY + 22);
      const armR = t < 1.6 ? lerp(wb.armR, r1, easeInOut(seg(t, 1.3, 1.6))) : t < 2.3 ? r1 : lerp(r1, r2, peer);
      P(b, { ...wb, facing: 1, armR, lean: wb.lean + 10 * peer, look: 0.9, mood: t > 3.2 ? 'open' : 'flat', blink: blinkAt(t) });
      held(k, b, S, mag, 'R', 0, 22); mag.setAttribute('opacity', t > 2.3 ? 1 : 0);
      P(c, { ...wc, facing: 1, look: 0.9, lean: wc.lean + 6 * peer, armR: lerp(wc.armR, 70, peer), mood: 'flat', blink: blinkAt(t, 1) });
    }
  };
}
