// bite the bullet：電話をかけるのがつらくて尻込み → 歯を食いしばって覚悟 → 受話器を取ってかける（例文 I had to bite the bullet and call him.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '電話をためらう'], [1.5, '覚悟を決める'], [2.8, '電話をかける']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'indoor' });
  // 机と電話
  el('rect', { x: 236, y: 196, width: 130, height: 12, rx: 5, fill: pal.wood });
  el('rect', { x: 246, y: 206, width: 10, height: 38, fill: pal.woodDark });
  el('rect', { x: 346, y: 206, width: 10, height: 38, fill: pal.woodDark });
  k.shadow(300, 246, 66, 4);
  const phone = g({});
  el('rect', { x: -14, y: -26, width: 28, height: 50, rx: 7, fill: pal.ink }, phone);
  el('rect', { x: -10, y: -21, width: 20, height: 36, rx: 3, fill: '#CFE3FF' }, phone);
  const waves = g({});
  for (let i = 1; i <= 2; i++) el('path', { d: `M ${8 + i * 7} ${-8 - i * 5} Q ${14 + i * 9} 0 ${8 + i * 7} ${8 + i * 5}`, fill: 'none', stroke: pal.blueDark, 'stroke-width': 3, 'stroke-linecap': 'round' }, waves);
  const sweat = el('path', { d: 'M 0 -7 Q 6 3 0 8 Q -6 3 0 -7 Z', fill: pal.water });
  const grit = g({});
  for (let i = 0; i < 3; i++) { const a = -0.7 + i * 0.7; el('line', { x1: Math.sin(a) * 52, y1: -Math.cos(a) * 52, x2: Math.sin(a) * 64, y2: -Math.cos(a) * 64, stroke: pal.coralDark, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, grit); }
  const b = k.buddy({ x: 130, y: FY, scale: 1.1 });
  return {
    update(t) {
      const hesitate = t < 1.5 ? Math.sin(t * 7) * Math.exp(-t * 0.5) : 0;
      const brace = easeInOut(seg(t, 1.5, 2.3));
      const grab = easeOut(seg(t, 2.5, 3.0));
      const ear = easeInOut(seg(t, 3.0, 3.6));
      let armR = lerp(8, 70, seg(t, 0.2, 0.7)) + 12 * hesitate;
      armR = lerp(armR, 60, brace);
      if (t > 2.5) armR = lerp(100, 170, ear) * 1;
      b.pose({
        x: 130 + 20 * easeOut(seg(t, 0.2, 0.8)) - 16 * hump(seg(t, 0.9, 1.5)) + 28 * grab,
        armR: t < 2.5 ? armR : lerp(80, 150, ear),
        armL: t < 2.5 ? lerp(8, 40, brace) : 40,
        lean: t < 1.5 ? -8 * Math.abs(hesitate) : lerp(-4, 8, grab),
        squash: 1 - 0.07 * brace * (1 - grab),
        mood: t < 1.5 ? 'sad' : t < 2.6 ? 'flat' : 'smile',
        blink: t >= 1.6 && t < 2.6 ? 1 : 0, look: 0.8
      });
      const hp = b.handPos('R');
      if (t < 2.7) tf(phone, 300, 168, 0);
      else tf(phone, lerp(300, hp.x + 6, easeOut(seg(t, 2.7, 3.1))), lerp(168, hp.y - 14, easeOut(seg(t, 2.7, 3.1))), lerp(0, 8, ear));
      const bs = t > 3.3 ? 1 : 0;
      tf(waves, ((t > 2.7 ? hp.x : 300) + 0), (t > 2.7 ? hp.y - 14 : 168) - 0, 0);
      waves.setAttribute('opacity', bs ? 0.4 + 0.6 * Math.abs(Math.sin(t * 10)) : 0);
      tf(sweat, 148, lerp(FY - 120, FY - 100, seg(t, 0.4, 1.4)));
      sweat.setAttribute('opacity', t > 0.4 && t < 2.0 ? 1 : 0);
      tf(grit, b.state.x, FY - 55, 0);
      grit.setAttribute('opacity', t > 1.7 && t < 2.5 ? 0.9 : 0);
    }
  };
}
