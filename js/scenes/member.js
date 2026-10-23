// member：チェス部の部室に来て一緒に指す。名簿に3人目として並ぶ（例文 He is a member of the chess club.）
// このファイルは u4/u5（人・職業・気持ち）シーン用の共有ヘルパーも export する
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { hp, held, reach } from './dig.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { path } from './queue-up.js';
import { deskFront } from './vehicle.js';

export const CO = (k) => ({ color: k.pal.coral, dark: k.pal.coralDark });
export const BL = (k) => ({ color: k.pal.blue, dark: k.pal.blueDark });
export const YE = (k) => ({ color: k.pal.yellow, dark: k.pal.yellowDark });
export const VI = () => ({ color: '#A58BF3', dark: '#7F63D6' });
export const sc = (p) => Math.max(0.001, p);
export const pop = (p) => (p <= 0 ? 0.001 : p >= 1 ? 1 : backOut(clamp(p)));
// 体に身に着ける物（体の傾き・つぶれに合わせて動く）。前の腕より奥に入れる
export function wear(k, b, kind, col) {
  const { el, pal } = k, front = b.armR.a.parentNode;
  const g = k.g({}, null);
  if (kind === 'glasses') { b.body.children[3].appendChild(g); }
  else b.body.insertBefore(g, kind === 'coat' || kind === 'tie' || kind === 'badge' || kind === 'apron' ? front : front.nextSibling);
  const c = col || pal.ink;
  const W = {
    cap: () => { el('path', { d: 'M -27 -74 Q -24 -96 0 -97 Q 24 -96 27 -74 Z', fill: c }, g); el('rect', { x: -28, y: -78, width: 56, height: 7, rx: 2, fill: '#fff' }, g); el('path', { d: 'M -6 -74 Q 14 -66 34 -72 L 30 -78 Z', fill: pal.ink }, g); el('circle', { cx: 0, cy: -86, r: 4, fill: pal.yellow }, g); },
    helmet: () => { el('path', { d: 'M -31 -70 Q -30 -100 0 -100 Q 30 -100 31 -70 Z', fill: c || pal.yellow }, g); el('rect', { x: -35, y: -73, width: 74, height: 6, rx: 3, fill: pal.yellowDark }, g); el('rect', { x: -3, y: -99, width: 6, height: 26, fill: '#fff', opacity: 0.4 }, g); },
    crown: () => { el('path', { d: 'M -20 -76 L -22 -98 L -11 -88 L 0 -102 L 11 -88 L 22 -98 L 20 -76 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g); el('circle', { cx: 0, cy: -84, r: 3, fill: pal.red }, g); },
    tie: () => { el('path', { d: 'M -4 -33 L 4 -33 L 3 -29 L 6 -12 L 0 -6 L -6 -12 L -3 -29 Z', fill: c }, g); el('path', { d: 'M -10 -36 L 0 -31 L 10 -36', stroke: '#fff', 'stroke-width': 3, fill: 'none' }, g); },
    coat: () => { el('path', { d: 'M -29 -34 L 29 -34 L 29 -16 Q 29 0 14 0 L -14 0 Q -29 0 -29 -16 Z', fill: c === pal.ink ? '#fff' : c, opacity: 0.95 }, g); el('line', { x1: 0, y1: -34, x2: 0, y2: 0, stroke: pal.line, 'stroke-width': 2 }, g); el('rect', { x: 8, y: -26, width: 10, height: 7, rx: 1.5, fill: 'none', stroke: pal.line, 'stroke-width': 1.5 }, g); },
    apron: () => { el('path', { d: 'M -18 -34 L 18 -34 L 22 0 L -22 0 Z', fill: c }, g); },
    badge: () => { el('rect', { x: 6, y: -30, width: 14, height: 10, rx: 2, fill: c === pal.ink ? pal.yellow : c, stroke: '#fff', 'stroke-width': 1.5 }, g); },
    nurse: () => { el('path', { d: 'M -18 -76 L -14 -92 L 14 -92 L 18 -76 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, g); el('path', { d: 'M -3 -84 h 6 M 0 -87 v 6', stroke: c === pal.ink ? '#F28CB1' : c, 'stroke-width': 2.4 }, g); },
    band: () => { el('rect', { x: -30, y: -74, width: 60, height: 8, fill: c }, g); el('path', { d: 'M -30 -72 l -10 -4 l 2 10 Z', fill: c }, g); },
    beret: () => { el('ellipse', { cx: 2, cy: -80, rx: 26, ry: 8, fill: c }, g); el('circle', { cx: 4, cy: -89, r: 3, fill: c }, g); },
    glasses: () => { el('circle', { cx: -10, cy: -54, r: 7, fill: 'none', stroke: pal.ink, 'stroke-width': 2 }, g); el('circle', { cx: 10, cy: -54, r: 7, fill: 'none', stroke: pal.ink, 'stroke-width': 2 }, g); el('line', { x1: -3, y1: -54, x2: 3, y2: -54, stroke: pal.ink, 'stroke-width': 2 }, g); },
    hat: () => { el('ellipse', { cx: 0, cy: -78, rx: 36, ry: 6, fill: c }, g); el('path', { d: 'M -20 -78 Q -20 -98 0 -98 Q 20 -98 20 -78 Z', fill: c }, g); el('rect', { x: -20, y: -84, width: 40, height: 5, fill: pal.red }, g); }
  };
  (W[kind] || W.badge)();
  return g;
}
export { hp, held, reach, P, blinkAt, walkTo, path, deskFront };

export const meta = { duration: 4.2, beats: [[0, '部室に来る'], [1.6, '一緒に指す'], [3.2, 'クラブの一員']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 120, y: 22, width: 170, height: 30, rx: 6, fill: '#3E6B5A' });
  k.text(205, 38, 'CHESS CLUB', { 'font-size': 15, fill: '#fff' });
  // 名簿ボード：3人目の枠に自分が加わる
  el('rect', { x: 300, y: 64, width: 88, height: 70, rx: 5, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 3 });
  k.text(344, 76, 'MEMBERS', { 'font-size': 9, fill: pal.sub });
  const slot = [pal.coral, pal.blue, pal.mint].map((c, i) => {
    el('rect', { x: 308 + i * 26, y: 86, width: 20, height: 26, rx: 3, fill: pal.floor });
    const f = g({}); el('circle', { cx: 0, cy: 0, r: 8, fill: c }, f); el('circle', { cx: -3, cy: -1, r: 1.3, fill: pal.ink }, f); el('circle', { cx: 3, cy: -1, r: 1.3, fill: pal.ink }, f);
    return f;
  });
  // 卓をはさんで部員2人
  const a = k.buddy({ x: 296, y: FY, scale: S, facing: -1, ...CO(k) }); wear(k, a, 'badge');
  const c = k.buddy({ x: 352, y: FY, scale: S * 0.9, facing: -1, ...BL(k) }); wear(k, c, 'badge');
  const b = k.buddy({ x: -40, y: FY, scale: S, facing: 1 }); wear(k, b, 'badge');
  const TOP = 204;
  deskFront(k, 150, 112, TOP, FY);
  // チェス盤
  el('path', { d: `M 160 ${TOP} L 252 ${TOP} L 244 ${TOP - 10} L 168 ${TOP - 10} Z`, fill: '#F3E3C8', stroke: pal.woodDark, 'stroke-width': 1.5 });
  for (let i = 0; i < 6; i++) el('rect', { x: 170 + i * 13, y: TOP - 8, width: 6.5, height: 6, fill: pal.woodDark, opacity: 0.5 });
  const piece = (col, x) => { const p = g({}); el('path', { d: 'M -4 0 L 4 0 L 2.5 -7 Q 4 -10 0 -13 Q -4 -10 -2.5 -7 Z', fill: col }, p); tf(p, x, TOP - 4); return p; };
  [[188, '#fff'], [228, pal.ink], [236, pal.ink], [200, '#fff']].forEach(([x, col]) => piece(col, x));
  const mine = piece('#fff', 176);
  const bx = path([[0, -40], [1.4, 126]]);
  return {
    update(t) {
      const w = walkTo(bx, t, -40, 1);
      P(b, { x: w.x, walk: w.walk, armL: w.armL, armR: w.armR, lean: w.lean, blink: blinkAt(t), look: 0.6, mood: t > 3 ? 'grin' : 'smile' });
      // 駒をつまんで1マス進める
      const m = easeInOut(seg(t, 1.9, 2.8)), r = seg(t, 1.6, 1.9) - seg(t, 2.9, 3.2);
      const px = lerp(176, 196, m), py = TOP - 4 - 8 * hump(m);
      if (t > 1.4) {
        const target = { x: px, y: py - 10 };
        const ang = reach(b, S, 'R', target.x, target.y);
        b.pose({ armR: lerp(8, ang, easeInOut(clamp(r))), lean: 6 * clamp(r) });
      }
      tf(mine, px, py);
      const hi = seg(t, 1.4, 1.9) * (1 - seg(t, 3.3, 3.8));
      P(a, { blink: blinkAt(t, 0.8), look: 0.4, armR: 8 + 120 * hump(seg(t, 1.0, 1.8)), mood: t > 1 ? 'grin' : 'smile' });
      P(c, { blink: blinkAt(t, 1.6), look: 0.5, armR: 8 + 130 * hump(seg(t, 3.2, 4.0)), mood: 'smile', lean: -4 * hi });
      slot.forEach((f, i) => tf(f, 318 + i * 26, 99, 0, i < 2 ? 1 : pop(seg(t, 3.0, 3.5))));
    }
  };
}
