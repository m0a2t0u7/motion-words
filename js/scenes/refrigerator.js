// refrigerator：牛乳パックを持って冷蔵庫の扉を開け、中の棚に入れる（例文 Put the milk in the refrigerator.）
// 共通ヘルパー：fridge（冷蔵庫。上が冷蔵室で扉は右が蝶番、下が引き出し式の冷凍室）、milkCarton
import { seg, lerp, easeInOut, easeOut, wobble } from '../ease.js';
import { reach, hp } from './dig.js';
import { gait } from './weigh.js';
import { P, blinkAt } from './run-after.js';
import { kitchenWall, cup } from './cabinet.js';

export function fridge(k, x0, x1, top, FY) {
  const { el, g, pal } = k, MID = FY - 58;
  k.shadow((x0 + x1) / 2, FY + 1, (x1 - x0) / 2 + 6, 5);
  el('rect', { x: x0 - 3, y: top - 3, width: x1 - x0 + 6, height: FY - top + 3, rx: 8, fill: '#D5DCE6' });
  // 冷蔵室の中
  el('rect', { x: x0 + 4, y: top + 4, width: x1 - x0 - 8, height: MID - top - 8, rx: 4, fill: '#F2F8FC' });
  el('rect', { x: x0 + 10, y: top + 6, width: x1 - x0 - 20, height: 6, rx: 3, fill: '#FFF7D6' });
  const shelves = [top + 52, top + 100];
  shelves.forEach((y) => el('rect', { x: x0 + 4, y, width: x1 - x0 - 8, height: 3, fill: '#C9DCEB' }));
  const inner = g({});
  // 冷凍室（引き出し）：中と前板
  const fzIn = el('path', { fill: '#DDEBF5' });
  const fzItems = g({});
  const fzFront = g({});
  el('rect', { x: x0, y: 0, width: x1 - x0, height: FY - MID - 6, rx: 6, fill: '#EEF2F6', stroke: '#C3CCD8', 'stroke-width': 2 }, fzFront);
  el('rect', { x: (x0 + x1) / 2 - 18, y: 8, width: 36, height: 5, rx: 2.5, fill: '#AEB7C4' }, fzFront);
  // 冷蔵室の扉（右に蝶番）
  const door = g({}), w = x1 - x0;
  const face = el('rect', { x: -w, y: top, width: w, height: MID - top - 2, rx: 6, fill: '#EEF2F6', stroke: '#C3CCD8', 'stroke-width': 2 }, door);
  const handle = el('rect', { x: -w + 8, y: top + 40, width: 5, height: 46, rx: 2.5, fill: '#AEB7C4' }, door);
  return {
    inner, fzItems, shelves, MID,
    setDoor(p) {
      const sx = lerp(1, -0.32, p);
      door.setAttribute('transform', `translate(${x1} 0) scale(${sx.toFixed(3)} 1)`);
      face.setAttribute('fill', sx < 0 ? '#E1E7EE' : '#EEF2F6');
      handle.setAttribute('opacity', sx < 0 ? 0 : 1);
    },
    handleX(p) { return x1 - lerp(1, -0.32, p) * (w - 10); },
    setFreezer(p) {
      const d = 28 * p;
      fzFront.setAttribute('transform', `translate(${(x0 + x1) / 2} ${MID + 2 + d * 0.8}) scale(${1 + 0.05 * p}) translate(${-(x0 + x1) / 2} 0)`);
      k.set(fzIn, { d: `M ${x0 + 4} ${MID + 2} L ${x1 - 4} ${MID + 2} L ${x1} ${MID + 2 + d * 0.8} L ${x0} ${MID + 2 + d * 0.8} Z`, opacity: p > 0.01 ? 1 : 0 });
      fzItems.setAttribute('transform', `translate(0 ${(d * 0.8).toFixed(2)})`);
      fzItems.setAttribute('opacity', p > 0.05 ? 1 : 0);
    }
  };
}
// 牛乳パック（原点＝底の中央）
export function milkCarton(k, parent) {
  const g = k.g({}, parent), { el, pal } = k;
  el('path', { d: 'M -9 0 V -26 L -5 -34 H 5 L 9 -26 V 0 Z', fill: '#fff', stroke: '#C9D2DE', 'stroke-width': 1.6 }, g);
  el('rect', { x: -9, y: -20, width: 18, height: 9, fill: pal.blue }, g);
  el('rect', { x: -4, y: -38, width: 8, height: 4, fill: '#fff', stroke: '#C9D2DE', 'stroke-width': 1.2 }, g);
  return g;
}

export const meta = { duration: 4.2, beats: [[0, '牛乳を持つ'], [1.2, '扉を開ける'], [2.4, '冷蔵庫に入れた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const kw = kitchenWall(k, { x0: 0, x1: 150 });
  kw.counter();
  const FY = kw.FY, X0 = 236, X1 = 330, TOP = 34;
  const fr = fridge(k, X0, X1, TOP, FY);
  [[252, pal.yellow], [272, pal.coral]].forEach(([x, c]) => { const n = cup(k, fr.inner, c); tf(n, x, fr.shelves[0]); });
  el('rect', { x: 290, y: fr.shelves[0] - 20, width: 26, height: 20, rx: 4, fill: '#9ED3B2' }, fr.inner);
  el('ellipse', { cx: 300, cy: fr.shelves[1] - 8, rx: 14, ry: 8, fill: pal.red }, fr.inner);
  fr.setFreezer(0);
  const b = k.buddy({ x: 60, y: FY, scale: S });
  const milk = milkCarton(k);
  const spot = { x: 262, y: fr.shelves[1] };
  const xf = (t) => lerp(60, 190, easeInOut(seg(t, 0.15, 1.0)));
  return {
    update(t) {
      const w = gait(xf, t, 60, 0, 0.12);
      const grab = easeInOut(seg(t, 1.05, 1.3)), open = easeOut(seg(t, 1.3, 1.85));
      const put = easeInOut(seg(t, 2.0, 2.6)), back = easeInOut(seg(t, 2.7, 3.1));
      fr.setDoor(open);
      const pose = { x: w.x, walk: w.walk, lean: w.lean + 8 * put * (1 - back), look: 0.6, blink: blinkAt(t), mood: t > 2.7 ? 'grin' : 'smile' };
      P(b, pose);
      const armL = lerp(8, 60, seg(t, 0, 0.2)) * (1 - grab) + 8 * grab;
      let armR = lerp(64, reach(b, S, 'R', fr.handleX(0), 120), grab);
      if (t > 1.3) armR = lerp(reach(b, S, 'R', fr.handleX(open), 120), 64, easeInOut(seg(t, 1.85, 2.0)));
      if (t > 2.0) armR = lerp(64, reach(b, S, 'R', spot.x - 4, spot.y - 22), put);
      armR = lerp(armR, 8, back);
      P(b, { ...pose, armR: t < 1.05 ? 64 : armR, armL });
      // 牛乳：最初は右手、扉を開ける間は左手、最後は棚へ
      const hR = hp(b, S, 'R', 30), hL = hp(b, S, 'L', 30);
      if (t < 1.1) tf(milk, hR.x + 4, hR.y + 18);
      else if (t < 1.95) tf(milk, hL.x, hL.y + 18);
      else if (t < 2.6) tf(milk, lerp(hL.x, spot.x, put), lerp(hL.y + 18, spot.y, put) - 10 * Math.sin(put * Math.PI));
      else tf(milk, spot.x, spot.y, 0, 1 + 0.03 * wobble(seg(t, 2.6, 3.0), 2, 6), 1 - 0.05 * wobble(seg(t, 2.6, 3.0), 2, 6));
    }
  };
}
