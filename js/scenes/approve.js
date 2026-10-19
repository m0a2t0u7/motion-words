// approve：まめが企画書を出し、上司（コーラル）が読んで承認の判を押す（例文 The manager approved my plan.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp, wobble } from '../ease.js';
import { hp, held, reach } from './dig.js';
import { officeBg, desk } from './get-on-with.js';
import { P, blinkAt } from './run-after.js';
import { walk, path } from './queue-up.js';

// 企画書（左上原点 0,0、幅 54 高さ 66）
export function planDoc(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('rect', { x: 2, y: 2, width: 54, height: 66, rx: 3, fill: '#000', opacity: 0.08 }, g);
  k.el('rect', { x: 0, y: 0, width: 54, height: 66, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, g);
  k.text(27, 10, 'PLAN', { 'font-size': 9, fill: pal.blueDark }, g);
  [[8, 40, 8], [18, 32, 16], [28, 24, 24]].forEach(([x, y, h]) => k.el('rect', { x, y, width: 7, height: h, rx: 1, fill: pal.blue }, g));
  k.el('path', { d: 'M 8 30 L 22 22 L 38 16', stroke: pal.coral, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, g);
  [52, 58].forEach((y) => k.el('line', { x1: 8, x2: 46, y1: y, y2: y, stroke: pal.line, 'stroke-width': 2 }, g));
  return g;
}
// 判子（原点＝握り、+y が印面）
export function stamp(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('circle', { cx: 0, cy: -2, r: 5, fill: pal.woodDark }, g);
  k.el('rect', { x: -3, y: 0, width: 6, height: 10, fill: pal.wood }, g);
  k.el('rect', { x: -8, y: 9, width: 16, height: 6, rx: 2, fill: pal.woodDark }, g);
  k.el('rect', { x: -8, y: 14, width: 16, height: 3, fill: pal.red }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '企画書を出す'], [1.6, '上司が読む'], [3.0, '承認の判']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95, FY = 236;
  officeBg(k, FY, 40);
  const boss = k.buddy({ x: 318, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  // 上司の後ろの椅子の背
  desk(k, 190, 170, FY);
  el('rect', { x: 236, y: 186, width: 30, height: 6, rx: 2, fill: pal.sub }); // 書類立ての台
  const me = k.buddy({ x: 50, y: FY, scale: S });
  const doc = planDoc(k);
  const mark = g({});
  el('circle', { r: 13, fill: 'none', stroke: pal.red, 'stroke-width': 3 }, mark);
  el('path', { d: 'M -6 0 L -2 5 L 7 -5', stroke: pal.red, 'stroke-width': 3.4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, mark);
  const st = stamp(k);
  const xf = path([[0, 50], [1.2, 168]]);
  const DX = 224, DY = 122; // 書類立てに置いた位置
  return {
    update(t) {
      // まめ：歩いて行き、書類立てに企画書を置く
      const put = easeInOut(seg(t, 1.2, 1.7)), back = easeInOut(seg(t, 1.7, 2.1));
      walk(me, xf, t, { armR: 70, armL: 10, look: 0.8, blink: blinkAt(t) });
      const arm = lerp(70, 128, put) * (1 - back) + 20 * back;
      const happy = easeOut(seg(t, 3.5, 3.8));
      P(me, { x: xf(t), walk: me.state.walk, armR: t < 1.2 ? 70 : arm, armL: 10 + 150 * happy, lift: 10 * hump(seg(t, 3.5, 3.95)), look: 0.8, mood: t > 3.4 ? 'grin' : 'smile', blink: blinkAt(t) });
      const h = hp(me, S, 'R');
      const onStand = t >= 1.7;
      if (onStand) tf(doc, DX, DY); else tf(doc, lerp(h.x - 4, DX, put), lerp(h.y - 40, DY, put));
      // 上司：読む（目が上下）→判子を取って押す
      const read = seg(t, 1.8, 2.3), grab = easeInOut(seg(t, 2.6, 2.95));
      const press = hump(seg(t, 3.0, 3.4));
      const tgt = { x: DX + 36, y: DY + 46 - 18 * grab };
      P(boss, { facing: -1, look: 0.8, lean: 6 * grab + 6 * press, blink: blinkAt(t, 1), mood: t > 3.3 ? 'grin' : read > 0 ? 'flat' : 'smile', armL: 12, armR: 10 });
      boss.body.children[3].setAttribute('transform', `translate(5 ${(read > 0 && read < 1 ? 2 + 2 * Math.sin(read * 18) : 0).toFixed(2)})`);
      // 机の上の判子を取りに行き（2.3〜2.6）、書類へ持ち上げて押す
      const SP = { x: 284, y: 182 };
      const toS = easeInOut(seg(t, 2.3, 2.6));
      if (t > 2.3) {
        const a1 = reach(boss, S, 'R', SP.x, SP.y), a2 = reach(boss, S, 'R', tgt.x + 18 * (1 - press), tgt.y);
        boss.pose({ armR: t < 2.6 ? lerp(10, a1, toS) : lerp(a1, a2, grab) });
      }
      if (t < 2.6) tf(st, SP.x, SP.y - 10); else held(k, boss, S, st, 'R', 0);
      // 判を押した跡（押した瞬間から残る）
      const sp = seg(t, 3.2, 3.35);
      tf(mark, DX + 36, DY + 44, -12, t > 3.2 ? 1 + 0.15 * wobble(seg(t, 3.2, 3.8), 2, 5) : 0.001);
      mark.setAttribute('opacity', sp > 0 ? 1 : 0);
    }
  };
}
