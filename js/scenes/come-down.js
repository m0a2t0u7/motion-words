// come down：セールが始まると、商品の値札が次々に下がった値段に変わる（例文 Prices came down after the sale started.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { person, pop } from './queue-up.js';

export const meta = { duration: 4.2, beats: [[0, 'もとの値段'], [1.4, 'セール開始'], [3.6, '値段が下がった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  [128, 190].forEach((y) => el('rect', { x: 50, y, width: 300, height: 6, fill: pal.woodDark }));
  const goods = [[78, pal.coral], [168, pal.blue], [258, pal.green]];
  const tags = goods.map(([x, c], i) => {
    el('rect', { x, y: 92, width: 44, height: 36, rx: 4, fill: c });
    el('rect', { x: x + 4, y: 150, width: 36, height: 40, rx: 6, fill: i ? pal.yellow : pal.violet });
    const tg = g({}); tf(tg, x + 22, 142);
    el('rect', { x: -22, y: -8, width: 44, height: 18, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, tg);
    const old = k.text(0, 1, ['500', '800', '300'][i], { 'font-size': 12, fill: pal.ink }, tg);
    const cut = el('line', { x1: -14, y1: 1, x2: 14, y2: 1, stroke: pal.red, 'stroke-width': 2 }, tg);
    const nw = g({}, tg);
    el('rect', { x: -22, y: -8, width: 44, height: 18, rx: 3, fill: pal.red }, nw);
    k.text(0, 1, ['300', '500', '200'][i], { 'font-size': 12, fill: '#fff' }, nw);
    const arr = el('path', { d: 'M 0 -6 v 12 m -5 -5 l 5 5 l 5 -5', stroke: pal.red, 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' });
    return { tg, old, cut, nw, arr, x: x + 22 };
  });
  // SALE の垂れ幕（上から下りる）
  const ban = g({});
  el('rect', { x: -70, y: 0, width: 140, height: 34, rx: 4, fill: pal.red }, ban);
  k.text(0, 18, 'SALE', { 'font-size': 20, fill: '#fff' }, ban);
  el('line', { x1: -60, y1: -40, x2: -60, y2: 0, stroke: pal.sub, 'stroke-width': 1.5 }, ban); el('line', { x1: 60, y1: -40, x2: 60, y2: 0, stroke: pal.sub, 'stroke-width': 1.5 }, ban);
  const cust = k.buddy({ x: 360, y: FY + 6, scale: 0.8, facing: -1 });
  return {
    update(t) {
      const d = seg(t, 0.6, 1.3);
      tf(ban, 200, lerp(-40, 40, easeOut(d)) + 3 * wobble(seg(t, 1.2, 2.0), 2, 5));
      tags.forEach((o, i) => {
        const c = seg(t, 1.6 + i * 0.5, 2.0 + i * 0.5);
        o.cut.setAttribute('opacity', c > 0 ? 1 : 0);
        o.nw.setAttribute('opacity', c);
        tf(o.nw, 0, lerp(-14, 20, easeOut(c)), -6 * wobble(c, 1.5, 4));
        o.arr.setAttribute('opacity', hump(c));
        tf(o.arr, o.x + 30, 150 + 8 * c);
      });
      const happy = seg(t, 2.6, 3.0);
      cust.pose({ look: -0.5, mood: happy > 0.5 ? 'grin' : 'flat', lift: 8 * hump(seg(t, 3.0, 3.4)), armR: lerp(10, 150, hump(seg(t, 3.0, 3.6))) });
      void pop; void person; void easeInOut;
    }
  };
}
