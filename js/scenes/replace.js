// replace：リモコンの古い電池を取り出してごみ箱へ捨て、新しい電池を入れて点灯させる（例文 I need to replace the old battery.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump } from '../ease.js';
import { hp } from './dig.js';

export const meta = { duration: 5.0, beats: [[0, '古い電池'], [1.5, '外して新しく'], [4.0, '点灯した']] };

function battery(k, body, band, sign) {
  const n = k.g({});
  k.el('rect', { x: 20, y: -3.5, width: 4, height: 7, rx: 1.5, fill: '#C8CFD9' }, n);
  k.el('rect', { x: -20, y: -8, width: 41, height: 16, rx: 5, fill: body }, n);
  k.el('rect', { x: -20, y: -8, width: 14, height: 16, rx: 5, fill: band }, n);
  k.el('rect', { x: -12, y: -8, width: 6, height: 16, fill: band }, n);
  k.text(8, 0.5, sign, { 'font-size': 12, fill: '#fff' }, n);
  return n;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const S = 1.1, CX = 200;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 40, y: 40, width: 80, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const b = k.buddy({ x: CX, y: FY, scale: S });
  b.armL.a.setAttribute('display', 'none'); b.armR.a.setAttribute('display', 'none');
  el('path', { d: 'M 60 194 L 340 194 L 362 226 L 38 226 Z', fill: '#EBD2A6' });
  el('path', { d: 'M 60 194 L 340 194 L 341 197 L 59 197 Z', fill: '#fff', opacity: 0.5 });
  el('rect', { x: 38, y: 226, width: 324, height: 14, rx: 0, fill: '#D9B07C' });
  // ごみ箱
  el('rect', { x: 290, y: 190, width: 34, height: 30, rx: 5, fill: '#B9C4D2' });
  el('ellipse', { cx: 307, cy: 190, rx: 17, ry: 4, fill: '#6F7C8C' });
  // リモコン
  const RX = 150, RY = 198, RW = 112, RH = 26;
  el('rect', { x: RX + 2, y: RY + 3, width: RW, height: RH, rx: 8, fill: pal.shadow });
  el('rect', { x: RX, y: RY, width: RW, height: RH, rx: 8, fill: '#4A5568' });
  [0, 1, 2].forEach((i) => el('circle', { cx: RX + 14 + i * 14, cy: RY + 13, r: 4, fill: i === 0 ? pal.red : '#8896A9' }));
  const led = el('circle', { cx: RX + 58, cy: RY + 6, r: 3, fill: '#2E3745' });
  const glow = el('circle', { cx: RX + 58, cy: RY + 6, r: 0, fill: pal.green, opacity: 0.35 });
  el('rect', { x: RX + 66, y: RY + 3, width: 44, height: 20, rx: 4, fill: '#252C38' });
  const BAY = { x: RX + 88, y: RY + 13 };
  const oldB = battery(k, '#9AA3AF', '#7D8693', '−');
  const newB = battery(k, pal.green, pal.yellowDark, '+');
  const arm = (c, d) => ({ a: el('line', { stroke: d, 'stroke-width': 9 * S, 'stroke-linecap': 'round' }), h: el('circle', { r: 6.5 * S, fill: c, stroke: d, 'stroke-width': 2.5 * S }) });
  const AL = arm(pal.mint, pal.mintDark), AR = arm(pal.mint, pal.mintDark);
  const star = el('path', { d: 'M 0 -9 L 2.5 -2.5 L 9 0 L 2.5 2.5 L 0 9 L -2.5 2.5 L -9 0 L -2.5 -2.5 Z', fill: pal.yellow, opacity: 0 });
  const P = (a, b2, p) => ({ x: lerp(a.x, b2.x, p), y: lerp(a.y, b2.y, p) });
  return {
    update(t) {
      b.pose({ armR: 90, armL: 90, lean: 10, look: 0.3, mood: t > 3.9 ? 'grin' : 'smile', squash: 1 });
      const sL = hp(b, S, 'L', 0), sR = hp(b, S, 'R', 0);
      const restR = { x: CX + 44, y: 214 }, restL = { x: CX - 44, y: 214 };
      // 古い電池：ベイ → 手で引き出す → ごみ箱へ放る
      const bin = { x: 307, y: 196 };
      const pull = easeInOut(seg(t, 1.0, 1.5)), toss = seg(t, 1.6, 2.2);
      let o = { x: BAY.x - pull * 0 + 2 * 0, y: BAY.y }, ho = restR;
      let oPos = { x: BAY.x, y: BAY.y };
      if (t < 1.6) { oPos = { x: BAY.x, y: lerp(BAY.y, BAY.y - 24, pull) }; ho = P(restR, { x: BAY.x - 8, y: oPos.y + 2 }, easeOut(seg(t, 0.6, 1.0))); if (t > 1.0) ho = { x: BAY.x - 8, y: oPos.y + 2 }; }
      else if (t < 2.3) { oPos = { x: lerp(BAY.x, bin.x, easeOut(toss)), y: lerp(BAY.y - 24, bin.y, easeIn(toss)) - 40 * hump(toss) }; ho = P({ x: BAY.x - 8, y: BAY.y - 22 }, restR, easeOut(seg(t, 1.6, 2.1))); }
      else { oPos = { x: bin.x, y: bin.y }; ho = restR; }
      tf(oldB, oPos.x, oPos.y, t < 1.6 ? 0 : toss * 540, t < 2.2 ? 1 : 0.001);
      k.set(AR.a, { x1: sR.x, y1: sR.y, x2: ho.x, y2: ho.y }); k.set(AR.h, { cx: ho.x, cy: ho.y });
      // 新しい電池：机の左 → 左手で持ち上げて運ぶ → ベイへ入れる
      const NS = { x: 128, y: 214 }, up = easeInOut(seg(t, 2.3, 2.9)), carry = easeInOut(seg(t, 2.9, 3.5)), ins = easeInOut(seg(t, 3.5, 3.8));
      let nPos = NS, hn = restL;
      if (t < 2.3) { hn = P(restL, { x: NS.x + 10, y: NS.y - 2 }, easeOut(seg(t, 1.9, 2.3))); }
      else if (t < 2.9) { nPos = { x: NS.x, y: NS.y - 22 * up }; hn = { x: NS.x + 10, y: nPos.y - 2 }; }
      else if (t < 3.5) { nPos = P({ x: NS.x, y: NS.y - 22 }, { x: BAY.x, y: BAY.y - 24 }, carry); nPos.y -= 10 * hump(carry); hn = { x: nPos.x + 14, y: nPos.y - 4 }; }
      else if (t < 3.9) { nPos = { x: BAY.x, y: lerp(BAY.y - 24, BAY.y, ins) }; hn = { x: nPos.x - 10, y: nPos.y - 6 }; }
      else { nPos = { x: BAY.x, y: BAY.y }; hn = P({ x: BAY.x - 10, y: BAY.y - 6 }, restL, easeOut(seg(t, 3.9, 4.3))); }
      tf(newB, nPos.x, nPos.y, 0, 1);
      k.set(AL.a, { x1: sL.x, y1: sL.y, x2: hn.x, y2: hn.y }); k.set(AL.h, { cx: hn.x, cy: hn.y });
      // 点灯
      const on = easeOut(seg(t, 3.95, 4.3));
      k.set(led, { fill: on > 0.05 ? '#7BF0A0' : '#2E3745' });
      k.set(glow, { r: 9 * on * (1 + 0.1 * Math.sin(t * 8)), opacity: 0.5 * on });
      tf(star, RX + 80, RY - 12, 0, hump(seg(t, 4.0, 4.9)) * 1.1 + 0.001);
    }
  };
}
