// seat：電車の座席で、まめが女性の隣の空いた席を指して「空いていますか？」と聞く。女性はかばんをどけてどうぞと示す（例文 Is this seat taken?）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walk, path, reach, held, cue, talk } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, '空いた席'], [1.4, '空いてますか？'], [3.0, 'どうぞ']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = 240;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  // 電車の中：窓と手すり、長い座席
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#EEF1F5' });
  [20, 150, 280].forEach((x) => el('rect', { x, y: 40, width: 100, height: 60, rx: 8, fill: '#CFE9F7', stroke: '#fff', 'stroke-width': 4 }));
  el('rect', { x: 0, y: 20, width: 400, height: 4, fill: '#C9D1DC' });
  el('rect', { x: 30, y: 190, width: 300, height: 14, rx: 6, fill: '#6AA8F7' });
  el('rect', { x: 30, y: 140, width: 300, height: 52, rx: 10, fill: '#7FB5F5' });
  el('rect', { x: 40, y: 204, width: 280, height: 36, fill: '#B9C2CF' });
  const her = k.buddy({ x: 120, y: 204, scale: 0.86, color: pal.coral, dark: pal.coralDark });
  her.g.firstChild.setAttribute('display', 'none');
  const bag = g({}); el('rect', { x: -16, y: -26, width: 32, height: 26, rx: 5, fill: pal.violet }); 
  const bagp = g({}); el('path', { d: 'M -8 -24 Q 0 -36 8 -24', stroke: '#7F63D6', 'stroke-width': 3, fill: 'none' }, bagp); el('rect', { x: -16, y: -24, width: 32, height: 26, rx: 5, fill: pal.violet }, bagp);
  bag.remove();
  const me = k.buddy({ x: 420, y: FY + 4, scale: 0.92, facing: -1 });
  const q = cue(k, '?', 40, 34, 1, 22);
  const X = path([[0, 430], [1.2, 260]]);
  return {
    update(t) {
      walk(me, X, t, { facing: -1, look: -0.6, blink: blinkAt(t), mood: 'smile' });
      // 隣の席を指さす
      const pt = easeOut(seg(t, 1.3, 1.6)) * (1 - easeInOut(seg(t, 2.8, 3.2)));
      me.pose({ armR: lerp(me.state.armR, reach(me, 0.92, 'R', 200, 180), pt), mood: t > 1.4 && t < 2.4 && Math.sin(t * 22) > 0 ? 'open' : t > 3.2 ? 'grin' : 'smile' });
      q.show(seg(t, 1.5, 1.8) * (1 - seg(t, 2.8, 3.0)), 250, 100);
      // 女性：見上げる → かばんをひざへ動かし、手で席を示す
      const mv = easeInOut(seg(t, 2.3, 2.9));
      const bx = lerp(200, 132, mv), by = lerp(190, 172, mv);
      P(her, { x: 120, y: 204, look: lerp(0.2, 0.8, easeOut(seg(t, 1.6, 2.0))), mood: t > 2.2 ? 'grin' : 'smile', blink: blinkAt(t, 1), lean: -4 * mv });
      her.pose({ armR: mv > 0 && mv < 1 ? reach(her, 0.86, 'R', bx, by - 30) : t >= 2.9 ? lerp(reach(her, 0.86, 'R', bx, by - 30), 80, easeOut(seg(t, 2.9, 3.3))) : 20 });
      k.tf(bagp, bx, by + (mv > 0 ? 0 : 0));
      void held; void talk; void hump;
    }
  };
}
