// on behalf of：チームの仲間に背中を押されて、まめが1歩前へ出て、チーム全員の分としてお客さんに花束を渡しお礼する（例文 On behalf of the team, thank you.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, reach, held, person, cue, walk, path, star } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, 'チームの前'], [1.4, '代表で前へ'], [3.0, 'みんなの分の礼']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // チームの旗（星マーク）
  el('rect', { x: 30, y: 40, width: 150, height: 54, rx: 6, fill: pal.blue });
  const s = star(k, k.root, 14, pal.yellow); k.tf(s, 60, 67);
  [0, 1, 2, 3].forEach((i) => el('circle', { cx: 92 + i * 22, cy: 67, r: 7, fill: '#fff', opacity: 0.85 }));
  // 後ろのチーム（小さめ）
  const team = [['blue', 50], ['yellow', 92], ['violet', 134]].map(([c, x]) => person(k, c, { x, y: FY - 10, scale: 0.72 }));
  const C = k.buddy({ x: 330, y: FY, scale: 0.88, facing: -1, color: pal.coral, dark: pal.coralDark });
  const A = k.buddy({ x: 112, y: FY + 2, scale: 0.88 });
  const bouquet = g({});
  [[-6, -16, pal.red], [5, -18, pal.yellow], [0, -24, pal.violet], [-9, -24, pal.coral], [8, -26, pal.red]].forEach(([x, y, c]) => el('circle', { cx: x, cy: y, r: 5.5, fill: c }, bouquet));
  el('path', { d: 'M -10 -14 L 10 -14 L 3 8 L -3 8 Z', fill: '#BFE3F5', stroke: pal.blueDark, 'stroke-width': 1.5 }, bouquet);
  const ty = cue(k, 'Thank you!', 96, 30, -1, 14);
  const xa = path([[1.0, 112], [2.0, 236]]);
  return {
    update(t) {
      // チームが「行ってこい」と手で示す→最後は一緒におじぎ
      const bow = hump(seg(t, 2.9, 4.0));
      team.forEach((b, i) => P(b, { look: 0.6, mood: 'smile', armR: lerp(8, 70, hump(seg(t, 0.5 + i * 0.1, 1.6 + i * 0.1))), lean: 14 * hump(seg(t, 3.0 + i * 0.05, 4.1)), y: FY - 10 }));
      // まめ：後ろを振り返る→前に出る→花束を渡しておじぎ
      walk(A, xa, t, { look: t < 0.9 ? -0.8 : 0.6, mood: t > 2.8 ? 'open' : 'smile' });
      A.pose({ y: FY + 2, facing: 1 });
      const give = easeInOut(seg(t, 2.0, 2.6));
      const tx = lerp(A.state.x + 30, 278, give), tyy = lerp(196, 176, give);
      A.pose({ armR: reach(A, 0.88, 'R', tx, tyy), armL: t > 2.6 ? lerp(8, 60, hump(seg(t, 2.6, 3.4))) : 8, lean: 22 * bow });
      if (t > 3.4) A.pose({ mood: 'grin' });
      const h = held(k, A, 0.88, bouquet, 'R', 0, 30);
      const passed = t > 2.75;
      // ピンク：受け取る
      const take = easeOut(seg(t, 2.4, 2.75));
      P(C, { look: 0.6, mood: t > 2.8 ? 'grin' : 'smile', armR: lerp(8, 80, take), lean: 4 * take });
      const hc = held(k, C, 0.88, k.g({}), 'R', 0, 30);
      tf(bouquet, passed ? hc.x : h.x, (passed ? hc.y : h.y) + 6, 0, 0.9);
      if (passed) C.pose({ armR: lerp(80, 50, seg(t, 2.8, 3.4)) });
      ty.show(seg(t, 2.85, 3.15) * (1 - seg(t, 4.1, 4.3)), 256, 98);
    }
  };
}
