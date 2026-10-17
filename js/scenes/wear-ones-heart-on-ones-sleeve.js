// wear one's heart on one's sleeve：袖のハートが気持ちを映す。晴れで大喜び→雨で一気にしょんぼり、友だちにも一目で分かる（She wears her heart on her sleeve.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '晴れて大喜び'], [1.8, '雨が降る'], [3.2, 'すぐ表に出る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 14, width: 400, height: 14, fill: '#EDE6DB' });
  // 窓
  const WX = 150, WY = 36, WW = 100, WH = 90;
  const sky = el('rect', { x: WX, y: WY, width: WW, height: WH, rx: 6, fill: '#CFEAF8' });
  const clipId = k.clip((cp) => k.el('rect', { x: WX, y: WY, width: WW, height: WH, rx: 6 }, cp));
  const sun = el('circle', { cx: WX + 70, cy: WY + 30, r: 14, fill: pal.yellow, 'clip-path': clipId });
  const cl = g({ 'clip-path': clipId });
  const cloud = g({}, cl);
  [[-16, 0, 16], [0, -8, 20], [18, 0, 16], [4, 6, 18]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#9AA5B8' }, cloud));
  const rain = g({ 'clip-path': clipId });
  for (let i = 0; i < 7; i++) el('line', { x1: 0, y1: WY - 12, x2: -3, y2: WY + 60, stroke: pal.blueDark, 'stroke-dasharray': '7 17', 'stroke-width': 2, 'stroke-linecap': 'round', transform: `translate(${WX + 14 + i * 12} 0)` }, rain);
  el('line', { x1: WX + WW / 2, y1: WY, x2: WX + WW / 2, y2: WY + WH, stroke: '#fff', 'stroke-width': 4 });
  el('line', { x1: WX, y1: WY + WH / 2, x2: WX + WW, y2: WY + WH / 2, stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: WX - 6, y: WY + WH, width: WW + 12, height: 6, rx: 3, fill: pal.woodDark });

  const a = k.buddy({ x: 120, y: FY, facing: 1 });
  const c = k.buddy({ x: 280, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  // 袖のハート（腕に付く）
  const hg = g({}, c.armR.a); tf(hg, 0, 12);
  const heart = el('path', { d: 'M 0 7 C -14 -2 -8 -12 0 -5 C 8 -12 14 -2 0 7 Z', fill: pal.red, stroke: '#fff', 'stroke-width': 1.5 }, hg);
  const crack = el('path', { d: 'M 0 -5 L -2 0 L 2 3 L 0 7', fill: 'none', stroke: '#fff', 'stroke-width': 1.6 }, hg);
  const tear = el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6 Z', fill: pal.water });
  const hearts = [0, 1, 2].map(() => { const h = g({}); el('path', { d: 'M 0 5 C -10 -2 -6 -9 0 -4 C 6 -9 10 -2 0 5 Z', fill: pal.red }, h); return h; });

  return {
    update(t) {
      const rn = seg(t, 1.7, 2.3);      // 雲が来て雨
      const sad = easeOut(seg(t, 2.1, 2.5));
      tf(cloud, lerp(WX + WW + 40, WX + 46, easeInOut(rn)), WY + 24);
      sun.setAttribute('opacity', 1 - easeOut(seg(t, 1.8, 2.4)));
      k.set(sky, { fill: sad > 0 || rn > 0.5 ? '#BFC9D6' : '#CFEAF8' });
      rain.setAttribute('opacity', rn > 0.6 ? 1 : 0);
      tf(rain, 0, ((t * 90) % 24) - 12);
      const happy = 1 - seg(t, 1.9, 2.2);
      const jump = Math.abs(Math.sin(t * 7)) * 14 * happy * seg(t, 0.2, 0.6);
      c.pose({
        lift: jump, armL: 8 + 120 * happy * seg(t, 0.2, 0.6) * (0.6 + 0.4 * Math.sin(t * 14)),
        armR: lerp(8, 8, 0), lean: lerp(0, 10, sad), squash: 1 - 0.1 * sad - 0.04 * Math.sin(t * 7) * happy,
        mood: t < 1.9 ? 'grin' : 'sad', look: 0.2, blink: 0
      });
      // ハート：脈打つ赤→しぼんで青く割れる
      const beat = 1 + 0.25 * Math.max(0, Math.sin(t * 9)) * happy;
      tf(hg, 0, 12, 0, lerp(beat * 1.6, 1.2, sad));
      heart.setAttribute('fill', sad > 0.3 ? '#6A8FD0' : pal.red);
      crack.setAttribute('opacity', sad > 0.3 ? 1 : 0);
      const tp = seg(t, 2.6, 3.6);
      tf(tear, 262 + 2 * tp, FY - 55 + 36 * tp * tp);
      tear.setAttribute('opacity', tp > 0 && tp < 1 ? 1 : 0);
      hearts.forEach((h, i) => {
        const p = seg(t, 0.4 + i * 0.35, 1.5 + i * 0.35) * (t < 1.9 ? 1 : 0);
        tf(h, 262 - 10 + i * 14 + 6 * Math.sin(p * 6 + i), FY - 70 - 50 * p, 0, 0.7 + 0.5 * hump(p));
        h.setAttribute('opacity', p > 0 && p < 1 ? 1 - p * p : 0);
      });
      // 友だち：彼女の様子を見て同じ顔になる
      a.pose({ look: 0.7, mood: t < 1.9 ? 'smile' : 'sad', lean: lerp(0, 5, sad), armR: lerp(8, 40, hump(seg(t, 2.5, 3.6))), armL: 8 });
    }
  };
}
