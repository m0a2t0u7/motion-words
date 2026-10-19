// switch：暗い部屋で、手さぐりで壁をなでながら電気のスイッチを探している（例文 Where is the light switch?）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { reach } from './dig.js';
import { gait } from './weigh.js';
import { P, blinkAt } from './run-after.js';
import { homeBg } from './furniture.js';
import { cue } from './in-common.js';

// 壁の電気スイッチ（原点＝中心）。lamp は暗がりで光る小さな目印
export function lightSwitch(k, parent) {
  const g = k.g({}, parent), { el, pal } = k;
  el('rect', { x: -12, y: -18, width: 24, height: 36, rx: 4, fill: '#fff', stroke: '#C9D2DE', 'stroke-width': 2 }, g);
  el('rect', { x: -6, y: -11, width: 12, height: 22, rx: 2, fill: '#EEF1F5', stroke: '#C9D2DE', 'stroke-width': 1.5 }, g);
  el('rect', { x: -5, y: -10, width: 10, height: 10, rx: 1.5, fill: '#fff' }, g);
  const lamp = el('circle', { cx: 0, cy: 6, r: 1.8, fill: pal.green }, g);
  return { g, lamp };
}

export const meta = { duration: 4.4, beats: [[0, '真っ暗'], [1.2, '手さぐり'], [3.0, 'スイッチはどこ？']] };

export function create(k) {
  const { el, tf } = k, S = 0.92;
  const FY = homeBg(k, { winX: 40, winW: 76, sky: '#3C4A73', curtain: '#8F9BC0' });
  el('circle', { cx: 92, cy: 64, r: 7, fill: '#FFF3C4' });
  // 天井の電灯（消えている）
  el('line', { x1: 200, y1: 0, x2: 200, y2: 26, stroke: '#9AA4B4', 'stroke-width': 3 });
  el('path', { d: 'M 176 44 Q 200 18 224 44 Z', fill: '#C9D2DE' });
  el('rect', { x: 186, y: 42, width: 28, height: 6, rx: 3, fill: '#8892A3' });
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#1E2540', opacity: 0.55 });
  // ドアの枠とスイッチ（右の壁）
  el('rect', { x: 320, y: 70, width: 80, height: FY - 70, fill: '#3B4466', opacity: 0.6 });
  const SWX = 296, SWY = 150;
  const glow = el('circle', { cx: SWX, cy: SWY, r: 26, fill: '#FFF3C4', opacity: 0.2 });
  const sw = lightSwitch(k); tf(sw.g, SWX, SWY);
  const b = k.buddy({ x: 70, y: FY, scale: S });
  const q = cue(k, '?', 34, 32, -1, 20);
  // 手さぐりで左の壁から右へ。スイッチにはまだ届かない
  const xf = (t) => lerp(70, 196, easeInOut(seg(t, 0.6, 3.6)));
  return {
    update(t) {
      const w = gait(xf, t, 70, 0, 0.09);
      const reachUp = easeInOut(seg(t, 0.5, 0.9));
      const hy = 150 + 10 * Math.sin(t * 4.2), hx = w.x + 40;
      const pose = { x: w.x, walk: w.walk * 0.7, lean: 4, look: Math.sin(t * 1.7) * 0.8, blink: blinkAt(t), mood: 'flat', squash: 1 };
      P(b, pose);
      P(b, { ...pose, armR: lerp(8, reach(b, S, 'R', hx, hy), reachUp), armL: 30 + 10 * Math.sin(t * 3) });
      q.show(seg(t, 1.4, 1.9), w.x - 6, FY - 104 + 3 * Math.sin(t * 3));
      const pulse = 0.5 + 0.5 * Math.sin(t * 3);
      k.set(glow, { opacity: 0.12 + 0.12 * pulse, r: 22 + 6 * pulse });
      k.set(sw.lamp, { opacity: 0.5 + 0.5 * pulse });
    }
  };
}
