// a change of heart：背を向けて去ろうとしていた彼女が、心を変えて戻り、みんなに加わる（She had a change of heart and joined us.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '去ろうとする'], [1.7, '気持ちが変わる'], [3.7, '仲間に加わる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  const f1 = k.buddy({ x: 315, y: FY, scale: 0.85, facing: -1, color: pal.blue, dark: pal.blueDark });
  const f2 = k.buddy({ x: 365, y: FY, scale: 0.85, facing: -1, color: pal.violet, dark: '#8468DB' });
  const me = k.buddy({ x: 205, y: FY, scale: 0.9, facing: -1, color: pal.coral, dark: pal.coralDark });
  const heart = g({});
  const hs = g({}, heart);
  const hp = el('path', { d: 'M 0 14 C -26 -6 -14 -26 0 -12 C 14 -26 26 -6 0 14 Z', fill: '#9AA4B2', stroke: '#fff', 'stroke-width': 3, 'stroke-linejoin': 'round' }, hs);
  return {
    update(t) {
      const away = seg(t, 0.1, 1.2);
      const back = easeInOut(seg(t, 2.1, 3.7));
      const turn = seg(t, 1.5, 2.0);
      const x = t < 1.2 ? lerp(205, 140, easeOut(away)) : t < 2.1 ? 140 : lerp(140, 245, back);
      const facing = t < 1.75 ? -1 : 1;
      const walking = (t > 0.1 && t < 1.2) || (t > 2.1 && t < 3.7);
      const sw = Math.sin(t * 9) * 18;
      const joined = seg(t, 3.5, 3.9);
      me.pose({
        x, facing, walk: walking ? t * 9 : 0,
        armL: walking ? 8 + sw : 8, armR: walking ? 8 - sw : lerp(8, 120, hump(joined)) * 1,
        lean: walking ? 5 : 0, look: 0.5,
        mood: t < 1.5 ? 'sad' : t < 1.8 ? 'open' : 'grin',
        squash: 1 - 0.05 * hump(turn)
      });
      // 心：灰色→赤に反転
      const flip = Math.cos(smooth(seg(t, 1.5, 2.0)) * Math.PI);
      k.set(hp, { fill: flip > 0 ? '#9AA4B2' : pal.red });
      const pop = 1 + 0.25 * hump(seg(t, 1.5, 2.0));
      tf(hs, 0, 0, 0, flip * pop, pop);
      tf(heart, x, FY - 110 + 3 * Math.sin(t * 3));
      // 仲間は手を振って呼ぶ
      [f1, f2].forEach((f, i) => {
        const w = Math.sin(t * 7 + i) * 14;
        f.pose({ armR: t < 1.7 ? 60 : 150 + w, armL: 8, look: -0.5, mood: t < 1.8 ? 'smile' : 'grin' });
      });
    }
  };
}
