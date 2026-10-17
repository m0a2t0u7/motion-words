// have butterflies in one's stomach：スピーチ前の舞台そで。お腹の中で蝶が羽ばたくようにそわそわ（I have butterflies in my stomach before the speech.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '出番の前'], [1.5, 'そわそわ'], [3.2, '深呼吸']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  // 舞台：幕と演台
  el('rect', { x: 0, y: 0, width: 400, height: 60, fill: pal.red, opacity: 0.85 });
  for (let i = 0; i < 9; i++) el('path', { d: `M ${i * 50} 0 q 25 50 50 0`, fill: '#D9564B' });
  el('path', { d: 'M 0 60 L 150 60 L 150 240 L 0 240 Z', fill: '#B9473D', opacity: 0.9 });
  [20, 52, 84, 116].forEach((x) => el('path', { d: `M ${x} 60 Q ${x + 10} 150 ${x} 240`, stroke: '#9E3A32', 'stroke-width': 3, fill: 'none' }));
  el('rect', { x: 150, y: FY - 4, width: 250, height: 24, fill: pal.wood });
  const lamp = el('ellipse', { cx: 300, cy: FY - 2, rx: 70, ry: 12, fill: '#FFF3C4', opacity: 0.8 });
  // 演台とマイク
  k.shadow(310, FY, 36, 6);
  el('rect', { x: 284, y: 150, width: 52, height: FY - 150, rx: 5, fill: pal.woodDark });
  el('rect', { x: 278, y: 144, width: 64, height: 12, rx: 4, fill: pal.wood });
  el('line', { x1: 310, y1: 144, x2: 310, y2: 112, stroke: pal.ink, 'stroke-width': 3 });
  el('circle', { cx: 310, cy: 106, r: 8, fill: pal.ink });
  el('circle', { cx: 307, cy: 103, r: 2.5, fill: '#fff', opacity: 0.5 });
  const mint = k.buddy({ x: 120, y: FY });
  // お腹の中の蝶（吹き出しで拡大）
  const win = g({});
  el('circle', { r: 20, fill: '#fff', stroke: '#CBD3DF', 'stroke-width': 2, opacity: 0.95 }, win);
  const bf = g({}, win);
  const wL = el('path', { d: 'M 0 0 C -16 -16 -22 -2 -10 4 C -16 10 -6 16 0 4 Z', fill: pal.violet }, bf);
  const wR = el('path', { d: 'M 0 0 C 16 -16 22 -2 10 4 C 16 10 6 16 0 4 Z', fill: pal.violet }, bf);
  el('rect', { x: -1.6, y: -6, width: 3.2, height: 14, rx: 1.6, fill: pal.ink }, bf);
  const tl = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: pal.sub }, win);
  const sweat = el('path', { d: 'M 0 -7 Q 5 0 0 5 Q -5 0 0 -7 Z', fill: pal.water });
  const air = k.text(0, 0, '…', { 'font-size': 22, fill: pal.sub });
  return {
    update(t) {
      const fid = t > 0.8 && t < 3.2 ? 1 : 0;
      const fidget = Math.sin(t * 11) * fid;
      const calm = easeOut(seg(t, 3.1, 3.7));
      const breathe = hump(seg(t, 3.2, 4.0));
      mint.pose({
        x: 120 + 3 * Math.sin(t * 9) * fid,
        lean: 5 * fid * (1 - calm) + Math.sin(t * 7) * 2 * fid, squash: 1 - 0.03 * fid * Math.abs(Math.sin(t * 11)) + 0.05 * breathe,
        armL: lerp(8, 35, seg(t, 0.6, 1.0)) * (1 - calm) + 8 * calm,
        armR: lerp(8, 50, seg(t, 0.6, 1.0)) * (1 - calm) + 8 * calm - 8 * fidget,
        look: 0.6, mood: calm > 0.3 ? 'smile' : 'flat', blink: 0.1 * (1 + Math.sin(t * 6)) * fid
      });
      // 蝶の窓：お腹の位置から引き出し線
      const wx = 175, wy = FY - 98, bx = 124, by = FY - 40;
      const show = (1 - calm) * easeOut(seg(t, 0.5, 0.9));
      tf(win, wx, wy, 0, show);
      win.setAttribute('opacity', show);
      const fl = Math.abs(Math.sin(t * (fid ? 22 : 6)));
      tf(wL, 0, 0, 0, 0.35 + 0.65 * fl, 1);
      tf(wR, 0, 0, 0, 0.35 + 0.65 * fl, 1);
      tf(bf, 4 * Math.sin(t * 5), 3 * Math.sin(t * 7.3) * fid, 14 * Math.sin(t * 4) * fid);
      k.set(tl, { x1: -18, y1: 14, x2: (bx - wx) / Math.max(0.2, show) * 1, y2: (by - wy) / Math.max(0.2, show) });
      tl.setAttribute('stroke-dasharray', '3 3');
      tf(sweat, 120 + 30, FY - 108 + 20 * ((t * 1.4) % 1), 0, 1);
      sweat.setAttribute('opacity', t > 1.2 && t < 3.2 ? 1 : 0);
      tf(air, 150, FY - 100 - 14 * breathe, 0, breathe * 1.4);
      air.setAttribute('opacity', breathe);
      lamp.setAttribute('opacity', 0.55 + 0.25 * Math.sin(t * 2));
    }
  };
}
