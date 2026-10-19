// oven：ケーキの型をオーブンに入れて扉を閉め、ダイヤルを30分に合わせると、中で生地がふくらんで焼ける（例文 Bake the cake in the oven for 30 minutes.）
import { seg, lerp, easeInOut, easeOut, wobble } from '../ease.js';
import { reach, hp } from './dig.js';
import { gait } from './weigh.js';
import { P, blinkAt } from './run-after.js';
import { kitchenWall } from './cabinet.js';

export const meta = { duration: 4.4, beats: [[0, '型を持つ'], [1.0, 'オーブンに入れる'], [2.3, '30分焼く']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.88;
  const kw = kitchenWall(k, { x0: 0, x1: 196 });
  const FY = kw.FY, CT = kw.CT;
  kw.counter();
  // ビルトインのオーブン（調理台の下）
  const O0 = 222, O1 = 346, OT = 112, OB = 200;
  k.shadow((O0 + O1) / 2, FY + 1, 72, 4);
  el('rect', { x: O0 - 10, y: 30, width: O1 - O0 + 20, height: FY - 30, fill: '#F3E3C8', stroke: pal.woodDark, 'stroke-width': 2 });
  el('rect', { x: O0 - 4, y: 38, width: O1 - O0 + 8, height: 66, rx: 3, fill: 'none', stroke: pal.woodDark, 'stroke-width': 1.5 });
  el('rect', { x: O0 - 4, y: OB + 6, width: O1 - O0 + 8, height: FY - OB - 12, rx: 3, fill: 'none', stroke: pal.woodDark, 'stroke-width': 1.5 });
  el('rect', { x: O0, y: OT, width: O1 - O0, height: OB - OT, rx: 4, fill: '#4A5468' });
  el('rect', { x: O0 + 6, y: OT + 4, width: O1 - O0 - 12, height: 12, rx: 3, fill: '#2F3747' });
  const disp = k.text(O0 + 30, OT + 10.5, '', { 'font-size': 9, fill: '#7CF2B0' });
  const dial = g({}); tf(dial, O1 - 22, OT + 10);
  el('circle', { r: 5, fill: '#C9D2DE' }, dial); el('rect', { x: -1, y: -5, width: 2, height: 4, fill: pal.ink }, dial);
  const IY = OT + 22, IH = OB - IY - 4;
  const cave = el('rect', { x: O0 + 8, y: IY, width: O1 - O0 - 16, height: IH, rx: 3, fill: '#2A3040' });
  const glow = el('rect', { x: O0 + 8, y: IY, width: O1 - O0 - 16, height: IH, rx: 3, fill: '#FF9F4A', opacity: 0 });
  el('rect', { x: O0 + 10, y: IY + IH - 12, width: O1 - O0 - 20, height: 2, fill: '#8892A3' });
  // ケーキ型と生地
  const tin = g({});
  el('rect', { x: -18, y: -10, width: 36, height: 10, rx: 2, fill: '#AEB7C4' }, tin);
  const dough = el('path', { fill: '#F3D9A4' }, tin);
  // 扉（下に蝶番、手前に倒れて開く）
  const door = g({});
  const wx = O0 + 18, wy = -IH + 8, ww = O1 - O0 - 36, wh = IH - 22;
  el('path', { d: `M ${O0 + 4} ${-IH - 4} h ${O1 - O0 - 8} v ${IH + 4} h ${-(O1 - O0 - 8)} Z M ${wx} ${wy} v ${wh} h ${ww} v ${-wh} Z`, 'fill-rule': 'evenodd', fill: '#5A6579', stroke: '#3D4558', 'stroke-width': 2 }, door);
  const win = el('rect', { x: wx, y: wy, width: ww, height: wh, fill: '#1E2433', opacity: 0.55 }, door);
  el('rect', { x: O0 + 24, y: -IH + 1, width: O1 - O0 - 48, height: 4, rx: 2, fill: '#C9D2DE' }, door);
  const b = k.buddy({ x: 60, y: FY, scale: S });
  const xf = (t) => lerp(60, 172, easeInOut(seg(t, 0.15, 0.9)));
  const spot = { x: (O0 + O1) / 2, y: IY + IH - 12 };
  return {
    update(t) {
      const w = gait(xf, t, 60, 0, 0.12);
      const open = easeInOut(seg(t, 0.95, 1.3)) * (1 - easeInOut(seg(t, 2.05, 2.3)));
      const put = easeInOut(seg(t, 1.35, 1.9)), turn = easeInOut(seg(t, 2.35, 2.65));
      const sy = lerp(1, -0.28, open);
      door.setAttribute('transform', `translate(0 ${OB}) scale(1 ${sy.toFixed(3)})`);
      const pose = { x: w.x, walk: w.walk, lean: w.lean + 18 * Math.max(put * (1 - seg(t, 1.9, 2.1)), 0.6 * turn * (1 - seg(t, 2.8, 3.1))), squash: 1 - 0.05 * put, look: 0.6, blink: blinkAt(t), mood: t > 3.0 ? 'grin' : 'smile' };
      P(b, pose);
      let armR = 60;
      if (t > 1.35) armR = lerp(60, reach(b, S, 'R', spot.x - 20, spot.y - 8), put);
      if (t > 1.9) armR = lerp(armR, 20, easeInOut(seg(t, 1.9, 2.2)));
      if (t > 2.3) armR = lerp(20, reach(b, S, 'R', O1 - 22, OT + 10), turn) * (1 - seg(t, 2.8, 3.1)) + 8 * seg(t, 2.8, 3.1);
      P(b, { ...pose, armR, armL: 10 });
      const h = hp(b, S, 'R', 30);
      if (t < 1.9) tf(tin, lerp(h.x + 14, spot.x, put), lerp(h.y + 10, spot.y, put));
      else tf(tin, spot.x, spot.y);
      tf(dial, O1 - 22, OT + 10, 180 * turn);
      const bake = seg(t, 2.7, 4.2);
      const r = 6 + 12 * easeOut(bake);
      k.set(dough, { d: `M -16 -10 Q -16 ${-10 - r} 0 ${-10 - r} Q 16 ${-10 - r} 16 -10 Z`, fill: bake > 0.6 ? '#E2B571' : '#F3D9A4' });
      const on = seg(t, 2.6, 2.9) * (0.85 + 0.15 * Math.sin(t * 6));
      glow.setAttribute('opacity', 0.55 * on);
      win.setAttribute('opacity', open > 0.02 ? 0 : 0.5 - 0.35 * on);
      disp.textContent = t > 2.6 ? '30:00' : '';
      cave.setAttribute('fill', '#2A3040');
    }
  };
}
