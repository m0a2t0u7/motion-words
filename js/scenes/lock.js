// lock：玄関のかんぬきに鍵を差して回し、施錠する（例文 Don't forget to lock the door.）
import { seg, lerp, easeInOut, easeOut, wobble, clamp } from '../ease.js';
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
// 手先の座標（体の傾き・つぶれ・向きを反映）
function hp(b, s, side = 'R', len = 28) {
  const st = b.state, a = rad(side === 'R' ? -st.armR : st.armL);
  let x = (side === 'R' ? 27 : -27) - len * Math.sin(a), y = -46 + len * Math.cos(a);
  x *= 2 - st.squash; y *= st.squash;
  const l = rad(st.lean), c = Math.cos(l), sn = Math.sin(l);
  return { x: st.x + (x * c - y * sn) * st.facing * s, y: st.y + (x * sn + y * c - 10 - st.lift) * s };
}
// 目標点へ腕を向ける角度
function reach(b, s, side, tx, ty) {
  const st = b.state, o = hp(b, s, side, 0);
  const phi = deg(Math.atan2(-(tx - o.x) * st.facing, ty - o.y));
  return side === 'R' ? st.lean - phi : phi - st.lean;
}
const mix = (a, b, p) => { const f = (h, i) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16); return '#' + [0, 1, 2].map((i) => Math.round(f(a, i) + (f(b, i) - f(a, i)) * p).toString(16).padStart(2, '0')).join(''); };
function gait(xf, t, x0, amp = 18, kf = 0.107) {
  const x = xf(t), v = Math.abs(xf(t + 0.02) - xf(t - 0.02)) / 0.04;
  const ph = Math.abs(x - x0) * kf, m = clamp(v / 25);
  const w = lerp(Math.round(ph / Math.PI) * Math.PI, ph, m);
  return { x, walk: w, armL: 8 + Math.sin(w) * amp * m, armR: 8 - Math.sin(w) * amp * m, lean: 3 * m, m };
}
export const meta = { duration: 3.8, beats: [[0, '鍵を持つ'], [1.5, '鍵を回す'], [2.8, '施錠した']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 28, y: 64, width: 84, height: 64, rx: 6, fill: '#DDEFFA' });
  el('line', { x1: 70, y1: 64, x2: 70, y2: 128, stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 356, y: 78, width: 32, height: 158, fill: '#E2D3BC' });
  el('rect', { x: 364, y: 172, width: 16, height: 14, rx: 2, fill: '#6B5A45' });
  el('rect', { x: 238, y: 84, width: 122, height: 152, rx: 3, fill: pal.wood });
  el('rect', { x: 250, y: 98, width: 98, height: 52, rx: 4, fill: pal.woodDark, opacity: 0.35 });
  el('rect', { x: 250, y: 200, width: 98, height: 26, rx: 4, fill: pal.woodDark, opacity: 0.35 });
  // 錠前（かんぬきは右へ出て枠の穴に入る）
  const bolt = el('rect', { x: 322, y: 173, width: 6, height: 12, rx: 2, fill: '#B9C1CE', stroke: '#8A94A6', 'stroke-width': 1.5 });
  el('rect', { x: 292, y: 160, width: 40, height: 40, rx: 8, fill: '#E4B94A', stroke: '#C99A2E', 'stroke-width': 2 });
  el('circle', { cx: 310, cy: 181, r: 5.5, fill: pal.ink });
  el('rect', { x: 308.5, y: 181, width: 3, height: 9, rx: 1.5, fill: pal.ink });
  const click = g({});
  [[-1, -1], [1, -1], [0, -1.4]].forEach(([a, b]) => el('line', { x1: a * 10, y1: b * 10, x2: a * 17, y2: b * 17, stroke: pal.yellowDark, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, click));
  // 鍵（ぎざぎざの軸と持ち手の輪）
  const key = g({});
  const keyBody = g({}, key);
  el('circle', { cx: 0, cy: 0, r: 9, fill: 'none', stroke: '#7F8AA0', 'stroke-width': 5 }, keyBody);
  el('rect', { x: 6, y: -2.5, width: 30, height: 5, rx: 2, fill: '#B4BDCC', stroke: '#7F8AA0', 'stroke-width': 1 }, keyBody);
  el('rect', { x: 26, y: 2, width: 4, height: 6, fill: '#B4BDCC', stroke: '#7F8AA0', 'stroke-width': 1 }, keyBody);
  el('rect', { x: 32, y: 2, width: 4, height: 4, fill: '#B4BDCC', stroke: '#7F8AA0', 'stroke-width': 1 }, keyBody);
  // 施錠マーク（南京錠）
  const pad = g({}); tf(pad, 298, 52);
  const sh = el('path', { d: 'M -9 0 V -8 a 9 9 0 0 1 18 0 V 0', fill: 'none', stroke: pal.sub, 'stroke-width': 4, 'stroke-linecap': 'round' }, pad);
  const pb = el('rect', { x: -15, y: 0, width: 30, height: 22, rx: 5, fill: pal.sub }, pad);
  const b = k.buddy({ x: 224, y: FY });

  return {
    update(t) {
      const pu = easeInOut(seg(t, 0.5, 1.4));
      const phi = lerp(38, 88, pu) + 3 * wobble(seg(t, 1.4, 1.9), 2, 3) + (t > 1.5 && t < 2.4 ? 2 * Math.sin((t - 1.5) * 9) : 0);
      const th = easeInOut(seg(t, 1.5, 2.3)) * 72;
      const lock = seg(t, 2.25, 2.5);
      b.pose({ armR: phi, armL: 8 + 4 * Math.sin(t * 2), lean: 3 * pu + 3 * seg(t, 1.5, 2.2), look: 0.9, mood: t < 2.4 ? 'flat' : 'smile', squash: 1 + 0.015 * Math.sin(t * 3) - 0.03 * wobble(seg(t, 2.3, 3), 2, 4) });
      const h = hp(b, 1, 'R', 28);
      tf(key, h.x, h.y);
      keyBody.setAttribute('transform', `scale(1 ${Math.cos(rad(th)).toFixed(3)})`);
      bolt.setAttribute('width', 6 + 40 * easeOut(lock));
      click.setAttribute('opacity', t > 2.25 && t < 2.75 ? 1 : 0);
      tf(click, 342, 166, 0, 1 + 0.4 * seg(t, 2.25, 2.7));
      const c = easeOut(seg(t, 2.3, 2.6));
      sh.setAttribute('transform', `translate(0 ${(-9 * (1 - c)).toFixed(2)})`);
      k.set(sh, { stroke: c > 0.5 ? pal.red : pal.sub });
      k.set(pb, { fill: c > 0.5 ? pal.red : pal.sub });
    }
  };
}
