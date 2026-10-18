// queue up：レジの前に客が一人ずつ来て、順番待ちの列ができる（例文 Customers queued up at the cash register.）
// このファイルは他の句動詞シーン用の共有ヘルパーも export する
import { seg, lerp, easeInOut, easeOut, wobble } from '../ease.js';
import { gait } from './weigh.js';

export const COL = { mint: ['#5FCDB8', '#3BAE98'], blue: ['#6AA8F7', '#4A8BE0'], yellow: ['#FFCF5C', '#E9B43A'], violet: ['#A58BF3', '#7F63D6'], coral: ['#FF8E77', '#E86F57'] };
export function person(k, c, o = {}) { return k.buddy({ color: COL[c][0], dark: COL[c][1], ...o }); }
// 時刻表 [[t, x], ...] を easeInOut でつなぐ位置関数
export const path = (pts) => (t) => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const [t0, x0] = pts[i - 1], [t1, x1] = pts[i]; return lerp(x0, x1, easeInOut(seg(t, t0, t1))); }
  return pts[pts.length - 1][1];
};
// 位置関数に合わせて歩かせる
export function walk(b, xf, t, extra = {}) {
  const p = gait(xf, t, xf(0));
  b.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: p.armR, lean: p.lean, ...extra });
  return p;
}
// 蝶番で開くドア板（横から見て幅が縮む）。hinge: 'L' | 'R'
export function door(k, { x, y, w, h, hinge = 'L', color, parent }) {
  const { el, g, tf, pal } = k;
  const hx = hinge === 'L' ? x : x + w;
  const p = g({}, parent);
  const d = hinge === 'L' ? 1 : -1;
  const ox = hinge === 'L' ? 0 : -w;
  el('rect', { x: ox, y: 0, width: w, height: h, rx: 3, fill: color || pal.blue }, p);
  el('rect', { x: ox + 9, y: 10, width: w - 18, height: h * 0.36, rx: 4, fill: '#fff', opacity: 0.25 }, p);
  el('rect', { x: ox + 9, y: h * 0.52, width: w - 18, height: h * 0.38, rx: 4, fill: '#000', opacity: 0.06 }, p);
  el('circle', { cx: d > 0 ? w - 10 : -w + 10, cy: h * 0.55, r: 4.5, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, p);
  const set = (q) => tf(p, hx, y, 0, lerp(1, 0.13, q), 1);
  set(0);
  return { g: p, set, knob: (q) => ({ x: hx + d * (w - 10) * lerp(1, 0.13, q), y: y + h * 0.55 }) };
}
// 立て看板
export function sign(k, x, base, label, { w = 78, h = 34, color, fs = 13, post = 46, parent } = {}) {
  const { el, g, pal } = k;
  const s = g({}, parent);
  k.shadow(x, base + 1, 14, 3, s);
  el('rect', { x: x - 3, y: base - post, width: 6, height: post, fill: pal.woodDark }, s);
  el('rect', { x: x - w / 2, y: base - post - h, width: w, height: h, rx: 5, fill: color || '#fff', stroke: pal.ink, 'stroke-width': 2.5 }, s);
  if (label) k.text(x, base - post - h / 2 + 1, label, { 'font-size': fs, fill: pal.ink }, s);
  return s;
}
// 事務所の背景
export function officeBg(k, FY = 236) {
  const { el, pal } = k;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 26, y: 40, width: 96, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 4 });
  el('line', { x1: 74, y1: 40, x2: 74, y2: 104, stroke: '#fff', 'stroke-width': 3 });
  el('rect', { x: 300, y: 50, width: 70, height: 60, rx: 4, fill: '#F1E7D8' });
  [[306, 56, pal.blue], [318, 58, pal.coral], [330, 54, pal.yellow], [344, 57, pal.green]].forEach(([x, y, c]) => el('rect', { x, y, width: 10, height: 110 - y - 30, rx: 2, fill: c }));
  el('rect', { x: 300, y: 80, width: 70, height: 4, fill: pal.woodDark });
  return FY;
}
// ばねのようなポン（出現用）
export const pop = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : easeOut(p) + wobble(p, 2, 6) * 0.15);

export const meta = { duration: 4.2, beats: [[0, 'レジの前'], [1.6, '次々に並ぶ'], [3.6, '列ができた']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 棚
  [60, 104].forEach((y) => el('rect', { x: 200, y, width: 190, height: 5, fill: pal.woodDark }));
  [[208, 40, pal.coral], [232, 44, pal.yellow], [262, 38, pal.blue], [300, 42, pal.green], [340, 40, pal.violet], [214, 86, pal.green], [246, 84, pal.coral], [286, 88, pal.yellow], [322, 84, pal.blue], [356, 86, pal.coral]].forEach(([x, y, c]) => el('rect', { x, y, width: 18, height: (y < 60 ? 60 : 104) - y, rx: 3, fill: c, opacity: 0.85 }));
  const cash = person(k, 'coral', { x: 62, y: FY - 34, scale: 0.82 });
  // カウンターとレジ（動かない）
  el('rect', { x: 10, y: 172, width: 112, height: 64, rx: 4, fill: pal.wood });
  el('rect', { x: 10, y: 172, width: 112, height: 6, rx: 3, fill: pal.woodDark });
  el('rect', { x: 78, y: 146, width: 38, height: 26, rx: 4, fill: '#56607A' });
  el('rect', { x: 84, y: 138, width: 26, height: 10, rx: 2, fill: '#BFE3F5' });
  el('rect', { x: 84, y: 160, width: 26, height: 7, rx: 2, fill: '#8C96AE' });
  k.shadow(66, 237, 60, 5);
  const order = ['mint', 'blue', 'yellow', 'violet'];
  const slots = [168, 222, 276, 330];
  const cs = order.map((c, i) => ({ b: person(k, c, { x: 460, y: FY, scale: 0.82, facing: -1 }), xf: path([[0.15 + i * 0.6, 460], [1.55 + i * 0.6, slots[i]]]) }));
  return {
    update(t) {
      cash.pose({ armR: 30 + 6 * Math.sin(t * 3), look: 0.5, mood: 'smile', squash: 1 + 0.01 * Math.sin(t * 4) });
      cs.forEach(({ b, xf }, i) => {
        const done = t > 1.6 + i * 0.6;
        walk(b, xf, t, { look: done ? 0.4 : 0.2, mood: done && t > 3.6 ? 'smile' : 'flat', blink: Math.abs(t - 2.8 - i * 0.3) < 0.06 ? 1 : 0 });
      });
    }
  };
}
