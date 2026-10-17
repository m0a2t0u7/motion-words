// give back：借りた本を持ったまま日が変わり、持ち主に返す（例文 I'll give back your book tomorrow.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, grip, decor } from './hand-over.js';

export const meta = { duration: 4.2, beats: [[0, '借りた本'], [1.5, '明日になる'], [3.2, '持ち主に返す']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 246, mood: 'indoor' });
  decor(k, FY);
  // 壁かけカレンダー（静止）。めくれるのは1枚だけ
  const cal = g({});
  tf(cal, 200, 74);
  el('rect', { x: -34, y: -36, width: 68, height: 76, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, cal);
  el('rect', { x: -34, y: -36, width: 68, height: 18, rx: 6, fill: pal.red }, cal);
  el('rect', { x: -34, y: -26, width: 68, height: 8, fill: pal.red }, cal);
  k.text(0, 14, '13', { 'font-size': 30, fill: pal.ink }, cal);
  const page = g({}, cal);
  el('rect', { x: -34, y: -18, width: 68, height: 58, fill: '#fff', stroke: pal.line, 'stroke-width': 1 }, page);
  k.text(0, 14, '12', { 'font-size': 30, fill: pal.ink }, page);
  el('rect', { x: -3, y: -40, width: 6, height: 8, rx: 3, fill: pal.sub }, cal);
  const S = 1;
  const a = k.buddy({ x: 120, y: FY, scale: S });
  const o = k.buddy({ x: 330, y: FY, scale: S, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const book = g({});
  el('rect', { x: -12, y: -16, width: 24, height: 32, rx: 3, fill: pal.blue }, book);
  el('rect', { x: -12, y: -16, width: 5, height: 32, rx: 2, fill: pal.blueDark }, book);
  el('rect', { x: -3, y: -8, width: 11, height: 3, rx: 1.5, fill: '#fff', opacity: 0.8 }, book);
  el('rect', { x: -3, y: -2, width: 8, height: 3, rx: 1.5, fill: '#fff', opacity: 0.8 }, book);
  const ga = grip(k, pal.mint, pal.mintDark, S), go = grip(k, pal.coral, pal.coralDark, S);
  return {
    update(t) {
      // 日めくり：12 → 13
      const f = easeInOut(seg(t, 1.3, 1.9));
      tf(page, 0, -18, 0, 1, 1 - f);
      k.set(page.children[0], { y: 0, height: 58 });
      k.set(page.children[1], { y: 32 });
      page.setAttribute('opacity', f < 1 ? 1 : 0);
      // まめが近づいて返す
      const mv = easeInOut(seg(t, 2.3, 3.0));
      const aX = lerp(120, 170, mv);
      const oX = lerp(330, 300, easeOut(seg(t, 2.2, 3.0)));
      const ext = easeInOut(seg(t, 2.7, 3.3));
      const back = easeInOut(seg(t, 3.5, 4.1));
      a.pose({ x: aX, walk: mv > 0 && mv < 1 ? (t - 2.3) * 9 : 0, armR: lerp(lerp(40, 20, seg(t, 1.2, 1.9)), 88, ext) * (1 - back) + 15 * back,
        armL: 12, look: t < 1.3 ? 0 : 0.3, mood: t > 3.2 ? 'grin' : 'smile', lean: 3 * hump(seg(t, 2.6, 3.8)) });
      o.pose({ x: oX, walk: t > 2.2 && t < 3.0 ? (t - 2.2) * 9 : 0, armR: lerp(12, 90, easeInOut(seg(t, 2.8, 3.3))) * (1 - back * 0.55), armL: 10, look: 0.3,
        mood: t > 3.3 ? 'grin' : 'smile', squash: 1 - 0.05 * hump(seg(t, 3.2, 3.7)) });
      const ha = hp(a, S), ho = hp(o, S);
      const m = easeInOut(seg(t, 3.25, 3.55));
      tf(book, lerp(ha.x + 2, ho.x - 2, m), lerp(ha.y - 12, ho.y - 12, m), lerp(-8, 6, m));
      ga(ha); go(ho);
    }
  };
}
