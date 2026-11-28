/* 成績上傳模組（學生端，第7章版）：匿名登入 → 寫入 Firestore「engine_scores」；監聽「engine_live」全班同步挑戰。
   有登入「班級＋座號」（student.js）時，成績帶 seat 欄位，標題也加「｜座號N」（資料庫不收 seat 欄位時仍可辨識）。
   斷線時先存在本機「待上傳」清單，下次開任一頁自動補送。未設定 firebase-config.js 時回傳 {ok:false}。 */
(function () {
  const B = 'https://www.gstatic.com/firebasejs/10.12.2/';
  let ready = null;
  const timeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
  const LS = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  /* 防護：原作者（林老師）的 Firebase 只收「本網站＋本人班級」的成績。
     別的老師直接用本網址，或複製網站卻沒換 firebase-config.js 時，成績只存在學生裝置、不上傳。 */
  const OWN_PROJECT = 'classtool1141019', OWN_HOSTS = ['ntccar01.github.io', 'localhost', '127.0.0.1'];
  const fail = c => Object.assign(new Error(c), { code: c });
  function guard(cls) {
    const cfg = window.FIREBASE_CONFIG || {};
    if (cfg.projectId !== OWN_PROJECT) return '';
    if (!OWN_HOSTS.includes(location.hostname)) return 'foreign-site';
    if (cls !== undefined && ![...(window.CLASS_LIST || []), '教師測試'].includes(String(cls).trim())) return 'class-not-allowed';
    return '';
  }
  /* 班級通行碼：林老師的 Firebase 規則要求每筆成績帶正確的 k。碼本身不寫在網站程式裡，只在 Firebase 規則中檢查。 */
  const needKey = () => (window.FIREBASE_CONFIG || {}).projectId === OWN_PROJECT;
  const KEY = 'stu_key';
  const getKey = () => { try { return (localStorage.getItem(KEY) || '').trim(); } catch (e) { return ''; } };
  const setKey = v => { try { v ? localStorage.setItem(KEY, String(v).trim().toLowerCase()) : localStorage.removeItem(KEY); } catch (e) { } };
  function askKey(msg) {
    const v = prompt((msg ? msg + '\n\n' : '') + '請輸入「班級通行碼」（老師上課會告訴你）：', '');
    if (v && v.trim()) setKey(v); return getKey();
  }
  const NOTE = {
    'foreign-site': '⚠ 這個網站仍使用原作者的 Firebase 設定，成績不會上傳。請老師把 firebase-config.js 換成自己的設定（說明：https://ntccar01.github.io/engine-principles/share/selfhost.html）。',
    'class-not-allowed': 'ℹ 這個網址只記錄林老師任教班級的成績，本次成績只存在這台裝置。想讓學生計分，請老師參考分享頁的「教師自建版」。',
    'no-key': '🔑 還沒輸入班級通行碼，成績先存在這台裝置；輸入正確通行碼後，下次作答會自動補送。',
    'bad-key': '🔑 班級通行碼不對，成績先存在這台裝置。請問老師正確的通行碼，下次作答時重新輸入就會自動補送。'
  };
  function notify(c) {
    if (!NOTE[c]) return; if (!/key/.test(c)) { if (notify.shown) return; notify.shown = 1; }
    try {
      const d = document.createElement('div'); d.textContent = NOTE[c];
      d.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:99999;max-width:min(92vw,760px);background:#2a1d05;color:#ffe2a8;border:1px solid #ffb020;border-radius:12px;padding:12px 16px;font-size:16px;line-height:1.6;box-shadow:0 6px 20px #0008;cursor:pointer';
      d.onclick = () => d.remove(); document.body.append(d); setTimeout(() => d.remove(), 12000);
    } catch (e) { }
  }
  function init() {
    if (ready) return ready;
    const cfg = window.FIREBASE_CONFIG;
    if (!cfg || !cfg.apiKey) return Promise.reject(new Error('no-config'));
    const g = guard(); if (g) return Promise.reject(fail(g));
    ready = timeout(Promise.all([import(B + 'firebase-app.js'), import(B + 'firebase-auth.js'), import(B + 'firebase-firestore.js')]).then(async ([A, U, F]) => {
      const app = A.getApps().length ? A.getApp() : A.initializeApp(cfg), auth = U.getAuth(app);
      await new Promise(r => { const u = U.onAuthStateChanged(auth, () => { u(); r(); }); }); if (!auth.currentUser) await U.signInAnonymously(auth);
      return { F, auth, db: F.getFirestore(app) };
    }), 15000);
    ready.catch(() => { ready = null; });
    return ready;
  }
  function keepLocal(rec) { const a = LS.get('act_history', []); a.push(rec); LS.set('act_history', a.slice(-80)); }
  const code = e => e && (e.code || e.message);
  async function write(rec, ask) {
    const g = guard(rec.cls); if (g) throw fail(g);
    const k = needKey() ? (getKey() || (ask ? askKey() : '')) : '';
    if (needKey() && !k) throw fail('no-key');
    const { F, auth, db } = await init();
    const doc = {
      lesson: String(rec.lesson).slice(0, 20), title: String(rec.title || '') + (rec.seat ? `｜座號${rec.seat}` : ''), cls: String(rec.cls).slice(0, 20), grp: Math.round(+rec.grp) || 0,
      score: Math.round(+rec.score), total: Math.round(+rec.total), pct: Math.round(+rec.pct), sec: Math.min(7199, Math.round(+rec.sec)),
      detail: rec.detail || [], at: rec.at, uid: auth.currentUser.uid, ts: F.serverTimestamp()
    };
    if (k) doc.k = k;
    const add = d => timeout(F.addDoc(F.collection(db, 'engine_scores'), d), 15000);
    if (rec.seat && LS.get('seat_field', 1)) {
      try { await add(Object.assign({ seat: Math.round(+rec.seat) }, doc)); return; }
      catch (e) { if (code(e) !== 'permission-denied') throw e; LS.set('seat_field', 0); }  // 資料庫規則不收 seat 欄位 → 只用標題裡的座號
    }
    try {
      try { await add(doc); }
      catch (e) {  // 組別沒填（0）而資料庫規則要求組別 1 以上 → 以第 1 組送出並在標題註明「未分組」，成績總表會還原成未分組
        if (code(e) !== 'permission-denied' || doc.grp) throw e;
        await add(Object.assign({}, doc, { grp: 1, title: doc.title + '｜未分組' }));
      }
    } catch (e) {  // 帶了通行碼仍被拒 → 通行碼錯（清掉，下次重問）
      if (k && code(e) === 'permission-denied') { setKey(''); throw fail('bad-key'); }
      throw e;
    }
  }
  function queue(rec) { const q = LS.get('score_pending', []); if (!q.some(x => x.at === rec.at && x.lesson === rec.lesson)) q.push(rec); LS.set('score_pending', q.slice(-60)); }
  let flushing = false;
  async function flush() {
    if (flushing) return; const q = LS.get('score_pending', []); if (!q.length) return; flushing = true;
    const left = [];
    for (const r of q) { try { await write(r); } catch (e) { if (!['permission-denied', 'foreign-site', 'class-not-allowed'].includes(code(e))) left.push(r); } }  // no-key／bad-key 留著，輸入正確通行碼後補送
    LS.set('score_pending', left); flushing = false;
  }
  window.Score = {
    submit(rec, opt) {
      const st = window.Student && Student.get();
      if (st && !rec.seat && (!rec.cls || rec.cls === st.cls)) rec.seat = st.seat;
      if (!(opt && opt.noLocal)) keepLocal(rec);
      return write(rec, true).catch(e => {  // 通行碼錯：當場再問一次
        if (code(e) !== 'bad-key' || !askKey('通行碼不對。')) throw e;
        return write(rec);
      }).then(() => { flush().catch(() => { }); return { ok: true }; }, e => {
        const c = code(e); console.warn('成績未上傳：', c);
        if (c === 'no-key' || c === 'bad-key') { queue(rec); notify(c); return { ok: false, err: c, queued: true }; }
        if (NOTE[c]) { notify(c); return { ok: false, err: c }; }
        if (c !== 'no-config' && c !== 'permission-denied') { queue(rec); return { ok: false, err: c, queued: true }; }
        return { ok: false, err: c };
      });
    },
    pending: () => LS.get('score_pending', []).length,
    needKey, setKey, hasKey: () => !!getKey(),
    /* 指定補課名單：存在 engine_live/assign_Ch7_<班級>（學生可讀、教師可寫）
       格式① {state:'assign', cls, goAt:0, list:{"1":[3,12],...}}；格式②（規則不收 list 時）cls 欄寫「班級|1:3,12;2:5」 */
    assignId: cls => 'assign_Ch7_' + cls,
    parseAssign(d) {
      if (!d) return {};
      if (d.list && typeof d.list === 'object') return d.list;
      const m = String(d.cls || '').split('|')[1]; const out = {};
      if (m) m.split(';').forEach(p => { const [n, seats] = p.split(':'); if (n && seats) out[n] = seats.split(',').map(Number).filter(Boolean); });
      return out;
    },
    getAssign(cls) {
      return init().then(({ F, db }) => timeout(F.getDoc(F.doc(db, 'engine_live', Score.assignId(cls))), 10000))
        .then(s => Score.parseAssign(s.exists() ? s.data() : null)).catch(() => ({}));
    },
    flush,
    /* 監聽老師的全班同步挑戰：cb({state:'ready'|'go'|'off', cls, goAt}) */
    watchLive(lesson, cb) {
      init().then(({ F, db }) => F.onSnapshot(F.doc(db, 'engine_live', lesson), s => cb(s.exists() ? s.data() : null), () => { })).catch(() => { });
    }
  };
  setTimeout(() => { if (LS.get('score_pending', []).length) flush().catch(() => { }); }, 1500);
  window.addEventListener('online', () => flush().catch(() => { }));
})();
