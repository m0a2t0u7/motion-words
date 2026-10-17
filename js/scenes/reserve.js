// reserve：客のまめが電話で「2人です」と頼むと、2人用のテーブルに「RESERVED」の札が立つ（例文 I'd like to reserve a table for two.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, clamp } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '空いている席'], [1.2, '予約を頼む'], [2.7, '確保された']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 250, mood: 'indoor' });
  // 壁の飾り（右の額縁）
  el('rect', { x: 306, y: 44, width: 62, height: 48, rx: 6, fill: '#FFFFFF', stroke: pal.woodDark, 'stroke-width': 5 });
  el('circle', { cx: 337, cy: 68, r: 11, fill: pal.coral, opacity: 0.8 });
  el('path', { d: 'M 312 90 L 326 76 L 336 86 L 346 74 L 362 90 Z', fill: pal.mint, opacity: 0.7 });

  const chair = (x, dir) => {
    const c = g({});
    tf(c, x, FY, 0, dir, 1);
    k.shadow(0, 2, 30, 5, c);
    el('rect', { x: -26, y: -30, width: 6, height: 30, rx: 3, fill: pal.woodDark }, c);
    el('rect', { x: 14, y: -30, width: 6, height: 30, rx: 3, fill: pal.woodDark }, c);
    el('rect', { x: -26, y: -96, width: 8, height: 68, rx: 4, fill: pal.wood }, c);
    el('rect', { x: -22, y: -88, width: 18, height: 30, rx: 8, fill: pal.mint }, c);
    el('rect', { x: -26, y: -38, width: 50, height: 11, rx: 5, fill: pal.wood }, c);
    el('rect', { x: -22, y: -46, width: 44, height: 10, rx: 5, fill: pal.mint }, c);
    return c;
  };
  const TX = 252, TY = 202, TW = 82;
  chair(TX - TW - 30, 1);
  chair(TX + TW + 30, -1);

  // テーブル（白いクロス）。2人分のお皿
  k.shadow(TX, FY + 2, TW + 6, 7);
  el('path', { d: `M ${TX - TW + 6} ${TY + 4} L ${TX - TW} ${FY - 6} Q ${TX} ${FY + 8} ${TX + TW} ${FY - 6} L ${TX + TW - 6} ${TY + 4} Z`, fill: '#FFFFFF', stroke: '#E1E6EE', 'stroke-width': 2, 'stroke-linejoin': 'round' });
  el('path', { d: `M ${TX - TW} ${FY - 12} Q ${TX} ${FY + 2} ${TX + TW} ${FY - 12} L ${TX + TW} ${FY - 6} Q ${TX} ${FY + 8} ${TX - TW} ${FY - 6} Z`, fill: pal.coral, opacity: 0.85 });
  el('ellipse', { cx: TX, cy: TY, rx: TW + 4, ry: 22, fill: '#FFFFFF', stroke: '#E1E6EE', 'stroke-width': 2 });
  [-48, 48].forEach((dx) => {
    el('ellipse', { cx: TX + dx, cy: TY + 1, rx: 22, ry: 6, fill: '#F1F4F8', stroke: '#DCE2EB', 'stroke-width': 2 });
    el('ellipse', { cx: TX + dx, cy: TY + 1, rx: 13, ry: 3.3, fill: '#FFFFFF' });
  });
  const glow = el('ellipse', { cx: TX, cy: TY + 2, rx: 40, ry: 13, fill: pal.yellow, opacity: 0 });

  // 札（ぽんと現れる。原点＝足元中央）
  const CW = 96, CH = 42;
  const card = g({});
  el('path', { d: 'M -18 -9 L 18 -9 L 13 0 L -13 0 Z', fill: '#D94F43' }, card);
  el('rect', { x: -CW / 2 + 3, y: -CH - 5, width: CW, height: CH, rx: 8, fill: pal.shadow }, card);
  el('rect', { x: -CW / 2, y: -CH - 9, width: CW, height: CH, rx: 8, fill: pal.red }, card);
  el('rect', { x: -CW / 2 + 5, y: -CH - 4, width: CW - 10, height: CH - 10, rx: 5, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 2, opacity: 0.6 }, card);
  k.text(0, -CH / 2 - 9, 'RESERVED', { 'font-size': 15, fill: '#FFFFFF' }, card);
  const check = g({});
  el('circle', { r: 17, fill: pal.green, stroke: '#FFFFFF', 'stroke-width': 4 }, check);
  el('path', { d: 'M -8 1 L -2 7 L 9 -7', fill: 'none', stroke: '#FFFFFF', 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, check);
  const sparks = [[TX - 60, 150], [TX + 74, 160], [TX, 116]].map(([x, y], i) => {
    const s = g({});
    el('path', { d: 'M 0 -8 Q 1.5 -1.5 8 0 Q 1.5 1.5 0 8 Q -1.5 1.5 -8 0 Q -1.5 -1.5 0 -8 Z', fill: i % 2 ? pal.yellow : pal.mint }, s);
    return { s, x, y };
  });

  // 客のまめ（電話をかける）
  const b = k.buddy({ x: 62, y: FY, scale: 1 });
  const phone = g({});
  el('rect', { x: -6, y: -11, width: 12, height: 22, rx: 3.5, fill: pal.ink }, phone);
  el('rect', { x: -4, y: -8, width: 8, height: 13, rx: 1.5, fill: '#CFE9F7' }, phone);
  const waves = [0, 1].map((i) => el('path', { d: `M ${9 + i * 6} -6 Q ${14 + i * 6} 0 ${9 + i * 6} 6`, fill: 'none', stroke: pal.sub, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, phone));

  // 吹き出し：電話アイコン＋「2」の指（2人）
  const bub = g({});
  el('path', { d: 'M -56 -30 Q -56 -38 -48 -38 L 48 -38 Q 56 -38 56 -30 L 56 22 Q 56 30 48 30 L -30 30 L -40 48 L -44 30 L -48 30 Q -56 30 -56 22 Z', fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, bub);
  const ph = g({ transform: 'translate(-26 -4) rotate(-25)' }, bub);
  el('rect', { x: -9, y: -16, width: 18, height: 32, rx: 5, fill: pal.blue }, ph);
  el('rect', { x: -6, y: -11, width: 12, height: 19, rx: 2, fill: '#E4F1FF' }, ph);
  el('circle', { cx: 0, cy: 12, r: 2, fill: '#E4F1FF' }, ph);
  const vh = g({ transform: 'translate(20 2)' }, bub);
  el('rect', { x: -11, y: -22, width: 8, height: 26, rx: 4, fill: '#FFD7B5', stroke: '#E9B38A', 'stroke-width': 1.5, transform: 'rotate(-12 -7 4)' }, vh);
  el('rect', { x: 3, y: -22, width: 8, height: 26, rx: 4, fill: '#FFD7B5', stroke: '#E9B38A', 'stroke-width': 1.5, transform: 'rotate(12 7 4)' }, vh);
  el('rect', { x: -13, y: -2, width: 26, height: 20, rx: 9, fill: '#FFD7B5', stroke: '#E9B38A', 'stroke-width': 1.5 }, vh);
  k.text(44, -6, '2', { 'font-size': 20, fill: pal.coralDark }, bub);

  return {
    update(t) {
      // ---- 客：電話を取り出して耳に当て、話す。終わったら喜ぶ ----
      const up = easeInOut(seg(t, 0.7, 1.2));
      const down = easeInOut(seg(t, 2.5, 2.95));
      const calling = t > 1.15 && t < 2.5;
      const talk = calling && Math.floor((t - 1.15) / 0.17) % 2 === 0;
      const arm = lerp(8, 148, up) * (1 - down) + 8 * down + (calling ? 5 * Math.sin(t * 9) : 0);
      const happy = t >= 2.6;
      const hop = happy ? 9 * Math.abs(Math.sin((t - 2.6) * 7)) * (1 - seg(t, 2.6, 4.0) * 0.5) : 0;
      b.pose({
        armR: arm,
        armL: 8,
        look: 0.7,
        lean: calling ? 3 : 0,
        mood: happy ? 'grin' : talk ? 'open' : 'smile',
        lift: hop
      });
      const hp = b.handPos('R');
      tf(phone, hp.x + 3, hp.y - 4 - hop, 20 * up * (1 - down) - 0, 1, 1);
      phone.setAttribute('opacity', 1);
      waves.forEach((w, i) => w.setAttribute('opacity', calling ? 0.35 + 0.65 * Math.abs(Math.sin(t * 9 - i * 1.2)) : 0));

      // ---- 吹き出し ----
      const bp = seg(t, 1.25, 1.55);
      const bs = bp <= 0 ? 0 : backOut(bp, 1.8);
      tf(bub, 136, 82, 0, bs, bs);
      bub.setAttribute('opacity', t < 1.25 ? 0 : 1 - seg(t, 2.35, 2.65));
      tf(vh, 20, 2 + 2 * Math.sin((t - 1.5) * 8), 0, 1, 1);

      // ---- 札：ぽんと現れる ----
      const cp = seg(t, 2.35, 2.7);
      const cs = cp <= 0 ? 0 : backOut(cp, 2.4);
      const land = t >= 2.7 ? wobble(seg(t, 2.7, 3.3), 2.5, 5) : 0;
      tf(card, TX, TY + 3 - 14 * (1 - easeOut(cp)), 0, cs * (1 + 0.05 * land), cs * (1 - 0.08 * land));
      const gp = easeOut(seg(t, 2.5, 3.1));
      k.set(glow, { opacity: 0.32 * gp, rx: 36 + 26 * gp });
      const kp = seg(t, 2.85, 3.2);
      const ks = kp <= 0 ? 0 : backOut(kp, 2.4);
      tf(check, TX + 62, TY - 44, 0, ks, ks);
      sparks.forEach((q, i) => {
        const u = seg(t, 3.0 + i * 0.1, 3.45 + i * 0.1);
        const sc = u <= 0 ? 0 : u >= 1 ? 0.85 + 0.15 * Math.sin(t * 8 + i) : easeOut(u);
        tf(q.s, q.x, q.y, t * 40, sc, sc);
      });
    }
  };
}
