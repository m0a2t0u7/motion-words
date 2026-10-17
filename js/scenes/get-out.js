// get out：駅に着いた車の中に座っている→ドアが開き、まめが降りて、駅へ向かって歩き出す（例文 She got out of the car at the station.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
// 手先（腕の先）の正確な座標。体の傾き・つぶれ・向きを反映する
function hp(b, s, side = 'R', len = 28) {
  const st = b.state, a = rad(side === 'R' ? -st.armR : st.armL);
  let x = (side === 'R' ? 27 : -27) - len * Math.sin(a), y = -46 + len * Math.cos(a);
  x *= 2 - st.squash; y *= st.squash;
  const l = rad(st.lean), c = Math.cos(l), sn = Math.sin(l);
  return { x: st.x + (x * c - y * sn) * st.facing * s, y: st.y + (x * sn + y * c - 10 - st.lift) * s };
}
// 指定の点へ手を伸ばすための腕の角度
function reach(b, s, side, tx, ty) {
  const st = b.state, o = hp(b, s, side, 0);
  const phi = deg(Math.atan2(-(tx - o.x) * st.facing, ty - o.y));
  return side === 'R' ? st.lean - phi : phi - st.lean;
}
const faceAt = (b, dx, dy = 0) => b.body.children[3].setAttribute('transform', `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
const legsOf = (b) => b.g.children[1].children;
// 位置の関数 xf(t) から歩行の位相と腕振りを作る（止まると脚をそろえる）
function gait(xf, t, x0, amp = 18, kf = 0.107) {
  const x = xf(t), v = Math.abs(xf(t + 0.02) - xf(t - 0.02)) / 0.04;
  const ph = Math.abs(x - x0) * kf, m = clamp(v / 25);
  const w = lerp(Math.round(ph / Math.PI) * Math.PI, ph, m);
  return { x, walk: w, armL: 8 + Math.sin(w) * amp * m, armR: 8 - Math.sin(w) * amp * m, lean: 3 * m, m };
}
function clockFace(k, x, y, r, h, m, parent) {
  const c = k.g({}, parent); k.tf(c, x, y);
  k.el('circle', { r, fill: '#fff', stroke: k.pal.ink, 'stroke-width': 3 }, c);
  for (let i = 0; i < 12; i++) { const a = rad(i * 30); k.el('line', { x1: Math.sin(a) * (r - 5), y1: -Math.cos(a) * (r - 5), x2: Math.sin(a) * (r - 2.5), y2: -Math.cos(a) * (r - 2.5), stroke: k.pal.sub, 'stroke-width': 1.8 }, c); }
  const hand = (ang, len, w) => { const a = rad(ang); k.el('line', { x1: 0, y1: 0, x2: Math.sin(a) * len, y2: -Math.cos(a) * len, stroke: k.pal.ink, 'stroke-width': w, 'stroke-linecap': 'round' }, c); };
  hand((h % 12) * 30 + m * 0.5, r * 0.5, 3.2); hand(m * 6, r * 0.75, 2.2);
  return c;
}
function tree(k, x, y, s = 1, parent) {
  const t = k.g({}, parent); k.tf(t, x, y, 0, s);
  k.shadow(0, 0, 26, 5, t);
  k.el('rect', { x: -5, y: -44, width: 10, height: 44, rx: 4, fill: k.pal.woodDark }, t);
  k.el('circle', { cx: 0, cy: -62, r: 30, fill: '#7FD3A0' }, t);
  k.el('circle', { cx: -16, cy: -48, r: 20, fill: '#6BC48F' }, t);
  k.el('circle', { cx: 18, cy: -50, r: 21, fill: '#6BC48F' }, t);
  return t;
}

function mkCar(k, FY, dx) {
  const { el, g, tf, pal } = k;
  const root = g({}); tf(root, dx, 0);
  const VD = '#8970DC';
  k.shadow(200, FY + 2, 118, 8, root);
  el('rect', { x: 96, y: 164, width: 208, height: 48, rx: 16, fill: pal.violet }, root);
  el('path', { d: 'M 126 168 L 150 122 L 254 122 L 286 168 Z', fill: pal.violet, stroke: pal.violet, 'stroke-width': 4, 'stroke-linejoin': 'round' }, root);
  el('rect', { x: 156, y: 130, width: 46, height: 30, rx: 5, fill: '#D4EBF8' }, root);
  el('rect', { x: 208, y: 130, width: 44, height: 30, rx: 5, fill: '#D4EBF8' }, root);
  el('circle', { cx: 298, cy: 184, r: 6, fill: pal.yellow }, root);
  el('rect', { x: 96, y: 178, width: 8, height: 12, rx: 3, fill: pal.red }, root);
  el('line', { x1: 150, y1: 128, x2: 150, y2: 210, stroke: VD, 'stroke-width': 2 }, root);
  const opening = el('rect', { x: 150, y: 160, width: 55, height: 52, fill: '#2F3650', opacity: 0 }, root);
  const clipUrl = k.clip((cp) => { el('rect', { x: 156, y: 130, width: 46, height: 30, rx: 5 }, cp); el('rect', { x: 208, y: 130, width: 44, height: 30, rx: 5 }, cp); });
  const ins = g({ 'clip-path': clipUrl }, root);
  const door = g({}, root);
  el('path', { d: 'M -55 0 H 0 V 88 H -55 Z M -49 6 H -3 V 36 H -49 Z', fill: pal.violet, 'fill-rule': 'evenodd', stroke: VD, 'stroke-width': 2 }, door);
  el('rect', { x: -16, y: 62, width: 11, height: 4, rx: 2, fill: '#fff' }, door);
  [136, 262].forEach((cx) => { const w = g({}, root); tf(w, cx, FY - 19); el('path', { d: 'M -24 0 A 24 24 0 0 1 24 0 Z', fill: '#2A3242', transform: 'translate(0 -4)' }, w); el('circle', { r: 18, fill: '#39414F' }, w); el('circle', { r: 8, fill: '#C9D1DC' }, w); });
  const open = (p) => { tf(door, 205, 124, 0, lerp(1, 0.2, p), 1); opening.setAttribute('opacity', p > 0.02 ? 1 : 0); };
  open(0);
  const bust = (x, color, dark) => { const b = k.buddy({ parent: ins, x, y: 162, scale: 0.4, color, dark }); b.g.children[0].setAttribute('display', 'none'); return b; };
  return { root, ins, open, bust };
}

export const meta = { duration: 4.0, beats: [[0, '車の中'], [1.5, 'ドアから降りる'], [3.2, '駅へ向かう']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY + 4, width: 400, height: 40, fill: '#E3E8EE' });
  // 駅
  el('rect', { x: 0, y: 120, width: 104, height: FY - 120, fill: '#EEF2F8' });
  el('rect', { x: 0, y: 108, width: 112, height: 16, rx: 4, fill: pal.blue });
  el('rect', { x: 34, y: 168, width: 40, height: FY - 168, rx: 3, fill: '#56607A' });
  el('rect', { x: 24, y: 130, width: 58, height: 30, rx: 8, fill: pal.blueDark });
  const tr = g({}); tf(tr, 53, 145);
  el('rect', { x: -14, y: -9, width: 28, height: 16, rx: 5, fill: '#fff' }, tr);
  el('rect', { x: -10, y: -5, width: 8, height: 6, rx: 1, fill: pal.blueDark }, tr);
  el('rect', { x: 2, y: -5, width: 8, height: 6, rx: 1, fill: pal.blueDark }, tr);
  el('circle', { cx: -8, cy: 10, r: 2.5, fill: '#fff' }, tr);
  el('circle', { cx: 8, cy: 10, r: 2.5, fill: '#fff' }, tr);
  const C = mkCar(k, FY, 40);
  const driver = C.bust(230, pal.coral, pal.coralDark);
  const seated = C.bust(179, pal.mint, pal.mintDark);
  const w = k.buddy({ x: 218, y: 212, scale: 0.46, facing: -1 });
  const xf = (t) => t < 2.2 ? lerp(220, 200, easeInOut(seg(t, 1.3, 2.2))) : lerp(200, 112, easeInOut(seg(t, 2.5, 3.9)));
  return {
    update(t) {
      C.open(easeInOut(seg(t, 0.8, 1.35)) * (1 - easeInOut(seg(t, 2.3, 2.8))));
      seated.g.setAttribute('opacity', 1 - seg(t, 1.1, 1.35));
      seated.pose({ mood: 'smile', look: 0.5 });
      driver.pose({ armR: 8 + 30 * Math.max(0, Math.sin(t * 6)) * 0 + 100 + 20 * Math.sin(t * 8), armL: 8, mood: 'smile', look: 0.5 });
      const out = easeInOut(seg(t, 1.3, 2.2));
      const p = gait(xf, t, 220);
      const y = lerp(212, FY + 16, out), s = lerp(0.46, 0.8, out);
      w.g.setAttribute('opacity', seg(t, 1.15, 1.4));
      w.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: p.armR, lean: p.lean, look: 0.7, mood: 'smile' });
      w.g.setAttribute('transform', `translate(${p.x.toFixed(2)} ${y.toFixed(2)}) scale(${s.toFixed(3)})`);
    }
  };
}
