/* ===== Firebase 連線設定（所有節次共用；第3～7章資料夾各有一份相同的 firebase-config.js，修改時 6 份要一起改）=====
   專案：classtool1141019（與基本電學練工坊共用；本課程只使用 engine_scores、engine_live 兩個集合）
   清空 apiKey ＝ 離線模式（互學挑戰照常可玩，只是不上傳成績）。
   其他老師自建：把下面 6 行設定換成自己的 Firebase 專案，步驟見 share/selfhost.html。 */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBhamHPMCBjGQMpxTtX43JLcPab7QfsTgg",
  authDomain: "classtool1141019.firebaseapp.com",
  projectId: "classtool1141019",
  storageBucket: "classtool1141019.firebasestorage.app",
  messagingSenderId: "864195851107",
  appId: "1:864195851107:web:de3fd1a48896528b145956"
};

/* ===== 班級選項（學生端下拉選單、教師大螢幕共用）=====
   可自行增減；學生也可選「✏️ 手動輸入班級」。 */
window.CLASS_LIST = ['汽車一甲', '汽車一乙'];
