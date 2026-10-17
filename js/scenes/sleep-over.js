// sleep over：友だちが家に来て、寝袋を並べて一晩泊まる（例文 My friend slept over at my house.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';

export const meta = { duration: 5.0, beats: [[0, '友だちが来る'], [2.0, '寝袋に入る'], [3.6, '並んで眠る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 252, mood: 'indoor' });
  // 窓（外が暗くなる）と壁のしるし
  el('rect', { x: 150, y: 44, width: 100, height: 76, rx: 8, fill: '#DDEFFA' });
  const night = el('rect', { x: 150, y: 44, width: 100, height: 76, rx: 8, fill: '#33406A', opacity: 0 });
  const moon = el('path', { d: 'M 0 -11 a 11 11 0 1 0 11 11 a 8 8 0 1 1 -11 -11 Z', fill: '#FFE9A8', opacity: 0 });
  el('line', { x1: 200, y1: 44, x2: 200, y2: 120, stroke: '#fff', 'stroke-width': 4 });
  el('line', { x1: 150, y1: 82, x2: 250, y2: 82, stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // 家のしるし（玄関のドア）
  el('rect', { x: 0, y: 120, width: 52, height: FY - 120, fill: '#56607A' });
  el('rect', { x: 0, y: 112, width: 62, height: 8, rx: 3, fill: pal.woodDark });
  el('circle', { cx: 40, cy: 190, r: 4, fill: pal.yellow });
  const FC = 118, FM = 262;       // 寝る位置（足元の x）
  // 枕
  [FC, FM].forEach((x) => el('ellipse', { cx: x + 88, cy: FY - 24, rx: 24, ry: 12, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 }));
  [[FC, pal.blueDark], [FM, pal.yellowDark]].forEach(([x, col]) => el('rect', { x: x - 8, y: FY - 8, width: 74, height: 10, rx: 5, fill: col }));
  const gc = g({}), gm = g({});
  const c = k.buddy({ parent: gc, x: 0, y: 0, color: pal.coral, dark: pal.coralDark });
  const m = k.buddy({ parent: gm, x: 0, y: 0, facing: -1 });
  [c, m].forEach((q) => q.g.firstChild.setAttribute('display', 'none'));
  const stand = k.shadow(0, FY + 2, 28, 6);
  const stand2 = k.shadow(0, FY + 2, 28, 6);
  // 寝袋：床の敷き部分（立っている間も見える）と、寝たときに体を覆う上側
  const bag = (x, col, dk) => {
    const cover = g({});
    el('rect', { x: x - 8, y: FY - 46, width: 44, height: 48, rx: 16, fill: col }, cover);
    el('rect', { x: x - 8, y: FY - 46, width: 44, height: 9, rx: 4, fill: '#fff', opacity: 0.3 }, cover);
    return cover;
  };
  const bagC = bag(FC, pal.blue), bagM = bag(FM, pal.yellow);
  const zz = g({});
  ['Z', 'z'].forEach((s, i) => k.text(i * 14, -i * 16, s, { 'font-size': 20 - i * 5, fill: pal.sub }, zz));
  const dark = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#1F2750', opacity: 0 });
  return {
    update(t) {
      // 友だちが左から来る → あいさつ → 寝袋のほうへ
      const arrive = easeOut(seg(t, 0, 1.3));
      const go = easeInOut(seg(t, 1.8, 2.5));
      const lie = easeInOut(seg(t, 2.5, 3.2));
      const walkA = t < 1.3 || (t > 1.8 && t < 2.5);
      const wv = Math.sin(t * 14) * 14 * hump(seg(t, 1.3, 1.9));
      const cx0 = lerp(-20, 150, arrive);
      const cx = t < 1.8 ? cx0 : lerp(150, FC, go);
      const mxs = t < 1.8 ? 220 : lerp(220, FM, go);
      const lyC = FY - 28 * lie, lyM = FY - 28 * lie;
      const fall = (q, g_, x, y, face) => { tf(g_, x, y, face * 90 * lie); };
      c.pose({ walk: walkA ? t * 9 : 0, armR: t < 1.3 ? 8 + Math.sin(t * 9) * 16 : t < 1.9 ? 100 + wv : 8, armL: 8 - 8 * lie, look: 0.4, facing: t < 1.8 ? 1 : (go > 0.5 && lie < 0.01 ? -1 : (t < 1.8 ? 1 : (lie > 0 ? 1 : -1))),
        mood: lie > 0.8 ? 'smile' : 'grin', blink: lie > 0.9 ? 1 : 0 });
      m.pose({ walk: t > 1.8 && t < 2.5 ? t * 9 : 0, armR: t > 0.9 && t < 1.8 ? 100 + Math.sin(t * 14) * 14 : 8, armL: 8, look: 0.4, facing: t < 1.8 ? -1 : 1,
        mood: lie > 0.8 ? 'smile' : 'grin', blink: lie > 0.9 ? 1 : 0 });
      bagC.setAttribute('opacity', lie > 0.6 ? 1 : 0); bagM.setAttribute('opacity', lie > 0.6 ? 1 : 0);
      tf(gc, cx, lyC, 90 * lie);
      tf(gm, mxs, lyM, 90 * lie);
      // 影：立っている間だけ、足元に
      k.set(stand, { cx: cx, opacity: 1 - lie });
      k.set(stand2, { cx: mxs, opacity: 1 - lie });
      // 夜になる
      const nt = seg(t, 3.0, 4.4);
      night.setAttribute('opacity', nt);
      moon.setAttribute('opacity', nt);
      tf(moon, 228, 70);
      dark.setAttribute('opacity', nt * 0.22);
      tf(zz, FC + 100, FY - 66 - 6 * Math.sin(t * 3));
      zz.setAttribute('opacity', seg(t, 3.5, 4.1));
    }
  };
}
