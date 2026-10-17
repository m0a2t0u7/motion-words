// at a crossroads：分かれ道の真ん中で、どちらに進むか迷う（I'm at a crossroads in my life.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '分かれ道に着く'], [1.4, 'どっちか迷う'], [3.0, '決められない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 150 });
  el('rect', { x: 0, y: 150, width: 400, height: 150, fill: '#DDF1E0' });
  const road = (d, w, c) => el('path', { d, fill: 'none', stroke: c, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const paths = ['M 200 310 L 200 222 L 92 160', 'M 200 222 L 308 160'];
  paths.forEach((d) => road(d, 52, '#D3C3A5'));
  paths.forEach((d) => road(d, 44, '#EAD9B8'));
  road('M 200 310 L 200 224', 4, '#F7ECD3').setAttribute('stroke-dasharray', '10 12');
  // 行き先：左は家、右は山
  const house = g({});
  el('rect', { x: -24, y: -26, width: 48, height: 30, fill: '#FBE9DC' }, house);
  el('path', { d: 'M -30 -24 L 0 -50 L 30 -24 Z', fill: pal.coral }, house);
  el('rect', { x: -6, y: -14, width: 12, height: 18, fill: pal.blue }, house);
  tf(house, 62, 150);
  const mt = g({});
  el('path', { d: 'M -46 4 L -6 -52 L 34 4 Z', fill: '#9AA9C4' }, mt);
  el('path', { d: 'M 6 4 L 36 -34 L 66 4 Z', fill: '#B6C2D8' }, mt);
  el('path', { d: 'M -6 -52 L -17 -36 L -6 -40 L 2 -34 Z', fill: '#fff' }, mt);
  tf(mt, 336, 150);
  // 道標
  const sign = (x, rot, c) => {
    const s = g({});
    el('rect', { x: -3, y: -30, width: 6, height: 40, fill: pal.woodDark }, s);
    el('path', { d: 'M -22 -34 L 14 -34 L 24 -26 L 14 -18 L -22 -18 Z', fill: c, stroke: '#fff', 'stroke-width': 2 }, s);
    tf(s, x, 214, rot);
    return s;
  };
  sign(148, -3, pal.mint); 
  const s2 = sign(252, 0, pal.coral); s2.firstChild; 
  const b = k.buddy({ x: 200, y: 246, scale: 0.8 });
  const qm = [0, 1].map(() => k.text(0, 0, '?', { 'font-size': 30, fill: pal.violet }));
  return {
    update(t) {
      const arrive = easeOut(seg(t, 0, 0.8));
      const walk = t < 0.8;
      const lookDir = t < 1.4 ? 0 : t < 2.2 ? -1 : t < 3.0 ? 1 : Math.sin(t * 2);
      const th = easeOut(seg(t, 2.3, 2.8));
      b.pose({
        y: lerp(300, 246, arrive), walk: walk ? t * 10 : 0, facing: lookDir < -0.2 ? -1 : 1,
        look: Math.abs(lookDir) > 0.2 ? 0.8 : 0, lean: t < 1.4 ? 0 : 5 * lookDir,
        armR: walk ? 8 : lerp(8, 258, th), armL: walk ? 8 + Math.sin(t * 10) * 14 : 8,
        mood: t < 1.4 ? 'smile' : 'flat', squash: 1
      });
      qm.forEach((q, i) => {
        const p = backOut(seg(t, 1.5 + i * 0.5, 1.9 + i * 0.5), 2.2);
        tf(q, 164 + i * 72, 134 - i * 14 + 3 * Math.sin(t * 3 + i), 12 * (i ? 1 : -1), p, p);
      });
    }
  };
}
