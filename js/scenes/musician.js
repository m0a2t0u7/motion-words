// musician：音楽家のまめがピアノを両手で美しく弾き、音符が流れ、聞いている人がうっとりして拍手する（例文 The musician played the piano beautifully.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, reach, P, blinkAt, wear, sc } from './member.js';
import { icon } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, 'ピアノの前'], [0.8, '美しく弾く'], [3.4, '拍手']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1, FY = 236;
  k.backdrop({ floorY: FY, mood: 'evening' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#3A3550' });
  el('ellipse', { cx: 170, cy: FY, rx: 150, ry: 18, fill: '#FFF2C8', opacity: 0.25 });
  el('path', { d: 'M 120 0 L 60 236 L 280 236 L 220 0 Z', fill: '#FFF6D8', opacity: 0.1 });
  // 横から見たアップライトピアノ（左向きに座る）
  const PX = 210;
  k.shadow(PX + 40, FY + 1, 60, 5);
  el('rect', { x: PX, y: FY - 140, width: 90, height: 140, rx: 6, fill: '#2B2B33' });
  el('rect', { x: PX - 30, y: FY - 76, width: 34, height: 12, rx: 2, fill: '#2B2B33' });
  el('rect', { x: PX - 30, y: FY - 80, width: 34, height: 5, fill: '#fff' });
  el('rect', { x: PX - 24, y: FY - 64, width: 8, height: 64, fill: '#2B2B33' });
  el('rect', { x: PX + 10, y: FY - 130, width: 70, height: 30, rx: 3, fill: '#fff', opacity: 0.9 });
  [0, 1, 2].forEach((i) => el('line', { x1: PX + 16, y1: FY - 122 + i * 7, x2: PX + 74, y2: FY - 122 + i * 7, stroke: pal.sub, 'stroke-width': 1 }));
  // いす
  el('rect', { x: 110, y: FY - 44, width: 44, height: 8, rx: 3, fill: '#7A3B4A' });
  el('rect', { x: 114, y: FY - 36, width: 5, height: 36, fill: pal.woodDark }); el('rect', { x: 145, y: FY - 36, width: 5, height: 36, fill: pal.woodDark });
  const b = k.buddy({ x: 140, y: FY - 30, scale: S, facing: 1 }); b.g.firstChild.setAttribute('display', 'none');
  const au = k.buddy({ x: 360, y: FY, scale: 0.72, facing: -1, ...CO(k) });
  const notes = [0, 1, 2, 3, 4].map(() => icon(k, 'note'));
  return {
    update(t) {
      const play = t > 0.6 && t < 3.4;
      const sway = play ? Math.sin(t * 3) : 0;
      P(b, { y: FY - 30, lean: 8 + 6 * sway, look: 0.8, blink: play ? 0.7 : blinkAt(t), mood: t > 3.5 ? 'grin' : 'smile' });
      // 鍵盤の上で両手が交互に跳ねる
      const kx = PX - 22, ky = FY - 82;
      const r = { x: kx + 12 + 8 * Math.sin(t * 5), y: ky - 4 * Math.abs(Math.sin(t * 13)) * (play ? 1 : 0) };
      const l = { x: kx + 2 + 6 * Math.sin(t * 4 + 1), y: ky - 4 * Math.abs(Math.sin(t * 11 + 1)) * (play ? 1 : 0) };
      const on = easeInOut(seg(t, 0.2, 0.6)) * (1 - easeInOut(seg(t, 3.4, 3.8)));
      b.pose({ armR: lerp(10, reach(b, S, 'R', r.x, r.y), on), armL: lerp(10, reach(b, S, 'L', l.x, l.y), on) });
      notes.forEach((n, i) => { const q = ((t - 0.8 - i * 0.5) % 2.5) / 2.5; const ok = t > 0.8 + i * 0.5 && t < 3.8; tf(n, PX + 40 + q * 90, FY - 150 - q * 80 + Math.sin(q * 8) * 8, Math.sin(q * 6) * 15, ok ? sc(hump(q) * 1.2) : 0.001); });
      const clap = t > 3.4 ? Math.abs(Math.sin((t - 3.4) * 12)) : 0;
      P(au, { look: 0.6, blink: t > 1 && t < 3.3 ? 1 : blinkAt(t, 1), mood: t > 3.4 ? 'grin' : 'smile', armR: t > 3.4 ? 70 + 20 * clap : 8, armL: t > 3.4 ? 70 + 20 * clap : 8, lean: -3 * Math.sin(t * 2) * (play ? 1 : 0) });
    }
  };
}
