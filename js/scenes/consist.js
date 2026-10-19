// consist：チームの旗の下に選手が次々と並び、10人そろって1つのチームになる（例文 The team consists of ten players.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { walk, path } from './queue-up.js';

export const meta = { duration: 4.4, beats: [[0, 'チーム'], [0.8, '選手が集まる'], [3.4, '10人のチーム']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'outdoor' });
  el('rect', { x: 0, y: FY - 4, width: 400, height: 70, fill: '#CDEBC5' });
  el('rect', { x: 0, y: FY - 4, width: 400, height: 3, fill: '#fff', opacity: 0.8 });
  // チームの旗
  el('rect', { x: 196, y: 30, width: 5, height: 92, fill: pal.sub });
  const flag = el('path', { d: 'M 0 0 L 60 0 L 60 34 L 0 34 Z', fill: pal.blue });
  const star = el('path', { d: 'M 0 -9 L 3 -3 L 9 -2 L 4 2 L 6 9 L 0 5 L -6 9 L -4 2 L -9 -2 L -3 -3 Z', fill: pal.yellow });
  // 選手10人（2列：後ろ5・前5）
  const spots = [];
  for (let i = 0; i < 5; i++) spots.push({ x: 92 + i * 54, y: FY - 34, s: 0.5 });
  for (let i = 0; i < 5; i++) spots.push({ x: 66 + i * 66, y: FY, s: 0.58 });
  const players = spots.map((sp, i) => {
    const b = k.buddy({ x: -40, y: sp.y, scale: sp.s, facing: 1 });
    const num = k.text(0, -36, String(i + 1), { 'font-size': 18, fill: '#fff' }, b.body);
    return { b, sp, num, start: i % 2 ? 440 : -40, at: 0.5 + i * 0.26 };
  });
  // 合計の表示（括弧と 10）
  const brace = el('path', { d: 'M 40 252 Q 40 262 60 262 L 186 262 Q 200 262 200 272 Q 200 262 214 262 L 340 262 Q 360 262 360 252', stroke: pal.ink, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
  const ten = k.text(200, 286, '10', { 'font-size': 18 });
  return {
    update(t) {
      const wave = Math.sin(t * 5) * 6;
      flag.setAttribute('transform', `translate(201 32) skewY(${(wave * 0.4).toFixed(2)})`);
      tf(star, 231, 49 + wave * 0.2);
      players.forEach((p, i) => {
        const xf = path([[p.at, p.start], [p.at + 0.9, p.sp.x]]);
        walk(p.b, xf, t, { facing: p.start < 0 ? 1 : -1, look: 0.3, blink: blinkAt(t, i * 0.3), mood: 'smile' });
        if (t > p.at + 0.9) P(p.b, { x: p.sp.x, facing: 1, look: 0, blink: blinkAt(t, i * 0.3), mood: t > 3.4 ? 'grin' : 'smile',
          armL: 10 + 150 * easeOut(seg(t, 3.4, 3.7)), armR: 10 + 150 * easeOut(seg(t, 3.4, 3.7)), lift: 10 * hump(seg(t, 3.4 + (i % 3) * 0.05, 3.9 + (i % 3) * 0.05)) });
      });
      const d = seg(t, 3.3, 3.7);
      brace.setAttribute('opacity', d); ten.setAttribute('opacity', d);
    }
  };
}
