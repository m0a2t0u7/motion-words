// keep at：シュート練習を続ける。1本目・2本目は外れても投げ続け、3本目でゴールに入る（例文 Keep at it, and you'll get better.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump } from '../ease.js';
import { hp } from './dig.js';

export const meta = { duration: 4.6, beats: [[0, '外れる'], [1.6, 'また投げる'], [3.6, '入った！']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#D9C8B4' });
  // ゴール
  el('rect', { x: 362, y: 70, width: 8, height: 170, fill: pal.sub });
  el('rect', { x: 352, y: 54, width: 10, height: 64, rx: 2, fill: '#fff', stroke: pal.sub, 'stroke-width': 3 });
  const RX = 322, RY = 100;
  const net = el('path', { d: '', stroke: '#fff', 'stroke-width': 2, fill: 'none' });
  el('rect', { x: RX - 22, y: RY - 2, width: 44 + 8, height: 5, rx: 2, fill: pal.red });
  k.shadow(366, FY, 16, 3);
  // かご（ボール置き場）
  el('path', { d: `M 150 ${FY} L 146 ${FY - 22} L 182 ${FY - 22} L 178 ${FY} Z`, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 2 });
  const S = 1;
  const b = k.buddy({ x: 120, y: FY, scale: S });
  const balls = [0, 1, 2].map(() => { const n = g({}); el('circle', { r: 10, fill: '#F28C38' }, n); el('path', { d: 'M -10 0 L 10 0 M 0 -10 L 0 10', stroke: '#B85E1A', 'stroke-width': 1.5 }, n); return n; });
  const bsh = balls.map(() => k.shadow(0, FY, 9, 2));
  const C = [0.2, 1.6, 3.0];
  // 各投の軌道：放つ点→目標、その後の落ち方
  const path = (i, u, h) => {
    const T = [[RX - 26, RY - 4], [RX + 28, RY - 30], [RX, RY - 6]][i];
    if (u < 0.7) { const q = u / 0.7; return { x: lerp(h.x, T[0], q), y: lerp(h.y, T[1], q) - 110 * q * (1 - q) * 1.4, r: u * 600 }; }
    const v = (u - 0.7) / 0.6;
    if (i === 0) return { x: T[0] - 50 * v, y: Math.min(FY - 10, T[1] - 40 * v + 200 * v * v), r: 420 - v * 400 };
    if (i === 1) return { x: Math.min(T[0] - 20 * v, 400), y: Math.min(FY - 10, T[1] + 200 * v * v), r: 420 + v * 200 };
    return { x: RX + 4, y: Math.min(FY - 10, T[1] + 160 * v * v + 20 * v), r: 420 };
  };
  return {
    update(t) {
      let pose = { armR: 20, armL: 10, lean: 0, squash: 1, lift: 0 };
      const hb = { x: 164 + (0), y: FY - 26 };
      let hold = -1;
      C.forEach((c, i) => {
        const u = t - c;
        if (u < 0) return;
        const pick = hump(seg(u, 0, 0.5)), raise = easeInOut(seg(u, 0.4, 0.75)), thr = easeOut(seg(u, 0.78, 0.95));
        if (u < 1.2) {
          pose = { armR: lerp(lerp(30, 60, pick), 160, raise) + 20 * thr, armL: lerp(10, 150, raise), lean: 20 * pick - 4 * raise, squash: 1 - 0.12 * hump(seg(u, 0.55, 0.8)), lift: 8 * hump(seg(u, 0.75, 1.0)) };
          if (u < 0.8) hold = i;
        }
      });
      const madeIt = t > C[2] + 1.0;
      b.pose({ ...pose, look: 0.5, mood: madeIt ? 'grin' : t > 1.2 && t < 1.6 || t > 2.6 && t < 3.0 ? 'flat' : 'smile', lift: pose.lift + (madeIt ? 12 * hump(seg(t, 4.0, 4.3)) : 0) });
      if (madeIt) b.pose({ armR: 170, armL: 160 });
      const h = hp(b, S, 'R');
      balls.forEach((n, i) => {
        const u = t - C[i];
        let p;
        if (u < 0.25) p = { x: 158 + i * 6, y: FY - 26, r: 0 };
        else if (u < 0.8) p = { x: h.x + 4, y: h.y - 8, r: 0 };
        else {
          const rel = { x: 0, y: 0 };
          b.state && 0;
          const fl = u - 0.8;
          p = path(i, fl / 0.9, { x: 150, y: 120 });
        }
        if (u >= 0.8) { // 放つ瞬間の手の位置から
          const h0 = { x: 152, y: 128 };
          p = path(i, (u - 0.8) / 0.9, h0);
        }
        tf(n, p.x, p.y, p.r);
        n.setAttribute('opacity', u > -0.0 || i === 0 ? 1 : 1);
        const hgt = FY - p.y;
        k.set(bsh[i], { cx: p.x, opacity: Math.max(0, 1 - hgt / 120), rx: 9 });
      });
      const sw = t > C[2] + 1.4 ? wob(t - C[2] - 1.4) : 0;
      k.set(net, { d: `M ${RX - 20} ${RY + 2} L ${RX - 12 + sw} ${RY + 26} L ${RX + 12 + sw} ${RY + 26} L ${RX + 20} ${RY + 2} M ${RX - 12} ${RY + 2} L ${RX - 4 + sw} ${RY + 26} M ${RX + 4} ${RY + 2} L ${RX + 4 + sw} ${RY + 26} M ${RX + 12} ${RY + 2} L ${RX + 12 + sw} ${RY + 26}` });
    }
  };
}
const wob = (u) => Math.sin(u * 20) * 4 * Math.exp(-u * 4);
