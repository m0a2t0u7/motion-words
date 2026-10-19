// health：野菜をしっかり食べ、夜はぐっすり眠る。そのたびに健康のハートが満ちて、朝は元気いっぱい（例文 Eating well and sleeping enough are good for your health.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble, backOut } from '../ease.js';
import { P, reach, hp, lying, bed } from './hospital.js';
import { table } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, 'よく食べる'], [1.5, 'よく眠る'], [3.0, '健康になる']] };

const HEART = 'M 0 12 C -22 -2 -16 -22 0 -10 C 16 -22 22 -2 0 12 Z';

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // ① 食事
  const A = g({});
  const sA = k.g({}, A);
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#F6F3EE' }, sA);
  el('rect', { x: 196, y: 178, width: 204, height: 28, fill: '#F2DDBB' }, A);
  el('rect', { x: 196, y: 206, width: 204, height: 14, fill: pal.wood }, A);
  el('rect', { x: 204, y: 220, width: 8, height: 16, fill: pal.woodDark }, A);
  el('path', { d: 'M 222 184 Q 250 206 278 184 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, A);
  [[234, 182, pal.green], [246, 179, '#7FD3A0'], [258, 182, pal.green], [244, 186, pal.red], [264, 185, '#F2A65A']].forEach(([x, y, c]) => el('circle', { cx: x, cy: y, r: 6, fill: c }, A));
  el('path', { d: 'M 300 186 h 30 l -3 -26 h -24 Z', fill: '#fff', stroke: '#B9CBDD', 'stroke-width': 2 }, A);
  el('rect', { x: 304, y: 168, width: 22, height: 16, fill: pal.water }, A);
  const eater = k.buddy({ x: 150, y: FY, scale: 0.95, parent: A });
  const fork = el('circle', { r: 5, fill: pal.green }, A);
  // ② 睡眠（夜）
  const B = g({});
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#3E4870' }, B);
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#59618A' }, B);
  el('rect', { x: 40, y: 40, width: 80, height: 62, rx: 6, fill: '#28304F', stroke: '#6C76A0', 'stroke-width': 5 }, B);
  el('circle', { cx: 92, cy: 64, r: 12, fill: '#FFF3C4' }, B);
  el('circle', { cx: 98, cy: 60, r: 10, fill: '#28304F' }, B);
  const bedG = g({}, B);
  const rootSave = k.root;
  const bd = (() => { const n = g({}, B); return n; })();
  const BX = 140, MT = FY - 52;
  k.shadow(BX + 100, FY + 1, 106, 4, bd);
  el('rect', { x: BX + 188, y: MT - 50, width: 12, height: 100, rx: 5, fill: pal.woodDark }, bd);
  el('rect', { x: BX, y: MT + 12, width: 200, height: 24, rx: 5, fill: pal.wood }, bd);
  el('rect', { x: BX + 2, y: MT, width: 188, height: 16, rx: 7, fill: '#F4F8FC' }, bd);
  el('ellipse', { cx: BX + 156, cy: MT - 4, rx: 30, ry: 11, fill: '#fff' }, bd);
  const Lg = g({}, B);
  const sleeper = k.buddy({ parent: Lg, x: 0, y: 0, scale: 1 });
  sleeper.g.firstChild.setAttribute('display', 'none');
  tf(Lg, BX + 92, MT - 15, 90, 0.62);
  el('rect', { x: BX + 6, y: MT - 30, width: 110, height: 44, rx: 12, fill: pal.violet }, B);
  const zz = g({}, B);
  ['Z', 'z'].forEach((s, i) => k.text(i * 13, -i * 15, s, { 'font-size': 20 - i * 5, fill: '#fff' }, zz));
  // ③ 元気な朝
  const C = g({});
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#EAF6FB' }, C);
  el('circle', { cx: 330, cy: 70, r: 26, fill: pal.yellow }, C);
  const fit = k.buddy({ x: 140, y: FY, scale: 1.0, parent: C });
  // 健康のハート（ずっと表示）
  const H = g({}); tf(H, 352, 168);
  el('path', { d: HEART, fill: '#fff', stroke: pal.red, 'stroke-width': 3, transform: 'scale(1.5)' }, H);
  const fillCp = k.clip((c) => el('path', { d: HEART, transform: 'scale(1.5)' }, c));
  const fg = g({ 'clip-path': fillCp }, H);
  const lvl = el('rect', { x: -40, width: 80, height: 60, fill: pal.red }, fg);
  const plus = [0, 1].map(() => k.text(0, 0, '+', { 'font-size': 22, fill: pal.green }));
  const spark = [0, 1, 2, 3].map(() => el('path', { d: 'M 0 -7 L 2 -2 L 7 0 L 2 2 L 0 7 L -2 2 L -7 0 L -2 -2 Z', fill: pal.yellow }));
  return {
    update(t) {
      const a = 1 - seg(t, 1.3, 1.6), c = seg(t, 2.8, 3.1), bOp = Math.min(1 - a, 1 - c);
      A.setAttribute('opacity', a); B.setAttribute('opacity', bOp); C.setAttribute('opacity', c);
      // 食べる：野菜をフォークで口へ（2回）
      const e = Math.max(hump(seg(t, 0.15, 0.7)), hump(seg(t, 0.7, 1.25)));
      const bowl = { x: 246, y: 180 }, mouth = { x: 168, y: FY - 52 };
      const tgt = { x: lerp(bowl.x, mouth.x + 6, e), y: lerp(bowl.y, mouth.y, e) };
      P(eater, { look: 0.6, mood: e > 0.7 ? 'open' : 'grin' });
      P(eater, { ...eater.state, armR: reach(eater, 0.95, 'R', tgt.x, tgt.y) });
      const h = hp(eater, 0.95, 'R', 28); tf(fork, h.x + 4, h.y - 3); fork.setAttribute('opacity', e > 0.15 && e < 0.92 ? 1 : 0);
      // 眠る
      P(sleeper, { blink: 1, mood: 'smile', squash: 1 + 0.03 * Math.sin(t * 4) });
      tf(zz, BX + 160, MT - 40 - 6 * Math.sin(t * 3));
      // 朝：のびをして跳ねる
      const j = seg(t, 3.2, 4.2), jump = hump(seg(t, 3.4, 3.85));
      P(fit, { armL: lerp(8, 160, easeOut(seg(t, 3.0, 3.4))), armR: lerp(8, 160, easeOut(seg(t, 3.0, 3.4))), mood: 'grin', lift: 26 * jump, squash: 1 - 0.08 * hump(seg(t, 3.2, 3.4)) - 0.06 * hump(seg(t, 3.85, 4.05)), look: 0.3 });
      // ハートの水位：食べて・眠って上がる
      const f = 0.08 + 0.38 * easeOut(seg(t, 0.5, 1.3)) + 0.32 * easeOut(seg(t, 1.9, 2.7)) + 0.22 * easeOut(seg(t, 3.0, 3.4));
      k.set(lvl, { y: 18 - 52 * f });
      const beat = 1 + 0.08 * hump(seg((t % 0.8), 0, 0.25)) * seg(t, 3.0, 3.3);
      tf(H, 352, 168, 0, beat);
      plus.forEach((p, i) => { const q = seg(t, i ? 2.0 : 0.6, i ? 2.7 : 1.3); tf(p, 380, 150 - 24 * q); p.setAttribute('opacity', hump(q)); });
      spark.forEach((s, i) => { const q = seg(t, 3.3 + i * 0.12, 4.0 + i * 0.1), an = i * 1.57 + 0.6; tf(s, 352 + Math.cos(an) * (24 + 18 * q), 168 + Math.sin(an) * (24 + 18 * q), q * 90, hump(q) + 0.001); });
    }
  };
}
