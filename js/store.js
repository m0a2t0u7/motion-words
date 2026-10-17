// 設定とマイリストの保存（この端末のブラウザ内）。保存できない環境でも動くようにする。
const KEY = 'motion-words:v1';

export const DEFAULTS = {
  mode: 'auto', // auto=順に進む / one=1語をくり返す
  order: 'seq', // seq=順番 / random=ランダム
  range: 'all', // all / カテゴリid / mylist
  reps: 2, // 1語あたりのくり返し回数（auto のとき）
  rate: 0.9, // 読み上げ速度
  gap: 1.0, // 読み上げの間隔（秒）
  read: { en: true, ex: true, ja: true, exJa: false },
  wake: true, // 再生中は画面を消さない
  enVoice: '',
  lastId: null,
  mylist: []
};

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

export function loadSettings() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {};
  } catch (e) {
    saved = {};
  }
  const s = { ...clone(DEFAULTS), ...saved, read: { ...DEFAULTS.read, ...(saved.read || {}) } };
  if (!Array.isArray(s.mylist)) s.mylist = [];
  return s;
}

export function saveSettings(s) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
    return true;
  } catch (e) {
    return false;
  }
}
