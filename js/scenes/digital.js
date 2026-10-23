// digital：新しいデジタルカメラ。まめが構えて撮ると、背面の画面に写真がすぐ映る（例文 I bought a new digital camera.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt, star } from './run-after.js';
import { roomBg } from './look-over.js';
import { held } from './dig.js';

export const meta = { duration: 3.8, beats: [[0, '新しいカメラ'], [1.4, '撮る'], [2.6, '画面に映る']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'home', 240);
  const tree = g({}); tf(tree, 300, FY);
  el('rect', { x: -4, y: -70, width: 8, height: 70, fill: pal.woodDark }, tree);
  el('circle', { cy: -90, r: 34, fill: '#7FD3A0' }, tree); el('circle', { cx: -22, cy: -76, r: 22, fill: '#6BC48F' }, tree);
  const b = k.buddy({ x: 120, y: FY, scale: S });
  const cam = g({});
  el('rect', { x: -22, y: -14, width: 44, height: 28, rx: 6, fill: pal.ink }, cam);
  el('rect', { x: -22, y: -14, width: 44, height: 8, rx: 4, fill: pal.sub }, cam);
  el('circle', { cx: 0, cy: 2, r: 10, fill: '#2B3A55', stroke: '#9FB4CC', 'stroke-width': 3 }, cam);
  el('circle', { cx: -2, cy: 0, r: 3, fill: '#9FB4CC' }, cam);
  const scr = g({}); tf(scr, 330, 70);
  el('rect', { x: -36, y: -26, width: 72, height: 52, rx: 6, fill: pal.ink }, scr);
  const pic = el('rect', { x: -31, y: -21, width: 62, height: 42, rx: 3, fill: '#DDEFFA' }, scr);
  el('circle', { cx: 14, cy: -8, r: 6, fill: pal.yellow }, scr); el('path', { d: 'M -31 21 L -12 -2 L 4 12 L 12 6 L 31 21 Z', fill: '#7FD3A0' }, scr);
  const fl = el('circle', { cx: 200, cy: 150, r: 60, fill: '#fff', opacity: 0 });
  const st = star(k);
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.3, 1.2)), snap = hump(seg(t, 1.6, 1.9));
      b.pose({ armR: lerp(20, 78, up), armL: 8, lean: 3 * up, mood: t > 2.4 ? 'grin' : 'smile', blink: blinkAt(t), look: 0.6 });
      held(k, b, S, cam, 'R', 0, 22);
      tf(scr, 330, 70, 0, backOut(seg(t, 2.3, 2.9)));
      fl.setAttribute('opacity', 0.8 * snap);
      st.set(150, 140, seg(t, 2.8, 3.6));
    }
  };
}
