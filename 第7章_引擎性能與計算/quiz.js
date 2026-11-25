/* Six-question practice: keep original question IDs/options; first attempt only.
   Unit assessment: one submission, 20 shuffled questions × 5 points. */
(function(){
  const el=document.querySelector('[data-quiz]');if(!el)return;
  const code=el.dataset.quiz,unit=code==='Unit7';
  const source=window.CH7_QUIZZES[code]||window.REMEDIAL_QUIZ[code];
  if(!source)throw Error('Unknown quiz '+code);
  const shuffle=a=>a.map(x=>({x,r:Math.random()})).sort((a,b)=>a.r-b.r).map(o=>o.x);
  const qs=unit?shuffle(source):source.slice();
  let qi=0,score=0,tried=false,started=Date.now(),finished=false,detail=[],answers={};
  const text=(tag,s,cl)=>{const n=document.createElement(tag);n.textContent=s;if(cl)n.className=cl;return n;};
  function who(){const c=document.createElement('div');c.className='actions';c.innerHTML='<label>班級 <select id="cls"><option>汽車一甲</option><option>汽車一乙</option><option value="manual">手動輸入</option></select></label><input id="manual" hidden aria-label="手動班級" placeholder="班級" maxlength="20"><label>組別 <select id="grp">'+Array.from({length:12},(_,i)=>`<option>${i+1}</option>`).join('')+'</select></label>';
    const sel=c.querySelector('#cls'),inp=c.querySelector('#manual');sel.onchange=()=>inp.hidden=sel.value!=='manual';
    try{const cls=localStorage.getItem('act_cls');if(['汽車一甲','汽車一乙'].includes(cls))sel.value=cls;else if(cls){sel.value='manual';inp.hidden=false;inp.value=cls;}c.querySelector('#grp').value=localStorage.getItem('act_grp')||'1';}catch(e){}
    return c;
  }
  function identities(){const c=el.querySelector('#cls');return {cls:(c.value==='manual'?el.querySelector('#manual').value.trim():c.value)||'未填班級',grp:+el.querySelector('#grp').value};}
  el.append(text('p',unit?'20 題，每題 5 分，全部作答後一次交卷。':'6 題，每題 1 分。首次答對才計分；答錯看提示，改對後繼續。'));
  el.append(who());const area=document.createElement('div');el.append(area);
  function finish(){if(finished)return;finished=true;const total=unit?100:qs.length;const rec={lesson:code,title:document.title, ...identities(),score,total,pct:Math.round(score/total*100),sec:Math.round((Date.now()-started)/1000),detail,at:new Date().toISOString()};
    area.replaceChildren(text('h2',`完成！${score} / ${total}（${rec.pct}%）`));
    const report=document.createElement('div');report.className='card';detail.forEach(d=>report.append(text('p',`${d.id}：${d.got} / ${d.of}`)));area.append(report);
    if(unit)qs.forEach(q=>{const a=document.createElement('article');a.append(text('h3',`${q.id}｜${q.q}`),text('p',`你的答案：${q.opts[answers[q.id]]}；正解：${q.opts[q.ans]}`),text('p',q.ex));area.append(a);});
    const status=text('p','結果已保存在本機；正在送出班級成績…');area.prepend(status);
    try{localStorage.setItem('act_cls',rec.cls);localStorage.setItem('act_grp',String(rec.grp));localStorage.setItem('ch7_'+code,JSON.stringify(rec));}catch(e){}
    (window.Score?Score.submit(rec):Promise.resolve({ok:false})).then(r=>status.textContent=r?.ok?'✔ 已送出班級成績':'離線結果已保留，請讓老師查看此畫面。').catch(()=>status.textContent='上傳失敗；本機結果仍保留，請讓老師查看。');
    const again=text('button','重新練習');again.onclick=()=>location.reload();area.append(again);if(!unit&&el.dataset.done){const cb=document.getElementById(el.dataset.done);if(cb){cb.checked=true;cb.dispatchEvent(new Event('change'));}}
  }
  if(unit){
    qs.forEach(q=>{const a=document.createElement('article');a.append(text('h3',`${q.id}｜${q.q}`));q.opts.forEach((o,k)=>{const l=document.createElement('label');l.className='qopt';const r=document.createElement('input');r.type='radio';r.name=q.id;r.value=k;r.onchange=()=>answers[q.id]=k;l.append(r,document.createTextNode(' '+String.fromCharCode(65+k)+'. '+o));a.append(l);});area.append(a);});
    const msg=text('p','請完成全部題目再交卷。'),btn=text('button','交卷並查看解析','pri');btn.onclick=()=>{if(Object.keys(answers).length!==qs.length){msg.textContent=`還有 ${qs.length-Object.keys(answers).length} 題未作答`;return;}qs.forEach(q=>{const ok=answers[q.id]===q.ans;score+=ok?5:0;detail.push({id:q.id,round:q.id,got:ok?5:0,of:5});});finish();window.scrollTo(0,0);};area.append(msg,btn);
  }else functionQ();
  function functionQ(){
    const q=qs[qi],id=q.id||`${code.replace('Ch7-','')}-${qi+1}`;tried=false;
    area.replaceChildren(text('p',`${qi+1} / ${qs.length}｜題號 ${id}`,'tag'),text('h3',q.q));
    const fb=text('p','','feedback');q.opts.forEach((o,k)=>{const b=text('button',`${String.fromCharCode(65+k)}. ${o}`,'qopt');b.onclick=()=>{if(k!==q.ans){tried=true;b.disabled=true;b.classList.add('wrong');fb.textContent='再想一下：'+q.ex;return;}const got=tried?0:1;score+=got;detail.push({id,round:id,got,of:1});area.querySelectorAll('.qopt').forEach(x=>x.disabled=true);b.classList.add('correct');fb.textContent=(tried?'改對了，本題不補分。':'首次答對！')+' '+q.ex;const next=text('button',qi===qs.length-1?'看結果':'下一題','pri');next.onclick=()=>{qi++;qi===qs.length?finish():functionQ();};area.append(next);};area.append(b);});area.append(fb);
  }
})();
