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
// awake：夜、赤ちゃんはベビーベッドでまだ目をぱっちり開けて遊び、親のほうが眠そう（例文 The baby is still awake.）
export const meta = { duration: 4.4, beats: [[0, '夜になった'], [1.6, '眠そうな親'], [3.2, 'まだ起きてる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'evening' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#EDE6F6' });
  win(k, 40, 36, 96, 80, true);
  // 月と星
  el('path', { d: 'M 96 60 a 14 14 0 1 0 12 22 a 11 11 0 1 1 -12 -22 Z', fill: pal.yellow });
  [[58, 56], [70, 94], [118, 98]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 1.8, fill: '#fff' }));
  // 壁の時計：真夜中近く
  const ck = g({}); tf(ck, 180, 70);
  el('circle', { r: 20, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 }, ck);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -15, stroke: pal.ink, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, ck);
  el('line', { x1: 0, y1: 0, x2: 7, y2: -6, stroke: pal.ink, 'stroke-width': 3.4, 'stroke-linecap': 'round' }, ck);
  // 親（コーラル）
  const mom = k.buddy({ x: 100, y: FY, scale: 0.95, color: pal.coral, dark: pal.coralDark });
  // 赤ちゃん（小さなまめ）をベッドの中に
  k.shadow(280, FY + 2, 70, 7);
  const baby = k.buddy({ x: 280, y: FY - 20, scale: 0.55 });
  const toy = g({});
  el('circle', { r: 7, fill: pal.red }, toy);
  el('rect', { x: -2, y: 6, width: 4, height: 12, rx: 2, fill: pal.yellowDark }, toy);
  // ベビーベッドの柵と脚（手前）
  const crib = g({});
  el('rect', { x: 212, y: FY - 76, width: 136, height: 6, rx: 3, fill: pal.wood }, crib);
  el('rect', { x: 212, y: FY - 44, width: 136, height: 44, rx: 4, fill: '#F6E8D2', opacity: 0.0 }, crib);
  for (let i = 0; i < 9; i++) el('rect', { x: 216 + i * 16, y: FY - 70, width: 4, height: 70, rx: 2, fill: pal.wood }, crib);
  el('rect', { x: 212, y: FY - 30, width: 136, height: 8, fill: pal.woodDark }, crib);
  el('rect', { x: 208, y: FY - 80, width: 8, height: 84, rx: 3, fill: pal.woodDark }, crib);
  el('rect', { x: 344, y: FY - 80, width: 8, height: 84, rx: 3, fill: pal.woodDark }, crib);
  const zz = g({}); tf(zz, 130, 150);
  ['Z', 'z'].forEach((s, i) => k.text(i * 12, -i * 14, s, { 'font-size': 16 - i * 3, fill: pal.sub }, zz));
  return {
    update(t) {
      // 赤ちゃん：元気に跳ねて、おもちゃを振る。目はずっと開いている
      const bob = Math.abs(Math.sin(t * 5.2));
      baby.pose({ y: FY - 22 - 8 * bob, squash: 1 + 0.06 * (1 - bob), armR: 120 + 50 * Math.sin(t * 8), armL: 120 + 50 * Math.sin(t * 8 + 2), mood: 'grin', blink: 0, look: -0.6 * Math.sin(t * 1.4) });
      const h = hp(baby, 0.55, 'R', 24);
      tf(toy, h.x + 2, h.y - 4);
      // 親：あくび→目をこすり→うとうと
      const yw = hump(seg(t, 1.2, 2.4)), rub = seg(t, 2.4, 3.6);
      mom.pose({ look: 0.7, mood: yw > 0.3 ? 'open' : 'flat', blink: 0.55 + 0.25 * Math.sin(t * 3) * rub, lean: 4 + 6 * rub + 2 * Math.sin(t * 2),
        armR: lerp(8, -98, easeInOut(seg(t, 2.3, 2.9))) + 0.0 + (rub > 0 ? 8 * Math.sin(t * 14) : 0), armL: 8, squash: 1 - 0.03 * yw });
      faceAt(mom, 4, 1.5 * rub);
      tf(zz, 112 + 6 * Math.sin(t * 2), 142 - 5 * Math.sin(t * 2));
      zz.setAttribute('opacity', seg(t, 1.6, 2.2));
    }
  };
}
