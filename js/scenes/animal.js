// animal：友だちに「好きな動物は？」と聞かれ、まめが図鑑を開いてゾウを指さし「これ！」と答える（例文 What's your favorite animal?）
// このファイルは動物シーンの共有ヘルパーも書き出す（beast：四つ足の動物いろいろ / heartG）
import { seg, lerp, easeInOut, easeOut, hump, clamp, backOut } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { hang } from './nature.js';
import { reach } from './dig.js';

const K = {
  cow: { col: '#FFFFFF', dark: '#3A3F4B', leg: '#E9E4DC', bx: 40, by: 21, L: 26, lw: 8, hx: 40, hy: -14 },
  pig: { col: '#F7B5C0', dark: '#E58A9C', leg: '#EFA0AF', bx: 32, by: 20, L: 13, lw: 8, hx: 30, hy: -4 },
  sheep: { col: '#FFFFFF', dark: '#4A4F5C', leg: '#4A4F5C', bx: 32, by: 21, L: 18, lw: 6, hx: 32, hy: -6 },
  goat: { col: '#EDEBE6', dark: '#9C958A', leg: '#C9C2B6', bx: 30, by: 16, L: 24, lw: 6, hx: 30, hy: -16 },
  horse: { col: '#B9824F', dark: '#5B3B24', leg: '#9E6C3F', bx: 42, by: 19, L: 38, lw: 8, hx: 40, hy: -24 },
  deer: { col: '#C9925A', dark: '#8A5B30', leg: '#B07D4A', bx: 32, by: 15, L: 32, lw: 5, hx: 30, hy: -22 },
  fox: { col: '#F08A3E', dark: '#B85A1E', leg: '#4A3A34', bx: 26, by: 11, L: 16, lw: 5, hx: 26, hy: -6 },
  wolf: { col: '#9AA3B2', dark: '#6B7484', leg: '#7E8796', bx: 32, by: 14, L: 22, lw: 6, hx: 32, hy: -10 },
  lion: { col: '#E6B45E', dark: '#B27A2A', leg: '#D9A24C', bx: 36, by: 17, L: 22, lw: 8, hx: 34, hy: -14 },
  tiger: { col: '#F49A3C', dark: '#2E2A2A', leg: '#E88A2C', bx: 38, by: 16, L: 22, lw: 8, hx: 36, hy: -10 },
  bear: { col: '#8A5A3C', dark: '#5E3B25', leg: '#77492E', bx: 40, by: 24, L: 18, lw: 11, hx: 38, hy: -12 },
  elephant: { col: '#A7B1C2', dark: '#7D889B', leg: '#98A3B5', bx: 46, by: 30, L: 28, lw: 15, hx: 44, hy: -20 },
  mouse: { col: '#B8BEC9', dark: '#8D94A2', leg: '#F3B6C0', bx: 13, by: 8, L: 4, lw: 2.5, hx: 12, hy: -2 },
  rat: { col: '#8E8478', dark: '#655C52', leg: '#E9A9B4', bx: 19, by: 10, L: 6, lw: 3, hx: 18, hy: -3 }
};
const EYE = (k, x, y, r, p) => k.el('circle', { cx: x, cy: y, r, fill: k.pal.ink }, p);

function head(k, kind, c, h) {
  const { el } = k, ink = k.pal.ink;
  const parts = {};
  switch (kind) {
    case 'cow':
      el('path', { d: 'M -2 -12 Q -10 -22 -4 -24 M 4 -12 Q 2 -24 8 -24', stroke: '#E9DCC0', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, h);
      el('ellipse', { cx: -9, cy: -8, rx: 8, ry: 4, fill: c.dark, transform: 'rotate(-20 -9 -8)' }, h);
      el('rect', { x: -6, y: -14, width: 22, height: 30, rx: 10, fill: c.col, stroke: '#E4E0D8', 'stroke-width': 1.5 }, h);
      el('path', { d: 'M -6 -6 Q 2 -12 4 -2 Q -2 2 -6 -2 Z', fill: c.dark }, h);
      el('ellipse', { cx: 7, cy: 12, rx: 11, ry: 7, fill: '#F6B8C2' }, h);
      EYE(k, 10, -3, 2.4, h); el('circle', { cx: 4, cy: 12, r: 1.4, fill: '#C9707F' }, h); el('circle', { cx: 11, cy: 12, r: 1.4, fill: '#C9707F' }, h);
      break;
    case 'pig':
      el('path', { d: 'M -6 -12 L -2 -22 L 4 -12 Z', fill: c.dark }, h);
      el('circle', { cx: 2, cy: 0, r: 15, fill: c.col }, h);
      el('ellipse', { cx: 16, cy: 4, rx: 5, ry: 7, fill: '#F59AAB', stroke: c.dark, 'stroke-width': 1.5 }, h);
      el('circle', { cx: 16, cy: 1.5, r: 1.3, fill: '#B85C70' }, h); el('circle', { cx: 16, cy: 6.5, r: 1.3, fill: '#B85C70' }, h);
      EYE(k, 7, -5, 2.2, h);
      break;
    case 'sheep':
      [[-6, -10, 8], [0, -14, 8], [-10, -2, 7]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#fff', stroke: '#E3E6EC', 'stroke-width': 1.5 }, h));
      el('ellipse', { cx: 6, cy: 0, rx: 9, ry: 12, fill: c.dark, transform: 'rotate(-25 6 0)' }, h);
      el('ellipse', { cx: -4, cy: -2, rx: 7, ry: 3.5, fill: c.dark }, h);
      el('circle', { cx: 8, cy: -4, r: 2, fill: '#fff' }, h);
      break;
    case 'goat':
      el('path', { d: 'M -2 -10 Q -8 -24 -18 -20', stroke: '#B9AE9A', 'stroke-width': 4.5, fill: 'none', 'stroke-linecap': 'round' }, h);
      el('ellipse', { cx: -8, cy: -6, rx: 8, ry: 3.5, fill: c.col, stroke: c.dark, 'stroke-width': 1 }, h);
      el('path', { d: 'M -6 -10 Q 4 -16 12 -4 Q 18 6 14 10 Q 6 12 0 4 Q -6 -2 -6 -10 Z', fill: c.col, stroke: '#D8D3CA', 'stroke-width': 1.5 }, h);
      el('path', { d: 'M 8 9 Q 8 20 4 22 Q 2 14 4 8 Z', fill: '#C9C2B6' }, h);
      EYE(k, 5, -6, 2.2, h);
      break;
    case 'horse':
      el('path', { d: 'M -14 14 Q -12 -6 -2 -14 L 6 -10 Q -2 2 -2 16 Z', fill: c.col }, h);
      el('path', { d: 'M -14 12 Q -16 -4 -6 -14 L -2 -12 Q -10 -2 -10 12 Z', fill: c.dark }, h);
      el('path', { d: 'M -4 -14 L 0 -22 L 3 -12 Z', fill: c.col }, h);
      el('path', { d: 'M -6 -12 Q 10 -14 22 2 Q 24 8 18 10 Q 8 8 -2 0 Z', fill: c.col }, h);
      el('ellipse', { cx: 19, cy: 5, rx: 5, ry: 4.5, fill: '#8C5F38' }, h);
      EYE(k, 6, -6, 2.2, h);
      break;
    case 'deer':
      el('path', { d: 'M 0 -10 L -2 -24 L -8 -30 M -2 -24 L 4 -32 M -1 -18 L -8 -20', stroke: '#8A6A4A', 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' }, h);
      el('ellipse', { cx: -6, cy: -8, rx: 7, ry: 3.5, fill: c.col, transform: 'rotate(-25 -6 -8)' }, h);
      el('path', { d: 'M -6 -8 Q 6 -14 16 -2 Q 18 4 12 5 Q 4 4 -4 2 Z', fill: c.col }, h);
      el('circle', { cx: 16, cy: 0, r: 2, fill: ink }, h);
      EYE(k, 4, -5, 2, h);
      break;
    case 'fox':
    case 'wolf': {
      const w = kind === 'wolf';
      el('path', { d: 'M -8 -6 L -6 -20 L 2 -10 Z', fill: c.dark }, h);
      el('path', { d: 'M -8 -8 Q 0 -14 8 -6 L 20 2 Q 16 6 6 6 Q -6 6 -10 0 Z', fill: c.col }, h);
      el('path', { d: 'M 2 2 L 20 2 Q 16 7 6 7 Q -2 7 -4 4 Z', fill: w ? '#E3E7EE' : '#fff' }, h);
      el('circle', { cx: 20, cy: 1.5, r: 2.2, fill: ink }, h);
      parts.mouth = el('path', { d: 'M 8 6 L 18 6', stroke: ink, 'stroke-width': 1.5, fill: 'none', 'stroke-linecap': 'round' }, h);
      parts.eye = EYE(k, 4, -4, 2, h);
      break;
    }
    case 'lion':
    case 'tiger': {
      const L = kind === 'lion';
      if (L) { parts.mane = k.g({}, h); for (let i = 0; i < 12; i++) el('ellipse', { cx: 0, cy: -19, rx: 7, ry: 9, fill: i % 2 ? '#B9732A' : '#C9862E', transform: `rotate(${i * 30})` }, parts.mane); }
      else { el('circle', { cx: -6, cy: -12, r: 5, fill: c.col }, h); el('circle', { cx: -6, cy: -12, r: 2.2, fill: '#fff' }, h); }
      el('circle', { cx: 0, cy: 0, r: 14, fill: c.col }, h);
      if (!L) el('path', { d: 'M -10 -8 l 5 3 M -12 -1 l 6 1 M 0 -13 l 0 5 M 6 -12 l -2 5', stroke: c.dark, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, h);
      el('ellipse', { cx: 9, cy: 4, rx: 7, ry: 6, fill: L ? '#F2D7A0' : '#fff' }, h);
      el('path', { d: 'M 11 0 L 16 0 L 13.5 3 Z', fill: '#6B3F2A' }, h);
      parts.jaw = el('path', { d: 'M 6 7 Q 12 10 16 6', stroke: ink, 'stroke-width': 1.6, fill: '#B5434B' }, h);
      parts.eye = EYE(k, 5, -4, 2.2, h);
      break;
    }
    case 'bear':
      el('circle', { cx: -6, cy: -12, r: 6, fill: c.col }, h); el('circle', { cx: -6, cy: -12, r: 3, fill: c.dark }, h);
      el('circle', { cx: 0, cy: 0, r: 15, fill: c.col }, h);
      el('ellipse', { cx: 11, cy: 4, rx: 8, ry: 6.5, fill: '#C9A07E' }, h);
      el('ellipse', { cx: 17, cy: 2, rx: 2.8, ry: 2.2, fill: ink }, h);
      EYE(k, 5, -5, 2.2, h);
      break;
    case 'elephant':
      parts.trunk = el('path', { d: '', stroke: c.col, 'stroke-width': 11, fill: 'none', 'stroke-linecap': 'round' }, h);
      el('circle', { cx: 4, cy: -4, r: 20, fill: c.col }, h);
      parts.ear = el('path', { d: 'M -2 -16 Q -26 -22 -24 4 Q -20 20 -2 12 Z', fill: c.dark }, h);
      el('path', { d: 'M 16 8 Q 22 14 18 18', stroke: '#fff', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, h);
      EYE(k, 10, -8, 2.4, h);
      break;
    case 'mouse':
    case 'rat':
      el('circle', { cx: -2, cy: -6, r: kind === 'mouse' ? 6 : 4.5, fill: c.col, stroke: '#F3B6C0', 'stroke-width': 2 }, h);
      el('path', { d: 'M -6 -2 Q 2 -8 12 2 Q 4 6 -6 4 Z', fill: c.col }, h);
      el('circle', { cx: 12, cy: 2, r: 1.8, fill: '#F07F92' }, h);
      EYE(k, 3, -1, 1.4, h);
      el('path', { d: 'M 10 3 l 7 -2 M 10 4 l 7 2', stroke: '#6B7484', 'stroke-width': 0.8 }, h);
      break;
  }
  return parts;
}

// 四つ足の動物（右向き、原点＝足元中央）。set({x,y,ph,m,face,head,lift,s,tail})
export function beast(k, kind, parent) {
  const { el, g, tf } = k, c = K[kind];
  const o = g({}, parent), sh = k.shadow(0, 0, c.bx + 4, 4 + c.bx * 0.06, o), f = g({}, o), bod = g({}, f);
  const tail = g({}, bod);
  const tl = { cow: 'M 0 0 Q -10 10 -8 26', pig: 'M 0 0 q -6 -6 -8 0 q -2 6 -8 2', sheep: 'M 0 0 q -6 2 -6 8', goat: 'M 0 0 l -6 -8', horse: 'M 0 0 Q -14 10 -12 34', deer: 'M 0 0 l -6 -6',
    fox: 'M 0 0 Q -24 0 -32 14', wolf: 'M 0 0 Q -22 4 -30 18', lion: 'M 0 0 Q -20 6 -26 20', tiger: 'M 0 0 Q -22 4 -30 22', bear: 'M 0 0 l -5 -3', elephant: 'M 0 0 Q -8 8 -8 20', mouse: 'M 0 0 Q -14 4 -26 -2', rat: 'M 0 0 Q -20 6 -36 0' }[kind];
  const tw = { fox: 12, wolf: 10, horse: 6, mouse: 2, rat: 2.4, lion: 4, tiger: 6 }[kind] || 4;
  el('path', { d: tl, stroke: kind === 'horse' ? c.dark : kind === 'fox' ? c.col : kind === 'mouse' || kind === 'rat' ? '#E9A9B4' : c.dark, 'stroke-width': tw, fill: 'none', 'stroke-linecap': 'round' }, tail);
  if (kind === 'fox') el('circle', { cx: -32, cy: 14, r: 5.5, fill: '#fff' }, tail);
  if (kind === 'lion' || kind === 'cow') el('circle', { cx: kind === 'lion' ? -26 : -8, cy: kind === 'lion' ? 20 : 26, r: 4.5, fill: kind === 'lion' ? '#B9732A' : c.dark }, tail);
  const yc = -c.L - c.by * 0.55;
  const mkLeg = (x, back) => { const l = g({}, bod); el('line', { x1: 0, y1: 0, x2: 0, y2: c.L + 2, stroke: back ? c.dark : c.leg, 'stroke-width': c.lw, 'stroke-linecap': 'round', opacity: back ? 0.75 : 1 }, l); if (kind === 'horse' || kind === 'goat' || kind === 'deer' || kind === 'cow' || kind === 'sheep' || kind === 'pig') el('rect', { x: -c.lw / 2, y: c.L - 2, width: c.lw, height: 5, rx: 1.5, fill: '#5A4A3E' }, l); return [l, x]; };
  const fx = c.bx * 0.62, bx = -c.bx * 0.62;
  const legs = [mkLeg(bx + 4, 1), mkLeg(fx + 4, 1), mkLeg(bx, 0), mkLeg(fx, 0)];
  // 胴体
  if (kind === 'sheep') [[-18, -6], [0, -10], [18, -6], [-22, 6], [-4, 6], [14, 6], [24, -2]].forEach(([x, y]) => el('circle', { cx: x, cy: yc + y, r: 14, fill: '#fff', stroke: '#E3E6EC', 'stroke-width': 1.5 }, bod));
  else el('ellipse', { cx: 0, cy: yc, rx: c.bx, ry: c.by, fill: c.col, stroke: kind === 'cow' ? '#E4E0D8' : 'none', 'stroke-width': 1.5 }, bod);
  if (kind === 'cow') { el('path', { d: `M -24 ${yc - 14} q 14 -4 16 8 q -8 10 -18 2 Z M 10 ${yc - 4} q 12 -6 18 4 q -6 12 -16 6 Z`, fill: c.dark }, bod); el('ellipse', { cx: 10, cy: yc + c.by - 2, rx: 9, ry: 6, fill: '#F6B8C2' }, bod); }
  if (kind === 'tiger') for (let i = -3; i <= 3; i++) el('path', { d: `M ${i * 10} ${yc - c.by + 1} q 4 8 -1 14`, stroke: c.dark, 'stroke-width': 3.4, fill: 'none', 'stroke-linecap': 'round' }, bod);
  if (kind === 'deer') [[-12, -6], [-2, -9], [8, -6], [-18, 0], [2, -3]].forEach(([x, y]) => el('circle', { cx: x, cy: yc + y, r: 2, fill: '#fff', opacity: 0.85 }, bod));
  if (kind === 'horse') el('path', { d: `M ${c.bx - 10} ${yc - 10} Q ${c.bx + 6} ${yc - 30} ${c.bx + 14} ${yc - 30} L ${c.bx + 16} ${yc - 16} Q ${c.bx + 4} ${yc - 4} ${c.bx - 2} ${yc + 6} Z`, fill: c.col }, bod);
  if (kind === 'goat' || kind === 'deer') el('path', { d: `M ${c.bx - 10} ${yc - 6} Q ${c.bx} ${yc - 22} ${c.bx + 4} ${yc - 22} L ${c.bx + 8} ${yc - 12} Q ${c.bx} ${yc} ${c.bx - 4} ${yc + 6} Z`, fill: c.col }, bod);
  if (kind === 'fox' || kind === 'wolf') el('ellipse', { cx: 6, cy: yc + 5, rx: c.bx * 0.6, ry: c.by * 0.55, fill: kind === 'fox' ? '#fff' : '#C7CDD6', opacity: 0.8 }, bod);
  const hd = g({}, bod), parts = head(k, kind, c, hd);
  const hx = c.bx * 0.85 + (c.hx - c.bx) * 0.5, hy = yc + c.hy * 0.6 - 4;
  return {
    g: o, f, hd, parts, c, yc, tail,
    // 頭の付け根のワールド座標
    headAt(st) { const s = st.s || 1, fc = st.face || 1; return { x: st.x + hx * s * fc, y: (st.y ?? 0) + (hy - (st.lift || 0)) * s }; },
    set({ x = 0, y = 236, ph = 0, m = 0, face = 1, head: hr = 0, lift = 0, s = 1, tail: tr = 0, tilt = 0, squash = 1, trunk = 0, drop = 0 }) {
      tf(o, x, y, 0, s); tf(f, 0, 0, 0, face, 1);
      tf(sh, 0, 0, 0, Math.max(0.2, 1 - lift / 120), 1);
      bod.setAttribute('transform', `translate(0 ${(-lift - Math.abs(Math.sin(ph)) * 2.5 * m).toFixed(2)}) rotate(${tilt.toFixed(2)}) scale(${(2 - squash).toFixed(3)} ${squash.toFixed(3)})`);
      legs.forEach(([l, lx], i) => tf(l, lx, -c.L, Math.sin(ph + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI * 0.5 : 0)) * 28 * m));
      tf(tail, -c.bx + 2, yc - c.by * 0.4, tr);
      tf(hd, hx + drop * 0.3, hy + drop, hr);
      if (parts.trunk) { const r = trunk; parts.trunk.setAttribute('d', `M 18 2 Q ${30 + 10 * r} ${22 - 30 * r} ${26 + 18 * r} ${40 - 64 * r} Q ${24 + 26 * r} ${44 - 80 * r} ${18 + 30 * r} ${42 - 82 * r}`); }
    }
  };
}
// ハート（原点＝中心）
export function heartG(k, parent, c = k.pal.red) { return k.el('path', { d: 'M 0 6 C -12 -2 -8 -12 0 -5 C 8 -12 12 -2 0 6 Z', fill: c }, parent); }
// 楽しい場面用の吹き出し（原点＝しっぽの先）
export function balloon(k, w = 52, h = 36, tail = -1, parent) {
  const g = k.g({}, parent);
  k.el('rect', { x: -w / 2 - tail * 14, y: -h - 10, width: w, height: h, rx: 14, fill: '#fff', stroke: k.pal.line, 'stroke-width': 2 }, g);
  k.el('path', { d: `M ${-tail * 4} -12 L 0 0 L ${-tail * 14} -12 Z`, fill: '#fff', stroke: k.pal.line, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
  k.el('rect', { x: -tail * 14 - 2 + (tail > 0 ? 0 : -8), y: -14, width: 14, height: 4, fill: '#fff' }, g);
  const c = k.g({}, g); k.tf(c, -tail * 14, -h / 2 - 10);
  return { g, c, show(p, x, y) { k.tf(g, x, y, 0, p <= 0 ? 0.001 : backOut(clamp(p))); g.setAttribute('opacity', clamp(p * 3)); } };
}

export const meta = { duration: 4.4, beats: [[0, '好きな動物は？'], [1.4, '図鑑を開く'], [3.0, 'ゾウが好き！']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#EADFCF' });
  el('rect', { x: 30, y: 40, width: 100, height: 70, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('rect', { x: 290, y: 60, width: 80, height: 6, fill: pal.woodDark });
  [[296, pal.blue], [310, pal.coral], [324, pal.yellow], [338, pal.green]].forEach(([x, c]) => el('rect', { x, y: 38, width: 12, height: 22, rx: 2, fill: c }));
  // ローテーブル
  const TX = 214, TY = FY - 44;
  k.shadow(TX, FY + 2, 70, 5);
  el('rect', { x: TX - 58, y: TY + 8, width: 7, height: 36, fill: pal.woodDark }); el('rect', { x: TX + 51, y: TY + 8, width: 7, height: 36, fill: pal.woodDark });
  el('rect', { x: TX - 66, y: TY, width: 132, height: 10, rx: 3, fill: pal.wood });
  const fr = k.buddy({ x: 330, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  // 立てた図鑑（原点＝下辺の中央）。左半分（表紙）が開く
  const book = g({}); tf(book, TX, TY);
  el('rect', { x: 0, y: -56, width: 50, height: 56, rx: 3, fill: '#5C7FD6' }, book);
  el('rect', { x: 2, y: -53, width: 45, height: 50, fill: '#fff' }, book);
  const ele = beast(k, 'lion', book); ele.set({ x: 24, y: -12, s: 0.3 });
  const left = g({}, book);
  el('rect', { x: 0, y: -56, width: 50, height: 56, rx: 3, fill: '#5C7FD6' }, left);
  const inner = g({}, left);
  el('rect', { x: 3, y: -53, width: 45, height: 50, fill: '#fff' }, inner);
  const lio = beast(k, 'elephant', inner); lio.set({ x: 26, y: -12, s: 0.3, face: -1 });
  const cover = g({}, left); k.text(25, -28, 'ZOO', { 'font-size': 12, fill: '#fff' }, cover);
  el('rect', { x: 8, y: -46, width: 34, height: 4, rx: 2, fill: '#fff', opacity: 0.5 }, cover);
  const me = k.buddy({ x: 118, y: FY, scale: S, facing: 1 });
  const q = balloon(k, 46, 38, 1); k.text(0, 0, '?', { 'font-size': 26, fill: pal.coralDark }, q.c);
  const a = balloon(k, 70, 50, -1); const big = beast(k, 'elephant', a.c); big.set({ x: 0, y: 18, s: 0.36 });
  const hearts = [0, 1].map(() => heartG(k));
  return {
    update(t) {
      const ask = seg(t, 0.3, 0.7), op = easeInOut(seg(t, 1.4, 2.0)), pt = easeInOut(seg(t, 2.3, 2.8)), hp2 = seg(t, 3.0, 3.4);
      // 表紙を左へ開く（x 方向の縮みで回転を表す）
      const sx = Math.cos(op * Math.PI);
      tf(left, 0, 0, 0, Math.abs(sx) < 0.001 ? 0.001 : sx, 1);
      inner.setAttribute('opacity', sx < 0 ? 1 : 0); cover.setAttribute('opacity', sx < 0 ? 0 : 1);
      const flip = hump(seg(t, 1.3, 2.1));
      P(fr, { x: 330, facing: -1, armR: lerp(8, 70, hump(seg(t, 0.2, 1.3))), mood: t > 0.3 && t < 1.2 && Math.sin(t * 20) > 0 ? 'open' : 'smile', blink: blinkAt(t, 1), look: t > 2.4 ? -0.6 : 0.2 });
      P(me, { x: 118, armR: lerp(8, 95, flip) * (1 - pt) + pt * 0, lean: 6 * flip + 4 * pt, mood: t > 3.0 ? 'grin' : 'smile', blink: blinkAt(t), look: t < 1.2 ? 0.8 : 0.5, lift: 6 * hump(seg(t, 3.0, 3.5)) });
      if (pt > 0) me.pose({ armR: lerp(lerp(8, 95, flip), reach(me, S, 'R', TX - 26, TY - 24), pt) });
      q.show(ask - seg(t, 1.6, 1.9), 312, FY - 92);
      a.show(hp2, 120, FY - 96);
      hearts.forEach((h, i) => { const p = seg(t, 3.4 + i * 0.25, 4.3); tf(h, 70 + i * 18, FY - 110 - 24 * p, 0, Math.max(0.001, hump(p))); });
    }
  };
}
