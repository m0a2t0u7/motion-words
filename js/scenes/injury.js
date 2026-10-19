// injury：足に包帯を巻き松葉づえをついた選手が、ベンチの横から試合を見ているだけ（例文 The player missed the game because of an injury.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { P, reach, hp, gait } from './hospital.js';
import { person } from './queue-up.js';

export const meta = { duration: 4.4, beats: [[0, '試合が始まる'], [1.6, 'けがで出られない'], [3.0, '見ているだけ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#BFE3B0' });
  el('rect', { x: 0, y: 176, width: 400, height: 60, fill: '#CDEBC0' });
  el('line', { x1: 0, y1: 206, x2: 400, y2: 206, stroke: '#fff', 'stroke-width': 2, opacity: 0.7 });
  // ゴール
  el('rect', { x: 352, y: 150, width: 6, height: 70, fill: '#fff' });
  el('rect', { x: 352, y: 150, width: 46, height: 6, fill: '#fff' });
  for (let i = 0; i < 5; i++) el('line', { x1: 358 + i * 9, y1: 156, x2: 358 + i * 9, y2: 220, stroke: '#fff', 'stroke-width': 1.2, opacity: 0.6 });
  // ベンチ
  el('rect', { x: 14, y: 210, width: 90, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 20, y: 218, width: 6, height: 18, fill: pal.woodDark });
  el('rect', { x: 92, y: 218, width: 6, height: 18, fill: pal.woodDark });
  // 試合中の選手（奥）
  const p1 = person(k, 'blue', { x: 226, y: 206, scale: 0.55 });
  const p2 = person(k, 'yellow', { x: 312, y: 206, scale: 0.55, facing: -1 });
  const ball = g({}); el('circle', { r: 6, fill: '#fff', stroke: pal.ink, 'stroke-width': 1.5 }, ball); el('path', { d: 'M 0 -3 L 3 -1 L 2 3 L -2 3 L -3 -1 Z', fill: pal.ink }, ball);
  const bsh = k.shadow(0, 206, 6, 1.5);
  // けがをした選手（手前）
  const S = 0.95;
  const me = k.buddy({ x: 132, y: FY, scale: S });
  const num = k.text(0, -28, '7', { 'font-size': 18, fill: '#fff' }, me.body);
  // 足の包帯
  const legF = me.g.children[1].children[1];
  el('rect', { x: -7, y: 2, width: 14, height: 12, rx: 3, fill: '#fff', stroke: '#DCE3EC', 'stroke-width': 1.5 }, legF);
  [6, 10].forEach((y) => el('line', { x1: -6, y1: y, x2: 6, y2: y + 1, stroke: '#DCE3EC', 'stroke-width': 1.2 }, legF));
  // 松葉づえ（原点＝わきの下）
  const crutch = g({});
  el('line', { x1: 0, y1: 0, x2: 0, y2: 62, stroke: '#9AA6B6', 'stroke-width': 4, 'stroke-linecap': 'round' }, crutch);
  el('rect', { x: -9, y: -3, width: 18, height: 6, rx: 3, fill: pal.ink }, crutch);
  el('rect', { x: -5, y: 36, width: 10, height: 4, rx: 2, fill: pal.ink }, crutch);
  const ouch = g({}); el('path', { d: 'M 0 -9 L 3 -3 L 9 -2 L 4 2 L 6 9 L 0 5 L -6 9 L -4 2 L -9 -2 L -3 -3 Z', fill: pal.yellow, stroke: pal.red, 'stroke-width': 2 }, ouch);
  return {
    update(t) {
      // ボール：p1 → p2 → ゴール
      let bx, by;
      if (t < 1.5) { const q = seg(t, 0.4, 1.4); bx = lerp(240, 300, q); by = 202 - 30 * hump(q); }
      else if (t < 3.0) { const q = seg(t, 2.0, 2.9); bx = lerp(300, 240, q); by = 202 - 24 * hump(q); }
      else { const q = easeOut(seg(t, 3.2, 3.8)); bx = lerp(240, 372, q); by = 202 - 34 * hump(Math.min(q, 0.999)) * (1 - seg(q, 0.9, 1)); }
      tf(ball, bx, by, t * 400);
      tf(bsh, bx - 0, 0, 0, 1 - (202 - by) / 60);
      const kick1 = hump(seg(t, 0.3, 0.6)), kick2 = hump(seg(t, 1.9, 2.2)), kick3 = hump(seg(t, 3.1, 3.4));
      P(p1, { x: 226 + 4 * Math.sin(t * 2), lean: 10 * (kick1 + kick3), look: 0.5, mood: 'grin', armL: 30 * (kick1 + kick3), lift: 4 * kick3 });
      P(p2, { x: 312, facing: -1, lean: 10 * kick2, look: 0.5, mood: 'grin', armL: 30 * kick2 });
      // 手前の選手：一歩出ようとして痛み、止まる
      const step = hump(seg(t, 1.4, 2.4));
      const pain = hump(seg(t, 1.8, 2.6));
      P(me, { x: 132 + 10 * step, look: lerp(0.2, 1, seg(t, 0.4, 1.0)), mood: t > 1.8 ? 'sad' : 'flat', lean: 6 * step - 4 * pain, blink: pain > 0.4 ? 0.7 : 0, armL: 8, armR: 22 });
      legF.setAttribute('transform', `translate(12 ${-14}) rotate(${(-14 - 10 * step).toFixed(1)})`);
      const sh = hp(me, S, 'R', 0);
      tf(crutch, sh.x + 4, sh.y + 2, -6 - 8 * step);
      tf(ouch, me.state.x + 20, FY - 16, t * 50, Math.max(0.001, pain * 1.1));
    }
  };
}
