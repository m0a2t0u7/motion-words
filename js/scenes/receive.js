// receive：配達の人が手紙を差し出し、受け取って封を開ける（例文 I received a letter from my friend.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { hp, reach, gait, streetBg, heart } from './weigh.js';

export const meta = { duration: 4.8, beats: [[0, '手紙が来る'], [1.9, '受け取る'], [3.7, '開けて喜ぶ']] };

function env(k, parent, open) {
  const e = k.g({}, parent);
  k.el('rect', { x: -15, y: -10, width: 30, height: 20, rx: 3, fill: '#fff', stroke: '#C9D1DD', 'stroke-width': 1.6 }, e);
  const fl = k.el('path', { d: 'M -15 -10 L 0 3 L 15 -10', fill: '#F3F6FA', stroke: '#C9D1DD', 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, e);
  const hr = k.g({}, e); k.tf(hr, 0, 3, 0, 0.8); heart(k, hr);
  return { e, fl, hr };
}
export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  // 郵便ポスト
  el('rect', { x: 340, y: FY - 70, width: 34, height: 70, rx: 8, fill: pal.red });
  el('rect', { x: 346, y: FY - 56, width: 22, height: 5, rx: 2.5, fill: '#8F2F27' });
  k.shadow(357, FY, 24, 4);
  const S = 1.1;
  const me = k.buddy({ x: 190, y: FY, scale: S });
  const pm = k.buddy({ x: 400, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const L = env(k, g({}));
  const lg = L.e;
  const note = g({}); tf(note, 0, 0);
  el('rect', { x: -14, y: -13, width: 28, height: 22, rx: 2, fill: '#fff', stroke: '#C9D1DD', 'stroke-width': 1.5 }, note);
  [-6, -1, 4].forEach((y) => el('rect', { x: -9, y, width: 18, height: 2, rx: 1, fill: '#9AA6B8' }, note));
  const hs = [0, 1, 2].map(() => heart(k, g({}), pal.red).parentNode);
  return {
    update(t) {
      // 配達員が歩いて来て、手紙を差し出す
      const px = (tt) => lerp(430, 296, easeInOut(seg(tt, 0.1, 1.5)));
      const gt = gait(px, t, 430);
      const leave = easeInOut(seg(t, 3.0, 4.2));
      const x2 = lerp(gt.x, 380, leave);
      const wl = leave > 0 ? gait((tt) => lerp(296, 460, easeInOut(seg(tt, 3.0, 4.6))), t, 296) : gt;
      const give = easeInOut(seg(t, 1.3, 1.9)), take = easeInOut(seg(t, 1.8, 2.3));
      pm.pose({ x: leave > 0 ? wl.x : gt.x, walk: leave > 0 ? wl.walk : gt.walk, armL: gt.armL, lean: gt.lean, facing: leave > 0 ? 1 : -1, look: 0.4, mood: 'grin' });
      pm.pose({ armR: 0 });
      const pmAim = reach(pm, S, 'R', 243, 180);
      pm.pose({ armR: t < 1.3 ? gt.armR : t < 3.0 ? lerp(gt.armR, pmAim, give) : wl.armR });
      // 自分：両手を差し出して受け取る
      me.pose({ armR: 0 });
      const mAim = reach(me, S, 'R', 243, 182);
      const read = easeInOut(seg(t, 2.6, 3.2));
      const open = easeOut(seg(t, 3.3, 3.8));
      me.pose({ armR: t < 1.7 ? 8 : lerp(8, mAim, easeInOut(seg(t, 1.7, 2.1))), armL: 8, look: 0.5, mood: t < 3.4 ? 'smile' : 'open', lean: 2 });
      if (t >= 2.4) me.pose({ armR: lerp(mAim, 70, read), lean: 2 + 4 * read });
      const ph = hp(pm, S, 'R', 30), mh = hp(me, S, 'R', 30);
      const pos = t < 1.95 ? ph : mh;
      tf(lg, pos.x + (t >= 1.95 ? 4 : 0), pos.y - 2, t >= 2.4 ? lerp(0, -14, read) : 0);
      L.fl.setAttribute('d', `M -15 -10 L 0 ${lerp(3, -22, open)} L 15 -10`);
      L.hr.setAttribute('opacity', 1 - open);
      lg.setAttribute('opacity', 1);
      // 便せん：封を開けると出てくる
      tf(note, mh.x + 2, mh.y - 6 - 18 * easeOut(open), -10);
      note.setAttribute('opacity', open > 0 ? 1 : 0);
      lg.setAttribute('opacity', 1);
      // 喜びのハート
      hs.forEach((h, i) => { const p = seg(t, 3.7 + i * 0.25, 4.6 + i * 0.1); tf(h, me.state.x - 24 + i * 24, 130 - 30 * easeOut(p) - i * 6, 0, backOut(seg(p, 0, 0.3)) * 1.1); h.setAttribute('opacity', p > 0 && p < 1 ? 1 : p >= 1 ? 1 : 0); });
    }
  };
}
