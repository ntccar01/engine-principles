/* 第7章補課頁：登入班級＋座號後才能打勾；進度依學生分開存。
   開啟頁面（已登入）與每次打勾都上傳一筆「補課進度」Ch7-RP{n}（score＝完成步數／4），教師在「補課追蹤」頁查看。
   老師指定補課時，登入的學生會看到提醒。 */
window.setupRemedial = function (n) {
  const checks = [...document.querySelectorAll('.step input[type=checkbox]')], t0 = Date.now();
  const main = document.querySelector('main'), h1 = main.querySelector('h1');
  const bar = document.createElement('div'); bar.className = 'stuid'; bar.style.margin = '8px 0';
  const banner = document.createElement('div'); banner.className = 'note'; banner.hidden = true;
  const gate = document.createElement('div'); gate.className = 'card';
  h1.after(bar, banner, gate);
  const key = s => `ch7review${n}_${s.cls}_${s.seat}`;
  let who = null, sendTimer = null;

  function load() {
    who = Student.get(); let saved = [];
    if (who) { try { saved = JSON.parse(localStorage.getItem(key(who)) || '[]'); } catch (e) { } }
    checks.forEach((c, i) => { c.checked = !!(who && saved[i]); c.disabled = !who; });
    gate.hidden = !!who;
    if (!who) Student.form(gate, () => { load(); send('登入'); }, { title: '補課前先登入：班級＋座號（老師會看到你的補課進度）' });
    update(false); showAssign();
  }
  function update(save = true) {
    const done = checks.filter(c => c.checked).length;
    document.getElementById('progress').style.width = done / 4 * 100 + '%';
    document.getElementById('progressText').textContent = who ? `${Student.label(who)}：已完成 ${done} / 4 步` : '登入後才能記錄進度';
    if (save && who) { try { localStorage.setItem(key(who), JSON.stringify(checks.map(c => c.checked))); } catch (e) { } }
    return done;
  }
  function send(ev) {
    if (!who || !window.Score) return;
    const done = checks.filter(c => c.checked).length;
    Score.submit({ lesson: 'Ch7-RP' + n, title: `補課進度第${n}節（${ev}）`, cls: who.cls, grp: who.grp, seat: who.seat, score: done, total: 4, pct: Math.round(done / 4 * 100),
      sec: Math.round((Date.now() - t0) / 1000), detail: checks.map((c, i) => ({ id: '步驟' + (i + 1), round: '步驟' + (i + 1), got: c.checked ? 1 : 0, of: 1 })), at: new Date().toISOString() }, { noLocal: true });
  }
  function showAssign() {
    banner.hidden = true; if (!who || !window.Score || !Score.getAssign) return;
    Score.getAssign(who.cls).then(a => {
      const mine = (a[n] || []).includes(who.seat);
      if (mine) { banner.hidden = false; banner.innerHTML = `<b>📌 老師指定你完成這份補課</b><p>請照下面 4 個步驟做完，每做完一步就打勾，老師會看到你的進度。</p>`; }
    });
  }
  checks.forEach(c => c.addEventListener('change', () => { update(); clearTimeout(sendTimer); sendTimer = setTimeout(() => send('打勾'), 1200); }));
  Student.badge(bar); Student.onChange(() => load());
  load(); if (who) send('開啟');

  const L = window.LINKS || {}, v = document.getElementById('video'), url = L['video' + n];
  const list = Array.isArray(url) ? url : url ? [url] : [];
  function show(raw) { const u = typeof raw === 'string' ? raw : raw.url || '', m = u.match(/(?:youtu\.be\/|[?&]v=|\/embed\/)([\w-]{11})/); v.querySelectorAll('iframe,.videoerror').forEach(x => x.remove()); if (m) { const f = document.createElement('iframe'); f.src = 'https://www.youtube-nocookie.com/embed/' + m[1]; f.title = '本節補課影片'; f.style = 'width:100%;aspect-ratio:16/9;border:0'; f.allowFullscreen = true; v.append(f); } else { const p = document.createElement('p'); p.className = 'videoerror'; p.textContent = '影片網址尚無法嵌入，請確認 links.js 的YouTube網址。'; v.append(p); } }
  if (list.length) { list.forEach((u, k) => { const b = document.createElement('button'); b.textContent = typeof u === 'object' ? (u.title || '影片' + (k + 1)) : '影片' + (k + 1); b.onclick = () => show(u); v.append(b); }); show(list[0]); }
  else v.textContent = '補課影片尚未設定。先閱讀下方自編講義，再做第二至第四步；影片完成後可由老師補入網址。';
};
