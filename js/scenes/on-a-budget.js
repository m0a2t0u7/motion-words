// on a budget：旅行の財布にはコイン2枚。飛行機（コイン5枚）はやめ、安いバス（1枚）を選んで、リュックで節約旅に出る（例文 We're traveling on a budget this year.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, reach, held, coin, walk, path, popIn } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '財布を見る'], [1.6, '安いほうに'], [3.2, '節約の旅']] };

function plane(k, parent) {
  const g = k.g({}, parent);
  k.el('path', { d: 'M -22 0 Q -22 -5 -14 -5 L 18 -5 Q 24 -3 24 0 Q 24 3 18 4 L -14 4 Q -22 4 -22 0 Z', fill: '#fff', stroke: k.pal.blueDark, 'stroke-width': 2 }, g);
  k.el('path', { d: 'M -2 -4 L -10 -16 L -4 -16 L 8 -4 Z M -2 4 L -10 15 L -4 15 L 8 4 Z M -18 -4 L -22 -12 L -17 -12 L -12 -4 Z', fill: k.pal.blue }, g);
  return g;
}
function bus(k, parent) {
  const g = k.g({}, parent);
  k.el('rect', { x: -22, y: -12, width: 44, height: 20, rx: 5, fill: k.pal.green }, g);
  [-15, -4, 7].forEach((x) => k.el('rect', { x, y: -9, width: 8, height: 7, rx: 1.5, fill: '#CFE9F7' }, g));
  [-12, 12].forEach((x) => k.el('circle', { cx: x, cy: 9, r: 4, fill: k.pal.ink }, g));
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // 旅行会社の掲示板：飛行機＝コイン5、バス＝コイン1
  el('rect', { x: 200, y: 34, width: 180, height: 140, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  const rows = [[78, plane, 5], [138, bus, 1]].map(([y, f, n]) => {
    const ic = f(k); tf(ic, 236, y);
    for (let i = 0; i < n; i++) { const c = coin(k, k.root, 7); tf(c, 278 + i * 18, y); }
    return y;
  });
  const cross = el('path', { d: 'M 212 64 L 370 92', stroke: pal.red, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': 170, 'stroke-dashoffset': 170 });
  const ring = el('rect', { x: 210, y: 120, width: 160, height: 36, rx: 10, fill: 'none', stroke: pal.green, 'stroke-width': 4, opacity: 0 });
  const C = k.buddy({ x: 70, y: FY, scale: 0.84, color: pal.coral, dark: pal.coralDark });
  const A = k.buddy({ x: 130, y: FY, scale: 0.84 });
  // リュック
  const packs = [A, C].map((b) => { const p = el('rect', { x: -40, y: -64, width: 16, height: 34, rx: 6, fill: pal.yellowDark }, b.body); b.body.insertBefore(p, b.body.firstChild); return p; });
  // 財布（中にコイン2枚）
  const wallet = g({});
  el('rect', { x: -14, y: -10, width: 28, height: 18, rx: 4, fill: pal.coffee }, wallet);
  [-6, 6].forEach((x) => { const c = coin(k, wallet, 5); tf(c, x, -14); });
  const xa = path([[3.2, 130], [4.3, 300]]), xc = path([[3.3, 70], [4.4, 236]]);
  return {
    update(t) {
      const show = easeOut(seg(t, 0.3, 0.7));
      walk(A, xa, t, { look: 0.6, mood: t < 1.6 ? 'flat' : 'grin' });
      walk(C, xc, t, { look: 0.6, mood: t < 1.6 ? 'flat' : 'grin' });
      if (t < 3.2) {
        const point = easeOut(seg(t, 1.9, 2.3)) * (1 - easeOut(seg(t, 2.9, 3.2)));
        A.pose({ armR: lerp(lerp(8, 60, show), reach(A, 0.84, 'R', 214, 140), point), armL: 8 });
        C.pose({ armR: 30 * hump(seg(t, 2.4, 3.0)), lean: 6 * hump(seg(t, 2.4, 3.0)) });
      }
      const h = held(k, A, 0.84, wallet, 'R', 0, 30);
      const wv = t > 0.3 && t < 1.9;
      tf(wallet, h.x, h.y - 2, 0, wv ? 1 : 0.001);
      cross.setAttribute('stroke-dashoffset', 170 * (1 - easeOut(seg(t, 1.2, 1.6))));
      ring.setAttribute('opacity', seg(t, 2.1, 2.3));
    }
  };
}
