// cut corners：決められた順路（3つの点検ポイント）を、角を斜めに突っ切って近道 → 1つ点検が抜ける（例文 Don't cut corners on safety checks.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '決まった順路'], [1.3, '角を近道'], [3.4, '点検が抜けた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  // 上から見た地図
  el('rect', { width: 400, height: 300, fill: '#E9F4EA' });
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#E9F4EA' });
  const P = [[60, 235], [60, 70], [330, 70]]; // スタート→角→ゴール手前
  el('path', { d: `M ${P[0][0]} ${P[0][1]} L ${P[1][0]} ${P[1][1]} L ${P[2][0]} ${P[2][1]}`, fill: 'none', stroke: '#CFD6DF', 'stroke-width': 34, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
  el('path', { d: `M ${P[0][0]} ${P[0][1]} L ${P[1][0]} ${P[1][1]} L ${P[2][0]} ${P[2][1]}`, fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-dasharray': '10 10', 'stroke-linejoin': 'round' });
  // 点検ポイント
  const pts = [[60, 160], [60, 70], [190, 70]];
  const marks = pts.map(([x, y]) => {
    const m = g({});
    tf(m, x, y);
    el('circle', { r: 15, fill: '#fff', stroke: pal.blueDark, 'stroke-width': 3 }, m);
    const ok = el('path', { d: 'M -7 0 L -2 5 L 8 -6', fill: 'none', stroke: pal.green, 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 }, m);
    return { m, ok };
  });
  const miss = g({});
  tf(miss, 60, 70);
  const ex = g({}, miss);
  k.text(0, 1, '!', { 'font-size': 20, fill: pal.red }, ex);
  // 旗
  const flag = g({ transform: 'translate(346 70)' });
  el('line', { x1: 0, y1: 16, x2: 0, y2: -22, stroke: pal.ink, 'stroke-width': 3 }, flag);
  el('path', { d: 'M 0 -22 L 22 -15 L 0 -8 Z', fill: pal.coral }, flag);
  el('rect', { x: 46, y: 218, width: 28, height: 28, rx: 6, fill: pal.mint, opacity: 0.0 });
  const b = k.buddy({ x: 60, y: 235, scale: 0.55 });
  const trail = el('path', { d: '', fill: 'none', stroke: pal.coralDark, 'stroke-width': 3, 'stroke-dasharray': '6 6', 'stroke-linecap': 'round' });
  const sh = el('path', { d: '', fill: 'none' });
  // 道順：(60,235)→(60,160)[点検1]→斜め→(190,70)[点検3]→ゴール
  const route = (u) => {
    // u 0..1
    const segs = [[60, 235, 60, 160, 0.18], [60, 160, 190, 70, 0.5], [190, 70, 330, 70, 0.32]];
    let a = u;
    for (const [x1, y1, x2, y2, w] of segs) {
      if (a <= w) return [lerp(x1, x2, a / w), lerp(y1, y2, a / w)];
      a -= w;
    }
    return [330, 70];
  };
  return {
    update(t) {
      const u = easeInOut(seg(t, 0.4, 3.6));
      const [x, y] = route(u);
      const moving = u > 0 && u < 1;
      const dx = route(Math.min(1, u + 0.01))[0] - x;
      b.pose({
        x, y: y + 12, walk: moving ? t * 10 : 0, facing: dx < -0.01 ? -1 : 1,
        mood: t > 3.7 ? 'sad' : 'smile', look: 0, armR: 8 + 10 * Math.sin(t * 10), armL: 8
      });
      const trn = u;
      // 点検チェック
      marks[0].ok.setAttribute('opacity', u > 0.18 ? 1 : 0);
      marks[1].ok.setAttribute('opacity', 0);
      marks[2].ok.setAttribute('opacity', u > 0.68 ? 1 : 0);
      // 近道の軌跡
      const done = u > 0.18 ? Math.min(1, (u - 0.18) / 0.5) : 0;
      k.set(trail, { d: done > 0 ? `M 60 160 L ${lerp(60, 190, done)} ${lerp(160, 70, done)}` : '' });
      // 抜けた点検
      const mp = backOut(seg(t, 3.4, 3.8), 2.4);
      tf(miss, 60, 70, 0, mp, mp);
      miss.setAttribute('opacity', t < 3.4 ? 0 : 1);
      k.set(marks[1].m.firstChild, { stroke: t > 3.4 ? pal.red : pal.blueDark });
    }
  };
}
