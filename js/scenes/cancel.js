// cancel：試合の予定が貼られた掲示板。雨が降り出し、2人が傘をさして掲示に赤い×を貼る（例文 They canceled the game because of rain.）
import { seg, lerp, easeInOut, easeOut, backOut, smooth } from '../ease.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 4.0, beats: [[0, '試合の予定'], [1.7, '雨が降る'], [3.4, '中止の×']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: '#E3E8EE' });
  [[30, 1], [372, 0.8]].forEach(([x, s]) => { const t = g({}); tf(t, x, FY - 4, 0, s); k.shadow(0, 0, 24, 5, t); el('rect', { x: -5, y: -44, width: 10, height: 44, rx: 4, fill: pal.woodDark }, t); el('circle', { cx: 0, cy: -62, r: 28, fill: '#7FD3A0' }, t); el('circle', { cx: -14, cy: -48, r: 18, fill: '#6BC48F' }, t); el('circle', { cx: 16, cy: -48, r: 19, fill: '#6BC48F' }, t); });
  // 掲示板
  k.shadow(262, FY - 2, 40, 6);
  el('rect', { x: 255, y: 150, width: 8, height: FY - 150, fill: pal.woodDark });
  el('rect', { x: 226, y: 98, width: 70, height: 66, rx: 6, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 3 });
  el('rect', { x: 234, y: 106, width: 54, height: 50, rx: 3, fill: '#fff' });
  const ball = g({}); tf(ball, 261, 126);
  el('circle', { r: 13, fill: '#fff', stroke: pal.ink, 'stroke-width': 2.5 }, ball);
  el('path', { d: 'M 0 -6 L 6 -2 L 4 5 L -4 5 L -6 -2 Z', fill: pal.ink }, ball);
  k.text(261, 148, '14:00', { 'font-size': 10 });
  const dark = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#5B6B82', opacity: 0 });
  const cloud = g({});
  [[0, 0, 26], [-28, 8, 20], [28, 8, 22], [52, 14, 15], [-50, 14, 14]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#A9B6C6' }, cloud));
  const mint = k.buddy({ x: 190, y: FY }), cor = k.buddy({ x: 340, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  const umb = (c) => { const u = g({}); el('line', { x1: 0, y1: 0, x2: 0, y2: -34, stroke: pal.ink, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, u); const cn = g({}, u); tf(cn, 0, -34); el('path', { d: 'M -42 0 Q -40 -30 0 -32 Q 40 -30 42 0 Q 31 -8 21 0 Q 10 -8 0 0 Q -10 -8 -21 0 Q -31 -8 -42 0 Z', fill: c }, cn); return u; };
  const u1 = umb(pal.blue), u2 = umb(pal.yellow);
  const X = g({}); [-1, 1].forEach((d) => el('line', { x1: -22, y1: -22 * d, x2: 22, y2: 22 * d, stroke: pal.red, 'stroke-width': 8, 'stroke-linecap': 'round' }, X));
  const drops = Array.from({ length: 34 }, () => el('line', { stroke: '#7FA6D6', 'stroke-width': 1.8, 'stroke-linecap': 'round' }));
  return {
    update(t) {
      const rain = smooth(seg(t, 1.5, 2.1)), cl = easeOut(seg(t, 1.0, 1.9));
      k.set(dark, { opacity: 0.22 * rain });
      tf(cloud, lerp(120, 205, cl), lerp(-30, 40, cl), 0, 1.5); cloud.setAttribute('opacity', cl);
      const open = backOut(seg(t, 1.9, 2.5), 1.2), grab = easeInOut(seg(t, 2.5, 3.1)), stuck = seg(t, 3.1, 3.35);
      const sad = t > 3.2;
      mint.pose({ armL: lerp(8, 165, easeOut(seg(t, 1.7, 2.3))), lean: 3 * grab, squash: 1 + 0.01 * Math.sin(t * 4), mood: sad ? 'sad' : 'smile', look: 0.6 });
      mint.pose({ armR: lerp(8, reach(mint, 1, 'R', 240, 150), grab) });
      cor.pose({ armR: lerp(8, 165, easeOut(seg(t, 1.8, 2.4))), squash: 1 + 0.01 * Math.sin(t * 4 + 1), mood: sad ? 'sad' : 'smile', look: 0.6 });
      const hl = hp(mint, 1, 'L'), hr = hp(cor, 1, 'R'), hx = hp(mint, 1, 'R');
      tf(u1, hl.x + 22, hl.y, 0, open, open); u1.setAttribute('opacity', open > 0.01 ? 1 : 0);
      tf(u2, hr.x + 22, hr.y, 0, backOut(seg(t, 1.9, 2.5), 1.2), backOut(seg(t, 1.9, 2.5), 1.2));
      // ×印：手の中の小さな印 → 掲示板に貼る
      const sc = seg(t, 2.1, 2.5) * lerp(0.38, 1, stuck);
      tf(X, lerp(hx.x, 261, stuck), lerp(hx.y, 131, stuck), 0, sc * 0.75 * (1 + 0.2 * Math.sin(stuck * Math.PI)), sc * 0.75 * (1 + 0.2 * Math.sin(stuck * Math.PI)));
      drops.forEach((d, i) => {
        const x = (i * 47 + 13) % 400, y = ((t * 240 + i * 61) % 250) + 20;
        const hid = (Math.abs(x - (hl.x + 22)) < 42 && y > hl.y - 30 && y < 236) || (Math.abs(x - u2cx(hr)) < 42 && y > hr.y - 30 && y < 236);
        k.set(d, { x1: x, y1: y, x2: x - 3, y2: y + 11, opacity: hid || y > 234 ? 0 : rain });
      });
    }
  };
}
function u2cx(hr) { return hr.x + 22; }
