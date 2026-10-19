// medicine：医者が薬のびんを渡し、「毎食後に飲む」（ごはん→薬 ×朝・昼・夜）と伝える（例文 The doctor told me to take this medicine after every meal.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, backOut } from '../ease.js';
import { P, reach, hp, coat, clinicBg, bottle, gait } from './hospital.js';
import { desk } from './get-on-with.js';
import { say } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '薬を渡す'], [1.6, '毎食後に'], [3.2, '薬を受け取った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = clinicBg(k, 240);
  const doc = k.buddy({ x: 282, y: FY, scale: 0.95, facing: -1, color: pal.coral, dark: pal.coralDark });
  coat(k, doc);
  const TY = desk(k, 208, 150, FY);
  const me = k.buddy({ x: 150, y: FY, scale: 0.95 });
  const bt = bottle(k, null);
  // 吹き出し：（ごはん → 薬）を朝・昼・夜の3行
  const bub = say(k, 132, 96, -1);
  const rows = ['sun', 'noon', 'moon'].map((kind, i) => {
    const r = g({}, bub.g); tf(r, 0, -28 + i * 28);
    const ic = g({}, r); tf(ic, -46, 0);
    if (kind === 'moon') { el('circle', { r: 8, fill: pal.yellow }, ic); el('circle', { cx: 4, cy: -3, r: 7, fill: '#fff' }, ic); }
    else { el('circle', { r: kind === 'sun' ? 6 : 8, fill: kind === 'sun' ? '#F2A65A' : pal.yellow }, ic); if (kind === 'sun') el('rect', { x: -10, y: 3, width: 20, height: 3, fill: pal.sub }, ic); }
    el('ellipse', { cx: -14, cy: 3, rx: 13, ry: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, r);
    el('path', { d: 'M -22 2 Q -14 -10 -6 2 Z', fill: '#F4D27A' }, r);
    el('path', { d: 'M 6 0 L 18 0 M 14 -4 L 18 0 L 14 4', stroke: pal.sub, 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }, r);
    const mb = bottle(k, r); tf(mb, 36, 9, 0, 0.5);
    return r;
  });
  return {
    update(t) {
      // びん：机→医者の手→患者の手
      const pick = easeInOut(seg(t, 0.2, 0.6)), pass = easeInOut(seg(t, 0.7, 1.5)), lift = easeOut(seg(t, 3.0, 3.5));
      const meet = { x: 228, y: FY - 66 };
      const xf = (u) => lerp(150, 176, easeInOut(seg(u, 0.3, 1.0))) - 26 * easeInOut(seg(u, 2.0, 2.7));
      const gw = gait(xf, t, 150);
      P(me, { x: gw.x, walk: gw.walk, look: 0.6, mood: t > 3.2 ? 'grin' : 'smile', lean: 4 * pass * (1 - lift) });
      const mineA = reach(me, 0.95, 'R', meet.x, meet.y);
      P(me, { ...me.state, armR: t < 1.0 ? lerp(8, mineA, seg(t, 0.7, 1.4)) : lerp(lerp(8, mineA, seg(t, 0.7, 1.4)), 120, lift) });
      const myH = hp(me, 0.95, 'R', 28);
      let pos;
      const desk0 = { x: 250, y: TY };
      P(doc, { facing: -1, look: 0.5, mood: 'smile', lean: 14 * pass * (1 - seg(t, 1.5, 1.9)) });
      if (t < 0.6) pos = { x: desk0.x, y: lerp(desk0.y, desk0.y - 12, pick) };
      else if (t < 1.55) pos = { x: lerp(desk0.x, meet.x + 6, pass), y: lerp(desk0.y - 12, meet.y + 10, pass) };
      else pos = { x: myH.x + 4, y: myH.y + 10 };
      const docAim = t < 1.6 ? reach(doc, 0.95, 'R', pos.x + 4, pos.y - 6) : 8;
      P(doc, { ...doc.state, armR: t < 0.2 ? lerp(8, reach(doc, 0.95, 'R', desk0.x, desk0.y - 6), seg(t, 0, 0.2)) : t < 1.6 ? docAim : lerp(docAim, 8, seg(t, 1.6, 2.0)), armL: t > 1.6 ? 8 + 30 * hump(seg(t, 1.8, 3.0)) : 8 });
      tf(bt, pos.x, pos.y, 0, 0.85);
      bub.show(seg(t, 1.6, 1.9), 296, 82);
      rows.forEach((r, i) => r.setAttribute('opacity', seg(t, 1.9 + i * 0.35, 2.2 + i * 0.35)));
    }
  };
}
