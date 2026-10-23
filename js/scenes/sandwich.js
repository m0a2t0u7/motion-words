// sandwich：まめがパンの上にレタス・ハム・パンを重ねてハムサンドを作り、お弁当箱に入れる（例文 I made a ham sandwich for lunch.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt, clock } from './run-after.js';
import { hp, reach } from './dig.js';
import { kitchen } from './flour.js';
import { breadG, boardG } from './tuna.js';

export const meta = { duration: 4.6, beats: [[0, 'パンにのせる'], [1.0, 'ハムをはさむ'], [2.8, 'お昼のハムサンド']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.05;
  const R = kitchen(k), TY = R.TY, MY = TY + 22;
  const ck = clock(k, 200, 56, 18); ck.set(11, 50);
  const me = k.buddy({ x: 120, y: MY, scale: S });
  R.front();
  boardG(k, 226, TY - 7);
  const BY = TY - 7;
  const sw = g({}); tf(sw, 226, BY);
  breadG(k, sw);
  // 材料：レタス・ハム・パン（右の皿から取る）
  const mk = (kind) => { const n = g({}); if (kind === 'let') el('path', { d: 'M -34 0 Q -26 -8 -17 -2 Q -8 -9 0 -2 Q 8 -9 17 -2 Q 26 -8 34 0 Z', fill: '#7FCB62' }, n); else if (kind === 'ham') { el('rect', { x: -30, y: -6, width: 60, height: 6, rx: 3, fill: '#F49CA8' }, n); el('rect', { x: -30, y: -6, width: 60, height: 2, rx: 1, fill: '#F7C1C9' }, n); } else breadG(k, n); return n; };
  const items = ['let', 'ham', 'bread'].map(mk);
  const H = [5, 6, 8];
  const src = [{ x: 326, y: TY - 4 }, { x: 326, y: TY - 14 }, { x: 326, y: TY - 26 }];
  el('ellipse', { cx: 326, cy: TY - 2, rx: 40, ry: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  const box = g({}); el('rect', { x: -40, y: -26, width: 80, height: 26, rx: 5, fill: '#F2A65A' }, box); el('rect', { x: -36, y: -22, width: 72, height: 18, rx: 3, fill: '#FFE7C7' }, box);
  const lid = g({}); el('rect', { x: -42, y: -6, width: 84, height: 8, rx: 4, fill: '#E07B39' }, lid);
  return {
    update(t) {
      const per = 0.7, t0 = 0.6;
      P(me, { x: 120, y: MY, look: 0.7, mood: t > 3.2 ? 'grin' : 'smile', blink: blinkAt(t), lean: 6 });
      let stackY = BY - 8, armT = { x: 230, y: TY - 70 };
      items.forEach((n, i) => {
        const q = clamp((t - t0 - i * per) / per);
        const s0 = src[i], d = { x: 226, y: stackY };
        let pos;
        if (q <= 0) pos = s0; else if (q < 0.4) { pos = s0; } else pos = { x: lerp(s0.x, d.x, easeInOut((q - 0.4) / 0.6)), y: lerp(s0.y, d.y, easeInOut((q - 0.4) / 0.6)) - 30 * hump((q - 0.4) / 0.6) };
        if (q > 0 && q < 1) armT = q < 0.4 ? { x: lerp(230, s0.x, easeInOut(q / 0.4)), y: lerp(TY - 60, s0.y - 6, easeInOut(q / 0.4)) } : { x: pos.x, y: pos.y - 6 };
        tf(n, pos.x, pos.y, 0, q > 0 ? 1 : 0.8);
        stackY -= H[i];
      });
      // できたサンドを弁当箱へ（パンを三角に切ったつもりで小さく）
      const mv = easeInOut(seg(t, 3.4, 3.95)), cl = easeInOut(seg(t, 4.0, 4.4));
      const bx = 226, by = TY - 2;
      tf(box, bx, by); box.setAttribute('opacity', t > 3.3 ? 1 : 0);
      tf(sw, 226, lerp(BY, by - 4, mv) - 30 * hump(mv), 0, lerp(1, 0.85, mv));
      items.forEach((n, i) => { if (mv > 0) { const off = [8, 13, 19][i]; tf(n, 226, lerp(BY - off, by - 4 - off * 0.85, mv) - 30 * hump(mv), 0, lerp(1, 0.85, mv)); } });
      tf(lid, bx, lerp(by - 70, by - 26, cl)); lid.setAttribute('opacity', t > 3.95 ? 1 : 0);
      if (t > 3.4 && t < 4.0) armT = { x: 226, y: lerp(BY - 20, by - 26, mv) - 30 * hump(mv) };
      if (t >= 4.0) armT = { x: bx, y: lerp(by - 76, by - 32, cl) };
      me.pose({ armR: reach(me, S, 'R', armT.x, armT.y) });
    }
  };
}
