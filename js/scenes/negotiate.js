// negotiate：市場の店先で、売り手と買い手が値段を何度も言い合い、1時間かけて折り合って握手する（例文 They negotiated the price for an hour.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { cue } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '値段の話し合い'], [1.2, '言い合う'], [3.3, '1時間で合意']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'outdoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: '#E3E8EE' });
  // 屋台：ひさしと台、売り物の壺
  [0, 1, 2, 3, 4, 5].forEach((i) => el('path', { d: `M ${236 + i * 26} 70 h 26 v 20 q -13 9 -26 0 Z`, fill: i % 2 ? '#fff' : pal.coral }));
  el('rect', { x: 240, y: 90, width: 6, height: 146, fill: pal.woodDark }); el('rect', { x: 382, y: 90, width: 6, height: 146, fill: pal.woodDark });
  const seller = k.buddy({ x: 330, y: FY, scale: 1.15, facing: -1, color: pal.coral, dark: pal.coralDark });
  el('rect', { x: 230, y: 196, width: 166, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 236, y: 204, width: 154, height: 32, fill: pal.wood });
  const vase = g({}); tf(vase, 262, 196);
  el('path', { d: 'M -8 -40 L 8 -40 L 6 -34 Q 20 -24 14 -8 Q 10 0 0 0 Q -10 0 -14 -8 Q -20 -24 -6 -34 Z', fill: pal.blue, stroke: pal.blueDark, 'stroke-width': 2 }, vase);
  el('path', { d: 'M -14 -18 Q 0 -12 14 -18', stroke: pal.yellow, 'stroke-width': 3, fill: 'none' }, vase);
  // 値札（数字が変わる）
  const tag = g({}); tf(tag, 292, 186);
  el('rect', { x: -18, y: -10, width: 36, height: 20, rx: 4, fill: '#fff', stroke: pal.ink, 'stroke-width': 2 }, tag);
  const tagTxt = k.text(0, 1, '$100', { 'font-size': 11 }, tag);
  // 時計：1時間（長針が1周）
  el('circle', { cx: 60, cy: 60, r: 24, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 });
  el('line', { x1: 60, y1: 60, x2: 72, y2: 60, stroke: pal.ink, 'stroke-width': 3, 'stroke-linecap': 'round', id: 'hr' });
  const hrH = el('line', { x1: 0, y1: 0, x2: 0, y2: -12, stroke: pal.ink, 'stroke-width': 3.2, 'stroke-linecap': 'round' });
  const minH = el('line', { x1: 0, y1: 0, x2: 0, y2: -19, stroke: pal.red, 'stroke-width': 2.2, 'stroke-linecap': 'round' });
  const buyer = k.buddy({ x: 170, y: FY, scale: 1.0, facing: 1 });
  // 交互の言い合い（売り手 → 買い手）
  const lines = [['$100', 1, 0.3], ['$60', 0, 0.9], ['$90', 1, 1.5], ['$70', 0, 2.1], ['$80?', 1, 2.7]];
  const bubbles = lines.map(([s, who]) => ({ c: cue(k, s, 52, 30, who ? 1 : -1, 14), who }));
  return {
    update(t) {
      const hourP = easeInOut(seg(t, 0.2, 3.3));
      tf(minH, 60, 60, 360 * hourP); tf(hrH, 60, 60, 60 + 30 * hourP);
      let talker = -1;
      lines.forEach(([s, who, a], i) => {
        const on = seg(t, a, a + 0.15) * (1 - seg(t, a + 0.55, a + 0.65));
        bubbles[i].c.show(on, who ? 300 : 186, 104);
        if (t > a && t < a + 0.55) talker = who;
      });
      tagTxt.textContent = t < 1.5 ? '$100' : t < 2.7 ? '$90' : '$80';
      const deal = easeInOut(seg(t, 3.3, 3.7));
      const open = (on) => (on && Math.sin(t * 22) > -0.2 ? 'open' : null);
      // 言うときは手を前に出す、言われると腕組み気味
      P(seller, { facing: -1, look: 0.7, blink: blinkAt(t, 1), lean: talker === 1 ? 6 : 0, armL: 10, armR: talker === 1 ? 105 : 20, mood: open(talker === 1) || (t > 3.3 ? 'grin' : talker === 0 ? 'flat' : 'smile') });
      P(buyer, { facing: 1, look: 0.7, blink: blinkAt(t), lean: talker === 0 ? 6 : 0, armL: 10, armR: talker === 0 ? 70 : 20, mood: open(talker === 0) || (t > 3.3 ? 'grin' : talker === 1 ? 'flat' : 'smile') });
      if (t > 3.3) {
        // 歩み寄って握手
        P(buyer, { x: lerp(170, 226, deal), facing: 1, look: 0.7, blink: blinkAt(t), armR: lerp(20, 82, deal) + (t > 3.7 ? 6 * Math.sin(t * 16) : 0), armL: 10, mood: 'grin', walk: deal * 2 * Math.PI, lean: 6 * deal });
        P(seller, { facing: -1, look: 0.7, lean: 10 * deal, armR: lerp(20, 100, deal) + (t > 3.7 ? 6 * Math.sin(t * 16) : 0), armL: 10, mood: 'grin' });
      }
    }
  };
}
