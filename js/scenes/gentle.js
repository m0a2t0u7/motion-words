// gentle：泣いている子のそばで、看護師のまめがしゃがみ、そっと頭をなでながら小さな声で話す。子は泣きやむ（例文 The nurse spoke in a gentle voice.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, aim, person, wear, cue, heart, drop } from './confused.js';

export const meta = { duration: 4.4, beats: [[0.0, '泣いている子'], [1.34, 'やさしく話す'], [3.25, 'ほっと安心']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1, KS = 0.6;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#EEF6F7' });
  el('rect', { x: 0, y: FY - 70, width: 400, height: 70, fill: '#DDEFEF' });
  el('rect', { x: 40, y: 40, width: 80, height: 60, rx: 5, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // 診察室のベッド
  k.shadow(250, FY + 1, 80, 5);
  el('rect', { x: 180, y: FY - 42, width: 150, height: 14, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 180, y: FY - 28, width: 150, height: 6, fill: '#9FB4CC' });
  [186, 318].forEach((x) => el('rect', { x, y: FY - 22, width: 6, height: 22, fill: '#9FB4CC' }));
  const kid = person(k, 'coral', { x: 260, y: FY - 32, scale: KS, facing: -1 });
  const tears = [0, 1].map(() => drop(k));
  const b = k.buddy({ x: 120, y: FY, scale: S, facing: 1, color: pal.mint });
  // ナースキャップ（ハートの印）
  const cap = wear(k, b);
  el('path', { d: 'M -20 -78 L -16 -96 L 16 -96 L 20 -78 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, cap);
  el('path', { d: 'M 0 -82 C -6 -86 -5 -92 0 -89 C 5 -92 6 -86 0 -82 Z', fill: '#FF8FB1' }, cap);
  const talkB = cue(k, '', 70, 34, -1);
  const note = el('path', { d: 'M -12 4 q 6 -10 12 0 t 12 0', stroke: '#B9A6F5', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, talkB.g);
  const hn = heart(k, talkB.g, '#FF8FB1'); tf(hn, 22, 0, 0, 0.7);
  const hs = [0, 1].map(() => heart(k, undefined, '#FF8FB1'));
  return {
    update(t) {
      t *= 4.6 / 4.4; // 4.4 秒に収める
      const come = easeInOut(seg(t, 0.2, 1.0)), kneel = easeInOut(seg(t, 0.9, 1.3));
      const pat = seg(t, 1.6, 3.6), calm = seg(t, 2.6, 3.2);
      P(b, { x: lerp(120, 196, come), walk: come * 9, facing: 1, squash: 1 - 0.1 * kneel, lean: 10 * kneel, armL: 14, armR: 20, mood: 'smile', look: 0.7, blink: t > 1.6 && t < 3.6 ? 0.45 : blinkAt(t) });
      if (pat > 0) aim(b, S, 'R', 254 + 5 * Math.sin(pat * Math.PI * 4), FY - 32 - 92 * KS + 4);
      P(kid, { x: 260, y: FY - 32, facing: -1, armL: lerp(130, 10, calm), armR: lerp(130, 10, calm), mood: calm > 0.5 ? 'smile' : 'sad', blink: calm > 0.5 ? blinkAt(t, 1) : 0.8, look: 0.5, squash: 1 - 0.04 * Math.abs(Math.sin(t * 10)) * (1 - calm) });
      tears.forEach((d, i) => { const q = ((t * 1.4) + i * 0.5) % 1; tf(d, 260 + (i ? 12 : -12) * KS - 3, FY - 32 - 50 * KS + 22 * q, 0, (1 - calm) * (1 - q) + 0.001); });
      talkB.show(seg(t, 1.5, 1.9) * (1 - seg(t, 3.6, 3.9)), 180, FY - 126, 0.9);
      note.setAttribute('transform', `translate(-6 ${(2 * Math.sin(t * 3)).toFixed(2)})`);
      hs.forEach((n, i) => { const q = seg(t, 3.4 + i * 0.3, 4.6); tf(n, 230 + i * 40, FY - 110 - 20 * q, 0, q > 0 ? 1.2 * hump(q * 0.7 + 0.3) : 0.001); });
    }
  };
}
