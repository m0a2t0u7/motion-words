// 型モーション：1つの型を、語ごとの引数（登場物・向き・変化）で使い回す2D演出。
// 動作主はいつも緑のまめ（相手役はコーラルのまめ）。絵文字は「まめが持つ・見る・食べる物」としてだけ使う。
// 引数 p の形：{ t: 型, e: 物の絵文字, e2: 2つ目, dir / act / ch / mood / rel: 型ごとの種類 }
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, wobble, hump, clamp } from './ease.js';

const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
const cpOf = (s) => (s ? s.codePointAt(0) : 0);
const within = (s, rs) => { const c = cpOf(s); return rs.some((r) => c >= r[0] && c <= (r[1] ?? r[0])); };
const R_PERSON = [[0x1F466, 0x1F478], [0x1F464, 0x1F465], [0x1F9D1, 0x1F9DF], [0x1F6B4, 0x1F6B6], [0x1F3C3, 0x1F3C4], [0x1F3CA, 0x1F3CC],
  [0x1F9CD, 0x1F9CF], [0x1F938, 0x1F93E], [0x1F645, 0x1F64F], [0x1F600, 0x1F637], [0x1F641, 0x1F644], [0x1F910, 0x1F92F], [0x1F970, 0x1F97A],
  [0x1F481, 0x1F487], [0x1F926], [0x1F937], [0x1F930, 0x1F936], [0x1F47C], [0x1F9B8, 0x1F9B9]];
const R_GESTURE = [[0x261D], [0x270A, 0x270D], [0x1F440, 0x1F450], [0x1F590], [0x1F595, 0x1F596], [0x1F918, 0x1F91F], [0x1F9B4, 0x1F9BF], [0x1F4AA], [0x1F9E0], [0x1F442, 0x1F445]];
const R_ABSTRACT = [[0x2190, 0x21FF], [0x2B00, 0x2BFF], [0x27A1], [0x2934, 0x2935], [0x1F500, 0x1F504], [0x1F51A, 0x1F51D], [0x23E9, 0x23FA], [0x25B6], [0x25C0],
  [0x2728], [0x1F4A2, 0x1F4AD], [0x2705], [0x274C], [0x1F6AB], [0x267E], [0x1F4C8, 0x1F4CA], [0x1F6D1], [0x2795, 0x2797], [0x2753, 0x2757]];
const R_FOOD = [[0x1F345, 0x1F37F], [0x1F950, 0x1F96F], [0x1F9C0, 0x1F9CB], [0x1FAD0, 0x1FADB], [0x1F41F], [0x1F990]];
const R_BIG = [[0x1F3E0, 0x1F3F0], [0x1F6AA], [0x1FA9F], [0x1F6D7], [0x1F6CF], [0x1F6CB], [0x1FA91], [0x1FA9E], [0x26EA], [0x1F5FC]];
export const isPerson = (e) => !!e && within(e, R_PERSON);
const isProp = (e) => !!e && !isPerson(e) && !within(e, R_GESTURE) && !within(e, R_ABSTRACT);
const isFood = (e) => !!e && within(e, R_FOOD);
const isBig = (e) => !!e && within(e, R_BIG);
const has = (e, list) => !!e && list.some((x) => e.startsWith(x));
const pick = (e, fb) => (isProp(e) ? e : fb);

// ---------- 種類の判定（metaFor と create で共通） ----------
function variant(p) {
  const e = p.e || '';
  if (p.t === 'move') {
    const d = p.dir || 'across';
    if (has(e, ['🚉', '🚆', '🚃', '🚄', '🚂'])) return 'train';
    if (has(e, ['🌊', '💧'])) return 'flow';
    if (has(e, ['🌅', '☀', '🌄'])) return 'rise';
    if (has(e, ['🛬', '✈', '🛫'])) return 'land';
    if (has(e, ['🐦', '🕊', '🦅', '🐤', '🦋'])) return 'fly';
    if (has(e, ['🍂', '🍁', '🍃'])) return 'fall';
    if (has(e, ['🪨'])) return 'sink';
    if (has(e, ['🤿'])) return 'dive';
    if (has(e, ['🛝', '🛷'])) return 'slide';
    if (has(e, ['🐛', '👶'])) return 'crawl';
    if (has(e, ['🏋'])) return 'lift';
    if (has(e, ['✋', '🙋', '🖐'])) return 'raise';
    if (isBig(e)) return d === 'back' ? 'back' : ['in', 'through', 'toward', 'on'].includes(d) ? 'doorIn' : 'doorOut';
    if (d === 'around') return 'turn';
    if (d === 'up') return isProp(e) ? 'lift' : 'climb';
    if (d === 'down') return isProp(e) ? 'drop' : 'lower';
    if (d === 'on') return 'put';
    if (d === 'off') return 'drop';
    if (d === 'over') return 'over';
    if (d === 'in' || d === 'through') return 'doorIn';
    if (d === 'out') return 'doorOut';
    if (d === 'toward') return 'come';
    if (d === 'back') return 'back';
    if (d === 'away') return has(e, ['🏃']) ? 'flee' : isProp(e) ? 'send' : 'go';
    return isProp(e) ? 'roll' : 'cross';
  }
  if (p.t === 'act') {
    const a = p.act || 'hold';
    if (a === 'talk') return has(e, ['📢', '📣']) ? 'shout' : has(e, ['🤫']) ? 'whisper' : 'talk';
    if (a === 'look') return has(e, ['🔍', '🔎']) ? 'observe' : 'look';
    if (a === 'eat') return has(e, ['💊']) ? 'swallow' : 'eat';
    if (a === 'jump') return has(e, ['🐇']) ? 'hop' : 'jump';
    if (a === 'buy' || a === 'pay') return a;
    if (a === 'hold') return isProp(e) ? 'carry' : 'hold';
    return ['give', 'take', 'throw', 'drink', 'ask', 'think', 'sleep', 'run', 'walk', 'carry', 'wait'].includes(a) ? a : 'carry';
  }
  if (p.t === 'change') {
    const c = p.ch || 'appear';
    if (c === 'stop') return has(e, ['🛑', '🚗', '🚙', '🚌', '🏎']) ? 'brake' : 'end';
    if (c === 'start') return 'start';
    if (c === 'more' || c === 'less') return has(e, ['🏎', '🚗', '🚙']) ? 'accel' : c;
    if (c === 'grow' || c === 'shrink') return 'grow';
    if (c === 'clean' || c === 'dirty') return has(e, ['🪥']) ? 'brush' : has(e, ['🧼']) ? 'wash' : has(e, ['🧹']) ? 'sweep' : 'wipe';
    if (c === 'open') return has(e, ['🚪']) ? 'openDoor' : 'openWin';
    if (c === 'close') return 'close';
    return ['fill', 'empty', 'break', 'fix', 'heat', 'cool', 'appear', 'disappear'].includes(c) ? c : 'appear';
  }
  if (p.t === 'show') return isPerson(e) ? 'people' : isBig(e) ? 'showBig' : isFood(e) ? 'showFood' : 'showProp';
  return p.t === 'mood' || p.t === 'compare' || p.t === 'time' ? p.t : 'showProp';
}

const MOODJ = { happy: ['いいこと！', 'うれしい'], sad: ['しょんぼり', '悲しい'], angry: ['むかっ', '怒っている'], surprised: ['えっ！', 'びっくり'],
  tired: ['ふぁ〜', 'つかれた'], worried: ['どうしよう', '心配'], calm: ['深呼吸', '落ち着いた'], proud: ['できた！', '得意'],
  scared: ['ひっ！', 'こわい'], busy: ['あれもこれも', 'いそがしい'], sick: ['ぐったり', '具合が悪い'] };
const CMPJ = { bigger: ['大きくなる', 'こっちが大きい'], smaller: ['小さくなる', 'こっちが小さい'], high: ['のびていく', 'こっちが高い'],
  low: ['低くなる', 'こっちが低い'], faster: ['よーいドン', 'こっちが速い'], first: ['よーいドン', 'こっちが先'], near: ['近づく', 'こっちが近い'],
  far: ['はなれる', 'こっちが遠い'], same: ['くらべる', '同じ！'], different: ['くらべる', 'ちがう！'] };
const TIMEJ = { now: ['時の流れ', '今ここ', '今'], soon: ['今ここ', 'せまってくる', 'もうすぐ'], later: ['今ここ', '先のほう', 'あとで'],
  already: ['前にした', '今ここ', 'もう済んだ'], still: ['前から', '今も続く', 'まだ'], always: ['時の流れ', '毎回ある', 'いつも'],
  often: ['時の流れ', '何度もある', 'よく'], never: ['時の流れ', '一度もない', '決してない'], again: ['前にした', 'もう一度', 'また'],
  before: ['時の流れ', 'それより前', '前に'], after: ['時の流れ', 'それより後', '後で'], ago: ['今ここ', 'さかのぼる', '〜前に'] };
const BT = {
  doorIn: ['ドアの前', 'ドアを開ける', '中に入った'], doorOut: ['中にいる', 'ドアから出る', '外に出た'], go: ['ここから', '向こうへ行く', '行った'],
  come: ['遠くにいる', 'こちらへ来る', '着いた'], back: ['出かけた先', 'もどっていく', '家にもどった'], flee: ['囲いの中', 'ぬけ出す', '逃げきった'],
  train: ['ホームで待つ', '電車が来る', '到着した'], flow: ['川の上流', '流れていく', '海に流れ込む'], put: ['手に持つ', '上に置く', '置いた'],
  lift: ['重い荷物', 'ぐっと力を', '持ち上げた'], raise: ['手は下', '手を挙げる', '挙がった'], lower: ['大きな声', '下げていく', '小さな声'],
  drop: ['手に持つ', '手から落ちる', '床に落ちた'], climb: ['ふもと', '登っていく', '頂上に着いた'], dive: ['飛びこみ台', '飛びこむ', '水の中へ'],
  sink: ['石を落とす', 'しずんでいく', '底に着いた'], fly: ['地面にいる', '飛び立つ', '空を飛ぶ'], land: ['空から', '降りてくる', '着陸した'],
  fall: ['木の葉', '落ちてくる', '地面に落ちた'], rise: ['夜明け前', '昇ってくる', '空に昇った'], roll: ['ボールをける', '転がっていく', '車の下へ'],
  slide: ['坂の上', 'すべりおりる', '下に着いた'], crawl: ['四つんばい', 'はっていく', '向こうに着いた'], turn: ['ハンドル', '回す', '回った'],
  send: ['荷物を持つ', '送り出す', '届けに行く'], over: ['じゃまな箱', '飛びこえる', '向こう側'], cross: ['こちら側', '横切る', '向こう側'],
  give: ['プレゼント', '手わたす', '受け取った'], take: ['かさがある', '手に取る', '持って行く'], pay: ['レジで', 'お金をはらう', 'はらった'],
  buy: ['お店で', 'お金をはらう', '買えた'], throw: ['かまえる', '投げる', 'とどいた'], eat: ['いただきます', '食べる', '食べた'],
  swallow: ['薬と水', 'ごくんと飲む', '飲みこんだ'], drink: ['コップ', '飲む', '飲んだ'], look: ['なにか？', 'そちらを見る', '見ている'],
  observe: ['植物', 'じっくり見る', '観察中'], talk: ['向かい合う', '話す', '話がはずむ'], shout: ['向かい合う', '大声を出す', 'びっくり'],
  whisper: ['そっと近づく', '小声で話す', 'ないしょ話'], ask: ['疑問がある', 'たずねる', '答えてもらう'], think: ['うーん', '考える', '考え中'],
  sleep: ['ベッドで', '目を閉じる', 'ぐっすり'], walk: ['スタート', '歩いていく', '着いた'], run: ['スタート', '走っていく', 'ゴール'],
  carry: ['荷物を持つ', '運んでいく', '運んだ'], hold: ['手を出す', '手をつなぐ', 'いっしょに'], jump: ['かがむ', 'とぶ', '着地'],
  hop: ['片足立ち', 'ぴょんぴょん', '着いた'], wait: ['ここで', '待つ', 'まだ待つ'],
  brake: ['走っている', 'ブレーキ', '止まった'], end: ['続いている', '終わる', '終わった'], start: ['始まる前', 'スタート', '始まった'],
  openWin: ['閉まっている', '開ける', '開いた'], openDoor: ['閉まっている', '開ける', '開いた'], close: ['開いている', '閉める', '閉まった'],
  fill: ['からのコップ', '注ぐ', 'いっぱい'], empty: ['ごみがいっぱい', '捨てる', 'からっぽ'], break: ['コップ', '落とす', '割れた'],
  fix: ['こわれている', '直す', '直った'], wipe: ['よごれている', 'ふく', 'ぴかぴか'], sweep: ['ほこりがある', 'はく', 'ぴかぴか'],
  wash: ['よごれた手', 'あらう', 'きれい'], brush: ['歯みがき前', 'みがく', 'ぴかぴか'], heat: ['火をつける', '加熱する', 'できあがり'],
  cool: ['熱い', '冷ます', '冷めた'], grow: ['小さな芽', 'のびる', '大きく育った'], more: ['少ない', '増えていく', '増えた'],
  less: ['多い', '減っていく', '減った'], accel: ['ゆっくり', '加速する', '速くなった'], appear: ['雨上がり', '現れる', '現れた'],
  disappear: ['そこにいる', 'かくれる', '消えた'], people: ['だれかな？', '登場', 'この人たち'], showBig: ['なにかな？', '指さす', 'これ！'],
  showFood: ['なにかな？', 'ふたを開ける', 'これ！'], showProp: ['なにかな？', '布を取る', 'これ！']
};

export function metaFor(p) {
  const v = variant(p);
  let L = BT[v];
  if (v === 'mood') L = ['ふつう', ...(MOODJ[p.mood] || MOODJ.happy)];
  if (v === 'compare') L = ['2つ並べる', ...(CMPJ[p.rel] || CMPJ.bigger)];
  if (v === 'time') L = TIMEJ[p.rel] || TIMEJ.now;
  if (v === 'people' && !['👥', '👪', '👫', '👬', '👭'].some((x) => (p.e || '').startsWith(x))) L = ['だれかな？', '登場', 'この人'];
  L = L || BT.showProp;
  return { duration: 3.8, beats: [[0, L[0]], [1.0, L[1]], [2.4, L[2]]] };
}

export function create(k, p) {
  const { el, g, tf, pal, W, H } = k;
  const FY = 236;
  const e = p.e || '';
  const C2 = { color: pal.coral, dark: pal.coralDark };

  // ---------- 小道具 ----------
  const emo = (ch, size = 46, parent) => {
    const gg = g({}, parent);
    k.text(0, -size * 0.06, ch, { 'font-size': size, 'font-family': EF }, gg);
    return gg;
  };
  // 底辺が原点にくる絵文字（床やテーブルに置く用）
  const gemo = (ch, size = 46, parent) => {
    const gg = g({}, parent);
    k.text(0, -size * 0.5, ch, { 'font-size': size, 'font-family': EF }, gg);
    return gg;
  };
  const B = (x, o = {}) => {
    const w = g({}, o.parent);
    const b = k.buddy({ x, y: o.y ?? FY, scale: o.scale ?? 0.9, facing: o.facing ?? 1, color: o.color, dark: o.dark, parent: w });
    b.w = w;
    b.x0 = x;
    // pose は毎回すべての値を指定し直す（前の時刻の値が残らないように）
    const base = { x, y: o.y ?? FY, armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0, facing: o.facing ?? 1 };
    const raw = b.pose.bind(b);
    b.pose = (q) => raw({ ...base, ...q });
    // 足元を中心に奥行き方向の縮尺をかける
    b.depth = (s) => tf(w, b.state.x * (1 - s), b.state.y * (1 - s), 0, s, s);
    return b;
  };
  const stride = (t, t0, t1, x0, x1, sp = 9) => {
    const q = seg(t, t0, t1);
    const mv = t > t0 && t < t1;
    const ph = (t - t0) * sp;
    return { x: lerp(x0, x1, q * 0.7 + easeInOut(q) * 0.3), walk: mv ? ph : 0, armL: mv ? 8 + Math.sin(ph) * 22 : 8, armR: mv ? 8 - Math.sin(ph) * 22 : 8, lean: mv ? 4 : 0, mv };
  };
  const cloud = (x, y, s = 1, parent) => {
    const c = g({}, parent);
    [[0, 0, 22], [20, -8, 18], [38, 2, 16], [-18, 4, 14]].forEach(([cx, cy, r]) => el('circle', { cx, cy, r, fill: '#FFFFFF' }, c));
    tf(c, x, y, 0, s, s);
    return c;
  };
  const tuft = (x, y, c = '#9FCB8A') => el('path', { d: `M ${x - 6} ${y} Q ${x - 4} ${y - 9} ${x - 1} ${y} Q ${x + 1} ${y - 12} ${x + 3} ${y} Q ${x + 6} ${y - 8} ${x + 8} ${y}`, fill: c });
  const bgOut = (o = {}) => {
    const sky = o.sky || ['#D3EAFA', '#F3F9FD'];
    el('rect', { x: 0, y: 0, width: W, height: H, fill: k.gradient([[0, sky[0]], [1, sky[1]]]) });
    if (o.clouds !== false) { cloud(64, 58, 0.9); cloud(318, 40, 0.7); }
    const fy = o.fy ?? FY;
    if (o.hills !== false) {
      el('path', { d: `M 0 ${fy - 46} Q 70 ${fy - 96} 150 ${fy - 58} Q 230 ${fy - 24} 300 ${fy - 70} Q 360 ${fy - 98} 400 ${fy - 60} L 400 ${fy} L 0 ${fy} Z`, fill: o.hill1 || '#DDEFD8' });
      el('path', { d: `M 0 ${fy - 18} Q 110 ${fy - 52} 210 ${fy - 22} Q 300 ${fy + 2} 400 ${fy - 30} L 400 ${fy} L 0 ${fy} Z`, fill: o.hill2 || '#CBE6C2' });
    }
    el('rect', { x: 0, y: fy, width: W, height: H - fy, fill: o.ground || '#CDE6BE' });
    el('rect', { x: 0, y: fy, width: W, height: 3, fill: o.edge || '#A9D195' });
    if (o.road) { el('rect', { x: 0, y: fy + 14, width: W, height: 34, fill: '#D9D6CF' }); el('rect', { x: 0, y: fy + 14, width: W, height: 3, fill: '#C7C2B8' }); }
    if (o.tufts !== false && !o.road) [[30, fy + 22], [120, fy + 40], [250, fy + 26], [360, fy + 48], [185, fy + 58]].forEach(([x, y]) => tuft(x, y));
    return fy;
  };
  const bgRoom = (o = {}) => {
    el('rect', { x: 0, y: 0, width: W, height: H, fill: k.gradient([[0, o.wall || '#F5F0E8'], [1, o.wall2 || '#FBF8F3']]) });
    el('rect', { x: 0, y: FY - 58, width: W, height: 58, fill: o.wains || '#EEE5D7' });
    el('rect', { x: 0, y: FY - 60, width: W, height: 4, fill: '#E2D5C1' });
    el('rect', { x: 0, y: FY - 8, width: W, height: 8, fill: '#D7C4A8' });
    el('rect', { x: 0, y: FY, width: W, height: H - FY, fill: o.floor || '#E3CCA8' });
    [FY + 18, FY + 40].forEach((y, i) => {
      el('rect', { x: 0, y, width: W, height: 2, fill: '#D4BA92' });
      for (let x = (i ? 60 : 0); x < W; x += 120) el('rect', { x, y: y - (i ? 22 : 18), width: 2, height: i ? 22 : 18, fill: '#D4BA92' });
    });
    if (o.win) winFrame(o.win[0], o.win[1], o.win[2] || 70, o.win[3] || 64, o.night);
    if (o.pic) { el('rect', { x: o.pic[0], y: o.pic[1], width: 46, height: 36, rx: 3, fill: '#FFFFFF', stroke: pal.woodDark, 'stroke-width': 4 }); el('path', { d: `M ${o.pic[0] + 6} ${o.pic[1] + 30} L ${o.pic[0] + 18} ${o.pic[1] + 16} L ${o.pic[0] + 28} ${o.pic[1] + 26} L ${o.pic[0] + 34} ${o.pic[1] + 20} L ${o.pic[0] + 42} ${o.pic[1] + 30} Z`, fill: '#9ED0B6' }); }
    return FY;
  };
  const winFrame = (x, y, w, h, night) => {
    el('rect', { x: x - 5, y: y - 5, width: w + 10, height: h + 10, rx: 5, fill: '#FFFFFF', stroke: '#E1D4C0', 'stroke-width': 2 });
    el('rect', { x, y, width: w, height: h, fill: night ? k.gradient([[0, '#3E4E86'], [1, '#6E73B3']]) : k.gradient([[0, '#BFE3FA'], [1, '#E6F5FD']]) });
    if (night) { el('circle', { cx: x + w * 0.7, cy: y + h * 0.32, r: 9, fill: '#FFF3B8' }); el('circle', { cx: x + w * 0.7 + 4, cy: y + h * 0.32 - 3, r: 8, fill: '#5A639E' }); }
    else cloud(x + w * 0.35, y + h * 0.4, 0.35);
    el('rect', { x: x + w / 2 - 2, y, width: 4, height: h, fill: '#FFFFFF' });
    el('rect', { x, y: y + h / 2 - 2, width: w, height: 4, fill: '#FFFFFF' });
  };
  const table = (x, w = 120, h = 58, parent) => {
    const t = g({}, parent);
    el('rect', { x: x + 8, y: FY - h + 8, width: 8, height: h - 8, rx: 3, fill: pal.woodDark }, t);
    el('rect', { x: x + w - 16, y: FY - h + 8, width: 8, height: h - 8, rx: 3, fill: pal.woodDark }, t);
    el('rect', { x, y: FY - h, width: w, height: 11, rx: 4, fill: pal.wood }, t);
    el('rect', { x, y: FY - h + 8, width: w, height: 3, fill: pal.woodDark, opacity: 0.5 }, t);
    k.shadow(x + w / 2, FY + 2, w * 0.55, 5, t);
    return FY - h; // 天板の上の y
  };
  const spark = (parent, n = 6, r = 16, c = pal.yellow) => {
    const s = g({}, parent);
    for (let i = 0; i < n; i++) el('line', { x1: 0, y1: -r, x2: 0, y2: -r - 9, stroke: c, 'stroke-width': 3.5, 'stroke-linecap': 'round', transform: `rotate(${(i * 360) / n})` }, s);
    return s;
  };
  const star4 = (parent, c = pal.yellow, r = 9) => el('path', { d: `M 0 ${-r} Q 2 -2 ${r} 0 Q 2 2 0 ${r} Q -2 2 ${-r} 0 Q -2 -2 0 ${-r} Z`, fill: c }, parent);
  const heart = (parent, c = pal.coral) => el('path', { d: 'M 0 6 C -12 -2 -8 -12 0 -6 C 8 -12 12 -2 0 6 Z', fill: c }, parent);
  const droplet = (parent, c = '#8FD3F4') => el('path', { d: 'M 0 -8 Q 6 0 0 5 Q -6 0 0 -8 Z', fill: c }, parent);
  const puffs = (parent, n = 3) => { const s = g({}, parent); const cs = []; for (let i = 0; i < n; i++) cs.push(el('circle', { cx: 0, cy: 0, r: 6, fill: '#FFFFFF', opacity: 0.9 }, s)); return { s, cs }; };
  // 地面のけむり：q（0〜1）で広がって消える
  const setPuffs = (P, x, y, q0, dir = -1) => { const q = clamp(q0); return P.cs.forEach((c, i) => { const a = q > 0 && q < 1 ? 1 - q : 0; k.set(c, { cx: x + dir * (8 + i * 10) * (0.4 + q), cy: y - 4 - i * 3 * q, r: Math.max(0, 4 + q * (6 + i * 2)), opacity: a * 0.9 }); }); };
  const bubble = (parent, w = 70, h = 46, tailX = -14) => {
    const bb = g({}, parent);
    el('path', { d: `M ${tailX - 6} ${h / 2 - 2} L ${tailX - 14} ${h / 2 + 14} L ${tailX + 8} ${h / 2 - 2} Z`, fill: '#FFFFFF', stroke: '#C9D2DC', 'stroke-width': 2 }, bb);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 18, fill: '#FFFFFF', stroke: '#C9D2DC', 'stroke-width': 2 }, bb);
    el('rect', { x: tailX - 7, y: h / 2 - 5, width: 14, height: 5, fill: '#FFFFFF' }, bb);
    return bb;
  };
  const show = (n, on) => n.setAttribute('opacity', typeof on === 'number' ? clamp(on) : on ? 1 : 0);
  const ss = (v) => Math.max(0.001, v);
  // 家（左端 x、ドアの位置 doorOff）。open(q) でドアが開く
  const house = (x, w = 170, h = 136, o = {}) => {
    const top = FY - h, G = g({});
    const bld = o.building;
    el('rect', { x, y: top, width: w, height: h, rx: 4, fill: o.color || (bld ? '#E5EAF1' : '#FBE3D2') }, G);
    if (bld) {
      el('rect', { x: x - 6, y: top - 8, width: w + 12, height: 12, rx: 3, fill: o.roof || '#B9C3D2' }, G);
      for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) el('rect', { x: x + 14 + c * ((w - 28) / 4), y: top + 16 + r * 30, width: (w - 28) / 4 - 10, height: 20, rx: 3, fill: '#CFE9F7' }, G);
    } else {
      el('path', { d: `M ${x - 14} ${top + 6} L ${x + w / 2} ${top - 58} L ${x + w + 14} ${top + 6} Z`, fill: o.roof || pal.coral, stroke: o.roof || pal.coral, 'stroke-width': 8, 'stroke-linejoin': 'round' }, G);
      const wx = (o.doorOff ?? 0.55) > 0.5 ? x + 18 : x + w - 58;
      el('rect', { x: wx, y: top + 26, width: 40, height: 34, rx: 4, fill: '#CFE9F7', stroke: '#FFFFFF', 'stroke-width': 3 }, G);
      el('line', { x1: wx + 20, y1: top + 26, x2: wx + 20, y2: top + 60, stroke: '#FFFFFF', 'stroke-width': 3 }, G);
    }
    const dw = 56, dh = 92, dx = x + w * (o.doorOff ?? 0.55) - dw / 2;
    el('rect', { x: dx - 6, y: FY - dh - 6, width: dw + 12, height: dh + 6, rx: 5, fill: pal.woodDark }, G);
    el('rect', { x: dx, y: FY - dh, width: dw, height: dh, fill: k.gradient([[0, '#5A5049'], [1, '#7A6A5C']]) }, G);
    el('rect', { x: dx - 10, y: FY - 3, width: dw + 20, height: 6, rx: 3, fill: '#C9B79E' }, G);
    const door = g({}, G);
    const panel = g({}, door);
    el('rect', { x: 0, y: 0, width: dw, height: dh, rx: 3, fill: o.door || pal.blue }, panel);
    el('rect', { x: 8, y: 9, width: dw - 16, height: 30, rx: 3, fill: '#FFFFFF', opacity: 0.25 }, panel);
    el('rect', { x: 8, y: 47, width: dw - 16, height: 36, rx: 3, fill: '#000000', opacity: 0.06 }, panel);
    el('circle', { cx: dw - 9, cy: dh * 0.55, r: 4, fill: pal.yellow }, panel);
    tf(door, dx, FY - dh);
    return { G, dx, dw, dh, cx: dx + dw / 2, open(q) { tf(panel, 0, 0, 0, lerp(1, 0.14, q), 1); } };
  };
  const tree = (x, s = 1, colors = ['#7CC98F', '#5DB879'], parent) => {
    const T = g({}, parent);
    el('rect', { x: -7, y: -70, width: 14, height: 70, rx: 5, fill: '#B48A64' }, T);
    [[0, -100, 36], [-26, -82, 26], [26, -82, 26], [0, -126, 24]].forEach(([cx, cy, r], i) => el('circle', { cx, cy, r, fill: colors[i % 2] }, T));
    k.shadow(0, 2, 34, 6, T);
    tf(T, x, FY, 0, s, s);
    return T;
  };
  // 車（原点＝車体下中央、右向き）。wheels を回す
  const car = (color = pal.blue, dark = pal.blueDark, driver = false, parent) => {
    const C = g({}, parent);
    const sh = k.shadow(0, 2, 62, 7, C);
    const body = g({}, C);
    el('path', { d: 'M -66 -14 Q -68 -36 -50 -38 L -32 -40 L -18 -62 Q -14 -66 -6 -66 L 26 -66 Q 34 -66 38 -60 L 50 -40 Q 68 -38 68 -22 L 68 -14 Q 68 -8 62 -8 L -60 -8 Q -66 -8 -66 -14 Z', fill: color }, body);
    el('path', { d: 'M -12 -58 L 22 -58 L 34 -42 L -24 -42 Z', fill: '#DDF1FB' }, body);
    el('rect', { x: 4, y: -58, width: 3, height: 16, fill: color }, body);
    if (driver) { el('circle', { cx: 18, cy: -46, r: 9, fill: pal.mint }, body); el('circle', { cx: 21, cy: -48, r: 1.8, fill: pal.ink }, body); }
    el('rect', { x: 58, y: -32, width: 9, height: 6, rx: 2, fill: pal.yellow }, body);
    const tail = el('rect', { x: -67, y: -32, width: 6, height: 7, rx: 2, fill: '#F7A399' }, body);
    el('rect', { x: -66, y: -18, width: 134, height: 4, fill: dark, opacity: 0.5 }, body);
    const wheels = [-38, 40].map((wx) => { const wg = g({}, C); el('circle', { cx: 0, cy: 0, r: 13, fill: '#3B4252' }, wg); el('circle', { cx: 0, cy: 0, r: 5.5, fill: '#D9DFE7' }, wg); el('rect', { x: -1.5, y: -12, width: 3, height: 7, fill: '#D9DFE7' }, wg); return [wg, wx]; });
    return { C, body, tail, sh, place(x, y, dist, pitch = 0) { tf(C, x, y); tf(body, 0, 0, pitch); wheels.forEach(([wg, wx]) => tf(wg, wx, -8, (dist / 13) * 57.3)); } };
  };
  // 歩いて奥／手前へ（遠近）
  const bgPath = (fy) => el('path', { d: `M 0 ${H} L 120 ${H} L 300 ${fy - 28} L 280 ${fy - 28} Z`, fill: '#E9E3D6' });

  const fns = {
    doorIn, doorOut, go, come, back, flee, train, flow, put, lift, raise, lower, drop, climb, dive, sink, fly, land, fall, rise, roll, slide, crawl, turn, send, over, cross,
    give, take, pay, buy: pay, throw: throwIt, eat, swallow, drink, look, observe, talk, shout: talk, whisper: talk, ask: talk, think, sleep, walk: travel, run: travel,
    carry, hold, jump, hop: jump, wait,
    brake, end: curtain, start: curtain, openWin, openDoor: closeDoor, close: closeDoor, fill, empty, break: breakCup, fix, wipe: clean, sweep: clean, wash: clean, brush: clean,
    heat, cool, grow, more: chart, less: chart, accel, appear, disappear,
    people, showBig, showFood: showItem, showProp: showItem, mood, compare, time
  };
  const v = variant(p);
  const up = (fns[v] || showItem)(v);
  return { update: up };

  // =============== move ===============
  function doorIn() {
    bgOut();
    const bld = has(e, ['🏢', '🏫', '🏬', '🏥', '🏦', '🏪']);
    const Hs = house(196, 176, bld ? 150 : 132, { doorOff: 0.62, building: bld });
    const b = B(50, { scale: 0.8 });
    const stop = Hs.cx - 50;
    return (t) => {
      const s = stride(t, 0.1, 1.2, 50, stop);
      const op = easeInOut(seg(t, 1.3, 1.85)) * (1 - easeInOut(seg(t, 3.0, 3.45)));
      Hs.open(op);
      const inq = easeInOut(seg(t, 1.9, 2.8));
      const x = t < 1.9 ? s.x : lerp(stop, Hs.cx, inq);
      const walking = s.mv || (t > 1.9 && t < 2.8);
      const reach = hump(seg(t, 1.15, 1.9));
      b.pose({ x, walk: walking ? t * 9 : 0, armL: s.armL, armR: s.mv ? s.armR : 8 + reach * 75, lean: walking ? 4 : 0, look: 0.6 });
      b.depth(lerp(1, 0.86, inq));
      show(b.w, 1 - seg(t, 2.45, 2.85));
    };
  }
  function doorOut() {
    bgOut();
    const Hs = house(18, 176, 132, { doorOff: 0.6 });
    el('rect', { x: Hs.cx + 30, y: FY + 4, width: 400, height: 12, rx: 6, fill: '#E3DCCD' });
    const b = B(Hs.cx, { scale: 0.8 });
    return (t) => {
      const op = easeInOut(seg(t, 0.2, 0.8)) * (1 - easeInOut(seg(t, 2.4, 2.9)));
      Hs.open(op);
      const outq = easeOut(seg(t, 0.75, 1.3));
      const s = stride(t, 1.2, 3.5, Hs.cx, 340);
      b.pose({ x: t < 1.2 ? Hs.cx : s.x, walk: t > 0.75 && t < 3.5 ? t * 9 : 0, armL: s.armL, armR: s.armR, lean: s.lean, look: 0.6, mood: t > 3.3 ? 'grin' : 'smile' });
      b.depth(lerp(0.86, 1, outq));
      show(b.w, seg(t, 0.55, 0.85));
    };
  }
  function back() {
    bgOut({ sky: ['#F9D9C6', '#FDF1E6'], hill1: '#E9E3CF', hill2: '#DCDDBF', ground: '#D6DDBC', edge: '#BFC79F' });
    el('circle', { cx: 330, cy: 150, r: 26, fill: '#FFB07A', opacity: 0.8 });
    const Hs = house(24, 170, 132, { doorOff: 0.62 });
    const b = B(360, { scale: 0.8, facing: -1 });
    const stop = Hs.cx + 52;
    return (t) => {
      const s = stride(t, 0, 1.4, 360, stop);
      const op = easeInOut(seg(t, 1.45, 1.95)) * (1 - easeInOut(seg(t, 3.0, 3.45)));
      Hs.open(op);
      const inq = easeInOut(seg(t, 2.0, 2.85));
      const x = t < 2 ? s.x : lerp(stop, Hs.cx, inq);
      const walking = s.mv || (t > 2 && t < 2.85);
      b.pose({ x, walk: walking ? t * 9 : 0, armL: s.armL, armR: s.mv ? s.armR : 8 + hump(seg(t, 1.35, 2.0)) * 70, lean: walking ? 4 : 0, facing: -1 });
      b.depth(lerp(1, 0.86, inq));
      show(b.w, 1 - seg(t, 2.5, 2.9));
    };
  }
  function go() {
    bgOut({ hills: true });
    bgPath(FY);
    const sch = g({});
    el('rect', { x: 268, y: FY - 70, width: 80, height: 42, rx: 3, fill: '#F2E6D8' }, sch);
    el('path', { d: `M 262 ${FY - 70} L 308 ${FY - 92} L 354 ${FY - 70} Z`, fill: pal.coral }, sch);
    el('circle', { cx: 308, cy: FY - 78, r: 6, fill: '#FFFFFF', stroke: pal.ink, 'stroke-width': 1.5 }, sch);
    [276, 296, 322].forEach((x) => el('rect', { x, y: FY - 60, width: 12, height: 10, rx: 2, fill: '#CFE9F7' }, sch));
    el('rect', { x: 302, y: FY - 50, width: 12, height: 22, fill: '#8C7A6A' }, sch);
    tree(60, 0.8);
    const b = B(120, { scale: 1 });
    return (t) => {
      const q = seg(t, 0.6, 3.5);
      const qq = q * 0.75 + easeInOut(q) * 0.25;
      const x = lerp(120, 290, qq), y = lerp(FY + 50, FY - 30, qq);
      const mv = t > 0.6 && t < 3.5;
      b.pose({ x, y, walk: mv ? t * 9 : 0, armL: mv ? 8 + Math.sin(t * 9) * 20 : 8, armR: mv ? 8 - Math.sin(t * 9) * 20 : (t < 0.6 ? 8 + hump(seg(t, 0, 0.6)) * 60 : 8), look: 0.7 });
      b.depth(lerp(1, 0.34, qq));
    };
  }
  function come() {
    bgOut();
    bgPath(FY);
    const Hs = house(8, 150, 124, { doorOff: 0.5 });
    void Hs;
    const host = B(178, { ...C2, scale: 0.85, facing: 1 });
    const b = B(290, { scale: 1, facing: -1 });
    return (t) => {
      const q = seg(t, 0.4, 3.0);
      const qq = q * 0.6 + easeOut(q) * 0.4;
      const x = lerp(292, 240, qq), y = lerp(FY - 30, FY + 26, qq);
      const mv = t > 0.4 && t < 3.0;
      b.pose({ x, y, walk: mv ? t * 9 : 0, armL: mv ? 8 + Math.sin(t * 9) * 20 : 8, armR: mv ? 8 - Math.sin(t * 9) * 20 : 8 + hump(seg(t, 3.0, 3.8)) * 90, facing: -1, mood: t > 3 ? 'grin' : 'smile' });
      b.depth(lerp(0.34, 1, qq));
      const wave = t < 2.6 ? Math.sin(t * 10) * 25 : 0;
      host.pose({ armR: 150 + wave, look: 1, mood: t > 3 ? 'grin' : 'smile' });
    };
  }
  function flee() {
    bgOut();
    const W1 = g({});
    el('rect', { x: 0, y: FY - 120, width: 150, height: 120, fill: '#C9CED6' }, W1);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) el('rect', { x: 4 + c * 38 + (r % 2) * 18, y: FY - 118 + r * 24, width: 34, height: 20, rx: 2, fill: '#BDC3CC' }, W1);
    el('rect', { x: 26, y: FY - 92, width: 36, height: 30, fill: '#5A6170' }, W1);
    [34, 44, 54].forEach((x) => el('rect', { x, y: FY - 92, width: 3, height: 30, fill: '#D9DFE7' }, W1));
    el('rect', { x: 92, y: FY - 96, width: 56, height: 96, fill: '#4D5463' }, W1);
    const gate = g({});
    for (let i = 0; i < 6; i++) el('rect', { x: i * 10, y: 0, width: 3, height: 96, fill: '#8B93A3' }, gate);
    el('rect', { x: 0, y: 30, width: 56, height: 4, fill: '#8B93A3' }, gate);
    const b = B(120, { scale: 0.85 });
    const P = puffs(g({}), 3);
    const sweat = g({}); droplet(sweat);
    return (t) => {
      const go = seg(t, 0.9, 3.2);
      const x = lerp(120, 420, easeIn(go) * 0.4 + go * 0.6);
      tf(gate, 92 + easeOut(seg(t, 0.4, 0.8)) * 50, FY - 96, 0, lerp(1, 0.3, easeOut(seg(t, 0.4, 0.8))), 1);
      const mv = t > 0.9;
      b.pose({ x, walk: mv ? t * 15 : 0, lean: mv ? 14 : 0, armL: mv ? 30 + Math.sin(t * 15) * 50 : 8, armR: mv ? 30 - Math.sin(t * 15) * 50 : 8, look: t < 0.9 ? Math.sin(t * 7) : -0.8, mood: 'open', lift: mv ? Math.abs(Math.sin(t * 15)) * 5 : 0 });
      setPuffs(P, x - 30, FY, ((t - 0.9) * 2) % 1, -1);
      show(P.s, mv ? 1 : 0);
      tf(sweat, x + 26, FY - 96 - ((t * 3) % 1) * 6);
      show(sweat, mv ? 1 - ((t * 3) % 1) : 0);
    };
  }
  function train() {
    bgOut({ hills: true, tufts: false });
    const ty = 196;
    el('rect', { x: 0, y: ty + 2, width: W, height: 6, fill: '#9AA3B1' });
    for (let x = 6; x < W; x += 22) el('rect', { x, y: ty + 8, width: 12, height: 4, fill: '#B9A58C' });
    const T = g({});
    const cars = [0, 1, 2];
    cars.forEach((c) => {
      const x0 = c * 170;
      el('rect', { x: x0, y: -70, width: 164, height: 64, rx: c === 0 ? 26 : 8, fill: '#F5F7FA' }, T);
      el('rect', { x: x0, y: -30, width: 164, height: 9, fill: pal.mint }, T);
      for (let i = 0; i < 4; i++) el('rect', { x: x0 + 18 + i * 36, y: -60, width: 26, height: 22, rx: 4, fill: '#BFE2F5' }, T);
      [24, 140].forEach((wx) => el('circle', { cx: x0 + wx, cy: -4, r: 8, fill: '#4B5263' }, T));
    });
    el('rect', { x: 0, y: FY - 30, width: W, height: 78, fill: '#E2E5EA' });
    el('rect', { x: 0, y: FY - 30, width: W, height: 6, fill: '#FFD86B' });
    el('rect', { x: 0, y: FY - 24, width: W, height: 2, fill: '#C7CDD6' });
    const sign = g({});
    el('rect', { x: 332, y: FY - 130, width: 5, height: 100, fill: '#8B93A3' }, sign);
    el('rect', { x: 300, y: FY - 146, width: 70, height: 26, rx: 5, fill: '#FFFFFF', stroke: '#C7CDD6', 'stroke-width': 2 }, sign);
    el('rect', { x: 306, y: FY - 136, width: 58, height: 6, rx: 3, fill: pal.mint }, sign);
    const b = B(110, { y: FY - 4, scale: 0.85 });
    return (t) => {
      const q = easeOut(seg(t, 0.4, 2.5));
      const x = lerp(420, 30, q) + wobble(seg(t, 2.5, 3.3), 1, 5) * 3;
      tf(T, x, ty);
      b.pose({ look: t < 2.5 ? 1 : 0.4, armR: t > 2.5 ? 8 + hump(seg(t, 2.6, 3.6)) * 130 : 8, mood: t > 2.5 ? 'grin' : 'smile', lift: hump(seg(t, 2.6, 2.9)) * 6 });
    };
  }
  function flow() {
    bgOut({ hills: false, ground: '#CDE6BE' });
    el('path', { d: `M 0 150 Q 80 140 160 150 L 160 ${FY} L 0 ${FY} Z`, fill: '#CBE6C2' });
    const sea = el('path', { d: `M 250 ${FY - 50} Q 330 ${FY - 62} 400 ${FY - 58} L 400 ${H} L 230 ${H} Z`, fill: '#7FC4EA' });
    void sea;
    el('path', { d: `M -10 ${FY - 6} C 80 ${FY - 20} 120 ${FY + 40} 200 ${FY + 20} S 260 ${FY - 20} 300 ${FY - 30}`, stroke: '#8FD3F4', 'stroke-width': 34, fill: 'none', 'stroke-linecap': 'round' });
    const ripple = el('path', { d: `M -10 ${FY - 6} C 80 ${FY - 20} 120 ${FY + 40} 200 ${FY + 20} S 260 ${FY - 20} 300 ${FY - 30}`, stroke: '#FFFFFF', 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '14 26', opacity: 0.8, 'stroke-linecap': 'round' });
    const waves = g({});
    [[300, FY - 20], [350, FY + 10], [280, FY + 40]].forEach(([x, y]) => el('path', { d: `M ${x} ${y} q 8 -6 16 0 q 8 6 16 0`, stroke: '#FFFFFF', 'stroke-width': 3, fill: 'none' }, waves));
    const leaf = g({});
    el('path', { d: 'M -10 0 Q 0 -10 12 0 Q 0 8 -10 0 Z', fill: '#7CC98F' }, leaf);
    const path = (q) => { // 川に沿った位置
      const pts = [[-10, FY - 6], [80, FY - 8], [140, FY + 18], [200, FY + 20], [260, FY - 10], [330, FY - 22]];
      const f = clamp(q) * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(f)), r = f - i;
      return [lerp(pts[i][0], pts[i + 1][0], r), lerp(pts[i][1], pts[i + 1][1], r)];
    };
    const b = B(70, { y: 150, scale: 0.75 });
    return (t) => {
      ripple.setAttribute('stroke-dashoffset', -t * 40);
      const [lx, ly] = path(seg(t, 0.4, 3.3));
      tf(leaf, lx, ly, Math.sin(t * 4) * 15);
      tf(waves, Math.sin(t * 2) * 4, 0);
      b.pose({ look: 1, armR: lerp(8, 95, easeOut(seg(t, 1.0, 1.5))), mood: t > 2.6 ? 'grin' : 'smile' });
    };
  }
  function put() {
    bgRoom({ win: [40, 70], pic: [300, 70] });
    const top = table(240, 130, 62);
    const o = gemo(pick(e, '📖'), 42);
    const b = B(90, { scale: 0.9 });
    return (t) => {
      const s = stride(t, 0.2, 1.3, 90, 196);
      const place = easeInOut(seg(t, 1.4, 2.2));
      const backq = stride(t, 2.6, 3.4, 196, 170);
      const x = t < 2.6 ? s.x : backq.x;
      b.pose({ x, walk: s.mv ? s.walk : 0, armL: s.armL, armR: lerp(80, 70, place) * (1 - seg(t, 2.3, 2.6)) + 8 * seg(t, 2.3, 2.6), lean: place * 14 * (1 - seg(t, 2.3, 2.7)), look: 0.6, mood: t > 2.4 ? 'grin' : 'smile' });
      const h = b.handPos('R');
      const ox = t < 1.4 ? h.x + 8 : lerp(h.x + 8, 300, place);
      const oy = t < 1.4 ? h.y + 18 : lerp(h.y + 18, top, place);
      const land = wobble(seg(t, 2.2, 2.8), 2, 6) * 0.08;
      tf(o, ox, oy, 0, 1 + land, 1 - land);
    };
  }
  function lift() {
    bgRoom({ win: [290, 70] });
    const prop = isProp(e) && !has(e, ['🏋']) ? gemo(e, 56) : null;
    const bag = g({});
    if (!prop) {
      el('rect', { x: -40, y: -46, width: 80, height: 46, rx: 16, fill: '#8C6A9E' }, bag);
      el('path', { d: 'M -20 -46 Q -20 -66 0 -66 Q 20 -66 20 -46', stroke: '#6E5280', 'stroke-width': 6, fill: 'none' }, bag);
      el('rect', { x: -40, y: -26, width: 80, height: 5, fill: '#6E5280' }, bag);
    }
    const O = prop || bag;
    const sh = k.shadow(200, FY + 2, 44, 7);
    const b = B(200, { scale: 0.95 });
    const sweat = g({}); droplet(sweat); tf(droplet(sweat), 14, 8);
    const sh2 = k.shadow(0, 0, 1, 1); void sh2;
    return (t) => {
      const crouch = easeInOut(seg(t, 0.3, 0.9)) * (1 - easeOut(seg(t, 1.5, 2.3)));
      const strain = t > 0.9 && t < 1.5 ? Math.sin(t * 60) * 1.2 : 0;
      const up = easeInOut(seg(t, 1.5, 2.3));
      const settle = wobble(seg(t, 2.3, 3.0), 2, 5);
      const y = FY - up * 112 + settle * 3;
      b.pose({ squash: 1 - crouch * 0.16 + up * 0.02, lean: crouch * 8, armL: lerp(lerp(0, 4, crouch), 172, up), armR: lerp(lerp(0, 4, crouch), 172, up), mood: t > 0.9 && t < 2.3 ? 'flat' : t > 2.3 ? 'grin' : 'smile', blink: t > 0.9 && t < 2.2 ? 0.6 : 0 });
      tf(O, 200 + strain, y - (1 - up) * 2);
      k.set(sh, { rx: 44 * (1 - up * 0.4), opacity: 1 - up * 0.5 });
      tf(sweat, 236, FY - 108 + seg(t, 0.9, 2.2) * 14);
      show(sweat, t > 0.9 && t < 2.2 ? 1 : 0);
    };
  }
  function raise() {
    bgRoom({ wains: '#EAEFE6' });
    const bd = g({});
    el('rect', { x: 60, y: 40, width: 280, height: 110, rx: 6, fill: '#3F6B5C', stroke: pal.woodDark, 'stroke-width': 6 }, bd);
    k.text(200, 95, '?', { 'font-size': 54, fill: '#FFFFFF', opacity: 0.85 }, bd);
    el('rect', { x: 250, y: 140, width: 30, height: 6, rx: 2, fill: '#FFFFFF' }, bd);
    const desk = g({});
    const b = B(200, { scale: 0.95 });
    el('rect', { x: 140, y: FY - 44, width: 120, height: 10, rx: 4, fill: pal.wood }, desk);
    el('rect', { x: 150, y: FY - 36, width: 100, height: 36, fill: pal.woodDark }, desk);
    const mark = g({});
    el('path', { d: 'M -3 -18 L 3 -18 L 2 4 L -2 4 Z', fill: pal.coral }, mark);
    el('circle', { cx: 0, cy: 12, r: 3.4, fill: pal.coral }, mark);
    return (t) => {
      const q = backOut(seg(t, 1.0, 1.6));
      const wig = t > 1.6 ? Math.sin(t * 12) * 6 * (1 - seg(t, 1.6, 3)) : 0;
      b.pose({ armR: lerp(8, 172, q) + wig, lift: hump(seg(t, 1.0, 1.5)) * 6, mood: t > 1.2 ? 'grin' : 'smile', look: 0 });
      tf(mark, 268, 60 + (1 - q) * 10, 0, ss(backOut(seg(t, 1.5, 1.9))), ss(backOut(seg(t, 1.5, 1.9))));
    };
  }
  function lower() {
    bgRoom({ pic: [300, 64] });
    const b = B(130, { scale: 1 });
    const arcs = g({});
    const A = [0, 1, 2].map((i) => el('path', { d: `M 0 ${-14 - i * 12} Q ${12 + i * 10} 0 0 ${14 + i * 12}`, stroke: pal.coral, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, arcs));
    const meter = g({});
    const bars = [0, 1, 2, 3, 4].map((i) => el('rect', { x: 280 + i * 18, y: 0, width: 12, height: 0, rx: 3, fill: i > 2 ? pal.coral : pal.mint }, meter));
    el('rect', { x: 272, y: 196, width: 98, height: 4, rx: 2, fill: '#C9BBA6' }, meter);
    return (t) => {
      const q = easeInOut(seg(t, 1.0, 2.5));
      const lvl = lerp(5, 1.3, q);
      b.pose({ mood: q < 0.5 ? 'grin' : 'smile', armR: lerp(95, 60, q) + Math.sin(t * 6) * 6 * seg(t, 0.8, 2.5), armL: 8, look: 0.5 });
      tf(arcs, 182, FY - 62, 0, lerp(1.25, 0.55, q), lerp(1.25, 0.55, q));
      A.forEach((a, i) => show(a, (i < lvl - 1.5 ? 1 : 0.15) * (0.6 + 0.4 * Math.sin(t * 10 - i))));
      bars.forEach((r, i) => { const hgt = i < lvl ? 20 + i * 14 : 6; k.set(r, { y: 196 - hgt, height: hgt, opacity: i < lvl ? 1 : 0.3 }); });
    };
  }
  function drop() {
    bgRoom({ win: [280, 60] });
    const o = gemo(pick(e, '📱'), 40);
    const sh = k.shadow(0, 0, 18, 4);
    const lines = g({});
    for (let i = 0; i < 3; i++) el('line', { x1: -20 + i * 20, y1: -4, x2: -28 + i * 28, y2: -16, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }, lines);
    const b = B(170, { scale: 0.95 });
    return (t) => {
      b.pose({ armR: t < 1.0 ? lerp(8, 80, easeOut(seg(t, 0.2, 0.7))) : 80 + seg(t, 1.0, 1.15) * 20, mood: t > 1.1 ? 'open' : 'smile', look: t > 1.1 ? 0.6 : 0.3, lean: t > 1.2 ? 8 : 0 });
      const h = b.handPos('R');
      const fq = seg(t, 1.05, 1.6);
      const y0 = h.y + 16;
      let y = lerp(y0, FY, easeIn(fq)), x = h.x + 6 + fq * 30, r = fq * 160;
      if (t > 1.6) { const bq = seg(t, 1.6, 2.1); y = FY - hump(bq) * 14; x = h.x + 36 + bq * 10; r = 160 + bq * 20; }
      if (t > 2.1) { r = 180; x = h.x + 46; y = FY; }
      const sq = wobble(seg(t, 1.6, 2.4), 2, 5) * 0.15;
      tf(o, x, y - (r > 90 ? 0 : 0), r > 170 ? 180 : r, 1 + sq, 1 - sq);
      if (r > 170) tf(o, x, y - 40, 180, 1 + sq, 1 - sq);
      tf(sh, x, FY + 2, 0, 0.4 + fq * 0.6, 1);
      tf(lines, x, FY - 10);
      show(lines, t > 1.6 && t < 2.2 ? 1 - seg(t, 1.6, 2.2) : 0);
    };
  }
  function climb() {
    bgOut({ hills: false });
    const M = g({});
    el('path', { d: `M 40 ${FY} L 260 70 L 400 ${FY - 40} L 400 ${FY} Z`, fill: '#A8C8A0' }, M);
    el('path', { d: 'M 260 70 L 222 116 L 238 110 L 252 122 L 268 108 L 286 118 L 296 104 Z', fill: '#FFFFFF' }, M);
    el('path', { d: `M 40 ${FY} L 260 70`, stroke: '#E7DCC6', 'stroke-width': 8, 'stroke-dasharray': '2 10', 'stroke-linecap': 'round' }, M);
    const flag = g({});
    el('rect', { x: 0, y: -46, width: 3, height: 46, fill: pal.ink }, flag);
    const fl = el('path', { d: 'M 3 -46 L 30 -38 L 3 -30 Z', fill: pal.coral }, flag);
    tf(flag, 266, 72);
    const b = B(60, { scale: 0.75 });
    return (t) => {
      const q = seg(t, 0.5, 3.0);
      const qq = q * 0.8 + easeInOut(q) * 0.2;
      const x = lerp(60, 252, qq), y = lerp(FY - 8, 74, qq);
      const mv = t > 0.5 && t < 3.0;
      const top = t > 3.0;
      b.pose({ x, y, walk: mv ? t * 8 : 0, lean: mv ? 18 : 0, armL: mv ? 30 + Math.sin(t * 8) * 30 : top ? 160 : 8, armR: mv ? 30 - Math.sin(t * 8) * 30 : top ? 160 : 8, mood: top ? 'grin' : mv ? 'flat' : 'smile', lift: top ? hump(seg(t, 3.0, 3.4)) * 10 : 0 });
      k.set(fl, { d: `M 3 -46 Q 16 ${-46 + Math.sin(t * 6) * 3} 30 -38 Q 16 ${-30 + Math.sin(t * 6) * 3} 3 -30 Z` });
    };
  }
  function water(x0, sy, opts = {}) { // 断面の水（奥・手前）
    const back = el('rect', { x: x0, y: sy, width: W - x0, height: H - sy, fill: opts.c || '#6FC0E8' });
    const front = el('rect', { x: x0, y: sy, width: W - x0, height: H - sy, fill: '#5BB3E0', opacity: 0.0 });
    return { back, front };
  }
  function dive() {
    bgOut({ hills: false, tufts: false, ground: '#E9EEF2', edge: '#D5DDE5' });
    const sy = 200;
    el('rect', { x: 140, y: sy - 4, width: 260, height: H, fill: '#BFE5F7' });
    el('rect', { x: 0, y: sy - 4, width: 140, height: H, fill: '#E9EEF2' });
    el('rect', { x: 20, y: 120, width: 128, height: 10, rx: 4, fill: '#FFFFFF', stroke: '#C9D2DC', 'stroke-width': 2 });
    el('rect', { x: 28, y: 130, width: 12, height: 70, fill: '#C9D2DC' });
    const wr = g({});
    const b = B(0, { y: 0, scale: 0.75, parent: wr });
    const front = el('rect', { x: 140, y: sy, width: 260, height: H - sy, fill: '#58B4E2', opacity: 0.55 });
    el('rect', { x: 140, y: sy - 2, width: 260, height: 4, fill: '#FFFFFF', opacity: 0.7 });
    const splash = g({});
    const dropsS = [0, 1, 2, 3, 4].map(() => droplet(splash, '#9ED8F5'));
    const bub = g({});
    const bs = [0, 1, 2].map(() => el('circle', { r: 4, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 2 }, bub));
    return (t) => {
      const crouch = hump(seg(t, 0.5, 1.1));
      const fq = seg(t, 1.0, 1.9);
      let x = 120, y = 120, rot = 0;
      if (t > 1.0) { x = lerp(120, 280, fq); y = 120 - hump(fq * 0.8) * 50 + easeIn(fq) * 90; rot = easeInOut(fq) * 155; }
      if (t > 1.9) { const q = easeOut(seg(t, 1.9, 2.8)); x = 280 + q * 12; y = 210 + q * 40; rot = 155 + q * 10; }
      tf(wr, x, y, rot);
      b.pose({ x: 0, y: 0, squash: 1 - crouch * 0.15, armL: t > 0.9 ? 175 : 8 + crouch * 20, armR: t > 0.9 ? 175 : 8 + crouch * 20, lean: crouch * 10, mood: t > 1.9 ? 'flat' : 'smile', blink: t > 1.9 ? 1 : 0 });
      void front;
      const sq = seg(t, 1.85, 2.6);
      dropsS.forEach((d, i) => { const a = (i - 2) * 0.5; tf(d, 280 + Math.sin(a) * 60 * sq, sy - Math.cos(a) * 60 * hump(sq) + 10 * sq); show(d, sq > 0 && sq < 1 ? 1 : 0); });
      bs.forEach((c, i) => { const q = ((t - 2.2 - i * 0.3) * 0.8) % 1; k.set(c, { cx: 290 + i * 8 + Math.sin(t * 5 + i) * 3, cy: 280 - q * 70, opacity: t > 2.2 + i * 0.3 ? 0.9 : 0 }); });
    };
  }
  function sink() {
    const fy = 190;
    bgOut({ fy, hills: false });
    const sy = 198;
    el('rect', { x: 150, y: sy, width: 250, height: H - sy, fill: k.gradient([[0, '#8FD3F4'], [1, '#4F9FCF']]) });
    el('path', { d: `M 150 ${H} L 150 280 Q 260 270 400 284 L 400 ${H} Z`, fill: '#D8C59F' });
    el('rect', { x: 150, y: fy, width: 250, height: 8, fill: '#8FD3F4' });
    el('path', { d: `M 140 ${fy} Q 156 ${fy + 20} 150 ${H}`, stroke: '#A9D195', 'stroke-width': 6, fill: 'none' });
    const stone = g({});
    el('path', { d: 'M -14 6 Q -16 -8 -2 -10 Q 14 -10 15 2 Q 14 10 0 10 Q -12 10 -14 6 Z', fill: '#8E96A3' }, stone);
    el('path', { d: 'M -6 -5 Q 0 -8 6 -6', stroke: '#B7BEC9', 'stroke-width': 2.5, fill: 'none' }, stone);
    el('rect', { x: 150, y: sy, width: 250, height: H - sy, fill: '#4F9FCF', opacity: 0.25 });
    const ring = el('ellipse', { cx: 270, cy: fy + 4, rx: 0, ry: 0, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 2.5 });
    const bub = g({});
    const bs = [0, 1, 2, 3].map(() => el('circle', { r: 3.5, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 1.8 }, bub));
    const b = B(80, { y: fy, scale: 0.8 });
    return (t) => {
      b.pose({ armR: t < 0.9 ? lerp(8, 70, easeOut(seg(t, 0.2, 0.6))) : lerp(120, 60, seg(t, 0.9, 1.3)), look: t > 1.2 ? 0.8 : 0.4, lean: t > 1.2 ? 10 : 0, mood: t > 2.6 ? 'open' : 'smile' });
      const h = b.handPos('R');
      const tq = seg(t, 0.9, 1.4);
      let x = h.x + 6, y = h.y + 8;
      if (t > 0.9) { x = lerp(h.x + 6, 270, tq); y = lerp(h.y, fy + 4, tq) - hump(tq) * 40; }
      if (t > 1.4) { const q = easeOut(seg(t, 1.4, 3.2)); x = 270 + Math.sin(q * 8) * 6 * (1 - q); y = lerp(fy + 4, 276, q); }
      tf(stone, x, y, t > 1.4 ? (y - fy) * 0.6 : tq * 90);
      const rq = seg(t, 1.4, 2.6);
      k.set(ring, { rx: rq * 60, ry: rq * 8, opacity: rq > 0 ? 1 - rq : 0 });
      bs.forEach((c, i) => { const ph = (t * 0.9 + i * 0.27) % 1; k.set(c, { cx: x + Math.sin(t * 6 + i) * 4, cy: y - 10 - ph * (y - fy - 6), opacity: t > 1.5 && y > fy + 20 ? 1 - ph : 0 }); });
    };
  }
  function fly() {
    bgOut();
    tree(320, 0.9);
    const ch = pick(e, '🐦');
    const birds = [[300, 160, 1], [334, 168, 0.85], [356, 150, 0.75]].map(([x, y, s]) => { const G = g({}); const o = emo(ch, 34, G); tf(o, 0, 0, 0, -1, 1); return [G, x, y, s]; });
    const b = B(110, { scale: 0.9 });
    return (t) => {
      birds.forEach(([G, x0, y0, s], i) => {
        const q = seg(t, 0.9 + i * 0.25, 3.3 + i * 0.25);
        const x = x0 - q * 220 - i * 10 * q, y = y0 - easeIn(q) * 30 - easeOut(q) * 110 + Math.sin(t * 9 + i) * 4 * q;
        const flap = q > 0 ? 1 + Math.sin(t * 30 + i) * 0.18 : 1;
        tf(G, x, y, q > 0 ? -18 * (1 - q) : 0, s * (1 - q * 0.35), s * flap * (1 - q * 0.35));
      });
      b.pose({ look: t < 1.2 ? 1 : 0.2, armR: lerp(8, 150, easeOut(seg(t, 1.2, 1.8))), mood: t > 1.6 ? 'open' : 'smile' });
    };
  }
  function land() {
    bgOut({ hills: true, tufts: false });
    el('rect', { x: 0, y: FY + 8, width: W, height: 28, fill: '#9AA3B1' });
    for (let x = 10; x < W; x += 50) el('rect', { x, y: FY + 20, width: 26, height: 4, fill: '#FFFFFF' });
    const P = g({});
    const pl = g({}, P);
    el('path', { d: 'M -70 -10 Q -74 -26 -56 -28 L 50 -28 Q 76 -26 80 -14 Q 76 -2 50 0 L -56 0 Q -70 -2 -70 -10 Z', fill: '#FFFFFF', stroke: '#C9D2DC', 'stroke-width': 2 }, pl);
    el('path', { d: 'M -60 -26 L -76 -54 L -56 -54 L -40 -28 Z', fill: pal.blue }, pl);
    el('path', { d: 'M -6 -12 L -30 22 L -12 22 L 20 -12 Z', fill: '#E3E8EF' }, pl);
    for (let i = 0; i < 6; i++) el('circle', { cx: -36 + i * 14, cy: -18, r: 3.2, fill: '#BFE2F5' }, pl);
    el('path', { d: 'M 62 -20 Q 72 -20 76 -14 L 60 -14 Z', fill: '#BFE2F5' }, pl);
    el('rect', { x: -70, y: -14, width: 140, height: 3, fill: pal.blue }, pl);
    el('circle', { cx: -16, cy: 6, r: 5, fill: '#3B4252' }, pl);
    el('circle', { cx: 50, cy: 6, r: 4, fill: '#3B4252' }, pl);
    const sh = k.shadow(0, 0, 70, 6);
    const Pf = puffs(g({}), 3);
    const fence = g({});
    for (let x = 0; x < W; x += 20) el('rect', { x, y: FY - 26, width: 3, height: 30, fill: '#B9C3D2' }, fence);
    el('rect', { x: 0, y: FY - 20, width: W, height: 3, fill: '#B9C3D2' }, fence);
    const b = B(330, { y: FY + 50, scale: 0.75, facing: -1 });
    return (t) => {
      const q = seg(t, 0.2, 2.0);
      let x = lerp(-60, 170, easeOut(q) * 0.3 + q * 0.7), y = lerp(80, FY + 2, easeInOut(q)), r = lerp(10, 0, easeOut(q));
      if (t > 2.0) { const r2 = easeOut(seg(t, 2.0, 3.4)); x = 170 + r2 * 100; y = FY + 2 - Math.abs(wobble(seg(t, 2.0, 2.6), 1.5, 5)) * 6; r = -wobble(seg(t, 2.0, 2.7), 1, 5) * 2; }
      tf(P, x, y - 8);
      tf(pl, 0, 0, r);
      tf(sh, x, FY + 14, 0, 0.3 + 0.7 * easeIn(q), 1);
      setPuffs(Pf, x - 10, FY + 12, seg(t, 2.0, 2.8), -1);
      b.pose({ armR: 140 + Math.sin(t * 10) * 25, look: -0.8, mood: t > 2 ? 'grin' : 'smile' });
    };
  }
  function fall() {
    bgOut({ sky: ['#F6E6CF', '#FDF7EE'], hill1: '#EADFC4', hill2: '#E2D7B5', ground: '#DCD5B3', edge: '#C5BC93' });
    tree(150, 1.15, ['#F2A65A', '#E5874A']);
    const ch = isProp(e) && !has(e, ['🍂', '🍁', '🍃']) ? e : null;
    const leaves = [[120, 110, 0], [176, 96, 0.4], [140, 130, 0.8], [200, 120, 1.1], [104, 140, 0.25]].map(([x, y, d], i) => {
      const L = g({});
      if (ch) emo(ch, 26, L); else { el('path', { d: 'M -11 0 Q 0 -11 11 0 Q 0 9 -11 0 Z', fill: i % 2 ? '#E5874A' : '#E9B43A' }, L); el('line', { x1: -11, y1: 0, x2: 11, y2: 0, stroke: '#B8652E', 'stroke-width': 1.4 }, L); }
      return [L, x, y, d];
    });
    const b = B(300, { scale: 0.9, facing: -1 });
    return (t) => {
      leaves.forEach(([L, x0, y0, d], i) => {
        const q = seg(t, 0.6 + d, 2.8 + d * 0.6);
        const y = lerp(y0, FY + 6 + (i % 3) * 8, q * q * 0.4 + q * 0.6);
        const x = x0 + Math.sin(q * 9 + i) * 22 * (1 - q * 0.5) + q * 60;
        tf(L, x, y, q < 1 ? Math.sin(q * 9 + i) * 45 : 10 * i);
      });
      b.pose({ facing: -1, armL: 8, armR: lerp(8, 110, easeOut(seg(t, 1.2, 1.8))), look: t > 1 ? 0.6 : 0, mood: t > 2 ? 'grin' : 'smile' });
    };
  }
  function rise() {
    const sky = el('rect', { x: 0, y: 0, width: W, height: H, fill: k.gradient([[0, '#4E5C9E'], [1, '#C28BB3']]) });
    const day = el('rect', { x: 0, y: 0, width: W, height: H, fill: k.gradient([[0, '#BFE3FA'], [0.7, '#FFE3C4'], [1, '#FFD3A6']]) });
    const sunG = g({});
    const rays = spark(sunG, 12, 40, '#FFD86B');
    el('circle', { cx: 0, cy: 0, r: 32, fill: k.gradient([[0, '#FFE27A'], [1, '#FFB25A']]) }, sunG);
    el('path', { d: `M 0 ${FY - 30} Q 90 ${FY - 90} 190 ${FY - 40} Q 280 ${FY - 80} 400 ${FY - 50} L 400 ${H} L 0 ${H} Z`, fill: '#6C8F7E' });
    el('path', { d: `M 0 ${FY} Q 140 ${FY - 30} 400 ${FY - 6} L 400 ${H} L 0 ${H} Z`, fill: '#86AD8F' });
    const b = B(90, { y: FY + 22, scale: 0.85 });
    const shade = el('rect', { x: 0, y: 0, width: W, height: H, fill: '#2A3060', opacity: 0.25 });
    return (t) => {
      const q = easeInOut(seg(t, 0.6, 3.0));
      show(day, q);
      void sky;
      tf(sunG, 250, lerp(FY + 10, 70, q));
      show(rays, seg(t, 1.6, 2.6));
      tf(rays, 0, 0, t * 15);
      show(shade, 0.35 * (1 - q));
      const st = easeOut(seg(t, 2.4, 3.1));
      b.pose({ armL: 8 + st * 160, armR: 8 + st * 160, look: 0.8, mood: t > 2.4 ? 'grin' : 'smile', squash: 1 + st * 0.04 });
    };
  }
  function roll() {
    bgOut({ road: true, tufts: false });
    const ball = g({});
    emo(pick(e, '⚽'), 34, ball);
    const bsh = k.shadow(0, 0, 14, 3);
    const Car = car(pal.coral, pal.coralDark);
    Car.place(312, FY + 34, 0);
    const b = B(70, { y: FY + 30, scale: 0.85 });
    return (t) => {
      const kick = hump(seg(t, 0.4, 0.9));
      b.pose({ lean: -kick * 10, armL: 8 + kick * 40, armR: 8 + kick * 40, lift: kick * 4, look: 0.7, mood: t > 2.5 ? 'open' : 'smile' });
      const q = easeOut(seg(t, 0.75, 2.8));
      const x = lerp(112, 300, q);
      tf(ball, x, FY + 16, (x - 112) / 17 * 57.3);
      tf(bsh, x, FY + 34);
      void Car;
    };
  }
  function slide() {
    bgOut({ sky: ['#DDEBF7', '#F6FAFD'], hills: false, ground: '#F7FAFC', edge: '#DDE6EE', tufts: false });
    el('path', { d: `M 0 70 Q 60 74 110 110 L 250 ${FY - 4} Q 280 ${FY} 300 ${FY} L 0 ${FY} Z`, fill: '#FFFFFF', stroke: '#DDE6EE', 'stroke-width': 3 });
    el('path', { d: `M 0 70 Q 60 74 110 110 L 250 ${FY - 4} Q 280 ${FY} 300 ${FY} L 0 ${FY} Z`, fill: '#EEF4F9', opacity: 0.5, transform: 'translate(0 18)' });
    tree(40, 0.5, ['#7CC98F', '#5DB879']);
    const wr = g({});
    const sled = g({});
    const b = B(0, { y: 0, scale: 0.7, parent: wr });
    el('rect', { x: -34, y: -14, width: 68, height: 10, rx: 4, fill: pal.red }, sled);
    el('path', { d: 'M -38 0 L 34 0 Q 46 0 46 -12', stroke: '#8B93A3', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, sled);
    wr.appendChild(sled);
    const snow = puffs(g({}), 3);
    // 坂の形に沿う
    const path = (q) => {
      if (q < 0.15) { const r = q / 0.15; return [lerp(40, 110, r), lerp(72, 110, r * r), lerp(4, 34, r)]; }
      if (q < 0.75) { const r = (q - 0.15) / 0.6; return [lerp(110, 250, r), lerp(110, FY - 4, r), 40]; }
      const r = (q - 0.75) / 0.25; return [lerp(250, 340, r), lerp(FY - 4, FY, Math.min(1, r * 2)), lerp(40, 0, Math.min(1, r * 2))];
    };
    return (t) => {
      const q = seg(t, 0.7, 3.0);
      const d = easeIn(seg(q, 0, 0.75)) * 0.75 + (q > 0.75 ? easeOut((q - 0.75) / 0.25) * 0.25 : 0);
      const [x, y, r] = path(d);
      tf(wr, x, y, r * 0.9);
      b.pose({ x: 0, y: -4, squash: 0.86, armL: 60, armR: q > 0.1 && q < 0.9 ? 150 : 60, lean: -6, mood: q > 0.1 ? 'grin' : 'smile' });
      setPuffs(snow, x - 30, y + 4, ((t - 0.7) * 3) % 1, -1);
      show(snow.s, q > 0.2 && q < 0.95 ? 1 : 0);
    };
  }
  function crawl() {
    bgRoom({ win: [60, 64], pic: [300, 70] });
    el('ellipse', { cx: 200, cy: FY + 30, rx: 170, ry: 22, fill: '#F2D9D0' });
    const goal = g({});
    emo('🧸', 40, goal); tf(goal, 350, FY - 10);
    const b = B(60, { scale: 0.8 });
    return (t) => {
      const q = seg(t, 0.6, 3.3);
      const x = lerp(60, 290, q);
      const mv = t > 0.6 && t < 3.3;
      const ph = (t - 0.6) * 7;
      b.pose({ x, lean: 58, squash: 0.92, walk: mv ? ph : 0, armL: 58 + (mv ? Math.sin(ph) * 22 : 0), armR: 58 - (mv ? Math.sin(ph) * 22 : 0), lift: -6, look: 1, mood: t > 3.2 ? 'grin' : 'smile' });
    };
  }
  function turn() {
    bgRoom({ wains: '#E6ECEF', wall: '#EEF2F3' });
    el('rect', { x: 0, y: 140, width: W, height: 18, fill: '#B9C3D2' });
    el('rect', { x: 242, y: 120, width: 26, height: 58, rx: 4, fill: '#9AA6B6' });
    const wh = g({});
    el('circle', { cx: 0, cy: 0, r: 46, fill: 'none', stroke: pal.red, 'stroke-width': 10 }, wh);
    [0, 120, 240].forEach((a) => el('rect', { x: -4, y: -46, width: 8, height: 46, fill: pal.red, transform: `rotate(${a})` }, wh));
    el('circle', { cx: 0, cy: 0, r: 10, fill: '#C9475A' }, wh);
    el('circle', { cx: 0, cy: -46, r: 7, fill: pal.yellow }, wh);
    tf(wh, 255, 149);
    const arr = el('path', { d: '', stroke: pal.blueDark, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' });
    const head = el('path', { d: 'M -8 -6 L 6 0 L -8 6 Z', fill: pal.blueDark });
    const b = B(150, { scale: 0.95 });
    return (t) => {
      const q = easeInOut(seg(t, 1.0, 2.6));
      const ang = q * 180;
      tf(wh, 255, 149, ang);
      const a = ((ang - 90) * Math.PI) / 180;
      const hx = 255 + Math.cos(a) * 46, hy = 149 + Math.sin(a) * 46;
      // 手を取っ手に向ける
      const sx = 150 + 27 * 0.95, sy = FY - 66 * 0.95;
      const armAng = (Math.atan2(hx - sx, -(hy - sy)) * 180) / Math.PI;
      b.pose({ x: 150 + (t > 0.5 ? Math.min(30, (t - 0.5) * 60) : 0), armR: t > 0.9 ? 180 - armAng : lerp(8, 180 - 30, seg(t, 0.4, 0.9)), lean: t > 0.9 ? 6 : 0, mood: t > 2.6 ? 'grin' : 'flat', look: 0.8 });
      const sh = seg(t, 1.0, 1.4);
      const R = 68, s0 = -60, s1 = lerp(-60, 80, seg(t, 1.0, 2.6));
      const p0 = [255 + R * Math.cos((s0 * Math.PI) / 180), 149 + R * Math.sin((s0 * Math.PI) / 180)];
      const p1 = [255 + R * Math.cos((s1 * Math.PI) / 180), 149 + R * Math.sin((s1 * Math.PI) / 180)];
      k.set(arr, { d: `M ${p0[0]} ${p0[1]} A ${R} ${R} 0 0 1 ${p1[0]} ${p1[1]}`, opacity: sh });
      head.setAttribute('transform', `translate(${p1[0]} ${p1[1]}) rotate(${s1 + 90})`);
      show(head, sh);
    };
  }
  function send() {
    const box = has(e, ['📦']);
    bgOut({ road: box, tufts: !box });
    const truck = g({});
    if (box) {
      el('rect', { x: -60, y: -82, width: 92, height: 74, rx: 6, fill: '#FFFFFF', stroke: '#C9D2DC', 'stroke-width': 2 }, truck);
      el('rect', { x: -52, y: -60, width: 76, height: 10, fill: pal.mint }, truck);
      el('path', { d: 'M 34 -60 L 60 -60 Q 72 -60 76 -44 L 78 -8 L 34 -8 Z', fill: pal.mint }, truck);
      el('rect', { x: 46, y: -54, width: 20, height: 14, rx: 3, fill: '#DDF1FB' }, truck);
      [-36, 54].forEach((x) => { el('circle', { cx: x, cy: -6, r: 11, fill: '#3B4252' }, truck); el('circle', { cx: x, cy: -6, r: 4.5, fill: '#D9DFE7' }, truck); });
    }
    const o = gemo(pick(e, '📨'), 40);
    const trail = el('path', { d: '', stroke: '#FFFFFF', 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '4 8', opacity: 0.9 });
    const b = B(110, { y: box ? FY + 30 : FY, scale: 0.9 });
    return (t) => {
      const push = easeOut(seg(t, 0.6, 1.2));
      b.pose({ armR: lerp(80, 110, push) - (t > 1.4 ? lerp(0, 40, seg(t, 1.4, 1.8)) : 0) + (t > 2.2 ? Math.sin(t * 10) * 25 + 60 : 0), lean: push * 10 * (1 - seg(t, 1.3, 1.8)), look: 0.8, mood: t > 2.2 ? 'grin' : 'smile' });
      const h = b.handPos('R');
      if (box) {
        const tx = 300 + easeIn(seg(t, 1.9, 3.5)) * 260;
        tf(truck, tx, FY + 30);
        const q = easeInOut(seg(t, 0.6, 1.4));
        const ox = lerp(h.x + 10, 270, q), oy = lerp(h.y + 20, FY - 22, q) - hump(q) * 30;
        tf(o, t > 1.4 ? tx - 30 : ox, t > 1.4 ? FY - 22 + 28 : oy + (t > 1.4 ? 0 : 0), 0, t > 1.4 ? 0.8 : 1);
        show(o, t > 1.4 ? (tx < 420 ? 1 : 0) : 1);
        show(trail, 0);
      } else {
        const q = seg(t, 0.8, 3.0);
        const pt = (u) => [lerp(h.x + 10, 420, u), lerp(h.y + 10, 40, u) - hump(u) * 40];
        const [x, y] = t < 0.8 ? [h.x + 10, h.y + 20] : pt(easeIn(q) * 0.5 + q * 0.5);
        tf(o, x, y, t < 0.8 ? 0 : -20, lerp(1, 0.6, q));
        const qs = Math.max(0, easeIn(q) * 0.5 + q * 0.5 - 0.25);
        let d = '';
        for (let u = 0; u <= 1.0001; u += 0.1) { const [px, py] = pt(qs * u); d += (u ? ' L ' : 'M ') + px.toFixed(1) + ' ' + py.toFixed(1); }
        k.set(trail, { d });
        show(trail, q > 0.1 ? 0.9 : 0);
      }
    };
  }
  function over() {
    bgOut();
    const bx = g({});
    el('rect', { x: -26, y: -44, width: 52, height: 44, rx: 4, fill: pal.wood }, bx);
    el('rect', { x: -26, y: -24, width: 52, height: 6, fill: pal.woodDark }, bx);
    tf(bx, 200, FY);
    k.shadow(200, FY + 2, 30, 5);
    const b = B(60, { scale: 0.85 });
    const P = puffs(g({}), 3);
    return (t) => {
      const s = stride(t, 0.3, 1.2, 60, 140, 12);
      const j = seg(t, 1.2, 2.1);
      const s2 = stride(t, 2.2, 3.2, 260, 330, 9);
      const x = t < 1.2 ? s.x : t < 2.1 ? lerp(140, 260, j) : s2.x;
      const landq = seg(t, 2.1, 2.5);
      b.pose({ x, walk: s.mv ? t * 12 : s2.mv ? s2.walk : 0, lift: hump(j) * 90, armL: j > 0 && j < 1 ? 150 : s.armL, armR: j > 0 && j < 1 ? 150 : s.armR, squash: 1 - (t > 1.0 && t < 1.2 ? 0.12 : 0) - Math.max(0, wobble(landq, 1, 5)) * 0.15, mood: j > 0 ? 'grin' : 'smile' });
      setPuffs(P, 260, FY, landq, 1);
    };
  }
  function cross() {
    bgOut({ road: true });
    const o = isProp(e) ? gemo(e, 34) : null;
    const b = B(40, { y: FY + 30, scale: 0.85 });
    return (t) => {
      const s = stride(t, 0.4, 3.3, 40, 350);
      b.pose({ x: s.x, walk: s.walk, armL: s.armL, armR: o ? 80 : s.armR, lean: s.lean, look: 0.6 });
      if (o) { const h = b.handPos('R'); tf(o, h.x + 8, h.y + 18); }
    };
  }

  // =============== act ===============
  function pair(bg = 'room') {
    if (bg === 'room') bgRoom({ win: [170, 60] }); else bgOut();
    const a = B(120, { scale: 0.9 });
    const c = B(290, { ...C2, scale: 0.9, facing: -1 });
    return [a, c];
  }
  function give() {
    const [a, c] = pair('room');
    const o = gemo(pick(e, '🎁'), 40);
    const hs = g({});
    [[-14, 0], [12, -14], [0, -30]].forEach(([x, y]) => { const hh = heart(hs); hh.setAttribute('transform', `translate(${x} ${y})`); });
    return (t) => {
      const s = stride(t, 0.2, 0.9, 120, 160);
      const ext = easeOut(seg(t, 0.9, 1.3));
      const pass = easeInOut(seg(t, 1.3, 2.0));
      a.pose({ x: s.x, walk: s.walk, armL: s.armL, armR: t < 2.0 ? 70 + ext * 15 : lerp(85, 8, seg(t, 2.0, 2.5)), lean: ext * 5 * (1 - seg(t, 2.0, 2.5)), look: 0.6, mood: t > 2.2 ? 'grin' : 'smile' });
      const recv = easeOut(seg(t, 1.2, 1.7));
      c.pose({ armR: t < 2.2 ? 8 + recv * 75 : lerp(83, 70, seg(t, 2.2, 2.6)), armL: 8 + recv * 60, mood: t > 2.0 ? 'grin' : 'smile', lift: hump(seg(t, 2.2, 2.6)) * 10, facing: -1, look: 0.6 });
      const ha = a.handPos('R'), hc = c.handPos('R');
      const x = lerp(ha.x + 6, hc.x - 6, pass), y = lerp(ha.y + 20, hc.y + 20, pass) - hump(pass) * 16 - (t > 2.2 ? hump(seg(t, 2.2, 2.6)) * 10 : 0);
      tf(o, x, y);
      tf(hs, 300, FY - 120 - seg(t, 2.2, 3.4) * 30, 0, ss(backOut(seg(t, 2.2, 2.6))));
      show(hs, seg(t, 2.2, 2.4) * (1 - seg(t, 3.3, 3.8)));
    };
  }
  function take() {
    bgRoom({ pic: [60, 70] });
    const stand = g({});
    el('rect', { x: 170, y: FY - 54, width: 34, height: 54, rx: 6, fill: '#7FB2DE' }, stand);
    el('rect', { x: 170, y: FY - 54, width: 34, height: 8, rx: 4, fill: '#5E92C2' }, stand);
    const um = g({});
    if (isProp(e)) gemo(e, 44, um);
    else {
      el('line', { x1: 0, y1: 0, x2: 0, y2: -80, stroke: '#5B4B6E', 'stroke-width': 4 }, um);
      el('path', { d: 'M 0 0 Q 0 10 -8 10 Q -14 10 -14 4', stroke: '#5B4B6E', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, um);
      el('path', { d: 'M -10 -80 Q 0 -98 10 -80 L 6 -30 Q 0 -24 -6 -30 Z', fill: pal.violet }, um);
    }
    const front = el('rect', { x: 170, y: FY - 40, width: 34, height: 40, rx: 6, fill: '#7FB2DE' }); void front;
    const b = B(60, { scale: 0.9 });
    return (t) => {
      const s = stride(t, 0.2, 1.0, 60, 130);
      const grab = easeInOut(seg(t, 1.1, 1.8));
      const s2 = stride(t, 2.1, 3.6, 130, 300);
      const x = t < 2.1 ? s.x : s2.x;
      b.pose({ x, walk: s.mv ? s.walk : s2.walk, armL: t < 2.1 ? s.armL : s2.armL, armR: t < 1.1 ? lerp(8, 60, seg(t, 0.8, 1.1)) : lerp(60, 85, grab), look: 0.6, mood: t > 1.8 ? 'grin' : 'smile', lean: s2.lean });
      const h = b.handPos('R');
      if (t < 1.4) tf(um, 187, FY - 30, -4);
      else tf(um, h.x + 2, h.y + 10 + (1 - grab) * 4, lerp(-4, 0, grab));
    };
  }
  function pay(kind) {
    bgRoom({ wall: '#F3F1EA', pic: [40, 64] });
    const c = B(296, { ...C2, scale: 0.9, facing: -1 });
    const ctr = g({});
    el('rect', { x: 230, y: FY - 70, width: 170, height: 70, fill: '#C8D6E3' }, ctr);
    el('rect', { x: 222, y: FY - 78, width: 178, height: 12, rx: 4, fill: '#A9BCCD' }, ctr);
    el('rect', { x: 340, y: FY - 110, width: 46, height: 34, rx: 5, fill: '#5D6B80' }, ctr);
    el('rect', { x: 346, y: FY - 104, width: 34, height: 12, rx: 2, fill: '#A6E3C7' }, ctr);
    const a = B(110, { scale: 0.9 });
    const coin = g({});
    [[0, 0], [8, -5]].forEach(([x, y]) => { el('circle', { cx: x, cy: y, r: 9, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2.5 }, coin); });
    const bag = g({});
    el('path', { d: 'M -18 -34 L 18 -34 L 22 0 L -22 0 Z', fill: pal.violet }, bag);
    el('path', { d: 'M -8 -34 Q -8 -46 0 -46 Q 8 -46 8 -34', stroke: '#7E66C9', 'stroke-width': 3, fill: 'none' }, bag);
    const tick = g({}); tf(star4(tick, pal.yellow, 10), 0, 0);
    const buy = kind === 'buy';
    return (t) => {
      const s = stride(t, 0.1, 0.8, 110, 170);
      const pq = easeInOut(seg(t, 0.9, 1.6));
      const bq = easeInOut(seg(t, 1.9, 2.6));
      const s2 = stride(t, 2.8, 3.7, 170, 120);
      a.pose({ x: t < 2.8 ? s.x : s2.x, walk: s.mv ? s.walk : s2.walk, armL: s.armL, armR: t < 1.7 ? lerp(8, 75, seg(t, 0.7, 0.95)) : buy ? lerp(30, 70, seg(t, 1.8, 2.2)) : lerp(75, 8, seg(t, 1.7, 2.0)), look: 0.7, mood: t > 2.5 ? 'grin' : 'smile', facing: t > 2.8 && buy ? -1 : 1 });
      c.pose({ facing: -1, armR: t < 1.5 ? 8 + easeOut(seg(t, 1.0, 1.4)) * 60 : buy ? lerp(68, 70, bq) : lerp(68, 8, seg(t, 1.7, 2.0)), lean: !buy && t > 2.0 ? hump(seg(t, 2.0, 2.8)) * 18 : 0, mood: t > 1.6 ? 'grin' : 'smile', look: 0.5 });
      const ha = a.handPos('R'), hc = c.handPos('R');
      tf(coin, lerp(ha.x + 4, hc.x - 4, pq), lerp(ha.y + 16, hc.y + 12, pq) - hump(pq) * 12);
      show(coin, t < 1.8 ? 1 : 0);
      tf(bag, lerp(hc.x - 10, ha.x + 12, bq), lerp(hc.y + 40, ha.y + 44, bq) - hump(bq) * 10);
      show(bag, buy && t > 1.7 ? 1 : 0);
      tf(tick, hc.x - 30, FY - 140 - seg(t, 1.6, 2.4) * 10, t * 40, ss(backOut(seg(t, 1.6, 2.0))));
      show(tick, !buy && t > 1.6 ? 1 - seg(t, 3.0, 3.6) : 0);
    };
  }
  function throwIt() {
    const [a, c] = pair('out');
    const ball = emo(pick(e, '⚾'), 26);
    return (t) => {
      const wind = easeInOut(seg(t, 0.4, 1.0)), rl = easeOut(seg(t, 1.0, 1.25));
      const armR = t < 1.0 ? lerp(8, -50, wind) : lerp(-50, 130, rl) - seg(t, 1.6, 2.2) * 110;
      a.pose({ armR, lean: t < 1 ? -6 * wind : 12 * rl * (1 - seg(t, 1.5, 2)), look: 0.6, mood: t > 2.2 ? 'grin' : 'smile' });
      const cq = easeOut(seg(t, 1.4, 1.9));
      c.pose({ facing: -1, armR: 8 + cq * 80, armL: 8 + cq * 70, squash: 1 - hump(seg(t, 2.1, 2.4)) * 0.08, mood: t > 2.2 ? 'grin' : 'open', look: 0.6 });
      const hc = c.handPos('R');
      const fq = seg(t, 1.15, 2.1);
      let x, y;
      if (t < 1.15) { const ha = a.handPos('R'); x = ha.x; y = ha.y + 4; }
      else { x = lerp(156, hc.x - 6, fq); y = lerp(FY - 108, hc.y + 8, fq) - hump(fq) * 70; }
      tf(ball, x, y, fq * 720);
    };
  }
  function eat(kind) {
    bgRoom({ win: [50, 60] });
    const b = B(200, { scale: 0.95 });
    const top = table(110, 180, 66);
    el('ellipse', { cx: 236, cy: top - 1, rx: 32, ry: 7, fill: '#FFFFFF', stroke: '#D9DFE7', 'stroke-width': 2 });
    const food = g({});
    const ch = kind === 'swallow' ? '💊' : isFood(e) ? e : has(e, ['🦷']) ? '🍎' : '🍙';
    emo(ch, kind === 'swallow' ? 22 : 34, food);
    const glass = g({});
    if (kind === 'swallow') {
      el('path', { d: 'M -10 -30 L 10 -30 L 8 0 L -8 0 Z', fill: '#E8F6FD', stroke: '#B9D9EA', 'stroke-width': 2 }, glass);
      el('path', { d: 'M -9 -20 L 9 -20 L 8 0 L -8 0 Z', fill: '#8FD3F4', opacity: 0.8 }, glass);
    }
    const crumbs = g({});
    [0, 1, 2].forEach(() => el('circle', { r: 2, fill: '#E2B86B' }, crumbs));
    return (t) => {
      let armR = 8, fx = 236, fy = top - 16, fs = 1, mood = 'smile', gx = 150, gy = top, gr = 0;
      const mouth = { x: 200 + 10, y: FY - 62 };
      if (kind === 'swallow') {
        const up = hump(seg(t, 0.6, 1.6));
        armR = 8 + up * 120;
        const h = b.handPos('R');
        if (t > 0.6 && t < 1.2) { fx = lerp(236, h.x + 6, seg(t, 0.6, 1.0)); fy = lerp(top - 12, h.y + 8, seg(t, 0.6, 1.0)); }
        if (t >= 1.2) { fs = 0; }
        else if (t > 1.0) { fx = h.x + 6; fy = h.y + 8; fs = 1 - seg(t, 1.1, 1.2); }
        const dq = hump(seg(t, 1.7, 3.0));
        if (t > 1.7) { armR = 8 + dq * 130; const h2 = b.handPos('R'); gx = h2.x + 4; gy = h2.y + 26; gr = -dq * 50; }
        mood = t > 3.0 ? 'grin' : (t > 1.1 && t < 1.5) ? 'open' : 'smile';
      } else {
        const bites = [[0.6, 1.4], [1.5, 2.2], [2.3, 3.0]];
        let n = 0;
        bites.forEach(([a0, a1]) => { const q = seg(t, a0, a1); if (q > 0 && q < 1) { armR = 8 + hump(q) * 125; } if (t > a0 + (a1 - a0) * 0.5) n++; });
        const h = b.handPos('R');
        const inHand = bites.some(([a0, a1]) => t > a0 && t < a1);
        if (inHand) { const q = bites.map(([a0, a1]) => seg(t, a0, a1)).find((x) => x > 0 && x < 1); const hq = hump(q); fx = lerp(236, h.x + 4, Math.min(1, hq * 1.4)); fy = lerp(top - 16, h.y + 6, Math.min(1, hq * 1.4)); }
        fs = [1, 0.72, 0.45, 0][n];
        const chew = t > 0.9 && t < 3.3 && Math.sin(t * 18) > 0;
        mood = t > 3.2 ? 'grin' : chew ? 'open' : 'flat';
        if (t < 0.6) mood = 'grin';
      }
      b.pose({ armR, armL: 8, look: 0.4, mood, blink: 0 });
      tf(food, fx, fy, 0, ss(fs), ss(fs));
      tf(glass, gx, gy, gr);
      show(glass, kind === 'swallow' ? 1 : 0);
      crumbs.childNodes.forEach((c, i) => { const q = ((t * 1.3 + i * 0.33) % 1); k.set(c, { cx: mouth.x + (i - 1) * 8 + q * 6, cy: mouth.y + q * 30, opacity: kind !== 'swallow' && t > 1 && t < 3.1 ? 1 - q : 0 }); });
      void gemo;
    };
  }
  function swallow() { return eat('swallow'); }
  function drink() {
    bgRoom({ win: [270, 60] });
    const b = B(170, { scale: 0.95 });
    table(70, 200, 66);
    const gl = g({});
    const liq = has(e, ['🥛']) || !isProp(e) ? '#FFFFFF' : has(e, ['☕', '🍵']) ? pal.coffee : '#FFB463';
    const cp = k.clip((c) => el('path', { d: 'M -13 -40 L 13 -40 L 10 0 L -10 0 Z' }, c));
    const lv = el('rect', { x: -30, y: -32, width: 60, height: 40, fill: liq, 'clip-path': cp }, gl);
    el('path', { d: 'M -13 -40 L 13 -40 L 10 0 L -10 0 Z', fill: '#E8F6FD', opacity: 0.35, stroke: '#9FC6DB', 'stroke-width': 2.5 }, gl);
    const ah = g({}); el('path', { d: 'M -10 0 q 5 -6 10 0 q 5 6 10 0', stroke: pal.sub, 'stroke-width': 2.5, fill: 'none' }, ah);
    return (t) => {
      const up = easeInOut(seg(t, 0.5, 1.1)) * (1 - easeInOut(seg(t, 2.7, 3.2)));
      const tilt = easeInOut(seg(t, 1.1, 1.6)) * (1 - easeInOut(seg(t, 2.4, 2.8)));
      b.pose({ armR: lerp(8, 140, up) - tilt * 10, lean: -tilt * 10, look: 0.3, mood: t > 2.8 ? 'grin' : tilt > 0.5 ? 'open' : 'smile', blink: tilt > 0.5 ? 1 : 0 });
      const h = b.handPos('R');
      const x = lerp(232, h.x + 4, up), y = lerp(FY - 66, h.y + 30, up);
      const level = 1 - seg(t, 1.4, 2.6) * 0.92;
      tf(gl, x, y, -tilt * 70);
      const tilted = -tilt * 70 * Math.PI / 180;
      lv.setAttribute('transform', `rotate(${(-tilted * 57.3).toFixed(1)} 0 0)`);
      k.set(lv, { y: -32 * level + 0, height: 40 });
      tf(ah, 230, FY - 140);
      show(ah, seg(t, 2.9, 3.2));
    };
  }
  function look(kind) {
    bgOut();
    tree(320, 0.95);
    const target = g({});
    emo(kind === 'observe' ? '🌱' : '🐦', 34, target);
    tf(target, 304, 112, 0, -1, 1);
    const line = el('path', { d: '', stroke: pal.sub, 'stroke-width': 2.5, 'stroke-dasharray': '5 7', fill: 'none' });
    const b = B(110, { scale: 0.95 });
    const ex = g({}); el('path', { d: 'M -3 -18 L 3 -18 L 2 4 L -2 4 Z', fill: pal.coral }, ex); el('circle', { cx: 0, cy: 12, r: 3.4, fill: pal.coral }, ex);
    return (t) => {
      const turn = easeOut(seg(t, 0.8, 1.2));
      b.pose({ look: lerp(-0.6, 1, turn), armR: lerp(8, 130, easeOut(seg(t, 1.1, 1.6))), mood: t > 1.3 ? 'open' : 'smile', lean: -turn * 4, lift: hump(seg(t, 1.2, 1.5)) * 6 });
      const ey = FY - 60 * 0.95 - 10;
      const q = seg(t, 1.3, 2.0);
      const x1 = lerp(126, 290, q), y1 = lerp(ey, 116, q);
      k.set(line, { d: `M 126 ${ey} L ${x1} ${y1}` });
      show(line, q > 0 ? 1 : 0);
      tf(target, 304, 112 - hump(seg(t, 2.4, 2.8)) * 8, 0, -1, 1);
      tf(ex, 140, FY - 130, 0, ss(backOut(seg(t, 1.2, 1.5))));
      show(ex, t > 1.2 ? 1 - seg(t, 2.4, 2.8) : 0);
    };
  }
  function observe() {
    bgRoom({ win: [290, 56], wains: '#E8EEE4' });
    const top = table(160, 170, 70);
    const pot = g({});
    el('path', { d: 'M -22 0 L 22 0 L 17 -32 L -17 -32 Z', fill: '#D9875E', transform: 'scale(1 -1) translate(0 0)' }, pot);
    el('rect', { x: -24, y: -36, width: 48, height: 8, rx: 3, fill: '#C5714A' }, pot);
    el('path', { d: 'M -18 -2 L 18 -2 L 15 -30 L -15 -30 Z', fill: '#D9875E' }, pot);
    el('path', { d: 'M 0 -36 Q 2 -60 0 -78', stroke: '#4FA067', 'stroke-width': 4, fill: 'none' }, pot);
    [[-1, -54], [1, -66], [-1, -76]].forEach(([s, y]) => el('path', { d: `M 0 ${y} Q ${s * 16} ${y - 12} ${s * 24} ${y - 2} Q ${s * 12} ${y + 4} 0 ${y} Z`, fill: '#6CC383' }, pot));
    tf(pot, 270, top);
    const mg = g({});
    el('line', { x1: 10, y1: 10, x2: 30, y2: 30, stroke: '#7A5A3C', 'stroke-width': 7, 'stroke-linecap': 'round' }, mg);
    el('circle', { cx: 0, cy: 0, r: 16, fill: '#E7F6FF', opacity: 0.55, stroke: '#5D6B80', 'stroke-width': 4 }, mg);
    el('path', { d: 'M -8 -6 Q -4 -10 2 -10', stroke: '#FFFFFF', 'stroke-width': 3, fill: 'none' }, mg);
    const b = B(170, { scale: 0.95 });
    return (t) => {
      const q = easeInOut(seg(t, 0.6, 1.4));
      const scan = t > 1.4 ? Math.sin((t - 1.4) * 2.2) : 0;
      b.pose({ armR: lerp(8, 100, q), lean: q * 12, look: 1, mood: t > 2.6 ? 'open' : 'flat' });
      const h = b.handPos('R');
      tf(mg, lerp(h.x + 10, 268 + scan * 10, q), lerp(h.y, top - 60 + scan * 14, q), 0, lerp(0.9, 1.2, q));
    };
  }
  function talk(kind) {
    const [a, c] = pair('out');
    const bA = bubble(g({}), kind === 'shout' ? 110 : kind === 'whisper' ? 44 : 74, kind === 'shout' ? 62 : kind === 'whisper' ? 30 : 46, -18);
    const bC = bubble(g({}), 74, 46, 18);
    const fill = (bb, kindB) => {
      const s = g({}, bb);
      if (kindB === '?') k.text(0, 2, '?', { 'font-size': 28, fill: pal.blueDark }, s);
      else if (kindB === '!') k.text(0, 2, '!', { 'font-size': 28, fill: pal.coralDark }, s);
      else if (kindB === 'loud') { k.text(0, 2, '!!', { 'font-size': 34, fill: pal.red }, s); }
      else if (kindB === 'small') [-8, 0, 8].forEach((x) => el('circle', { cx: x, cy: 0, r: 2.4, fill: pal.sub }, s));
      else [-14, 0, 14].forEach((x, i) => el('rect', { x: x - 5, y: -3 + (i % 2) * 2, width: 10, height: 5, rx: 2.5, fill: i === 1 ? pal.mint : pal.sub, opacity: 0.8 }, s));
      return s;
    };
    fill(bA, kind === 'ask' ? '?' : kind === 'shout' ? 'loud' : kind === 'whisper' ? 'small' : 'dots');
    fill(bC, kind === 'ask' ? '!' : 'dots');
    const lines = g({});
    if (kind === 'shout') [-25, 0, 25].forEach((r) => el('line', { x1: 0, y1: 0, x2: 26, y2: 0, stroke: pal.red, 'stroke-width': 4, 'stroke-linecap': 'round', transform: `rotate(${r}) translate(12 0)` }, lines));
    const sweat = g({}); droplet(sweat);
    return (t) => {
      const near = kind === 'whisper' ? easeInOut(seg(t, 0.3, 1.1)) : 0;
      const ax = lerp(120, 205, near);
      const qa = backOut(seg(t, 0.9, 1.3)), qc = backOut(seg(t, 2.0, 2.4));
      const talkA = t > 0.9 && t < 2.0 && Math.sin(t * 16) > 0;
      const talkC = t > 2.0 && t < 3.0 && Math.sin(t * 16) > 0;
      let armRA = 8, leanA = 0, moodA = talkA ? 'open' : 'smile', leanC = 0, moodC = talkC ? 'open' : 'smile', armC = 8, liftC = 0;
      if (kind === 'ask') { armRA = lerp(8, 170, backOut(seg(t, 0.6, 1.0))) * (1 - seg(t, 2.4, 2.8)) + 8 * seg(t, 2.4, 2.8); }
      if (kind === 'shout') { leanA = 10 * seg(t, 0.8, 1.0); moodA = t > 0.9 && t < 2.4 ? 'grin' : 'smile'; leanC = -14 * seg(t, 1.0, 1.2); moodC = t > 1.0 ? 'open' : 'smile'; liftC = hump(seg(t, 1.0, 1.4)) * 14; armC = t > 1 ? 120 : 8; }
      if (kind === 'whisper') { armRA = t > 1.0 ? 150 : 8; leanA = t > 1.0 ? 14 : 0; leanC = t > 1.1 ? 8 : 0; moodA = 'flat'; moodC = t > 2.4 ? 'grin' : 'open'; }
      if (kind === 'talk') { armRA = talkA ? 50 + Math.sin(t * 8) * 20 : 8; armC = talkC ? 50 + Math.sin(t * 8) * 20 : 8; if (t > 3.0) { moodA = moodC = 'grin'; } }
      if (kind === 'ask' && t > 2.0) armC = 50 + Math.sin(t * 8) * 15;
      a.pose({ x: ax, walk: near > 0 && near < 1 ? t * 9 : 0, armR: armRA, lean: leanA, mood: moodA, look: 0.6 });
      c.pose({ facing: -1, lean: leanC, mood: moodC, armR: armC, armL: kind === 'shout' && t > 1 ? 120 : 8, lift: liftC, look: 0.6, blink: kind === 'shout' && t > 1.2 ? 1 : 0 });
      const big = kind === 'shout';
      tf(bA, ax + (big ? 76 : kind === 'whisper' ? 34 : 52), FY - (big ? 150 : 128), 0, ss(qa), ss(qa));
      show(bA, t > 0.9 ? 1 - (kind === 'talk' ? 0 : seg(t, 3.0, 3.3)) * 0 : 0);
      tf(bC, 290 - 52, FY - 128 - (big ? -200 : 0), 0, ss(qc), ss(qc));
      show(bC, t > 2.0 && kind !== 'shout' && kind !== 'whisper' ? 1 : 0);
      tf(lines, ax + 30, FY - 70, 0, 1 + Math.sin(t * 20) * 0.1);
      show(lines, big && t > 0.9 && t < 2.6 ? 1 : 0);
      tf(sweat, 270, FY - 100);
      show(sweat, big && t > 1.2 ? 1 : 0);
    };
  }
  function think() {
    bgRoom({ win: [60, 64] });
    const b = B(170, { scale: 1 });
    const tb = g({});
    const dots = [[0, 0, 5], [14, -18, 8]].map(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#FFFFFF', stroke: '#C9D2DC', 'stroke-width': 2 }, tb));
    const cl = g({}, tb);
    [[40, -60, 26], [70, -66, 30], [100, -58, 24], [60, -44, 22], [88, -42, 22]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#FFFFFF', stroke: '#C9D2DC', 'stroke-width': 2 }, cl));
    [[40, -60, 24], [70, -66, 28], [100, -58, 22], [60, -44, 20], [88, -42, 20]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#FFFFFF' }, cl));
    const inner = g({}, cl);
    const ch = isProp(e) ? e : null;
    if (ch) { const o = emo(ch, 30, inner); tf(o, 70, -56); }
    const q3 = [0, 1, 2].map((i) => el('circle', { cx: 52 + i * 18, cy: -54, r: 4, fill: pal.sub }, inner));
    return (t) => {
      const q = easeOut(seg(t, 0.5, 1.0));
      b.pose({ armR: lerp(8, 148, q), armL: lerp(8, 30, q), look: lerp(0, 0.6, q), lean: -q * 4, mood: 'flat', blink: 0 });
      tf(tb, 212, FY - 104);
      dots.forEach((d, i) => show(d, seg(t, 1.0 + i * 0.25, 1.2 + i * 0.25)));
      const cq = backOut(seg(t, 1.5, 1.9));
      tf(cl, 0, 0, 0, ss(cq), ss(cq));
      q3.forEach((d, i) => show(d, ch ? 0 : 0.3 + 0.7 * (Math.sin(t * 6 - i * 1.2) > 0 ? 1 : 0)));
    };
  }
  function sleep() {
    bgRoom({ win: [270, 50, 80, 64], night: true, wall: '#E7E3EE', wall2: '#F1EEF4', wains: '#DCD6E4' });
    const lamp = g({});
    el('rect', { x: 70, y: FY - 60, width: 40, height: 60, rx: 4, fill: pal.wood }, lamp);
    el('rect', { x: 86, y: FY - 96, width: 6, height: 36, fill: '#B9C3D2' }, lamp);
    el('path', { d: `M 72 ${FY - 96} L 106 ${FY - 96} L 98 ${FY - 120} L 80 ${FY - 120} Z`, fill: '#FFE7A8' }, lamp);
    const glow = el('circle', { cx: 89, cy: FY - 104, r: 44, fill: '#FFF0B8', opacity: 0.5 });
    const bed = g({});
    el('rect', { x: 130, y: FY - 90, width: 16, height: 90, rx: 6, fill: pal.woodDark }, bed);
    el('rect', { x: 130, y: FY - 40, width: 230, height: 22, rx: 6, fill: '#FFFFFF' }, bed);
    el('rect', { x: 130, y: FY - 20, width: 230, height: 14, rx: 4, fill: pal.wood }, bed);
    el('rect', { x: 352, y: FY - 56, width: 12, height: 56, rx: 5, fill: pal.woodDark }, bed);
    el('rect', { x: 148, y: FY - 56, width: 46, height: 18, rx: 9, fill: '#F2F4F8' }, bed);
    const wr = g({});
    const b = B(0, { y: 0, scale: 0.75, parent: wr });
    tf(wr, 186, FY - 34, -90);
    const blanket = el('path', { d: '', fill: '#9EB8E8' });
    const fold = el('rect', { x: 208, y: FY - 62, width: 10, height: 40, rx: 4, fill: '#BFD1F2' });
    const zz = g({});
    const Z = [0, 1, 2].map((i) => k.text(0, 0, 'Z', { 'font-size': 16 + i * 5, fill: '#7A86C8' }, zz));
    const dim = el('rect', { x: 0, y: 0, width: W, height: H, fill: '#2B2F5A', opacity: 0 });
    return (t) => {
      const close = seg(t, 0.8, 1.6);
      const breath = t > 1.6 ? Math.sin(t * 3) * 0.03 : 0;
      b.pose({ x: 0, y: 0, blink: close, mood: close > 0.5 ? 'flat' : 'smile', armL: 8, armR: 8, squash: 1 + breath, look: 0 });
      const off = seg(t, 0.4, 0.8);
      show(glow, 0.5 * (1 - off));
      show(dim, 0.28 * off);
      const by = FY - 62 - breath * 60;
      k.set(blanket, { d: `M 212 ${FY - 20} L 212 ${by + 6} Q 212 ${by} 220 ${by} L 344 ${by + 4} Q 356 ${by + 6} 356 ${FY - 20} Z` });
      void fold;
      Z.forEach((z, i) => { const q = ((t - 1.6 - i * 0.4) * 0.5) % 1; z.setAttribute('transform', `translate(${180 + q * 40 + i * 10} ${FY - 80 - q * 60 - i * 6})`); show(z, t > 1.6 + i * 0.4 ? hump(q) : 0); });
    };
  }
  function travel(kind) {
    const run = kind === 'run';
    bgOut({ hills: true, tufts: false });
    el('rect', { x: 0, y: FY + 10, width: W, height: 24, fill: '#E8E0CF' });
    const scen = g({});
    const items = [];
    for (let i = 0; i < 6; i++) { const T = tree(0, 0.55 + (i % 2) * 0.15, ['#7CC98F', '#5DB879'], scen); items.push([T, i * 150 + 40, 0.55 + (i % 2) * 0.15]); }
    const goal = g({});
    if (run) {
      el('rect', { x: -2, y: -90, width: 4, height: 90, fill: pal.ink }, goal); el('rect', { x: 60, y: -90, width: 4, height: 90, fill: pal.ink }, goal);
      el('rect', { x: 0, y: -90, width: 62, height: 14, fill: '#FFFFFF' }, goal);
      for (let i = 0; i < 6; i++) el('rect', { x: i * 10 + (i % 2) * 0, y: -90 + (i % 2) * 7, width: 10, height: 7, fill: pal.ink }, goal);
    } else {
      el('rect', { x: -40, y: -88, width: 90, height: 88, rx: 4, fill: '#F2E6D8' }, goal);
      el('path', { d: 'M -48 -88 L 5 -116 L 58 -88 Z', fill: pal.coral }, goal);
      el('circle', { cx: 5, cy: -98, r: 7, fill: '#FFFFFF', stroke: pal.ink, 'stroke-width': 1.5 }, goal);
      el('rect', { x: -6, y: -40, width: 22, height: 40, fill: '#8C7A6A' }, goal);
    }
    const b = B(90, { y: FY + 18, scale: 0.85 });
    const P = puffs(g({}), 3);
    const D = run ? 520 : 360;
    return (t) => {
      const q = seg(t, 0.5, 3.3);
      const d = D * (q * 0.8 + easeInOut(q) * 0.2);
      items.forEach(([T, x0, s]) => { let x = (x0 - d * 0.6) % 900; if (x < -100) x += 900; tf(T, x, FY + 10, 0, s, s); });
      const gx = 420 + 300 - d * (run ? 0.75 : 1.1) + (run ? 50 : 0);
      tf(goal, gx, FY + 18);
      const bx = lerp(90, 170, q);
      const ph = d / (run ? 16 : 12);
      const mv = q > 0 && q < 1;
      b.pose({ x: bx, walk: mv ? ph : 0, lean: mv ? (run ? 14 : 4) : 0, armL: mv ? (run ? 40 : 8) + Math.sin(ph) * (run ? 55 : 24) : 8, armR: mv ? (run ? 40 : 8) - Math.sin(ph) * (run ? 55 : 24) : (t > 3.3 ? 8 + hump(seg(t, 3.3, 3.8)) * 150 : 8), lift: mv && run ? Math.abs(Math.sin(ph)) * 7 : 0, mood: t > 3.3 ? 'grin' : run && mv ? 'open' : 'smile' });
      setPuffs(P, bx - 26, FY + 18, (ph / Math.PI) % 1, -1);
      show(P.s, run && mv ? 1 : 0);
    };
  }
  function carry() {
    bgRoom({ pic: [40, 66] });
    const st = g({});
    for (let i = 0; i < 5; i++) el('rect', { x: 260 + i * 28, y: FY - (i + 1) * 20, width: 140 - i * 28, height: 20, fill: i % 2 ? '#D8BF98' : '#E2CBA6', stroke: '#CDB28A', 'stroke-width': 1 }, st);
    const box = g({});
    if (isProp(e)) gemo(e, 42, box);
    else { el('rect', { x: -22, y: -36, width: 44, height: 36, rx: 3, fill: '#D5A86C' }, box); el('rect', { x: -22, y: -36, width: 44, height: 8, fill: '#C29055' }, box); el('rect', { x: -4, y: -36, width: 8, height: 36, fill: '#E8C99A' }, box); }
    const b = B(60, { scale: 0.85 });
    return (t) => {
      const s = stride(t, 0.6, 1.8, 60, 250, 9);
      const q = seg(t, 1.8, 3.4);
      const sy = q > 0 ? FY - Math.min(100, q * 5 * 20 - (1 - Math.cos(q * 5 * Math.PI * 2)) * 0) : FY;
      const stepY = q > 0 ? FY - (Math.floor(q * 5) + easeInOut((q * 5) % 1)) * 20 : FY;
      void sy;
      const x = t < 1.8 ? s.x : lerp(250, 360, q);
      const lift0 = easeOut(seg(t, 0.1, 0.5));
      b.pose({ x, y: Math.max(FY - 100, stepY), walk: t > 0.6 && t < 3.4 ? t * 9 : 0, armL: 8 + lift0 * 72, armR: 8 + lift0 * 72, lean: -4 * lift0, mood: t > 3.4 ? 'grin' : lift0 > 0.5 ? 'flat' : 'smile' });
      const h = b.handPos('R');
      tf(box, h.x - 4, h.y + 22 + (1 - lift0) * (FY - h.y - 22), 0);
    };
  }
  function hold() {
    bgOut({ road: true });
    const zebra = g({});
    for (let i = 0; i < 8; i++) el('rect', { x: 40 + i * 44, y: FY + 18, width: 24, height: 26, fill: '#FFFFFF', opacity: 0.85 }, zebra);
    const a = B(60, { y: FY + 6, scale: 0.85 });
    const c = B(190, { ...C2, y: FY + 6, scale: 0.7 });
    const hh = g({}); heart(hh);
    return (t) => {
      const s = stride(t, 0.2, 1.2, 60, 150);
      const reach = easeOut(seg(t, 1.0, 1.5));
      const s2 = stride(t, 2.0, 3.6, 0, 150);
      a.pose({ x: s.x + s2.x, walk: s.mv ? s.walk : s2.walk, armR: 8 + reach * 52, armL: s.armL, look: 0.6, mood: t > 1.5 ? 'grin' : 'smile' });
      c.pose({ x: 190 + s2.x, walk: s2.walk, facing: t < 1.6 ? -1 : 1, armR: 8 + reach * 52, armL: t < 1.6 ? 8 + reach * 52 : 8, mood: t > 1.5 ? 'grin' : 'smile', look: 0.4 });
      tf(hh, 170 + s2.x, FY - 100 - seg(t, 1.5, 2.4) * 16, 0, ss(backOut(seg(t, 1.5, 1.9))) * 1.4);
      show(hh, t > 1.5 ? 1 - seg(t, 2.6, 3.0) : 0);
    };
  }
  function jump(kind) {
    bgOut();
    const b = B(kind === 'hop' ? 80 : 200, { scale: 0.95 });
    const P = puffs(g({}), 3), P2 = puffs(g({}), 3);
    return (t) => {
      if (kind === 'hop') {
        const hops = [[0.8, 1.4], [1.5, 2.1], [2.2, 2.8]];
        let lift = 0, x = 80, sq = 1;
        hops.forEach(([a0, a1], i) => { const q = seg(t, a0, a1); if (q > 0 && q < 1) lift = hump(q) * 34; x += easeInOut(q) * 80; const l = seg(t, a1, a1 + 0.25); if (l > 0 && l < 1) sq = 1 - hump(l) * 0.12; void i; });
        b.pose({ x, lift, squash: sq, armL: 100, armR: 100, walk: 0.9, mood: 'grin', look: 0.5 });
        setPuffs(P, x, FY, seg(t, 2.8, 3.3), 1);
        return;
      }
      const crouch = easeInOut(seg(t, 0.5, 1.0));
      const air = seg(t, 1.0, 1.75);
      const landq = seg(t, 1.75, 2.3);
      const sq = t < 1.0 ? 1 - crouch * 0.2 : air < 1 ? 1.08 - air * 0.08 : 1 - Math.max(0, hump(landq * 1.2)) * 0.18;
      b.pose({ lift: hump(air) * 90, squash: sq, armL: t < 1.0 ? lerp(8, -20, crouch) : air < 1 ? 165 : lerp(120, 8, landq), armR: t < 1.0 ? lerp(8, -20, crouch) : air < 1 ? 165 : lerp(120, 8, landq), mood: air > 0 ? 'grin' : 'flat', look: 0, lean: crouch * 8 * (t < 1 ? 1 : 0) });
      setPuffs(P, 200 - 20, FY, landq, -1);
      setPuffs(P2, 200 + 20, FY, landq, 1);
    };
  }
  function wait() {
    bgOut({ road: true, tufts: false });
    const pole = g({});
    el('rect', { x: 270, y: FY - 120, width: 6, height: 150, fill: '#8B93A3' }, pole);
    el('circle', { cx: 273, cy: FY - 130, r: 22, fill: '#FFFFFF', stroke: pal.blue, 'stroke-width': 5 }, pole);
    el('rect', { x: 300, y: FY - 30, width: 80, height: 8, rx: 3, fill: pal.wood }, pole);
    el('rect', { x: 306, y: FY - 22, width: 6, height: 52, fill: pal.woodDark }, pole); el('rect', { x: 368, y: FY - 22, width: 6, height: 52, fill: pal.woodDark }, pole);
    const clock = g({});
    el('circle', { cx: 0, cy: 0, r: 22, fill: '#FFFFFF', stroke: pal.ink, 'stroke-width': 3 }, clock);
    const mh = el('line', { x1: 0, y1: 0, x2: 0, y2: -15, stroke: pal.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }, clock);
    const hhd = el('line', { x1: 0, y1: 0, x2: 0, y2: -9, stroke: pal.ink, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, clock);
    tf(clock, 120, 70);
    const b = B(200, { y: FY + 26, scale: 0.9 });
    return (t) => {
      mh.setAttribute('transform', `rotate(${t * 100})`);
      hhd.setAttribute('transform', `rotate(${60 + t * 8})`);
      const tap = t > 1.0 ? Math.max(0, Math.sin(t * 9)) : 0;
      const lk = t > 1.0 ? (Math.sin(t * 2.2) > 0 ? 1 : -1) * 0.8 : 0;
      b.pose({ look: lk, armL: t > 1 ? 20 : 8, armR: t > 2.2 ? 30 : 8, mood: t > 2.4 ? 'flat' : 'smile', walk: tap * 0.35, blink: t > 2.6 && t < 2.75 ? 1 : 0, lean: t > 2.2 ? -3 : 0 });
    };
  }

  // =============== change ===============
  function brake() {
    bgOut({ road: true, tufts: false });
    const sign = g({});
    el('rect', { x: -3, y: -100, width: 6, height: 100, fill: '#8B93A3' }, sign);
    el('path', { d: 'M -10 -134 L 10 -134 L 24 -120 L 24 -100 L 10 -86 L -10 -86 L -24 -100 L -24 -120 Z', fill: pal.red, stroke: '#FFFFFF', 'stroke-width': 3, transform: 'translate(0 10)' }, sign);
    tf(sign, 360, FY + 14);
    el('rect', { x: 318, y: FY + 16, width: 8, height: 30, fill: '#FFFFFF' });
    const sk = [0, 1].map((i) => el('rect', { x: 0, y: FY + 24 + i * 12, width: 0, height: 3, rx: 1.5, fill: '#5A6170', opacity: 0.5 }));
    const Car = car(pal.blue, pal.blueDark, true);
    const lines = g({});
    [0, 1, 2].forEach((i) => el('line', { x1: 0, y1: -20 - i * 14, x2: -30 - i * 8, y2: -20 - i * 14, stroke: '#FFFFFF', 'stroke-width': 3, 'stroke-linecap': 'round' }, lines));
    return (t) => {
      const v0 = 210;
      const tb = 1.3, te = 2.4;
      let x;
      if (t < tb) x = -40 + v0 * t;
      else { const q = seg(t, tb, te); x = -40 + v0 * tb + v0 * (te - tb) * (q - q * q / 2); }
      const pitch = t > tb ? hump(seg(t, tb, te + 0.2)) * 3 + wobble(seg(t, te, te + 0.8), 1.5, 5) * -2 : 0;
      Car.place(x, FY + 40, x, pitch);
      k.set(Car.tail, { fill: t > tb ? pal.red : '#F7A399' });
      sk.forEach((s) => k.set(s, { x: -40 + v0 * tb - 30, width: Math.max(0, x - (-40 + v0 * tb) ) }));
      tf(lines, x - 70, FY + 40);
      show(lines, t < tb + 0.2 ? 1 : 0);
    };
  }
  function curtain(kind) {
    bgRoom({ wall: '#EFE9F2', wains: '#E3DAE8' });
    el('rect', { x: 50, y: 30, width: 300, height: 160, rx: 6, fill: '#3E3A4F' });
    const lit = el('rect', { x: 56, y: 36, width: 288, height: 148, fill: k.gradient([[0, '#FFF2C6'], [1, '#FFE08A']]) });
    const scr = g({});
    el('circle', { cx: 200, cy: 110, r: 30, fill: '#FFFFFF', opacity: 0.85 }, scr);
    el('path', { d: 'M 190 94 L 216 110 L 190 126 Z', fill: pal.coral }, scr);
    el('rect', { x: 46, y: 184, width: 308, height: 12, rx: 4, fill: pal.woodDark });
    const L = g({}), R = g({});
    const pleat = (G, dir) => { el('rect', { x: 0, y: 0, width: 150, height: 160, fill: '#D9534F' }, G); for (let i = 0; i < 5; i++) el('rect', { x: 12 + i * 28, y: 0, width: 8, height: 160, fill: '#B8403D', opacity: 0.6 }, G); void dir; };
    pleat(L, -1); pleat(R, 1);
    el('rect', { x: 40, y: 24, width: 320, height: 18, rx: 6, fill: '#B8403D' });
    const b = B(370, { scale: 0.75, facing: -1 });
    const rope = el('line', { x1: 364, y1: 40, x2: 364, y2: 150, stroke: '#E9B43A', 'stroke-width': 4 });
    const start = kind === 'start';
    return (t) => {
      const q = easeInOut(seg(t, 1.0, 2.4));
      const open = start ? q : 1 - q;
      tf(L, 50, 30, 0, ss(lerp(1, 0.12, open)), 1);
      tf(R, 350, 30, 0, -ss(lerp(1, 0.12, open)), 1);
      show(lit, 0.25 + 0.75 * open);
      show(scr, start ? seg(t, 2.2, 2.6) : 1 - seg(t, 0.9, 1.3));
      const pull = hump(seg(t, 0.6, 1.6));
      k.set(rope, { y2: 150 + pull * 14 });
      b.pose({ facing: -1, armR: lerp(150, 120, pull), lean: pull * 6, mood: t > 2.4 ? 'grin' : 'smile', look: 0.6 });
    };
  }
  function winSet(x, y, w, h) {
    winFrame(x, y, w, h);
    const Lp = g({}), Rp = g({});
    [Lp, Rp].forEach((P) => { el('rect', { x: 0, y: 0, width: w / 2, height: h, fill: '#DDF1FB', stroke: '#FFFFFF', 'stroke-width': 5, opacity: 0.95 }, P); el('line', { x1: 8, y1: 10, x2: 20, y2: 28, stroke: '#FFFFFF', 'stroke-width': 3, opacity: 0.8 }, P); });
    return { Lp, Rp, set(q) { tf(Lp, x, y, 0, ss(lerp(1, 0.15, q)), 1); tf(Rp, x + w, y, 0, -ss(lerp(1, 0.15, q)), 1); } };
  }
  function openWin() {
    bgRoom({});
    const Wn = winSet(140, 50, 120, 110);
    const cur = [g({}), g({})];
    cur.forEach((c) => el('path', { d: 'M 0 0 L 22 0 Q 18 60 24 120 L 0 120 Z', fill: '#F6C8B8' }, c));
    el('rect', { x: 120, y: 40, width: 160, height: 8, rx: 4, fill: pal.woodDark });
    const wind = g({});
    [0, 1, 2].forEach((i) => el('path', { d: `M 0 ${i * 18} q 20 -8 40 0 t 40 0`, stroke: '#A7D7F0', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, wind));
    const b = B(200, { scale: 0.95 });
    return (t) => {
      const q = easeInOut(seg(t, 1.0, 1.9));
      Wn.set(q);
      const sway = q * Math.sin(t * 4) * 6;
      tf(cur[0], 122 - q * 8, 48, sway * 0.4, 1, 1);
      tf(cur[1], 278 + q * 8, 48, -sway * 0.4, -1, 1);
      b.pose({ armL: lerp(8, 160, easeOut(seg(t, 0.5, 1.0))) * (1 - seg(t, 2.0, 2.4)) + 8 * seg(t, 2.0, 2.4), armR: lerp(8, 160, easeOut(seg(t, 0.5, 1.0))) * (1 - seg(t, 2.0, 2.4)) + 8 * seg(t, 2.0, 2.4), mood: t > 2.0 ? 'grin' : 'smile', blink: t > 2.4 && t < 3.2 ? 1 : 0, lift: hump(seg(t, 0.6, 1.0)) * 6 });
      tf(wind, 150 + ((t - 1.8) * 60) % 60, 90);
      show(wind, t > 1.8 ? 0.8 : 0);
    };
  }
  function closeDoor(kind) {
    bgRoom({ pic: [60, 70] });
    const opening = kind === 'openDoor';
    const fx = 220, dw = 76, dh = 150;
    el('rect', { x: fx - 8, y: FY - dh - 8, width: dw + 16, height: dh + 8, rx: 5, fill: pal.woodDark });
    el('rect', { x: fx, y: FY - dh, width: dw, height: dh, fill: k.gradient([[0, '#C9E6F6'], [1, '#E8F4EA']]) });
    el('rect', { x: fx, y: FY - 30, width: dw, height: 30, fill: '#BFDDA9' });
    const door = g({});
    el('rect', { x: 0, y: 0, width: dw, height: dh, rx: 3, fill: pal.blue }, door);
    el('rect', { x: 10, y: 12, width: dw - 20, height: 52, rx: 4, fill: '#FFFFFF', opacity: 0.22 }, door);
    el('rect', { x: 10, y: 78, width: dw - 20, height: 60, rx: 4, fill: '#000000', opacity: 0.06 }, door);
    el('circle', { cx: dw - 12, cy: dh * 0.55, r: 5, fill: pal.yellow }, door);
    const bang = g({});
    [-30, 0, 30].forEach((r) => el('line', { x1: 0, y1: 0, x2: 22, y2: 0, stroke: pal.coral, 'stroke-width': 4, 'stroke-linecap': 'round', transform: `rotate(${r}) translate(10 0)` }, bang));
    const b = B(150, { scale: 0.95 });
    return (t) => {
      const q = opening ? easeInOut(seg(t, 1.0, 1.9)) : easeIn(seg(t, 1.0, 1.6));
      const open = opening ? q : 1 - q;
      const shake = !opening ? wobble(seg(t, 1.6, 2.3), 3, 5) * 0.03 : 0;
      tf(door, fx, FY - dh, 0, ss(lerp(1, 0.14, open) + shake), 1);
      const reach = opening ? seg(t, 0.5, 1.0) * (1 - seg(t, 2.0, 2.4)) : seg(t, 0.5, 1.0) * (1 - seg(t, 1.8, 2.2));
      b.pose({ armR: 8 + reach * 80, lean: reach * 8, look: 0.8, mood: t > 1.8 ? (opening ? 'grin' : 'smile') : 'flat', x: 150 + reach * 14 });
      tf(bang, fx + dw + 8, FY - dh / 2, 0, ss(backOut(seg(t, 1.6, 1.8))));
      show(bang, !opening && t > 1.6 ? 1 - seg(t, 2.2, 2.6) : 0);
    };
  }
  function fill() {
    bgRoom({ win: [50, 60] });
    const top = table(160, 180, 66);
    const gx = 290;
    const cp = k.clip((c) => el('path', { d: `M ${gx - 18} ${top - 56} L ${gx + 18} ${top - 56} L ${gx + 14} ${top} L ${gx - 14} ${top} Z` }, c));
    const lv = el('rect', { x: gx - 30, y: top, width: 60, height: 60, fill: '#8FD3F4', 'clip-path': cp });
    el('path', { d: `M ${gx - 18} ${top - 56} L ${gx + 18} ${top - 56} L ${gx + 14} ${top} L ${gx - 14} ${top} Z`, fill: '#E8F6FD', opacity: 0.3, stroke: '#9FC6DB', 'stroke-width': 3 });
    const pit = g({});
    el('path', { d: 'M -16 -40 L 16 -40 L 20 0 L -20 0 Z', fill: '#FFFFFF', stroke: '#9FC6DB', 'stroke-width': 3 }, pit);
    el('path', { d: 'M -18 -18 L 18 -18 L 20 0 L -20 0 Z', fill: '#8FD3F4' }, pit);
    el('path', { d: 'M 16 -38 L 28 -46 L 22 -34 Z', fill: '#FFFFFF', stroke: '#9FC6DB', 'stroke-width': 3 }, pit);
    el('path', { d: 'M -16 -32 Q -32 -26 -18 -10', stroke: '#9FC6DB', 'stroke-width': 4, fill: 'none' }, pit);
    const stream = el('path', { d: '', stroke: '#8FD3F4', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' });
    const b = B(200, { scale: 0.95 });
    const tick = g({}); star4(tick);
    return (t) => {
      const up = easeInOut(seg(t, 0.4, 1.0)) * (1 - easeInOut(seg(t, 2.6, 3.1)));
      const tilt = easeInOut(seg(t, 0.9, 1.3)) * (1 - easeInOut(seg(t, 2.3, 2.6)));
      b.pose({ armR: lerp(30, 95, up), lean: tilt * 8, look: 0.8, mood: t > 2.7 ? 'grin' : 'flat' });
      const h = b.handPos('R');
      const px = h.x + 26, py = h.y + 22;
      tf(pit, px, py, tilt * 55);
      const sx = px + 28 * Math.cos(tilt * 55 * Math.PI / 180) + 30 * Math.sin(tilt * 55 * Math.PI / 180), sy = py - 40 * Math.cos(tilt * 55 * Math.PI / 180) + 20 * Math.sin(tilt * 55 * Math.PI / 180);
      const lvl = seg(t, 1.25, 2.45);
      const sur = top - 4 - lvl * 46;
      k.set(stream, { d: `M ${sx} ${sy} Q ${gx - 4} ${sy} ${gx - 2} ${sur}` });
      show(stream, t > 1.2 && t < 2.45 ? 1 : 0);
      k.set(lv, { y: sur, height: top - sur + 2 });
      tf(tick, gx + 30, top - 70, t * 60, ss(backOut(seg(t, 2.5, 2.9))));
      show(tick, t > 2.5 ? 1 : 0);
    };
  }
  function empty() {
    bgOut({ tufts: false });
    const bin = g({});
    el('path', { d: 'M -38 -90 L 38 -90 L 32 0 L -32 0 Z', fill: '#6DAA8E' }, bin);
    el('rect', { x: -42, y: -96, width: 84, height: 10, rx: 4, fill: '#5A957A' }, bin);
    [-18, 0, 18].forEach((x) => el('rect', { x: x - 2, y: -80, width: 4, height: 70, rx: 2, fill: '#5A957A' }, bin));
    tf(bin, 340, FY);
    k.shadow(340, FY + 2, 44, 6);
    const can = g({});
    const balls = [[-12, -50], [6, -54], [-2, -64], [14, -46]].map(([x, y]) => { const c = el('circle', { cx: 0, cy: 0, r: 9, fill: '#F2F2EA', stroke: '#C9C3B4', 'stroke-width': 2 }, null); return [c, x, y]; });
    const cg = g({}, can);
    balls.forEach(([c]) => cg.appendChild(c));
    el('path', { d: 'M -22 -48 L 22 -48 L 18 0 L -18 0 Z', fill: '#A3AEBF' }, can);
    el('rect', { x: -24, y: -50, width: 48, height: 6, rx: 3, fill: '#8B96A8' }, can);
    const b = B(170, { scale: 0.9 });
    return (t) => {
      const carryq = easeInOut(seg(t, 0.3, 0.9));
      const tip = easeInOut(seg(t, 1.0, 1.6)) * (1 - easeInOut(seg(t, 2.5, 3.0)));
      b.pose({ x: 170 + carryq * 70, walk: t > 0.3 && t < 0.9 ? t * 9 : 0, armR: lerp(60, 110, tip), armL: 60, lean: tip * 8, mood: t > 2.8 ? 'grin' : 'flat', look: 0.8 });
      const h = b.handPos('R');
      const cx = h.x + 18, cy = h.y + 40;
      tf(can, cx, cy, tip * 125);
      balls.forEach(([c, x, y], i) => {
        const q = seg(t, 1.35 + i * 0.12, 2.0 + i * 0.12);
        if (q <= 0) { k.set(c, { transform: `translate(${x} ${y})`, opacity: 1 }); return; }
        const a = (tip * 125 * Math.PI) / 180;
        const wx = cx + x * Math.cos(a) - y * Math.sin(a), wy = cy + x * Math.sin(a) + y * Math.cos(a);
        const tx = lerp(wx, 336 + (i - 1.5) * 10, q), ty = lerp(wy, FY - 60 + i * 6, easeIn(q));
        const ca = -tip * 125 * Math.PI / 180;
        const lx = (tx - cx) * Math.cos(ca) - (ty - cy) * Math.sin(ca), ly = (tx - cx) * Math.sin(ca) + (ty - cy) * Math.cos(ca);
        k.set(c, { transform: `translate(${lx} ${ly})`, opacity: q < 0.95 ? 1 : 0 });
      });
    };
  }
  function breakCup() {
    bgRoom({ win: [270, 60] });
    const cup = g({});
    el('path', { d: 'M -16 -34 L 16 -34 L 13 0 L -13 0 Z', fill: '#FFFFFF', stroke: '#9FB3C8', 'stroke-width': 2.5 }, cup);
    el('rect', { x: -16, y: -26, width: 32, height: 6, fill: pal.blue }, cup);
    el('path', { d: 'M 15 -28 Q 28 -24 14 -10', stroke: '#9FB3C8', 'stroke-width': 4, fill: 'none' }, cup);
    const shards = [[-14, -18, 'M 0 0 L 10 -6 L 12 6 Z', -1.2], [0, -10, 'M 0 0 L 12 2 L 4 10 Z', 0.5], [12, -16, 'M 0 0 L 8 -8 L 10 6 Z', 1.3], [-4, -4, 'M 0 0 L -8 6 L 6 6 Z', -0.3]].map(([x, y, d, dir]) => { const s = el('path', { d, fill: '#FFFFFF', stroke: '#9FB3C8', 'stroke-width': 2 }); return [s, dir]; });
    const bang = g({});
    spark(bang, 8, 14, pal.coral);
    const b = B(170, { scale: 0.95 });
    const sweat = g({}); droplet(sweat);
    return (t) => {
      b.pose({ armR: t < 1.0 ? lerp(8, 75, easeOut(seg(t, 0.2, 0.6))) : 75 + seg(t, 1.0, 1.15) * 30, mood: t > 1.2 ? 'open' : 'smile', look: t > 1.2 ? 0.6 : 0.3, lift: hump(seg(t, 1.6, 1.9)) * 8, armL: t > 1.6 ? 120 : 8 });
      const h = b.handPos('R');
      const fq = seg(t, 1.0, 1.55);
      const y = t < 1.0 ? h.y + 30 : lerp(h.y + 30, FY, easeIn(fq));
      const x = h.x + 4 + fq * 18;
      tf(cup, x, y, fq * 90);
      show(cup, t < 1.55 ? 1 : 0);
      const sq = seg(t, 1.55, 2.3);
      shards.forEach(([s, dir], i) => {
        const sx = x + dir * 70 * easeOut(sq);
        const sy = FY - 4 - hump(Math.min(1, sq * 1.4)) * (20 + i * 6);
        s.setAttribute('transform', `translate(${sx.toFixed(1)} ${sy.toFixed(1)}) rotate(${(dir * 400 * easeOut(sq)).toFixed(1)})`);
        show(s, t >= 1.55 ? 1 : 0);
      });
      tf(bang, x, FY - 10, 0, ss(backOut(seg(t, 1.55, 1.75))));
      show(bang, t > 1.55 ? 1 - seg(t, 1.9, 2.3) : 0);
      tf(sweat, 210, FY - 100 + seg(t, 2.2, 3.2) * 10);
      show(sweat, t > 2.2 ? 1 : 0);
    };
  }
  function fix() {
    bgOut({ tufts: false });
    const bike = g({});
    const wheel = (x) => { const w = g({}, bike); el('circle', { cx: 0, cy: 0, r: 30, fill: 'none', stroke: '#3B4252', 'stroke-width': 6 }, w); for (let i = 0; i < 6; i++) el('line', { x1: 0, y1: 0, x2: 0, y2: -27, stroke: '#9AA3B1', 'stroke-width': 1.6, transform: `rotate(${i * 60})` }, w); el('circle', { cx: 0, cy: 0, r: 4, fill: '#5A6170' }, w); tf(w, x, -30); return w; };
    const back = wheel(-56);
    const frame = g({}, bike);
    el('path', { d: 'M -56 -30 L -18 -30 L 6 -64 L -30 -64 Z M -18 -30 L -36 -76 M 6 -64 L 10 -76', stroke: pal.coral, 'stroke-width': 6, fill: 'none', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, frame);
    el('rect', { x: -46, y: -82, width: 22, height: 7, rx: 3, fill: '#5A6170' }, frame);
    el('line', { x1: 6, y1: -76, x2: 18, y2: -78, stroke: '#5A6170', 'stroke-width': 5, 'stroke-linecap': 'round' }, frame);
    const fork = g({}, bike);
    el('line', { x1: 0, y1: 0, x2: 50, y2: 34, stroke: pal.coral, 'stroke-width': 6, 'stroke-linecap': 'round' }, fork);
    tf(fork, 6, -64);
    const front = g({});
    el('circle', { cx: 0, cy: 0, r: 30, fill: 'none', stroke: '#3B4252', 'stroke-width': 6 }, front);
    for (let i = 0; i < 6; i++) el('line', { x1: 0, y1: 0, x2: 0, y2: -27, stroke: '#9AA3B1', 'stroke-width': 1.6, transform: `rotate(${i * 60})` }, front);
    el('circle', { cx: 0, cy: 0, r: 4, fill: '#5A6170' }, front);
    tf(bike, 220, FY);
    k.shadow(225, FY + 2, 90, 6);
    void back;
    const wr = gemo(pick(e, '🔧'), 30);
    const b = B(110, { scale: 0.9 });
    const sp = g({}); [[0, 0], [20, -18], [-16, -24]].forEach(([x, y]) => { const s = g({}, sp); star4(s, pal.yellow, 8); tf(s, x, y); });
    return (t) => {
      const q = easeInOut(seg(t, 1.0, 2.2));
      tf(front, lerp(300, 276, q), lerp(FY - 22, FY - 30, q), lerp(-70, 0, q) + (t > 2.2 ? (t - 2.2) * 200 : 0), 1, lerp(0.45, 1, q));
      const work = t > 0.8 && t < 2.4;
      b.pose({ x: 110 + easeOut(seg(t, 0.2, 0.8)) * 60, walk: t > 0.2 && t < 0.8 ? t * 9 : 0, armR: work ? 80 + Math.sin(t * 14) * 18 : 30, lean: work ? 14 : 0, mood: t > 2.4 ? 'grin' : 'flat', look: 0.8 });
      const h = b.handPos('R');
      tf(wr, h.x + 6, h.y + 22, work ? Math.sin(t * 14) * 25 : 0);
      tf(sp, 280, FY - 80, 0, ss(backOut(seg(t, 2.3, 2.7))));
      show(sp, t > 2.3 ? 1 : 0);
    };
  }
  function clean(kind) {
    const tool = kind === 'sweep' ? '🧹' : kind === 'wash' ? '🧼' : kind === 'brush' ? '🪥' : '🧽';
    const ch = isProp(e) ? e : tool;
    if (kind === 'brush' || kind === 'wash') bgRoom({ wall: '#EEF6F7', wall2: '#F7FBFB', wains: '#E1EEF0', floor: '#D9E4E8' }); else bgRoom({ win: [290, 56] });
    const b = B(kind === 'sweep' ? 130 : 170, { scale: 0.95 });
    const dirt = g({});
    let top = FY;
    if (kind === 'wipe') { top = table(200, 170, 70); }
    if (kind === 'wash' || kind === 'brush') {
      el('rect', { x: 230, y: FY - 110, width: 70, height: 56, rx: 6, fill: '#D6E6EC', stroke: '#B9CDD6', 'stroke-width': 2 });
      el('rect', { x: 200, y: FY - 60, width: 130, height: 60, rx: 6, fill: '#FFFFFF', stroke: '#C9D6DC', 'stroke-width': 2 });
      el('path', { d: `M 214 ${FY - 60} Q 265 ${FY - 30} 316 ${FY - 60}`, fill: '#E3F1F6' });
      el('path', { d: `M 258 ${FY - 98} L 258 ${FY - 86} Q 258 ${FY - 80} 266 ${FY - 80}`, stroke: '#9AA6B6', 'stroke-width': 6, fill: 'none' });
    }
    const spots = kind === 'sweep' ? [[220, FY + 6, 16], [256, FY + 12, 12], [290, FY + 4, 14]] : kind === 'wipe' ? [[240, top + 2, 10], [276, top + 2, 13], [318, top + 2, 9]] : [];
    const D = spots.map(([x, y, r]) => el('ellipse', { cx: x, cy: y - 2, rx: r, ry: r * 0.35 + 2, fill: '#B7A285', opacity: 0.85 }, dirt));
    const water = el('rect', { x: 262, y: FY - 80, width: 6, height: 0, fill: '#8FD3F4' });
    const T = g({});
    const te = emo(ch, kind === 'brush' ? 24 : 36, T);
    if (kind === 'brush') tf(te, 0, 0, -90);
    const bub = g({});
    const bs = [0, 1, 2, 3, 4].map(() => el('circle', { r: 5, fill: '#FFFFFF', stroke: '#BFE3F5', 'stroke-width': 1.5 }, bub));
    const sp = g({}); [[0, 0], [24, -14], [-20, -20]].forEach(([x, y]) => { const s = g({}, sp); star4(s, pal.yellow, 8); tf(s, x, y); });
    return (t) => {
      const work = seg(t, 0.8, 2.6);
      const osc = work > 0 && work < 1 ? Math.sin((t - 0.8) * 11) : 0;
      let tx, ty, armR, lean = 0, x = kind === 'sweep' ? 130 : 170, mood = t > 2.6 ? 'grin' : 'flat';
      if (kind === 'sweep') { x = 130 + work * 100; lean = 16 * seg(t, 0.4, 0.8); armR = 60 + osc * 14; }
      else if (kind === 'wipe') { lean = 12 * seg(t, 0.4, 0.8); armR = 85 + osc * 12; }
      else if (kind === 'brush') { armR = lerp(8, 150, seg(t, 0.4, 0.8)); }
      else { armR = lerp(8, 90, seg(t, 0.4, 0.8)) + osc * 8; lean = 10 * seg(t, 0.4, 0.8); x = 190 * 1; }
      b.pose({ x, armR, armL: kind === 'wash' ? armR : kind === 'sweep' ? 50 : 8, lean, mood: kind === 'brush' && work > 0 && work < 1 ? 'grin' : mood, look: kind === 'brush' ? 0 : 0.8, walk: kind === 'sweep' && work > 0 && work < 1 ? t * 6 : 0 });
      const h = b.handPos('R');
      if (kind === 'sweep') { tx = h.x + 18 + osc * 16; ty = FY - 14; }
      else if (kind === 'wipe') { tx = lerp(232, 320, work) + osc * 14; ty = top - 10; }
      else if (kind === 'brush') { tx = x + 18 + osc * 6; ty = FY - 57; }
      else { tx = h.x + 4 + osc * 6; ty = h.y + 18; }
      tf(T, tx, ty, kind === 'sweep' ? -25 + osc * 10 : 0);
      D.forEach((d, i) => { const ds = spots[i][0]; const gone = clamp((tx - ds + 20) / 40); show(d, 0.85 * (1 - (work > 0 ? gone : 0))); });
      k.set(water, { height: kind === 'wash' && work > 0 && work < 1 ? 36 : 0 });
      bs.forEach((c, i) => { const q = ((t * 0.9 + i * 0.2) % 1); const on = (kind === 'wash' || kind === 'brush') && work > 0 && work < 1; k.set(c, { cx: (kind === 'brush' ? x + 26 : tx) + Math.cos(i * 2) * 16, cy: (kind === 'brush' ? FY - 54 : ty) - q * 24, r: 3 + (i % 3) * 2, opacity: on ? 1 - q : 0 }); });
      tf(sp, kind === 'brush' ? x + 30 : kind === 'sweep' ? 256 : kind === 'wipe' ? 280 : h.x, kind === 'brush' ? FY - 90 : kind === 'sweep' ? FY - 20 : kind === 'wipe' ? top - 26 : h.y - 10, 0, ss(backOut(seg(t, 2.6, 3.0))));
      show(sp, t > 2.6 ? 1 : 0);
    };
  }
  function stove() {
    bgRoom({ wall: '#EEF4F2', wall2: '#F7FAF9', wains: '#E1ECE8', floor: '#D9DED8' });
    for (let x = 0; x < W; x += 30) el('line', { x1: x, y1: FY - 140, x2: x, y2: FY - 60, stroke: '#DDE8E4', 'stroke-width': 2 });
    for (let y = FY - 140; y < FY - 60; y += 30) el('line', { x1: 0, y1: y, x2: W, y2: y, stroke: '#DDE8E4', 'stroke-width': 2 });
    el('rect', { x: 170, y: FY - 74, width: 230, height: 74, fill: '#C9D3DA' });
    el('rect', { x: 164, y: FY - 80, width: 236, height: 10, rx: 3, fill: '#AEB9C3' });
    el('rect', { x: 230, y: FY - 54, width: 120, height: 44, rx: 6, fill: '#5D6B80' });
    el('rect', { x: 240, y: FY - 46, width: 100, height: 26, rx: 4, fill: '#7E8BA0' });
    return FY - 80;
  }
  function heat() {
    const top = stove();
    const fl = g({});
    const flames = [-18, 0, 18].map((x) => el('path', { d: 'M 0 0 Q -7 -10 0 -22 Q 7 -10 0 0 Z', fill: '#FF8A4C', transform: `translate(${x} 0)` }, fl));
    tf(fl, 290, top);
    const pot = g({});
    el('rect', { x: -40, y: -46, width: 80, height: 46, rx: 8, fill: '#9AA6B6' }, pot);
    el('rect', { x: -44, y: -50, width: 88, height: 8, rx: 4, fill: '#7E8BA0' }, pot);
    el('rect', { x: -62, y: -40, width: 22, height: 6, rx: 3, fill: '#5D6B80' }, pot);
    const lid = g({}, pot);
    el('path', { d: 'M -40 -50 Q 0 -66 40 -50 Z', fill: '#B6C0CC' }, lid);
    el('circle', { cx: 0, cy: -62, r: 5, fill: '#5D6B80' }, lid);
    tf(pot, 290, top - 6);
    const steam = g({});
    const S = [0, 1, 2].map((i) => el('path', { d: 'M 0 0 q -8 -12 0 -24 q 8 -12 0 -24', stroke: '#FFFFFF', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round', opacity: 0 }, steam));
    const b = B(150, { scale: 0.95 });
    return (t) => {
      const on = easeOut(seg(t, 0.7, 1.4));
      flames.forEach((f, i) => { const s = on * (0.8 + Math.sin(t * 20 + i * 2) * 0.2); f.setAttribute('transform', `translate(${(i - 1) * 18} 0) scale(${ss(s)})`); });
      b.pose({ armR: t < 1.4 ? lerp(8, 70, seg(t, 0.3, 0.8)) : 70, lean: t < 1.4 ? 8 : 4, look: 0.8, mood: t > 2.6 ? 'grin' : 'smile' });
      const boil = seg(t, 1.6, 2.6);
      const rattle = boil > 0 ? Math.max(0, Math.sin(t * 30)) * 3 * boil : 0;
      lid.setAttribute('transform', `translate(0 ${-rattle}) rotate(${rattle})`);
      S.forEach((s, i) => { const q = ((t * 0.8 + i * 0.33) % 1); s.setAttribute('transform', `translate(${(i - 1) * 22} ${-70 - q * 40})`); s.setAttribute('opacity', boil * (1 - q) * 0.9); });
      tf(steam, 290, top);
    };
  }
  function cool() {
    bgRoom({ win: [40, 60] });
    const top = table(170, 200, 66);
    const bowl = g({});
    el('path', { d: 'M -40 0 Q -38 34 0 36 Q 38 34 40 0 Z', fill: '#FFFFFF', stroke: '#C9D2DC', 'stroke-width': 2 }, bowl);
    el('ellipse', { cx: 0, cy: 0, rx: 40, ry: 8, fill: '#F2A65A' }, bowl);
    const glow = el('ellipse', { cx: 0, cy: 0, rx: 36, ry: 6, fill: '#FF5A3C', opacity: 0.6 }, bowl);
    tf(bowl, 290, top - 36);
    const steam = g({});
    const S = [0, 1, 2].map(() => el('path', { d: 'M 0 0 q -8 -12 0 -24 q 8 -12 0 -24', stroke: '#C9D2DC', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, steam));
    const th = g({});
    el('rect', { x: -7, y: -80, width: 14, height: 80, rx: 7, fill: '#FFFFFF', stroke: '#C9D2DC', 'stroke-width': 2 }, th);
    el('circle', { cx: 0, cy: 4, r: 11, fill: pal.red }, th);
    const merc = el('rect', { x: -3.5, y: -70, width: 7, height: 74, rx: 3.5, fill: pal.red }, th);
    tf(th, 370, top - 20);
    const blow = g({});
    [0, 1, 2].forEach((i) => el('line', { x1: 0, y1: i * 8 - 8, x2: 22, y2: i * 8 - 8 + 6, stroke: '#A7D7F0', 'stroke-width': 3, 'stroke-linecap': 'round' }, blow));
    const b = B(210, { scale: 0.95 });
    return (t) => {
      const q = easeInOut(seg(t, 0.9, 2.8));
      b.pose({ lean: 10 * seg(t, 0.5, 0.9) * (1 - seg(t, 2.8, 3.2)), mood: t > 0.9 && t < 2.8 ? 'open' : t > 2.8 ? 'grin' : 'flat', look: 0.8, armR: t > 2.9 ? 70 : 8 });
      show(glow, 0.6 * (1 - q));
      S.forEach((s, i) => { const ph = ((t * 0.8 + i * 0.33) % 1); s.setAttribute('transform', `translate(${(i - 1) * 18} ${-ph * 30})`); s.setAttribute('opacity', (1 - q) * (1 - ph) * 0.9); });
      tf(steam, 290, top - 44);
      const lvl = lerp(70, 24, q);
      k.set(merc, { y: -lvl, height: lvl + 4, fill: q > 0.7 ? pal.blue : pal.red });
      tf(blow, 232, FY - 70 + Math.sin(t * 8) * 2);
      show(blow, t > 0.9 && t < 2.8 && Math.sin(t * 5) > -0.4 ? 1 : 0);
    };
  }
  function grow() {
    bgOut();
    const pot = g({});
    el('path', { d: 'M -30 -44 L 30 -44 L 24 0 L -24 0 Z', fill: '#D9875E' }, pot);
    el('rect', { x: -34, y: -50, width: 68, height: 10, rx: 4, fill: '#C5714A' }, pot);
    tf(pot, 270, FY);
    k.shadow(270, FY + 2, 36, 6);
    const plant = g({});
    const stem = el('path', { d: '', stroke: '#4FA067', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, plant);
    const leaves = [0, 1, 2, 3].map((i) => { const L = g({}, plant); el('path', { d: `M 0 0 Q ${(i % 2 ? 1 : -1) * 16} -14 ${(i % 2 ? 1 : -1) * 28} -2 Q ${(i % 2 ? 1 : -1) * 14} 6 0 0 Z`, fill: '#6CC383' }, L); return L; });
    const flower = g({}, plant);
    [0, 72, 144, 216, 288].forEach((a) => el('ellipse', { cx: 0, cy: -10, rx: 7, ry: 11, fill: '#FF9FB0', transform: `rotate(${a})` }, flower));
    el('circle', { cx: 0, cy: 0, r: 7, fill: pal.yellow }, flower);
    const can = g({});
    el('rect', { x: -18, y: -24, width: 36, height: 24, rx: 5, fill: pal.blue }, can);
    el('path', { d: 'M 18 -18 L 40 -32', stroke: pal.blue, 'stroke-width': 6, 'stroke-linecap': 'round' }, can);
    el('path', { d: 'M -18 -18 Q -32 -14 -18 -4', stroke: pal.blueDark, 'stroke-width': 4, fill: 'none' }, can);
    const drops = [0, 1, 2].map(() => droplet(g({})));
    const b = B(150, { scale: 0.9 });
    return (t) => {
      const water = t > 0.4 && t < 1.4;
      b.pose({ armR: water ? 85 : lerp(85, 8, seg(t, 1.4, 1.7)), lean: water ? 8 : 0, look: 0.8, mood: t > 2.6 ? 'open' : 'smile', lift: hump(seg(t, 2.6, 3.0)) * 8 });
      const h = b.handPos('R');
      const tilt = water ? 30 : lerp(30, 0, seg(t, 1.4, 1.7));
      tf(can, h.x + 18, h.y + 26, tilt);
      show(can, t < 1.8 ? 1 - seg(t, 1.6, 1.8) : 0);
      drops.forEach((d, i) => { const q = ((t * 2 + i / 3) % 1); d.setAttribute('transform', `translate(${248 + i * 8} ${h.y + 10 + q * 40})`); show(d, water ? 1 - q * 0.5 : 0); });
      const gq = easeOut(seg(t, 1.3, 3.0));
      const hgt = lerp(14, 120, gq);
      const sw = Math.sin(t * 2) * 3 * gq;
      k.set(stem, { d: `M 270 ${FY - 46} Q ${270 + sw} ${FY - 46 - hgt / 2} ${270 + sw} ${FY - 46 - hgt}` });
      leaves.forEach((L, i) => { const at = (i + 1) / 5; const lq = backOut(seg(gq, at - 0.15, at + 0.1)); tf(L, 270 + sw * at, FY - 46 - hgt * at * 0.95, 0, ss(lq)); });
      const fq = backOut(seg(t, 2.6, 3.1));
      tf(flower, 270 + sw, FY - 46 - hgt, t * 20, ss(fq));
    };
  }
  function chart(kind) {
    bgRoom({ wall: '#EEF2F6', wains: '#E3E8EF' });
    el('rect', { x: 150, y: 34, width: 230, height: 160, rx: 6, fill: '#FFFFFF', stroke: '#C9D2DC', 'stroke-width': 4 });
    el('rect', { x: 255, y: 194, width: 20, height: 42, fill: '#B9C3D2' });
    el('line', { x1: 170, y1: 176, x2: 364, y2: 176, stroke: '#9AA6B6', 'stroke-width': 3 });
    const more = kind === 'more';
    const base = [40, 50, 60, 70];
    const bars = base.map((_, i) => el('rect', { x: 182 + i * 46, y: 176, width: 30, height: 0, rx: 4, fill: more ? pal.mint : pal.coral }));
    const arr = el('path', { d: '', stroke: more ? pal.mintDark : pal.coralDark, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    const b = B(90, { scale: 0.95 });
    return (t) => {
      const q = seg(t, 0.9, 2.6);
      bars.forEach((r, i) => {
        const qi = easeOut(seg(q, i * 0.2, i * 0.2 + 0.4));
        const h0 = 50, h1 = more ? 30 + i * 32 : 120 - i * 30;
        const hh = lerp(more ? 30 : 120, h1, qi);
        void h0;
        k.set(r, { y: 176 - hh, height: hh });
      });
      const aq = seg(t, 2.5, 3.0);
      const ys = more ? [150, 60] : [60, 150];
      k.set(arr, { d: `M 190 ${ys[0]} L ${lerp(190, 350, aq)} ${lerp(ys[0], ys[1], aq)}` });
      show(arr, aq > 0 ? 1 : 0);
      b.pose({ armR: lerp(8, 120, easeOut(seg(t, 0.5, 1.0))), look: 1, mood: t > 2.6 ? (more ? 'grin' : 'open') : 'smile' });
    };
  }
  function accel() {
    bgOut({ road: true, tufts: false });
    const posts = g({});
    const P = [0, 1, 2, 3, 4].map(() => { const G = g({}, posts); el('rect', { x: -3, y: -40, width: 6, height: 40, fill: '#B9C3D2' }, G); el('rect', { x: -8, y: -48, width: 16, height: 10, rx: 3, fill: '#FFFFFF', stroke: '#B9C3D2' }, G); return G; });
    const stripes = [0, 1, 2, 3, 4, 5].map(() => el('rect', { x: 0, y: FY + 30, width: 34, height: 4, fill: '#FFFFFF' }));
    const Car = car(pal.coral, pal.coralDark, true);
    const lines = g({});
    const L = [0, 1, 2, 3].map((i) => el('line', { x1: 0, y1: -14 - i * 12, x2: -40, y2: -14 - i * 12, stroke: '#FFFFFF', 'stroke-width': 3, 'stroke-linecap': 'round' }, lines));
    const gauge = g({});
    el('path', { d: 'M -34 0 A 34 34 0 0 1 34 0', stroke: '#D9DFE7', 'stroke-width': 8, fill: 'none' }, gauge);
    el('path', { d: 'M 16 -30 A 34 34 0 0 1 34 0', stroke: pal.red, 'stroke-width': 8, fill: 'none' }, gauge);
    const needle = el('line', { x1: 0, y1: 0, x2: 0, y2: -28, stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }, gauge);
    el('circle', { cx: 0, cy: 0, r: 5, fill: pal.ink }, gauge);
    tf(gauge, 330, 64);
    return (t) => {
      const a0 = 1.0;
      const v = (tt) => (tt < a0 ? 60 : 60 + 200 * Math.min(tt - a0, 1.8));
      const d = t < a0 ? 60 * t : 60 * a0 + 60 * (Math.min(t, a0 + 1.8) - a0) + 100 * Math.pow(Math.min(t, a0 + 1.8) - a0, 2) + (t > a0 + 1.8 ? 420 * (t - a0 - 1.8) : 0);
      const cx = 150 + easeOut(seg(t, 1.0, 2.0)) * 30;
      Car.place(cx, FY + 40, d * 2, t > 1 && t < 1.6 ? -2 * hump(seg(t, 1.0, 1.6)) : 0);
      P.forEach((G, i) => { let x = (i * 110 + 60 - d * 0.9) % 550; if (x < -50) x += 550; tf(G, x, FY + 12); });
      stripes.forEach((s, i) => { let x = (i * 80 - d * 1.5) % 480; if (x < -40) x += 480; k.set(s, { x }); });
      const sp = clamp((v(t) - 60) / 360);
      L.forEach((l, i) => k.set(l, { x2: -20 - sp * 60 - i * 6, opacity: sp }));
      tf(lines, cx - 70, FY + 30);
      needle.setAttribute('transform', `rotate(${lerp(-70, 75, sp)})`);
    };
  }
  function appear() {
    bgOut({ sky: ['#C9D9E6', '#EDF3F8'] });
    const prop = isProp(e) ? g({}) : null;
    if (prop) gemo(e, 70, prop);
    const rb = g({});
    const cols = ['#F2685B', '#FFB463', '#FFDA6B', '#7FD08B', '#6AA8F7', '#A58BF3'];
    const arcs = cols.map((c, i) => el('path', { d: `M ${60 + i * 9} 210 A ${150 - i * 9} ${130 - i * 9} 0 0 1 ${360 - i * 9} 210`, stroke: c, 'stroke-width': 9, fill: 'none', 'stroke-dasharray': '600', 'stroke-dashoffset': 600 }, rb));
    const rc = cloud(130, 70, 1.2);
    const rainDrops = [0, 1, 2, 3, 4].map(() => droplet(g({}), '#9CC8E6'));
    const sun = el('circle', { cx: 330, cy: 60, r: 22, fill: '#FFD86B' });
    const b = B(90, { y: FY + 20, scale: 0.85 });
    return (t) => {
      const clear = easeInOut(seg(t, 0.5, 1.1));
      rainDrops.forEach((d, i) => { const q = (t * 1.5 + i * 0.2) % 1; d.setAttribute('transform', `translate(${110 + i * 14} ${90 + q * 120})`); show(d, (1 - clear) * (1 - q)); });
      tf(rc, 130 - clear * 160, 70, 0, 1.2);
      show(sun, clear);
      const q = easeInOut(seg(t, 1.0, 2.4));
      if (!prop) arcs.forEach((a) => k.set(a, { 'stroke-dashoffset': 600 * (1 - q) }));
      else { tf(prop, 250, FY, 0, ss(backOut(q))); show(rb, 0); }
      b.pose({ look: 0.8, armR: lerp(8, 140, easeOut(seg(t, 1.4, 1.9))), mood: t > 1.6 ? 'open' : 'smile', lift: hump(seg(t, 1.6, 2.0)) * 10 });
    };
  }
  function disappear() {
    bgRoom({ win: [60, 60], pic: [300, 64] });
    const cat = g({});
    gemo(pick(e, '🐈'), 50, cat);
    const csh = k.shadow(0, 0, 20, 4);
    const sofa = g({});
    el('rect', { x: 210, y: FY - 92, width: 160, height: 56, rx: 18, fill: '#7FB2DE' }, sofa);
    el('rect', { x: 196, y: FY - 56, width: 188, height: 46, rx: 14, fill: '#8DBDE6' }, sofa);
    el('rect', { x: 190, y: FY - 70, width: 30, height: 60, rx: 12, fill: '#6FA2D0' }, sofa);
    el('rect', { x: 360, y: FY - 70, width: 30, height: 60, rx: 12, fill: '#6FA2D0' }, sofa);
    el('rect', { x: 204, y: FY - 10, width: 10, height: 10, fill: pal.woodDark }, sofa);
    el('rect', { x: 366, y: FY - 10, width: 10, height: 10, fill: pal.woodDark }, sofa);
    const q2 = g({}); k.text(0, 0, '?', { 'font-size': 30, fill: pal.blueDark }, q2);
    const b = B(90, { scale: 0.9 });
    cat.parentNode.insertBefore(cat, sofa); csh.parentNode.insertBefore(csh, sofa);
    return (t) => {
      const q = easeInOut(seg(t, 0.8, 2.0));
      const x = lerp(170, 290, q);
      tf(cat, x, FY - 2 + (q > 0.5 ? (q - 0.5) * 20 : 0), 0, -1, 1);
      show(cat, q < 0.95 ? 1 : 0);
      tf(csh, x, FY + 1);
      show(csh, q < 0.4 ? 1 : 0);
      const lk = t > 2.2 ? Math.sin((t - 2.2) * 5) : 0.8;
      b.pose({ look: lk, mood: t > 2.2 ? 'open' : 'smile', armL: t > 2.2 ? 60 : 8, armR: t > 2.2 ? 60 : 8 });
      tf(q2, 130, FY - 130, 0, ss(backOut(seg(t, 2.3, 2.7))));
      show(q2, t > 2.3 ? 1 : 0);
    };
  }

  // =============== show ===============
  function people() {
    bgRoom({ win: [40, 60], pic: [320, 66] });
    const spot = el('ellipse', { cx: 220, cy: FY + 16, rx: 120, ry: 20, fill: '#FFF3C4', opacity: 0 });
    const P = [];
    const mk = (x, o, acc) => { const b = B(x, o); if (acc) acc(b); P.push(b); return b; };
    const bow = (b) => { const G = g({}, b.g.parentNode); el('path', { d: 'M 0 0 L -12 -8 L -12 8 Z M 0 0 L 12 -8 L 12 8 Z', fill: pal.red }, G); el('circle', { cx: 0, cy: 0, r: 4, fill: '#C9475A' }, G); b.acc = [G, 14, -92]; };
    const cap = (b) => { const G = g({}, b.g.parentNode); el('path', { d: 'M -24 0 Q -24 -18 0 -18 Q 24 -18 24 0 Z', fill: pal.blue }, G); el('rect', { x: 0, y: -4, width: 34, height: 6, rx: 3, fill: pal.blueDark }, G); b.acc = [G, 0, -88]; };
    const bonnet = (b) => { const G = g({}, b.g.parentNode); el('path', { d: 'M -30 4 Q -30 -26 0 -26 Q 30 -26 30 4 Q 20 -10 0 -10 Q -20 -10 -30 4 Z', fill: '#FFD1DC' }, G); b.acc = [G, 0, -78]; };
    const E = e;
    if (has(E, ['👥'])) { mk(130, { color: pal.blue, dark: pal.blueDark, scale: 0.85 }); mk(220, { scale: 0.9 }); mk(310, { ...C2, scale: 0.85, facing: -1 }); }
    else if (has(E, ['👪'])) { mk(140, { color: pal.blue, dark: pal.blueDark, scale: 0.95 }); mk(220, { scale: 0.6 }); mk(300, { ...C2, scale: 0.9, facing: -1 }, bow); }
    else if (has(E, ['👫', '💑', '👬', '👭'])) { mk(170, { scale: 0.9 }); mk(270, { ...C2, scale: 0.9, facing: -1 }, bow); }
    else if (has(E, ['👶'])) { mk(220, { scale: 0.5 }, bonnet); }
    else if (has(E, ['🧒', '👦'])) { mk(220, { scale: 0.65 }, has(E, ['👦']) ? cap : null); }
    else if (has(E, ['👧'])) { mk(220, { scale: 0.65, ...C2 }, bow); }
    else if (has(E, ['👩'])) { mk(220, { scale: 0.95, ...C2 }, bow); }
    else if (has(E, ['👨'])) { mk(220, { scale: 1, color: pal.blue, dark: pal.blueDark }, cap); }
    else { mk(220, { scale: 0.95 }); }
    const hh = g({}); heart(hh);
    const couple = has(E, ['👫', '💑', '👬', '👭']);
    return (t) => {
      show(spot, 0.8 * seg(t, 0.2, 0.8));
      P.forEach((b, i) => {
        const x0 = b.x0;
        const from = x0 < 220 ? -60 : x0 > 220 ? 460 : -60;
        const q = seg(t, 0.2 + i * 0.15, 1.6 + i * 0.15);
        const x = lerp(from, x0, q * 0.6 + easeOut(q) * 0.4);
        const mv = q > 0 && q < 1;
        const face = x0 > 220 ? -1 : 1;
        const wave = t > 2.0 ? Math.sin(t * 8 + i) * 25 : 0;
        b.pose({ x, walk: mv ? t * 9 : 0, facing: mv ? (from < x0 ? 1 : -1) : (P.length === 1 ? 1 : face), armR: t > 2.0 ? (couple ? 60 : 140 + wave) : mv ? 8 - Math.sin(t * 9) * 20 : 8, armL: mv ? 8 + Math.sin(t * 9) * 20 : 8, mood: t > 1.8 ? 'grin' : 'smile', look: P.length === 1 ? 0 : 0.5, lift: hump(seg(t, 1.9 + i * 0.1, 2.2 + i * 0.1)) * 8 });
        if (b.acc) { const [G, ax, ay] = b.acc; const s = b.depthS || 1; void s; const sc = (b.scaleV ||= b.g.getAttribute('transform').match(/scale\(([\d.]+)/)[1] * 1); tf(G, x + ax * sc * b.state.facing, FY + (ay - b.state.lift) * sc, 0, sc, sc); }
      });
      tf(hh, 220, FY - 120 - seg(t, 2.2, 3.2) * 10, 0, ss(backOut(seg(t, 2.2, 2.6))) * 1.6);
      show(hh, couple && t > 2.2 ? 1 : 0);
    };
  }
  function showBig() {
    const outside = has(e, ['🏠', '🏡', '🏢', '🏫', '🏬', '🏥', '⛪', '🗼', '🏰', '🏯']);
    if (outside) bgOut(); else bgRoom({ pic: [40, 64] });
    k.shadow(255, FY + 4, 70, 9);
    const o = gemo(e, 150);
    tf(o, 255, FY + 8);
    const sp = g({}); [[-80, -150], [70, -130], [-60, -60]].forEach(([x, y]) => { const s = g({}, sp); star4(s, pal.yellow, 10); tf(s, x, y); });
    const b = B(-40, { scale: 0.85 });
    return (t) => {
      const s = stride(t, 0.2, 1.4, -40, 110);
      b.pose({ x: s.x, walk: s.walk, armL: s.armL, armR: t > 1.4 ? lerp(8, 120, easeOut(seg(t, 1.4, 1.9))) : s.armR, look: t > 1.4 ? 1 : 0.6, mood: t > 1.8 ? 'grin' : 'smile', lift: hump(seg(t, 1.9, 2.2)) * 6 });
      sp.childNodes.forEach((s2, i) => { const q = seg(t, 1.9 + i * 0.15, 2.3 + i * 0.15); s2.setAttribute('opacity', q); });
      tf(sp, 255, FY, 0, 1);
    };
  }
  function showItem(kind) {
    const food = kind === 'showFood';
    bgRoom({ win: [40, 60], pic: [320, 60], wall: food ? '#F7EFE6' : '#F1F0F6', wains: food ? '#EEDFCC' : '#E4E2EE' });
    let top;
    if (food) {
      top = table(170, 170, 70);
      el('rect', { x: 166, y: FY - 72, width: 178, height: 14, rx: 4, fill: '#FFFFFF', opacity: 0.8 });
      el('ellipse', { cx: 255, cy: FY - 70, rx: 48, ry: 9, fill: '#FFFFFF', stroke: '#D9DFE7', 'stroke-width': 2 });
      top = FY - 72;
    } else {
      el('rect', { x: 205, y: FY - 70, width: 100, height: 70, rx: 4, fill: '#FFFFFF', stroke: '#D9D6E6', 'stroke-width': 2 });
      el('rect', { x: 196, y: FY - 80, width: 118, height: 12, rx: 4, fill: '#E4E1EF' });
      k.shadow(255, FY + 2, 64, 6);
      top = FY - 80;
    }
    const spot = el('path', { d: `M 225 0 L 285 0 L 330 ${top} L 180 ${top} Z`, fill: '#FFF6D2', opacity: 0 });
    const o = gemo(e || '🎁', 70);
    tf(o, 255, top + 4);
    const cover = g({});
    if (food) {
      el('path', { d: 'M -50 0 Q -50 -64 0 -64 Q 50 -64 50 0 Z', fill: '#DDE3EA', stroke: '#B9C3D2', 'stroke-width': 2 }, cover);
      el('path', { d: 'M -34 -12 Q -32 -48 -6 -54', stroke: '#FFFFFF', 'stroke-width': 5, fill: 'none', opacity: 0.8, 'stroke-linecap': 'round' }, cover);
      el('circle', { cx: 0, cy: -68, r: 7, fill: '#B9C3D2' }, cover);
    } else {
      el('path', { d: 'M -48 0 Q -52 -40 -30 -66 Q 0 -86 30 -66 Q 52 -40 48 0 Q 36 -6 24 0 Q 12 -6 0 0 Q -12 -6 -24 0 Q -36 -6 -48 0 Z', fill: pal.violet }, cover);
      el('path', { d: 'M -20 -60 Q -10 -30 -16 -4', stroke: '#8E74DA', 'stroke-width': 3, fill: 'none' }, cover);
    }
    const sp = g({}); [[-60, -60], [56, -76], [-44, -100], [64, -30]].forEach(([x, y]) => { const s = g({}, sp); star4(s, pal.yellow, 9); tf(s, x, y); });
    const b = B(120, { scale: 0.9 });
    return (t) => {
      const reach = easeOut(seg(t, 0.6, 1.0));
      const lift = easeInOut(seg(t, 1.0, 1.6));
      b.pose({ x: 120 + reach * 30, armR: t < 1.6 ? lerp(8, 70, reach) + lift * 70 : lerp(140, 105, seg(t, 1.6, 2.0)), armL: 8, look: 0.8, mood: t > 1.7 ? 'grin' : 'smile', lean: reach * 6 * (1 - lift) });
      const h = b.handPos('R');
      if (food) tf(cover, lerp(255, h.x + 10, lift), lerp(top, h.y + 30, lift) - lift * 20, -lift * 25);
      else tf(cover, 255 + lift * 120, top - lift * 140, lift * 60, lerp(1, 0.6, lift));
      show(cover, food ? (t < 1.9 ? 1 : 1 - seg(t, 1.9, 2.2)) : 1 - seg(t, 1.3, 1.7));
      if (!food && t > 1.6) b.pose({ armR: 105 });
      show(spot, 0.7 * seg(t, 1.4, 1.9));
      const pop = 1 + hump(seg(t, 1.5, 2.0)) * 0.12;
      tf(o, 255, top + 4 - hump(seg(t, 1.5, 2.0)) * 6, 0, pop, pop);
      sp.childNodes.forEach((s2, i) => { const q = seg(t, 1.8 + i * 0.12, 2.2 + i * 0.12); s2.setAttribute('opacity', q * (0.6 + 0.4 * Math.sin(t * 5 + i))); });
      tf(sp, 255, top - 30);
    };
  }

  // =============== mood ===============
  function mood() {
    const m = p.mood || 'happy';
    const sky = { sad: ['#C9D2DE', '#EEF1F5'], scared: ['#B8BCD8', '#E6E6F2'], angry: ['#F6D3C9', '#FDF0EB'], calm: ['#D5EEE6', '#F4FBF8'], sick: ['#E1E6D3', '#F5F7EE'] }[m];
    bgOut({ sky: sky || ['#D3EAFA', '#F3F9FD'] });
    const b = B(200, { scale: 1.1 });
    const fx = g({});
    const parts = [];
    const add = (fn) => { const G = g({}, fx); fn(G); parts.push(G); return G; };
    let rainCloud = null;
    if (m === 'happy' || m === 'proud') for (let i = 0; i < 5; i++) add((G) => star4(G, i % 2 ? pal.yellow : pal.coral, 10));
    if (m === 'sad') { add((G) => droplet(G, '#8FC7EE')); rainCloud = g({}, fx); [[0, 0, 20], [20, -8, 16], [38, 2, 14], [-18, 4, 13]].forEach(([cx, cy, r]) => el('circle', { cx, cy, r, fill: '#A6B1C2' }, rainCloud)); for (let i = 0; i < 4; i++) add((G) => el('line', { x1: 0, y1: 0, x2: -3, y2: 10, stroke: '#8FA6C8', 'stroke-width': 3, 'stroke-linecap': 'round' }, G)); }
    if (m === 'angry') { add((G) => { [0, 90, 180, 270].forEach((a) => el('path', { d: 'M 3 -12 Q 3 -3 12 -3', stroke: pal.red, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', transform: `rotate(${a})` }, G)); }); for (let i = 0; i < 3; i++) add((G) => el('circle', { cx: 0, cy: 0, r: 10, fill: '#FFFFFF', stroke: '#E7E2DD', 'stroke-width': 2 }, G)); }
    if (m === 'surprised' || m === 'scared') { add((G) => { el('path', { d: 'M -4 -26 L 4 -26 L 3 4 L -3 4 Z', fill: pal.coral }, G); el('circle', { cx: 0, cy: 14, r: 4.5, fill: pal.coral }, G); }); for (let i = 0; i < 3; i++) add((G) => el('line', { x1: 0, y1: 0, x2: 0, y2: -16, stroke: m === 'scared' ? '#7A86C8' : pal.yellowDark, 'stroke-width': 4, 'stroke-linecap': 'round' }, G)); }
    if (m === 'tired' || m === 'sick') { for (let i = 0; i < 3; i++) add((G) => k.text(0, 0, 'z', { 'font-size': 16 + i * 6, fill: '#8C96B8' }, G)); }
    if (m === 'worried' || m === 'busy') { add((G) => droplet(G, '#8FC7EE')); add((G) => el('path', { d: 'M -18 0 C -12 -14 -2 10 4 -4 S 16 -6 18 2', stroke: pal.sub, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, G)); }
    if (m === 'calm') for (let i = 0; i < 3; i++) add((G) => el('path', { d: 'M -9 0 Q 0 -9 9 0 Q 0 7 -9 0 Z', fill: '#8ED1A4' }, G));
    if (m === 'sick') add((G) => { el('rect', { x: -3, y: -28, width: 6, height: 30, rx: 3, fill: '#FFFFFF', stroke: '#C9D2DC' }, G); el('circle', { cx: 0, cy: 2, r: 5, fill: pal.red }, G); });
    const blue = el('path', { d: '', fill: '#7A86C8', opacity: 0 });
    const cheeks = g({});
    [-1, 1].forEach((s) => el('ellipse', { cx: s * 20, cy: 0, rx: 8, ry: 4, fill: pal.red, opacity: 0.55 }, cheeks));
    const papers = g({});
    if (m === 'busy') [0, 1, 2].forEach((i) => el('rect', { x: -12, y: -16 - i * 5, width: 24, height: 30, rx: 2, fill: '#FFFFFF', stroke: '#C9D2DC', transform: `rotate(${i * 8 - 8})` }, papers));
    return (t) => {
      const q = easeInOut(seg(t, 1.0, 1.7));
      const S = 1.1;
      const P = { mood: q > 0.4 ? 'smile' : 'smile', armL: 8, armR: 8, lean: 0, squash: 1, blink: t > 0.4 && t < 0.52 ? 1 : 0, lift: 0, look: 0, x: 200, walk: 0, facing: 1 };
      const head = FY - 96 * S;
      parts.forEach((G) => show(G, 0));
      show(cheeks, 0); show(blue, 0); show(papers, 0);
      if (m === 'happy') {
        const j = t > 1.6 ? Math.abs(Math.sin((t - 1.6) * 5)) : 0;
        Object.assign(P, { mood: q > 0.4 ? 'grin' : 'smile', armL: lerp(8, 155, q), armR: lerp(8, 155, q), lift: j * 26, squash: 1 - (j < 0.15 && t > 1.6 ? 0.08 : 0) });
        parts.forEach((G, i) => { const a = i * 72 + t * 40; show(G, q); tf(G, 200 + Math.cos(a * Math.PI / 180) * 80, head - 10 - P.lift + Math.sin(a * Math.PI / 180) * 40, t * 90); });
      } else if (m === 'proud') {
        Object.assign(P, { mood: q > 0.4 ? 'grin' : 'smile', armL: lerp(8, 40, q), armR: lerp(8, 40, q), lean: -8 * q, squash: 1 + 0.05 * q, blink: q > 0.5 ? 0.85 : P.blink });
        parts.forEach((G, i) => { show(G, seg(t, 1.6 + i * 0.1, 1.9 + i * 0.1)); tf(G, 200 + (i - 2) * 30, head - 40 - Math.abs(i - 2) * -8, t * 60, 1 + 0.2 * Math.sin(t * 5 + i)); });
      } else if (m === 'sad') {
        Object.assign(P, { mood: q > 0.3 ? 'sad' : 'smile', lean: 10 * q, squash: 1 - 0.08 * q, armL: 0, armR: 0, look: -0.3 * q });
        const tq = (t - 1.6) % 1.2 / 1.2;
        show(parts[0], t > 1.6 ? 1 - tq : 0); tf(parts[0], 200 - 12 + 14 * 0, FY - 50 * S + tq * 30, 0, 0.8);
        show(rainCloud, seg(t, 1.4, 1.9)); tf(rainCloud, 186, head - 50 + (1 - seg(t, 1.4, 1.9)) * -10);
        parts.slice(1).forEach((G, i) => { const r = ((t * 1.4 + i * 0.25) % 1); show(G, seg(t, 1.6, 1.9) * (1 - r)); tf(G, 178 + i * 14, head - 36 + r * 40); });
      } else if (m === 'angry') {
        const shake = q > 0.5 ? Math.sin(t * 40) * 2 : 0;
        Object.assign(P, { mood: q > 0.4 ? 'flat' : 'smile', x: 200 + shake, armL: lerp(8, 45, q), armR: lerp(8, 45, q), squash: 1 - 0.05 * q + (t > 1.7 ? Math.abs(Math.sin(t * 8)) * -0.03 : 0), lean: 4 * q });
        show(parts[0], seg(t, 1.3, 1.5)); tf(parts[0], 232, head + 6, 0, ss(backOut(seg(t, 1.3, 1.6))));
        parts.slice(1).forEach((G, i) => { const r = ((t * 1.2 + i * 0.33) % 1); show(G, seg(t, 1.5, 1.8) * (1 - r)); tf(G, 200 + (i - 1) * 22 + Math.sin(r * 6) * 4, head - r * 50, 0, 0.6 + r); });
        show(cheeks, 0.8 * q); tf(cheeks, 200, FY - 59 * S, 0, S);
      } else if (m === 'surprised' || m === 'scared') {
        const jump = hump(seg(t, 1.0, 1.4));
        const shiver = m === 'scared' && t > 1.4 ? Math.sin(t * 50) * 2 : 0;
        Object.assign(P, { mood: q > 0.2 ? 'open' : 'smile', lift: jump * 26, armL: lerp(8, m === 'scared' ? 100 : 150, q), armR: lerp(8, m === 'scared' ? 100 : 150, q), lean: m === 'scared' ? -10 * q : -4 * q, x: 200 + shiver - (m === 'scared' ? 20 * q : 0), squash: 1 + 0.05 * q });
        show(parts[0], seg(t, 1.1, 1.3)); tf(parts[0], 250, head - 20 - P.lift, 0, ss(backOut(seg(t, 1.1, 1.4))));
        parts.slice(1).forEach((G, i) => { show(G, seg(t, 1.1, 1.3) * (0.6 + 0.4 * Math.sin(t * 10))); tf(G, 200 + (i - 1) * 30, head - 14 - P.lift, (i - 1) * 30); });
        if (m === 'scared') { show(blue, 0.45 * q); k.set(blue, { d: `M ${P.x - 22} ${FY - 92 * S - P.lift} L ${P.x + 22} ${FY - 92 * S - P.lift} L ${P.x + 22} ${FY - 72 * S - P.lift} L ${P.x - 22} ${FY - 72 * S - P.lift} Z` }); }
      } else if (m === 'tired' || m === 'sick') {
        const yawn = m === 'tired' && t > 1.0 && t < 2.0;
        Object.assign(P, { mood: yawn ? 'open' : q > 0.3 ? (m === 'sick' ? 'sad' : 'flat') : 'smile', lean: 12 * q, squash: 1 - 0.1 * q + (t > 1.7 ? Math.sin(t * 2) * 0.01 : 0), armL: yawn ? 150 : 0, armR: 0, blink: q > 0.3 ? (m === 'tired' ? 0.7 : 0.5) : P.blink });
        parts.forEach((G, i) => { if (i > 2) return; const r = ((t * 0.6 + i * 0.33) % 1); show(G, seg(t, 1.6, 2.0) * hump(r)); tf(G, 240 + i * 10 + r * 20, head - r * 50); });
        if (m === 'sick') { show(parts[3], seg(t, 1.6, 1.9)); tf(parts[3], 218, FY - 55 * S, 70); show(blue, 0.4 * q); k.set(blue, { d: `M 178 ${FY - 104 * S} L 222 ${FY - 104 * S} L 222 ${FY - 84 * S} L 178 ${FY - 84 * S} Z` }); }
      } else if (m === 'worried' || m === 'busy') {
        const busy = m === 'busy';
        if (busy) {
          const ph = t > 1.0 ? (t - 1.0) * 2.4 : 0;
          const x = 200 + Math.sin(ph * Math.PI) * 90 * q;
          Object.assign(P, { x, walk: t > 1.0 ? t * 14 : 0, facing: Math.cos(ph * Math.PI) >= 0 ? 1 : -1, mood: q > 0.3 ? 'open' : 'smile', armR: 80, armL: 30 + Math.sin(t * 14) * 30, lean: 10 * q });
          show(papers, 1); tf(papers, x + 30 * P.facing, FY - 60, Math.sin(t * 14) * 5);
        } else Object.assign(P, { mood: q > 0.3 ? 'sad' : 'smile', look: Math.sin(t * 5) * q, armL: lerp(8, 150, q), armR: lerp(8, 150, q), x: 200 + Math.sin(t * 3) * 30 * q, walk: q > 0 ? t * 6 : 0 });
        show(parts[0], q); tf(parts[0], P.x + 30, head + 6 + ((t * 1.2) % 1) * 10);
        show(parts[1], q); tf(parts[1], P.x, head - 30, 0, 1 + Math.sin(t * 8) * 0.15);
      } else if (m === 'calm') {
        const br = Math.sin(t * 2.2);
        Object.assign(P, { mood: 'smile', blink: q > 0.3 ? 1 : P.blink, squash: 1 + br * 0.03 * q, armL: lerp(8, 30, q), armR: lerp(8, 30, q), lean: 0 });
        parts.forEach((G, i) => { const r = ((t * 0.25 + i * 0.33) % 1); show(G, q * hump(r)); tf(G, 80 + r * 260, 70 + i * 26 + Math.sin(r * 8 + i) * 12, Math.sin(r * 8) * 40); });
      }
      b.pose(P);
    };
  }

  // =============== compare ===============
  function compare() {
    const rel = p.rel || 'bigger';
    const isLand = (s) => has(s, ['🏠', '🏔', '⛰', '🏢', '🗻', '🌳']);
    bgOut({ tufts: rel !== 'faster' });
    const actor = (ch, x, col) => {
      if (isPerson(ch)) { const bb = B(x, { scale: 0.85, ...(col || {}) }); return { kind: 'buddy', b: bb, g: bb.w }; }
      const G = g({});
      const sh = k.shadow(0, 2, 30, 6, G);
      const o = gemo(ch, 70, G);
      return { kind: 'emo', g: G, o, sh };
    };
    if (rel === 'faster' || rel === 'first') {
      [FY - 50, FY + 20].forEach((y) => el('rect', { x: 0, y: y - 4, width: W, height: 40, fill: '#E7DCC6', opacity: 0.7 }));
      el('rect', { x: 350, y: FY - 60, width: 6, height: 110, fill: '#FFFFFF' });
      for (let i = 0; i < 9; i++) el('rect', { x: 350, y: FY - 60 + i * 12, width: 6, height: 6, fill: pal.ink });
    }
    const A = actor(p.e || '⬛', 130), Bt = actor(p.e2 || p.e || '⬛', 270, C2);
    const guide = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: pal.coralDark, 'stroke-width': 2.5, 'stroke-dasharray': '6 6', opacity: 0 });
    const guideA = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: pal.sub, 'stroke-width': 2.5, 'stroke-dasharray': '6 6', opacity: 0 });
    const eq = g({}); el('rect', { x: -16, y: -10, width: 32, height: 6, rx: 3, fill: pal.mintDark }, eq); el('rect', { x: -16, y: 4, width: 32, height: 6, rx: 3, fill: pal.mintDark }, eq);
    const neq = el('line', { x1: -10, y1: 16, x2: 10, y2: -22, stroke: pal.red, 'stroke-width': 5, 'stroke-linecap': 'round' }, eq);
    const chk = g({}); el('circle', { cx: 0, cy: 0, r: 16, fill: pal.mint }, chk); el('path', { d: 'M -7 0 L -2 6 L 8 -6', stroke: '#FFFFFF', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, chk);
    const speed = g({}); [0, 1, 2].forEach((i) => el('line', { x1: 0, y1: -14 - i * 14, x2: -36, y2: -14 - i * 14, stroke: '#FFFFFF', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, speed));
    const place = (X, x, y, s, sy = s, extra = {}) => {
      if (X.kind === 'buddy') { X.b.pose({ x, y, ...extra }); X.b.depth(1); tf(X.g, x * (1 - s), y * (1 - sy), 0, s, sy); }
      else tf(X.g, x, y, 0, s, sy);
    };
    return (t) => {
      const q = easeInOut(seg(t, 1.0, 2.3)), qb = backOut(seg(t, 1.0, 2.3), 1.2);
      let ax = 130, bx = 270, ay = FY, by = FY, as = 1, bs = 1, bsy = null, top = 0, bHeight = 70, aHeight = 70;
      let chkX = bx, mark = 0, hz = false;
      show(guide, 0); show(guideA, 0); show(eq, 0); show(speed, 0);
      if (rel === 'bigger') { as = 1; bs = lerp(0.8, 2.0, qb); }
      else if (rel === 'smaller') { bs = lerp(1.6, 0.5, q); as = 1.6; }
      else if (rel === 'high' || rel === 'low') {
        if (rel === 'high') { bs = 1; bsy = lerp(0.8, 2.3, qb); as = 1; } else { as = 1.8; bs = 1; bsy = lerp(1.8, 0.8, q); }
        hz = true;
      } else if (rel === 'faster' || rel === 'first') {
        ay = FY - 20; by = FY + 46;
        ax = lerp(50, 120, seg(t, 0.8, 3.4)); bx = lerp(50, 330, easeOut(seg(t, 0.8, 2.6)));
        as = 0.7; bs = 0.7;
        show(speed, t > 0.8 && t < 2.6 ? 1 : 0); tf(speed, bx - 30, by - 20);
      } else if (rel === 'near' || rel === 'far') {
        ax = 340; as = 0.55; ay = FY - 30;
        bx = rel === 'near' ? lerp(320, 190, q) : lerp(190, 340, q); bs = rel === 'near' ? lerp(0.55, 1.2, q) : lerp(1.2, 0.5, q); by = rel === 'near' ? lerp(FY - 30, FY + 20, q) : lerp(FY + 20, FY - 28, q);
      } else if (rel === 'same' || rel === 'different') {
        as = 1.2; bs = 1.2;
        if (rel === 'different') { bs = lerp(1.2, 0.7, q); }
        show(eq, seg(t, 2.2, 2.5)); tf(eq, 200, FY - 50); show(neq, rel === 'different' ? 1 : 0); mark = 2;
      }
      void top; void bHeight; void aHeight;
      place(A, ax, ay, as, as, A.kind === 'buddy' ? { look: 0.5 } : {});
      place(Bt, bx, by, bs, bsy ?? bs, Bt.kind === 'buddy' ? { facing: -1, mood: q > 0.5 ? 'grin' : 'smile' } : {});
      if (A.kind === 'emo') A.sh.setAttribute('transform', `scale(${1} ${1 / Math.max(0.3, 1)})`);
      if (hz) {
        const hA = 70 * as * (A.kind === 'buddy' ? 1.2 : 1), hB = 70 * (bsy ?? bs) * (Bt.kind === 'buddy' ? 1.2 : 1);
        k.set(guide, { x1: bx - 60, x2: bx + 50, y1: FY - hB, y2: FY - hB }); show(guide, seg(t, 2.2, 2.5));
        k.set(guideA, { x1: ax - 50, x2: bx + 50, y1: FY - hA, y2: FY - hA }); show(guideA, seg(t, 2.2, 2.5) * 0.7);
      }
      chkX = mark === 2 ? 200 : bx;
      const chY = mark === 2 ? FY - 120 : Math.max(30, by - 70 * (bsy ?? bs) * 1.15 - 26);
      tf(chk, rel === 'faster' || rel === 'first' ? Math.min(bx, 360) : chkX, rel === 'faster' || rel === 'first' ? by - 80 : chY, 0, ss(backOut(seg(t, 2.5, 2.9))));
      show(chk, t > 2.5 && mark !== 2 ? 1 : 0);
    };
  }

  // =============== time ===============
  function time() {
    const rel = p.rel || 'now';
    bgRoom({ wall: '#F2F4F8', wall2: '#FAFBFD', wains: '#E8ECF2', floor: '#DCE2EA' });
    const ly = 168;
    el('rect', { x: 30, y: ly - 4, width: 330, height: 8, rx: 4, fill: '#C9D2DC' });
    el('path', { d: `M 356 ${ly - 14} L 376 ${ly} L 356 ${ly + 14} Z`, fill: '#C9D2DC' });
    const ticks = [60, 100, 140, 180, 220, 260, 300, 340];
    ticks.forEach((x) => el('rect', { x: x - 1.5, y: ly - 10, width: 3, height: 20, rx: 1.5, fill: '#B5C0CC' }));
    const NOW = 200;
    const past = el('rect', { x: 30, y: ly - 4, width: NOW - 30, height: 8, rx: 4, fill: '#A9D8C7' });
    const nowM = g({});
    el('rect', { x: -2, y: -30, width: 4, height: 60, rx: 2, fill: pal.coral }, nowM);
    k.text(0, 46, 'NOW', { 'font-size': 13, fill: pal.coralDark }, nowM);
    const evCh = isProp(e) && !has(e, ['🕐', '⏳', '📅']) ? e : null;
    const mkEv = () => { const G = g({}); el('path', { d: 'M 0 0 L -9 -14 Q 0 -20 9 -14 Z', fill: pal.violet }, G); el('circle', { cx: 0, cy: -26, r: 15, fill: '#FFFFFF', stroke: pal.violet, 'stroke-width': 3 }, G); if (evCh) { const o = emo(evCh, 18, G); tf(o, 0, -26); } else star4(G, pal.violet, 8).setAttribute('transform', 'translate(0 -26)'); return G; };
    const pos = { before: [110], ago: [100], already: [130], after: [290], later: [320], soon: [250], now: [NOW], always: ticks, often: [60, 140, 180, 260, 340], again: [120, NOW], still: [], never: [] }[rel] || [NOW];
    const evs = pos.map((x) => [mkEv(), x]);
    const band = el('rect', { x: 80, y: ly - 60, width: 0, height: 22, rx: 11, fill: '#9CC8E6', opacity: 0 });
    const rainG = g({});
    if (rel === 'still') { cloud(0, 0, 0.55, rainG); }
    const noG = g({});
    el('circle', { cx: 0, cy: 0, r: 22, fill: 'none', stroke: pal.red, 'stroke-width': 5 }, noG);
    el('line', { x1: -15, y1: 15, x2: 15, y2: -15, stroke: pal.red, 'stroke-width': 5 }, noG);
    const loop = el('path', { d: `M 120 ${ly - 60} Q 160 ${ly - 100} 200 ${ly - 60}`, stroke: pal.violet, 'stroke-width': 3.5, fill: 'none', 'stroke-dasharray': '6 6', opacity: 0 });
    const chk = g({}); el('circle', { cx: 0, cy: 0, r: 11, fill: pal.mint }, chk); el('path', { d: 'M -5 0 L -1 4 L 6 -4', stroke: '#FFFFFF', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, chk);
    const arrow = el('path', { d: '', stroke: pal.blueDark, 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '5 6' });
    const b = B(60, { y: ly - 6, scale: 0.42 });
    return (t) => {
      // まめが時間の線の上を「今」まで歩く
      const walkTo = rel === 'never' || rel === 'always' || rel === 'often' ? 340 : NOW;
      const s = stride(t, 0.2, rel === 'never' || rel === 'always' || rel === 'often' ? 3.2 : 1.4, 60, walkTo, 10);
      b.pose({ x: s.x, walk: s.walk, armL: s.armL, armR: s.armR, mood: t > 2.4 ? (rel === 'never' ? 'flat' : 'grin') : 'smile', look: rel === 'already' || rel === 'ago' || rel === 'before' ? -0.8 : 0.6 });
      tf(nowM, NOW, ly);
      k.set(past, { width: Math.max(0, s.x - 30) });
      evs.forEach(([G, x], i) => {
        let q;
        if (rel === 'always' || rel === 'often') q = clamp((s.x - x + 20) / 20);
        else if (rel === 'soon') { q = backOut(seg(t, 0.6, 1.0)); }
        else if (rel === 'again') q = backOut(seg(t, i === 0 ? 0.4 : 2.0, i === 0 ? 0.8 : 2.4));
        else q = backOut(seg(t, 0.8 + i * 0.2, 1.2 + i * 0.2));
        let ex = x;
        if (rel === 'soon') ex = lerp(330, 236, easeInOut(seg(t, 1.2, 2.6)));
        tf(G, ex, ly - 8, 0, ss(q), ss(q));
      });
      if (rel === 'still') { const w = lerp(0, 260, easeOut(seg(t, 0.6, 2.4))); k.set(band, { x: 80, width: w, opacity: 0.8 }); tf(rainG, 80 + w - 20, ly - 76); show(rainG, w > 10 ? 1 : 0); }
      else show(band, 0);
      tf(noG, 200, 80, 0, ss(backOut(seg(t, 2.9, 3.3))));
      show(noG, rel === 'never' && t > 2.9 ? 1 : 0);
      show(loop, rel === 'again' ? seg(t, 1.6, 2.0) : 0);
      const done = rel === 'already' ? seg(t, 1.6, 1.8) : 0;
      tf(chk, 144, ly - 54, 0, ss(backOut(seg(t, 1.6, 2.0))));
      show(chk, done);
      if (rel === 'later' || rel === 'after' || rel === 'soon' || rel === 'before' || rel === 'ago' || rel === 'already') {
        const tx = rel === 'soon' ? lerp(330, 236, easeInOut(seg(t, 1.2, 2.6))) : pos[0];
        const aq = seg(t, 1.4, 2.2);
        k.set(arrow, { d: `M ${NOW} ${ly - 40} Q ${(NOW + tx) / 2} ${ly - 74} ${lerp(NOW, tx, aq)} ${ly - 46}` });
        show(arrow, aq > 0 ? 1 : 0);
      } else show(arrow, 0);
    };
  }
}
