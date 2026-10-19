// gate：まめが門を開けて中に入り、ふり返って自分の後ろの門を閉める（例文 Please close the gate behind you.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { gait, reach } from './dig.js';
import { P, blinkAt, tree } from './run-after.js';
import { pickets } from './yard.js';

export const meta = { duration: 4.6, beats: [[0, '門を開ける'], [1.5, '中に入る'], [3.0, '後ろの門を閉める']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 200, mood: 'outdoor' });
  // 奥の家と庭
  el('path', { d: 'M 236 72 L 316 30 L 410 72 Z', fill: pal.coral });
  el('rect', { x: 246, y: 72, width: 160, height: 128, fill: '#F3E6DC' });
  el('rect', { x: 300, y: 130, width: 34, height: 70, rx: 3, fill: pal.woodDark });
  el('rect', { x: 260, y: 92, width: 30, height: 28, rx: 3, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 3 });
  tree(k, 50, 200, 0.75);
  el('rect', { x: 0, y: 200, width: 400, height: 100, fill: '#CFE7C6' });
  el('path', { d: 'M 178 214 L 300 200 L 336 200 L 240 214 Z', fill: '#E8E1D5' });
  el('rect', { x: 0, y: 252, width: 400, height: 48, fill: '#E3E8EE' }); // 歩道（外）
  const inside = g({});
  const BY = 248; // 柵の根元
  const fence = g({});
  pickets(k, 0, 172, BY, 40, 14, '#FFFFFF', fence);
  pickets(k, 246, 400, BY, 40, 14, '#FFFFFF', fence);
  // 門柱
  [168, 240].forEach((x) => { el('rect', { x, y: BY - 52, width: 10, height: 52, rx: 2, fill: pal.woodDark }, fence); el('rect', { x: x - 2, y: BY - 56, width: 14, height: 6, rx: 2, fill: pal.wood }, fence); });
  // 門扉（左の柱が蝶番）
  const gt = g({}, fence);
  const panel = g({}, gt);
  el('rect', { x: 0, y: -36, width: 62, height: 5, fill: pal.wood }, panel);
  el('rect', { x: 0, y: -14, width: 62, height: 5, fill: pal.wood }, panel);
  for (let x = 2; x < 60; x += 12) el('rect', { x, y: -40, width: 8, height: 40, rx: 2, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 1 }, panel);
  el('circle', { cx: 56, cy: -22, r: 3.5, fill: pal.ink }, panel);
  const outside = g({});
  const S = 0.85;
  const me = k.buddy({ x: -30, y: 282, scale: S, parent: outside });
  // 道すじ：歩道を右へ → 門の前 → 門を通って中へ
  const GX = 209;
  return {
    update(t) {
      const open = easeInOut(seg(t, 1.0, 1.4)) * (1 - easeInOut(seg(t, 3.3, 3.8)));
      const clink = wobble(seg(t, 3.8, 4.2), 3, 6);
      tf(gt, 178, BY - 2); tf(panel, 0, 0, 0, lerp(1, 0.12, open) + 0.02 * clink, 1);
      const xf = (u) => u < 1.4 ? lerp(-30, GX - 28, easeInOut(seg(u, 0, 1.0))) : lerp(GX - 28, GX + 6, easeInOut(seg(u, 1.5, 2.6)));
      const w = gait(xf, t, -30);
      const enter = easeInOut(seg(t, 1.5, 2.6));
      const y = lerp(282, 226, enter);
      const s = lerp(S, 0.72, enter);
      const inn = enter > 0.55;
      (inn ? inside : outside).appendChild(me.g);
      me.g.parentNode === inside || true;
      const turned = t > 2.7;
      P(me, { x: w.x, y, walk: w.walk + enter * 6, lean: w.lean, facing: turned ? -1 : 1, look: turned ? 0.5 : 0.3, mood: t > 3.9 ? 'grin' : 'smile', blink: blinkAt(t), armL: w.armL, armR: w.armR });
      me.g.setAttribute('transform', `translate(${me.state.x.toFixed(2)} ${y.toFixed(2)}) scale(${s.toFixed(3)})`);
      // 手で門を押し開ける / ふり返って引いて閉める
      const knob = { x: 178 + 56 * lerp(1, 0.12, open), y: BY - 24 };
      const push = hump(seg(t, 0.9, 1.6));
      if (push > 0) me.pose({ armR: lerp(8, 70, push) });
      const pull = easeOut(seg(t, 2.9, 3.3)) * (1 - easeInOut(seg(t, 4.0, 4.3)));
      if (pull > 0) {
        const sx = me.state.x, hx = sx - 22, hy = y - 34;
        me.pose({ armR: lerp(8, 90 + (knob.y - hy) * 0.5, pull) });
      }
    }
  };
}
