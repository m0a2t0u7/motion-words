// on the go：職場でコピー機→机→電話→またコピー機と一日中走り回る。時計は朝9時から夕方5時へ（I'm on the go all day at work.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { officeBg, desk, monitor } from './get-on-with.js';
import { wallClock } from './figure-on.js';
import { run } from './run-after.js';
import { path } from './queue-up.js';
import { papers } from './hand-over.js';
import { hp } from './dig.js';
import { P, drop } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '朝から'], [1.6, 'あちこちへ'], [3.6, '夕方まで']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236, 150);
  const clk = wallClock(k, 200, 132 - 80, 20);
  // コピー機
  k.shadow(52, FY + 1, 34, 4);
  el('rect', { x: 20, y: FY - 70, width: 64, height: 70, rx: 5, fill: '#DCE2EA' });
  el('rect', { x: 16, y: FY - 78, width: 72, height: 10, rx: 3, fill: '#C4CCD8' });
  el('rect', { x: 26, y: FY - 48, width: 52, height: 6, fill: '#fff' });
  el('circle', { cx: 74, cy: FY - 60, r: 3, fill: pal.green });
  const top = desk(k, 160, 90, FY); monitor(k, 205, top);
  // 電話台
  k.shadow(340, FY + 1, 20, 3);
  el('rect', { x: 326, y: FY - 56, width: 28, height: 56, fill: pal.woodDark });
  el('rect', { x: 318, y: FY - 60, width: 44, height: 6, rx: 2, fill: pal.wood });
  el('rect', { x: 328, y: FY - 70, width: 24, height: 10, rx: 3, fill: pal.ink });
  const hs = el('rect', { x: -12, y: -4, width: 24, height: 8, rx: 4, fill: pal.ink });
  const G = k.buddy({ x: 120, y: FY, scale: 0.9 });
  const pp = papers(k, 3);
  const sw = drop(k);
  const xf = path([[0, 120], [0.55, 70], [0.8, 70], [1.4, 205], [1.65, 205], [2.25, 300], [2.75, 300], [3.35, 90], [3.6, 90], [4.2, 230]]);
  return {
    update(t) {
      clk.set(9 + 8 * seg(t, 0, 4.4), (8 * 60 * seg(t, 0, 4.4)) % 60);
      const r = run(xf, t, 120, -1);
      const atPhone = t > 2.25 && t < 2.75, phoneUp = hump(seg(t, 2.25, 2.75));
      const carry = (t > 0.7 && t < 1.55) || t > 3.5;
      P(G, { x: r.x, walk: r.walk, facing: atPhone ? 1 : r.facing, lean: r.lean, lift: r.lift,
        armR: atPhone ? lerp(8, 160, clamp(phoneUp * 2.5)) : carry ? 75 : r.armR, armL: r.armL,
        mood: t > 3.4 ? 'open' : 'smile', look: 0.5 });
      const h = hp(G, 0.9, 'R');
      tf(pp, h.x + 6 * G.state.facing, h.y - 6, 0, 0.8);
      pp.setAttribute('opacity', carry ? 1 : 0);
      if (atPhone && phoneUp > 0.3) tf(hs, h.x, h.y, 0); else tf(hs, 340, FY - 74);
      tf(sw, r.x - 24 * G.state.facing, FY - 86 + 10 * seg(t, 3.5, 4.4), 0, 0.9);
      sw.setAttribute('opacity', t > 3.4 ? 1 : 0);
    }
  };
}
