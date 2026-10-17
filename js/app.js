import { loadIndex, getItem, prefetch, search } from './data.js';
import { Stage } from './stage.js';
import { Speech } from './speech.js';
import { Player } from './player.js';
import { loadSettings, saveSettings } from './store.js';

const $ = (id) => document.getElementById(id);
const settings = loadSettings();
const save = () => saveSettings(settings);
const speech = new Speech();
speech.enURI = settings.enVoice;
speech.jaURI = settings.jaVoice;

let index = null;
let view = 'learn';
let current = null; // 表示中の項目（詳細データ）

/* ---------- ステージ ---------- */
const stageEl = document.createElement('div');
stageEl.className = 'stage';
stageEl.innerHTML = '<div class="stage-loading"><div class="spinner"></div></div>';
$('learnStageSlot').appendChild(stageEl);
const stage = new Stage(stageEl, {
  onBeat: (i) => renderBeats(i),
  onLoading: (on) => stageEl.classList.toggle('is-loading', on)
});

/* ---------- 再生 ---------- */
const player = new Player({
  speech,
  stage,
  settings,
  show: (id) => showItem(id),
  prefetch,
  onStatus: (s, reason) => renderStatus(s, reason),
  onSegment: (key) => {
    document.querySelectorAll('[data-seg].speaking').forEach((n) => n.classList.remove('speaking'));
    if (key) document.querySelectorAll(`[data-seg="${key}"]`).forEach((n) => {
      n.classList.add('speaking');
      if (view === 'learn' && n.offsetParent) {
        const r = n.getBoundingClientRect();
        const dockTop = $('dock').getBoundingClientRect().top;
        if (r.bottom > dockTop - 8 || r.top < 60) window.scrollBy({ top: r.top < 60 ? r.top - 70 : r.bottom - dockTop + 24, behavior: 'smooth' });
      }
    });
  },
  onRep: (r, n) => {
    $('statusSub').textContent = Number.isFinite(n) ? (n > 1 ? `${r} / ${n}回目` : '') : `${r}回目`;
  },
  onSkip: (id) => toast(`「${index.byId.get(id)?.en || id}」を読み込めなかったので次へ進みました`)
});

/* ---------- 範囲 ---------- */
// 試聴・クイズ・単語ボタンなど、プレーヤー外の読み上げ。画面を切り替えたら必ず止める。
let adhoc = { cancelled: false };
function sayOnce(text, lang = 'en-US') {
  adhoc.cancelled = true;
  adhoc = { cancelled: false };
  speech.unlock();
  return speech.speak(text, lang, settings.rate, adhoc);
}
function stopAdhoc() {
  if (adhoc.cancelled) return;
  adhoc.cancelled = true;
  if (player.state === 'stopped') speech.cancel();
}
const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
function idsOf(r) {
  if (r === 'motion') return index.items.filter((i) => i.motion).map((i) => i.id);
  if (r === 'mylist') return settings.mylist.filter((id) => index.byId.has(id));
  if (r === 'unlearned') return index.items.filter((i) => !settings.learned.includes(i.id)).map((i) => i.id);
  if (r === 'all') return index.items.map((i) => i.id);
  return index.items.filter((i) => i.cat === r).map((i) => i.id);
}
const rangeIds = () => idsOf(settings.range);
function rangeName(r = settings.range) {
  if (r === 'all') return 'すべて';
  if (r === 'mylist') return 'マイリスト';
  if (r === 'unlearned') return 'まだ覚えていない';
  if (r === 'motion') return 'モーション付き';
  return index.catLabel[r] || r;
}
function applyRange(startId) {
  let ids = rangeIds();
  if (!ids.length) {
    toast(settings.range === 'mylist' ? 'マイリストが空なので「すべて」にしました' : 'この範囲に項目がありません');
    settings.range = 'all';
    save();
    ids = rangeIds();
  }
  const start = startId && ids.includes(startId) ? startId : ids.includes(current?.id) ? current.id : ids[0];
  player.setList(ids, start);
  $('rangeLabel').textContent = `${rangeName()} ${ids.length}`;
  return start;
}

/* ---------- 表示 ---------- */
let showSeq = 0;
async function showItem(id) {
  const seq = ++showSeq;
  stageEl.classList.add('is-loading');
  let item;
  try {
    item = await getItem(id);
  } catch (e) {
    if (seq === showSeq) stageEl.classList.remove('is-loading');
    throw e;
  }
  if (seq !== showSeq) return item;
  current = item;
  renderWord(item);
  settings.lastId = id;
  save();
  if (view === 'learn') await stage.load(item);
  return item;
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}
function markExample(en, marks = []) {
  let html = esc(en);
  let from = 0;
  for (const m of marks) {
    const e = esc(m);
    const i = html.indexOf(e, from);
    if (i < 0) continue;
    html = html.slice(0, i) + `<mark>${e}</mark>` + html.slice(i + e.length);
    from = i + e.length + 13;
  }
  return html;
}

function renderWord(it) {
  const chip = $('catChip');
  chip.textContent = index.catLabel[it.cat];
  chip.dataset.cat = it.cat;
  const pos = player.order.indexOf(it.id);
  $('posText').textContent = pos >= 0 ? `${pos + 1} / ${player.order.length}` : '';
  $('enText').textContent = it.en;
  $('liveText').textContent = it.en;
  $('ipaText').textContent = it.ipa;
  $('jaText').textContent = it.ja;
  $('senseText').textContent = it.sense;
  $('exEn').innerHTML = markExample(it.ex.en, it.ex.mark);
  $('exJa').textContent = it.ex.ja;
  $('coreText').textContent = it.core;
  $('diffText').textContent = it.diff || '';
  const ol = $('otherList');
  ol.innerHTML = '';
  (it.other || []).forEach((o) => {
    const li = document.createElement('li');
    li.textContent = o;
    ol.appendChild(li);
  });
  $('otherBox').hidden = !(it.other && it.other.length);
  $('otherBox').open = false;
  renderStar();
  renderLearned();
  document.querySelectorAll('[data-seg].speaking').forEach((n) => n.classList.remove('speaking'));
}

function renderBeats(active) {
  const box = $('beats');
  const beats = stage.beats;
  if (box.childElementCount !== beats.length || box.dataset.id !== stage.current?.id) {
    box.dataset.id = stage.current?.id || '';
    box.innerHTML = beats.map((b) => `<div class="beat">${esc(b[1])}</div>`).join('');
  }
  [...box.children].forEach((el, i) => {
    el.classList.toggle('on', i === active);
    el.classList.toggle('done', i < active);
  });
}

function renderStar() {
  if (!current) return;
  const on = settings.mylist.includes(current.id);
  const b = $('starBtn');
  b.setAttribute('aria-pressed', on);
  b.setAttribute('aria-label', on ? 'マイリストから外す' : 'マイリストに追加');
}

const STATUS = { stopped: '停止中', loading: '読み込み中', playing: '再生中' };
function renderStatus(s, reason) {
  $('status').dataset.state = s;
  $('playBtn').dataset.state = s;
  $('statusText').textContent = STATUS[s];
  if (s === 'stopped') $('statusSub').textContent = '';
  const playing = s !== 'stopped';
  $('playIcon').innerHTML = playing ? '<rect x="6.5" y="6.5" width="11" height="11" rx="2"/>' : '<path d="M8 5.5v13l11-6.5z"/>';
  $('playBtn').setAttribute('aria-label', playing ? '停止' : '再生');
  updateWakeLock(playing);
  if (playing) $('resume').hidden = true;
  if (reason === 'hidden') $('resume').hidden = false;
  if (reason === 'error') toast('読み込めない項目が続いたため止めました。通信状態を確認してください');
}

const ICONS = {
  one: '<path d="M17 7H8a4 4 0 00-4 4v.5M7 17h9a4 4 0 004-4v-.5"/><path d="M14.5 4.5L17 7l-2.5 2.5M9.5 19.5L7 17l2.5-2.5"/><path d="M11.5 10.5l1-.6v4.2"/>',
  random: '<path d="M4 7h3.5c4.5 0 4.5 10 9 10H20M4 17h3.5c1.8 0 2.8-1.6 3.6-3.5M14.5 9c.7-1.2 1.6-2 3-2H20"/><path d="M18 4.8L20.2 7 18 9.2M18 14.8l2.2 2.2-2.2 2.2"/>'
};
function renderModeButtons() {
  const one = settings.mode === 'one';
  const rnd = settings.order === 'random';
  $('modeIcon').innerHTML = ICONS.one;
  $('modeLabel').textContent = '1語リピート';
  $('modeBtn').classList.toggle('on', one);
  $('modeBtn').setAttribute('aria-pressed', one);
  $('orderIcon').innerHTML = ICONS.random;
  $('orderLabel').textContent = 'シャッフル';
  $('orderBtn').classList.toggle('on', rnd);
  $('orderBtn').setAttribute('aria-pressed', rnd);
}

/* ---------- 一覧 ---------- */
let listFilter = 'all';
function renderStats() {
  const s = index.stats;
  $('stats').innerHTML = `
    <div class="stat"><b>${s.total}</b><span>収録</span></div>
    <div class="stat"><b>${s.words}</b><span>単語</span></div>
    <div class="stat"><b>${s.expressions}</b><span>表現</span></div>
    <div class="stat"><b>${learnedCount()}</b><span>覚えた</span></div>
    <div class="stats-note">収録はいま使える項目の実数です。表現＝句動詞・イディオム。モーション付き${s.motion}：専用${s.motionOwn ?? s.motion}（うち3D ${s.motion3d}）・型${s.motionTpl || 0}。モーションなし${s.total - s.motion}。一覧の印：3D＝立体の専用モーション、動き＝2Dのモーション、準備中＝モーションはまだ（音声と例文で学べます）。</div>`;
}
function renderChips() {
  const opts = [['all', 'すべて', index.items.length], ...index.cats.map((c) => [c.id, c.label, index.stats.byCat[c.id] || 0]), ['mylist', 'マイリスト', settings.mylist.length], ['unlearned', 'まだ覚えていない', index.items.length - learnedCount()], ['motion', 'モーション付き', index.stats.motion]];
  $('listChips').innerHTML = opts
    .map(([v, l, n]) => `<button class="chip" role="tab" type="button" data-v="${v}" aria-selected="${v === listFilter}">${l}<small>${n}</small></button>`)
    .join('');
}
function listItems() {
  const q = $('searchInput').value;
  let items = search(q);
  if (listFilter === 'mylist') items = items.filter((i) => settings.mylist.includes(i.id));
  else if (listFilter === 'unlearned') items = items.filter((i) => !settings.learned.includes(i.id));
  else if (listFilter === 'motion') items = items.filter((i) => i.motion);
  else if (listFilter !== 'all') items = items.filter((i) => i.cat === listFilter);
  return items;
}
function renderList() {
  const items = listItems();
  $('listCount').textContent = `${items.length}件`;
  $('playListBtn').hidden = !items.length || !!$('searchInput').value.trim();
  if (!items.length) {
    $('list').innerHTML = `<li class="empty">${listFilter === 'mylist' ? 'マイリストはまだ空です。☆を押すと追加できます。' : '見つかりませんでした。'}</li>`;
    return;
  }
  $('list').innerHTML = items
    .map((i) => {
      const on = settings.mylist.includes(i.id);
      return `<li class="row${current && current.id === i.id ? ' current' : ''}">
        <button class="row-main" type="button" data-open="${i.id}"><span class="row-en">${esc(i.en)}</span><span class="row-ja">${esc(i.ja)}</span></button>
        ${settings.learned.includes(i.id) ? '<span class="row-learned">✓覚えた</span>' : ''}
        ${i.motion === '3d' ? '<span class="row-kind">3D</span>' : i.motion ? '<span class="row-kind">動き</span>' : '<span class="row-kind none">準備中</span>'}
        <button class="star" type="button" data-star="${i.id}" aria-pressed="${on}" aria-label="${on ? 'マイリストから外す' : 'マイリストに追加'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.6l-5.1 2.7 1-5.7-4.1-4 5.7-.8z"/></svg></button>
      </li>`;
    })
    .join('');
}
function toggleMylist(id) {
  const i = settings.mylist.indexOf(id);
  if (i >= 0) settings.mylist.splice(i, 1);
  else {
    settings.mylist.push(id);
    // ブラウザに「この保存データを消さないで」と依頼（対応ブラウザのみ）
    navigator.storage?.persist?.().catch(() => {});
  }
  save();
  renderStar();
  if (settings.range === 'mylist') {
    const ids = rangeIds();
    if (!ids.length) {
      if (player.state !== 'stopped') player.stop();
      settings.range = 'all';
      save();
      applyRange(current?.id);
      toast('マイリストが空になったので、範囲を「すべて」にしました');
    } else {
      player.setList(ids, ids.includes(current?.id) ? current.id : ids[0]);
      $('rangeLabel').textContent = `${rangeName()} ${ids.length}`;
      if (current) renderWord(current);
    }
  }
}

/* ---------- 覚えた ---------- */
const learnedCount = () => settings.learned.filter((id) => index.byId.has(id)).length;
function renderLearned() {
  if (!current) return;
  const on = settings.learned.includes(current.id);
  $('learnedBtn').setAttribute('aria-pressed', on);
  $('learnedBtn').setAttribute('aria-label', on ? '覚えたを外す' : '覚えたにする');
}
function toggleLearned(id) {
  const i = settings.learned.indexOf(id);
  if (i >= 0) settings.learned.splice(i, 1);
  else settings.learned.push(id);
  save();
  renderLearned();
  toast(i >= 0 ? '「まだ」に戻しました' : `覚えた：${learnedCount()} / ${index.items.length}`);
  // 「まだ覚えていない」を再生中なら、今の語の扱いは次の周回から反映する
  if (settings.range === 'unlearned') {
    const ids = rangeIds();
    if (ids.length) {
      $('rangeLabel').textContent = `${rangeName()} ${ids.length}`;
      const keep = player.currentId;
      player.ids = ids.slice();
      if (player.state === 'stopped' && current) player.setList(ids, ids.includes(current.id) ? current.id : ids[0]);
      else if (!ids.includes(keep)) player.setList(ids, ids[0]);
    }
  }
}

/* ---------- 確認 ---------- */
const quiz = { item: null, n: 0, ok: 0 };
async function newQuestion() {
  const pool = index.items.filter((i) => i.motion);
  const ids = rangeIds().filter((id) => index.byId.get(id).motion);
  const src = ids.length >= 1 ? ids.map((id) => index.byId.get(id)) : pool;
  if (!ids.length && !quiz.warned) {
    quiz.warned = true;
    toast('この範囲にモーション付きの語がないので、すべての語から出題します');
  }
  let pick;
  do pick = src[Math.floor(Math.random() * src.length)];
  while (src.length > 1 && quiz.item && pick.id === quiz.item.id);
  const others = pool.filter((i) => i.id !== pick.id);
  const same = others.filter((i) => i.cat === pick.cat);
  const base = shuffle(same.length >= 2 ? same : others).slice(0, 2);
  const choices = shuffle([pick, ...base]);
  quiz.item = pick;
  $('quizResult').hidden = true;
  $('quizNext').hidden = true;
  $('choices').innerHTML = choices.map((c) => `<button class="choice" type="button" data-id="${c.id}">${esc(c.en)}</button>`).join('');
  stage.setMode('loop');
  await stage.load(pick);
}
async function answer(btn) {
  const id = btn.dataset.id;
  const ok = id === quiz.item.id;
  quiz.n++;
  if (ok) quiz.ok++;
  else {
    // 間違えた語はマイリストに入れ、「覚えた」も外して、あとで流せるようにする
    if (!settings.mylist.includes(quiz.item.id)) settings.mylist.push(quiz.item.id);
    const li = settings.learned.indexOf(quiz.item.id);
    if (li >= 0) settings.learned.splice(li, 1);
    save();
    toast(`「${quiz.item.en}」をマイリストに入れました`);
  }
  document.querySelectorAll('.choice').forEach((b) => {
    b.disabled = true;
    if (b.dataset.id === quiz.item.id) b.classList.add('ok');
    else if (b === btn) b.classList.add('ng');
  });
  $('quizScore').textContent = `${quiz.ok} / ${quiz.n} 正解`;
  $('quizNext').hidden = false;
  try {
    const it = await getItem(quiz.item.id);
    $('quizResult').hidden = false;
    $('quizResult').innerHTML = `${ok ? '正解' : '正解は'}${ok ? '' : '（マイリストに入れました）'} <b>${esc(it.en)}</b>：${esc(it.sense)}<br><span class="quiz-ex">${esc(it.ex.en)}<br>${esc(it.ex.ja)}</span>`;
    sayOnce(it.en);
  } catch (e) {
    /* 結果の詳細だけ出せない */
  }
}

/* ---------- 画面切り替え ---------- */
async function setView(v) {
  if (v === view) return;
  stopAdhoc();
  if (v !== 'learn' && player.state !== 'stopped') player.stop();
  view = v;
  document.querySelectorAll('.view').forEach((s) => (s.hidden = s.id !== `view-${v}`));
  document.querySelectorAll('.tab').forEach((t) => (t.dataset.view === v ? t.setAttribute('aria-current', 'page') : t.removeAttribute('aria-current')));
  $('dock').hidden = v !== 'learn';
  document.documentElement.style.setProperty('--dock-h', v === 'learn' ? `${$('dock').offsetHeight || 128}px` : '0px');
  window.scrollTo(0, 0);
  if (v === 'learn') {
    $('learnStageSlot').appendChild(stageEl);
    if (current) {
      stage.setMode('loop');
      await stage.load(current);
    }
  } else if (v === 'quiz') {
    $('quizStageSlot').appendChild(stageEl);
    await newQuestion();
  } else if (v === 'list') {
    renderStats();
    renderChips();
    renderList();
  }
}

/* ---------- 設定シート ---------- */
let pendingRestart = false;
function openSheet(focusRange) {
  renderSheet();
  pendingRestart = false;
  $('sheet').hidden = false;
  $('sheetBackdrop').hidden = false;
  document.body.classList.add('sheet-open');
  if (focusRange) $('rangeField').scrollIntoView({ block: 'start' });
  $('sheetClose').focus();
}
function closeSheet() {
  stopAdhoc();
  $('sheet').hidden = true;
  $('sheetBackdrop').hidden = true;
  document.body.classList.remove('sheet-open');
  // 再生中に変えた設定は、閉じたときに1回だけ反映（今の語からやり直す）
  if (pendingRestart) player.restartIfPlaying();
  pendingRestart = false;
}
function pressSeg(seg, v) {
  seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === String(v))));
}
function renderSheet() {
  const opts = [['all', 'すべて', index.items.length], ...index.cats.map((c) => [c.id, c.label, index.stats.byCat[c.id] || 0]), ['mylist', 'マイリスト', settings.mylist.length], ['unlearned', 'まだ覚えていない', index.items.length - learnedCount()], ['motion', 'モーション付き', index.stats.motion]];
  $('rangeSeg').innerHTML = opts.map(([v, l, n]) => `<button type="button" data-v="${v}" ${n ? '' : 'disabled'}>${l}<small>${n}</small></button>`).join('');
  pressSeg($('rangeSeg'), settings.range);
  pressSeg($('modeSeg'), settings.mode);
  pressSeg($('orderSeg'), settings.order);
  pressSeg($('rateSeg'), settings.rate);
  pressSeg($('gapSeg'), settings.gap);
  $('repsOut').textContent = `${settings.reps}回`;
  $('repsField').style.opacity = settings.mode === 'one' ? 0.45 : 1;
  document.querySelectorAll('#readToggles input').forEach((i) => (i.checked = !!settings.read[i.dataset.k]));
  $('wakeToggle').checked = settings.wake;
  const fill = (sel, n, vs, cur) => {
    $(sel).innerHTML = `<option value="">自動で選ぶ</option>` + vs.map((v) => `<option value="${esc(v.voiceURI)}">${esc(v.name)}（${esc(v.lang)}）</option>`).join('');
    $(sel).value = vs.some((v) => v.voiceURI === cur) ? cur : '';
    $(sel).disabled = !speech.supported;
    $(n).textContent = `${vs.length}種類`;
  };
  fill('voiceSelect', 'enVoiceN', speech.voicesFor('en'), settings.enVoice);
  fill('jaVoiceSelect', 'jaVoiceN', speech.voicesFor('ja'), settings.jaVoice);
  $('bgToggle').checked = settings.bg;
}
function changed() {
  save();
  renderModeButtons();
  if (!$('sheet').hidden) pendingRestart = true;
  else player.restartIfPlaying();
}

/* ---------- 画面を消さない ---------- */
let wakeLock = null;
let wakeReq = null;
async function updateWakeLock(playing) {
  const want = playing && settings.wake && !document.hidden && 'wakeLock' in navigator;
  try {
    if (want) {
      if (wakeLock || wakeReq) return; // 取得済み・取得中なら重ねない
      wakeReq = navigator.wakeLock.request('screen');
      const lock = await wakeReq;
      wakeReq = null;
      // 取得中に停止された場合はすぐ手放す
      if (player.state === 'stopped' || !settings.wake) {
        await lock.release();
        return;
      }
      wakeLock = lock;
      lock.addEventListener('release', () => {
        if (wakeLock === lock) wakeLock = null;
      });
    } else if (wakeLock) {
      const lock = wakeLock;
      wakeLock = null;
      await lock.release();
    }
  } catch (e) {
    wakeReq = null;
  }
}

/* ---------- 通知 ---------- */
let toastTimer;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 3200);
}

/* ---------- マイリストの書き出し・読み込み ---------- */
async function exportMylist() {
  const text = settings.mylist.join(',');
  if (!text) return toast('マイリストは空です');
  try {
    await navigator.clipboard.writeText(text);
    toast(`マイリスト${settings.mylist.length}件をコピーしました。メモなどに貼って保管できます`);
  } catch (e) {
    window.prompt('この文字列をコピーして保管してください', text);
  }
}
function importMylist() {
  const text = window.prompt('書き出したマイリストの文字列を貼ってください');
  if (!text) return;
  const ids = text.split(/[,\s]+/).map((s) => s.trim()).filter((id) => index.byId.has(id));
  if (!ids.length) return toast('読み込める項目がありませんでした');
  const before = settings.mylist.length;
  ids.forEach((id) => !settings.mylist.includes(id) && settings.mylist.push(id));
  save();
  renderSheet();
  renderStar();
  toast(`${settings.mylist.length - before}件を追加しました`);
}

/* ---------- 操作 ---------- */
function bind() {
  $('playBtn').addEventListener('click', () => {
    dismissHint();
    player.toggle();
  });
  $('nextBtn').addEventListener('click', () => {
    dismissHint();
    navigate(1);
  });
  $('prevBtn').addEventListener('click', () => navigate(-1));
  // 下の操作パネルの高さ（「続きから再生」の案内が出ると高くなる）に合わせて、本文の下の余白を変える
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      if (view === 'learn') document.documentElement.style.setProperty('--dock-h', `${$('dock').offsetHeight}px`);
    }).observe($('dock'));
  }
  $('resumeBtn').addEventListener('click', () => {
    $('resume').hidden = true;
    player.play();
  });
  $('modeBtn').addEventListener('click', () => {
    settings.mode = settings.mode === 'one' ? 'auto' : 'one';
    toast(settings.mode === 'one' ? 'この語をくり返します' : '1語リピートを解除しました。順に次の語へ進みます');
    changed();
  });
  $('orderBtn').addEventListener('click', () => {
    settings.order = settings.order === 'random' ? 'seq' : 'random';
    player.reorder();
    toast(settings.order === 'random' ? 'シャッフルして進みます' : 'シャッフルを解除しました');
    changed();
    if (current) renderWord(current);
  });
  $('sayBtn').addEventListener('click', () => {
    if (!current) return;
    if (player.state !== 'stopped') player.stop();
    stage.restart('loop');
    sayOnce(current.en);
  });
  $('starBtn').addEventListener('click', () => current && toggleMylist(current.id));
  $('learnedBtn').addEventListener('click', () => current && toggleLearned(current.id));
  $('rangeBtn').addEventListener('click', () => openSheet(true));
  $('settingsBtn').addEventListener('click', () => openSheet(false));
  $('sheetClose').addEventListener('click', closeSheet);
  $('sheetBackdrop').addEventListener('click', closeSheet);
  $('exportBtn').addEventListener('click', exportMylist);
  $('importBtn').addEventListener('click', importMylist);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('sheet').hidden) closeSheet();
    if (view !== 'learn' || !$('sheet').hidden || /input|select|textarea/i.test(e.target.tagName)) return;
    if (e.key === ' ') {
      e.preventDefault();
      player.toggle();
    } else if (e.key === 'ArrowRight') navigate(1);
    else if (e.key === 'ArrowLeft') navigate(-1);
  });

  $('rangeSeg').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || b.disabled) return;
    settings.range = b.dataset.v;
    pressSeg($('rangeSeg'), settings.range);
    const start = applyRange();
    save();
    if (player.state !== 'stopped') pendingRestart = true;
    else if (current?.id !== start) showItem(start).catch(() => {});
    else renderWord(current);
  });
  const segHandler = (id, key, parse = (v) => v, after) =>
    $(id).addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      settings[key] = parse(b.dataset.v);
      pressSeg($(id), settings[key]);
      if (after) after();
      changed();
      renderSheet();
    });
  segHandler('modeSeg', 'mode');
  segHandler('orderSeg', 'order', (v) => v, () => {
    player.reorder();
    if (current) renderWord(current);
  });
  segHandler('rateSeg', 'rate', parseFloat);
  segHandler('gapSeg', 'gap', parseFloat);
  const reps = (d) => {
    settings.reps = Math.min(10, Math.max(1, settings.reps + d));
    $('repsOut').textContent = `${settings.reps}回`;
    changed();
  };
  $('repsMinus').addEventListener('click', () => reps(-1));
  $('repsPlus').addEventListener('click', () => reps(1));
  $('readToggles').addEventListener('change', (e) => {
    settings.read[e.target.dataset.k] = e.target.checked;
    if (!Object.values(settings.read).some(Boolean)) toast('読み上げなしで、モーションだけを再生します');
    changed();
  });
  $('jaVoiceSelect').addEventListener('change', (e) => {
    settings.jaVoice = e.target.value;
    speech.jaURI = settings.jaVoice;
    save();
  });
  $('bgToggle').addEventListener('change', (e) => {
    settings.bg = e.target.checked;
    save();
  });
  const tryVoice = async (text, lang) => {
    if (player.state !== 'stopped') player.stop();
    speech.wake(true);
    await sayOnce(text, lang);
    if (player.state === 'stopped') speech.wake(false);
  };
  $('tryEn').addEventListener('click', () => tryVoice('The plane took off on time.', 'en-US'));
  $('tryJa').addEventListener('click', () => tryVoice('飛行機は定刻どおりに離陸した。', 'ja-JP'));
  speech.supported && speechSynthesis.addEventListener?.('voiceschanged', () => !$('sheet').hidden && renderSheet());
  $('voiceSelect').addEventListener('change', (e) => {
    settings.enVoice = e.target.value;
    speech.enURI = settings.enVoice;
    changed();
  });
  $('wakeToggle').addEventListener('change', (e) => {
    settings.wake = e.target.checked;
    save();
    updateWakeLock(player.state !== 'stopped');
  });

  document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => setView(t.dataset.view)));

  // 一覧
  let searchT = 0;
  $('searchInput').addEventListener('input', () => {
    clearTimeout(searchT);
    searchT = setTimeout(renderList, 120);
  });
  $('listChips').addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    listFilter = b.dataset.v;
    renderChips();
    renderList();
  });
  $('list').addEventListener('click', async (e) => {
    const s = e.target.closest('[data-star]');
    if (s) {
      toggleMylist(s.dataset.star);
      renderChips();
      renderList();
      return;
    }
    const o = e.target.closest('[data-open]');
    if (!o) return;
    const id = o.dataset.open;
    if (player.order.includes(id)) {
      player.setList(player.ids, id);
    } else {
      // 今の再生範囲に含まれない語は、その語を含む範囲に切り替えて知らせる
      const next = listFilter !== 'all' && idsOf(listFilter).includes(id) ? listFilter : 'all';
      settings.range = next;
      save();
      applyRange(id);
      toast(`再生する範囲を「${rangeName(next)}」に切り替えました`);
    }
    await setView('learn');
    await showItem(id).catch(() => toast('データを読み込めませんでした。通信状態を確認してください'));
  });
  $('playListBtn').addEventListener('click', async () => {
    clearTimeout(searchT);
    settings.range = listFilter;
    const items = listItems();
    applyRange(items[0]?.id);
    save();
    await setView('learn');
    player.play();
  });

  // 確認
  $('choices').addEventListener('click', (e) => {
    const b = e.target.closest('.choice');
    if (b && !b.disabled) answer(b);
  });
  $('quizNext').addEventListener('click', newQuestion);

  // 左右スワイプで前後へ
  let sx = null, sy = 0;
  stageEl.addEventListener('touchstart', (e) => {
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
  }, { passive: true });
  stageEl.addEventListener('touchend', (e) => {
    if (sx === null || view !== 'learn') return;
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    sx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      navigate(dx < 0 ? 1 : -1);
      dismissHint();
    }
  });
  // ステージをタップすると動きを最初から
  stageEl.addEventListener('click', () => {
    if ((view === 'learn' && player.state === 'stopped') || view === 'quiz') stage.restart('loop');
  });

  // 別アプリへ切り替え・画面ロック：再生を止め、戻ったときに案内を出す
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && player.state !== 'stopped' && !settings.bg) player.stop('hidden');
    if (!document.hidden) updateWakeLock(player.state !== 'stopped');
  });
}

async function navigate(d) {
  try {
    await player.go(d);
  } catch (e) {
    toast('データを読み込めませんでした。通信状態を確認してください');
  }
}

/* ---------- 初回の操作ヒント ---------- */
function showHint() {
  if (settings.hintDone) return;
  $('hint').hidden = false;
}
function dismissHint() {
  if (settings.hintDone) return;
  settings.hintDone = true;
  save();
  $('hint').hidden = true;
}

/* ---------- 起動 ---------- */
async function boot() {
  bind();
  renderModeButtons();
  try {
    index = await loadIndex();
  } catch (e) {
    $('word').innerHTML = '<p class="empty">データを読み込めませんでした。通信状態を確認して、再読み込みしてください。</p>';
    return;
  }
  const start = applyRange(index.byId.has(settings.lastId) ? settings.lastId : null);
  renderStatus('stopped');
  stage.setMode('loop');
  showHint();
  $('hintClose').addEventListener('click', dismissHint);
  try {
    await showItem(start);
  } catch (e) {
    toast('データを読み込めませんでした。通信状態を確認してください');
  }
  if (!speech.supported) toast('このブラウザは読み上げに対応していません。モーションのみ再生します');
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}
boot();
