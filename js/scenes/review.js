// review：テスト前に、自分のノートをページを戻しながら見直す（例文 I reviewed my notes before the test.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { calendar } from './so-far-so-good.js';

// 開いたノート（中心＝背の下）。flip(p, dir) でページを1枚めくる
function notebook(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('rect', { x: -46, y: -36, width: 92, height: 40, rx: 4, fill: pal.blueDark }, g);
  const page = (x) => {
    const p = k.g({}, g);
    k.el('rect', { x, y: -34, width: 42, height: 36, rx: 2, fill: '#fff' }, p);
    [-26, -18, -10, -2].forEach((y, i) => k.el('line', { x1: x + 5, x2: x + (i % 2 ? 30 : 37), y1: y, y2: y, stroke: i === 0 ? pal.coral : pal.blue, 'stroke-width': 2, 'stroke-linecap': 'round' }, p));
    return p;
  };
  page(-44); page(2);
  const leaf = k.g({}, g); page(2).remove();
  const lf = k.el('rect', { x: 0, y: -34, width: 42, height: 36, rx: 2, fill: '#F4F7FB', stroke: pal.line, 'stroke-width': 1 }, leaf);
  k.el('line', { x1: 0, y1: -36, x2: 0, y2: 4, stroke: pal.blueDark, 'stroke-width': 2 }, g);
  return { g, flip(p) { k.tf(leaf, 0, 0, 0, Math.max(0.001, Math.abs(Math.cos(p * Math.PI))) * (p < 0.5 ? -1 : 1), 1); leaf.setAttribute('opacity', p > 0 && p < 1 ? 1 : 0); void lf; } };
}

export const meta = { duration: 4.3, beats: [[0, 'テスト前'], [1.0, 'ノートを見直す'], [3.4, '準備できた']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.05, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 250, y: 40, width: 90, height: 66, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 295, y1: 40, x2: 295, y2: 106, stroke: '#fff', 'stroke-width': 4 });
  // 壁のカレンダー：明日に TEST の印
  const cal = calendar(k, 80, 48, 54);
  cal.set('12');
  el('circle', { cx: 80, cy: 82, r: 17, fill: 'none', stroke: pal.red, 'stroke-width': 3 });
  k.text(80, 118, 'TEST', { 'font-size': 13, fill: pal.red });
  // 本棚
  el('rect', { x: 300, y: 130, width: 80, height: 106, fill: pal.wood });
  [150, 186].forEach((y, r) => [0, 1, 2, 3].forEach((i) => el('rect', { x: 306 + i * 17, y: y - 26 + (i % 2) * 4, width: 13, height: 26 - (i % 2) * 4, rx: 2, fill: [pal.blue, pal.coral, pal.yellow, pal.violet][(i + r) % 4] })));
  el('rect', { x: 300, y: 150, width: 80, height: 5, fill: pal.woodDark }); el('rect', { x: 300, y: 186, width: 80, height: 5, fill: pal.woodDark });
  k.shadow(340, FY + 1, 44, 4);
  const b = k.buddy({ x: 196, y: FY, scale: S });
  const nb = notebook(k);
  return {
    update(t) {
      const up = easeOut(seg(t, 0.1, 0.7)), close = 0, done = easeInOut(seg(t, 3.4, 3.9));
      // 2回ページを戻して読み返す
      const f1 = easeInOut(seg(t, 1.1, 1.5)), f2 = easeInOut(seg(t, 2.2, 2.6));
      const read = Math.sin(t * 5) * (t > 0.7 && t < 3.4 ? 1 : 0);
      P(b, { armL: lerp(10, 34, up) * (1 - close) + 10 * close, armR: lerp(10, 34, up) * (1 - close) + 10 * close, lean: 6 * (1 - close),
        look: lerp(0.15 + 0.25 * read, -0.9, done), blink: blinkAt(t), mood: t > 3.5 ? 'grin' : 'smile' });
      const L = hp(b, S, 'L'), R = hp(b, S, 'R');
      const cx = (L.x + R.x) / 2, cy = Math.max((L.y + R.y) / 2 + 12, 206) - 3 * done;
      // 閉じたノートは机に置く
      const x = lerp(cx, 168, close), y = lerp(cy, 192, close);
      tf(nb.g, x, y, 0, 0.98, 0.9);
      const fp = t < 1.8 ? f1 : f2;
      nb.flip(1 - fp);
      b.body.children[3].setAttribute('transform', `translate(${(1.5 * read * (1 - done) - 5 * done).toFixed(2)} ${(4 * (1 - done) * up).toFixed(2)})`);
    }
  };
}
