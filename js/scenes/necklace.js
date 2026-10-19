// necklace：誕生日パーティー。彼が銀のネックレスを差し出し、彼女が受け取って首にかける（例文 He gave her a silver necklace for her birthday.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, reach, P, blinkAt, walkTo, face, track } from './bag.js';
import { partyBg } from './shirt.js';
import { cake } from './so-far-so-good.js';
import { heart } from './weigh.js';

// ネックレス。open：手に下げた形（原点＝つまむ所）、worn：首にかかった形（体の座標）
export function chain(k, parent, worn = false) {
  const g = k.g({}, parent), { el } = k;
  const d = worn ? 'M -22 -38 Q 0 -18 22 -38' : 'M -3 0 Q -10 20 0 28 Q 10 20 3 0';
  el('path', { d, stroke: '#C7CED8', 'stroke-width': 2.4, fill: 'none' }, g);
  el('path', { d, stroke: '#fff', 'stroke-width': 0.8, fill: 'none', 'stroke-dasharray': '2 3' }, g);
  const py = worn ? -27 : 30;
  el('path', { d: `M 0 ${py - 4} L 4 ${py + 1} L 0 ${py + 7} L -4 ${py + 1} Z`, fill: '#E6ECF4', stroke: '#9AA6B6', 'stroke-width': 1.2 }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '誕生日'], [1.2, 'ネックレスを贈る'], [3.0, '首にかけた']] };

export function create(k) {
  const { tf, pal } = k, S = 1.1, FY = 236;
  partyBg(k, FY);
  const ck = cake(k); tf(ck, 346, FY - 60, 0, 1.3);
  const her = k.buddy({ x: 250, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const worn = chain(k, her.body, true); her.body.insertBefore(worn, her.body.children[4]);
  const him = k.buddy({ x: 60, y: FY, scale: S });
  const nk = chain(k);
  const hs = [0, 1].map(() => heart(k));
  const xf = (tt) => lerp(60, 165, easeInOut(seg(tt, 0, 1.1)));
  const M = { x: 208, y: FY - 70 };
  return {
    update(t) {
      const w = walkTo(xf, t, 60);
      const give = easeInOut(seg(t, 1.1, 1.6)) * (1 - easeInOut(seg(t, 2.3, 2.7)));
      P(him, { x: w.x, walk: w.walk, armL: w.armL, lean: w.lean, look: 0.5, blink: blinkAt(t), mood: 'grin' });
      him.pose({ armR: lerp(t > 2 ? 10 : 60, reach(him, S, 'R', M.x, M.y), give) });
      // 彼女：受け取る → 首の後ろへ両手を上げる → 下ろす
      const recv = easeInOut(seg(t, 1.5, 1.9));
      const put = easeInOut(seg(t, 2.3, 3.0)), down = easeInOut(seg(t, 3.0, 3.4));
      P(her, { x: 250, look: 0.4, blink: blinkAt(t, 1), mood: t > 1.5 ? (t > 3 ? 'grin' : 'open') : 'smile', squash: 1 + 0.03 * hump(seg(t, 3.2, 3.8)) });
      const neck = { x: 250 - 0 * S, y: FY - 66 * S };
      let tgt;
      if (t < 2.3) tgt = { x: lerp(265, M.x + 4, recv), y: lerp(FY - 30, M.y, recv) };
      else tgt = { x: lerp(M.x + 4, neck.x - 18, put), y: lerp(M.y, neck.y - 12, put) };
      if (t < 1.5) her.pose({ armR: 10 }); else if (t < 3.0) her.pose({ armR: reach(her, S, 'R', tgt.x, tgt.y), armL: lerp(8, 150, put) });
      else her.pose({ armR: lerp(reach(her, S, 'R', neck.x - 18, neck.y - 12), 10, down), armL: lerp(150, 8, down) });
      const hh = hp(him, S, 'R'), sh = hp(her, S, 'R');
      const inHer = t > 1.9;
      const h = inHer ? sh : hh;
      tf(nk, h.x, h.y + 2, Math.sin(t * 4) * 6 * (1 - put), 1);
      nk.setAttribute('opacity', t < 2.95 ? 1 : 0);
      worn.setAttribute('opacity', t < 2.95 ? 0 : 1);
      hs.forEach((x, i) => { const q = seg(t, 3.3 + i * 0.25, 4.3); tf(x, 220 + i * 30, FY - 120 - 24 * q, 0, hump(q) * 1.2 + 0.001); });
    }
  };
}
