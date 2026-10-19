// curtain：暗い部屋で「カーテンを開けて」と頼まれ、まめが両手でカーテンを開けると光が入る（例文 Please open the curtains.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { gait, reach } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { say } from './look-over.js';

// カーテン片側（原点＝レールの外側の端。w 幅、h 丈、dir：+1 右へ広がる）
export function curtainPanel(k, w, h, dir, col, dark, parent) {
  const g = k.g({}, parent);
  const p = k.g({}, g);
  k.el('rect', { x: dir > 0 ? 0 : -w, y: 0, width: w, height: h, fill: col }, p);
  for (let i = 1; i < 5; i++) k.el('rect', { x: dir > 0 ? (w * i) / 5 - 3 : -(w * i) / 5 - 3, y: 0, width: 6, height: h, fill: dark, opacity: 0.45 }, p);
  return { g, p };
}

export const meta = { duration: 4.4, beats: [[0, '開けてね'], [1.6, 'カーテンを引く'], [3.0, '光が入る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 窓（外は晴れ）
  const WX = 150, WY = 46, WW = 120, WH = 116;
  el('rect', { x: WX, y: WY, width: WW, height: WH, fill: '#BFE3FF' });
  el('circle', { cx: WX + 88, cy: WY + 30, r: 14, fill: pal.yellow });
  el('path', { d: `M ${WX} ${WY + WH} L ${WX} ${WY + 86} Q ${WX + 40} ${WY + 70} ${WX + 80} ${WY + 84} T ${WX + WW} ${WY + 80} L ${WX + WW} ${WY + WH} Z`, fill: '#9FD7A8' });
  el('rect', { x: WX, y: WY, width: WW, height: WH, fill: 'none', stroke: '#fff', 'stroke-width': 6 });
  el('line', { x1: WX + WW / 2, y1: WY, x2: WX + WW / 2, y2: WY + WH, stroke: '#fff', 'stroke-width': 4 });
  // 光の帯
  const beam = el('path', { d: `M ${WX} ${WY + WH} L ${WX + WW} ${WY + WH} L ${WX + WW + 70} 300 L ${WX - 40} 300 Z`, fill: '#FFF3C4', opacity: 0 });
  // 暗さ（カーテンが開くと消える）
  const dark = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#2A2F45', opacity: 0.5 });
  el('rect', { x: WX - 26, y: WY - 16, width: WW + 52, height: 6, rx: 3, fill: pal.woodDark });
  const L = curtainPanel(k, WW / 2 + 16, WH + 34, 1, '#7B8FD6', '#5F72BE');
  const R = curtainPanel(k, WW / 2 + 16, WH + 34, -1, '#7B8FD6', '#5F72BE');
  tf(L.g, WX - 16, WY - 12); tf(R.g, WX + WW + 16, WY - 12);
  const S = 0.95;
  const mom = k.buddy({ x: 52, y: FY, scale: 1.0, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: 380, y: FY, scale: S, facing: -1 });
  const bub = say(k, 50, 40, -1);
  const sun = g({}, bub.g);
  el('circle', { r: 7, fill: pal.yellow }, sun);
  for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; el('line', { x1: Math.cos(a) * 10, y1: Math.sin(a) * 10, x2: Math.cos(a) * 14, y2: Math.sin(a) * 14, stroke: pal.yellowDark, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, sun); }
  const xf = (t) => lerp(380, WX + WW / 2, easeInOut(seg(t, 0.6, 1.7)));
  return {
    update(t) {
      const op = easeInOut(seg(t, 2.0, 2.9));
      const sc = lerp(1, 0.28, op);
      tf(L.p, 0, 0, 0, sc, 1); tf(R.p, 0, 0, 0, sc, 1);
      dark.setAttribute('opacity', 0.5 * (1 - op));
      beam.setAttribute('opacity', 0.55 * op);
      const w = gait(xf, t, 380);
      const grab = easeOut(seg(t, 1.7, 2.0));
      P(me, { x: w.x, walk: w.walk, armL: w.armL, armR: w.armR, lean: w.lean, facing: t < 1.7 ? -1 : 1, look: t > 3.0 ? 0.6 : 0, lift: 4 * grab * (1 - seg(t, 2.9, 3.2)),
        mood: t > 2.8 ? 'grin' : 'smile', blink: t > 2.6 && t < 3.0 ? 0.6 : blinkAt(t) });
      if (grab > 0) {
        const rel = easeInOut(seg(t, 3.0, 3.4));
        const ex = (WW / 2 + 16) * sc, hy = WY + 70;
        const lx = WX - 16 + ex, rx = WX + WW + 16 - ex;
        me.pose({ armL: lerp(lerp(8, reach(me, S, 'L', lx, hy), grab), 8, rel), armR: lerp(lerp(8, reach(me, S, 'R', rx, hy), grab), 8, rel) });
      }
      P(mom, { x: 52, armR: 8 + 40 * hump(seg(t, 0.2, 1.6)), look: 0.6, mood: (t > 0.2 && t < 1.2 && Math.sin(t * 22) > -0.2) ? 'open' : t > 2.9 ? 'grin' : 'smile', blink: blinkAt(t, 1) });
      bub.show(seg(t, 0.2, 0.5) * (1 - seg(t, 1.8, 2.0)), 92, 112);
    }
  };
}
