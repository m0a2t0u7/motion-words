// steal someone's thunder：自分から発表したい人が、先に言いそうな友だちを手で止める。友だちは口を閉じ、本人がスポットライトの下で発表する（Please don't steal my thunder by telling everyone the news.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, '先に言いそう'], [1.4, 'まって、と止める'], [3.2, '自分で発表']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  // スポットライト（ステージの上）
  const beam = el('path', { d: 'M 316 20 L 296 232 L 372 232 L 336 20 Z', fill: pal.yellow, opacity: 0 });
  el('rect', { x: 306, y: 12, width: 40, height: 10, rx: 4, fill: pal.ink });
  el('rect', { x: 276, y: 232, width: 120, height: 8, rx: 3, fill: pal.woodDark });
  const fr = k.buddy({ x: 70, y: 240, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: 190, y: 240, facing: -1 });
  const star = (parent, s) => { const p = el('path', { d: 'M 0 -13 L 4 -4 L 14 -4 L 6 3 L 9 13 L 0 7 L -9 13 L -6 3 L -14 -4 L -4 -4 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2, 'stroke-linejoin': 'round' }, parent); return p; };
  const say = g({});
  el('ellipse', { cx: 0, cy: 0, rx: 28, ry: 22, fill: '#fff', stroke: pal.line, 'stroke-width': 2.5 }, say);
  el('path', { d: 'M -14 18 L -20 30 L -2 21 Z', fill: '#fff' }, say);
  star(say);
  const news = g({});
  el('ellipse', { cx: 0, cy: 0, rx: 30, ry: 24, fill: '#fff', stroke: pal.line, 'stroke-width': 2.5 }, news);
  el('path', { d: 'M -6 21 L 0 32 L 8 21 Z', fill: '#fff' }, news);
  star(news);
  const stop = el('path', { d: 'M -8 0 H 8 M 0 -8 V 8', stroke: pal.red, 'stroke-width': 0, fill: 'none' });
  return {
    update(t) {
      // 友だち：言いたそう→口を押さえる→拍手
      const sp = backOut(seg(t, 0.2, 0.7)) * (1 - seg(t, 1.9, 2.1));
      tf(say, 100, 108 - 4 * Math.sin(t * 7), 0, Math.max(0, sp), Math.max(0, sp));
      const zip = easeOut(seg(t, 1.8, 2.3));
      const clap = seg(t, 3.5, 4.6) * Math.sin(t * 16);
      fr.pose({
        facing: 1, armR: lerp(8, -62, zip) * (t < 3.0 ? 1 : 1 - seg(t, 3.0, 3.4)) + (t >= 3.0 ? lerp(0, 40 + clap * 8, seg(t, 3.0, 3.4)) : 0),
        armL: t < 3.0 ? 8 : lerp(8, 40 + clap * 8, seg(t, 3.0, 3.4)),
        mood: t < 1.0 ? 'grin' : t < 2.0 ? 'open' : t < 3.2 ? 'flat' : 'grin', lean: 3 * (1 - zip), squash: 1 + 0.03 * Math.sin(t * 14) * hump(seg(t, 0.3, 1.9)),
        look: 0.4, lift: 6 * hump(seg(t, 0.3, 0.7))
      });
      // 本人：手のひらで止める→ステージへ歩いて発表
      const stopP = easeOut(seg(t, 1.1, 1.5)) * (1 - seg(t, 2.6, 2.9));
      const turn = t > 2.8;
      const wx = lerp(190, 336, easeInOut(seg(t, 2.9, 3.8))), walking = t > 2.9 && t < 3.8;
      me.pose({
        x: turn ? wx : 190, facing: turn ? 1 : -1, walk: walking ? (t - 2.9) * 9 : 0,
        armR: walking ? 8 + Math.sin(t * 9) * 16 : turn ? lerp(8, 158, easeOut(seg(t, 3.8, 4.2))) : lerp(8, 92, stopP),
        armL: walking ? 8 - Math.sin(t * 9) * 16 : turn ? lerp(8, 20, 1) : 8,
        lean: walking ? 3 : -4 * stopP, mood: t < 1.1 ? 'smile' : t < 2.9 ? 'flat' : 'grin', look: 0.3,
        lift: 8 * hump(seg(t, 3.8, 4.2))
      });
      beam.setAttribute('opacity', 0.28 * easeOut(seg(t, 3.0, 3.6)));
      const np = backOut(seg(t, 3.9, 4.4));
      tf(news, 336, 96, 0, np, np);
    }
  };
}
