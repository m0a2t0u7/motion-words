// 読み上げ（ブラウザ内蔵の音声合成）。止める・切り替えるときに前の音声を必ず残さない。
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PREFERRED_EN = [/Google US English/i, /Samantha/i, /Ava/i, /Natural/i, /Enhanced/i, /Premium/i, /Google UK English Female/i];
const PREFERRED_JA = [/Google 日本語/i, /Kyoko/i, /O-?ren/i, /Natural/i, /Enhanced/i];

export class Speech {
  constructor() {
    this.supported = !!synth && typeof SpeechSynthesisUtterance !== 'undefined';
    this.voices = [];
    this.enURI = '';
    this.jaURI = '';
    this.ctx = null; // 音の出口を起こしておくための無音（Bluetooth・Android で頭が欠ける対策）
    this.wakeNode = null;
    this.current = null; // 再生中の発話（ガベージコレクション対策で保持）
    if (this.supported) {
      const load = () => {
        this.voices = synth.getVoices();
      };
      load();
      synth.addEventListener?.('voiceschanged', load);
    }
  }

  // 声の一覧。聞き取りやすい順（オンライン/高品質 → 米 → 英 → その他）に並べる
  voicesFor(lang) {
    const head = lang === 'en' ? /^en[-_]/i : /^ja[-_]?/i;
    const score = (v) => {
      let n = 0;
      if (/Natural|Online|Enhanced|Premium|Neural|Google/i.test(v.name)) n -= 10;
      if (/en[-_]US/i.test(v.lang)) n -= 3;
      else if (/en[-_]GB/i.test(v.lang)) n -= 2;
      return n;
    };
    return this.voices.filter((v) => head.test(v.lang)).sort((a, b) => score(a) - score(b) || a.name.localeCompare(b.name));
  }
  englishVoices() {
    return this.voicesFor('en');
  }

  // 再生中は音の出口を開けたままにする。止めると最初の音節が欠ける端末がある。
  wake(on) {
    try {
      if (on) {
        if (!this.ctx) {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return;
          this.ctx = new AC();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
        if (!this.wakeNode) {
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          g.gain.value = 0.0008; // 聞こえない大きさ
          o.frequency.value = 30;
          o.connect(g).connect(this.ctx.destination);
          o.start();
          this.wakeNode = { o, g };
        }
      } else if (this.wakeNode) {
        this.wakeNode.o.stop();
        this.wakeNode.o.disconnect();
        this.wakeNode = null;
      }
    } catch (e) {
      /* 無視 */
    }
  }

  pick(lang) {
    const isEn = lang.startsWith('en');
    const list = this.voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(isEn ? 'en' : 'ja'));
    if (!list.length) return null;
    const want = isEn ? this.enURI : this.jaURI;
    if (want) {
      const v = list.find((x) => x.voiceURI === want);
      if (v) return v;
    }
    const exact = list.filter((v) => v.lang.replace('_', '-').toLowerCase() === (isEn ? 'en-us' : 'ja-jp'));
    const pool = exact.length ? exact : list;
    for (const re of isEn ? PREFERRED_EN : PREFERRED_JA) {
      const v = pool.find((x) => re.test(x.name));
      if (v) return v;
    }
    return pool.find((v) => v.localService) || pool[0];
  }

  // iPhone などで、最初の読み上げをタップ操作の中で始めるための空発話
  unlock() {
    if (!this.supported || this._unlocked) return;
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      synth.speak(u);
      this._unlocked = true;
    } catch (e) {
      /* 無視 */
    }
  }

  cancel() {
    if (!this.supported) return;
    this.current = null;
    try {
      synth.cancel();
    } catch (e) {
      /* 無視 */
    }
  }

  // token.cancelled が true になったら途中でも即座に終わる
  async speak(text, lang, rate, token) {
    if (!this.supported || !text) return 'skip';
    if (token?.cancelled) return 'cancel';
    if (synth.speaking || synth.pending) {
      synth.cancel();
      // 前の発話が完全に止まるまで待つ（すぐ次を出すと頭が欠ける）
      for (let i = 0; i < 8 && (synth.speaking || synth.pending); i++) await sleep(60);
      await sleep(120);
      if (token?.cancelled) return 'cancel';
    }
    if (synth.paused) synth.resume();
    return new Promise((resolve) => {
      let done = false;
      let started = false;
      let retried = false;
      let u = null;
      const finish = (why) => {
        if (done) return;
        done = true;
        clearTimeout(guard);
        clearTimeout(kick);
        clearInterval(watch);
        if (this.current === u) this.current = null;
        resolve(why);
      };
      const make = () => {
        const x = new SpeechSynthesisUtterance(text);
        x.lang = lang;
        const v = this.pick(lang);
        if (v) x.voice = v;
        x.rate = rate;
        x.pitch = 1;
        x.volume = 1;
        x.onstart = () => {
          if (x === u) started = true;
        };
        x.onend = () => x === u && finish('end');
        x.onerror = (e) => x === u && finish(e.error === 'interrupted' || e.error === 'canceled' ? 'cancel' : 'error');
        return x;
      };
      const start = () => {
        u = make();
        this.current = u;
        try {
          synth.speak(u);
        } catch (e) {
          finish('error');
        }
      };
      // onend が届かない端末への保険：文字数から見積もった時間で打ち切る
      const est = (lang.startsWith('ja') ? text.length * 160 : text.length * 75) / rate + 2500;
      const guard = setTimeout(() => finish('timeout'), est + 1500);
      // 取り消し直後の発話が始まらない端末（主に iPhone Safari）向け：1.2秒たっても始まらなければ1回だけ読み直す
      const kick = setTimeout(() => {
        if (done || started || retried || token?.cancelled) return;
        // 何も話していない（speaking=false）ときだけ。話している最中に読み直して途切れさせない。
        if (!synth.speaking) {
          retried = true;
          try {
            synth.cancel();
          } catch (e) {
            /* 無視 */
          }
          setTimeout(() => !done && !token?.cancelled && start(), 80);
        }
      }, 1200);
      const watch = setInterval(() => {
        if (token?.cancelled) finish('cancel');
      }, 80);
      start();
    });
  }
}
