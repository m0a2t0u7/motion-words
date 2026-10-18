// take over：カレンダーが翌月にめくれる。まめが席を立って仕事のファイルを渡し、相手がその机に入って仕事を引き継ぐ（例文 She will take over my job next month.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { hp, gait } from './dig.js';
import { officeBg, desk, monitor } from './get-on-with.js';

export const meta = { duration: 4.6, beats: [[0, '来月になる'], [1.6, '仕事を渡す'], [3.6, '引き継いだ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236, 250);
  // 壁のカレンダー（ページがめくれる）
  el('rect', { x: 46, y: 40, width: 64, height: 70, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 46, y: 40, width: 64, height: 16, rx: 4, fill: pal.blue });
  const grid = (p, c) => { for (let i = 0; i < 12; i++) el('rect', { x: 52 + (i % 4) * 14, y: 62 + Math.floor(i / 4) * 14, width: 10, height: 10, rx: 2, fill: c }, p); };
  grid(k.g({}), pal.line);
  const next = g({}); el('circle', { cx: 57, cy: 67, r: 7, fill: 'none', stroke: pal.red, 'stroke-width': 2.5 }, next);
  const page = g({}); el('rect', { x: 0, y: 0, width: 64, height: 54, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, page);
  el('rect', { x: 6, y: 6, width: 52, height: 40, fill: '#F1F3F6' }, page);
  const S = 1;
  const me = k.buddy({ x: 190, y: FY - 6, scale: S });
  const she = k.buddy({ x: 420, y: FY, scale: S, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const top = desk(k, 120, 140, FY);
  const mon = monitor(k, 170, top);
  const file = g({});
  el('rect', { x: -14, y: -10, width: 28, height: 20, rx: 2, fill: pal.yellow }, file);
  el('rect', { x: -14, y: -14, width: 12, height: 6, rx: 2, fill: pal.yellowDark }, file);
  const xm = (t) => lerp(190, 220, easeInOut(seg(t, 1.3, 1.9))) - lerp(0, 220, easeInOut(seg(t, 2.9, 4.3)));
  const xs = (t) => lerp(420, 320, easeInOut(seg(t, 0.8, 1.9))) - lerp(0, 120, easeInOut(seg(t, 3.0, 3.9)));
  return {
    update(t) {
      // カレンダー：ページが上へめくれて消える
      const fl = easeInOut(seg(t, 0.2, 0.8));
      tf(page, 46, 56 - fl * 30, 0, 1, Math.max(0.02, 1 - fl));
      page.setAttribute('opacity', 1 - seg(t, 0.7, 0.8));
      next.setAttribute('opacity', seg(t, 0.8, 1.0));
      const typing = t < 1.2 ? Math.sin(t * 20) * 6 : 0;
      const pm = gait(xm, t, 190), ps = gait(xs, t, 420);
      const give = hump(seg(t, 1.9, 2.8));
      // まめ：席を立ち、ファイルを渡して手を振って去る
      me.pose({ x: pm.x, y: lerp(FY - 6, FY + 4, seg(t, 1.3, 1.6)), walk: pm.walk, facing: t > 3.0 ? -1 : 1,
        armR: t < 1.2 ? 95 + typing : t < 3.0 ? lerp(50, 80, give) : 10, armL: t > 3.0 ? 130 + Math.sin(t * 12) * 20 : pm.armL, lean: pm.lean, look: 0.5, mood: 'smile' });
      // 相手：近づいてファイルを受け取り、机の前に入ってパソコンを打つ
      const sit = easeInOut(seg(t, 3.0, 3.9));
      she.pose({ x: ps.x, y: lerp(FY, FY - 6, sit), walk: ps.walk, facing: -1, armR: t < 3.9 ? lerp(ps.armR, 80, hump(seg(t, 2.0, 2.8)) ) : 95 + Math.sin(t * 20) * 6, armL: ps.armL, lean: ps.lean, look: 0.4, mood: t > 3.9 ? 'grin' : 'smile' });
      const hm = hp(me, S), hs = hp(she, S, 'R');
      const m = easeInOut(seg(t, 2.25, 2.5));
      let fx = lerp(hm.x, hs.x, m), fy = lerp(hm.y, hs.y, m) - 6;
      if (t < 1.2) { fx = 240; fy = top - 10; }
      if (t > 3.5) { const q = easeInOut(seg(t, 3.5, 3.9)); fx = lerp(hs.x, 150, q); fy = lerp(hs.y - 6, top - 10, q); }
      tf(file, fx, fy, 0);
      mon.screen.setAttribute('fill', t > 3.9 || t < 1.2 ? '#9FD0F2' : '#C9D6E3');
    }
  };
}
