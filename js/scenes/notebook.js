// notebook：授業のあと、机でノートを開き、新しい単語を1つずつ書きこむ（例文 I wrote the new words in my notebook after class.）
// このファイルは「机で書く」系シーンの共有ヘルパー studyDesk() / ink() も書き出す
import { seg, lerp, easeInOut, clamp } from '../ease.js';
import { held, reach, P, blinkAt, face, desk } from './bag.js';
import { pencil, tap } from './check.js';

// 机と、机の上に立てた書く面（左上 SX,SY、幅 SW、高さ SH）。黒板つきの教室
export function studyDesk(k, { SX = 200, SY = 108, SW = 84, SH = 82, room = 'class' } = {}) {
  const { el, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  if (room === 'class') {
    el('rect', { x: 14, y: 34, width: 150, height: 86, rx: 4, fill: '#3E6B5A', stroke: pal.woodDark, 'stroke-width': 6 });
    el('path', { d: 'M 34 62 h 46 M 34 82 h 80 M 34 100 h 36', stroke: '#fff', 'stroke-width': 3, opacity: 0.5, 'stroke-linecap': 'round' });
  } else {
    el('rect', { x: 30, y: 40, width: 90, height: 70, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  }
  el('rect', { x: 320, y: 60, width: 60, height: 70, rx: 4, fill: '#F1E7D8' });
  const top = desk(k, 120, 240, FY);
  el('rect', { x: SX + SW / 2 - 12, y: SY + SH - 2, width: 24, height: top - SY - SH + 2, fill: pal.woodDark });
  return { FY, top, SX, SY, SW, SH };
}
// 書いた線（左→右に現れる）。set(0..1)
export function ink(k, x, y, w, col, parent) {
  const n = k.el('path', { d: `M ${x} ${y} q ${w / 6} -7 ${w / 3} 0 t ${w / 3} 0 t ${w / 3} 0`, stroke: col || k.pal.ink, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round', 'stroke-dasharray': w * 1.4, 'stroke-dashoffset': w * 1.4 }, parent);
  return { n, set(p) { n.setAttribute('stroke-dashoffset', w * 1.4 * (1 - clamp(p))); } };
}

export const meta = { duration: 4.4, beats: [[0, '授業のあと'], [0.8, '単語を書く'], [3.6, 'ノートに書けた']] };

export function create(k) {
  const { el, pal } = k, S = 1.1;
  const d = studyDesk(k, { SX: 196, SY: 118, SW: 80, SH: 66 });
  const { FY, SX, SY, SW, SH } = d;
  // 開いたノート（2ページ、罫線）
  el('rect', { x: SX - 3, y: SY - 3, width: SW + 6, height: SH + 6, rx: 4, fill: pal.blue });
  el('rect', { x: SX, y: SY, width: SW / 2, height: SH, fill: '#fff' });
  el('rect', { x: SX + SW / 2, y: SY, width: SW / 2, height: SH, fill: '#FBFBF7' });
  el('line', { x1: SX + SW / 2, y1: SY, x2: SX + SW / 2, y2: SY + SH, stroke: pal.line, 'stroke-width': 2 });
  for (let i = 0; i < 5; i++) el('line', { x1: SX + 4, y1: SY + 14 + i * 14, x2: SX + SW - 4, y2: SY + 14 + i * 14, stroke: '#CFE0F2', 'stroke-width': 1 });
  k.text(SX + 24, SY + 9, 'NEW', { 'font-size': 8, fill: pal.coralDark });
  const words = [0, 1, 2, 3].map((i) => ink(k, SX + (i < 2 ? 8 : SW / 2 + 6), SY + 26 + (i % 2) * 28, 24, pal.ink));
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const pen = pencil(k);
  return {
    update(t) {
      const t0 = 0.6, dt = 0.72;
      const i = clamp(Math.floor((t - t0) / dt), 0, 3), q = seg(t - t0 - i * dt, 0, dt);
      const on = t > t0 && t < t0 + 4 * dt;
      const sx = SX + (i < 2 ? 8 : SW / 2 + 6), sy = SY + 26 + (i % 2) * 28;
      let tx = sx + 24 * clamp(q / 0.8), ty = sy - 2 + 2 * Math.sin(q * 30);
      if (!on) { tx = t < t0 ? SX + 20 : SX + SW - 10; ty = t < t0 ? SY + 10 : SY + 30; }
      P(b, { x: 150, lean: 16, look: 0.9, blink: blinkAt(t), mood: t > 3.6 ? 'grin' : 'smile' });
      face(b, 5, 2);
      b.pose({ armR: reach(b, S, 'R', tx, ty) });
      held(k, b, S, pen, 'R', 0);
      words.forEach((w, j) => w.set(seg(t, t0 + j * dt, t0 + j * dt + dt * 0.8)));
    }
  };
}
