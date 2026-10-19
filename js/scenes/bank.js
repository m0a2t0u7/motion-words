// bank：財布を開けると空っぽ。銀行を思い浮かべ、通りの先の銀行へ歩き出す（例文 I need to go to the bank.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, held, reach, P, blinkAt, signBoard } from './restaurant.js';
import { gait } from './dig.js';
import { streetBg } from './weigh.js';
import { cloud } from './look-over.js';
import { coin } from './get-on-with.js';

// 銀行の建物（柱と三角屋根）。原点＝床の中心
export function bankBuilding(k, cx, FY, s = 1, parent) {
  const g = k.g({}, parent), { el, pal } = k;
  k.tf(g, cx, FY, 0, s);
  el('rect', { x: -70, y: -104, width: 140, height: 104, fill: '#EEF1F6' }, g);
  el('path', { d: 'M -80 -104 L 0 -140 L 80 -104 Z', fill: '#C9D2DE' }, g);
  el('circle', { cx: 0, cy: -118, r: 8, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, g);
  el('rect', { x: -78, y: -106, width: 156, height: 8, fill: '#B8C2CE' }, g);
  [-54, -26, 26, 54].forEach((x) => el('rect', { x: x - 6, y: -96, width: 12, height: 82, fill: '#fff', stroke: '#D5DCE5', 'stroke-width': 1.5 }, g));
  el('rect', { x: -14, y: -60, width: 28, height: 46, rx: 2, fill: '#7C8BA0' }, g);
  el('rect', { x: -84, y: -14, width: 168, height: 7, fill: '#C9D2DE' }, g);
  el('rect', { x: -92, y: -7, width: 184, height: 7, fill: '#B8C2CE' }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '財布が空'], [1.4, '銀行に行かなきゃ'], [3.0, '銀行へ向かう']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.05, FY = 240;
  streetBg(k, FY);
  const bk = bankBuilding(k, 316, FY);
  signBoard(k, 316, 124, 60, 18, 'BANK', '#4A8BE0', '#fff', 11);
  const b = k.buddy({ x: 90, y: FY, scale: S });
  // 財布（2つ折り：左手に本体、右手でふたを開く）
  const wl = g({}); el('rect', { x: -12, y: -9, width: 24, height: 18, rx: 3, fill: pal.coffee }, wl); el('rect', { x: -9, y: -6, width: 18, height: 12, rx: 2, fill: '#6E4129' }, wl);
  const flap = g({}); el('rect', { x: -12, y: -9, width: 24, height: 18, rx: 3, fill: '#A87452' }, flap);
  const th = cloud(k, 96, 70, -1);
  const mini = g({}, th.g); bankBuilding(k, 0, 0, 0.36, mini); tf(mini, 0, 22);
  const cn = coin(k, th.g, 7); tf(cn, 30, -16);
  const xf = (t) => lerp(90, 220, easeInOut(seg(t, 2.6, 4.2)));
  return {
    update(t) {
      const gt = gait(xf, t, 90);
      const open = easeOut(seg(t, 0.3, 0.7)), close = easeInOut(seg(t, 2.2, 2.5));
      const shake = t > 0.8 && t < 1.4 ? Math.sin(t * 40) * 5 * hump(seg(t, 0.8, 1.4)) : 0;
      const hold = 1 - close;
      P(b, { x: gt.x, walk: gt.walk, lean: gt.lean + 6 * hold, look: t < 1.6 ? 0.2 : 0.8, blink: blinkAt(t), mood: t < 1.8 ? (t > 0.9 ? 'sad' : 'flat') : t > 2.6 ? 'smile' : 'flat', armL: lerp(gt.armL, 0, 0), armR: gt.armR });
      const P1 = bpPoint(b, S, 30, -18), Pw = { x: P1.x + shake, y: P1.y - 14 * hump(seg(t, 0.8, 1.4)) * 0.3 };
      if (hold > 0.02) {
        b.pose({ armL: lerp(gt.armL, reach(b, S, 'L', Pw.x - 8, Pw.y + 4), hold), armR: lerp(gt.armR, reach(b, S, 'R', Pw.x + 10 * (1 - open) + 14 * open, Pw.y - 2), hold) });
      }
      const hL = hp(b, S, 'L', 26), hR = hp(b, S, 'R', 26);
      tf(wl, hL.x + 6, hL.y - 2, shake);
      tf(flap, (hL.x + 6) + 0 * open, hL.y - 2, shake, Math.max(0.05, 1 - 1.9 * open), 1);
      // 空の財布から何も出てこない（ふり）。歩き出したら財布は手の中で小さく
      wl.setAttribute('opacity', hold > 0.1 ? 1 : 0); flap.setAttribute('opacity', hold > 0.1 ? 1 : 0);
      th.show(seg(t, 1.3, 1.6) * (1 - seg(t, 2.7, 2.9)), b.state.x + 70, 84);
      tf(bk, 316, FY, 0, 1);
    }
  };
}
function bpPoint(b, s, x, y) {
  const st = b.state;
  return { x: st.x + x * st.facing * s, y: st.y + (y - 10) * s };
}
