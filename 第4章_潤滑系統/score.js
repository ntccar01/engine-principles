/* 成績上傳模組（學生端，第7章版）：匿名登入 → 寫入 Firestore「engine_scores」；監聽「engine_live」全班同步挑戰。
   有登入「班級＋座號」（student.js）時，成績帶 seat 欄位，標題也加「｜座號N」（資料庫不收 seat 欄位時仍可辨識）。
   斷線時先存在本機「待上傳」清單，下次開任一頁自動補送。未設定 firebase-config.js 時回傳 {ok:false}。 */
(function () {
  const B = 'https://www.gstatic.com/firebasejs/10.12.2/';
  let ready = null;
  const timeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
  const LS = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  function init() {
    if (ready) return ready;
    const cfg = window.FIREBASE_CONFIG;
    if (!cfg || !cfg.apiKey) return Promise.reject(new Error('no-config'));
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
  async function write(rec) {
    const { F, auth, db } = await init();
    const doc = {
      lesson: String(rec.lesson).slice(0, 20), title: String(rec.title || '') + (rec.seat ? `｜座號${rec.seat}` : ''), cls: String(rec.cls).slice(0, 20), grp: Math.round(+rec.grp) || 0,
      score: Math.round(+rec.score), total: Math.round(+rec.total), pct: Math.round(+rec.pct), sec: Math.min(7199, Math.round(+rec.sec)),
      detail: rec.detail || [], at: rec.at, uid: auth.currentUser.uid, ts: F.serverTimestamp()
    };
    const add = d => timeout(F.addDoc(F.collection(db, 'engine_scores'), d), 15000);
    if (rec.seat && LS.get('seat_field', 1)) {
      try { await add(Object.assign({ seat: Math.round(+rec.seat) }, doc)); return; }
      catch (e) { if (code(e) !== 'permission-denied') throw e; LS.set('seat_field', 0); }  // 資料庫規則不收 seat 欄位 → 只用標題裡的座號
    }
    try { await add(doc); }
    catch (e) {  // 組別沒填（0）而資料庫規則要求組別 1 以上 → 以第 1 組送出並在標題註明「未分組」，成績總表會還原成未分組
      if (code(e) !== 'permission-denied' || doc.grp) throw e;
      await add(Object.assign({}, doc, { grp: 1, title: doc.title + '｜未分組' }));
    }
  }
  function queue(rec) { const q = LS.get('score_pending', []); if (!q.some(x => x.at === rec.at && x.lesson === rec.lesson)) q.push(rec); LS.set('score_pending', q.slice(-60)); }
  let flushing = false;
  async function flush() {
    if (flushing) return; const q = LS.get('score_pending', []); if (!q.length) return; flushing = true;
    const left = [];
    for (const r of q) { try { await write(r); } catch (e) { if (code(e) !== 'permission-denied') left.push(r); } }
    LS.set('score_pending', left); flushing = false;
  }
  window.Score = {
    submit(rec, opt) {
      const st = window.Student && Student.get();
      if (st && !rec.seat && (!rec.cls || rec.cls === st.cls)) rec.seat = st.seat;
      if (!(opt && opt.noLocal)) keepLocal(rec);
      return write(rec).then(() => ({ ok: true }), e => {
        const c = code(e); console.warn('成績未上傳：', c);
        if (c !== 'no-config' && c !== 'permission-denied') { queue(rec); return { ok: false, err: c, queued: true }; }
        return { ok: false, err: c };
      });
    },
    pending: () => LS.get('score_pending', []).length,
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
