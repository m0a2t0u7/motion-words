import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
// 手先（len=0 で肩）のワールド座標。体の傾き・つぶれ・向きを反映
function hp(b, s, side = 'R', len = 27) {
  const st = b.state, a = rad(side === 'R' ? -st.armR : st.armL);
  let x = (side === 'R' ? 27 : -27) - len * Math.sin(a), y = -46 + len * Math.cos(a);
  x *= 2 - st.squash; y *= st.squash;
  const l = rad(st.lean), c = Math.cos(l), sn = Math.sin(l);
  return { x: st.x + (x * c - y * sn) * st.facing * s, y: st.y + (x * sn + y * c - 10 - st.lift) * s };
}
// 指定の点の方向へ腕を向ける角度
function reach(b, s, side, tx, ty) {
  const st = b.state, o = hp(b, s, side, 0);
  const phi = deg(Math.atan2(-(tx - o.x) * st.facing, ty - o.y));
  return side === 'R' ? st.lean - phi : phi - st.lean;
}
// 位置の関数から歩行の位相と腕振りを作る（止まると脚をそろえる）
function gait(xf, t, x0, amp = 18, kf = 0.107) {
  const x = xf(t), v = Math.abs(xf(t + 0.02) - xf(t - 0.02)) / 0.04;
  const ph = Math.abs(x - x0) * kf, m = clamp(v / 25);
  const w = lerp(Math.round(ph / Math.PI) * Math.PI, ph, m);
  return { x, walk: w, armL: 8 + Math.sin(w) * amp * m, armR: 8 - Math.sin(w) * amp * m, lean: 3 * m, m };
}
// 脚を個別に回す（pose の後に呼ぶ。i=0 奥脚 / 1 手前脚、正で後ろ）
function leg(b, i, ang) {
  const g = b.g.children[1].children[i];
  g.setAttribute('transform', `translate(${i ? 12 : -12} ${-14 - b.state.lift}) rotate(${ang.toFixed(2)})`);
}
function bubble(k, txt, w = 54) {
  const n = k.g();
  k.el('rect', { x: -w / 2, y: -14, width: w, height: 26, rx: 13, fill: '#fff', stroke: k.pal.line, 'stroke-width': 2 }, n);
  k.el('path', { d: 'M -5 11 L 0 21 L 7 11 Z', fill: '#fff', stroke: k.pal.line, 'stroke-width': 2, 'stroke-linejoin': 'round' }, n);
  k.el('rect', { x: -6, y: 9, width: 16, height: 4, fill: '#fff' }, n);
  k.text(0, 0, txt, { 'font-size': 14 }, n);
  return n;
}
const HEART = 'M 0 6 C -12 -2 -8 -12 0 -5 C 8 -12 12 -2 0 6 Z';
// plant：庭の土に、ふたりで花の苗をひとつずつ植えて、花が咲く（例文 We planted flowers in the garden.）
export const meta = { duration: 4.4, beats: [[0, '花の苗'], [1.5, '土に植える'], [3.4, '花が咲いた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const FY = k.backdrop({ floorY: 200 });
  el('rect', { x: 0, y: FY, width: 400, height: 100, fill: '#CDEBC5' });
  el('rect', { x: 0, y: FY, width: 400, height: 3, fill: '#A9D49C' });
  // 柵と太陽
  for (let i = 0; i < 12; i++) el('rect', { x: i * 36 - 6, y: 146, width: 14, height: 54, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  el('rect', { x: 0, y: 160, width: 400, height: 6, fill: '#F0F3F7' });
  el('rect', { x: 0, y: 182, width: 400, height: 6, fill: '#F0F3F7' });
  el('circle', { cx: 330, cy: 52, r: 20, fill: pal.yellow, opacity: 0.9 });
  // 花壇の土
  el('ellipse', { cx: 200, cy: 262, rx: 188, ry: 30, fill: '#A67C5B' });
  el('ellipse', { cx: 200, cy: 258, rx: 184, ry: 26, fill: '#B98A66' });
  const spots = [{ x: 110, c: pal.red }, { x: 170, c: pal.violet }, { x: 235, c: pal.yellow }, { x: 295, c: pal.coral }];
  spots.forEach((s) => { s.y = 262; el('ellipse', { cx: s.x, cy: s.y, rx: 13, ry: 4, fill: '#8F6A4C' }); });
  const mkFlower = (c) => {
    const n = g({});
    el('path', { d: 'M 0 0 Q -2 -14 0 -26', fill: 'none', stroke: '#4FAE6A', 'stroke-width': 3, 'stroke-linecap': 'round' }, n);
    el('path', { d: 'M 0 -10 Q -10 -14 -12 -22 Q -3 -20 0 -10 Z', fill: '#59C27A' }, n);
    const head = g({}, n); tf(head, 0, -28);
    for (let i = 0; i < 5; i++) el('ellipse', { cx: 0, cy: -7, rx: 4.5, ry: 7, fill: c, transform: `rotate(${i * 72})` }, head);
    el('circle', { r: 3.4, fill: pal.yellowDark }, head);
    return { n, head };
  };
  const fl = spots.map((s) => mkFlower(s.c));
  const sd = [0, 1, 2, 3].map((i) => { const n = g({}); el('path', { d: 'M 0 8 Q -2 -6 0 -14', fill: 'none', stroke: '#59C27A', 'stroke-width': 3, 'stroke-linecap': 'round' }, n); el('ellipse', { cx: 0, cy: 9, rx: 7, ry: 5, fill: '#8F6A4C' }, n); return n; });
  const bs = [k.buddy({ x: 70, y: 232, scale: S }), k.buddy({ x: 340, y: 232, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark })];
  const mound = spots.map((s) => el('ellipse', { cx: s.x, cy: s.y - 1, rx: 14, ry: 5, fill: '#B98A66', opacity: 0 }));
  // 各自2株：[buddy, 立つx, 苗のあるスポット, 開始時刻]
  const jobs = [[0, 100, 0, 0.5], [1, 305, 3, 0.9], [0, 140, 1, 2.0], [1, 262, 2, 2.4]];
  const mv = (u) => easeInOut(seg(u, 0, 0.3));

  return {
    update(t) {
      const cur = [null, null];
      bs.forEach((b, bi) => {
        const js = jobs.filter((j) => j[0] === bi);
        let x = bi ? 340 : 70, ph = null, lean = 0, ar = 8, ww = 0, jj = null;
        let prev = x;
        js.forEach((j, n) => {
          const t0 = j[3], tx = j[1], u = t - t0;
          if (u < 0) return;
          // 歩く(0〜0.7) かがんで植える(0.7〜1.6) 立つ(1.6〜2.0)
          const w = easeInOut(seg(u, 0, 0.7));
          x = lerp(prev, tx, w);
          ww = w > 0 && w < 1 ? 1 : 0;
          prev = tx; jj = { j, u };
        });
        const bend = jj ? hump(seg(jj.u, 0.6, 1.9)) : 0;
        const plan = jj ? seg(jj.u, 0.95, 1.25) : 0;
        const walkPh = x * 0.11;
        b.pose({ x, walk: ww ? walkPh : 0, lean: 34 * bend + 3 * ww, squash: 1 - 0.1 * bend, armR: 8 + 40 * bend + (ww ? 12 * Math.sin(walkPh) : 0), armL: 8 + (ww ? -12 * Math.sin(walkPh) : 0), mood: 'smile', look: 0.6, y: 232 });
        cur[bi] = jj;
      });
      // 苗：まだ植えていないものは手前の袋に。植えたら土から伸びて開花
      spots.forEach((s, i) => {
        const j = jobs.find((q) => q[2] === i), b = bs[j[0]], u = t - j[3];
        const planted = seg(u, 1.0, 1.25), grow = backOut(seg(u, 1.0, 1.6)), bloom = backOut(seg(u, 1.7, 2.3)), bloomAll = backOut(seg(t, 3.2, 3.9));
        const sc = u < 1.0 ? 0 : grow;
        tf(fl[i].n, s.x, s.y + 2, 0, sc * 1.3 + 0.001, sc * 1.3 + 0.001);
        fl[i].n.setAttribute('opacity', u >= 1.0 ? 1 : 0);
        tf(fl[i].head, 0, -28, t * 20 * 0 + 4 * Math.sin(t * 2 + i), Math.max(0.001, i < 2 ? bloom : (u > 1.7 ? bloom : 0)) * 1, Math.max(0.001, i < 2 ? bloom : (u > 1.7 ? bloom : 0)));
        mound[i].setAttribute('opacity', u >= 1.0 ? 1 : 0);
        // 手に持つ苗
        const cu = u < 1.0 && u > -0.3 + 0;
        const hand = hp(b, S, 'R');
        const holding = u > 0.2 && u < 1.0;
        tf(sd[i], holding ? hand.x : -50, holding ? hand.y - 4 : -50, 0, 0.85, 0.85);
        sd[i].setAttribute('opacity', holding || (u <= 0.2 && u > -0.4) ? 1 : 0);
        if (u <= 0.2) tf(sd[i], b.state.x + (j[0] ? -34 : 34), 214, 0, 0.85, 0.85);
        sd[i].setAttribute('opacity', u > -0.0 + 0 || t < 0.01 ? (u < 1.0 ? 1 : 0) : 1);
      });
    }
  };
}
