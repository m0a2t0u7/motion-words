// check out：カードキーを返して精算し、スーツケースを引いて出口へ向かう（例文 You need to check out by 11 a.m.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '鍵を返す'], [1.5, '精算する'], [2.7, 'ホテルを出る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  // ロビー：床のラグ・玄関ドア・看板・時計
  el('rect', { x: 0, y: FY + 8, width: 400, height: 52, fill: '#F2E6DC' });
  el('rect', { x: 14, y: 100, width: 84, height: 142, rx: 8, fill: '#8F9BB0' });
  el('rect', { x: 20, y: 106, width: 72, height: 130, rx: 5, fill: k.gradient([[0, '#BFE5F8'], [1, '#E8F6EC']]) });
  el('line', { x1: 56, y1: 106, x2: 56, y2: 236, stroke: '#FFFFFF', 'stroke-width': 3 });
  el('rect', { x: 26, y: 78, width: 60, height: 16, rx: 5, fill: pal.green });
  k.text(56, 86.5, 'EXIT', { 'font-size': 10, fill: '#FFFFFF' });
  el('rect', { x: 102, y: 28, width: 120, height: 36, rx: 10, fill: pal.blueDark });
  el('rect', { x: 106, y: 32, width: 112, height: 28, rx: 7, fill: pal.blue });
  k.text(162, 47, 'HOTEL', { 'font-size': 22, fill: '#FFFFFF' });
  const clock = g({});
  el('circle', { cx: 0, cy: 0, r: 25, fill: '#FFFFFF', stroke: pal.ink, 'stroke-width': 3.5 }, clock);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, big = i % 3 === 0; el('line', { x1: Math.sin(a) * (big ? 17 : 19), y1: -Math.cos(a) * (big ? 17 : 19), x2: Math.sin(a) * 22, y2: -Math.cos(a) * 22, stroke: pal.sub, 'stroke-width': big ? 2.6 : 1.6, 'stroke-linecap': 'round' }, clock); }
  const hH = g({}, clock), mH = g({}, clock);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -11, stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }, hH);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -18, stroke: pal.coralDark, 'stroke-width': 2.8, 'stroke-linecap': 'round' }, mH);
  el('circle', { cx: 0, cy: 0, r: 3, fill: pal.ink }, clock);
  tf(clock, 250, 62);
  // 人物：フロント係（机の向こう側）、宿泊客
  const S = 0.9;
  const staff = k.buddy({ x: 336, y: FY - 14, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  staff.g.firstChild.setAttribute('display', 'none');
  const guest = k.buddy({ x: 192, y: FY, scale: S });
  // スーツケース（引いて歩く）
  const bag = g({});
  const bshadow = k.shadow(0, 0, 24, 4, bag);
  el('rect', { x: -19, y: -46, width: 38, height: 42, rx: 8, fill: pal.violet }, bag);
  el('rect', { x: -19, y: -46, width: 38, height: 9, rx: 6, fill: '#8A6FE0' }, bag);
  el('rect', { x: -10, y: -34, width: 4, height: 26, rx: 2, fill: '#FFFFFF', opacity: 0.35 }, bag);
  el('rect', { x: 4, y: -34, width: 4, height: 26, rx: 2, fill: '#FFFFFF', opacity: 0.35 }, bag);
  el('circle', { cx: -12, cy: -2, r: 3.5, fill: pal.ink }, bag);
  el('circle', { cx: 12, cy: -2, r: 3.5, fill: pal.ink }, bag);
  const handle = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: '#8F9BB0', 'stroke-width': 3.5, 'stroke-linecap': 'round' });
  // フロントの机（人物の下半身を隠す）
  const DY = 192;
  k.shadow(326, 254, 104, 6);
  const deskTop = el('rect', { x: 236, y: DY, width: 164, height: 14, rx: 4, fill: '#F0D9B8' });
  el('rect', { x: 236, y: DY + 14, width: 164, height: 46, fill: pal.wood });
  el('rect', { x: 236, y: DY + 14, width: 164, height: 4, fill: pal.woodDark, opacity: 0.4 });
  el('rect', { x: 244, y: DY + 60, width: 10, height: 6, rx: 2, fill: pal.woodDark });
  el('rect', { x: 382, y: DY + 60, width: 10, height: 6, rx: 2, fill: pal.woodDark });
  // カードキー（部屋番号つき）
  const card = g({});
  el('rect', { x: -19, y: -12, width: 38, height: 25, rx: 4, fill: 'rgba(40,52,70,0.14)' }, card);
  el('rect', { x: -20, y: -14, width: 38, height: 25, rx: 4, fill: '#FFFFFF', stroke: pal.blueDark, 'stroke-width': 2 }, card);
  el('rect', { x: -20, y: -14, width: 38, height: 7, rx: 3, fill: pal.blue }, card);
  k.text(0, 3, '305', { 'font-size': 12, fill: pal.ink }, card);

  // 精算のレシート＋✓
  const bill = g({});
  el('rect', { x: -15, y: -20, width: 30, height: 40, rx: 3, fill: '#FFFFFF', stroke: pal.sub, 'stroke-width': 2 }, bill);
  [-12, -6, 0].forEach((y) => el('rect', { x: -9, y, width: 18, height: 2.6, rx: 1.3, fill: pal.line }, bill));
  el('circle', { cx: 0, cy: 11, r: 6.5, fill: pal.green }, bill);
  el('path', { d: 'M -3 11 L -1 13.2 L 3.2 8.4', stroke: '#FFFFFF', 'stroke-width': 1.9, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, bill);
  return {
    update(t) {
      tf(hH, 0, 0, 325); tf(mH, 0, 0, 300); // 10時50分（11時前）
      // 客：カードキーを机に置く → 向きを変えて出口へ
      const turn = t > 2.6;
      const walk = easeInOut(seg(t, 2.7, 4.2));
      const gx = lerp(192, 54, walk);
      const walking = walk > 0 && walk < 1;
      const put = hump(seg(t, 0.2, 1.0));
      const gArm = turn ? 8 : lerp(8, 92, easeOut(seg(t, 0.15, 0.55))) * (1 - easeInOut(seg(t, 1.0, 1.3))) + 8 * easeInOut(seg(t, 1.0, 1.3));
      guest.pose({
        x: gx, facing: turn ? -1 : 1, armR: gArm, armL: turn ? 38 : 38, walk: walking ? (t - 2.7) * 10 : 0,
        look: 0.5, lean: walking ? 4 : 0, mood: turn ? 'smile' : 'smile'
      });
      const side = lerp(-76, 76, easeInOut(seg(t, 2.4, 2.85)));
      const bx = gx + side;
      tf(bag, bx, FY + 1);
      const hl = guest.handPos('L');
      k.set(handle, { x1: bx + (side > 0 ? -8 : 8), y1: FY - 48, x2: hl.x + (side > 0 ? -2 : 2), y2: hl.y });
      // フロント係：受け取ってレジを打つ
      const sArm = lerp(8, 88, easeOut(seg(t, 0.8, 1.2))) * (1 - easeInOut(seg(t, 1.4, 1.8))) + 8 * easeInOut(seg(t, 1.4, 1.8)) + (t > 3.3 ? 100 * hump(seg(t, 3.3, 4.2)) + 0 : 0);
      staff.pose({ x: 336, y: FY - 14, armR: sArm, armL: 8, look: -0.3, mood: 'smile', lean: 2 * hump(seg(t, 0.9, 1.5)) });
      // カードキー：客の手 → 机の上 → 係の手元
      const gh = guest.handPos('R'), sh = staff.handPos('R');
      let cx, cy;
      if (t < 0.6) { cx = gh.x + 8; cy = gh.y - 2; }
      else if (t < 1.3) { const q = easeInOut(seg(t, 0.6, 1.3)); cx = lerp(gh.x + 8, 262, q); cy = lerp(gh.y - 2, DY + 6, q); }
      else { const q = easeInOut(seg(t, 1.3, 1.9)); cx = lerp(262, 304, q); cy = DY + 6; }
      card.setAttribute('opacity', t < 1.9 ? 1 : 0);
      tf(card, cx, cy, -6 * seg(t, 0.6, 1.3));
      // 精算：レシートが✓付きで現れる
      const bp = Math.max(0.001, backOut(seg(t, 1.7, 2.1), 1.6));
      bill.setAttribute('opacity', t > 1.7 ? 1 : 0);
      tf(bill, 296, DY - 28, 0, bp, bp);
    }
  };
}
