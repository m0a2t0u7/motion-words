// adjacent：上から見た地図で、ビルと駐車場は最初から隣同士。境目が光り、まめが車を降りて数歩で入口に着く（例文 The parking lot is adjacent to the building.）
import { seg, lerp, easeInOut, easeOut, backOut } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, 'ビルの隣'], [0.6, '境目が光る'], [2.7, 'すぐ入れる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  // 地図の下地
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#E6F3EA' });
  el('rect', { x: 0, y: 238, width: 400, height: 62, fill: '#D5DCE5' });
  for (let i = 0; i < 8; i++) el('rect', { x: 8 + i * 52, y: 266, width: 30, height: 5, rx: 2.5, fill: '#FFFFFF', opacity: 0.85 });
  [[26, 40], [64, 22], [350, 36], [380, 74], [20, 224]].forEach(([x, y]) => { el('circle', { cx: x, cy: y, r: 14, fill: '#BFE5CF' }); el('circle', { cx: x - 3, cy: y - 3, r: 7, fill: '#CFEDDB' }); });

  // ビル（屋上）
  const BX0 = 30, BX1 = 170, BY0 = 70, BY1 = 224;
  el('rect', { x: BX0 + 4, y: BY0 + 6, width: BX1 - BX0, height: BY1 - BY0, rx: 8, fill: pal.shadow });
  el('rect', { x: BX0, y: BY0, width: BX1 - BX0, height: BY1 - BY0, rx: 8, fill: '#F4F6FA', stroke: '#C9D1DD', 'stroke-width': 3 });
  el('rect', { x: BX0 + 12, y: BY0 + 12, width: BX1 - BX0 - 24, height: BY1 - BY0 - 24, rx: 5, fill: '#E4E9F1' });
  [[46, 86, 34, 26], [92, 86, 26, 26], [46, 130, 26, 26]].forEach(([x, y, w, h]) => { el('rect', { x, y, width: w, height: h, rx: 4, fill: '#CBD3DE' }); el('circle', { cx: x + w / 2, cy: y + h / 2, r: Math.min(w, h) / 2 - 5, fill: 'none', stroke: '#AEB9C8', 'stroke-width': 2.5 }); });
  el('rect', { x: 52, y: 180, width: 76, height: 22, rx: 6, fill: pal.blue });
  k.text(90, 191.5, 'BUILDING', { 'font-size': 11, fill: '#FFFFFF' });

  // 入口（ビルの右側＝駐車場側）
  const door = el('rect', { x: 155, y: 178, width: 15, height: 28, rx: 3, fill: pal.blue, stroke: '#FFFFFF', 'stroke-width': 2 });

  // 駐車場（ビルのすぐ右隣に最初から置く。動かさない）
  const LX = BX1, LW = 112, LH = BY1 - BY0;
  const lot = g({ transform: `translate(${LX} ${BY0})` });
  el('rect', { x: 4, y: 6, width: LW, height: LH, rx: 8, fill: pal.shadow }, lot);
  el('rect', { width: LW, height: LH, rx: 8, fill: '#69758A' }, lot);
  el('rect', { width: 24, height: LH, fill: '#69758A' }, lot);
  [0, 1].forEach((row) => {
    const y0 = row ? 92 : 14;
    for (let i = 0; i <= 3; i++) el('line', { x1: 10 + i * 31, y1: y0, x2: 10 + i * 31, y2: y0 + 48, stroke: '#FFFFFF', 'stroke-width': 3, 'stroke-linecap': 'round' }, lot);
  });
  const carD = (x, y, c) => { const cg = g({ transform: `translate(${x} ${y})` }, lot); el('rect', { x: -10, y: -19, width: 20, height: 38, rx: 7, fill: c }, cg); el('rect', { x: -7, y: -9, width: 14, height: 11, rx: 3, fill: '#EAF4FB' }, cg); el('rect', { x: -7, y: 6, width: 14, height: 5, rx: 2, fill: 'rgba(40,52,70,0.25)' }, cg); return cg; };
  carD(56, 38, pal.coral); carD(87, 38, pal.yellow);
  el('circle', { cx: 25, cy: 116, r: 11, fill: pal.blue, stroke: '#FFFFFF', 'stroke-width': 2 }, lot);
  k.text(25, 117, 'P', { 'font-size': 14, fill: '#FFFFFF' }, lot);
  const myCar = carD(87, 116, pal.mint);
  const cdoor = g({ transform: 'translate(-10 -4)' }, myCar);
  el('rect', { x: -2, y: 0, width: 3, height: 14, rx: 1.5, fill: pal.mintDark }, cdoor);

  // 境目（ビルと駐車場のあいだの線）。端から端へ光が走る
  const seamGlow = el('rect', { x: LX - 4, y: BY0 + 2, width: 8, height: BY1 - BY0 - 4, rx: 4, fill: pal.yellow, opacity: 0 });
  const seam = el('line', { x1: LX, y1: BY0 + 6, x2: LX, y2: BY1 - 6, stroke: '#FFFFFF', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.0 });
  const glow = el('rect', { x: LX - 7, y: BY0, width: 14, height: 40, rx: 7, fill: pal.yellow, opacity: 0 });
  const sparks = [[LX, BY0 + 8], [LX, 147], [LX, BY1 - 8]].map(([x, y], i) => {
    const s = g({});
    el('path', { d: 'M 0 -8 Q 1.5 -1.5 8 0 Q 1.5 1.5 0 8 Q -1.5 1.5 -8 0 Q -1.5 -1.5 0 -8 Z', fill: i % 2 ? '#FFFFFF' : pal.yellow }, s);
    return { s, x, y };
  });

  // まめ（車を降りて、数歩でビルの入口へ）
  const MY = 204, XS = 232, XE = 183;
  const b = k.buddy({ x: XS, y: MY, scale: 0.55, facing: -1 });
  return {
    update(t) {
      // 境目の光：上から下へ走り、そのまま全体が光り続ける
      const run = seg(t, 0.6, 1.5), steady = seg(t, 1.4, 1.8);
      k.set(glow, { y: lerp(BY0 - 4, BY1 - 36, easeInOut(run)), opacity: 0.85 * Math.sin(Math.PI * Math.min(run, 1)) * (1 - steady) });
      k.set(seamGlow, { opacity: 0.5 * steady * (0.8 + 0.2 * Math.sin(t * 7)) });
      k.set(seam, { stroke: '#FFFFFF', opacity: 0.55 * seg(t, 0.3, 0.6) + 0.45 * steady });
      sparks.forEach((q, i) => {
        const u = seg(t, 1.5 + i * 0.1, 1.9 + i * 0.1);
        const sc = u <= 0 ? 0 : u >= 1 ? 0.9 + 0.15 * Math.sin(t * 8 + i) : easeOut(u);
        tf(q.s, q.x, q.y, t * 40, sc, sc);
      });
      // 車のドアが開いて、まめが降りる
      const open = easeOut(seg(t, 1.7, 2.0)) * (1 - seg(t, 2.9, 3.2));
      tf(cdoor, -10, -4, 50 * open);
      const out = seg(t, 1.85, 2.05);
      b.g.setAttribute('opacity', out);
      const walk = easeInOut(seg(t, 2.1, 3.2));
      const walking = walk > 0 && walk < 1;
      const arrived = t >= 3.25;
      b.pose({
        x: lerp(XS, XE, walk), walk: walking ? (t - 2.1) * 9 : 0,
        armR: arrived ? 125 + 12 * Math.sin((t - 3.25) * 11) : 8, armL: 8 + (walking ? 8 * Math.sin((t - 2.1) * 9) : 0),
        look: -0.8, lean: walking ? 4 : 0, mood: arrived ? 'grin' : 'smile',
        lift: arrived ? 4 * Math.abs(Math.sin((t - 3.25) * 7)) * (1 - seg(t, 3.25, 4.2)) : 0
      });
      // 入口：着いたら明かりがつく
      const lit = easeOut(seg(t, 3.1, 3.4));
      k.set(door, { fill: lit > 0.5 ? pal.yellow : pal.blue });
    }
  };
}
