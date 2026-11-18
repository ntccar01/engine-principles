/* ===== 第3章 上課簡報：平台連結設定（所有節次共用） =====
   把網址貼在引號裡即可；留空白的按鈕會顯示「（待設定）」。 */
window.LINKS = {
  剛好學: 'https://ntccar01.github.io/ntccalsstools/',
  classroom: '',          // Google Classroom 班級網址
  chateverywhere: 'https://chateverywhere.app/',
  notebooklm: 'https://notebooklm.google.com/',
  // ===== 補課包（R1～R10）：video＝補課影片 YouTube 網址、edcafeR＝Edcafe 補課影片測驗、form＝課後測驗（Google 表單）。尚未完成者留空，頁面會顯示「待補」。 =====
  video1: '', edcafeR1: '', form1: '',   // 第 1 節 石油與汽油的身世
  video2: '', edcafeR2: '', form2: '',   // 第 2 節 辛烷值與油品性質
  video3: '', edcafeR3: '', form3: '',   // 第 3 節 混合比與燃燒
  video4: '▶ 3-2① 油箱到化油器|https://youtu.be/ljsNRtfqguw ; ▶ 3-2② 汽油泵吸送油|https://youtu.be/-uyW8Z6Pjk4 ; ▶ 3-2③ 文氏管原理|https://youtu.be/zefM1LMsYkM ; ▶ 3-2④ 化油器分類|https://youtu.be/cnPwQJgeCN0 ; ▶ 3-2⑤ 浮筒與通氣|https://youtu.be/LABR9LaPhWg ; ▶ 3-2⑥ 怠速及低速|https://youtu.be/mG_g33sm3m8 ; ▶ 3-2⑦ 高速與加速|https://youtu.be/XRibAljFHiI', edcafeR4: '', form4: '',   // 第 4 節 化油器與六大油路
  video5: '', edcafeR5: '', form5: '',   // 第 5 節 噴射系統優點與分類
  video6: '', edcafeR6: '', form6: '',   // 第 6 節 空氣計量與噴射正時
  video7: '', edcafeR7: '', form7: '',   // 第 7 節 空氣系統與燃料系統
  video8: '', edcafeR8: '', form8: '',   // 第 8 節 感知器（一）拼圖法
  video9: '', edcafeR9: '', form9: '',   // 第 9 節 含氧爆震與開關信號
  video10: '', edcafeR10: '', form10: '',   // 第 10 節 電腦控制與單元統整
};
/* 自動載入補課包內建 6 題測驗模組（免修改 R1～R10.html，全部自動生效！） */
if (typeof document !== 'undefined' && document.querySelector('.step[data-k="2"]')) {
  ['firebase-config.js', 'score.js', 'remedial_quiz_data.js'].forEach(function (src) {
    var s = document.createElement('script'); s.src = src; document.head.appendChild(s);
  });
}