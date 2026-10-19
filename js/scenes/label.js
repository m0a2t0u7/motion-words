// label：薬の瓶を手に取り、飲む前にラベルの説明を読む（拡大して読んでいる様子）（例文 Read the label before you take it.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, face, homeBg, backTable } from './bag.js';

export function medBottle(k, parent) {
  const g = k.g({}, parent), { el, pal } = k;
  el('rect', { x: -9, y: -34, width: 18, height: 8, rx: 2, fill: '#fff', stroke: pal.line }, g);
  el('rect', { x: -12, y: -27, width: 24, height: 27, rx: 5, fill: '#F2A65A', opacity: 0.9 }, g);
  el('rect', { x: -10, y: -21, width: 20, height: 14, rx: 2, fill: '#fff' }, g);
  [-17, -13, -10].forEach((y, i) => el('line', { x1: -7, y1: y, x2: i ? 4 : 7, y2: y, stroke: pal.sub, 'stroke-width': 1.2 }, g));
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '薬を手に取る'], [1.2, 'ラベルを読む'], [3.4, '確かめた']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.15, FY = 236, X = 160;
  homeBg(k, { FY, winX: 290, winW: 80 });
  const TY = backTable(k, 190, 300, 192, FY);
  el('rect', { x: 262, y: TY - 26, width: 16, height: 26, rx: 3, fill: '#DFF1FB', stroke: '#9FC9E3' });
  el('rect', { x: 264, y: TY - 16, width: 12, height: 15, fill: pal.water, opacity: 0.6 });
  const bt = medBottle(k);
  const b = k.buddy({ x: X, y: FY, scale: S });
  // 拡大したラベル
  const zoom = k.g({});
  el('rect', { x: -58, y: -40, width: 116, height: 80, rx: 8, fill: '#fff', stroke: '#F2A65A', 'stroke-width': 3 }, zoom);
  el('rect', { x: -48, y: -30, width: 22, height: 22, rx: 4, fill: '#F2A65A' }, zoom);
  k.text(-37, -18, '+', { 'font-size': 18, fill: '#fff' }, zoom);
  const lines = [0, 1, 2, 3].map((i) => el('rect', { x: -18, y: -28 + i * 13, width: i === 0 ? 62 : 54 - i * 6, height: 5, rx: 2.5, fill: i === 0 ? pal.ink : pal.sub }, zoom));
  const hl = el('rect', { x: -20, y: -32, width: 4, height: 13, rx: 2, fill: pal.yellow, opacity: 0.8 }, zoom);
  return {
    update(t) {
      const pick = easeInOut(seg(t, 0.2, 0.7)), lift = easeInOut(seg(t, 0.8, 1.3));
      P(b, { x: X, look: 0.8, blink: 0, lean: 6 * pick * (1 - lift), mood: t > 3.5 ? 'grin' : 'flat' });
      face(b, 5, 0);
      const P0 = { x: 222, y: TY - 30 }, P1 = { x: X + 52, y: FY - 92 };
      const tgt = { x: lerp(lerp(X + 40, P0.x, pick), P1.x, lift), y: lerp(lerp(FY - 50, P0.y, pick), P1.y, lift) };
      b.pose({ armR: reach(b, S, 'R', tgt.x, tgt.y) });
      const h = hp(b, S, 'R');
      if (t < 0.7) tf(bt, 222, TY); else tf(bt, h.x, h.y + 16, 0, 1 + 0.2 * lift);
      // 行を目で追う：拡大図のハイライトが1行ずつ下がる
      const z = seg(t, 1.3, 1.7);
      tf(zoom, 300, 104, 0, z <= 0 ? 0.001 : backOut(z));
      zoom.setAttribute('opacity', clamp(z * 3));
      const r = clamp((t - 1.7) / 0.45, 0, 3.99), row = Math.floor(r);
      k.set(hl, { y: -30 + row * 13, x: -20 + 60 * (r - row) - 0, width: 4 + 0 });
      lines.forEach((l, i) => l.setAttribute('opacity', i <= row ? 1 : 0.4));
      if (t > 3.5) b.pose({ squash: 1 - 0.05 * hump(seg(t, 3.5, 3.9)) });
    }
  };
}
