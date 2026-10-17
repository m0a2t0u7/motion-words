// carry on：仕事の手が止まりかけるが、「続けて」と言われて書き続ける（例文 Please carry on with your work.）
import { seg, lerp, easeInOut, easeOut, wobble, hump, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '仕事中'], [1.2, '声がかかる'], [2.6, '続ける']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 252, mood: 'indoor' });
  const b = k.buddy({ x: 120, y: FY, scale: 1.1 });
  const boss = k.buddy({ x: 360, y: FY, scale: 1.0, color: pal.coral, dark: pal.coralDark, facing: -1 });
  // 机
  el('rect', { x: 150, y: 232, width: 10, height: 20, rx: 3, fill: pal.woodDark });
  el('rect', { x: 262, y: 232, width: 10, height: 20, rx: 3, fill: pal.woodDark });
  el('rect', { x: 140, y: 218, width: 142, height: 14, rx: 5, fill: pal.wood });
  el('rect', { x: 164, y: 192, width: 94, height: 26, rx: 3, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 });
  // 進み具合バー（紙の上の行）
  const lines = [0, 1, 2].map((i) => el('line', { x1: 172, y1: 200 + i * 7, x2: 172, y2: 200 + i * 7, stroke: pal.blue, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  const pen = g({});
  el('line', { x1: -4, y1: -14, x2: 0, y2: 0, stroke: pal.coralDark, 'stroke-width': 5, 'stroke-linecap': 'round' }, pen);
  const sp = g({});
  const sb = el('path', { d: 'M -28 -12 L 28 -12 Q 36 -12 36 -20 L 36 -34 Q 36 -42 28 -42 L -28 -42 Q -36 -42 -36 -34 L -36 -20 Q -36 -12 -28 -12 Z M 14 -12 L 22 -2 L 24 -12', fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, sp);
  const txt = k.text(0, -27, '', { 'font-size': 16 }, sp);
  const wdots = k.text(0, 0, '', { 'font-size': 20, fill: pal.sub });
  const prog = (t) => {
    // 書いた量：0〜1.2 は進み、1.2〜2.7 は止まり、2.7 以降また進む
    const a = seg(t, 0.2, 1.2) * 0.45;
    const c = seg(t, 2.7, 4.0) * 0.55;
    return a + c;
  };
  return {
    update(t) {
      const p = prog(t) * 3; // 0..3 行
      const writing = (t < 1.2 || t > 2.7);
      lines.forEach((l, i) => l.setAttribute('x2', 172 + 80 * clamp(p - i)));
      const li = clamp(Math.floor(p), 0, 2);
      const tipX = 172 + 80 * clamp(p - li, 0, 1), tipY = 200 + li * 7;
      tf(pen, tipX + 2, tipY - 1);
      const wob = writing ? Math.sin(t * 14) * 1.5 : 0;
      const lx = tipX + 2, ly = tipY;
      const sx = 120 + 27 * 1.1, sy = FY - 56 * 1.1;
      const dx = lx - sx, dy = ly - sy;
      const a = (Math.atan2(dx, dy) * 180) / Math.PI;
      const call = seg(t, 1.2, 1.4) * (1 - seg(t, 2.5, 2.7));
      b.pose({ armR: a, armL: 8, lean: 6 + wob * 0.3, look: writing ? 0.6 : 1, mood: writing ? 'smile' : 'open', squash: 1 });
      // 上司：呼びかけ→手で「どうぞ」
      const wave = seg(t, 1.9, 2.4);
      boss.pose({ armL: lerp(8, 100, easeOut(seg(t, 1.0, 1.4))) * (1 - 0.3 * wave) + 12 * Math.sin(t * 10) * wave, armR: 8, look: 0.8, mood: 'smile', x: 360 - 30 * easeOut(seg(t, 0.8, 1.4)) });
      boss.g.setAttribute('opacity', seg(t, 0.7, 0.95));
      tf(sp, 296, 150, 0, call > 0 ? 0.6 + 0.4 * call : 0, call > 0 ? 0.6 + 0.4 * call : 0);
      txt.textContent = 'Stop?';
      tf(sp, 286, 148, 0, 0, 0);
      const showA = seg(t, 1.3, 1.5) * (1 - seg(t, 2.0, 2.1));
      const showB = seg(t, 2.1, 2.3) * (1 - seg(t, 3.4, 3.6));
      tf(sp, 296, 140, 0, Math.max(showA, showB), Math.max(showA, showB));
      txt.textContent = showA >= showB ? 'Hey' : 'OK';
      wdots.setAttribute('opacity', 0);
    }
  };
}
