// cut to the chase：長い前置きをはさみで切って、本題に進む（例文 Let's cut to the chase.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '長い前置き'], [1.4, 'ちょきんと切る'], [2.8, '本題へ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'indoor' });
  const SY = 96;
  // 帯：前置き（点線の吹き出し群）＋ 本題（星）
  const strip = g({});
  const pre = g({}, strip);
  for (let i = 0; i < 6; i++) {
    el('rect', { x: 20 + i * 38, y: SY - 22, width: 32, height: 44, rx: 6, fill: '#E8EDF4', stroke: '#CBD3DE', 'stroke-width': 2 }, pre);
    el('path', { d: `M ${27 + i * 38} ${SY - 8} L ${45 + i * 38} ${SY - 8} M ${27 + i * 38} ${SY} L ${45 + i * 38} ${SY} M ${27 + i * 38} ${SY + 8} L ${38 + i * 38} ${SY + 8}`, stroke: '#B9C3D2', 'stroke-width': 3, 'stroke-linecap': 'round' }, pre);
  }
  const main = g({}, strip);
  el('rect', { x: 250, y: SY - 26, width: 52, height: 52, rx: 8, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 3 }, main);
  el('path', { d: 'M 276 SY'.replace('SY', SY - 15) + ' L 281 ' + (SY - 4) + ' L 293 ' + (SY - 3) + ' L 284 ' + (SY + 5) + ' L 287 ' + (SY + 17) + ' L 276 ' + (SY + 11) + ' L 265 ' + (SY + 17) + ' L 268 ' + (SY + 5) + ' L 259 ' + (SY - 3) + ' L 271 ' + (SY - 4) + ' Z', fill: '#FFFFFF' }, main);
  // 切り口の位置
  const CX = 240;
  const b = k.buddy({ x: 200, y: FY, scale: 1.05 });
  const base = { armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'flat', blink: 0, lift: 0 };
  // はさみ
  const sc = g({});
  const bl1 = g({}, sc), bl2 = g({}, sc);
  [bl1, bl2].forEach((bl) => {
    el('path', { d: 'M 0 0 L 30 -3 L 30 3 Z', fill: '#B9C3D2', stroke: '#8E99AB', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, bl);
    el('circle', { cx: -8, cy: 0, r: 6, fill: 'none', stroke: pal.coralDark, 'stroke-width': 4 }, bl);
  });
  const dash = el('line', { x1: CX, y1: SY - 34, x2: CX, y2: SY + 34, stroke: pal.red, 'stroke-width': 2.5, 'stroke-dasharray': '4 4', opacity: 0 });
  const zz = el('path', { d: 'M 0 0 l 6 -8 l 6 8 l 6 -8', fill: 'none', stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0 });

  return {
    update(t) {
      const cut = seg(t, 1.5, 2.3);
      const snip = t > 1.5 && t < 2.5 ? Math.abs(Math.sin((t - 1.5) * 9)) : 0;
      const sx = CX + 4, sy = lerp(SY - 70, SY, easeOut(seg(t, 0.6, 1.5)));
      b.pose({ ...base, armR: 148, armL: 20, lean: -2, look: 0.3, mood: t > 2.8 ? 'grin' : 'flat' });
      const hnd = b.handPos('R');
      const px = lerp(hnd.x, sx, 1), py = lerp(hnd.y, SY + 2, easeOut(seg(t, 0.4, 1.4)));
      tf(sc, t < 0.4 ? hnd.x + 8 : sx - 6, t < 0.4 ? hnd.y - 10 : py - 4 * (1 - easeOut(seg(t, 0.4, 1.4))), -90, 1.5, 1.5);
      tf(bl1, 0, 0, -snip * 18);
      tf(bl2, 0, 0, snip * 18);
      sc.setAttribute('opacity', t > 2.6 ? 1 - seg(t, 2.6, 3.0) : 1);
      dash.setAttribute('opacity', seg(t, 1.3, 1.5) * (1 - seg(t, 2.1, 2.3)));
      // 前置き（左）が落ちて、本題（右）が中央へ
      const fall = easeIn(seg(t, 2.1, 3.0));
      tf(pre, -40 * fall, 130 * fall, -25 * fall, 1, 1);
      pre.setAttribute('opacity', 1 - seg(t, 2.5, 3.0));
      const slide = easeInOut(seg(t, 2.4, 3.3));
      tf(main, -(276 - 200) * slide, 0, 0, 1 + 0.5 * slide, 1 + 0.5 * slide);
      main.setAttribute('transform', `translate(${(200 - 276) * slide + 276 * (1 - (1 + 0.5 * slide)) } ${SY * (1 - (1 + 0.5 * slide))}) scale(${1 + 0.5 * slide})`);
    }
  };
}
