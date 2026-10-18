// upload：彼女がボタンを押すと、パソコンの写真が一枚ずつ上のウェブサイトの枠へ飛んで並ぶ（例文 She uploaded the photos to the website.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, hump } from '../ease.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 5.2, beats: [[0, '写真を選ぶ'], [1.4, '送り上げる'], [4.0, '載った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 壁のウェブサイト（ブラウザ窓）
  el('rect', { x: 226, y: 10, width: 164, height: 76, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 226, y: 10, width: 164, height: 14, rx: 8, fill: pal.blue });
  el('rect', { x: 226, y: 18, width: 164, height: 6, fill: pal.blue });
  [0, 1, 2].forEach((i) => el('circle', { cx: 236 + i * 8, cy: 17, r: 2.2, fill: '#fff', opacity: 0.9 }));
  const SL = [[250, 56], [308, 56], [366, 56]];
  SL.forEach(([x, y]) => el('rect', { x: x - 21, y: y - 17, width: 42, height: 34, rx: 4, fill: '#F1F4F8', stroke: pal.line, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }));
  el('rect', { x: 0, y: 200, width: 400, height: 14, fill: '#F2DDBB' });
  el('rect', { x: 0, y: 200, width: 400, height: 2, fill: '#fff', opacity: 0.6 });
  // モニター
  el('rect', { x: 276, y: 176, width: 28, height: 24, rx: 3, fill: '#C9D3DF' });
  el('rect', { x: 206, y: 96, width: 184, height: 84, rx: 10, fill: '#2A3242' });
  el('rect', { x: 214, y: 103, width: 168, height: 70, rx: 5, fill: '#F7F9FC' });
  const btn = g({}); tf(btn, 298, 114);
  const btnR = el('rect', { x: -30, y: -9, width: 60, height: 18, rx: 9, fill: pal.blue }, btn);
  k.text(0, 0, 'UP', { 'font-size': 10, fill: '#fff' }, btn);
  const PH = [[250, 150], [298, 150], [346, 150]];
  const photo = (parent) => {
    const n = g({}, parent);
    el('rect', { x: -19, y: -15, width: 38, height: 30, rx: 3, fill: '#CFE9F7', stroke: '#fff', 'stroke-width': 2 }, n);
    el('path', { d: 'M -19 15 L -7 -2 L 2 8 L 9 0 L 19 15 Z', fill: pal.mint }, n);
    el('circle', { cx: 9, cy: -6, r: 4, fill: pal.yellow }, n);
    return n;
  };
  const S = 1.0;
  const me = k.buddy({ x: 140, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  el('ellipse', { cx: 192, cy: 197, rx: 9, ry: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  el('rect', { x: 0, y: 214, width: 400, height: 40, fill: pal.wood });
  el('rect', { x: 0, y: 214, width: 400, height: 3, fill: pal.woodDark, opacity: 0.4 });
  const hand = el('circle', { r: 6.5 * S, fill: pal.coral, stroke: pal.coralDark, 'stroke-width': 2.4 });
  const photos = PH.map(() => photo(null));
  photos.forEach((n) => k.root.appendChild(n));
  const chk = g({}); tf(chk, 372, 22, 0, 0.001);
  el('circle', { r: 9, fill: pal.green }, chk);
  el('path', { d: 'M -3.8 0 L -1.2 3 L 4 -3', stroke: '#fff', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, chk);

  return {
    update(t) {
      const reachP = easeInOut(seg(t, 0.3, 0.9)), click = hump(seg(t, 1.0, 1.4));
      me.pose({ x: 140, armL: 8, lean: 3, look: 0.5, mood: t > 4.0 ? 'grin' : 'smile', squash: 1, armR: 30 });
      me.pose({ armR: lerp(30, reach(me, S, 'R', 190, 192 - 6 * (1 - click)), reachP) });
      const h = hp(me, S, 'R', 26);
      k.set(hand, { cx: h.x, cy: h.y });
      tf(btn, 298, 114, 0, 1 - 0.1 * click);
      btnR.setAttribute('fill', click > 0.3 ? pal.blueDark : pal.blue);
      photos.forEach((n, i) => {
        const t0 = 1.5 + 0.7 * i, p = easeInOut(seg(t, t0, t0 + 1.0));
        const x = lerp(PH[i][0], SL[i][0], p), y = lerp(PH[i][1], SL[i][1], p) - 14 * hump(p);
        const sq = p >= 1 ? 1 + 0.14 * hump(seg(t, t0 + 1.0, t0 + 1.3)) : 1;
        tf(n, x, y, lerp(0, i % 2 ? 8 : -8, hump(p)), lerp(1, 0.95, p) * sq, lerp(1, 0.95, p) / sq);
      });
      tf(chk, 372, 24, 0, backOut(seg(t, 4.0, 4.5)) + 0.001);
    }
  };
}
