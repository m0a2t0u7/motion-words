// hospital：母が看護師の帽子で病院へ出勤し、中に入って窓辺で患者のそばで働く。子は手を振って見送る（例文 My mother works at a hospital as a nurse.）
// このファイルは医療系シーン（y1）の共有小道具も export する。
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, held, reach } from './dig.js';
import { P } from './run-after.js';
import { gait } from './weigh.js';
export { hp, held, reach, P, gait };

// 白衣（医者）。体の下半分に重ねる
export function coat(k, b) {
  const c = k.g({});
  k.el('path', { d: 'M -30 -38 H 30 V -28 A 28 28 0 0 1 2 0 H -2 A 28 28 0 0 1 -30 -28 Z', fill: '#fff' }, c);
  k.el('path', { d: 'M -12 -38 L 0 -22 L 12 -38', fill: 'none', stroke: k.pal.line, 'stroke-width': 2.5 }, c);
  k.el('line', { x1: 0, y1: -22, x2: 0, y2: -2, stroke: k.pal.line, 'stroke-width': 2 }, c);
  k.el('rect', { x: 9, y: -18, width: 11, height: 8, rx: 2, fill: 'none', stroke: k.pal.line, 'stroke-width': 2 }, c);
  b.body.insertBefore(c, b.armR.a.parentNode);
  return c;
}
// 看護師の帽子
export function cap(k, b) {
  const c = k.g({});
  k.el('path', { d: 'M -17 -76 L -13 -92 L 13 -92 L 17 -76 Q 0 -80 -17 -76 Z', fill: '#fff', stroke: k.pal.line, 'stroke-width': 1.5 }, c);
  k.el('path', { d: 'M -2 -88 h 4 v 3 h 3 v 4 h -3 v 3 h -4 v -3 h -3 v -4 h 3 Z', fill: k.pal.blue }, c);
  b.body.insertBefore(c, b.armR.a.parentNode);
  return c;
}
// 医療の印（白い十字、色付きの角丸板。赤十字は使わない）
export function cross(k, x, y, r = 16, color, parent) {
  const g = k.g({}, parent || k.root); k.tf(g, x, y);
  k.el('rect', { x: -r, y: -r, width: 2 * r, height: 2 * r, rx: r * 0.3, fill: color || k.pal.mintDark }, g);
  const a = r * 0.28, l = r * 0.72;
  k.el('path', { d: `M ${-a} ${-l} H ${a} V ${-a} H ${l} V ${a} H ${a} V ${l} H ${-a} V ${a} H ${-l} V ${-a} H ${-a} Z`, fill: '#fff' }, g);
  return g;
}
// 診察室の背景
export function clinicBg(k, FY = 236, wall = '#EEF6F5') {
  const { el, pal } = k;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: wall });
  el('rect', { x: 0, y: FY - 60, width: 400, height: 60, fill: '#E2EFEE' });
  el('rect', { x: 0, y: FY - 62, width: 400, height: 3, fill: '#fff' });
  el('rect', { x: 30, y: 40, width: 74, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 67, y1: 40, x2: 67, y2: 100, stroke: '#fff', 'stroke-width': 4 });
  cross(k, 360, 60, 14);
  return FY;
}
// 薬びん（原点＝底の中央）
export function bottle(k, parent, color) {
  const g = k.g({}, parent || k.root), pal = k.pal;
  k.el('rect', { x: -10, y: -28, width: 20, height: 28, rx: 4, fill: color || '#F2A65A' }, g);
  k.el('rect', { x: -11, y: -35, width: 22, height: 8, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, g);
  k.el('rect', { x: -7, y: -21, width: 14, height: 12, rx: 2, fill: '#fff' }, g);
  k.el('path', { d: 'M -1.5 -19 h 3 v 3 h 3 v 3 h -3 v 3 h -3 v -3 h -3 v -3 h 3 Z', fill: pal.mintDark }, g);
  return g;
}
// カプセル錠（原点＝中心）
export function pill(k, parent, c1, c2) {
  const g = k.g({}, parent || k.root);
  const cp = k.clip((c) => k.el('rect', { x: -7, y: -3.5, width: 14, height: 7, rx: 3.5 }, c));
  const i = k.g({ 'clip-path': cp }, g);
  k.el('rect', { x: -7, y: -3.5, width: 7, height: 7, fill: c1 || k.pal.coral }, i);
  k.el('rect', { x: 0, y: -3.5, width: 7, height: 7, fill: c2 || '#fff' }, i);
  k.el('rect', { x: -7, y: -3.5, width: 14, height: 7, rx: 3.5, fill: 'none', stroke: k.pal.coralDark, 'stroke-width': 1 }, g);
  return g;
}
// 水のコップ（原点＝底の中央）。set(水位0..1)
export function glass(k, parent) {
  const g = k.g({}, parent || k.root);
  const w = k.el('path', { fill: k.pal.water }, g);
  k.el('path', { d: 'M -9 -26 L 9 -26 L 7 0 L -7 0 Z', fill: '#fff', 'fill-opacity': 0.35, stroke: '#B9CBDD', 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
  const set = (q) => { const y = -2 - 22 * q, hw = 7 + 2 * (22 * q) / 26; k.set(w, { d: `M ${-hw} ${y} L ${hw} ${y} L 7 -1 L -7 -1 Z`, opacity: q > 0.02 ? 1 : 0 }); };
  set(0.8);
  return { g, set };
}
// 体温計（原点＝先端）。set(0..1)
export function thermo(k, parent) {
  const g = k.g({}, parent || k.root);
  k.el('rect', { x: -4, y: -44, width: 8, height: 44, rx: 4, fill: '#fff', stroke: k.pal.sub, 'stroke-width': 1.5 }, g);
  k.el('circle', { cx: 0, cy: -4, r: 5, fill: k.pal.red }, g);
  const bar = k.el('rect', { x: -1.8, width: 3.6, rx: 1.8, fill: k.pal.red }, g);
  const set = (q) => k.set(bar, { y: -6 - 34 * q, height: 4 + 34 * q });
  set(0.2);
  return { g, set };
}
// ばい菌（原点＝中心）
export function germ(k, parent, c) {
  const g = k.g({}, parent || k.root), col = c || k.pal.violet;
  for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; k.el('line', { x1: 0, y1: 0, x2: Math.cos(a) * 10, y2: Math.sin(a) * 10, stroke: col, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g); }
  k.el('circle', { r: 7, fill: col }, g);
  k.el('circle', { cx: -2.5, cy: -1, r: 1.4, fill: '#fff' }, g); k.el('circle', { cx: 2.5, cy: -1, r: 1.4, fill: '#fff' }, g);
  return g;
}
// マスク（顔の前に付く）。返す node を表示・移動
export function mask(k, b) {
  const m = k.g({});
  k.el('path', { d: 'M -27 -47 L -15 -46 M 27 -47 L 15 -46', stroke: '#C9D3E0', 'stroke-width': 1.6 }, m);
  k.el('path', { d: 'M -15 -50 Q 0 -53 15 -50 L 15 -36 Q 0 -31 -15 -36 Z', fill: '#fff', stroke: '#C9D3E0', 'stroke-width': 1.6 }, m);
  [-45, -41].forEach((y) => k.el('line', { x1: -11, y1: y, x2: 11, y2: y, stroke: '#DCE3EC', 'stroke-width': 1.2 }, m));
  b.body.children[3].appendChild(m);
  return m;
}
// 寝ている人（あお向け・頭は右）。grp を tf(grp, 足元x, 体の中心y, 90, s) で置く
export function lying(k, opts = {}) {
  const grp = k.g({});
  const b = k.buddy({ parent: grp, x: 0, y: 0, ...opts });
  b.g.firstChild.setAttribute('display', 'none');
  return { grp, b };
}
// ベッド（x0〜x0+w、マットレス上面 MT）。front() で掛け布団（以後の図形の手前）
export function bed(k, x0, FY, w = 200, col) {
  const { el, pal } = k, MT = FY - 52;
  k.shadow(x0 + w / 2, FY + 1, w / 2 + 6, 4);
  el('rect', { x: x0 + w - 12, y: MT - 50, width: 12, height: 100, rx: 5, fill: pal.woodDark });
  el('rect', { x: x0, y: MT + 12, width: w, height: 24, rx: 5, fill: pal.wood });
  el('rect', { x: x0 + 6, y: MT + 36, width: 9, height: FY - MT - 36, fill: pal.woodDark });
  el('rect', { x: x0 + w - 15, y: MT + 36, width: 9, height: FY - MT - 36, fill: pal.woodDark });
  el('rect', { x: x0 + 2, y: MT, width: w - 12, height: 16, rx: 7, fill: '#F4F8FC' });
  el('ellipse', { cx: x0 + w - 44, cy: MT - 4, rx: 30, ry: 11, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 });
  return { MT, front(x1, x2, top) { const r = el('rect', { x: x1, y: top, width: x2 - x1, height: MT + 14 - top, rx: 12, fill: col || pal.blue }); el('rect', { x: x2 - 14, y: top, width: 14, height: MT + 14 - top, rx: 6, fill: '#fff', opacity: 0.5 }); return r; } };
}

export const meta = { duration: 4.4, beats: [[0, '病院へ向かう'], [1.8, '中に入る'], [3.2, '看護師の仕事']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240 });
  // 病院の建物
  el('rect', { x: 150, y: 50, width: 236, height: FY - 50, rx: 4, fill: '#F4F7FA' });
  el('rect', { x: 150, y: 44, width: 236, height: 10, rx: 3, fill: '#CBD6E2' });
  cross(k, 268, 76, 15, pal.mintDark);
  const wins = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
    if ((r === 1 && (c === 1 || c === 2)) || (r === 0 && c === 0)) continue;
    wins.push(el('rect', { x: 166 + c * 56, y: 104 + r * 52, width: 38, height: 32, rx: 4, fill: '#CFE9F7' }));
  }
  // 窓の中（看護師と患者）
  const WX = 160, WY = 98;
  const win0 = el('rect', { x: WX, y: WY, width: 52, height: 44, rx: 4, fill: '#CFE9F7' });
  const inner = g({ 'clip-path': k.clip((c) => el('rect', { x: WX, y: WY, width: 52, height: 44 }, c)) });
  el('rect', { x: WX, y: WY, width: 52, height: 44, fill: '#FFF4D8' }, inner);
  el('rect', { x: WX + 22, y: WY + 30, width: 32, height: 14, fill: '#fff' }, inner);
  el('circle', { cx: WX + 42, cy: WY + 25, r: 7, fill: pal.violet }, inner);
  el('rect', { x: WX + 22, y: WY + 28, width: 16, height: 8, rx: 3, fill: pal.blue }, inner);
  const mini = k.buddy({ parent: inner, x: WX + 12, y: WY + 56, scale: 0.46, color: pal.coral, dark: pal.coralDark });
  cap(k, mini);
  el('rect', { x: WX, y: WY, width: 52, height: 44, rx: 4, fill: 'none', stroke: '#fff', 'stroke-width': 3 });
  // 入口（自動ドア）
  const DX = 244, DW = 52, DH = 70;
  el('rect', { x: DX - 6, y: FY - DH - 8, width: DW + 12, height: DH + 8, rx: 3, fill: '#CBD6E2' });
  el('rect', { x: DX, y: FY - DH, width: DW, height: DH, fill: '#6E7C96' });
  const mom = k.buddy({ x: 100, y: FY, scale: 0.8, color: pal.coral, dark: pal.coralDark });
  cap(k, mom);
  const bag = g({}, mom.armL.a); el('rect', { x: -8, y: 26, width: 16, height: 12, rx: 3, fill: pal.violet }, bag);
  const dl = el('rect', { y: FY - DH, width: DW / 2, height: DH, fill: '#BFE3F5', opacity: 0.85, stroke: '#fff', 'stroke-width': 2 });
  const dr = el('rect', { y: FY - DH, width: DW / 2, height: DH, fill: '#BFE3F5', opacity: 0.85, stroke: '#fff', 'stroke-width': 2 });
  el('rect', { x: 150, y: FY - 4, width: 236, height: 4, fill: '#CBD6E2' });
  const kid = k.buddy({ x: 46, y: FY, scale: 0.55, facing: 1 });
  const xf = (t) => lerp(100, DX + DW / 2, easeInOut(seg(t, 0.3, 2.3)));
  return {
    update(t) {
      const p = gait(xf, t, 100);
      const inside = seg(t, 2.0, 2.35);
      P(mom, { x: p.x, walk: p.walk, armL: p.armL * 0.4 + 8, armR: p.armR, lean: p.lean, look: inside > 0 ? 0 : 0.5, mood: 'smile' });
      mom.g.setAttribute('opacity', 1 - inside);
      const op = easeInOut(seg(t, 1.5, 1.9)) * (1 - easeInOut(seg(t, 2.4, 2.8)));
      k.set(dl, { x: DX - op * 22 }); k.set(dr, { x: DX + DW / 2 + op * 22 });
      const wave = t > 0.5 && t < 3.6 ? 150 + 22 * Math.sin(t * 9) : 8;
      P(kid, { armR: wave, look: lerp(0.2, 0.9, seg(t, 0.5, 2.2)), mood: 'grin', facing: 1 });
      // 窓の中：看護師が患者に近づき、体温計を見る
      const w = easeOut(seg(t, 2.8, 3.5));
      inner.setAttribute('opacity', seg(t, 2.5, 2.8));
      mini.g.setAttribute('opacity', seg(t, 2.6, 2.9));
      P(mini, { x: lerp(WX + 2, WX + 14, w), y: WY + 56, armR: lerp(8, 80, easeOut(seg(t, 3.3, 3.8))), mood: 'smile', look: 0.6 });
      
    }
  };
}
