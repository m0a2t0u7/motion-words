// eat out：家を出た2人がお店のテラス席に座り、ピザを分けて外で食事する（例文 We eat out on Fridays.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '家を出る'], [1.28, '店へ向かう'], [3.21, '外で食べる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: 236, width: 400, height: 8, fill: '#E3E8EE' });
  // 家（左）
  el('rect', { x: 6, y: 142, width: 96, height: 94, rx: 5, fill: '#FBE9DC' });
  el('path', { d: 'M -2 148 L 54 100 L 110 148 Z', fill: pal.coral, stroke: pal.coral, 'stroke-width': 6, 'stroke-linejoin': 'round' });
  el('rect', { x: 36, y: 176, width: 28, height: 60, rx: 4, fill: pal.blue });
  el('circle', { cx: 58, cy: 208, r: 2.6, fill: pal.yellow });
  el('rect', { x: 74, y: 164, width: 20, height: 22, rx: 3, fill: '#D8DEE8' });
  // お店（右）
  el('rect', { x: 226, y: 90, width: 180, height: 146, fill: '#FFEBD9' });
  el('rect', { x: 226, y: 84, width: 180, height: 10, fill: pal.coralDark });
  el('rect', { x: 276, y: 100, width: 68, height: 24, rx: 5, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 3 });
  el('path', { d: 'M 296 106 v 12 M 292 106 v 6 q 4 4 8 0 v -6 M 324 106 v 12 M 324 106 q 6 4 0 12', stroke: pal.ink, 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' });
  el('rect', { x: 348, y: 140, width: 44, height: 52, rx: 4, fill: '#CFE9F7' });
  el('line', { x1: 370, y1: 140, x2: 370, y2: 192, stroke: '#fff', 'stroke-width': 3 });
  el('rect', { x: 232, y: 148, width: 36, height: 88, rx: 3, fill: '#B8896A' });
  // 立て看板
  el('path', { d: 'M 204 236 L 210 194 L 228 194 L 234 236 Z', fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 2 });
  k.text(219, 208, 'FRI', { 'font-size': 9, fill: pal.red });
  // パラソルの柱
  el('rect', { x: 309, y: 128, width: 4, height: 72, fill: pal.woodDark });

  const ca = k.buddy({ x: 58, y: FY, scale: 0.9, color: pal.coral, dark: pal.coralDark });
  const ma = k.buddy({ x: 112, y: FY, scale: 0.9, facing: -1 });
  // 皿とピザ
  el('ellipse', { cx: 311, cy: 200, rx: 26, ry: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  const pz = g({});
  el('ellipse', { cx: 311, cy: 198, rx: 21, ry: 4.6, fill: '#F2B66D' }, pz);
  el('ellipse', { cx: 311, cy: 198, rx: 17, ry: 3.4, fill: '#F5CE8A' }, pz);
  [[302, 197], [311, 199], [320, 197], [316, 198], [306, 199]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 1.7, fill: pal.red }, pz));
  const bite = [el('path', { d: 'M 311 198 L 292 196 L 292 200 Z', fill: '#fff', opacity: 0 }), el('path', { d: 'M 311 198 L 330 196 L 330 200 Z', fill: '#fff', opacity: 0 })];
  // 卓と椅子（前面が下半身を隠す）
  el('rect', { x: 282, y: 202, width: 58, height: 8, rx: 3, fill: pal.wood });
  [288, 330].forEach((x) => el('rect', { x, y: 210, width: 6, height: 26, rx: 2, fill: pal.woodDark }));
  const stools = [260, 359].map((x) => { el('rect', { x: x - 30, y: 216, width: 60, height: 12, rx: 4, fill: pal.wood }); el('rect', { x: x - 28, y: 224, width: 56, height: 12, fill: pal.woodDark }); });
  // パラソル
  const pa = g({});
  el('path', { d: 'M 252 130 Q 311 78 370 130 Z', fill: pal.coral }, pa);
  [-36, -12, 12, 36].forEach((x, i) => { if (i % 2 === 0) el('path', { d: `M 311 ${100 - Math.abs(x) * 0.0} L ${311 + x - 12} 130 L ${311 + x + 12} 130 Z`, fill: '#fff', opacity: 0.85 }, pa); });
  el('path', { d: 'M 252 130 Q 311 118 370 130', fill: 'none', stroke: pal.coralDark, 'stroke-width': 3 }, pa);
  const slices = [0, 1].map(() => { const s = g({}); el('path', { d: 'M 0 0 L -12 -2 L -12 3 Z', fill: '#F2B66D' }, s); el('circle', { cx: -7, cy: 0, r: 1.5, fill: pal.red }, s); return s; });

  const SEAT = 219;
  const E = [2.75, 3.0], L = 0.8;
  const cycle = (u) => (u < 0 ? lerp(12, 75, easeOut(seg(u, -0.3, 0))) : u < 0.1 ? 75 : u < 0.42 ? lerp(75, -82, easeInOut(seg(u, 0.1, 0.42))) : u < 0.58 ? -82 : lerp(-82, 12, easeInOut(seg(u, 0.58, L))));
  return {
    update(t0) {
      const t = t0 * 1.0909;
      const wc = easeInOut(seg(t, 0.3, 2.0)), wm = easeInOut(seg(t, 0.2, 2.0));
      const walking = t > 0.2 && t < 2.0;
      const hop = seg(t, 2.05, 2.55), hy = lerp(FY, SEAT, easeInOut(hop)), air = 16 * Math.sin(Math.PI * hop);
      [[ca, lerp(58, 260, wc), 0, 0], [ma, lerp(112, 359, wm), 1, 1]].forEach(([b, x, i, ph]) => {
        const u = t - E[i];
        const eating = t > E[i] - 0.3;
        const a = eating ? cycle(u) : walking ? 8 + Math.sin(t * 9 + ph * 3) * 14 : 8;
        const chew = u > 0.42 && u < 0.85 ? Math.abs(Math.sin((u - 0.42) * 16)) : 0;
        b.pose({
          x, y: hy - air, walk: walking ? t * 9 + ph * 3 : 0, armR: a, armL: walking ? 8 - Math.sin(t * 9 + ph * 3) * 12 : 8,
          lean: walking ? 4 : 0, squash: 1 - 0.03 * chew - 0.06 * hump(seg(t, 2.4, 2.7)), look: 0.4,
          facing: t < 2.0 ? 1 : (i ? -1 : 1), mood: chew > 0.4 ? 'flat' : t > 3.9 ? 'grin' : 'smile', blink: t > 3.4 && t < 3.5 ? 1 : 0
        });
        const sl = slices[i], h = b.handPos('R');
        const v = u;
        const sh = v >= -0.0 && v < 0.5;
        const fromPlate = easeInOut(seg(v, 0.1, 0.42));
        const px = i ? 322 : 300;
        const pos = v < 0.1 ? { x: lerp(px, h.x, seg(v, -0.3, 0)), y: lerp(198, h.y, seg(v, -0.3, 0)) } : { x: h.x, y: h.y - 2 };
        tf(sl, i ? pos.x - 0 : pos.x, pos.y, i ? 180 : 0, i ? -1 : 1, 1);
        sl.setAttribute('opacity', v > -0.3 && v < 0.5 ? 1 : 0);
        if (v <= -0.3) { tf(sl, px, 198, 0, 1); sl.setAttribute('opacity', 0); }
        bite[i].setAttribute('opacity', v > 0.1 ? 1 : 0);
        bite[i].setAttribute('fill', '#fff');
      });
      pa.setAttribute('opacity', 1);
    }
  };
}
