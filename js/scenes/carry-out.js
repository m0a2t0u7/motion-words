// carry out：クリップボードの計画どおり客3人に順に聞き取りを行い、結果がグラフになる（例文 We carried out a survey of our customers.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '計画を持つ'], [1.0, '実施する'], [3.1, 'やり終えた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 壁：窓・観葉植物
  el('rect', { x: 30, y: 36, width: 62, height: 52, rx: 6, fill: '#D6EDF8' });
  el('line', { x1: 61, y1: 36, x2: 61, y2: 88, stroke: '#FFFFFF', 'stroke-width': 4 });
  el('ellipse', { cx: 200, cy: 258, rx: 190, ry: 18, fill: '#FBE3D8' });

  const CUST = [
    { x: 196, c: pal.coral, d: pal.coralDark },
    { x: 266, c: pal.blue, d: pal.blueDark },
    { x: 336, c: pal.yellow, d: pal.yellowDark }
  ];
  const cs = CUST.map((o) => k.buddy({ x: o.x, y: FY, scale: 0.78, facing: -1, color: o.c, dark: o.d }));
  const ask = [1.0, 1.7, 2.4];

  // 聞き取りをする側
  const MX = 84;
  const b = k.buddy({ x: MX, y: FY, scale: 0.92 });
  const cb = g({});
  el('rect', { x: -17, y: -35, width: 34, height: 40, rx: 4, fill: pal.woodDark }, cb);
  el('rect', { x: -14, y: -31, width: 28, height: 33, rx: 2, fill: '#FFFFFF' }, cb);
  el('rect', { x: -8, y: -38, width: 16, height: 7, rx: 2.5, fill: '#8F9BB0' }, cb);
  [0, 1, 2].forEach((i) => {
    el('rect', { x: -11, y: -24 + i * 9, width: 5, height: 5, rx: 1.2, fill: 'none', stroke: pal.sub, 'stroke-width': 1.3 }, cb);
    el('rect', { x: -3, y: -23 + i * 9, width: 14, height: 3, rx: 1.5, fill: pal.line }, cb);
  });
  b.body.insertBefore(cb, b.armR.a.parentNode);
  tf(cb, 0, 3);
  // クリップボードにチェック（客ごと）
  const ticks = [0, 1, 2].map((i) => el('path', { d: `M -11 ${-22 + i * 9} L -9 ${-19.5 + i * 9} L -5 ${-26 + i * 9}`, stroke: pal.green, 'stroke-width': 1.8, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 }, cb));

  // 質問の吹き出し（話し手から客へ飛ぶ）
  const q = g({});
  el('circle', { cx: 0, cy: 0, r: 13, fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 2 }, q);
  k.text(0, 1, '?', { 'font-size': 17, fill: pal.blueDark }, q);
  // 客の頭上のチェック
  const marks = CUST.map((o) => {
    const m = g({});
    el('circle', { cx: 0, cy: 0, r: 13, fill: pal.green }, m);
    el('path', { d: 'M -6 0 L -2 4.5 L 6.5 -5', stroke: '#FFFFFF', 'stroke-width': 3.4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, m);
    return m;
  });
  // グラフカード（クリップボードから出る）
  const chart = g({});
  el('rect', { x: -66, y: -44, width: 136, height: 92, rx: 12, fill: 'rgba(40,52,70,0.12)' }, chart);
  el('rect', { x: -70, y: -48, width: 136, height: 92, rx: 12, fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 2.5 }, chart);
  el('line', { x1: -52, y1: 28, x2: 52, y2: 28, stroke: pal.sub, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, chart);
  el('rect', { x: -48, y: -36, width: 40, height: 7, rx: 3.5, fill: pal.line }, chart);
  const bars = [[-44, pal.coral, 40], [-12, pal.blue, 56], [20, pal.yellow, 30]].map(([x, c, h]) => ({ r: el('rect', { x, y: 28, width: 24, height: 0, rx: 4, fill: c }, chart), x, h }));

  return {
    update(t) {
      // 聞き手：胸の前でクリップボードを持ち、質問のとき右手で客のほうを示す
      let point = 0;
      ask.forEach((a) => { point = Math.max(point, hump(seg(t, a - 0.1, a + 0.55))); });
      const done = easeInOut(seg(t, 3.2, 3.6));
      b.pose({
        x: MX, armL: -25, armR: lerp(-25, 78, point), lean: 2 * point, look: 0.6,
        mood: t < 1.0 ? 'smile' : t > 3.1 ? 'grin' : 'open', squash: 1 - 0.02 * done
      });
      // 質問の吹き出し
      let qs = 0, qx = 0, qy = 0, qo = 0;
      ask.forEach((a, i) => {
        const p = seg(t, a, a + 0.42);
        if (p > 0 && p < 1) { qx = lerp(MX + 40, CUST[i].x - 22, easeInOut(p)); qy = lerp(FY - 92, FY - 80, p) - hump(p) * 10; qs = 0.7 + 0.5 * hump(p); qo = 1; }
      });
      tf(q, qx, qy, 0, qs, qs);
      q.setAttribute('opacity', qo);
      // 客：受け取ってうなずき、チェックが付く
      cs.forEach((c, i) => {
        const a = ask[i] + 0.42;
        const nod = hump(seg(t, a, a + 0.35));
        const ok = seg(t, a + 0.3, a + 0.6);
        c.pose({ look: -0.6, squash: 1 - 0.07 * nod, lean: -4 * nod, mood: ok > 0 ? 'smile' : 'open', armL: 8, armR: ok > 0 ? 8 + 50 * hump(seg(t, a + 0.3, a + 0.8)) : 8 });
        const s = Math.max(0.001, backOut(ok, 1.8));
        tf(marks[i], CUST[i].x, FY - 98, 0, s, s);
        marks[i].setAttribute('opacity', ok > 0 ? 1 : 0);
        ticks[i].setAttribute('opacity', ok > 0.5 ? 1 : 0);
      });
      // グラフ：クリップボードから飛び出して広がる
      const cp = seg(t, 3.0, 3.6);
      const e = easeOut(cp), s = Math.max(0.001, backOut(cp, 1.3));
      tf(chart, lerp(MX, 222, e), lerp(FY - 60, 78, e), 0, lerp(0.15, 1, s), lerp(0.15, 1, s));
      chart.setAttribute('opacity', cp > 0 ? 1 : 0);
      bars.forEach((o, i) => {
        const h = o.h * easeOut(seg(t, 3.5 + i * 0.15, 4.0 + i * 0.15));
        k.set(o.r, { height: h, y: 28 - h });
      });
    }
  };
}
