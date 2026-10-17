// renovate：古びたホテルに足場が組まれ、まめがローラーで塗り直し、足場が外れてぴかぴかの建物になる（例文 The hotel was renovated last year.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '古い建物'], [1.2, '工事する'], [3.2, '新しくなった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#E7ECF2' });

  const L = 70, R = 330, TOP = 78;
  const build = (parent, neu) => {
    const C = neu
      ? { wall: '#FFF1E0', roof: pal.coral, win: '#CFE9F7', frame: '#FFFFFF', door: pal.blue, sign: pal.coral, text: '#FFFFFF', base: '#F2D9BE' }
      : { wall: '#DDD2C2', roof: '#8F95A1', win: '#AFBBC4', frame: '#C9C2B6', door: '#8D8A8F', sign: '#B3A88F', text: '#8E8570', base: '#BFB3A0' };
    el('rect', { x: L, y: TOP, width: R - L, height: FY - TOP, fill: C.wall }, parent);
    el('rect', { x: L, y: FY - 10, width: R - L, height: 10, fill: C.base }, parent);
    el('rect', { x: L - 8, y: TOP - 20, width: R - L + 16, height: 22, rx: 4, fill: C.roof }, parent);
    // 窓
    const wins = [[100, 98], [183, 98], [266, 98], [100, 160], [266, 160]];
    wins.forEach(([x, y], i) => {
      el('rect', { x: x - 3, y: y - 3, width: 40, height: 44, rx: 5, fill: C.frame }, parent);
      el('rect', { x, y, width: 34, height: 38, rx: 3, fill: C.win }, parent);
      if (neu) {
        el('rect', { x, y, width: 8, height: 38, fill: pal.coral, opacity: 0.55 }, parent);
        el('rect', { x: x + 26, y, width: 8, height: 38, fill: pal.coral, opacity: 0.55 }, parent);
        el('ellipse', { cx: x + 10, cy: y + 10, rx: 4, ry: 9, fill: '#FFFFFF', opacity: 0.7 }, parent);
      } else {
        el('line', { x1: x + 17, y1: y, x2: x + 17, y2: y + 38, stroke: C.frame, 'stroke-width': 2 }, parent);
        for (let n = 0; n < 4; n++) el('line', { x1: x, y1: y + 6 + n * 8, x2: x + (i === 1 ? 34 : 20), y2: y + 6 + n * 8, stroke: '#9AA6AF', 'stroke-width': 2 }, parent);
      }
    });
    // 入口
    el('rect', { x: 178, y: 168, width: 44, height: FY - 168, rx: 4, fill: C.door }, parent);
    el('rect', { x: 184, y: 176, width: 14, height: 28, rx: 3, fill: '#FFFFFF', opacity: neu ? 0.35 : 0.15 }, parent);
    el('circle', { cx: 214, cy: 208, r: 3.2, fill: neu ? pal.yellow : '#9B968F' }, parent);
    el('path', { d: 'M 170 168 L 230 168 L 222 156 L 178 156 Z', fill: neu ? pal.yellow : '#A39C8E' }, parent);
    // 看板（屋上）
    const sg = g({}, parent);
    tf(sg, 200, TOP - 38, neu ? 0 : -9);
    el('rect', { x: -44, y: 14, width: 4, height: 18, fill: C.roof }, sg);
    el('rect', { x: 40, y: 14, width: 4, height: 18, fill: C.roof }, sg);
    el('rect', { x: -52, y: -14, width: 104, height: 30, rx: 7, fill: C.sign }, sg);
    k.text(0, 1, 'HOTEL', { 'font-size': 20, fill: C.text }, sg);
    if (neu) {
      el('rect', { x: -52, y: -14, width: 104, height: 30, rx: 7, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 2, opacity: 0.7 }, sg);
      [-30, 0, 30].forEach((x) => el('circle', { cx: x, cy: -19, r: 2.6, fill: pal.yellow }, sg));
      [[96, 226], [304, 226]].forEach(([x, y]) => { el('rect', { x: x - 11, y: y - 2, width: 22, height: 12, rx: 3, fill: pal.coralDark }, parent); el('circle', { cx: x - 5, cy: y - 7, r: 6, fill: pal.mint }, parent); el('circle', { cx: x + 5, cy: y - 9, r: 6, fill: pal.mintDark }, parent); });
    } else {
      // ひび・汚れ・はがれ
      const c = (d) => el('path', { d, fill: 'none', stroke: '#6E6659', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, parent);
      c('M 134 98 L 142 112 L 136 124 L 146 140 L 140 152');
      c('M 266 138 L 256 150 L 262 166 L 250 178');
      c('M 160 90 L 168 104 L 162 118');
      c('M 300 90 L 308 104 L 303 114 L 312 128');
      el('ellipse', { cx: 150, cy: 214, rx: 34, ry: 16, fill: '#C9BCA8', opacity: 0.7 }, parent);
      el('ellipse', { cx: 292, cy: 104, rx: 20, ry: 30, fill: '#C9BCA8', opacity: 0.6 }, parent);
      el('path', { d: 'M 84 88 L 96 88 L 92 100 L 86 98 Z', fill: '#C9BCA8' }, parent);
      el('path', { d: 'M 318 196 L 328 196 L 328 210 L 322 206 Z', fill: '#C9BCA8' }, parent);
    }
    return sg;
  };

  // 古い建物 → 新しい建物（塗り進むところだけ新しく見える）
  const oldG = g({});
  const oldSign = build(oldG, false);
  const clipRect = { n: null };
  const clipId = k.clip((cp) => { clipRect.n = el('rect', { x: L - 12, y: 0, width: 0, height: 300 }, cp); });
  const newG = g({ 'clip-path': clipId });
  build(newG, true);

  // 足場（左右2ユニット）
  const mkScaf = (x0) => {
    const u = g({});
    const poles = [x0, x0 + 110].map((x) => {
      const p = g({}, u);
      tf(p, x, FY);
      el('rect', { x: -3, y: -170, width: 6, height: 170, rx: 3, fill: '#8795AB' }, p);
      return p;
    });
    const planks = [-62, -118].map((dy) => {
      const p = g({}, u);
      tf(p, x0 + 55, FY + dy);
      el('rect', { x: -66, y: -4, width: 132, height: 8, rx: 3, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 1.5 }, p);
      return p;
    });
    const brace = el('line', { x1: x0, y1: FY - 4, x2: x0 + 110, y2: FY - 118, stroke: '#8795AB', 'stroke-width': 4, 'stroke-linecap': 'round' }, u);
    return { u, poles, planks, brace, x0 };
  };
  const scL = mkScaf(84), scR = mkScaf(206);

  // 塗装ローラー（原点＝手）。ローラー部分は棒に沿って上下する
  const roller = g({});
  el('line', { x1: 0, y1: 0, x2: 0, y2: -128, stroke: '#8795AB', 'stroke-width': 4, 'stroke-linecap': 'round' }, roller);
  const rh = g({}, roller);
  el('path', { d: 'M 0 -78 L 0 -90 L 18 -90', fill: 'none', stroke: '#8795AB', 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, rh);
  el('rect', { x: -4, y: -108, width: 22, height: 36, rx: 6, fill: pal.coral, stroke: pal.coralDark, 'stroke-width': 2 }, rh);
  el('rect', { x: -4, y: -108, width: 5, height: 36, rx: 2.5, fill: '#FFFFFF', opacity: 0.35 }, rh);

  // 作業のまめ（ヘルメット）
  const MS = 0.75, MY = 272;
  const b = k.buddy({ x: -40, y: MY, scale: MS });
  const hat = g({}, b.body);
  el('path', { d: 'M -28 -66 Q -28 -96 0 -96 Q 28 -96 28 -66 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, hat);
  el('rect', { x: -32, y: -70, width: 64, height: 7, rx: 3.5, fill: pal.yellowDark }, hat);
  const sparks = [[110, 70], [200, 40], [290, 74], [330, 140]].map(([x, y], i) => {
    const s = g({});
    el('path', { d: 'M 0 -9 Q 1.5 -1.5 9 0 Q 1.5 1.5 0 9 Q -1.5 1.5 -9 0 Q -1.5 -1.5 0 -9 Z', fill: i % 2 ? pal.yellow : '#FFFFFF' }, s);
    return { s, x, y };
  });
  // 絵を後ろから前へ：足場→まめ
  k.root.appendChild(scL.u); k.root.appendChild(scR.u);
  k.root.appendChild(b.g); k.root.appendChild(roller);
  sparks.forEach((q) => k.root.appendChild(q.s));

  const PS = 1.55, PE = 3.0;  // 塗る区間
  return {
    update(t) {
      // 古い看板がゆれる
      tf(oldSign, 200, 40, -9 + 1.6 * Math.sin(Math.min(t, PS) * 3.4));

      // ---- 足場：組まれる → 外れる ----
      const build1 = (sc, d) => {
        sc.poles.forEach((p, i) => {
          const u = easeOut(seg(t, 0.6 + d + i * 0.12, 1.0 + d + i * 0.12));
          const px = sc.x0 + i * 110;
          tf(p, px, FY, 0, 1, Math.max(0.001, u));
        });
        sc.planks.forEach((p, i) => {
          const u = easeOut(seg(t, 0.95 + d + i * 0.12, 1.25 + d + i * 0.12));
          tf(p, sc.x0 + 55, FY - (i ? 118 : 62), 0, Math.max(0.001, u), 1);
        });
        sc.brace.setAttribute('opacity', seg(t, 1.1 + d, 1.3 + d));
      };
      build1(scL, 0); build1(scR, 0.12);
      const away = easeIn(seg(t, 3.0, 3.6));
      tf(scL.u, -250 * away, 0);
      tf(scR.u, 250 * away, 0);

      // ---- まめ：入ってきて塗り、終わったらローラーを下ろす ----
      const enter = easeOut(seg(t, 0.9, 1.5));
      const paint = seg(t, PS, PE);
      const edge = lerp(L - 12, R + 14, easeInOut(paint));
      const putDown = easeInOut(seg(t, 3.0, 3.4));
      const a = lerp(150, 40, putDown) + (paint > 0 && paint < 1 ? 14 * Math.sin(paint * Math.PI * 7.5) : 0);
      const px = t < PS ? lerp(-40, 19, enter) : lerp(19, R + 4 - 57, easeInOut(paint));
      const walking = (t > 0.9 && t < PS) || (t > PS && t < PE);
      const w = walking ? t * 10 : 0;
      const happy = t >= 3.5;
      b.pose({
        x: px, walk: w, armR: a, armL: happy ? 125 + 10 * Math.sin((t - 3.5) * 11) : 8 + (walking ? Math.sin(w) * 8 : 0),
        look: 0.7, lean: 0, mood: happy ? 'grin' : 'smile',
        lift: happy ? 6 * Math.abs(Math.sin((t - 3.5) * 7)) * (1 - seg(t, 3.5, 4.4)) : 0
      });
      const hp = b.handPos('R');
      const stroke = paint > 0 && paint < 1 ? Math.sin(paint * Math.PI * 7.5) : 0;
      const rot = lerp(20, 0, putDown);
      tf(roller, hp.x, hp.y, rot, 1, 1);
      tf(rh, 0, -30 * stroke * (1 - putDown) + 10 * putDown, 0, 1, 1);
      roller.setAttribute('opacity', t < 0.9 ? 0 : 1);
      oldSign.setAttribute('opacity', edge > 258 ? 0 : 1);
      // 塗り範囲：ローラーの縁まで（上下になぞる動きは高さ方向）
      k.set(clipRect.n, { width: Math.max(0, edge - (L - 12)) + (t >= PE ? 20 : 0) });
      // きらきら
      sparks.forEach((q, i) => {
        const u = seg(t, 3.5 + i * 0.1, 4.0 + i * 0.1);
        const sc = u <= 0 ? 0 : u >= 1 ? 0.9 + 0.15 * Math.sin(t * 8 + i) : easeOut(u);
        tf(q.s, q.x, q.y, t * 40, sc, sc);
      });
    }
  };
}
