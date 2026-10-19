// develop：会社の開発室で、設計図からまめが部品を組み、新しいスマホを完成させる（例文 The company developed a new phone.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, backOut } from '../ease.js';
import { hp, held, reach } from './dig.js';
import { officeBg, star } from './get-on-with.js';
import { P, blinkAt } from './run-after.js';
import { drawOn } from './work-on.js';

export const meta = { duration: 4.4, beats: [[0, '設計図'], [1.2, '部品を組む'], [3.2, '新しいスマホ']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236, S = 1.0;
  officeBg(k, FY, 270);
  // ホワイトボードの設計図（線が描かれていく）
  el('rect', { x: 30, y: 30, width: 150, height: 96, rx: 6, fill: '#fff', stroke: pal.sub, 'stroke-width': 3 });
  const plan = el('path', { d: 'M 82 44 h 46 a 6 6 0 0 1 6 6 v 60 a 6 6 0 0 1 -6 6 h -46 a 6 6 0 0 1 -6 -6 v -60 a 6 6 0 0 1 6 -6 Z M 84 52 h 42 v 50 h -42 Z M 100 108 h 10', stroke: pal.blueDark, 'stroke-width': 2.5, fill: 'none', 'stroke-dasharray': '4 0' });
  const draw = drawOn(plan);
  el('path', { d: 'M 140 60 l 24 -10 M 140 96 l 24 10', stroke: pal.sub, 'stroke-width': 2, 'stroke-dasharray': '3 3' });
  // 作業台
  k.shadow(250, FY + 1, 100, 5);
  el('rect', { x: 150, y: 178, width: 220, height: 10, rx: 3, fill: pal.woodDark });
  el('rect', { x: 160, y: 188, width: 10, height: 48, fill: pal.woodDark }); el('rect', { x: 350, y: 188, width: 10, height: 48, fill: pal.woodDark });
  const me = k.buddy({ x: 146, y: FY, scale: S, facing: 1 });
  // 部品：基板・電池・画面 → 1台のスマホに
  const PX = 236, PY = 178;
  const body = g({}); el('rect', { x: -15, y: -50, width: 30, height: 50, rx: 5, fill: pal.ink }, body);
  const board = el('rect', { x: -11, y: -18, width: 22, height: 18, rx: 2, fill: pal.green });
  const batt = el('rect', { x: -11, y: -16, width: 22, height: 16, rx: 2, fill: pal.yellow });
  const screen = g({}); el('rect', { x: -12, y: -42, width: 24, height: 42, rx: 3, fill: '#9FD0F2' }, screen);
  el('circle', { cx: 0, cy: -21, r: 6, fill: '#fff', opacity: 0.8 }, screen);
  tf(body, PX, PY);
  const parts = [[board, 296, 178, 0, -26], [batt, 322, 178, 0, -6], [screen, 346, 178, 0, -5]];
  const stars = [0, 1, 2].map(() => star(k, null, 7));
  const tool = g({});
  el('rect', { x: -2.5, y: -6, width: 5, height: 12, rx: 2, fill: pal.coral }, tool);
  el('rect', { x: -1, y: 6, width: 2, height: 12, fill: pal.sub }, tool);
  return {
    update(t) {
      draw(easeInOut(seg(t, 0.1, 1.0)));
      // 部品を1つずつ手で運んで本体にはめる
      const slots = [1.2, 1.9, 2.6];
      let tx = PX + 20, ty = 150, carrying = -1;
      slots.forEach((a, i) => {
        const p = parts[i], q = seg(t, a, a + 0.6);
        const [n, x0, y0, r0, oy] = p;
        let x = x0, y = y0, r = r0, s = 1;
        if (t >= a + 0.6) { x = PX; y = PY + oy; r = 0; }
        else if (q > 0) {
          const e = easeInOut(q);
          x = lerp(x0, PX, e); y = lerp(y0, PY + oy, e) - 30 * hump(q); r = lerp(r0, 0, e);
          tx = q < 0.15 ? x0 : x; ty = (q < 0.15 ? y0 : y) - 20; carrying = i;
        }
        const pop = t >= a + 0.6 ? 1 + 0.08 * wobble(seg(t, a + 0.6, a + 1.0), 2, 5) : 1;
        n.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${r.toFixed(2)}) scale(${(s * pop).toFixed(3)})`);
      });
      const work = t > 1.1 && t < 3.3;
      P(me, { look: 0.7, blink: blinkAt(t), lean: work ? 10 : 0, armL: 10, armR: 10, mood: t > 3.3 ? 'grin' : 'smile', lift: 10 * hump(seg(t, 3.4, 3.8)) });
      if (work) me.pose({ armR: reach(me, S, 'R', carrying >= 0 ? tx : PX, carrying >= 0 ? ty + 14 : 150) });
      else if (t >= 3.3) me.pose({ armR: 10 + 150 * easeOut(seg(t, 3.3, 3.6)), armL: 10 + 140 * easeOut(seg(t, 3.3, 3.6)) });
      held(k, me, S, tool, 'R', 0);
      tool.setAttribute('opacity', t < 1.1 ? 1 : 0);
      // 完成：画面が光り、きらめく
      const on = seg(t, 3.2, 3.4);
      screen.children[0].setAttribute('fill', on > 0 ? '#BFF0FF' : '#9FD0F2');
      stars.forEach((s, i) => { const q = seg(t, 3.3 + i * 0.15, 4.2); tf(s, PX - 26 + i * 26, PY - 66 - 10 * q - (i % 2) * 8, 0, Math.max(0.001, hump(q))); });
    }
  };
}
