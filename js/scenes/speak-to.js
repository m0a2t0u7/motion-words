// speak to：書類を持って上司の机まで行き、その件について話しかける。上司がうなずく（例文 I'll speak to my boss about it.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { roomBg, say, desk, faceAt, walkPose, hp } from './look-over.js';
import { papers, grip } from './hand-over.js';

export const meta = { duration: 4.2, beats: [[0, '書類を持つ'], [1.6, '上司のところへ'], [2.6, '話しかける']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const FY = roomBg(k, 'office', 240);
  const boss = k.buddy({ x: 318, y: 226, scale: 0.9, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const tie = el('path', { d: 'M -4 -34 L 4 -34 L 3 -14 L 0 -10 L -3 -14 Z', fill: pal.blueDark }, boss.body);
  desk(k, 252, 130, 196);
  el('rect', { x: 330, y: 176, width: 34, height: 22, rx: 3, fill: pal.ink }); el('rect', { x: 344, y: 196, width: 6, height: 4, fill: pal.ink });
  const b = k.buddy({ x: 50, y: FY, scale: S });
  const doc = papers(k, 2), gr = grip(k, pal.mint, pal.mintDark, S);
  const bub = say(k, 50, 36, -1);
  const md = papers(k, 2); bub.g.appendChild(md); tf(md, 0, 2, 0, 0.8);
  const xf = (t) => lerp(50, 208, easeInOut(seg(t, 0.4, 2.0)));
  return {
    update(t) {
      const p = walkPose(xf, t, 50), talk = t > 2.2;
      b.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: 40 + (talk ? 15 * Math.max(0, Math.sin(t * 5)) : 0), lean: p.lean + 4 * talk, mood: talk && Math.sin(t * 13) > 0 ? 'open' : 'smile', look: 0.6 });
      const h = hp(b, S); tf(doc, h.x + 4, h.y - 6, -4); gr(h);
      bub.show(seg(t, 2.2, 2.45), 212, 112);
      const turn = seg(t, 1.6, 2.0), nod = t > 3.0 ? Math.max(0, Math.sin((t - 3.0) * 5)) : 0;
      boss.pose({ look: lerp(-0.6, 0.6, turn), mood: t > 3.0 ? 'smile' : 'flat', lean: 4 * nod, armR: 30 });
      faceAt(boss, lerp(-4, 4, turn), 3 * nod);
    }
  };
}
