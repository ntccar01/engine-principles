/* 成績上傳模組（學生端）：匿名登入 → 寫入 Firestore「engine_scores」；監聽「engine_live」全班同步挑戰。
   未設定 firebase-config.js、離線或被擋時，回傳 {ok:false}，網頁照常運作。 */
(function () {
  const B = 'https://www.gstatic.com/firebasejs/10.12.2/';
  let ready = null;
  const timeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
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
  function keepLocal(rec) { try { const k = 'act_history', a = JSON.parse(localStorage.getItem(k) || '[]'); a.push(rec); localStorage.setItem(k, JSON.stringify(a.slice(-50))); } catch (e) { } }
  window.Score = {
    submit(rec) {
      keepLocal(rec);
      return init().then(({ F, auth, db }) => timeout(F.addDoc(F.collection(db, 'engine_scores'), {
        lesson: String(rec.lesson).slice(0, 20), title: String(rec.title || ''), cls: String(rec.cls).slice(0, 20), grp: Math.round(+rec.grp),
        score: Math.round(+rec.score), total: Math.round(+rec.total), pct: Math.round(+rec.pct), sec: Math.min(7199, Math.round(+rec.sec)),
        detail: rec.detail || [], at: rec.at, uid: auth.currentUser.uid, ts: F.serverTimestamp()
      }), 15000)).then(() => ({ ok: true })).catch(e => { console.warn('成績未上傳：', e && (e.code || e.message)); return { ok: false, err: e && (e.code || e.message) }; });
    },
    /* 監聽老師的全班同步挑戰：cb({state:'ready'|'go'|'off', cls, goAt}) */
    watchLive(lesson, cb) {
      init().then(({ F, db }) => F.onSnapshot(F.doc(db, 'engine_live', lesson), s => cb(s.exists() ? s.data() : null), () => { })).catch(() => { });
    }
  };
})();
