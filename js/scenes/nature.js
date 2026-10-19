// nature：森と山の見える草原へ歩いて出て、両腕を広げて深呼吸し、自然を満喫する（例文 I love being out in nature.）
// このファイルは自然・天気シーン（v6/v7）用の共有ヘルパーも書き出す
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble, backOut } from '../ease.js';
import { hp, held, reach } from './dig.js';
import { gait, faceAt } from './weigh.js';
import { P, blinkAt } from './run-after.js';
import { cloud as thinkCloud } from './look-over.js';
export { hp, held, reach, gait, faceAt, P, blinkAt, thinkCloud };

// 空＋地面（色を自由に）。戻り値は床の y
export function scene(k, { FY = 236, top = '#CFE8FA', bot = '#F3FAFE', ground = '#BFE3C4', edge = '#A9D6B0' } = {}) {
  const sky = k.el('rect', { x: 0, y: 0, width: 400, height: 300, fill: k.gradient([[0, top], [1, bot]]) });
  const gr = k.el('rect', { x: 0, y: FY, width: 400, height: Math.max(0, 300 - FY), fill: ground });
  k.el('rect', { x: 0, y: FY, width: 400, height: 2, fill: edge });
  return { FY, sky, gr };
}
// 夜空（星を散らす）。戻り値 { FY, stars:[node] }
export function nightBg(k, { FY = 236, ground = '#3D4F63', n = 22, top = '#1B2742', bot = '#3B4D74' } = {}) {
  scene(k, { FY, top, bot, ground, edge: '#2E3D50' });
  const stars = [];
  for (let i = 0; i < n; i++) {
    const x = (i * 83.7 + 17) % 400, y = 12 + ((i * 47.3) % (FY - 70));
    stars.push(k.el('circle', { cx: x, cy: y, r: 0.9 + (i % 3) * 0.5, fill: '#fff', opacity: 0.7 }));
  }
  return { FY, stars };
}
// 遠くの丘（2層）
export function hills(k, FY, c1 = '#D3ECD5', c2 = '#C4E5C8') {
  k.el('path', { d: `M 0 ${FY - 40} Q 90 ${FY - 86} 190 ${FY - 44} T 400 ${FY - 52} V ${FY} H 0 Z`, fill: c1 });
  k.el('path', { d: `M 0 ${FY - 14} Q 120 ${FY - 44} 250 ${FY - 18} T 400 ${FY - 22} V ${FY} H 0 Z`, fill: c2 });
}
// 山（ふもと中心 x、底 y、高さ h、幅 w）。雪をかぶせる
export function mountain(k, x, y, w, h, col = '#9FB8CF', snow = true, parent) {
  const g = k.g({}, parent);
  k.el('path', { d: `M ${x - w / 2} ${y} L ${x - w * 0.06} ${y - h} Q ${x} ${y - h - 6} ${x + w * 0.06} ${y - h} L ${x + w / 2} ${y} Z`, fill: col }, g);
  k.el('path', { d: `M ${x} ${y - h - 3} L ${x + w / 2} ${y} L ${x + w * 0.1} ${y} Z`, fill: '#000', opacity: 0.08 }, g);
  if (snow) k.el('path', { d: `M ${x - w * 0.06} ${y - h} Q ${x} ${y - h - 6} ${x + w * 0.06} ${y - h} L ${x + w * 0.15} ${y - h * 0.72} L ${x + w * 0.05} ${y - h * 0.78} L ${x - w * 0.03} ${y - h * 0.7} L ${x - w * 0.15} ${y - h * 0.74} Z`, fill: '#fff' }, g);
  return g;
}
// 太陽（原点＝中心）。rays を回すと光る
export function sunG(k, r = 22, parent) {
  const g = k.g({}, parent), rays = k.g({}, g);
  for (let i = 0; i < 10; i++) k.el('rect', { x: -2.5, y: -r - 13, width: 5, height: 8, rx: 2.5, fill: '#FFC93C', transform: `rotate(${i * 36})` }, rays);
  k.el('circle', { r: r + 5, fill: '#FFE7A0', opacity: 0.6 }, g);
  k.el('circle', { r, fill: '#FFC93C' }, g);
  k.el('circle', { cx: -r * 0.3, cy: -r * 0.3, r: r * 0.35, fill: '#fff', opacity: 0.35 }, g);
  return { g, rays };
}
// 雲（原点＝中心）
export function cloudG(k, w = 90, h = 40, fill = '#fff', parent, line = true) {
  const g = k.g({}, parent);
  const parts = [[-w * 0.28, h * 0.08, w * 0.26, h * 0.42], [w * 0.26, h * 0.1, w * 0.27, h * 0.4], [0, -h * 0.12, w * 0.32, h * 0.52], [0, h * 0.2, w * 0.48, h * 0.3]];
  if (line) parts.forEach(([x, y, rx, ry]) => k.el('ellipse', { cx: x, cy: y, rx: rx + 2, ry: ry + 2, fill: '#000', opacity: 0.06 }, g));
  parts.forEach(([x, y, rx, ry]) => k.el('ellipse', { cx: x, cy: y, rx, ry, fill }, g));
  return g;
}
// 木（原点＝根元）。crown を揺らせる
export function treeG(k, s = 1, leaf = '#7FCB92', leaf2 = '#6BBF84', parent) {
  const g = k.g({}, parent);
  k.shadow(0, 0, 30 * s, 5 * s, g);
  const trunk = k.g({}, g);
  k.el('path', { d: `M ${-7 * s} 0 L ${-5 * s} ${-60 * s} L ${5 * s} ${-60 * s} L ${7 * s} 0 Z`, fill: '#B99572' }, trunk);
  const crown = k.g({}, trunk); k.tf(crown, 0, -66 * s);
  const c = [[0, -18, 34, leaf], [-22, 2, 24, leaf2], [22, 0, 25, leaf2], [0, 8, 26, leaf]].map(([x, y, r, f]) => k.el('circle', { cx: x * s, cy: y * s, r: r * s, fill: f }, crown));
  return { g, trunk, crown, c };
}
// 花（原点＝茎の根元）。set(開き 0..1)
export function flowerG(k, col = '#FF8FB1', parent, stem = 30) {
  const g = k.g({}, parent);
  k.el('path', { d: `M 0 0 Q 3 ${-stem / 2} 0 ${-stem}`, stroke: '#5DB36F', 'stroke-width': 3, fill: 'none' }, g);
  k.el('path', { d: `M 1 ${-stem * 0.4} q 9 -6 12 -1 q -6 5 -12 1 Z`, fill: '#6BC48F' }, g);
  const head = k.g({}, g); k.tf(head, 0, -stem);
  const pet = [0, 1, 2, 3, 4].map((i) => k.el('ellipse', { cx: 0, cy: -7, rx: 4.6, ry: 7, fill: col, transform: `rotate(${i * 72})` }, head));
  const ctr = k.el('circle', { r: 4, fill: '#FFCF5C' }, head);
  return { g, head, set(p) { pet.forEach((n, i) => n.setAttribute('transform', `rotate(${i * 72}) scale(${Math.max(0.05, p).toFixed(3)})`)); ctr.setAttribute('r', 2 + 2 * p); } };
}
// 小鳥（右向き、原点＝足元）。set(x, y, 羽ばたき 0..1, 向き)
export function birdG(k, col = '#6AA8F7', parent) {
  const g = k.g({}, parent), f = k.g({}, g);
  k.el('ellipse', { cx: 0, cy: -7, rx: 8, ry: 6.5, fill: col }, f);
  k.el('circle', { cx: 6, cy: -12, r: 4.6, fill: col }, f);
  k.el('path', { d: 'M 10 -13 L 15 -11.5 L 10 -10 Z', fill: '#FFB547' }, f);
  k.el('circle', { cx: 7.5, cy: -13, r: 1.2, fill: k.pal.ink }, f);
  k.el('path', { d: 'M -8 -8 L -14 -11 L -13 -5 Z', fill: col }, f);
  const wing = k.el('path', { d: 'M -4 -9 Q 2 -3 6 -8 Q 1 -12 -4 -9 Z', fill: '#fff', opacity: 0.6 }, f);
  k.el('path', { d: 'M -1 -1 V 1 M 2 -1 V 1', stroke: '#E9A13B', 'stroke-width': 1.4 }, f);
  return { g, set(x, y, flap = 0, face = 1) { k.tf(g, x, y); k.tf(f, 0, 0, 0, face, 1); wing.setAttribute('transform', `rotate(${(-50 * flap).toFixed(1)} -4 -9)`); } };
}
// 降る粒（雪・雨）。(t, on) で更新
export function fall(k, { n = 30, FY = 236, kind = 'snow', speed = 50, x0 = 0, x1 = 400, parent } = {}) {
  const ps = [];
  for (let i = 0; i < n; i++) ps.push(kind === 'snow'
    ? k.el('circle', { r: 1.6 + (i % 3), fill: '#fff' }, parent)
    : k.el('line', { x1: 0, y1: 0, x2: -3, y2: 11, stroke: '#7FB3E0', 'stroke-width': 2, 'stroke-linecap': 'round' }, parent));
  return (t, on = 1) => ps.forEach((d, i) => {
    const sp = speed * (1 + (i * 37 % 50) / 100), ph = (i * 0.137) % 1;
    const y = ((t * sp + ph * (FY + 20)) % (FY + 20)) - 10;
    const x = x0 + ((i * 97.3) % (x1 - x0)) + (kind === 'snow' ? Math.sin(t * 2 + i) * 6 : y * 0.25 - 20);
    d.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    d.setAttribute('opacity', on);
  });
}
// 水面（y から下、波線が流れる）。(t) で更新
export function water(k, y, { h = 300, col = '#8FD3F4', dark = '#6CBFE6', dx = 30, parent } = {}) {
  const g = k.g({}, parent);
  k.el('rect', { x: 0, y, width: 400, height: h - y, fill: col }, g);
  const ln = [0, 1, 2].map((i) => k.el('path', { d: '', stroke: i ? '#fff' : dark, 'stroke-width': 2, fill: 'none', opacity: 0.6, 'stroke-linecap': 'round' }, g));
  return (t) => ln.forEach((n, i) => {
    const yy = y + 10 + i * 18, o = ((t * dx + i * 40) % 60);
    let d = '';
    for (let x = -60 + o; x < 400; x += 60) d += `M ${x.toFixed(1)} ${yy} q 8 -4 16 0 `;
    n.setAttribute('d', d);
  });
}
// 頭上の小さな記号（! ? など）を出す
export function mark(k, str, col = '#2A3242') {
  const g = k.g({});
  k.text(0, 0, str, { 'font-size': 22, fill: col }, g);
  return { g, show(p, x, y) { k.tf(g, x, y - 6 * easeOut(clamp(p)), 0, p <= 0 ? 0.001 : backOut(clamp(p))); g.setAttribute('opacity', clamp(p * 3)); } };
}
// 草の束（手前に置いて足を隠す）
export function tufts(k, FY, x0 = 0, x1 = 400, col = '#8CCB8F', h = 12) {
  let d = '';
  for (let x = x0; x < x1; x += 9) d += `M ${x} ${FY + 4} L ${x + 3} ${FY - h + ((x * 7) % 5)} L ${x + 6} ${FY + 4} `;
  return k.el('path', { d, fill: col });
}
// 手にぶら下げる・立てて持つ（回転させず手先に置く。原点＝握り）
export function hang(k, b, s, node, side = 'R', rot = 0) {
  const h = hp(b, s, side, 28);
  k.tf(node, h.x, h.y, rot, s);
  return h;
}
// 遠い一点へ指さす角度（腕角度）
export const point = (b, s, side, x, y) => reach(b, s, side, x, y);
// 地球儀・地球（原点＝中心）。spin(角度) で大陸が回る
export function globe(k, r = 20, parent) {
  const g = k.g({}, parent);
  k.el('circle', { r, fill: '#5AA9E6' }, g);
  const land = k.g({}, g);
  land.setAttribute('clip-path', k.clip((c) => k.el('circle', { r }, c)));
  const inner = k.g({}, land);
  const blobs = [[-0.5, -0.3, 0.35, 0.45], [0.3, 0.2, 0.3, 0.35], [0.1, -0.55, 0.22, 0.18], [-0.2, 0.5, 0.25, 0.2]];
  const mk = (off) => blobs.forEach(([x, y, rx, ry]) => k.el('ellipse', { cx: (x + off) * r, cy: y * r, rx: rx * r, ry: ry * r, fill: '#6BC48F' }, inner));
  mk(0); mk(2); mk(-2);
  k.el('circle', { r, fill: 'none', stroke: '#fff', 'stroke-width': 1.5, opacity: 0.5 }, g);
  k.el('ellipse', { cx: -r * 0.35, cy: -r * 0.4, rx: r * 0.25, ry: r * 0.15, fill: '#fff', opacity: 0.35 }, g);
  return { g, spin(a) { k.tf(inner, ((a % 360) / 180) * r, 0); } };
}
export const popIn =(p) => (p <= 0 ? 0.001 : p >= 1 ? 1 : backOut(clamp(p)));

export const meta = { duration: 4.2, beats: [[0, '外へ出る'], [1.6, '深呼吸'], [2.8, '自然が大好き']] };

export function create(k) {
  const S = 1;
  const { FY } = scene(k, { FY: 238 });
  mountain(k, 300, FY - 30, 220, 120, '#B3C8DD');
  mountain(k, 380, FY - 30, 160, 80, '#A6BED6', false);
  hills(k, FY);
  const sun = sunG(k, 18); k.tf(sun.g, 62, 54);
  const cl = cloudG(k, 70, 26);
  [[60, 1.0], [340, 1.15], [20, 0.8]].forEach(([x, s]) => k.tf(treeG(k, s).g, x, FY + 2));
  const fl = [[150, '#FF8FB1'], [176, '#FFCF5C'], [268, '#A58BF3'], [292, '#FF8FB1']].map(([x, c]) => { const f = flowerG(k, c, undefined, 22); k.tf(f.g, x, FY + 6); f.set(1); return f; });
  const b = k.buddy({ x: -40, y: FY, scale: S });
  const bf = birdG(k);
  tufts(k, FY);
  const xf = (t) => lerp(-40, 210, easeInOut(seg(t, 0.1, 1.6)));
  const hearts = [0, 1, 2].map(() => k.el('path', { d: 'M 0 6 C -12 -2 -8 -12 0 -5 C 8 -12 12 -2 0 6 Z', fill: k.pal.red }));
  return {
    update(t) {
      const w = gait(xf, t, -40);
      const br = easeInOut(seg(t, 1.8, 2.6)) * (1 - easeInOut(seg(t, 3.4, 4.0)));
      const op = easeOut(seg(t, 1.7, 2.4));
      P(b, { x: w.x, walk: w.walk, lean: w.lean - 6 * br, armL: lerp(w.armL, 128, op), armR: lerp(w.armR, 128, op), squash: 1 + 0.05 * br, look: lerp(0.4, 0, op), mood: t > 2.6 ? 'grin' : 'smile', blink: lerp(blinkAt(t), 1, br) });
      k.tf(cl, 150 + t * 8, 60);
      sun.rays.setAttribute('transform', `rotate(${t * 12})`);
      bf.set(330 - 60 * easeInOut(seg(t, 0.3, 2.0)), 70 + 20 * Math.sin(t * 3), 0.5 + 0.5 * Math.sin(t * 22), -1);
      fl.forEach((f, i) => k.tf(f.head, 0, -22, 6 * Math.sin(t * 2 + i)));
      hearts.forEach((h, i) => { const q = seg(t, 2.7 + i * 0.25, 3.3 + i * 0.25); k.tf(h, 182 + i * 28, FY - 128 - 14 * easeOut(q) + (i % 2) * 10 + 2 * Math.sin(t * 3 + i), 0, popIn(q)); });
    }
  };
}
