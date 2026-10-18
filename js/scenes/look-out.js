// look out：歩道から車道へ出かけたまめに、友だちが「危ない！」と叫ぶ→まめが飛びのき、車が目の前を通過（例文 Look out! A car is coming.）
import { seg, lerp, easeInOut, easeOut, easeIn, wobble, hump, clamp } from '../ease.js';
import { say, faceAt } from './look-over.js';

// 横向きの車（原点＝車体下の中央）。set(x, y, s) で配置、車輪は進んだ距離で回る
export function car(k, color, dark) {
  const { el, g, pal } = k;
  const o = g({}), sh = k.shadow(0, 2, 62, 6, o), bd = g({}, o);
  el('path', { d: 'M -60 -10 Q -62 -32 -40 -34 L -26 -34 L -12 -54 L 26 -54 L 42 -34 L 56 -32 Q 64 -30 62 -10 Z', fill: color }, bd);
  el('path', { d: 'M -8 -48 L 22 -48 L 34 -36 L -18 -36 Z', fill: '#DDEFFA' }, bd);
  el('rect', { x: 50, y: -28, width: 10, height: 6, rx: 2, fill: pal.yellow }, bd);
  el('rect', { x: -60, y: -18, width: 122, height: 5, fill: dark, opacity: 0.5 }, bd);
  const wh = [-36, 36].map((x) => { const w = g({}, o); el('circle', { r: 12, fill: pal.ink }, w); el('circle', { r: 5, fill: '#C8D0DA' }, w); el('rect', { x: -1.5, y: -11, width: 3, height: 7, fill: '#C8D0DA' }, w); return { w, x }; });
  return (x, y, s = 1, bump = 0) => {
    k.tf(o, x, y, 0, s); k.tf(bd, 0, -bump, 0);
    wh.forEach(({ w, x: wx }) => k.tf(w, wx, -10, (x / 12) * 57.3 % 360));
  };
}
export function road(k, top = 246) {
  const { el, pal } = k;
  el('rect', { x: 0, y: top, width: 400, height: 300 - top, fill: '#BCC4CF' });
  el('rect', { x: 0, y: top - 4, width: 400, height: 6, fill: '#D3D9E1' });
  for (let x = 10; x < 400; x += 56) el('rect', { x, y: top + 30, width: 30, height: 4, rx: 2, fill: '#fff', opacity: 0.85 });
}

export const meta = { duration: 3.8, beats: [[0, '道へ出かける'], [1.1, '危ない！'], [2.6, '車が通過']] };

export function create(k) {
  const { pal } = k;
  k.backdrop({ floorY: 200 });
  [[20, 90, '#E4EEF7'], [120, 120, '#F3E6DC'], [230, 80, '#E6F1E8'], [320, 110, '#E4EEF7']].forEach(([x, h, c]) => k.el('rect', { x, y: 200 - h, width: 80, height: h, rx: 4, fill: c }));
  k.el('rect', { x: 0, y: 200, width: 400, height: 46, fill: '#E9ECF1' });
  road(k, 246);
  const fr = k.buddy({ x: 80, y: 228, scale: 0.8, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 200, y: 232, scale: 0.85 });
  const bub = say(k, 34, 34, -1); k.text(0, 0, '!', { 'font-size': 24, fill: pal.red }, bub.g);
  const c = car(k, pal.blue, pal.blueDark);
  return {
    update(t) {
      const fw = easeInOut(seg(t, 0.1, 0.9)), back = easeOut(seg(t, 1.25, 1.6));
      const fwd = fw * (1 - back);
      b.pose({ y: lerp(232, 240, fwd), walk: fwd * 3.2, lean: lerp(0, 8, fwd) - 10 * hump(seg(t, 1.2, 1.9)), armL: 8 + 50 * hump(seg(t, 1.2, 2.0)), armR: 8 + 60 * hump(seg(t, 1.2, 2.0)),
        mood: t > 1.2 ? (t > 3.0 ? 'flat' : 'open') : 'smile', look: t > 1.1 ? 0.9 : 0, squash: 1 - 0.05 * hump(seg(t, 1.2, 1.45)) });
      faceAt(b, t > 1.1 ? 6 : 0, t > 1.1 ? 2 : -1);
      const sh = hump(seg(t, 0.8, 1.6) * 0.8);
      fr.pose({ armR: 8 + 140 * easeOut(seg(t, 0.75, 0.95)) - 40 * seg(t, 2.6, 3.2), armL: 30 * hump(seg(t, 0.75, 1.6)), lean: 6 * sh, mood: t > 0.75 && t < 2.6 ? 'open' : 'smile', look: 0.6, lift: 4 * hump(seg(t, 0.75, 1.0)) });
      bub.show(seg(t, 0.8, 0.95) * (1 - seg(t, 2.4, 2.6)), 112, 132);
      const cx = lerp(560, -160, easeIn(seg(t, 0.6, 3.6)) * 0.5 + seg(t, 0.6, 3.6) * 0.5);
      c(cx, 290, 1, Math.sin(t * 30) * 0.6);
    }
  };
}
