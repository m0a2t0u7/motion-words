// tray：彼女がカップを3つ乗せたお盆を両手で持ち、こぼさないように運んでテーブルに置く（例文 She carried the cups on a tray.）
import { seg, lerp, easeInOut, easeOut, clamp, hump, wobble } from '../ease.js';
import { arms, vessel, bow, P, blinkAt } from './jam.js';
import { homeBg } from './furniture.js';
import { gait } from './weigh.js';
import { backTable } from './bag.js';

export const meta = { duration: 4.4, beats: [[0, 'お盆にカップ'], [0.6, 'そっと運ぶ'], [3.4, 'テーブルへ']] };

export function create(k) {
  const { el, pal } = k, S = 1.15;
  const FY = homeBg(k, { winX: 150, winW: 90 });
  const TY = backTable(k, 268, 390, 176, FY);
  const b = k.buddy({ x: 60, y: FY, scale: S });
  bow(k, b);
  const A = arms(k, b, S);
  const tray = k.g({});
  el('rect', { x: -34, y: -4, width: 68, height: 6, rx: 3, fill: '#C98A5A' }, tray);
  el('rect', { x: -38, y: -8, width: 6, height: 10, rx: 2, fill: '#B07548' }, tray);
  el('rect', { x: 32, y: -8, width: 6, height: 10, rx: 2, fill: '#B07548' }, tray);
  const cups = [-20, 0, 20].map((x) => { const c = vessel(k, tray, { w: 15, h: 13, taper: 0.75, handle: 5, col: '#fff', liquid: '#B5652E' }); k.tf(c.g, x, -4); c.set(0.8); return c; });
  const xf = (t) => lerp(60, 240, easeInOut(seg(t, 0.4, 3.0)));
  return {
    update(t) {
      const g = gait(xf, t, 60, 0, 0.12);
      const put = easeInOut(seg(t, 3.1, 3.6)), away = easeInOut(seg(t, 3.7, 4.1));
      P(b, { x: g.x, walk: g.walk, lean: 2 + 6 * put, look: 0.5, blink: blinkAt(t), mood: t > 3.6 ? 'grin' : 'flat' });
      // お盆：体の前、胸の高さ。歩く振動で少しゆれる
      const sway = Math.sin(g.walk) * 2 * g.m;
      const tx = lerp(g.x + 42, 322, put), ty = lerp(FY - 36 * S + Math.abs(Math.sin(g.walk)) * 2, TY, put);
      k.tf(tray, tx, ty, sway);
      cups.forEach((c, i) => c.g.setAttribute('transform', `translate(${[-20, 0, 20][i]} -4) rotate(${(-sway * 0.6).toFixed(2)})`));
      A.to('R', lerp(tx + 26, g.x + 40, away), lerp(ty + 3, FY - 40, away));
      A.to('L', lerp(tx - 26, g.x + 20, away), lerp(ty + 3, FY - 40, away));
      void wobble;
    }
  };
}
