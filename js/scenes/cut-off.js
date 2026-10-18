// cut off：工事の人が道ばたのバルブを回して水を止め、家の蛇口の水が止まってから管の修理を始める（例文 They cut off the water for the repair work.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { hp, reach } from './dig.js';
import { streetBg } from './weigh.js';

export const meta = { duration: 4.6, beats: [[0, '水が出ている'], [1.4, 'バルブを閉める'], [3.4, '水が止まった']] };

const easeIn2 = (p) => p * p;

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  // 管（地面の下）と、右の家の外の蛇口
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#D9C8B4' });
  el('rect', { x: 40, y: FY + 26, width: 330, height: 12, rx: 5, fill: '#9AA6B6' });
  el('rect', { x: 362, y: 150, width: 12, height: 126, rx: 5, fill: '#9AA6B6' });
  el('rect', { x: 330, y: 146, width: 44, height: 10, rx: 5, fill: '#9AA6B6' });
  el('rect', { x: 326, y: 146, width: 8, height: 18, rx: 3, fill: '#9AA6B6' });
  el('path', { d: `M 302 ${FY - 22} L 350 ${FY - 22} L 346 ${FY} L 306 ${FY} Z`, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  const stream = el('rect', { x: 327, y: 164, width: 6, height: 0, rx: 3, fill: pal.water });
  const spl = el('ellipse', { cx: 326, cy: FY - 22, rx: 10, ry: 3, fill: pal.water });
  // 穴と修理する管の継ぎ目
  el('path', { d: `M 160 ${FY} Q 200 ${FY + 56} 240 ${FY} Z`, fill: '#8E7442' });
  el('rect', { x: 186, y: FY + 24, width: 28, height: 16, rx: 3, fill: pal.sub });
  const leak = [0, 1, 2].map(() => el('circle', { r: 2.6, fill: pal.water }));
  // バルブ（地上の柱）
  el('rect', { x: 96, y: FY - 40, width: 10, height: 66, fill: pal.sub });
  const wheel = g({}); tf(wheel, 101, FY - 44);
  el('circle', { r: 14, fill: 'none', stroke: pal.red, 'stroke-width': 4 }, wheel);
  el('path', { d: 'M -14 0 L 14 0 M 0 -14 L 0 14', stroke: pal.red, 'stroke-width': 3 }, wheel);
  el('circle', { r: 4, fill: pal.coralDark }, wheel);
  // 工事の人（ヘルメット）
  const S = 0.95;
  const W1 = k.buddy({ x: 52, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  const W2 = k.buddy({ x: 262, y: FY, scale: S, color: pal.blue, dark: pal.blueDark, facing: -1 });
  [W1, W2].forEach((w) => el('path', { d: 'M -30 -74 Q 0 -104 30 -74 L 34 -72 L -34 -72 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, w.body));
  const wrench = g({});
  el('rect', { x: -2.5, y: 0, width: 5, height: 22, rx: 2, fill: pal.sub }, wrench);
  el('path', { d: 'M -7 20 L 7 20 L 7 30 L 3 30 L 3 24 L -3 24 L -3 30 L -7 30 Z', fill: pal.sub }, wrench);
  return {
    update(t) {
      const turn = easeInOut(seg(t, 1.0, 2.6));
      const flow = 1 - easeIn2(seg(t, 2.2, 2.9));
      const top = 164 + (1 - flow) * 30;
      k.set(stream, { y: top, height: Math.max(0, FY - 22 - top), width: 6, opacity: flow > 0.03 ? 1 : 0 });
      k.set(spl, { rx: 10 * flow, opacity: flow });
      tf(wheel, 101, FY - 44, turn * 540);
      // 手先が輪の縁をつかんで回す
      W1.pose({ lean: 8, look: 0.5, mood: t > 2.9 ? 'smile' : 'flat', armL: 10 });
      const a = turn * 540 * Math.PI / 180;
      const rx = 101 - 14 * Math.cos(a), ry = FY - 44 - 14 * Math.sin(a);
      const app = easeInOut(seg(t, 0.3, 0.8));
      W1.pose({ armR: lerp(10, reach(W1, S, 'R', rx, ry), app) });
      // 2人目：水が止まるのを待ち、止まったら継ぎ目をレンチで締める
      const go = easeInOut(seg(t, 3.0, 3.3));
      const fix = t > 3.3 ? Math.sin((t - 3.3) * 10) : 0;
      W2.pose({ lean: lerp(2, 22, go), squash: 1 - 0.06 * go, look: t < 2.9 ? 0.2 : 0.6, mood: t > 3.0 ? 'smile' : 'flat', armL: 10 });
      W2.pose({ armR: lerp(20, reach(W2, S, 'R', 212, FY + 6), go) });
      const h = hp(W2, S, 'R');
      tf(wrench, h.x, h.y, 140 + 25 * fix);
      wrench.setAttribute('opacity', t > 2.9 ? 1 : 0);
      // 継ぎ目からのもれも止まる
      leak.forEach((d, i) => { const q = (t * 1.5 + i / 3) % 1; tf(d, 214 + 6 * q, FY + 28 - 12 * hump(q) + 10 * q); d.setAttribute('opacity', flow > 0.1 ? 1 : 0); });
    }
  };
}
