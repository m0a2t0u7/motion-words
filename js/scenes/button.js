// button：バスに向かって走っていると、シャツのボタンがひとつ取れて地面を転がる（例文 A button came off my shirt while I was running for the bus.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, wobble, clamp } from '../ease.js';
import { wardrobe, gait, reach, P, blinkAt } from './skirt.js';
import { mark } from './so-far-so-good.js';

export const meta = { duration: 4.2, beats: [[0, 'バスへ走る'], [1.3, 'ボタンが取れる'], [3.0, '転がった']] };

export function create(k) {
  const { el, g, pal, tf } = k, S = 1.25;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#E3E8EE' });
  el('rect', { x: 0, y: FY, width: 400, height: 3, fill: '#D3DAE3' });
  // バス停とバス（止まっている）
  el('rect', { x: 268, y: 120, width: 4, height: FY - 120, fill: pal.sub });
  el('circle', { cx: 270, cy: 116, r: 13, fill: pal.blue, stroke: '#fff', 'stroke-width': 3 });
  const bus = g({}); tf(bus, 290, FY);
  k.shadow(70, 2, 84, 6, bus);
  el('rect', { x: 0, y: -104, width: 150, height: 92, rx: 12, fill: pal.yellow }, bus);
  el('rect', { x: 0, y: -40, width: 150, height: 8, fill: pal.yellowDark }, bus);
  [16, 58, 100].forEach((x) => el('rect', { x, y: -94, width: 34, height: 30, rx: 4, fill: '#CFE9F7' }, bus));
  el('rect', { x: 4, y: -92, width: 26, height: 74, rx: 3, fill: '#9FD0F2', stroke: pal.yellowDark, 'stroke-width': 3 }, bus);
  [36, 118].forEach((x) => { el('circle', { cx: x, cy: -10, r: 13, fill: pal.ink }, bus); el('circle', { cx: x, cy: -10, r: 5, fill: '#C9D3E0' }, bus); });
  const b = k.buddy({ x: 20, y: FY, scale: S });
  const W = wardrobe(k, b);
  const top = W.top({ color: '#fff', dark: '#C9D3E0', sleeve: 'short', to: -14, collar: true, buttons: 0 });
  W.bottom({ kind: 'trousers', color: '#596377', dark: '#444D5F', from: -14 });
  W.feet('shoe', pal.ink);
  const BC = pal.blueDark;
  const btns = [-28, -21, -14].map((y) => el('circle', { cx: 0, cy: y + 3, r: 3, fill: BC }, top.g));
  const gap = el('path', { d: 'M -1 -15 Q 3 -13 -1 -11', stroke: '#C9D3E0', 'stroke-width': 1.5, fill: 'none' }, top.g);
  el('line', { x1: 0, y1: -34, x2: 0, y2: -14, stroke: '#C9D3E0', 'stroke-width': 1 }, top.g);
  const pop = g({});
  el('circle', { r: 4.2, fill: BC, stroke: '#fff', 'stroke-width': 1 }, pop);
  [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 0.7, fill: '#fff' }, pop));
  const psh = k.shadow(0, 0, 5, 1.5);
  const ex = mark(k, 'bang', k.root, 1.3);
  const xf = (t) => lerp(20, 230, easeInOut(seg(t, 0.0, 2.9)));
  const TP = 1.3;
  return {
    update(t) {
      const p = gait(xf, t, 20, 40, 0.16);
      const stop = easeOut(seg(t, 2.9, 3.2));
      P(b, { x: p.x, walk: p.walk, lean: p.lean * 3 * (1 - stop), lift: Math.abs(Math.sin(p.walk)) * 7 * p.m, armL: 8 + (p.armL - 8) * 2.4, armR: 8 + (p.armR - 8) * 2.4,
        look: t < 3.0 ? 0.6 : lerp(0.6, -0.9, easeOut(seg(t, 3.1, 3.5))), mood: t > 3.0 ? 'open' : 'flat', blink: blinkAt(t) });
      if (t > 3.0) b.pose({ armR: lerp(8, reach(b, S, 'R', p.x + 4 * S, FY - 22 * S), easeOut(seg(t, 3.0, 3.4))) });
      btns[1].setAttribute('display', t < TP ? 'inline' : 'none');
      gap.setAttribute('opacity', t < TP ? 0 : 1);
      // 取れたボタン：前へはじけ → 落ちて2回はねて → 転がって止まる
      const x0 = xf(TP) + 2 * S, y0 = FY - (10 + 20) * S;
      const u = t - TP;
      let x, y;
      if (u < 0) { x = x0; y = y0; }
      else {
        const T1 = 0.42, T2 = 0.28, T3 = 0.16;
        const roll = clamp((u - T1 - T2 - T3) / 1.2);
        x = x0 + 40 * Math.min(u, T1) / T1 - 0 + (u > T1 ? 26 * Math.min(u - T1, T2 + T3) / (T2 + T3) : 0) + 40 * easeOut(roll) * -1 * -1;
        if (u < T1) { const q = u / T1; y = lerp(y0, FY + 4, q) - 26 * Math.sin(q * Math.PI * 0.6); }
        else if (u < T1 + T2) y = FY + 4 - 14 * hump((u - T1) / T2);
        else if (u < T1 + T2 + T3) y = FY + 4 - 5 * hump((u - T1 - T2) / T3);
        else y = FY + 4;
      }
      tf(pop, x, y - 6, (x - x0) * 8, 1.5);
      pop.setAttribute('opacity', u > 0 ? 1 : 0);
      k.set(psh, { cx: x, cy: FY + 4, opacity: u > 0 ? 1 : 0 });
      tf(ex, p.x + 30, FY - 130, 0, t > 3.1 ? easeOut(seg(t, 3.1, 3.4)) * 1.4 : 0.001);
      void wobble; void easeIn;
    }
  };
}
