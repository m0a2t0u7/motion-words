// give in：門の前で首を横に振っていたまめが、子どもたちに何度も頼まれ、ついに折れて道をあけ、2人を行かせる（例文 He finally gave in and let us go.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { gait } from './dig.js';
import { streetBg } from './weigh.js';

export const meta = { duration: 4.6, beats: [[0, 'だめと首を振る'], [1.8, 'ついに折れる'], [3.6, '行かせた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  // 門（右寄り）
  const GX = 270;
  el('rect', { x: GX - 6, y: 150, width: 12, height: 86, rx: 3, fill: pal.woodDark });
  el('rect', { x: GX + 76, y: 150, width: 12, height: 86, rx: 3, fill: pal.woodDark });
  for (let x = 0; x < 270; x += 18) el('rect', { x: x - 2, y: 196, width: 8, height: 40, rx: 3, fill: '#E9D7BD' });
  el('rect', { x: 0, y: 204, width: GX - 6, height: 6, fill: '#D9C2A1' });
  const gate = g({}); tf(gate, GX + 6, 0);
  for (let i = 0; i < 5; i++) el('rect', { x: i * 14 + 2, y: 166, width: 8, height: 66, rx: 3, fill: pal.wood }, gate);
  el('rect', { x: 0, y: 180, width: 70, height: 6, fill: pal.woodDark }, gate);
  el('rect', { x: 0, y: 214, width: 70, height: 6, fill: pal.woodDark }, gate);
  const dad = k.buddy({ x: 300, y: FY, scale: 0.95, facing: -1 });
  const kids = [k.buddy({ x: 170, y: FY, scale: 0.6, color: pal.coral, dark: pal.coralDark }), k.buddy({ x: 120, y: FY, scale: 0.55, color: pal.coral, dark: pal.coralDark })];
  const xk = [(t) => lerp(190, 390, easeInOut(seg(t, 3.0, 4.4))), (t) => lerp(145, 345, easeInOut(seg(t, 3.15, 4.6)))];
  return {
    update(t) {
      const no = t < 1.8, give = easeInOut(seg(t, 1.9, 2.5)), step = easeInOut(seg(t, 2.5, 3.1));
      const shake = no ? Math.sin(t * 10) * 0.7 * seg(t, 0.2, 0.5) : 0;
      // 門の前で通せんぼ→肩を落として→脇へよけ、手で門の方を示す
      dad.pose({ x: lerp(300, 252, step), y: lerp(FY, FY - 22, step), look: lerp(shake, 0.3, give), facing: step > 0.6 ? 1 : -1, mood: no ? 'flat' : give < 1 ? 'sad' : 'smile',
        armL: no ? 92 : lerp(92, 10, give), armR: no ? 92 : lerp(92, lerp(10, 80, step), give),
        squash: 1 - 0.08 * hump(seg(t, 1.9, 2.4)), lean: -4 * hump(seg(t, 1.9, 2.4)), walk: step > 0 && step < 1 ? (t - 2.5) * 9 : 0 });
      // 子どもたち：手を合わせて頼む（はねる）→門を通って出ていく
      kids.forEach((c, i) => {
        const p = gait(xk[i], t, i ? 145 : 190, 20);
        const beg = t < 2.6 ? Math.abs(Math.sin(t * 6 + i)) * 6 : 0;
        c.pose({ x: p.x, walk: p.walk, lift: beg, armR: t < 2.6 ? 120 : p.armR, armL: t < 2.6 ? 120 : p.armL, mood: t > 2.4 ? 'grin' : 'sad', look: 0.6, lean: p.lean });
      });
      // 門が開く（横に縮む）
      tf(gate, GX + 6, 0, 0, lerp(1, 0.2, easeInOut(seg(t, 2.8, 3.2))), 1);
    }
  };
}
