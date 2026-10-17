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
    this.current = null; // 再生中の発話（ガベージコレクション対策で保持）
    if (this.supported) {
      const load = () => {
        this.voices = synth.getVoices();
      };
      load();
      synth.addEventListener?.('voiceschanged', load);
    }
  }

  englishVoices() {
    return this.voices.filter((v) => /^en[-_]/i.test(v.lang));
  }

  pick(lang) {
    const isEn = lang.startsWith('en');
    const list = this.voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(isEn ? 'en' : 'ja'));
    if (!list.length) return null;
    if (isEn && this.enURI) {
      const v = list.find((x) => x.voiceURI === this.enURI);
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
      await sleep(70);
      if (token?.cancelled) return 'cancel';
    }
    return new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      const v = this.pick(lang);
      if (v) u.voice = v;
      u.rate = rate;
      u.pitch = 1;
      this.current = u;
      let done = false;
      const finish = (why) => {
        if (done) return;
        done = true;
        clearTimeout(guard);
        clearInterval(watch);
        if (this.current === u) this.current = null;
        resolve(why);
      };
      u.onend = () => finish('end');
      u.onerror = (e) => finish(e.error === 'interrupted' || e.error === 'canceled' ? 'cancel' : 'error');
      // onend が届かない端末への保険：文字数から見積もった時間で打ち切る
      const est = (lang.startsWith('ja') ? text.length * 160 : text.length * 75) / rate + 2500;
      const guard = setTimeout(() => finish('timeout'), est);
      const watch = setInterval(() => {
        if (token?.cancelled) {
          finish('cancel');
        }
      }, 80);
      try {
        synth.speak(u);
      } catch (e) {
        finish('error');
      }
    });
  }
}
