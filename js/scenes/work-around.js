// work around：通行止めの道の前で止まり、別の道（高架の迂回路）を通って向こう側へ抜ける（例文 We worked around the problem by using another road.）
import { seg, lerp, easeInOut, easeOut, wobble } from '../ease.js';
import { streetBg } from './weigh.js';

// 共有ヘルパ：横向きの小型車（原点＝車体下中央）。heads=[[color,dark],...] で窓に乗員の頭。wheel(rot) で車輪回転
export function car(k, color, heads = []) {
  const { el, g, pal } = k;
  const c = g({});
  const body = g({}, c);
  el('path', { d: 'M -46 -10 L -46 -26 Q -44 -32 -36 -32 L -24 -32 L -12 -50 L 22 -50 L 34 -32 L 42 -30 Q 48 -28 48 -20 L 48 -10 Z', fill: color }, body);
  el('path', { d: 'M -8 -46 L 18 -46 L 27 -33 L -8 -33 Z', fill: '#CFE9F7' }, body);
  el('path', { d: 'M -20 -33 L -11 -46 L -12 -33 Z', fill: '#CFE9F7' }, body);
  heads.forEach(([hc, hd], i) => {
    const hx = 10 - i * 14;
    el('circle', { cx: hx, cy: -36, r: 8, fill: hc, stroke: hd, 'stroke-width': 1.5 }, body);
    el('circle', { cx: hx + 3, cy: -38, r: 1.4, fill: pal.ink }, body);
  });
  el('rect', { x: 40, y: -26, width: 7, height: 5, rx: 2, fill: pal.yellow }, body);
  el('rect', { x: -46, y: -18, width: 94, height: 4, fill: '#fff', opacity: 0.35 }, body);
  const wheels = [-28, 30].map((x) => { const w = g({}, c); el('circle', { r: 10, fill: pal.ink }, w); el('circle', { r: 4, fill: '#B9C3D0' }, w); el('rect', { x: -1, y: -9, width: 2, height: 6, fill: '#B9C3D0' }, w); return [w, x]; });
  return { g: c, body, wheel(rot, bounce = 0) { wheels.forEach(([w, x]) => k.tf(w, x, -8, rot)); k.tf(body, 0, bounce); } };
}

export const meta = { duration: 4.6, beats: [[0, '通行止め'], [1.4, '別の道へ'], [3.8, '向こうへ抜けた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 240);
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#D5DBE3' });
  for (let x = 10; x < 400; x += 40) el('rect', { x, y: FY + 22, width: 20, height: 3, fill: '#fff' });
  // 高架の迂回路
  const yOf = (x) => x < 80 ? FY : x < 180 ? FY - 44 * easeInOut((x - 80) / 100) : x < 280 ? FY - 44 : x < 380 ? FY - 44 * (1 - easeInOut((x - 280) / 100)) : FY;
  let d = 'M 80 ' + FY;
  for (let x = 80; x <= 380; x += 5) d += ` L ${x} ${yOf(x).toFixed(1)}`;
  el('path', { d: d + ` L 350 ${FY + 2} Z`, fill: 'none' });
  [195, 265].forEach((x) => el('rect', { x: x - 5, y: FY - 44, width: 10, height: 44, fill: '#B9C3D0' }));
  el('path', { d, stroke: '#9AA6B6', 'stroke-width': 9, fill: 'none', 'stroke-linejoin': 'round' });
  el('path', { d, stroke: '#C3CBD6', 'stroke-width': 3, fill: 'none', transform: 'translate(0 -5)' });
  // 通行止め（下の道）
  const bar = g({}); tf(bar, 232, FY);
  k.shadow(0, 0, 30, 4, bar);
  [-22, 22].forEach((x) => el('rect', { x: x - 2, y: -26, width: 4, height: 26, fill: pal.sub }, bar));
  el('rect', { x: -28, y: -26, width: 56, height: 11, rx: 2, fill: '#fff', stroke: pal.red, 'stroke-width': 2 }, bar);
  for (let i = 0; i < 4; i++) el('path', { d: `M ${-24 + i * 14} -15 l 7 -11 h 6 l -7 11 Z`, fill: pal.red }, bar);
  el('path', { d: `M 258 ${FY} l 7 -20 h 4 l 7 20 Z`, fill: '#FF9A3D' });
  const C = car(k, pal.blue, [[pal.mint, pal.mintDark], [pal.coral, pal.coralDark]]);
  const xf = (t) => t < 1.3 ? lerp(-50, 40, easeOut(seg(t, 0.1, 1.3))) : lerp(40, 460, easeInOut(seg(t, 1.6, 4.4)));
  return {
    update(t) {
      const x = xf(t), y = yOf(x), sl = Math.atan2(yOf(x + 20) - yOf(x - 20), 40) * 57.3;
      const brake = wobble(seg(t, 1.25, 1.9), 2, 5);
      C.wheel(x * 3.8, -1.2 * Math.abs(Math.sin(x * 0.2)) * (t > 1.6 ? 1 : 0));
      tf(C.g, x, y, sl + brake * 2.5, 0.8);
    }
  };
}
