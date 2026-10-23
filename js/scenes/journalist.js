// journalist：記者のまめが市長にマイクを向けてインタビューし、話を聞きながらメモを取る（例文 The journalist interviewed the mayor.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, hp, held, P, blinkAt, walkTo, path, wear } from './member.js';
import { talk } from './in-common.js';
import { cue } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '市長のもとへ'], [1.2, 'マイクを向ける'], [2.4, '話を聞く']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1, FY = 236;
  k.backdrop({ floorY: FY });
  // 市役所
  el('rect', { x: 200, y: 50, width: 200, height: FY - 50, fill: '#EDE6DA' });
  el('path', { d: 'M 190 54 L 300 18 L 410 54 Z', fill: '#C9BBA6' });
  [220, 260, 340, 380].forEach((x) => el('rect', { x: x - 7, y: 70, width: 14, height: FY - 70, fill: '#fff' }));
  el('rect', { x: 255, y: 60, width: 90, height: 18, rx: 3, fill: pal.blueDark }); k.text(300, 69, 'CITY HALL', { 'font-size': 10, fill: '#fff' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#E7E2DA' });
  const mayor = k.buddy({ x: 300, y: FY, scale: 1.05, facing: -1, ...CO(k) }); wear(k, mayor, 'tie', pal.blueDark);
  // 市長のたすき
  mayor.body.insertBefore(el('path', { d: 'M -29 -26 L 12 0 L 24 0 L -28 -35 Z', fill: pal.yellow }, null), mayor.armR.a.parentNode);
  const b = k.buddy({ x: 20, y: FY, scale: S, facing: 1 }); wear(k, b, 'badge', '#DCEBFF');
  const mic = g({}); el('rect', { x: -2.5, y: -4, width: 5, height: 20, rx: 2, fill: pal.ink }, mic); el('circle', { cx: 0, cy: 20, r: 6, fill: '#6D7889' }, mic);
  const pad = g({}); el('rect', { x: -9, y: -12, width: 18, height: 24, rx: 2, fill: '#FFF6B8', stroke: pal.yellowDark }, pad);
  const pl = [0, 1, 2].map((i) => el('line', { x1: -6, x2: -6, y1: -6 + i * 6, y2: -6 + i * 6, stroke: pal.blueDark, 'stroke-width': 1.5 }, pad));
  const bub = cue(k, '', 60, 30, 1);
  const wv = [0, 1, 2].map((i) => el('rect', { x: -2, width: 4, rx: 2, fill: pal.coral }, bub.g));
  const bx = path([[0.2, 20], [1.2, 200]]);
  return {
    update(t) {
      const w = walkTo(bx, t, 20, 1), aim = easeInOut(seg(t, 1.1, 1.6));
      P(b, { x: w.x, walk: w.walk, armL: lerp(w.armL, 60, aim), armR: lerp(w.armR, 92, aim), lean: w.lean + 6 * aim, look: 0.7, blink: blinkAt(t), mood: talk(t, 1.2, 1.8) || 'smile' });
      held(k, b, S, mic, 'R', 0, 26);
      const hl = hp(b, S, 'L', 28); tf(pad, hl.x + 2, hl.y - 4, 0, aim < 0.05 ? 0.001 : S * 0.9);
      pl.forEach((l, i) => { const p = seg(t, 2.2 + i * 0.6, 2.7 + i * 0.6); k.set(l, { x2: -6 + 12 * p }); });
      P(mayor, { look: 0.6, blink: blinkAt(t, 1), mood: talk(t, 1.9, 3.8) || 'smile', armR: 8 + 40 * hump(seg(t, 2.0, 2.8)) + 30 * hump(seg(t, 3.0, 3.6)), armL: 10 });
      bub.show(seg(t, 1.9, 2.2) - seg(t, 3.9, 4.1), 252, 110);
      wv.forEach((r, i) => { const h = 6 + 10 * Math.abs(Math.sin(t * 9 + i * 1.3)); k.set(r, { x: -14 + i * 12, y: -h / 2, height: h }); });
    }
  };
}
