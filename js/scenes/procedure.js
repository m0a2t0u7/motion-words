// procedure：ヘルメットのまめが、安全手順を1→2→3と確かめてから機械のスイッチを押す（例文 Follow the safety procedure before using the machine.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, hat, hp } from './look-over.js';
import { reach } from './dig.js';

export const meta = { duration: 4.6, beats: [[0, '手順を見る'], [1.8, '順に確認'], [3.6, '機械を使う']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const bd = g({});
  el('rect', { x: 20, y: 40, width: 100, height: 108, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 3 }, bd);
  const chk = [0, 1, 2].map((i) => {
    const y = 66 + i * 32;
    el('circle', { cx: 44, cy: y, r: 11, fill: pal.blue }, bd);
    k.text(44, y, String(i + 1), { 'font-size': 14, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, bd);
    el('line', { x1: 62, x2: 98, y1: y, y2: y, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }, bd);
    return el('path', { d: `M 88 ${y} l 5 6 l 11 -13`, fill: 'none', stroke: pal.green, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, bd);
  });
  const m = g({});
  k.shadow(320, FY + 2, 48, 6);
  el('rect', { x: 270, y: FY - 100, width: 100, height: 100, rx: 8, fill: '#9AA9BD', stroke: pal.line, 'stroke-width': 2 }, m);
  el('rect', { x: 284, y: FY - 88, width: 46, height: 30, rx: 4, fill: '#E4EDF6' }, m);
  const lamp = el('circle', { cx: 350, cy: FY - 76, r: 7, fill: '#C8CED6' }, m);
  const btn = el('circle', { cx: 350, cy: FY - 52, r: 9, fill: pal.coral, stroke: pal.coralDark, 'stroke-width': 3 }, m);
  const gear = g({}); tf(gear, 307, FY - 73);
  el('circle', { r: 9, fill: 'none', stroke: pal.sub, 'stroke-width': 4, 'stroke-dasharray': '4 3' }, gear);
  const b = k.buddy({ x: 70, y: FY, scale: S });
  hat(k, b, pal.yellow, pal.yellowDark);
  const xf = (t) => lerp(160, 244, easeInOut(seg(t, 2.6, 3.6))) + (t < 2.6 ? 0 : 0);
  return {
    update(t) {
      const w = walkTo(t < 2.6 ? () => 160 : xf, t, 160);
      const tx = 350, ty = FY - 52, press = seg(t, 3.7, 3.9) - seg(t, 4.0, 4.2);
      P(b, { x: 150 + (w.x - 160), walk: w.walk, armL: w.armL, armR: w.armR, lean: w.lean, facing: 1, look: 0.4, mood: 'smile', blink: blinkAt(t) });
      chk.forEach((c, i) => c.setAttribute('opacity', t > 0.8 + i * 0.6 ? 1 : 0));
      if (t > 3.4) { const a = reach(b, S, 'R', tx - 12 * press, ty); b.pose({ armR: a, lean: 6 }); }
      const on = seg(t, 3.9, 4.1);
      lamp.setAttribute('fill', on > 0.5 ? pal.green : '#C8CED6');
      tf(gear, 307, FY - 73, t * 140 * on);
      tf(btn, 0, press * 2);
    }
  };
}
