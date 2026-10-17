// rest：長く歩いて疲れた人がベンチに腰かけ、ほっと休む（例文 You should rest after the long walk.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { gait, streetBg } from './weigh.js';

export const meta = { duration: 4.8, beats: [[0, '歩き疲れた'], [2.0, '腰かける'], [3.8, 'ほっと休む']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  // ベンチ（背もたれは奥）
  el('rect', { x: 226, y: 150, width: 112, height: 40, rx: 6, fill: pal.woodDark });
  [[236], [262], [288], [314]].forEach(([x]) => el('rect', { x, y: 156, width: 18, height: 28, rx: 3, fill: pal.wood }));
  el('rect', { x: 218, y: 190, width: 128, height: 10, rx: 4, fill: pal.wood });
  el('rect', { x: 226, y: 200, width: 8, height: 36, fill: pal.woodDark }); el('rect', { x: 330, y: 200, width: 8, height: 36, fill: pal.woodDark });
  k.shadow(282, FY + 1, 66, 4);
  const b = k.buddy({ x: -30, y: FY, scale: 1.1 });
  const sweat = [0, 1, 2].map(() => el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6 Z', fill: pal.water }));
  const puff = g({}); [0, 1].forEach((i) => el('circle', { cx: i * 9, cy: -i * 6, r: 6 - i * 1.5, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, puff));
  const zz = k.text(0, 0, 'z', { 'font-size': 18, fill: pal.sub });
  return {
    update(t) {
      const walkX = (tt) => lerp(-30, 252, easeInOut(seg(tt, 0.05, 2.0)));
      const gt = gait(walkX, t, -30, 10, 0.085);
      const sit = easeInOut(seg(t, 2.0, 2.7));
      const hopA = Math.sin(Math.PI * seg(t, 2.0, 2.7)) * 14;
      const tired = 1 - seg(t, 2.0, 2.4);
      const settle = backOut(seg(t, 2.6, 3.4), 1.2);
      b.pose({ x: lerp(gt.x, 268, sit), y: lerp(FY, 202, sit) - hopA, walk: gt.walk * (1 - sit), armL: lerp(gt.armL, 6, sit), armR: lerp(gt.armR, 6, sit),
        lean: lerp(10 * gt.m * tired, -6, seg(t, 2.6, 3.4)), squash: lerp(1, 0.92, settle) - 0.01 * Math.sin(t * 2) * sit, look: 0.3,
        mood: t < 2.0 ? 'sad' : t < 3.4 ? 'flat' : 'smile', blink: t < 3.6 ? 0 : easeOut(seg(t, 3.6, 3.9)) });
      sweat.forEach((s, i) => { const p = ((t * 1.3 + i / 3) % 1); tf(s, b.state.x + 24 - i * 22, b.state.y - 100 + 18 * p); s.setAttribute('opacity', t < 2.4 ? 0.9 * (1 - p) : 0); });
      const f = seg(t, 3.3, 4.4);
      tf(puff, 292, 160 - 12 * easeOut(f), 0, 0.6 + 0.6 * f); puff.setAttribute('opacity', f > 0 ? 1 - seg(t, 4.2, 4.7) : 0);
      tf(zz, 308, 150 - 6 * Math.sin(t * 3)); zz.setAttribute('opacity', t > 3.9 ? 1 : 0);
    }
  };
}
