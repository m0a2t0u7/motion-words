// use：ペンを持っていないまめが「ペン、使っていい？」とたずねる。隣の人がペンを渡し、まめがそのペンで紙に書く（例文 May I use your pen?）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { hp, reach } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { officeBg, desk } from './get-on-with.js';
import { pen } from './work-on.js';
import { cue, talk } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, 'ペンがない'], [1.0, '借りる'], [2.6, 'ペンで書く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236);
  const S = 1.05;
  const me = k.buddy({ x: 110, y: FY, scale: S });
  const her = k.buddy({ x: 300, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const top = desk(k, 60, 290, FY);
  // まめの紙（書くと線が出る）
  const pg = g({}); tf(pg, 160, top - 2);
  el('path', { d: 'M -22 -5 L 20 -5 L 24 3 L -18 3 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, pg);
  const ink = el('path', { d: 'M -14 -1 q 4 -3 8 0 t 8 0 t 8 0 t 8 0', fill: 'none', stroke: pal.blueDark, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-dasharray': 34, 'stroke-dashoffset': 34 }, pg);
  // 相手のノートとペン
  const hn = g({}); tf(hn, 250, top - 2);
  el('path', { d: 'M -20 -5 L 18 -5 L 22 3 L -16 3 Z', fill: '#FFF6DA', stroke: pal.line, 'stroke-width': 1.5 }, hn);
  const pn = pen(k, pal.blue);
  const ask = cue(k, '', 54, 34, 1);
  const pi = pen(k, pal.blue); ask.g.appendChild(pi); tf(pi, -6, -6, -50, 0.9); k.text(14, 1, '?', { 'font-size': 18, fill: pal.blueDark }, ask.g);
  const ok = cue(k, 'sure', 52, 28, -1, 14);
  return {
    update(t) {
      // 相手：ペンを取る（1.3-1.6）→ 差し出す（1.6-2.1）→ 手を戻す
      const pick = easeInOut(seg(t, 1.3, 1.6)), give = easeInOut(seg(t, 1.6, 2.1)), back = easeInOut(seg(t, 2.3, 2.7));
      const pen0 = { x: 232, y: top - 4 }, mid = { x: 200, y: top - 26 };
      const target = t < 1.6 ? { x: lerp(270, pen0.x, pick), y: lerp(top + 10, pen0.y, pick) } : { x: lerp(pen0.x, mid.x, give), y: lerp(pen0.y, mid.y, give) - 10 * hump(give) };
      P(her, { lean: 6 + 6 * give * (1 - back), look: 0.6, mood: talk(t, 1.0, 1.4) || 'smile', blink: blinkAt(t, 1.2) });
      her.pose({ armR: lerp(reach(her, S, 'R', target.x, target.y), 8, back) });
      // まめ：たずねる → 受け取る → 紙に書く
      const take = easeInOut(seg(t, 1.9, 2.15)), wr = seg(t, 2.6, 4.0);
      let mt = { x: lerp(150, mid.x, take), y: lerp(top + 6, mid.y, take) };
      if (t > 2.2) { const u = easeInOut(seg(t, 2.2, 2.6)); mt = { x: lerp(mid.x, 150 + 30 * wr + Math.sin(t * 16) * 2, u), y: lerp(mid.y, top - 6, u) }; }
      P(me, { lean: 6 + 4 * take, look: t < 0.2 ? 0 : 0.6, mood: talk(t, 0.3, 0.9) || (t > 2.6 ? 'flat' : 'smile'), blink: blinkAt(t, 0.3), armL: 10 });
      me.pose({ armR: t < 1.85 ? 8 + 12 * hump(seg(t, 0.2, 1.0)) : reach(me, S, 'R', mt.x, mt.y) });
      const hh = hp(her, S, 'R', 28), mh = hp(me, S, 'R', 28);
      if (t < 1.4) tf(pn, pen0.x, pen0.y, 80, 1.1);
      else if (t < 2.05) tf(pn, hh.x, hh.y - 6, -30, 1.1);
      else tf(pn, mh.x + 2, mh.y - 8, 20, 1.1);
      ink.setAttribute('stroke-dashoffset', (34 * (1 - wr)).toFixed(1));
      ask.show(seg(t, 0.3, 0.55) * (1 - seg(t, 1.2, 1.4)), 150, 124);
      ok.show(seg(t, 1.05, 1.3) * (1 - seg(t, 2.0, 2.2)), 270, 124);
    }
  };
}
