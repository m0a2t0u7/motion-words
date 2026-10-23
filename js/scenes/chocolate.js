// chocolate：夕ごはんを食べ終えたまめが、板チョコを1かけパキッと割って口に入れる（例文 I ate a piece of chocolate after dinner.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { hp, reach } from './dig.js';
import { plateG } from './flour.js';
import { cloth, mouthOf } from './spinach.js';
import { clock } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, '夕食のあと'], [1.2, '1かけ割る'], [2.6, 'パクッ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = k.backdrop({ floorY: 240, mood: 'evening' });
  el('rect', { x: 250, y: 44, width: 100, height: 70, rx: 6, fill: '#4B5683', stroke: '#fff', 'stroke-width': 5 }); el('circle', { cx: 324, cy: 66, r: 9, fill: '#FFF3C4' });
  const ck = clock(k, 90, 64, 20); ck.set(7, 30);
  const me = k.buddy({ x: 160, y: FY - 2, scale: S });
  const TY = 212; cloth(k, 60, 340, TY, FY, '#FFF4DE', '#E86F57');
  // 食べ終わった皿（重ねて奥へ）
  const dp = g({}); tf(dp, 280, TY); plateG(k, dp, 60); el('path', { d: 'M -8 -6 q 4 -2 8 0 M 6 -5 l 4 -1', stroke: '#E0A93A', 'stroke-width': 1.5 }, dp);
  el('rect', { x: 300, y: TY - 14, width: 3, height: 14, fill: '#AEB8C6' });
  // 板チョコ（テーブルの上、包み紙つき）
  const BX = 236, BYY = TY - 6;
  const bar = g({}); tf(bar, BX, BYY);
  el('rect', { x: -30, y: -8, width: 22, height: 14, rx: 2, fill: '#E86F57' }, bar);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 2; r++) el('rect', { x: -8 + c * 10, y: -8 + r * 7, width: 9.4, height: 6.6, rx: 1.5, fill: '#7A4A2E', stroke: '#5E3620', 'stroke-width': 0.8 }, bar);
  const piece = g({}); el('rect', { x: -5, y: -7, width: 10, height: 14, rx: 2, fill: '#7A4A2E', stroke: '#5E3620', 'stroke-width': 1 }, piece);
  const gap = el('rect', { x: 22.5, y: -8.5, width: 10, height: 15, fill: '#FFF4DE' }, bar);
  const snap = k.text(0, 0, '!', { 'font-size': 18, fill: pal.coralDark });
  return {
    update(t) {
      const br = easeOut(seg(t, 1.2, 1.45)), reachP = easeInOut(seg(t, 0.5, 1.1)), go = easeInOut(seg(t, 1.7, 2.3));
      P(me, { x: 160, y: FY - 2, look: 0.5, mood: t > 2.4 && t < 3.3 ? (Math.sin(t * 22) > 0 ? 'open' : 'smile') : t > 3.3 ? 'grin' : 'smile', blink: t > 3.4 ? 0.8 : blinkAt(t), lean: 6 * reachP * (1 - go) });
      const base = { x: BX + 27, y: BYY - 1 }, mo = mouthOf(me, S);
      const tgt = { x: lerp(base.x, mo.x + 6, go), y: lerp(base.y - 6 * br, mo.y + 4, go) };
      me.pose({ armR: lerp(8, reach(me, S, 'R', tgt.x, tgt.y), Math.max(reachP, go)) });
      const hr = hp(me, S, 'R', 28);
      const pc = t < 1.1 ? base : { x: hr.x + 2, y: hr.y - 2 };
      tf(piece, pc.x, pc.y, t < 1.1 ? 90 : 90 - 60 * br, S * (1 - 0.7 * seg(t, 2.3, 2.6)));
      piece.setAttribute('opacity', t < 2.6 ? 1 : 0);
      gap.setAttribute('opacity', t > 1.1 ? 1 : 0);
      const sp = seg(t, 1.2, 1.6); tf(snap, base.x + 14, base.y - 20 - 8 * sp, 0, Math.max(0.001, hump(sp)));
    }
  };
}
