// allocate：まめがコインの山から取り、3つの容器へ配る。MARKETING には多め（例文 We allocated more budget to marketing.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';

export const meta = { duration: 4.3, beats: [[0, '予算がある'], [1.3, '分ける'], [3.2, '多めに配った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 262, mood: 'indoor' });
  el('rect', { x: 30, y: 36, width: 70, height: 60, rx: 8, fill: '#DDEFFA' });
  el('line', { x1: 65, y1: 36, x2: 65, y2: 96, stroke: '#FFFFFF', 'stroke-width': 4 });

  // カウンター
  const CT = 222;
  [20, 372].forEach((x) => el('rect', { x, y: CT + 10, width: 10, height: 34, rx: 3, fill: pal.woodDark }));
  el('rect', { x: 8, y: CT, width: 384, height: 12, rx: 6, fill: pal.wood });
  k.shadow(200, 264, 190, 5);

  // コインの山（左）
  const PX = 66;
  const pileSpots = [[-8, -24], [8, -24], [-16, -12], [0, -12], [16, -12], [-24, 0], [-8, 0], [8, 0], [24, 0]];
  const mkCoin = (r, parent) => {
    const c = g({}, parent);
    el('circle', { r, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, c);
    el('circle', { r: r * 0.48, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 1.5 }, c);
    return c;
  };
  const flag = g({});
  tf(flag, PX, 150);
  el('rect', { x: -26, y: -10, width: 52, height: 20, rx: 6, fill: pal.mint }, flag);
  k.text(0, 0.5, 'BUDGET', { 'font-size': 10, fill: '#FFFFFF' }, flag);
  el('path', { d: 'M -5 10 L 5 10 L 0 17 Z', fill: pal.mint }, flag);

  const coins = pileSpots.map(() => mkCoin(8, null));

  // 容器
  const bins = [
    { name: 'MARKETING', cx: 224, w: 80, h: 70, col: pal.coral, slots: [[-18, 0], [0, 0], [18, 0], [-9, -13], [9, -13]] },
    { name: 'SALES', cx: 306, w: 54, h: 58, col: pal.blue, slots: [[-9, 0], [9, 0]] },
    { name: 'IT', cx: 366, w: 54, h: 58, col: pal.violet, slots: [[-9, 0], [9, 0]] }
  ];
  bins.forEach((b) => {
    b.glass = g({});
    const x0 = b.cx - b.w / 2, y0 = CT - b.h;
    b.glow = el('rect', { x: x0 - 5, y: y0 - 5, width: b.w + 10, height: b.h + 10, rx: 14, fill: pal.yellow, opacity: 0 });
    b.back = el('rect', { x: x0, y: y0, width: b.w, height: b.h, rx: 10, fill: '#EEF4FA' });
    b.glass2 = null;
  });
  // コインの描画（容器の中）
  const order = [0, 1, 0, 2, 0, 1, 0, 2, 0];
  const lands = [];
  const cnt = [0, 0, 0];
  order.forEach((bi) => {
    const sl = bins[bi].slots[cnt[bi]++];
    lands.push([bins[bi].cx + sl[0], CT - 8 + sl[1]]);
  });
  const flying = pileSpots.map(() => mkCoin(7, null));
  // 容器の前面（ガラスとラベル）をコインの上に描く
  bins.forEach((b) => {
    const x0 = b.cx - b.w / 2, y0 = CT - b.h;
    el('rect', { x: x0, y: y0, width: b.w, height: b.h, rx: 10, fill: 'rgba(255,255,255,0.28)', stroke: '#C5D0DE', 'stroke-width': 3 });
    el('rect', { x: x0 + 7, y: y0 + 8, width: 5, height: b.h - 24, rx: 2.5, fill: '#FFFFFF', opacity: 0.55 });
    el('rect', { x: x0 + 6, y: CT - 22 + 0, width: b.w - 12, height: 0.01, fill: 'none' });
    el('rect', { x: x0 - 2, y: y0 + 8, width: b.w + 4, height: 17, rx: 5, fill: b.col });
    k.text(b.cx, y0 + 16.8, b.name, { 'font-size': 10, fill: '#FFFFFF' });
  });
  coins.forEach((c) => k.root.appendChild(c));
  flying.forEach((c) => k.root.appendChild(c));

  const b = k.buddy({ x: 134, y: 268, scale: 0.85 });
  const sparks = [[200, 130], [250, 118], [300, 140]].map(([x, y], i) => {
    const s = g({});
    el('path', { d: 'M 0 -8 Q 1.5 -1.5 8 0 Q 1.5 1.5 0 8 Q -1.5 1.5 -8 0 Q -1.5 -1.5 0 -8 Z', fill: i % 2 ? pal.yellow : pal.mint }, s);
    return { s, x, y };
  });

  const T0 = 0.5, DT = 0.29;
  return {
    update(t) {
      const phi = (t - T0) / DT;
      const active = t > T0 - 0.2 && t < T0 + DT * 9 + 0.1;
      const cyc = active ? Math.cos(2 * Math.PI * phi) : 1;
      const happy = t >= 3.55;
      const aL = active ? 56 + 24 * cyc : lerp(8, 56, easeInOut(seg(t, 0.15, T0 - 0.2))) * (t < 3 ? 1 : 1 - easeInOut(seg(t, 3.0, 3.4)));
      const aR = active ? 62 + 30 * Math.max(0, Math.sin(2 * Math.PI * (phi - 0.25))) : 8;
      b.pose({
        armL: happy ? 130 + 10 * Math.sin((t - 3.55) * 11) : aL,
        armR: happy ? 140 - 10 * Math.sin((t - 3.55) * 11) : aR,
        look: active ? 0.7 : 0.4, lean: active ? 3 : 0, mood: happy ? 'grin' : 'smile',
        lift: happy ? 7 * Math.abs(Math.sin((t - 3.55) * 7)) * (1 - seg(t, 3.55, 4.3)) : 0
      });
      const hp = b.handPos('L');
      const hand = [hp.x, hp.y];

      // 山のコイン
      coins.forEach((c, i) => {
        const tp = T0 + DT * i;
        const [sx, sy] = pileSpots[i];
        const near = [PX + sx, CT - 8 + sy];
        if (t < tp - 0.2) { tf(c, near[0], near[1]); c.setAttribute('opacity', 1); }
        else c.setAttribute('opacity', 0);
      });
      // 飛ぶコイン：山 → 手 → 容器
      flying.forEach((c, i) => {
        const tp = T0 + DT * i;
        const [sx, sy] = pileSpots[i];
        const near = [PX + sx, CT - 8 + sy];
        const dst = lands[i];
        let pos, vis = 1;
        if (t < tp - 0.2) vis = 0;
        else if (t < tp) pos = [lerp(near[0], hand[0], easeInOut(seg(t, tp - 0.2, tp))), lerp(near[1], hand[1], easeInOut(seg(t, tp - 0.2, tp))) - 6 * hump(seg(t, tp - 0.2, tp))];
        else if (t < tp + 0.5) {
          const u = seg(t, tp, tp + 0.5);
          const e = easeOut(u);
          pos = [lerp(hand[0], dst[0], e), lerp(hand[1], dst[1], u * u * (3 - 2 * u)) - 62 * 4 * u * (1 - u)];
        } else pos = dst;
        c.setAttribute('opacity', vis);
        if (pos) tf(c, pos[0], pos[1], t < tp + 0.5 ? (t - tp) * 400 : 0);
      });
      // MARKETING の光
      bins[0].glow.setAttribute('opacity', 0.55 * hump(seg(t, 3.3, 4.3)) + 0.2 * seg(t, 3.9, 4.3));
      sparks.forEach((q, i) => {
        const u = seg(t, 3.6 + i * 0.1, 4.05 + i * 0.1);
        const sc = u <= 0 ? 0 : u >= 1 ? 0.9 + 0.15 * Math.sin(t * 8 + i) : easeOut(u);
        tf(q.s, q.x, q.y, t * 40, sc, sc);
      });
    }
  };
}
