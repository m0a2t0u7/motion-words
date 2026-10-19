// valley：両側の山にはさまれた谷の底を、川が奥から手前へ流れている。展望台のまめが谷を指さす（例文 A river runs through the valley.）
import { seg, lerp, easeInOut, easeOut } from '../ease.js';
import { scene, mountain, cloudG, P, blinkAt, point } from './nature.js';

export const meta = { duration: 4.2, beats: [[0, '山と山の間'], [1.2, '谷を流れる川'], [3.0, '谷の川']] };

export function create(k) {
  const { el, tf, pal } = k, S = 0.8;
  scene(k, { FY: 300, top: '#A9D6F5', bot: '#EEF8FD' });
  tf(cloudG(k, 70, 24), 200, 40);
  mountain(k, 70, 250, 300, 190, '#8FBF95', false);
  mountain(k, 340, 250, 300, 200, '#86B78E', false);
  el('path', { d: 'M -20 300 L -20 120 Q 90 170 170 300 Z', fill: '#79AD82' });
  el('path', { d: 'M 420 300 L 420 110 Q 300 170 240 300 Z', fill: '#71A57B' });
  // 川（奥は細く、手前は広い）
  const RIV = 'M 196 120 Q 186 160 200 190 Q 214 230 186 300 L 250 300 Q 230 230 214 190 Q 202 160 204 120 Z';
  el('path', { d: RIV, fill: '#7CC8EE' });
  const flow = el('path', { d: 'M 200 122 Q 192 160 206 190 Q 222 240 214 300', stroke: '#fff', 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '10 16', opacity: 0.8 });
  // 展望台
  el('rect', { x: 20, y: 236, width: 110, height: 8, rx: 3, fill: pal.wood });
  el('path', { d: 'M 24 236 V 214 M 126 236 V 214 M 24 216 H 126', stroke: pal.woodDark, 'stroke-width': 4 });
  const b = k.buddy({ x: 70, y: 236, scale: S });
  return {
    update(t) {
      flow.setAttribute('stroke-dashoffset', (-t * 40).toFixed(1));
      const pt = easeOut(seg(t, 1.0, 1.5));
      P(b, { look: 0.6, mood: t > 2.8 ? 'grin' : 'smile', blink: blinkAt(t), armL: 10 });
      const tx = 200 + 6 * Math.sin(seg(t, 1.5, 3.5) * Math.PI), ty = lerp(140, 270, easeInOut(seg(t, 1.5, 3.5)));
      b.pose({ armR: lerp(8, point(b, S, 'R', tx, ty), pt) });
    }
  };
}
