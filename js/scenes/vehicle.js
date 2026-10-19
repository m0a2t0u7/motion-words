// vehicle：駐車場で係員の合図を受け、運転席のまめがキーを回してエンジンを止める（例文 Please turn off your vehicle's engine.）
// このファイルは乗り物・旅行シーンの共有ヘルパーも書き出す（road / skyline / auto / puffs / suitcase / pullCase / hall / board / plane / deskFront）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, held, reach, gait } from './dig.js';
import { P, blinkAt, walkTo, clock, tree } from './run-after.js';
import { cue, talk, sc, popIn } from './in-common.js';
import { coin } from './get-on-with.js';
import { mark, ticket, calendar, wallet, drop } from './so-far-so-good.js';
import { person, path, walk, sign } from './queue-up.js';
export { hp, held, reach, gait, P, blinkAt, walkTo, clock, tree, cue, talk, sc, popIn, coin, mark, ticket, calendar, wallet, drop, person, path, walk, sign };

// 遠景のビル（屋外）
export function skyline(k, FY, cols = ['#E4EEF7', '#F3E6DC', '#E6F1E8']) {
  [[0, 96, 70], [78, 70, 56], [140, 118, 64], [212, 84, 60], [280, 104, 56], [342, 76, 70]].forEach(([x, h, w], i) => {
    k.el('rect', { x, y: FY - h, width: w, height: h, rx: 4, fill: cols[i % cols.length] });
    for (let r = 0; r < Math.floor((h - 16) / 24); r++) for (let c = 0; c < 2; c++) k.el('rect', { x: x + 9 + c * (w / 2 - 2), y: FY - h + 12 + r * 24, width: w / 2 - 14, height: 12, rx: 2, fill: '#fff', opacity: 0.75 });
  });
}
// 歩道＋車道。FY＝歩道の上端。戻り値 GY＝車の接地 y
export function road(k, FY = 196, { mood = 'outdoor', city = true, walkH = 16 } = {}) {
  const { el, pal } = k;
  k.backdrop({ floorY: FY, mood });
  if (city) skyline(k, FY);
  el('rect', { x: 0, y: FY, width: 400, height: walkH, fill: '#E6EAF0' });
  for (let x = 0; x < 400; x += 32) el('rect', { x, y: FY, width: 1.5, height: walkH, fill: '#D3DAE3' });
  el('rect', { x: 0, y: FY + walkH, width: 400, height: 4, fill: '#C9D1DC' });
  el('rect', { x: 0, y: FY + walkH + 4, width: 400, height: 300, fill: '#B9C2CF' });
  const GY = FY + walkH + 50;
  for (let i = 0; i < 7; i++) el('rect', { x: 8 + i * 64, y: GY + 16, width: 34, height: 5, rx: 2, fill: '#fff', opacity: 0.9 });
  return GY;
}
// 横向きの乗り物（右向き、原点＝前後中央の地面）。kind: car | taxi | truck | bus
// driver: {color, dark} を渡すと運転席にまめを座らせる（窓の中だけ見える）
export function auto(k, { kind = 'car', color, dark, driver, ds = 0.5, riders = [] } = {}) {
  const { el, g, pal } = k;
  const o = g({}), sh = k.shadow(0, 0, kind === 'bus' ? 120 : kind === 'truck' ? 104 : 66, 6, o), body = g({}, o);
  let shape, wins, wx, dpos, len;
  if (kind === 'bus') {
    len = 124; wx = [-80, 78];
    wins = [-110, -78, -46, -14, 18, 50].map((x) => `M ${x} -104 h 28 v 34 h -28 Z`).join(' ') + ' M 84 -104 h 34 v 50 h -34 Z';
    shape = 'M -122 -20 L -122 -112 Q -122 -124 -110 -124 L 112 -124 Q 124 -124 124 -112 L 124 -20 Q 124 -12 116 -12 L -114 -12 Q -122 -12 -122 -20 Z';
    dpos = [100, -40];
  } else if (kind === 'truck') {
    len = 104; wx = [-70, -36, 66];
    wins = 'M 58 -82 L 80 -82 Q 86 -82 90 -70 L 94 -56 L 58 -56 Z';
    shape = 'M -104 -22 L -104 -118 Q -104 -122 -100 -122 L 38 -122 L 38 -22 Z M 42 -22 L 42 -84 Q 42 -90 50 -90 L 80 -90 Q 90 -90 96 -72 L 102 -54 Q 106 -50 106 -40 L 106 -20 Q 106 -12 98 -12 L 42 -12 Z';
    dpos = [72, -36];
  } else {
    len = 66; wx = [-38, 40];
    wins = 'M -18 -42 L -10 -62 L 26 -62 L 38 -42 Z';
    shape = 'M -66 -18 Q -66 -42 -44 -42 L -24 -42 L -14 -66 Q -12 -70 -6 -70 L 28 -70 Q 34 -70 38 -64 L 48 -42 Q 70 -42 70 -22 L 70 -18 Q 70 -10 62 -10 L -58 -10 Q -66 -10 -66 -18 Z';
    dpos = [12, -22];
  }
  const inside = g({ 'clip-path': k.clip((c) => el('path', { d: wins }, c)) }, body);
  el('rect', { x: -130, y: -130, width: 260, height: 130, fill: '#E5F1F9' }, inside);
  const ppl = riders.map(([x, c, d]) => { const b = k.buddy({ parent: inside, x, y: dpos[1] + (kind === 'bus' ? -18 : 0), scale: ds, color: c, dark: d }); b.g.firstChild.setAttribute('display', 'none'); return b; });
  const d = driver ? k.buddy({ parent: inside, x: dpos[0], y: dpos[1], scale: ds, color: driver.color, dark: driver.dark }) : null;
  if (d) d.g.firstChild.setAttribute('display', 'none');
  el('path', { d: `${shape} ${wins}`, fill: color || pal.blue, 'fill-rule': 'evenodd' }, body);
  el('path', { d: wins, fill: '#fff', opacity: 0.18 }, body);
  if (kind === 'truck') { el('rect', { x: -104, y: -122, width: 142, height: 8, fill: '#000', opacity: 0.06 }, body); el('rect', { x: -104, y: -30, width: 210, height: 6, fill: dark, opacity: 0.4 }, body); }
  else el('rect', { x: -len + 2, y: -26, width: len * 2 - 2, height: 5, fill: dark || pal.blueDark, opacity: 0.4 }, body);
  if (kind === 'taxi') { el('rect', { x: 0, y: -80, width: 26, height: 11, rx: 3, fill: '#fff', stroke: pal.ink, 'stroke-width': 1.5 }, body); k.text(13, -74, 'TAXI', { 'font-size': 7.5 }, body); el('path', { d: 'M -60 -30 h 120', stroke: pal.ink, 'stroke-width': 4, 'stroke-dasharray': '6 6', opacity: 0.7 }, body); }
  el('rect', { x: len - 10, y: -38, width: 12, height: 8, rx: 3, fill: pal.yellow }, body);
  el('rect', { x: -len - 2, y: -36, width: 6, height: 8, rx: 2, fill: pal.red }, body);
  let doorG = null;
  if (kind === 'bus') { doorG = el('rect', { x: 92, y: -100, width: 22, height: 86, rx: 3, fill: '#CFE3F2', stroke: dark, 'stroke-width': 2 }, body); }
  const wheels = wx.map((x) => { const w = g({}, o); el('circle', { r: 14, fill: pal.ink }, w); el('circle', { r: 6, fill: '#C9D1DC' }, w); el('rect', { x: -1.5, y: -6, width: 3, height: 12, fill: pal.sub }, w); return [w, x]; });
  return {
    g: o, body, d, ppl, inside, door: doorG, sh, wheels, len,
    // x, y=地面, rot=車輪の角度, bob=車体の上下, tilt=車体の傾き（度、後輪まわり）
    set(x, y = 0, rot = 0, bob = 0, tilt = 0, s = 1) {
      k.tf(o, x, y, 0, s);
      body.setAttribute('transform', `translate(0 ${bob.toFixed(2)}) rotate(${tilt.toFixed(2)} ${wx[0]} -14)`);
      wheels.forEach(([w, wxx]) => k.tf(w, wxx, -14, rot));
    }
  };
}
// 排気ガスのけむり。set(x, y, t, on 判定関数)
export function puffs(k, n = 5) {
  const ps = Array.from({ length: n }, () => k.el('circle', { r: 5, fill: '#A9B3C1' }));
  return (x, y, t, alive = () => true, rate = 0.32) => ps.forEach((p, i) => {
    const born = Math.floor((t - i * rate) / (rate * n)) * rate * n + i * rate, a = (t - born) / (rate * n);
    const ok = born >= 0 && alive(born) && a < 1;
    k.set(p, { cx: x - 40 * easeOut(a), cy: y - 12 * a, r: 4 + 9 * a, opacity: ok ? 0.75 * (1 - a) : 0 });
  });
}
// 引いて歩くスーツケース（原点＝取っ手の握り）
export function suitcase(k, color = '#6AA8F7', dark = '#4A8BE0', parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('path', { d: 'M -3 0 L -3 22 M 3 0 L 3 22', stroke: pal.sub, 'stroke-width': 2.5 }, g);
  k.el('rect', { x: -6, y: -3, width: 12, height: 5, rx: 2.5, fill: pal.ink }, g);
  k.el('rect', { x: -17, y: 20, width: 34, height: 46, rx: 6, fill: color }, g);
  [-7, 7].forEach((x) => k.el('rect', { x: x - 1.5, y: 24, width: 3, height: 38, rx: 1.5, fill: dark, opacity: 0.7 }, g));
  [-11, 11].forEach((x) => k.el('circle', { cx: x, cy: 68, r: 3.5, fill: pal.ink }, g));
  return g;
}
// 手 h で引くスーツケースの角度（車輪が床 FY に付く）
export function pullCase(k, node, h, FY, s = 1, dir = -1) {
  const L = 70 * s, a = Math.acos(clamp((FY - h.y) / L, -1, 1)) * 57.3;
  k.tf(node, h.x, h.y, dir * a, s);
}
// 空港の建物の中（大きな窓の外に飛行機）
export function hall(k, FY = 236, { win = true } = {}) {
  const { el, pal } = k;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: 22, fill: '#E9EEF4' });
  if (win) {
    el('rect', { x: 0, y: 34, width: 400, height: FY - 74, fill: k.gradient([[0, '#CFE8F8'], [1, '#EEF7FC']]) });
    el('rect', { x: 0, y: FY - 54, width: 400, height: 14, fill: '#DCE6EE' });
    const p = plane(k); k.tf(p.g, 300, FY - 54, 0, 0.42); p.set(300, FY - 54, 0, 1, 0.42);
    for (let x = 0; x <= 400; x += 80) el('rect', { x: x - 3, y: 34, width: 6, height: FY - 74, fill: '#fff' });
    el('rect', { x: 0, y: FY - 40, width: 400, height: 40, fill: '#F1F3F6' });
  }
  for (let x = -20; x < 420; x += 50) el('line', { x1: x, y1: FY, x2: x - 30, y2: 300, stroke: pal.floorEdge, 'stroke-width': 1.5 });
  return FY;
}
// 発着案内板。rows: [[便, 時刻, 状態], ...]。戻り値 cells[行][列] の text
export function board(k, x, y, w, rows, head = 'DEPARTURES', parent) {
  const g = k.g({}, parent), rh = 18;
  k.el('rect', { x, y, width: w, height: 26 + rows.length * rh, rx: 5, fill: '#2B3446', stroke: '#C9D1DC', 'stroke-width': 3 }, g);
  k.text(x + w / 2, y + 12, head, { 'font-size': 10, fill: '#fff' }, g);
  const cells = rows.map((r, i) => r.map((c, j) => k.text(x + 10 + [0, 0.34, 0.6][j] * w, y + 30 + i * rh, c, { 'font-size': 10.5, fill: j === 2 ? '#9BE3B0' : '#FFE08A', 'text-anchor': 'start', 'font-family': 'monospace' }, g)));
  return { g, cells, rowY: (i) => y + 30 + i * rh };
}
// 横向きのジェット機（右向き、原点＝車輪の接地点の中央）。set(x, y, 機首角度, 脚0..1, 拡大)
export function plane(k, color = '#FFFFFF', stripe = '#6AA8F7') {
  const { el, g, pal } = k;
  const o = g({}), gear = g({}, o), b = g({}, o);
  [-24, 70].forEach((x) => { el('line', { x1: x, y1: -30, x2: x, y2: -8, stroke: pal.sub, 'stroke-width': 4 }, gear); el('circle', { cx: x, cy: -7, r: 7, fill: pal.ink }, gear); });
  el('path', { d: 'M -128 -62 L -112 -116 L -94 -116 L -80 -62 Z', fill: stripe }, b);
  el('path', { d: 'M -130 -56 Q -130 -64 -116 -64 L 92 -64 Q 128 -62 140 -44 Q 128 -26 96 -26 L -96 -26 Q -120 -28 -130 -56 Z', fill: color, stroke: '#D5DCE5', 'stroke-width': 2 }, b);
  el('path', { d: 'M 112 -58 Q 126 -56 132 -48 L 112 -48 Z', fill: '#2B3446' }, b);
  el('rect', { x: -110, y: -40, width: 210, height: 5, fill: stripe }, b);
  for (let i = 0; i < 12; i++) el('circle', { cx: -90 + i * 16, cy: -50, r: 3.4, fill: '#9FC4E6' }, b);
  el('path', { d: 'M -10 -38 L 50 -38 L 6 -8 L -24 -8 Z', fill: '#C9D1DC' }, b);
  el('path', { d: 'M -126 -60 L -100 -60 L -110 -48 L -136 -48 Z', fill: '#D5DCE5' }, b);
  return { g: o, body: b, set(x, y, rot = 0, gp = 1, s = 1) { k.tf(o, x, y, rot, s); k.tf(gear, 0, (1 - gp) * -24, 0, 1, Math.max(0.001, gp)); } };
}
// キー穴の拡大図。set(x, y, 出現0..1, キー角度(+40=ON, -40=OFF, 70=始動), 指を出すか)。(lx, ly)＝引き出し線の先
export function keyZoom(k, lx = -100, ly = 140) {
  const { el, pal } = k;
  const zoom = k.g({}); el('circle', { r: 34, fill: '#fff', stroke: pal.line, 'stroke-width': 3 }, zoom);
  el('circle', { r: 13, fill: '#C9D1DC' }, zoom); k.text(-22, -24, 'OFF', { 'font-size': 9, fill: pal.sub }, zoom); k.text(24, -24, 'ON', { 'font-size': 9, fill: pal.green }, zoom);
  const key = k.g({}, zoom); el('rect', { x: -7, y: -22, width: 14, height: 44, rx: 6, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, key); el('circle', { cy: -14, r: 3, fill: '#fff' }, key);
  const fing = k.g({}, key); [-1, 1].forEach((d) => el('ellipse', { cx: d * 11, cy: 6, rx: 6, ry: 12, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.5 }, fing));
  el('path', { d: `M ${lx} ${ly} L ${lx * 0.22} ${ly * 0.19}`, stroke: pal.line, 'stroke-width': 2, 'stroke-dasharray': '4 4' }, zoom);
  return { g: zoom, set(x, y, p, ang, f) { k.tf(zoom, x, y, 0, popIn(clamp(p)) + 0.001); zoom.setAttribute('opacity', p > 0 ? 1 : 0); k.tf(key, 0, 0, ang); fing.setAttribute('opacity', f ? 1 : 0); } };
}
// カウンターの前板（人の腰から下を隠す）。人物を作った後に呼ぶ
export function deskFront(k, x, w, top, FY, color = '#E3C49B', dark = '#C9A577') {
  k.shadow(x + w / 2, FY + 2, w / 2 + 6, 4);
  k.el('rect', { x: x - 4, y: top, width: w + 8, height: 8, rx: 3, fill: dark });
  k.el('rect', { x, y: top + 8, width: w, height: FY - top - 6, fill: color });
  k.el('rect', { x, y: top + 8, width: w, height: 4, fill: '#000', opacity: 0.08 });
}

export const meta = { duration: 4.2, beats: [[0, 'エンジンがかかっている'], [1.4, 'キーを回す'], [2.6, 'エンジンを止めた']] };

export function create(k) {
  const { el, pal } = k;
  const FY = 196, GY = road(k, FY, { city: false });
  // 駐車場の看板と区画線
  el('rect', { x: 0, y: 40, width: 400, height: 156, fill: '#EEF4F8' });
  el('rect', { x: 26, y: 60, width: 68, height: 70, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  el('rect', { x: 40, y: 72, width: 40, height: 46, rx: 6, fill: pal.blue }); k.text(60, 96, 'P', { 'font-size': 32, fill: '#fff' });
  [70, 250].forEach((x) => el('rect', { x, y: GY - 2, width: 4, height: 34, fill: '#fff', opacity: 0.8 }));
  const car = auto(k, { color: pal.violet, dark: '#7F63D6', driver: { color: pal.mint, dark: pal.mintDark }, ds: 0.52 });
  const ex = puffs(k, 5);
  const guard = k.buddy({ x: 335, y: GY - 6, scale: 0.8, facing: -1, color: pal.coral, dark: pal.coralDark });
  const cap = el('path', { d: 'M -26 -78 Q 0 -98 26 -78 L 32 -74 L -26 -74 Z', fill: pal.blueDark }, guard.body);
  const z = keyZoom(k, -100, 140);
  const KX = 168, OFF = 2.3;
  return {
    update(t) {
      const run = t < OFF ? 1 : Math.exp(-(t - OFF) * 6);
      const shake = Math.sin(t * 60) * 0.9 * run;
      car.set(150, GY, 0, shake, 0, 1.45);
      ex(150 - 66 * 1.45, GY - 26, t, (b) => b < OFF);
      // 係員：手のひらを下に向けて「止めて」の合図
      const gp = hump(seg(t, 0.4, 2.2));
      P(guard, { armL: 8 + 20 * gp, armR: lerp(8, 80, easeOut(seg(t, 0.4, 0.9))) - 14 * Math.sin(t * 9) * gp - lerp(0, 72, easeInOut(seg(t, 2.6, 3.1))), look: 0.6, mood: t > 2.8 ? 'grin' : 'smile', blink: blinkAt(t) });
      cap.setAttribute('transform', 'translate(0 0)');
      // 運転手：手をキーへ伸ばし、ひねる
      const rq = easeInOut(seg(t, 1.1, 1.7)) * (1 - easeInOut(seg(t, 2.9, 3.4)));
      const kt = seg(t, 1.8, 2.3);
      car.d.pose({ armR: lerp(10, reach(car.d, 0.52, 'R', 34, -22), rq) + 12 * easeInOut(kt) * rq, armL: 8, look: lerp(0.8, 0.2, rq), mood: t > 2.6 ? 'smile' : 'flat', blink: blinkAt(t, 0.7), lean: 6 * rq });
      z.set(290, 78, seg(t, 1.2, 1.6) * (1 - seg(t, 3.6, 4.0)), lerp(40, -40, easeInOut(kt)), kt > 0 && t < 3);
      void KX; void wobble;
    }
  };
}
