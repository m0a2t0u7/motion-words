// bicycle：ネクタイ姿のまめが自転車をこいで会社へ行き、ビルの前で止まる（例文 He rides his bicycle to work.）
// このファイルは二輪車シーンの共有ヘルパーも書き出す（twoWheel / mount / tie / helmet）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { reach, blinkAt, path, skyline } from './vehicle.js';

// 二輪車（右向き、原点＝前後中央の地面）。kind: bike | moto | scooter
export function twoWheel(k, kind = 'bike', color = '#6AA8F7', dark = '#4A8BE0', sc = 1) {
  const { el, g, pal } = k;
  const o = g({}); k.shadow(0, 0, kind === 'moto' ? 62 : 52, 5, o);
  const R = kind === 'bike' ? 20 : kind === 'moto' ? 21 : 15, WX = kind === 'moto' ? 46 : kind === 'scooter' ? 36 : 34;
  const wheels = [-WX, WX].map((x) => { const w = g({}, o); el('circle', { r: R, fill: 'none', stroke: pal.ink, 'stroke-width': kind === 'bike' ? 4 : 8 }, w); el('circle', { r: kind === 'bike' ? 3 : 7, fill: '#C9D1DC' }, w); if (kind === 'bike') [0, 60, 120].forEach((a) => el('line', { x1: 0, y1: -R, x2: 0, y2: R, stroke: '#C9D1DC', 'stroke-width': 1.2, transform: `rotate(${a})` }, w)); else el('rect', { x: -1.5, y: -6, width: 3, height: 12, fill: pal.sub }, w); return [w, x]; });
  const fr = g({}, o), crank = g({}, o);
  let seat, bar, peg;
  const st = { stroke: color, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' };
  if (kind === 'bike') {
    el('path', { d: `M ${-WX} -20 L 0 -20 L -8 -50 Z M -8 -50 L 24 -50 L 0 -20 M 24 -50 L ${WX} -20 M 24 -50 L 22 -60`, ...st }, fr);
    el('path', { d: 'M 14 -60 L 28 -60', stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }, fr);
    el('ellipse', { cx: -10, cy: -53, rx: 9, ry: 3.5, fill: pal.ink }, fr);
    el('circle', { r: 6, fill: pal.sub }, crank); el('line', { x1: 0, y1: 0, x2: 0, y2: 10, stroke: pal.sub, 'stroke-width': 3 }, crank);
    seat = [-10, -55]; bar = [22, -60]; peg = [0, -20];
  } else if (kind === 'moto') {
    el('path', { d: `M ${-WX} -22 L -10 -34 L 30 -34 L ${WX} -22`, ...st, stroke: pal.sub, 'stroke-width': 4 }, fr);
    el('rect', { x: -16, y: -36, width: 26, height: 18, rx: 4, fill: '#7A8597' }, fr);
    el('path', { d: 'M -34 -40 L 4 -40 Q 8 -56 26 -54 Q 36 -52 34 -40 Z', fill: color }, fr);
    el('path', { d: 'M -40 -40 Q -36 -48 -4 -46 L -4 -40 Z', fill: pal.ink }, fr);
    el('path', { d: 'M 34 -44 L 42 -64', stroke: pal.sub, 'stroke-width': 4, 'stroke-linecap': 'round' }, fr);
    el('path', { d: 'M 36 -66 L 48 -64', stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }, fr);
    el('circle', { cx: 46, cy: -54, r: 5, fill: pal.yellow }, fr);
    el('path', { d: 'M -20 -20 L -56 -24', stroke: '#C9D1DC', 'stroke-width': 5, 'stroke-linecap': 'round' }, fr);
    seat = [-22, -48]; bar = [40, -64]; peg = [-6, -22];
  } else {
    el('path', { d: `M ${-WX - 10} -24 Q ${-WX} -46 -14 -42 L -14 -22 L 22 -22 L 28 -60 L 36 -60 L ${WX + 4} -22 Z`, fill: color }, fr);
    el('path', { d: 'M -38 -48 Q -24 -54 -8 -48 L -8 -42 L -38 -42 Z', fill: pal.ink }, fr);
    el('path', { d: 'M 26 -64 L 40 -64', stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }, fr);
    el('circle', { cx: 38, cy: -50, r: 4, fill: pal.yellow }, fr);
    el('rect', { x: -16, y: -24, width: 38, height: 4, rx: 2, fill: dark }, fr);
    seat = [-24, -50]; bar = [34, -64]; peg = [6, -26];
  }
  return {
    g: o, seat, bar, peg, R, sc,
    set(x, y, rot = 0, ca = 0, tilt = 0) {
      k.tf(o, x, y, tilt, sc);
      wheels.forEach(([w, wx]) => k.tf(w, wx, -R, rot));
      k.tf(crank, 0, -20, ca);
    }
  };
}
// 乗り手を座らせ、手をハンドル、足をペダル（ca=クランク角）やステップに置く
export function mount(k, b, s, v, x, y, { ca = null, look = 0.6, mood = 'smile', blink = 0, lean = 6 } = {}) {
  const c = v.sc;
  b.pose({ x: x + (v.seat[0] + 6) * c, y: y + (v.seat[1] + 2) * c + 10 * s, look, mood, blink, lean, armL: 40, armR: 40, walk: 0 });
  const hx = x + v.bar[0] * c, hy = y + v.bar[1] * c;
  b.pose({ armR: reach(b, s, 'R', hx, hy), armL: reach(b, s, 'L', hx - 3, hy + 1) });
  [0, 1].forEach((i) => {
    const a = ca === null ? 0 : ((ca + i * 180) * Math.PI) / 180;
    const px = x + (v.peg[0] + (ca === null ? 4 : -Math.sin(a) * 10)) * c, py = y + (v.peg[1] + (ca === null ? 0 : Math.cos(a) * 10)) * c;
    const lg = b.g.children[1].children[i], ln = lg.firstChild;
    const tx = b.state.x + (i ? 12 : -12) * s, ty = b.state.y - 14 * s;
    lg.setAttribute('transform', `translate(${i ? 12 : -12} -14)`);
    k.set(ln, { x2: ((px - tx) / s).toFixed(2), y2: ((py - ty) / s).toFixed(2) });
  });
}
export function tie(k, b, color = '#F2685B') {
  k.el('path', { d: 'M -4 -32 L 4 -32 L 2 -27 L 5 -12 L 0 -7 L -5 -12 L -2 -27 Z', fill: color }, b.body);
}
export function helmet(k, b, color = '#2A3242') {
  k.el('path', { d: 'M -33 -52 Q -32 -88 0 -88 Q 32 -88 33 -52 Z', fill: color }, b.body);
  k.el('path', { d: 'M -10 -84 Q 8 -86 20 -76', stroke: '#fff', 'stroke-width': 3, opacity: 0.4, fill: 'none', 'stroke-linecap': 'round' }, b.body);
}

export const meta = { duration: 4.4, beats: [[0, '出発'], [1.8, 'こいで進む'], [3.6, '会社に着く']] };

export function create(k) {
  const { el, pal } = k;
  const FY = 214;
  k.backdrop({ floorY: FY });
  skyline(k, FY - 20);
  // 会社のビル（右）
  el('rect', { x: 286, y: 30, width: 114, height: FY - 30, rx: 4, fill: '#DCE3EE' });
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) el('rect', { x: 298 + c * 34, y: 44 + r * 30, width: 24, height: 20, rx: 3, fill: (r + c) % 3 ? '#CFE9F7' : '#FFE9A8' });
  el('rect', { x: 322, y: FY - 44, width: 42, height: 44, rx: 3, fill: pal.blueDark });
  el('rect', { x: 0, y: FY, width: 400, height: 86, fill: '#DCE2EA' });
  for (let i = 0; i < 8; i++) el('rect', { x: i * 56, y: FY + 40, width: 28, height: 4, rx: 2, fill: '#fff' });
  const S = 0.84, GY = FY + 48;
  const bk = twoWheel(k, 'bike', pal.coral, pal.coralDark, 1.36);
  const me = k.buddy({ scale: S }); me.g.firstChild.setAttribute('display', 'none');
  tie(k, me);
  const X = path([[0.2, -80], [3.6, 250]]);
  return {
    update(t) {
      const x = X(t), d = x + 60;
      bk.set(x, GY, d * 2.1, d * 2.6);
      mount(k, me, S, bk, x, GY, { ca: d * 2.6, mood: t > 3.6 ? 'grin' : 'smile', blink: blinkAt(t), lean: 8 - 6 * seg(t, 3.4, 3.8) });
      void easeInOut; void hump; void clamp; void lerp; void easeOut;
    }
  };
}
