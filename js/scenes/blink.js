// blink（否定）：写真を撮るあいだ、目を閉じないようにこらえる→フラッシュ→目を開けた写真が撮れる（例文 Don't blink during the photo.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, 'カメラの前'], [1.6, '目を開け続ける'], [3.4, '開いた写真']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 150, y: 40, width: 200, height: 100, rx: 8, fill: '#EAF3F9' });
  // 三脚とカメラ（左）
  const cam = g({});
  [-1, 0, 1].forEach((s) => el('line', { x1: 78 + s * 2, y1: 170, x2: 78 + s * 26, y2: FY, stroke: pal.sub, 'stroke-width': 4, 'stroke-linecap': 'round' }, cam));
  k.shadow(78, FY, 36, 4);
  el('rect', { x: 52, y: 118, width: 56, height: 44, rx: 8, fill: pal.ink }, cam);
  el('rect', { x: 60, y: 110, width: 18, height: 10, rx: 3, fill: pal.sub }, cam);
  el('circle', { cx: 90, cy: 140, r: 15, fill: '#4B566B', stroke: '#8793A8', 'stroke-width': 3 }, cam);
  el('circle', { cx: 90, cy: 140, r: 7, fill: '#BFE3F5' }, cam);
  const lamp = el('circle', { cx: 62, cy: 128, r: 3, fill: pal.red });
  const cd = k.text(80, 96, '3', { 'font-size': 26, fill: pal.red });
  const b = k.buddy({ x: 250, y: FY, scale: 1.2, facing: -1 });
  // 「まばたき禁止」マーク
  const ban = g({}); tf(ban, 262, 92);
  el('circle', { r: 22, fill: '#fff', stroke: pal.red, 'stroke-width': 5 }, ban);
  el('path', { d: 'M -11 2 Q 0 11 11 2', fill: 'none', stroke: pal.ink, 'stroke-width': 3.4, 'stroke-linecap': 'round' }, ban);
  el('line', { x1: -15, y1: -15, x2: 15, y2: 15, stroke: pal.red, 'stroke-width': 5, 'stroke-linecap': 'round' }, ban);
  // 写真
  const ph = g({});
  el('rect', { x: -34, y: -40, width: 68, height: 80, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, ph);
  el('rect', { x: -28, y: -34, width: 56, height: 56, rx: 2, fill: '#EAF3F9' }, ph);
  el('rect', { x: -14, y: -26, width: 28, height: 44, rx: 12, fill: pal.mint }, ph);
  el('ellipse', { cx: -5, cy: -8, rx: 2.4, ry: 3.4, fill: pal.ink }, ph); el('ellipse', { cx: 5, cy: -8, rx: 2.4, ry: 3.4, fill: pal.ink }, ph);
  el('path', { d: 'M -3 -2 Q 0 1 3 -2', fill: 'none', stroke: pal.ink, 'stroke-width': 1.6, 'stroke-linecap': 'round' }, ph);
  const flash = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#fff', opacity: 0 });
  return {
    update(t) {
      const n = t < 1.2 ? '' : t < 1.9 ? '3' : t < 2.5 ? '2' : t < 3.0 ? '1' : '';
      cd.textContent = n; cd.setAttribute('opacity', n ? 1 : 0);
      tf(cd, 0, 0, 0, 1 + 0.2 * hump(((t - 1.2) % 0.6) / 0.6));
      // こらえる：目はずっと開いたまま、体がこわばって小さく震える
      const tense = seg(t, 0.6, 1.6) * (1 - seg(t, 3.1, 3.6));
      b.pose({ blink: 0, mood: t < 3.2 ? 'flat' : 'grin', look: -0.9, armL: 8 + 4 * tense, armR: 8 + 4 * tense, squash: 1 + 0.03 * tense - 0.01 * Math.sin(t * 40) * tense,
        x: 250 + 0.8 * Math.sin(t * 50) * tense, lean: -2 * tense });
      tf(ban, 262, 88 - 2 * Math.sin(t * 4)); ban.setAttribute('opacity', t < 0.3 ? 0 : t < 3.0 ? 1 : 1 - seg(t, 3.0, 3.2));
      const f = hump(seg(t, 3.0, 3.35));
      flash.setAttribute('opacity', 0.95 * (t < 3.0 ? 0 : f));
      lamp.setAttribute('opacity', t > 1.2 && t < 3.0 ? (Math.sin(t * 12) > 0 ? 1 : 0.3) : 1);
      const p = backOut(seg(t, 3.5, 4.1), 1.3);
      tf(ph, 336, 170 - 20 * p, -6 + 6 * p, p); ph.setAttribute('opacity', p > 0 ? 1 : 0);
    }
  };
}
