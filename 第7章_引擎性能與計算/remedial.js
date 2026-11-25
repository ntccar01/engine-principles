window.setupRemedial=function(n){
  const key='ch7review'+n,checks=[...document.querySelectorAll('.step input[type=checkbox]')];
  let saved=[];try{saved=JSON.parse(localStorage.getItem(key)||'[]');}catch(e){}
  function update(){const done=checks.filter(c=>c.checked).length;document.getElementById('progress').style.width=done/4*100+'%';document.getElementById('progressText').textContent=`已完成 ${done} / 4 步`;try{localStorage.setItem(key,JSON.stringify(checks.map(c=>c.checked)));}catch(e){}}
  checks.forEach((c,i)=>{c.checked=!!saved[i];c.addEventListener('change',update);});update();
  const L=window.LINKS||{},v=document.getElementById('video'),url=L['video'+n];
  const list=Array.isArray(url)?url:url?[url]:[];
  function show(raw){const u=typeof raw==='string'?raw:raw.url||'',m=u.match(/(?:youtu\.be\/|[?&]v=|\/embed\/)([\w-]{11})/);v.querySelectorAll('iframe,.videoerror').forEach(x=>x.remove());if(m){const f=document.createElement('iframe');f.src='https://www.youtube-nocookie.com/embed/'+m[1];f.title='本節補課影片';f.style='width:100%;aspect-ratio:16/9;border:0';f.allowFullscreen=true;v.append(f);}else{const p=document.createElement('p');p.className='videoerror';p.textContent='影片網址尚無法嵌入，請確認 links.js 的YouTube網址。';v.append(p);}}
  if(list.length){list.forEach((u,k)=>{const b=document.createElement('button');b.textContent=typeof u==='object'?(u.title||'影片'+(k+1)):'影片'+(k+1);b.onclick=()=>show(u);v.append(b);});show(list[0]);}
  else v.textContent='補課影片尚未設定。先閱讀下方自編講義，再做第二至第四步；影片完成後可由老師補入網址。';
  const form=[...document.querySelectorAll('a')].find(a=>a.getAttribute('href')===`Q${n}_隨堂測驗.html`);if(form&&L['form'+n])form.href=L['form'+n];
};
