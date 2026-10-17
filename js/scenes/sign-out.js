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

// sign-out：アプリの「サインアウト」を押すと、自分の情報が消えて外に出た状態になる（I signed out of the app.）
export const meta = { duration: 3.8, beats: [[0, 'サインイン中'], [1.2, 'ボタンを押す'], [2.8, '外に出た']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 1.1;
  k.shadow(290, 232, 56, 6);
  el('rect', { x: 276, y: 210, width: 28, height: 22, rx: 4, fill: '#B9C2CF' });
  el('rect', { x: 238, y: 30, width: 104, height: 184, rx: 16, fill: '#3A4456' });
  const scr = g({ transform: 'translate(244 38)' });
  const clipId = k.clip((cp) => el('rect', { width: 92, height: 168, rx: 10 }, cp));
  const sc = g({ 'clip-path': clipId }, scr);
  el('rect', { width: 92, height: 168, fill: '#F4F7FB' }, sc);
  el('rect', { width: 92, height: 22, fill: pal.mint }, sc);
  el('rect', { x: 8, y: 6, width: 14, height: 10, rx: 3, fill: '#fff' }, sc);
  k.text(52, 11, 'APP', { 'font-size': 9, fill: '#fff' }, sc);
  // 自分の情報（サインイン中）
  const me = g({}, sc);
  el('circle', { cx: 46, cy: 56, r: 20, fill: pal.mint }, me);
  el('circle', { cx: 46, cy: 50, r: 7, fill: '#fff' }, me);
  el('path', { d: 'M 33 68 Q 46 46 59 68 Z', fill: '#fff' }, me);
  el('rect', { x: 22, y: 86, width: 48, height: 7, rx: 3.5, fill: '#D5DBE5' }, me);
  el('rect', { x: 30, y: 98, width: 32, height: 6, rx: 3, fill: '#E3E9F1' }, me);
  // 外に出た状態（空の人影）
  const none = g({}, sc);
  el('circle', { cx: 46, cy: 56, r: 20, fill: '#E3E9F1' }, none);
  el('circle', { cx: 46, cy: 50, r: 7, fill: '#F4F7FB' }, none);
  el('path', { d: 'M 33 68 Q 46 46 59 68 Z', fill: '#F4F7FB' }, none);
  const btn = el('rect', { x: 10, y: 128, width: 72, height: 24, rx: 12, fill: pal.coral }, sc);
  const bt = k.text(46, 140.5, 'Sign out', { 'font-size': 10, fill: '#fff' }, sc);
  const b = k.buddy({ x: 205, y: FY, scale: S });
  const ring = el('circle', { r: 10, fill: 'none', stroke: pal.coralDark, 'stroke-width': 3 });
  return {
    update(t) {
      const reach = easeInOut(seg(t, 0.7, 1.3)) * (1 - easeInOut(seg(t, 1.9, 2.4)));
      const tap = hump(seg(t, 1.3, 1.6));
      const away = 1 - easeOut(seg(t, 1.6, 1.9));
      const sw = smooth(seg(t, 1.6, 2.4));
      b.pose({ armR: aim(b, S, 254 + tap * 4, 172) * reach + 8 * (1 - reach), lean: 6 * reach, look: 1, mood: sw > 0.9 ? 'flat' : 'smile', blink: t > 0.3 && t < 0.4 ? 1 : 0 });
      k.set(me, { opacity: away });
      tf(me, -44 * (1 - away), 0);
      k.set(none, { opacity: sw });
      k.set(btn, { fill: sw > 0.5 ? pal.blue : pal.coral });
      bt.textContent = sw > 0.5 ? 'Sign in' : 'Sign out';
      tf(ring, 254, 172, 0, 0.5 + seg(t, 1.35, 1.8) * 1.4);
      k.set(ring, { opacity: hump(seg(t, 1.35, 1.8)) * 0.6 });
    }
  };
}
