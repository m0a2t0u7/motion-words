// shirt：白いシャツを着たまめがパーティー会場に入り、えりを整える（例文 He wore a white shirt to the party.）
// このファイルは服の共有ヘルパーも書き出す（top：体に着せる服 / flat：ハンガーや手に持つ服 / partyBg）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { reach, gait } from './dig.js';

// 体に着せる上着。kind：shirt | blouse | sweater | jacket | suit | coat | uniform
// 戻り値：slide(dy) で服を上下にずらす（頭からかぶる表現）、show(on)、hem（裾・スカートの図形グループ）
export function top(k, b, kind, col, dark, opt = {}) {
  const { el, g, tf } = k;
  const face = b.body.children[3];
  const hem = g({}, b.body);
  b.body.insertBefore(hem, b.body.children[1]);
  const cg = g({}, b.body);
  b.body.insertBefore(cg, face);
  cg.setAttribute('clip-path', k.clip((cp) => el('rect', { x: -30, y: -80, width: 60, height: 80, rx: 28 }, cp)));
  const n = g({}, cg), T = -36;
  const V = (w, d) => `M ${-w} ${T - 2} L 0 ${T + d} L ${w} ${T - 2}`;
  if (kind === 'shirt') {
    el('rect', { x: -32, y: T, width: 64, height: 44, fill: col }, n);
    el('line', { x1: 0, y1: T + 4, x2: 0, y2: 4, stroke: dark, 'stroke-width': 1.6 }, n);
    [-27, -18, -9].forEach((y) => el('circle', { cx: 2.5, cy: y, r: 1.8, fill: dark }, n));
    el('path', { d: `M -12 ${T - 1} L -2 ${T + 7} L -6 ${T - 2} Z M 12 ${T - 1} L 2 ${T + 7} L 6 ${T - 2} Z`, fill: col, stroke: dark, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, n);
    el('rect', { x: -21, y: -26, width: 9, height: 8, rx: 1.5, fill: 'none', stroke: dark, 'stroke-width': 1.4 }, n);
  } else if (kind === 'blouse') {
    el('path', { d: `M -32 ${T} Q 0 ${T + 9} 32 ${T} L 32 4 L -32 4 Z`, fill: col }, n);
    for (let i = -4; i <= 4; i++) el('circle', { cx: i * 4.2, cy: T + 2 + 0.25 * (16 - i * i) * 0.5, r: 3, fill: opt.light || '#FFE3EC', stroke: dark, 'stroke-width': 1 }, n);
    el('path', { d: `M 0 ${T + 9} l -7 -4 l 0 8 Z M 0 ${T + 9} l 7 -4 l 0 8 Z`, fill: dark }, n);
    [-22, -12].forEach((y) => el('circle', { cx: 0, cy: y, r: 1.7, fill: dark }, n));
  } else if (kind === 'sweater') {
    el('rect', { x: -32, y: T, width: 64, height: 44, fill: col }, n);
    el('path', { d: `M -12 ${T} Q 0 ${T + 8} 12 ${T}`, fill: 'none', stroke: dark, 'stroke-width': 4 }, n);
    el('path', { d: 'M -30 -20 l 6 -5 l 6 5 l 6 -5 l 6 5 l 6 -5 l 6 5 l 6 -5 l 6 5 l 6 -5 l 6 5', fill: 'none', stroke: '#fff', 'stroke-width': 2.2, opacity: 0.75 }, n);
    el('rect', { x: -32, y: -8, width: 64, height: 12, fill: dark }, n);
    for (let x = -28; x <= 28; x += 4) el('line', { x1: x, y1: -7, x2: x, y2: 2, stroke: col, 'stroke-width': 1.2, opacity: 0.7 }, n);
  } else {
    const inner = kind === 'coat' ? col : '#FFFFFF';
    el('rect', { x: -32, y: T, width: 64, height: 44, fill: inner }, n);
    const vw = kind === 'coat' ? 6 : 10, vd = kind === 'coat' ? 10 : 22;
    el('path', { d: `M -34 ${T - 2} L ${-vw} ${T - 2} L 0 ${T + vd} L 0 6 L -34 6 Z M 34 ${T - 2} L ${vw} ${T - 2} L 0 ${T + vd} L 0 6 L 34 6 Z`, fill: col }, n);
    el('path', { d: `M ${-vw - 4} ${T - 2} L -2 ${T + vd + 2} L -14 ${T + 8} Z M ${vw + 4} ${T - 2} L 2 ${T + vd + 2} L 14 ${T + 8} Z`, fill: dark }, n);
    el('line', { x1: 0, y1: T + vd, x2: 0, y2: 6, stroke: dark, 'stroke-width': 1.6 }, n);
    if (kind === 'suit' || opt.tie) el('path', { d: `M -3 ${T + 1} L 3 ${T + 1} L 4 ${T + 16} L 0 ${T + 21} L -4 ${T + 16} Z`, fill: opt.tie || '#C2414B' }, n);
    if (kind === 'uniform') {
      el('path', { d: `M 0 ${T + 3} l -8 -5 l 0 10 Z M 0 ${T + 3} l 8 -5 l 0 10 Z`, fill: opt.tie || '#D9474F' }, n);
      el('path', { d: 'M -22 -24 h 9 v 6 q -4.5 4 -9 0 Z', fill: '#FFCF5C' }, n);
    }
    const bx = kind === 'coat' ? [-6, 6] : [3];
    bx.forEach((x) => [-20, -9].forEach((y) => el('circle', { cx: x, cy: y, r: 2, fill: kind === 'coat' ? dark : '#fff', opacity: 0.9 }, n)));
    if (kind === 'coat') el('rect', { x: -32, y: -6, width: 64, height: 5, fill: dark }, n);
    else el('line', { x1: 12, y1: -10, x2: 22, y2: -10, stroke: dark, 'stroke-width': 2 }, n);
  }
  if (kind === 'coat') el('path', { d: 'M -30 -8 L 30 -8 L 34 8 L -34 8 Z', fill: col }, hem), el('line', { x1: 0, y1: -8, x2: 0, y2: 8, stroke: dark, 'stroke-width': 1.6 }, hem);
  if (opt.skirt) el('path', { d: 'M -29 -8 L 29 -8 L 37 9 L -37 9 Z', fill: opt.skirt }, hem);
  const arms = [b.armL.a.children[0], b.armR.a.children[0]];
  const legs = [0, 1].map((i) => b.g.children[1].children[i].children[0]);
  const armC = arms[0].getAttribute('stroke');
  const api = {
    g: cg, hem,
    slide(dy) { tf(n, 0, dy); return api; },
    show(on = true, sleeves = on) {
      cg.setAttribute('opacity', on ? 1 : 0); hem.setAttribute('opacity', on ? 1 : 0);
      arms.forEach((a) => a.setAttribute('stroke', sleeves ? (opt.sleeve || col) : armC));
      if (opt.legs) legs.forEach((l) => l.setAttribute('stroke', on ? opt.legs : armC));
      return api;
    }
  };
  return api.show(true);
}

// ハンガー・手に持つ服（原点＝ハンガーのフック先端、下向きに垂れる）
export function flat(k, kind, col, dark, parent, hanger = true) {
  const { el, g, pal } = k;
  const o = g({}, parent || k.root);
  if (hanger) {
    el('path', { d: 'M 0 0 q 0 -6 4 -6 q 4 0 3 4', fill: 'none', stroke: pal.sub, 'stroke-width': 2, 'stroke-linecap': 'round' }, o);
    el('path', { d: 'M 0 0 L -20 10 L 20 10 Z', fill: 'none', stroke: pal.sub, 'stroke-width': 2, 'stroke-linejoin': 'round' }, o);
  }
  const L = kind === 'coat' ? 72 : kind === 'jacket' || kind === 'suit' ? 52 : 46;
  el('path', { d: `M -9 7 L -20 10 L -27 30 L -20 33 L -15 22 L -15 ${L} L 15 ${L} L 15 22 L 20 33 L 27 30 L 20 10 L 9 7 Q 0 13 -9 7 Z`, fill: col, stroke: dark, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, o);
  if (kind === 'shirt') { el('path', { d: 'M -9 7 L 0 16 L 9 7', fill: 'none', stroke: dark, 'stroke-width': 1.6 }, o); el('line', { x1: 0, y1: 16, x2: 0, y2: L, stroke: dark, 'stroke-width': 1.2 }, o); }
  if (kind === 'sweater') { el('rect', { x: -15, y: L - 7, width: 30, height: 7, fill: dark }, o); el('path', { d: 'M -14 26 l 5 -4 l 5 4 l 5 -4 l 5 4 l 5 -4 l 5 4', fill: 'none', stroke: '#fff', 'stroke-width': 1.8, opacity: 0.75 }, o); }
  if (kind === 'jacket' || kind === 'coat' || kind === 'suit') {
    el('path', { d: `M -9 7 L 0 ${kind === 'coat' ? 22 : 30} L 9 7`, fill: 'none', stroke: dark, 'stroke-width': 2.4 }, o);
    el('line', { x1: 0, y1: kind === 'coat' ? 22 : 30, x2: 0, y2: L, stroke: dark, 'stroke-width': 1.4 }, o);
    (kind === 'coat' ? [30, 42, 54] : [36, 44]).forEach((y) => el('circle', { cx: 4, cy: y, r: 1.8, fill: dark }, o));
  }
  if (kind === 'blouse') for (let i = -2; i <= 2; i++) el('circle', { cx: i * 3.6, cy: 10 + Math.abs(i) * -0.6, r: 2.4, fill: '#FFE3EC', stroke: dark, 'stroke-width': 0.8 }, o);
  return o;
}

// パーティー会場（旗飾り・風船・テーブル）
export function partyBg(k, FY = 236) {
  const { el, pal } = k;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('path', { d: 'M 0 30 Q 200 70 400 30', fill: 'none', stroke: pal.sub, 'stroke-width': 1.5 });
  for (let i = 0; i < 12; i++) {
    const x = 16 + i * 33, y = 30 + 40 * (1 - Math.pow((x - 200) / 200, 2)) * 0.98 - 1;
    el('path', { d: `M ${x - 9} ${y} L ${x + 9} ${y} L ${x} ${y + 16} Z`, fill: [pal.coral, pal.yellow, pal.blue, pal.mint][i % 4] });
  }
  [[352, 92, pal.red], [374, 104, pal.yellow], [332, 108, pal.violet]].forEach(([x, y, c]) => {
    el('path', { d: `M ${x} ${y + 18} Q ${x + 6} ${y + 50} ${x - 2} ${FY - 60}`, fill: 'none', stroke: pal.sub, 'stroke-width': 1 });
    el('ellipse', { cx: x, cy: y, rx: 13, ry: 16, fill: c });
    el('ellipse', { cx: x - 4, cy: y - 5, rx: 3, ry: 5, fill: '#fff', opacity: 0.4 });
  });
  el('rect', { x: 300, y: FY - 60, width: 96, height: 7, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 308, y: FY - 53, width: 6, height: 53, fill: pal.woodDark });
  el('rect', { x: 382, y: FY - 53, width: 6, height: 53, fill: pal.woodDark });
  return FY;
}

export const meta = { duration: 4.0, beats: [[0, '白いシャツで'], [1.5, 'パーティーに着く'], [2.6, 'シャツを整える']] };

export function create(k) {
  const { pal } = k;
  const FY = partyBg(k, 240), S = 1.12;
  k.el('rect', { x: 8, y: FY - 120, width: 58, height: 120, rx: 3, fill: '#E8D3B6' });
  const host = k.buddy({ x: 320, y: FY, scale: 0.86, facing: -1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 30, y: FY, scale: S });
  top(k, b, 'shirt', '#FFFFFF', '#AEB9C8', { sleeve: '#F4F6F9' });
  const xf = (t) => lerp(30, 190, easeInOut(seg(t, 0.1, 1.6)));
  return {
    update(t) {
      const p = gait(xf, t, 30);
      const fix = easeInOut(seg(t, 2.2, 2.5)) * (1 - easeInOut(seg(t, 3.5, 3.85)));
      b.pose({ x: p.x, walk: p.walk, lean: p.lean - 3 * fix, armL: p.armL, armR: p.armR, mood: t > 1.6 ? 'grin' : 'smile', look: 0.3, blink: hump(seg(t, 3.7, 3.85)) });
      if (fix > 0) b.pose({ armR: lerp(p.armR, -52 + 30 * (0.5 - 0.5 * Math.cos(seg(t, 2.5, 3.5) * Math.PI * 4)), fix), look: lerp(0.3, -0.2, fix) });
      const wave = t > 1.4 ? 140 + 22 * Math.sin((t - 1.4) * 9) * (1 - seg(t, 3.2, 3.8)) : 8 + 120 * easeOut(seg(t, 1.0, 1.4));
      host.pose({ armR: wave, armL: 8, mood: 'grin', look: 0.5, squash: 1 + 0.02 * wobble(seg(t, 1.4, 2.4)) });
    }
  };
}
