// speak up：相手が耳に手を当てて「？」→まめが息を吸って、さっきより大きな声で話す（例文 Could you speak up a little, please?）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { roomBg, say, waves, faceAt } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '小さな声'], [1.3, 'もう少し大きく'], [2.7, '大きな声で話す']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'office', 240);
  const b = k.buddy({ x: 130, y: FY, scale: 0.95 });
  const o = k.buddy({ x: 290, y: FY, scale: 0.95, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const q = say(k, 34, 32, 1); k.text(0, 1, '?', { 'font-size': 22, fill: pal.blueDark }, q.g);
  const wv = waves(k, pal.mintDark);
  // 音量メーター
  const M = g({}); tf(M, 200, 70);
  el('rect', { x: -34, y: -22, width: 68, height: 44, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, M);
  const bars = [0, 1, 2, 3, 4].map((i) => el('rect', { x: -26 + i * 11, y: 0, width: 8, height: 0, rx: 2, fill: i > 3 ? pal.red : pal.green }, M));
  return {
    update(t) {
      const loud = easeOut(seg(t, 2.2, 2.6)), talk1 = t > 0.2 && t < 1.2, talk2 = t > 2.3;
      const breath = hump(seg(t, 1.7, 2.2));
      b.pose({ armR: 8 + 60 * loud + 10 * Math.max(0, Math.sin(t * 6)) * talk2, armL: 8 + 50 * loud, lean: -6 * breath + 6 * loud, squash: 1 + 0.06 * breath - 0.03 * loud, mood: (talk1 || talk2) && Math.sin(t * 14) > 0 ? (talk2 ? 'grin' : 'open') : 'smile', look: 0.6 });
      faceAt(b, 4, 0);
      wv(talk1 ? 0.6 : talk2 ? 1 : 0, (t * 1.3) % 1, 160, 186, 1, talk2 ? 1.8 : 0.6);
      const lvl = talk1 ? 1.5 + Math.sin(t * 11) * 0.5 : talk2 ? 3.6 + Math.sin(t * 9) * 0.6 : 0;
      bars.forEach((r, i) => { const h = lvl > i ? 8 + i * 3 : 2; k.set(r, { y: 12 - h, height: h, opacity: lvl > i ? 1 : 0.25 }); });
      const cup = easeOut(seg(t, 1.1, 1.4)) * (1 - easeInOut(seg(t, 2.8, 3.2)));
      const nod = t > 3.0 ? Math.max(0, Math.sin((t - 3.0) * 5)) : 0;
      o.pose({ armR: 8 + 145 * cup, lean: 10 * cup + 4 * nod, mood: t > 3.0 ? 'grin' : cup > 0.5 ? 'flat' : 'smile', look: 0.6 });
      faceAt(o, 4, 3 * nod);
      q.show(seg(t, 1.2, 1.4) * (1 - seg(t, 2.1, 2.3)), 264, 138);
    }
  };
}
