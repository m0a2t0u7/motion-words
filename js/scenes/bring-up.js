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

  const CX = 200, CY = TY + 2;
  const glow = el('ellipse', { cx: CX, cy: CY + 1, rx: 38, ry: 21, fill: 'none', stroke: '#FFC93C', 'stroke-width': 4, opacity: 0 });
  // glow は card より後ろに描きたいので先頭側へ
  card.parentNode.insertBefore(glow, card);
  return {
    update(t) {
      // A：手を挙げて発言（カードは誰にも渡さない）→ 中央にカードが現れて置かれる → 全員が注目
      const up = easeOut(seg(t, 0.7, 1.1)) * (1 - easeInOut(seg(t, 2.2, 2.6)));
      const talk = t > 0.9 && t < 2.2 ? Math.sin(t * 13) > 0 : false;
      const watch = easeInOut(seg(t, 2.3, 2.75));
      A.pose({ x: 72, y: BY, armR: lerp(8, 172, up), armL: 8, look: lerp(0.4, 1, watch), lean: 2 * watch, mood: talk ? 'open' : 'smile' });
      B.pose({ x: 200, y: BY, armR: 8, armL: 8, look: 0, lean: 7 * watch, squash: 1 - 0.03 * watch, mood: watch > 0.5 ? 'open' : 'smile' });
      C.pose({ x: 328, y: BY, armR: 8, armL: 8, look: lerp(-0.3, -1, watch), lean: 4 * watch, mood: watch > 0.5 ? 'open' : 'smile' });
      // カード：上からテーブル中央にすとんと置かれる
      const fall = seg(t, 1.9, 2.3);
      const cy = lerp(CY - 70, CY, easeIn(fall));
      const land = t > 2.3 ? 1 + 0.14 * wobble(seg(t, 2.3, 2.9), 2, 5) : 1;
      const sc = Math.max(0.001, easeOut(seg(t, 1.9, 2.05))) * land;
      card.setAttribute('opacity', t > 1.9 ? 1 : 0);
      tf(card, CX, cy, lerp(-10, 0, easeOut(fall)), sc, sc);
      // カードがぽっと光る
      const gl = t > 2.3 ? 0.95 * (0.6 + 0.4 * Math.sin((t - 2.3) * 7)) * easeOut(seg(t, 2.3, 2.5)) : 0;
      glow.setAttribute('opacity', gl);
      // 真ん中の人の頭上に出ると、その人が話題を出したように見えるため吹き出しは使わない
      bub.setAttribute('opacity', 0);
    }
  };
}
