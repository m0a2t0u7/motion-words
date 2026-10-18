// pay off：車のローン残高ボードの最後の1マスを、最後の支払いで消し、「完済」になる（例文 We finally paid off the car loan.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt, car, coin, star } from './run-after.js';
import { reach, hp } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '残りわずか'], [1.4, '最後の支払い'], [3.0, '完済した']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // ローン残高ボード（車アイコン＋10マス、残り1マス）
  el('rect', { x: 210, y: 40, width: 170, height: 70, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  const ic = car(k, pal.blue, pal.blueDark); ic.set(240, 0, 72); ic.g.setAttribute('transform', 'translate(240 72) scale(0.28)');
  for (let i = 0; i < 9; i++) el('rect', { x: 262 + i * 11, y: 58, width: 9, height: 16, rx: 2, fill: '#E3E8EE' });
  const last = el('rect', { x: 262 + 9 * 11, y: 58, width: 9, height: 16, rx: 2, fill: pal.red });
  const stamp = g({}); el('rect', { x: -34, y: -12, width: 68, height: 24, rx: 4, fill: 'none', stroke: pal.green, 'stroke-width': 3.5 }, stamp); k.text(0, 1, 'PAID', { 'font-size': 16, fill: pal.green }, stamp);
  // 支払い機（スロット）
  el('rect', { x: 176, y: 140, width: 50, height: 96, rx: 6, fill: '#C9D3E0' });
  el('rect', { x: 186, y: 152, width: 30, height: 6, rx: 3, fill: pal.ink });
  el('rect', { x: 186, y: 168, width: 30, height: 18, rx: 3, fill: '#2F3A4D' });
  const scr = k.text(201, 177.5, '1', { 'font-size': 12, fill: '#9FE8C9' });
  k.shadow(201, 237, 32, 4);
  const S = 0.85;
  const a = k.buddy({ x: 124, y: FY, scale: S });
  const c = k.buddy({ x: 300, y: FY, scale: S * 0.94, facing: -1, color: pal.coral, dark: pal.coralDark });
  const cn = coin(k);
  const sp = [0, 1, 2].map(() => star(k));
  return {
    update(t) {
      const reachP = easeInOut(seg(t, 0.8, 1.4)), rel = easeInOut(seg(t, 1.8, 2.2));
      P(a, { x: 124, facing: 1, armR: 60, look: 0.6, lean: 4, mood: 'smile', blink: blinkAt(t) });
      const r = reach(a, S, 'R', 201, 150);
      const cheer = seg(t, 2.6, 2.9), jump = Math.abs(Math.sin((t - 2.6) * 6)) * cheer * (1 - seg(t, 3.8, 4.2));
      P(a, { x: 124, facing: 1, armR: t < 2.2 ? lerp(30, r, reachP) : lerp(lerp(r, 30, rel), 160, cheer), armL: lerp(8, 160, cheer), look: 0.6, lean: 4 * (1 - cheer), lift: 12 * jump, mood: t > 2.6 ? 'grin' : 'smile', blink: blinkAt(t) });
      P(c, { x: 300, facing: -1, armR: lerp(8, 160, cheer), armL: lerp(8, 160, cheer), lift: 10 * Math.abs(Math.sin((t - 2.7) * 6)) * seg(t, 2.7, 3.0) * (1 - seg(t, 3.9, 4.3)), look: 0.6, mood: t > 2.6 ? 'grin' : 'smile', blink: blinkAt(t, 1) });
      const h = hp(a, S, 'R');
      const into = seg(t, 1.5, 1.75);
      tf(cn, lerp(h.x, 201, into), lerp(h.y - 4, 156, into)); cn.setAttribute('opacity', into < 1 ? 1 : 0);
      const gone = seg(t, 1.9, 2.3);
      last.setAttribute('opacity', 1 - gone); scr.textContent = t > 2.0 ? '0' : '1';
      const sq = seg(t, 2.4, 2.75);
      tf(stamp, 314, 92, -10, lerp(1.8, 1, easeOut(sq))); stamp.setAttribute('opacity', sq > 0 ? 1 : 0);
      sp.forEach((s, i) => s.set([230, 360, 300][i], [40, 36, 126][i], seg(t, 2.6 + i * 0.15, 3.4 + i * 0.15)));
    }
  };
}
