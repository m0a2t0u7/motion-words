// station：駅前の大時計が5時を指すころ、待っていたまめのところへ友だちが来て手を振り合う（例文 Meet me at the station at five.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, clock, walk, path } from './vehicle.js';
import { station } from './taxi.js';

export const meta = { duration: 4.4, beats: [[0, '駅で待つ'], [1.8, '5時になる'], [3.2, '会えた']] };

export function create(k) {
  const { el, pal } = k;
  const FY = 236;
  k.backdrop({ floorY: FY });
  station(k, 120, FY, 170);
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#E6EAF0' });
  const ck = clock(k, 205, 60, 24);
  const me = k.buddy({ x: 100, y: FY + 6, scale: 0.86 });
  const fr = k.buddy({ x: 440, y: FY + 6, scale: 0.86, facing: -1, color: pal.coral, dark: pal.coralDark });
  const FX = path([[1.6, 450], [3.2, 196]]);
  return {
    update(t) {
      // 4:50 → 5:00
      const m = 50 + 10 * easeInOut(seg(t, 0.2, 2.2));
      ck.set(m >= 60 ? 5 : 4, m % 60);
      walk(fr, FX, t, { facing: -1, look: -0.5, mood: 'grin', blink: blinkAt(t, 1) });
      if (t > 3.0) fr.pose({ armR: 8 + 150 * easeOut(seg(t, 3.0, 3.4)) + 15 * Math.sin(t * 14) });
      const wv = seg(t, 2.6, 4.4);
      P(me, { x: 100, look: t < 2.2 ? -0.5 + 0.3 * Math.sin(t * 2) : 0.7, mood: t > 2.6 ? 'grin' : 'smile', blink: blinkAt(t), armR: wv > 0 ? 8 + 150 * easeOut(seg(t, 2.6, 3.0)) + 15 * Math.sin(t * 14) : 8, lift: 6 * hump(seg(t, 2.6, 3.0)) });
      me.body.children[3].setAttribute('transform', t < 2.2 ? `translate(${(4 * Math.sin(t * 2)).toFixed(1)} -6)` : 'translate(0 0)');
      void lerp;
    }
  };
}
