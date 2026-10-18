// on purpose：彼はまわりを見回してから、窓をねらってボールを投げ、にやりとする（例文 He broke the window on purpose.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { streetBg } from './weigh.js';
import { hp } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '見回す'], [1.4, 'ねらって投げる'], [2.6, 'わざと割った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  // 家の壁と窓
  el('rect', { x: 230, y: 50, width: 170, height: FY - 56, fill: '#F3E3D3' });
  const WX = 300, WY = 110;
  el('rect', { x: WX - 36, y: WY - 30, width: 72, height: 60, rx: 3, fill: '#fff' });
  const glass = el('rect', { x: WX - 32, y: WY - 26, width: 64, height: 52, fill: '#CFE9F7' });
  const cracks = el('path', { d: `M ${WX} ${WY} L ${WX - 20} ${WY - 20} M ${WX} ${WY} L ${WX + 24} ${WY - 14} M ${WX} ${WY} L ${WX + 6} ${WY + 24} M ${WX} ${WY} L ${WX - 26} ${WY + 10} M ${WX} ${WY} L ${WX + 26} ${WY + 18}`, stroke: pal.ink, 'stroke-width': 2, opacity: 0 });
  const hole = el('path', { d: `M ${WX - 8} ${WY - 6} L ${WX + 2} ${WY - 10} L ${WX + 9} ${WY - 2} L ${WX + 5} ${WY + 8} L ${WX - 6} ${WY + 7} Z`, fill: '#4A5670', opacity: 0 });
  const shards = [0, 1, 2, 3, 4].map(() => el('polygon', { points: '0,0 6,2 2,7', fill: '#BFE3F5', stroke: '#8FBCD8', 'stroke-width': 1 }));
  // 照準の点線（ねらう）
  const aim = el('path', { d: '', stroke: pal.coralDark, 'stroke-width': 2, 'stroke-dasharray': '4 5', fill: 'none' });
  const tgt = el('circle', { cx: WX, cy: WY, r: 12, fill: 'none', stroke: pal.coralDark, 'stroke-width': 2.5, opacity: 0 });
  const b = k.buddy({ x: 120, y: FY, facing: 1 });
  const ball = el('circle', { r: 7, fill: pal.white, stroke: pal.red, 'stroke-width': 2 });
  return {
    update(t) {
      // 見回す（左右）
      const scan = t < 1.2 ? Math.sin(seg(t, 0.2, 1.2) * Math.PI * 2) : 0;
      const wind = easeInOut(seg(t, 1.5, 1.9));
      const thr = easeOut(seg(t, 1.9, 2.05));
      const facing = t < 1.2 && scan < -0.3 ? -1 : 1;
      P(b, { x: 120, facing, look: t < 1.2 ? Math.abs(scan) * 0.9 : 0.8, lean: t < 1.9 ? -6 * wind : lerp(-6, 14, thr) * (1 - seg(t, 2.4, 2.9)) + 0, armR: t < 1.9 ? lerp(30, 170, wind) : lerp(170, 60, thr), armL: lerp(8, 40, wind) * (1 - thr), mood: t > 2.4 ? 'grin' : 'flat', blink: blinkAt(t) });
      b.body.children[3].setAttribute('transform', `translate(${(facing > 0 ? 3 : 3).toFixed(2)} ${(t > 1.2 && t < 1.9 ? -2 : 0).toFixed(2)})`);
      const h = hp(b, 1);
      // ボール：手→窓
      const fl = seg(t, 1.98, 2.3);
      const sx = 150, sy = FY - 112;
      const bx = t < 1.98 ? h.x : lerp(sx, WX, fl), by = t < 1.98 ? h.y - 4 : lerp(sy, WY, fl) - 26 * hump(fl);
      tf(ball, bx, by, 0, 1);
      ball.setAttribute('opacity', t < 2.3 ? 1 : 0);
      const aimP = seg(t, 1.2, 1.5) * (1 - seg(t, 1.98, 2.1));
      aim.setAttribute('d', `M ${h.x + 6} ${h.y - 8} Q ${(h.x + WX) / 2} ${WY - 40} ${WX - 10} ${WY}`);
      aim.setAttribute('opacity', aimP);
      tgt.setAttribute('opacity', aimP);
      const broke = t >= 2.3;
      cracks.setAttribute('opacity', broke ? 1 : 0); hole.setAttribute('opacity', broke ? 1 : 0);
      glass.setAttribute('fill', broke ? '#BCD6E6' : '#CFE9F7');
      const sp = seg(t, 2.3, 3.1);
      shards.forEach((s, i) => { const vx = (i - 2) * 22, vy = -40 + i * 8; tf(s, WX + vx * sp, WY + vy * sp + 200 * sp * sp, sp * 300 * (i % 2 ? 1 : -1)); s.setAttribute('opacity', sp > 0 && sp < 1 ? 1 : 0); });
    }
  };
}
