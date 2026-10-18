// cut in：2人が交互に話しているところへ、まめが割って入り、2人の間で話し出す（例文 He cut in while they were talking.）
import { seg, lerp, easeInOut, easeOut, backOut } from '../ease.js';
import { gait } from './dig.js';
import { bubble } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '2人が話す'], [1.8, '割り込む'], [3.4, '話をさえぎった']] };

export function create(k) {
  const { el, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 170, y: 40, width: 70, height: 50, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const S = 0.95;
  const P = k.buddy({ x: 110, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  const Q = k.buddy({ x: 300, y: FY, scale: S, color: pal.blue, dark: pal.blueDark, facing: -1 });
  const A = k.buddy({ x: -40, y: FY + 10, scale: S });
  const mk = (n) => { const b = bubble(k, 56, 30); for (let i = 0; i < n; i++) el('circle', { cx: -12 + i * 12, cy: 0, r: 3.5, fill: pal.sub }, b); return b; };
  const bP = mk(3), bQ = mk(3);
  const bA = bubble(k, 70, 36); for (let i = 0; i < 4; i++) el('circle', { cx: -18 + i * 12, cy: 0, r: 4, fill: pal.mintDark }, bA);
  const xf = (t) => lerp(-40, 205, easeInOut(seg(t, 1.3, 2.4)));
  return {
    update(t) {
      // 2人の会話：交互に吹き出し（割り込まれると止まる）
      const talk = t < 2.2;
      const ph = (t * 1.1) % 1, pTurn = ph < 0.5;
      const sP = talk && pTurn ? backOut(seg(ph, 0, 0.12)) : 0, sQ = talk && !pTurn ? backOut(seg(ph, 0.5, 0.62)) : 0;
      tf(bP, 130, 110, 0, Math.max(0.01, sP)); bP.setAttribute('opacity', sP > 0.01 ? 1 : 0);
      tf(bQ, 280, 110, 0, Math.max(0.01, sQ)); bQ.setAttribute('opacity', sQ > 0.01 ? 1 : 0);
      const sur = easeOut(seg(t, 2.3, 2.6));
      P.pose({ armR: talk && pTurn ? 60 + 20 * Math.sin(t * 10) : 15, armL: 10, look: lerp(0.6, 0.9, sur), mood: sur > 0.5 ? 'open' : 'smile', lean: -5 * sur });
      Q.pose({ armR: talk && !pTurn ? 60 + 20 * Math.sin(t * 10) : 15, armL: 10, look: lerp(0.6, 0.9, sur), mood: sur > 0.5 ? 'open' : 'smile', lean: -5 * sur });
      const p = gait(xf, t, -40);
      const speak = t > 2.5;
      A.pose({ x: p.x, walk: p.walk, armL: speak ? 120 + 30 * Math.sin(t * 9) : p.armL, armR: speak ? 120 - 30 * Math.sin(t * 9) : p.armR, lean: p.lean, look: 0.3, mood: speak ? 'grin' : 'smile' });
      const sa = backOut(seg(t, 2.5, 2.75));
      tf(bA, 205, 104, 0, Math.max(0.01, sa)); bA.setAttribute('opacity', sa > 0.01 ? 1 : 0);
    }
  };
}
