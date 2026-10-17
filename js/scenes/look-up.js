// look up：辞書を開き、指で見出し語をたどって1つに止まり、意味を確かめる（例文 I looked up the word in a dictionary.）
import { seg, lerp, easeInOut, easeOut, backOut, smooth, hump } from '../ease.js';

const R = 4.6 / 4.4; // 内部の時間割は 4.6 秒分。表示は 4.4 秒に収める
export const meta = { duration: 4.4, beats: [[0, '辞書を開く'], [1.0, '指でたどる'], [2.9, '見つけて確かめる']].map(([a, n]) => [+(a / R).toFixed(2), n]) };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 300, mood: 'indoor' });
  const ROW0 = 62, STEP = 21, TARGET = 5;
  // 本
  el('rect', { x: 34, y: 38, width: 332, height: 240, rx: 14, fill: 'rgba(40,52,70,0.10)' });
  el('rect', { x: 30, y: 30, width: 340, height: 240, rx: 14, fill: pal.coralDark });
  const left = g({ }), right = g({});
  const mkPage = (parent, x0, w, side) => {
    el('rect', { x: x0, y: 40, width: w, height: 220, rx: 6, fill: '#FFFFFF' }, parent);
    el('rect', { x: side < 0 ? x0 + w - 26 : x0, y: 40, width: 26, height: 220, fill: k.gradient([[0, side < 0 ? 'rgba(0,0,0,0)' : 'rgba(40,52,70,0.10)'], [1, side < 0 ? 'rgba(40,52,70,0.10)' : 'rgba(0,0,0,0)']], false) }, parent);
  };
  mkPage(right, 202, 156, 1);
  mkPage(left, 42, 156, -1);
  tf(left, 198, 0, 0, 1, 1);
  const rows = [];
  const mkRows = (parent, x0, seed) => {
    for (let i = 0; i < 9; i++) {
      const y = ROW0 + i * STEP, hw = 24 + ((i * 7 + seed) % 5) * 5;
      const r = g({}, parent);
      el('rect', { x: x0, y: y - 3, width: hw, height: 7, rx: 3.5, fill: pal.coral, opacity: 0.75 }, r);
      el('rect', { x: x0 + hw + 6, y: y - 2, width: 96 - hw, height: 4, rx: 2, fill: pal.line }, r);
      el('rect', { x: x0, y: y + 8, width: 110 - (i % 3) * 14, height: 4, rx: 2, fill: '#EEF1F5' }, r);
      rows.push(r);
    }
  };
  mkRows(left, 56, 0);
  mkRows(right, 214, 2);
  // 見つけた行のハイライト
  const hl = el('rect', { x: 52, y: ROW0 + TARGET * STEP - 9, width: 142, height: 22, rx: 6, fill: pal.yellow, opacity: 0 });
  const ty = ROW0 + TARGET * STEP;
  // 拡大カード
  const card = g({});
  el('rect', { x: -112, y: -62, width: 232, height: 128, rx: 18, fill: 'rgba(40,52,70,0.14)' }, card);
  el('rect', { x: -116, y: -66, width: 232, height: 128, rx: 18, fill: '#FFFFFF', stroke: pal.yellowDark, 'stroke-width': 4 }, card);
  el('rect', { x: -116, y: -66, width: 232, height: 14, rx: 8, fill: pal.yellow, opacity: 0.35 }, card);
  k.text(-92, -30, 'word', { 'font-size': 30, fill: pal.coralDark, 'text-anchor': 'start' }, card);
  el('rect', { x: -92, y: -2, width: 150, height: 7, rx: 3.5, fill: pal.line }, card);
  el('rect', { x: -92, y: 16, width: 180, height: 7, rx: 3.5, fill: pal.line }, card);
  el('rect', { x: -92, y: 34, width: 110, height: 7, rx: 3.5, fill: pal.line }, card);
  const tick = el('path', { d: 'M 78 -40 L 88 -30 L 104 -52', stroke: pal.green, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': '1 2' }, card);
  // 指
  const arm = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: pal.mintDark, 'stroke-width': 13, 'stroke-linecap': 'round' });
  const finger = g({});
  el('line', { x1: 0, y1: 0, x2: 13, y2: 15, stroke: pal.mintDark, 'stroke-width': 11, 'stroke-linecap': 'round' }, finger);
  el('line', { x1: 0, y1: 0, x2: 13, y2: 15, stroke: pal.mint, 'stroke-width': 6, 'stroke-linecap': 'round' }, finger);
  el('circle', { cx: 18, cy: 21, r: 11, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 3 }, finger);

  const tip = (t) => {
    const start = [330, 320], first = [66, ROW0];
    if (t < 1.4) {
      const p = easeInOut(seg(t, 0.85, 1.4));
      return [lerp(start[0], first[0], p), lerp(start[1], first[1], p)];
    }
    if (t < 2.45) {
      const q = seg(t, 1.4, 2.4) * TARGET;
      const i = Math.min(TARGET - 1, Math.floor(q)), f = q - i;
      const yy = ROW0 + STEP * (seg(t, 1.4, 2.4) >= 1 ? TARGET : i + smooth(Math.min(1, f * 1.7)));
      return [66 + Math.sin(t * 9) * 1.5, yy];
    }
    const p = easeInOut(seg(t, 3.1, 3.7));
    return [lerp(66, 330, p), lerp(ty, 320, p)];
  };

  return {
    update(tt) {
      const t = tt * R;
      // 辞書が開く：左ページがめくれて広がる
      const op = easeOut(seg(t, 0.1, 0.8));
      tf(left, 198 - 0 * op, 0, 0, 1, 1);
      left.setAttribute('transform', `translate(198 0) scale(${(0.02 + 0.98 * op).toFixed(3)} 1) translate(-198 0)`);
      const pop = 1 + 0.03 * hump(seg(t, 0.1, 0.9));
      rows.forEach((r, i) => {
        const side = i < 9 ? 0 : 1;
        r.setAttribute('opacity', easeOut(seg(t, 0.55 + (i % 9) * 0.03, 0.9 + (i % 9) * 0.03)));
      });
      // 指
      const [x, y] = tip(t);
      const vis = t > 0.85 && t < 3.75;
      finger.setAttribute('opacity', vis ? 1 : 0);
      arm.setAttribute('opacity', vis ? 1 : 0);
      tf(finger, x, y, 0, 1, 1);
      k.set(arm, { x1: x + 18, y1: y + 21, x2: x + 100, y2: y + 150 });
      // ハイライト
      const hp = easeOut(seg(t, 2.5, 2.85));
      hl.setAttribute('opacity', 0.9 * hp * (1 - 0.0 * seg(t, 3.0, 3.6)));
      k.set(hl, { width: 142 * hp });
      // カード
      const cp = backOut(seg(t, 2.95, 3.55), 1.3);
      const cx = lerp(110, 200, easeOut(seg(t, 2.95, 3.55))), cy = lerp(ty, 148, easeOut(seg(t, 2.95, 3.55)));
      card.setAttribute('opacity', t > 2.95 ? 1 : 0);
      tf(card, cx, cy, 0, Math.max(0.01, cp * 0.92) * pop, Math.max(0.01, cp * 0.92) * pop);
      tick.setAttribute('stroke-dashoffset', 1 - easeOut(seg(t, 3.6, 4.0)));
    }
  };
}
