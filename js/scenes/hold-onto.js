// hold onto：体育館のロープに両手でつかまり、ぶら下がって揺れても手を離さない（例文 Hold onto the rope with both hands.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, 'ロープをつかむ'], [1.3, '両手で握る'], [3.2, '離さない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: 16, fill: pal.woodDark });
  for (let x = 20; x < 400; x += 60) el('rect', { x, y: 40, width: 30, height: 70, rx: 3, fill: '#E7E1D6' });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#E9D3AE' });
  el('rect', { x: 120, y: FY + 4, width: 160, height: 34, rx: 4, fill: pal.blue, opacity: 0.8 });
  const PX = 200, PY = 14, L = 126;
  el('rect', { x: PX - 10, y: 10, width: 20, height: 8, rx: 3, fill: pal.sub });
  const fsh = k.shadow(PX, FY + 2, 26, 5);
  const swing = g({});
  el('line', { x1: 0, y1: 0, x2: 0, y2: L + 40, stroke: '#C9A577', 'stroke-width': 7, 'stroke-linecap': 'round' }, swing);
  for (let y = 8; y < L + 40; y += 10) el('line', { x1: -3, y1: y, x2: 3, y2: y + 5, stroke: pal.woodDark, 'stroke-width': 1.4 }, swing);
  const S = 1;
  const b = k.buddy({ parent: swing, x: 0, y: L + 82, scale: S });
  b.g.children[0].setAttribute('opacity', 0);
  const hands = [0, 1].map(() => el('circle', { r: 6.5, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.5 }, swing));
  return {
    update(t) {
      const reach = easeInOut(seg(t, 0.2, 0.6)), crouch = hump(seg(t, 0.6, 0.95)), jump = easeOut(seg(t, 0.85, 1.15));
      const drop = 24 * (1 - jump);
      const sw = t < 1.1 ? 0 : 24 * Math.sin((t - 1.1) * 2.6) * Math.min(1, (t - 1.1) * 1.4) * Math.exp(-(t - 1.1) * 0.12);
      tf(swing, PX, PY, sw);
      const arms = lerp(10, 178, reach);
      const kick = t > 1.1 ? Math.sin((t - 1.1) * 2.6 + 0.6) : 0;
      b.pose({ x: 0, y: L + 82 + drop, armL: arms, armR: arms, squash: 1 - 0.12 * crouch + (t > 1.1 ? 0.04 : 0), lean: t > 1.1 ? -kick * 6 : 0, walk: t > 1.1 ? kick * 0.5 : 0, look: t > 1.1 ? 0 : -0.2, mood: t > 1.1 ? (t > 3 ? 'grin' : 'flat') : 'smile' });
      hands.forEach((h, i) => { k.set(h, { cx: i ? 3 : -3, cy: L + 2 + drop + (i ? 6 : -4), opacity: jump > 0.6 ? 1 : 0 }); });
      // 床の影：体の真下、浮くほど小さく
      const fx = PX + Math.sin(sw * Math.PI / 180) * (L + 60);
      const hgt = (FY - (PY + Math.cos(sw * Math.PI / 180) * (L + 82 + drop)));
      k.set(fsh, { cx: fx, rx: 26 - hgt * 0.4, opacity: 1 - hgt / 80 });
    }
  };
}
