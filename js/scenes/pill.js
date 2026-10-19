// pill：朝の台所で、びんからビタミンの錠剤を1粒出して口に入れ、コップの水で飲む（例文 She takes a vitamin pill with a glass of water every morning.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { P, reach, hp, pill, glass, bottle } from './hospital.js';
import { table } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '朝・錠剤を出す'], [1.4, '口に入れる'], [2.4, '水で飲む']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const TY = table(k, 210);
  const FY = 236;
  // 朝の窓
  el('rect', { x: 36, y: 40, width: 96, height: 70, rx: 6, fill: '#FFF1D6' });
  el('circle', { cx: 70, cy: 96, r: 14, fill: pal.yellow });
  el('rect', { x: 36, y: 96, width: 96, height: 14, fill: '#BFE3B0' });
  el('rect', { x: 36, y: 40, width: 96, height: 70, rx: 6, fill: 'none', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 84, y1: 40, x2: 84, y2: 110, stroke: '#fff', 'stroke-width': 4 });
  const bt = bottle(k, null, pal.yellow); tf(bt, 330, TY);
  const cap = g({}); el('rect', { x: -11, y: -8, width: 22, height: 8, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, cap);
  tf(cap, 352, TY); cap.setAttribute('display', 'none');
  const gl = glass(k); tf(gl.g, 266, TY);
  const S = 1.0;
  const me = k.buddy({ x: 170, y: FY, scale: S });
  const pl = pill(k, null, pal.yellow, '#FFE9A8');
  return {
    update(t) {
      const toB = easeInOut(seg(t, 0.2, 0.7)), up = easeInOut(seg(t, 0.75, 1.4)), cup = easeInOut(seg(t, 1.7, 2.2)), drink = seg(t, 2.4, 3.3), down = easeInOut(seg(t, 3.4, 4.0));
      const mouth = { x: 170 + 20, y: FY - 54 };
      let tgt;
      if (t < 0.75) tgt = { x: lerp(200, 330, toB), y: lerp(TY - 30, TY - 40, toB) };
      else if (t < 1.6) tgt = { x: lerp(330, mouth.x + 2, up), y: lerp(TY - 40, mouth.y, up) };
      else if (t < 2.3) tgt = { x: lerp(mouth.x + 2, 266, cup), y: lerp(mouth.y, TY - 14, cup) };
      else if (t < 3.4) tgt = { x: mouth.x + 8, y: mouth.y + 2 };
      else tgt = { x: lerp(mouth.x + 8, 266, down), y: lerp(mouth.y + 2, TY - 14, down) };
      const lift = t > 2.2 && t < 3.4 ? easeInOut(seg(t, 2.2, 2.45)) : 0;
      if (t >= 2.2 && t < 3.4) tgt = { x: lerp(266, mouth.x + 8, lift), y: lerp(TY - 14, mouth.y + 2, lift) };
      P(me, { look: 0.6, lean: 3 - 6 * hump(drink), mood: t > 1.35 && t < 1.6 ? 'open' : t > 3.4 ? 'grin' : 'smile', blink: drink > 0 && drink < 1 ? 0.7 : 0 });
      P(me, { ...me.state, armR: lerp(8, reach(me, S, 'R', tgt.x, tgt.y), seg(t, 0, 0.3)) });
      const h = hp(me, S, 'R', 28);
      // 錠剤：びんから手→口
      tf(pl, h.x, h.y - 2, 30); pl.setAttribute('opacity', t > 0.7 && t < 1.5 ? 1 : 0);
      // コップ：手で持つ間は手先へ
      const holding = t > 2.2 && t < 3.95;
      const tilt = holding ? -60 * hump(clamp(drink)) : 0;
      tf(gl.g, holding ? h.x : 266, holding ? h.y + 12 : TY, tilt);
      gl.set(lerp(0.85, 0.2, drink));
      // 喉が動く（ごくん）
      const gulp = hump(seg(t, 2.7, 2.9)) + hump(seg(t, 3.0, 3.2));
      P(me, { ...me.state, squash: 1 - 0.02 * gulp });
    }
  };
}
