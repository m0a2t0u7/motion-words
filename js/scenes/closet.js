// closet：コートをハンガーごと持ってきて、クローゼットの棒に掛ける（例文 He hung his coat in the closet.）
import { seg, lerp, easeInOut, easeOut, wobble, clamp } from '../ease.js';
import { reach, hp } from './dig.js';
import { gait } from './weigh.js';
import { P, blinkAt } from './run-after.js';
import { hanger, teeProp } from './skirt.js';
import { homeBg } from './furniture.js';

export const meta = { duration: 4.2, beats: [[0, 'コートを持つ'], [1.3, '棒に掛ける'], [2.6, '掛かった']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.92;
  const FY = homeBg(k, { winX: 34, winW: 70 });
  const X0 = 200, X1 = 350, TOP = 40, ROD = 140;
  // 作りつけのクローゼット（扉は右に開いている）
  el('rect', { x: X0 - 8, y: TOP - 8, width: X1 - X0 + 16, height: FY - TOP + 8, fill: '#fff' });
  el('rect', { x: X0, y: TOP, width: X1 - X0, height: FY - TOP, fill: '#E3D6C4' });
  el('rect', { x: X0, y: TOP, width: X1 - X0, height: 30, fill: '#D9CAB4' });
  el('rect', { x: X0, y: 96, width: X1 - X0, height: 6, fill: pal.woodDark });
  [[214, pal.violet], [246, pal.yellow], [300, '#9ED3B2']].forEach(([x, c]) => el('rect', { x, y: 74, width: 26, height: 22, rx: 3, fill: c, opacity: 0.85 }));
  el('rect', { x: X0 + 4, y: ROD - 2, width: X1 - X0 - 8, height: 4, rx: 2, fill: '#AEB7C4' });
  // すでに掛かっている服
  [[302, '#9CC3F0', '#6E9FD8'], [326, pal.coral, pal.coralDark]].forEach(([x, c, d]) => {
    const h = hanger(k); tf(teeProp(k, h, c, d, { w: 0.6, h: 1.0 }), 0, 13); tf(h, x, ROD - 6);
  });
  el('path', { d: `M ${X1 + 8} ${TOP - 8} L ${X1 + 38} ${TOP + 6} L ${X1 + 38} ${FY + 6} L ${X1 + 8} ${FY}`, fill: '#F4EEE6', stroke: '#DCCFBD', 'stroke-width': 2 });
  el('circle', { cx: X1 + 32, cy: 150, r: 3, fill: pal.sub });
  const inside = g({});
  const b = k.buddy({ x: 60, y: FY, scale: S });
  const front = g({});
  // コート（ハンガーごと）。原点＝フック
  const coat = g({}, front), sw = g({}, coat);
  const hg = hanger(k, sw);
  tf(teeProp(k, hg, '#B9875A', '#8C6340', { long: true, collar: true, w: 0.75, h: 1.45 }), 0, 13);
  [0, 1, 2].forEach((i) => el('circle', { cx: 3, cy: 28 + i * 12, r: 2, fill: '#6B4A2E' }, hg));
  const xf = (t) => t < 2 ? lerp(60, 220, easeInOut(seg(t, 0.2, 1.2))) : lerp(220, 150, easeInOut(seg(t, 2.5, 3.3)));
  const hook = { x: 262, y: ROD - 2 };
  return {
    update(t) {
      const w = gait(xf, t, 60, 0, 0.12);
      const up = easeInOut(seg(t, 1.25, 1.85)), off = easeInOut(seg(t, 2.0, 2.4));
      const pose = { x: w.x, walk: w.walk, lean: t > 2.4 ? -w.lean : w.lean, lift: 6 * up * (1 - off), look: lerp(0.5, 0.8, up), blink: blinkAt(t), mood: t > 2.4 ? 'grin' : 'smile', armL: w.armL };
      P(b, pose);
      let armR = lerp(120, reach(b, S, 'R', hook.x, hook.y + 4), up);
      armR = lerp(armR, 10, off);
      P(b, { ...pose, armR });
      const h = hp(b, S, 'R', 26);
      const hung = t >= 1.85;
      (hung ? inside : front).appendChild(coat);
      if (!hung) {
        tf(coat, h.x - 3, h.y - 6);
        tf(sw, 0, 0, 4 * Math.sin(t * 9) * (1 - up));
      } else {
        tf(coat, hook.x, hook.y - 3 + 3 * (1 - easeOut(seg(t, 1.85, 2.0))));
        tf(sw, 0, 0, 9 * wobble(seg(t, 1.9, 3.4), 2.2, 4));
      }
    }
  };
}
