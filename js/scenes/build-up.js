// build up：まめが毎日ダンベルを持ち上げ、日がたつにつれて重いものを持てるようになる（例文 He built up his strength with daily exercise.）
import { seg, lerp, easeInOut, easeOut, wobble, clamp } from '../ease.js';
import { held } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '軽いダンベル'], [1.8, '毎日きたえる'], [3.6, '力がついた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: 228, width: 400, height: 12, fill: '#DCE3EC' });
  // カレンダー（日付が進む）
  el('rect', { x: 300, y: 50, width: 66, height: 62, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 300, y: 50, width: 66, height: 14, rx: 6, fill: pal.blue });
  const day = k.text(333, 90, '1', { 'font-size': 26 });
  // 力の目盛り（積み上がる）
  const bars = Array.from({ length: 6 }, (_, i) => el('rect', { x: 316, y: 214 - i * 16, width: 34, height: 12, rx: 3, fill: pal.mint, opacity: 0 }));
  el('rect', { x: 312, y: 116, width: 42, height: 114, rx: 5, fill: 'none', stroke: pal.line, 'stroke-width': 2 });
  const B = k.buddy({ x: 170, y: FY, scale: 1.0 });
  // ダンベル（握り＝原点）：プレートが日ごとに大きくなる
  const db = (side) => { const n = g({}); el('rect', { x: -2.5, y: -16, width: 5, height: 32, rx: 2, fill: '#8C96A8' }, n); const pl = [-1, 1].map((s) => el('rect', { x: -9, y: s * 14 - 4, width: 18, height: 8, rx: 3, fill: pal.ink }, n)); return { n, pl }; };
  const dL = db('L'), dR = db('R');
  const REPS = [0.3, 1.1, 1.9, 2.7, 3.4];
  return {
    update(t) {
      // 5回（5日）持ち上げる。回数ごとにプレートが大きくなり、体が少したくましくなる
      let lift = 0, k0 = 0;
      REPS.forEach((s, i) => { const u = seg(t, s, s + 0.7); if (t >= s) k0 = i; lift = Math.max(lift, Math.sin(u * Math.PI)); });
      const lvl = clamp(seg(t, 0.3, 4.0));
      day.textContent = String(1 + Math.floor(lvl * 29));
      bars.forEach((b, i) => b.setAttribute('opacity', lvl * 6 > i + 0.3 ? 1 : 0));
      const strain = (1 - lvl) * 0.5;
      const arm = lerp(20, 165, easeInOut(lift));
      B.pose({ armL: arm, armR: arm, squash: 1 - 0.05 * lift * (1 - lvl) + 0.02 * lvl, mood: lift > 0.3 ? (lvl > 0.7 ? 'grin' : 'flat') : 'smile', lean: 0, look: 0, lift: 0 });
      B.body.setAttribute('transform', B.body.getAttribute('transform') + ` scale(${1 + 0.08 * lvl} 1)`);
      const s = lerp(0.75, 1.2, lvl);
      [dL, dR].forEach((d, i) => {
        held(k, B, 1, d.n, i ? 'R' : 'L', 90);
        d.n.setAttribute('transform', d.n.getAttribute('transform') + ` scale(1 ${1})`);
        d.pl.forEach((p, j) => k.set(p, { x: -9 * s, width: 18 * s, height: 8 * s, y: (j ? 1 : -1) * 14 - 4 * s }));
      });
      // 腕の太さもじわじわ増す
      [B.armL.a, B.armR.a].forEach((a) => a.firstChild.setAttribute('stroke-width', 9 + 4 * lvl));
    }
  };
}
