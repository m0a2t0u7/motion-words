// 4桁の合言葉。一度正しく入れたブラウザは記憶し、次からは聞かない。
// 注意：静的サイトなので本格的な防御ではない（知らない人がふつうに使えない程度）。
// PIN_HASH は SHA-256("motion-words:" + 4桁) の16進。null なら合言葉なしで開く。
const PIN_HASH = 'ee5a23f31c7f67196a0e79d0674416044d7f7a3f537ca88f9cd984b077b2e764';
const KEY = 'motion-words:gate';

async function sha(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
function remembered() {
  try {
    return localStorage.getItem(KEY) === PIN_HASH;
  } catch (e) {
    return false;
  }
}

if (PIN_HASH && !remembered()) {
  const el = document.createElement('div');
  el.className = 'gate';
  el.innerHTML = `<form class="gate-box" autocomplete="off">
    <div class="gate-title">MOTION</div>
    <label class="gate-label" for="gatePin">4桁の番号を入れてください</label>
    <input id="gatePin" class="gate-input" inputmode="numeric" pattern="[0-9]*" maxlength="4" type="password" autofocus>
    <div class="gate-msg" aria-live="polite"></div>
    <button class="gate-btn" type="submit">はじめる</button>
    <div class="gate-note">一度入れると、このブラウザでは次から聞かれません。</div>
  </form>`;
  document.body.appendChild(el);
  document.documentElement.classList.add('locked');
  const input = el.querySelector('input');
  const msg = el.querySelector('.gate-msg');
  const check = async () => {
    const v = input.value.trim();
    if (!/^\d{4}$/.test(v)) {
      msg.textContent = '数字4桁で入れてください';
      return;
    }
    if ((await sha('motion-words:' + v)) === PIN_HASH) {
      try {
        localStorage.setItem(KEY, PIN_HASH);
      } catch (e) {
        /* 保存できない環境では毎回聞く */
      }
      el.remove();
      document.documentElement.classList.remove('locked');
    } else {
      msg.textContent = '番号が違います';
      input.value = '';
      input.focus();
    }
  };
  el.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    check();
  });
  input.addEventListener('input', () => input.value.length === 4 && check());
}
