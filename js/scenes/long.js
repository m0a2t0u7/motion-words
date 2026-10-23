// long：会議が時計を何周もして、とても長く続く（例文 It was a long meeting.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt, clock } from './run-after.js';
import { roomBg, desk } from './look-over.js';

export const meta = { duration: 4.0, beats: [[0, '会議が始まる'], [1.4, '続く'], [3.3, 'やっと終わり']] };

export function create(k) {
  const { el, tf, pal } = k;
  const FY = roomBg(k, 'office', 240);
  const c = clock(k, 200, 62, 26);
  // 会議の長さを示す横棒
  el('rect', { x: 30, y: 276, width: 340, height: 8, rx: 4, fill: pal.line });
  const bar = el('rect', { x: 30, y: 276, width: 0, height: 8, rx: 4, fill: pal.coral });
  const a = k.buddy({ x: 110, y: FY + 4, scale: 0.8, facing: 1 });
  const b = k.buddy({ x: 290, y: FY + 4, scale: 0.8, facing: -1, color: pal.blue, dark: pal.blueDark });
  desk(k, 150, 100, 188);
  return {
    update(t) {
      const p = easeInOut(seg(t, 0.2, 3.4));
      const mins = p * 60 * 5;
      c.set(9 + Math.floor(mins / 60), mins % 60);
      bar.setAttribute('width', 340 * p);
      const tired = seg(t, 1.2, 3.2), end = seg(t, 3.4, 3.9);
      const mood = (e) => (end > 0.3 ? 'grin' : tired > 0.5 ? 'sad' : e);
      P(a, { y: FY + 4, lean: 8 * tired * (1 - end), squash: 1 - 0.1 * tired * (1 - end), armR: lerp(8, 40, hump(seg(t, 0.4, 1.0))) * (1 - tired) + 8 + end * 150, mood: mood('smile'), look: 0.4, blink: blinkAt(t) });
      P(b, { y: FY + 4, lean: 8 * tired * (1 - end), squash: 1 - 0.12 * Math.abs(Math.sin(t * 1.5)) * tired, armR: 8 + end * 150, mood: mood('flat'), look: 0.3, blink: blinkAt(t, 1.2) });
    }
  };
}
