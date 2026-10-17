// put on：雪の中で震えるまめがコートを取って着ると、震えが止まる（例文 Put on your coat. It's cold.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';

const R = 4.8 / 4.4; // 内部の時間割は 4.8 秒分。表示は 4.4 秒に収める
export const meta = { duration: 4.4, beats: [[0, '寒い'], [1.6, 'コートを着る'], [3.5, 'あたたかい']].map(([a, n]) => [+(a / R).toFixed(2), n]) };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  // 雪原
  el('rect', { x: 0, y: FY - 6, width: 400, height: 70, fill: '#FFFFFF' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 3, fill: '#DCEAF6' });
  el('ellipse', { cx: 60, cy: FY + 20, rx: 80, ry: 12, fill: '#EAF3FB' });
  el('ellipse', { cx: 350, cy: FY + 26, rx: 90, ry: 12, fill: '#EAF3FB' });
  // 木
  [[44, 2], [90, 1.5]].forEach(([x, sc]) => {
    const t = g({ transform: `translate(${x} ${FY - 4}) scale(${sc / 2})` });
    el('rect', { x: -5, y: -14, width: 10, height: 18, rx: 3, fill: pal.woodDark }, t);
    el('path', { d: 'M 0 -110 L 34 -52 L -34 -52 Z M 0 -78 L 44 -14 L -44 -14 Z', fill: pal.green, 'stroke-linejoin': 'round', stroke: pal.green, 'stroke-width': 6 }, t);
    el('path', { d: 'M 0 -110 L 12 -88 Q 0 -84 -12 -88 Z', fill: '#FFFFFF' }, t);
  });
  // コート掛け
  const RX = 338;
  el('rect', { x: RX - 3, y: 154, width: 6, height: 84, rx: 3, fill: pal.woodDark });
  el('circle', { cx: RX, cy: 154, r: 6.5, fill: pal.woodDark });
  el('ellipse', { cx: RX, cy: FY + 2, rx: 22, ry: 5, fill: pal.shadow });
  el('rect', { x: RX - 18, y: FY - 4, width: 36, height: 8, rx: 4, fill: pal.woodDark });
  // 暖かい光
  const glow = el('circle', { cx: 262, cy: 180, r: 80, fill: pal.yellow, opacity: 0 });
  const glow2 = el('circle', { cx: 262, cy: 180, r: 50, fill: pal.yellow, opacity: 0 });
  const puffs = [0, 1, 2, 3].map(() => el('circle', { cx: 0, cy: 0, r: 6, fill: '#FFFFFF', stroke: '#CFE3F5', 'stroke-width': 2 }));
  const ticks = [-1, 1].map((d) => g({}));
  ticks.forEach((tk, i) => { el('path', { d: 'M 0 0 L 0 -9 M 7 3 L 12 -4', stroke: pal.blueDark, 'stroke-width': 2.6, 'stroke-linecap': 'round', fill: 'none', transform: i ? 'scale(-1 1)' : '' }, tk); });

  const S = 1.25;
  const b = k.buddy({ x: 190, y: FY, scale: S });
  // コート（原点＝体の足元中央。体の座標系で描く）
  const coat = g({});
  const sl = [-1, 1].map((d) => {
    const s = g({}, coat);
    el('rect', { x: -6.5, y: 0, width: 13, height: 32, rx: 6.5, fill: pal.coralDark }, s);
    el('circle', { cx: 0, cy: 33, r: 6.2, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.5 }, s);
    return s;
  });
  el('rect', { x: -33, y: -34, width: 66, height: 38, rx: 12, fill: pal.coral }, coat);
  el('rect', { x: -9, y: -34, width: 18, height: 38, fill: pal.coralDark, opacity: 0.25 }, coat);
  el('path', { d: 'M -28 -36 Q 0 -26 28 -36 L 26 -29 Q 0 -19 -26 -29 Z', fill: pal.coralDark }, coat);
  [-24, -12, 0].forEach((y) => el('circle', { cx: 0, cy: y, r: 2.6, fill: '#FFFFFF', opacity: 0.9 }, coat));
  const snow = Array.from({ length: 24 }, (_, i) => ({ n: el('circle', { r: 2 + (i % 3) * 0.8, fill: '#FFFFFF', stroke: '#BFD8EE', 'stroke-width': 1.2 }), i }));

  const X0 = 170, X1 = 256, HX = RX, COATY = 205;
  const cold = (t) => 1 - easeInOut(seg(t, 3.2, 3.5));
  const xm = (t) => lerp(X0, X1, easeInOut(seg(t, 1.0, 1.6))) + Math.sin(t * 47) * 1.7 * cold(t);

  return {
    update(tt) {
      const t = tt * R;
      const c = cold(t);
      const x = xm(t);
      const walking = t > 1.0 && t < 1.6;
      const hug = 1 - easeInOut(seg(t, 1.45, 1.8));
      const reachR = easeInOut(seg(t, 1.45, 1.8)) * (1 - easeInOut(seg(t, 2.15, 2.5)));
      const carry = easeInOut(seg(t, 2.15, 2.5));
      const put = easeInOut(seg(t, 2.65, 3.3));
      let armR = lerp(-55, 76, 1 - hug) * (1 - carry) + (112 - put * 104) * carry;
      let armL = -55 * hug + 8 * (1 - hug) + 70 * hump(seg(t, 2.65, 3.3));
      armR = armR + 0 * reachR;
      const shiver = c;
      const warm = easeOut(seg(t, 3.3, 3.8));
      b.pose({
        x, armR, armL, walk: walking ? (t - 1.0) * 9 : 0,
        lean: Math.sin(t * 52) * 2.2 * shiver + 5 * hump(seg(t, 2.7, 3.2)),
        squash: 1 - 0.035 * shiver * (0.5 + 0.5 * Math.sin(t * 50)) - 0.04 * hump(seg(t, 2.7, 3.2)),
        mood: t < 3.3 ? (Math.sin(t * 34) > 0 ? 'flat' : 'open') : 'grin',
        look: 0.3 * (1 - warm), blink: 0
      });
      // コート：掛け具 → 手に持つ → 体に重なる
      const onHook = t < 2.0;
      if (onHook) {
        if (coat.parentNode !== b.g.parentNode) b.g.parentNode.appendChild(coat);
        tf(coat, HX, COATY, 0, S, S);
        sl.forEach((s, i) => tf(s, (i ? 1 : -1) * 27, -46, (i ? 1 : -1) * 10 + 0));
        // 肩〜袖は体の座標系で -46 から垂れる
        sl.forEach((s, i) => tf(s, (i ? 1 : -1) * 28, -34, (i ? 1 : -1) * 7));
      } else {
        if (coat.parentNode !== b.body) b.body.appendChild(coat);
        const sx = 0, sy = 0;
        const x0 = (HX - xm(2.0)) / S, y0 = (COATY - (FY - 10 * S)) / S;
        const a = carry, hold = { x: 62, y: -50, r: 14 };
        const px = lerp(x0, hold.x, a), py = lerp(y0, hold.y, a), pr = lerp(0, hold.r, a);
        const qx = lerp(px, 0, put), qy = lerp(py, 0, put), qr = lerp(pr, 0, put);
        tf(coat, qx, qy, qr, 1 + 0.05 * hump(put), 1);
        const open = (1 - put) * 14;
        sl.forEach((s, i) => tf(s, (i ? 1 : -1) * 28, -34, (i ? 1 : -1) * (7 + open)));
      }
      // 暖かさ
      glow.setAttribute('opacity', 0.16 * warm);
      glow2.setAttribute('opacity', 0.16 * warm);
      k.set(glow, { cx: x, cy: FY - 60, r: 96 + warm * 8 });
      k.set(glow2, { cx: x, cy: FY - 60, r: 66 + warm * 6 });
      // 白い息・震えの線
      puffs.forEach((p, i) => {
        const q = seg(t, 0.25 + i * 0.75, 1.0 + i * 0.75);
        const on = q > 0 && q < 1 && t < 3.2;
        tf(p, x + 22 + q * 30, FY - 62 - q * 16, 0, 0.5 + q * 1.1);
        p.setAttribute('opacity', on ? 0.9 * (1 - q) : 0);
      });
      ticks.forEach((tk, i) => {
        tf(tk, x + (i ? 52 : -52), FY - 92 + (i ? 4 : 0), 0, 1);
        tk.setAttribute('opacity', c > 0.5 && Math.sin(t * 28 + i * 2) > -0.2 ? 1 : 0);
      });
      // 雪（t だけで位置が決まる）
      snow.forEach(({ n, i }) => {
        const sp = 26 + (i % 5) * 9;
        const yy = ((t * sp + i * 41) % 290) - 10;
        const xx = ((i * 71) % 400) + Math.sin(t * 1.4 + i) * 9;
        k.set(n, { cx: xx, cy: yy, opacity: yy > FY + 40 ? 0 : 0.95 });
      });
    }
  };
}
