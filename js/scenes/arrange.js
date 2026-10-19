// arrange：まめが電話で相手と月曜に会う段取りをつけ、週のボードの「月」に会議カードを貼る（例文 I arranged a meeting for Monday.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, walkTo } from './run-after.js';
import { hp, reach } from './dig.js';
import { phone, inset } from './look-over.js';
import { talk } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '電話で相談'], [1.5, '月曜でOK'], [2.8, '会議を手配']] };

// 会議カード（2人のマーク）
function mtg(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('rect', { x: -17, y: -13, width: 34, height: 26, rx: 3, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, g);
  [[-7, pal.mint], [7, pal.coral]].forEach(([x, c]) => { k.el('circle', { cx: x, cy: -3, r: 4, fill: c }, g); k.el('path', { d: `M ${x - 6} 9 Q ${x - 6} 2 ${x} 2 Q ${x + 6} 2 ${x + 6} 9 Z`, fill: c }, g); });
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.85;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 週のボード（月・火・水）
  const BX = 150, BY = 112, CW = 46;
  el('rect', { x: BX - 4, y: BY - 4, width: CW * 3 + 8, height: 96, rx: 5, fill: '#fff', stroke: pal.sub, 'stroke-width': 3 });
  ['MON', 'TUE', 'WED'].forEach((d, i) => {
    el('rect', { x: BX + i * CW, y: BY, width: CW, height: 18, fill: i ? '#E9F1FA' : '#FFE1D8' });
    k.text(BX + i * CW + CW / 2, BY + 9.5, d, { 'font-size': 11, fill: i ? pal.blueDark : pal.coralDark });
    if (i) el('line', { x1: BX + i * CW, y1: BY, x2: BX + i * CW, y2: BY + 88, stroke: pal.line, 'stroke-width': 1.5 });
  });
  [BX + 30, BX + CW * 3 - 30].forEach((x) => el('rect', { x: x - 3, y: BY + 92, width: 6, height: FY - BY - 92, fill: pal.sub }));
  k.shadow(BX + 69, FY + 1, 60, 3);
  // 電話の相手（小窓）
  const ins = inset(k, 290, 22, 100, 84);
  const you = k.buddy({ parent: ins.inner, x: 336, y: ins.floor + 2, scale: 0.55, facing: -1, color: pal.coral, dark: pal.coralDark });
  const yph = phone(k, ins.inner);
  const me = k.buddy({ x: 80, y: FY, scale: S });
  const ph = phone(k);
  const card = mtg(k);
  const q = talk(k, 'Monday?', 74, 30, -1, 12), a = talk(k, 'OK!', 50, 30, 1, 13);
  const mx = (t) => lerp(80, 128, easeInOut(seg(t, 2.3, 2.9)));
  const tgt = { x: BX + CW / 2, y: BY + 44 };
  return {
    update(t) {
      const call = t < 2.2;
      const w = walkTo(mx, t, 80, 1);
      const stick = easeInOut(seg(t, 2.9, 3.3)) * (1 - easeInOut(seg(t, 3.6, 4.0)));
      P(me, { x: w.x, walk: w.walk, armL: 8, armR: call ? 150 : lerp(lerp(w.armR, 40, seg(t, 2.2, 2.4)), 0, 0), lean: w.lean, look: call ? 0.3 : 0.8,
        mood: call && t > 0.4 && t < 1.2 && Math.sin(t * 22) > 0 ? 'open' : t > 1.6 ? 'grin' : 'smile' });
      if (!call) me.pose({ armR: lerp(lerp(w.armR, 40, seg(t, 2.2, 2.4)), reach(me, S, 'R', tgt.x, tgt.y), stick) });
      const h = hp(me, S, 'R', 28);
      tf(ph.g, h.x - 2, h.y + 4, 10, call ? 1 : 0.001);
      ins.show(seg(t, 0.1, 0.4) * (1 - seg(t, 2.4, 2.7)));
      P(you, { x: 336, y: ins.floor + 2, facing: -1, armR: 150, armL: 8, look: -0.3, mood: t > 1.3 && t < 1.9 && Math.sin(t * 22) > 0 ? 'open' : 'grin',
        lift: 0, lean: 6 * hump(seg(t, 1.3, 1.7)) });
      const yh = hp(you, 0.55, 'R', 28); tf(yph.g, yh.x - 1, yh.y + 2, -10, 0.55);
      q.show(seg(t, 0.4, 0.7) * (1 - seg(t, 2.2, 2.4)), 112, 92);
      a.show(seg(t, 1.3, 1.6) * (1 - seg(t, 2.2, 2.4)), 286, 128);
      // カード：手に出てきて、月曜の欄に貼る
      const placed = t > 3.3;
      const ch = hp(me, S, 'R', 30);
      tf(card, placed ? tgt.x : ch.x + 4, placed ? tgt.y + 2 * wobble(seg(t, 3.3, 3.8), 2, 6) : ch.y - 6, placed ? 0 : -8, t > 2.35 ? 1 : 0.001);
    }
  };
}
