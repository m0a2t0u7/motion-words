// charge：ホテルのフロントで係の人が「1泊40ドル」の料金を示し、まめが代金を払う（例文 The hotel charges forty dollars a night.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { hp, reach } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { walk, path } from './queue-up.js';
import { hotelBg } from './provide.js';

// お札（中心原点）
export function bill(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('rect', { x: -12, y: -7, width: 24, height: 14, rx: 2, fill: '#BFE6C7', stroke: pal.green, 'stroke-width': 1.5 }, g);
  k.el('circle', { r: 4, fill: 'none', stroke: pal.green, 'stroke-width': 1.5 }, g);
  return g;
}
// 三日月（中心原点）
export function moon(k, parent, r = 8, bg = '#fff') {
  const g = k.g({}, parent);
  k.el('circle', { r, fill: k.pal.yellowDark }, g);
  k.el('circle', { cx: r * 0.5, cy: -r * 0.3, r: r * 0.85, fill: bg }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, 'フロント'], [1.3, '1泊40ドル'], [2.6, '代金を払う']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236, S = 1.0;
  hotelBg(k, FY);
  // 呼び鈴とかぎ掛け
  el('rect', { x: 300, y: 76, width: 70, height: 50, rx: 4, fill: pal.wood });
  [314, 334, 354].forEach((x) => { el('circle', { cx: x, cy: 92, r: 3, fill: pal.woodDark }); el('rect', { x: x - 3, y: 96, width: 6, height: 14, rx: 2, fill: pal.yellowDark }); });
  const clerk = k.buddy({ x: 316, y: FY, scale: 1.18, facing: -1, color: pal.coral, dark: pal.coralDark });
  // フロントのカウンター
  el('rect', { x: 230, y: 192, width: 170, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 236, y: 200, width: 164, height: 36, fill: pal.wood });
  k.shadow(316, FY + 1, 86, 4);
  // 料金の札：$40 / 夜
  const card = g({});
  el('rect', { x: -36, y: -22, width: 72, height: 44, rx: 6, fill: '#fff', stroke: pal.ink, 'stroke-width': 2.5 }, card);
  k.text(-8, 1, '$40', { 'font-size': 18, fill: pal.ink }, card);
  k.text(16, 1, '/', { 'font-size': 16, fill: pal.sub }, card);
  tf(moon(k, card, 7), 26, 0);
  const me = k.buddy({ x: 30, y: FY, scale: S, facing: 1 });
  // スーツケース
  const bag = g({});
  k.shadow(0, 0, 16, 3, bag);
  el('rect', { x: -14, y: -40, width: 28, height: 40, rx: 4, fill: pal.violet }, bag);
  el('rect', { x: -6, y: -48, width: 12, height: 9, rx: 3, fill: 'none', stroke: pal.ink, 'stroke-width': 2.5 }, bag);
  const money = [0, 1, 2, 3].map(() => bill(k));
  const xf = path([[0, 30], [1.2, 180]]);
  return {
    update(t) {
      walk(me, xf, t, { facing: 1, look: 0.6, armL: 30, blink: blinkAt(t) });
      const x = xf(t);
      tf(bag, x - 34, FY + 1);
      // 係：札を掲げて見せる
      const show = easeOut(seg(t, 1.2, 1.6)) * (1 - easeInOut(seg(t, 2.6, 2.9)));
      const take = easeInOut(seg(t, 3.0, 3.4)) * (1 - easeInOut(seg(t, 3.6, 4.0)));
      P(clerk, { facing: -1, look: 0.7, blink: blinkAt(t, 1), mood: t > 3.4 ? 'grin' : 'smile', armL: 10, armR: 10 + 130 * show });
      if (take > 0) clerk.pose({ armR: lerp(10, reach(clerk, 1.18, 'R', 216, 184), take) });
      const ch = hp(clerk, 1.18, 'R');
      tf(card, show > 0.02 ? ch.x - 12 : 268, show > 0.02 ? ch.y - 24 : 168, 0, show > 0.02 ? 0.85 + 0.15 * show : 0.6);
      card.setAttribute('opacity', show > 0.02 || t < 1.2 ? 1 : 0);
      // まめ：札を見る → お札を4枚差し出す
      const pay = easeInOut(seg(t, 2.6, 3.1));
      if (t > 1.2) P(me, { x: 180, facing: 1, look: 0.8, blink: blinkAt(t), armL: 30, armR: lerp(10, 82, pay) * (1 - easeInOut(seg(t, 3.5, 3.9))) + 10 * easeInOut(seg(t, 3.5, 3.9)), mood: t > 1.6 && t < 2.2 ? 'open' : 'smile' });
      const mh = hp(me, S, 'R');
      money.forEach((m, i) => {
        const counted = seg(t, 2.6 + i * 0.12, 2.75 + i * 0.12);
        const hand = t < 3.45 ? mh : { x: lerp(mh.x, 262, seg(t, 3.4, 3.5)), y: lerp(mh.y, 186, seg(t, 3.4, 3.5)) };
        const onDesk = t >= 3.5;
        tf(m, onDesk ? 252 + i * 4 : hand.x + 4 + i * 3, onDesk ? 188 - i * 1.5 : hand.y - 4 - i * 2, onDesk ? 0 : -14 + i * 6);
        m.setAttribute('opacity', counted > 0 ? 1 : 0);
      });
    }
  };
}
