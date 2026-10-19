// foot：列で後ろに下がったとき、うしろの人の足をうっかりふんでしまう。ごめんなさいとおじぎ（例文 I stepped on his foot by mistake.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt, bp, legs, feet, legG, ache } from './body.js';
import { streetBg } from './weigh.js';
import { say } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, 'うしろへ下がる'], [1.2, '足をふんだ'], [2.4, 'ごめんなさい']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.25, FY = 240;
  streetBg(k, FY);
  const him = k.buddy({ x: 150, y: FY, scale: S, facing: 1, color: pal.blue, dark: pal.blueDark });
  const hf = feet(k, him, '#3D4A5C');
  const me = k.buddy({ x: 250, y: FY, scale: S, facing: 1 });
  const mf = feet(k, me, '#7A5236');
  const hurt = ache(k);
  const sb = say(k, 64, 30, 1); k.text(0, 1, 'Sorry!', { 'font-size': 13 }, sb.g);
  return {
    update(t) {
      // 私は前を見たまま後ろへ下がり、かかとが彼のつま先に乗る
      const back = easeInOut(seg(t, 0.3, 1.1));
      const turn = t > 2.0;
      P(me, { x: lerp(250, 206, back), facing: turn ? -1 : 1, lean: turn ? 22 * easeInOut(seg(t, 2.4, 2.8)) : 0, mood: t > 1.2 ? (turn ? 'sad' : 'open') : 'smile', look: t > 1.3 && !turn ? -0.9 : 0.3, blink: blinkAt(t) });
      legs(me, turn ? 0 : 8 * back, turn ? 0 : -6 * back);
      const step = t > 1.1 && t < 2.0;
      const hop = t > 1.2 && t < 2.6 ? Math.abs(Math.sin((t - 1.2) * 9)) * 10 : 0;
      P(him, { x: 150, lift: hop, mood: t > 1.15 ? (t > 3.4 ? 'smile' : 'open') : 'smile', blink: t > 1.15 && t < 2.2 ? 1 : blinkAt(t, 1), armL: t > 1.2 && t < 2.6 ? 60 : 10, armR: t > 1.2 && t < 2.6 ? 60 : 10 });
      if (t > 1.15 && t < 2.6) legs(him, 0, -40);
      hf[1].setAttribute('fill', t > 1.15 && t < 3.2 ? '#E86F57' : '#3D4A5C');
      if (step) me.pose({ lift: 3 });
      const f = bp(him, S, 18, 12);
      hurt.set(easeOut(seg(t, 1.15, 1.35)) * (1 - seg(t, 2.8, 3.2)), f.x + 6, f.y - 26, t, 30);
      sb.show(seg(t, 2.5, 2.8), 230, 100);
    }
  };
}
