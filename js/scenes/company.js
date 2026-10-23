// company：大きな会社のビルへ、社員証を下げたまめがかばんを持って入っていき、上の階の窓の席で働き始める（例文 She works for a big company.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hold, walkTo, path, streetBg, idCard, monitor } from './confused.js';
import { bagProp } from './bag.js';

export const meta = { duration: 4.4, beats: [[0.0, '大きな会社'], [1.34, '中へ入る'], [3.06, '会社で働く']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const FY = streetBg(k);
  // 高いビル（会社のマーク付き）
  const BX = 170, BW = 200, BT = 20;
  el('rect', { x: BX, y: BT, width: BW, height: FY - BT, fill: '#C9D6E6' });
  el('rect', { x: BX - 6, y: BT - 8, width: BW + 12, height: 12, rx: 3, fill: '#9FB2C9' });
  el('circle', { cx: BX + BW / 2, cy: BT + 24, r: 14, fill: '#fff' });
  el('path', { d: `M ${BX + BW / 2 - 8} ${BT + 30} L ${BX + BW / 2} ${BT + 14} L ${BX + BW / 2 + 8} ${BT + 30} Z`, fill: pal.blueDark });
  const wins = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) wins.push(el('rect', { x: BX + 12 + c * 38, y: BT + 50 + r * 34, width: 28, height: 22, rx: 2, fill: (r * 5 + c) % 3 ? '#E8F2FB' : '#FFF1C4' }));
  // 中で働く人の小窓（2階の大きな窓）
  const WX = BX + 12, WY = BT + 50 + 3 * 34, WW = 66, WH = 22;
  const inside = g({ 'clip-path': k.clip((c) => el('rect', { x: WX, y: WY - 10, width: WW, height: WH + 10 }, c)) });
  el('rect', { x: WX, y: WY - 10, width: WW, height: WH + 10, fill: '#FFF1C4' }, inside);
  monitor(k, WX + 46, WY + 32, inside).g.setAttribute('transform', `translate(${WX + 46} ${WY + 32}) scale(0.45) translate(${-(WX + 46)} ${-(WY + 32)})`);
  const mini = k.buddy({ x: WX + 22, y: WY + 34, scale: 0.36, parent: inside });
  // 入口の自動ドア
  const DX = BX + 120, DW = 56, DT = FY - 64;
  el('rect', { x: DX - 4, y: DT - 4, width: DW + 8, height: 68, fill: '#7F93AD' });
  el('rect', { x: DX, y: DT, width: DW, height: 64, fill: '#3E4A5C' });
  const doors = [0, 1].map(() => el('rect', { y: DT, width: DW / 2, height: 64, fill: '#A9D3EE', stroke: '#fff', 'stroke-width': 2, opacity: 0.9 }));
  const b = k.buddy({ x: 20, y: FY, scale: S });
  const bag = bagProp(k, undefined, pal.coffee, '#6B4429', 28, 22), card = idCard(k, undefined, '#DCEBFF', 14, 10);
  const xf = path([[0.1, 20], [2.0, DX + DW / 2]]);
  return {
    update(t) {
      t *= 4.6 / 4.4; // 4.4 秒に収める
      const w = walkTo(xf, t, 20, 1), open = easeInOut(seg(t, 1.3, 1.7)) * (1 - easeInOut(seg(t, 2.3, 2.7)));
      const inB = t > 2.05;
      P(b, { x: w.x, walk: w.walk, lean: w.lean, armL: w.armL, armR: 12, mood: 'smile', look: 0.5, blink: blinkAt(t) });
      // ドアの奥へ入ったら外の姿は隠す
      [b.g, bag, card].forEach((n) => n.setAttribute('display', inB ? 'none' : 'inline'));
      hold(k, b, S, bag, 'R', 0, 28, 0.9);
      tf(card, w.x + 4, FY - 52 * S + Math.abs(Math.sin(w.walk)) * -2, 0, S);
      k.set(doors[0], { x: DX - open * DW / 2 + 0 });
      k.set(doors[1], { x: DX + DW / 2 + open * DW / 2 });
      // 窓の中：席に着いてパソコン仕事
      const sit = seg(t, 2.8, 3.1);
      P(mini, { x: lerp(WX - 20, WX + 22, easeOut(sit)), y: WY + 34, walk: t * 9 * (sit > 0 && sit < 1), armR: t > 3.2 ? 70 + 10 * Math.sin(t * 20) : 10, armL: t > 3.2 ? 70 - 10 * Math.sin(t * 20) : 10, mood: 'smile', look: 0.6, blink: blinkAt(t) });
      wins[15].setAttribute('fill', '#FFF1C4');
      inside.setAttribute('opacity', seg(t, 2.6, 2.8));
    }
  };
}
