// rent：駅の近くのアパートで、家賃を払い、鍵で開けて借りた部屋に入る（例文 We rent a small apartment near the station.）
import { seg, lerp, easeInOut, easeOut } from '../ease.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 4.8, beats: [[0, '駅の近く'], [1.5, '家賃を払う'], [3.4, '借りた部屋']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: '#E3E8EE' });
  // 駅（左）：屋根・電車の看板
  el('rect', { x: 8, y: 130, width: 126, height: FY - 136, rx: 5, fill: '#F3E6DC' });
  el('path', { d: 'M 0 134 L 71 100 L 142 134 Z', fill: pal.blue, stroke: pal.blue, 'stroke-width': 6, 'stroke-linejoin': 'round' });
  el('rect', { x: 36, y: 146, width: 70, height: 26, rx: 8, fill: '#fff' });
  const tr = g({}); tf(tr, 71, 159);
  el('rect', { x: -20, y: -8, width: 40, height: 15, rx: 5, fill: pal.blue }, tr);
  [-12, 0, 12].forEach((x) => el('rect', { x: x - 4, y: -5, width: 8, height: 6, rx: 1.5, fill: '#fff' }, tr));
  [-12, 12].forEach((x) => el('circle', { cx: x, cy: 9, r: 2.6, fill: pal.ink }, tr));
  el('rect', { x: 44, y: 184, width: 54, height: FY - 190, rx: 3, fill: '#5A6480' });
  // アパート（右）
  const AX = 186;
  el('rect', { x: AX, y: 66, width: 208, height: FY - 72, rx: 6, fill: '#E4EEF7' });
  el('rect', { x: AX - 6, y: 60, width: 220, height: 10, rx: 4, fill: pal.violet });
  const wins = [];
  [84, 130].forEach((y) => [0, 1, 2, 3].forEach((i) => {
    const x = AX + 14 + i * 49;
    el('rect', { x, y, width: 34, height: 32, rx: 4, fill: '#CFE9F7', stroke: '#fff', 'stroke-width': 3 });
    wins.push(el('rect', { x, y, width: 34, height: 32, rx: 4, fill: '#FFD98A', opacity: 0 }));
  }));
  el('rect', { x: 336, y: 172, width: 40, height: 30, rx: 4, fill: '#CFE9F7', stroke: '#fff', 'stroke-width': 3 });
  wins.push(el('rect', { x: 336, y: 172, width: 40, height: 30, rx: 4, fill: '#FFD98A', opacity: 0 }));
  // ドア
  const D = { x: 262, y: FY - 70, w: 42, h: 70 };
  el('rect', { x: D.x - 4, y: D.y - 4, width: D.w + 8, height: D.h + 4, rx: 3, fill: pal.woodDark });
  el('rect', { x: D.x, y: D.y, width: D.w, height: D.h, fill: '#FFD98A' });
  el('rect', { x: D.x + 6, y: FY - 20, width: 30, height: 20, fill: '#E8B864' });
  const panel = g({});
  el('rect', { x: 0, y: 0, width: D.w, height: D.h, rx: 2, fill: pal.coral }, panel);
  el('rect', { x: 7, y: 8, width: D.w - 14, height: 22, rx: 3, fill: '#fff', opacity: 0.3 }, panel);
  el('circle', { cx: D.w - 7, cy: 38, r: 3.6, fill: pal.yellow }, panel);
  // 家賃ポスト
  el('rect', { x: 206, y: 150, width: 28, height: 34, rx: 5, fill: '#8F9BAB' });
  el('rect', { x: 212, y: 158, width: 16, height: 4, rx: 2, fill: '#2A3242' });
  el('circle', { cx: 220, cy: 173, r: 5, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 });
  const SX = 220, SY = 160;

  const S1 = 0.96, S2 = 0.9;
  const me = k.buddy({ x: 158, y: FY, scale: S1 });
  const she = k.buddy({ x: 350, y: FY, scale: S2, facing: -1, color: pal.coral, dark: pal.coralDark });
  const coin = g({});
  el('circle', { r: 7, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.8 }, coin);
  el('circle', { r: 3.6, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 1.4 }, coin);
  const hand1 = el('circle', { r: 6.5 * S1, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.4 });
  const key = g({});
  el('circle', { r: 5, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3 }, key);
  el('rect', { x: 4, y: -1.6, width: 16, height: 3.2, fill: pal.yellowDark }, key);
  el('rect', { x: 15, y: 0, width: 3, height: 5, fill: pal.yellowDark }, key);
  const hand2 = el('circle', { r: 6.5 * S2, fill: pal.coral, stroke: pal.coralDark, 'stroke-width': 2.4 });

  return {
    update(t) {
      // 家賃を払う（1.1〜2.0）
      const up = easeInOut(seg(t, 1.1, 1.7)), back = easeInOut(seg(t, 2.1, 2.7));
      me.pose({ armL: 8, lean: 3, look: 0.6, mood: 'smile', squash: 1, armR: 50 });
      const a = lerp(lerp(50, reach(me, S1, 'R', SX + 4, SY + 6), up), 24, back);
      me.pose({ armR: a, lean: 3 * up * (1 - back) });
      const h = hp(me, S1, 'R', 26);
      k.set(hand1, { cx: h.x, cy: h.y });
      const dr = seg(t, 1.8, 2.05);
      coin.setAttribute('opacity', t < 2.05 ? 1 : 0);
      tf(coin, lerp(h.x + 6, SX, dr * dr), lerp(h.y - 9, SY, dr * dr), 0, lerp(1, 0.6, dr));
      // 鍵でドアを開ける
      const reachK = easeInOut(seg(t, 2.3, 2.9)), turn = seg(t, 3.0, 3.4), open = easeInOut(seg(t, 3.5, 4.2));
      she.pose({ armL: 8, armR: 40, lean: 4 * reachK, look: 0.5, mood: open > 0.3 ? 'grin' : 'smile', squash: 1 });
      she.pose({ armR: lerp(40, reach(she, S2, 'R', 296, FY - 36), reachK) });
      const h2 = hp(she, S2, 'R', 26);
      k.set(hand2, { cx: h2.x, cy: h2.y });
      tf(key, h2.x - 3, h2.y - 2, 0, -S2, S2 * Math.cos(Math.PI * turn));
      tf(panel, D.x, D.y, 0, lerp(1, 0.14, open), 1);
      const lit = easeOut(seg(t, 3.9, 4.6));
      wins.forEach((w) => w.setAttribute('opacity', 0.8 * lit));
      me.pose({ mood: lit > 0.3 ? 'grin' : 'smile' });
    }
  };
}
