// spoon：フォークではスープがすくえない。お母さんに渡されたスプーンに持ちかえて飲む（例文 Eat your soup with a spoon.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, dinner, vessel, steam, spoonP, fork, scoop, eatCycle, mouthAt, iconSay, P, blinkAt, C } from './jam.js';
import { homeBg } from './furniture.js';

export const meta = { duration: 4.6, beats: [[0, 'フォークでは…'], [1.2, 'スプーンを渡す'], [2.4, 'スプーンで飲む']] };

export function create(k) {
  const { el, pal } = k, S = 1.1;
  const FY = homeBg(k, { winX: 40, winW: 80 });
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const mom = k.buddy({ x: 330, y: FY, scale: 1.25, facing: -1, ...C(k, 'coral') });
  dinner(k, 60, 280, 198);
  const BX = 206;
  const bowl = vessel(k, undefined, { w: 48, h: 22, taper: 0.6, col: '#fff', liquid: '#F0A63A' }); k.tf(bowl.g, BX, 200, 0, 1.2);
  const st = steam(k, undefined, 3, 20);
  const fk = fork(k), sp = spoonP(k, undefined, 1.2);
  const drop = el('ellipse', { rx: 4, ry: 2.2, fill: '#F0A63A' });
  const A = arms(k, b, S, { back: ['L'] }), M = arms(k, mom, 1.25, { col: pal.coral, dark: pal.coralDark, back: ['L'] });
  const tip = iconSay(k, 52, 40, 1, (g) => { const s = spoonP(k, g, 1); k.tf(s, 0, -12, 0, 1); });
  return {
    update(t) {
      // 1) フォークでスープを刺す → 何もすくえない
      const poke = hump(seg(t, 0.2, 0.7)) + hump(seg(t, 0.7, 1.1));
      const give = easeInOut(seg(t, 1.0, 1.5)), swap = easeInOut(seg(t, 1.5, 1.8)), back = easeInOut(seg(t, 1.8, 2.2));
      const e = eatCycle(t, 2.3, 1.0, 2);
      bowl.set(0.8 - 0.25 * clamp((e.i + (e.q > 0.2)) / 2));
      P(b, { look: 0.5, lean: 4, blink: e.m > 0.9 ? 1 : blinkAt(t), mood: t < 1.3 ? (t > 0.7 ? 'sad' : 'flat') : t > 2.3 ? 'grin' : 'smile' });
      P(mom, { look: 0.5, lean: 8 * give * (1 - back), blink: blinkAt(t, 1), facing: -1, mood: 'smile' });
      // フォーク：右手 → 1.5 で台に置く
      const fp = { x: BX - 4, y: 160 + 18 * poke };
      const fput = { x: 108, y: 196 };
      // スプーン：お母さんの手（差し出す）→ 子どもの手
      const mh = { x: lerp(300, 236, give), y: lerp(200, 166, give) };
      if (t < 1.5) {
        const pp = easeInOut(seg(t, 1.1, 1.5));
        const fh = { x: lerp(fp.x, fput.x, pp), y: lerp(fp.y, fput.y - 22, pp) };
        A.to('R', fh.x, fh.y); k.tf(fk, fh.x, fh.y, lerp(10, 80, pp), 1.2);
        k.tf(sp, mh.x, mh.y, -30, 1.2); M.to('R', mh.x + 4, mh.y - 4);
      } else {
        k.tf(fk, fput.x, fput.y, 90, 1.2);
        if (t < 2.3) {
          const hx = lerp(fput.x, 236, swap), hy = lerp(fput.y - 22, 160, swap);
          A.to('R', hx, hy);
          const sx = lerp(236, BX - 10, back), sy = lerp(166, 166, back);
          if (t < 1.8) { k.tf(sp, mh.x, mh.y, -30, 1.2); }
          else { k.tf(sp, lerp(236, BX - 12, back), lerp(160, 150, back), lerp(-30, 15, back), 1.2); A.to('R', lerp(236, BX - 12, back), lerp(160, 150, back)); }
          M.to('R', lerp(mh.x + 4, 300, back), lerp(mh.y - 4, 204, back));
          void sx; void sy;
        } else {
          const s = scoop(b, S, { x: BX - 12, y: 150 }, e.m);
          A.to('R', s.x, s.y); k.tf(sp, s.x, s.y, s.rot, 1.2);
          const a = (s.rot * Math.PI) / 180; k.tf(drop, s.x - Math.sin(a) * 22, s.y + Math.cos(a) * 22);
          M.to('R', 300, 204);
        }
      }
      drop.setAttribute('opacity', t > 2.3 && e.q > 0.15 && e.q < 0.62 && e.i < 2 ? 1 : 0);
      A.to('L', BX - 34, 192);
      M.to('L', 352, 204);
      st.set(BX, 170, 1, t);
      tip.show(seg(t, 0.9, 1.2) * (1 - seg(t, 2.0, 2.2)), 300, 104);
      void mouthAt;
    }
  };
}
