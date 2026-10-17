// twist someone's arm：来たがらない相手に頼み込み、手を引いて説得→相手が納得してパーティーへ一緒に向かう（He didn't want to come, but I twisted his arm.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '行きたくない'], [1.6, '手を引く'], [3.6, '一緒に行く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  // パーティー会場（左）
  el('rect', { x: 4, y: 96, width: 120, height: FY - 96, rx: 5, fill: '#FBE9DC' });
  el('path', { d: 'M -2 104 L 64 52 L 130 104 Z', fill: pal.violet, stroke: pal.violet, 'stroke-width': 6, 'stroke-linejoin': 'round' });
  el('rect', { x: 36, y: FY - 78, width: 56, height: 78, rx: 4, fill: '#FFD98A' });
  el('circle', { cx: 82, cy: FY - 38, r: 3, fill: pal.yellowDark });
  el('rect', { x: 28, y: FY - 4, width: 72, height: 6, rx: 3, fill: pal.woodDark });
  // 旗の飾り
  el('path', { d: 'M 4 112 Q 64 130 124 112', fill: 'none', stroke: pal.sub, 'stroke-width': 1.5 });
  [[20, 0], [44, 1], [68, 2], [92, 3], [112, 0]].forEach(([x, c]) => {
    const y = 112 + 18 * (1 - Math.pow((x - 64) / 60, 2)) * 0.95;
    el('path', { d: `M ${x - 6} ${y - 1} L ${x + 6} ${y - 1} L ${x} ${y + 12} Z`, fill: [pal.coral, pal.yellow, pal.mint, pal.blue][c] });
  });
  // 風船（ドア脇の柱に結ぶ）
  const bal = g({}); tf(bal, 110, FY - 4);
  const balls = [[-6, -128, pal.red], [10, -116, pal.yellow], [-16, -108, pal.blue]].map(([dx, dy, c]) => {
    const gg = g({}, bal);
    el('path', { d: `M 0 0 Q ${dx * 0.3} ${dy * 0.5} ${dx} ${dy + 14}`, fill: 'none', stroke: pal.sub, 'stroke-width': 1.2 }, gg);
    const b = g({}, gg); tf(b, dx, dy);
    el('ellipse', { rx: 11, ry: 14, fill: c }, b);
    el('ellipse', { cx: -4, cy: -5, rx: 3, ry: 4, fill: '#fff', opacity: 0.4 }, b);
    return { b, dx, dy };
  });
  // 吹き出し（×→○）
  const bub = g({});
  el('path', { d: 'M -17 -14 h 34 a 6 6 0 0 1 6 6 v 16 a 6 6 0 0 1 -6 6 h -12 l -5 8 l -5 -8 h -12 a 6 6 0 0 1 -6 -6 v -16 a 6 6 0 0 1 6 -6 z', fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, bub);
  const no = g({}, bub), yes = g({}, bub);
  el('path', { d: 'M -7 -7 L 7 7 M 7 -7 L -7 7', stroke: pal.red, 'stroke-width': 4, 'stroke-linecap': 'round' }, no);
  el('path', { d: 'M -8 0 L -2 6 L 8 -6', fill: 'none', stroke: pal.green, 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, yes);

  const me = k.buddy({ x: 170, y: FY, facing: 1 });
  const he = k.buddy({ x: 270, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  const gx = (t) => lerp(170, 100, easeInOut(seg(t, 2.1, 4.0)));
  const walkOf = (x0, f) => (t) => {
    const x = f(t), v = Math.abs(f(t + 0.02) - f(t - 0.02)) / 0.04, m = clamp(v / 25);
    const ph = Math.abs(x - x0) * 0.107;
    return { m, w: lerp(Math.round(ph / Math.PI) * Math.PI, ph, m) };
  };
  const wm = walkOf(170, gx);
  return {
    update(t) {
      balls.forEach((o, i) => tf(o.b, o.dx + 1.5 * Math.sin(t * 1.7 + i * 2), o.dy + 1.2 * Math.sin(t * 2.1 + i), 4 * Math.sin(t * 1.5 + i)));
      const hold = easeOut(seg(t, 1.2, 1.6));
      const turn = easeInOut(seg(t, 1.6, 2.0));
      const x = gx(t), { m, w } = wm(t);
      const f = lerp(1, -1, turn);
      const plead = (1 - hold) * (0.5 + 0.5 * Math.sin(t * 9));
      const hand = lerp(8, 85, hold);
      const front = f > 0;
      me.pose({
        x, facing: f, walk: w, lean: lerp(0, 8, hold) * (1 - turn * 0.2) + 3 * m,
        armR: front ? lerp(8, 90, hold) + 10 * plead * 0 : 8 + Math.sin(w) * 18 * m,
        armL: front ? 8 : 90 + Math.sin(w) * 4 * m,
        mood: t < 1.6 ? 'open' : 'grin', look: 0.4
      });
      // 相手：嫌がる→引かれる→納得して一緒に歩く
      const resist = hump(seg(t, 1.5, 3.0));
      const ok = easeOut(seg(t, 2.7, 3.1));
      const cx = hold > 0.5 ? x + 100 : 270;
      he.pose({
        x: cx, walk: w, facing: -1, armR: lerp(8, 90, hold), armL: 8 + Math.sin(w) * 14 * m,
        lean: lerp(-9 * (hold), 3, ok) * (hold > 0 ? 1 : 0) - 0,
        look: lerp(Math.sin(t * 9) * 0.9 * (1 - hold), -0.5, hold),
        mood: ok > 0.2 ? 'smile' : t < 1.2 ? 'flat' : 'sad', squash: 1 - 0.02 * Math.sin(t * 6) * resist
      });
      tf(bub, cx - 4, FY - 112 - 2 * Math.sin(t * 3));
      no.setAttribute('opacity', ok > 0.3 ? 0 : 1);
      yes.setAttribute('opacity', ok > 0.3 ? 1 : 0);
      tf(yes, 0, 0, 0, 0.6 + 0.4 * easeOut(seg(t, 2.8, 3.1)));
    }
  };
}
