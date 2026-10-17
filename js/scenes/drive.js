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
// drive：お母さんが車を運転して、会社のビルの前まで行って止まる（例文 My mother drives to work.）
export const meta = { duration: 4.4, beats: [[0, '出発'], [1.8, '運転する'], [3.8, '会社に着く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 214 });
  // 会社のビル（右）
  el('rect', { x: 292, y: 40, width: 108, height: FY - 40, rx: 4, fill: '#DCE3EE' });
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) el('rect', { x: 304 + c * 32, y: 56 + r * 34, width: 22, height: 22, rx: 3, fill: (r + c) % 3 ? '#CFE9F7' : '#FFE9A8' });
  el('rect', { x: 330, y: FY - 38, width: 34, height: 38, rx: 3, fill: pal.blue });
  el('rect', { x: 0, y: FY - 4, width: 400, height: 4, fill: pal.line });
  // 道路
  el('rect', { x: 0, y: FY, width: 400, height: 86, fill: '#B9C2CF' });
  el('rect', { x: 0, y: FY, width: 400, height: 6, fill: '#D6DCE5' });
  for (let i = 0; i < 6; i++) el('rect', { x: 10 + i * 72, y: FY + 54, width: 38, height: 5, rx: 2, fill: '#fff' });
  // 車
  const car = g({});
  const sh = k.shadow(0, FY + 52, 62, 6, car);
  const CY = FY + 48;
  const win = k.clip((cp) => el('path', { d: `M -14 ${CY - 74} L 18 ${CY - 74} Q 28 ${CY - 74} 34 ${CY - 56} L 40 ${CY - 36} L -22 ${CY - 36} L -22 ${CY - 66} Q -22 ${CY - 74} -14 ${CY - 74} Z` }, cp));
  const inside = g({ 'clip-path': win }, car);
  el('rect', { x: -30, y: CY - 76, width: 80, height: 34, fill: '#E5F1F9' }, inside);
  const mom = k.buddy({ parent: inside, x: 8, y: CY - 27, scale: 0.62, color: pal.coral, dark: pal.coralDark });
  mom.g.firstChild.setAttribute('display', 'none');
  const whl = el('ellipse', { rx: 3.5, ry: 9, fill: pal.ink }, inside);
  el('path', { d: `M -14 ${CY - 74} L 18 ${CY - 74} Q 28 ${CY - 74} 34 ${CY - 56} L 40 ${CY - 36} L -22 ${CY - 36} L -22 ${CY - 66} Q -22 ${CY - 74} -14 ${CY - 74} Z`, fill: '#fff', opacity: 0.22 }, car);
  el('path', { d: `M -62 ${CY - 18} Q -62 ${CY - 42} -40 ${CY - 36} L -20 ${CY - 36} L -20 ${CY - 76} Q -16 ${CY - 80} -10 ${CY - 80} L 18 ${CY - 80} Q 30 ${CY - 80} 38 ${CY - 58} L 46 ${CY - 36} Q 72 ${CY - 42} 72 ${CY - 18} Q 72 ${CY - 6} 62 ${CY - 6} L -52 ${CY - 6} Q -62 ${CY - 6} -62 ${CY - 18} Z M -14 ${CY - 74} L 18 ${CY - 74} Q 28 ${CY - 74} 34 ${CY - 56} L 40 ${CY - 36} L -22 ${CY - 36} L -22 ${CY - 66} Q -22 ${CY - 74} -14 ${CY - 74} Z`, fill: pal.violet, 'fill-rule': 'evenodd' }, car);
  el('rect', { x: 56, y: CY - 28, width: 12, height: 8, rx: 3, fill: pal.yellow }, car);
  el('rect', { x: 8, y: CY - 36, width: 14, height: 4, rx: 2, fill: '#fff', opacity: 0.5 }, car);
  const wh = [-34, 38].map((x) => { const w = g({}, car); tf(w, x, CY - 6); el('circle', { r: 14, fill: pal.ink }, w); el('circle', { r: 6, fill: '#C9D0DB' }, w); el('line', { x1: 0, y1: -5, x2: 0, y2: 5, stroke: pal.sub, 'stroke-width': 2 }, w); return w; });
  const SC = 1.35;
  const X = (t) => lerp(-118, 176, easeOut(seg(t, 0.4, 3.9)));

  return {
    update(t) {
      const x = X(t);
      const spd = Math.abs(X(t + 0.02) - X(t - 0.02)) / 0.04;
      const brake = hump(seg(t, 3.3, 4.2)) * 0.6;
            car.setAttribute('transform', `translate(${x.toFixed(2)} ${(CY * (1 - SC)).toFixed(2)}) scale(${SC}) rotate(${(brake * 2.4).toFixed(2)} 0 ${CY})`);
      wh.forEach((w) => tf(w, w === wh[0] ? -34 : 38, CY - 6, x / 14 * 57.3));
      mom.pose({ look: 0.8, mood: t > 3.9 ? 'smile' : 'flat', armR: 70, armL: -70, lean: 4 * brake, squash: 1 });
      const h = hp(mom, 0.62, 'R');
      mom.pose({ armR: reach(mom, 0.62, 'R', h.x, h.y), armL: reach(mom, 0.62, 'L', h.x - 1, h.y) });
      const hh = hp(mom, 0.62, 'R');
      tf(whl, hh.x + 3, hh.y, 0);
    }
  };
}
