// ring up：彼女が友だちに電話を鳴らし、相手が出ると、うれしそうに手を振って「こんにちは」とあいさつする（例文 She rang up her friend to say hello.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { roomBg, say, waves, phone, faceAt, hp } from './look-over.js';
import { EAR, holdPhone, remote } from './call-up.js';

export const meta = { duration: 4.2, beats: [[0, '電話を鳴らす'], [1.4, '友だちが出る'], [2.6, 'こんにちは']] };

export function create(k) {
  const { el, pal } = k, S = 0.95;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 120, y: FY, scale: S });
  const ph = phone(k);
  const R = remote(k, 232, 40, 150, 110, pal.coral, pal.coralDark);
  const bub = say(k, 44, 38, -1);
  // 手を振るアイコン
  el('circle', { cx: 0, cy: 2, r: 8, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2 }, bub.g);
  [-1, 1].forEach((d) => el('path', { d: `M ${d * 12} -8 q ${d * 4} 6 0 12`, fill: 'none', stroke: pal.mintDark, 'stroke-width': 2, 'stroke-linecap': 'round' }, bub.g));
  const ring = waves(k, pal.yellowDark);
  return {
    update(t) {
      const toEar = easeInOut(seg(t, 0.2, 0.6)), wave = t > 2.4 ? Math.sin((t - 2.4) * 10) : 0, wv = seg(t, 2.3, 2.5);
      b.pose({ armR: lerp(10, EAR, toEar), armL: 8 + wv * (150 + 18 * wave), lift: 4 * hump(seg(t, 2.2, 2.5)), mood: t > 2.2 ? 'grin' : 'smile', look: 0.6 });
      faceAt(b, 4, 0);
      holdPhone(k, b, S, ph, toEar);
      R.box.show(easeOut(seg(t, 0.6, 0.9)));
      const ans = seg(t, 1.6, 1.9), ringing = t > 0.7 && t < 1.7;
      R.o.pose({ armR: lerp(30, EAR, easeInOut(ans)), armL: 8 + 120 * seg(t, 2.6, 2.8) + 15 * Math.sin(t * 9) * seg(t, 2.6, 2.8), mood: ans > 0.5 ? 'grin' : 'smile', look: 0.5 });
      const h = hp(R.o, 0.55, 'R');
      k.tf(R.ph.g, lerp(328, h.x, easeInOut(ans)), lerp(140, h.y - 3, easeInOut(ans)), lerp(90, 0, ans), 0.55);
      R.ring(ringing ? 1 : 0, (t * 2) % 1, 336, 128, 1, 0.5);
      ring(ringing ? 0.6 : 0, (t * 2) % 1, b.state.x + 50, 150, 1, 0.5);
      bub.show(seg(t, 2.3, 2.5), 196, 126);
    }
  };
}
