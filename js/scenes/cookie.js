// cookie：クッキーを1枚食べたまめが、お皿を指して「もう1枚いい？」と聞く。友だちがうなずいて、もう1枚を取る（例文 Can I have another cookie?）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { hp, reach } from './dig.js';
import { plateG } from './flour.js';
import { cloth, mouthOf } from './spinach.js';
import { balloon } from './animal.js';

export function cookieG(k, parent, r = 9) {
  const g = k.g({}, parent);
  k.el('circle', { r, fill: '#E3B26B', stroke: '#C98F45', 'stroke-width': 1.5 }, g);
  [[-3, -3], [3, 1], [-1, 4], [4, -4]].forEach(([x, y]) => k.el('circle', { cx: x * r / 9, cy: y * r / 9, r: 1.6 * r / 9, fill: '#6B3F2A' }, g));
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '1枚食べた'], [1.4, 'もう1枚いい？'], [3.0, 'どうぞ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 150, y: 40, width: 100, height: 70, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const me = k.buddy({ x: 100, y: FY - 2, scale: S });
  const fr = k.buddy({ x: 300, y: FY - 2, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const TY = 212; cloth(k, 40, 360, TY, FY, '#E9F3FB', '#7FB3E8');
  const pl = g({}); tf(pl, 200, TY); plateG(k, pl, 80);
  const cs = [[-18, -8], [0, -10], [18, -8]].map(([x, y]) => { const c = cookieG(k, pl); tf(c, x, y, 0, 1, 0.55); return c; });
  const held = cookieG(k); const bitten = el('circle', { r: 4, fill: '#E9F3FB' }, held);
  const crumbs = [0, 1, 2].map(() => el('circle', { r: 1.6, fill: '#C98F45' }));
  const ask = balloon(k, 64, 40, 1); const ic = cookieG(k, ask.c, 9); tf(ic, -10, 0); k.text(16, 1, '+1', { 'font-size': 14, fill: pal.coralDark }, ask.c);
  const ok = balloon(k, 40, 34, -1); k.text(0, 1, 'OK', { 'font-size': 13, fill: pal.mintDark }, ok.c);
  const another = cookieG(k);
  return {
    update(t) {
      // 1枚目：口へ運んで食べきる
      const e = easeInOut(seg(t, 0, 0.5)) * (1 - easeInOut(seg(t, 1.0, 1.3)));
      const left = 1 - seg(t, 0.5, 1.0);
      P(me, { x: 100, y: FY - 2, look: 0.6, mood: t > 0.5 && t < 1.1 ? (Math.sin(t * 24) > 0 ? 'open' : 'smile') : t > 3.0 ? 'grin' : 'smile', blink: blinkAt(t) });
      const mo = mouthOf(me, S);
      me.pose({ armR: lerp(30, reach(me, S, 'R', mo.x + 6, mo.y + 4), e) });
      let h = hp(me, S, 'R', 28);
      tf(held, h.x + 4, h.y, 0, Math.max(0.001, left)); held.setAttribute('opacity', left > 0.05 ? 1 : 0);
      tf(bitten, 7, -4, 0, 1 + 1.4 * seg(t, 0.5, 1.0));
      crumbs.forEach((c, i) => { const q = seg(t, 0.6 + i * 0.12, 1.2 + i * 0.12); k.set(c, { cx: mo.x + 8 + i * 4, cy: mo.y + 10 + 40 * q, opacity: q > 0 && q < 1 ? 1 : 0 }); });
      // お皿を指して聞く
      const pt = easeInOut(seg(t, 1.3, 1.7)) * (1 - easeInOut(seg(t, 2.6, 2.9)));
      if (pt > 0) me.pose({ armR: lerp(30, reach(me, S, 'R', 200, TY - 14), pt), lean: 4 * pt });
      ask.show(seg(t, 1.5, 1.8) * (1 - seg(t, 2.7, 2.9)), 130, FY - 104);
      // 友だちがうなずく
      const nod = Math.sin(seg(t, 2.2, 2.8) * Math.PI * 2) * 6;
      P(fr, { x: 300, y: FY - 2, facing: -1, lean: Math.max(0, nod), look: 0.6, mood: t > 2.2 ? 'grin' : 'smile', blink: blinkAt(t, 1), armR: lerp(8, 60, hump(seg(t, 2.4, 3.4))) });
      ok.show(seg(t, 2.4, 2.7) * (1 - seg(t, 3.6, 3.9)), 280, FY - 104);
      // もう1枚を取る
      const tk = easeInOut(seg(t, 3.0, 3.6));
      cs[2].setAttribute('opacity', tk > 0.5 ? 0 : 1);
      if (tk > 0) me.pose({ armR: lerp(30, reach(me, S, 'R', 218, TY - 10), hump(tk) * 1 + (tk >= 0.5 ? 0 : 0)) });
      if (tk >= 0.5) { me.pose({ armR: lerp(reach(me, S, 'R', 218, TY - 10), 70, easeOut((tk - 0.5) * 2)) }); h = hp(me, S, 'R', 28); tf(another, h.x + 4, h.y, 0, 1); another.setAttribute('opacity', 1); }
      else another.setAttribute('opacity', 0);
    }
  };
}
