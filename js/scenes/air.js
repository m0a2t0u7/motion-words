// air：山頂で、ひんやり澄んだ空気を胸いっぱいに吸い込み、すがすがしく吐き出す（例文 The mountain air felt fresh.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { scene, mountain, cloudG, P, blinkAt, popIn } from './nature.js';

export const meta = { duration: 4.4, beats: [[0, '山の上'], [1.0, '深く吸う'], [2.9, 'すがすがしい']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  scene(k, { FY: 300, top: '#A8D6F7', bot: '#EAF6FD' });
  [[60, 120], [340, 150]].forEach(([x, y]) => tf(cloudG(k, 80, 26), x, y));
  mountain(k, 70, 300, 240, 110, '#BCD0E2');
  mountain(k, 360, 300, 220, 130, '#B2C7DB');
  // 山頂の岩場
  el('path', { d: 'M 90 300 L 150 222 Q 200 206 250 222 L 320 300 Z', fill: '#9AA9B8' });
  el('path', { d: 'M 150 222 Q 200 206 250 222 L 240 232 Q 200 220 158 232 Z', fill: '#B4C1CE' });
  el('rect', { x: 262, y: 166, width: 4, height: 60, fill: pal.woodDark });
  const flag = el('path', { d: '', fill: pal.coral });
  const FY = 222;
  const b = k.buddy({ x: 200, y: FY, scale: S });
  const streams = [0, 1, 2, 3].map((i) => el('path', { d: '', stroke: '#6FBDE8', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', opacity: 0 }));
  const puffs = [0, 1, 2].map(() => el('path', { d: 'M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z', fill: '#fff' }));
  return {
    update(t) {
      const inh = easeInOut(seg(t, 0.9, 2.3)), exh = easeInOut(seg(t, 2.6, 3.3));
      const fill = inh * (1 - exh);
      P(b, { squash: 1 + 0.07 * fill, lean: -8 * fill, armL: lerp(10, 120, fill) + 20 * exh, armR: lerp(10, 120, fill) + 20 * exh, blink: lerp(blinkAt(t), 1, clamp(inh * 1.4 - exh * 1.4)), mood: exh > 0.3 ? 'grin' : inh > 0.2 ? 'open' : 'smile' });
      // 澄んだ空気の流れ：遠くから鼻先へ吸い込まれる
      streams.forEach((s, i) => {
        const ph = ((t * 0.9 + i * 0.25) % 1), y0 = 70 + i * 30, sx = lerp(360, 214, ph), sy = lerp(y0, 160, ph);
        let d = `M ${sx.toFixed(1)} ${sy.toFixed(1)}`;
        for (let j = 1; j <= 4; j++) d += ` q 8 ${j % 2 ? -6 : 6} 16 0`;
        s.setAttribute('d', d);
        s.setAttribute('opacity', (0.8 * hump(ph) * clamp(inh * 3) * (1 - exh)).toFixed(2));
      });
      puffs.forEach((p, i) => { const q = seg(t, 2.8 + i * 0.2, 3.4 + i * 0.2); tf(p, 160 + i * 40, 92 - (i % 2) * 14, t * 50, popIn(q) * (0.9 + 0.15 * Math.sin(t * 6 + i))); });
      const w = Math.sin(t * 6) * 4;
      flag.setAttribute('d', `M 266 168 Q 280 ${170 + w} 296 ${172 - w} L 294 186 Q 280 ${188 + w} 266 184 Z`);
    }
  };
}
