// boss：夕方、帰ろうとしたまめに上司が「もう少し残って」と頼む。時計が進み、外は暗くなっても机で仕事（例文 My boss asked me to stay late.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, hp, P, blinkAt, walkTo, path, wear, deskFront } from './member.js';
import { monitor } from './get-on-with.js';
import { papers } from './hand-over.js';
import { cue } from './in-common.js';
import { bagProp } from './bag.js';

export const meta = { duration: 4.4, beats: [[0, '帰ろうとする'], [1.2, '残ってと頼まれる'], [3.0, '夜まで残業']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 14, width: 400, height: 14, fill: '#ECE6DC' });
  // 窓の外：夕方 → 夜
  el('rect', { x: 30, y: 40, width: 110, height: 76, rx: 6, fill: '#FCD9B8', stroke: '#fff', 'stroke-width': 5 });
  const night = el('rect', { x: 32.5, y: 42.5, width: 105, height: 71, rx: 4, fill: '#2B3A63' });
  const moon = el('circle', { cx: 112, cy: 62, r: 9, fill: '#FFF2B8' });
  // 時計
  el('circle', { cx: 300, cy: 64, r: 22, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 });
  const hh = el('line', { x1: 300, y1: 64, x2: 300, y2: 52, stroke: pal.ink, 'stroke-width': 3, 'stroke-linecap': 'round' });
  el('line', { x1: 300, y1: 64, x2: 300, y2: 47, stroke: pal.ink, 'stroke-width': 2, 'stroke-linecap': 'round' });
  const b = k.buddy({ x: 176, y: FY, scale: S, facing: -1 });
  const bag = bagProp(k, k.root, '#5C7FD6', '#3F60B5', 26, 24);
  const boss = k.buddy({ x: 330, y: FY, scale: 1.05, facing: -1, ...CO(k) }); wear(k, boss, 'tie', pal.blueDark);
  deskFront(k, 100, 120, FY - 46, FY);
  monitor(k, 124, FY - 46);
  const pp = papers(k, 3); 
  const ask = cue(k, 'Stay late?', 86, 30, -1, 13);
  const bx = path([[0.2, 176], [0.9, 62]]), ox = path([[0.3, 330], [1.2, 250]]), back = path([[2.0, 62], [2.6, 176]]);
  return {
    update(t) {
      const xf = t < 1.9 ? bx : back;
      const w = walkTo(xf, t, t < 1.9 ? 176 : 62, t < 1.9 ? -1 : 1);
      const turn = t > 1.0 && t < 2.0;
      P(b, { x: w.x, walk: w.walk, armL: w.armL, armR: 20, lean: w.lean, facing: turn ? 1 : t >= 2.6 ? -1 : w.facing, blink: blinkAt(t), look: turn ? 0.6 : 0.4, mood: t > 1.3 ? 'sad' : 'smile', squash: t > 1.5 && t < 2.0 ? 0.96 : 1 });
      const hl = hp(b, S, 'R', 28); tf(bag, hl.x, hl.y - 2, 0, S); bag.setAttribute('opacity', t < 2.4 ? 1 : 0);
      if (t > 2.6) b.pose({ armR: 70 + 10 * Math.abs(Math.sin(t * 10)), armL: 60, lean: 8, look: 0.2, mood: 'flat' });
      const o = walkTo(ox, t, 330, -1);
      P(boss, { x: o.x, walk: o.walk, armL: o.armL, armR: 8 + 70 * hump(seg(t, 1.1, 2.2)), lean: o.lean, facing: t > 2.8 ? 1 : -1, blink: blinkAt(t, 1), look: 0.6, mood: t > 1.2 && t < 2.0 ? 'open' : 'smile' });
      ask.show(seg(t, 1.2, 1.5) - seg(t, 2.3, 2.5), o.x - 40, 108);
      // 時計が進み（5時→8時）、窓が夜になる
      const late = easeInOut(seg(t, 2.6, 4.2));
      hh.setAttribute('transform', `rotate(${150 + 90 * late} 300 64)`);
      night.setAttribute('opacity', late); moon.setAttribute('opacity', late);
      tf(pp, 206, FY - 46);
    }
  };
}
