// sooner or later：割れたカップを背中に隠す相手に、砂時計を見せて「いつかは彼女に言わないと」と、奥の彼女のほうを指す（例文 Sooner or later, you'll have to tell her.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';
import { reach } from './dig.js';
import { say } from './get-on-with.js';
import { person } from './queue-up.js';

export const meta = { duration: 4.4, beats: [[0, '隠している'], [1.2, '時間の問題'], [3.0, '彼女のほうへ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  // 奥の部屋（右）にいる「彼女」
  el('rect', { x: 318, y: FY - 130, width: 76, height: 130, fill: '#EFE6D8' });
  el('rect', { x: 312, y: FY - 136, width: 88, height: 8, rx: 3, fill: pal.woodDark });
  const her = person(k, 'violet', { x: 356, y: FY - 6, scale: 0.72, facing: -1 });
  const c = k.buddy({ x: 200, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  // 背中に隠した割れたカップ
  const cup = g({});
  el('path', { d: 'M -9 -10 L 9 -10 L 7 8 L -7 8 Z', fill: '#fff', stroke: pal.blue, 'stroke-width': 2 }, cup);
  el('path', { d: 'M -9 -10 L -2 -2 L -6 2 L 0 8', stroke: pal.ink, 'stroke-width': 1.6, fill: 'none' }, cup);
  const b = k.buddy({ x: 100, y: FY, facing: 1 });
  // 吹き出し：砂時計の砂が落ちきる
  const B = say(k, 62, 56);
  const hg = g({}, B.inner);
  el('path', { d: 'M -12 -20 L 12 -20 L 2 0 L 12 20 L -12 20 L -2 0 Z', fill: '#fff', stroke: pal.ink, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, hg);
  const sTop = el('path', { d: '', fill: pal.yellowDark }, hg);
  const sBot = el('path', { d: '', fill: pal.yellowDark }, hg);
  const stream = el('line', { x1: 0, y1: 0, x2: 0, y2: 18, stroke: pal.yellowDark, 'stroke-width': 1.6 }, hg);
  const arrow = el('path', { d: 'M 0 0 L 70 0 M 62 -7 L 70 0 L 62 7', stroke: pal.green, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  return {
    update(t) {
      const sand = easeInOut(seg(t, 1.2, 2.8));
      const ht = 18 * (1 - sand), hb = 18 * sand;
      sTop.setAttribute('d', `M ${-10 * ht / 18} ${-ht} L ${10 * ht / 18} ${-ht} L 0 0 Z`);
      sBot.setAttribute('d', `M -11 19 L 11 19 L ${10 * (1 - hb / 18) + 1} ${19 - hb} L ${-10 * (1 - hb / 18) - 1} ${19 - hb} Z`);
      stream.setAttribute('opacity', sand > 0 && sand < 1 ? 1 : 0);
      B.show(150, 110, easeOut(seg(t, 1.0, 1.3)) * (1 - seg(t, 3.0, 3.2)));
      const point = easeOut(seg(t, 2.9, 3.3));
      P(b, { x: 100, facing: 1, look: 0.6 });
      const pA = reach(b, 1, 'R', 340, FY - 60);
      P(b, { x: 100, facing: 1, look: 0.6, armR: lerp(lerp(8, 50, seg(t, 0.9, 1.2)), pA, point), armL: 8, mood: t > 0.9 && t < 2.8 && Math.sin(t * 20) > 0 ? 'open' : 'flat', lean: 3, blink: blinkAt(t) });
      // 相手：うしろ手に隠してもじもじ→彼女のほうを見て、ごくり
      const turn = easeInOut(seg(t, 3.2, 3.5));
      const fid = Math.sin(t * 6) * 3 * (1 - turn);
      P(c, { x: 200, facing: turn > 0.5 ? 1 : -1, look: turn > 0.5 ? 0.6 : 0.3, armL: 20, armR: 10 + fid, mood: t < 3.4 ? 'flat' : 'sad', lean: -3, squash: 1 - 0.04 * hump(seg(t, 3.7, 4.1)), blink: blinkAt(t, 1) });
      tf(cup, turn > 0.5 ? 168 : 232, FY - 30, 0);
      P(her, { x: 356, y: FY - 6, scale: 0.72, facing: -1, armR: 50 + 10 * Math.sin(t * 2), mood: 'smile', look: -0.3, blink: blinkAt(t, 2) });
      k.set(arrow, { transform: `translate(232 ${FY - 120}) scale(${Math.max(0.001, easeOut(seg(t, 3.2, 3.8)))} 1)` });
    }
  };
}
