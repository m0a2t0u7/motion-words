// subscribe：毎月決まって雑誌が郵便受けに届き、まめが取り出して積んでいく（例文 I subscribe to a monthly magazine.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, easeIn } from '../ease.js';
import { hp, reach } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { calendar } from './so-far-so-good.js';

// 雑誌（原点＝下端中央、正面）
export function magazine(k, parent, c) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('rect', { x: -14, y: -38, width: 28, height: 38, rx: 2, fill: c || pal.violet }, g);
  k.el('rect', { x: -10, y: -34, width: 20, height: 6, rx: 1, fill: '#fff' }, g);
  k.el('circle', { cx: 2, cy: -16, r: 7, fill: '#fff', opacity: 0.6 }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '毎月'], [1.0, '雑誌が届く'], [3.3, '毎月届く']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'outdoor' });
  // 家の外壁と玄関
  el('rect', { x: 230, y: 60, width: 170, height: 176, fill: '#F3E6DC' });
  el('path', { d: 'M 220 64 L 310 20 L 400 64 Z', fill: pal.coralDark });
  el('rect', { x: 330, y: 136, width: 50, height: 100, rx: 3, fill: pal.wood });
  el('circle', { cx: 340, cy: 188, r: 3, fill: pal.woodDark });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: '#E3E8EE' });
  const cal = calendar(k, 270, 84, 46);
  // 郵便受け（ポスト）
  const PX = 196, PY = 150;
  k.shadow(PX, FY + 1, 18, 3);
  el('rect', { x: PX - 4, y: PY + 30, width: 8, height: FY - PY - 30, fill: pal.sub });
  const mags = [pal.violet, pal.blue, pal.coral].map((c) => magazine(k, k.root, c));
  el('path', { d: `M ${PX - 26} ${PY + 30} L ${PX - 26} ${PY} Q ${PX} ${PY - 22} ${PX + 26} ${PY} L ${PX + 26} ${PY + 30} Z`, fill: pal.red });
  el('rect', { x: PX - 16, y: PY - 2, width: 32, height: 5, rx: 2, fill: '#8E2F27' });
  const flag = el('rect', { x: 0, y: -18, width: 4, height: 18, fill: pal.yellow });
  // 積んだ雑誌を置く台
  el('rect', { x: 40, y: 206, width: 60, height: 8, rx: 2, fill: pal.woodDark });
  el('rect', { x: 46, y: 214, width: 6, height: 22, fill: pal.woodDark }); el('rect', { x: 88, y: 214, width: 6, height: 22, fill: pal.woodDark });
  const me = k.buddy({ x: 138, y: FY, scale: 0.95, facing: 1 });
  const months = [0.2, 1.5, 2.8];
  return {
    update(t) {
      let m = 0; months.forEach((a) => { if (t > a + 0.15) m++; });
      const flip = months.reduce((v, a) => Math.max(v, hump(seg(t, a, a + 0.3))), 0);
      cal.set(String(Math.max(1, m)), flip);
      let armR = 10, look = 0.6, facing = 1, carrying = -1, lean = 0;
      mags.forEach((mg, i) => {
        const a = months[i];
        const drop = seg(t, a + 0.15, a + 0.45), grab = seg(t, a + 0.6, a + 0.9), move = seg(t, a + 0.9, a + 1.25);
        let x = PX, y = PY + 6 + 40 * easeIn(drop), r = 0; // 差し入れ口からすべり込む
        if (t < a + 0.15) { mg.setAttribute('opacity', 0); return; }
        mg.setAttribute('opacity', 1);
        if (grab > 0 && move < 1) { y = lerp(PY + 46, PY - 4, easeOut(grab)); carrying = i; }
        if (move > 0) { const e = easeInOut(move); x = lerp(PX, 70, e); y = lerp(PY - 4, 206, e) - 20 * hump(move); x = lerp(PX, 54 + i * 16, e); r = lerp(0, -6, e); }
        if (move >= 1) { x = 54 + i * 16; y = 206; r = -6; }
        // 横にした雑誌は台の上に平積み
        tf(mg, x, y, r, r ? 1 : 1, 1);
        if (move > 0 && move < 1) { facing = -1; armR = 80; }
        if (grab > 0 && grab < 1 || carrying === i && move === 0) { armR = reach(me, 0.95, 'R', PX, PY - 4); lean = 6; }
      });
      const fl = months.reduce((v, a) => Math.max(v, seg(t, a + 0.15, a + 0.25) * (1 - seg(t, a + 0.6, a + 0.7))), 0);
      tf(flag, PX + 26, PY + 10, -90 * (1 - fl));
      P(me, { facing, look, armR, armL: 10, lean, blink: blinkAt(t), mood: t > 3.6 ? 'grin' : 'smile' });
    }
  };
}
