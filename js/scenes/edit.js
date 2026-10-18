// edit：動画編集。まめがマウスを操作し、いらない赤いクリップを切り取ってつなぎ直し、プレビューを確かめる（例文 He edited the video before posting it.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble } from '../ease.js';
import { reach, table } from './dig.js';

export const meta = { duration: 4.8, beats: [[0, '3つのクリップ'], [1.6, '切り取る'], [3.4, 'つないで確認']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  table(k, 150);
  el('rect', { x: 30, y: 46, width: 80, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // モニター
  el('rect', { x: 270, y: 148, width: 14, height: 32, fill: '#8EA0B6' }); el('rect', { x: 250, y: 176, width: 54, height: 6, rx: 3, fill: '#8EA0B6' });
  el('rect', { x: 196, y: 30, width: 162, height: 122, rx: 8, fill: '#3A4457' });
  el('rect', { x: 203, y: 37, width: 148, height: 108, rx: 4, fill: '#F5F7FA' });
  // プレビュー
  const pv = el('rect', { x: 211, y: 43, width: 132, height: 52, rx: 4, fill: pal.mint });
  const pvIcon = g({}); tf(pvIcon, 277, 69);
  el('circle', { r: 11, fill: '#fff', opacity: 0.85 }, pvIcon); el('path', { d: 'M -3 -5 L 5 0 L -3 5 Z', fill: pal.ink }, pvIcon);
  // タイムライン
  const TX = 211, TY = 104, TH = 22, S = 130 / 130;
  el('rect', { x: TX - 2, y: TY - 4, width: 136, height: 34, rx: 4, fill: '#E3E8EE' });
  const clip = (x, w, c, d) => { const n = g({}); tf(n, TX + x, TY + 2); const r = el('rect', { width: w, height: TH, rx: 4, fill: c, stroke: d, 'stroke-width': 1.5 }, n); return { n, r, w }; };
  const A = clip(0, 42, pal.mint, pal.mintDark), B = clip(42, 42, '#F26B6B', '#C94A4A'), C = clip(84, 46, pal.blue, pal.blueDark);
  const bx = el('path', { d: 'M 14 5 L 28 17 M 28 5 L 14 17', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round' }, B.n);
  const ph = el('line', { y1: TY - 8, y2: TY + 28, stroke: pal.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round' });
  const phh = el('circle', { r: 4, cy: TY - 8, fill: pal.ink });
  // はさみ
  const sc = g({});
  const bl = [-1, 1].map((d) => el('path', { d: 'M 0 0 L 0 -16 L 4 -16 Z', fill: '#B7C3D2', stroke: pal.sub, 'stroke-width': 1.2 }, sc));
  const post = g({}); tf(post, 327, 134);
  const pb = el('rect', { x: -14, y: -8, width: 28, height: 16, rx: 8, fill: pal.line }, post); el('path', { d: 'M 0 4 V -4 M -4 0 L 0 -4 L 4 0', stroke: '#fff', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, post);
  // マウス
  const mouse = g({}); el('rect', { x: -7, y: -5, width: 14, height: 11, rx: 6, fill: '#fff', stroke: pal.sub, 'stroke-width': 1.5 }, mouse);
  const b = k.buddy({ x: 120, y: 236 });
  return {
    update(t) {
      const m1 = seg(t, 0.8, 1.6), cut1 = seg(t, 1.6, 1.9), cut2 = seg(t, 2.0, 2.3), drop = seg(t, 2.3, 2.9), close = easeInOut(seg(t, 2.9, 3.4)), sweep = seg(t, 3.5, 4.7);
      const px = t < 3.5 ? lerp(TX + 6, TX + 84, easeInOut(seg(t, 0.8, 2.1))) : lerp(TX + 10, TX + 126, sweep);
      const phx = t < 3.5 ? px : lerp(TX + 6, TX + 126 - 42, easeInOut(sweep));
      k.set(ph, { x1: phx, x2: phx }); k.set(phh, { cx: phx });
      // はさみ
      const sOn = t > 1.5 && t < 2.5 ? 1 : 0, sx = t < 2.0 ? TX + 42 : TX + 84;
      const snap = Math.max(Math.abs(Math.sin((cut1 > 0 && cut1 < 1 ? cut1 : cut2) * Math.PI * 2)) * (cut2 < 1 ? 1 : 0), 0);
      sc.setAttribute('opacity', sOn); tf(sc, sx, TY - 6, 0, 1.7, 1.7);
      bl.forEach((l, i) => tf(l, 0, 0, (i ? 1 : -1) * (4 + 14 * snap)));
      // クリップ：Bを落とし、Cを左へ詰める
      tf(A.n, TX, TY + 2);
      tf(B.n, TX + 42, TY + 2 + 16 * drop * drop, 14 * drop, 1 - 0.1 * drop, 1); B.n.setAttribute('opacity', 1 - seg(t, 2.6, 3.0));
      tf(C.n, TX + lerp(84, 42, close), TY + 2);
      // プレビュー：位置に応じて映像が変わる
      const cut = t < 3.5 ? px - TX : (phx - TX), onC = t >= 3.5 && phx - TX > 42;
      k.set(pv, { fill: t < 1.0 ? pal.mint : t < 3.5 ? (px - TX < 42 ? pal.mint : px - TX < 84 ? '#F26B6B' : pal.blue) : (onC ? pal.blue : pal.mint) });
      pvIcon.setAttribute('opacity', t > 3.5 && t < 4.7 ? 0 : 1);
      const done = seg(t, 4.4, 4.8);
      k.set(pb, { fill: done > 0 ? pal.green : pal.line });
      tf(post, 327, 134, 0, 1 + 0.12 * Math.sin(done * Math.PI), 1 + 0.12 * Math.sin(done * Math.PI));
      // 人物：マウスを動かす
      const mx = 188 + 6 * Math.sin(t * 3) * (t > 0.6 && t < 4.4 ? 1 : 0), my = 189;
      tf(mouse, mx, my);
      b.pose({ armR: reach(b, 1, 'R', mx, my), lean: 4, look: 0.7, mood: t > 4.3 ? 'grin' : 'smile', squash: 1 });
    }
  };
}
