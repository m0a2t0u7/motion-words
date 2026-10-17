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

// sign-in：メールアドレスを入力してボタンを押すと、ようこそ画面に入れる（Please sign in with your email address.）
export const meta = { duration: 4.0, beats: [[0, '入力欄'], [1.3, 'アドレス入力'], [3.2, '入れた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const scr = desk(k);
  const S = 1.1;
  const b = k.buddy({ x: 205, y: FY, scale: S });
  const A = g({}, scr);
  el('rect', { width: 132, height: 114, fill: '#EEF2F8' }, A);
  el('rect', { x: 14, y: 10, width: 104, height: 94, rx: 8, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 }, A);
  k.text(66, 26, 'Sign in', { 'font-size': 12, fill: pal.ink }, A);
  k.text(26, 44, '@', { 'font-size': 13, fill: pal.sub }, A);
  el('rect', { x: 36, y: 36, width: 74, height: 16, rx: 4, fill: '#F4F7FB', stroke: pal.blue, 'stroke-width': 1.6 }, A);
  const txt = k.text(40, 44.5, '', { 'font-size': 8.5, 'text-anchor': 'start', fill: pal.ink }, A);
  const caret = el('rect', { y: 39, width: 1.4, height: 10, fill: pal.blue }, A);
  el('rect', { x: 24, y: 60, width: 86, height: 6, rx: 3, fill: '#E3E9F1' }, A);
  const btn = el('rect', { x: 36, y: 76, width: 60, height: 18, rx: 9, fill: pal.blue }, A);
  k.text(66, 85.5, 'GO', { 'font-size': 10, fill: '#fff' }, A);
  const B = g({}, scr);
  el('rect', { width: 132, height: 114, fill: '#E6F6F1' }, B);
  const door = g({ transform: 'translate(66 52)' }, B);
  el('circle', { r: 26, fill: '#fff' }, door);
  el('circle', { cy: -6, r: 8, fill: pal.mint }, door);
  el('path', { d: 'M -14 14 Q 0 -6 14 14 Z', fill: pal.mint }, door);
  const ck = el('path', { d: 'M -44 6 L -38 12 L -28 0', stroke: pal.green, 'stroke-width': 0, fill: 'none' }, B);
  k.text(66, 94, 'Hello!', { 'font-size': 13, fill: pal.mintDark }, B);
  const cur = cursor(k, scr);
  const MAIL = 'ken@mail.com';
  return {
    update(t) {
      const n = Math.floor(clamp((t - 1.0) / 1.5) * MAIL.length);
      txt.textContent = MAIL.slice(0, n);
      tf(caret, 40 + n * 4.85, 0);
      k.set(caret, { opacity: t < 2.6 && Math.floor(t * 4) % 2 === 0 ? 1 : 0 });
      const mv = easeInOut(seg(t, 2.5, 3.0));
      const click = hump(seg(t, 3.0, 3.2));
      tf(cur, lerp(100, 74, mv), lerp(40, 82, mv) + click * 2, 0, 1 - click * 0.15, 1 - click * 0.15);
      k.set(cur, { opacity: seg(t, 2.4, 2.5) * (1 - seg(t, 3.25, 3.45)) });
      k.set(btn, { fill: click > 0.2 ? pal.blueDark : pal.blue });
      const sw = smooth(seg(t, 3.15, 3.55));
      k.set(A, { opacity: 1 - sw });
      k.set(B, { opacity: sw });
      tf(door, 66, 52, 0, 0.7 + 0.3 * backOut(seg(t, 3.15, 3.7)));
      const typing = t > 1.0 && t < 2.5;
      const press = typing ? Math.abs(Math.sin(t * 13)) : 0;
      b.pose({ armR: aim(b, S, 262, 196 - 5 * press), lean: 6, look: 1, mood: sw > 0.9 ? 'grin' : 'smile', blink: t > 0.4 && t < 0.5 ? 1 : 0 });
    }
  };
}
