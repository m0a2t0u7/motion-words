// baggage：飛行機を降りたまめが「荷物はどこ？」と見回す。案内のスーツケースの矢印に気づき、ベルトの上を回る手荷物を見つける（例文 Where can I pick up my baggage?）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hall, suitcase, mark, popIn, cue } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, '荷物はどこ？'], [1.8, '案内を見つける'], [3.0, '受け取り場']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = 236;
  hall(k, FY, { win: false });
  // 案内板（スーツケースの絵＋矢印）
  el('rect', { x: 150, y: 30, width: 110, height: 40, rx: 6, fill: '#FFCF5C' });
  const ic = suitcase(k, pal.ink, pal.ink); k.tf(ic, 178, 34, 0, 0.42);
  el('path', { d: 'M 212 50 h 32 m -10 -9 l 10 9 l -10 9', stroke: pal.ink, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' });
  // ターンテーブル（右）
  el('rect', { x: 236, y: 190, width: 170, height: 30, rx: 12, fill: '#9AA5B4' });
  el('rect', { x: 236, y: 184, width: 170, height: 10, rx: 5, fill: '#C9D1DC' });
  el('rect', { x: 236, y: 120, width: 50, height: 64, fill: '#5A6478' });
  el('rect', { x: 236, y: 120, width: 50, height: 40, fill: '#2B3446' });
  const bags = [[pal.coral, '#E86F57'], [pal.blue, pal.blueDark], [pal.violet, '#7F63D6'], [pal.green, '#3E9E5F']].map(([c, d]) => { const s = suitcase(k, c, d); return s; });
  const me = k.buddy({ x: 120, y: FY + 6, scale: 0.92 });
  const q = cue(k, '?', 40, 34, -1, 22);
  const bang = mark(k, 'bang');
  return {
    update(t) {
      bags.forEach((b, i) => { const x = 250 + ((t * 30 + i * 46) % 184); k.tf(b, x, 184 - 66 * 0.6 + 28, 90, 0.6); b.setAttribute('opacity', x < 400 ? 1 : 0); });
      const lookA = t < 1.8 ? Math.sin(t * 3.4) : 0;
      const found = seg(t, 2.6, 3.0);
      P(me, { x: 120 + 30 * easeInOut(seg(t, 3.0, 4.0)), walk: seg(t, 3.0, 4.0) * 7, facing: t < 1.8 ? (lookA > 0 ? 1 : -1) : 1, look: t < 1.8 ? 0.6 : 0.4, mood: t > 2.6 ? 'grin' : 'flat', blink: blinkAt(t), armR: t > 1.8 && t < 2.6 ? 150 : 8 + 40 * found });
      me.body.children[3].setAttribute('transform', t > 1.8 && t < 2.6 ? 'translate(4 -8)' : 'translate(0 0)');
      q.show(seg(t, 0.2, 0.5) * (1 - seg(t, 1.6, 1.8)), 150, 120);
      k.tf(bang, 160, 120, 0, popIn(found) * (1 - seg(t, 3.6, 3.9)) * 1.6 + 0.001);
      void lerp; void easeOut; void hump; void g;
    }
  };
}
