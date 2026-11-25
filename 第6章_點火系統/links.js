/* ===== 第6章 點火系統：平台連結設定（本章所有節次共用） =====
   把網址貼在引號裡即可；留空白的按鈕會顯示「（待設定）」。 */
window.LINKS = {
  剛好學: 'https://ntccar01.github.io/ntccalsstools/',
  classroom: '',          // Google Classroom 班級網址
  chateverywhere: 'https://chateverywhere.app/',
  notebooklm: 'https://notebooklm.google.com/',
  // ===== 補課包（R1～R5）：video＝補課影片（單支網址，或多集「▶ 標題|網址 ; ▶ 標題|網址」）、edcafeR＝選填 Edcafe 測驗（R 頁已內建 6 題，可留空）、form＝隨堂測驗（Google 表單） =====
  video1: '', edcafeR1: '', form1: '',   // 第 1 節（全課程第 29 節）點火任務與正時控制
  video2: '', edcafeR2: '', form2: '',   // 第 2 節（全課程第 30 節）接點式點火構造與零件
  video3: '', edcafeR3: '', form3: '',   // 第 3 節（全課程第 31 節）接點式點火原理與提前機構
  video4: '', edcafeR4: '', form4: '',   // 第 4 節（全課程第 32 節）電子式與磁電機點火
  video5: '', edcafeR5: '', form5: '',   // 第 5 節（全課程第 33 節）電腦控制、直接點火與 CDI
  unit6: '',              // 單元六測驗（第 6 章，20 題）
};
/* 自動載入補課包內建 6 題測驗模組（R1～R5 自動生效） */
if (typeof document !== 'undefined' && document.querySelector('.step[data-k="2"]')) {
  ['firebase-config.js', 'score.js', 'remedial_quiz_data.js'].forEach(function (src) {
    var s = document.createElement('script'); s.src = src; document.head.appendChild(s);
  });
}
