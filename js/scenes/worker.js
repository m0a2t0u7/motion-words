// worker：ヘルメットの作業員たちが川に橋をかけている。クレーンの橋げたをまめが受け止め、ハンマーで留めて橋がつながる（例文 The workers are building a new bridge.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { CO, reach, held, P, blinkAt, wear, sc } from './member.js';
import { water } from './nature.js';

export const meta = { duration: 4.4, beats: [[0, '橋を造る'], [1.2, '橋げたを下ろす'], [3.0, '橋がつながる']] };

function hammer(k) {
  const g = k.g({});
  k.el('rect', { x: -2, y: -4, width: 4, height: 24, rx: 2, fill: k.pal.woodDark }, g);
  k.el('rect', { x: -8, y: 18, width: 16, height: 8, rx: 2, fill: '#7A8597' }, g);
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.8, DY = 180;
  k.backdrop({ floorY: 300 });
  water(k, 230, { dx: 30 });
  // 両岸
  el('path', { d: `M 0 ${DY} L 90 ${DY} L 110 300 L 0 300 Z`, fill: '#C9B48F' });
  el('path', { d: `M 400 ${DY} L 310 ${DY} L 290 300 L 400 300 Z`, fill: '#C9B48F' });
  // 橋脚とできている部分
  [150, 250].forEach((x) => el('rect', { x: x - 8, y: DY + 10, width: 16, height: 120, fill: '#A9B7C6' }));
  el('rect', { x: 0, y: DY, width: 196, height: 10, fill: '#8FA3B8' });
  el('rect', { x: 268, y: DY, width: 132, height: 10, fill: '#8FA3B8' });
  // クレーン
  el('rect', { x: 352, y: 30, width: 10, height: DY - 30, fill: pal.yellowDark });
  el('rect', { x: 200, y: 26, width: 170, height: 10, fill: pal.yellow });
  const cable = el('line', { x1: 232, y1: 36, x2: 232, y2: 60, stroke: pal.ink, 'stroke-width': 2 });
  const beam = g({});
  el('rect', { x: -36, y: 0, width: 72, height: 10, fill: '#8FA3B8' }, beam);
  el('path', { d: 'M -30 0 L 0 -16 L 30 0', stroke: pal.ink, 'stroke-width': 1.5, fill: 'none' }, beam);
  const bolt = el('circle', { r: 3, fill: pal.ink });
  const c = k.buddy({ x: 330, y: DY, scale: S, facing: -1, ...CO(k) }); wear(k, c, 'helmet', pal.yellow);
  const b = k.buddy({ x: 150, y: DY, scale: S, facing: 1 }); wear(k, b, 'helmet', pal.yellow);
  const hm = hammer(k);
  const sp = el('path', { d: 'M -8 0 L 8 0 M 0 -8 L 0 8 M -6 -6 L 6 6 M 6 -6 L -6 6', stroke: pal.yellowDark, 'stroke-width': 2.4 });
  return {
    update(t) {
      const dn = easeInOut(seg(t, 0.2, 2.0)), land = seg(t, 2.0, 2.4);
      const by = lerp(70, DY, dn) + 1.5 * wobble(land, 2, 6);
      tf(beam, 232, by);
      k.set(cable, { y2: by - 16 + (t > 2.6 ? -(t - 2.6) * 60 : 0) });
      cable.setAttribute('opacity', t > 3.2 ? 0 : 1);
      // まめ：降りてくる橋げたに手を添えて誘導 → ハンマーで留める
      const guide = 1 - seg(t, 2.1, 2.4);
      P(b, { lean: 4, look: 0.6, blink: blinkAt(t), mood: t > 3.4 ? 'grin' : 'flat' });
      const hits = t > 2.4 && t < 3.6 ? Math.abs(Math.sin((t - 2.4) * Math.PI * 2.5)) : 0;
      if (guide > 0) b.pose({ armR: lerp(60, reach(b, S, 'R', 200, by + 4), guide), armL: lerp(20, reach(b, S, 'L', 204, by + 2), guide) });
      else b.pose({ armR: lerp(150, 70, hits), armL: 20, lean: 10 });
      held(k, b, S, hm, 'R', 0); hm.setAttribute('opacity', t > 2.3 ? 1 : 0);
      tf(bolt, 200, DY + 5, 0, sc(seg(t, 2.6, 2.8)));
      const hit = t > 2.4 && t < 3.6 && hits > 0.92;
      tf(sp, 200, DY - 2, 0, hit ? 1 : 0.001);
      P(c, { lean: 6, look: 0.5, blink: blinkAt(t, 1.2), armR: t > 3.4 ? 8 + 150 * hump(seg(t, 3.4, 4.4)) : reach(c, S, 'R', 262, by + 2), armL: 20, mood: t > 3.4 ? 'grin' : 'flat' });
    }
  };
}
