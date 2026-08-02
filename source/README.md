時刻表 更新手順　　毎回忘れるのでこの順番どおりやりましょう

# ファイルの役割

■ カイゼン.xlsm  元データ（マスター）
駅・時刻を修正するのはこれ。時刻データ生成VBAつき

■ ExportTimetableJS（VBA）
↓
■ timetable.js
Webアプリが読むデータ。手で編集しないでVBAが出力する

■ index.html  画面表示。


# 時刻を修正するとき

① カイゼン.xlsm を開く

② 時刻や列車を修正する

③ 保存（Ctrl + S）

④ Alt + F8

ExportTimetableJS を実行

⑤ 「timetable.js を作成しました」
と表示されたら成功

⑥ timetable.js が更新される

---

# Webへ反映

GitHub Desktop を開く

変更ファイルを確認

source/カイゼン.xlsm
source/Module1.bas（VBAを変更した時だけ）
timetable.js

Commit ↓ Push origin
GitHub Pagesが更新されるまで少し待つ
スマホで確認

# VBAを修正するとき
Excel時刻表ファイルの行列番号などが変わると読む行番号が変わる
AIに両方読ませてどこか得るか聞くとよい

Alt + F11
Module1 を開く
修正して保存する
Excelへ戻る

Alt + F8
ExportTimetableJS
実行

問題なければ ファイル-ファイルのエクスポート
Module1.basとして保存

GitHubへCommit・Push

---

# VBAを失ったとき

Alt + F11
Module1 が無い場合

ファイル-ファイルのインポート-source/Module1.bas
または直接貼り付けで保存
これで復旧できる。

---
# Gitの注意
Gitは心を読まない。

# サービスワーカー
画面が更新されない時は
sw.js
const CACHE_NAME = "timetable-v0.2.2"
など番号を変更する。
PWAはキャッシュが強い。

# バージョン
APP_VERSION
も同時に更新すると確認しやすい。
---

# 基本ルール

編集するのは

○ カイゼン.xlsm

○ Module1.bas

× timetable.js を手で編集しない

timetable.js は必ず ExportTimetableJS が作る。

---
Gitへ一言　Gitのばか。
