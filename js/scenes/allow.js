// allow：子どもが「9時まで外にいていい？」と聞き、両親がうなずいて許し、子どもは出かける（例文 My parents allow me to stay out until nine.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { say } from './look-over.js';
import { walk, path } from './queue-up.js';

// 時計の顔（中心原点）。h 時を指す
export function clockFace(k, parent, r = 14, hour = 9) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('circle', { r, fill: '#fff', stroke: pal.ink, 'stroke-width': 2.4 }, g);
  const a = (hour % 12) * 30 * Math.PI / 180;
  k.el('line', { x1: 0, y1: 0, x2: Math.sin(a) * r * 0.55, y2: -Math.cos(a) * r * 0.55, stroke: pal.ink, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, g);
  k.el('line', { x1: 0, y1: 0, x2: 0, y2: -r * 0.78, stroke: pal.ink, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '9時までいい？'], [1.5, 'いいよ'], [3.0, '出かける']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // 玄関：開いたドアの向こうは夕方の外
  el('rect', { x: 314, y: 96, width: 66, height: 140, fill: '#F7C9A8' });
  el('rect', { x: 314, y: 190, width: 66, height: 46, fill: '#B9D99A' });
  el('circle', { cx: 360, cy: 124, r: 9, fill: '#FFE08A' });
  el('rect', { x: 308, y: 90, width: 78, height: 8, fill: pal.woodDark });
  el('rect', { x: 308, y: 90, width: 8, height: 146, fill: pal.woodDark });
  el('rect', { x: 378, y: 90, width: 8, height: 146, fill: pal.woodDark });
  el('path', { d: 'M 316 98 L 298 104 L 298 236 L 316 236 Z', fill: pal.wood });
  // 壁の時計（今は6時）
  tf(clockFace(k, k.root, 16, 6), 200, 66);
  const mom = k.buddy({ x: 70, y: FY, scale: 1.0, facing: 1, color: pal.coral, dark: pal.coralDark });
  const dad = k.buddy({ x: 126, y: FY, scale: 1.08, facing: 1, color: pal.coral, dark: pal.coralDark });
  const kid = k.buddy({ x: 214, y: FY, scale: 0.66, facing: -1 });
  const ask = say(k, 64, 40, 1);
  tf(clockFace(k, ask.g, 13, 9), -10, 0);
  k.text(18, 1, '?', { 'font-size': 18, fill: pal.blueDark }, ask.g);
  const ok = say(k, 46, 36, -1);
  el('path', { d: 'M -9 0 L -3 7 L 10 -7', stroke: pal.green, 'stroke-width': 4.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ok.g);
  const xf = path([[0, 214], [3.0, 214], [4.2, 344]]);
  return {
    update(t) {
      const nod = t > 1.5 && t < 2.6 ? Math.max(0, Math.sin((t - 1.5) * 12)) * 4 : 0;
      ask.show(seg(t, 0.3, 0.6) * (1 - seg(t, 2.8, 3.0)), 236, 128);
      ok.show(seg(t, 1.7, 2.0) * (1 - seg(t, 3.6, 3.8)), 108, 98);
      [mom, dad].forEach((p, i) => {
        P(p, { look: 0.7, blink: blinkAt(t, i), mood: t > 1.5 ? 'grin' : 'smile', armR: i ? 10 + 150 * easeOut(seg(t, 1.8, 2.1)) * (1 - easeInOut(seg(t, 3.4, 3.8))) : 10, armL: 10 });
        p.body.children[3].setAttribute('transform', `translate(5 ${nod.toFixed(2)})`);
      });
      // 子ども：手を合わせて頼む→はずむ→手を振って玄関へ
      const plead = t < 1.6 ? 1 : 0, joy = hump(seg(t, 2.1, 2.5));
      if (t < 3.0) P(kid, { facing: -1, look: 0.7, blink: blinkAt(t, 2), armL: plead ? 120 + 6 * Math.sin(t * 8) : 10, armR: plead ? 120 : 10 + 140 * joy, lift: 12 * joy, mood: plead ? 'smile' : 'grin' });
      else walk(kid, xf, t, { facing: 1, look: -0.6, mood: 'grin', armL: 150 + 20 * Math.sin(t * 10) });
    }
  };
}
