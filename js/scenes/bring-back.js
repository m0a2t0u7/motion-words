// bring back：京都の店でみやげを受け取り、持って家へ戻り、迎えた家族に渡す（例文 She brought back a gift from Kyoto.）
import { seg, lerp, easeInOut, easeOut, wobble } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '京都でみやげ'], [1.8, '持って戻る'], [3.5, '家に届ける']] };
const F = (f) => (Math.abs(f) < 0.08 ? (f < 0 ? -0.08 : 0.08) : f);

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY, width: 400, height: 12, fill: '#E3E8EE' });
  // 京都の五重でない塔（遠景）
  const pg = g({});
  el('rect', { x: 14, y: 226, width: 54, height: 10, rx: 3, fill: pal.woodDark }, pg);
  [0, 1, 2].forEach((i) => {
    const w = 46 - i * 10, cy = 224 - i * 30;
    el('rect', { x: 41 - w / 2 + 4, y: cy - 18, width: w - 8, height: 20, fill: '#F7E6D8' }, pg);
    el('path', { d: `M ${41 - w / 2 - 9} ${cy - 16} Q 41 ${cy - 38} ${41 + w / 2 + 9} ${cy - 16} Z`, fill: pal.coralDark }, pg);
  });
  el('line', { x1: 41, y1: 122, x2: 41, y2: 108, stroke: pal.ink, 'stroke-width': 2 }, pg);
  // 屋台（みやげ売り場）
  const stall = g({});
  el('rect', { x: 78, y: 200, width: 56, height: 36, rx: 3, fill: pal.wood }, stall);
  el('rect', { x: 78, y: 200, width: 56, height: 6, fill: pal.woodDark }, stall);
  el('rect', { x: 80, y: 150, width: 4, height: 50, fill: pal.woodDark }, stall);
  el('rect', { x: 128, y: 150, width: 4, height: 50, fill: pal.woodDark }, stall);
  for (let i = 0; i < 4; i++) el('rect', { x: 74 + i * 15, y: 142, width: 15, height: 16, fill: i % 2 ? '#fff' : pal.red }, stall);
  // 家
  const house = g({});
  el('rect', { x: 250, y: 112, width: 150, height: 124, rx: 6, fill: '#FBE9DC' }, house);
  el('path', { d: 'M 240 120 L 325 58 L 410 120 Z', fill: pal.coral, stroke: pal.coral, 'stroke-width': 8, 'stroke-linejoin': 'round' }, house);
  el('rect', { x: 366, y: 140, width: 26, height: 28, rx: 4, fill: '#CFE9F7' }, house);
  el('rect', { x: 292, y: 134, width: 62, height: 102, rx: 4, fill: '#56607A' }, house);
  el('rect', { x: 286, y: 230, width: 74, height: 8, rx: 3, fill: pal.woodDark }, house);
  // 迎える家族（戸口の中）
  const fam = k.buddy({ x: 323, y: FY, scale: 0.8 });
  const door = g({});
  const panel = g({}, door);
  el('rect', { x: 0, y: 0, width: 62, height: 102, rx: 4, fill: pal.blue }, panel);
  el('rect', { x: 8, y: 10, width: 46, height: 36, rx: 4, fill: '#fff', opacity: 0.25 }, panel);
  el('circle', { cx: 52, cy: 56, r: 4, fill: pal.yellow }, panel);
  const heart = el('path', { d: 'M 0 8 C -14 -4 -8 -16 0 -8 C 8 -16 14 -4 0 8 Z', fill: pal.red }, g({}));
  // 本人
  const b = k.buddy({ x: 150, y: FY, scale: 0.85, facing: -1, color: pal.coral, dark: pal.coralDark });
  // 贈り物の箱
  const box = g({});
  el('rect', { x: -12, y: -10, width: 24, height: 20, rx: 3, fill: pal.violet }, box);
  el('rect', { x: -2.5, y: -10, width: 5, height: 20, fill: pal.yellow }, box);
  el('rect', { x: -12, y: -2.5, width: 24, height: 5, fill: pal.yellow }, box);
  el('path', { d: 'M 0 -10 Q -10 -22 -5 -10 M 0 -10 Q 10 -22 5 -10', stroke: pal.yellow, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, box);
  const spark = g({});
  [[-18, -16], [20, -20], [24, 4]].forEach(([x, y]) => el('path', { d: `M ${x} ${y - 6} L ${x + 2} ${y - 2} L ${x + 6} ${y} L ${x + 2} ${y + 2} L ${x} ${y + 6} L ${x - 2} ${y + 2} L ${x - 6} ${y} L ${x - 2} ${y - 2} Z`, fill: pal.yellow }, spark));

  return {
    update(t) {
      const turn = easeInOut(seg(t, 1.1, 1.6));
      const wp = seg(t, 1.6, 3.1);
      const x = t < 1.6 ? 150 : lerp(150, 232, easeInOut(wp));
      const walking = t > 1.6 && t < 3.1;
      const reach = easeOut(seg(t, 0.25, 0.7));
      const arrive = easeOut(seg(t, 3.15, 3.7));
      const wph = (t - 1.6) * 9;
      b.pose({
        x, facing: F(lerp(-1, 1, turn)),
        walk: walking ? wph : 0,
        armR: lerp(20, 72, reach) + arrive * 25,
        armL: walking ? Math.sin(wph) * 18 : 8,
        lean: lerp(0, 6, reach) * (1 - arrive) + (walking ? 3 : 0),
        mood: t > 3.1 ? 'grin' : 'smile', look: 0.3
      });
      const h = b.handPos('R');
      // 箱：屋台 → 手 → 手の中
      const pick = easeOut(seg(t, 0.6, 0.95));
      const sx = 106, sy = 188;
      tf(box, lerp(sx, h.x, pick), lerp(sy, h.y - 10, pick), 0, 1 + 0.08 * wobble(seg(t, 0.95, 1.4), 2, 5));
      // 戸が開き、家族が出迎える
      const op = easeInOut(seg(t, 3.0, 3.5));
      tf(door, 292, 134);
      tf(panel, 0, 0, 0, lerp(1, 0.16, op), 1);
      fam.g.setAttribute('opacity', seg(t, 3.2, 3.4));
      const j = Math.max(0, Math.sin((t - 3.5) * 8)) * (t > 3.5 ? 8 : 0);
      fam.pose({ lift: j, armL: 150 * seg(t, 3.4, 3.8), armR: 150 * seg(t, 3.4, 3.8), mood: 'grin' });
      const hp = easeOut(seg(t, 3.6, 4.0));
      tf(heart, 323, 118 - 14 * hp, 0, hp);
      heart.parentNode.setAttribute('opacity', hp);
      const sp = seg(t, 3.5, 4.1);
      tf(spark, h.x, h.y - 12, 0, 0.6 + 0.4 * Math.sin(sp * Math.PI * 2) * sp);
      spark.setAttribute('opacity', sp > 0 ? 1 : 0);
    }
  };
}
