// get on with：おしゃべりしていた2人が話をやめ、それぞれの机で書類仕事を進める（例文 Let's stop talking and get on with the work.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { hp, held } from './dig.js';
import { bubble } from './weigh.js';
import { papers } from './hand-over.js';

// ===== 共有ヘルパー（このフェーズの他シーンでも使う） =====
// 事務所の背景（窓・ブラインド・観葉植物）。戻り値は床の y
export function officeBg(k, FY = 236, winX = 150) {
  const { el, pal } = k;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 14, width: 400, height: 14, fill: '#ECE6DC' });
  el('rect', { x: winX, y: 40, width: 100, height: 74, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  for (let i = 0; i < 5; i++) el('rect', { x: winX + 4, y: 46 + i * 13, width: 92, height: 4, rx: 2, fill: '#fff', opacity: 0.7 });
  el('path', { d: `M 372 ${FY} L 376 ${FY - 30} L 396 ${FY - 30} L 400 ${FY} Z`, fill: pal.coral });
  [[-8, -52, -18], [2, -60, 0], [12, -50, 20]].forEach(([dx, dy, r]) =>
    el('ellipse', { cx: 386 + dx, cy: FY + dy, rx: 6, ry: 16, fill: pal.green, transform: `rotate(${r} ${386 + dx} ${FY + dy + 12})` }));
  return FY;
}
// 机（人物より後に作ると腰から下を隠す）。天板の y を返す
export function desk(k, x, w, FY = 236, parent) {
  const { el, pal } = k;
  const g = k.g({}, parent);
  k.shadow(x + w / 2, FY + 1, w / 2 + 6, 4, g);
  el('rect', { x, y: FY - 46, width: w, height: 8, rx: 3, fill: pal.wood }, g);
  el('rect', { x: x + 6, y: FY - 38, width: w - 12, height: 25, fill: '#EAD3B0' }, g);
  el('rect', { x: x + 6, y: FY - 38, width: w - 12, height: 4, fill: pal.woodDark, opacity: 0.4 }, g);
  el('rect', { x: x + 6, y: FY - 13, width: 7, height: 13, fill: pal.woodDark }, g);
  el('rect', { x: x + w - 13, y: FY - 13, width: 7, height: 13, fill: pal.woodDark }, g);
  return FY - 46;
}
// パソコンのモニター（原点＝台の下中央）。screen を返す
export function monitor(k, x, y, parent) {
  const { el, pal } = k;
  const g = k.g({}, parent);
  el('rect', { x: x - 6, y: y - 10, width: 12, height: 10, fill: pal.sub }, g);
  el('rect', { x: x - 14, y: y - 3, width: 28, height: 3, rx: 1.5, fill: pal.sub }, g);
  el('rect', { x: x - 26, y: y - 44, width: 52, height: 36, rx: 4, fill: pal.ink }, g);
  const screen = el('rect', { x: x - 22, y: y - 40, width: 44, height: 28, rx: 2, fill: '#9FD0F2' }, g);
  return { g, screen };
}
// 星形（きらめき・痛みの表現など）
export function star(k, parent, r = 9, fill) {
  return k.el('path', { d: `M 0 ${-r} L ${r * 0.33} ${-r * 0.33} L ${r} 0 L ${r * 0.33} ${r * 0.33} L 0 ${r} L ${-r * 0.33} ${r * 0.33} L ${-r} 0 L ${-r * 0.33} ${-r * 0.33} Z`, fill: fill || k.pal.yellow }, parent);
}
// 子犬（原点＝足元中央、右向き）。pose({x, y, wag, hop, look})
export function puppy(k, parent) {
  const { el, g, tf } = k;
  const o = g({}, parent), sh = k.shadow(0, 0, 22, 4, o), body = g({}, o);
  const c = '#E2B07E', d = '#B9824F';
  const tail = el('path', { d: 'M 0 0 Q -10 -10 -6 -18', stroke: d, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, g({}, body));
  [-12, -4, 8, 15].forEach((lx) => el('rect', { x: lx - 3, y: -12, width: 6, height: 12, rx: 3, fill: d }, body));
  el('ellipse', { cx: 2, cy: -18, rx: 20, ry: 11, fill: c }, body);
  const head = g({}, body);
  el('circle', { cx: 0, cy: 0, r: 11, fill: c }, head);
  el('ellipse', { cx: -6, cy: 2, rx: 4.5, ry: 8, fill: d, transform: 'rotate(18 -6 2)' }, head);
  el('ellipse', { cx: 8, cy: 4, rx: 6, ry: 4.5, fill: '#F3D3AE' }, head);
  el('circle', { cx: 12, cy: 2.5, r: 2.2, fill: k.pal.ink }, head);
  el('circle', { cx: 4, cy: -3, r: 2, fill: k.pal.ink }, head);
  const tailG = tail.parentNode;
  const st = { x: 0, y: 0, wag: 0, hop: 0, look: 0, facing: 1 };
  return {
    g: o,
    pose(p) {
      Object.assign(st, p);
      tf(o, st.x, st.y, 0, st.facing, 1);
      tf(sh, 0, 0, 0, 1 - st.hop / 60, 1);
      tf(body, 0, -st.hop);
      tf(tailG, -17, -22, Math.sin(st.wag) * 25);
      tf(head, 18, -30 + st.look, 0);
    }
  };
}
// 硬貨（原点＝中心）
export function coin(k, parent, r = 7) {
  const g = k.g({}, parent);
  k.el('circle', { r, fill: k.pal.yellow, stroke: k.pal.yellowDark, 'stroke-width': 2 }, g);
  k.el('circle', { r: r * 0.5, fill: 'none', stroke: k.pal.yellowDark, 'stroke-width': 1.2 }, g);
  return g;
}
// 吹き出し（weigh.js の bubble に中身用のグループを付ける）。show(x, y, p) で出し入れ
export function say(k, w = 56, h = 34) {
  const b = bubble(k, w, h), inner = k.g({}, b);
  return { g: b, inner, show(x, y, p) { k.tf(b, x, y, 0, Math.max(0.001, easeOut(p)), Math.max(0.001, easeOut(p))); b.setAttribute('opacity', p > 0 ? 1 : 0); } };
}

// ===== get on with 本体 =====
export const meta = { duration: 4.2, beats: [[0, 'おしゃべり'], [1.5, '話をやめる'], [3.2, '仕事を進める']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k);
  const a = k.buddy({ x: 150, y: FY - 6, scale: 1.05 });
  const c = k.buddy({ x: 250, y: FY - 6, scale: 1.05, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const top = desk(k, 56, 120, FY); desk(k, 224, 120, FY);
  const todo = [papers(k, 3), papers(k, 3)], done = [g({}), g({})];
  const pens = [0, 1].map(() => { const p = g({}); el('rect', { x: -1.8, y: 0, width: 3.6, height: 18, rx: 1.5, fill: pal.blueDark }, p); return p; });
  const sheets = [0, 1].map((i) => [0, 1, 2].map((j) => { const s = el('rect', { x: -12, y: -2, width: 24, height: 4, rx: 1, fill: '#fff', stroke: pal.line }, done[i]); return s; }));
  const bA = say(k, 50, 30), bC = say(k, 50, 30);
  [bA, bC].forEach((b) => [-12, 0, 12].forEach((x) => el('circle', { cx: x, cy: 0, r: 3.5, fill: pal.sub }, b.inner)));
  return {
    update(t) {
      const talk = t < 1.4, turn = easeInOut(seg(t, 1.4, 1.8));
      const nod = talk ? Math.sin(t * 9) * 3 : 0;
      a.pose({ facing: turn > 0.5 ? -1 : 1, look: turn > 0.5 ? 0.3 : 0.6, lean: talk ? nod : 10 * turn, mood: talk ? 'open' : 'flat', armR: talk ? 30 + Math.sin(t * 7) * 20 : 100, armL: 10 });
      c.pose({ facing: turn > 0.5 ? 1 : -1, look: turn > 0.5 ? 0.3 : 0.6, lean: talk ? -nod : 10 * turn, mood: talk ? 'grin' : 'flat', armR: talk ? 24 : 100, armL: 10 });
      bA.show(186, 104, talk ? seg(t, 0.1, 0.4) : 1 - seg(t, 1.4, 1.6));
      bC.show(224, 92, talk ? seg(t, 0.5, 0.8) : 1 - seg(t, 1.4, 1.6));
      [[a, 0], [c, 0]].forEach(([b, sx], i) => {
        const w = seg(t, 2.0, 4.0), n = Math.min(3, Math.floor(w * 3.2));
        const h = hp(b, 1.05);
        const wr = t > 2.0 ? Math.sin(t * 22) * 3 : 0;
        tf(pens[i], h.x + wr, h.y - 14, -20 * b.state.facing);
        pens[i].setAttribute('opacity', turn > 0.5 ? 1 : 0);
        tf(todo[i], i ? 302 : 98, top - 9, 0);
        todo[i].setAttribute('opacity', 1 - seg(t, 3.6, 3.8) * 0.8);
        sheets[i].forEach((s, j) => k.set(s, { x: i ? 248 : 128, y: top - 4 - j * 4, opacity: j < n ? 1 : 0 }));
      });
    }
  };
}
