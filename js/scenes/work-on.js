// work on：まめがカウンターで模型飛行機に主翼を取り付け、ドライバーで締めて作業を続ける（例文 He is working on a model airplane.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { hp, reach, room, frontL } from './dig.js';
import { grip } from './hand-over.js';

// 共有ヘルパ（pb4 のシーンから import）：考えごとの吹き出し（原点＝中心、tail は左下 or 右下）
export function thought(k, w = 96, h = 60, tail = -1) {
  const b = k.g({});
  const c = { fill: '#fff', stroke: k.pal.line, 'stroke-width': 2 };
  k.el('circle', { cx: tail * (w * 0.3), cy: h / 2 + 10, r: 5, ...c }, b);
  k.el('circle', { cx: tail * (w * 0.38), cy: h / 2 + 22, r: 3, ...c }, b);
  k.el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: h / 2, ...c }, b);
  const inner = k.g({}, b);
  return { g: b, inner };
}
// 共有ヘルパ：雨粒。update(t, on) で落とす（t から位置が決まる）
export function rain(k, n = 26, FY = 236, x0 = 0, x1 = 400) {
  const drops = [];
  for (let i = 0; i < n; i++) drops.push(k.el('line', { x1: 0, y1: 0, x2: -3, y2: 11, stroke: '#7FB3E0', 'stroke-width': 2, 'stroke-linecap': 'round' }));
  return (t, on = 1) => drops.forEach((d, i) => {
    const sp = 260 + (i * 37) % 90, ph = (i * 0.137) % 1;
    const y = ((t * sp + ph * (FY + 20)) % (FY + 20)) - 20;
    const x = x0 + ((i * 97.3) % (x1 - x0)) + y * 0.25 - 20;
    d.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    d.setAttribute('opacity', on);
  });
}
// 共有ヘルパ：チェック印（p で描き進む）
export function check(k, x, y, s = 1, color, parent) {
  const p = k.el('path', { d: `M ${x - 8 * s} ${y} L ${x - 2 * s} ${y + 6 * s} L ${x + 9 * s} ${y - 7 * s}`, stroke: color || k.pal.green, 'stroke-width': 4 * s, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': 30 * s, 'stroke-dashoffset': 30 * s }, parent || k.root);
  return (q) => p.setAttribute('stroke-dashoffset', (30 * s * (1 - q)).toFixed(2));
}
// 共有ヘルパ：線を描き進める（path の長さに合わせて）
export function drawOn(node) {
  const L = node.getTotalLength ? node.getTotalLength() : 200;
  node.setAttribute('stroke-dasharray', L);
  return (q) => { node.setAttribute('stroke-dashoffset', (L * (1 - q)).toFixed(2)); node.setAttribute('visibility', q > 0.002 ? 'visible' : 'hidden'); };
}

export const meta = { duration: 4.2, beats: [[0, '部品を取る'], [1.6, '取り付ける'], [3.2, '作業を続ける']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const R = room(k);
  el('rect', { x: 290, y: 60, width: 80, height: 56, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('rect', { x: 40, y: 92, width: 90, height: 6, rx: 3, fill: pal.woodDark });
  el('rect', { x: 52, y: 70, width: 16, height: 22, rx: 3, fill: pal.blue, opacity: 0.7 });
  el('rect', { x: 74, y: 76, width: 22, height: 16, rx: 3, fill: pal.yellow, opacity: 0.8 });
  const S = 1.2;
  const b = k.buddy({ x: 170, y: 228, scale: S });
  const fl = frontL(b, S);
  R.front();
  // 模型飛行機（機体はカウンターの上に固定）
  const TY = 196;
  k.shadow(268, TY + 1, 56, 3);
  const plane = g({}); tf(plane, 268, TY - 25, 0, 1.4);
  el('rect', { x: -4, y: 6, width: 8, height: 12, fill: '#B9C3D0' }, plane);
  el('rect', { x: -22, y: 16, width: 44, height: 3, rx: 1.5, fill: '#B9C3D0' }, plane);
  el('path', { d: 'M -44 -2 Q -44 -10 -30 -10 L 34 -8 Q 46 -4 34 2 L -30 4 Q -44 4 -44 -2 Z', fill: '#fff', stroke: pal.sub, 'stroke-width': 1.5 }, plane);
  el('path', { d: 'M -42 -6 L -50 -24 L -38 -24 L -30 -8 Z', fill: pal.red }, plane);
  [-14, -2, 10].forEach((x) => el('circle', { cx: x, cy: -4, r: 2.6, fill: '#CFE9F7' }, plane));
  el('rect', { x: 44, y: -10, width: 3, height: 14, rx: 1.5, fill: pal.ink }, plane);
  // 主翼（手で運ぶ）
  const wing = g({});
  el('path', { d: 'M -24 -3 L 24 -3 L 18 3 L -18 3 Z', fill: pal.blue, stroke: pal.blueDark, 'stroke-width': 1.5 }, wing);
  const ws = k.shadow(340, TY + 1, 20, 2.5);
  // ドライバー（左手）
  const drv = g({});
  el('rect', { x: -3.5, y: -18, width: 7, height: 14, rx: 3, fill: pal.yellow }, drv);
  el('rect', { x: -1.2, y: -4, width: 2.4, height: 14, fill: pal.sub }, drv);
  const gR = grip(k, pal.mint, pal.mintDark, S);
  const W0 = { x: 340, y: TY - 4 }, W1 = { x: 268, y: TY - 24 };
  return {
    update(t) {
      // 右手：翼を取りに行き（0.3-1.0）、運ぶ（1.0-2.0）、押さえる
      const go = easeInOut(seg(t, 0.3, 1.0)), bring = easeInOut(seg(t, 1.1, 2.0));
      b.pose({ lean: lerp(4, 10, go) - 4 * bring, look: 0.7, mood: t > 2.3 ? 'grin' : 'flat', armL: 10 });
      let tgt = t < 1.05 ? { x: lerp(230, W0.x, go), y: lerp(200, W0.y, go) } : { x: lerp(W0.x, W1.x, bring), y: lerp(W0.y, W1.y, bring) - 18 * hump(bring) };
      const snap = wobble(seg(t, 2.0, 2.6), 3, 6);
      b.pose({ armR: reach(b, S, 'R', tgt.x, tgt.y) }); fl.set(lerp(10, 70, easeOut(seg(t, 2.0, 2.4))));
      const h = hp(b, S, 'R');
      const wp = t < 1.05 ? W0 : { x: h.x, y: h.y };
      tf(wing, wp.x, wp.y + (t > 2.0 ? snap * 1.5 : 0), t > 1.05 && t < 2.0 ? -6 * hump(bring) : 0, 1.4);
      gR(h); ws.setAttribute('opacity', 1 - seg(t, 1.05, 1.3));
      // 左手：ドライバーで翼の付け根を締める（2.2 以降、繰り返し）
      const tw = t > 2.3 ? Math.sin((t - 2.3) * 14) : 0;
      const la = lerp(10, 70, easeOut(seg(t, 2.0, 2.4)));
      fl.set(la);
      const hl = fl.pos();
      drv.setAttribute('opacity', seg(t, 1.9, 2.1));
      tf(drv, hl.x + 2, hl.y + 2 + Math.abs(tw) * 2, tw * 8);
    }
  };
}
// 共有ヘルパ：右向き/左向きに立つ人が、ペン先（手先＋ペン）を点 (tx,ty) に届かせるための足元 x（左向き facing=-1 は板の右側に立つ）
export function standFor(S, tx, ty, FY, facing = -1, L = 62) {
  const dy = ty - (FY - 56 * S), dx = Math.sqrt(Math.max(0, L * L - dy * dy)) * 0.95;
  return tx - facing * (27 * S + dx);
}
// 共有ヘルパ：ペン（原点＝握り、+y がペン先）
export function pen(k, color) {
  const m = k.g({});
  k.el('rect', { x: -3.5, y: -4, width: 7, height: 16, rx: 2, fill: color || k.pal.blue }, m);
  k.el('rect', { x: -2.5, y: 12, width: 5, height: 5, rx: 1, fill: k.pal.ink }, m);
  return m;
}
