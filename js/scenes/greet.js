// greet：通りで出会った相手が、笑顔で手を振って声をかける（例文 He greeted me with a smile.）
import { seg, lerp, easeInOut, easeOut, backOut } from '../ease.js';
import { gait, streetBg, bubble } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '歩いて来る'], [1.6, '笑顔で声をかける'], [3.2, '返事をする']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  const S = 1.1;
  const me = k.buddy({ x: 120, y: FY, scale: S });
  const he = k.buddy({ x: 420, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const bub = bubble(k, 58, 34); k.text(0, 0, 'Hi!', { 'font-size': 20 }, bub);
  const bub2 = bubble(k, 58, 34); k.text(0, 0, 'Hi!', { 'font-size': 20, fill: pal.mintDark }, bub2);
  const sp = [0, 1, 2].map(() => el('path', { d: 'M 0 -7 L 2 -2 L 7 0 L 2 2 L 0 7 L -2 2 L -7 0 L -2 -2 Z', fill: pal.yellow }));
  return {
    update(t) {
      const gt = gait((tt) => lerp(420, 232, easeInOut(seg(tt, 0.1, 1.6))), t, 420);
      const wave = seg(t, 1.5, 3.8), w = Math.sin((t - 1.5) * 11);
      he.pose({ x: gt.x, walk: gt.walk, armL: gt.armL, lean: gt.lean * (1 - seg(t, 1.4, 1.7)), look: -0.4, mood: 'grin', squash: 1 + 0.015 * Math.sin(t * 6) * wave,
        armR: t < 1.4 ? gt.armR : lerp(gt.armR, 140 + 22 * w, easeOut(seg(t, 1.4, 1.9))) });
      const r = seg(t, 2.6, 3.0);
      me.pose({ armR: 8 + (r > 0 ? lerp(0, 132 + 22 * Math.sin((t - 2.6) * 11), easeOut(r)) - 0 : 0), armL: 8, look: 0.5, mood: t > 2.6 ? 'grin' : 'smile', lean: 2 * r });
      tf(bub, 232, 96 - 4 * easeOut(seg(t, 1.5, 1.9)));
      bub.setAttribute('opacity', t > 1.5 && t < 2.9 ? 1 : 0);
      tf(bub2, 128, 96);
      bub2.setAttribute('opacity', t > 2.8 ? easeOut(seg(t, 2.8, 3.1)) : 0);
      sp.forEach((s, i) => { const p = seg(t, 1.7 + i * 0.12, 2.6 + i * 0.12); tf(s, 232 - 28 + i * 28, 82 - 14 * easeOut(p) - (i % 2) * 8, 0, p > 0 && p < 1 ? Math.sin(p * Math.PI) : 0); });
    }
  };
}
