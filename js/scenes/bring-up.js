// bring up：会議で1人が手を挙げ、「!」の議題カードをテーブルの真ん中に出すと、全員がそれを見る（例文 She brought up the problem at the meeting.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '会議中'], [1.0, '話題を出す'], [2.6, 'みんなが見る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 140, y: 30, width: 120, height: 70, rx: 6, fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 3 });
  [0, 1, 2].forEach((i) => el('rect', { x: 154, y: 44 + i * 16, width: 60 + (i % 2) * 20, height: 5, rx: 2.5, fill: pal.line }));
  const S = 0.9, BY = FY - 32;
  const A = k.buddy({ x: 72, y: BY, scale: S, color: pal.mint, dark: pal.mintDark });
  const B = k.buddy({ x: 200, y: BY, scale: S, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const C = k.buddy({ x: 328, y: BY, scale: S, color: pal.blue, dark: pal.blueDark, facing: -1 });
  [A, B, C].forEach((m) => m.g.firstChild.setAttribute('display', 'none'));
  // 会議テーブル（手前側。足元を隠す）
  const TY = 186;
  k.shadow(200, 258, 176, 7);
  el('rect', { x: 24, y: TY, width: 352, height: 22, rx: 8, fill: '#F0D9B8' });
  el('rect', { x: 24, y: TY + 22, width: 352, height: 44, fill: pal.wood });
  el('rect', { x: 24, y: TY + 22, width: 352, height: 4, fill: pal.woodDark, opacity: 0.4 });
  el('rect', { x: 36, y: TY + 66, width: 12, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 352, y: TY + 66, width: 12, height: 8, rx: 3, fill: pal.woodDark });
  // テーブルの上の小物（ノート・カップ）
  [[118, 0], [282, 1]].forEach(([x, i]) => { el('rect', { x: x - 16, y: TY + 6, width: 32, height: 10, rx: 2, fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 1.5 }); });
  el('rect', { x: 52, y: TY + 3, width: 12, height: 11, rx: 3, fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 1.5 });
  el('rect', { x: 336, y: TY + 3, width: 12, height: 11, rx: 3, fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 1.5 });
  // 議題カード（テーブルの真ん中）
  const card = g({});
  el('rect', { x: -22, y: -12, width: 48, height: 32, rx: 5, fill: 'rgba(40,52,70,0.15)' }, card);
  el('rect', { x: -24, y: -15, width: 48, height: 32, rx: 5, fill: '#FFF3CF', stroke: pal.yellowDark, 'stroke-width': 2.5 }, card);
  k.text(0, 2, '!', { 'font-size': 26, fill: pal.red }, card);
  const bub = g({});
  el('circle', { cx: 0, cy: 0, r: 16, fill: pal.red }, bub);
  k.text(0, 1.5, '!', { 'font-size': 24, fill: '#FFFFFF' }, bub);
  el('path', { d: 'M -5 14 L 0 22 L 5 14 Z', fill: pal.red }, bub);

  const CX = 200, CY = TY + 11;
  return {
    update(t) {
      // A：手を挙げる → カードを差し出して置く
      const up = easeOut(seg(t, 0.8, 1.2)) * (1 - easeInOut(seg(t, 1.45, 1.7)));
      const reach = easeInOut(seg(t, 1.5, 1.8)) * (1 - easeInOut(seg(t, 2.35, 2.75)));
      const aArm = lerp(8, 172, up) * (1 - reach) + reach * 92 + (up === 0 && reach === 0 ? 0 : 0);
      const talk = t < 0.8 ? Math.sin(t * 12) > 0 : false;
      const watch = easeInOut(seg(t, 2.4, 2.8));
      A.pose({ x: 72, y: BY, armR: lerp(8, aArm, 1), armL: 8, look: lerp(0.4, 1, watch), lean: 4 * reach, mood: t < 0.8 ? (talk ? 'open' : 'smile') : 'smile' });
      B.pose({ x: 200, y: BY, armR: 8, armL: 8, look: lerp(0, 0.0, watch), lean: 5 * watch, squash: 1 - 0.03 * watch, mood: watch > 0.5 ? 'open' : (t < 0.8 && Math.sin(t * 9 + 2) > 0.2 ? 'open' : 'smile') });
      C.pose({ x: 328, y: BY, armR: 8, armL: 8, look: lerp(-0.3, -1, watch), lean: 3 * watch, mood: watch > 0.5 ? 'open' : 'smile' });
      // カード：Aの手 → テーブルの真ん中
      const hp = A.handPos('R');
      const q = easeInOut(seg(t, 1.8, 2.45));
      const cx = lerp(hp.x + 14, CX, q), cy = lerp(hp.y + 4, CY, easeOut(seg(t, 1.8, 2.4))) - hump(q) * 22;
      card.setAttribute('opacity', t > 1.5 ? 1 : 0);
      const land = t > 2.45 ? 1 + 0.12 * wobble(seg(t, 2.45, 2.9), 2, 5) : 1;
      tf(card, cx, cy, lerp(8, 0, q), land, land);
      // 「!」の吹き出し
      const bp = Math.max(0.001, backOut(seg(t, 2.5, 2.85), 1.8));
      bub.setAttribute('opacity', t > 2.5 ? 1 : 0);
      tf(bub, CX, 100, 0, bp, bp);
    }
  };
}
