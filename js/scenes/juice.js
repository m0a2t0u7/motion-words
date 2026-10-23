// juice：朝、オレンジジュースをパックからグラスに注いで飲む（例文 I drink orange juice every morning.）
import { seg, lerp, easeInOut, clamp } from '../ease.js';
import { kitchen, TOP, arms, vessel, carton, orange, sip, P, blinkAt, track } from './jam.js';
import { clock } from './run-after.js';
import { sunG } from './nature.js';

export const meta = { duration: 4.4, beats: [[0, '朝7時'], [1.0, 'ジュースを注ぐ'], [2.6, 'ごくごく飲む']] };

export function create(k) {
  const S = 1.2;
  const kit = kitchen(k);
  const sun = sunG(k, 14); k.tf(sun.g, 96, 66);
  const ck = clock(k, 200, 56, 20); ck.set(7, 0);
  const b = k.buddy({ x: 170, y: kit.FY, scale: S });
  kit.front();
  orange(k, 290, TOP + 2); orange(k, 308, TOP + 2); orange(k, 299, TOP - 14);
  const glass = vessel(k, null, { w: 24, h: 34, taper: 0.8, glass: true, liquid: '#FFA53A' });
  const pack = k.g({}); k.tf(carton(k, pack), 0, 22);
  const stream = k.el('path', { stroke: '#FFA53A', 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none' });
  const A = arms(k, b, S);
  const GX = 214, GY = TOP + 2, PY = TOP + 2 - 25;
  const hand = track([[0, 262, PY], [0.5, 262, PY - 6], [0.9, 244, 150], [1.9, 244, 150], [2.3, 262, PY]]);
  return {
    update(t) {
      const blink = blinkAt(t);
      const pour = easeInOut(seg(t, 0.9, 1.2)) * (1 - easeInOut(seg(t, 1.9, 2.2)));
      const fill = easeInOut(seg(t, 1.1, 1.9));
      const drink = seg(t, 2.6, 3.0) * (1 - seg(t, 4.0, 4.3));
      P(b, { lean: 4, look: 0.5, blink: drink > 0.6 ? 1 : blink, mood: t > 4.0 ? 'grin' : drink > 0.6 ? 'flat' : 'smile', squash: 1 });
      // 右手：パックを持って注ぐ → カウンターに戻す
      const h = A.to('R', hand(t).x, hand(t).y);
      k.tf(pack, h.x, h.y, -105 * pour, 1.15);
      const an = (-105 * pour * Math.PI) / 180, tipX = h.x + 22 * 1.15 * Math.sin(an) * -1 * -1, tipY = h.y - 22 * 1.15 * Math.cos(an);
      k.set(stream, { d: `M ${tipX.toFixed(1)} ${tipY.toFixed(1)} Q ${GX + 2} ${tipY + 6} ${GX} ${GY - 10 - 34 * fill * 0.85}`, opacity: pour > 0.85 && t < 1.95 ? 1 : 0 });
      // 左手：グラスを持ち上げて飲む
      const lv = 0.85 * fill * (1 - easeInOut(seg(t, 3.0, 3.9)) * 0.92);
      glass.set(lv);
      const q = easeInOut(seg(t, 2.4, 3.0)) * (1 - easeInOut(seg(t, 3.9, 4.4)));
      if (t < 2.4) { k.tf(glass.g, GX, GY, 0, 1.2); A.to('L', 150, 214); }
      else sip(k, A, b, S, glass.g, 'L', { x: GX, y: GY }, q, { sc: 1.2, w: 24, h: 34 });
      void drink;
    }
  };
}
