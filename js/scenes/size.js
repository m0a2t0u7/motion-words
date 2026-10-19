// size：Sサイズのシャツを体に当てると小さい → 店員に見せて「L?」とたずねる。店員が大きいサイズの棚へ（例文 Do you have this shirt in a larger size?）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { shopBg, clerk, teeProp, hp, reach, P, blinkAt } from './skirt.js';
import { talk } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '小さいシャツ'], [1.5, '大きいのは？'], [3.0, '探してもらう']] };

export function create(k) {
  const { el, g, pal, tf } = k, S = 1.25;
  const shop = shopBg(k, 236, 300);
  const FY = shop.FY;
  // 棚（サイズ別にたたんだシャツ）
  el('rect', { x: 254, y: 68, width: 140, height: 6, rx: 2, fill: pal.woodDark });
  [['S', 270, 1], ['M', 316, 2], ['L', 364, 3]].forEach(([lab, x, n]) => {
    for (let i = 0; i < n + 1; i++) el('rect', { x: x - 14 - n * 2, y: 60 - i * 7, width: 28 + n * 4, height: 7, rx: 2, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 1 });
    k.text(x, 84, lab, { 'font-size': 13, fill: pal.sub });
  });
  const c = clerk(k, 324, FY, 1.05);
  shop.front();
  const b = k.buddy({ x: 150, y: FY, scale: S });
  // 小さいシャツ（Sのタグ）
  const sh = g({});
  teeProp(k, sh, pal.mint, pal.mintDark, { w: 0.62, h: 0.8 });
  const tg = g({}, sh);
  el('rect', { x: -7, y: 6, width: 14, height: 13, rx: 2, fill: '#fff', stroke: pal.line }, tg);
  k.text(0, 13, 'S', { 'font-size': 10, fill: pal.ink }, tg);
  const q = talk(k, 'L ?', 56, 34, -1, 16);
  return {
    update(t) {
      const show = easeInOut(seg(t, 1.3, 1.8));
      P(b, { x: 150 + 20 * show, look: lerp(-0.2, 0.5, show), mood: t < 1.3 ? 'flat' : 'smile', blink: blinkAt(t), squash: 1 + 0.02 * Math.sin(t * 3) * (1 - show) });
      // 当てる：シャツの肩を両手で持って胸の前 → 店員へ差し出す
      const bx = b.state.x;
      const chest = { x: bx + 2 * S, y: FY - 56 * S };
      const out = { x: bx + 52 * S, y: FY - 62 * S };
      const pos = { x: lerp(chest.x, out.x, show), y: lerp(chest.y, out.y, show) };
      tf(sh, pos.x, pos.y, 0, S * lerp(1, 0.9, show));
      b.pose({ armR: reach(b, S, 'R', pos.x + 12 * S, pos.y + 6), armL: reach(b, S, 'L', pos.x - 12 * S, pos.y + 6) });
      q.show(seg(t, 1.8, 2.2), bx + 18, FY - 150);
      // 店員：見る → うなずく → 後ろの L の棚へ手を伸ばす
      const turn = t > 3.0;
      const nod = hump(seg(t, 2.3, 2.7));
      const rch = easeInOut(seg(t, 3.1, 3.7));
      P(c, { x: 324, facing: turn ? 1 : -1, squash: 1 - 0.05 * nod, lean: 6 * nod, look: turn ? 0.4 : 0.5, mood: t > 2.3 ? 'grin' : 'smile', blink: blinkAt(t, 1),
        armR: turn ? lerp(8, reach(c, 1.05, 'R', 364, 50), rch) : 8 });
      void hp; void easeOut;
    }
  };
}
