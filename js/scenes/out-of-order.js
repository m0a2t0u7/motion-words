// out of order：駅の券売機にまめがコインを入れる→画面が×で火花、コインが戻ってきて切符は出ない（例文 The ticket machine is out of order.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, wobble } from '../ease.js';
import { P, reach, held, walk, path, coin, drop } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '券売機へ'], [1.5, '画面が×'], [3.0, '動かない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 8, width: 400, height: 8, fill: '#E6E1D8' });
  // 駅の案内板（電車マーク）
  el('rect', { x: 36, y: 34, width: 120, height: 34, rx: 6, fill: pal.ink });
  el('rect', { x: 50, y: 42, width: 28, height: 18, rx: 5, fill: pal.green }); el('rect', { x: 54, y: 45, width: 9, height: 7, rx: 1.5, fill: '#CFE9F7' }); el('rect', { x: 65, y: 45, width: 9, height: 7, rx: 1.5, fill: '#CFE9F7' });
  [92, 112, 132].forEach((x) => el('rect', { x, y: 48, width: 14, height: 5, rx: 2, fill: '#fff', opacity: 0.7 }));
  // 券売機（動かない）
  k.shadow(290, FY, 60, 5);
  el('rect', { x: 236, y: 70, width: 108, height: FY - 70, rx: 8, fill: '#C9D7E8' });
  el('rect', { x: 236, y: 70, width: 108, height: 14, rx: 7, fill: pal.blueDark });
  const scr = el('rect', { x: 250, y: 96, width: 80, height: 50, rx: 4, fill: '#9FD0F2' });
  const xm = el('path', { d: 'M 276 108 L 304 134 M 304 108 L 276 134', stroke: '#fff', 'stroke-width': 7, 'stroke-linecap': 'round', opacity: 0 });
  el('rect', { x: 250, y: 158, width: 22, height: 6, rx: 3, fill: pal.ink });
  el('rect', { x: 288, y: 192, width: 40, height: 16, rx: 3, fill: '#8C96AE' });
  const sparks = [0, 1, 2, 3].map((i) => el('path', { d: 'M 0 -6 L 2 -1 L 7 0 L 2 2 L 0 7 L -2 2 L -7 0 L -2 -1 Z', fill: pal.yellow }));
  const A = k.buddy({ x: -40, y: FY, scale: 0.9 });
  const c = coin(k, k.root, 5);
  const sw = drop(k);
  const xa = path([[0.1, -40], [1.1, 196]]);
  return {
    update(t) {
      walk(A, xa, t, { look: 0.5, mood: t < 1.6 ? 'smile' : t < 2.6 ? 'open' : 'sad' });
      // コインを入れる
      const ins = easeInOut(seg(t, 1.1, 1.5)) * (1 - easeOut(seg(t, 1.6, 1.9)));
      const pick = easeInOut(seg(t, 2.6, 3.0)) * (1 - easeInOut(seg(t, 3.3, 3.7)));
      if (t > 1.0) A.pose({ armR: ins > 0 ? reach(A, 0.9, 'R', lerp(230, 256, ins), lerp(200, 162, ins)) : pick > 0 ? reach(A, 0.9, 'R', lerp(230, 300, pick), lerp(200, 202, pick)) : 12, lean: 6 * pick });
      if (t > 3.6) A.pose({ armL: lerp(8, 160, easeOut(seg(t, 3.6, 3.9))), lean: -4 });
      const h = held(k, A, 0.9, k.g({}), 'R', 0, 30);
      // コイン：手→投入口→（故障）→返却口→手
      let cx = h.x, cy = h.y, op = 1;
      if (t > 1.5 && t < 2.0) op = 0;
      else if (t >= 2.0 && t < 3.0) { const f = easeIn(seg(t, 2.0, 2.3)); cx = 304; cy = lerp(186, 202, f) - 2 * wobble(seg(t, 2.3, 2.8), 2, 4); }
      else if (t < 1.1) op = 0;
      tf(c, cx, cy); c.setAttribute('opacity', op);
      // 故障：画面が赤く点滅して×、火花
      const bad = t > 1.6;
      const fl = bad ? (Math.sin(t * 30) > 0 || t > 2.4 ? 1 : 0.4) : 0;
      k.set(scr, { fill: bad ? '#E8564A' : '#9FD0F2', opacity: bad ? 0.6 + 0.4 * fl : 1 });
      xm.setAttribute('opacity', bad ? fl : 0);
      sparks.forEach((s, i) => { const q = seg(t, 1.65 + i * 0.12, 2.1 + i * 0.12); tf(s, 336 + 10 * i * q, 92 - 20 * q + i * 6, q * 180, q > 0 && q < 1 ? 1 - q * 0.6 : 0.001); });
      sw.setAttribute('opacity', t > 2.2 ? 1 : 0); tf(sw, A.state.x - 26, FY - 94 + 8 * seg(t, 2.2, 4.4));
    }
  };
}
