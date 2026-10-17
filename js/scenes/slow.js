import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';
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
function reach(b, s, side, tx, ty) {
  const st = b.state, o = hp(b, s, side, 0);
  const phi = deg(Math.atan2(-(tx - o.x) * st.facing, ty - o.y));
  return side === 'R' ? st.lean - phi : phi - st.lean;
}
const faceAt = (b, dx, dy = 0) => b.body.children[3].setAttribute('transform', `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
function gait(xf, t, x0, amp = 18, kf = 0.107) {
  const x = xf(t), v = Math.abs(xf(t + 0.02) - xf(t - 0.02)) / 0.04;
  const ph = Math.abs(x - x0) * kf, m = clamp(v / 25);
  const w = lerp(Math.round(ph / Math.PI) * Math.PI, ph, m);
  return { x, walk: w, armL: 8 + Math.sin(w) * amp * m, armR: 8 - Math.sin(w) * amp * m, lean: 3 * m, m };
}
function win(k, x, y, w, h, night) {
  const { el, pal } = k;
  el('rect', { x, y, width: w, height: h, rx: 6, fill: night ? '#2F3A5C' : '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: x + w / 2, y1: y, x2: x + w / 2, y2: y + h, stroke: '#fff', 'stroke-width': 4 });
}
const tag = (n, on) => n.setAttribute('opacity', on ? 1 : 0);
export const meta = { duration: 4.6, beats: [[0, '読み込み開始'], [2.0, 'まだ進まない'], [4.0, '待ちくたびれ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 0.95;
  // 壁の時計（時間は進む）
  const ck = g({}); tf(ck, 80, 70);
  el('circle', { r: 26, fill: '#fff', stroke: pal.ink, 'stroke-width': 4 }, ck);
  for (let i = 0; i < 12; i++) { const a = rad(i * 30); el('line', { x1: Math.sin(a) * 20, y1: -Math.cos(a) * 20, x2: Math.sin(a) * 23, y2: -Math.cos(a) * 23, stroke: pal.sub, 'stroke-width': 2 }, ck); }
  const mh = el('line', { x1: 0, y1: 0, x2: 0, y2: -19, stroke: pal.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, ck);
  const hh = el('line', { x1: 0, y1: 0, x2: 0, y2: -12, stroke: pal.ink, 'stroke-width': 3.6, 'stroke-linecap': 'round' }, ck);
  // 机とノートパソコン
  el('rect', { x: 170, y: 190, width: 230, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 184, y: 198, width: 8, height: 38, fill: pal.wood }); el('rect', { x: 380, y: 198, width: 8, height: 38, fill: pal.wood });
  k.shadow(285, 238, 100, 4);
  el('path', { d: 'M 220 190 L 340 190 L 330 196 L 230 196 Z', fill: '#B9C2D0' });
  el('rect', { x: 226, y: 96, width: 108, height: 94, rx: 7, fill: '#5A6480' });
  el('rect', { x: 232, y: 102, width: 96, height: 82, rx: 3, fill: '#fff' });
  // ページ：画像枠と文字行
  el('rect', { x: 240, y: 110, width: 80, height: 42, rx: 3, fill: '#EEF3F8' });
  el('path', { d: 'M 246 146 L 268 126 L 284 140 L 296 130 L 316 146 Z', fill: '#D5E3F0' });
  [160, 168, 176].forEach((y, i) => el('rect', { x: 240, y, width: 80 - i * 20, height: 4, rx: 2, fill: '#E4EAF1' }));
  const fill = el('rect', { x: 240, y: 110, width: 0, height: 42, rx: 3, fill: pal.blue, opacity: 0.55 });
  const bar = g({});
  el('rect', { x: 242, y: 172, width: 76, height: 8, rx: 4, fill: '#E4EAF1' }, bar);
  const pg = el('rect', { x: 242, y: 172, width: 0, height: 8, rx: 4, fill: pal.blue }, bar);
  const sp = g({}); tf(sp, 280, 136);
  el('circle', { r: 11, fill: 'none', stroke: '#DCE3EC', 'stroke-width': 4 }, sp);
  el('path', { d: 'M 0 -11 A 11 11 0 0 1 11 0', fill: 'none', stroke: pal.blueDark, 'stroke-width': 4, 'stroke-linecap': 'round' }, sp);
  // Wi-Fi：1本だけ
  const wf = g({}); tf(wf, 305, 114);
  [10, 7, 4].forEach((r, i) => el('path', { d: `M ${-r} ${-r * 0.2} A ${r} ${r} 0 0 1 ${r} ${-r * 0.2}`, fill: 'none', stroke: i === 2 ? pal.ink : '#CBD3DE', 'stroke-width': 2.2, 'stroke-linecap': 'round', transform: 'translate(0 8)' }, wf));
  el('circle', { cx: 0, cy: 8, r: 1.8, fill: pal.ink }, wf);
  const b = k.buddy({ x: 130, y: FY, scale: S });
  const zz = g({}); tf(zz, 105, 150);
  el('path', { d: 'M -6 0 q 3 -8 6 0 q 3 8 6 0', fill: 'none', stroke: pal.sub, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, zz);
  return {
    update(t) {
      // 時計だけが速く進む
      tf(mh, 0, 0, t * 270); tf(hh, 0, 0, t * 22 + 40);
      const prog = 0.04 + 0.05 * easeOut(seg(t, 0, 4.6)) + 0.012 * Math.sin(t * 2);
      k.set(pg, { width: 76 * prog }); k.set(fill, { width: 80 * prog * 0.8 });
      tf(sp, 280, 136, t * 200);
      wf.setAttribute('opacity', 0.55 + 0.45 * (Math.sin(t * 5) > 0 ? 1 : 0.3));
      // まめ：待つ→あごに手→ため息→がっくり
      const chin = easeInOut(seg(t, 0.8, 1.5)), slump = easeInOut(seg(t, 2.8, 3.6));
      const tapA = t > 1.6 ? Math.max(0, Math.sin(t * 9)) : 0;
      b.pose({ lean: 6 * chin + 8 * slump, squash: 1 - 0.05 * slump, armR: lerp(8, 85, chin) + (t > 1.5 ? 0 : 0), armL: 8, look: 0.9, mood: t < 1.2 ? 'flat' : t < 2.7 ? 'flat' : 'sad', blink: t > 3.2 ? 0.5 : 0, walk: 0 });
      // 足でとんとん（脚を少し振る）
      const legs = b.g.children[1].children;
      if (t > 1.6 && t < 3.4) legs[1].setAttribute('transform', `translate(12 -14) rotate(${-14 * tapA})`);
      faceAt(b, 5, slump * 2.5);
      const sg = seg(t, 2.8, 3.5);
      tf(zz, 118 + 8 * sg, 150 - 18 * sg); zz.setAttribute('opacity', hump(sg) * 0.9);
    }
  };
}
