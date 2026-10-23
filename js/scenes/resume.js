// resume：まめが履歴書を封筒に入れ、郵便ポストへ入れて送る（例文 Please send your resume by Friday.）
import { seg, lerp, easeOut, easeInOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg } from './look-over.js';
import { held } from './dig.js';
import { reach } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '履歴書を持つ'], [1.2, '封筒に入れる'], [3.2, 'ポストへ送る']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'home', 240);
  el('rect', { x: 150, y: 50, width: 56, height: 52, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  el('rect', { x: 150, y: 50, width: 56, height: 14, rx: 5, fill: pal.coral });
  k.text(178, 61, '金', { 'font-size': 11, fill: '#fff', 'text-anchor': 'middle' });
  el('circle', { cx: 178, cy: 84, r: 12, fill: 'none', stroke: pal.red, 'stroke-width': 3 });
  const mx = 330;
  el('rect', { x: mx - 4, y: FY - 20, width: 8, height: 20, fill: pal.sub });
  el('rect', { x: mx - 24, y: FY - 78, width: 48, height: 62, rx: 12, fill: pal.red });
  el('rect', { x: mx - 14, y: FY - 62, width: 28, height: 5, rx: 2, fill: '#7A1F1F' });
  const b = k.buddy({ x: 30, y: FY, scale: S });
  const doc = g({});
  el('rect', { x: -16, y: -22, width: 32, height: 44, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, doc);
  el('rect', { x: -11, y: -17, width: 11, height: 13, rx: 1, fill: pal.blue }, doc);
  [-17, -10, -3].forEach((y) => el('line', { x1: 3, x2: 11, y1: y, y2: y, stroke: pal.sub, 'stroke-width': 1.8 }, doc));
  [4, 11, 17].forEach((y) => el('line', { x1: -11, x2: 11, y1: y, y2: y, stroke: pal.sub, 'stroke-width': 1.8 }, doc));
  const env = g({});
  el('rect', { x: -20, y: -13, width: 40, height: 26, rx: 2, fill: '#F7EBD0', stroke: '#E2CC9C', 'stroke-width': 1.5 }, env);
  el('path', { d: 'M -20 -13 L 0 3 L 20 -13', fill: 'none', stroke: '#E2CC9C', 'stroke-width': 1.5 }, env);
  return {
    update(t) {
      const ins = easeInOut(seg(t, 1.2, 2.2)), pst = seg(t, 3.1, 3.9);
      const w = walkTo((u) => lerp(30, 268, easeInOut(seg(u, 2.2, 3.4))), t, 30);
      P(b, { x: w.x, walk: w.walk, armL: w.armL, armR: 70, lean: w.lean, facing: 1, look: 0.4, mood: t > 3.9 ? 'grin' : 'smile', blink: blinkAt(t) });
      b.pose({ armR: lerp(70, 105, easeOut(pst)) });
      const ph = held(k, b, S, doc, 'R', 0, 8);
      // 履歴書は封筒に入り、封筒を持ってポストの口へ
      const dy = lerp(0, 24, ins);
      tf(doc, ph.x, ph.y - 6 + dy, 0, S, S);
      tf(env, ph.x, ph.y + 14, 0, S, S);
      doc.setAttribute('opacity', 1 - seg(t, 2.1, 2.2));
      env.setAttribute('opacity', seg(t, 1.2, 1.3) * (1 - seg(t, 3.85, 3.9)));
    }
  };
}
