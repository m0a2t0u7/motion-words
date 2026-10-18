// put forward：会議のテーブル。まめが立ち上がり、電球を描いたアイデアのカードをテーブルの真ん中へ差し出す。電球が光り、同僚が身を乗り出す（例文 He put forward a new idea at the meeting.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { hp } from './dig.js';
import { officeBg, desk } from './get-on-with.js';

export const meta = { duration: 4.2, beats: [[0, '会議中'], [1.4, '案を前に出す'], [3.0, '皆が注目']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236, 150);
  const me = k.buddy({ x: 90, y: FY - 6, scale: 0.95 });
  const cs = [k.buddy({ x: 250, y: FY - 6, scale: 0.9, color: pal.coral, dark: pal.coralDark, facing: -1 }), k.buddy({ x: 330, y: FY - 6, scale: 0.9, color: pal.coral, dark: pal.coralDark, facing: -1 })];
  const top = desk(k, 50, 320, FY);
  // 資料（皆の前に）
  [130, 260, 330].forEach((x) => el('rect', { x: x - 10, y: top - 3, width: 20, height: 3, fill: '#fff', stroke: pal.line }));
  // アイデアのカード
  const card = g({});
  el('rect', { x: -18, y: -24, width: 36, height: 26, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, card);
  const bulb = el('circle', { cx: 0, cy: -14, r: 7, fill: '#F1F3F6', stroke: pal.yellowDark, 'stroke-width': 2 }, card);
  el('rect', { x: -3.5, y: -7, width: 7, height: 5, rx: 1, fill: pal.sub }, card);
  const glow = el('circle', { cx: 0, cy: -14, r: 16, fill: pal.yellow, opacity: 0 }, card);
  card.insertBefore(glow, card.firstChild);
  const rays = g({}, card);
  for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.45; el('line', { x1: Math.cos(a) * 12, y1: -14 + Math.sin(a) * 12, x2: Math.cos(a) * 18, y2: -14 + Math.sin(a) * 18, stroke: pal.yellowDark, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, rays); }
  return {
    update(t) {
      const stand = easeOut(seg(t, 0.3, 0.7)), push = easeInOut(seg(t, 1.2, 1.75)), sit = easeInOut(seg(t, 3.0, 3.4));
      me.pose({ y: FY - 6 - 14 * stand * (1 - sit * 0.5), armR: lerp(lerp(20, 70, seg(t, 0.7, 1.1)), 100, push) * (1 - easeInOut(seg(t, 2.2, 2.6))) + 20 * easeInOut(seg(t, 2.2, 2.6)),
        lean: 14 * push * (1 - easeInOut(seg(t, 2.2, 2.6))), look: 0.6, mood: t > 2.4 ? 'grin' : 'smile', squash: 1 - 0.06 * hump(seg(t, 0.2, 0.4)) });
      const h = hp(me, 0.95);
      // 手に持つ→テーブルに置いて前へ押し出す→すべって真ん中で止まる
      const slide = easeOut(seg(t, 1.75, 2.3));
      const hx = t < 1.75 ? h.x + 4 : lerp(150, 200, slide);
      const hy = Math.min(h.y + 6, top);
      tf(card, t < 1.75 ? hx : hx, t < 1.75 ? hy : top, 0);
      card.setAttribute('opacity', seg(t, 0.75, 0.9));
      const lit = easeOut(seg(t, 2.2, 2.5));
      k.set(bulb, { fill: lit > 0.5 ? pal.yellow : '#F1F3F6' });
      k.set(glow, { opacity: 0.35 * lit + 0.1 * lit * Math.sin(t * 6) });
      rays.setAttribute('opacity', lit);
      cs.forEach((c, i) => { const lookIn = easeOut(seg(t, 2.3 + i * 0.15, 2.7 + i * 0.15)); c.pose({ lean: 10 * lookIn, look: 0.5, mood: lookIn > 0.5 ? 'open' : 'smile', lift: hump(seg(t, 2.8 + i * 0.1, 3.1 + i * 0.1)) * 5, armR: 10, armL: 10 }); });
    }
  };
}
