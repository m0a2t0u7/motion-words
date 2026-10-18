// pull up：タクシーが走ってきて減速し、ホテルの玄関前でぴたりと止まる（例文 A taxi pulled up in front of the hotel.）
import { seg, lerp, easeOut, easeInOut, wobble, clamp } from '../ease.js';

export const meta = { duration: 3.8, beats: [[0, '走ってくる'], [1.4, '減速する'], [2.6, '玄関前に停車']] };

// 共有：横から見た車（原点＝前後輪の中間の地面）。update(x, dist, pitch) で動かす
export function car(k, { color = k.pal.yellow, dark = k.pal.yellowDark, kind = 'car', driver = true } = {}) {
  const { el, g, tf, pal } = k;
  const o = g({});
  const sh = k.shadow(0, 2, kind === 'bus' ? 110 : 66, 6, o);
  const body = g({}, o);
  const L = kind === 'bus' ? 200 : 128, H = kind === 'bus' ? 90 : 34;
  if (kind === 'bus') {
    el('rect', { x: -L / 2, y: -H - 14, width: L, height: H, rx: 12, fill: color }, body);
    for (let i = 0; i < 5; i++) el('rect', { x: -L / 2 + 14 + i * 34, y: -H - 4, width: 28, height: 30, rx: 4, fill: '#CFE9F7' }, body);
    el('rect', { x: -L / 2, y: -40, width: L, height: 8, fill: dark }, body);
  } else {
    el('path', { d: `M ${-L / 2 + 26} ${-H - 12} Q ${-L / 2 + 34} ${-H - 36} ${-10} ${-H - 36} L 20 ${-H - 36} Q 40 ${-H - 36} 50 ${-H - 12} Z`, fill: color }, body);
    el('path', { d: `M ${-L / 2 + 34} ${-H - 13} Q ${-L / 2 + 40} ${-H - 30} -8 ${-H - 30} L -8 ${-H - 13} Z M 0 ${-H - 13} L 0 ${-H - 30} L 18 ${-H - 30} Q 34 ${-H - 30} 42 ${-H - 13} Z`, fill: '#CFE9F7' }, body);
    el('rect', { x: -L / 2, y: -H - 14, width: L, height: H, rx: 10, fill: color }, body);
    el('rect', { x: L / 2 - 8, y: -H - 4, width: 8, height: 8, rx: 2, fill: '#FFF3C4' }, body);
    el('rect', { x: -L / 2, y: -H + 2, width: 6, height: 7, rx: 2, fill: pal.red }, body);
    if (driver) { const d = el('circle', { cx: 14, cy: -H - 22, r: 8, fill: pal.mint }, body); el('circle', { cx: 18, cy: -H - 24, r: 1.6, fill: pal.ink }, body); }
  }
  const wx = kind === 'bus' ? [-64, 64] : [-38, 38];
  const wheels = wx.map((x) => { const w = g({}, o); el('circle', { r: 13, fill: pal.ink }, w); el('circle', { r: 5, fill: '#C9CED8' }, w); el('rect', { x: -1.5, y: -11, width: 3, height: 7, fill: '#C9CED8' }, w); return { w, x }; });
  return {
    g: o, body,
    update(x, y, dist, pitch = 0, s = 1) {
      tf(o, x, y, 0, s);
      wheels.forEach((w) => tf(w.w, w.x, -13, (dist / 13) * 57.3));
      tf(body, 0, 0, pitch);
    }
  };
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  // ホテル（静止）
  el('rect', { x: 150, y: 40, width: 220, height: 168, fill: '#F1E4D4' });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) el('rect', { x: 164 + c * 42, y: 52 + r * 34, width: 26, height: 22, rx: 3, fill: '#CFE9F7' });
  el('rect', { x: 236, y: 156, width: 48, height: 52, fill: '#FFE7A3' });
  el('path', { d: 'M 222 156 L 298 156 L 290 146 L 230 146 Z', fill: pal.coral });
  k.text(260, 26 + 10, 'HOTEL', { 'font-size': 14, fill: pal.coralDark });
  el('rect', { x: 0, y: 208, width: 400, height: 8, fill: '#D4DAE2' });
  el('rect', { x: 0, y: 216, width: 400, height: 84, fill: '#9AA3B2' });
  [20, 120, 220, 320].forEach((x) => el('rect', { x, y: 262, width: 50, height: 4, fill: '#fff', opacity: 0.8 }));
  const taxi = car(k, { color: pal.yellow, dark: pal.yellowDark });
  const sign = g({}, taxi.body); el('rect', { x: -14, y: -78, width: 28, height: 10, rx: 3, fill: '#fff', stroke: pal.yellowDark, 'stroke-width': 2 }, sign);
  const door = k.buddy({ x: 310, y: 210, scale: 0.6, color: pal.coral, dark: pal.coralDark, facing: -1 });
  return {
    update(t) {
      // 等速で入ってきて、玄関前で減速して止まる
      const p = clamp(t / 2.4);
      const X0 = -90, X1 = 260;
      const x = t < 2.4 ? lerp(X0, X1, 1 - Math.pow(1 - p, 2.2)) : X1;
      const v = t < 2.4 ? (1 - p) : 0;
      const stop = seg(t, 2.2, 3.0);
      const pitch = 3 * Math.sin(stop * Math.PI) * (1 - stop) + 1.5 * wobble(stop, 1.5, 4);
      taxi.update(x, 246, x - X0, t < 2.2 ? 0 : pitch, 1);
      door.pose({ armR: t > 2.6 ? lerp(10, 120, easeOut(seg(t, 2.6, 3.0))) : 10, look: -0.6, mood: t > 2.6 ? 'grin' : 'smile' });
    }
  };
}
