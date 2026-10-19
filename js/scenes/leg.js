// leg：長い道を歩きつづけて、脚がくたくた。ベンチに座って脚をさする（例文 My legs are tired from walking.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, bp, ache, legG } from './body.js';
import { parkBg, parkBench } from './bench.js';
import { drop } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '歩きつづける'], [1.8, 'ベンチに座る'], [2.8, '脚が疲れた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.25, FY = 236;
  k.backdrop({ floorY: FY, mood: 'evening' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#E8D9C5' });
  const far = g({});
  for (let i = 0; i < 8; i++) { el('rect', { x: i * 90, y: FY - 40, width: 6, height: 40, fill: '#B99572' }, far); el('circle', { cx: i * 90 + 3, cy: FY - 52, r: 20, fill: '#B9D9A6' }, far); }
  const bench = parkBench(k, 290, FY - 26, FY, 120);
  const b = k.buddy({ x: 150, y: FY, scale: S });
  bench.front();
  const sweat = drop(k), hurt = [ache(k), ache(k)];
  return {
    update(t) {
      // 背景が流れて歩きつづける → ベンチへ
      const walk = t < 1.8, scroll = t * 60 - Math.max(0, t - 1.8) * 60;
      tf(far, -(scroll % 90));
      const go = easeInOut(seg(t, 1.8, 2.5)), sit = easeOut(seg(t, 2.5, 2.8));
      const x = lerp(150, 290, go);
      P(b, { x, y: lerp(FY, FY - 26, sit), walk: walk ? t * 7 : (go > 0 && go < 1 ? (x - 150) * 0.1 : 0), lean: walk ? 10 : 6 * sit, mood: t > 2.4 ? 'sad' : 'flat', blink: blinkAt(t), armL: walk ? 8 + 10 * Math.sin(t * 7) : 10, armR: walk ? 8 - 10 * Math.sin(t * 7) : 10, squash: walk ? 0.97 : 1 - 0.03 * sit });
      const lg = bp(b, S, 14, 8);
      if (t > 2.8) b.pose({ armR: reach(b, S, 'R', lg.x + 6, lg.y + 2 + 4 * Math.sin(t * 14)), lean: 14 });
      const sw = bp(b, S, -22, -70);
      tf(sweat, sw.x, sw.y + 20 * ((t * 0.8) % 1), 0, t > 1.0 ? 1 : 0.001);
      hurt.forEach((a, i) => a.set(easeOut(seg(t, 2.8, 3.1)), b.state.x + (i ? 22 : -22) * S, FY + 4, t + i, i ? 120 : -120));
    }
  };
}
