// pocket：台の上の鍵を取り、上着のポケットにしまって、上からぽんとたたく（例文 I put the key in my pocket so I wouldn't lose it.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { wardrobe, hp, reach, P, blinkAt } from './skirt.js';
import { keys } from './all-along.js';
import { check } from './work-on.js';

export const meta = { duration: 4.2, beats: [[0, '鍵を取る'], [1.4, 'ポケットに入れる'], [2.9, 'なくさない']] };

export function create(k) {
  const { el, g, pal, tf } = k, S = 1.6;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // 玄関の小さな台
  k.shadow(320, FY + 1, 44, 4);
  el('rect', { x: 270, y: 168, width: 100, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 278, y: 176, width: 84, height: FY - 176, fill: '#EAD3B0' });
  el('rect', { x: 312, y: 196, width: 16, height: 5, rx: 2.5, fill: pal.woodDark });
  el('rect', { x: 46, y: 60, width: 80, height: 62, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const b = k.buddy({ x: 200, y: FY, scale: S });
  const W = wardrobe(k, b);
  W.top({ color: '#E3B77E', dark: '#C9975A', sleeve: 'long', to: 0, collar: true, buttons: 3 });
  W.feet('shoe', pal.ink);
  // ポケット（体の右下）。鍵はポケットの口の後ろに入っていく
  const pk = g({}, null); b.body.insertBefore(pk, b.body.children[6]);
  const PX = 13, PY = -22;
  const inside = g({}, pk);
  const kk = keys(k, inside);
  const front = g({}, pk);
  el('path', { d: `M ${PX - 9} ${PY} L ${PX + 9} ${PY} L ${PX + 9} ${PY + 13} Q ${PX} ${PY + 17} ${PX - 9} ${PY + 13} Z`, fill: '#D6A766', stroke: '#B8884A', 'stroke-width': 1.4 }, front);
  el('line', { x1: PX - 9, y1: PY + 3, x2: PX + 9, y2: PY + 3, stroke: '#B8884A', 'stroke-width': 1.2, 'stroke-dasharray': '2 1.5' }, front);
  const clipId = k.clip((c) => el('rect', { x: PX - 30, y: PY - 40, width: 60, height: 40 + 3 }, c));
  inside.setAttribute('clip-path', clipId);
  const kw = keys(k, k.root);
  const ok = check(k, 200 + 56, FY - 150, 1.4);
  const rest = { x: 330, y: 164 };
  return {
    update(t) {
      const toT = easeInOut(seg(t, 0.2, 0.7)) * (1 - easeInOut(seg(t, 0.9, 1.4)));
      const toP = easeInOut(seg(t, 1.0, 1.5)) * (1 - easeInOut(seg(t, 2.1, 2.5)));
      const pat = hump(seg(t, 2.6, 2.85)) + hump(seg(t, 2.9, 3.15));
      P(b, { x: 200, lean: 10 * toT, look: t < 1.0 ? 0.6 : 0.1, mood: t > 2.6 ? 'grin' : 'smile', blink: blinkAt(t) });
      const pocketW = { x: 200 + PX * S, y: FY - (10 - PY) * S };
      let target = null;
      if (t < 1.0) target = { x: lerp(200 + 30 * S, rest.x, 1), y: rest.y };
      const armR = toT > 0 ? lerp(8, reach(b, S, 'R', rest.x, rest.y - 4), toT) : toP > 0 ? lerp(8, reach(b, S, 'R', pocketW.x, pocketW.y - 10 + 6 * seg(t, 1.5, 2.0)), toP) : 8;
      const patA = reach(b, S, 'R', pocketW.x, pocketW.y + 6);
      b.pose({ armR: t > 2.5 ? lerp(8, patA, Math.min(1, pat + (t > 2.55 && t < 3.2 ? 0.6 : 0))) : armR, armL: 8 });
      void target;
      const h = hp(b, S, 'R', 30);
      // 鍵：台の上 → 手 → ポケットの中（体の座標へ）
      const inP = t > 1.55;
      kw.setAttribute('display', inP ? 'none' : 'inline');
      inside.setAttribute('display', inP ? 'inline' : 'none');
      if (t < 0.65) tf(kw, rest.x, rest.y - 2, 0, 1.4);
      else tf(kw, h.x, h.y + 4, 80, 1.4);
      const sink = easeOut(seg(t, 1.55, 2.0));
      tf(kk, PX, PY - 8 + 14 * sink, 90, 0.9);
      ok(easeOut(seg(t, 3.2, 3.6)));
      void wobble;
    }
  };
}
