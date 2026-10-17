// fill in：用紙の空欄に順番に書き込み、最後にチェックを入れる（例文 Please fill in this form.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '空欄がある'], [1.1, '書き込む'], [3.3, '埋まった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 300, mood: 'indoor' });
  // クリップボードと用紙
  el('rect', { x: 104, y: 14, width: 204, height: 290, rx: 16, fill: 'rgba(40,52,70,0.10)' });
  el('rect', { x: 98, y: 8, width: 204, height: 288, rx: 16, fill: pal.wood });
  el('rect', { x: 112, y: 30, width: 176, height: 252, rx: 6, fill: '#FFFFFF' });
  el('rect', { x: 166, y: 0, width: 68, height: 30, rx: 8, fill: '#8F9BB0' });
  el('rect', { x: 178, y: 10, width: 44, height: 12, rx: 5, fill: '#C9D1DE' });
  el('rect', { x: 128, y: 46, width: 90, height: 12, rx: 6, fill: pal.line });
  el('rect', { x: 128, y: 64, width: 144, height: 5, rx: 2.5, fill: '#EEF1F5' });

  const BX = 160, BW = 116, BH = 26;
  const rows = [{ y: 104, label: '名前' }, { y: 150, label: '日付' }, { y: 196, label: '住所' }];
  const done = rows.map(() => 0);
  const boxes = rows.map((r) => {
    k.text(130, r.y, r.label, { 'font-size': 12, fill: pal.sub, 'text-anchor': 'start' });
    const gr = el('rect', { x: BX, y: r.y - BH / 2, width: BW, height: BH, rx: 5, fill: '#E3F6EA', stroke: '#7DD3A0', 'stroke-width': 2 });
    const yl = el('rect', { x: BX, y: r.y - BH / 2, width: BW, height: BH, rx: 5, fill: '#FFF3CF', stroke: '#F0B93B', 'stroke-width': 2, 'stroke-dasharray': '5 4' });
    return { gr, yl };
  });
  k.text(130, 246, '確認', { 'font-size': 12, fill: pal.sub, 'text-anchor': 'start' });
  const cbY = el('rect', { x: 164, y: 234, width: 24, height: 24, rx: 6, fill: '#FFF3CF', stroke: '#F0B93B', 'stroke-width': 2, 'stroke-dasharray': '5 4' });
  const cbG = el('rect', { x: 164, y: 234, width: 24, height: 24, rx: 6, fill: '#E3F6EA', stroke: '#7DD3A0', 'stroke-width': 2 });
  el('rect', { x: 200, y: 241, width: 62, height: 5, rx: 2.5, fill: '#EEF1F5' });

  // 手書きの線（点列）
  const wave = (x0, y0, n, step, amp, ph) => Array.from({ length: n }, (_, i) => [x0 + i * step, y0 + Math.sin(i * 0.95 + ph) * amp * (0.55 + 0.45 * Math.sin(i * 0.35 + ph * 2))]);
  const oval = (cx, cy, rx, ry) => Array.from({ length: 15 }, (_, i) => { const a = -Math.PI / 2 + (i / 14) * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const strokes = [
    { f: 0, pts: wave(168, 104, 34, 2.8, 8, 0.4) },
    { f: 1, pts: [[169, 146], [175, 141], [175, 160]] },
    { f: 1, pts: oval(192, 150, 6, 10) },
    { f: 1, pts: [[207, 160], [215, 140]] },
    { f: 1, pts: [[224, 146], [228, 141], [228, 160]] },
    { f: 1, pts: [[238, 142], [252, 142], [244, 160]] },
    { f: 2, pts: wave(168, 196, 24, 2.6, 7, 1.6) },
    { f: 2, pts: wave(236, 196, 12, 2.6, 6, 0.2) },
    { f: 3, pts: [[169, 246], [175, 254], [191, 232]] }
  ];
  strokes.forEach((s) => {
    s.len = 0; s.cum = [0];
    for (let i = 1; i < s.pts.length; i++) { s.len += Math.hypot(s.pts[i][0] - s.pts[i - 1][0], s.pts[i][1] - s.pts[i - 1][1]); s.cum.push(s.len); }
    const col = s.f === 3 ? pal.green : '#3A5BA8';
    s.node = el('path', { d: 'M ' + s.pts.map((p) => p.join(' ')).join(' L '), fill: 'none', stroke: col, 'stroke-width': s.f === 3 ? 4.5 : 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': '1 2', 'stroke-dashoffset': 1 });
  });
  // 各ストロークの時間割
  const win = [[1.1, 1.8], [1.95, 2.55], [2.7, 3.3], [3.45, 3.8]];
  win.forEach(([a, b], f) => {
    const ss = strokes.filter((s) => s.f === f);
    const total = ss.reduce((m, s) => m + s.len, 0) + (ss.length - 1) * 8;
    let c = 0;
    ss.forEach((s) => { s.t0 = lerp(a, b, c / total); c += s.len; s.t1 = lerp(a, b, c / total); c += 8; });
  });
  const pointAt = (s, p) => {
    const d = p * s.len;
    let i = 1;
    while (i < s.cum.length - 1 && s.cum[i] < d) i++;
    const q = (d - s.cum[i - 1]) / Math.max(0.001, s.cum[i] - s.cum[i - 1]);
    return [lerp(s.pts[i - 1][0], s.pts[i][0], q), lerp(s.pts[i - 1][1], s.pts[i][1], q)];
  };

  // 手とペン
  const arm = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: pal.mintDark, 'stroke-width': 11, 'stroke-linecap': 'round' });
  const pen = g({});
  const pr = g({}, pen);
  el('path', { d: 'M 0 0 L -3.6 -10 L 3.6 -10 Z', fill: '#F5D7B2', stroke: '#C9A577', 'stroke-width': 1, 'stroke-linejoin': 'round' }, pr);
  el('path', { d: 'M -1 -3.5 L 1 -3.5 L 1.6 -7 L -1.6 -7 Z', fill: pal.ink }, pr);
  el('rect', { x: -4.5, y: -62, width: 9, height: 53, rx: 4, fill: pal.coral }, pr);
  el('rect', { x: -2.4, y: -58, width: 2.6, height: 40, rx: 1.3, fill: '#FFFFFF', opacity: 0.45 }, pr);
  el('circle', { cx: 0, cy: -40, r: 10.5, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 3 }, pr);
  const LEAN = 26;

  // 書き順の時刻から、ペン先の位置を求める（t だけで決まる）
  const tip = (t) => {
    const IN = [440, 250], OUT = [450, 290];
    const first = strokes[0], last = strokes[strokes.length - 1];
    if (t < first.t0) { const p = easeInOut(seg(t, 0.3, first.t0)); const s = pointAt(first, 0); return [lerp(IN[0], s[0], p), lerp(IN[1], s[1], p) - hump(p) * 8, p < 1 ? 14 : 0]; }
    for (let i = 0; i < strokes.length; i++) {
      const s = strokes[i];
      if (t <= s.t1) { const p = seg(t, s.t0, s.t1); const q = pointAt(s, p); return [q[0], q[1], 0]; }
      const nx = strokes[i + 1];
      if (nx && t < nx.t0) {
        const p = easeInOut(seg(t, s.t1, nx.t0));
        const a = pointAt(s, 1), b = pointAt(nx, 0);
        return [lerp(a[0], b[0], p), lerp(a[1], b[1], p), hump(p) * 12];
      }
    }
    const p = easeInOut(seg(t, last.t1 + 0.1, 4.3));
    const a = pointAt(last, 1);
    return [lerp(a[0], OUT[0], p), lerp(a[1], OUT[1], p) - hump(p) * 6, 6 * p];
  };

  return {
    update(t) {
      strokes.forEach((s) => s.node.setAttribute('stroke-dashoffset', 1 - seg(t, s.t0, s.t1)));
      win.forEach(([a, b], f) => { if (f < 3) done[f] = easeOut(seg(t, b - 0.15, b + 0.25)); });
      const pulse = 0.55 + 0.45 * Math.sin(t * 7);
      boxes.forEach((bx, i) => {
        bx.gr.setAttribute('opacity', done[i]);
        bx.yl.setAttribute('opacity', (1 - done[i]) * (t < 1.0 ? pulse : 1));
      });
      const cd = easeOut(seg(t, 3.7, 4.0));
      cbG.setAttribute('opacity', cd);
      cbY.setAttribute('opacity', (1 - cd) * (t < 1.0 ? pulse : 1));
      const [x, y, lift] = tip(t);
      tf(pen, x + lift * 0.45, y - lift, LEAN);
      const hx = x + lift * 0.45 + Math.sin((LEAN * Math.PI) / 180) * 40, hy = y - lift - Math.cos((LEAN * Math.PI) / 180) * 40;
      k.set(arm, { x1: hx, y1: hy, x2: hx + 70, y2: hy + 80 });
    }
  };
}
