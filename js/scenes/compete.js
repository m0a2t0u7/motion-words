// compete：コンテストの早押しクイズで、たくさんの生徒がボタンを押し合って競う（例文 Many students compete in the contest.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, hump } from '../ease.js';
import { P } from './run-after.js';
import { COL } from './queue-up.js';

export const meta = { duration: 4.2, beats: [[0, 'コンテスト'], [1.3, '早押し！'], [2.8, '競い合う']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.7;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#EFE8F7' });
  // ステージの幕と問題ボード・トロフィー
  el('rect', { x: 0, y: 0, width: 400, height: 16, fill: pal.violet });
  [0, 380].forEach((x) => el('rect', { x, y: 0, width: 20, height: FY, fill: pal.violet, opacity: 0.8 }));
  el('rect', { x: 140, y: 30, width: 120, height: 62, rx: 8, fill: pal.ink });
  const qq = k.text(200, 61, 'Q ?', { 'font-size': 26, fill: '#fff' });
  const tro = g({}); tf(tro, 300, 92);
  el('path', { d: 'M -12 -34 H 12 Q 12 -12 0 -10 Q -12 -12 -12 -34 Z', fill: pal.yellow }, tro);
  el('path', { d: 'M -12 -30 Q -22 -30 -12 -18 M 12 -30 Q 22 -30 12 -18', fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3 }, tro);
  el('rect', { x: -3, y: -10, width: 6, height: 8, fill: pal.yellowDark }, tro);
  el('rect', { x: -10, y: -3, width: 20, height: 5, rx: 2, fill: pal.yellowDark }, tro);
  const cols = ['mint', 'coral', 'blue', 'yellow', 'violet'];
  const xs = [48, 124, 200, 276, 352];
  const kids = [], lamps = [], scores = [], btns = [];
  xs.forEach((x, i) => {
    kids.push(k.buddy({ x, y: FY, scale: S, color: COL[cols[i]][0], dark: COL[cols[i]][1], facing: i < 2 ? 1 : -1 }));
  });
  xs.forEach((x, i) => {
    // 解答台
    k.shadow(x, FY + 1, 28, 4);
    el('rect', { x: x - 26, y: FY - 26, width: 52, height: 26, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
    scores.push(k.text(x, FY - 12, '0', { 'font-size': 15, fill: pal.ink }));
    btns.push(el('ellipse', { cx: x + (i < 2 ? 1 : -1) * 24, cy: FY - 28, rx: 9, ry: 4, fill: pal.red }));
    lamps.push(el('path', { d: `M ${x - 20} ${FY - 30} l -6 -6 M ${x} ${FY - 34} l 0 -9 M ${x + 20} ${FY - 30} l 6 -6`, stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0 }));
  });
  const press = [1.55, 1.62, 1.7, 1.58, 1.66], base = [3, 2, 3, 2, 1];
  return {
    update(t) {
      const ready = easeOut(seg(t, 0.3, 0.8));
      qq.textContent = t < 1.2 ? 'Q 7' : 'Q 7';
      tf(qq, 0, 0, 0, 1 + 0.12 * hump(seg(t, 1.1, 1.4)));
      kids.forEach((b, i) => {
        const p = seg(t, press[i] - 0.25, press[i]), up = 1 - seg(t, press[i] + 0.15, press[i] + 0.5);
        const hit = easeIn(p) * (up > 0 ? 1 : 0) + (t > press[i] + 0.5 ? 0 : 0);
        const lift = lerp(0, 1, ready) * (1 - easeIn(p)) * (t < press[i] ? 1 : 0);
        const arm = t < press[i] ? lerp(30, 150, lift) : lerp(40, 60, 1 - seg(t, press[i] + 0.1, press[i] + 0.6));
        const won = i === 0 && t > 2.4;
        P(b, { x: xs[i], y: FY, armR: won ? lerp(arm, 160, easeOut(seg(t, 2.4, 2.8))) : arm, armL: 20, lean: 10 * hump(seg(t, press[i] - 0.2, press[i] + 0.3)) + 4 * ready,
          facing: i < 2 ? 1 : -1, look: (i < 2 ? 1 : -1) * 0.5, mood: won ? 'grin' : t > 1.2 ? 'flat' : 'smile', lift: won ? 6 * Math.abs(Math.sin((t - 2.4) * 7)) : 0 });
        btns[i].setAttribute('ry', t > press[i] - 0.02 && t < press[i] + 0.25 ? 2 : 4);
        btns[i].setAttribute('fill', i === 0 && t > 1.55 ? pal.yellow : pal.red);
        const lit = i === 0 ? seg(t, 1.55, 1.7) * (1 - seg(t, 3.8, 4.2)) : 0;
        lamps[i].setAttribute('opacity', lit);
        scores[i].textContent = String(base[i] + (i === 0 && t > 2.4 ? 1 : 0));
        tf(scores[i], 0, 0, 0, 1);
      });
    }
  };
}
