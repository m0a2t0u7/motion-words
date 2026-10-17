// borrow：ペンを貸してもらえるか頼む→相手がペンを渡す→受け取ってメモに書く（例文 Can I borrow your pen?）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, reach } from './weigh.js';

export const meta = { duration: 4.6, beats: [[0, 'ペンを頼む'], [1.9, '手渡される'], [3.6, '借りて使う']] };

function pen(k, parent) {
  const p = k.g({}, parent);
  k.el('rect', { x: -2.8, y: -16, width: 5.6, height: 30, rx: 2.8, fill: k.pal.blue, stroke: k.pal.blueDark, 'stroke-width': 1.2 }, p);
  k.el('path', { d: 'M -2.8 14 L 0 21 L 2.8 14 Z', fill: k.pal.ink }, p);
  k.el('rect', { x: -2.8, y: -16, width: 5.6, height: 6, rx: 2.8, fill: k.pal.yellow }, p);
  return p;
}
export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 150, y: 50, width: 100, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const S = 1.1;
  const me = k.buddy({ x: 140, y: FY, scale: S });
  const you = k.buddy({ x: 262, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  // 小さな机とメモ
  el('rect', { x: 176, y: 204, width: 48, height: 7, rx: 3, fill: pal.woodDark });
  el('rect', { x: 182, y: 211, width: 6, height: FY - 211, fill: pal.woodDark });
  el('rect', { x: 212, y: 211, width: 6, height: FY - 211, fill: pal.woodDark });
  k.shadow(200, FY + 2, 34, 4);
  el('rect', { x: 184, y: 199, width: 30, height: 6, rx: 1.5, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  const ink = el('path', { d: '', stroke: pal.blueDark, 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round' });
  const pn = pen(k, g({})); const pg = pn.parentNode;
  // 吹き出し
  const bub = g({}); tf(bub, 140, 106);
  el('rect', { x: -26, y: -16, width: 52, height: 32, rx: 12, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, bub);
  el('path', { d: 'M -4 16 L 0 26 L 6 16 Z', fill: '#fff' }, bub);
  const bp = pen(k, bub); tf(bp, -9, 0, 40, 0.8);
  k.text(12, 1, '?', { 'font-size': 20, fill: pal.ink }, bub);
  return {
    update(t) {
      const ask = easeInOut(seg(t, 0.4, 1.0)), give = easeInOut(seg(t, 1.2, 2.0)), back = easeInOut(seg(t, 2.3, 2.9));
      const take = t > 2.15;
      bub.setAttribute('opacity', t < 0.3 ? 0 : t < 1.7 ? 1 : 1 - seg(t, 1.7, 1.9));
      tf(bub, 140, 106 - 3 * Math.sin(t * 4));
      // 相手（コーラル）：ペンを持った手を差し出して渡す
      const yt = lerp(lerp(8, 30, 0), 0, 0);
      const yh = { x: lerp(232, 203, give * (1 - back) + 0), y: lerp(176, 176, 0) };
      you.pose({ armR: 0 });
      const yTx = lerp(236, 204, give), yTy = 178;
      const yArm = back > 0 ? lerp(reach(you, S, 'R', 204, 178), 8, back) : reach(you, S, 'R', yTx, yTy);
      you.pose({ armR: t < 1.0 ? lerp(30, 70, seg(t, 0.2, 1.0)) : yArm, armL: 8, mood: t < 2.4 ? 'smile' : 'grin', look: -0.3, lean: 2 });
      // 自分（ミント）：手のひらを出して受け取り、書く
      const wr = take ? seg(t, 3.0, 4.3) : 0;
      const wx = 194 + 4 * Math.sin(wr * 22), wy = 193 - 1.5 * Math.abs(Math.sin(wr * 22));
      const tx = take ? lerp(204, wx, easeInOut(seg(t, 2.3, 3.0))) : lerp(236 - 70, 198, ask);
      const ty = take ? lerp(178, wy, easeInOut(seg(t, 2.3, 3.0))) : lerp(190, 178, ask);
      me.pose({ armR: 0 });
      me.pose({ armR: reach(me, S, 'R', tx, ty), armL: 8, mood: 'smile', look: 0.5, lean: 2 + 3 * wr });
      // ペンの位置：渡すまでは相手の手、受け取ったら自分の手
      const hnd = take ? hp(me, S, 'R', 30) : hp(you, S, 'R', 30);
      tf(pg, hnd.x, hnd.y, take ? -35 : 35 * (take ? 1 : -1) + 0);
      // 紙に書いた線
      const n = Math.floor(wr * 24);
      let d = '';
      for (let i = 0; i <= n; i++) d += (i ? 'L' : 'M') + (186 + i * 1.1).toFixed(1) + ' ' + (202 - 3 * Math.abs(Math.sin(i * 0.9))).toFixed(1) + ' ';
      ink.setAttribute('d', n > 0 ? d : '');
    }
  };
}
