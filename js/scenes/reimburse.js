// reimburse：まめがタクシー代を立て替え、領収書を会社に出すと、同じ数のコインが戻ってくる（例文 The company will reimburse your travel expenses.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, hump, clamp } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '立て替える'], [1.6, '領収書を出す'], [3.0, '払い戻し']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 56, fill: '#E7ECF2' });

  // タクシー（右向き。運転席の窓に料金受け）
  const taxi = g({});
  k.shadow(60, FY + 4, 62, 6);
  el('path', { d: 'M 8 226 L 8 206 Q 8 196 20 196 L 36 196 L 50 176 Q 54 172 60 172 L 84 172 Q 90 172 94 178 L 104 196 L 112 196 Q 118 196 118 204 L 118 226 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linejoin': 'round' }, taxi);
  el('path', { d: 'M 56 180 L 82 180 L 92 196 L 44 196 Z', fill: '#E4F1FF' }, taxi);
  el('line', { x1: 68, y1: 180, x2: 68, y2: 196, stroke: pal.yellowDark, 'stroke-width': 3 }, taxi);
  el('rect', { x: 56, y: 164, width: 26, height: 10, rx: 4, fill: pal.ink }, taxi);
  k.text(69, 169.5, 'TAXI', { 'font-size': 8, fill: '#FFFFFF' }, taxi);
  [32, 94].forEach((x) => { el('circle', { cx: x, cy: 228, r: 13, fill: '#3A4356' }, taxi); el('circle', { cx: x, cy: 228, r: 5.5, fill: '#C9D0DA' }, taxi); });
  // 料金受け
  el('rect', { x: 100, y: 208, width: 26, height: 5, rx: 2.5, fill: '#8795AB' });
  el('rect', { x: 120, y: 202, width: 4, height: 8, rx: 2, fill: '#8795AB' });

  // 会社のビル
  const bld = g({});
  k.shadow(346, FY + 3, 58, 6);
  el('rect', { x: 300, y: 56, width: 92, height: 190, rx: 6, fill: '#DCE7F7' }, bld);
  el('rect', { x: 300, y: 56, width: 92, height: 22, rx: 6, fill: pal.blue }, bld);
  k.text(346, 67.5, 'COMPANY', { 'font-size': 12, fill: '#FFFFFF' }, bld);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) el('rect', { x: 312 + c * 26, y: 88 + r * 28, width: 16, height: 18, rx: 3, fill: (r + c) % 3 === 0 ? '#FFF2C4' : '#F4F8FE' }, bld);
  el('rect', { x: 330, y: 200, width: 32, height: 44, rx: 4, fill: pal.blueDark }, bld);
  // 受付の棚（領収書の置き場）と払い戻しの出口
  el('rect', { x: 266, y: 196, width: 36, height: 6, rx: 3, fill: pal.woodDark });
  el('rect', { x: 296, y: 190, width: 4, height: 14, rx: 2, fill: pal.woodDark });
  el('rect', { x: 296, y: 220, width: 16, height: 16, rx: 5, fill: '#4F5B70' });
  el('rect', { x: 296, y: 232, width: 20, height: 5, rx: 2.5, fill: '#8795AB' });

  const b = k.buddy({ x: 172, y: 262, scale: 0.85, facing: -1 });

  // コイン
  const coin = () => {
    const c = g({});
    el('circle', { r: 7, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, c);
    el('circle', { r: 3.4, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 1.6 }, c);
    return c;
  };
  const coins = [coin(), coin(), coin(), coin(), coin(), coin()];
  // 領収書
  const rc = g({});
  el('rect', { x: 3, y: -13, width: 22, height: 30, fill: pal.shadow }, rc);
  el('path', { d: 'M 0 -16 L 22 -16 L 22 16 L 18.3 13 L 14.7 16 L 11 13 L 7.3 16 L 3.7 13 L 0 16 Z', fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, rc);
  el('line', { x1: 4, y1: -9, x2: 18, y2: -9, stroke: pal.blue, 'stroke-width': 3, 'stroke-linecap': 'round' }, rc);
  [-2, 3, 8].forEach((y) => el('line', { x1: 4, y1: y, x2: 18, y2: y, stroke: '#C8D2E0', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, rc));
  const sparks = [[258, 168], [286, 150], [232, 150]].map(([x, y], i) => {
    const s = g({});
    el('path', { d: 'M 0 -8 Q 1.5 -1.5 8 0 Q 1.5 1.5 0 8 Q -1.5 1.5 -8 0 Q -1.5 -1.5 0 -8 Z', fill: i % 2 ? pal.yellow : pal.mint }, s);
    return { s, x, y };
  });

  const TRAY = [112, 205];
  const SHELF = [284, 188];
  const CHUTE = [304, 226];
  const arc = (p, q, u, h) => [lerp(p[0], q[0], u), lerp(p[1], q[1], u) - h * 4 * u * (1 - u)];

  return {
    update(t) {
      // ---- まめ ----
      const turn = t >= 1.6;
      const walkP = easeInOut(seg(t, 1.85, 2.5));
      const x = lerp(172, 205, walkP);
      const walking = t > 1.85 && t < 2.5;
      const w = walking ? (t - 1.85) * 9 : 0;
      let a;
      if (t < 1.6) a = lerp(8, 88, easeInOut(seg(t, 0.25, 0.85))) * (1 - easeInOut(seg(t, 1.35, 1.6))) + 8 * easeInOut(seg(t, 1.35, 1.6));
      else if (t < 2.85) a = lerp(8, 80, easeInOut(seg(t, 1.65, 2.3))) * (1 - easeInOut(seg(t, 2.65, 2.85))) + 40 * easeInOut(seg(t, 2.65, 2.85));
      else a = lerp(40, 62, easeInOut(seg(t, 2.85, 3.2))) + 4 * Math.sin(Math.max(0, t - 3.6) * 9);
      const happy = t >= 3.7;
      b.pose({
        x, facing: turn ? 1 : -1, walk: w, armR: a, armL: happy ? 140 + 12 * Math.sin((t - 3.7) * 12) : walking ? 8 - Math.sin(w) * 14 : 8,
        look: 0.9, mood: happy ? 'grin' : 'smile',
        lift: happy ? 7 * Math.abs(Math.sin((t - 3.7) * 7)) * (1 - seg(t, 3.7, 4.4)) : 0
      });
      const hp = b.handPos('R');
      const bob = walking ? Math.abs(Math.sin(w)) * 3 * 0.85 : 0;
      const hand = [hp.x, hp.y - bob];

      // ---- コイン：手から出る3枚（タクシーの受け皿に残る）と、会社から戻る3枚 ----
      const stackAt = (i) => [hand[0] + 1, hand[1] - 9 - i * 6];
      coins.forEach((c, n) => {
        const i = n % 3;
        let pos, sc = 1, vis = 1;
        if (n < 3) {
          const out = 0.95 + 0.2 * i;
          const held = stackAt(i);
          if (t < out) pos = held;
          else if (t < out + 0.4) pos = arc(held, [TRAY[0], TRAY[1] - 6 - i * 5], easeOut(seg(t, out, out + 0.4)), 24);
          else pos = [TRAY[0], TRAY[1] - 6 - i * 5];
          if (t < 0.25 && false) vis = 0;
        } else {
          const back = 3.0 + 0.22 * i;
          const u = seg(t, back, back + 0.55);
          if (t < back) { vis = 0; pos = [CHUTE[0], CHUTE[1]]; }
          else if (u < 0.28) { pos = [CHUTE[0] + 8 * u / 0.28, CHUTE[1] + 4 - 12 * hump(u / 0.28)]; sc = 0.4 + 0.6 * (u / 0.28); }
          else pos = arc([CHUTE[0] + 8, CHUTE[1] + 4], stackAt(i), easeInOut((u - 0.28) / 0.72), 30);
        }
        c.setAttribute('opacity', vis);
        tf(c, pos[0], pos[1], 0, sc, sc);
      });
      // ---- 領収書 ----
      const rp = backOut(seg(t, 1.65, 1.85), 2);
      let rpos = [hand[0] - 1, hand[1] - 14], rrot = -12, rsc = rp;
      if (t >= 2.55) {
        const u = easeInOut(seg(t, 2.55, 2.9));
        rpos = [lerp(hand[0] - 1, SHELF[0] - 11, u), lerp(hand[1] - 14, SHELF[1] + 5, u)];
        rrot = lerp(-12, 0, u);
      }
      if (t < 1.65) rsc = 0;
      tf(rc, rpos[0], rpos[1], rrot, rsc, rsc);

      // ---- きらきら ----
      sparks.forEach((q, i) => {
        const u = seg(t, 3.75 + i * 0.1, 4.2 + i * 0.1);
        const sc = u <= 0 ? 0 : u >= 1 ? 0.9 + 0.15 * Math.sin(t * 8 + i) : easeOut(u);
        tf(q.s, q.x, q.y, t * 40, sc, sc);
      });
    }
  };
}
