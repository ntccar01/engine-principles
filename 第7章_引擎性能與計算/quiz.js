/* 第7章測驗（隨堂 Ch7-F1～F5、補課 Ch7-R1～R5、單元七 Unit7）
   作答前須登入「班級＋座號」（student.js）；成績以班級＋座號上傳，供學期評量。
   隨堂／補課：6 題各 1 分，首次答對才計分。單元七：20 題亂序，每題 5 分，一次交卷。
   同一位學生可重做（練習），教師成績總表可選「首次／最高／最後」計分。 */
(function () {
  const el = document.querySelector('[data-quiz]'); if (!el) return;
  const code = el.dataset.quiz, unit = code === 'Unit7';
  const source = (window.CH7_QUIZZES || {})[code] || (window.REMEDIAL_QUIZ || {})[code];
  if (!source) throw Error('Unknown quiz ' + code);
  const shuffle = a => a.map(x => ({ x, r: Math.random() })).sort((a, b) => a.r - b.r).map(o => o.x);
  const text = (tag, s, cl) => { const n = document.createElement(tag); n.textContent = s; if (cl) n.className = cl; return n; };
  /* 單元七題號對應節次：U7-1～5 第1節、6～9 第2節、10～13 第3節、14～18 第4節、19～20 第5節 */
  const SEC = { 1: '7-1 基本單位與換算', 2: '7-2 排氣量與壓縮比', 3: '7-3 馬力與扭力', 4: '7-4＋7-5 引擎效率與油耗率', 5: '7-6 性能因素與計算統整' };
  const secOf = id => { const k = +String(id).replace(/^U7-/, ''); return k <= 5 ? 1 : k <= 9 ? 2 : k <= 13 ? 3 : k <= 18 ? 4 : 5; };
  window.CH7_SECOF = secOf; window.CH7_SEC = SEC;
  const recKey = s => `ch7rec_${code}_${s.cls}_${s.seat}`;
  const getRec = s => { try { return JSON.parse(localStorage.getItem(recKey(s)) || 'null'); } catch (e) { return null; } };
  const area = document.createElement('div');

  function gate() {
    el.replaceChildren(); const s = window.Student && Student.get();
    if (!s) { const box = document.createElement('div'); el.append(box); Student.form(box, gate, { title: '作答前請先登入：班級＋座號' }); return; }
    const head = document.createElement('div'); head.className = 'stuid';
    head.append(text('span', '作答者：')); const b = text('b', Student.label(s)); head.append(b);
    const sw = text('button', '不是我，換人'); sw.onclick = () => { Student.clear(); gate(); }; head.append(sw);
    el.append(head);
    const prev = getRec(s);
    if (prev) el.append(text('p', `你已在 ${new Date(prev.first.at).toLocaleString('zh-TW')} 完成過：首次 ${prev.first.score} / ${prev.first.total}（共作答 ${prev.n} 次）。再做一次可以練習，老師可選擇採計首次或最高分。`, 'mut'));
    el.append(text('p', unit ? '20 題，每題 5 分，全部作答後一次交卷。' : '6 題，每題 1 分。首次答對才計分；答錯看提示，改對後繼續。'));
    const go = text('button', prev ? '再做一次' : '開始作答', 'pri'); go.onclick = () => { head.querySelector('button').disabled = true; go.remove(); start(s); };
    el.append(go, area); area.replaceChildren();
  }

  function start(who) {
    const qs = unit ? shuffle(source) : source.slice();
    let qi = 0, score = 0, tried = false, started = Date.now(), finished = false, detail = [], answers = {};
    function finish() {
      if (finished) return; finished = true; const total = unit ? 100 : qs.length;
      const rec = { lesson: code, title: document.title, cls: who.cls, grp: who.grp, seat: who.seat, score, total, pct: Math.round(score / total * 100), sec: Math.round((Date.now() - started) / 1000), detail, at: new Date().toISOString() };
      area.replaceChildren(text('h2', `${Student.label(who)}　完成！${score} / ${total}（${rec.pct}%）`));
      const report = document.createElement('div'); report.className = 'card'; detail.forEach(d => report.append(text('p', `${d.id}：${d.got} / ${d.of}`))); area.append(report);
      if (unit) {
        const sec = {}; qs.forEach(q => { const n = secOf(q.id), o = sec[n] = sec[n] || { got: 0, of: 0 }; o.of++; if (answers[q.id] === q.ans) o.got++; });
        const box = document.createElement('div'); box.className = 'card'; box.append(text('h3', '各節答對情形（錯比較多的節，回去看那一節的 V 動畫和重點）'));
        Object.keys(sec).sort().forEach(n => { const o = sec[n]; box.append(text('p', `第${n}節（全課程第${33 + +n}節）${SEC[n]}：答對 ${o.got} / ${o.of} 題${o.got < o.of ? '　← 建議複習' : '　✓'}`, o.got < o.of ? 'bad' : 'ok')); });
        area.append(box);
        qs.slice().sort((x, y) => +x.id.slice(3) - +y.id.slice(3)).forEach(q => { const ok = answers[q.id] === q.ans, a = document.createElement('article');
          a.append(text('h3', `${ok ? '✔' : '✘'} ${q.id}（第${secOf(q.id)}節｜${q.objective || SEC[secOf(q.id)]}）`), text('p', q.q), text('p', `你的答案：${q.opts[answers[q.id]]}；正解：${q.opts[q.ans]}`, ok ? 'ok' : 'bad'), text('p', q.ex)); area.append(a); });
      }
      const status = text('p', '正在送出成績…'); area.prepend(status);
      try { const p = getRec(who); localStorage.setItem(recKey(who), JSON.stringify({ first: p ? p.first : rec, best: p && p.best.score >= rec.score ? p.best : rec, last: rec, n: (p ? p.n : 0) + 1 })); localStorage.setItem('ch7_' + code, JSON.stringify(rec)); } catch (e) { }
      Score.submit(rec).then(r => {
        status.className = r && r.ok ? 'ok' : 'bad';
        status.textContent = r && r.ok ? `✔ 成績已送出（${Student.label(who)}）` : r && r.queued ? '⚠ 目前連不上網路：成績已存在這台機器，連上網路後開任一頁會自動補送。請先讓老師看這個畫面。' : '⚠ 成績沒有送出，請讓老師看這個畫面。';
      });
      const nav = document.createElement('p'); nav.className = 'actions';
      const again = text('button', '再練習一次'); again.onclick = () => location.reload();
      const next = text('button', '換下一位同學作答', 'pri'); next.onclick = () => { Student.clear(); location.reload(); };
      nav.append(next, again); area.append(nav);
      if (!unit && el.dataset.done) { const cb = document.getElementById(el.dataset.done); if (cb) { cb.checked = true; cb.dispatchEvent(new Event('change')); } }
      window.scrollTo(0, el.offsetTop - 20);
    }
    if (unit) {
      qs.forEach(q => { const a = document.createElement('article'); a.append(text('h3', `${q.id}｜${q.q}`)); q.opts.forEach((o, k) => { const l = document.createElement('label'); l.className = 'qopt'; const r = document.createElement('input'); r.type = 'radio'; r.name = q.id; r.value = k; r.onchange = () => answers[q.id] = k; l.append(r, document.createTextNode(' ' + String.fromCharCode(65 + k) + '. ' + o)); a.append(l); }); area.append(a); });
      const msg = text('p', '請完成全部題目再交卷。'), btn = text('button', '交卷並查看解析', 'pri');
      btn.onclick = () => {
        const left = qs.length - Object.keys(answers).length; if (left) { msg.textContent = `還有 ${left} 題未作答`; return; }
        if (!confirm('確定交卷？交卷後就會送出成績。')) return;
        qs.forEach(q => { const ok = answers[q.id] === q.ans; score += ok ? 5 : 0; detail.push({ id: q.id, round: q.id, got: ok ? 5 : 0, of: 5 }); }); finish();
      };
      area.append(msg, btn);
    } else one();
    function one() {
      const q = qs[qi], id = q.id || `${code.replace('Ch7-', '')}-${qi + 1}`; tried = false;
      area.replaceChildren(text('p', `${qi + 1} / ${qs.length}｜題號 ${id}`, 'tag'), text('h3', q.q));
      const fb = text('p', '', 'feedback');
      q.opts.forEach((o, k) => {
        const b = text('button', `${String.fromCharCode(65 + k)}. ${o}`, 'qopt');
        b.onclick = () => {
          if (k !== q.ans) { tried = true; b.disabled = true; b.classList.add('wrong'); fb.textContent = '再想一下：' + q.ex; return; }
          const got = tried ? 0 : 1; score += got; detail.push({ id, round: id, got, of: 1 });
          area.querySelectorAll('.qopt').forEach(x => x.disabled = true); b.classList.add('correct');
          fb.textContent = (tried ? '改對了，本題不補分。' : '首次答對！') + ' ' + q.ex;
          const next = text('button', qi === qs.length - 1 ? '看結果' : '下一題', 'pri'); next.onclick = () => { qi++; qi === qs.length ? finish() : one(); }; area.append(next);
        };
        area.append(b);
      });
      area.append(fb);
    }
  }
  gate();
})();
