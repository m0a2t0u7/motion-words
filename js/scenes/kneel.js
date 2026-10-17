// kneel：靴ひもがほどけて、ひざをついて低くなり、ひもを結ぶ（例文 He knelt down to tie his shoe.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { hp, reach } from './weigh.js';

export const meta = { duration: 4.6, beats: [[0, '立っている'], [1.4, 'ひざをつく'], [3.5, 'ひもを結ぶ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  [[70], [330]].forEach(([x]) => { const t = g({}); tf(t, x, FY); el('rect', { x: -4, y: -40, width: 8, height: 40, rx: 3, fill: pal.woodDark }, t); el('circle', { cx: 0, cy: -54, r: 26, fill: '#7FD3A0' }, t); el('circle', { cx: -14, cy: -42, r: 16, fill: '#6BC48F' }, t); });
  const S = 1.15, X0 = 180;
  const b = k.buddy({ x: X0, y: FY, scale: S, color: pal.blue, dark: pal.blueDark });
  const legs = b.g.children[1].children;
  // 靴（前の足）とひも
  const shoe = g({});
  el('path', { d: 'M -10 4 L -10 -6 Q 0 -10 8 -4 Q 16 -2 16 4 Z', fill: pal.red, stroke: '#C9483D', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, shoe);
  el('rect', { x: -10, y: 2, width: 26, height: 4, rx: 2, fill: '#fff' }, shoe);
  const lace = el('path', { d: '', stroke: pal.ink, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, shoe);
  const bow = g({}, shoe); tf(bow, 2, -6);
  [-1, 1].forEach((s) => el('ellipse', { cx: s * 5, cy: 0, rx: 5, ry: 3, fill: 'none', stroke: pal.ink, 'stroke-width': 2, transform: `rotate(${s * 22})` }, bow));
  el('circle', { r: 2, fill: pal.ink }, bow);
  return {
    update(t) {
      const dn = easeInOut(seg(t, 0.9, 1.9));
      const lift = -9 * dn;
      const fx = X0 + (12 + 15 * Math.sin(70 * Math.PI / 180) * dn) * S;
      const tie = seg(t, 2.1, 3.7), done = seg(t, 3.5, 3.8);
      b.pose({ lift, squash: lerp(1, 0.86, dn), lean: lerp(0, 26, dn), look: 0.5, mood: t > 3.7 ? 'smile' : 'flat', armL: lerp(8, 20, dn), armR: 8 });
      const aim = reach(b, S, 'R', fx + 6 + 3 * Math.sin(t * 14) * tie * (1 - done), FY - 14 + 2 * Math.cos(t * 11) * tie * (1 - done));
      b.pose({ armR: lerp(8, aim, easeInOut(seg(t, 1.6, 2.2))) });
      legs[0].setAttribute('transform', `translate(-12 ${-14 - lift}) rotate(${(84 * dn).toFixed(1)})`);
      legs[1].setAttribute('transform', `translate(12 ${-14 - lift}) rotate(${(-70 * dn).toFixed(1)})`);
      tf(shoe, fx + 4, FY - 2, 0, S);
      const sag = 1 - done;
      lace.setAttribute('d', `M -2 -4 q 6 ${(10 * sag).toFixed(1)} 12 ${(10 * sag).toFixed(1)} M 0 -4 q -8 ${(8 * sag).toFixed(1)} -14 ${(6 * sag).toFixed(1)}`);
      lace.setAttribute('opacity', 1 - done);
      bow.setAttribute('opacity', done > 0 ? 1 : 0); tf(bow, 2, -6, 0, backOut(done, 1.8));
    }
  };
}
