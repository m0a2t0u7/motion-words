// give up on：夢（高い所の星）に届かず、まめが背を向けかける。相手が「まだだよ」と止めて星を指し、まめはまた向き直って挑む（例文 Don't give up on your dream yet.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, backOut, wobble } from '../ease.js';
import { gait } from './dig.js';
import { star, say } from './get-on-with.js';

export const meta = { duration: 4.6, beats: [[0, '夢に届かない'], [1.8, 'あきらめかける'], [3.4, 'まだあきらめない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'evening' });
  el('path', { d: 'M 0 236 Q 120 200 260 214 T 400 200 L 400 236 Z', fill: '#F6DCC8' });
  const glow = el('circle', { cx: 300, cy: 70, r: 34, fill: pal.yellow, opacity: 0.25 });
  const st = g({}); star(k, st, 22, pal.yellow); tf(st, 300, 70);
  const fr = k.buddy({ x: 70, y: FY, scale: 0.85, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 280, y: FY, scale: 0.9 });
  const bc = say(k, 64, 40);
  const bs = g({}, bc.inner); star(k, bs, 10, pal.yellowDark); tf(bs, -10, 0);
  k.text(16, 1, '!', { 'font-size': 22, fill: pal.coralDark }, bc.inner);
  const xf = (t) => lerp(280, 200, easeInOut(seg(t, 1.9, 2.6))) + lerp(0, 70, easeInOut(seg(t, 3.0, 3.6)));
  return {
    update(t) {
      tf(st, 300, 70 + Math.sin(t * 2) * 3, Math.sin(t * 1.4) * 6);
      glow.setAttribute('r', 30 + Math.sin(t * 3) * 4);
      // ジャンプ（2回）→肩を落とす→背を向けて歩きかける→呼び止められて向き直る→もう一度跳ぶ
      const j1 = hump(seg(t, 0.2, 0.7)), j2 = hump(seg(t, 0.8, 1.3)), j3 = hump(seg(t, 3.8, 4.4));
      const jump = Math.max(j1, j2) * 40 + j3 * 58;
      const crouch = Math.max(hump(seg(t, 0.1, 0.25)), hump(seg(t, 0.7, 0.85)), hump(seg(t, 3.65, 3.85)), hump(seg(t, 4.35, 4.55)));
      const slump = easeInOut(seg(t, 1.35, 1.8)) * (1 - easeInOut(seg(t, 2.7, 3.0)));
      const away = t > 1.85 && t < 2.75;
      const p = gait(xf, t, 280, 10);
      b.pose({ x: p.x, walk: p.walk, facing: away ? -1 : 1, lift: jump, squash: 1 - 0.14 * crouch - 0.06 * slump,
        armR: jump > 2 ? 165 : lerp(lerp(30, 10, slump), 120, easeOut(seg(t, 3.0, 3.3))), armL: jump > 2 ? 150 : lerp(20, 8, slump),
        lean: away ? 10 : -6 * (1 - slump), look: away ? 0.2 : -0.7, mood: slump > 0.4 ? 'sad' : t > 3.0 ? 'grin' : 'flat' });
      // 相手：手を上げて呼び止め、星を指す
      const call = easeOut(seg(t, 2.0, 2.3));
      fr.pose({ armR: lerp(10, lerp(150, 130, seg(t, 2.6, 3.0)), call), armL: 10, mood: call > 0.5 ? 'open' : 'smile', look: 0.6, lift: hump(seg(t, 2.1, 2.4)) * 6, lean: 4 * call });
      bc.show(118, 112, backOut(seg(t, 2.1, 2.45)) * (1 - seg(t, 3.6, 3.9)));
    }
  };
}
