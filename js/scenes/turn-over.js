// turn over：机の上で伏せてあるカードを手でひっくり返し、裏の答えを読む（例文 Turn over the card and read the answer.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt, win } from './run-after.js';
import { reach } from './weigh.js';
import { table } from './dig.js';

export const meta = { duration: 4.0, beats: [[0, '伏せたカード'], [1.3, 'ひっくり返す'], [2.8, '答えを読む']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const TY = table(k, 150, 'indoor');
  const w = win(k, 230, 40, 100, 70); w.frame();
  const S = 0.9;
  const b = k.buddy({ x: 104, y: 236, scale: S });
  // カード：原点＝左端の中心（ここを軸に回す）
  const card = g({}), inner = g({}, card);
  const back = g({}, inner);
  el('rect', { x: -38, y: -15, width: 76, height: 30, rx: 4, fill: pal.blue, stroke: pal.blueDark, 'stroke-width': 2 }, back);
  for (let i = 0; i < 5; i++) el('circle', { cx: -26 + i * 13, cy: 0, r: 3.5, fill: '#fff', opacity: 0.5 }, back);
  const face = g({}, inner);
  el('rect', { x: -38, y: -15, width: 76, height: 30, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, face);
  const ans = k.text(0, 1, '7', { 'font-size': 20, fill: pal.coralDark }, face);
  el('ellipse', { cx: 250, cy: TY + 2, rx: 40, ry: 5, fill: pal.shadow });
  // 問題メモ
  el('rect', { x: 316, y: 180, width: 56, height: 20, rx: 2, fill: '#FFF7CF' }); k.text(344, 190.5, '3+4=?', { 'font-size': 11, fill: pal.sub });
  return {
    update(t) {
      // 裏返し：右端をつまんで持ち上げ、左端を軸に回して左へ倒す
      const f = easeInOut(seg(t, 1.0, 2.0));
      const ang = 180 * f;
      const sx = Math.cos((ang * Math.PI) / 180);
      const lift = 10 * hump(f);
      const x0 = 250;
      tf(card, x0, TY - lift);
      inner.setAttribute('transform', `scale(${sx.toFixed(3)} 1)`);
      back.setAttribute('opacity', sx >= 0 ? 1 : 0); face.setAttribute('opacity', sx < 0 ? 1 : 0);
      ans.setAttribute('transform', 'scale(-1 1)');
      // 手先はカードの右端（回転後は左側）
      const ex = x0 + 38 * sx, ey = TY - lift - 22 * Math.sin((ang * Math.PI) / 180);
      const grab = easeInOut(seg(t, 0.3, 0.9)), rel = easeInOut(seg(t, 2.1, 2.5));
      const read = easeInOut(seg(t, 2.4, 2.9));
      P(b, { x: 104, lean: 6 + 10 * read, look: 0.8, armR: 40, mood: t > 2.8 ? 'open' : 'smile', blink: blinkAt(t) });
      const tgt = reach(b, S, 'R', t < 1.0 ? 288 : ex, t < 1.0 ? TY - 2 : ey - 2);
      P(b, { x: 104, lean: 6 + 10 * read, look: 0.8, armR: t < 1.0 ? lerp(10, tgt, grab) : lerp(tgt, 30, rel), mood: t > 2.8 ? 'grin' : 'smile', blink: blinkAt(t) });
      const ak = backOut(seg(t, 2.6, 3.0));
      ans.setAttribute('font-size', 20 * (0.6 + 0.4 * ak));
    }
  };
}
