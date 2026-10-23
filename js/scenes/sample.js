// sample：店員がチーズの無料サンプルを配り、お客さんが1つ取って食べる（例文 The store gave out free samples of cheese.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, desk, say, cloud } from './look-over.js';
import { hp, held, reach } from './dig.js';
function pz(b, S, o, R, L) { P(b, o); const a = {}; if (R) a.armR = reach(b, S, 'R', R[0], R[1]); if (L) a.armL = reach(b, S, 'L', L[0], L[1]); P(b, { ...o, ...a }); }

export const meta = { duration: 4.4, beats: [[0, '店員が差し出す'], [1.6, '1つ取る'], [3.2, '食べて笑顔']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = roomBg(k, 'home');
  const S = 1.1;
  const staff = k.buddy({ x: 320, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const cus = k.buddy({ x: 60, y: FY, scale: S });
  // FREE看板
  el('rect', { x: 340, y: 56, width: 44, height: 22, rx: 5, fill: pal.yellow });
  k.text(362, 72, 'FREE', { 'font-size': 12, fill: pal.ink });
  const tray = g({});
  el('rect', { x: -26, y: -3, width: 52, height: 6, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, tray);
  const cubes = [-14, 0, 14].map((x) => {
    const c = g({}, tray); k.tf(c, x, -9);
    el('rect', { x: -6, y: -6, width: 12, height: 12, rx: 2, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, c);
    el('circle', { cx: -2, cy: 0, r: 1.6, fill: pal.yellowDark }, c);
    el('line', { x1: 0, y1: -6, x2: 0, y2: -16, stroke: pal.woodDark, 'stroke-width': 1.6 }, c);
    return c;
  });
  const bite = g({});
  el('rect', { x: -6, y: -6, width: 12, height: 12, rx: 2, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, bite);
  el('line', { x1: 0, y1: -6, x2: 0, y2: -16, stroke: pal.woodDark, 'stroke-width': 1.6 }, bite);
  const xf = (t) => lerp(60, 205, easeInOut(seg(t, 0.2, 1.8)));
  return {
    update(t) {
      const w = walkTo(xf, t, 60);
      const take = easeInOut(seg(t, 1.9, 2.5)), eat = easeInOut(seg(t, 2.6, 3.2));
      pz(staff, S, { x: 320, facing: -1, lean: 2, look: -1, blink: blinkAt(t, 1), mood: 'smile' }, [lerp(285, 275, 0), 176], null);
      const hs = hp(staff, S, 'R', 22);
      k.tf(tray, hs.x - 8, hs.y + 2, 0, 1.1, 1.1);
      const taking = t >= 1.9 && t < 3.2;
      const cx = lerp(w.x + 40, w.x + 30, 0);
      const base = { x: w.x, facing: 1, walk: w.walk, lean: w.lean, look: 1, blink: blinkAt(t), mood: eat > 0.6 ? 'grin' : 'smile', armL: w.armL, armR: w.armR };
      if (t < 1.9) P(cus, base);
      else {
        const tx = lerp(hs.x - 8, w.x + 20 * S, eat), ty = lerp(hs.y - 10, FY - 72 * S, eat);
        pz(cus, S, base, [lerp(hs.x - 12, tx, take > 0 ? 1 : 0) * (eat > 0 ? 1 : 1), ty], null);
      }
      cubes[1].setAttribute('opacity', t > 1.9 ? 0 : 1);
      if (t > 1.9) { const hc = hp(cus, S, 'R', 22); k.tf(bite, hc.x, hc.y - 6, 0, 1.0, 1.0); bite.setAttribute('opacity', eat > 0.9 ? 0 : 1); } else bite.setAttribute('opacity', 0);
    }
  };
}
