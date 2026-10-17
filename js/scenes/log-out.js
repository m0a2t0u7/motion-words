import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';
const D = Math.PI / 180;
// 手(R/L)を点(tx,ty)へ向ける腕の角度
function aim(b, S, tx, ty, side = 'R') {
  const s = b.state, f = s.facing, o = side === 'R' ? 1 : -1;
  return Math.atan2((tx - (s.x + 27 * S * f * o)) * f * o, ty - (s.y - 56 * S - s.lift)) / D;
}
function cursor(k, parent) {
  return k.el('path', { d: 'M0 0 L0 15 L4 11.5 L7 18 L10 16.5 L7 10.5 L12 10.5 Z', fill: k.pal.ink, stroke: '#fff', 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, parent);
}
function pen(k, parent, c) {
  const p = k.g({}, parent);
  k.el('line', { x1: 0, y1: 0, x2: -22, y2: -6, stroke: c || k.pal.coralDark, 'stroke-width': 5, 'stroke-linecap': 'round' }, p);
  k.el('path', { d: 'M 0 0 L 6 1.6 L 0 3 Z', fill: '#F4D9B5' }, p);
  k.el('circle', { cx: 5.2, cy: 1.7, r: 1.1, fill: k.pal.ink }, p);
  return p;
}

function desk(k) {
  const { el, g, pal } = k;
  el('rect', { x: 226, y: 206, width: 170, height: 10, rx: 4, fill: pal.wood });
  el('rect', { x: 236, y: 216, width: 10, height: 20, fill: pal.woodDark });
  el('rect', { x: 376, y: 216, width: 10, height: 20, fill: pal.woodDark });
  el('rect', { x: 303, y: 186, width: 22, height: 20, fill: '#B9C2CF' });
  el('rect', { x: 240, y: 58, width: 148, height: 130, rx: 10, fill: '#3A4456' });
  const scr = g({ transform: 'translate(248 66)' });
  el('rect', { width: 132, height: 114, rx: 4, fill: '#FFFFFF' }, scr);
  el('rect', { x: 250, y: 196, width: 70, height: 10, rx: 3, fill: '#DDE3EA' });
  for (let i = 0; i < 9; i++) el('rect', { x: 253 + i * 7.4, y: 198, width: 5.4, height: 5, rx: 1.5, fill: '#fff' });
  return scr;
}

// log-out：使用中の画面で「ログアウト」ボタンを押し、ログイン前の画面に戻る（Don't forget to log out when you finish.）
export const meta = { duration: 3.8, beats: [[0, 'ログイン中'], [1.5, 'ボタンを押す'], [3.0, 'ログアウト済']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const scr = desk(k);
  const S = 1.1;
  const b = k.buddy({ x: 205, y: FY, scale: S });
  // 画面A：ログイン中
  const A = g({}, scr);
  el('rect', { width: 132, height: 22, fill: pal.blue }, A);
  el('circle', { cx: 14, cy: 11, r: 7, fill: '#fff' }, A);
  el('rect', { x: 26, y: 8, width: 36, height: 6, rx: 3, fill: '#fff', opacity: 0.8 }, A);
  const btn = el('rect', { x: 100, y: 4, width: 26, height: 14, rx: 5, fill: '#fff' }, A);
  el('path', { d: 'M 106 6 L 106 16 M 106 6 L 112 6 M 106 16 L 112 16 M 111 11 L 120 11 M 117 8 L 120.5 11 L 117 14', stroke: pal.coralDark, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, A);
  for (let i = 0; i < 4; i++) el('rect', { x: 12, y: 34 + i * 18, width: 108 - (i % 2) * 30, height: 8, rx: 4, fill: '#E3E9F1' }, A);
  // 画面B：ログイン前
  const B = g({}, scr);
  el('rect', { width: 132, height: 114, fill: '#EEF2F8' }, B);
  el('rect', { x: 30, y: 12, width: 72, height: 90, rx: 8, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 }, B);
  el('rect', { x: 56, y: 28, width: 20, height: 14, rx: 3, fill: pal.sub }, B);
  el('path', { d: 'M 60 28 L 60 22 Q 66 14 72 22 L 72 28', stroke: pal.sub, 'stroke-width': 3, fill: 'none' }, B);
  el('rect', { x: 40, y: 54, width: 52, height: 10, rx: 4, fill: '#E3E9F1' }, B);
  el('rect', { x: 40, y: 70, width: 52, height: 10, rx: 4, fill: '#E3E9F1' }, B);
  el('rect', { x: 46, y: 86, width: 40, height: 10, rx: 5, fill: pal.blue }, B);
  const cur = cursor(k, scr);
  return {
    update(t) {
      const mv = easeInOut(seg(t, 1.0, 1.9));
      const click = hump(seg(t, 1.9, 2.15));
      tf(cur, lerp(40, 112, mv), lerp(70, 8, mv) + click * 2, 0, 1 - click * 0.15);
      k.set(btn, { fill: click > 0.2 ? '#FFE3DC' : '#fff' });
      const sw = smooth(seg(t, 2.1, 2.6));
      k.set(A, { opacity: 1 - sw });
      k.set(B, { opacity: sw });
      k.set(cur, { opacity: 1 - seg(t, 2.6, 2.9) });
      const act = t > 0.8 && t < 2.0 ? 1 : 0;
      b.pose({ armR: aim(b, S, 262, 196 - 4 * act * Math.abs(Math.sin(t * 11))), lean: 6, look: 1, mood: sw > 0.9 ? 'grin' : 'smile', blink: t > 0.3 && t < 0.4 ? 1 : 0 });
    }
  };
}
