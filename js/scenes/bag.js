// bag：重いかばんを手に提げ、体を傾けながら学校まで歩く（例文 She carried a heavy bag to school every single day.）
// このファイルは「身の回りの物」系シーンの共有ヘルパーも書き出す（at / face / bagProp / paper / idCard / schoolBg / counterBg ほか）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, held, reach } from './dig.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { streetBg } from './weigh.js';
import { homeBg } from './furniture.js';
import { desk } from './get-on-with.js';
import { say, phone } from './look-over.js';
import { drop } from './in-common.js';
export { hp, held, reach, P, blinkAt, walkTo, streetBg, homeBg, desk, say, phone, drop };

// 手先に、回転させずに物を置く（原点＝握り）
export function at(k, b, s, node, side = 'R', rot = 0, len = 28, sc = 1) {
  const h = hp(b, s, side, len);
  k.tf(node, h.x, h.y, rot, s * sc);
  return h;
}
// 顔（目と口）をずらす
export const face = (b, dx = 0, dy = 0) => b.body.children[3].setAttribute('transform', `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
// 手を目標点へ向ける（両腕）。pose の後に呼ぶ
export function aim(b, s, side, x, y) {
  const a = reach(b, s, side, x, y);
  b.pose(side === 'R' ? { armR: a } : { armL: a });
  return a;
}
// キーフレーム [[t, x, y], ...] を easeInOut でつなぐ（手先の軌道など）
export const track = (keys) => (t) => {
  if (t <= keys[0][0]) return { x: keys[0][1], y: keys[0][2] };
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
    const a = keys[i - 1], c = keys[i], p = easeInOut(seg(t, a[0], c[0]));
    return { x: lerp(a[1], c[1], p), y: lerp(a[2], c[2], p) };
  }
  const z = keys[keys.length - 1]; return { x: z[1], y: z[2] };
};
// 手提げかばん（原点＝持ち手の握り、下に垂れる）
export function bagProp(k, parent, col = '#5C7FD6', dark = '#3F60B5', w = 34, h = 30) {
  const g = k.g({}, parent);
  k.el('path', { d: `M -9 ${8} Q -9 -3 0 -3 Q 9 -3 9 ${8}`, stroke: dark, 'stroke-width': 3.5, fill: 'none' }, g);
  k.el('rect', { x: -w / 2, y: 7, width: w, height: h, rx: 6, fill: col }, g);
  k.el('rect', { x: -w / 2, y: 7, width: w, height: 8, rx: 4, fill: dark, opacity: 0.6 }, g);
  k.el('rect', { x: -4, y: 13, width: 8, height: 6, rx: 1.5, fill: k.pal.yellow }, g);
  return g;
}
// 紙（中心原点）。lines 本の文字線
export function paper(k, parent, w = 26, h = 32, lines = 4, col = '#fff') {
  const g = k.g({}, parent);
  k.el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 2, fill: col, stroke: k.pal.line, 'stroke-width': 1.5 }, g);
  for (let i = 0; i < lines; i++) k.el('line', { x1: -w / 2 + 4, y1: -h / 2 + 7 + i * 6, x2: w / 2 - 4 - (i % 2) * 5, y2: -h / 2 + 7 + i * 6, stroke: k.pal.sub, 'stroke-width': 1.4, opacity: 0.6 }, g);
  return g;
}
// 顔写真つきのカード（中心原点）
export function idCard(k, parent, col = '#DCEBFF', w = 34, h = 22, face = k.pal.mint) {
  const g = k.g({}, parent);
  k.el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 3, fill: col, stroke: k.pal.blueDark, 'stroke-width': 1.5 }, g);
  k.el('rect', { x: -w / 2 + 3, y: -h / 2 + 3, width: 11, height: h - 6, rx: 2, fill: '#fff' }, g);
  k.el('rect', { x: -w / 2 + 5, y: -h / 2 + 6, width: 7, height: h - 9, rx: 3.5, fill: face }, g);
  for (let i = 0; i < 3; i++) k.el('line', { x1: -w / 2 + 17, y1: -h / 2 + 6 + i * 5, x2: w / 2 - 3 - (i % 2) * 5, y2: -h / 2 + 6 + i * 5, stroke: k.pal.sub, 'stroke-width': 1.3 }, g);
  return g;
}
// 校舎（右寄せ、原点＝地面の左端）
export function school(k, x, FY) {
  const { el, pal } = k, g = k.g({});
  el('rect', { x, y: FY - 120, width: 130, height: 120, fill: '#F7E9D7' }, g);
  el('rect', { x: x + 40, y: FY - 150, width: 50, height: 34, fill: '#F2DCC2' }, g);
  el('circle', { cx: x + 65, cy: FY - 134, r: 11, fill: '#fff', stroke: pal.ink, 'stroke-width': 2 }, g);
  el('path', { d: `M ${x + 65} ${FY - 134} v -7 M ${x + 65} ${FY - 134} h 5`, stroke: pal.ink, 'stroke-width': 1.8 }, g);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) el('rect', { x: x + 10 + c * 30, y: FY - 108 + r * 34, width: 20, height: 20, rx: 2, fill: '#DDEFFA' }, g);
  el('rect', { x: x + 50, y: FY - 38, width: 30, height: 38, fill: pal.woodDark }, g);
  return g;
}
// 店のカウンター（右に店員、レジ）。front() でカウンター前面
export function counterBg(k, FY = 236, cx = 290, w = 160) {
  const { el, pal } = k;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 26, width: 400, height: 16, fill: '#F0E4D6' });
  el('rect', { x: 230, y: 60, width: 150, height: 60, rx: 4, fill: '#F6E7D2', stroke: pal.woodDark, 'stroke-width': 3 });
  [0, 1, 2].forEach((i) => el('rect', { x: 242 + i * 46, y: 72, width: 36, height: 8, rx: 3, fill: [pal.coral, pal.yellow, pal.green][i], opacity: 0.8 }));
  [0, 1, 2].forEach((i) => el('rect', { x: 242 + i * 46, y: 90, width: 30, height: 5, rx: 2, fill: pal.sub, opacity: 0.4 }));
  const TY = FY - 52;
  return { FY, TY, front() {
    el('rect', { x: cx - w / 2, y: TY, width: w, height: 8, rx: 3, fill: pal.woodDark });
    el('rect', { x: cx - w / 2 + 6, y: TY + 8, width: w - 12, height: FY - TY - 8, fill: pal.wood });
    el('rect', { x: cx - w / 2 + 6, y: TY + 8, width: w - 12, height: 4, fill: pal.woodDark, opacity: 0.4 });
  } };
}
// 人物の奥に置く台（脚は見える）。天板の y を返す
export function backTable(k, x0, x1, TY, FY = 236) {
  const { el, pal } = k;
  k.shadow((x0 + x1) / 2, FY - 6, (x1 - x0) / 2 + 4, 3);
  el('rect', { x: x0 + 8, y: TY, width: 7, height: FY - 6 - TY, fill: pal.woodDark });
  el('rect', { x: x1 - 15, y: TY, width: 7, height: FY - 6 - TY, fill: pal.woodDark });
  el('rect', { x: x0, y: TY - 4, width: x1 - x0, height: 10, rx: 3, fill: pal.wood });
  el('rect', { x: x0, y: TY + 4, width: x1 - x0, height: 3, fill: pal.woodDark, opacity: 0.4 });
  return TY - 4;
}
// レジ（原点＝台の上の底中央）
export function register(k, x, y) {
  const { el, pal } = k, g = k.g({}); k.tf(g, x, y);
  el('rect', { x: -20, y: -16, width: 40, height: 16, rx: 3, fill: '#D5DCE6' }, g);
  el('rect', { x: -14, y: -34, width: 28, height: 18, rx: 3, fill: pal.ink }, g);
  el('rect', { x: -10, y: -30, width: 20, height: 9, rx: 1.5, fill: '#9BE1C8' }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '重いかばん'], [1.4, '学校へ運ぶ'], [3.6, '今日も着いた']] };

export function create(k) {
  const { pal, tf } = k, S = 1, FY = 236;
  streetBg(k, FY);
  school(k, 262, FY);
  const bag = bagProp(k, k.root, '#5C7FD6', '#3F60B5', 32, 26);
  const b = k.buddy({ x: 50, y: FY, scale: S });
  const sw = drop(k);
  const xf = (t) => lerp(40, 285, easeInOut(seg(t, 0.4, 3.7)));
  return {
    update(t) {
      const w = walkTo(xf, t, 40);
      const heave = easeOut(seg(t, 0, 0.4));
      P(b, { x: w.x, walk: w.walk * 0.8, armL: 8 + (w.armL - 8) * 1.4 + 30 * heave, armR: 4, lean: -4 * heave + w.lean, squash: 1 - 0.05 * heave + 0.02 * Math.abs(Math.sin(w.walk)), mood: t > 3.8 ? 'smile' : 'flat', look: 0.4, blink: blinkAt(t) });
      const h = hp(b, S, 'R');
      const swing = Math.sin(w.walk) * 4 * w.m + wobble(seg(t, 3.7, 4.4), 2, 4) * 5;
      tf(bag, h.x + 2, h.y + 1 - 4 * (1 - heave), swing, 1);
      tf(sw, w.x - 30, FY - 82 + 8 * ((t * 0.8) % 1), 0, 1);
      sw.setAttribute('opacity', t > 0.8 && t < 3.8 ? 0.9 * (1 - ((t * 0.8) % 1)) : 0);
    }
  };
}
