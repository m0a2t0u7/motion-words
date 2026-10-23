// confused：長い説明書を広げるほど紙が床まで垂れ、まめは頭をかかえて「？」だらけになる（例文 I was confused by the long instructions.）
// このファイルは u6・u7（気持ちの形容詞・仕事の名詞）シーンの共有ヘルパーも書き出す
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp, wobble } from '../ease.js';
import { reach } from './dig.js';
import { P, blinkAt, walkTo, run, clock, win } from './run-after.js';
import { person, path } from './queue-up.js';
import { cue, talk, popIn, sc, box, drop } from './in-common.js';
import { homeBg, sofaProp, sparkle } from './furniture.js';
import { officeBg, desk, monitor, coin, star } from './get-on-with.js';
import { papers } from './hand-over.js';
import { paper, idCard, school, track } from './bag.js';
import { treeG, flowerG, scene, hills, cloudG } from './nature.js';
import { streetBg, heart } from './weigh.js';
import { mark, calendar, cake } from './so-far-so-good.js';
import { thought, check } from './work-on.js';
import { faceOf, legs, bp } from './body.js';
import { bulb } from './look-to.js';
import { pencil } from './check.js';
import { suitcase, pullCase } from './vehicle.js';
import { sign, door } from './queue-up.js';
export { reach, P, blinkAt, walkTo, run, clock, win, person, path, cue, talk, popIn, sc, box, drop, homeBg, sofaProp, sparkle,
  officeBg, desk, monitor, coin, star, papers, paper, idCard, school, track, treeG, flowerG, scene, hills, cloudG, streetBg, heart,
  mark, calendar, cake, thought, check, faceOf, legs, bp, bulb, pencil, suitcase, pullCase, sign, door };
const rad = (d) => (d * Math.PI) / 180;

// 手先のワールド座標（傾き・つぶれ・向き・歩きの上下動を反映）
export function hp(b, s, side = 'R', len = 28) {
  const st = b.state, a = rad(side === 'R' ? -st.armR : st.armL);
  let x = (side === 'R' ? 27 : -27) - len * Math.sin(a), y = -46 + len * Math.cos(a);
  x *= 2 - st.squash; y *= st.squash;
  const l = rad(st.lean), c = Math.cos(l), sn = Math.sin(l), bob = Math.abs(Math.sin(st.walk)) * 3;
  return { x: st.x + (x * c - y * sn) * st.facing * s, y: st.y + (x * sn + y * c - 10 - st.lift - bob) * s };
}
// 手先に物を置く（回転なし、原点＝握り）
export function hold(k, b, s, node, side = 'R', rot = 0, len = 28, sc2 = 1) {
  const h = hp(b, s, side, len);
  k.tf(node, h.x, h.y, rot, s * sc2);
  return h;
}
// 腕を目標点へ向ける（pose の後に呼ぶ）
export function aim(b, s, side, x, y) {
  const a = reach(b, s, side, x, y);
  b.pose(side === 'R' ? { armR: a } : { armL: a });
  return a;
}
// 体に付ける飾り（帽子・髪など）。顔の後ろに入るグループを返す
export function wear(k, b) {
  const g = k.g({}, null);
  b.body.insertBefore(g, b.body.children[3]);
  return g;
}
// 顔の上に重ねる飾り（ほお・めがね・汗など）
export const onFace = (k, b) => k.g({}, faceOf(b));
// ほおの赤み。set(p)
export function blush(k, b) {
  const f = onFace(k, b);
  const c = [-18, 18].map((x) => k.el('ellipse', { cx: x, cy: -44, rx: 7, ry: 4.5, fill: '#FF6F7D', opacity: 0 }, f));
  return (p) => c.forEach((n) => n.setAttribute('opacity', (0.75 * p).toFixed(2)));
}
// 白髪のおだんごとめがね（年配の人）
export function elder(k, b) {
  const w = wear(k, b);
  k.el('circle', { cx: 0, cy: -84, r: 11, fill: '#E4E6EA', stroke: '#C9CDD4', 'stroke-width': 2 }, w);
  k.el('path', { d: 'M -28 -64 Q -26 -82 0 -82 Q 26 -82 28 -64 Q 14 -74 0 -72 Q -14 -74 -28 -64 Z', fill: '#E4E6EA' }, w);
  const f = onFace(k, b);
  [-10, 10].forEach((x) => k.el('circle', { cx: x, cy: -54, r: 7, fill: 'none', stroke: k.pal.ink, 'stroke-width': 1.8 }, f));
  k.el('line', { x1: -3, y1: -54, x2: 3, y2: -54, stroke: k.pal.ink, 'stroke-width': 1.8 }, f);
  return w;
}
// ヘルメット（安全帽・消防帽）
export function helmet(k, b, col = '#FFCF5C', dark = '#E9B43A') {
  const w = wear(k, b);
  k.el('path', { d: 'M -27 -72 Q -26 -100 0 -100 Q 26 -100 27 -72 Z', fill: col }, w);
  k.el('rect', { x: -34, y: -74, width: 68, height: 7, rx: 3, fill: dark }, w);
  k.el('rect', { x: -3, y: -100, width: 6, height: 26, rx: 2, fill: dark, opacity: 0.6 }, w);
  return w;
}
// 汗のしずく：set(p, x, y)
export function sweat(k) {
  const d = drop(k);
  return (p, x, y) => { k.tf(d, x, y + 10 * p, 0, sc(hump(p) * 1.1)); };
}
// 浮かぶ記号（? ! ♪ など）。set(p, x, y)
export function sym(k, str, col, fs = 22) {
  const t = k.text(0, 0, str, { 'font-size': fs, fill: col || k.pal.blueDark });
  return (p, x, y, rot = 0) => { k.tf(t, x, y, rot, sc(popIn(p))); t.setAttribute('opacity', p > 0 ? 1 : 0); };
}
// いす（横向き、原点＝床、座面の高さ h）
export function chair(k, x, FY, h = 40, col, parent) {
  const g = k.g({}, parent), c = col || k.pal.woodDark;
  k.shadow(x, FY + 1, 24, 4, g);
  k.el('rect', { x: x - 22, y: FY - h, width: 44, height: 7, rx: 3, fill: col || k.pal.wood }, g);
  k.el('rect', { x: x - 20, y: FY - h + 7, width: 5, height: h - 7, fill: c }, g);
  k.el('rect', { x: x + 15, y: FY - h + 7, width: 5, height: h - 7, fill: c }, g);
  return FY - h;
}
// 座らせる：体の底を座面にのせ、脚を前へ下ろす（pose の後に呼ぶ）
export function sitLegs(b) { legs(b, -60, -50); }

// ===== confused 本体 =====
export const meta = { duration: 4.2, beats: [[0, '説明書を読む'], [1.4, '長すぎる'], [3.0, '混乱した']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.05;
  const FY = homeBg(k, { winX: 290 });
  // 机の上の、組み立て前の部品箱
  const bx = box(k, 56, 34, '#E3B77E'); tf(bx, 70, FY); k.shadow(70, FY + 1, 32, 4);
  [[40, 0], [58, 4], [92, -6]].forEach(([x, r]) => el('rect', { x: x - 6, y: FY - 8, width: 12, height: 8, rx: 2, fill: pal.blue, transform: `rotate(${r} ${x} ${FY})` }));
  const b = k.buddy({ x: 200, y: FY, scale: S });
  // 両手で持つ長い説明書（上端を握り、下へ伸びる）
  const doc = g({});
  const sheet = el('rect', { x: -26, y: 0, width: 52, height: 40, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, doc);
  const lines = g({}, doc);
  for (let i = 0; i < 26; i++) el('line', { x1: -20, y1: 8 + i * 6, x2: 14 - (i % 3) * 8, y2: 8 + i * 6, stroke: pal.sub, 'stroke-width': 1.6, opacity: 0.6 }, lines);
  const cp = k.clip((c) => { lines.cp = el('rect', { x: -30, y: 0, width: 60, height: 40 }, c); });
  lines.setAttribute('clip-path', cp);
  const spill = el('rect', { x: 0, y: FY - 4, width: 10, height: 6, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  const hands = [0, 1].map(() => el('circle', { r: 6.8, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.6 }));
  const qs = [0, 1, 2].map((i) => sym(k, '?', [pal.blueDark, pal.coralDark, pal.violet][i], 24 + i * 2));
  const swirl = el('path', { d: 'M 0 0 m -10 0 a 10 10 0 1 1 10 10 a 6 6 0 1 1 -6 -6', stroke: pal.sub, 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' });
  return {
    update(t) {
      const un = easeInOut(seg(t, 0.5, 2.8));
      const tilt = easeInOut(seg(t, 2.6, 3.2)), scr = seg(t, 2.4, 2.8);
      const look = t < 2.6 ? lerp(0.6, 0.9, Math.sin(t * 4) * 0.5 + 0.5) : lerp(0.8, -0.3, tilt);
      P(b, { x: 160, armR: 112, armL: lerp(10, 165, easeOut(scr)) + 8 * Math.sin(t * 18) * scr, lean: -5 * tilt, look, mood: t > 2.4 ? 'sad' : t > 1.3 ? 'flat' : 'smile', blink: blinkAt(t) });
      const r = hp(b, S, 'R', 28);
      const top = r.y - 2, V = FY - top, L = lerp(40, V + 120, un), vh = Math.min(L, V), fw = Math.max(0, L - V);
      tf(doc, r.x, top, 0, 1);
      k.set(sheet, { height: vh, x: -18, width: 36 });
      k.set(lines.cp, { height: vh });
      k.set(spill, { x: r.x - 18, width: 36 + fw, opacity: fw > 0 ? 1 : 0 });
      k.set(hands[0], { cx: r.x, cy: r.y }); hands[1].setAttribute('opacity', 0);
      faceOf(b).setAttribute('transform', `translate(${(look * 6).toFixed(2)} ${(2 * tilt).toFixed(2)})`);
      qs.forEach((q, i) => q(seg(t, 1.6 + i * 0.45, 2.0 + i * 0.45), 120 + i * 34 + 4 * Math.sin(t * 3 + i), FY - 122 - (i % 2) * 18));
      const sw = popIn(seg(t, 3.0, 3.4));
      tf(swirl, b.state.x - 58, FY - 70, t * 220, sc(sw));
    }
  };
}
