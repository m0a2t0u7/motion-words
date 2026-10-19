// invest：まめが自分のお金の袋を、できたばかりの会社の創業者（コーラル）に渡す。会社のグラフが伸び始める（例文 He invested his money in a new company.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, backOut } from '../ease.js';
import { hp } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { walk, path } from './queue-up.js';
import { streetBg } from './weigh.js';

// お金の袋（原点＝持ち手）
export function moneyBag(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('path', { d: 'M -6 0 L 6 0 L 4 6 Q 18 12 16 28 Q 14 38 0 38 Q -14 38 -16 28 Q -18 12 -4 6 Z', fill: '#D9B27C', stroke: pal.woodDark, 'stroke-width': 2 }, g);
  k.el('rect', { x: -7, y: 3, width: 14, height: 4, rx: 2, fill: pal.woodDark }, g);
  k.text(0, 24, '$', { 'font-size': 15, fill: pal.coffee }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, 'お金を持って'], [1.6, '新しい会社へ'], [3.0, '伸びると期待']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236, S = 0.95;
  streetBg(k, FY);
  // できたばかりの小さな会社（リボン・NEW）
  el('rect', { x: 250, y: 110, width: 130, height: 126, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('path', { d: 'M 244 112 L 315 80 L 386 112 Z', fill: pal.blue });
  el('rect', { x: 296, y: 180, width: 34, height: 56, rx: 3, fill: pal.blueDark });
  el('rect', { x: 262, y: 120, width: 40, height: 18, rx: 4, fill: pal.red });
  k.text(282, 130, 'NEW', { 'font-size': 11, fill: '#fff' });
  // 看板のグラフ
  el('rect', { x: 316, y: 120, width: 56, height: 50, rx: 4, fill: '#F4F8FC', stroke: pal.line, 'stroke-width': 1.5 });
  const bars = [0, 1, 2].map((i) => el('rect', { x: 324 + i * 15, y: 166, width: 10, height: 0, rx: 1.5, fill: pal.green }));
  const arrow = el('path', { d: 'M 0 0 L 30 -22 M 30 -22 L 20 -22 M 30 -22 L 30 -12', stroke: pal.coralDark, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
  const boss = k.buddy({ x: 262, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: 30, y: FY, scale: S, facing: 1 });
  const bag = moneyBag(k);
  const xf = path([[0, 30], [1.5, 176]]);
  return {
    update(t) {
      walk(me, xf, t, { facing: 1, look: 0.6, armR: 30, blink: blinkAt(t) });
      const give = easeInOut(seg(t, 1.6, 2.1)), back = easeInOut(seg(t, 2.3, 2.7));
      if (t > 1.5) P(me, { x: 176, facing: 1, look: 0.7, blink: blinkAt(t), armR: lerp(30, 84, give) * (1 - back) + 10 * back, armL: 10, mood: t > 3.0 ? 'grin' : 'smile' });
      // 創業者：両手で受け取り、胸に抱える
      const recv = easeOut(seg(t, 1.9, 2.2));
      P(boss, { facing: -1, look: 0.6, blink: blinkAt(t, 1), armR: lerp(10, 80, recv) - 30 * back, armL: lerp(10, 60, recv) - 20 * back, mood: t > 2.2 ? 'grin' : 'smile', lift: 8 * hump(seg(t, 2.5, 2.9)) });
      const mh = hp(me, S, 'R'), bh = hp(boss, S, 'R');
      const hand = t < 2.15 ? mh : bh;
      tf(bag, hand.x, hand.y - 6, Math.sin(t * 9) * 3 * (t < 1.5 ? 1 : 0), 0.9);
      // 投資のあと、グラフが順に伸び、矢印が上がる
      bars.forEach((b, i) => { const h = (12 + i * 12) * easeOut(seg(t, 2.8 + i * 0.25, 3.3 + i * 0.25)); k.set(b, { y: 166 - h, height: h }); });
      const ap = backOut(seg(t, 3.6, 4.0));
      arrow.setAttribute('transform', `translate(326 152) scale(${Math.max(0.001, ap)})`);
    }
  };
}
