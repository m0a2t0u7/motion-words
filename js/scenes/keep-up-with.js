// keep up with：テレビのニュースが次々に変わり、新聞を読みながら見比べるが追いつかずに目が回る（例文 It's hard to keep up with the news.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, frontL } from './dig.js';

export const meta = { duration: 4.6, beats: [[0, 'ニュースを見る'], [1.8, '次々に来る'], [3.6, '追いつかない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // テレビ（右）
  el('rect', { x: 230, y: 70, width: 150, height: 100, rx: 8, fill: pal.ink });
  el('rect', { x: 290, y: 170, width: 30, height: 20, fill: pal.sub }); el('rect', { x: 270, y: 188, width: 70, height: 6, rx: 3, fill: pal.sub });
  el('rect', { x: 260, y: 194, width: 90, height: 42, rx: 4, fill: pal.wood }); k.shadow(305, FY, 50, 4);
  const scr = k.clip((cp) => el('rect', { x: 238, y: 78, width: 134, height: 84, rx: 4 }, cp));
  const tv = g({ 'clip-path': scr });
  el('rect', { x: 238, y: 78, width: 134, height: 84, fill: '#CFE9F7' }, tv);
  const cols = [pal.red, pal.blue, pal.green, pal.violet, pal.yellow, pal.coral];
  const cards = cols.map((c) => { const n = g({}, tv); el('rect', { x: 0, y: 0, width: 134, height: 84, fill: '#EAF4FB' }, n); el('rect', { x: 10, y: 10, width: 40, height: 40, rx: 4, fill: c }, n); el('rect', { x: 58, y: 14, width: 64, height: 7, rx: 3, fill: pal.ink }, n); el('rect', { x: 58, y: 28, width: 50, height: 5, rx: 2.5, fill: pal.sub }, n); el('rect', { x: 0, y: 62, width: 134, height: 22, fill: c }, n); return n; });
  const tick = el('rect', { x: 238, y: 140, width: 134, height: 22, fill: pal.red, 'clip-path': scr });
  const tickT = g({ 'clip-path': scr });
  for (let i = 0; i < 10; i++) el('rect', { x: i * 40, y: 148, width: 26, height: 6, rx: 3, fill: '#fff' }, tickT);
  // ソファの人
  const S = 1.05;
  const b = k.buddy({ x: 110, y: FY, scale: S });
  const fl = frontL(b, S);
  const paper = g({});
  el('rect', { x: -4, y: -28, width: 44, height: 56, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, paper);
  [-20, -12, -4, 4, 12].forEach((y) => el('rect', { x: 2, y, width: 32, height: 3, rx: 1.5, fill: '#C3CBD6' }, paper));
  const sweat = el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6 Z', fill: pal.water });
  const spin = g({}); [0, 1, 2].forEach((i) => el('path', { d: `M ${-10 + i * 4} 0 a ${10 - i * 3} ${5 - i} 0 1 1 0.1 0`, stroke: pal.sub, 'stroke-width': 1.8, fill: 'none' }, spin));
  return {
    update(t) {
      // ニュースが入れ替わる間隔がだんだん短くなる
      const ph = t < 1.6 ? t / 1.2 : 1.33 + (t - 1.6) * 1.2 + (t - 1.6) * (t - 1.6) * 0.5;
      const i = Math.floor(ph), f = ph - i;
      cards.forEach((c, j) => { const on = j === i % 6, nx = j === (i + 1) % 6; const sl = easeInOut(seg(f, 0.75, 1)); tf(c, on ? 238 - 134 * sl : nx ? 238 + 134 * (1 - sl) : 999, 78); });
      tf(tickT, 238 - ((t * 60) % 40), 0);
      const lookTV = t < 1.6 ? hump(seg(t, 0.6, 1.6)) : 0.5 + 0.5 * Math.sin(t * (4 + t * 1.5));
      const dizzy = seg(t, 3.4, 3.8);
      b.pose({ armR: 72, armL: 10, look: lerp(-0.2, 1, lookTV), lean: 4 * Math.sin(t * 6) * dizzy - 3, mood: t > 3.4 ? 'open' : t > 2 ? 'flat' : 'smile', squash: 1 - 0.03 * dizzy, blink: dizzy * 0.5 });
      fl.set(70);
      const h = hp(b, S, 'R');
      tf(paper, h.x - 4, h.y - 4, -4);
      const sq = (t * 1.3) % 1;
      tf(sweat, 86, FY - 92 + 10 * sq); sweat.setAttribute('opacity', t > 2.2 ? hump(sq) : 0);
      tf(spin, 110, FY - 112, t * 200 * dizzy); spin.setAttribute('opacity', dizzy);
    }
  };
}
