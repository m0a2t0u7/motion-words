// own：おじが自分の小さなレストランの鍵を開け、OPENの札を出し、誇らしげに立つ（例文 My uncle owns a small restaurant.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble } from '../ease.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 4.8, beats: [[0, '店の前'], [1.6, '鍵を開ける'], [3.4, '自分の店']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: '#E3E8EE' });
  [[10, 100, 54], [346, 112, 54]].forEach(([x, h, w]) => el('rect', { x, y: FY - h - 6, width: w, height: h, rx: 4, fill: '#E4EEF7' }));
  // 小さなレストラン
  const X = 80, W = 210;
  el('rect', { x: X, y: 92, width: W, height: FY - 98, rx: 6, fill: '#FFF1D2' });
  for (let i = 0; i < 10; i++) el('path', { d: `M ${X + i * 21} 92 h 21 v 26 q -10.5 10 -21 0 Z`, fill: i % 2 ? '#fff' : pal.coral });
  el('rect', { x: X, y: 86, width: W, height: 9, rx: 3, fill: pal.coralDark });
  // 看板（皿とフォーク）
  el('rect', { x: X + 60, y: 56, width: 90, height: 28, rx: 8, fill: '#fff', stroke: pal.coralDark, 'stroke-width': 3 });
  el('circle', { cx: X + 105, cy: 70, r: 9, fill: 'none', stroke: pal.ink, 'stroke-width': 2.6 });
  el('path', { d: `M ${X + 82} 62 v 16 M ${X + 78} 62 v 7 q 4 4 8 0 v -7`, stroke: pal.ink, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' });
  el('path', { d: `M ${X + 130} 62 q 6 5 0 14 v 4`, stroke: pal.ink, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' });
  // 窓
  el('rect', { x: X + 130, y: 134, width: 66, height: 56, rx: 5, fill: '#CFE9F7', stroke: '#fff', 'stroke-width': 4 });
  const glow = el('rect', { x: X + 130, y: 134, width: 66, height: 56, rx: 5, fill: '#FFE9A8', opacity: 0 });
  el('rect', { x: X + 140, y: 168, width: 18, height: 18, rx: 4, fill: pal.yellow });
  el('circle', { cx: X + 176, cy: 176, r: 10, fill: pal.violet });
  // ドア
  const D = { x: X + 24, y: FY - 92, w: 54, h: 92 };
  el('rect', { x: D.x - 4, y: D.y - 4, width: D.w + 8, height: D.h + 4, rx: 3, fill: pal.woodDark });
  el('rect', { x: D.x, y: D.y, width: D.w, height: D.h, fill: '#FFD98A' });
  const panel = g({});
  el('rect', { x: 0, y: 0, width: D.w, height: D.h, rx: 2, fill: pal.blue }, panel);
  el('rect', { x: 8, y: 10, width: D.w - 16, height: 32, rx: 4, fill: '#fff', opacity: 0.3 }, panel);
  el('circle', { cx: D.w - 8, cy: 52, r: 4, fill: pal.yellow }, panel);
  // 札（閉：灰 → 開：緑）
  const card = g({});
  el('line', { x1: 0, y1: -14, x2: 0, y2: 0, stroke: pal.sub, 'stroke-width': 1.6 }, card);
  const cardBody = el('rect', { x: -14, y: 0, width: 28, height: 16, rx: 3, fill: '#B8C2CF' }, card);
  el('circle', { cx: 0, cy: 8, r: 3.6, fill: '#fff' }, card);

  const S = 1.0;
  const me = k.buddy({ x: D.x + D.w + 62, y: FY, scale: S, color: pal.blue, dark: pal.blueDark, facing: -1 });
  const key = g({});
  el('circle', { r: 5, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3 }, key);
  el('rect', { x: 4, y: -1.6, width: 14, height: 3.2, fill: pal.yellowDark }, key);
  const hand = el('circle', { r: 6.5 * S, fill: pal.blue, stroke: pal.blueDark, 'stroke-width': 2.5 });
  const star = g({});
  el('path', { d: 'M 0 -10 L 3 -3 L 10 -3 L 4.5 2 L 6.5 9 L 0 5 L -6.5 9 L -4.5 2 L -10 -3 L -3 -3 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, star);

  return {
    update(t) {
      const rc = easeInOut(seg(t, 0.9, 1.7)), turn = seg(t, 1.8, 2.2), open = easeInOut(seg(t, 2.3, 3.0));
      const pr = easeOut(seg(t, 3.3, 3.9));
      const lx = D.x + D.w + 6, ly = D.y + 48;
      const w = seg(t, 0, 0.9);
      me.pose({ x: lerp(D.x + D.w + 62, D.x + D.w + 52, easeOut(w)), walk: w < 1 ? t * 9 : 0, armL: 8 + 30 * pr, armR: 40, lean: 4 * rc * (1 - pr), look: 0.5, mood: pr > 0.4 ? 'grin' : 'smile', squash: 1 + 0.03 * pr });
      const ang = lerp(40, reach(me, S, 'R', lx, ly), rc);
      me.pose({ armR: lerp(ang, 150, easeInOut(seg(t, 3.0, 3.6))) });
      const h = hp(me, S, 'R', 26);
      k.set(hand, { cx: h.x, cy: h.y });
      tf(key, h.x - 2, h.y - 1, 0, -S, S * Math.cos(Math.PI * turn));
      key.setAttribute('opacity', t < 3.0 ? 1 : 0);
      tf(panel, D.x, D.y, 0, lerp(1, 0.14, open), 1);
      cardBody.setAttribute('fill', seg(t, 2.8, 3.1) > 0.5 ? pal.green : '#B8C2CF');
      tf(card, D.x + D.w + 14, D.y + 14, 8 * wobble(seg(t, 2.8, 3.8), 3, 4));
      glow.setAttribute('opacity', 0.9 * seg(t, 3.0, 3.8));
      tf(star, X + 105, 40 - 3 * Math.sin(t * 3), 0, backOut(seg(t, 3.4, 4.0)) + 0.001);
    }
  };
}
