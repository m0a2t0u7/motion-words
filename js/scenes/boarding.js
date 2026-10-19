// boarding：搭乗口の時計が9:30になると係員がゲートを開け、搭乗券を持った乗客が並んで機内へ進み始める（例文 Boarding starts at 9:30.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hall, clock, walk, path, held, ticket, person } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, 'もうすぐ9:30'], [1.4, '搭乗開始'], [2.6, '機内へ進む']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = 236;
  hall(k, FY);
  const ck = clock(k, 70, 60, 24);
  el('rect', { x: 290, y: 70, width: 110, height: FY - 70, fill: '#DCE3EE' });
  el('rect', { x: 300, y: 90, width: 100, height: FY - 90, fill: '#3C4558' }); // 搭乗橋の入口
  el('rect', { x: 290, y: 50, width: 110, height: 22, rx: 4, fill: pal.blue }); k.text(345, 61, 'GATE 5', { 'font-size': 12, fill: '#fff' });
  const bar = el('rect', { x: 250, y: FY - 44, width: 46, height: 8, rx: 4, fill: pal.red });
  el('rect', { x: 244, y: FY - 50, width: 10, height: 50, rx: 3, fill: pal.sub });
  const agent = k.buddy({ x: 272, y: FY - 2, scale: 0.72, facing: 1, color: pal.coral, dark: pal.coralDark });
  const ppl = [['mint', 200], ['violet', 140], ['yellow', 80], ['blue', 20]].map(([c, x], i) => {
    const b = person(k, c, { x, y: FY + 8, scale: 0.78 }); const tk = ticket(k, null, '#fff'); return { b, tk, x, i };
  });
  return {
    update(t) {
      const m = 25 + 5 * easeInOut(seg(t, 0.2, 1.2));
      ck.set(9, m);
      const op = easeInOut(seg(t, 1.4, 1.9));
      k.set(bar, { transform: `rotate(${(-80 * op).toFixed(1)} 250 ${FY - 40})` });
      P(agent, { x: 272, y: FY - 2, look: -0.6, facing: t > 1.3 ? -1 : 1, mood: 'grin', blink: blinkAt(t), armR: 8 + 70 * hump(seg(t, 1.3, 2.2)), armL: t > 1.9 ? 70 : 8 });
      ppl.forEach(({ b, tk, x, i }) => {
        const X = path([[2.0 + i * 0.35, x], [4.4, x + 190]]);
        walk(b, X, t, { mood: 'smile', look: 0.6, blink: blinkAt(t, i), armR: 50 });
        held(k, b, 0.78, tk, 'R', 90);
        const gone = b.state.x > 300; b.g.setAttribute('display', gone ? 'none' : 'inline'); tk.setAttribute('display', gone ? 'none' : 'inline');
      });
      void lerp; void easeOut; void g;
    }
  };
}
