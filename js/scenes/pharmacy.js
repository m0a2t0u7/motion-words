// pharmacy：薬の棚が並ぶ薬局。かぜぎみの客がお金を払い、薬剤師からかぜ薬の箱を受け取る（例文 You can buy cold medicine at the pharmacy.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, reach, hp, gait, coat, cross, bottle } from './hospital.js';
import { room } from './dig.js';
import { coin } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, '薬局に来る'], [1.6, 'お金を払う'], [2.8, 'かぜ薬を買った']] };

function medBox(k, parent) {
  const g = k.g({}, parent || k.root), pal = k.pal;
  k.el('rect', { x: -14, y: -20, width: 28, height: 20, rx: 2, fill: pal.blue }, g);
  k.el('rect', { x: -14, y: -20, width: 28, height: 5, fill: pal.blueDark }, g);
  const s = k.g({}, g); k.tf(s, -4, -8);
  [0, 60, 120].forEach((a) => k.el('line', { x1: 0, y1: -5, x2: 0, y2: 5, stroke: '#fff', 'stroke-width': 1.8, transform: `rotate(${a})` }, s));
  cross(k, 7, -8, 4, '#fff', g).querySelector('path').setAttribute('fill', pal.blue);
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const R = room(k, 'indoor');
  const FY = R.FY, TY = R.TY;
  // 棚（奥の壁）
  el('rect', { x: 150, y: 28, width: 240, height: 150, rx: 4, fill: '#F1E6D6' });
  [70, 116, 162].forEach((y) => el('rect', { x: 150, y, width: 240, height: 6, fill: pal.woodDark }));
  const cols = [pal.coral, pal.blue, pal.yellow, pal.violet, pal.green, '#F2A65A'];
  [70, 116, 162].forEach((y, r) => { for (let i = 0; i < 9; i++) { const x = 162 + i * 25; if ((i + r) % 3 === 0) bottle(k).setAttribute('transform', `translate(${x + 8} ${y}) scale(0.62)`); else el('rect', { x, y: y - 22 + (i % 2) * 4, width: 18, height: 22 - (i % 2) * 4, rx: 2, fill: cols[(i + r * 2) % 6] }); } });
  cross(k, 60, 52, 18, pal.green);
  const ph = k.buddy({ x: 282, y: FY, scale: 0.95, facing: -1, color: pal.coral, dark: pal.coralDark });
  coat(k, ph);
  const box = medBox(k);
  R.front();
  // レジ
  el('rect', { x: 318, y: TY - 26, width: 44, height: 26, rx: 4, fill: '#9AA6B6' });
  el('rect', { x: 324, y: TY - 22, width: 32, height: 9, rx: 2, fill: '#BFE8C9' });
  const me = k.buddy({ x: 40, y: FY + 8, scale: 1.0 });
  const scarf = g({}); me.body.insertBefore(scarf, me.armR.a.parentNode);
  el('rect', { x: -30, y: -40, width: 60, height: 9, rx: 4, fill: pal.yellow }, scarf);
  el('rect', { x: -14, y: -34, width: 9, height: 18, rx: 3, fill: pal.yellowDark }, scarf);
  const cn = coin(k);
  const xf = (t) => lerp(40, 168, easeInOut(seg(t, 0.1, 1.3)));
  return {
    update(t) {
      const p = gait(xf, t, 40);
      const pay = easeInOut(seg(t, 1.5, 2.0)), back = easeInOut(seg(t, 2.1, 2.4));
      const give = easeInOut(seg(t, 2.3, 3.0)), lift = easeOut(seg(t, 3.4, 3.9));
      const sniff = hump(seg(t % 1.5, 1.2, 1.4)) * (t < 1.4 ? 1 : 0);
      P(me, { x: p.x, y: FY + 8, walk: p.walk, armL: p.armL, lean: p.lean + 4 * sniff, look: 0.6, mood: t > 3.3 ? 'grin' : sniff > 0.3 ? 'open' : 'smile' });
      const payPt = { x: 232, y: TY - 8 }, meet = { x: 226, y: TY - 30 };
      let aim = 8;
      if (t > 1.3 && t < 2.4) aim = lerp(8, reach(me, 1, 'R', payPt.x, payPt.y), pay * (1 - back));
      if (t >= 2.4) aim = lerp(lerp(8, reach(me, 1, 'R', meet.x, meet.y), easeInOut(seg(t, 2.4, 2.9))), 125, lift);
      P(me, { ...me.state, armR: aim });
      const mh = hp(me, 1, 'R', 28);
      tf(cn, t < 2.05 ? mh.x : payPt.x, t < 2.05 ? mh.y : payPt.y + 2);
      cn.setAttribute('opacity', t > 1.4 && t < 2.6 ? 1 : 0);
      // 薬剤師：棚の箱を取って手渡す
      const shelf = { x: 300, y: 112 };
      const grab = easeInOut(seg(t, 0.4, 1.0)), bring = easeInOut(seg(t, 1.1, 1.6));
      let bp;
      if (t < 1.1) bp = { x: shelf.x, y: shelf.y };
      else if (t < 2.3) bp = { x: lerp(shelf.x, 254, bring), y: lerp(shelf.y, TY - 2, bring) };
      else if (t < 3.0) bp = { x: lerp(254, meet.x + 4, give), y: lerp(TY - 2, meet.y + 8, give) };
      else bp = { x: mh.x + 4, y: mh.y + 10 };
      P(ph, { facing: -1, look: 0.5, mood: 'smile', lean: 8 * give * (1 - seg(t, 3.0, 3.4)) });
      const ra = t < 1.1 ? lerp(8, reach(ph, 0.95, 'R', shelf.x, shelf.y), grab) : t < 3.0 ? reach(ph, 0.95, 'R', bp.x + 6, bp.y - 10) : lerp(reach(ph, 0.95, 'R', bp.x, bp.y), 8, seg(t, 3.0, 3.4));
      P(ph, { ...ph.state, armR: ra });
      tf(box, bp.x, bp.y, 0, 1);
    }
  };
}
