// mall：2人が手をつないで大きなショッピングモールへ向かい、自動ドアから入っていく（例文 Let's go shopping at the mall.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, signBoard } from './restaurant.js';
import { gait } from './dig.js';
import { say } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '買い物に行こう'], [1.2, 'モールへ'], [3.4, '中へ入る']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 244;
  k.backdrop({ floorY: FY, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 56, fill: '#E6EAEF' });
  // 大きな建物：2階建て、旗、ガラスの入口
  el('rect', { x: 120, y: 40, width: 280, height: FY - 40, fill: '#F2EEE8' });
  el('rect', { x: 116, y: 34, width: 288, height: 10, rx: 3, fill: pal.violet });
  signBoard(k, 268, 66, 100, 30, 'MALL', pal.violet);
  [[134, pal.red], [170, pal.yellow], [366, pal.blue]].forEach(([x, c]) => { el('line', { x1: x, y1: 12, x2: x, y2: 44, stroke: pal.sub, 'stroke-width': 2 }); el('path', { d: `M ${x} 12 h 18 l -5 6 l 5 6 h -18 Z`, fill: c }); });
  for (let i = 0; i < 6; i++) { el('rect', { x: 132 + i * 44, y: 92, width: 36, height: 40, rx: 3, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 3 }); }
  // 窓の中の買い物袋・服
  [[150, pal.coral], [238, pal.yellow], [326, pal.green]].forEach(([x, c]) => el('path', { d: `M ${x - 8} 128 L ${x - 6} 112 H ${x + 6} L ${x + 8} 128 Z M ${x - 4} 112 q 4 -8 8 0`, fill: c, stroke: c, 'stroke-width': 1.5 }));
  el('rect', { x: 120, y: 142, width: 280, height: 6, fill: '#E0D8CC' });
  const DX = 236, DW = 80, DT = 160;
  el('rect', { x: DX - 6, y: DT - 6, width: DW + 12, height: FY - DT + 6, rx: 3, fill: '#9AA6B6' });
  el('rect', { x: DX, y: DT, width: DW, height: FY - DT, fill: '#6F8299' });
  el('rect', { x: DX + 4, y: DT + 6, width: DW - 8, height: 40, fill: '#879AB0' });
  const people = g({});
  // 人物（ドアの手前→中へ）
  const A = k.buddy({ x: 30, y: FY, scale: 0.9 });
  const B = k.buddy({ x: -10, y: FY, scale: 0.9, color: pal.coral, dark: pal.coralDark });
  // 自動ドア（左右に開くガラス）
  const dl = el('rect', { x: DX, y: DT, width: DW / 2, height: FY - DT, fill: 'rgba(200,228,246,0.82)', stroke: '#fff', 'stroke-width': 2 });
  const dr = el('rect', { x: DX + DW / 2, y: DT, width: DW / 2, height: FY - DT, fill: 'rgba(200,228,246,0.82)', stroke: '#fff', 'stroke-width': 2 });
  el('rect', { x: DX + DW + 6, y: DT - 12, width: 400 - DX - DW - 6, height: FY - DT + 14, fill: '#F2EEE8' });
  el('rect', { x: DX + DW + 6, y: FY, width: 400, height: 6, fill: '#E6EAEF' });
  el('rect', { x: DX + DW, y: DT - 6, width: 6, height: FY - DT + 6, fill: '#9AA6B6' });
  el('rect', { x: 120, y: 142, width: 280, height: 6, fill: '#E0D8CC' });
  const hand = el('circle', { r: 5.8, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.2 });
  const bub = say(k, 60, 30, -1); k.text(0, 1, "Let's go!", { 'font-size': 11 }, bub.g);
  const xa = (t) => lerp(70, 404, easeInOut(seg(t, 1.0, 4.0)));
  const xb = (t) => xa(t) - 46;
  return {
    update(t) {
      const ga = gait(xa, t, 70), gb = gait(xb, t, 24);
      const inA = xa(t) > DX + DW + 34 ? 1 : 0, inB = xb(t) > DX + DW + 34 ? 1 : 0;
      P(A, { x: ga.x, walk: ga.walk, lean: ga.lean, armR: ga.armR, look: t < 1 ? -0.6 : 0.4, mood: t < 1.0 && Math.sin(t * 22) > 0 ? 'open' : 'grin', blink: blinkAt(t), armL: t < 0.9 ? lerp(10, 120, hump(seg(t, 0.1, 0.9))) : 40 });
      P(B, { x: gb.x, walk: gb.walk, lean: gb.lean, armL: gb.armL, armR: 40, look: 0.5, mood: 'grin', blink: blinkAt(t, 1) });
      // 手をつなぐ（1秒以降）
      const ha = hp(A, 0.9, 'L', 26), hb = hp(B, 0.9, 'R', 26);
      const jn = t > 0.9;
      if (jn) { A.pose({ armL: reach(A, 0.9, 'L', (ha.x + hb.x) / 2, FY - 34) }); B.pose({ armR: reach(B, 0.9, 'R', (ha.x + hb.x) / 2, FY - 34) }); }
      k.set(hand, { cx: (ha.x + hb.x) / 2, cy: FY - 34, opacity: jn && (ha.x + hb.x) / 2 < DX + DW ? 1 : 0 });
      bub.show(seg(t, 0.15, 0.4) * (1 - seg(t, 1.2, 1.4)), 52, 120);
      // ドアは近づくと開き、2人が入ると閉まる
      const open = easeOut(seg(xa(t), 190, 230)) * (1 - easeInOut(seg(xb(t), DX + DW + 20, DX + DW + 60)));
      k.set(dl, { x: DX - (DW / 2 - 6) * open }); k.set(dr, { x: DX + DW / 2 + (DW / 2 - 6) * open });
      A.g.setAttribute('opacity', 1 - inA); B.g.setAttribute('opacity', 1 - inB);
    }
  };
}
