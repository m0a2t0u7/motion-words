// speak of the devil：2人が3人目の話をしているちょうどそのとき、本人が通りの向こうから歩いてくる（Speak of the devil! We were just talking about you.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '噂話をする'], [1.6, '本人が現れる'], [3.0, 'あっと驚く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'outdoor' });
  // 背景の家並み
  [[10, 90, 70, 146, '#F2E7DA'], [92, 120, 60, 116, '#E4EEF6'], [300, 100, 80, 136, '#F2E7DA']].forEach(([x, y, w, h, c]) => {
    el('rect', { x, y, width: w, height: h, fill: c });
    el('rect', { x: x + 10, y: y + 14, width: 16, height: 18, rx: 3, fill: '#fff' });
    el('rect', { x: x + w - 26, y: y + 14, width: 16, height: 18, rx: 3, fill: '#fff' });
  });
  const me = k.buddy({ x: 120, y: 240 });
  const fr = k.buddy({ x: 210, y: 240, facing: -1, color: pal.coral, dark: pal.coralDark });
  const bl = k.buddy({ x: 470, y: 240, facing: -1, color: pal.blue, dark: pal.blueDark });
  // 話題の吹き出し：青いまめの顔
  const talk = g({});
  el('rect', { x: -26, y: -22, width: 52, height: 42, rx: 13, fill: '#fff', stroke: pal.line, 'stroke-width': 2.5 }, talk);
  el('path', { d: 'M -6 20 L 0 30 L 8 20 Z', fill: '#fff' }, talk);
  el('rect', { x: -12, y: -14, width: 24, height: 28, rx: 11, fill: pal.blue }, talk);
  el('circle', { cx: -4, cy: -4, r: 1.8, fill: pal.ink }, talk); el('circle', { cx: 4, cy: -4, r: 1.8, fill: pal.ink }, talk);
  const ex = [0, 1].map(() => k.text(0, 0, '!', { 'font-size': 28, fill: pal.red }));
  return {
    update(t) {
      const gone = seg(t, 1.9, 2.2);
      const tp = Math.max(0, backOut(seg(t, 0.1, 0.5)) * (1 - gone));
      tf(talk, 165, 104, Math.sin(t * 6) * 2, tp, tp);
      const chat = 1 - seg(t, 1.9, 2.2);
      const bx = lerp(470, 335, easeInOut(seg(t, 1.0, 3.0))), walking = t > 1.0 && t < 3.0;
      bl.pose({ x: bx, facing: -1, walk: walking ? t * 9 : 0, armR: walking ? 8 + Math.sin(t * 9) * 16 : lerp(8, 160, easeOut(seg(t, 3.0, 3.4))) + Math.sin(t * 14) * 8 * seg(t, 3.2, 3.5), armL: walking ? 8 - Math.sin(t * 9) * 16 : 8, mood: 'smile', lean: 3 * (walking ? 1 : 0) });
      const spot = easeOut(seg(t, 2.1, 2.5));
      me.pose({
        facing: 1, armR: lerp(8, 100, spot) , armL: lerp(8, 30, spot), look: lerp(0.5, 0.9, spot), mood: spot > 0 ? 'open' : 'smile',
        squash: 1 + 0.03 * Math.sin(t * 10) * hump(seg(t, 0.3, 1.8)) + 0.05 * hump(seg(t, 2.1, 2.5)), lift: 8 * hump(seg(t, 2.1, 2.5)), lean: 5 * spot
      });
      fr.pose({
        facing: t < 2.1 ? -1 : 1, x: 210, armR: t < 2.1 ? 8 + 10 * Math.sin(t * 8) * hump(seg(t, 0.5, 1.8)) : lerp(8, 100, spot), armL: lerp(8, 30, spot), look: 0.4,
        mood: spot > 0 ? 'open' : 'smile', lift: 8 * hump(seg(t, 2.1, 2.5)), lean: 5 * spot
      });
      ex.forEach((e, i) => { const p = backOut(seg(t, 2.1 + i * 0.05, 2.5 + i * 0.05)); tf(e, i ? 220 : 120, lerp(120, 100, easeOut(seg(t, 2.1, 2.5))), i ? 10 : -10, p, p); });
    }
  };
}
