// organize：2人で机の上のばらばらの書類を、日付の順に並べ直す（例文 Let's organize these papers by date.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P } from './run-after.js';
import { reach } from './dig.js';
import { officeBg } from './get-on-with.js';

export const meta = { duration: 4.2, beats: [[0, 'ばらばら'], [1.0, '日付順に'], [3.0, '整った']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0, S2 = 0.96;
  const FY = officeBg(k, 240, 150);
  const me = k.buddy({ x: 120, y: FY, scale: S });
  const her = k.buddy({ x: 290, y: FY, scale: S2, facing: -1, color: pal.coral, dark: pal.coralDark });
  // 机（2人の腰から下を隠す）
  const TY = 192;
  el('rect', { x: 30, y: TY, width: 340, height: 20, fill: '#F2DDBB' });
  el('rect', { x: 26, y: TY + 20, width: 348, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 40, y: TY + 28, width: 8, height: FY - TY - 28, fill: pal.woodDark });
  el('rect', { x: 352, y: TY + 28, width: 8, height: FY - TY - 28, fill: pal.woodDark });
  k.shadow(200, FY + 1, 170, 4);
  // 書類（日付つき）
  const mk = (d) => {
    const n = g({});
    el('rect', { x: -15, y: -19, width: 30, height: 38, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, n);
    el('rect', { x: -15, y: -19, width: 30, height: 11, rx: 2, fill: '#E9F1FA' }, n);
    k.text(0, -13, d, { 'font-size': 9, fill: pal.blueDark }, n);
    [-1, 5, 11].forEach((y) => el('line', { x1: -9, x2: 9, y1: y, y2: y, stroke: pal.line, 'stroke-width': 2 }, n));
    return n;
  };
  const P0 = { '5/2': [96, 198, -16], '5/1': [136, 194, 12], '5/4': [268, 198, 14], '5/3': [308, 194, -10] };
  const slot = { '5/1': 140, '5/2': 176, '5/3': 224, '5/4': 260 };
  // だれが・いつ動かすか
  const plan = [['5/1', me, 0.4], ['5/3', her, 0.5], ['5/2', me, 1.5], ['5/4', her, 1.6]];
  const docs = {};
  ['5/3', '5/4', '5/1', '5/2'].forEach((d) => { docs[d] = mk(d); });
  // 並んだ順を示す矢印
  const arrow = el('path', { d: 'M 126 160 L 274 160 M 266 154 L 274 160 L 266 166', stroke: pal.green, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', opacity: 0 });
  return {
    update(t) {
      const arms = new Map();
      plan.forEach(([d, who, t0]) => {
        const [x0, y0, r0] = P0[d], x1 = slot[d], y1 = 190;
        const p = easeInOut(seg(t, t0 + 0.3, t0 + 1.1));
        const x = lerp(x0, x1, p), y = lerp(y0, y1, p) - 26 * hump(p), r = lerp(r0, 0, p);
        const land = wobble(seg(t, t0 + 1.1, t0 + 1.6), 2, 6);
        tf(docs[d], x, y + 2 * land, r);
        // 手は書類に向かう（取る前の伸ばしと、運ぶ間）
        const on = easeOut(seg(t, t0, t0 + 0.3)) * (1 - easeInOut(seg(t, t0 + 1.15, t0 + 1.45)));
        if (on > 0) arms.set(who, { tx: x, ty: y - 8, on });
      });
      [[me, 120, 1, S], [her, 290, -1, S2]].forEach(([b, x, f, s]) => {
        const a = arms.get(b);
        P(b, { x, facing: f, armL: 8, armR: 8, lean: a ? 10 * a.on : 0, look: 0.6 * f, mood: t > 3.0 ? 'grin' : 'smile' });
        if (a) b.pose({ armR: lerp(8, reach(b, s, 'R', a.tx, a.ty), a.on) });
      });
      arrow.setAttribute('opacity', seg(t, 3.0, 3.4));
    }
  };
}
