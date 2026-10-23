// jam：トーストにナイフでいちごジャムを塗り広げる（例文 I spread strawberry jam on my toast.）
// このファイルは「台所・食器」「人」系シーン（u2/u3）の共有ヘルパーも書き出す
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, P, blinkAt, track, face, say } from './bag.js';
import { cue, talk } from './in-common.js';
import { fork } from './restaurant.js';
export { hp, P, blinkAt, track, face, say, cue, talk, fork };

// 手を任意の点へ伸ばす腕（標準の腕を隠して、肩から目標点まで描く）。back=true の腕は体の後ろに描く
export function arms(k, b, S, { col = k.pal.mint, dark = k.pal.mintDark, back = [] } = {}) {
  const mk = (side) => {
    const g = k.g({});
    if (back.includes(side)) b.g.parentNode.insertBefore(g, b.g);
    const l = k.el('line', { stroke: dark, 'stroke-width': 9 * S, 'stroke-linecap': 'round' }, g);
    const h = k.el('circle', { r: 6.5 * S, fill: col, stroke: dark, 'stroke-width': 2.5 * S }, g);
    (side === 'R' ? b.armR : b.armL).a.setAttribute('display', 'none');
    return { l, h, g };
  };
  const A = { R: mk('R'), L: mk('L') };
  return {
    vis(on) { A.R.g.setAttribute('opacity', on ? 1 : 0); A.L.g.setAttribute('opacity', on ? 1 : 0); },
    // 手先を (x, y) に置く。戻り値は手の座標
    to(side, x, y) {
      const s = hp(b, S, side, 0), a = A[side];
      k.set(a.l, { x1: s.x, y1: s.y, x2: x, y2: y }); k.set(a.h, { cx: x, cy: y });
      return { x, y };
    },
    // 腕の角度（pose と同じ向き）で自然な位置に置く
    ang(side, deg) {
      const st = b.state, key = side === 'R' ? 'armR' : 'armL', keep = st[key];
      st[key] = deg; const p = hp(b, S, side, 26); st[key] = keep;
      return this.to(side, p.x, p.y);
    },
    root: (side) => hp(b, S, side, 0)
  };
}
// 台所の背景（壁・窓・棚）＋手前のカウンター。front() は人物の後に呼ぶ。天板の上面は y=TOP
export const TOP = 212;
export function kitchen(k, { mood = 'indoor', wall = '#F4EFE7', tile = true, win = true } = {}) {
  const { el, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood });
  el('rect', { x: 0, y: 0, width: 400, height: 200, fill: wall });
  if (tile) for (let y = 120; y < 196; y += 16) el('line', { x1: 0, y1: y, x2: 400, y2: y, stroke: '#E6DED2', 'stroke-width': 1.2 });
  if (win) { el('rect', { x: 30, y: 30, width: 86, height: 66, rx: 6, fill: mood === 'evening' ? '#F6C9A6' : '#DDEFFA', stroke: '#fff', 'stroke-width': 5 }); el('line', { x1: 73, y1: 30, x2: 73, y2: 96, stroke: '#fff', 'stroke-width': 4 }); }
  el('rect', { x: 268, y: 74, width: 110, height: 6, rx: 3, fill: pal.woodDark });
  [[280, pal.yellow], [306, pal.coral], [332, pal.violet]].forEach(([x, c]) => el('rect', { x, y: 52, width: 18, height: 22, rx: 4, fill: c, opacity: 0.75 }));
  return {
    FY,
    front(color = '#F6D9B3') {
      el('rect', { x: 0, y: TOP - 4, width: 400, height: 8, fill: pal.wood });
      el('rect', { x: 0, y: TOP + 4, width: 400, height: 100, fill: color });
      el('rect', { x: 0, y: TOP + 4, width: 400, height: 3, fill: pal.woodDark, opacity: 0.4 });
      for (let x = 0; x < 400; x += 100) el("rect", { x: x + 5, y: TOP + 12, width: 90, height: 30, rx: 3, fill: 'none', stroke: pal.woodDark, 'stroke-width': 1.5, opacity: 0.5 });
      el('rect', { x: 0, y: 252, width: 400, height: 48, fill: '#E7DCCD' });
    }
  };
}
// 湯気（原点＝出どころ）。set(強さ0..1, t)
export function steam(k, parent, n = 3, h = 26) {
  const ps = [...Array(n)].map(() => k.el('path', { d: `M 0 0 q -5 ${-h / 4} 0 ${-h / 2} t 0 ${-h / 2}`, stroke: '#fff', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, parent || k.root));
  const g = ps[0].parentNode;
  return { set(x, y, a, t) { ps.forEach((p, i) => { const u = (t * 0.7 + i / n) % 1; k.tf(p, x + (i - (n - 1) / 2) * 7, y - u * 10, 0, 1, 0.6 + u * 0.5); p.setAttribute('opacity', (a * hump(u) * 0.9).toFixed(2)); p.setAttribute('stroke', '#DCE4EC'); }); } };
}
// 皿（原点＝底の中心）
export function plateP(k, parent, r = 22, col = '#fff') {
  const g = k.g({}, parent || k.root);
  k.el('ellipse', { cx: 0, cy: -2, rx: r, ry: r * 0.22, fill: col, stroke: '#C9D2DD', 'stroke-width': 1.6 }, g);
  k.el('ellipse', { cx: 0, cy: -3, rx: r * 0.62, ry: r * 0.12, fill: '#EEF2F6' }, g);
  return g;
}
// 器（カップ・グラス・ボウルなど）。液面は set(0..1)。原点＝底の中心
export function vessel(k, parent, { w = 22, h = 24, taper = 0.85, col = '#fff', stroke = '#C9D2DD', liquid = '#8A5A3C', glass = false, handle = 0, foam = false } = {}) {
  const g = k.g({}, parent || k.root), b = w * taper / 2, t = w / 2;
  const shape = `M ${-t} ${-h} L ${-b} 0 L ${b} 0 L ${t} ${-h} Z`;
  if (handle) k.el('path', { d: `M ${t - 2} ${-h * 0.8} q ${handle} 2 ${handle * 0.6} ${h * 0.55} q -2 4 ${-handle * 0.6 - 3} 2`, stroke: glass ? '#B8D8EC' : stroke, 'stroke-width': 3.6, fill: 'none' }, g);
  k.el('path', { d: shape, fill: glass ? 'rgba(200,232,250,0.45)' : col, stroke: glass ? '#A9CDE3' : stroke, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, g);
  if (!glass) {
    // 不透明な器：縁の内側（少し上から見た口）と液面だけを描く
    const ry = Math.max(2.5, w * 0.1);
    k.el('ellipse', { cx: 0, cy: -h, rx: t - 1, ry, fill: '#E3E8EE', stroke, 'stroke-width': 1.4 }, g);
    const sf = k.el('ellipse', { cx: 0, cy: -h, rx: t - 3, ry: ry - 1, fill: liquid }, g);
    return { g, rim: -h, set(q) { q = clamp(q); k.set(sf, { rx: Math.max(0.1, (t - 3) * (0.55 + 0.45 * q)), ry: Math.max(0.1, (ry - 1) * (0.55 + 0.45 * q)), cy: -h + (1 - q) * ry * 0.9, opacity: q > 0.03 ? 1 : 0 }); } };
  }
  const cp = k.clip((c) => k.el('path', { d: shape }, c));
  const lq = k.el('rect', { x: -t, y: 0, width: w, height: 0, fill: liquid, 'clip-path': cp }, g);
  const fm = foam ? k.el('rect', { x: -t, y: 0, width: w, height: 0, fill: '#FFF8E6', 'clip-path': cp }, g) : null;
  k.el('path', { d: `M ${-t + 4} ${-h + 4} L ${-b + 3} -4`, stroke: '#fff', 'stroke-width': 2, opacity: 0.7 }, g);
  return { g, rim: -h, set(q, fq = 0) { const y = -h * clamp(q); k.set(lq, { y, height: -y }); if (fm) k.set(fm, { y: y - 5 * fq, height: 5 * fq }); } };
}
// ナイフ（原点＝握り、+y が刃先）
export function knifeP(k, parent, L = 26) {
  const g = k.g({}, parent || k.root);
  k.el('rect', { x: -2.6, y: -10, width: 5.2, height: 13, rx: 2, fill: '#6E5A4C' }, g);
  k.el('path', { d: `M -2.4 3 L 2.4 3 L 2.4 ${L} Q 0 ${L + 3} -2.4 ${L - 3} Z`, fill: '#D6DDE6', stroke: '#AEB8C6', 'stroke-width': 1 }, g);
  return g;
}
// スプーン（原点＝握り、+y が先）
export function spoonP(k, parent, s = 1) {
  const g = k.g({}, parent || k.root), c = '#AEB8C6';
  k.el('rect', { x: -1.6, y: -6, width: 3.2, height: 20, rx: 1.5, fill: c }, g);
  k.el('ellipse', { cx: 0, cy: 18, rx: 5, ry: 7, fill: '#C9D2DD', stroke: c, 'stroke-width': 1.2 }, g);
  k.tf(g, 0, 0, 0, s);
  return g;
}
// 食パン（原点＝底の中心）。jam(0..1) で塗った範囲
export function toastP(k, parent) {
  const g = k.g({}, parent || k.root);
  k.el('path', { d: 'M -20 0 L -20 -24 Q -24 -36 -10 -38 Q 0 -44 10 -38 Q 24 -36 20 -24 L 20 0 Z', fill: '#C98A4E' }, g);
  k.el('path', { d: 'M -16 -3 L -16 -25 Q -19 -33 -8 -34 Q 0 -39 8 -34 Q 19 -33 16 -25 L 16 -3 Z', fill: '#F3D9A4' }, g);
  const cp = k.clip((c) => k.el('path', { d: 'M -15 -5 L -15 -25 Q -17 -32 -8 -33 Q 0 -37 8 -33 Q 17 -32 15 -25 L 15 -5 Z' }, c));
  const j = k.el('rect', { x: -16, y: -36, width: 0, height: 34, fill: '#D93A55', 'clip-path': cp }, g);
  return { g, set(q) { j.setAttribute('width', 32 * clamp(q)); } };
}
// 鍋（原点＝底の中心）。両側に取っ手
export function potP(k, parent, w = 70, h = 46, col = '#8E9BAD', dark = '#6D7A8C') {
  const g = k.g({}, parent || k.root);
  k.el('rect', { x: -w / 2 - 10, y: -h + 8, width: 12, height: 6, rx: 3, fill: dark }, g);
  k.el('rect', { x: w / 2 - 2, y: -h + 8, width: 12, height: 6, rx: 3, fill: dark }, g);
  k.el('path', { d: `M ${-w / 2} ${-h} L ${-w / 2} -6 Q ${-w / 2} 0 ${-w / 2 + 6} 0 L ${w / 2 - 6} 0 Q ${w / 2} 0 ${w / 2} -6 L ${w / 2} ${-h} Z`, fill: col }, g);
  k.el('ellipse', { cx: 0, cy: -h, rx: w / 2, ry: 5, fill: '#4E5968' }, g);
  k.el('rect', { x: -w / 2 + 8, y: -h + 10, width: 6, height: h - 18, rx: 3, fill: '#fff', opacity: 0.25 }, g);
  return g;
}
// コンロ（天板に置く。中心 x、上面 y）。set(火の強さ, t)
export function stove(k, x, y, w = 110) {
  const g = k.g({});
  k.el('rect', { x: x - w / 2, y: y - 3, width: w, height: 8, rx: 3, fill: '#3A4250' }, g);
  const fl = [-14, -5, 5, 14].map((dx) => k.el('path', { d: 'M 0 0 Q -4 -6 0 -12 Q 4 -6 0 0 Z', fill: '#5B8CFF' }, g));
  return { g, set(a, t) { fl.forEach((f, i) => { const s = a * (0.8 + 0.25 * Math.sin(t * 17 + i * 2)); k.tf(f, x + [-14, -5, 5, 14][i], y - 3, 0, 1, Math.max(0.001, s)); f.setAttribute('opacity', a > 0.02 ? 1 : 0); }); } };
}
// 湯の泡（鍋の水面）。set(強さ, t, x, y, w)
export function bubbles(k, n = 6) {
  const cs = [...Array(n)].map(() => k.el('circle', { r: 3, fill: '#fff', opacity: 0 }));
  return (a, t, x, y, w) => cs.forEach((c, i) => { const u = (t * 1.6 + i * 0.37) % 1; k.set(c, { cx: x + ((i * 37) % w) - w / 2 + 4, cy: y - u * 4, r: 1 + 3 * hump(u), opacity: a * hump(u) }); });
}
// 髪・ひげ・帽子などの小物を体に付ける（顔と一緒に動く）
export function wear(k, b, fn) { const g = k.g({}); b.body.insertBefore(g, b.body.children[4]); fn(g); return g; }
export const grayHair = (k, b) => wear(k, b, (g) => { k.el('path', { d: 'M -30 -60 Q -32 -86 0 -86 Q 32 -86 30 -60 Q 24 -74 0 -74 Q -24 -74 -30 -60 Z', fill: '#E4E7EC' }, g); });
export const bun = (k, b, c = '#E4E7EC') => wear(k, b, (g) => { k.el('circle', { cx: 0, cy: -88, r: 10, fill: c }, g); k.el('path', { d: 'M -30 -62 Q -32 -84 0 -84 Q 32 -84 30 -62 Q 16 -74 0 -72 Q -16 -74 -30 -62 Z', fill: c }, g); });
export const glasses = (k, b) => wear(k, b, (g) => { k.el('path', { d: 'M -17 -54 a 7 7 0 1 0 14 0 a 7 7 0 1 0 -14 0 M 3 -54 a 7 7 0 1 0 14 0 a 7 7 0 1 0 -14 0 M -3 -55 h 6', stroke: k.pal.ink, 'stroke-width': 1.8, fill: 'none' }, g); });
export const mustache = (k, b, c = '#5A4A42') => wear(k, b, (g) => { k.el('path', { d: 'M -9 -46 Q -4 -50 0 -46 Q 4 -50 9 -46 Q 4 -43 0 -45 Q -4 -43 -9 -46 Z', fill: c }, g); });
export const tie = (k, b, c = '#4A6FD0') => wear(k, b, (g) => { k.el('path', { d: 'M -4 -32 L 4 -32 L 6 -10 L 0 -4 L -6 -10 Z', fill: c }, g); });
export const bow = (k, b, c = '#F2685B') => wear(k, b, (g) => { k.el('path', { d: 'M 0 -84 L -12 -92 L -12 -78 Z M 0 -84 L 12 -92 L 12 -78 Z', fill: c }, g); k.el('circle', { cx: 0, cy: -84, r: 3.5, fill: c }, g); });
// 床に立つ子ども・大人を簡単に作る（色は coral / blue）
export const C = (k, c) => (c === 'blue' ? { color: k.pal.blue, dark: k.pal.blueDark } : c === 'violet' ? { color: k.pal.violet, dark: '#8569D9' } : { color: k.pal.coral, dark: k.pal.coralDark });

export const meta = { duration: 4.2, beats: [[0, 'ジャムをすくう'], [1.3, 'パンに塗る'], [3.4, '塗れた']] };

export function create(k) {
  const { el, pal } = k, S = 1.1;
  const kit = kitchen(k);
  const b = k.buddy({ x: 190, y: kit.FY, scale: S });
  kit.front();
  const plate = plateP(k, null, 34); k.tf(plate, 250, TOP + 4);
  const toast = toastP(k); k.tf(toast.g, 250, TOP);
  // ジャムの瓶（ふたは横に置いてある）
  const jar = vessel(k, null, { w: 30, h: 36, taper: 1, glass: true, liquid: '#D93A55' }); k.tf(jar.g, 140, TOP + 2); jar.set(0.75);
  el('ellipse', { cx: 108, cy: TOP + 1, rx: 14, ry: 3.5, fill: pal.red });
  el('rect', { x: 128, y: TOP - 22, width: 24, height: 12, rx: 2, fill: '#fff', opacity: 0.9 });
  el('circle', { cx: 140, cy: TOP - 16, r: 4, fill: '#E04A63' });
  const knife = knifeP(k);
  const blob = el('ellipse', { rx: 4, ry: 2.4, fill: '#D93A55' });
  const A = arms(k, b, S, { back: ['L'] });
  const path = track([[0, 205, 200], [0.5, 140, 142], [0.9, 140, 160], [1.2, 160, 144], [1.6, 214, 164], [2.1, 236, 164], [2.5, 212, 176], [2.9, 236, 178], [3.3, 222, 184], [3.8, 214, 174]]);
  const rotK = track([[0, -40, 0], [0.5, 0, 0], [0.9, 0, 0], [1.3, -55, 0], [3.3, -60, 0], [3.8, -30, 0]]);
  return {
    update(t) {
      P(b, { lean: 6, look: 0.4, blink: blinkAt(t), mood: t > 3.4 ? 'grin' : 'smile' });
      const h = A.to('R', path(t).x, path(t).y);
      A.to('L', 226, 214);
      // 刃先は常に下向き・少し前へ
      const r = rotK(t).x; k.tf(knife, h.x, h.y, r, 1.3, 1.3);
      const loaded = t > 0.9 && t < 1.7;
      blob.setAttribute('opacity', loaded ? 1 : 0);
      const a = (r * Math.PI) / 180; k.tf(blob, h.x - Math.sin(a) * 29, h.y + Math.cos(a) * 29);
      toast.set(easeInOut(seg(t, 1.6, 3.3)));
      jar.set(t > 0.9 ? 0.68 : 0.75);
    }
  };
}
// 口のおおよその位置（ワールド座標）
export function mouthAt(b, S) { const st = b.state; return { x: st.x + st.look * 6 * S * st.facing, y: st.y + (-53 - st.lift) * S }; }
// 持った器を口へ運ぶ：q=0 で base0（底の位置）に置いたまま → 1 で縁を口に当てて傾ける。器の原点は底。戻り値 手の座標
const rot = (a, x, y) => ({ x: x * Math.cos(a) - y * Math.sin(a), y: x * Math.sin(a) + y * Math.cos(a) });
export function sip(k, A, b, S, node, side, base0, q, { tilt = 60, sc = 1, w = 24, h = 34 } = {}) {
  const f = b.state.facing, m = mouthAt(b, S), e = easeInOut(clamp(q));
  const aD = -tilt * e * f, a = (aD * Math.PI) / 180, aT = (-tilt * f * Math.PI) / 180;
  const r = rot(aT, -w / 2 * sc * f, -h * sc), tgt = { x: m.x + 3 * f - r.x, y: m.y + 1 - r.y };
  const B = { x: lerp(base0.x, tgt.x, e), y: lerp(base0.y, tgt.y, e) };
  k.tf(node, B.x, B.y, aD, sc, sc);
  const g = rot(a, (w / 2 * sc + 3) * f, -h * 0.45 * sc);
  return A.to(side, B.x + g.x, B.y + g.y);
}
// 紙パック（原点＝底の中心）
export function carton(k, parent, col = '#FFA53A', label = '#FFE2B8') {
  const g = k.g({}, parent || k.root);
  k.el('path', { d: 'M -11 0 L -11 -34 L -6 -42 L 6 -42 L 11 -34 L 11 0 Z', fill: '#fff', stroke: '#D9DFE7', 'stroke-width': 1.5 }, g);
  k.el('rect', { x: -11, y: -28, width: 22, height: 20, fill: col }, g);
  k.el('circle', { cx: 0, cy: -18, r: 6, fill: label }, g);
  k.el('rect', { x: -2, y: -46, width: 6, height: 5, fill: col }, g);
  return g;
}
export function orange(k, x, y, r = 9, parent) {
  const g = k.g({}, parent || k.root);
  k.el('circle', { cx: x, cy: y - r, r, fill: '#FFA53A' }, g); k.el('ellipse', { cx: x + 2, cy: y - 2 * r + 1, rx: 3, ry: 1.6, fill: '#59C27A' }, g);
  return g;
}
// 正面から見た食卓（人物の後に呼ぶと腰から下を隠す）。上面 y=top
export function dinner(k, x0, x1, top = 200, cloth = '#fff', edge = '#F2685B') {
  const { el, pal } = k;
  el('rect', { x: x0, y: top - 5, width: x1 - x0, height: 10, rx: 3, fill: '#F7F2EA' });
  el('path', { d: `M ${x0} ${top + 4} H ${x1} V ${top + 40} Q ${x1 - 10} ${top + 46} ${x1 - 20} ${top + 40} H ${x0 + 20} Q ${x0 + 10} ${top + 46} ${x0} ${top + 40} Z`, fill: cloth });
  el('rect', { x: x0, y: top + 30, width: x1 - x0, height: 4, fill: edge, opacity: 0.6 });
  el('rect', { x: x0 + 14, y: top + 40, width: 8, height: Math.max(1, 236 - top - 40), fill: pal.woodDark });
  el('rect', { x: x1 - 22, y: top + 40, width: 8, height: Math.max(1, 236 - top - 40), fill: pal.woodDark });
  k.shadow((x0 + x1) / 2, 238, (x1 - x0) / 2, 5);
}
// ポット（原点＝取っ手の握り、注ぎ口は右）。注ぎ口の先は (34, -14)
export function teapot(k, parent, col = '#fff', band = '#6AA8F7') {
  const g = k.g({}, parent || k.root);
  k.el('path', { d: 'M 0 -18 Q -8 -10 0 -2', stroke: '#C9D2DD', 'stroke-width': 4, fill: 'none' }, g);
  k.el('path', { d: 'M 18 -6 Q 28 -8 34 -16', stroke: '#C9D2DD', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, g);
  k.el('ellipse', { cx: 12, cy: -6, rx: 14, ry: 12, fill: col, stroke: '#C9D2DD', 'stroke-width': 1.6 }, g);
  k.el('path', { d: 'M -2 -6 H 26', stroke: band, 'stroke-width': 3 }, g);
  k.el('circle', { cx: 12, cy: -19, r: 3, fill: band }, g);
  return g;
}
// ワイングラス（原点＝台座）。set(液面)
export function wineGlass(k, parent, liquid = '#9B2D4A') {
  const g = k.g({}, parent || k.root);
  k.el('ellipse', { cx: 0, cy: 0, rx: 7, ry: 1.8, fill: '#C8E8FA', stroke: '#A9CDE3' }, g);
  k.el('rect', { x: -1, y: -14, width: 2, height: 14, fill: '#A9CDE3' }, g);
  const sh = 'M -9 -32 Q -10 -16 0 -14 Q 10 -16 9 -32 Z';
  k.el('path', { d: sh, fill: 'rgba(200,232,250,0.45)', stroke: '#A9CDE3', 'stroke-width': 1.5 }, g);
  const cp = k.clip((c) => k.el('path', { d: sh }, c));
  const lq = k.el('rect', { x: -10, y: -14, width: 20, height: 0, fill: liquid, 'clip-path': cp }, g);
  return { g, set(q) { const y = -14 - 18 * clamp(q); k.set(lq, { y, height: -14 - y + 1 }); } };
}
// 吹き出しにアイコンを入れる（look-over の say を使う）
export function iconSay(k, w, h, tail, fn) { const s = say(k, w, h, tail); fn(s.g); return s; }
// スプーン・フォークで「器 → 口」を往復する手の位置と道具の向き。m=0 器、1 口
export function scoop(b, S, from, m) {
  const mo = mouthAt(b, S), f = b.state.facing, e = easeInOut(clamp(m));
  return { x: lerp(from.x, mo.x + 24 * S * f, e), y: lerp(from.y, mo.y + 4, e), rot: lerp(15 * f, 82 * f, e) };
}
export function eatCycle(t, t0, per, n) {
  if (t < t0 || t > t0 + per * n) return { m: 0, i: t < t0 ? -1 : n, q: 0 };
  const i = Math.floor((t - t0) / per), q = ((t - t0) / per) % 1;
  return { m: q < 0.15 ? 0 : q < 0.45 ? easeInOut((q - 0.15) / 0.3) : q < 0.65 ? 1 : 1 - easeInOut((q - 0.65) / 0.3), i, q };
}
// 位置の時刻表 [[t, x], ...] → 位置関数
export const keys = (pts) => (t) => { if (t <= pts[0][0]) return pts[0][1]; for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const [a, x0] = pts[i - 1], [c, x1] = pts[i]; return lerp(x0, x1, easeInOut(seg(t, a, c))); } return pts[pts.length - 1][1]; };
// ハート（原点＝中心）
export function heartP(k, parent, c = '#F2685B', s = 1) { const g = k.g({}, parent || k.root); k.el('path', { d: 'M 0 6 C -12 -2 -8 -12 0 -5 C 8 -12 12 -2 0 6 Z', fill: c, transform: `scale(${s})` }, g); return g; }
// 音符
export function noteP(k, parent, c = '#A58BF3') { const g = k.g({}, parent || k.root); k.el('ellipse', { cx: 0, cy: 0, rx: 5, ry: 4, fill: c, transform: 'rotate(-20)' }, g); k.el('path', { d: 'M 4 -1 V -18 L 12 -14', stroke: c, 'stroke-width': 2.4, fill: 'none' }, g); return g; }
export const pops = (p) => (p <= 0 ? 0.001 : p >= 1 ? 1 : 1 + 2.6 * Math.pow(p - 1, 3) + 1.6 * Math.pow(p - 1, 2));
