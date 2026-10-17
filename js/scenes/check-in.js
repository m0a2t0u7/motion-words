// check in：スーツケースを引いて到着し、フロントでカードキーを受け取る（例文 We checked in at the hotel at three.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '到着する'], [1.4, '手続きする'], [2.7, '部屋の鍵']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  // ロビー：床のラグ・玄関ドア・看板・時計
  el('rect', { x: 0, y: FY + 8, width: 400, height: 52, fill: '#F2E6DC' });
  el('rect', { x: 14, y: 100, width: 84, height: 142, rx: 8, fill: '#8F9BB0' });
  el('rect', { x: 20, y: 106, width: 72, height: 130, rx: 5, fill: k.gradient([[0, '#BFE5F8'], [1, '#E8F6EC']]) });
  el('line', { x1: 56, y1: 106, x2: 56, y2: 236, stroke: '#FFFFFF', 'stroke-width': 3 });
  el('rect', { x: 26, y: 78, width: 60, height: 16, rx: 5, fill: pal.green });
  k.text(56, 86.5, 'ENTRANCE', { 'font-size': 8.5, fill: '#FFFFFF' });
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
  const guest = k.buddy({ x: 60, y: FY, scale: S });
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

  const CARD_ON_DESK = [262, DY + 4];
  return {
    update(t) {
      tf(hH, 0, 0, 90); tf(mH, 0, 0, 0); // 3時
      // 到着：玄関から歩いてフロントへ
      const walk = easeInOut(seg(t, 0.1, 1.5));
      const gx = lerp(60, 192, walk);
      const walking = walk > 0 && walk < 1;
      const take = easeOut(seg(t, 2.55, 2.95));
      const hold = easeOut(seg(t, 3.0, 3.5));
      const gArm = lerp(8, 90, take) + 40 * hold;
      guest.pose({
        x: gx, armR: gArm, armL: 38 - 4 * Math.sin(t * 10) * (walking ? 1 : 0),
        walk: walking ? (t - 0.1) * 10 : 0, look: 0.5, lean: 4 * (walking ? 1 : 0) + 3 * take * (1 - hold),
        mood: t > 3.0 ? 'grin' : 'smile'
      });
      // スーツケースが後ろをついてくる
      const bx = gx - 76, bw = walking ? Math.sin(t * 20) * 1.2 : 0;
      tf(bag, bx, FY + 1 + bw);
      const hl = guest.handPos('L');
      k.set(handle, { x1: bx + 8, y1: FY - 48, x2: hl.x + 2, y2: hl.y });
      // フロント係：カードキーを差し出す
      const slide = easeInOut(seg(t, 1.55, 2.5));
      const sArm = lerp(8, 88, easeOut(seg(t, 1.3, 1.7))) - 36 * easeInOut(seg(t, 2.6, 3.1));
      staff.pose({ x: 336, y: FY - 14, armR: sArm, armL: 8, look: -0.3, mood: t < 1.5 ? 'flat' : 'smile', lean: 2 * hump(seg(t, 1.3, 2.0)) });
      // カードキー：係の手 → 机の上を滑る → 客の手
      const sh = staff.handPos('R'), gh = guest.handPos('R');
      const onDesk = seg(t, 1.55, 2.5);
      let cx = lerp(sh.x - 4, 250, easeInOut(onDesk)), cy = lerp(sh.y + 2, DY + 6, easeOut(seg(t, 1.55, 1.9)));
      if (t > 2.5) { const q = easeInOut(seg(t, 2.6, 3.0)); cx = lerp(250, gh.x + 6, q); cy = lerp(DY + 6, gh.y - 2, q); }
      if (t > 3.0) { const q = easeOut(seg(t, 3.0, 3.5)); cx = gh.x + 6 + 0 * q; cy = gh.y - 12 * q - 4; }
      const big = 1 + 0.3 * hump(seg(t, 3.0, 3.6)) + 0.25 * easeOut(seg(t, 3.0, 3.5));
      card.setAttribute('opacity', t >= 1.5 ? 1 : 0);
      tf(card, cx, cy, lerp(0, -8, onDesk * (t < 2.6 ? 1 : 0)) + (t > 3.0 ? -6 : 0), big, big);
    }
  };
}
