// fair：先生のまめが、並んだ3人の生徒に同じボールを1つずつ順番に手渡す。全員に同じチャンス（例文 The teacher gave everyone a fair chance.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hp, walkTo, path, person, scene, mark } from './confused.js';

export const meta = { duration: 4.4, beats: [[0.0, '3人が待つ'], [0.96, '順番に渡す'], [3.63, 'みんな同じ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1, KS = 0.7;
  const { FY } = scene(k);
  // 校庭：的（ゴール）
  el('rect', { x: 20, y: FY - 100, width: 6, height: 100, fill: pal.sub });
  el('circle', { cx: 23, cy: FY - 110, r: 18, fill: '#fff', stroke: pal.red, 'stroke-width': 5 });
  el('circle', { cx: 23, cy: FY - 110, r: 6, fill: pal.red });
  const X = [90, 160, 230];
  const kids = X.map((x, i) => person(k, ['coral', 'blue', 'yellow'][i], { x, y: FY, scale: KS, facing: 1 }));
  const b = k.buddy({ x: 330, y: FY, scale: S, facing: -1 });
  const balls = X.map(() => { const n = g({}); el('circle', { r: 8, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, n); el('path', { d: 'M -8 0 Q 0 -4 8 0', stroke: pal.yellowDark, 'stroke-width': 1.5, fill: 'none' }, n); return n; });
  // バディが持つボール入りのかご
  k.shadow(370, FY + 1, 20, 3);
  el('path', { d: `M 352 ${FY - 30} L 388 ${FY - 30} L 384 ${FY} L 356 ${FY} Z`, fill: pal.woodDark });
  el('circle', { cx: 364, cy: FY - 32, r: 8, fill: pal.yellow }); el('circle', { cx: 377, cy: FY - 33, r: 8, fill: pal.yellow });
  const eq = X.map(() => mark(k, 'check', undefined, 1.2));
  const T0 = [0.8, 1.8, 2.8];
  const bx = path([[0.6, 330], [1.2, X[2] + 46], [2.1, 330], [2.2, 330], [2.6, X[1] + 46]]);
  return {
    update(t) {
      t *= 4.6 / 4.4; // 4.4 秒に収める
      // 先生：かご→生徒→かご…と往復して1つずつ渡す（3人目は近くまで）
      const trip = (j) => path([[T0[j] - 0.8, 330], [T0[j], X[j] + 50], [T0[j] + 0.5, X[j] + 50], [T0[j] + 0.95, 330]]);
      const j = t < T0[0] + 0.95 ? 0 : t < T0[1] + 0.95 ? 1 : 2;
      const order = [2, 1, 0][j];
      const xf = (u) => { const f = trip(j); const tt = u - 0; return lerp(330, X[order] + 50, 0) + (f(u) - 330) * ((X[order] + 50 - 330) / (X[j] + 50 - 330)); };
      const w = walkTo(xf, t, 330, -1);
      const give = hump(seg(t, T0[j], T0[j] + 0.5));
      P(b, { x: w.x, walk: w.walk, facing: w.facing, lean: w.lean + 8 * give, armR: lerp(w.armR, 70, give), armL: w.armL, mood: 'smile', look: 0.5, blink: blinkAt(t) });
      X.forEach((x, i) => {
        const jj = [2, 1, 0].indexOf(i), tg = T0[jj];
        const got = t > tg + 0.25;
        const kp = kids[i];
        P(kp, { x, y: FY, facing: 1, armR: got ? 60 : 8 + 30 * hump(seg(t, tg - 0.3, tg + 0.2)), armL: 8, mood: got ? 'grin' : 'smile', look: 0.5, blink: blinkAt(t, i) });
        let pos;
        if (t < tg) { pos = b.state.facing ? hp(b, S, 'R') : null; if (jj !== j) pos = { x: 370, y: FY - 32 }; }
        else if (!got) pos = hp(b, S, 'R');
        else pos = hp(kp, KS, 'R');
        tf(balls[i], pos.x, pos.y - 6, 0, t < tg - 0.8 ? 0.001 : 1);
        tf(eq[i], x, FY - 90, 0, t > 3.8 ? 1.2 * easeOut(seg(t, 3.8 + i * 0.1, 4.1 + i * 0.1)) : 0.001);
      });
    }
  };
}
