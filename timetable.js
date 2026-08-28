/* ===== phrases 配列 ===== */
const phrases = {
  dore: [
    { cat:"dore", no:1, role:"Q", ja:"この列車はどの駅で降りますか？", en:"Which station will you get off at?" },
    { cat:"dore", no:2, role:"Q", ja:"最終の目的地はどこですか？", en:"What is your final destination?" },
    { cat:"dore", no:3, role:"I", ja:"乗り換えてください。", en:"Please transfer." },
    { cat:"dore", no:4, role:"I", ja:"次に来る列車をご利用ください。", en:"Please take the next arriving train." },
    { cat:"dore", no:5, role:"E", ja:"乗り換え時間が短いです。", en:"Transfer time is short." },
    { cat:"dore", no:6, role:"I", ja:"乗車を急いでください。", en:"Please board as soon as possible." }
  ],

  train: [
    { cat:"train", no:1, role:"E", ja:"この列車は特急列車です。", en:"This is a limited express train." },
    { cat:"train", no:2, role:"E", ja:"全席指定席です。", en:"Reserved seats only." },
    { cat:"train", no:3, role:"Q", ja:"指定席特急券をお持ちですか？", en:"Do you have a reserved seat ticket?" },
    { cat:"train", no:4, role:"I", ja:"席のご案内をします。", en:"We will show you to your seat." },
    { cat:"train", no:5, role:"I", ja:"車掌にお知らせください。", en:"Please speak to the conductor." },
    { cat:"train", no:6, role:"E", ja:"この列車は智頭線を通ります。", en:"This train runs on the Chizu Line." },
    { cat:"train", no:7, role:"E", ja:"ジャパンレールパスは使えません。", en:"Japan Rail Pass is not valid." },
    { cat:"train", no:8, role:"E", ja:"ICカードは使えません。", en:"IC cards cannot be used." },
    { cat:"train", no:9, role:"E", ja:"指定席は満席です。ドア付近での立席乗車となります。", en:"Reserved seats are full. Please stand near the door." },
    { cat:"train", no:10, role:"E", ja:"この列車は普通列車です。各駅に停まります。", en:"This is a local train. It stops at all stations." },
    { cat:"train", no:11, role:"I", ja:"後ろのドアからご乗車ください。運賃は後払いです。前のドアからお降りください。", en:"Please board through the rear door, pay when you get off, and exit through the front door." },
    { cat:"train", no:12, role:"I", ja:"運賃箱にお支払いください。乗車券を運転士に見せてください。", en:"Please pay at the fare box and show your ticket to the driver." }
  ],

  ticket: [
    { cat:"ticket", no:1, role:"Q", ja:"行き先を教えてください。", en:"Please tell me your destination." },
    { cat:"ticket", no:2, role:"I", ja:"乗車券を見せてください。", en:"Please show your ticket." },
    { cat:"ticket", no:3, role:"Q", ja:"スマートフォンのルート検索を見せてください。", en:"Can you show me your route search?" },
    { cat:"ticket", no:4, role:"I", ja:"きっぷを購入してください。", en:"Please buy a ticket." },
    { cat:"ticket", no:5, role:"E", ja:"智頭線の運賃が必要です。JRの乗車券は使えません。", en:"The Chizu Line fare is required. JR tickets are not valid." },
    { cat:"ticket", no:6, role:"I", ja:"運賃をお支払いください。", en:"Please pay the fare." },
    { cat:"ticket", no:7, role:"I", ja:"降車駅でお支払いください。", en:"Please pay at your destination station." },
    { cat:"ticket", no:8, role:"E", ja:"乗車券に未使用証明をします。", en:"We can mark your ticket as unused." },
    { cat:"ticket", no:9, role:"E", ja:"駅の窓口で払い戻しできます。", en:"You can get a refund at the ticket counter." },
    { cat:"ticket", no:10, role:"I", ja:"智頭線の運賃をお支払いください。", en:"Please pay the Chizu Line fare." },
    { cat:"ticket", no:11, role:"E", ja:"パスのエリア外です。エリア外の運賃をお支払いください。", en:"You are outside the pass area. Please pay the extra fare." },
    { cat:"ticket", no:12, role:"I", ja:"JR区間と智頭線は別々にきっぷを購入してください。", en:"Please buy separate tickets for the JR section and the Chizu Line." },
    { cat:"ticket", no:13, role:"E", ja:"乗車ルートと乗車券のルートが違います。", en:"Your ticket route is incorrect." },
    { cat:"ticket", no:14, role:"I", ja:"差額をお支払いください。", en:"Please pay the fare difference." },
    { cat:"ticket", no:15, role:"I", ja:"現金のみでお支払いください。", en:"Please pay in cash only." },
    { cat:"ticket", no:16, role:"E", ja:"クレジットカードまたはICカードで支払えます。", en:"You can pay by credit card or IC card." },
    { cat:"ticket", no:17, role:"E", ja:"早く到着するルートがあります。料金は高くなります。", en:"There is a faster route. It costs more." },
    { cat:"ticket", no:18, role:"Q", ja:"このルートにしますか？", en:"Would you like this route?" },
    { cat:"ticket", no:19, role:"E", ja:"変更・払い戻しは列車の発車前のみできます。", en:"Changes and refunds are available only before departure." },
    { cat:"ticket", no:20, role:"E", ja:"乗り遅れの場合は、同日の後続の特急列車に立席で乗車できます。", en:"If you miss your train, you may take a later limited express train on the same day as a standing passenger." },
    { cat:"ticket", no:21, role:"E", ja:"後続の列車の指定席利用には、差額のお支払いが必要です。", en:"A fare difference is required to use a reserved seat on a later train." }
  ],

  ic: [
    { cat:"ic", no:1, role:"E", ja:"ここはICカードエリア外です。通常のきっぷを購入してください。", en:"This is outside the IC card area. Please buy a regular ticket." },
    { cat:"ic", no:2, role:"I", ja:"ICカードを自動改札機にタッチしてください。", en:"Please tap your IC card at the ticket gate." },
    { cat:"ic", no:3, role:"Q", ja:"どの駅からICカードで入場しましたか？", en:"Which station did you enter from with your IC card?" },
    { cat:"ic", no:4, role:"I", ja:"ICカードエリアの駅でカードの入場記録の取り消しができます。係員におたずねください。", en:"Please ask the staff at an IC card area station to cancel your IC card entry record." }
  ],

  info: [
    { cat:"info", no:1, role:"E", ja:"信号待ちです。", en:"We are waiting for a signal." },
    { cat:"info", no:2, role:"E", ja:"しばらく停車します。", en:"We will stop for a while." },
    { cat:"info", no:3, role:"E", ja:"列車の運行が遅れています。", en:"Train services are delayed." },
    { cat:"info", no:4, role:"I", ja:"次の列車をご利用ください。", en:"Please take the next train." },
    { cat:"info", no:5, role:"I", ja:"次に来る列車をご利用ください。", en:"Please take the next arriving train." },
    { cat:"info", no:6, role:"E", ja:"運転を見合わせています。", en:"Train service is suspended." },
    { cat:"info", no:7, role:"E", ja:"運転再開時刻は未定です。", en:"We do not know when train service will resume." },
    { cat:"info", no:8, role:"E", ja:"🌧 天候の影響 ⚠️ 事故の影響 🔧 故障の影響", en:"🌧 Bad weather ⚠️ An accident 🔧 A mechanical problem" },
    { cat:"info", no:9, role:"E", ja:"この列車は途中で運転を取りやめます。", en:"This train will terminate before the final destination." },
    { cat:"info", no:10, role:"E", ja:"誤った列車に乗っています。", en:"You are on the wrong train." },
    { cat:"info", no:11, role:"I", ja:"次の駅で降りてください。戻る列車をご利用ください。", en:"Please get off at the next station and take a train back." }
  ]
};
