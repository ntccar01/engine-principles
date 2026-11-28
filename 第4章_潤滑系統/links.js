/* ===== 第4章 潤滑系統：平台連結設定（本章所有節次共用） =====
   把網址貼在引號裡即可；留空白的按鈕會顯示「（待設定）」。 */
window.LINKS = {
  剛好學: 'https://ntccar01.github.io/ntccalsstools/',
  classroom: '',          // Google Classroom 班級網址
  chateverywhere: 'https://chateverywhere.app/',
  notebooklm: 'https://notebooklm.google.com/',
  // ===== 補課包（R1～R3）：video＝補課影片（單支網址，或多集「▶ 標題|網址 ; ▶ 標題|網址」）、edcafeR＝選填 Edcafe 測驗（R 頁已內建 6 題，可留空）、form＝站內隨堂測驗（Q 頁） =====
  video1: '', edcafeR1: '', form1: 'Q1_隨堂測驗.html',   // 第 1 節（全課程第 23 節）潤滑油的功能與性質
  video2: '', edcafeR2: '', form2: 'Q2_隨堂測驗.html',   // 第 2 節（全課程第 24 節）潤滑方式與機油泵
  video3: '', edcafeR3: '', form3: 'Q3_隨堂測驗.html',   // 第 3 節（全課程第 25 節）過濾、監測與曲軸箱通風
  unit5: '../第5章_冷卻系統/Q_單元五測驗.html',              // 單元五測驗（第 4、5 章，20 題）
};
/* 自動載入補課包內建 6 題測驗模組（R1～R3 自動生效） */
if (typeof document !== 'undefined' && document.querySelector('.step[data-k="2"]')) {
  ['firebase-config.js', 'student.js', 'score.js', 'remedial_quiz_data.js'].forEach(function (src) {
    var s = document.createElement('script'); s.async = false; s.src = src; document.head.appendChild(s);
  });
}

/* 舊版 Google 表單連結（2026-11 起改用站內測驗 Q 頁；保留給教師專區參考，學生頁面不再使用） */
window.OLD_FORMS = {};
