// invite：近所の人を招待カードで夕食に呼び、家の中の食卓へ案内する（例文 We invited our neighbors to dinner.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, reach, gait } from './weigh.js';

export const meta = { duration: 5.0, beats: [[0, '声をかける'], [1.8, '招待を渡す'], [3.4, '食卓へ案内']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  // 自宅（右）：玄関が開き、中に夕食のテーブル
  el('rect', { x: 250, y: 70, width: 160, height: FY - 70, rx: 5, fill: '#FBE9DC' });
  el('path', { d: 'M 238 78 L 330 26 L 422 78 Z', fill: pal.coral, stroke: pal.coral, 'stroke-width': 6, 'stroke-linejoin': 'round' });
  const door = { x: 310, y: FY - 100, w: 80, h: 100 };
  el('rect', { x: door.x, y: door.y, width: door.w, height: door.h, rx: 3, fill: '#FFD98A' });
  el('rect', { x: door.x, y: FY - 16, width: door.w, height: 16, fill: '#E8B864' });
  el('rect', { x: 322, y: FY - 42, width: 56, height: 5, rx: 2, fill: pal.woodDark });
  el('rect', { x: 328, y: FY - 38, width: 4, height: 24, fill: pal.woodDark }); el('rect', { x: 368, y: FY - 38, width: 4, height: 24, fill: pal.woodDark });
  el('ellipse', { cx: 340, cy: FY - 45, rx: 9, ry: 2.6, fill: '#fff' }); el('ellipse', { cx: 360, cy: FY - 45, rx: 9, ry: 2.6, fill: '#fff' });
  el('rect', { x: 345, y: FY - 56, width: 10, height: 11, rx: 3, fill: pal.red });
  const steam = [0, 1].map((i) => el('path', { d: 'M 0 0 q 3 -5 0 -10 q -3 -5 0 -10', stroke: '#fff', 'stroke-width': 2.2, fill: 'none', opacity: 0.8 }));
  el('rect', { x: 300, y: FY - 4, width: 100, height: 8, rx: 3, fill: pal.woodDark });
  const S = 1.1;
  const me = k.buddy({ x: 250, y: FY, scale: S, facing: -1 });
  const nb = k.buddy({ x: -30, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  // 招待カード
  const card = g({});
  el('rect', { x: -12, y: -9, width: 24, height: 18, rx: 2.5, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, card);
  el('circle', { cx: 0, cy: 0, r: 5.5, fill: 'none', stroke: pal.sub, 'stroke-width': 1.8 }, card);
  el('circle', { cx: 0, cy: 0, r: 2, fill: pal.red }, card);
  return {
    update(t) {
      const g1 = gait((tt) => tt < 3.5 ? lerp(-30, 150, easeInOut(seg(tt, 0.1, 1.5))) : 150, t, -30, 18, 0.1);
      // 自分：こちらへと手招き→カードを差し出す→家へ手を向ける
      me.pose({ armR: 0 });
      const wv = t < 1.5 ? 120 + 25 * Math.sin(t * 9) : 0;
      const aimC = reach(me, S, 'R', 200, 176);
      const aimD = reach(me, S, 'R', 330, 190);
      const ar = t < 0.3 ? 8 : t < 1.5 ? lerp(8, wv, easeOut(seg(t, 0.3, 0.6))) : t < 3.5 ? lerp(wv, aimC, easeInOut(seg(t, 1.5, 2.0))) * 1 : lerp(aimC, aimD, easeInOut(seg(t, 3.5, 4.0)));
      const ar2 = t >= 2.9 ? lerp(aimC, 8, easeInOut(seg(t, 2.9, 3.4))) : ar;
      me.pose({ armR: ar2, armL: lerp(8, 110, easeInOut(seg(t, 3.5, 4.0))) + 6 * Math.sin(t * 6) * seg(t, 4.0, 4.1), look: -0.5, mood: 'grin' });
      const mh = hp(me, S, 'R', 30);
      // 近所の人：近づき、カードを受け取り、うなずいて家に入る
      const rec = easeInOut(seg(t, 2.3, 2.8));
      nb.pose({ x: g1.x, walk: g1.walk, armL: g1.armL, lean: g1.lean, look: 0.5, mood: t > 2.7 ? 'grin' : 'smile',
        armR: t < 2.0 ? g1.armR : lerp(g1.armR, reach(nb, S, 'R', 203, 178), rec) });
      if (t >= 2.7) nb.pose({ armR: lerp(reach(nb, S, 'R', 203, 178), 105, easeInOut(seg(t, 2.9, 3.4))) });
      const nh = hp(nb, S, 'R', 30);
      const pos = t < 2.4 ? mh : nh;
      tf(card, pos.x, pos.y - 2, t < 2.4 ? 0 : -8);
      card.setAttribute('opacity', t < 1.7 ? 0 : 1);
      steam.forEach((s, i) => { const p = (t * 0.5 + i / 2) % 1; tf(s, 342 + i * 18, FY - 60 - 10 * p); s.setAttribute('opacity', 0.9 * Math.sin(p * Math.PI)); });
    }
  };
}
