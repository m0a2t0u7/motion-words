// screen：スマホを目の前に持ち上げて、画面のひび割れに気づく（例文 My phone screen is cracked.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, desk, say, cloud } from './look-over.js';
import { hp, held, reach } from './dig.js';
function pz(b, S, o, R, L) { P(b, o); const a = {}; if (R) a.armR = reach(b, S, 'R', R[0], R[1]); if (L) a.armL = reach(b, S, 'L', L[0], L[1]); P(b, { ...o, ...a }); }

export const meta = { duration: 3.8, beats: [[0, '画面を見る'], [1.4, 'ひびに気づく'], [2.8, '割れていた']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = roomBg(k, 'home');
  const S = 1.15;
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const ph = g({});
  el('rect', { x: -30, y: -108, width: 60, height: 112, rx: 10, fill: pal.ink }, ph);
  el('rect', { x: -26, y: -102, width: 52, height: 100, rx: 6, fill: '#BFE3F5' }, ph);
  [0, 1, 2].forEach((i) => el('rect', { x: -19 + i * 14, y: -92, width: 11, height: 11, rx: 3, fill: [pal.coral, pal.yellow, pal.mint][i] }, ph));
  const crack = el('path', { d: 'M 14 -102 L 6 -80 L 14 -66 L 0 -48 L 8 -30 M 6 -80 L -12 -74 M 0 -48 L -16 -44 M 14 -66 L 26 -62', stroke: '#fff', 'stroke-width': 2.2, fill: 'none', 'stroke-linejoin': 'round', 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1 }, ph);
  const shade = el('path', { d: 'M 14 -102 L 6 -80 L 14 -66 L 0 -48 L 8 -30', stroke: pal.ink, 'stroke-width': 0.8, fill: 'none', opacity: 0.5, pathLength: 1, 'stroke-dasharray': 1 }, ph);
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.2, 1.2)), cr = easeOut(seg(t, 1.4, 1.9));
      const sad = t > 2.5;
      const tx = lerp(185, 210, up), ty = lerp(190, 160, up);
      pz(b, S, { x: 150, facing: 1, lean: lerp(0, 6, up), look: 1, blink: blinkAt(t), mood: sad ? 'sad' : t > 1.3 ? 'open' : 'smile' }, [tx, ty], null);
      const h = hp(b, S, 'R', 20);
      k.tf(ph, h.x + 8, h.y + 18, -6, lerp(0.5, 0.95, up), lerp(0.5, 0.95, up));
      crack.setAttribute('stroke-dashoffset', 1 - cr); shade.setAttribute('stroke-dashoffset', 1 - cr);
    }
  };
}
