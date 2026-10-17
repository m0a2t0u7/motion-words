// get in：運転席から「乗って！」と呼ばれる→まめが後ろのドアを開けて車に乗り込み、ドアが閉まって窓から座っているのが見える（例文 Get in the car. We're late.）
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

export const meta = { duration: 4.0, beats: [[0, '車の外'], [1.5, 'ドアを開ける'], [3.2, '乗り込んだ']] };

export function create(k) {
  const { el, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY + 4, width: 400, height: 40, fill: '#E3E8EE' });
  el('rect', { x: 20, y: 150, width: 70, height: 86, fill: '#E8EEF5' });
  el('rect', { x: 320, y: 170, width: 70, height: 66, fill: '#EEF1F8' });
  const C = mkCar(k, FY, 0);
  const driver = C.bust(230, pal.coral, pal.coralDark);
  const seated = C.bust(179, pal.mint, pal.mintDark);
  const w = k.buddy({ x: 70, y: FY + 16, scale: 0.8 });
  const ex = k.text(232, 98, '!', { 'font-size': 26, fill: pal.red });
  const xf = (t) => t < 1.3 ? lerp(70, 160, easeInOut(seg(t, 0.1, 1.3))) : lerp(160, 178, easeInOut(seg(t, 2.0, 2.6)));
  return {
    update(t) {
      C.open(easeInOut(seg(t, 1.45, 2.0)) * (1 - easeInOut(seg(t, 2.85, 3.4))));
      const p = gait(xf, t, 70);
      const inn = easeInOut(seg(t, 2.0, 2.6));
      w.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: p.armR, lean: p.lean, look: 0.7, mood: 'smile' });
      if (t > 1.2 && t < 2.0) w.pose({ armR: lerp(8, reach(w, 0.8, 'R', 195, 192), easeOut(seg(t, 1.2, 1.5))) });
      const y = lerp(FY + 16, 212, inn), s = lerp(0.8, 0.46, inn);
      w.g.setAttribute('transform', `translate(${p.x.toFixed(2)} ${y.toFixed(2)}) scale(${s.toFixed(3)})`);
      w.g.setAttribute('opacity', 1 - seg(t, 2.35, 2.65));
      seated.g.setAttribute('opacity', seg(t, 2.5, 2.8));
      seated.pose({ mood: 'smile', look: 0.5, armR: 8 });
      const wave = 118 + 26 * Math.sin(t * 9);
      driver.pose({ armR: wave, armL: 8, mood: 'open', look: -0.5, facing: 1 });
      ex.setAttribute('opacity', t < 2.4 ? (Math.sin(t * 12) > -0.3 ? 1 : 0.2) : 0);
    }
  };
}
