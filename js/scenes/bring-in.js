// bring in：会社の入口から、まめが台車で新しいシステム（大きな機械）を運び込み、オフィスに設置。画面が点き、同僚が使い始める（例文 The company brought in a new system last year.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { gait } from './dig.js';
import { officeBg, star } from './get-on-with.js';

export const meta = { duration: 4.4, beats: [[0, '外から運ぶ'], [1.6, '中へ入れる'], [3.4, '新しい仕組み']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236, 40);
  // 右の入口（開いている）
  el('rect', { x: 330, y: 96, width: 70, height: 140, fill: '#CFE6D6' });
  el('rect', { x: 324, y: 90, width: 8, height: 146, fill: pal.woodDark });
  el('rect', { x: 330, y: 90, width: 70, height: 8, fill: pal.woodDark });
  // 同僚
  const c = k.buddy({ x: 80, y: FY, scale: 0.85, color: pal.coral, dark: pal.coralDark });
  // 新しい機械（台車の上）
  const m = g({}), sh = k.shadow(0, FY + 1, 40, 4);
  el('rect', { x: -36, y: -14, width: 72, height: 6, rx: 2, fill: pal.sub }, m);
  [-24, 24].forEach((x) => el('circle', { cx: x, cy: -4, r: 5, fill: pal.ink }, m));
  el('rect', { x: -30, y: -86, width: 60, height: 72, rx: 6, fill: '#E8ECF2', stroke: '#B8C2D0', 'stroke-width': 2 }, m);
  el('rect', { x: -24, y: -80, width: 48, height: 32, rx: 3, fill: pal.ink }, m);
  const scr = el('rect', { x: -21, y: -77, width: 42, height: 26, rx: 2, fill: '#3A4458' }, m);
  const ui = g({}, m);
  [-70, -63, -56].forEach((y, i) => el('rect', { x: -16, y, width: [28, 20, 24][i], height: 4, rx: 2, fill: '#fff' }, ui));
  [-36, -28].forEach((y) => el('rect', { x: -22, y, width: 44, height: 4, rx: 2, fill: '#C9D2DE' }, m));
  const sticker = g({}, m); star(k, sticker, 8, pal.yellow); tf(sticker, 20, -22);
  const b = k.buddy({ x: 460, y: FY, scale: 0.9, facing: -1 });
  const xf = (t) => lerp(400, 200, easeInOut(seg(t, 0.3, 2.2)));
  return {
    update(t) {
      const mx = xf(t);
      const moving = t > 0.3 && t < 2.2;
      tf(m, mx, FY - 4 + (moving ? Math.abs(Math.sin(t * 14)) * 1 : 0), wobble(seg(t, 2.2, 2.8), 2, 5) * 1.5);
      k.set(sh, { cx: mx });
      // まめ：台車の後ろから押して入る→手を離して少し下がる
      const back = easeInOut(seg(t, 2.4, 2.9));
      const bx = mx + 60 + back * 30;
      const p = gait((tt) => xf(tt) + 60 + easeInOut(seg(tt, 2.4, 2.9)) * 30, t, 460);
      b.pose({ x: bx, walk: p.walk, facing: -1, armR: lerp(84, 14, back), armL: lerp(70, 14, back), lean: 10 * (1 - back), look: 0.6, mood: back > 0.5 ? 'grin' : 'flat' });
      const on = seg(t, 2.8, 3.1);
      k.set(scr, { fill: on > 0.5 ? '#7CC4F2' : '#3A4458' });
      ui.setAttribute('opacity', on);
      // 同僚：近づいて画面を操作する
      const cg = (tt) => lerp(80, 136, easeInOut(seg(tt, 3.0, 3.6)));
      const pc = gait(cg, t, 80);
      c.pose({ x: pc.x, walk: pc.walk, armR: t > 3.6 ? 84 + Math.sin(t * 16) * 5 : pc.armR, armL: pc.armL, look: 0.6, mood: t > 2.9 ? 'grin' : 'smile', lean: pc.lean });
    }
  };
}
