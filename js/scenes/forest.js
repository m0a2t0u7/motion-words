// forest：木がびっしりの森の中、2人は分かれ道で立ち止まり、きょろきょろ。道が分からず迷ってしまう（例文 We got lost in the forest.）
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';
import { scene, treeG, gait, P, blinkAt, mark } from './nature.js';

export const meta = { duration: 4.4, beats: [[0, '森を歩く'], [1.4, '分かれ道'], [2.8, '迷ってしまった']] };

export function create(k) {
  const { el, tf, pal } = k, S = 0.85;
  const { FY } = scene(k, { FY: 244, top: '#B9D9C0', bot: '#E2EFE3', ground: '#9CC79F', edge: '#8BBA8F' });
  for (let i = 0; i < 9; i++) tf(treeG(k, 0.9 + (i % 3) * 0.15, '#5FA872', '#4F9A64').g, -10 + i * 52, FY - 40);
  el('path', { d: `M 200 ${FY - 40} L 120 ${FY + 60} L 280 ${FY + 60} Z M 200 ${FY - 30} L 60 ${FY - 30} L 40 ${FY - 12} L 190 ${FY - 14} Z M 210 ${FY - 30} L 360 ${FY - 30} L 390 ${FY - 12} L 220 ${FY - 14} Z`, fill: '#D8C49E' });
  // 分かれ道の標識（文字なし、矢印）
  el('rect', { x: 196, y: FY - 92, width: 6, height: 60, fill: pal.woodDark });
  el('path', { d: `M 200 ${FY - 90} h 30 l 8 7 l -8 7 h -30 Z M 198 ${FY - 70} h -30 l -8 7 l 8 7 h 30 Z`, fill: pal.wood });
  [[-30, 0.95], [360, 1.1], [100, 1.2], [300, 1.25]].forEach(([x, s]) => tf(treeG(k, s, '#4F9A64', '#438B57').g, x, FY + 40));
  const a = k.buddy({ x: 120, y: FY + 34, scale: S });
  const c = k.buddy({ x: 60, y: FY + 34, scale: S * 0.95, color: pal.coral, dark: pal.coralDark });
  const q1 = mark(k, '?', pal.ink), q2 = mark(k, '?', pal.ink);
  const fa = (t) => lerp(80, 175, easeInOut(seg(t, 0.1, 1.4)));
  const fc = (t) => lerp(20, 240 - 0, 0) + lerp(0, 230 - 20 - 0, easeInOut(seg(t, 0.2, 1.5))) * 0 + lerp(20, 240, easeInOut(seg(t, 0.2, 1.5))) - 20;
  return {
    update(t) {
      const wa = gait(fa, t, 80, 14, 0.12), wc = gait(fc, t, 0, 14, 0.12);
      const look = (o) => (t > 1.5 ? Math.sign(Math.sin((t + o) * 3.2)) : 1);
      const lost = easeOut(seg(t, 2.6, 3.0));
      P(a, { x: wa.x, y: FY + 34, walk: wa.walk, lean: wa.lean, facing: look(0), look: 0.6, armL: lerp(wa.armL, 40, lost), armR: lerp(wa.armR, 40, lost), mood: t > 1.6 ? 'sad' : 'smile', blink: blinkAt(t) });
      P(c, { x: wc.x, y: FY + 34, walk: wc.walk, lean: wc.lean, facing: look(0.5), look: 0.6, armL: wc.armL, armR: lerp(wc.armR, 150, lost), mood: t > 1.6 ? 'open' : 'smile', blink: blinkAt(t, 1) });
      q1.show(seg(t, 2.2, 2.6), wa.x, FY - 70);
      q2.show(seg(t, 2.5, 2.9), wc.x, FY - 66);
    }
  };
}
