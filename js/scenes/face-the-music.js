// face the music：花びんを割って逃げようとするが、立ち止まって向き直り、叱られるのを受け止める（例文 He made a mistake and had to face the music.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, 'そっと逃げる'], [1.5, '立ち止まる'], [2.7, '向き合う']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 割れた花びん
  const vase = g({});
  tf(vase, 128, FY);
  el('path', { d: 'M -14 -4 L -6 -22 L 4 -8 L 10 -20 L 16 -2 Z', fill: pal.blue, stroke: pal.blueDark, 'stroke-width': 2, 'stroke-linejoin': 'round' }, vase);
  el('path', { d: 'M -26 0 L -16 -8 L -10 0 Z M 18 0 L 28 -6 L 34 0 Z', fill: pal.blue, stroke: pal.blueDark, 'stroke-width': 2 }, vase);
  el('circle', { cx: 4, cy: -26, r: 6, fill: pal.red }, vase);
  const b = k.buddy({ x: 250, y: FY, scale: 1.05 });
  const c = k.buddy({ x: 62, y: FY, scale: 1.05, color: pal.coral, dark: pal.coralDark });
  const base = { armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0 };
  // 怒りマーク
  const mad = g({});
  el('path', { d: 'M -10 -4 Q -4 -4 -4 -10 M 4 -10 Q 4 -4 10 -4 M -10 4 Q -4 4 -4 10 M 4 10 Q 4 4 10 4', fill: 'none', stroke: pal.red, 'stroke-width': 4, 'stroke-linecap': 'round' }, mad);
  const bolt = el('path', { d: 'M 0 0 l -8 14 l 8 0 l -6 14', fill: 'none', stroke: pal.red, 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });

  return {
    update(t) {
      // まめ：右へそっと逃げる → 止まる → 振り向いて戻る → うなだれる
      const sneak = easeOut(seg(t, 0.2, 1.4));
      const back = easeInOut(seg(t, 2.3, 3.2));
      const x = lerp(250, 330, sneak) - lerp(0, 140, back);
      const moving = (t > 0.2 && t < 1.4) || (t > 2.3 && t < 3.2);
      const turned = t > 1.7;
      const head = seg(t, 3.2, 3.8);
      const sneakLean = t < 1.5 ? 5 : 0;
      b.pose({ ...base, x, facing: turned ? -1 : 1, walk: moving ? t * 8 : 0, lean: sneakLean + 18 * head, look: turned ? -0.6 : 0.6, mood: t < 1.5 ? 'flat' : 'sad', armL: 15, armR: 15, blink: head * 0.7, squash: 1 - 0.03 * head });
      // 花びんが割れたことに気づく先生（コーラル）：最初は背中、後半は怒る
      const angry = seg(t, 1.7, 2.1);
      c.pose({ ...base, x: 62 + 10 * angry, facing: 1, armL: lerp(8, 100, angry), armR: lerp(8, 100, angry), look: 0.5, mood: angry > 0.3 ? 'open' : 'smile', lean: 4 * angry, squash: 1 + 0.02 * Math.sin(t * 14) * angry });
      const mp = backOut(seg(t, 2.0, 2.4), 2);
      tf(mad, 98 + 10 * angry, 92, 0, mp * (1 + 0.1 * Math.sin(t * 12)), mp * (1 + 0.1 * Math.sin(t * 12)));
      tf(bolt, 125, 80, 0, mp, mp);
      bolt.setAttribute('opacity', mp > 0 ? 0.9 : 0);
    }
  };
}
