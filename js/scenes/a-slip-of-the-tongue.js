// a slip of the tongue：「りんご」と言うつもりが「バナナ」と口が滑り、あわてて口を押さえる（Sorry, that was a slip of the tongue.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '言うつもり'], [1.5, '口がすべる'], [3.0, 'あわてる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'indoor' });
  const b = k.buddy({ x: 120, y: FY, scale: 1.1 });
  const apple = (parent) => {
    const a = g({}, parent);
    el('circle', { cx: -6, cy: 2, r: 13, fill: pal.red }, a);
    el('circle', { cx: 6, cy: 2, r: 13, fill: pal.red }, a);
    el('path', { d: 'M 0 -10 Q 0 -20 6 -22', stroke: pal.woodDark, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, a);
    el('path', { d: 'M 3 -16 Q 12 -24 18 -16 Q 10 -12 3 -16 Z', fill: pal.green }, a);
    return a;
  };
  // 言うつもりだった内容（点線の吹き出し）
  const intent = g({});
  el('circle', { cx: 28, cy: 44, r: 4, fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 2 }, intent);
  el('circle', { cx: 18, cy: 28, r: 6.5, fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 2 }, intent);
  el('ellipse', { cx: 0, cy: 0, rx: 42, ry: 30, fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 2.5, 'stroke-dasharray': '6 5' }, intent);
  apple(intent);
  // 実際に出た言葉
  const say = g({});
  el('path', { d: 'M -58 18 L -88 38 L -40 30 Z', fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, say);
  el('ellipse', { cx: 0, cy: 0, rx: 62, ry: 38, fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 2.5 }, say);
  el('path', { d: 'M -58 25 L -42 33', stroke: '#fff', 'stroke-width': 6 }, say);
  el('path', { d: 'M -28 18 Q 0 28 30 -12 Q 34 -20 28 -22 Q 8 4 -26 0 Q -34 6 -28 18 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linejoin': 'round' }, say);
  el('rect', { x: 28, y: -28, width: 7, height: 8, rx: 2, fill: pal.woodDark, transform: 'rotate(25 30 -22)' }, say);
  const mark = g({});
  k.text(0, 0, '!?', { 'font-size': 26, fill: pal.red }, mark);
  const blush = [0, 1].map(() => el('ellipse', { rx: 8, ry: 5, fill: '#FF9C8C' }));
  return {
    update(t) {
      const ip = backOut(seg(t, 0.3, 0.8), 1.6);
      tf(intent, 100, 66, 0, ip, ip);
      intent.setAttribute('opacity', t < 0.3 ? 0 : 1);
      const sp = backOut(seg(t, 1.5, 1.9), 2.2);
      tf(say, 290, 118 + 3 * Math.sin(t * 5), 0, sp, sp);
      say.setAttribute('opacity', t < 1.5 ? 0 : 1);
      const cover = easeOut(seg(t, 2.1, 2.5));
      const mp = backOut(seg(t, 2.5, 2.9), 2);
      tf(mark, 330, 40, 12 * Math.sin(t * 9) * mp, mp, mp);
      b.pose({
        armR: lerp(8, 265, cover), armL: 8, look: 0.3, lean: lerp(0, -6, cover),
        squash: 1 - 0.05 * hump(seg(t, 1.5, 2.0)),
        mood: t < 1.5 ? 'smile' : t < 2.1 ? 'open' : 'flat', blink: 0
      });
      blush.forEach((e, i) => {
        const o = seg(t, 2.1, 2.7);
        tf(e, 120 + (i ? 20 : -20) * 1.1 + 0, FY - 54 * 1.1 + 12, 0, 1, 1);
        e.setAttribute('opacity', 0.8 * o);
      });
    }
  };
}
