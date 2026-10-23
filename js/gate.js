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
    <svg class="gate-mame" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="-56 -118 112 128">
  <ellipse cx="0" cy="2" rx="30" ry="6" fill="#2A3242" opacity="0.12"/>
  <g stroke="#3BAE98" stroke-width="10" stroke-linecap="round"><line x1="-12" y1="-14" x2="-12" y2="1"/><line x1="12" y1="-14" x2="12" y2="1"/></g>
  <g transform="translate(0 -10)">
    <g transform="translate(-27 -46) rotate(22)"><line x1="0" y1="0" x2="0" y2="24" stroke="#3BAE98" stroke-width="9" stroke-linecap="round"/><circle cx="0" cy="26" r="6.5" fill="#5FCDB8" stroke="#3BAE98" stroke-width="2.5"/></g>
    <rect x="-30" y="-80" width="60" height="80" rx="28" fill="#5FCDB8"/>
    <ellipse cx="-9" cy="-58" rx="10" ry="16" fill="#FFFFFF" opacity="0.22"/>
    <g class="mame-eyes"><ellipse cx="-10" cy="-54" rx="3.6" ry="5" fill="#2A3242"/>
    <ellipse cx="10" cy="-54" rx="3.6" ry="5" fill="#2A3242"/></g>
    <circle cx="-18" cy="-44" r="4" fill="#FF9C8C" opacity="0.45"/>
    <circle cx="18" cy="-44" r="4" fill="#FF9C8C" opacity="0.45"/>
    <path d="M -7 -44 Q 0 -35 7 -44 Z" fill="#2A3242" stroke="#2A3242" stroke-width="2.4" stroke-linejoin="round"/>
    <g transform="translate(27 -46)"><g class="mame-wave"><line x1="0" y1="0" x2="0" y2="24" stroke="#3BAE98" stroke-width="9" stroke-linecap="round"/><circle cx="0" cy="26" r="6.5" fill="#5FCDB8" stroke="#3BAE98" stroke-width="2.5"/></g></g>
  </g>
</svg>
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
      el.classList.add('ok');
      setTimeout(() => {
        el.remove();
        document.documentElement.classList.remove('locked');
      }, 650);
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
