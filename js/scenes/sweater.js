// sweater：寒い日、いすに掛けたセーターを取って頭からかぶり、ドアを開けて出かける（例文 Put on a sweater before you go out, because it's cold.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { top, flat } from './shirt.js';
import { hp, gait } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '寒い'], [1.0, 'セーターを着る'], [3.0, '出かける']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  // 雪の窓
  el('rect', { x: 150, y: 50, width: 90, height: 70, rx: 6, fill: '#C9D6E4', stroke: '#fff', 'stroke-width': 5 });
  const snowG = g({}); snowG.setAttribute('clip-path', k.clip((c) => el('rect', { x: 153, y: 53, width: 84, height: 64 }, c)));
  const flakes = Array.from({ length: 10 }, () => el('circle', { r: 2.4, fill: '#fff' }, snowG));
  el('line', { x1: 195, y1: 50, x2: 195, y2: 120, stroke: '#fff', 'stroke-width': 4 });
  // ドア（外は雪景色）
  const D = { x: 318, y: FY - 116, w: 66, h: 116 };
  el('rect', { x: D.x - 6, y: D.y - 6, width: D.w + 12, height: D.h + 6, rx: 3, fill: pal.woodDark });
  el('rect', { x: D.x, y: D.y, width: D.w, height: D.h, fill: '#DCE6EF' });
  el('rect', { x: D.x, y: FY - 30, width: D.w, height: 30, fill: '#fff' });
  const outF = Array.from({ length: 6 }, () => el('circle', { r: 2.2, fill: '#fff' }));
  const door = g({});
  el('rect', { x: 0, y: 0, width: D.w, height: D.h, rx: 2, fill: pal.wood }, door);
  el('rect', { x: 8, y: 10, width: D.w - 16, height: 40, rx: 3, fill: 'none', stroke: pal.woodDark, 'stroke-width': 2 }, door);
  el('circle', { cx: D.w - 10, cy: 62, r: 4, fill: pal.yellowDark }, door);
  // いす
  const CX = 84;
  k.shadow(CX + 4, FY + 1, 30, 4);
  el('rect', { x: CX - 26, y: FY - 108, width: 7, height: 108, rx: 3, fill: pal.woodDark });
  el('rect', { x: CX - 26, y: FY - 54, width: 54, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: CX + 20, y: FY - 46, width: 6, height: 46, fill: pal.woodDark });
  const COL = '#F2A33A', DK = '#C97E1E';
  const sw = flat(k, 'sweater', COL, DK, null, false);
  const S = 1, b = k.buddy({ x: 150, y: FY, scale: S, facing: -1 });
  const tp = top(k, b, 'sweater', COL, DK);
  const xf = (t) => lerp(150, 290, easeInOut(seg(t, 2.8, 3.9)));
  return {
    update(t) {
      flakes.forEach((f, i) => { const p = ((t * 0.35 + i * 0.137) % 1); k.set(f, { cx: 158 + ((i * 37) % 80) + 4 * Math.sin(t * 2 + i), cy: 50 + p * 72 }); });
      const op = easeInOut(seg(t, 3.6, 4.2));
      tf(door, D.x, D.y, 0, Math.max(0.12, 1 - 0.88 * op), 1);
      outF.forEach((f, i) => { const p = ((t * 0.4 + i * 0.21) % 1); k.set(f, { cx: D.x + 8 + ((i * 23) % 52), cy: D.y + 4 + p * 90, opacity: op }); });
      const grab = easeInOut(seg(t, 0.35, 0.8)), up = easeInOut(seg(t, 0.85, 1.3)), down = easeInOut(seg(t, 1.35, 2.3));
      const cold = 1 - seg(t, 2.1, 2.5), turn = easeInOut(seg(t, 2.5, 2.8));
      const p = gait(xf, t, 150);
      const fc = lerp(-1, 1, turn), face = Math.sign(fc || 1) * Math.max(0.1, Math.abs(fc));
      let armR = lerp(8, 62, grab);
      armR = lerp(armR, 168, up);
      armR = lerp(armR, 10, down);
      if (t > 2.8) armR = p.armR;
      const armL = t < 0.85 ? 8 : t < 2.3 ? lerp(8, 168, up) * (1 - down) + 10 * down : p.armL;
      b.pose({ x: p.x + Math.sin(t * 55) * 1.4 * cold, walk: p.walk, facing: face, armR, armL, lean: 8 * grab * (1 - up) + p.lean,
        mood: cold > 0.5 ? 'sad' : 'grin', look: 0.4, blink: down > 0 && down < 1 ? 1 : 0, squash: 1 - 0.04 * cold });
      const h = hp(b, S, 'R', 28);
      // セーター：いすの背 → 手 → 頭上 → かぶる
      if (t < 0.8) tf(sw, CX - 22, FY - 104, 0, 0.9);
      else if (t < 1.35) { const q = easeOut(seg(t, 0.8, 0.95)); tf(sw, lerp(CX - 22, h.x, q), lerp(FY - 104, h.y - 4, q), lerp(0, 180, up), 0.95); }
      sw.setAttribute('opacity', t < 1.35 ? 1 : 0);
      tp.show(t >= 1.35, down > 0.6);
      tp.slide(lerp(-62, 0, down));
    }
  };
}
