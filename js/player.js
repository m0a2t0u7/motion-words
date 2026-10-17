// 連続再生の制御。再生のたびに新しい「合図（token）」を作り、止める・切り替えるときは古い合図を取り消す。
// 取り消された合図に属する読み上げ・待ち時間は、すべてその場で終わる（前の音声が後から鳴らない）。
const wait = (ms, token) =>
  new Promise((resolve) => {
    if (token.cancelled || ms <= 0) return resolve();
    const id = setTimeout(done, ms);
    const iv = setInterval(() => token.cancelled && done(), 60);
    function done() {
      clearTimeout(id);
      clearInterval(iv);
      resolve();
    }
  });

// 「（電気・機械を）消す」→「電気・機械を消す」。かっこの中身は意味の区別に必要なので残す。
const clean = (s) => s.replace(/[（(]([^）)]*)[）)]/g, '$1').replace(/〜/g, '').trim();

export function segmentsFor(item, read) {
  const segs = [];
  if (read.en) segs.push({ key: 'en', text: item.en, lang: 'en-US' });
  if (read.ex) segs.push({ key: 'ex', text: item.ex.en, lang: 'en-US' });
  if (read.ja) segs.push({ key: 'ja', text: clean(item.sense), lang: 'ja-JP' });
  if (read.exJa) segs.push({ key: 'exJa', text: item.ex.ja, lang: 'ja-JP' });
  return segs;
}

export class Player {
  constructor({ speech, stage, settings, show, onStatus, onSegment, onRep, prefetch, onSkip = () => {} }) {
    Object.assign(this, { speech, stage, settings, show, onStatus, onSegment, onRep, prefetch, onSkip });
    this.ids = [];
    this.order = [];
    this.pos = 0;
    this.state = 'stopped';
    this.token = null;
  }

  get currentId() {
    return this.order[this.pos];
  }

  // 再生する範囲を設定。startId があればその項目から。
  setList(ids, startId) {
    this.ids = ids.slice();
    this._makeOrder(startId);
  }

  _makeOrder(startId) {
    const ids = this.ids.slice();
    if (this.settings.order === 'random') {
      for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }
      // 始めたい項目を先頭へ
      if (startId && ids.includes(startId)) {
        ids.splice(ids.indexOf(startId), 1);
        ids.unshift(startId);
      }
      this.order = ids;
      this.pos = 0;
    } else {
      this.order = ids;
      this.pos = Math.max(0, startId ? ids.indexOf(startId) : 0);
    }
  }

  // 並び順（順番/ランダム）を変えたとき、今の項目を保ったまま並べ直す
  reorder() {
    this._makeOrder(this.currentId);
  }

  _status(s, extra) {
    this.state = s;
    this.onStatus(s, extra);
  }

  play() {
    if (!this.order.length) return;
    this._cancel();
    this.speech.unlock();
    const token = { cancelled: false };
    this.token = token;
    this._run(token).catch((e) => {
      console.error(e);
      if (this.token === token) this.stop('error');
    });
  }

  stop(reason = 'user') {
    this._cancel();
    this.stage.setMode('loop');
    this.onSegment(null);
    this._status('stopped', reason);
  }

  toggle() {
    if (this.state === 'stopped') this.play();
    else this.stop();
  }

  // 再生中なら新しい条件で今の項目からやり直す（設定変更・範囲変更のとき）
  restartIfPlaying() {
    if (this.state !== 'stopped') this.play();
  }

  async go(delta) {
    if (!this.order.length) return;
    const prev = this.pos;
    this.pos = (this.pos + delta + this.order.length) % this.order.length;
    if (this.state !== 'stopped') this.play();
    else {
      this._cancel();
      try {
        await this.show(this.currentId);
      } catch (e) {
        this.pos = prev; // 表示できなかったら位置を戻す（画面と内部の位置をずらさない）
        throw e;
      }
    }
  }

  async jump(id) {
    const i = this.order.indexOf(id);
    if (i < 0) return;
    this.pos = i;
    if (this.state !== 'stopped') this.play();
    else await this.show(id);
  }

  _cancel() {
    if (this.token) this.token.cancelled = true;
    this.token = null;
    this.speech.cancel();
  }

  async _run(token) {
    let fails = 0;
    while (!token.cancelled) {
      const id = this.currentId;
      this._status('loading');
      let item;
      try {
        item = await this.show(id);
      } catch (e) {
        // 通信が切れた等で読めない語は飛ばして次へ。全部だめなら止める。
        if (token.cancelled) return;
        fails++;
        if (fails >= Math.min(this.order.length, 5)) {
          this.stop('error');
          return;
        }
        this.onSkip(id);
        this.pos = (this.pos + 1) % this.order.length;
        await wait(400, token);
        continue;
      }
      fails = 0;
      if (token.cancelled) return;
      this._status('playing');
      const next = this.order[(this.pos + 1) % this.order.length];
      if (next) this.prefetch(next);
      const s = this.settings;
      const reps = s.mode === 'one' ? Infinity : Math.max(1, s.reps);
      for (let r = 0; r < reps && !token.cancelled; r++) {
        this.onRep(r + 1, reps);
        this.stage.restart('once');
        await wait(350, token);
        const segs = segmentsFor(item, s.read);
        for (const seg of segs) {
          if (token.cancelled) return;
          this.onSegment(seg.key);
          const rate = seg.lang.startsWith('ja') ? Math.min(1.3, s.rate * 1.08) : s.rate;
          await this.speech.speak(seg.text, seg.lang, rate, token);
          if (token.cancelled) return;
          this.onSegment(null);
          await wait(s.gap * 1000, token);
        }
        // モーションが最後まで終わってから次へ
        await wait(this.stage.remaining() * 1000 + (segs.length ? 150 : 900), token);
      }
      if (token.cancelled) return;
      this.pos = (this.pos + 1) % this.order.length;
      if (this.pos === 0 && this.settings.order === 'random') this._makeOrder();
    }
  }
}
