// as soon as possible：急ぎの用で相手に電話し、腕時計を指して「なるべく早く折り返して」と頼む。相手はうなずいてメモする（例文 Please call me back as soon as possible.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, clock } from './run-after.js';
import { officeBg } from './get-on-with.js';
import { hp } from './dig.js';
import { handset, cue, popS } from './from-scratch.js';

export const meta = { duration: 4.4, beats: [[0, '急ぎの電話'], [1.2, '早く折り返して'], [3.0, 'わかった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236, 40);
  const W = clock(k, 200, 54, 18);
  // 机の上の書類（急ぎ）
  const b = k.buddy({ x: 120, y: FY, facing: 1 });
  const ph = handset(k);
  // 右：電話を受ける相手（丸窓）
  const ins = g({});
  el('circle', { r: 50, fill: '#FFF3E6', stroke: '#fff', 'stroke-width': 5 }, ins);
  const fr = k.buddy({ x: 0, y: 46, scale: 0.7, color: pal.coral, dark: pal.coralDark, facing: -1, parent: ins });
  const fph = handset(k, ins);
  const memo = g({}, ins);
  el('rect', { x: -12, y: -8, width: 24, height: 16, rx: 2, fill: '#fff', stroke: pal.line }, memo);
  const mline = el('line', { x1: -8, y1: 0, x2: -8, y2: 0, stroke: pal.blueDark, 'stroke-width': 2 }, memo);
  el('circle', { r: 50, fill: 'none', stroke: pal.coralDark, 'stroke-width': 3 }, ins);
  tf(ins, 310, 150);
  // 吹き出し：折り返しの電話＋！
  const B = cue(k, '', 64, 36);
  const ic = g({}, B.inner);
  el('path', { d: 'M -20 -6 A 10 10 0 1 1 -6 8', stroke: pal.green, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, ic);
  el('path', { d: 'M -10 4 L -6 9 L -1 5', stroke: pal.green, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, ic);
  const icp = handset(k, ic); tf(icp.g, 6, 0, 0, 0.7);
  k.text(22, 0, '!', { 'font-size': 20, fill: pal.red }, ic);
  const ok = el('path', { d: 'M -8 0 L -2 6 L 9 -7', stroke: pal.green, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' });
  return {
    update(t) {
      const tm = 600 + 40 * t;
      W.set(Math.floor(tm / 60), tm % 60);
      // 自分：受話器を耳に、左手で時計を指して急かす
      const urge = seg(t, 1.0, 2.8);
      const tap = urge > 0 && urge < 1 ? hump((urge * 4) % 1) : 0;
      P(b, { x: 120, facing: 1, armR: 168, armL: t > 1.0 && t < 2.9 ? 150 + 8 * tap : 10, look: t > 1.0 && t < 2.9 ? -0.6 : 0.6, lean: 4 + 4 * tap, mood: t < 3.0 ? (Math.sin(t * 22) > 0 ? 'open' : 'flat') : 'smile', blink: blinkAt(t), lift: 3 * tap });
      const h = hp(b, 1);
      tf(ph.g, h.x - 2, h.y + 13, 10);
      ph.scr.setAttribute('fill', '#B8F0D8');
      B.show(170, 92, easeOut(seg(t, 1.2, 1.5)) * (1 - seg(t, 3.0, 3.2)));
      // 相手：受話器を持って聞く→うなずく→メモする
      const nod = seg(t, 2.9, 3.6), nd = nod > 0 && nod < 1 ? Math.max(0, Math.sin(nod * Math.PI * 4)) : 0;
      const write = seg(t, 3.5, 4.3);
      P(fr, { x: 0, y: 46, facing: -1, armR: 168, armL: write > 0 ? 70 + 6 * Math.sin(t * 30) : 20, look: -0.4, lean: 8 * nd, mood: t > 2.9 ? 'smile' : 'flat', blink: blinkAt(t, 1) });
      const fh = hp(fr, 0.7);
      tf(fph.g, fh.x + 2, fh.y + 9, -10, 0.7);
      tf(memo, -26, 20, 0, 1);
      k.set(mline, { x2: -8 + 16 * write });
      tf(ok, 360, 96, 0, popS(seg(t, 3.0, 3.3)));
    }
  };
}
