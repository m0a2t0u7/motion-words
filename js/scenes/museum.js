// museum：科学博物館。天井の惑星模型やロケットを、2人が見上げて指さす（例文 We visited the science museum.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, signBoard } from './restaurant.js';
import { gait } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '博物館へ'], [1.6, '見上げる'], [3.0, '科学の展示']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 240;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#E8EEF6' });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#D5DCE6' });
  for (let x = 0; x < 400; x += 50) el('line', { x1: x, y1: FY, x2: x - 20, y2: 300, stroke: '#C6CFDB', 'stroke-width': 1.5 });
  [40, 360].forEach((x) => el('rect', { x: x - 10, y: 0, width: 20, height: FY, fill: '#F6F8FB' }));
  signBoard(k, 200, 22, 120, 22, 'SCIENCE', '#4A8BE0', '#fff', 12);
  // 原子のマーク
  const atom = g({}); tf(atom, 84, 70);
  [0, 60, 120].forEach((r) => el('ellipse', { cx: 0, cy: 0, rx: 18, ry: 7, fill: 'none', stroke: pal.violet, 'stroke-width': 2.4, transform: `rotate(${r})` }, atom));
  el('circle', { r: 4, fill: pal.coral }, atom);
  // つり下げた土星の模型（ゆっくり回る）
  el('line', { x1: 220, y1: 34, x2: 220, y2: 70, stroke: pal.sub, 'stroke-width': 1.5 });
  const sat = g({});
  const ringB = el('ellipse', { cx: 0, cy: 0, rx: 46, ry: 11, fill: 'none', stroke: '#E9B43A', 'stroke-width': 6 }, sat);
  el('circle', { r: 26, fill: '#F2C77A' }, sat);
  el('path', { d: 'M -24 -6 Q 0 -2 24 -6 M -25 6 Q 0 10 25 6', stroke: '#D9A657', 'stroke-width': 3, fill: 'none' }, sat);
  const ringF = el('path', { d: 'M -46 0 A 46 11 0 0 0 46 0', fill: 'none', stroke: '#E9B43A', 'stroke-width': 6 }, sat);
  // ロケットの展示（台の上）
  const rk = g({}); tf(rk, 320, FY - 24);
  el('rect', { x: -30, y: 0, width: 60, height: 24, rx: 3, fill: '#C9D2DE' }, rk);
  el('path', { d: 'M -12 0 V -78 Q 0 -104 12 -78 V 0 Z', fill: '#fff', stroke: '#B8C2CE', 'stroke-width': 2 }, rk);
  el('circle', { cx: 0, cy: -64, r: 6, fill: '#9FD0F2', stroke: '#B8C2CE', 'stroke-width': 2 }, rk);
  el('path', { d: 'M -12 -20 L -24 0 H -12 Z M 12 -20 L 24 0 H 12 Z', fill: pal.red }, rk);
  k.shadow(320, FY + 1, 34, 4);
  const A = k.buddy({ x: -40, y: FY, scale: 0.95 });
  const B = k.buddy({ x: -90, y: FY, scale: 0.8, color: pal.coral, dark: pal.coralDark });
  const xa = (t) => lerp(-40, 170, easeInOut(seg(t, 0, 1.6)));
  const xb = (t) => lerp(-90, 110, easeInOut(seg(t, 0.15, 1.75)));
  return {
    update(t) {
      const ga = gait(xa, t, -40), gb = gait(xb, t, -90);
      const up = easeInOut(seg(t, 1.6, 2.1)), pt = easeOut(seg(t, 2.2, 2.6));
      const turn = easeInOut(seg(t, 3.0, 3.4));
      P(A, { x: ga.x, walk: ga.walk, lean: ga.lean - 6 * up, armL: ga.armL, armR: ga.armR, look: 0.6, mood: up > 0.5 ? 'open' : 'smile', blink: blinkAt(t) });
      if (pt > 0) A.pose({ armR: lerp(ga.armR, reach(A, 0.95, 'R', 220, 60), pt) });
      A.body.children[3].setAttribute('transform', `translate(${(4 * up).toFixed(2)} ${(-5 * up).toFixed(2)})`);
      P(B, { x: gb.x, walk: gb.walk, lean: gb.lean - 6 * up, armL: gb.armL, armR: gb.armR, look: lerp(0.6, 1, turn), mood: t > 3 ? 'grin' : 'smile', blink: blinkAt(t, 0.9) });
      if (t > 3.0) B.pose({ armR: lerp(8, reach(B, 0.8, 'R', 300, 150), easeOut(seg(t, 3.0, 3.4))) });
      B.body.children[3].setAttribute('transform', `translate(${(4 * up).toFixed(2)} ${(-4 * up * (1 - turn)).toFixed(2)})`);
      const sw = Math.sin(t * 1.2) * 4;
      tf(sat, 220, 96, sw);
      tf(atom, 84, 70, t * 30);
    }
  };
}
