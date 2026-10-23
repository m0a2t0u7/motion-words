// career：黒板の前で教える若いまめ。年が数十年進むうちに白髪になり、最後に教え子から花束を受け取る（例文 She had a long career in teaching.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, aim, hold, person, elder, heart, pencil } from './confused.js';

export const meta = { duration: 4.4, beats: [[0.0, '若い先生'], [1.15, '何十年も教える'], [3.25, '長い歩み']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 12, width: 400, height: 12, fill: '#ECE6DC' });
  el('rect', { x: 30, y: 70, width: 220, height: 110, rx: 4, fill: '#3E6B5A', stroke: pal.woodDark, 'stroke-width': 6 });
  const chalk = [0, 1, 2].map((i) => el('path', { d: `M ${100} ${132 + i * 14} h ${80 - i * 18}`, stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.7, 'stroke-dasharray': 90, 'stroke-dashoffset': 90 }));
  // 年の表示（西暦が進む）
  el('rect', { x: 290, y: 30, width: 80, height: 40, rx: 6, fill: '#fff', stroke: pal.ink, 'stroke-width': 2.5 });
  el('rect', { x: 290, y: 30, width: 80, height: 10, rx: 4, fill: pal.red });
  const yr = k.text(330, 56, '1990', { 'font-size': 16 });
  const b = k.buddy({ x: 220, y: FY, scale: S, facing: -1 });
  const old = elder(k, b); old.setAttribute('opacity', 0);
  const glasses = b.body.children[b.body.children.length - 1];
  const ck = pencil(k);
  // 入れ替わる生徒たち（手前）
  const cols = ['coral', 'blue', 'yellow', 'violet'];
  const kids = [0, 1, 2].map((i) => cols.map((c) => person(k, c, { x: 90 + i * 110, y: FY + 60, scale: 0.75 })));
  const kid = person(k, 'coral', { x: 470, y: FY, scale: 0.7, facing: -1 });
  const bouquet = g({});
  ['#FF8FB1', pal.yellow, pal.violet].forEach((c, i) => el('circle', { cx: -6 + i * 6, cy: -14 - (i % 2) * 4, r: 5, fill: c }, bouquet));
  el('path', { d: 'M -6 -8 L 0 8 L 6 -8 Z', fill: pal.green }, bouquet);
  const hs = [0, 1].map(() => heart(k));
  return {
    update(t) {
      t *= 4.6 / 4.4; // 4.4 秒に収める
      const age = easeInOut(seg(t, 0.6, 3.2));
      yr.textContent = String(Math.round(1990 + 40 * age));
      old.setAttribute('opacity', age);
      faceOld(glasses, age);
      // 板書：何度も書いては消す
      const cyc = ((t - 0.2) / 0.9) % 1, writing = t < 3.3;
      chalk.forEach((c, i) => c.setAttribute('stroke-dashoffset', writing ? 90 * (1 - seg(cyc, i * 0.25, i * 0.25 + 0.3)) : 0));
      P(b, { x: 220, facing: -1, lean: 3 * age, squash: 1 - 0.04 * age, look: 0.4, mood: t > 3.6 ? 'grin' : 'smile', blink: blinkAt(t), armL: 10 });
      if (writing) aim(b, S, 'R', 100 + 80 * seg((cyc * 4) % 1, 0, 1), 132 + 14 * Math.min(2, Math.floor(cyc * 4)));
      hold(k, b, S, ck, 'R', 0); ck.setAttribute('opacity', writing ? 1 : 0);
      // 生徒は数年ごとに入れ替わる
      const gen = Math.min(3, Math.floor(age * 4));
      kids.forEach((row, i) => row.forEach((p, j) => { P(p, { x: 90 + i * 110, y: FY + 60, look: 0.2, blink: blinkAt(t, i) }); p.g.setAttribute('display', (j + i) % 4 === gen ? 'inline' : 'none'); }));
      // 花束を渡される
      const kw = lerp(470, 290, easeInOut(seg(t, 3.2, 3.9)));
      P(kid, { x: kw, walk: kw * 0.12, facing: -1, armR: t > 3.8 ? 70 : 10, mood: 'grin', look: 0.5, blink: blinkAt(t, 2) });
      const give = seg(t, 4.0, 4.3);
      if (t > 3.9) aim(b, S, 'R', lerp(270, 256, give), FY - 60);
      tf(bouquet, lerp(kw - 26, 254, give), FY - 60, 0, t > 3.2 ? 1 : 0.001);
      hs.forEach((n, i) => { const q = seg(t, 4.1 + i * 0.2, 4.6); tf(n, 200 + i * 60, FY - 130 - 20 * q, 0, q > 0 ? 1.2 * easeOut(q) : 0.001); });
    }
  };
}
function faceOld(node, p) { if (node) node.setAttribute('opacity', p); }
