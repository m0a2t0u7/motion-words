// depend：小さな子が棚のりんごに手が届かず、親（コーラル）が取って渡す。子は親の手をにぎって寄りかかる（例文 Children depend on their parents.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { hp, reach } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { kitchenBg } from './weigh.js';
import { icon } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '届かない'], [1.5, '親が取ってくれる'], [3.0, '親に頼る']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236;
  kitchenBg(k, FY);
  // 高い棚とりんご
  el('rect', { x: 210, y: 112, width: 120, height: 7, rx: 2, fill: pal.woodDark });
  el('path', { d: 'M 214 119 L 222 132 L 226 119 Z M 318 119 L 312 132 L 324 119 Z', fill: pal.woodDark });
  const bowl = g({}); tf(bowl, 290, 112);
  el('path', { d: 'M -22 -12 Q -20 0 0 0 Q 20 0 22 -12 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, bowl);
  [[-10, -16], [8, -16]].forEach(([x, y]) => tf(icon(k, 'apple', bowl), x, y, 0, 0.8));
  const apple = icon(k, 'apple');
  const parent = k.buddy({ x: 110, y: FY, scale: 1.25, facing: 1, color: pal.coral, dark: pal.coralDark });
  const kid = k.buddy({ x: 250, y: FY, scale: 0.6, facing: 1 });
  return {
    update(t) {
      // 子：背伸びしても届かない（2回はねる）
      const hop = t < 1.4 ? Math.abs(Math.sin(t * 4.4)) * 8 : 0;
      const wantP = easeOut(seg(t, 0.1, 0.4)) * (1 - easeInOut(seg(t, 1.4, 1.7)));
      // 親：歩いてきて、棚から1つ取って子に渡す
      const px = lerp(110, 238, easeInOut(seg(t, 0.8, 1.8)));
      const walking = t > 0.8 && t < 1.8;
      const up = easeInOut(seg(t, 1.8, 2.1)) * (1 - easeInOut(seg(t, 2.2, 2.6)));
      const giveP = easeInOut(seg(t, 2.2, 2.6));
      P(parent, { x: px, walk: walking ? (px - 110) * 0.09 : Math.round((238 - 110) * 0.09 / Math.PI) * Math.PI * (t > 1.8 ? 1 : 0), look: t > 2.2 ? 0.6 : 0.4, blink: blinkAt(t, 1), mood: 'grin', armL: 10, armR: 10 });
      parent.pose({ armR: t < 1.8 ? 10 : t < 2.2 ? lerp(10, reach(parent, 1.25, 'R', 282, 92), up) : lerp(reach(parent, 1.25, 'R', 282, 92), 60, giveP) });
      // 子：最後は親の左手に寄りかかり、りんごを抱える
      const lean = easeInOut(seg(t, 2.9, 3.4));
      P(kid, { x: lerp(250, 262, lean), facing: t < 1.6 ? 1 : -1, look: t < 1.6 ? 0.4 : 0.6, blink: blinkAt(t), lift: hop, mood: t < 1.6 ? 'sad' : 'grin', armL: 10, armR: t < 1.6 ? 150 + 10 * Math.sin(t * 9) : lerp(80, 40, lean), lean: -12 * lean });
      kid.body.children[3].setAttribute('transform', `translate(${t < 1.6 ? 4 : 6} ${t < 1.6 ? -6 : -3})`);
      void wantP;
      // りんご：棚 → 親の手 → 子の手
      const ph = hp(parent, 1.25, 'R'), kh = hp(kid, 0.6, 'R');
      let ax = 282, ay = 96;
      if (t > 2.05 && t < 2.6) { ax = ph.x; ay = ph.y - 6; }
      else if (t >= 2.6) { ax = kh.x; ay = kh.y - 8; }
      tf(apple, ax, ay, 0, 0.8);
    }
  };
}
