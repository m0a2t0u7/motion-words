// recovery：手術後にベッドで休むまめを友だちが見舞い、花とカードを渡して「早く良くなって」と願う（例文 We all wish you a quick and full recovery from the surgery.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { lie, medRoom } from './surgery.js';
import { hp, reach, gait } from './dig.js';
import { heart } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '手術のあと'], [1.3, 'お見舞い'], [3.0, '早く良くなって']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = medRoom(k, 238);
  el('rect', { x: 260, y: 44, width: 84, height: 62, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 302, y1: 44, x2: 302, y2: 106, stroke: '#fff', 'stroke-width': 4 });
  // ベッド
  el('rect', { x: 26, y: 120, width: 10, height: FY - 120, rx: 3, fill: '#9AA4B4' });
  el('rect', { x: 26, y: 120, width: 10, height: 60, rx: 4, fill: '#C9D2DE' });
  el('ellipse', { cx: 66, cy: 168, rx: 26, ry: 9, fill: '#fff' });
  const P = lie(k, { scale: 0.9 });
  el('rect', { x: 122, y: 158, width: 102, height: 30, rx: 10, fill: '#A9D3EA' });
  el('rect', { x: 122, y: 158, width: 102, height: 6, rx: 3, fill: '#fff', opacity: 0.6 });
  el('rect', { x: 30, y: 186, width: 200, height: 14, rx: 4, fill: '#C9D2DE' });
  [40, 214].forEach((x) => el('rect', { x, y: 200, width: 8, height: FY - 200, fill: '#9AA4B4' }));
  k.shadow(130, FY + 1, 104, 4);
  // 見舞いに来た友だち
  const v = k.buddy({ x: 420, y: FY, scale: 0.95, facing: -1, color: pal.coral, dark: pal.coralDark });
  const bq = g({});
  [[-6, -26, pal.red], [5, -28, pal.yellow], [0, -36, pal.violet], [-10, -36, pal.coral]].forEach(([x, y, c]) => el('circle', { cx: x, cy: y, r: 6, fill: c }, bq));
  el('path', { d: 'M -10 -22 L 0 6 L 8 -22 Z', fill: pal.green }, bq);
  // カード
  const card = g({});
  el('rect', { x: -40, y: -26, width: 80, height: 52, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, card);
  k.text(0, -8, 'GET WELL', { 'font-size': 13, fill: pal.coralDark }, card);
  k.text(0, 8, 'SOON!', { 'font-size': 13, fill: pal.coralDark }, card);
  const hearts = [0, 1, 2].map(() => heart(k, null, pal.red));
  const xf = (t) => lerp(420, 268, easeInOut(seg(t, 0.4, 1.6)));
  return {
    update(t) {
      const up = easeInOut(seg(t, 1.5, 2.2));
      P.set(140, 172, lerp(-90, -18, up));
      P.b.pose({ mood: up > 0.5 ? 'grin' : 'smile', blink: t < 1.2 ? 1 : 0, look: 0.4, armR: lerp(8, 70, easeOut(seg(t, 2.4, 2.8))), armL: 10 });
      const p = gait(xf, t, 420);
      const give = easeInOut(seg(t, 2.0, 2.5));
      v.pose({ x: p.x, walk: p.walk, lean: p.lean + 6 * give, armR: lerp(p.armR + 40, 84, give), armL: p.armL, look: 0.5, mood: t > 2.5 ? 'grin' : 'smile' });
      const h = hp(v, 0.95, 'R', 28);
      tf(bq, h.x, h.y + 4, -10 * give, 1);
      const cp = seg(t, 2.7, 3.1);
      tf(card, 200, 82, -4, cp <= 0 ? 0.001 : backOut(cp));
      hearts.forEach((hh, i) => { const q = seg(t, 3.2 + i * 0.2, 4.3); tf(hh, 158 + i * 20, 130 - 26 * q - (i % 2) * 8, 0, hump(q) * 1.1 + 0.001); });
    }
  };
}
