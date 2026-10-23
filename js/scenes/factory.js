// factory：ヘルメットのお父さん（まめ）が工場の門をくぐり、大きな窓の中で機械のボタンを押すと、製品が次々に流れ出す（例文 My father works at a factory.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, aim, walkTo, path, helmet, scene, cloudG, box } from './confused.js';

export const meta = { duration: 4.4, beats: [[0.0, '工場へ行く'], [1.72, '機械を動かす'], [3.06, '物を作る']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.8;
  const { FY } = scene(k, { ground: '#DCE3EA', edge: '#C9D2DD' });
  // のこぎり屋根の工場
  const BX = 60, BW = 320, BT = FY - 130;
  el('rect', { x: BX, y: BT, width: BW, height: 130, fill: '#E7DCCB' });
  for (let i = 0; i < 4; i++) el('path', { d: `M ${BX + i * 80} ${BT} L ${BX + i * 80} ${BT - 30} L ${BX + i * 80 + 80} ${BT} Z`, fill: '#B9A68C' });
  el('rect', { x: BX + BW - 50, y: BT - 90, width: 24, height: 90, fill: '#C98A5A' });
  const steam = [0, 1, 2].map(() => cloudG(k, 34, 18, '#fff', undefined, false));
  // 大きな窓（中が見える）
  const WX = BX + 20, WY = BT + 20, WW = 190, WH = 76;
  el('rect', { x: WX - 4, y: WY - 4, width: WW + 8, height: WH + 8, rx: 4, fill: '#8C96A6' });
  const inside = g({ 'clip-path': k.clip((c) => el('rect', { x: WX, y: WY, width: WW, height: WH }, c)) });
  el('rect', { x: WX, y: WY, width: WW, height: WH, fill: '#F6F1E6' }, inside);
  el('rect', { x: WX, y: WY + 56, width: WW, height: 8, fill: '#4B5566' }, inside);
  // 機械（プレス）
  el('rect', { x: WX + 110, y: WY + 6, width: 40, height: 14, fill: '#6AA8F7' }, inside);
  const press = el('rect', { x: WX + 118, y: WY + 20, width: 24, height: 10, fill: '#4A8BE0' }, inside);
  const btn = el('circle', { cx: WX + 80, cy: WY + 30, r: 5, fill: pal.red }, inside);
  el('rect', { x: WX + 72, y: WY + 26, width: 16, height: 30, fill: '#9FB4CC' }, inside);
  const goods = [0, 1, 2, 3].map(() => box(k, 18, 14, '#E3B77E', inside));
  const mini = k.buddy({ x: WX + 50, y: WY + 66, scale: 0.42, parent: inside });
  helmet(k, mini);
  // 門と入口
  const DX = 280;
  el('rect', { x: DX, y: FY - 70, width: 50, height: 70, fill: '#6E5A4C' });
  el('rect', { x: DX + 4, y: FY - 66, width: 42, height: 66, fill: '#8C7A68' });
  const b = k.buddy({ x: 372, y: FY, scale: S, facing: -1 });
  helmet(k, b);
  const lunch = el('rect', { width: 16, height: 12, rx: 3, fill: pal.blue });
  const xf = path([[0.1, 372], [1.4, DX + 25]]);
  return {
    update(t) {
      t *= 4.6 / 4.4; // 4.4 秒に収める
      steam.forEach((s, i) => { const q = ((t * 0.4) + i / 3) % 1; tf(s, BX + BW - 38 + q * 20, BT - 96 - q * 60, 0, 0.5 + q); s.setAttribute('opacity', 1 - q); });
      const w = walkTo(xf, t, 372, -1), inB = t > 1.5;
      P(b, { x: w.x, walk: w.walk, facing: -1, lean: w.lean, armL: w.armL, armR: 12, mood: 'smile', look: 0.4, blink: blinkAt(t) });
      b.g.setAttribute('display', inB ? 'none' : 'inline');
      const h = { x: w.x - 27 * S - 4, y: FY - 34 * S };
      k.set(lunch, { x: w.x - 30, y: FY - 26, opacity: inB ? 0 : 1 });
      // 窓の中：ボタンを押す→プレスが動く→箱が流れる
      const enter = easeOut(seg(t, 1.6, 2.2)), push = hump(seg(t, 2.3, 2.6)), run = t > 2.5;
      P(mini, { x: lerp(WX - 20, WX + 58, enter), y: WY + 64, walk: t * 9 * (enter < 1 ? 1 : 0), facing: 1, lean: 6 * push, armR: 8, mood: run ? 'grin' : 'smile', blink: blinkAt(t) });
      if (enter >= 1) aim(mini, 0.42, 'R', WX + 80, WY + 30);
      btn.setAttribute('fill', push > 0.3 ? '#C94B40' : pal.red);
      const pr = run ? Math.abs(Math.sin((t - 2.5) * 5)) : 0;
      press.setAttribute('y', WY + 20 + 14 * pr);
      goods.forEach((gd, i) => { const q = run ? ((t - 2.5) * 0.45 + i * 0.25) % 1 : -1; tf(gd, WX + 100 + q * 120, WY + 56, 0, q >= 0 ? 1 : 0.001); });
      inside.setAttribute('opacity', 1);
      void h;
    }
  };
}
