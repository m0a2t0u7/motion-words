// department：大きなフロアが「SALES」「IT」「HR」の部に分かれていて、まめは営業部の席へ行き、電話で注文を取る（例文 She works in the sales department.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hold, aim, walkTo, path, person, desk, monitor } from './confused.js';
import { phone } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0.0, '部に分かれる'], [1.34, '営業部へ'], [2.87, '営業の仕事']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.8;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const Z = [['SALES', 0, '#FFE3D8', pal.coral], ['IT', 140, '#DCEBFF', pal.blue], ['HR', 270, '#E5F5E5', pal.green]];
  Z.forEach(([lab, x, c, d], i) => {
    const w = i === 0 ? 136 : 126;
    el('rect', { x: x + 2, y: 20, width: w, height: FY - 20, fill: c });
    el('rect', { x: x + 2, y: FY, width: w, height: 64, fill: c, opacity: 0.5 });
    el('line', { x1: x + w + 4, y1: 70, x2: x + w + 4, y2: FY, stroke: '#B8C2CF', 'stroke-width': 5 });
    el('line', { x1: x + w / 2 - 20, y1: 0, x2: x + w / 2 - 20, y2: 30 }, undefined);
    el('rect', { x: x + w / 2 - 34, y: 30, width: 68, height: 26, rx: 5, fill: d });
    k.text(x + w / 2, 44, lab, { 'font-size': 14, fill: '#fff' });
  });
  // 営業部の売上グラフ
  const bars = [0, 1, 2].map((i) => el('rect', { x: 20 + i * 16, y: 0, width: 11, height: 0, fill: pal.coralDark }));
  el('rect', { x: 14, y: 70, width: 60, height: 54, fill: 'none', stroke: pal.coralDark, 'stroke-width': 2 });
  // 他の部の人
  const it = person(k, 'blue', { x: 205, y: FY, scale: S, facing: 1 });
  const hr = person(k, 'yellow', { x: 335, y: FY, scale: S, facing: -1 });
  desk(k, 215, 70, FY); monitor(k, 250, FY - 46);
  desk(k, 290, 70, FY);
  const b = k.buddy({ x: 360, y: FY, scale: S, facing: -1 });
  const top = desk(k, 72, 64, FY);
  const ph = phone(k);
  const xf = path([[0.4, 380], [2.4, 64]]);
  return {
    update(t) {
      t *= 4.6 / 4.4; // 4.4 秒に収める
      const w = walkTo(xf, t, 380, -1), call = seg(t, 2.6, 2.9);
      P(b, { x: w.x, walk: w.walk, facing: t > 2.4 ? 1 : -1, lean: w.lean, armL: w.armL, armR: w.armR, mood: t > 2.9 ? (Math.sin(t * 18) > 0 ? 'open' : 'grin') : 'smile', look: 0.5, blink: blinkAt(t) });
      if (t > 2.6) b.pose({ armR: lerp(10, 170, easeOut(call)) });
      hold(k, b, S, ph.g, 'R', 0);
      ph.g.setAttribute('opacity', t > 2.6 ? 1 : 0);
      bars.forEach((r, i) => { const h = (14 + i * 10) * (t > 3.2 ? 1 + 0.5 * easeOut(seg(t, 3.2 + i * 0.2, 3.6 + i * 0.2)) : 1); k.set(r, { y: 120 - h, height: h }); });
      P(it, { x: 205, facing: 1, lean: 8, look: 0.8, armR: 60 + 6 * Math.sin(t * 20), blink: blinkAt(t, 1) });
      P(hr, { x: 335, facing: -1, lean: 6, look: 0.8, armR: 50, blink: blinkAt(t, 2) });
      void top;
    }
  };
}
