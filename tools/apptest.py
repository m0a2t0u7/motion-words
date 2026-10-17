"""アプリ全体の動作確認（読み上げは擬似化して、何がいつ読まれたかを記録する）。
使い方: リポジトリ直下で http.server 8765 を起動してから
  PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tools/apptest.py OUT_DIR
"""
import sys, os, json, time
from playwright.sync_api import sync_playwright

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
BASE = os.environ.get('APP_URL', 'http://localhost:8765/')

MOCK = r"""
(() => {
  window.__spoken = [];
  const queue = [];
  let cur = null, timer = null;
  const synth = {
    speaking: false, pending: false,
    getVoices: () => [
      { name: 'Google US English', lang: 'en-US', voiceURI: 'g-us', localService: false },
      { name: 'Google 日本語', lang: 'ja-JP', voiceURI: 'g-ja', localService: false }
    ],
    addEventListener() {},
    speak(u) {
      if (u.text.trim()) window.__spoken.push({ t: performance.now(), text: u.text, lang: u.lang, rate: u.rate });
      cur = u; synth.speaking = true;
      const ms = Math.max(120, u.text.length * 30);
      timer = setTimeout(() => { synth.speaking = false; cur = null; u.onend && u.onend({}); }, ms);
    },
    cancel() {
      clearTimeout(timer);
      if (cur) { const u = cur; cur = null; synth.speaking = false; window.__spoken.push({ t: performance.now(), text: '<cancel>' }); u.onerror && u.onerror({ error: 'interrupted' }); }
    }
  };
  Object.defineProperty(window, 'speechSynthesis', { value: synth });
  window.SpeechSynthesisUtterance = function (text) { this.text = text; };
})();
"""


def main():
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        ctx.add_init_script(MOCK)
        ctx.add_init_script("try{localStorage.setItem('motion-words:gate','ee5a23f31c7f67196a0e79d0674416044d7f7a3f537ca88f9cd984b077b2e764')}catch(e){}")
        pg = ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
        pg.on('console', lambda m: errs.append('console: ' + m.text) if m.type == 'error' else None)
        pg.goto(BASE)
        pg.wait_for_selector('#enText:not(:empty)', timeout=20000)
        time.sleep(1.5)
        pg.screenshot(path=f'{OUT}/01-learn.png')
        pg.screenshot(path=f'{OUT}/01b-learn-full.png', full_page=True)
        first = pg.inner_text('#enText')

        # 再生：2回くり返し→次の語へ進むこと
        pg.click('#playBtn')
        time.sleep(1.2)
        pg.screenshot(path=f'{OUT}/02-playing.png')
        time.sleep(14)
        spoken1 = pg.evaluate('window.__spoken')
        now_word = pg.inner_text('#enText')
        status = pg.inner_text('#statusText')
        # 停止後に音が残らないこと
        pg.click('#playBtn')
        n_at_stop = len(pg.evaluate('window.__spoken'))
        time.sleep(3)
        after_stop = pg.evaluate('window.__spoken')[n_at_stop:]

        # 次へ／前へ（停止中）
        pg.click('#nextBtn'); time.sleep(0.8)
        w_next = pg.inner_text('#enText')
        pg.click('#prevBtn'); time.sleep(0.8)
        w_prev = pg.inner_text('#enText')

        # 再生中に次へ：前の語の読み上げが続かないこと
        pg.click('#playBtn'); time.sleep(1.0)
        n0 = len(pg.evaluate('window.__spoken'))
        pg.click('#nextBtn'); time.sleep(2.5)
        seq = pg.evaluate('window.__spoken')[n0:]
        w_after_next = pg.inner_text('#enText')
        pg.click('#playBtn'); time.sleep(0.5)

        # 1語リピート
        pg.click('#modeBtn'); time.sleep(0.3)
        pg.click('#playBtn'); time.sleep(10)
        w_one_start = w_after_next
        w_one_end = pg.inner_text('#enText')
        rep_label = pg.inner_text('#statusSub')
        pg.click('#playBtn')
        pg.click('#modeBtn'); time.sleep(0.3)

        # 設定シート
        pg.click('#settingsBtn'); time.sleep(0.5)
        pg.screenshot(path=f'{OUT}/03-settings.png')
        pg.click('#rangeSeg button[data-v="idiom"]'); time.sleep(0.8)
        range_label = pg.inner_text('#rangeLabel')
        pg.click('#sheetClose'); time.sleep(0.6)
        idiom_word = pg.inner_text('#enText')

        # 一覧
        pg.click('.tab[data-view="list"]'); time.sleep(0.8)
        pg.screenshot(path=f'{OUT}/04-list.png')
        pg.fill('#searchInput', '離陸'); time.sleep(0.4)
        search_n = pg.inner_text('#listCount')
        pg.fill('#searchInput', ''); time.sleep(0.3)
        pg.click('.chip[data-v="phrasal"]'); time.sleep(0.3)
        pg.click('[data-open="pick-up"]'); time.sleep(1.5)
        opened = pg.inner_text('#enText')
        pg.screenshot(path=f'{OUT}/05-pickup.png')

        # 確認
        pg.click('.tab[data-view="quiz"]'); time.sleep(2.0)
        pg.screenshot(path=f'{OUT}/06-quiz.png')
        pg.click('.choice >> nth=0'); time.sleep(0.6)
        pg.screenshot(path=f'{OUT}/07-quiz-answer.png')
        pg.click('.tab[data-view="learn"]'); time.sleep(1.0)

        # 設定の保存（再読み込み後も残るか）
        pg.reload(); pg.wait_for_selector('#enText:not(:empty)'); time.sleep(1)
        persisted = pg.evaluate("JSON.parse(localStorage.getItem('motion-words:v1'))")

        res = {
            'first': first, 'status_while_playing': status, 'word_after_14s': now_word,
            'spoken_first14s': [s['text'] for s in spoken1],
            'after_stop': after_stop,
            'next': w_next, 'prev': w_prev,
            'seq_after_next_while_playing': [s['text'] for s in seq], 'word_after_next': w_after_next,
            'one_mode_start': w_one_start, 'one_mode_end': w_one_end, 'rep_label': rep_label,
            'range_label': range_label, 'idiom_word': idiom_word,
            'search_離陸': search_n, 'opened_from_list': opened,
            'persisted': {k: persisted.get(k) for k in ['range', 'mode', 'order', 'lastId', 'reps', 'rate']},
            'errors': errs,
        }
        print(json.dumps(res, ensure_ascii=False, indent=1))
        b.close()


if __name__ == '__main__':
    main()
