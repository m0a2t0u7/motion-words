// available：ホテルのフロントで「今夜空いてる？」と聞く。係の人がキー掛けを見て、残っていた鍵を渡してくれる（例文 Is this room available tonight?）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, hp, reach, P, blinkAt, walkTo, path, wear, deskFront } from './member.js';
import { cue, talk } from './in-common.js';
import { suitcase, pullCase } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, '今夜空いてる？'], [1.6, '空き部屋を探す'], [3.0, '空いてた！']] };

function key(k, parent) {
  const g = k.g({}, parent || k.root);
  k.el('circle', { cx: 0, cy: 4, r: 4, fill: 'none', stroke: k.pal.yellowDark, 'stroke-width': 2.5 }, g);
  k.el('path', { d: 'M 0 8 V 22 M 0 16 h 4 M 0 20 h 4', stroke: k.pal.yellowDark, 'stroke-width': 2.5 }, g);
  k.el('rect', { x: -6, y: 12, width: 12, height: 14, rx: 2, fill: k.pal.red, transform: 'translate(-10 0)' }, g);
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k, S = 1, FY = 236;
  k.backdrop({ floorY: FY, mood: 'evening' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#F2E6D6' });
  el('rect', { x: 230, y: 20, width: 90, height: 22, rx: 4, fill: '#7A3B4A' }); k.text(275, 31, 'HOTEL', { 'font-size': 12, fill: '#fff' });
  // キー掛け：6つの部屋、鍵が残っているのは 1 つだけ
  const KX = 300, KY = 56;
  el('rect', { x: KX - 10, y: KY, width: 90, height: 66, rx: 4, fill: pal.woodDark });
  const hooks = [];
  for (let i = 0; i < 6; i++) { const x = KX + 4 + (i % 3) * 26, y = KY + 10 + Math.floor(i / 3) * 30; el('circle', { cx: x, cy: y, r: 2.5, fill: pal.ink }); k.text(x + 10, y, String(201 + i), { 'font-size': 6, fill: '#fff' }); hooks.push([x, y]); }
  const kk = key(k); const [HX, HY] = hooks[4];
  const clerk = k.buddy({ x: 300, y: FY, scale: 0.95, facing: -1, ...CO(k) }); wear(k, clerk, 'tie', pal.red);
  deskFront(k, 210, 180, FY - 40, FY);
  el('rect', { x: 220, y: FY - 50, width: 24, height: 10, rx: 2, fill: pal.yellow });
  const cs = suitcase(k, pal.blue, pal.blueDark);
  const b = k.buddy({ x: -30, y: FY, scale: S, facing: 1 });
  const q = cue(k, 'Tonight?', 80, 30, -1, 13);
  const yes = cue(k, 'Yes!', 54, 30, 1, 14);
  const bx = path([[0.1, -30], [1.0, 150]]);
  return {
    update(t) {
      const w = walkTo(bx, t, -30, 1);
      P(b, { x: w.x, walk: w.walk, armL: w.armL, armR: 30, lean: w.lean, look: t > 1.7 && t < 2.6 ? 1 : 0.7, blink: blinkAt(t), mood: talk(t, 1.1, 1.6) || (t > 3.0 ? 'grin' : 'smile'), lift: 10 * hump(seg(t, 3.5, 3.9)) });
      q.show(seg(t, 1.1, 1.4) - seg(t, 2.2, 2.4), 170, 104);
      // 係：振り向いて鍵を取り、差し出す
      const turn = t > 1.6 && t < 2.6, grab = seg(t, 2.0, 2.3), give = easeInOut(seg(t, 2.6, 3.0)), got = t > 3.1;
      P(clerk, { facing: turn ? 1 : -1, look: 0.6, blink: blinkAt(t, 1), mood: t > 2.6 ? 'grin' : 'smile', armL: 10 });
      if (turn) clerk.pose({ armR: reach(clerk, 0.95, 'R', HX, HY + 10) });
      else if (t >= 2.6) clerk.pose({ armR: lerp(30, 85, give) * (got ? 1 - easeInOut(seg(t, 3.2, 3.5)) * 0.7 : 1) });
      const ch = hp(clerk, 0.95, 'R', 30);
      if (t > 2.6 && !got) b.pose({ armR: lerp(30, reach(b, S, 'R', ch.x, ch.y), easeInOut(seg(t, 2.8, 3.1))) });
      if (got) b.pose({ armR: lerp(reach(b, S, 'R', ch.x, ch.y), 150, easeInOut(seg(t, 3.2, 3.6))) });
      const bh = hp(b, S, 'R', 28);
      if (t < 2.2) tf(kk, HX, HY - 2); else if (!got) tf(kk, ch.x, ch.y - 4); else tf(kk, bh.x, bh.y - 4);
      yes.show(seg(t, 2.6, 2.9) - seg(t, 3.8, 4.0), 260, 110);
      const hl = hp(b, S, 'L', 28); pullCase(k, cs, hl, FY, 0.9, 1);
    }
  };
}
