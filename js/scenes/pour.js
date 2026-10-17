// pour：ケトルを傾けて、カップにお湯をていねいに注ぐ（例文 He poured hot water into the cup.）
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';

export const meta = { duration: 3.9, beats: [[0, '傾ける'], [1.1, '注ぐ'], [2.9, 'たまった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  // テーブル
  el('rect', { x: 0, y: 226, width: 400, height: 74, fill: '#EBD3B0' });
  el('rect', { x: 0, y: 226, width: 400, height: 12, fill: pal.wood });
  el('rect', { x: 0, y: 238, width: 400, height: 2, fill: pal.woodDark, opacity: 0.5 });
  // 窓
  el('rect', { x: 30, y: 36, width: 70, height: 64, rx: 8, fill: '#DDEFFA' });
  el('line', { x1: 65, y1: 36, x2: 65, y2: 100, stroke: '#FFFFFF', 'stroke-width': 4 });

  const CX = 270, BASE = 226;
  const SX = 262, SY = 106; // 注ぎ口の位置（ここに合わせて傾けたケトルを置く）
  const CUP_H = 76, IN_TOP = 6, IN_BOT = 6;

  // カップ
  const cup = g({});
  tf(cup, CX, BASE);
  const cupShadow = k.shadow(CX + 6, BASE + 3, 44, 6);
  el('path', { d: 'M 34 -62 Q 66 -62 62 -38 Q 58 -18 28 -18', fill: 'none', stroke: pal.blue, 'stroke-width': 8, 'stroke-linecap': 'round' }, cup);
  const bodyD = `M -34 ${-CUP_H} L 34 ${-CUP_H} L 28 -6 Q 27 0 20 0 L -20 0 Q -27 0 -28 -6 Z`;
  el('path', { d: bodyD, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 3, 'stroke-linejoin': 'round' }, cup);
  const clipId = k.clip((cp) => el('path', { d: bodyD }, cp));
  const water = g({ 'clip-path': clipId }, cup);
  const wRect = el('rect', { x: -40, y: -10, width: 80, height: 90, fill: pal.water }, water);
  const wTop = el('rect', { x: -40, y: -10, width: 80, height: 4, fill: '#C4E9FA' }, water);
  el('rect', { x: -28, y: -14, width: 56, height: 6, rx: 3, fill: pal.blue, opacity: 0.18 }, cup);
  el('ellipse', { cx: -20, cy: -46, rx: 3, ry: 14, fill: '#FFFFFF', opacity: 0.7 }, cup);

  // 湯気
  const steams = [0, 1, 2].map((i) => {
    const s = g({}, cup);
    el('path', { d: 'M 0 0 C 9 -9 -9 -19 0 -29 S 9 -47 0 -56', fill: 'none', stroke: '#BFCBDA', 'stroke-width': 4.5, 'stroke-linecap': 'round' }, s);
    return s;
  });

  // 注ぐ水の流れ・しぶき
  const stream = el('path', { d: '', fill: 'none', stroke: pal.water, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const drops = [0, 1, 2].map(() => el('circle', { r: 2.6, fill: pal.water }));
  const ripple = el('ellipse', { rx: 10, ry: 2.5, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 2 });

  // ケトル（原点＝本体の中心）
  const kShadow = k.shadow(0, 0, 50, 7);
  const kettle = g({});
  const kb = g({}, kettle);
  el('path', { d: 'M -38 -22 Q -72 -22 -68 0 Q -64 22 -36 20', fill: 'none', stroke: pal.yellowDark, 'stroke-width': 9, 'stroke-linecap': 'round' }, kb);
  el('path', { d: 'M 32 -8 L 52 -34 Q 60 -34 62 -26 L 44 10 Z', fill: pal.coralDark, stroke: pal.coralDark, 'stroke-width': 4, 'stroke-linejoin': 'round' }, kb);
  el('rect', { x: -44, y: -34, width: 88, height: 68, rx: 26, fill: pal.coral }, kb);
  el('ellipse', { cx: -22, cy: -12, rx: 7, ry: 15, fill: '#FFFFFF', opacity: 0.28 }, kb);
  el('path', { d: 'M -22 -34 Q 0 -46 22 -34 Z', fill: pal.coralDark }, kb);
  el('circle', { cx: 0, cy: -46, r: 6, fill: pal.yellow }, kb);

  const rad = Math.PI / 180;
  return {
    update(t) {
      // 傾き：近づきながら傾ける → 注ぎながらさらに少し傾ける → 戻す
      const back = easeInOut(seg(t, 2.8, 3.35));
      const a = (38 * easeInOut(seg(t, 0.3, 1.05)) + 6 * seg(t, 1.2, 2.7)) * (1 - back);
      const dx = 58 * Math.cos(a * rad) + 28 * Math.sin(a * rad);
      const dy = 58 * Math.sin(a * rad) - 28 * Math.cos(a * rad);
      const P = easeInOut(seg(t, 0.05, 0.95)) * (1 - easeInOut(seg(t, 2.95, 3.65)));
      const kx = lerp(105, SX - dx, P);
      const ky = lerp(192, SY - dy, P);
      tf(kettle, kx, ky);
      tf(kb, 0, 0, a);
      const h = 192 - ky;
      const ss = 1 - clamp(h / 130) * 0.45;
      tf(kShadow, kx - 4, BASE + 2, 0, ss, 1);
      kShadow.setAttribute('opacity', 0.5 + 0.5 * ss);

      // 水位
      const lv = lerp(0, 56, easeInOut(seg(t, 1.05, 2.75)));
      const surf = -6 - lv;
      k.set(wRect, { y: surf });
      k.set(wTop, { y: surf });
      const surfY = BASE + surf;

      // 水の流れ
      const pS = easeOut(seg(t, 0.98, 1.2));
      const pE = easeInOut(seg(t, 2.65, 2.95));
      const front = lerp(SY, surfY, pS);
      const top = pE > 0 ? lerp(124, surfY, pE) : null;
      if (pS > 0 && pE < 1) {
        const bottom = Math.max(front, 126);
        const d = top === null
          ? `M ${SX} ${SY} C ${SX + 6} ${SY + 2} ${CX} ${SY + 10} ${CX} 124 L ${CX} ${bottom}`
          : `M ${CX} ${top} L ${CX} ${bottom}`;
        k.set(stream, { d, opacity: 1, 'stroke-width': 7 - pE * 3 });
      } else {
        k.set(stream, { opacity: 0 });
      }
      const flowing = t > 1.2 && t < 2.95;
      drops.forEach((c, i) => {
        const ph = (t * 2.4 + i * 0.34) % 1;
        const up = 20 * 4 * ph * (1 - ph);
        k.set(c, { cx: CX + (i - 1) * (6 + ph * 14), cy: surfY - up, opacity: flowing ? 0.9 : 0 });
      });
      const rp = (t * 1.8) % 1;
      k.set(ripple, { cx: CX, cy: surfY + 1, rx: 8 + rp * 18, opacity: flowing ? 0.8 * (1 - rp) : 0 });

      // 湯気：溜まってきたら立ちのぼる
      const sa = seg(t, 2.1, 2.9);
      steams.forEach((s, i) => {
        const ph = ((t * 0.55 + i / 3) % 1);
        tf(s, (i - 1) * 20 + Math.sin(t * 2 + i) * 2, -CUP_H - 6 - ph * 10, 0, 1, 1);
        s.setAttribute('opacity', sa * Math.sin(Math.PI * ph) * 0.9);
      });
    }
  };
}
