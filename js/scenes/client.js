// client：弁護士のまめ（天びんのバッジ）が、今日の約束どおり事務所で依頼人を迎えて握手し、書類の相談を始める（例文 The lawyer met her client today.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, bow, wear, keys, P, blinkAt, C } from './jam.js';
import { officeBg, desk } from './get-on-with.js';
import { calendar } from './so-far-so-good.js';
import { gait } from './weigh.js';

export const meta = { duration: 4.6, beats: [[0, '今日の予定'], [1.4, '依頼人が来る'], [2.6, '握手して相談']] };

export function create(k) {
  const { el, pal } = k, FY = 236;
  officeBg(k, FY);
  const cal = calendar(k, 360, 24, 40);
  const ring = el('circle', { cx: 360, cy: 50, r: 16, fill: 'none', stroke: pal.red, 'stroke-width': 3 });
  // 本棚
  el('rect', { x: 14, y: 70, width: 70, height: 166, fill: '#C9A577' });
  [92, 136, 180].forEach((y) => { el('rect', { x: 18, y, width: 62, height: 4, fill: '#A88454' }); [0, 1, 2, 3, 4].forEach((i) => el('rect', { x: 22 + i * 11, y: y - 30, width: 9, height: 30, fill: [pal.coral, pal.blue, pal.violet, pal.yellow, pal.mint][i] })); });
  const law = k.buddy({ x: 150, y: FY, scale: 1.15 });
  bow(k, law, '#4A6FD0');
  // 天びんのバッジ
  wear(k, law, (g) => { el('circle', { cx: 14, cy: -26, r: 7, fill: '#FFCF5C' }, g); el('path', { d: 'M 14 -31 V -21 M 9 -28 H 19 M 9 -28 l -2 4 h 4 Z M 19 -28 l -2 4 h 4 Z', stroke: '#9E7A1E', 'stroke-width': 1.2, fill: 'none' }, g); });
  const cl = k.buddy({ x: 460, y: FY, scale: 1.1, facing: -1, ...C(k, 'coral') });
  const docs = k.g({}); el('rect', { x: -12, y: -16, width: 24, height: 30, rx: 2, fill: '#fff', stroke: '#C9D2DD' }, docs); [-8, -2, 4].forEach((y) => el('line', { x1: -7, y1: y, x2: 7, y2: y, stroke: '#AEB8C6', 'stroke-width': 1.5 }, docs));
  const A = arms(k, law, 1.15), B = arms(k, cl, 1.1, { col: pal.coral, dark: pal.coralDark, back: ['L'] });
  const top = desk(k, 196, 110, FY);
  const xc = keys([[1.0, 460], [2.4, 262]]);
  return {
    update(t) {
      cal.set('15'); ring.setAttribute('opacity', (seg(t, 0.2, 0.5) * (0.6 + 0.4 * Math.sin(t * 6))).toFixed(2));
      const g = gait(xc, t, 460);
      const shake = easeInOut(seg(t, 2.4, 2.7)) * (1 - easeInOut(seg(t, 3.3, 3.6)));
      const sh = Math.sin(t * 18) * 4 * (t > 2.7 && t < 3.3);
      P(law, { look: t < 1 ? -0.2 : 0.7, blink: blinkAt(t), mood: t > 2.4 ? 'grin' : 'smile', lean: 6 * shake });
      P(cl, { x: g.x, walk: g.walk, lean: g.lean + 6 * shake, facing: -1, look: 0.6, blink: blinkAt(t, 1), mood: t > 2.4 ? 'grin' : 'smile' });
      const mid = { x: (150 + g.x) / 2 + 4, y: 150 + sh };
      A.to('R', lerp(184, mid.x, shake), lerp(196, mid.y, shake)); A.to('L', 120, 198);
      B.to('R', lerp(g.x - 34, mid.x, shake), lerp(200, mid.y, shake));
      // 依頼人は書類を持ってきて、机に置く
      const put = easeInOut(seg(t, 3.5, 4.0));
      const hl = B.to('L', lerp(g.x - 28, 236, put), lerp(190, top - 14, put));
      k.tf(docs, hl.x, hl.y + 4, put * 80);
    }
  };
}
