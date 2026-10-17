// apologize：待ち合わせに遅れて走ってきた人が、深く頭を下げて謝る（例文 I apologize for being late.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { gait, streetBg, bubble } from './weigh.js';

export const meta = { duration: 4.8, beats: [[0, '遅れて走る'], [1.8, '深く謝る'], [3.8, '許される']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  // 待ち合わせ場所の大きな時計（9:00の予定を30分過ぎている）
  el('rect', { x: 352, y: FY - 118, width: 8, height: 118, fill: pal.sub });
  const c = g({}); tf(c, 356, FY - 134);
  el('circle', { r: 30, fill: '#fff', stroke: pal.ink, 'stroke-width': 4 }, c);
  for (let i = 0; i < 12; i++) { const a = (i * 30 * Math.PI) / 180; el('line', { x1: Math.sin(a) * 23, y1: -Math.cos(a) * 23, x2: Math.sin(a) * 27, y2: -Math.cos(a) * 27, stroke: pal.sub, 'stroke-width': 2 }, c); }
  el('line', { x1: 0, y1: 0, x2: 0, y2: -14, stroke: pal.ink, 'stroke-width': 3.6, 'stroke-linecap': 'round', transform: 'rotate(285)' }, c);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -21, stroke: pal.red, 'stroke-width': 2.6, 'stroke-linecap': 'round', transform: 'rotate(180)' }, c);
  k.text(356, FY - 178, '9:00', { 'font-size': 13, fill: pal.sub });
  const S = 1.1;
  const you = k.buddy({ x: 296, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: -40, y: FY, scale: S });
  const sweat = [0, 1].map(() => el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6 Z', fill: pal.water }));
  const bub = bubble(k, 56, 34); k.text(-0, 0, 'Sorry!', { 'font-size': 16, fill: pal.ink }, bub);
  return {
    update(t) {
      const gt = gait((tt) => lerp(-40, 178, easeInOut(seg(tt, 0.1, 1.7))), t, -40, 24, 0.13);
      const bow = easeInOut(seg(t, 1.8, 2.5)) * (1 - easeInOut(seg(t, 3.6, 4.1)));
      me.pose({ x: gt.x, walk: gt.walk, armL: gt.armL, armR: t < 1.8 ? gt.armR : lerp(gt.armR, 40, easeOut(seg(t, 1.8, 2.4))), lean: lerp(gt.lean + 6 * gt.m, 38, bow) , squash: 1 - 0.05 * bow, look: 0.4, mood: t < 1.8 ? 'open' : t < 3.8 ? 'sad' : 'smile' });
      // 待っている相手：腕を組むように待つ→許して笑う
      const ok = seg(t, 3.6, 4.0);
      you.pose({ armR: lerp(26 + 6 * Math.sin(t * 7) * (1 - seg(t, 1.8, 2.0)), 8, ok), armL: 8, look: -0.3, mood: t < 2.0 ? 'flat' : t < 3.6 ? 'flat' : 'grin', lean: -2 + 4 * ok, squash: 1 + 0.01 * Math.sin(t * 5) });
      sweat.forEach((s, i) => { const p = ((t * 1.6 + i * 0.5) % 1); tf(s, gt.x + 22 - i * 16, FY - 108 + 22 * p, 0, t < 1.8 ? 0.9 : 0.9); s.setAttribute('opacity', t > 1.0 && t < 3.6 ? 1 - p : 0); });
      tf(bub, 190, 96); bub.setAttribute('opacity', t > 2.4 && t < 3.8 ? easeOut(seg(t, 2.4, 2.7)) : 0);
    }
  };
}
