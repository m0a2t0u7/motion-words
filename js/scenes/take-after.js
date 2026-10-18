// take after：母と娘が並ぶ。同じリボン、同じ笑い方、同じしぐさ（首をかしげて頬に手）を同時にして、そっくりだと分かる（例文 She takes after her mother.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '母と娘'], [1.5, '同じしぐさ'], [3.2, 'そっくり']] };

function bow(k, b) {
  const g = k.g({}, b.body);
  k.el('path', { d: 'M 0 -78 L -14 -88 L -14 -68 Z M 0 -78 L 14 -88 L 14 -68 Z', fill: k.pal.violet }, g);
  k.el('circle', { cx: 0, cy: -78, r: 4, fill: '#8E70E0' }, g);
  k.tf(g, 12, 0);
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 壁の家族写真
  el('rect', { x: 170, y: 46, width: 60, height: 48, rx: 4, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 4 });
  el('circle', { cx: 190, cy: 74, r: 9, fill: pal.mint }); el('circle', { cx: 210, cy: 78, r: 6, fill: pal.mint });
  el('ellipse', { cx: 200, cy: 250, rx: 150, ry: 12, fill: '#F1D9CF' });
  const mom = k.buddy({ x: 130, y: FY, scale: 1.1 });
  const kid = k.buddy({ x: 270, y: FY, scale: 0.68 });
  bow(k, mom); bow(k, kid);
  const eq = g({});
  k.text(0, 0, '=', { 'font-size': 34, fill: pal.mintDark }, eq);
  const dots = [0, 1].map(() => el('path', { d: '', stroke: pal.sub, 'stroke-width': 2, 'stroke-dasharray': '3 5', fill: 'none' }));
  return {
    update(t) {
      // 2人が同時に：首をかしげ、片手を頬へ、にっこり→小さくはねる
      const tilt = easeInOut(seg(t, 0.9, 1.4)) * (1 - easeInOut(seg(t, 3.6, 4.1)) * 0.3);
      const hop = hump(seg(t, 2.0, 2.4)), sq = hump(seg(t, 1.85, 2.05)) + hump(seg(t, 2.4, 2.6));
      [mom, kid].forEach((b, i) => {
        b.pose({ lean: -12 * tilt, armR: lerp(10, 140, tilt), armL: 10 + 14 * hop, mood: tilt > 0.5 ? 'grin' : 'smile', look: lerp(i ? -0.5 : 0.5, 0, tilt),
          blink: t > 2.8 && t < 3.0 ? 1 : 0, lift: hop * (i ? 10 : 14), squash: 1 - 0.08 * sq });
      });
      const sh = seg(t, 2.8, 3.3);
      tf(eq, 200, 150, 0, backOut(sh) || 0.001);
      eq.setAttribute('opacity', sh > 0 ? 1 : 0);
      k.set(dots[0], { d: 'M 150 98 Q 200 70 274 172', opacity: sh });
      k.set(dots[1], { d: 'M 146 160 Q 200 196 270 196', opacity: sh });
    }
  };
}
