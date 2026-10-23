// network：ノートパソコンがネットにつながらない（Wi-Fiに×・困る）（例文 My laptop can't connect to the network.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, desk, say, cloud } from './look-over.js';
import { hp, held, reach } from './dig.js';
function pz(b, S, o, R, L) { P(b, o); const a = {}; if (R) a.armR = reach(b, S, 'R', R[0], R[1]); if (L) a.armL = reach(b, S, 'L', L[0], L[1]); P(b, { ...o, ...a }); }

export const meta = { duration: 4.2, beats: [[0, '接続を試す'], [1.6, 'つながらない'], [3.0, '困った']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = roomBg(k, 'home');
  const S = 1.1;
  const b = k.buddy({ x: 175, y: FY, scale: S });
  desk(k, 280, 230, 198);
  // ルーター
  el('rect', { x: 334, y: 180, width: 44, height: 18, rx: 4, fill: '#E3E9F1', stroke: '#B9C2CF', 'stroke-width': 2 });
  el('rect', { x: 340, y: 160, width: 4, height: 20, rx: 2, fill: '#B9C2CF' });
  el('rect', { x: 368, y: 160, width: 4, height: 20, rx: 2, fill: '#B9C2CF' });
  const led = el('circle', { cx: 344, cy: 189, r: 3, fill: pal.green });
  const arcs = [0, 1, 2].map((i) => el('path', { d: `M ${-8 - i * 9} ${-8 - i * 7} Q ${-12 - i * 9} 0 ${-8 - i * 9} ${8 + i * 7}`, stroke: pal.blue, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }));
  // ノートパソコン
  el('rect', { x: 240, y: 190, width: 80, height: 8, rx: 3, fill: '#DDE3EA' });
  el('rect', { x: 248, y: 140, width: 64, height: 50, rx: 5, fill: '#3A4456' });
  el('rect', { x: 253, y: 145, width: 54, height: 40, rx: 2, fill: '#fff' });
  const wf = k.g({});
  [[12, 4], [8, 4], [4, 3.5]].forEach(([r, w], i) => el('path', { d: `M ${-r} ${-r * 0.2} Q 0 ${-r * 1.1} ${r} ${-r * 0.2}`, stroke: pal.blue, 'stroke-width': w * 0.8, fill: 'none', 'stroke-linecap': 'round', class: 'wf' + i }, wf));
  el('circle', { cx: 0, cy: 8, r: 2.6, fill: pal.blue }, wf);
  const x = k.g({}); el('path', { d: 'M-9 -9 L9 9 M9 -9 L-9 9', stroke: pal.red, 'stroke-width': 5, 'stroke-linecap': 'round' }, x);
  const q = cloud(k, 74, 48, -1);
  k.text(0, 8, '?', { 'font-size': 24, fill: pal.sub }, q.g);
  return {
    update(t) {
      const fail = seg(t, 1.6, 2.0);
      arcs.forEach((a, i) => {
        const ph = (t * 1.4 + i * 0.25) % 1;
        k.tf(a, 334, 160);
        a.setAttribute('opacity', fail ? 0.25 * (1 - ph) : Math.sin(ph * Math.PI) * 0.9);
        a.setAttribute('stroke-dasharray', fail ? '3 5' : 'none');
      });
      k.tf(wf, 280, 160 + Math.sin(t * 8) * 0);
      wf.setAttribute('opacity', fail ? 0.45 : 0.5 + 0.5 * Math.abs(Math.sin(t * 5)));
      k.tf(x, 296, 174, 0, fail > 0 ? backOut(fail) : 0.001, fail > 0 ? backOut(fail) : 0.001);
      k.set(led, { fill: fail > 0.5 ? pal.red : pal.green });
      const ph = t * 14, typing = t < 1.6;
      const sad = seg(t, 2.0, 2.4);
      pz(b, S, { x: 175, facing: 1, lean: 5 - 3 * sad, look: 1, blink: blinkAt(t), mood: sad > 0.3 ? 'sad' : 'smile' }, [236, 192 - (typing ? 4 * Math.abs(Math.sin(ph)) : 0)], null);
      q.show(seg(t, 2.7, 3.1), 150, 80);
    }
  };
}
