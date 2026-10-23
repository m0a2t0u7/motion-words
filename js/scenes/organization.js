// organization：ハートの印の健康団体。同じベストの仲間が集まって線でつながり、まめが来た人に救急セットを手渡す（例文 She works for a health organization.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hp, aim, walkTo, path, person, scene, wear, heart } from './confused.js';

export const meta = { duration: 4.4, beats: [[0.0, '健康の団体'], [1.34, '仲間とつながる'], [2.87, '人を助ける']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const { FY } = scene(k);
  // 団体のテントとロゴ
  el('path', { d: `M 20 ${FY - 150} L 200 ${FY - 150} L 220 ${FY - 116} L 0 ${FY - 116} Z`, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  [20, 196].forEach((x) => el('rect', { x, y: FY - 116, width: 5, height: 116, fill: pal.sub }));
  const logo = (parent, s = 1) => { const n = g({}, parent); el('circle', { r: 12, fill: pal.green }, n); el('path', { d: 'M 0 7 C -10 0 -7 -8 0 -3 C 7 -8 10 0 0 7 Z', fill: '#fff' }, n); tf(n, 0, 0, 0, s); return n; };
  const big = logo(); tf(big, 110, FY - 133, 0, 1.1);
  const X = [50, 110, 170];
  const team = X.map((x, i) => person(k, ['coral', 'blue', 'yellow'][i], { x, y: FY, scale: S }));
  const b = k.buddy({ x: 250, y: FY, scale: S, facing: -1 });
  [...team, b].forEach((p) => { const w = wear(k, p); el('path', { d: 'M -26 -40 L 26 -40 L 24 -4 L -24 -4 Z', fill: '#B6E3C2', opacity: 0.9 }, w); const l = logo(w, 0.6); tf(l, 0, -24, 0, 0.6); });
  // つながりの線
  const lines = [...X, 250].map(() => el('line', { stroke: pal.green, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: 0 }));
  const vis = person(k, 'violet', { x: 460, y: FY, scale: 0.9, facing: -1 });
  const kit = g({});
  el('rect', { x: -13, y: -2, width: 26, height: 20, rx: 3, fill: '#fff', stroke: pal.green, 'stroke-width': 2 }, kit);
  el('path', { d: 'M -4 -2 v -4 h 8 v 4', stroke: pal.green, 'stroke-width': 2, fill: 'none' }, kit);
  el('path', { d: 'M 0 14 C -7 9 -5 3 0 6 C 5 3 7 9 0 14 Z', fill: pal.green }, kit);
  const hs = [0, 1].map(() => heart(k));
  const vx = path([[1.8, 460], [3.0, 350]]);
  return {
    update(t) {
      t *= 4.6 / 4.4; // 4.4 秒に収める
      X.forEach((x, i) => P(team[i], { x, look: 0.5, blink: blinkAt(t, i), mood: 'smile', armR: 8 + 30 * hump(seg(t, 1.0 + i * 0.2, 1.6 + i * 0.2)) }));
      lines.forEach((l, i) => { const q = easeOut(seg(t, 0.8 + i * 0.2, 1.3 + i * 0.2)); const x = [...X, 250][i];
        k.set(l, { x1: 110, y1: FY - 120, x2: lerp(110, x, q), y2: lerp(FY - 120, FY - 86, q), opacity: q > 0 ? 1 : 0 }); });
      const w = walkTo(vx, t, 460, -1);
      P(vis, { x: w.x, walk: w.walk, facing: -1, armL: w.armL, armR: t > 3.3 ? 60 : w.armR, lean: w.lean, mood: t > 3.6 ? 'grin' : 'sad', look: 0.5, blink: blinkAt(t, 3) });
      const out = easeInOut(seg(t, 2.6, 3.1)), give = seg(t, 3.3, 3.7);
      P(b, { x: lerp(250, 290, out) , walk: out * 6, facing: t > 2.5 ? 1 : -1, look: 0.5, mood: 'grin', blink: blinkAt(t), armR: 8, armL: 8 });
      if (t > 2.9) aim(b, S, 'R', lerp(300, 322, give), FY - 52);
      const kh = give < 1 ? hp(b, S, 'R') : hp(vis, 0.9, 'R');
      if (t > 3.3) aim(vis, 0.9, 'R', 325, FY - 52);
      tf(kit, kh.x, kh.y - 4, 0, t > 2.7 ? 1 : 0.001);
      hs.forEach((n, i) => { const q = seg(t, 3.7 + i * 0.25, 4.6); tf(n, 300 + i * 40, FY - 110 - 20 * q, 0, q > 0 ? 1.2 * hump(q * 0.7 + 0.3) : 0.001); });
    }
  };
}
