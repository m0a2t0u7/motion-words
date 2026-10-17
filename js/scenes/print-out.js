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

// print-out：データのファイルをプリンターに送ると、紙になって外に出てくる（Can you print out this file for me?）
export const meta = { duration: 4.0, beats: [[0, 'ファイル'], [1.2, '印刷中'], [3.0, '紙が出た']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 1.1;
  k.shadow(320, 238, 90, 5);
  el('rect', { x: 236, y: 206, width: 160, height: 10, rx: 4, fill: pal.wood });
  el('rect', { x: 246, y: 216, width: 10, height: 20, fill: pal.woodDark });
  el('rect', { x: 376, y: 216, width: 10, height: 20, fill: pal.woodDark });
  // 画面上のファイル
  const fileIcon = g({});
  el('path', { d: 'M -14 -18 L 6 -18 L 14 -10 L 14 18 L -14 18 Z', fill: '#fff', stroke: pal.blue, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, fileIcon);
  for (let i = 0; i < 3; i++) el('line', { x1: -8, y1: -4 + i * 8, x2: 8, y2: -4 + i * 8, stroke: pal.blue, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, fileIcon);
  // プリンター本体
  el('rect', { x: 262, y: 142, width: 116, height: 64, rx: 10, fill: '#E1E6EE' });
  el('rect', { x: 262, y: 142, width: 116, height: 34, rx: 10, fill: '#F1F4F8' });
  el('rect', { x: 262, y: 166, width: 116, height: 10, fill: '#F1F4F8' });
  el('rect', { x: 280, y: 172, width: 80, height: 5, rx: 2.5, fill: '#2F3847' });
  const btn = el('circle', { cx: 276, cy: 154, r: 5, fill: pal.mint });
  el('rect', { x: 330, y: 150, width: 34, height: 12, rx: 3, fill: '#2F3847' });
  const led = el('rect', { x: 334, y: 154, width: 8, height: 4, rx: 1, fill: pal.green });
  // 紙（プリンターの前面から出る）
  const clipId = k.clip((cp) => el('rect', { x: 250, y: 177, width: 140, height: 80 }, cp));
  const paper = g({ 'clip-path': clipId });
  const pin = g({}, paper);
  const PL = 292, PW = 56;
  const pr = el('rect', { x: PL, y: 176, width: PW, height: 60, rx: 2, fill: '#fff', stroke: '#C7CFDA', 'stroke-width': 1.5 }, pin);
  const lines = [0, 1, 2, 3, 4].map((i) => el('line', { x1: PL + 8, y1: 184 + i * 9, x2: PL + PW - 8 - (i % 2) * 14, y2: 184 + i * 9, stroke: pal.blue, 'stroke-width': 2.6, 'stroke-linecap': 'round', opacity: 0.8 }, paper));
  const b = k.buddy({ x: 215, y: FY, scale: S });
  return {
    update(t) {
      const reach = easeInOut(seg(t, 0.3, 0.9)) * (1 - easeInOut(seg(t, 1.5, 2.0)));
      const press = hump(seg(t, 0.9, 1.2));
      b.pose({ armR: lerp(8, aim(b, S, 270, 156 + press * 2), reach), lean: 6 * reach, look: 1, mood: t > 3 ? 'grin' : 'smile', blink: t > 0.15 && t < 0.25 ? 1 : 0 });
      k.set(btn, { fill: press > 0.3 ? pal.mintDark : pal.mint });
      // ファイルがプリンターに吸い込まれる
      const f = easeIn(seg(t, 1.2, 1.9));
      tf(fileIcon, lerp(318, 328, f), lerp(104, 150, f) + Math.sin(t * 4) * 2 * (1 - f), 0, 1 - f * 0.6);
      k.set(fileIcon, { opacity: t < 1.2 ? 1 : 1 - seg(t, 1.8, 1.95) });
      // 紙が出てくる
      const out = easeOut(seg(t, 2.0, 3.0));
      tf(pin, 0, -62 + out * 56, 0);
      k.set(led, { fill: t > 1.9 && t < 3.0 && Math.floor(t * 8) % 2 ? '#F2C14E' : pal.green });
      lines.forEach((l, i) => k.set(l, { opacity: 0.8 * seg(t, 2.3 + i * 0.12, 2.5 + i * 0.12) }));
    }
  };
}
