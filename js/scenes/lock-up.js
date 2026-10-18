// lock up：閉店後、店の明かりを消してドアに鍵をかけ、歩いて帰る（例文 He locked up the store and went home.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { held } from './dig.js';
import { path, walk, door } from './queue-up.js';

export const meta = { duration: 4.4, beats: [[0, '店の前'], [1.7, '鍵をかける'], [3.8, '家へ帰る']] };

export function storeFront(k, FY, { lit = true } = {}) {
  const { el, g, pal } = k;
  el('rect', { x: 120, y: 70, width: 270, height: FY - 70, rx: 4, fill: '#F7E3CF' });
  for (let i = 0; i < 12; i++) el('path', { d: `M ${120 + i * 22.5} 70 h 22.5 v 22 q -11 9 -22.5 0 Z`, fill: i % 2 ? '#fff' : pal.blue });
  el('rect', { x: 116, y: 64, width: 278, height: 8, rx: 3, fill: pal.blueDark });
  const win = el('rect', { x: 238, y: 112, width: 130, height: 84, rx: 4, fill: '#FFE7A8', stroke: '#fff', 'stroke-width': 4 });
  [[252, 150, pal.coral], [282, 156, pal.green], [316, 148, pal.violet], [340, 156, pal.yellow]].forEach(([x, y, c]) => el('rect', { x, y, width: 18, height: 196 - y - 8, rx: 3, fill: c, opacity: 0.8 }));
  el('rect', { x: 242, y: 186, width: 122, height: 4, fill: pal.woodDark });
  const dim = el('rect', { x: 238, y: 112, width: 130, height: 84, rx: 4, fill: '#3B4560', opacity: 0 });
  el('rect', { x: 136, y: 102, width: 84, height: FY - 102, fill: '#FFE7A8' });
  const dim2 = el('rect', { x: 136, y: 102, width: 84, height: FY - 102, fill: '#3B4560', opacity: 0 });
  const D = door(k, { x: 136, y: 102, w: 84, h: FY - 102, color: '#9CC9EE' });
  el('rect', { x: 130, y: FY - 3, width: 96, height: 6, rx: 2, fill: pal.woodDark });
  return { win, dim, dim2, D, dark: (p) => { dim.setAttribute('opacity', p * 0.75); dim2.setAttribute('opacity', p * 0.75); } };
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'evening' });
  el('circle', { cx: 60, cy: 60, r: 16, fill: '#FFD9A8' });
  const st = storeFront(k, FY);
  const lock = g({});
  el('rect', { x: -6, y: -6, width: 12, height: 12, rx: 2, fill: '#56607A' }, lock);
  el('circle', { r: 2.4, fill: '#fff' }, lock);
  tf(lock, 206, FY - 64);
  const key = g({});
  el('rect', { x: -2, y: 0, width: 4, height: 14, fill: '#E9B43A' }, key);
  el('circle', { cx: 0, cy: -3, r: 5, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, key);
  el('rect', { x: 2, y: 9, width: 4, height: 3, fill: '#E9B43A' }, key);
  const S = 0.9;
  const b = k.buddy({ x: 300, y: FY, scale: S, facing: -1 });
  const click = g({});
  [0, 60, 120, 180, 240, 300].forEach((a) => el('line', { x1: 0, y1: -10, x2: 0, y2: -15, stroke: pal.yellowDark, 'stroke-width': 2.4, 'stroke-linecap': 'round', transform: `rotate(${a})` }, click));
  const xf = path([[0.9, 300], [1.6, 256], [3.0, 256], [4.4, -40]]);
  return {
    update(t) {
      st.dark(easeInOut(seg(t, 0.2, 0.8)));
      const p = walk(b, xf, t, { facing: -1, look: -0.3, mood: t > 3.0 ? 'smile' : 'flat' });
      const at = t > 1.6 && t < 3.0;
      const turn = easeInOut(seg(t, 2.1, 2.5));
      if (at) b.pose({ armR: 90 + 6 * hump(seg(t, 1.6, 1.9)), lean: 4 });
      else if (t > 3.0) b.pose({ armR: p.armR });
      const show = t > 1.2 && t < 3.15;
      key.setAttribute('opacity', show ? 1 : 0);
      if (show) { const h = held(k, b, S, key, 'R', 0); tf(key, at ? 212 : h.x, at ? FY - 62 : h.y, at ? -90 + 90 * turn : -90); }
      const c = seg(t, 2.4, 2.8);
      click.setAttribute('opacity', c > 0 && c < 1 ? 1 - c : 0);
      tf(click, 206, FY - 64, 0, 0.6 + c);
      tf(lock, 206, FY - 64, 0, 1 + 0.25 * hump(c));
      void wobble; void easeOut;
    }
  };
}
