// freezer：冷蔵庫の下の冷凍室を引き出すと、冷気の中にアイスクリームが入っている（例文 The ice cream is in the freezer.）
import { seg, lerp, easeInOut, easeOut } from '../ease.js';
import { reach } from './dig.js';
import { gait } from './weigh.js';
import { P, blinkAt } from './run-after.js';
import { kitchenWall } from './cabinet.js';
import { fridge } from './refrigerator.js';

export const meta = { duration: 4.0, beats: [[0, '冷凍室へ'], [1.1, '引き出す'], [2.3, 'アイスがある']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.88;
  const kw = kitchenWall(k, { x0: 0, x1: 150 });
  kw.counter();
  const FY = kw.FY, X0 = 222, X1 = 326;
  const fr = fridge(k, X0, X1, 34, FY);
  fr.setDoor(0);
  // 冷凍室の中：アイスクリームのカップと氷
  const ic = g({}, fr.fzItems); tf(ic, 262, fr.MID - 4);
  el('path', { d: 'M -18 -14 H 18 L 15 6 H -15 Z', fill: '#F7B6C8', stroke: '#E58AA6', 'stroke-width': 1.6 }, ic);
  el('ellipse', { cx: 0, cy: -14, rx: 18, ry: 4, fill: '#FDE3EA', stroke: '#E58AA6', 'stroke-width': 1.4 }, ic);
  el('circle', { cx: -4, cy: -4, r: 4, fill: '#fff' }, ic); el('path', { d: 'M -1 -1 L 3 8 L 7 -1', fill: '#E3B77E' }, ic);
  [[300, 4], [310, 0]].forEach(([x, dy]) => el('rect', { x, y: fr.MID - 7 + dy, width: 9, height: 9, rx: 2, fill: '#CFEAF8', stroke: '#9FD0F2' }, fr.fzItems));
  const mist = [0, 1, 2, 3].map(() => el('ellipse', { rx: 14, ry: 6, fill: '#fff', opacity: 0 }));
  const b = k.buddy({ x: 60, y: FY, scale: S });
  const mark = g({}); el('circle', { r: 10, fill: pal.yellow }, mark); k.text(0, 1, '!', { 'font-size': 15 }, mark);
  const xf = (t) => lerp(60, 182, easeInOut(seg(t, 0.15, 1.0)));
  return {
    update(t) {
      const w = gait(xf, t, 60, 0, 0.12);
      const grab = easeInOut(seg(t, 1.0, 1.3)), open = easeOut(seg(t, 1.3, 1.9));
      fr.setFreezer(open);
      const pose = { x: w.x, walk: w.walk, lean: w.lean + 14 * grab, squash: 1 - 0.06 * grab, look: 0.6, blink: blinkAt(t), mood: t > 2.3 ? 'grin' : 'smile' };
      P(b, pose);
      const hy = fr.MID + 2 + 28 * open * 0.8 + 10;
      let armR = lerp(8, reach(b, S, 'R', X0 + 40, hy), grab);
      armR = lerp(armR, 40, easeInOut(seg(t, 2.1, 2.5)));
      P(b, { ...pose, armR, lean: pose.lean - 8 * seg(t, 2.1, 2.5) });
      mist.forEach((m, i) => {
        const q = ((t - 1.6) * 0.6 + i * 0.25) % 1;
        k.set(m, { cx: 250 + i * 14 + 10 * q, cy: fr.MID + 4 - 30 * q, opacity: t > 1.6 ? 0.75 * Math.sin(q * Math.PI) : 0 });
      });
      const mm = seg(t, 2.3, 2.7);
      tf(mark, 262, fr.MID - 52 - 4 * mm, 0, mm > 0 ? 0.4 + 0.6 * easeOut(mm) : 0.001);
    }
  };
}
