// sheet：ベッドの古いシーツをはがしてかごへ入れ、新しいシーツをばさっと広げて敷く。カレンダーは毎週1回の印（例文 I change the sheets every week.）
import { seg, lerp, easeInOut, easeOut, easeIn, wobble, hump, clamp } from '../ease.js';
import { reach, hp } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { bedroomBg, bedFrame } from './mattress.js';

export const meta = { duration: 4.6, beats: [[0, '古いシーツ'], [0.8, 'はがす'], [2.6, '新しいシーツ'], [3.9, '毎週の交換']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.86;
  const FY = bedroomBg(k, { winW: 0 });
  const X0 = 172, X1 = 380, MT = 188, TH = 26;
  // 週ごとの印がついたカレンダー
  const CX = 196, CY = 34;
  el('rect', { x: CX, y: CY, width: 112, height: 84, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: CX, y: CY, width: 112, height: 14, rx: 5, fill: pal.blue });
  for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) el('rect', { x: CX + 6 + c * 15, y: CY + 20 + r * 15, width: 11, height: 11, rx: 2, fill: c === 5 ? '#E4EEFB' : '#F2F4F8' });
  const chk = (r) => { const n = g({}); tf(n, CX + 11.5 + 5 * 15, CY + 25.5 + r * 15); el('path', { d: 'M -4 0 L -1 3.5 L 5 -4', stroke: pal.green, 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' }, n); return n; };
  [0, 1].forEach(chk);
  const newChk = chk(2);
  bedFrame(k, X0, X1, MT, FY, { TH });
  // 新しいシーツ（敷いた状態）
  const fresh = g({});
  el('rect', { x: X0 - 2, y: MT - 2, width: X1 - X0 + 4, height: TH + 4, rx: 10, fill: '#fff', stroke: '#BFD3EE', 'stroke-width': 2 }, fresh);
  for (let x = X0 + 14; x < X1; x += 22) el('rect', { x, y: MT - 1, width: 6, height: TH + 2, fill: '#CFE0F6' }, fresh);
  // 古いシーツ（しわ・くすんだ色）
  const old = el('path', { fill: '#DCD5C4', stroke: '#C5BBA5', 'stroke-width': 2, 'stroke-linejoin': 'round' });
  const wr = el('path', { fill: 'none', stroke: '#C5BBA5', 'stroke-width': 1.6 });
  // 飛んでいる新しいシーツ
  const fly = el('path', { fill: 'none', stroke: '#BFD3EE', 'stroke-width': 9, 'stroke-linecap': 'round' });
  const flyIn = el('path', { fill: 'none', stroke: '#fff', 'stroke-width': 5.5, 'stroke-linecap': 'round' });
  // ナイトテーブルとたたんだ新しいシーツ、洗濯かご
  el('rect', { x: 48, y: FY - 44, width: 46, height: 44, rx: 4, fill: pal.wood }); k.shadow(71, FY + 1, 26, 4);
  el('rect', { x: 66, y: FY - 30, width: 10, height: 3, rx: 1.5, fill: pal.woodDark });
  const folded = g({});
  el('rect', { x: -16, y: -12, width: 32, height: 12, rx: 3, fill: '#fff', stroke: '#BFD3EE', 'stroke-width': 2 }, folded);
  el('rect', { x: -6, y: -12, width: 5, height: 12, fill: '#CFE0F6' }, folded);
  const b = k.buddy({ x: 126, y: FY, scale: S });
  const bundle = g({});
  [[-6, 0, 11], [6, -2, 10], [0, -8, 9]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#DCD5C4', stroke: '#C5BBA5', 'stroke-width': 1.6 }, bundle));
  // かご（手前）
  const BK = 18;
  k.shadow(BK, FY + 1, 24, 4);
  el('path', { d: `M ${BK - 24} ${FY - 30} L ${BK + 24} ${FY - 30} L ${BK + 19} ${FY} L ${BK - 19} ${FY} Z`, fill: '#D8B98A', stroke: pal.woodDark, 'stroke-width': 2 });
  [FY - 20, FY - 10].forEach((y) => el('line', { x1: BK - 21, y1: y, x2: BK + 21, y2: y, stroke: pal.woodDark, 'stroke-width': 1.5 }));
  return {
    update(t) {
      const grab = easeInOut(seg(t, 0.35, 0.75)), pull = easeInOut(seg(t, 0.8, 1.5));
      const turn = t > 1.55 && t < 2.55;
      const toss = seg(t, 1.6, 2.0), take = easeInOut(seg(t, 2.05, 2.4));
      const flg = seg(t, 2.6, 3.4), settle = easeInOut(seg(t, 3.3, 3.8));
      const pose = { x: 126 - 10 * pull * (1 - seg(t, 1.5, 1.8)), facing: turn ? -1 : 1, lean: -6 * pull * (1 - toss) + 8 * grab * (1 - pull) + 8 * settle * (1 - seg(t, 3.8, 4.2)), look: turn ? 0.4 : 0.5, blink: blinkAt(t), mood: t > 3.8 ? 'grin' : 'smile', squash: 1 - 0.03 * hump(pull) };
      P(b, pose);
      let armR = 8;
      if (t < 1.55) armR = lerp(lerp(8, reach(b, S, 'R', X0 + 8, MT + 6), grab), 50, pull);
      else if (t < 2.0) armR = lerp(50, 120, easeOut(toss));
      else if (t < 2.55) armR = lerp(lerp(120, reach(b, S, 'R', 76, FY - 50), take), 70, easeInOut(seg(t, 2.4, 2.55)));
      else armR = lerp(lerp(70, 160, easeOut(seg(t, 2.6, 2.85))), reach(b, S, 'R', X0 + 2, MT - 2), easeInOut(seg(t, 2.85, 3.5)));
      if (t > 3.8) armR = lerp(armR, 8, easeInOut(seg(t, 3.8, 4.2)));
      P(b, { ...pose, armR, armL: 8 + 10 * pull * (1 - toss) });
      const h = hp(b, S, 'R', 28);
      // 古いシーツ：手の方へ寄せられて丸まる
      const L = t < 0.8 ? X0 - 2 : h.x - 4, R = lerp(X1 + 2, h.x + 30, pull), lift = 8 * pull;
      const wv = (i) => 3 * Math.sin(i * 1.7 + 2) * (0.4 + pull * 2);
      if (t < 1.55) {
        k.set(old, { d: `M ${L} ${MT - 2 - lift} Q ${lerp(L, R, 0.3)} ${MT - 6 - wv(1) - lift} ${lerp(L, R, 0.5)} ${MT - 2 - lift} T ${R} ${MT - 2 - lift * 0.3} L ${R} ${MT + TH * (1 - pull) + 2} L ${L} ${MT + TH + 2 - lift} Z`, opacity: 1 });
        k.set(wr, { d: `M ${lerp(L, R, 0.2)} ${MT + 6} q 10 6 22 2 M ${lerp(L, R, 0.6)} ${MT + 12} q 12 -6 24 0 M ${lerp(L, R, 0.8)} ${MT + 4} q 6 8 14 6`, opacity: 1 - pull });
      } else { old.setAttribute('opacity', 0); wr.setAttribute('opacity', 0); }
      // 丸めたシーツをかごへ投げる
      if (t >= 1.55) {
        const q = easeIn(toss), bx = lerp(h.x, BK, toss), by = lerp(h.y, FY - 26, q) - 40 * hump(toss);
        tf(bundle, t < 1.75 ? h.x : bx, t < 1.75 ? h.y : by, 0, 1);
        if (t > 2.0) tf(bundle, BK, FY - 30 + 2 * wobble(seg(t, 2.0, 2.4), 2, 6), 0, 1, 0.7);
      } else tf(bundle, 0, 0, 0, 0.001);
      // たたんだ新しいシーツ → 手 → ばさっと広げる
      if (t < 2.4) tf(folded, 76, FY - 44);
      else if (t < 2.6) tf(folded, h.x, h.y + 4);
      else tf(folded, 0, 0, 0, 0.001);
      const flying = t >= 2.6 && t < 3.8;
      if (flying) {
        const ex = lerp(h.x + 20, X1, easeOut(flg)), ey = lerp(h.y, MT - 2, settle) - 30 * Math.sin(flg * Math.PI) * (1 - settle);
        const cx = lerp((h.x + ex) / 2, (h.x + ex) / 2, 1), cy = lerp(h.y - 70 * hump(flg), MT - 2, settle) + 4 * Math.sin(t * 14) * (1 - settle);
        const d = `M ${h.x} ${h.y} Q ${cx} ${cy} ${ex} ${ey}`;
        k.set(fly, { d, opacity: 1 - seg(t, 3.6, 3.8) }); k.set(flyIn, { d, opacity: 1 - seg(t, 3.6, 3.8) });
      } else { fly.setAttribute('opacity', 0); flyIn.setAttribute('opacity', 0); }
      fresh.setAttribute('opacity', seg(t, 3.5, 3.75));
      const c = seg(t, 3.9, 4.3);
      tf(newChk, CX + 11.5 + 75, CY + 25.5 + 30, 0, c > 0 ? easeOut(c) * 1.1 : 0.001);
    }
  };
}
