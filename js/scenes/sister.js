// sister：小さな妹が音楽に合わせてくるくる踊るのが大好き。私（まめ）は手拍子で見守る（例文 My younger sister likes dancing.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, bow, noteP, heartP, pops, P, blinkAt, C } from './jam.js';
import { homeBg } from './furniture.js';

export const meta = { duration: 4.4, beats: [[0, '音楽が鳴る'], [0.8, '妹が踊る'], [3.0, '踊るのが大好き']] };

export function create(k) {
  const { el, pal } = k;
  const FY = homeBg(k, { winX: 160, winW: 80 });
  // スピーカー
  el('rect', { x: 330, y: FY - 70, width: 40, height: 70, rx: 6, fill: '#566070' });
  const cone = el('circle', { cx: 350, cy: FY - 44, r: 12, fill: '#2E3440' });
  el('circle', { cx: 350, cy: FY - 16, r: 7, fill: '#2E3440' });
  const notes = [0, 1, 2].map((i) => noteP(k, undefined, [pal.violet, pal.coral, pal.blue][i]));
  const me = k.buddy({ x: 90, y: FY, scale: 1.2 });
  const sis = k.buddy({ x: 220, y: FY, scale: 0.7, ...C(k, 'coral') });
  bow(k, sis);
  const A = arms(k, me, 1.2);
  const hs = heartP(k);
  return {
    update(t) {
      const beat = (t * 2.2) % 1;
      const d = t > 0.6;
      const spin = d ? Math.cos((t - 0.6) * Math.PI * 2 * 0.8) : 1;
      const hop = d ? Math.abs(Math.sin((t - 0.6) * Math.PI * 2.2)) * 10 : 0;
      P(sis, { lift: hop, facing: spin >= 0 ? 1 : -1, armL: d ? 140 + 30 * Math.sin(t * 7) : 10, armR: d ? 140 - 30 * Math.sin(t * 7) : 10, lean: d ? 8 * Math.sin(t * 4.4) : 0, blink: d ? 1 : blinkAt(t), mood: 'grin', look: spin * 0.3 });
      sis.g.setAttribute('transform', `translate(${220 + (d ? Math.sin((t - 0.6) * 2.2) * 24 : 0)} ${FY}) scale(${(0.7 * Math.max(0.25, Math.abs(spin))).toFixed(3)} 0.7)`);
      // 私：手拍子
      const clap = t > 1.0 ? hump(beat) : 0;
      P(me, { look: 0.7, blink: blinkAt(t), mood: t > 3 ? 'grin' : 'smile', squash: 1 - 0.02 * clap });
      A.to('R', 90 + 40 - 10 * clap, FY - 52 - 4 * clap); A.to('L', 90 + 16 + 10 * clap, FY - 50 - 4 * clap);
      k.tf(cone, 0, 0, 0, 1); cone.setAttribute('r', (12 + 2 * hump(beat)).toFixed(2));
      notes.forEach((n, i) => { const u = (t * 0.5 + i / 3) % 1; k.tf(n, 340 - u * 120, FY - 80 - u * 70 + Math.sin(u * 9) * 6); n.setAttribute('opacity', (hump(u) * seg(t, 0.2, 0.6)).toFixed(2)); });
      const q = seg(t, 3.0, 3.6); k.tf(hs, 230, 110 - 12 * q, 0, pops(q));
    }
  };
}
