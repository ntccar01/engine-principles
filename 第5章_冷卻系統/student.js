/* 學生登入（班級＋座號＋組別）：只存在這台平板／電腦的瀏覽器裡，不收集姓名。
   共用平板時，換人作答前按「換人」。互學挑戰的班級、組別也會自動帶入。 */
(function () {
  const K = { cls: 'stu_cls', seat: 'stu_seat', grp: 'stu_grp' };
  const TEST = '教師測試';
  const CLS = () => (window.CLASS_LIST && window.CLASS_LIST.length) ? window.CLASS_LIST : ['汽車一甲', '汽車一乙'];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const subs = [];
  function get() {
    try {
      const cls = localStorage.getItem(K.cls), seat = +localStorage.getItem(K.seat), grp = +localStorage.getItem(K.grp);
      return cls && seat ? { cls, seat, grp: grp || 0 } : null;
    } catch (e) { return null; }
  }
  function set(o) {
    try {
      localStorage.setItem(K.cls, o.cls); localStorage.setItem(K.seat, String(o.seat)); localStorage.setItem(K.grp, String(o.grp || ''));
      localStorage.setItem('act_cls', o.cls); if (o.grp) localStorage.setItem('act_grp', String(o.grp)); else localStorage.removeItem('act_grp');
    } catch (e) { }
    subs.forEach(f => f(get()));
  }
  function clear() { try { Object.values(K).forEach(k => localStorage.removeItem(k)); } catch (e) { } subs.forEach(f => f(null)); }
  const label = s => s ? `${s.cls === TEST ? '🧪 ' : ''}${s.cls} ${s.seat} 號${s.grp ? `（第 ${s.grp} 組）` : ''}` : '尚未登入';

  /* 登入表單：放進 box，完成後呼叫 done(student) */
  function form(box, done, opt = {}) {
    const cur = get() || {}, list = CLS(), manual = cur.cls && cur.cls !== TEST && !list.includes(cur.cls);
    box.innerHTML = `<div class="stuform"><h3>${esc(opt.title || '先登入：班級＋座號')}</h3>
      <p class="mut">成績會以「班級＋座號」記錄，作為學期評量。共用平板時，每位同學作答前都要換成自己的座號。</p>
      <div class="sturow"><label>班級 <select class="s_cls">${list.map(c => `<option ${c === cur.cls ? 'selected' : ''}>${esc(c)}</option>`).join('')}<option value="__m" ${manual ? 'selected' : ''}>✏️ 手動輸入</option><option value="${TEST}" ${cur.cls === TEST ? 'selected' : ''}>🧪 教師測試</option></select></label>
      <input class="s_man" maxlength="20" placeholder="輸入班級" value="${manual ? esc(cur.cls) : ''}" ${manual ? '' : 'hidden'}>
      <label>座號 <input class="s_seat" type="number" inputmode="numeric" min="1" max="60" value="${opt.keepSeat && cur.seat ? cur.seat : ''}" placeholder="1～60" style="width:6em"></label>
      <label>組別 <select class="s_grp"><option value="0">不填</option>${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}" ${i + 1 === cur.grp ? 'selected' : ''}>${i + 1}</option>`).join('')}</select></label><span class="mut">（組別可不填）</span>
      <button class="pri s_ok">確定</button></div><p class="bad s_msg"></p></div>`;
    const q = s => box.querySelector(s), sel = q('.s_cls'), man = q('.s_man');
    sel.onchange = () => { man.hidden = sel.value !== '__m'; };
    q('.s_seat').onkeydown = e => { if (e.key === 'Enter') q('.s_ok').click(); };
    q('.s_ok').onclick = () => {
      const cls = (sel.value === '__m' ? man.value.trim() : sel.value), seat = +q('.s_seat').value, grp = +q('.s_grp').value;
      if (!cls) return q('.s_msg').textContent = '請選擇或輸入班級。';
      if (!Number.isInteger(seat) || seat < 1 || seat > 60) return q('.s_msg').textContent = '請輸入正確的座號（1～60）。';
      if (!confirm(cls === TEST ? `教師測試模式\n\n成績會記在「${TEST}」班級 ${seat} 號，不會混進學生成績；可在成績總表一鍵清除。` : `確認是本人？\n\n${cls}　${seat} 號　${grp ? `第 ${grp} 組` : '組別未填'}`)) return;
      const s = { cls, seat, grp }; set(s); done && done(s);
    };
    if (!opt.keepSeat) setTimeout(() => { try { q('.s_seat').focus(); } catch (e) { } }, 50);
  }

  /* 彈出式登入視窗 */
  function dialog(done) {
    const ov = document.createElement('div'); ov.className = 'stuov';
    ov.innerHTML = '<div class="stubox"><button class="stux" aria-label="關閉">✕</button><div class="stuin"></div></div>';
    document.body.append(ov);
    const close = () => ov.remove(); ov.querySelector('.stux').onclick = close; ov.onclick = e => { if (e.target === ov) close(); };
    form(ov.querySelector('.stuin'), s => { close(); done && done(s); });
  }

  /* 右上角身分小條：顯示目前作答者＋換人 */
  function badge(box) {
    const draw = s => {
      box.innerHTML = s ? `<span${s.cls === TEST ? ' style="color:#ffb020"' : ''}>👤 <b>${esc(label(s))}</b>${s.cls === TEST ? '（測試中）' : ''}</span> <button class="stusw">換人</button>`
        : `<span class="bad">👤 尚未登入</span> <button class="pri stusw">登入班級座號</button>`;
      box.querySelector('.stusw').onclick = () => dialog();
    };
    draw(get()); subs.push(draw);
  }

  const css = document.createElement('style');
  css.textContent = `.stuform h3{margin:0 0 6px}.sturow{display:flex;flex-wrap:wrap;gap:10px;align-items:center}.sturow label{display:flex;gap:6px;align-items:center}
.stuov{position:fixed;inset:0;background:rgba(0,0,0,.6);display:grid;place-items:center;z-index:9999}
.stubox{position:relative;background:#16223a;color:#e8eef9;border:1px solid #2c3f63;border-radius:14px;padding:24px;max-width:680px;width:92%}
.stux{position:absolute;right:10px;top:10px}.stuid{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.stubox button,.stubox select,.stubox input,.stuid button{font:inherit;font-size:17px;border-radius:8px;padding:8px 12px;border:1px solid #2c3f63;background:#1d2c4a;color:#e8eef9;cursor:pointer}
.stubox .pri,.stuid .pri{background:#ffb020;color:#171100;font-weight:bold;border:none}.stubox .bad,.stuid .bad{color:#ff8686}.stubox .mut{color:#9fb0cf;font-size:16px}`;
  document.head.append(css);
  window.Student = { get, set, clear, form, dialog, badge, label, TEST, onChange: f => subs.push(f) };
})();
