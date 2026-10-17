# 型モーションの割り当て

入力：`data/staging/outA-XX.json`（教材データ）
出力：`data/staging/tplA-XX.json` ＝ `{ "<id>": { tpl } | null, ... }`（全件のidを含める）

意味が型で無理なく伝わる語だけに割り当て、合わないものは `null`（モーションなし）にする。迷ったら null。

## 型（t）と引数

| t | 使う語 | 引数 |
|---|---|---|
| move | 物の移動・方向（go up, fall, enter, leave, return, rise…） | `e` 絵文字1つ、`dir`：up / down / across / away / toward / back / in / out / through / on / off / over / around |
| act | 人の動作（eat, give, buy, run, talk, think, sleep, look, wait…） | `e`、`act`：give / take / pay / buy / throw / eat / drink / look / talk / ask / think / sleep / run / walk / carry / jump / wait / hold |
| change | 状態の変化（grow, break, heat, open, increase, start…） | `e`、`ch`：grow / shrink / more / less / fill / empty / appear / disappear / start / stop / break / fix / heat / cool / clean / dirty / open / close |
| show | 具体的な物の名詞（apple, bus, chair…） | `e`：その物を表す絵文字（ぴったりの絵文字があるときだけ） |
| mood | 気持ち・様子の形容詞（happy, tired, angry…） | `mood`：happy / sad / angry / surprised / tired / worried / calm / proud / scared / busy / sick |
| compare | 比較・位置の形容詞や副詞（big, fast, near, high, same…） | `e`（比べる相手）, `e2`（主役。動く・大きくなる側）、`rel`：bigger / smaller / faster / first / high / low / near / far / same / different |
| time | 時・頻度の副詞（often, always, never, soon, already…） | `e`、`rel`：before / after / ago / later / already / soon / now / always / often / again / still / never |

## 決まり

- 例：`"apple": {"t":"show","e":"🍎"}`、`"climb": {"t":"move","e":"🧗","dir":"up"}`、`"tired": {"t":"mood","mood":"tired"}`
- 絵文字は意味の中心をそのまま表すものだけ。国旗・人の顔の写真風・ブランドを連想させるものは使わない。
- 抽象語（idea, however, deal with など）、例文と型がずれる語は null。
- イディオムは原則 null（比喩なので型では誤解を招く）。
