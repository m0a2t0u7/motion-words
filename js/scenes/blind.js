// blind：窓の横のチェーンを手でたぐって、ブラインドを下まで下ろす（例文 She pulled down the blind.）
import { seg, lerp, easeInOut, easeOut, wobble, clamp } from '../ease.js';
import { hp, reach } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { homeBg } from './furniture.js';

export const meta = { duration: 4.2, beats: [[0, '明るい窓'], [1.0, 'チェーンを引く'], [3.4, '下ろした']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const WX = 92, WY = 46, WW = 150, WH = 128, CX = WX + WW + 14;
  const FY = homeBg(k, { winW: 0 });
  // 窓（外の景色）
  el('rect', { x: WX, y: WY, width: WW, height: WH, rx: 4, fill: '#CFE9FA', stroke: '#fff', 'stroke-width': 6 });
  el('circle', { cx: WX + 112, cy: WY + 34, r: 14, fill: pal.yellow });
  el('path', { d: `M ${WX} ${WY + WH} L ${WX} ${WY + 92} Q ${WX + 40} ${WY + 76} ${WX + 80} ${WY + 94} T ${WX + WW} ${WY + 88} L ${WX + WW} ${WY + WH} Z`, fill: '#A9DDB5' });
  el('line', { x1: WX + WW / 2, y1: WY, x2: WX + WW / 2, y2: WY + WH, stroke: '#fff', 'stroke-width': 5 });
  el('rect', { x: WX - 8, y: WY + WH, width: WW + 16, height: 7, rx: 2, fill: '#fff' });
  // 床に差す光
  const beam = el('path', { d: `M ${WX + 10} ${FY + 4} L ${WX + WW - 10} ${FY + 4} L ${WX + WW + 40} 296 L ${WX - 30} 296 Z`, fill: '#FFF6C9' });
  // ブラインド（上から下りる布）
  const cp = k.clip((c) => el('rect', { x: WX - 6, y: WY - 6, width: WW + 12, height: WH + 10 }, c));
  const cloth = g({ 'clip-path': cp });
  const panel = el('rect', { x: WX - 6, y: WY - 6, width: WW + 12, height: 10, fill: '#F2E3C6' }, cloth);
  const lines = g({}, cloth);
  for (let i = 0; i < 16; i++) el('line', { x1: WX - 6, y1: WY + i * 9, x2: WX + WW + 6, y2: WY + i * 9, stroke: '#E2CDA6', 'stroke-width': 1.5 }, lines);
  const bar = el('rect', { x: WX - 8, y: 0, width: WW + 16, height: 6, rx: 3, fill: pal.woodDark });
  el('rect', { x: WX - 12, y: WY - 14, width: WW + 24, height: 12, rx: 5, fill: '#E9D6B3', stroke: pal.woodDark, 'stroke-width': 1.5 });
  // チェーン（輪になって垂れている）
  const BOT = 214;
  el('path', { d: `M ${CX - 3} ${WY - 6} L ${CX - 3} ${BOT} Q ${CX} ${BOT + 6} ${CX + 3} ${BOT} L ${CX + 3} ${WY - 6}`, fill: 'none', stroke: '#B8C0CC', 'stroke-width': 1.4 });
  const beads = [];
  for (let i = 0; i < 40; i++) beads.push(el('circle', { r: 1.9, fill: pal.sub }));
  const dark = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#2A3242', opacity: 0 });
  const b = k.buddy({ x: CX + 26, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  // 3回たぐる：各回 0〜0.2 つかむ / 0.2〜0.8 引く / 0.8〜1 手を戻す
  const T0 = 0.7, D = 0.85, N = 3, TOP = 156, LOW = 204;
  const pulled = (t) => {
    let s = 0;
    for (let i = 0; i < N; i++) s += easeInOut(seg(t, T0 + i * D + 0.2 * D, T0 + i * D + 0.8 * D));
    return s / N;
  };
  return {
    update(t) {
      const p = pulled(t), H = lerp(8, WH + 6, p);
      k.set(panel, { height: H });
      tf(lines, 0, H - WH - 4);
      k.set(bar, { y: WY - 6 + H - 3 });
      k.set(beam, { opacity: 1 - 0.9 * p });
      k.set(dark, { opacity: 0.1 * p });
      const L = BOT - WY + 6, off = p * 150;
      beads.forEach((d, i) => {
        const front = i < 20, base = (i % 20) * (L / 20);
        const yy = WY - 6 + (((front ? base + off : base - off) % L) + L) % L;
        k.set(d, { cx: front ? CX - 3 : CX + 3, cy: yy });
      });
      // 手の目標：つかむ→引き下ろす→放して上へ
      const i = clamp(Math.floor((t - T0) / D), 0, N - 1), u = clamp((t - T0 - i * D) / D);
      let hy, hx = CX - 3, active = t > T0 && t < T0 + N * D;
      if (u < 0.2) hy = lerp(i === 0 ? 196 : LOW, TOP, easeOut(u / 0.2));
      else if (u < 0.8) hy = lerp(TOP, LOW, easeInOut((u - 0.2) / 0.6));
      else hy = lerp(LOW, TOP, easeInOut((u - 0.8) / 0.2));
      if (u >= 0.8 || u < 0.2) hx -= 7;
      if (!active) { hx = CX - 8; hy = t < T0 ? lerp(220, 196, easeOut(seg(t, 0.3, T0))) : lerp(LOW, 222, easeInOut(seg(t, T0 + N * D, T0 + N * D + 0.4))); }
      const done = seg(t, 3.5, 3.9);
      P(b, { x: CX + 26, facing: -1, look: lerp(-0.2, -0.7, clamp(t)), lean: 4, mood: done > 0 ? 'grin' : 'flat', blink: blinkAt(t) });
      const a = reach(b, S, 'R', hx, hy);
      P(b, { x: CX + 26, facing: -1, look: done > 0 ? 0.3 : -0.5, lean: 4 - 3 * done, mood: done > 0 ? 'grin' : 'flat', blink: blinkAt(t), armR: a, armL: 10, squash: 1 - 0.03 * Math.sin(u * Math.PI) });
    }
  };
}
