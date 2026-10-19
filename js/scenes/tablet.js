// tablet：夜、ベッドで体を起こし、タブレット端末でニュースを読む。指でスワイプして次の記事へ（例文 I read the news on my tablet in bed.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, bed } from './hospital.js';

export const meta = { duration: 4.2, beats: [[0, 'ベッドで画面'], [1.6, 'スワイプ'], [3.0, 'ニュースを読む']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 246, mood: 'evening' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#E9E4F2' });
  el('rect', { x: 26, y: 36, width: 80, height: 64, rx: 6, fill: '#3E4870', stroke: '#fff', 'stroke-width': 5 });
  el('circle', { cx: 84, cy: 58, r: 9, fill: '#FFF3C4' }); el('circle', { cx: 89, cy: 55, r: 8, fill: '#3E4870' });
  // ナイトテーブルとランプ
  el('rect', { x: 330, y: FY - 64, width: 54, height: 64, rx: 4, fill: pal.wood });
  el('ellipse', { cx: 357, cy: FY - 120, rx: 60, ry: 50, fill: '#FFE9A8', opacity: 0.35 });
  el('rect', { x: 354, y: FY - 96, width: 6, height: 32, fill: pal.woodDark });
  el('path', { d: `M 340 ${FY - 96} L 374 ${FY - 96} L 366 ${FY - 120} L 348 ${FY - 120} Z`, fill: pal.yellow });
  // ベッド（頭板は左）
  const X0 = 100, MT = FY - 52;
  el('rect', { x: X0, y: MT - 64, width: 12, height: 116, rx: 5, fill: pal.woodDark });
  k.shadow(X0 + 110, FY + 1, 112, 4);
  el('rect', { x: X0, y: MT + 12, width: 220, height: 24, rx: 5, fill: pal.wood });
  el('rect', { x: X0 + 6, y: MT + 36, width: 9, height: 16, fill: pal.woodDark });
  el('rect', { x: X0 + 205, y: MT + 36, width: 9, height: 16, fill: pal.woodDark });
  el('rect', { x: X0 + 10, y: MT, width: 208, height: 16, rx: 7, fill: '#F4F8FC' });
  el('rect', { x: X0 + 14, y: MT - 46, width: 34, height: 50, rx: 10, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 });
  const S = 0.9;
  const me = k.buddy({ x: X0 + 70, y: MT + 8, scale: S });
  me.g.firstChild.setAttribute('display', 'none');
  // 掛け布団（腰から下）
  el('path', { d: `M ${X0 + 34} ${MT - 22} Q ${X0 + 160} ${MT - 40} ${X0 + 216} ${MT - 6} L ${X0 + 216} ${MT + 16} L ${X0 + 34} ${MT + 16} Z`, fill: pal.violet });
  el('path', { d: `M ${X0 + 150} ${MT - 30} q 30 6 50 20`, fill: 'none', stroke: '#fff', 'stroke-width': 3, opacity: 0.4 });
  // タブレット（画面はこちら向き）
  const tab = g({});
  el('rect', { x: -32, y: -24, width: 64, height: 46, rx: 6, fill: pal.ink }, tab);
  const scr = g({ 'clip-path': k.clip((c) => el('rect', { x: -28, y: -20, width: 56, height: 38, rx: 2 }, c)) }, tab);
  el('rect', { x: -28, y: -20, width: 56, height: 38, fill: '#fff' }, scr);
  const pages = [0, 1].map((i) => {
    const p = g({}, scr);
    el('rect', { x: -24, y: -17, width: 48, height: 6, rx: 1, fill: i ? pal.blueDark : pal.coralDark }, p);
    el('rect', { x: -24, y: -8, width: 20, height: 18, rx: 2, fill: i ? '#BFE3B0' : '#CFE9F7' }, p);
    if (!i) el('path', { d: 'M -24 10 L -16 0 L -10 6 L -4 -2 L -4 10 Z', fill: '#9CC7F2' }, p);
    else el('circle', { cx: -14, cy: 1, r: 5, fill: pal.yellow }, p);
    [-7, -2, 3, 8].forEach((y) => el('rect', { x: 0, y, width: 24 - (y > 5 ? 8 : 0), height: 2.5, rx: 1, fill: '#C9D3E0' }, p));
    return p;
  });
  const glow = el('ellipse', { rx: 38, ry: 30, fill: '#CFE9F7', opacity: 0.25 });
  const finger = el('circle', { r: 5.5, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.5 });
  return {
    update(t) {
      const hx = X0 + 70 + 40, hy = MT + 8 - 30 * S;
      P(me, { look: 0.4, mood: t > 3.0 ? 'smile' : 'flat', armL: -40, armR: 30, lean: 3, blink: (t % 2.6) > 2.45 ? 1 : 0 });
      me.body.children[3].setAttribute('transform', 'translate(3 3)');
      tf(tab, hx, hy, -6);
      tf(glow, hx - 10, hy - 12);
      // スワイプ：指が右→左、ページが入れ替わる
      const sw = easeInOut(seg(t, 1.6, 2.3));
      tf(pages[0], -60 * sw, 0); tf(pages[1], 60 - 60 * sw, 0);
      // 読み進め：ページが少し上へスクロール
      const sc = easeInOut(seg(t, 2.9, 3.8));
      tf(pages[1], 60 - 60 * sw, -10 * sc);
      tf(pages[0], -60 * sw, -10 * easeInOut(seg(t, 0.5, 1.3)));
      const fx = t < 1.4 ? lerp(hx + 40, hx + 18, easeOut(seg(t, 1.0, 1.4))) : lerp(hx + 18, hx - 14, sw) + lerp(0, 34, easeInOut(seg(t, 2.4, 2.9)));
      const fy = hy + (t > 1.2 && t < 2.4 ? 0 : 6) - 2;
      tf(finger, fx, fy);
      finger.setAttribute('opacity', t > 0.9 && t < 3.0 ? 1 : 0);
    }
  };
}
