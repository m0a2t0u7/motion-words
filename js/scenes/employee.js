// employee：会社の前で、社員証を付けたまめが社員ボードを指す。顔写真が増えて 50 人になる（例文 The company has fifty employees.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { reach, P, blinkAt, walkTo, path, wear, pop } from './member.js';

export const meta = { duration: 4.4, beats: [[0, '会社に来る'], [1.2, '社員が増える'], [3.4, '社員は50人']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95, FY = 236;
  k.backdrop({ floorY: FY });
  // 会社のビル
  el('rect', { x: 10, y: 30, width: 130, height: FY - 30, fill: '#DCE6F2' });
  for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) el('rect', { x: 22 + c * 40, y: 66 + r * 28, width: 28, height: 16, rx: 2, fill: '#fff', opacity: 0.8 });
  el('rect', { x: 26, y: 38, width: 98, height: 20, rx: 4, fill: pal.blueDark }); k.text(75, 49, 'COMPANY', { 'font-size': 11, fill: '#fff' });
  el('rect', { x: 55, y: FY - 34, width: 40, height: 34, fill: '#BFDDF2' });
  // 社員ボード（10×5）
  const BX = 180, BY = 40, cw = 20, ch = 26;
  el('rect', { x: BX - 10, y: BY - 10, width: 220, height: 166, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  el('rect', { x: BX + 60, y: 146 + BY - 30 + 30, width: 8, height: FY - 196, fill: pal.sub });
  el('rect', { x: BX + 132, y: 146 + BY, width: 8, height: FY - 186, fill: pal.sub });
  const cols = [pal.coral, pal.blue, pal.yellow, '#A58BF3'];
  const faces = [];
  for (let i = 0; i < 50; i++) {
    const f = g({}); const c = i === 0 ? pal.mint : cols[(i * 7) % 4];
    el('rect', { x: -7, y: -9, width: 14, height: 18, rx: 7, fill: c }, f);
    el('circle', { cx: -2.5, cy: -3, r: 1.2, fill: pal.ink }, f); el('circle', { cx: 2.5, cy: -3, r: 1.2, fill: pal.ink }, f);
    faces.push([f, BX + 10 + (i % 10) * cw, BY + 14 + Math.floor(i / 10) * ch]);
  }
  const num = k.text(BX + 100, BY + 146, '0', { 'font-size': 18, fill: pal.blueDark });
  const b = k.buddy({ x: 75, y: FY, scale: S }); wear(k, b, 'tie', pal.blueDark); wear(k, b, 'badge', '#DCEBFF');
  const bx = path([[0.1, 75], [1.0, 150]]);
  return {
    update(t) {
      const w = walkTo(bx, t, 75, 1);
      const n = Math.round(clamp((t - 1.0) / 2.3) * 50);
      faces.forEach(([f, x, y], i) => tf(f, x, y, 0, pop(seg(t, 1.0 + (i / 50) * 2.3, 1.2 + (i / 50) * 2.3))));
      num.textContent = n + (n === 50 ? ' people' : '');
      const pt = easeInOut(seg(t, 3.3, 3.7));
      P(b, { x: w.x, walk: w.walk, armL: w.armL, armR: w.armR, lean: w.lean, look: 0.8, blink: blinkAt(t), mood: n === 50 ? 'grin' : 'smile' });
      if (t > 1.0) b.pose({ armR: lerp(lerp(w.armR, reach(b, S, 'R', BX + 10, BY + 14), easeInOut(seg(t, 1.0, 1.4))), reach(b, S, 'R', BX + 100, BY + 130), pt) });
    }
  };
}
