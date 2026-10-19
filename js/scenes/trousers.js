// trousers：ズボンを腰に当てると裾が床にたまる → 台に広げて裾をはさみで切る → ちょうどの長さ（例文 These trousers are a little too long, so I'll shorten them.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, wobble } from '../ease.js';
import { reach, hp, P, blinkAt } from './skirt.js';
import { mark } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '裾が長すぎる'], [1.6, '裾を切る'], [3.5, 'ちょうどいい']] };

const C = '#7C8AA5', D = '#5E6B86';
// ズボン（原点＝ウエスト中央、下向きに長さ L。pool>0 で裾が床にたまる）
function pants(k) {
  const g = k.g({});
  const body = k.el('path', { fill: C, stroke: D, 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, g);
  const band = k.el('rect', { x: -15, y: -2, width: 30, height: 5, rx: 2, fill: D }, g);
  const pool = k.el('path', { fill: C, stroke: D, 'stroke-width': 1.2 }, g);
  return {
    g, set(L, pl = 0) {
      k.set(body, { d: `M -15 0 L 15 0 L 17 ${L} L 3 ${L} L 0 14 L -3 ${L} L -17 ${L} Z` });
      k.set(pool, { d: pl > 0.5 ? `M -18 ${L - 6} Q -30 ${L - 2} -27 ${L + 1} L 27 ${L + 1} Q 30 ${L - 2} 18 ${L - 6} Q 10 ${L - 3} 3 ${L - 6} Q -6 ${L - 2} -18 ${L - 6} Z M -24 ${L - 1} Q -10 ${L - 4} 0 ${L - 1} M 4 ${L - 1} Q 14 ${L - 4} 24 ${L - 1}` : 'M 0 0' });
      void band;
    }
  };
}
function scissors(k) {
  const g = k.g({}), pal = k.pal;
  const a = k.g({}, g), b2 = k.g({}, g);
  k.el('path', { d: 'M 0 0 L 22 -2 L 22 1 Z', fill: '#C9D3E0', stroke: pal.sub, 'stroke-width': 1 }, a);
  k.el('circle', { cx: -6, cy: -4, r: 4.5, fill: 'none', stroke: pal.coral, 'stroke-width': 3 }, a);
  k.el('path', { d: 'M 0 0 L 22 2 L 22 -1 Z', fill: '#C9D3E0', stroke: pal.sub, 'stroke-width': 1 }, b2);
  k.el('circle', { cx: -6, cy: 4, r: 4.5, fill: 'none', stroke: pal.coral, 'stroke-width': 3 }, b2);
  return { g, open(p) { k.tf(a, 0, 0, -16 * p); k.tf(b2, 0, 0, 16 * p); } };
}

export function create(k) {
  const { el, pal, tf } = k, S = 1.25;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 40, y: 48, width: 76, height: 70, rx: 8, fill: '#DDEFFA' });
  el('line', { x1: 78, y1: 48, x2: 78, y2: 118, stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // 作業台
  const TY = FY - 64;
  k.shadow(300, FY + 1, 72, 4);
  el('rect', { x: 226, y: TY, width: 150, height: 8, rx: 3, fill: pal.wood });
  [236, 366].forEach((x) => el('rect', { x: x - 3, y: TY + 8, width: 6, height: FY - TY - 8, fill: pal.woodDark }));
  const b = k.buddy({ x: 180, y: FY, scale: S });
  const p = pants(k);
  const cut = el('path', { d: 'M -17 0 L -3 0 L -3 13 L -17 13 Z M 3 0 L 17 0 L 17 13 L 3 13 Z', fill: C, stroke: D, 'stroke-width': 1.2 });
  const sc = scissors(k);
  const q = mark(k, 'bang', k.root, 1.1), ok = mark(k, 'check', k.root, 1.3);
  const PS = 1.3, WY = FY - 27 * S, OK = (27 * S + 4) / PS, LONG = OK + 13;
  const onT = { x: 250, y: TY - 17 * PS - 1 }; // 台の上：ウエストが左、裾が右
  return {
    update(t) {
      const toT = easeInOut(seg(t, 1.2, 1.8)), back = easeInOut(seg(t, 3.2, 3.8));
      const snip = seg(t, 1.9, 2.8);
      const L = t < 2.6 ? LONG : OK;
      // ズボンの位置と向き
      const hold = { x: 180 + 4 * S, y: WY };
      let x, y, r;
      if (t < 3.2) { x = lerp(hold.x, onT.x, toT); y = lerp(hold.y, onT.y, toT) - 18 * hump(toT); r = -90 * toT; }
      else { x = lerp(onT.x, hold.x, back); y = lerp(onT.y, hold.y, back) - 18 * hump(back); r = -90 * (1 - back); }
      const vertical = (t < 1.2) || t > 3.8;
      const pl = vertical && L > OK + 1 ? 8 : 0;
      p.set(vertical ? OK : L, pl);
      tf(p.g, x, y, r, PS);
      // まめ：持つ → 台へ → 左手で押さえ右手ではさみ → 戻す
      const atT = t > 1.5 && t < 3.4;
      const ws = (t > 3.9 ? wobble(seg(t, 3.9, 4.4), 2, 5) : 0);
      P(b, { x: 180 + 10 * easeInOut(seg(t, 1.2, 1.6)) * (1 - easeInOut(seg(t, 3.2, 3.6))), lean: atT ? 10 : 0, squash: 1 + 0.03 * ws, look: 0.5,
        mood: t < 1.2 ? 'flat' : t > 3.8 ? 'grin' : 'smile', blink: blinkAt(t) });
      const waist = { x: x + Math.sin((-r * Math.PI) / 180) * 0, y };
      let hl = { x: waist.x - 8 * Math.cos((r * Math.PI) / 180), y: waist.y - 8 * Math.sin((r * Math.PI) / 180) };
      let hr = { x: waist.x + 8 * Math.cos((r * Math.PI) / 180), y: waist.y + 8 * Math.sin((r * Math.PI) / 180) };
      const cutX = onT.x + OK * PS;
      if (t > 1.85 && t < 3.15) {
        const sp = easeOut(seg(t, 1.8, 2.0)) * (1 - easeIn(seg(t, 2.95, 3.15)));
        hr = { x: lerp(hr.x, cutX - 12, sp), y: lerp(hr.y, onT.y + 2, sp) };
        hl = { x: onT.x + 8, y: onT.y - 4 };
      }
      b.pose({ armR: reach(b, S, 'R', hr.x, hr.y), armL: reach(b, S, 'L', hl.x, hl.y) });
      // はさみ（右手に持ち、刃先を裾へ）
      const h = hp(b, S, 'R');
      const son = t > 1.85 && t < 3.15;
      tf(sc.g, h.x, h.y, 0, son ? 1 : 0.001);
      sc.open(son ? Math.abs(Math.sin(snip * Math.PI * 3)) : 0);
      // 切れ端：裾の先 → 台の端から床へ落ちる
      const fall = seg(t, 2.6, 3.2);
      const fx = cutX + 2 + 24 * easeOut(fall);
      const land = seg(fall, 0.35, 1), fy = lerp(onT.y, FY - 4, easeIn(land));
      tf(cut, fx + 30 * land, fy, -90 - 90 * easeIn(land), t > 2.6 ? PS : 0.001);
      tf(q, 180 + 40, FY - 112 - 6 * hump(seg(t, 0.3, 0.7)), 0, t > 0.3 && t < 1.2 ? 1.1 : 0.001);
      tf(ok, 180 + 44, FY - 116, 0, t > 3.9 ? easeOut(seg(t, 3.9, 4.2)) * 1.3 : 0.001);
    }
  };
}
