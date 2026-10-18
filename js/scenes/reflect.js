// reflect：波立っていた湖面がしずまり、山と空が水面にさかさまにくっきり映る（例文 The lake reflected the mountains.）
import { seg, lerp, easeInOut, easeOut } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, '山と湖'], [1.5, '波がしずまる'], [3.4, '山を映す']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const NS = 'http://www.w3.org/2000/svg';
  const HZ = 150;
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: k.gradient([[0, '#CFE9F7'], [1, '#F8FBFD']]) });
  // 実物の景色（空・山・雲）をまとめ、反射でも使い回す
  const scene = g({}); scene.setAttribute('id', 'rf-scene');
  el('circle', { cx: 318, cy: 52, r: 18, fill: '#FFE08A' }, scene);
  el('ellipse', { cx: 90, cy: 56, rx: 30, ry: 9, fill: '#fff' }, scene);
  el('ellipse', { cx: 108, cy: 50, rx: 20, ry: 9, fill: '#fff' }, scene);
  el('path', { d: `M 0 ${HZ} L 70 96 L 120 124 L 210 52 L 300 120 L 340 98 L 400 ${HZ} Z`, fill: '#8EA7D6' }, scene);
  el('path', { d: 'M 210 52 L 190 78 L 202 72 L 210 82 L 220 72 L 232 80 Z', fill: '#fff' }, scene);
  el('path', { d: 'M 70 96 L 56 116 L 66 112 L 74 120 L 84 110 Z', fill: '#fff' }, scene);
  el('path', { d: `M 0 ${HZ} L 50 128 L 110 ${HZ} Z M 250 ${HZ} L 320 120 L 400 ${HZ} Z`, fill: '#6F8FC4' }, scene);
  el('rect', { x: 0, y: HZ - 10, width: 400, height: 10, fill: '#7FB38E' }, scene);
  // 湖面
  el('rect', { x: 0, y: HZ, width: 400, height: 90, fill: '#9ED6EE' });
  const defs = k.defs;
  const fid = 'rf-f';
  const f = el('filter', { id: fid, x: '-5%', y: '-5%', width: '110%', height: '110%' }, defs);
  el('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.012 0.09', numOctaves: 1, seed: 3, result: 'n' }, f);
  const disp = el('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: 20, xChannelSelector: 'R', yChannelSelector: 'G' }, f);
  const clipId = k.clip((c) => el('rect', { x: 0, y: HZ, width: 400, height: 86 }, c));
  const refl = el('g', { 'clip-path': clipId });
  const fg = el('g', { filter: `url(#${fid})` }, refl);
  const u = document.createElementNS(NS, 'use');
  u.setAttribute('href', '#rf-scene');
  u.setAttribute('transform', `translate(0 ${HZ * 2}) scale(1 -1)`);
  fg.appendChild(u);
  // 水面のきらめき線
  const glints = [0, 1, 2, 3].map((i) => el('rect', { x: 40 + i * 90, y: HZ + 20 + (i % 2) * 24, width: 36, height: 2.4, rx: 1.2, fill: '#fff' }));
  el('rect', { x: 0, y: 236, width: 400, height: 64, fill: '#CFEBD3' });
  el('rect', { x: 0, y: 232, width: 400, height: 6, fill: '#B5DFC0' });
  const me = k.buddy({ x: 70, y: 268, scale: 1.0 });
  return {
    update(t) {
      const calm = easeInOut(seg(t, 0.4, 3.4));
      disp.setAttribute('scale', lerp(26, 0, calm).toFixed(2));
      refl.setAttribute('opacity', lerp(0.35, 0.9, calm).toFixed(3));
      glints.forEach((gl, i) => { gl.setAttribute('opacity', (1 - calm) * 0.9); gl.setAttribute('x', 40 + i * 90 + 10 * Math.sin(t * 2 + i)); });
      const pt = easeOut(seg(t, 3.3, 3.9));
      me.pose({ armR: 8 + 95 * pt, armL: 8, lean: 2, look: 1, mood: t > 3.4 ? 'open' : 'smile', blink: 0 });
    }
  };
}
