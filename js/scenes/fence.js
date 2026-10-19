// fence：まめが最後の柵を運んで花壇のすき間にはめ、低い柵が花壇をぐるりと囲む（例文 A low fence surrounds the garden.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { gait, reach } from './dig.js';
import { P, blinkAt, tree } from './run-after.js';

// 斜めから見た柵の一区間（a→b の地面の点、h 高さ）
function run(k, ax, ay, bx, by, ha, hb, n, parent) {
  const { el } = k, g = k.g({}, parent);
  for (let i = 0; i <= n; i++) {
    const p = i / n, x = lerp(ax, bx, p), y = lerp(ay, by, p), h = lerp(ha, hb, p), w = h * 0.26;
    el('path', { d: `M ${x - w / 2} ${y} L ${x - w / 2} ${y - h + w / 2} L ${x} ${y - h} L ${x + w / 2} ${y - h + w / 2} L ${x + w / 2} ${y} Z`, fill: '#FFFFFF', stroke: '#C8D0DA', 'stroke-width': 1 }, g);
  }
  [0.35, 0.72].forEach((r) => el('line', { x1: ax, y1: ay - ha * r, x2: bx, y2: by - hb * r, stroke: '#D9DFE7', 'stroke-width': 3 }, g));
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '最後の柵'], [1.7, 'はめこむ'], [3.0, '花壇を囲む']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 130, mood: 'outdoor' });
  el('rect', { x: 0, y: 130, width: 400, height: 170, fill: '#CFE7C6' });
  tree(k, 40, 140, 0.7); tree(k, 370, 134, 0.6);
  // 花壇（斜め上から）
  const BL = [128, 160], BR = [312, 160], FL = [86, 246], FR = [354, 246];
  el('path', { d: `M ${BL} L ${BR} L ${FR} L ${FL} Z`, fill: '#A87754' });
  const fl = [[150, 180, pal.coral], [200, 176, pal.yellow], [250, 182, pal.violet], [290, 178, pal.red], [140, 214, pal.yellow], [190, 222, pal.red], [240, 212, pal.coral], [300, 220, pal.violet], [170, 198, pal.violet], [270, 200, pal.yellow]];
  fl.forEach(([x, y, c]) => {
    el('line', { x1: x, y1: y, x2: x, y2: y - 14, stroke: '#4E9A5E', 'stroke-width': 2.5 });
    el('ellipse', { cx: x - 5, cy: y - 6, rx: 4, ry: 2, fill: '#5DB56E' });
    [0, 72, 144, 216, 288].forEach((a) => el('circle', { cx: x + Math.cos(a * Math.PI / 180) * 4, cy: y - 17 + Math.sin(a * Math.PI / 180) * 4, r: 3.4, fill: c }));
    el('circle', { cx: x, cy: y - 17, r: 2.4, fill: pal.yellowDark });
  });
  // 柵：奥・左・右・手前（手前は真ん中にすき間）
  run(k, BL[0], BL[1], BR[0], BR[1], 16, 16, 12);
  run(k, BL[0], BL[1], FL[0], FL[1], 16, 24, 5);
  run(k, BR[0], BR[1], FR[0], FR[1], 16, 24, 5);
  const GAP = [180, 262];
  run(k, FL[0], FL[1], GAP[0], FL[1], 24, 24, 4);
  run(k, GAP[1], FR[1], FR[0], FR[1], 24, 24, 4);
  const S = 0.9;
  const me = k.buddy({ x: -40, y: 290, scale: S });
  // 運ぶ柵（原点＝区間の左下）
  const piece = g({}); run(k, 0, 0, GAP[1] - GAP[0] - 2, 0, 24, 24, 3, piece);
  const psh = el('ellipse', { cx: 0, cy: 0, rx: 40, ry: 4, fill: pal.shadow });
  const ring = el('path', { d: `M ${BL[0]} ${BL[1] - 10} L ${BR[0]} ${BR[1] - 10} L ${FR[0]} ${FR[1] - 14} L ${FL[0]} ${FL[1] - 14} Z`, fill: 'none', stroke: pal.yellow, 'stroke-width': 4, 'stroke-dasharray': '900', 'stroke-dashoffset': 900, 'stroke-linejoin': 'round', opacity: 0.9 });
  const xf = (t) => t < 2.4 ? lerp(-40, 220, easeInOut(seg(t, 0, 1.5))) : lerp(220, 60, easeInOut(seg(t, 2.6, 3.4)));
  return {
    update(t) {
      const w = gait(xf, t, -40);
      const down = easeInOut(seg(t, 1.6, 2.2));
      const yb = lerp(290, 290, 0);
      P(me, { x: w.x, y: yb, walk: w.walk, lean: w.lean + 14 * hump(seg(t, 1.6, 2.5)), facing: t > 2.5 && t < 3.4 ? -1 : 1, look: t > 3.4 ? 0.6 : 0.3,
        mood: t > 3.4 ? 'grin' : 'smile', blink: blinkAt(t), armL: t > 2.3 ? w.armL : 8, armR: t > 2.3 ? w.armR : 8 });
      // 両手で持つ → すき間に下ろす
      const carry = { x: w.x + 2 - 40, y: 290 - 44 }, slot = { x: GAP[0] + 1, y: FL[1] };
      const px = t < 1.6 ? carry.x : lerp(carry.x, slot.x, down), py = t < 1.6 ? carry.y : lerp(carry.y, slot.y, down);
      const set = t > 2.2;
      const sq = set ? wobble(seg(t, 2.2, 2.6), 2, 6) : 0;
      tf(piece, set ? slot.x : px, (set ? slot.y : py) + 2 * sq);
      if (!set) me.pose({ armR: reach(me, S, 'R', px + 70, py - 14), armL: reach(me, S, 'L', px + 10, py - 14) });
      tf(psh, (set ? slot.x : px) + 40, set ? slot.y + 1 : 290);
      psh.setAttribute('opacity', set ? 1 : 0.6);
      // 囲んでいる線が一周する
      const r = seg(t, 2.9, 4.0);
      ring.setAttribute('stroke-dashoffset', (900 * (1 - r)).toFixed(1));
      ring.setAttribute('opacity', r > 0 ? 0.9 * (1 - seg(t, 4.1, 4.4) * 0.4) : 0);
    }
  };
}
