// put into：まめの頭上の電池（元気）から、黄色いエネルギーが作品（模型の家）へ流れ込む。まめがハンマーで打つたびに家ができ、電池は空っぽに（例文 He put all his energy into the project.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, backOut } from '../ease.js';
import { hp, held, table } from './dig.js';
import { star } from './get-on-with.js';

export const meta = { duration: 4.6, beats: [[0, '元気いっぱい'], [1.8, '力を注ぎ込む'], [3.8, '全部注いだ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const TY = table(k, 200);
  const FY = 236;
  el('rect', { x: 40, y: 50, width: 90, height: 66, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // 模型の家（パーツが順に現れる）
  const HX = 300;
  const parts = [
    el('rect', { x: HX - 40, y: TY - 30, width: 80, height: 30, fill: pal.wood }),
    el('rect', { x: HX - 40, y: TY - 58, width: 80, height: 28, fill: '#EAD3B0' }),
    el('path', { d: `M ${HX - 50} ${TY - 56} L ${HX} ${TY - 92} L ${HX + 50} ${TY - 56} Z`, fill: pal.coral }),
    el('rect', { x: HX - 10, y: TY - 26, width: 20, height: 26, fill: pal.blue }),
    el('rect', { x: HX - 32, y: TY - 52, width: 18, height: 16, fill: '#DDEFFA' }),
    el('rect', { x: HX + 14, y: TY - 52, width: 18, height: 16, fill: '#DDEFFA' })
  ];
  const done = g({}); star(k, done, 14);
  // 電池
  const bat = g({});
  el('rect', { x: -22, y: -10, width: 44, height: 20, rx: 4, fill: '#fff', stroke: pal.ink, 'stroke-width': 2.5 }, bat);
  el('rect', { x: 22, y: -4, width: 4, height: 8, rx: 1, fill: pal.ink }, bat);
  const lvl = el('rect', { x: -19, y: -7, width: 38, height: 14, rx: 2, fill: pal.green }, bat);
  const b = k.buddy({ x: 196, y: FY, scale: 0.95 });
  const ham = g({});
  el('rect', { x: -2.5, y: 0, width: 5, height: 26, rx: 2, fill: pal.woodDark }, ham);
  el('rect', { x: -9, y: 22, width: 18, height: 10, rx: 2, fill: pal.sub }, ham);
  const bolts = [0, 1, 2].map(() => el('path', { d: 'M 0 -8 L -4 1 L 1 1 L -2 9 L 6 -2 L 1 -2 L 4 -8 Z', fill: pal.yellowDark }));
  return {
    update(t) {
      const work = seg(t, 0.4, 3.6);
      const e = 1 - work;
      k.set(lvl, { width: Math.max(0.01, 38 * e), fill: e > 0.5 ? pal.green : e > 0.2 ? pal.yellow : pal.red });
      // 打つ：腕を振り上げて振り下ろす（下ろす瞬間に体がつぶれる）
      const ph = (t - 0.4) * 2.6, beat = work > 0 && work < 1 ? ph % 1 : 0;
      const swing = beat < 0.6 ? easeInOut(beat / 0.6) : 1 - easeIn((beat - 0.6) / 0.4);
      const tired = easeInOut(seg(t, 3.6, 4.1));
      b.pose({ armR: work > 0 && work < 1 ? lerp(70, 160, swing) : lerp(70, 20, tired), armL: lerp(20, 8, tired), lean: lerp(6, 14, tired), squash: 1 - (beat > 0.95 || beat < 0.05 ? 0.05 : 0) - 0.08 * tired,
        look: 0.7, mood: tired > 0.5 ? 'flat' : 'smile', blink: tired * 0.6 });
      held(k, b, 0.95, ham, 'R', -70, 26);
      tf(bat, b.state.x, 108 + 6 * tired);
      const n = Math.min(parts.length, Math.floor(work * parts.length + 0.001 + (work > 0 ? 0.5 : 0)));
      parts.forEach((p, i) => p.setAttribute('opacity', i < Math.ceil(work * parts.length) ? 1 : 0));
      bolts.forEach((bo, i) => {
        const q = ((t * 1.3 + i / 3) % 1);
        const x = lerp(b.state.x + 10, HX, q), y = lerp(108, TY - 60, q) - Math.sin(q * Math.PI) * 30;
        k.set(bo, { transform: `translate(${x} ${y}) rotate(${q * 30})`, opacity: work > 0 && work < 1 ? Math.sin(q * Math.PI) : 0 });
      });
      const ds = seg(t, 3.6, 4.0);
      tf(done, HX + 44, TY - 96, ds * 90, backOut(ds) || 0.001); done.setAttribute('opacity', ds > 0 ? 1 : 0);
    }
  };
}
