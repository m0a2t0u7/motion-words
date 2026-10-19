// suitcase：旅行の前の晩、ベッドの服を運んでスーツケースに詰め、ふたを閉める（例文 I packed my suitcase the night before the long trip.）
import { seg, lerp, easeInOut, easeOut, wobble, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, walkTo, homeBg, track } from './bag.js';
import { calendar } from './so-far-so-good.js';

// 横から見たスーツケース（原点＝底の中央）。setLid(0=開 1=閉)
export function caseParts(k, col = '#F2685B', dark = '#C94A3F', w = 84, h = 30) {
  const { el } = k;
  const back = k.g({}), front = k.g({}), lid = k.g({});
  el('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 6, fill: dark }, back);
  el('rect', { x: -w / 2 + 5, y: -h + 4, width: w - 10, height: 6, rx: 2, fill: '#7E2E27', opacity: 0.6 }, back);
  el('rect', { x: 0, y: -12, width: w, height: 14, rx: 5, fill: col }, lid);
  el('rect', { x: 4, y: -3, width: w - 8, height: 4, rx: 2, fill: '#7E2E27', opacity: 0.5 }, lid);
  el('rect', { x: w / 2 - 8, y: -16, width: 16, height: 5, rx: 2, fill: k.pal.ink }, lid);
  el('rect', { x: -w / 2, y: -h * 0.62, width: w, height: h * 0.62, rx: 5, fill: col }, front);
  el('rect', { x: -w / 2, y: -h * 0.62, width: w, height: 3, fill: '#fff', opacity: 0.3 }, front);
  [-w / 2 + 10, w / 2 - 10].forEach((x) => el('circle', { cx: x, cy: 1, r: 3.5, fill: k.pal.ink }, front));
  return { back, front, lid, setLid(q, x, y) { k.tf(lid, x - w / 2, y - h + 2, lerp(-100, 0, q)); k.tf(back, x, y); k.tf(front, x, y); } };
}
export function folded(k, parent, col, dark) {
  const g = k.g({}, parent);
  k.el('rect', { x: -18, y: -5, width: 36, height: 10, rx: 3, fill: col }, g);
  k.el('line', { x1: -14, y1: 0, x2: 14, y2: 0, stroke: dark, 'stroke-width': 1.5, opacity: 0.6 }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '旅行の前の晩'], [1.0, '服を詰める'], [3.3, 'ふたを閉めた']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.05, FY = 236, CX = 150;
  homeBg(k, { FY, winX: 40, winW: 80, sky: '#3D4A78', wall: '#EDE6F0', mood: 'evening' });
  el('circle', { cx: 100, cy: 66, r: 9, fill: '#FFF3C4' });
  el('circle', { cx: 104, cy: 63, r: 8, fill: '#3D4A78' });
  [[56, 60], [70, 88], [92, 98]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 1.6, fill: '#fff' }));
  const cal = calendar(k, 200, 50, 40); cal.set('', 0);
  el('path', { d: 'M 189 82 l 10 -4 l 10 4 l -10 -1 Z M 199 78 l 0 8', stroke: pal.blueDark, 'stroke-width': 2.4, fill: pal.blue });
  // ベッド
  el('rect', { x: 290, y: FY - 44, width: 110, height: 30, rx: 6, fill: '#E9EEF8' });
  el('rect', { x: 290, y: FY - 20, width: 110, height: 20, fill: '#B8A6D9' });
  el('rect', { x: 384, y: FY - 76, width: 12, height: 76, rx: 4, fill: '#9C88C8' });
  const sc = caseParts(k);
  const stack = k.g({});
  const items = [[pal.blue, pal.blueDark], [pal.yellow, pal.yellowDark], ['#9ED3B2', pal.green]].map(([c, d], i) => { const f = folded(k, stack, c, d); tf(f, 0, -i * 10); return f; });
  const b = k.buddy({ x: 280, y: FY, scale: S, facing: -1 });
  sc.front.parentNode.appendChild(sc.front); sc.lid.parentNode.appendChild(sc.lid);
  const xf = (t) => lerp(280, 238, easeInOut(seg(t, 1.0, 1.9))) ;
  return {
    update(t) {
      const w = walkTo(xf, t, 280, 1);
      const face0 = t < 1.0 ? 1 : -1;
      P(b, { x: w.x, walk: w.walk, facing: t < 0.95 ? 1 : -1, lean: 0, look: 0.4, blink: blinkAt(t), mood: t > 3.7 ? 'grin' : 'smile' });
      // 服の束の位置（ベッド → 手 → スーツケース）
      let sx = 318, sy = FY - 49;
      const pick = easeInOut(seg(t, 0.3, 0.75));
      const drop = easeInOut(seg(t, 1.9, 2.5));
      const close = easeInOut(seg(t, 2.8, 3.5));
      let lean = 0;
      if (t < 0.95) { lean = 22 * pick; }
      else if (t < 1.9) { lean = 6; }
      else lean = lerp(6, 30, Math.max(drop * (1 - seg(t, 2.5, 2.8)), close * (1 - seg(t, 3.5, 3.9))) || 0);
      b.pose({ lean });
      const tgt = t < 0.95 ? { x: lerp(300, 318, pick), y: lerp(FY - 70, sy - 2, pick) }
        : t < 1.9 ? { x: w.x - 30, y: FY - 70 }
        : t < 2.8 ? { x: lerp(w.x - 30, CX + 6, drop), y: lerp(FY - 70, FY - 22, drop) }
        : { x: lerp(CX + 20, CX - 30, close), y: lerp(FY - 110, FY - 34, close) };
      if (t > 2.5 && t < 2.8) { const r = easeInOut(seg(t, 2.5, 2.8)); tgt.x = lerp(CX + 6, CX + 20, r); tgt.y = lerp(FY - 22, FY - 110, r); }
      b.pose({ armR: reach(b, S, 'R', tgt.x, tgt.y), armL: reach(b, S, 'L', tgt.x + 8, tgt.y) });
      const h = hp(b, S, 'R');
      if (t > 0.75 && t < 2.5) { sx = h.x - 6; sy = h.y + 4; }
      if (t >= 2.5) { sx = CX + 6; sy = FY - 12 + 2 * wobble(seg(t, 2.5, 3), 2, 5); }
      tf(stack, sx, sy); stack.setAttribute('opacity', close > 0.7 ? 0 : 1);
      sc.setLid(t < 2.8 ? 0 : close + wobble(seg(t, 3.5, 4.2), 2, 6) * 0.04, CX, FY);
      void face0; void items;
    }
  };
}
