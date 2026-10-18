// put through：電話のまめが「部長につないで」と頼む。交換手がプラグを差し込み、電話の線が部長の机までつながって、部長が受話器を取る（例文 Could you put me through to the manager?）
import { seg, lerp, easeInOut, easeOut, hump, backOut, wobble } from '../ease.js';
import { hp } from './dig.js';
import { officeBg, desk, say } from './get-on-with.js';

export const meta = { duration: 4.6, beats: [[0, 'つないで？'], [1.6, 'プラグを差す'], [3.4, 'つながった']] };

function phone(k) {
  const g = k.g({});
  k.el('path', { d: 'M -10 -6 Q -12 6 -6 8 L 6 8 Q 12 6 10 -6 Z', fill: k.pal.ink }, g);
  k.el('rect', { x: -12, y: -12, width: 24, height: 7, rx: 3.5, fill: k.pal.ink }, g);
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236, 400);
  const S = 0.8;
  const me = k.buddy({ x: 50, y: FY - 4, scale: S });
  const op = k.buddy({ x: 214, y: FY - 4, scale: S, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const mg = k.buddy({ x: 350, y: FY - 4, scale: S, color: pal.coral, dark: pal.coralDark, facing: -1 });
  el('path', { d: 'M -4 -34 L 4 -34 L 6 -16 L 0 -10 L -6 -16 Z', fill: pal.blueDark }, mg.body);
  el('path', { d: 'M -26 -60 Q 0 -96 26 -60', stroke: pal.ink, 'stroke-width': 4, fill: 'none' }, op.body);
  el('circle', { cx: 26, cy: -54, r: 6, fill: pal.ink }, op.body);
  // 交換台（中央）
  el('rect', { x: 110, y: 120, width: 80, height: 116, rx: 4, fill: pal.woodDark });
  el('rect', { x: 118, y: 128, width: 64, height: 60, rx: 3, fill: '#5A4B3C' });
  const jacks = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { jacks.push([128 + c * 15, 140 + r * 18]); el('circle', { cx: 128 + c * 15, cy: 140 + r * 18, r: 3.5, fill: '#2A2A2A', stroke: '#B9A285', 'stroke-width': 1.5 }); }
  const lamp = el('circle', { cx: 173, cy: 176, r: 4, fill: '#7A6B5C' });
  desk(k, 300, 100, FY);
  const ph = phone(k), pm = phone(k);
  const base = g({}); tf(base, 330, FY - 46); el('rect', { x: -14, y: -6, width: 28, height: 6, rx: 2, fill: pal.ink }, base);
  const cord = el('path', { d: '', stroke: '#E24C4C', 'stroke-width': 3, fill: 'none' });
  const plug = el('rect', { x: -3, y: -6, width: 6, height: 12, rx: 2, fill: pal.sub });
  const line = el('path', { d: 'M 70 150 Q 100 100 150 140 Q 240 80 330 175', stroke: pal.mintDark, 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '6 6', opacity: 0 });
  const bub = say(k, 56, 36);
  el('path', { d: 'M -4 -6 L 4 -6 L 6 8 L 0 12 L -6 8 Z', fill: pal.blueDark, transform: 'translate(-8 0)' }, bub.inner);
  k.text(14, 1, '?', { 'font-size': 22, fill: pal.blueDark }, bub.inner);
  const jx = jacks[6][0], jy = jacks[6][1];
  return {
    update(t) {
      me.pose({ armR: 150, armL: 10, look: 0.6, mood: t > 3.2 ? 'grin' : 'open', lean: Math.sin(t * 4) * 2 });
      const hm = hp(me, S); tf(ph, hm.x - 6, hm.y + 2, -70);
      bub.show(96, 100, backOut(seg(t, 0.2, 0.5)) * (1 - seg(t, 1.6, 1.8)));
      // 交換手：プラグを持ち上げ、ジャックへ差し込む
      const reachP = easeInOut(seg(t, 1.2, 1.9)), push = easeOut(seg(t, 1.9, 2.1));
      op.pose({ armR: lerp(20, 110, reachP), lean: 6 * reachP, look: 0.4, mood: push > 0.5 ? 'grin' : 'smile', squash: 1 - 0.04 * hump(seg(t, 1.9, 2.2)) });
      const ho = hp(op, S);
      const px = lerp(ho.x, jx, push), py = lerp(ho.y, jy, push);
      tf(plug, px, py, 0);
      k.set(cord, { d: `M 150 236 Q ${(150 + px) / 2} ${py + 70} ${px} ${py + 6}` });
      k.set(lamp, { fill: t > 2.1 ? pal.yellow : '#7A6B5C' });
      k.set(line, { opacity: seg(t, 2.1, 2.3), 'stroke-dashoffset': -t * 30 });
      // 部長：電話が鳴る（受話器が震える）→取って話す
      const ring = t > 2.3 && t < 2.9, pick = easeInOut(seg(t, 2.9, 3.3));
      mg.pose({ armR: lerp(60, 150, pick), armL: 10, look: 0.3, mood: pick > 0.5 ? 'open' : ring ? 'open' : 'smile', lift: ring ? hump(seg(t, 2.3, 2.5)) * 6 : 0 });
      const hg = hp(mg, S);
      const rx = 330 + (ring ? Math.sin(t * 60) * 2 : 0), ry = FY - 52;
      tf(pm, lerp(rx, hg.x + 6, pick), lerp(ry, hg.y + 2, pick), lerp(0, 70, pick));
    }
  };
}
