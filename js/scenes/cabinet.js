// cabinet：台所の踏み台に乗って吊り戸棚の扉を開けると、棚にカップが並んでいる（例文 The cups are in the kitchen cabinet.）
// 共通ヘルパー：kitchenWall（タイル壁＋流し台）、cup（取っ手付きカップ）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { reach } from './dig.js';
import { gait } from './weigh.js';
import { P, blinkAt } from './run-after.js';

// 台所の壁（タイル）と、腰の高さの調理台（天板 y=CT）。戻り値は床の y
export function kitchenWall(k, { FY = 236, CT = 184, x0 = 0, x1 = 400, win = true } = {}) {
  const { el, pal } = k;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#F4F0E8' });
  el('rect', { x: 0, y: FY, width: 400, height: 300 - FY, fill: '#E3E7EC' });
  for (let x = 0; x < 400; x += 40) el('line', { x1: x, y1: FY, x2: x - 10, y2: 300, stroke: '#D3D9E0', 'stroke-width': 1.5 });
  el('rect', { x: x0, y: CT - 60, width: x1 - x0, height: 60, fill: '#E6EEF2' });
  for (let y = CT - 60; y < CT; y += 15) el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: '#fff', 'stroke-width': 1.5 });
  for (let x = x0; x < x1; x += 20) el('line', { x1: x, y1: CT - 60, x2: x, y2: CT, stroke: '#fff', 'stroke-width': 1.5 });
  if (win) { el('rect', { x: 26, y: 44, width: 76, height: 60, rx: 5, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 }); el('line', { x1: 64, y1: 44, x2: 64, y2: 104, stroke: '#fff', 'stroke-width': 4 }); }
  return {
    FY, CT,
    // 調理台（呼んだ以降の図形より奥。人物より先に描く）
    counter() {
      k.shadow((x0 + x1) / 2, FY + 1, (x1 - x0) / 2, 4);
      el('rect', { x: x0, y: CT, width: x1 - x0, height: 8, rx: 2, fill: '#C9D2DE' });
      el('rect', { x: x0 + 4, y: CT + 8, width: x1 - x0 - 8, height: FY - CT - 8, fill: '#FBF7F0' });
      for (let x = x0 + 4; x < x1 - 8; x += 60) { el('rect', { x: x + 4, y: CT + 14, width: 52, height: FY - CT - 22, rx: 3, fill: 'none', stroke: '#E2D8C8', 'stroke-width': 1.5 }); el('rect', { x: x + 24, y: CT + 18, width: 12, height: 3, rx: 1.5, fill: pal.sub }); }
    }
  };
}
// 取っ手付きカップ（原点＝底の中央）
export function cup(k, parent, c) {
  const g = k.g({}, parent);
  k.el('path', { d: 'M -8 -14 H 8 L 7 -1 Q 7 0 6 0 H -6 Q -7 0 -7 -1 Z', fill: c }, g);
  k.el('path', { d: 'M 8 -11 q 6 0 5 5 q -1 4 -6 3', fill: 'none', stroke: c, 'stroke-width': 2.4 }, g);
  k.el('rect', { x: -8, y: -14, width: 16, height: 2.5, fill: '#fff', opacity: 0.4 }, g);
  return g;
}

export const meta = { duration: 4.2, beats: [[0, '踏み台に乗る'], [1.4, '戸棚を開ける'], [2.6, 'カップがある']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.88;
  const kw = kitchenWall(k, { x0: 140, x1: 400 });
  const FY = kw.FY;
  // 吊り戸棚（左の扉が開く）
  const C0 = 170, C1 = 330, CY0 = 40, CY1 = 112;
  el('rect', { x: C0 - 4, y: CY0 - 4, width: C1 - C0 + 8, height: CY1 - CY0 + 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: C0, y: CY0, width: C1 - C0, height: CY1 - CY0, fill: '#E9D9C0' });
  el('rect', { x: C0, y: 74, width: C1 - C0, height: 4, fill: pal.woodDark });
  [[186, pal.violet], [206, pal.green], [226, '#F59E7A']].forEach(([x, c]) => { const n = cup(k, k.root, c); tf(n, x, CY1); });
  [[186, pal.coral], [206, pal.blue], [226, pal.yellow]].forEach(([x, c]) => { const n = cup(k, k.root, c); tf(n, x, 74); });
  el('rect', { x: 250, y: 48, width: 70, height: 26, fill: '#E2CFB1' });
  [262, 282, 302].forEach((x) => el('ellipse', { cx: x, cy: 68, rx: 9, ry: 3, fill: '#fff', stroke: pal.line }));
  // 右の扉（閉じたまま）と左の扉（開く）
  el('rect', { x: 250, y: CY0, width: C1 - 250, height: CY1 - CY0, fill: '#F3E3C8', stroke: pal.woodDark, 'stroke-width': 2 });
  el('rect', { x: 256, y: CY1 - 14, width: 4, height: 10, rx: 2, fill: pal.sub });
  const door = g({});
  const dFace = el('rect', { x: 0, y: CY0, width: C1 - C0 - 80, height: CY1 - CY0, fill: '#F3E3C8', stroke: pal.woodDark, 'stroke-width': 2 }, door);
  el('rect', { x: 66, y: CY1 - 14, width: 4, height: 10, rx: 2, fill: pal.sub }, door);
  kw.counter();
  el('rect', { x: 290, y: kw.CT - 20, width: 34, height: 20, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  // 踏み台
  const SX = 140, ST = FY - 30;
  k.shadow(SX, FY + 1, 28, 4);
  el('rect', { x: SX - 24, y: ST, width: 48, height: 7, rx: 3, fill: pal.blue });
  el('path', { d: `M ${SX - 20} ${ST + 7} L ${SX - 24} ${FY} M ${SX + 20} ${ST + 7} L ${SX + 24} ${FY}`, stroke: pal.blueDark, 'stroke-width': 5, 'stroke-linecap': 'round' });
  const b = k.buddy({ x: 70, y: FY, scale: S });
  const mark = g({}); el('circle', { r: 10, fill: pal.yellow }, mark); k.text(0, 1, '!', { 'font-size': 15 }, mark);
  const xf = (t) => lerp(70, 104, easeInOut(seg(t, 0.15, 0.6)));
  return {
    update(t) {
      const w = gait(xf, t, 70, 0, 0.12);
      const step = easeInOut(seg(t, 0.65, 1.15));
      const x = t < 0.65 ? w.x : lerp(104, SX + 4, step);
      const y = lerp(FY, ST, step) - 14 * hump(seg(t, 0.65, 1.15));
      const land = wobble(seg(t, 1.15, 1.6), 2, 6);
      const grab = easeInOut(seg(t, 1.3, 1.6)), open = easeInOut(seg(t, 1.6, 2.2));
      const pose = { x, y, walk: w.walk, lean: w.lean + 4 * grab, squash: 1 - 0.05 * land, look: lerp(0.4, 0.9, step), blink: blinkAt(t), mood: t > 2.5 ? 'grin' : 'smile' };
      P(b, pose);
      // 扉は左の蝶番を軸に開く（手は取っ手を持ったまま）
      const sx = lerp(1, -0.3, open);
      const hx = C0 + 68 * sx, hy = CY1 - 9;
      let armR = lerp(10, reach(b, S, 'R', hx, hy), grab);
      armR = lerp(armR, 30, easeInOut(seg(t, 2.3, 2.7)));
      P(b, { ...pose, armR, armL: 10 + 20 * land });
      door.setAttribute('transform', `translate(${C0} 0) scale(${sx.toFixed(3)} 1)`);
      k.set(dFace, { fill: sx < 0 ? '#E4CFAD' : '#F3E3C8' });
      const m = seg(t, 2.4, 2.8);
      tf(mark, 206, 26 - 4 * m, 0, m > 0 ? 0.4 + 0.6 * easeOut(m) : 0.001);
    }
  };
}
