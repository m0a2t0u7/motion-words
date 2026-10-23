// present：会議の席が全部うまり、議長のまめがクリップボードで一人ずつ出席を確かめてチェックを付ける（例文 All the members were present at the meeting.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, aim, person, hold, check, mark, officeBg, paper, pencil } from './confused.js';

export const meta = { duration: 4.4, beats: [[0, '会議の前'], [1.0, '一人ずつ確認'], [3.2, '全員そろった']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = officeBg(k, 236, 40);
  const X = [70, 130, 190, 250];
  const ppl = X.map((x, i) => person(k, ['coral', 'blue', 'yellow', 'violet'][i], { x, y: FY - 20, scale: 0.72 }));
  // 長いテーブル（手前）
  k.shadow(170, FY + 2, 150, 5);
  el('rect', { x: 30, y: FY - 54, width: 270, height: 10, rx: 4, fill: pal.wood });
  el('rect', { x: 40, y: FY - 44, width: 250, height: 30, fill: '#EAD3B0' });
  el('rect', { x: 46, y: FY - 14, width: 8, height: 14, fill: pal.woodDark }); el('rect', { x: 276, y: FY - 14, width: 8, height: 14, fill: pal.woodDark });
  X.forEach((x) => { const p = g({}); paper(k, p, 22, 8, 1); tf(p, x, FY - 58); });
  const b = k.buddy({ x: 352, y: FY, scale: S, facing: -1 });
  const clip = g({});
  el('rect', { x: -14, y: -4, width: 28, height: 36, rx: 3, fill: pal.woodDark }, clip);
  el('rect', { x: -11, y: 2, width: 22, height: 27, fill: '#fff' }, clip);
  const ticks = [0, 1, 2, 3].map((i) => check(k, 0, 8 + i * 6, 0.45, pal.green, clip));
  const big = X.map(() => mark(k, 'check', undefined, 1.4));
  return {
    update(t) {
      const tt = [1.0, 1.5, 2.0, 2.5];
      let idx = -1; tt.forEach((a, j) => { if (t > a - 0.1 && t < a + 0.4) idx = j; });
      P(b, { x: 352, facing: -1, armL: 60, armR: 20, look: 0.7, mood: t > 3.0 ? 'grin' : 'smile', blink: blinkAt(t) });
      if (idx >= 0) aim(b, S, 'R', X[idx], FY - 80);
      else if (t > 3.0) b.pose({ armR: lerp(20, 160, easeOut(seg(t, 3.0, 3.4))) });
      hold(k, b, S, clip, 'L', 0, 28, 1);
      ticks.forEach((c, j) => c(seg(t, tt[j] + 0.1, tt[j] + 0.35)));
      big.forEach((m, j) => { const q = seg(t, tt[j], tt[j] + 0.3); tf(m, X[j], FY - 100, 0, q > 0 ? 1.4 * easeOut(q) : 0.001); });
      ppl.forEach((p, j) => P(p, { y: FY - 20, look: 0.8, blink: blinkAt(t, j), mood: t > tt[j] ? 'grin' : 'smile', armL: t > tt[j] && t < tt[j] + 0.5 ? 150 : 8 }));
    }
  };
}
