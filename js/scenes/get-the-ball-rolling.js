// get the ball rolling：黙っている会議で、1人がボールを押して転がすと、通ったところのまめから次々に話が出る（例文 Let's get the ball rolling with a quick introduction.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';

export const meta = { duration: 4.3, beats: [[0, '静かな会議'], [1.2, '始める'], [2.3, '話が進む']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'indoor' });
  // ホワイトボード
  el('rect', { x: 140, y: 22, width: 120, height: 70, rx: 7, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 4 });
  [[154, 38, 60], [154, 52, 80], [154, 66, 44]].forEach(([x, y, w]) => el('line', { x1: x, y1: y, x2: x + w, y2: y, stroke: '#D5DBE5', 'stroke-width': 4, 'stroke-linecap': 'round' }));
  el('circle', { cx: 232, cy: 66, r: 12, fill: 'none', stroke: pal.mint, 'stroke-width': 4, opacity: 0.8 });

  const MS = 0.85, MY = 240;
  const XS = [92, 200, 308];
  const cols = [[pal.mint, pal.mintDark], [pal.coral, pal.coralDark], [pal.blue, pal.blueDark]];
  const crew = XS.map((x, i) => {
    const b = k.buddy({ x, y: MY, scale: MS, facing: i === 0 ? 1 : (i === 1 ? 1 : -1), color: cols[i][0], dark: cols[i][1] });
    // 「…」
    const dots = g({});
    el('circle', { cx: 10, cy: 38, r: 3.6, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2 }, dots);
    el('ellipse', { cx: 0, cy: 14, rx: 30, ry: 17, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2.5 }, dots);
    const ds = [-12, 0, 12].map((dx) => el('circle', { cx: dx, cy: 14, r: 3.2, fill: pal.sub }, dots));
    // 発話
    const say = g({});
    el('path', { d: 'M -32 -14 Q -32 -22 -24 -22 L 24 -22 Q 32 -22 32 -14 L 32 10 Q 32 18 24 18 L 6 18 L -2 32 L -4 18 L -24 18 Q -32 18 -32 10 Z', fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, say);
    const ls = [[-8, 0.8], [3, 0.55]].map(([y, w]) => el('line', { x1: -20, y1: y, x2: -20 + 40 * w, y2: y, stroke: cols[i][0], 'stroke-width': 5, 'stroke-linecap': 'round' }, say));
    return { b, dots, ds, say, ls, x };
  });

  // テーブル（手前）
  el('rect', { x: 30, y: 226, width: 12, height: 24, rx: 3, fill: pal.woodDark });
  el('rect', { x: 358, y: 226, width: 12, height: 24, rx: 3, fill: pal.woodDark });
  el('rect', { x: 14, y: 204, width: 372, height: 20, rx: 8, fill: '#F1DDBB' });
  el('rect', { x: 14, y: 220, width: 372, height: 22, rx: 6, fill: pal.wood });
  el('rect', { x: 20, y: 206, width: 360, height: 4, rx: 2, fill: '#FFFFFF', opacity: 0.35 });
  k.shadow(200, 252, 190, 5);

  // ボール
  const R = 11;
  const bsh = el('ellipse', { rx: 11, ry: 3, fill: 'rgba(40,52,70,0.2)' });
  const ball = g({});
  const spin = g({}, ball);
  el('circle', { r: R, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, spin);
  el('path', { d: `M ${-R} 0 Q 0 -6 ${R} 0`, fill: 'none', stroke: pal.blue, 'stroke-width': 2.4 }, spin);
  el('path', { d: `M 0 ${-R} Q 6 0 0 ${R}`, fill: 'none', stroke: pal.blue, 'stroke-width': 2.4 }, spin);
  el('circle', { cx: -4, cy: -4, r: 2.6, fill: '#FFFFFF', opacity: 0.6 }, ball);
  const sparks = [[150, 120], [250, 120], [200, 148]].map(([x, y], i) => {
    const s = g({});
    el('path', { d: 'M 0 -8 Q 1.5 -1.5 8 0 Q 1.5 1.5 0 8 Q -1.5 1.5 -8 0 Q -1.5 -1.5 0 -8 Z', fill: i % 2 ? pal.yellow : pal.mint }, s);
    return { s, x, y };
  });

  const BY0 = 204 - R + 1;
  const X0 = 134, X1 = 350, TS = 1.45, TE = 3.3;
  const bx = (t) => {
    if (t < TS) return X0;
    const u = seg(t, TS, TE);
    return lerp(X0, X1, 1 - Math.pow(1 - u, 2.2));
  };
  const SAY = [1.5, 1.85, 2.55];

  return {
    update(t) {
      const x = bx(t);
      tf(ball, x, BY0);
      tf(spin, 0, 0, (x - X0) / R * (180 / Math.PI));
      tf(bsh, x + 2, 206);
      // A：ボールを押す
      const reach = easeInOut(seg(t, 0.85, 1.3));
      const poke = easeOut(seg(t, 1.3, 1.5)) * (1 - easeInOut(seg(t, 1.6, 2.1)));
      const aA = lerp(8, 66, reach) * (1 - easeInOut(seg(t, 1.6, 2.1))) + 8 * easeInOut(seg(t, 1.6, 2.1)) + 14 * poke;
      crew.forEach((c, i) => {
        const said = t >= SAY[i];
        const sp = said ? backOut(seg(t, SAY[i], SAY[i] + 0.3), 2) : 0;
        const talk = said ? 0.5 + 0.5 * Math.sin((t - SAY[i]) * 9 + i) : 0;
        const pose = {
          mood: said ? (i === 0 ? 'smile' : 'smile') : 'flat',
          look: i === 0 ? (t < 0.85 ? 0 : 0.8) : (i === 2 ? -0.2 : 0.3),
          lean: i === 0 ? 8 * reach * (1 - seg(t, 1.6, 2.1)) : 0,
          armR: i === 0 ? aA : 8, armL: 8,
          squash: 1
        };
        if (said && i > 0) pose.mood = talk > 0.5 ? 'open' : 'smile';
        if (said && i === 0) pose.mood = talk > 0.5 ? 'open' : 'smile';
        c.b.pose(pose);
        // 「…」→ 発話
        const dp = (1 - (said ? 1 : 0)) * seg(t, 0.2, 0.5);
        c.dots.setAttribute('opacity', dp);
        tf(c.dots, c.x + (i === 2 ? -4 : 4), 112 + 2 * Math.sin(t * 2 + i), 0, 1, 1);
        c.ds.forEach((d, j) => d.setAttribute('opacity', 0.35 + 0.65 * Math.max(0, Math.sin(t * 3 - j * 0.9))));
        tf(c.say, c.x + (i === 2 ? -6 : 6), 106 - 3 * talk * 0, 0, sp, sp);
        c.say.setAttribute('opacity', said ? 1 : 0);
        c.ls.forEach((l, j) => l.setAttribute('opacity', 0.5 + 0.5 * Math.sin(t * 8 + j * 2 + i) * (said ? 1 : 0) * 0 + (said ? 0.5 : 0)));
      });
      sparks.forEach((q, i) => {
        const u = seg(t, 3.3 + i * 0.1, 3.8 + i * 0.1);
        const sc = u <= 0 ? 0 : u >= 1 ? 0.9 + 0.15 * Math.sin(t * 8 + i) : easeOut(u);
        tf(q.s, q.x, q.y, t * 40, sc, sc);
      });
    }
  };
}
