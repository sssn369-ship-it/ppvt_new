const assets = {
  dog:{label:'개',file:'Dog_6861.svg'}, cat:{label:'고양이',file:'Cat_6862.svg'}, rabbit:{label:'토끼',file:'Rabbit_6866.svg'}, elephant:{label:'코끼리',file:'Elephant_6863.svg'}, lion:{label:'사자',file:'Lion_6864.svg'},
  apple:{label:'사과',file:'Apple_6683.svg'}, banana:{label:'바나나',file:'Banana_6684.svg'}, milk:{label:'우유',file:'Milk_6708.svg'}, bread:{label:'빵',file:'Bread_6521.svg'}, water:{label:'물',file:'Water_6707.svg'},
  book:{label:'책',file:'Book_7170.svg'}, chair:{label:'의자',file:'Chair_7030.svg'}, bed:{label:'침대',file:'Bed_7039.svg'}, door:{label:'문',file:'Door_7024.svg'}, car:{label:'자동차',file:'Car_7053.svg'},
  red:{label:'빨강',file:'Red_6965.svg'}, blue:{label:'파랑',file:'Blue_6962.svg'}, circle:{label:'동그라미',file:'Circle_6977.svg'}, star:{label:'별',file:'Star_6981.svg'}, eyes:{label:'눈',file:'Eyes_6924.svg'}
};
const questions = [
  {category:'동물',target:'개',answer:'dog',choices:['dog','cat','rabbit','lion']}, {category:'동물',target:'고양이',answer:'cat',choices:['lion','cat','elephant','rabbit']}, {category:'동물',target:'토끼',answer:'rabbit',choices:['dog','elephant','rabbit','cat']}, {category:'동물',target:'코끼리',answer:'elephant',choices:['lion','rabbit','elephant','dog']}, {category:'동물',target:'사자',answer:'lion',choices:['cat','lion','dog','elephant']},
  {category:'음식',target:'사과',answer:'apple',choices:['banana','apple','bread','milk']}, {category:'음식',target:'바나나',answer:'banana',choices:['water','banana','apple','bread']}, {category:'음식',target:'우유',answer:'milk',choices:['milk','water','bread','apple']}, {category:'음식',target:'빵',answer:'bread',choices:['banana','milk','bread','water']}, {category:'음식',target:'물',answer:'water',choices:['apple','bread','water','banana']},
  {category:'생활 사물',target:'책',answer:'book',choices:['chair','book','bed','car']}, {category:'생활 사물',target:'의자',answer:'chair',choices:['door','car','chair','book']}, {category:'생활 사물',target:'침대',answer:'bed',choices:['bed','chair','car','door']}, {category:'생활 사물',target:'문',answer:'door',choices:['book','door','bed','chair']}, {category:'생활 사물',target:'자동차',answer:'car',choices:['chair','bed','car','book']},
  {category:'기초 개념',target:'빨강',answer:'red',choices:['blue','red','circle','star']}, {category:'기초 개념',target:'파랑',answer:'blue',choices:['circle','star','blue','red']}, {category:'기초 개념',target:'동그라미',answer:'circle',choices:['star','circle','red','eyes']}, {category:'기초 개념',target:'별',answer:'star',choices:['eyes','blue','star','circle']}, {category:'기초 개념',target:'눈',answer:'eyes',choices:['red','eyes','blue','star']}
];
let index=0, responses=[], questionStartedAt=0, timerId=null, selected=null, child='', sessionStarted='';
const $=(id)=>document.getElementById(id);
const screens=['welcomeScreen','testScreen','dashboardScreen'];
function show(name){screens.forEach(id=>$(id).classList.toggle('hidden',id!==name));}
function formatSeconds(ms){return `${(ms/1000).toFixed(1)}초`;}
function makeOption(key){
  const a=assets[key], button=document.createElement('button');
  button.type='button'; button.className='option-card'; button.dataset.key=key; button.setAttribute('aria-label',`${a.label} 그림 선택`);
  const img=document.createElement('img'); img.src=`img/${encodeURIComponent(a.file)}`; img.alt=`${a.label} 그림`;
  img.onerror=()=>{img.remove();const missing=document.createElement('div');missing.className='missing-visual';missing.innerHTML=`<span>${a.label}</span><small>그림 파일 없음<br>${a.file}</small>`;button.prepend(missing);};
  const filename=document.createElement('span');filename.className='asset-file';filename.textContent=a.file;
  button.append(img,filename);button.addEventListener('click',()=>selectOption(key,button));return button;
}
function startTest(){child=$('childName').value.trim();index=0;responses=[];selected=null;sessionStarted=new Date().toLocaleString('ko-KR');show('testScreen');renderQuestion();}
function renderQuestion(){
  const q=questions[index];selected=null;
  $('categoryBadge').textContent=`${q.category} · ${Math.floor(index/5)+1}/4 범주`;$('questionCount').textContent=`문항 ${index+1} / ${questions.length}`;$('targetWord').textContent=q.target;$('targetWordQuote').textContent=q.target;$('progressBar').style.width=`${(index/questions.length)*100}%`;$('selectionHint').textContent='그림 하나를 선택해 주세요.';$('nextButton').disabled=true;
  $('optionsGrid').replaceChildren(...q.choices.map(makeOption));questionStartedAt=performance.now();clearInterval(timerId);timerId=setInterval(()=>{$('liveTimer').textContent=formatSeconds(performance.now()-questionStartedAt);},100);$('liveTimer').textContent='0.0초';
}
function selectOption(key,button){
  if(selected)return;selected=key;const q=questions[index], elapsed=Math.round(performance.now()-questionStartedAt);clearInterval(timerId);document.querySelectorAll('.option-card').forEach(el=>el.classList.remove('selected'));button.classList.add('selected');
  responses.push({number:index+1,category:q.category,target:q.target,answerKey:q.answer,answer:assets[q.answer].label,answerFile:assets[q.answer].file,selectedKey:key,selected:assets[key].label,selectedFile:assets[key].file,correct:key===q.answer,reactionMs:elapsed});
  $('selectionHint').textContent=`선택 기록됨 · 반응 시간 ${formatSeconds(elapsed)}`;$('nextButton').disabled=false;
}
function next(){if(!selected)return;index++;if(index<questions.length)renderQuestion();else{clearInterval(timerId);renderDashboard();}}
function categoryStats(category){const r=responses.filter(x=>x.category===category),correct=r.filter(x=>x.correct).length,avg=r.length?r.reduce((sum,x)=>sum+x.reactionMs,0)/r.length:0;return{correct,avg};}
function renderDashboard(){
  show('dashboardScreen');const total=responses.filter(x=>x.correct).length,time=responses.reduce((s,x)=>s+x.reactionMs,0);$('totalScore').innerHTML=`${total} <small>/ ${questions.length}</small>`;$('totalRate').textContent=`정답률 ${Math.round(total/questions.length*100)}%`;$('totalTime').textContent=formatSeconds(time);$('avgTime').textContent=formatSeconds(time/responses.length);$('resultMeta').textContent=`${child?`${child} · `:''}${sessionStarted} · ${responses.length}문항 완료`;
  const cats=['동물','음식','생활 사물','기초 개념'];$('categoryScores').replaceChildren(...cats.map(c=>{const s=categoryStats(c),e=document.createElement('article');e.className='category-score';e.innerHTML=`<span class="category-label">${c}</span><strong>${s.correct} <small>/ 5</small></strong><p>평균 반응 시간 ${formatSeconds(s.avg)}</p><div class="bar"><div style="width:${s.correct/5*100}%"></div></div>`;return e;}));
  $('resultRows').replaceChildren(...responses.map(r=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${r.number}</td><td>${r.category}</td><td>${r.target}</td><td>${r.selected}</td><td class="${r.correct?'result-ok':'result-no'}">${r.correct?'정답':'오답'}</td><td>${formatSeconds(r.reactionMs)}</td>`;return tr;}));
}
function csvEscape(value){const s=String(value??'');return /[\",\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s;}
function exportCsv(){
  const header=['아동 식별정보','검사 시작','문항','범주','목표 단어','정답','선택','정오답','반응 시간(초)','정답 그림파일명','선택 그림파일명'];
  const rows=responses.map(r=>[child,sessionStarted,r.number,r.category,r.target,r.answer,r.selected,r.correct?'정답':'오답',(r.reactionMs/1000).toFixed(3),r.answerFile,r.selectedFile]);
  const csv='\uFEFF'+[header,...rows].map(row=>row.map(csvEscape).join(',')).join('\r\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`ppvt_new_${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(url);
}
$('startButton').addEventListener('click',startTest);$('nextButton').addEventListener('click',next);$('dashboardButton').addEventListener('click',()=>responses.length?renderDashboard():show('welcomeScreen'));$('restartButton').addEventListener('click',()=>{clearInterval(timerId);show('welcomeScreen');});$('reviewButton').addEventListener('click',()=>$('detailSection').classList.toggle('hidden'));$('csvButton').addEventListener('click',exportCsv);