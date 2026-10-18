// take on：上司が新しいプロジェクトのファイルを差し出し、まめがうなずいて受け取り、自分の机に積んで引き受ける（例文 She took on a new project at work.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { hp, gait } from './dig.js';
import { officeBg, desk, monitor, star } from './get-on-with.js';

export const meta = { duration: 4.4, beats: [[0, '新しい案件'], [1.8, '受け取る'], [3.4, '引き受けた']] };

function folder(k, c) {
  const g = k.g({});
  k.el('rect', { x: -16, y: -12, width: 32, height: 24, rx: 2, fill: c }, g);
  k.el('rect', { x: -16, y: -16, width: 13, height: 6, rx: 2, fill: c }, g);
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236, 40);
  const S = 1;
  const me = k.buddy({ x: 120, y: FY - 6, scale: S });
  const boss = k.buddy({ x: 430, y: FY, scale: S, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const tie = el('path', { d: 'M -4 -34 L 4 -34 L 6 -16 L 0 -10 L -6 -16 Z', fill: pal.blueDark }, boss.body);
  const top = desk(k, 40, 150, FY);
  monitor(k, 80, top);
  // 机の上の既存の書類
  [0, 1].forEach((i) => el('rect', { x: 140, y: top - 4 - i * 4, width: 34, height: 4, rx: 1, fill: [pal.blue, pal.green][i] }));
  const pj = folder(k, pal.violet);
  const st = g({}, pj); star(k, st, 6, '#fff');
  const xb = (t) => lerp(430, 270, easeInOut(seg(t, 0.2, 1.4))) + lerp(0, 160, easeInOut(seg(t, 3.0, 4.2)));
  const xm = (t) => lerp(120, 180, easeInOut(seg(t, 1.2, 1.8))) - lerp(0, 60, easeInOut(seg(t, 2.4, 3.0)));
  return {
    update(t) {
      const pb = gait(xb, t, 430), pm = gait(xm, t, 120);
      const offer = easeInOut(seg(t, 1.2, 1.6)) * (1 - easeInOut(seg(t, 2.2, 2.6)));
      boss.pose({ x: pb.x, walk: pb.walk, facing: t > 3.0 ? 1 : -1, armR: t > 3.0 ? pb.armR : lerp(pb.armR, 84, offer), armL: pb.armL, lean: pb.lean + 3 * offer, look: 0.5, mood: t > 2.3 ? 'grin' : 'smile' });
      // まめ：ファイルを見る→うなずいて受け取る→机に置き、胸を張る
      const nod = hump(seg(t, 1.6, 1.9)), take = easeInOut(seg(t, 1.8, 2.1)), put = easeInOut(seg(t, 2.8, 3.2));
      const proud = easeOut(seg(t, 3.3, 3.7));
      me.pose({ x: pm.x, y: lerp(FY - 6, FY + 4, seg(t, 1.2, 1.5)) - lerp(0, 10, seg(t, 2.4, 2.8)), walk: pm.walk, facing: 1,
        armR: lerp(lerp(lerp(10, 86, take), 60, seg(t, 2.2, 2.5)), 92, put) * (1 - proud) + proud * 150, armL: proud * 150 + (1 - proud) * pm.armL,
        lean: pm.lean + 10 * nod, look: 0.5, mood: proud > 0.3 ? 'grin' : 'smile', lift: hump(seg(t, 3.4, 3.8)) * 8 });
      const hb = hp(boss, S), hm = hp(me, S);
      let fx = hb.x - 4, fy = hb.y - 8;
      const m = easeInOut(seg(t, 1.95, 2.15));
      fx = lerp(fx, hm.x + 4, m); fy = lerp(fy, hm.y - 8, m);
      if (t > 2.15) { fx = hm.x; fy = hm.y - 8; }
      if (put >= 1 || t > 3.2) { fx = 168; fy = top - 20; }
      tf(pj, fx, fy, 0);
    }
  };
}
