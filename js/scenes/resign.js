// resign：部長のまめが上司に辞表を渡し、私物の箱を持って席を去る（例文 The manager resigned from his position.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, walkTo } from './run-after.js';
import { hp } from './dig.js';
import { top } from './shirt.js';
import { officeBg, desk } from './get-on-with.js';
import { box } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '辞表を出す'], [1.7, '荷物を持つ'], [3.0, '役職を去る']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.82;
  const FY = officeBg(k, 236, 150);
  // 自分の席（名札 MANAGER と椅子）
  el('rect', { x: 66, y: FY - 70, width: 8, height: 70, rx: 3, fill: '#5B6478' });
  el('rect', { x: 58, y: FY - 40, width: 40, height: 8, rx: 3, fill: '#5B6478' });
  const tY = desk(k, 84, 110, FY);
  el('path', { d: `M 150 ${tY} L 156 ${tY - 14} L 192 ${tY - 14} L 186 ${tY} Z`, fill: '#46536E' });
  k.text(171, tY - 7, 'MANAGER', { 'font-size': 7.5, fill: '#fff' });
  const boss = k.buddy({ x: 346, y: FY, scale: S * 1.05, facing: -1, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: 220, y: FY, scale: S });
  top(k, me, 'suit', '#46536E', '#2F3A52');
  // 辞表
  const env = g({});
  el('rect', { x: -13, y: -9, width: 26, height: 18, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, env);
  k.text(0, 0.5, '辞表', { 'font-size': 9, fill: pal.ink }, env);
  // 私物の箱（植物とマグ）
  const bx = g({});
  el('ellipse', { cx: -8, cy: -40, rx: 5, ry: 10, fill: pal.green }, bx);
  el('ellipse', { cx: 2, cy: -44, rx: 5, ry: 11, fill: pal.green, transform: 'rotate(20 2 -44)' }, bx);
  el('rect', { x: 6, y: -42, width: 9, height: 10, rx: 2, fill: pal.blue }, bx);
  bx.appendChild(box(k, 42, 32));
  const bsh = k.shadow(0, 0, 22, 3);
  const mx = (t) => t < 1.7 ? lerp(220, 286, easeInOut(seg(t, 0.2, 0.9))) : lerp(286, 120, easeInOut(seg(t, 1.6, 2.4))) - (t > 2.9 ? 220 * easeInOut(seg(t, 2.85, 4.2)) : 0);
  return {
    update(t) {
      const w = walkTo(mx, t, 220, 1);
      const hand = easeInOut(seg(t, 0.9, 1.2)) * (1 - easeInOut(seg(t, 1.35, 1.6)));
      const carry = easeOut(seg(t, 2.4, 2.8));
      const dip = hump(seg(t, 2.4, 2.75));
      P(me, { x: w.x, walk: w.walk, facing: w.facing, armL: lerp(w.armL, 80, carry), armR: lerp(lerp(w.armR, 90, hand), 80, carry), lean: w.lean + 6 * hand + 12 * dip, squash: 1 - 0.06 * dip, look: 0.6, mood: t > 1.0 ? 'flat' : 'smile' });
      // 上司は受け取って、去る部下を見送る
      const recv = easeInOut(seg(t, 1.05, 1.3)) * (1 - easeInOut(seg(t, 1.6, 2.0)));
      const sad = t > 1.6;
      P(boss, { x: 346, facing: -1, armR: lerp(8, 88, recv) + (t > 1.3 ? 30 : 0) * (1 - recv), armL: 8, look: -0.6, mood: sad ? 'sad' : 'open', lean: 4 * recv });
      const mh = hp(me, S, 'R', 30), bh = hp(boss, S * 1.05, 'R', 30);
      const got = t > 1.3;
      tf(env, got ? bh.x - 4 : mh.x + 4, got ? bh.y - 4 : mh.y - 6, 0, t > 0.1 ? 1 : 0.001);
      // 箱：机の上 → 両手で持ち上げて運ぶ
      const onDesk = { x: 110, y: tY };
      const held = { x: w.x + 22 * S * w.facing, y: FY - 36 * S };
      const p = easeInOut(seg(t, 2.45, 2.8));
      const x = lerp(onDesk.x, held.x, p), y = lerp(onDesk.y, held.y, p) - 4 * hump(p);
      tf(bx, x, y, 0, 0.8);
      tf(bsh, onDesk.x, tY + 1, 0, p > 0 ? 0.001 : 1);
    }
  };
}
