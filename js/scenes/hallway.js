// hallway：学校の廊下を走るまめを先生が手で止め、まめは歩いて進む（例文 Please don't run in the hallway.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, blinkAt, run } from './run-after.js';
import { gait } from './dig.js';
import { say } from './look-over.js';

// 廊下の背景（教室の戸・窓・長い床）
export function hallBg(k, FY = 236) {
  const { el, pal } = k;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#F1EEE6' });
  el('rect', { x: 0, y: FY - 40, width: 400, height: 40, fill: '#E2D7C4' });
  el('rect', { x: 0, y: FY - 42, width: 400, height: 3, fill: '#fff' });
  [[20, 'A'], [220, 'B']].forEach(([x]) => {
    el('rect', { x, y: 36, width: 70, height: 46, rx: 3, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 4 });
    el('rect', { x: x + 100, y: 96, width: 56, height: FY - 96, rx: 3, fill: '#D3B58B' });
    el('rect', { x: x + 108, y: 106, width: 40, height: 30, rx: 2, fill: '#DDEFFA' });
    el('rect', { x: x + 104, y: 72, width: 48, height: 16, rx: 3, fill: '#fff', stroke: pal.line });
  });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#E7DCCB' });
  for (let x = -20; x < 420; x += 50) el('line', { x1: x, y1: FY, x2: x - 30, y2: 300, stroke: '#D8CBB5', 'stroke-width': 2 });
  el('rect', { x: 0, y: FY + 18, width: 400, height: 3, fill: '#fff', opacity: 0.4 });
  return FY;
}

export const meta = { duration: 4.4, beats: [[0, '廊下を走る'], [1.4, '走らないで！'], [2.8, '歩いて進む']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = hallBg(k, 236);
  const S = 0.9;
  const tc = k.buddy({ x: 336, y: FY, scale: 1.0, facing: -1, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: -40, y: FY, scale: S });
  // 「走らない」マーク
  const sg = say(k, 54, 50, 1);
  const icon = g({}, sg.g);
  el('circle', { r: 18, fill: '#fff', stroke: pal.red, 'stroke-width': 4 }, icon);
  el('circle', { cx: 2, cy: -9, r: 3.5, fill: pal.ink }, icon);
  el('path', { d: 'M 1 -4 L -2 4 L -9 10 M -2 4 L 5 8 L 5 14 M 0 -2 L 7 2 M 0 -2 L -8 -2', stroke: pal.ink, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, icon);
  el('line', { x1: -13, y1: -13, x2: 13, y2: 13, stroke: pal.red, 'stroke-width': 4 }, icon);
  const dust = [0, 1, 2].map(() => el('circle', { r: 5, fill: '#D8CBB5' }));
  // 走る → 急に止まる → ゆっくり歩く
  const TS = 1.5;
  const xr = (t) => t < TS ? lerp(-40, 170, seg(t, 0, TS)) : 170 + 10 * easeOut(seg(t, TS, TS + 0.3));
  const xw = (t) => lerp(180, 262, easeInOut(seg(t, 2.6, 4.2)));
  return {
    update(t) {
      if (t < 2.4) {
        const r = run(xr, t, -40);
        const brake = seg(t, TS, TS + 0.35);
        P(me, { x: r.x, walk: r.walk, lean: t < TS ? r.lean : -12 * hump(brake), lift: r.lift, armL: t < TS ? r.armL : 8 + 30 * hump(brake), armR: t < TS ? r.armR : 8 + 30 * hump(brake),
          look: 0.6, mood: t < TS ? 'grin' : 'open', blink: blinkAt(t) });
      } else {
        const w = gait(xw, t, 180, 10, 0.09);
        P(me, { x: w.x, walk: w.walk, armL: w.armL, armR: w.armR, lean: 0, look: 0.4, mood: 'smile', blink: blinkAt(t) });
      }
      dust.forEach((d, i) => {
        const p = seg(t, TS + i * 0.06, TS + 0.6 + i * 0.06);
        tf(d, 170 - 16 - i * 10 - 10 * p, FY - 4 - 8 * p, 0, Math.max(0.001, hump(p)));
        d.setAttribute('opacity', p > 0 && p < 1 ? 0.8 : 0);
      });
      // 先生：手のひらを向けて止める
      const stop = easeOut(seg(t, 1.0, 1.4)) * (1 - easeInOut(seg(t, 2.8, 3.2)));
      P(tc, { x: 336, facing: -1, armR: 8 + 85 * stop, lean: 4 * stop, look: 0.6, mood: stop > 0.5 ? 'flat' : 'smile', blink: blinkAt(t, 1) });
      sg.show(seg(t, 1.1, 1.5) * (1 - seg(t, 2.8, 3.0)), 300, 110);
    }
  };
}
