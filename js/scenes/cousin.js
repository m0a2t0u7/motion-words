// cousin：いとこと並んでコントローラーを持ち、テレビゲームで遊んで盛り上がる（例文 I played games with my cousin.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, P, blinkAt, C } from './jam.js';
import { homeBg } from './furniture.js';

export const meta = { duration: 4.4, beats: [[0, 'いとこと'], [0.6, 'ゲームで遊ぶ'], [3.2, 'やったー']] };

export function create(k) {
  const { el, pal } = k;
  const FY = homeBg(k, { winX: 300, winW: 80 });
  // テレビ（2台の車のレース）
  el('rect', { x: 150, y: 54, width: 130, height: 84, rx: 6, fill: '#2E3440' });
  el('rect', { x: 158, y: 62, width: 114, height: 68, fill: '#9FD9F2' });
  el('rect', { x: 158, y: 104, width: 114, height: 26, fill: '#8C96A8' });
  el('rect', { x: 205, y: 138, width: 20, height: 10, fill: '#2E3440' }); el('rect', { x: 186, y: 146, width: 58, height: 5, rx: 2, fill: '#2E3440' });
  const car1 = el('rect', { width: 16, height: 8, rx: 3, fill: pal.mint }), car2 = el('rect', { width: 16, height: 8, rx: 3, fill: pal.coral });
  const flag = el('rect', { x: 258, y: 100, width: 4, height: 30, fill: '#fff' });
  const pads = [0, 1].map(() => { const g = k.g({}); el('rect', { x: -12, y: -6, width: 24, height: 12, rx: 6, fill: '#566070' }, g); el('circle', { cx: 6, cy: -1, r: 2, fill: pal.red }, g); el('circle', { cx: -6, cy: -1, r: 2, fill: pal.yellow }, g); return g; });
  const me = k.buddy({ x: 150, y: FY + 30, scale: 1.1 });
  const cz = k.buddy({ x: 270, y: FY + 30, scale: 1.05, ...C(k, 'coral') });
  // ソファーの前面
  el('rect', { x: 90, y: FY - 8, width: 240, height: 70, rx: 14, fill: '#7FB3E8' });
  el('rect', { x: 90, y: FY - 8, width: 240, height: 10, rx: 5, fill: '#5C93CF' });
  const A = arms(k, me, 1.1), B = arms(k, cz, 1.05, { col: pal.coral, dark: pal.coralDark });
  return {
    update(t) {
      const race = seg(t, 0.4, 3.0);
      const win = t > 3.0;
      const jump = win ? Math.abs(Math.sin((t - 3) * 8)) * 8 : 0;
      k.tf(car1, 160 + 92 * easeInOut(race) * 1.02, 112); k.tf(car2, 160 + 90 * easeInOut(race) * (0.98 + 0.02 * Math.sin(t * 3)), 120);
      flag.setAttribute('opacity', race > 0.95 ? 1 : 0.4);
      const press = (o) => (t < 3 ? Math.abs(Math.sin(t * 13 + o)) * 3 : 0);
      P(me, { look: -0.2, blink: blinkAt(t), mood: win ? 'grin' : 'flat', lift: jump, lean: t < 3 ? 6 * Math.sin(t * 2) : 0 });
      P(cz, { look: -0.6, blink: blinkAt(t, 1), mood: win ? 'grin' : 'open', lift: jump * 0.8, lean: t < 3 ? -6 * Math.sin(t * 2) : 0 });
      const up = easeOut(seg(t, 3.0, 3.3));
      const p1 = { x: 150 + 10, y: lerp(FY - 4 + press(0), FY - 110 - jump, up) };
      const p2 = { x: 270 - 10, y: lerp(FY - 4 + press(1), FY - 110 - jump * 0.8, up) };
      A.to('R', p1.x + 9, p1.y); A.to('L', p1.x - 9, p1.y);
      B.to('R', p2.x + 9, p2.y); B.to('L', p2.x - 9, p2.y);
      k.tf(pads[0], p1.x, p1.y - 4); k.tf(pads[1], p2.x, p2.y - 4);
    }
  };
}
