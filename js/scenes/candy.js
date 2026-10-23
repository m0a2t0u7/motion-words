// candy：パーティーで、大人が器からあめを配り、まめと友だちの子どもたちがひとつずつもらって大喜び（例文 The kids got candy at the party.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { hp, reach } from './dig.js';
import { partyBg } from './shirt.js';
import { bowlG } from './flour.js';

// 包み紙のあめ（原点＝中心）
export function candyG(k, parent, col = '#F2685B') {
  const g = k.g({}, parent);
  k.el('path', { d: 'M -7 0 L -14 -6 L -13 6 Z M 7 0 L 14 -6 L 13 6 Z', fill: col, opacity: 0.8 }, g);
  k.el('circle', { r: 7, fill: col }, g);
  k.el('path', { d: 'M -4 -3 Q 0 -6 4 -3', stroke: '#fff', 'stroke-width': 1.6, fill: 'none', opacity: 0.8 }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, 'パーティー'], [1.0, 'あめを配る'], [3.0, 'もらった！']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = partyBg(k, 240);
  const ad = k.buddy({ x: 210, y: FY, scale: 1.0, color: pal.blue, dark: pal.blueDark });
  const me = k.buddy({ x: 120, y: FY, scale: 0.62 });
  const fr = k.buddy({ x: 300, y: FY, scale: 0.62, facing: -1, color: pal.coral, dark: pal.coralDark });
  const bw = bowlG(k, undefined, 44, '#FFE08A', '#E9B43A');
  const inBowl = [pal.red, pal.violet, pal.green, pal.blue].map((c, i) => { const n = candyG(k, bw.fill, c); tf(n, -12 + i * 8, -20 - (i % 2) * 4, 0, 0.7); return n; });
  const cA = candyG(k, undefined, pal.red), cB = candyG(k, undefined, pal.violet);
  return {
    update(t) {
      // 大人：左手に器、右手で配る（先に友だち、次にまめ）
      const gA = hump(seg(t, 0.9, 2.0)), gB = hump(seg(t, 1.9, 3.0));
      P(ad, { x: 210, armL: -60, armR: 8, look: t < 1.9 ? 0.6 : -0.6, mood: 'grin', blink: blinkAt(t, 1) });
      const hl = hp(ad, 1.0, 'L', 28); tf(bw.g, hl.x - 6, hl.y + 14);
      if (t < 1.95) { ad.pose({ facing: 1, armR: lerp(30, reach(ad, 1.0, 'R', 274, FY - 46), gA) }); }
      else { ad.pose({ facing: -1, armL: -60, armR: lerp(30, reach(ad, 1.0, 'R', 146, FY - 46), gB) }); }
      const hb = hp(ad, 1.0, 'L', 28); tf(bw.g, hb.x - 6 * ad.state.facing, hb.y + 14);
      const hr = hp(ad, 1.0, 'R', 28);
      // 友だちのあめ
      const gotA = t > 1.45, gotB = t > 2.45;
      const fh = hp(fr, 0.62, 'R', 28), mh = hp(me, 0.62, 'R', 28);
      if (t > 0.9 && !gotA) tf(cA, hr.x, hr.y, 0, 0.9); else if (gotA) tf(cA, fh.x, fh.y - 4, 0, 0.9);
      cA.setAttribute('opacity', t > 0.9 ? 1 : 0);
      if (t > 1.95 && !gotB) tf(cB, hr.x, hr.y, 0, 0.9); else if (gotB) tf(cB, mh.x, mh.y - 4, 0, 0.9);
      cB.setAttribute('opacity', t > 1.95 ? 1 : 0);
      inBowl[0].setAttribute('opacity', t > 0.9 ? 0 : 1); inBowl[1].setAttribute('opacity', t > 1.95 ? 0 : 1);
      const jA = gotA ? Math.abs(Math.sin((t - 1.45) * 7)) * 12 * (1 - seg(t, 3.6, 4.4) * 0.5) : 0;
      const jB = gotB ? Math.abs(Math.sin((t - 2.45) * 7)) * 12 : 0;
      P(fr, { x: 300, facing: -1, armR: gotA ? 150 : lerp(8, 70, easeOut(seg(t, 0.8, 1.2))), lift: jA, mood: gotA ? 'grin' : 'open', look: 0.7, blink: blinkAt(t, 2) });
      P(me, { x: 120, armR: gotB ? 150 : lerp(8, 70, easeOut(seg(t, 1.8, 2.2))), lift: jB, mood: gotB ? 'grin' : t > 1.0 ? 'open' : 'smile', look: 0.7, blink: blinkAt(t) });
    }
  };
}
