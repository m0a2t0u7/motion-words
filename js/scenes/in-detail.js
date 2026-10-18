// in detail：「計画」の1枚の紙を、ボードの上で日程・場所・時間・持ち物まで細かく広げて1つずつ説明する（例文 Please explain the plan in detail.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, clock } from './run-after.js';
import { officeBg } from './get-on-with.js';
import { reach } from './dig.js';
import { popS } from './from-scratch.js';
import { check } from './work-on.js';

export const meta = { duration: 4.6, beats: [[0, '計画は1枚'], [1.2, '細かく広げる'], [3.2, '1つずつ説明']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236, 20);
  el('rect', { x: 150, y: 24, width: 236, height: 150, rx: 6, fill: '#fff', stroke: pal.sub, 'stroke-width': 4 });
  [190, 346].forEach((x) => el('line', { x1: x, y1: 174, x2: x - 8, y2: FY, stroke: pal.sub, 'stroke-width': 4 }));
  // 中央の「計画」カード
  const card = g({});
  el('rect', { x: -26, y: -18, width: 52, height: 36, rx: 4, fill: '#FFF3C4', stroke: pal.yellowDark, 'stroke-width': 2 }, card);
  [-8, 0, 8].forEach((y) => el('line', { x1: -16, x2: 16, y1: y, y2: y, stroke: pal.sub, 'stroke-width': 2 }, card));
  // 細目：カレンダー・地図ピン・時計・持ち物チェック
  const C0 = [268, 99];
  const items = [];
  const mk = (fn) => { const it = g({}); fn(it); items.push(it); return it; };
  mk((it) => { el('rect', { x: -16, y: -14, width: 32, height: 28, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, it); el('rect', { x: -16, y: -14, width: 32, height: 8, rx: 3, fill: pal.coral }, it); [[-8, 2], [0, 2], [8, 2], [-8, 9], [0, 9]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 1.8, fill: pal.sub }, it)); });
  mk((it) => { el('path', { d: 'M 0 14 Q -12 0 -10 -6 A 10 10 0 1 1 10 -6 Q 12 0 0 14 Z', fill: pal.red }, it); el('circle', { cx: 0, cy: -5, r: 4, fill: '#fff' }, it); });
  const ck = mk(() => {});
  const cc = clock(k, 0, 0, 13, ck);
  mk((it) => { el('rect', { x: -14, y: -16, width: 28, height: 32, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, it); [-8, 0, 8].forEach((y) => { el('rect', { x: -10, y: y - 3, width: 6, height: 6, rx: 1, fill: 'none', stroke: pal.green, 'stroke-width': 1.6 }, it); el('line', { x1: -1, x2: 9, y1: y, y2: y, stroke: pal.sub, 'stroke-width': 1.6 }, it); }); });
  const P4 = [[196, 60], [340, 60], [196, 140], [340, 140]];
  const links = P4.map(([x, y]) => el('line', { x1: C0[0], y1: C0[1], x2: C0[0], y2: C0[1], stroke: pal.line, 'stroke-width': 2.5, 'stroke-dasharray': '5 4' }));
  // 虫めがね
  const mag = g({});
  el('circle', { r: 13, fill: '#DDEFFA', 'fill-opacity': 0.5, stroke: pal.ink, 'stroke-width': 3 }, mag);
  el('line', { x1: 9, y1: 9, x2: 20, y2: 20, stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }, mag);
  const c = k.buddy({ x: 60, y: FY, facing: 1, color: pal.coral, dark: pal.coralDark, scale: 0.95 });
  const b = k.buddy({ x: 124, y: FY, facing: 1 });
  const marks = P4.map(([x, y]) => check(k, x + 22, y - 14, 0.6, pal.green));
  return {
    update(t) {
      tf(card, C0[0], C0[1], 0, 1 + 0.12 * hump(seg(t, 0.6, 1.1)));
      cc.set(10, 0);
      const ex = easeOut(seg(t, 1.2, 1.9));
      items.forEach((it, i) => { const [x, y] = P4[i]; tf(it, lerp(C0[0], x, ex), lerp(C0[1], y, ex), 0, popS(seg(t, 1.2 + i * 0.1, 1.6 + i * 0.1))); });
      links.forEach((l, i) => k.set(l, { x2: lerp(C0[0], P4[i][0], ex), y2: lerp(C0[1], P4[i][1], ex), opacity: ex > 0 ? 1 : 0 }));
      tf(mag, lerp(240, C0[0] - 4, easeOut(seg(t, 0.3, 0.7))), C0[1] + 4, 0, t < 1.2 ? 1 : 0.001);
      // 1つずつ指して説明
      const T = [2.0, 2.6, 3.2, 3.8];
      const cur = T.reduce((a, s, i) => (t >= s ? i : a), -1);
      P(b, { x: 124, facing: 1, look: 0.7 });
      const tg = cur >= 0 ? P4[cur] : C0;
      const A = reach(b, 1, 'R', tg[0] - 14, tg[1] + 6);
      const up = easeOut(seg(t, 0.2, 0.6));
      P(b, { x: 124, facing: 1, look: 0.7, armR: lerp(8, A, up), lean: 3, mood: Math.sin(t * 20) > 0 && t > 1.9 ? 'open' : 'smile', blink: blinkAt(t) });
      marks.forEach((m, i) => m(easeOut(seg(t, T[i] + 0.25, T[i] + 0.5))));
      // 聞き手：うなずいて聞く
      const nd = t > 2.0 ? Math.max(0, Math.sin((t - 2.0) * 10.5)) : 0;
      P(c, { x: 60, facing: 1, look: 0.8, lean: 6 * nd, armR: t < 0.8 ? 60 * hump(seg(t, 0, 0.8)) + 8 : 8, mood: t < 1.0 ? 'open' : 'smile', blink: blinkAt(t, 1) });
    }
  };
}
