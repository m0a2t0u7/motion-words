// disconnect：音楽が流れる携帯とスピーカーのケーブルを、まめが握って引き抜くと音が止まる（例文 Please disconnect the cable first.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 5.0, beats: [[0, 'つながっている'], [1.6, '引き抜く'], [3.4, '切れた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 40, y: 44, width: 70, height: 60, rx: 8, fill: '#DDEFFA' });
  el('line', { x1: 75, y1: 44, x2: 75, y2: 104, stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 0, y: 200, width: 400, height: 14, fill: '#F2DDBB' });
  el('rect', { x: 0, y: 200, width: 400, height: 2, fill: '#fff', opacity: 0.6 });
  const SPX = 332;
  k.shadow(SPX, 202, 26, 4);
  const spk = g({}); tf(spk, SPX, 200);
  el('rect', { x: -22, y: -52, width: 44, height: 52, rx: 8, fill: '#5A6480' }, spk);
  el('circle', { cx: 0, cy: -38, r: 5, fill: '#2A3242' }, spk);
  el('circle', { cx: 0, cy: -18, r: 12, fill: '#2A3242' }, spk);
  el('circle', { cx: 0, cy: -18, r: 5, fill: '#8F9BAB' }, spk);
  const led = el('circle', { cx: 14, cy: -46, r: 2, fill: '#59C27A' }, spk);
  const PX = 232;
  k.shadow(PX + 14, 202, 20, 3.5);
  el('rect', { x: PX - 2, y: 144, width: 32, height: 58, rx: 6, fill: '#2A3242' });
  const scr = el('rect', { x: PX + 1, y: 148, width: 26, height: 50, rx: 4, fill: '#38486B' });
  const eq = [0, 1, 2, 3].map((i) => el('rect', { x: PX + 5 + i * 5.5, y: 180, width: 3.6, height: 4, rx: 1.6, fill: '#7CF0B0' }));
  const cable = el('path', { d: '', stroke: '#2A3242', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
  const S = 1.0;
  const me = k.buddy({ x: 158, y: FY, scale: S });
  el('rect', { x: 0, y: 214, width: 400, height: 40, fill: pal.wood });
  el('rect', { x: 0, y: 214, width: 400, height: 3, fill: pal.woodDark, opacity: 0.4 });
  const hand = el('circle', { r: 6.5 * S, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.4 });
  const plug = g({});
  el('rect', { x: -2, y: -4, width: 12, height: 8, rx: 2, fill: '#8F9BAB' }, plug);
  el('rect', { x: 10, y: -2, width: 6, height: 4, fill: '#C9D3DF' }, plug);
  const notes = [0, 1, 2].map(() => {
    const n = g({});
    el('ellipse', { cx: 0, cy: 0, rx: 4.4, ry: 3.2, fill: pal.violet, transform: 'rotate(-20)' }, n);
    el('path', { d: 'M 3.6 -1 V -13 q 4 1 5 5', stroke: pal.violet, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, n);
    return n;
  });

  return {
    update(t) {
      const grab = easeInOut(seg(t, 0.5, 1.3)), pull = easeInOut(seg(t, 1.7, 2.5));
      me.pose({ x: 158, armL: 8, lean: 3, look: 0.6, mood: t > 3.2 ? 'smile' : 'smile', squash: 1, armR: 30 });
      const a0 = reach(me, S, 'R', PX - 20, 186);
      // 引き抜くと手が手前へ戻る
      const aPull = lerp(a0, 14, pull);
      me.pose({ armR: lerp(30, aPull, grab), lean: 3 + 3 * grab * (1 - pull) });
      const h = hp(me, S, 'R', 26);
      k.set(hand, { cx: h.x, cy: h.y });
      const held = t >= 1.1;
      const px = held ? h.x + 12 : PX - 12, py = held ? h.y : 186;
      tf(plug, px, py, 0, 1);
      const sag = lerp(2, 12, pull);
      k.set(cable, { d: `M ${SPX - 22} 192 Q ${(SPX - 22 + px) / 2} ${Math.max(py, 192) + sag + 4} ${px + 16} ${py}` });
      const on = 1 - easeOut(seg(t, 1.9, 2.5));
      k.set(scr, { fill: on > 0.5 ? '#38486B' : '#4A5468' });
      eq.forEach((e, i) => { const hh = on * (6 + 12 * Math.abs(Math.sin(t * 8 + i * 1.7))); k.set(e, { y: 190 - hh, height: Math.max(0.1, hh), opacity: on }); });
      const pulse = on * (1 + 0.04 * Math.sin(t * 14)) + (1 - on);
      tf(spk, SPX, 200, 0, pulse, pulse);
      led.setAttribute('opacity', on > 0.3 ? 1 : 0.2);
      notes.forEach((n, i) => {
        const q = ((t + 0.4 - i * 0.55) / 1.7) % 1, qq = Math.max(0, q);
        n.setAttribute('opacity', on * Math.sin(Math.PI * qq));
        tf(n, SPX - 8 + 18 * i + 8 * Math.sin(qq * 6 + i), 140 - 60 * qq, 8 * Math.sin(qq * 5), 1.1);
      });
    }
  };
}
