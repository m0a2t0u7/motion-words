// partner：授業で相手を見つけてペアになり、台本を持って交互に会話を練習する（例文 Find a partner and practice the dialogue.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, keys, iconSay, P, blinkAt, C } from './jam.js';
import { gait } from './weigh.js';

export const meta = { duration: 4.6, beats: [[0, '相手をさがす'], [1.4, 'ペアになる'], [2.2, '会話の練習']] };

export function create(k) {
  const { el, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#F3F0E8' });
  el('rect', { x: 110, y: 30, width: 180, height: 70, rx: 4, fill: '#3E6B5A', stroke: pal.woodDark, 'stroke-width': 6 });
  k.text(200, 52, 'A: Hi!', { 'font-size': 15, fill: '#fff' }); k.text(200, 78, 'B: Hello!', { 'font-size': 15, fill: '#fff' });
  const me = k.buddy({ x: 60, y: FY, scale: 1.1 });
  const pt = k.buddy({ x: 300, y: FY, scale: 1.1, facing: -1, ...C(k, 'blue') });
  const sheet = () => { const g = k.g({}); el('rect', { x: -10, y: -14, width: 20, height: 26, rx: 2, fill: '#fff', stroke: '#C9D2DD' }, g); [-7, -2, 3].forEach((y) => el('line', { x1: -6, y1: y, x2: 6, y2: y, stroke: '#AEB8C6', 'stroke-width': 1.5 }, g)); return g; };
  const s1 = sheet(), s2 = sheet();
  const A = arms(k, me, 1.1, { back: ['L'] }), B = arms(k, pt, 1.1, { col: pal.blue, dark: pal.blueDark, back: ['L'] });
  const b1 = iconSay(k, 50, 30, -1, (g) => k.text(0, 1, 'Hi!', { 'font-size': 14 }, g));
  const b2 = iconSay(k, 64, 30, 1, (g) => k.text(0, 1, 'Hello!', { 'font-size': 14 }, g));
  const xf = keys([[0, 60], [0.4, 60], [1.4, 166]]);
  return {
    update(t) {
      const g = gait(xf, t, 60);
      const five = hump(seg(t, 1.4, 1.9));
      const talk1 = t > 2.2 && t < 3.2, talk2 = t > 3.3 && t < 4.3;
      P(me, { x: g.x, walk: g.walk, lean: g.lean, look: t < 0.4 ? Math.sin(t * 8) : 0.6, blink: blinkAt(t), mood: talk1 && Math.sin(t * 22) > 0 ? 'open' : 'smile' });
      P(pt, { look: 0.6, facing: -1, blink: blinkAt(t, 1), mood: talk2 && Math.sin(t * 22) > 0 ? 'open' : 'smile' });
      // ハイタッチでペア成立 → 台本を持つ
      if (t < 2.0) {
        const r = A.to('R', lerp(g.x + 30, 233, five), lerp(200, 120, five));
        B.to('R', lerp(270, 237, five), lerp(200, 120, five));
        k.tf(s1, g.x - 18, 196); k.tf(s2, 318, 196);
        A.to('L', g.x - 18, 200); B.to('L', 318, 200);
        void r;
      } else {
        const p = easeInOut(seg(t, 2.0, 2.2));
        const h1 = A.to('R', lerp(g.x + 30, g.x + 32, p), lerp(200, 176, p)), h2 = B.to('R', lerp(270, 268, p), lerp(200, 176, p));
        A.to('L', g.x - 18, 200); B.to('L', 318, 200);
        k.tf(s1, h1.x + 4, h1.y - 8); k.tf(s2, h2.x - 4, h2.y - 8);
      }
      b1.show(seg(t, 2.2, 2.5) * (1 - seg(t, 3.9, 4.1) * 0), g.x + 20, 110);
      b2.show(seg(t, 3.3, 3.6), 280, 110);
    }
  };
}
