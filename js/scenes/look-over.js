// look over：机でレポートを手に取り、上から下まで目を通して確認→封筒に入れて送る準備（例文 Please look over the report before sending it.）
// このファイルは「見る・話す・電話」系シーンの共有ヘルパーも出す
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { hp, held, reach, gait } from './dig.js';
import { faceAt } from './weigh.js';
import { grip } from './hand-over.js';

// 室内の背景（窓・棚）。kind: 'home' | 'office'
export function roomBg(k, kind = 'home', FY = 240, mood = 'indoor') {
  const { el, pal } = k;
  k.backdrop({ floorY: FY, mood });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  if (kind === 'office') {
    el('rect', { x: 30, y: 40, width: 120, height: 74, rx: 6, fill: mood === 'evening' ? '#45507A' : '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
    [70, 110].forEach((x) => el('line', { x1: x, y1: 40, x2: x, y2: 114, stroke: '#fff', 'stroke-width': 3 }));
    el('rect', { x: 300, y: 64, width: 70, height: 6, fill: pal.woodDark });
    [[306, pal.blue], [318, pal.coral], [330, pal.yellow], [342, pal.green]].forEach(([x, c]) => el('rect', { x, y: 40, width: 10, height: 24, rx: 2, fill: c }));
  } else {
    el('rect', { x: 40, y: 46, width: 84, height: 70, rx: 8, fill: mood === 'evening' ? '#4B5683' : '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
    el('line', { x1: 82, y1: 46, x2: 82, y2: 116, stroke: '#fff', 'stroke-width': 4 });
    if (mood === 'evening') el('circle', { cx: 104, cy: 66, r: 8, fill: '#FFF3C4' });
  }
  return FY;
}
// 吹き出し（中身は戻り値の .c に入れる）。show(p, x, y)：p=0で非表示、1で表示（ポンと出る）
export function say(k, w = 56, h = 36, tail = -1) {
  const g = k.g({}), c = k.g({}, g);
  k.el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 14, fill: '#fff', stroke: k.pal.line, 'stroke-width': 2 }, c);
  k.el('path', { d: `M ${tail * 8} ${h / 2 - 2} L ${tail * 16} ${h / 2 + 10} L ${tail * 1} ${h / 2 - 2} Z`, fill: '#fff', stroke: k.pal.line, 'stroke-width': 2, 'stroke-linejoin': 'round' }, c);
  k.el('rect', { x: Math.min(tail * 8, tail) - 1, y: h / 2 - 5, width: 9, height: 5, fill: '#fff' }, c);
  return { g: c, show(p, x, y, sc = 1) { const s = p <= 0 ? 0.001 : backOut(clamp(p)) * sc; k.tf(g, x, y, 0, s); g.setAttribute('opacity', clamp(p * 3)); } };
}
// 考え雲（中身は .c）。dx：小さな玉の伸びる向き
export function cloud(k, w = 90, h = 60, dx = -1) {
  const g = k.g({}), c = k.g({}, g);
  [[0, 0, w / 2, h / 2], [-w * 0.3, -h * 0.18, w * 0.26, h * 0.32], [w * 0.28, -h * 0.2, w * 0.26, h * 0.32], [0, -h * 0.32, w * 0.3, h * 0.28]].forEach(([x, y, rx, ry]) =>
    k.el('ellipse', { cx: x, cy: y, rx, ry, fill: '#fff', stroke: k.pal.line, 'stroke-width': 2 }, c));
  k.el('ellipse', { cx: 0, cy: -2, rx: w / 2 - 3, ry: h / 2 - 3, fill: '#fff' }, c);
  k.el('circle', { cx: dx * w * 0.36, cy: h * 0.62, r: 6, fill: '#fff', stroke: k.pal.line, 'stroke-width': 2 }, c);
  k.el('circle', { cx: dx * w * 0.5, cy: h * 0.9, r: 3.5, fill: '#fff', stroke: k.pal.line, 'stroke-width': 2 }, c);
  return { g: c, show(p, x, y) { k.tf(g, x, y, 0, p <= 0 ? 0.001 : backOut(clamp(p))); g.setAttribute('opacity', clamp(p * 3)); } };
}
// 音の波（「)」の弧3本）。set(on, phase, x, y, dir, size)
export function waves(k, color) {
  const arcs = [0, 1, 2].map(() => k.el('path', { d: 'M 0 -10 Q 7 0 0 10', fill: 'none', stroke: color || k.pal.blue, 'stroke-width': 3.2, 'stroke-linecap': 'round' }));
  return (on, ph, x, y, dir = 1, sz = 1) => arcs.forEach((a, i) => {
    const u = (ph + i / 3) % 1;
    k.tf(a, x + dir * (4 + u * 26 * sz), y, 0, dir * (0.6 + u * 0.8) * sz, (0.6 + u * 0.8) * sz);
    a.setAttribute('opacity', on * (1 - u) * 0.9);
  });
}
// スマートフォン（原点＝持つ位置）
export function phone(k, parent) {
  const g = k.g({}, parent);
  k.el('rect', { x: -6, y: -11, width: 12, height: 22, rx: 3, fill: k.pal.ink }, g);
  const scr = k.el('rect', { x: -4.5, y: -8.5, width: 9, height: 15, rx: 1.5, fill: '#9FB4CC' }, g);
  return { g, scr };
}
// 別の場所を映す小窓（電話の相手など）。parent に人物を作る
export function inset(k, x, y, w, h, mood = 'indoor') {
  const box = k.g({});
  k.el('rect', { x: x - 3, y: y - 3, width: w + 6, height: h + 6, rx: 14, fill: '#fff', stroke: k.pal.line, 'stroke-width': 2 }, box);
  const cp = k.clip((c) => k.el('rect', { x, y, width: w, height: h, rx: 11 }, c));
  const inner = k.g({ 'clip-path': cp }, box);
  k.el('rect', { x, y, width: w, height: h, fill: mood === 'evening' ? '#FCE6D6' : '#F6F3EE' }, inner);
  k.el('rect', { x, y: y + h - 14, width: w, height: 14, fill: k.pal.floor }, inner);
  k.el('rect', { x: x + w - 34, y: y + 12, width: 22, height: 22, rx: 3, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 3 }, inner);
  return { box, inner, floor: y + h - 12, show(p) { box.setAttribute('opacity', clamp(p)); k.tf(box, (x + w / 2) * (1 - lerp(0.85, 1, easeOut(p))), (y + h / 2) * (1 - lerp(0.85, 1, easeOut(p))), 0, lerp(0.85, 1, easeOut(p))); } };
}
// 体に付く帽子（ヘルメット等）。b.body に入れる
export function hat(k, b, color, dark) {
  const g = k.g({}, b.body);
  k.el('path', { d: 'M -27 -66 Q -26 -92 0 -92 Q 26 -92 27 -66 Z', fill: color }, g);
  k.el('rect', { x: -33, y: -68, width: 66, height: 6, rx: 3, fill: dark || color }, g);
  return g;
}
// 机（前面が人物の下半身を隠す）。x〜x+w、天板 y
export function desk(k, x, w, y = 196, parent) {
  const g = k.g({}, parent);
  k.el('rect', { x, y, width: w, height: 7, rx: 2, fill: k.pal.wood }, g);
  k.el('rect', { x: x + 4, y: y + 7, width: w - 8, height: 236 - y, fill: '#F2DDBB' }, g);
  k.el('rect', { x: x + 4, y: y + 7, width: w - 8, height: 3, fill: k.pal.woodDark, opacity: 0.4 }, g);
  return g;
}
// 人物を走らせずに移動させる際の歩き。xf と始点から pose 用の値を返す
export const walkPose = gait;
export { hp, held, reach, faceAt };

export const meta = { duration: 4.4, beats: [[0, 'レポートを持つ'], [1.2, '目を通す'], [3.5, '確認して封筒へ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  desk(k, 210, 180, 200);
  const env = g({}); tf(env, 318, 196);
  el('rect', { x: -26, y: -8, width: 52, height: 10, rx: 2, fill: '#F4E4C1' }, env);
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const rep = g({});
  el('rect', { x: -22, y: -30, width: 44, height: 58, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, rep);
  el('rect', { x: -22, y: -30, width: 44, height: 10, rx: 3, fill: pal.blue }, rep);
  const ys = [-10, 0, 10, 20];
  ys.forEach((y) => el('line', { x1: -16, x2: 8, y1: y, y2: y, stroke: pal.sub, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, rep));
  const chk = ys.map((y) => el('path', { d: `M 11 ${y} l 3 3 l 6 -7`, fill: 'none', stroke: pal.green, 'stroke-width': 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, rep));
  const scan = el('rect', { x: -18, y: 0, width: 30, height: 7, rx: 3, fill: pal.yellow, opacity: 0.4 }, rep);
  const envF = g({}); tf(envF, 318, 196);
  el('path', { d: 'M -26 -6 L 26 -6 L 26 4 L -26 4 Z', fill: '#F7EBD0', stroke: '#E2CC9C', 'stroke-width': 1.5 }, envF);
  el('path', { d: 'M -26 -6 L 0 2 L 26 -6', fill: 'none', stroke: '#E2CC9C', 'stroke-width': 1.5 }, envF);
  const gr = grip(k, pal.mint, pal.mintDark, S);
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.2, 0.9)), put = easeInOut(seg(t, 3.3, 4.0));
      const read = seg(t, 1.0, 3.2), line = Math.min(3, Math.floor(read * 4));
      const lp = (read * 4) % 1;
      b.pose({ armR: lerp(30, 70, up) + put * 25, armL: 10, lean: put * 10, mood: t > 3.4 ? 'grin' : 'flat', blink: hump(seg(t, 2.4, 2.55)) });
      faceAt(b, 4 + lp * 3 * (read > 0 && read < 1), lerp(-2, 6, read) * (1 - put));
      const h = hp(b, S, 'R');
      const rx = lerp(lerp(258, h.x + 16, up), 318, put), ry = lerp(lerp(190, h.y - 12, up), 186, put);
      tf(rep, rx, ry, 0, lerp(lerp(0.5, 1, up), 0.5, put), lerp(lerp(0.15, 1, up), 0.5, put));
      rep.setAttribute('opacity', 1 - seg(t, 3.85, 4.0));
      gr(h);
      k.set(scan, { y: ys[line] - 4, x: -18 + lp * 4, opacity: read > 0 && read < 1 ? 0.45 : 0 });
      chk.forEach((c, i) => c.setAttribute('opacity', read * 4 > i + 0.8 ? 1 : 0));
    }
  };
}
