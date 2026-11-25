/* Chapter 7: original Canvas diagrams, textbook approximations explicitly labelled.
   Graphs are teaching models, not measured engine data. Slider-crank uses exact rod geometry. */
const CH7Math = Object.freeze({
  speed:(s,n)=>2*(s/1000)*n/60,
  pdv:(d,s)=>3.14*(d/10)**2/4*(s/10),
  cr:(pdv,ccv)=>(pdv+ccv)/ccv,
  bhp:(t,n)=>t*n/716,
  torque:n=>21-0.000001*(n-3500)**2,
  fhp:n=>n*.003,
  sfc:n=>220+0.000014*(n-3900)**2,
  pie:[[25,36,33,6],[35,31,28+2,4+0]] // overridden below by valid range tuple
});
const CH7Heat=[[25,36,33,6],[32,32,30,6]]; // each sums to 100; every value inside p.208 ranges
window.CH7Math=CH7Math;window.CH7Heat=CH7Heat;
const tx=(c,s,x,y,color=C.ink,size=22)=>T(c,s,x,y,{color,size});
function rect7(c,x,y,w,h,color=C.panel){c.fillStyle=color;H.rr(c,x,y,w,h,12);c.fill();}
function line7(c,x,y,a,b,col=C.acc2,lw=3){c.strokeStyle=col;c.lineWidth=lw;c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();}
function wrap7(c,s,x,y,w,col=C.ink,size=21){let row='',yy=y;for(const ch of String(s)){c.font=`${size}px ${FONT}`;if(c.measureText(row+ch).width>w){tx(c,row,x,yy,col,size);yy+=size*1.55;row='';}row+=ch;}if(row)tx(c,row,x,yy,col,size);return yy+size*1.55;}
function card7(c,title,body,x,y,w=410,h=150){rect7(c,x,y,w,h,'#16223a');tx(c,title,x+20,y+30,C.acc,23);wrap7(c,body,x+20,y+70,w-40);}
function base7(c,title,sub='課本教學模型｜換算與公式採教材近似值'){c.fillStyle=C.bg;c.fillRect(0,0,960,540);tx(c,title,35,60,C.acc,28);tx(c,sub,35,510,C.mut,18);}
function bars7(c,items,x=65,y=155,width=800,max=100){items.forEach(([label,v,col],i)=>{const yy=y+i*76;tx(c,label,x,yy-23,C.ink,20);rect7(c,x,yy,width,26,'#253855');rect7(c,x,yy,Math.max(3,width*v/max),26,col||C.acc2);tx(c,String(Math.round(v*100)/100),x+width+12,yy+14,C.acc,22);});}
function controls7(el,S,spec){
  const b=document.createElement('div');b.className='box ch7controls';
  spec.forEach(([key,label,min,max,step,val,unit])=>{
    if(S[key]==null)S[key]=val;
    const d=sliderRow(label,min,max,step,S[key],unit,v=>S[key]=v);
    const input=d.querySelector('input');input.setAttribute('aria-label',label);input.dataset.key=key;b.append(d);
  });el.replaceChildren(b);
}
function choose7(el,S,key,label,items,def=0){if(S[key]==null)S[key]=def;boxEl(el,btnRow(el,label,items.map((v,k)=>[k,v]),S[key],v=>S[key]=+v));}
function graph7(c,kind,n){
  const x=85,y=420,w=735,h=260,xp=r=>x+(r-1000)/5500*w;
  const curves=kind==='sfc'?[['SFC g/(ps·h)',CH7Math.sfc,400,C.acc],['扭力 kg-m（×10）',r=>CH7Math.torque(r)*10,400,C.ok],['BHP ps（×2）',r=>CH7Math.bhp(CH7Math.torque(r),r)*2,400,C.acc2]]:kind==='torque'?[['扭力 kg-m',CH7Math.torque,25,C.ok],['VE %',r=>CH7Math.torque(r)*4,100,C.acc2]]:[['IHP ps',r=>CH7Math.bhp(CH7Math.torque(r),r)+CH7Math.fhp(r),180,C.acc],['BHP ps',r=>CH7Math.bhp(CH7Math.torque(r),r),180,C.acc2],['FHP ps',CH7Math.fhp,180,C.bad]];
  line7(c,x,y,x+w,y,C.mut,2);line7(c,x,y,x,y-h,C.mut,2);
  for(let r=1000;r<=6000;r+=1000){const xx=xp(r);line7(c,xx,y,xx,y-h,'#263850',1);tx(c,r,xx-23,y+24,C.mut,18);}
  tx(c,'rpm',840,y+24,C.mut,18);
  curves.forEach(([lab,fn,max,col],k)=>{c.beginPath();for(let r=1000;r<=6500;r+=25){const xx=xp(r),yy=y-fn(r)/max*h;if(r===1000)c.moveTo(xx,yy);else c.lineTo(xx,yy);}c.strokeStyle=col;c.lineWidth=4;c.stroke();tx(c,lab,85+k*275,115,col,19);const v=fn(n);tx(c,`${lab.split(' ')[0]} ${v.toFixed(1)}`,85+k*275,475,col,20);c.beginPath();c.arc(xp(n),y-v/max*h,6,0,Math.PI*2);c.fillStyle=col;c.fill();});
  line7(c,xp(n),145,xp(n),y,'#e8eef9',2);
  if(kind==='sfc'){line7(c,xp(3900),y-h,xp(3900),y,C.acc,1);tx(c,'經濟轉速 3900（示意）',xp(3900)-120,155,C.acc,18);}
  if(kind==='torque')tx(c,'兩條線使用各自刻度；峰值同步',250,155,C.mut,19);
}
function piston7(c,t,S,mode){
  const r=S.r??45,n=S.n??3000,theta=t*n/60*Math.PI*2/30; // display slowed 30 times
  const rr=55,ll=145,cx=240,cy=405;
  const crank={x:cx+rr*Math.sin(theta),y:cy-rr*Math.cos(theta)};
  const pinY=cy-rr*Math.cos(theta)-Math.sqrt(ll*ll-rr*rr*Math.sin(theta)**2);
  const top=cy-rr-ll-24,btm=cy+rr-ll-24,pt=pinY-24;
  rect7(c,155,top-35,170,btm-top+120,'#324760');
  c.fillStyle='#ff9860';c.fillRect(170,top-24,140,24);
  c.fillStyle='#174b6e';c.fillRect(170,top,140,btm-top);
  c.fillStyle='#55c8ff55';c.fillRect(170,top,140,Math.max(0,pt-top));
  c.fillStyle='#b5c9df';c.fillRect(170,pt,140,35);
  line7(c,cx,pinY,crank.x,crank.y,'#cbd8e8',13);line7(c,cx,cy,crank.x,crank.y,C.acc,12);
  c.strokeStyle=C.metal;c.lineWidth=3;c.beginPath();c.arc(cx,cy,rr,0,Math.PI*2);c.stroke();
  tx(c,'CCV',75,top-10,C.fire,20);tx(c,'PDV',75,(top+btm)/2,C.acc2,20);
  line7(c,350,top,350,btm,C.acc,3);tx(c,'S = 2r',370,(top+btm)/2,C.acc,21);
  tx(c,'順時鐘｜動畫已減速',90,490,C.mut,18);
  if(mode===0){card7(c,'一圈走兩個行程',`S = 2 × ${r} = ${2*r} mm`,490,120,420,115);card7(c,'平均速度 V = 2SN / 60',`2 × ${(2*r/1000).toFixed(3)} × ${n} / 60 = ${CH7Math.speed(2*r,n).toFixed(2)} m/s`,490,255,420,135);wrap7(c,'死點瞬間速度為零；平均速度看整圈路程。',510,430,370,C.ink,21);}
  else {const d=S.d??80,s=S.s??90,cc=S.c??4,p=CH7Math.pdv(d,s);card7(c,'先把 mm 換成 cm',`D = ${d/10} cm；S = ${s/10} cm`,490,120,420,110);card7(c,'PDV = 3.14D²S / 4',`單缸 ${p.toFixed(2)} cc\n總排氣量 ${(p*cc).toFixed(2)} cc = ${(p*cc/1000).toFixed(3)} L`,490,255,420,160);}
}
function volume7(c,S,t){const p=S.p??500,cc=S.cc??50,cr=CH7Math.cr(p,cc),scale=300/(p+cc);[0,1].forEach((isBDC,k)=>{const x=95+k*270,y=145,h=cc*scale;rect7(c,x-5,y-5,190,320,'#344966');c.fillStyle='#ff9860';c.fillRect(x,y,180,h);c.fillStyle=isBDC?'#38c6ff66':'#0a1120';c.fillRect(x,y+h,180,p*scale);const yy=isBDC?y+(p+cc)*scale:y+h;c.fillStyle='#c3d1e4';c.fillRect(x,yy,180,18);tx(c,isBDC?'下死點 BDC':'上死點 TDC',x-5,115,C.ink,23);tx(c,isBDC?`TCV ${p+cc} cc`:`CCV ${cc} cc`,x-5,490,isBDC?C.acc2:C.fire,22);});card7(c,'CR = TCV / CCV',`(${p} + ${cc}) / ${cc}\n= ${cr.toFixed(2)}：1`,650,150,275,160);wrap7(c,'上死點還有 CCV；下死點是 PDV + CCV。',670,355,240,C.ink,22);}
function heat7(c,S){const names=['有效功率','排氣＋輻射','冷卻損失','機械摩擦'],cols=[C.ok,C.fire,C.acc2,C.acc];CH7Heat.forEach((a,k)=>{const cx=235+k*475,cy=265,R=128;let angle=-Math.PI/2;a.forEach((v,i)=>{c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,R,angle,angle+v/100*Math.PI*2);c.closePath();c.fillStyle=cols[i];c.fill();const mid=angle+v/100*Math.PI;tx(c,`${v}%`,cx+Math.cos(mid)*R*.72-15,cy+Math.sin(mid)*R*.72,'#071220',20);angle+=v/100*Math.PI*2;});tx(c,k?'柴油引擎':'汽油引擎',cx-62,105,C.ink,25);names.forEach((name,j)=>tx(c,`${name} ${a[j]}%`,cx-160+(j%2)*180,435+Math.floor(j/2)*35,cols[j],18));});}

const CALC=[
 [ // lesson 1
  {panel:(e,S)=>controls7(e,S,[['temp','攝氏溫度',0,120,1,90,'℃']]),draw:(c,t,S)=>{const q=S.temp??90;card7(c,'長度換算','1 in = 2.54 cm = 25.4 mm\n1 mile ≈ 1.6 km',45,110);card7(c,'面積要換兩個方向','1 m² = 100 × 100 = 10000 cm²\n1 in² ≈ 6.45 cm²',505,110);card7(c,'溫度尺｜先乘，再加 32',`${q}℃ × 9/5 + 32 = ${(q*1.8+32).toFixed(1)}℉`,45,295,870,140);}},
  {panel:(e,S)=>controls7(e,S,[['kg','扭力 kg-m',1,50,1,10,' kg-m'],['bar','壓力 bar',.5,5,.1,2,' bar']]),draw:(c,t,S)=>{const kg=S.kg??10,b=S.bar??2;card7(c,'扭力：力 × 垂直力臂',`${kg} kg-m ≈ ${(kg*9.8).toFixed(1)} N-m\n≈ ${(kg*7.2).toFixed(1)} lb-ft`,45,120,410,220);card7(c,'壓力：力 ÷ 面積',`${b} bar = ${(b*100).toFixed(0)} kPa\n≈ ${(b*14.5).toFixed(1)} psi\n≈ ${(b*1.02).toFixed(2)} kg/cm²`,505,120,410,220);tx(c,'1 atm ≈ 101.3 kPa；1 bar = 100 kPa',80,420,C.acc2,25);}},
  {panel:(e,S)=>controls7(e,S,[['vac','真空度 mm-Hg',0,760,10,380,' mm-Hg']]),draw:(c,t,S)=>{const v=S.vac??380,abs=760-v;rect7(c,90,130,155,320,'#234866');c.fillStyle=C.acc2;c.fillRect(90,450-abs/760*320,155,abs/760*320);tx(c,'大氣壓 760',65,100,C.ink,22);tx(c,'完全真空 0',65,475,C.ink,22);line7(c,250,450-abs/760*320,420,450-abs/760*320,C.acc,3);card7(c,'真空度：從大氣壓往下扣',`${v} mm-Hg ≈ ${(v/25.4).toFixed(2)} in-Hg`,465,110,450,110);card7(c,'絕對壓力：從零往上算',`${abs} mm-Hg\n≈ ${(101.3*abs/760).toFixed(2)} kPa\n≈ ${(1.03*abs/760).toFixed(3)} kg/cm²；${(14.7*abs/760).toFixed(2)} psi`,465,245,450,210);}},
  {panel:(e,S)=>controls7(e,S,[['kw','功率',1,150,1,100,' kW'],['kcal','能量',1,20,1,10,' kcal']]),draw:(c,t,S)=>{const k=S.kw??100,e=S.kcal??10;card7(c,'功率＝作功的快慢',`${k} kW ≈ ${(k*1.36).toFixed(2)} ps\n≈ ${(k*1.34).toFixed(2)} hp\n1 ps ≈ 735 W；1 hp ≈ 746 W`,45,130,410,255);card7(c,'能量＝總共作了多少功',`${e} kcal ≈ ${(e*4.2).toFixed(1)} kJ\n≈ ${(e*3.968).toFixed(2)} BTU\n能量 = 功率 × 時間`,505,130,410,255);}},
  {draw:(c)=>{['長度 in ↔ mm','面積 in² ↔ cm²','溫度 ℃ ↔ ℉','扭力 kg-m ↔ N-m','壓力 bar ↔ kPa','真空 mm-Hg ↔ in-Hg','功率 kW ↔ ps／hp','能量 kcal ↔ kJ／BTU'].forEach((s,i)=>card7(c,s,'先辨物理量，再選換算常數',40+(i%2)*460,105+Math.floor(i/2)*90,420,78));}}
 ],
 [ // lesson 2
  {panel:(e,S)=>controls7(e,S,[['r','曲柄長 r',20,60,1,45,' mm'],['n','轉速 N',1000,6000,100,3000,' rpm']]),draw:(c,t,S)=>piston7(c,t,S,0)},
  {panel:(e,S)=>controls7(e,S,[['d','缸徑 D',60,110,1,80,' mm'],['s','行程 S',60,120,1,90,' mm'],['c','缸數 C',1,8,1,4,' 缸']]),draw:(c,t,S)=>{piston7(c,t,S,1);}},
  {panel:(e,S)=>controls7(e,S,[['p','單缸 PDV',300,700,10,500,' cc'],['cc','燃燒室 CCV',30,100,1,50,' cc']]),draw:(c,t,S)=>volume7(c,S,t)},
  {panel:(e,S)=>choose7(e,S,'kind','課本典型範圍',['汽油','HCCI 汽油','柴油']),draw:(c,t,S)=>{const k=S.kind??0,ranges=[[8,12],[17,18],[15,23]],labels=['汽油 8～12：1','HCCI 汽油 17～18：1','柴油 15～23：1'];ranges.forEach(([a,b],i)=>{line7(c,80+(a-5)*40,175+i*90,80+(b-5)*40,175+i*90,i===k?C.acc:C.acc2,16);tx(c,labels[i],80,140+i*90,i===k?C.acc:C.ink,24);});tx(c,'汽油壓縮比過高 → 爆震風險；感知器回報後延後點火',55,445,C.ink,23);}},
  {draw:(c)=>{card7(c,'路程：先用 m','S = 2r；V = 2SN / 60',45,120);card7(c,'容積：先用 cm','PDV = 3.14D²S / 4；總量再乘缸數',505,120);card7(c,'壓縮比：上下死點空間的比','CR = (PDV + CCV) / CCV\nCCV = PDV / (CR − 1)',45,310,870,140);}}
 ],
 [ // lesson 3
  {panel:(e,S)=>{controls7(e,S,[['pi','指示平均有效壓力 Pi',8,18,1,15,' kg/cm²'],['rpm','轉速',1000,5000,100,3000,' rpm'],['cycle','行程數（二或四）',2,4,2,4,' 行程']]);},draw:(c,t,S)=>{const rpm=S.rpm??3000,cy=S.cycle??4,p=S.pi??15,N=cy===4?rpm/2:rpm,ihp=p*2000*N/450000;card7(c,'指示馬力 IHP',`${p} × 2000 cc × ${N} / 450000\n= ${ihp.toFixed(1)} ps`,45,120,410,160);card7(c,'N 是每分鐘動力次數',`${cy} 行程：N = ${rpm}${cy===4?' / 2':''}\n= ${N} 次/min`,505,120,410,160);bars7(c,[['IHP：缸內作功',100,C.acc],['FHP：摩擦消耗',20,C.bad],['BHP：飛輪輸出',80,C.acc2]],70,320,730,100);}},
  {panel:(e,S)=>controls7(e,S,[['force','磅秤讀數 F',10,60,1,40,' kgf'],['arm','垂直力臂 L',.1,1,.1,.5,' m'],['rpm','轉速 N',1000,6000,100,2000,' rpm']]),draw:(c,t,S)=>{const f=S.force??40,l=S.arm??.5,n=S.rpm??2000;const angle=t*.7;c.beginPath();c.arc(215,250,95,0,Math.PI*2);c.strokeStyle=C.acc2;c.lineWidth=18;c.stroke();line7(c,215,250,215+70*Math.sin(angle),250-70*Math.cos(angle),C.metal,6);line7(c,215,250,445,250,C.acc,15);rect7(c,415,325,110,55,'#344966');line7(c,445,250,445,325,C.ink,5);tx(c,'制動帶',135,125,C.ink,22);tx(c,`F = ${f} kgf`,400,410,C.ink,23);tx(c,`L = ${l} m`,275,215,C.acc,23);card7(c,'T = F × L',`${f} × ${l} = ${(f*l).toFixed(2)} kg-m`,565,140,350,120);card7(c,'BHP = TN / 716',`${(f*l).toFixed(2)} × ${n} / 716\n= ${CH7Math.bhp(f*l,n).toFixed(2)} ps`,565,295,350,150);}},
  {panel:(e,S)=>controls7(e,S,[['volt','電壓',100,300,10,200,' V'],['amp','電流',20,100,5,60,' A'],['eta','發電機效率',50,95,5,80,' %']]),draw:(c,t,S)=>{const v=S.volt??200,a=S.amp??60,eta=S.eta??80;card7(c,'引擎 → 發電機 → 電負載',`電輸出 ${v} × ${a} = ${v*a} W\n引擎輸入 = IV / η\n= ${(v*a/(eta/100)/1000).toFixed(2)} kW`,45,120,410,240);card7(c,'總馬力與淨馬力（課本）','總：拆發電機、風扇、空濾、消音器\n仍保留水泵等主要機件\n淨：裝齊附件，約少 7～10%',505,120,410,240);}},
  {panel:(e,S)=>controls7(e,S,[['rpm','轉速遊標',1000,6500,100,4000,' rpm']]),draw:(c,t,S)=>graph7(c,'power',S.rpm??4000)},
  {panel:(e,S)=>controls7(e,S,[['rpm','轉速遊標',1000,6500,100,3500,' rpm']]),draw:(c,t,S)=>graph7(c,'torque',S.rpm??3500)},
  {draw:(c)=>{card7(c,'扭力','轉動的力矩：力 × 垂直力臂',45,120);card7(c,'馬力','作功的快慢：扭力 × 轉速',505,120);card7(c,'兩種 N 不要混淆','PiVN / k：四行程 N = rpm / 2\nTN / 716：直接用 rpm，不再除以二',45,310,870,140);}}
 ],
 [ // lesson 4
  {panel:(e,S)=>choose7(e,S,'load','負載',['怠速無載','全負荷'],1),draw:(c,t,S)=>{const b=(S.load??1)?80:0,i=(S.load??1)?100:20;bars7(c,[['IHP',i,C.acc],['FHP',i-b,C.bad],['BHP',b,C.acc2]],65,150,720);card7(c,'ME = BHP / IHP × 100%',`${b} / ${i} × 100% = ${b/i*100}%`,65,360,830,100);}},
  {panel:(e,S)=>controls7(e,S,[['alt','海拔（獨立估算）',0,3000,100,0,' m'],['temp','進氣溫度（20℃為基準）',20,40,1,20,' ℃'],['boost','增壓示意開關',0,1,1,0,'']]),draw:(c,t,S)=>{const h=S.alt??0,tmp=S.temp??20,bo=S.boost??0;card7(c,'依課本各自估算馬力影響',`海拔 ${h} m → 降約 ${(h/1000*10).toFixed(0)}%\n升溫 ${tmp-20}℃ → 降約 ${tmp-20}%\n兩項不直接相加成實車預測`,45,120,410,230);card7(c,'VE＝實際進氣 / 理論進氣',`四行程 3140 cc × (2400/2)\n每分進氣 3.14 m³ → VE 83.3%\n增壓：${bo?'可能超過 100%':'關閉'}`,505,120,410,230);wrap7(c,'六因素：氣壓、溫度、濕度、排氣反壓、進氣阻力、轉速',55,430,840,C.acc2,23);}},
  {panel:(e,S)=>controls7(e,S,[['bhp','輸出 BHP',20,100,5,50,' ps'],['fuel','每小時耗油',5,30,1,15,' kg/h'],['system','單位制 0公制／1英制',0,1,1,0,'']]),draw:(c,t,S)=>{const b=S.bhp??50,w=S.fuel??15,eng=S.system??0,k=eng?2545:632;card7(c,'制動熱效率 TE = BHP × k / WH',`${b} × ${k} / (${w} × ${eng?12500:10000}) × 100%\n= ${(b*k/(w*(eng?12500:10000))*100).toFixed(2)}%`,45,120,870,160);card7(c,'公制','k = 632；ps、kg/h、kcal/kg',45,325,410,120);card7(c,'英制','k = 2545；hp、lb/h、BTU/lb',505,325,410,120);}},
  {panel:(e,S)=>controls7(e,S,[['rpm','轉速遊標',1000,6500,100,3900,' rpm']]),draw:(c,t,S)=>graph7(c,'sfc',S.rpm??3900)},
  {draw:(c)=>{card7(c,'ME：動力損耗','BHP / IHP；全負荷約 75～85%',45,115);card7(c,'VE：進氣充填','汽油約 65～85%；柴油約 80～90%',505,115);card7(c,'TE：熱能轉換','有效功 / 燃料總熱能',45,310);card7(c,'油耗比較要看單位','SFC、L/100km 愈小佳；km/L 愈大佳',505,310);}}
 ],
 [ // lesson 5
  {panel:(e,S)=>choose7(e,S,'part','選擇熱能去向',['有效功率','排氣＋輻射','冷卻損失','機械摩擦']),draw:(c,t,S)=>{heat7(c,S);const a=['有效功：汽油圖示 25～30%；柴油 30～40%','排氣＋輻射：汽油 35～40%；柴油 30～35%','冷卻：汽油 32～35%；柴油 30～32%','摩擦：汽柴油皆 5～8%，良好潤滑減少損耗'];tx(c,a[S.part??0],55,60,C.acc,23);}},
  {panel:(e,S)=>choose7(e,S,'metric','比較標準',['ps/cc','kg/ps','BMEP','SFC']),draw:(c,t,S)=>{const labels=['單位排氣量馬力','單位馬力重量','制動平均有效壓力','燃料消耗率'];labels.forEach((s,i)=>card7(c,s,(i===0||i===2?'愈大愈佳':'愈小愈佳')+'｜'+['ps/cc','kg/ps','kg/cm² 或 bar','g/(ps·h)'][i],45+(i%2)*460,115+Math.floor(i/2)*180,410,145));}},
  {panel:(e,S)=>choose7(e,S,'car','課本2018年資料',['純電動車','Hybrid','純內燃機']),draw:(c,t,S)=>{['① 純電動車：換算超過 50 km/L','② Hybrid：混合動力','③ 純內燃機汽車'].forEach((s,i)=>card7(c,s,['以電能消耗量換算，不是實際使用汽油','同時使用引擎與電動機','燃料能量有排氣、冷卻與摩擦等損失'][i],70,110+i*122,820,100));}},
  {panel:(e,S)=>choose7(e,S,'node','公式節點',['容積','馬力','效率','油耗']),draw:(c,t,S)=>{const rows=[['2000 cc 四行程，Pi = 15，3000 rpm','IHP = 15 × 2000 × 1500 / 450000 = 100 ps'],['已知 FHP = 20 ps','BHP = 100 − 20 = 80 ps'],['ME = BHP / IHP','80 / 100 = 80%'],['每小時耗油 20 kg，H = 10000 kcal/kg','SFC = 250 g/(ps·h)；TE = 25.28%']];rows.forEach(([a,b],i)=>card7(c,a,b,45,100+i*95,870,83));}},
  {draw:(c)=>{['PDV 活塞位移容積','CCV 燃燒室容積','TCV 汽缸總容積','CR 壓縮比','IHP 指示馬力','IMEP 指示平均有效壓力','BHP 制動馬力','BMEP 制動平均有效壓力','gross 總馬力／net 淨馬力','FHP 摩擦馬力','torque 扭力','engine efficiency 引擎效率','ME 機械效率','VE 容積效率','TE 熱效率','指示熱效率','制動熱效率','SFC 燃料消耗率'].forEach((s,i)=>tx(c,s,40+(i%3)*310,115+Math.floor(i/3)*62,C.ink,18));}}
 ]
];
function startCh7(i){
  const src=window.CH7[i-1];
  const cfg={...src,sub:`第7章 第${i}節（全課程第${33+i}節）｜單元七`,state:{},chapters:src.chapters.map((ch,j)=>({
    ...ch,captions:ch.captions.map((s,k)=>[Math.round(k*ch.dur/ch.captions.length),s]),
    panel:CALC[i-1][j].panel,
    draw(c,t,S){base7(c,ch.title,i===5&&j===2?'課本小百科｜2018年資料，非現行車款排名':i===5&&j===0?'扇形為合計100%的教學示意值；完整範圍見下方講義':'課本近似值／典型範圍；曲線為教學模型，非特定實車量測');CALC[i-1][j].draw(c,t,S);}
  }))};
  window.CH7Current=cfg;Player(cfg);
  const ext=document.createElement('p');ext.className='ch7links';ext.innerHTML=`<a href="K${i}_重點與例題.html">📖 完整重點、例題與課本練習</a>　<a href="W${i}_學習單.html">📝 本節學習單</a>　<a href="Q${i}_隨堂測驗.html">✏️ 隨堂測驗</a>`;document.querySelector('.wrap').append(ext);
}
window.startCh7=startCh7;
