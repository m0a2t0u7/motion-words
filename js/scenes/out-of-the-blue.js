// out of the blue：雲ひとつない青空のもと、のんびりしていたら、突然電話が降ってきて鳴り出す（例文 He called me out of the blue.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '穏やかな青空'], [1.3, '突然降ってくる'], [2.6, '驚く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'outdoor' });
  el('rect', { x: 0, y: 0, width: 400, height: 240, fill: '#CFE8FB' });
  el('circle', { cx: 340, cy: 50, r: 22, fill: pal.yellow, opacity: 0.9 });
  const b = k.buddy({ x: 170, y: FY, scale: 1.1 });
  const phone = g({});
  const pv = g({}, phone);
  el('rect', { x: -15, y: -27, width: 30, height: 54, rx: 8, fill: pal.ink }, pv);
  el('rect', { x: -11, y: -22, width: 22, height: 38, rx: 3, fill: '#FFF' }, pv);
  k.text(0, -2, '?', { 'font-size': 20, fill: pal.blueDark }, pv);
  const ring = g({});
  [1, 2].forEach((i) => {
    el('path', { d: `M ${-18 - i * 8} ${-4 - i * 7} Q ${-26 - i * 10} 0 ${-18 - i * 8} ${4 + i * 7}`, fill: 'none', stroke: pal.coralDark, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, ring);
    el('path', { d: `M ${18 + i * 8} ${-4 - i * 7} Q ${26 + i * 10} 0 ${18 + i * 8} ${4 + i * 7}`, fill: 'none', stroke: pal.coralDark, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, ring);
  });
  const sh = k.shadow(270, FY + 4, 18, 4);
  const ex = g({});
  k.text(0, 0, '!', { 'font-size': 30, fill: pal.red }, ex);
  return {
    update(t) {
      const fall = seg(t, 1.2, 1.9);
      const land = seg(t, 1.9, 2.8);
      const y = lerp(-40, FY - 28, easeIn(fall)) - 22 * Math.abs(wobble(land, 1.5, 3)) * (fall >= 1 ? 1 : 0);
      tf(phone, 270, y, fall < 1 ? 20 * (1 - fall) : 5 * wobble(land, 3, 4));
      const rg = t > 2.0 ? 0.4 + 0.6 * Math.abs(Math.sin(t * 14)) : 0;
      tf(ring, 270, y - 4, 0, 1, 1);
      ring.setAttribute('opacity', rg);
      sh.setAttribute('opacity', fall > 0 ? 0.3 + 0.7 * fall : 0);
      sh.setAttribute('rx', lerp(6, 20, easeIn(fall)));
      const startle = hump(seg(t, 1.8, 2.5));
      const surprised = t > 1.7;
      b.pose({
        look: t < 1.3 ? -0.3 : 0.9,
        mood: surprised ? 'open' : 'smile',
        armR: t < 1.3 ? 8 + 4 * Math.sin(t * 2) : lerp(8, 130, easeOut(seg(t, 1.9, 2.3))),
        armL: t < 1.3 ? 8 : lerp(8, 130, easeOut(seg(t, 1.9, 2.3))),
        lean: -10 * easeOut(seg(t, 1.9, 2.3)) * (t < 3.2 ? 1 : 0.6),
        lift: 14 * startle, squash: 1 + 0.02 * startle
      });
      const ep = backOut(seg(t, 2.0, 2.4), 2.4);
      tf(ex, 170, FY - 120, 0, ep, ep);
      ex.setAttribute('opacity', t < 2.0 ? 0 : 1);
    }
  };
}
