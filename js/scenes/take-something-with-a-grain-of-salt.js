// take something with a grain of salt：友だちの釣り自慢が大きくなっていく。聞き手は塩をひとつまみ振って、話をうのみにしない（Take his story with a grain of salt.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '話が大きくなる'], [1.8, '塩をひとつまみ'], [3.2, 'うのみにしない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  const tell = k.buddy({ x: 76, y: 240, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: 320, y: 240, facing: -1 });
  // 話の吹き出し（大きな魚）
  const bub = g({});
  el('ellipse', { cx: 0, cy: 0, rx: 84, ry: 52, fill: '#fff', stroke: pal.line, 'stroke-width': 2.5 }, bub);
  el('circle', { cx: -62, cy: 54, r: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, bub);
  el('circle', { cx: -72, cy: 70, r: 3.5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, bub);
  const fish = g({}, bub);
  const real = el('path', { d: 'M -22 0 Q 0 -14 20 0 Q 0 14 -22 0 Z M 20 0 L 34 -10 L 34 10 Z', fill: 'none', stroke: pal.sub, 'stroke-width': 1.6, 'stroke-dasharray': '3 3' }, fish);
  const fb = g({}, fish);
  el('path', { d: 'M -26 0 Q 0 -20 24 0 Q 0 20 -26 0 Z', fill: pal.blue, stroke: pal.blueDark, 'stroke-width': 2 }, fb);
  el('path', { d: 'M 22 0 L 40 -13 L 40 13 Z', fill: pal.blueDark }, fb);
  el('circle', { cx: -14, cy: -3, r: 2.6, fill: pal.ink }, fb);
  // 塩のふり出し
  const shaker = g({});
  el('rect', { x: -7, y: -4, width: 14, height: 18, rx: 4, fill: '#fff', stroke: pal.sub, 'stroke-width': 2 }, shaker);
  el('path', { d: 'M -7 -4 Q 0 -14 7 -4 Z', fill: pal.sub }, shaker);
  const grains = Array.from({ length: 7 }, () => el('circle', { r: 1.8, fill: '#fff', stroke: pal.sub, 'stroke-width': 1 }));
  return {
    update(t) {
      const grow = easeInOut(seg(t, 0.4, 2.0));
      const salt = seg(t, 1.8, 3.2), shrink = easeInOut(seg(t, 2.5, 3.3));
      const bp = backOut(seg(t, 0.2, 0.6));
      tf(bub, 190, 84, 0, bp, bp);
      const sc = lerp(0.5, 1.55, grow) * (1 - 0.6 * shrink) + 0.0;
      tf(fish, -8, 0, Math.sin(t * 5) * 3 * (1 - shrink), sc, sc);
      real.setAttribute('opacity', grow > 0.3 ? 1 : 0);
      tell.pose({
        armR: lerp(30, 130, grow) * (1 - 0) + Math.sin(t * 12) * 4 * (1 - shrink), armL: lerp(30, 130, grow) + Math.sin(t * 12 + 1) * 4 * (1 - shrink),
        mood: 'grin', look: 0.3, lean: 3 * grow, squash: 1 + 0.02 * Math.sin(t * 10)
      });
      const up = easeOut(seg(t, 1.5, 2.0)) * (1 - easeOut(seg(t, 3.0, 3.4)));
      const tip = Math.sin(salt * Math.PI * 6) * hump(seg(t, 1.9, 3.1));
      const ang = lerp(8, 118, up);
      me.pose({
        facing: -1, armR: ang, armL: 8, lean: 2 - 3 * up, look: -0.4,
        mood: t < 1.5 ? 'smile' : 'flat', blink: hump(seg(t, 3.4, 3.55))
      });
      const px = 320 - 27 - 28 * Math.sin(ang * Math.PI / 180), py = 184 + 28 * Math.cos(ang * Math.PI / 180);
      tf(shaker, px, py - 8, 150 + tip * 14 - 90 * (1 - up), 1, 1);
      shaker.setAttribute('opacity', up > 0.02 ? 1 : 0);
      grains.forEach((gr, i) => {
        const q = ((t * 1.7 + i / 7) % 1), on = up > 0.9 && t < 3.1 ? 1 : 0;
        k.set(gr, { cx: px - 12 + Math.sin(i * 2.3) * 6 - q * 10, cy: py + 6 + q * 52, opacity: on * (1 - q) });
      });
    }
  };
}
