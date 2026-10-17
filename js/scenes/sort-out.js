// sort out：散らかった机の物を、種類ごとにラベル付きのトレーへ仕分けて片づける（例文 I need to sort out my desk.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '散らかっている'], [1.0, '分ける'], [3.2, '片づいた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  const S = 0.95, BX = 56, BY = 222;
  // 棚のトレー（種類ごとのラベル付き）
  const TX = [142, 206, 270, 334], TW = 54, TT = 100;
  el('rect', { x: 108, y: TT + 40, width: 268, height: 6, rx: 3, fill: pal.woodDark });
  const trayIcons = [
    (p) => { el('rect', { x: -2, y: -8, width: 4, height: 15, rx: 2, fill: pal.red, transform: 'rotate(35)' }, p); },
    (p) => { el('rect', { x: -6, y: -8, width: 12, height: 16, rx: 2, fill: '#FFFFFF', stroke: pal.sub, 'stroke-width': 1.6 }, p); el('rect', { x: -3, y: -3, width: 6, height: 2, fill: pal.line }, p); el('rect', { x: -3, y: 1, width: 6, height: 2, fill: pal.line }, p); },
    (p) => { el('rect', { x: -7, y: -7, width: 14, height: 14, rx: 2, fill: pal.blue }, p); el('rect', { x: -5, y: -7, width: 3, height: 14, fill: '#FFFFFF', opacity: 0.5 }, p); },
    (p) => { el('path', { d: 'M -3 5 L -3 -5 Q -3 -8 0 -8 Q 3 -8 3 -5 L 3 6 Q 3 9 -1 9 Q -5 9 -5 5 L -5 -3', stroke: pal.sub, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, p); }
  ];
  TX.forEach((x, i) => {
    el('rect', { x: x - TW / 2, y: TT + 2, width: TW, height: 38, rx: 6, fill: '#E3EAF3' });
    el('rect', { x: x - TW / 2, y: TT + 28, width: TW, height: 12, rx: 4, fill: '#B9C6D8' });
  });
  const items = [];
  const trayFront = () => TX.forEach((x, i) => {
    el('rect', { x: x - TW / 2, y: TT + 22, width: TW, height: 18, rx: 6, fill: '#E3EAF3', stroke: '#B9C6D8', 'stroke-width': 2 });
    el('rect', { x: x - 15, y: TT + 24, width: 30, height: 15, rx: 4, fill: '#FFFFFF' });
    const ic = g({ transform: `translate(${x} ${TT + 31.5}) scale(0.78)` });
    trayIcons[i](ic);
  });
  // まめと机
  const b = k.buddy({ x: BX, y: BY, scale: S });
  b.g.firstChild.setAttribute('display', 'none');
  const DY = 196;
  k.shadow(200, 262, 190, 7);
  el('rect', { x: 14, y: DY, width: 372, height: 16, rx: 7, fill: '#F0D9B8' });
  el('rect', { x: 14, y: DY + 16, width: 372, height: 42, fill: pal.wood });
  el('rect', { x: 14, y: DY + 16, width: 372, height: 4, fill: pal.woodDark, opacity: 0.4 });
  el('rect', { x: 28, y: DY + 58, width: 12, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 360, y: DY + 58, width: 12, height: 8, rx: 3, fill: pal.woodDark });
  // 机の上の物
  const mk = (type, sx, sy, srot, tx, ty, trot, delay) => {
    const n = g({});
    if (type === 0) { el('rect', { x: -13, y: -2.2, width: 26, height: 4.4, rx: 2.2, fill: [pal.red, pal.blue, pal.green][delay % 3] }, n); el('path', { d: 'M 13 -2.2 L 18 0 L 13 2.2 Z', fill: pal.ink }, n); }
    if (type === 1) { el('rect', { x: -15, y: -10, width: 30, height: 20, rx: 2, fill: '#FFFFFF', stroke: pal.sub, 'stroke-width': 1.6 }, n); [-4, 1, 6].forEach((y) => el('rect', { x: -10, y, width: 18, height: 2.2, rx: 1, fill: pal.line }, n)); }
    if (type === 2) { el('rect', { x: -17, y: -7, width: 34, height: 14, rx: 2.5, fill: [pal.blue, pal.coral][delay % 2] }, n); el('rect', { x: -15, y: -5, width: 28, height: 10, rx: 1.5, fill: '#FFFFFF', opacity: 0.85 }, n); el('rect', { x: -17, y: -7, width: 5, height: 14, rx: 2, fill: '#000000', opacity: 0.12 }, n); }
    if (type === 3) { el('path', { d: 'M -5 6 L -5 -4 Q -5 -8 -1 -8 Q 3 -8 3 -4 L 3 7 Q 3 11 -2 11 Q -7 11 -7 6 L -7 -2', stroke: '#8F9BB0', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }, n); }
    items.push({ n, type, sx, sy, srot, tx, ty, trot, delay });
    return n;
  };
  const DT = DY + 2;
  // 散らかった位置
  mk(0, 128, DT + 6, 18, TX[0] - 12, TT + 24, -80, 0); mk(0, 164, DT + 2, -28, TX[0], TT + 22, -86, 1); mk(0, 238, DT + 8, 66, TX[0] + 12, TT + 24, -82, 2);
  mk(1, 112, DT + 2, -12, TX[1], TT + 26, 0, 0); mk(1, 186, DT + 6, 24, TX[1], TT + 22, 0, 1); mk(1, 252, DT + 0, -34, TX[1], TT + 18, 0, 2);
  mk(2, 148, DT + 8, 30, TX[2], TT + 26, 0, 0); mk(2, 220, DT + 3, -16, TX[2], TT + 18, 0, 1);
  mk(3, 130, DT - 2, 40, TX[3] - 12, TT + 18, -15, 0); mk(3, 202, DT + 8, -60, TX[3], TT + 20, 10, 1); mk(3, 268, DT + 2, 15, TX[3] + 12, TT + 18, 0, 2);
  trayFront();
  // きらきら
  const sparks = [0, 1, 2, 3].map(() => {
    const s2 = g({});
    el('path', { d: 'M 0 -9 Q 1.5 -1.5 9 0 Q 1.5 1.5 0 9 Q -1.5 1.5 -9 0 Q -1.5 -1.5 0 -9 Z', fill: pal.yellow }, s2);
    return s2;
  });
  const START = [1.0, 1.65, 2.3, 2.85];

  return {
    update(t) {
      // まめの両手がリズムよく動く
      const working = t > 0.9 && t < 3.35;
      const sw = Math.sin(t * 13);
      const done = easeInOut(seg(t, 3.35, 3.8));
      b.pose({
        x: BX, y: BY, armR: working ? 118 + sw * 24 : lerp(8, 8, 0), armL: working ? 118 - sw * 24 : 8,
        look: 0.8, lean: working ? 2 : 0, mood: t < 0.9 ? 'sad' : t < 3.35 ? 'flat' : 'grin',
        squash: 1 - 0.03 * hump(seg(t, 3.35, 3.8))
      });
      // 物が種類ごとにトレーへ飛ぶ
      items.forEach((o) => {
        const t0 = START[o.type] + o.delay * 0.14, t1 = t0 + 0.5;
        const p = seg(t, t0, t1), e = easeInOut(p);
        const x = lerp(o.sx, o.tx, e), y = lerp(o.sy, o.ty, e) - hump(p) * 70;
        const rot = lerp(o.srot, o.trot, e) + (p > 0 && p < 1 ? Math.sin(p * 9) * 8 : 0);
        const lay = o.type === 1 ? lerp(1, 0.22, easeInOut(seg(p, 0.6, 1))) : 1; // 紙は重なって平らに
        const sc = 1 + 0.15 * hump(p);
        tf(o.n, x, y, rot, sc, sc * lay);
        // トレーに入ったらトレーの前面の内側に見えるよう、位置のみ調整
      });
      // 片づいたあとのきらきら
      sparks.forEach((s2, i) => {
        const q = seg(t, 3.5 + i * 0.12, 4.3);
        const xs = [100, 180, 250, 330][i];
        tf(s2, xs, 182 - (i % 2) * 6 - q * 6, 0, q > 0 ? 0.5 + 0.5 * hump(q) : 0.001, q > 0 ? 0.5 + 0.5 * hump(q) : 0.001);
        s2.setAttribute('opacity', q > 0 && q < 1 ? 1 : (q >= 1 ? 0.0 : 0));
      });
    }
  };
}
