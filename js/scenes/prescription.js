// prescription：医者が机で処方箋（Rx）を書き、1枚ちぎって患者に渡す（例文 The doctor wrote me a prescription for the cough.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, reach, hp, coat, clinicBg } from './hospital.js';
import { desk } from './get-on-with.js';
import { drawOn } from './work-on.js';

export const meta = { duration: 4.4, beats: [[0, '処方箋を書く'], [2.0, 'ちぎって渡す'], [3.4, '受け取った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = clinicBg(k, 240);
  const doc = k.buddy({ x: 318, y: FY, scale: 0.95, facing: -1, color: pal.coral, dark: pal.coralDark });
  coat(k, doc);
  const TY = desk(k, 226, 160, FY);
  // メモ台（机の上、動かない）
  el('rect', { x: 248, y: TY - 3, width: 50, height: 4, rx: 1, fill: '#E3E8EE' });
  // 処方箋の紙（原点＝紙の中心）
  const sheet = g({});
  el('rect', { x: -22, y: -15, width: 44, height: 30, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, sheet);
  el('rect', { x: -22, y: -15, width: 44, height: 6, fill: '#BFE8C9' }, sheet);
  const rx = el('path', { d: 'M -16 6 L -16 -5 Q -9 -6 -9 -1 Q -9 2 -16 1 M -13 1 L -6 8 M -9 8 L -5 3', fill: 'none', stroke: pal.ink, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, sheet);
  const lines = [-3, 3, 9].map((y) => el('line', { x1: -2, y1: y, x2: 17, y2: y, stroke: pal.blueDark, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, sheet));
  const dRx = drawOn(rx), dL = lines.map(drawOn);
  const pen = g({}); el('line', { x1: 0, y1: 0, x2: 8, y2: -18, stroke: pal.ink, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, pen);
  const me = k.buddy({ x: 140, y: FY, scale: 0.95 });
  // せきのもくもく（このせきのための薬）
  const puff = [0, 1].map(() => el('circle', { r: 6, fill: '#DCE3EC' }));
  return {
    update(t) {
      // 書く
      dRx(easeOut(seg(t, 0.3, 1.0)));
      dL.forEach((d, i) => d(easeOut(seg(t, 1.0 + i * 0.25, 1.25 + i * 0.25))));
      const writing = t > 0.3 && t < 1.8;
      const pad = { x: 273, y: TY - 14 };
      const tear = easeInOut(seg(t, 1.9, 2.3)), give = easeInOut(seg(t, 2.3, 3.2));
      const meet = { x: 214, y: FY - 70 };
      let sp;
      if (t < 2.0) sp = pad; else sp = { x: lerp(pad.x, meet.x + 6, give), y: lerp(pad.y - 8 * tear, meet.y, give) };
      P(doc, { facing: -1, look: 0.3 + 0.2 * (t > 2.3 ? 1 : 0), mood: 'smile', lean: writing ? 12 : 6 * give });
      // ペン先の位置（文字をなぞるように）
      const wq = (t - 0.3) * 9, pt = { x: pad.x - 10 + ((t - 0.3) / 1.5) * 26 + Math.sin(wq) * 3, y: pad.y - 4 + Math.cos(wq * 1.3) * 3 };
      P(doc, { ...doc.state, armL: writing ? reach(doc, 0.95, 'L', pt.x, pt.y) : 8, armR: t < 1.9 ? 8 : reach(doc, 0.95, 'R', sp.x + 16, sp.y) });
      const ph = hp(doc, 0.95, 'L', 28);
      tf(pen, ph.x - 2, ph.y + 2, 0); pen.setAttribute('opacity', writing ? 1 : 0);
      tf(sheet, sp.x, sp.y, -8 * hump(tear) + 0, 1);
      // 患者：せき→手を出して受け取り、見る
      const cough = hump(seg(t, 0.4, 0.8));
      const look = easeOut(seg(t, 3.3, 3.8));
      P(me, { look: 0.6, mood: cough > 0.3 ? 'open' : t > 3.3 ? 'grin' : 'smile', lean: 8 * cough + 4 * give });
      const recv = reach(me, 0.95, 'R', meet.x, meet.y + 8);
      P(me, { ...me.state, armR: lerp(lerp(8, recv, easeInOut(seg(t, 2.4, 3.0))), 115, look) });
      if (t > 3.2) { const h = hp(me, 0.95, 'R', 30); tf(sheet, h.x + 8, h.y - 12, -6); }
      puff.forEach((p, i) => { const q = seg(t, 0.45 + i * 0.1, 1.1 + i * 0.1); tf(p, 172 + 28 * q + i * 8, FY - 62 - 6 * q, 0, 0.5 + q); p.setAttribute('opacity', q > 0 && q < 1 ? 1 - q : 0); });
    }
  };
}
