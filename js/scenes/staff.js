// staff：ホテルのそろいの制服を着た3人のスタッフが、そろっておじぎして迎え、荷物を運び、飲み物を出す（例文 The hotel staff were very kind.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hp, aim, walkTo, path, person, wear, heart } from './confused.js';

export const meta = { duration: 4.4, beats: [[0.0, 'ホテルの人たち'], [1.34, 'みんなで迎える'], [2.87, '親切なスタッフ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95, SS = 0.85;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#F4ECDF' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#B9504A' });
  el('rect', { x: 0, y: FY, width: 400, height: 4, fill: '#9C3F3A' });
  [60, 200, 340].forEach((x) => { el('rect', { x: x - 12, y: 30, width: 24, height: 160, fill: '#EAD9C0' }); el('rect', { x: x - 16, y: 26, width: 32, height: 8, fill: pal.yellowDark }); });
  // そろいの制服（紺のベスト＋赤い蝶ネクタイ）
  const X = [230, 290, 350];
  const st = X.map((x, i) => person(k, ['coral', 'blue', 'yellow'][i], { x, y: FY, scale: SS, facing: -1 }));
  st.forEach((p) => { const w = wear(k, p); el('path', { d: 'M -28 -40 L 28 -40 L 26 -4 L -26 -4 Z', fill: '#2F3E5C' }, w); el('path', { d: 'M -8 -44 L 0 -40 L -8 -36 Z M 8 -44 L 0 -40 L 8 -36 Z', fill: pal.red }, w); });
  const team = el('rect', { x: 196, y: FY - 104, width: 186, height: 112, rx: 14, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-dasharray': '7 5', opacity: 0 });
  const b = k.buddy({ x: -40, y: FY, scale: S });
  const cas = g({});
  el('rect', { x: -15, y: 0, width: 30, height: 38, rx: 5, fill: pal.violet }, cas);
  el('rect', { x: -6, y: -6, width: 12, height: 6, rx: 3, fill: 'none', stroke: pal.ink, 'stroke-width': 2.5 }, cas);
  const cup = g({});
  el('path', { d: 'M -6 -14 L 6 -14 L 4 0 L -4 0 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, cup);
  el('rect', { x: -5, y: -11, width: 10, height: 4, fill: '#FFCF5C' }, cup);
  const hs = [0, 1, 2].map(() => heart(k));
  const xf = path([[0.1, -40], [1.3, 150]]);
  return {
    update(t) {
      t *= 4.6 / 4.4; // 4.4 秒に収める
      const w = walkTo(xf, t, -40, 1);
      P(b, { x: w.x, walk: w.walk, lean: w.lean, armL: w.armL, armR: 10, mood: t > 1.6 ? 'grin' : 'smile', look: 0.6, blink: blinkAt(t) });
      const bow = hump(seg(t, 1.3, 2.1));
      team.setAttribute('opacity', seg(t, 1.2, 1.5) * (0.6 + 0.4 * Math.sin(t * 4)));
      // 1人目：スーツケースを受け取る / 2人目：飲み物を手渡す
      const take = seg(t, 2.2, 2.6), serve = easeInOut(seg(t, 2.8, 3.4));
      st.forEach((p, i) => P(p, { x: X[i] - (i === 0 ? 26 * easeInOut(seg(t, 2.0, 2.4)) : 0) - (i === 1 ? 70 * serve : 0), walk: 0, facing: -1, lean: 30 * bow, mood: 'grin', look: 0.5, blink: bow > 0.4 ? 1 : blinkAt(t, i), armL: 8, armR: 8 }));
      const bh = hp(b, S, 'R');
      let ch = { x: bh.x + 4, y: bh.y };
      if (take > 0) { aim(st[0], SS, 'R', bh.x + 18, bh.y - 4); const s0 = hp(st[0], SS, 'R'); ch = take < 1 ? { x: lerp(bh.x + 4, s0.x, take), y: lerp(bh.y, s0.y, take) } : s0; }
      tf(cas, ch.x, ch.y + 4, 0, 1);
      if (t > 2.8) aim(st[1], SS, 'R', bh.x + 22, FY - 64);
      if (t > 3.2) aim(b, S, 'R', st[1].state.x - 26, FY - 62);
      const cp = t > 3.4 ? hp(b, S, 'R') : hp(st[1], SS, 'R');
      tf(cup, cp.x, cp.y, 0, t > 2.8 ? 1 : 0.001);
      hs.forEach((n, i) => { const q = seg(t, 3.5 + i * 0.25, 4.6); tf(n, 160 + i * 50, FY - 130 - 20 * q, 0, q > 0 ? 1.2 * hump(q * 0.7 + 0.3) : 0.001); });
    }
  };
}
