// hold back：別れの場面で、去っていく友だちに手を振りながら、目にたまった涙をこぼさずにこらえる（例文 She held back her tears at the farewell.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { gait } from './dig.js';
import { streetBg } from './weigh.js';

export const meta = { duration: 4.6, beats: [[0, 'お別れ'], [1.8, '涙がにじむ'], [3.6, 'こらえて笑う']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236, 'evening');
  const S = 1.1;
  const C = k.buddy({ x: 250, y: FY, scale: 0.9, color: pal.coral, dark: pal.coralDark });
  const bag = g({}); el('rect', { x: -12, y: -14, width: 24, height: 18, rx: 4, fill: pal.blue }, bag); el('path', { d: 'M -6 -14 Q 0 -22 6 -14', stroke: pal.blueDark, 'stroke-width': 3, fill: 'none' }, bag);
  const A = k.buddy({ x: 130, y: FY, scale: S });
  // 目の涙（顔のグループに入れる）
  const face = A.body.children[3];
  const tears = [-10, 10].map((x) => el('path', { d: 'M -5 0 Q 0 5 5 0', fill: '#BFE6FA', stroke: pal.water, 'stroke-width': 1.2 }, face));
  const shine = [-10, 10].map((x) => el('circle', { r: 1.6, fill: '#fff' }, face));
  const xf = (t) => lerp(250, 430, easeInOut(seg(t, 0.8, 4.4)));
  return {
    update(t) {
      const p = gait(xf, t, 250);
      C.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: t < 0.8 ? 150 + 20 * Math.sin(t * 14) : p.armR, lean: p.lean, facing: t < 0.8 ? -1 : 1, mood: 'smile', look: 0.5 });
      const hc = { x: p.x + (t < 0.8 ? -1 : 1) * 4, y: FY - 30 };
      tf(bag, hc.x - (t < 0.8 ? 26 : -26), FY - 22 + 2 * Math.abs(Math.sin(p.walk)));
      const well = easeInOut(seg(t, 1.6, 2.6));
      const fight = seg(t, 2.6, 3.6), back = easeInOut(seg(t, 3.4, 4.2));
      const amt = well * (1 - 0.7 * back);
      const quiver = Math.sin(t * 30) * 0.6 * amt * (1 - back);
      A.pose({ armR: 140 + 22 * Math.sin(t * 9), armL: 10, look: 0.6, mood: t < 1.6 ? 'smile' : back > 0.5 ? 'smile' : 'flat', squash: 1 - 0.03 * hump(seg(t, 2.4, 3.2)), lean: -2 * hump(fight) + quiver * 0.4, blink: hump(seg(t, 3.0, 3.25)) * 0.9 });
      tears.forEach((tr, i) => { k.set(tr, { d: `M ${[-10, 10][i] - 6} -51 Q ${[-10, 10][i]} ${-51 + 12 * amt} ${[-10, 10][i] + 6} -51 Z`, opacity: amt > 0.02 ? 1 : 0 }); });
      shine.forEach((s, i) => k.set(s, { cx: [-10, 10][i] + 1.5, cy: -56, opacity: amt }));
    }
  };
}
