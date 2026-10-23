// captain：船長のまめが舵輪を回し、窓の外の港がだんだん近づいて正面に来る（例文 The captain steered the ship into the port.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { reach, P, blinkAt, wear, hp } from './member.js';

export const meta = { duration: 4.4, beats: [[0, '舵輪を握る'], [1.2, '舵を切る'], [3.4, '港に入った']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1, FY = 250;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  // 操舵室の大きな窓。中に海と港
  const WX = 40, WY = 30, WW = 320, WH = 120;
  const view = g({ 'clip-path': k.clip((c) => el('rect', { x: WX, y: WY, width: WW, height: WH, rx: 8 }, c)) });
  el('rect', { x: WX, y: WY, width: WW, height: WH, fill: '#CFE8FA' }, view);
  el('rect', { x: WX, y: WY + 76, width: WW, height: 60, fill: '#6CBFE6' }, view);
  const port = g({}, view);
  el('rect', { x: -90, y: -14, width: 180, height: 14, fill: '#B8AFA4' }, port);
  [[-80, 30, '#F3E6DC'], [-46, 44, '#E4EEF7'], [-10, 26, '#F7EBDD'], [30, 38, '#E6F1E8']].forEach(([x, h, c]) => el('rect', { x, y: -14 - h, width: 30, height: h, fill: c }, port));
  el('rect', { x: 66, y: -60, width: 12, height: 46, fill: '#fff' }, port); el('rect', { x: 66, y: -48, width: 12, height: 8, fill: pal.red }, port); el('rect', { x: 64, y: -66, width: 16, height: 8, fill: pal.yellow }, port);
  el('path', { d: 'M -60 -40 L -60 -90 L -20 -90', stroke: pal.coral, 'stroke-width': 5, fill: 'none' }, port);
  const waves = el('path', { stroke: '#fff', 'stroke-width': 2, fill: 'none', opacity: 0.6 }, view);
  // 船首
  el('path', { d: `M ${WX} ${WY + WH} L 200 ${WY + 92} L ${WX + WW} ${WY + WH} Z`, fill: '#F3F5F8' }, view);
  el('rect', { x: WX - 6, y: WY - 6, width: WW + 12, height: WH + 12, rx: 10, fill: 'none', stroke: '#8FA3B8', 'stroke-width': 8 });
  el('rect', { x: 0, y: 166, width: 400, height: FY - 166, fill: '#D9C3A0' });
  const b = k.buddy({ x: 186, y: FY, scale: S }); wear(k, b, 'cap', '#2B3446');
  // 舵輪
  const CX = 252, CY = 194, R = 28;
  const wh = g({});
  el('rect', { x: CX - 5, y: CY, width: 10, height: FY - CY, fill: pal.woodDark });
  const rim = g({}, wh);
  for (let i = 0; i < 8; i++) el('rect', { x: -2.5, y: -R - 10, width: 5, height: 2 * R + 20, rx: 2.5, fill: pal.woodDark, transform: `rotate(${i * 22.5})` }, rim);
  el('circle', { r: R, fill: 'none', stroke: '#B07A45', 'stroke-width': 7 }, rim);
  el('circle', { r: 8, fill: '#B07A45' }, rim);
  return {
    update(t) {
      const turn = 70 * easeInOut(seg(t, 0.8, 1.8)) - 70 * easeInOut(seg(t, 2.4, 3.4));
      tf(rim, CX, CY, turn);
      const hand = (a) => ({ x: CX + Math.cos(((a + turn) * Math.PI) / 180) * R, y: CY + Math.sin(((a + turn) * Math.PI) / 180) * R });
      const done = t > 3.4;
      P(b, { lean: 6, look: 0.5, blink: blinkAt(t), mood: done ? 'grin' : 'flat', squash: 1 });
      const r = hand(160), l = hand(205);
      b.pose({ armR: reach(b, S, 'R', r.x, r.y), armL: reach(b, S, 'L', l.x, l.y) });
      // 港：右から正面へ、近づくほど大きく
      const q = easeInOut(seg(t, 0.6, 3.8));
      tf(port, lerp(330, 200, q), WY + 82, 0, lerp(0.45, 1.05, q));
      const ph = t * 40;
      k.set(waves, { d: `M ${WX - 40 + (ph % 40)} ${WY + 98} q 10 -4 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0` });
    }
  };
}
