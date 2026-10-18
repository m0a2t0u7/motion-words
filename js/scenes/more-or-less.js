// more or less：机で書類を片づけていく。進み具合のバーはほぼいっぱい（最後に少しだけ残る）で、ひと息つく（例文 The work is more or less finished.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { officeBg, desk, monitor } from './get-on-with.js';
import { papers } from './hand-over.js';
import { hp } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, '作業中'], [1.6, 'どんどん進む'], [3.0, 'ほぼ終わり']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236, 40);
  const b = k.buddy({ x: 140, y: FY - 6, facing: 1, scale: 1.05 });
  const top = desk(k, 120, 200, FY);
  const M = monitor(k, 290, top);
  // 進み具合のバー（モニター上）
  const barBg = el('rect', { x: 270, y: top - 32, width: 40, height: 8, rx: 3, fill: '#fff', opacity: 0.8 });
  const bar = el('rect', { x: 270, y: top - 32, width: 0, height: 8, rx: 3, fill: pal.green });
  // 未処理の山（左）→処理済みの山（右）
  const todo = [0, 1, 2, 3, 4, 5, 6].map((i) => { const p = papers(k, 1); return p; });
  const moving = papers(k, 1);
  return {
    update(t) {
      const N = 7;
      const prog = seg(t, 0.3, 3.0) * 6; // 6枚だけ片づく（1枚残る）
      const n = Math.floor(prog), f = prog - n;
      const doing = t > 0.3 && t < 3.0;
      const stretch = easeOut(seg(t, 3.2, 3.7));
      P(b, { x: 140, y: FY - 6, facing: 1, look: 0.6, lean: doing ? 8 : lerp(8, -8, stretch), armR: doing ? 70 + 20 * Math.sin(f * Math.PI * 2) : lerp(70, 165, stretch), armL: doing ? 10 : lerp(10, 165, stretch), mood: t > 3.2 ? 'grin' : 'flat', blink: blinkAt(t) });
      todo.forEach((p, i) => {
        // 下から i 番目。上から順に処理される
        const done = i >= N - n;
        const x = done ? 244 : 178, y = done ? top - 4 - (N - 1 - i) * 2.4 : top - 4 - i * 2.4;
        tf(p, x, y, 0, 1);
        p.setAttribute('opacity', i === N - 1 - n && doing ? 0 : 1);
      });
      // 今処理中の1枚：左の山→手元→右の山
      const h = hp(b, 1.05);
      const mx = lerp(178, 244, easeInOut(f)), my = lerp(top - 4 - (N - 1 - n) * 2.4, top - 4 - n * 2.4, f) - 22 * hump(f);
      tf(moving, mx, my, 0, 1);
      moving.setAttribute('opacity', doing && n < 6 ? 1 : 0);
      k.set(bar, { width: 40 * 0.92 * seg(t, 0.3, 3.0) });
    }
  };
}
