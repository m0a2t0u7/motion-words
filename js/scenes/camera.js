// camera：新しいカメラを構えて友だちを撮る。フラッシュが光り、撮った写真が出てくる（例文 He took a picture with his new camera.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { reach, hp, P, blinkAt, face } from './bag.js';
import { parkBg, tree, star } from './run-after.js';

export function cameraProp(k, parent) {
  const g = k.g({}, parent), { el, pal } = k;
  el('rect', { x: -15, y: -10, width: 30, height: 20, rx: 4, fill: pal.ink }, g);
  el('rect', { x: -10, y: -14, width: 10, height: 5, rx: 1.5, fill: pal.ink }, g);
  el('circle', { cx: 2, cy: 0, r: 7, fill: '#5A6472', stroke: '#C9D1DC', 'stroke-width': 2 }, g);
  el('circle', { cx: 2, cy: 0, r: 3, fill: '#9FB4CC' }, g);
  el('rect', { x: 8, y: -8, width: 5, height: 3, rx: 1, fill: '#fff' }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '新しいカメラ'], [1.4, 'パシャッ'], [2.4, '写真が撮れた']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.15, FY = 236, X = 110;
  parkBg(k, FY);
  tree(k, 320, FY - 2, 1.1);
  const fr = k.buddy({ x: 290, y: FY, scale: 1.05, facing: -1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: X, y: FY, scale: S });
  const cam = cameraProp(k);
  const sp = star(k, pal.yellow);
  const flash = el('circle', { r: 30, fill: '#FFFDE8' });
  const photo = k.g({});
  el('rect', { x: -26, y: -30, width: 52, height: 60, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, photo);
  el('rect', { x: -21, y: -25, width: 42, height: 40, fill: '#DCEFD9' }, photo);
  el('circle', { cx: 10, cy: -10, r: 9, fill: '#7FD3A0' }, photo);
  const mini = k.buddy({ x: -4, y: 14, scale: 0.34, facing: -1, color: pal.coral, dark: pal.coralDark, parent: photo });
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.6, 1.1)), down = easeInOut(seg(t, 2.2, 2.7));
      const eye = { x: X + 36, y: FY - 70 * S };
      P(b, { x: X, look: 0.8, blink: t > 1.1 && t < 2.2 ? 0.8 : blinkAt(t), mood: t > 2.4 ? 'grin' : 'flat' });
      face(b, 5, 0);
      const C = { x: lerp(X + 40, eye.x, up * (1 - down)) + 10 * down, y: lerp(FY - 46, eye.y, up * (1 - down)) + 4 * down };
      b.pose({ armR: reach(b, S, 'R', C.x, C.y + 8), armL: reach(b, S, 'L', C.x - 10, C.y + 8) });
      tf(cam, C.x, C.y, 0, 1);
      sp.set(C.x + 8, C.y - 16, seg(t, 0.1, 0.7));
      // 友だちはポーズ
      P(fr, { x: 290, facing: -1, look: 0.4, blink: blinkAt(t, 1), mood: 'grin', armL: 8 + 140 * easeOut(seg(t, 0.8, 1.2)) * (1 - seg(t, 2.4, 2.8)) });
      const f = seg(t, 1.5, 1.75);
      tf(flash, C.x + 10, C.y - 6, 0, f > 0 && f < 1 ? 0.2 + f * 1.2 : 0.001);
      flash.setAttribute('opacity', 1 - f);
      const ph = seg(t, 2.4, 2.9);
      tf(photo, 200, 92, -6 + 6 * ph, ph <= 0 ? 0.001 : backOut(ph));
      P(mini, { x: -4, y: 14, facing: -1, mood: 'grin', armL: 148 });
    }
  };
}
