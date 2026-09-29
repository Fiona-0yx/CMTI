const TYPES = [
  {code:'A',name:'限时开挂型',title:'算法竞技',color:'#7b4bb3',tint:'#f0e8fb',image:'/assets/personality-A.png',desc:'你容易被清晰的问题边界、严谨推理和高强度解题吸引。把复杂任务拆开、优化路径、在时限中找到漂亮解法，会让你进入状态。',contests:'ICPC、CCPC、蓝桥杯、程序设计竞赛',icon:'algorithm'},
  {code:'E',name:'需求终结者',title:'工程开发',color:'#3c83bf',tint:'#e6f1fa',image:'/assets/personality-E.png',desc:'你在意想法是否真正可用。拆模块、搭系统、反复调试直到稳定运行，是你最有成就感的项目节奏。',contests:'中国软件杯、软件创新赛、华为 ICT',icon:'engineering'},
  {code:'I',name:'路演气氛组长',title:'创新创业',color:'#e97b25',tint:'#fff0e2',image:'/assets/personality-I.png',desc:'开放空间会激发你的灵感。你擅长发现新方向，也愿意组织协作、包装亮点并把项目讲给更多人听。',contests:'互联网+、挑战杯创业、创客赛',icon:'innovation'},
  {code:'S',name:'赛博锁匠',title:'安全攻防',color:'#4b9b4a',tint:'#e9f6e8',image:'/assets/personality-S.png',desc:'你对系统背后的规则与边界保持好奇。追踪异常、测试假设、从不同角度寻找薄弱点，是你的探索方式。',contests:'信息安全竞赛、强网杯、CTF',icon:'security'},
  {code:'H',name:'焊点炼金师',title:'硬件极客',color:'#9a6840',tint:'#f8eee8',image:'/assets/personality-H.png',desc:'你喜欢让数字世界连接真实设备。电路、传感器、嵌入式与机械结构交织在一起，反而更能点燃你的兴趣。',contests:'电赛、嵌入式、物联网、机器人',icon:'hardware'},
  {code:'M',name:'论文炼丹师',title:'建模研究',color:'#347f88',tint:'#e7f3f4',image:'/assets/personality-M.png',desc:'你愿意先弄清问题，再下结论。资料梳理、数据分析、建立模型和验证假设，让你对复杂现象逐渐形成解释。',contests:'数学建模、MCM/ICM、挑战杯科技',icon:'research'}
];
const QUESTIONS = [
  '遇到一个复杂问题时，我会很自然地把它拆成几个明确的小问题，然后逐个解决。',
  '即使没有实际应用场景，我也会因为一个算法问题本身很有挑战性而想把它解决。',
  '在时间有限的情况下，我反而容易进入专注状态，享受快速思考和解题的过程。',
  '看到一个问题时，我经常会思考“有没有更快、更简洁、更高效的方法”。',
  '相比讨论一个想法，我更喜欢亲手把它做成一个真正能够运行的程序或系统。',
  '一个项目出现 Bug 时，我通常愿意花很长时间定位问题，而不是直接放弃。',
  '我喜欢把一个比较大的任务拆成模块，然后一步一步把整个系统搭起来。',
  '看到一个别人提出的好点子时，我首先想到的往往是“这个东西具体应该怎么实现”。',
  '我经常会突然想到一些别人没有想到的点子，并且会忍不住想把它们说出来。',
  '面对一个开放性问题时，我通常更喜欢提出新的方向，而不是按照已有方案一步步做。',
  '如果让我负责一个项目，我愿意站出来组织团队、分配任务并向别人介绍我们的成果。',
  '我比较在意一个项目有没有“亮点”，而不仅仅是它能不能正常运行。',
  '看到一个软件、网站或系统时，我会好奇它内部有没有什么漏洞、隐藏机制或者意想不到的地方。',
  '我很喜欢研究“规则是怎么被设计的，以及有没有办法绕过规则”。',
  '遇到一个陌生系统时，我会主动尝试不同的方法去测试它的边界。',
  '相比按照说明书操作，我更喜欢自己研究系统为什么这样运行，以及哪里可能出现问题。',
  '相比只在电脑里运行程序，我更喜欢让自己的代码最终控制一个真实的设备。',
  '拆解、组装、调试电子设备这类事情会让我产生兴趣。',
  '如果一个项目需要同时处理软件、电路、传感器或者机械结构，我会觉得很有意思。',
  '当一个程序和真实硬件连接起来并成功运行时，我获得的成就感会特别强。',
  '面对一个现实问题时，我喜欢先收集信息、分析规律，再建立一个合理的模型。',
  '我能够接受为了弄清楚一个问题而阅读大量资料，并进行比较、分析和验证。',
  '相比直接得到一个答案，我更在意这个答案背后的原理、假设和推导过程。',
  '我比较喜欢数学、数据分析或者需要长篇论证的研究型任务。'
];
const CONTESTS = globalThis.CMTI_CONTESTS;
const $ = (sel,root=document)=>root.querySelector(sel);
const $$ = (sel,root=document)=>[...root.querySelectorAll(sel)];
const storage = {profile:'cmti.profile.v1',draft:'cmti.draft.v1'};
let state={step:0,answers:Array(24).fill(null),refinement:null,user:null,profile:null};
let cozeConversationId=null;
let quizTransitioning=false;
const cozeUserId=(()=>{try{const k='cmti.chat.user.v1';let id=localStorage.getItem(k);if(!id){id=crypto.randomUUID();localStorage.setItem(k,id)}return id}catch{return 'cmti-anonymous-student'}})();
const dims = TYPES.map(t=>t.code);

function iconMarkup(type,large=false){
  if(type.image)return `<img class="personality-image${large?' personality-image-large':''}" src="${type.image}" alt="${type.name}" loading="lazy">`;
  const c=type.color;
  const shared=`<circle cx="50" cy="51" r="45" fill="${type.tint}"/><ellipse cx="50" cy="89" rx="28" ry="20" fill="${c}"/><path d="M31 53c0-16 9-25 20-25 14 0 21 10 21 25v11H31z" fill="#25353b"/><ellipse cx="51" cy="52" rx="17" ry="20" fill="#f1c9a8"/><path d="M34 47c1-17 12-24 22-21 8 2 13 8 15 18-7-4-15-7-24-7-4 5-8 8-13 10" fill="#25353b"/>`;
  const props={
    algorithm:`<rect x="19" y="68" width="39" height="27" rx="4" fill="#344954"/><path d="M28 77l-5 5 5 5m9-10 5 5-5 5m11-10-4 10" stroke="#c8f1db" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M71 49l-11 17h9l-4 12 15-19h-9l5-10z" fill="#efb94e" stroke="#fff" stroke-width="1.5"/>`,
    engineering:`<rect x="19" y="68" width="43" height="26" rx="4" fill="#344954"/><path d="M23 74h20m-20 5h29m-29 5h19" stroke="#b8d8f3" stroke-width="2"/><path d="M69 66a10 10 0 0 0-10 12l-8 8 7 7 8-8a10 10 0 0 0 12-10l-6 5-6-6z" fill="#e8af55" stroke="#fff" stroke-width="1.5"/>`,
    innovation:`<path d="M51 64c-11-8-9-26 3-29 11-3 21 8 16 19-2 5-7 8-8 12z" fill="#f3bf4c"/><path d="M54 68h12m-10 5h9" stroke="#fff" stroke-width="2"/><path d="M69 48l15-8-3 13-7 4m-29-7-12-8 3 13 7 4" fill="#e87d61"/><path d="M79 28l2-7m8 13 7-4M35 28l-3-7" stroke="#dfa34c" stroke-width="2"/>`,
    security:`<path d="M68 58l-17 26-17-9V54l17-8 17 8z" fill="#d96f7e" stroke="#fff" stroke-width="2"/><circle cx="50" cy="62" r="7" fill="none" stroke="#fff" stroke-width="3"/><path d="M55 67l8 8m-13-16v6m-3-3h6" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`,
    hardware:`<rect x="36" y="67" width="32" height="25" rx="4" fill="#4ba995" stroke="#fff" stroke-width="2"/><rect x="43" y="73" width="18" height="13" rx="2" fill="#d9f4e9"/><path d="M43 61v6m9-6v6m9-6v6m-18 25v6m9-6v6m9-6v6M29 73h7m-7 8h7m32-8h7m-7 8h7" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="52" cy="80" r="2" fill="#e5a54b"/>`,
    research:`<path d="M45 65V48h13v17l13 22H32z" fill="#8474bd" stroke="#fff" stroke-width="2"/><path d="M38 78c6-6 10 3 16-1 5-4 9 1 12 2l5 8H34z" fill="#c2b8eb"/><path d="M47 47h10m-8 28 4-6 4 6 4-8" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>`
  };
  return `<svg viewBox="0 0 100 110" role="img" aria-label="${type.name}插画">${shared}${props[type.icon]}</svg>`;
}

function renderDirectory(){
  $('#typeGrid').innerHTML=TYPES.map(t=>`<article class="type-card" style="--type:${t.color};--tint:${t.tint}"><div class="type-visual">${iconMarkup(t)}</div><div><div class="type-code">${t.code} · ${t.title}</div><h2>${t.name}</h2><p>${t.desc}</p><div class="type-contests"><strong>适合探索：</strong>${t.contests}</div></div></article>`).join('');
}
function goView(view){
  for(const id of ['welcomeView','quizView','resultView','assistantView','directoryView']) $('#'+id).classList.add('hidden');
  $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  if(view==='assistant') $('#assistantView').classList.remove('hidden');
  else if(view==='directory') $('#directoryView').classList.remove('hidden');
  else if(state.step>=0&&state.step<25&&state.user&&!state.profile) $('#quizView').classList.remove('hidden');
  else if(state.profile){$('#resultView').classList.remove('hidden');renderResult(state.profile)}
  else $('#welcomeView').classList.remove('hidden');
  window.scrollTo({top:0,behavior:'smooth'});
}
function renderQuestionStep(){
  const n=state.step,q=QUESTIONS[n],selected=state.answers[n];
  $('#questionList').innerHTML=`<article class="question-card"><div class="question-number">QUESTION ${String(n+1).padStart(2,'0')}</div><div class="question-text">${q}</div><div class="likert" role="radiogroup" aria-label="问题${n+1}">${[1,2,3,4,5,6,7].map(v=>`<span><input type="radio" id="q${n}-${v}" name="q${n}" value="${v}" ${selected===v?'checked':''}><label for="q${n}-${v}" title="${v}">${v}</label></span>`).join('')}</div><div class="likert-legend"><span>非常不符合</span><span>非常符合</span></div></article>`;
  $('#questionList').onchange=e=>{
    if(!e.target.matches('input[type=radio]'))return;
    const answerIndex=Number(e.target.name.slice(1));
    state.answers[answerIndex]=Number(e.target.value);
    updateProgress();
    if(answerIndex===state.step) transitionToStep(state.step+1);
  };
  const type=TYPES[Math.floor(n/4)];
  $('#quizHeading').textContent=`${type.title}倾向`;
  $('#progressText').textContent=`第 ${n+1} 题，共 24 题`;
  $('#prevStep').disabled=n===0;
  $('#nextStep').textContent='下一题 →';
  updateProgress();
}
function renderRefinement(){
  const descriptions={A:'限时挑战与算法解法',E:'把点子做成可运行的软件',I:'设计新项目并向人展示',S:'拆解系统并寻找漏洞',H:'动手搭设备并连接代码',M:'建模分析并写成研究成果'};
  $('#quizHeading').textContent='综合题 · 选出最吸引你的方向';
  $('#progressText').textContent='最后一步 · 综合选择';
  $('#questionList').innerHTML=`<article class="question-card" style="grid-column:1/-1"><div class="question-number">QUESTION 25 · FINAL PICK</div><div class="question-text" style="font-size:17px;margin:10px 0 17px">如果学校给你一个完全开放的项目，让你自己选择方向，你最容易被下面哪种事情吸引？</div><div class="refine-grid">${TYPES.map(t=>`<label class="refine-option ${state.refinement===t.code?'selected':''}" style="--type:${t.color}" ><input type="radio" name="refinement" value="${t.code}" ${state.refinement===t.code?'checked':''}><span class="refine-code">${t.code}</span><span><strong>${descriptions[t.code]}</strong><small>${t.title}</small></span><span class="refine-check">✓</span></label>`).join('')}</div></article>`;
  $('#questionList').onchange=e=>{if(e.target.name==='refinement'){state.refinement=e.target.value;renderRefinement();updateProgress()}};
  $('#prevStep').disabled=false;$('#nextStep').textContent='查看我的结果 →';updateProgress();
}
function updateProgress(){
  const count=state.answers.filter(Boolean).length,done=state.step===24&&state.refinement;
  $('#answeredText').textContent=`${count} / 24 已回答`;
  $('#progressFill').style.width=`${Math.round((count/24)*96+(done?4:0))}%`;
  $('#stepDots').innerHTML=Array.from({length:25},(_,i)=>`<i class="step-dot ${i===state.step?'active':i<state.step?'done':''}"></i>`).join('');
}
function transitionToStep(next){
  if(quizTransitioning)return;
  quizTransitioning=true;
  const list=$('#questionList');
  list.classList.remove('quiz-transition-in');
  list.classList.add('quiz-transition-out');
  window.setTimeout(()=>{
    state.step=Math.min(24,next);
    if(state.step===24)renderRefinement();
    else renderQuestionStep();
    list.classList.remove('quiz-transition-out');
    list.classList.add('quiz-transition-in');
    quizTransitioning=false;
    window.setTimeout(()=>list.classList.remove('quiz-transition-in'),260);
  },240);
}
function startQuiz(name,major){state.user={name:name.trim(),major:major.trim()};state.step=0;state.answers=Array(24).fill(null);state.refinement=null;state.profile=null;cozeConversationId=null;goView('result');renderQuestionStep()}
function calculate(){
  const raw={};for(let i=0;i<6;i++){const avg=state.answers.slice(i*4,i*4+4).reduce((sum,v)=>sum+((v-1)/6),0)/4;raw[TYPES[i].code]=avg*100}
  raw[state.refinement]=raw[state.refinement]*1.10;
  const total=Object.values(raw).reduce((a,b)=>a+b,0);
  const share=total?Object.fromEntries(dims.map(d=>[d,raw[d]/total*100])):Object.fromEntries(dims.map(d=>[d,100/6]));
  const ordered=[...TYPES].sort((a,b)=>share[b.code]-share[a.code]);
  const primary=ordered[0],second=ordered[1];
  const contestMatches=CONTESTS.map(c=>({...c,match:dims.reduce((sum,d)=>sum+(share[d]/100*c.weights[d]),0)})).sort((a,b)=>b.match-a.match).slice(0,5);
  return {user:state.user,answers:[...state.answers],refinement:state.refinement,raw,share,primary:primary.code,second:second.code,contestMatches,createdAt:new Date().toISOString()};
}
function refreshContestMatches(profile){
  if(!profile?.share)return profile;
  profile.contestMatches=CONTESTS.map(c=>({...c,match:dims.reduce((sum,d)=>sum+(profile.share[d]/100*c.weights[d]),0)})).sort((a,b)=>b.match-a.match).slice(0,5);
  return profile;
}
function radarSvg(profile){
  const cx=140,cy=130,R=94,n=6,angle=i=>(-Math.PI/2+i*Math.PI*2/n),pt=(i,r)=>[cx+Math.cos(angle(i))*r,cy+Math.sin(angle(i))*r];
  const grid=[.25,.5,.75,1].map(k=>`<polygon points="${dims.map((_,i)=>pt(i,R*k).join(',')).join(' ')}" fill="none" stroke="#e4ebe7" stroke-width="1"/>`).join('');
  const axes=dims.map((d,i)=>{const [x,y]=pt(i,R);const [tx,ty]=pt(i,R+19);return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#e4ebe7"/><text x="${tx}" y="${ty+4}" text-anchor="middle" fill="${TYPES[i].color}" font-size="10" font-weight="700">${d}</text>`}).join('');
  const vals=dims.map(d=>Math.max(5,profile.share[d]));const poly=dims.map((d,i)=>pt(i,R*vals[i]/100).join(',')).join(' ');
  const dots=dims.map((d,i)=>{const [x,y]=pt(i,R*vals[i]/100);return `<circle cx="${x}" cy="${y}" r="3.5" fill="#d85f8d" stroke="white" stroke-width="1.5"/>`}).join('');
  return `<svg class="radar-svg" viewBox="0 0 280 260" aria-label="六维竞赛人格雷达图">${grid}${axes}<polygon points="${poly}" fill="#e99ab7" fill-opacity=".24" stroke="#d85f8d" stroke-width="2.5"/>${dots}<circle cx="${cx}" cy="${cy}" r="2" fill="#d85f8d"/></svg>`;
}
function renderResult(profile){
  const primary=TYPES.find(t=>t.code===profile.primary),second=TYPES.find(t=>t.code===profile.second);
  const scoreRows=TYPES.map(t=>`<div class="score-row"><span class="score-code" style="--score:${t.color}">${t.code}</span><span class="score-label">${t.title}</span><span class="score-pct" data-score-value="${profile.share[t.code]}">0.0%</span><div class="score-track"><div class="score-bar" style="--score:${t.color}" data-score-width="${profile.share[t.code]}"></div></div></div>`).join('');
  const matches=profile.contestMatches.map((c,i)=>`<div class="match-item"><span class="match-rank">0${i+1}</span><span><span class="match-name">${c.name}</span><span class="match-discipline">${c.field}</span></span><span class="match-score">${c.match.toFixed(0)}%</span></div>`).join('');
  const overlap=primary.code===second.code?'':`你的第二倾向是<strong>${second.name}</strong>（${profile.share[second.code].toFixed(1)}%）。${primary.name}与${second.name}的组合可能让你在${primary.title}上手时，也能借用${second.title}的长处。`;
  $('#resultContent').innerHTML=`<div class="result-hero"><article class="profile-card" style="--primary:${primary.color}"><div class="profile-avatar">${iconMarkup(primary,true)}</div><div class="profile-type-tag">${primary.code} · ${primary.title.toUpperCase()}</div><h2>${primary.name}</h2><p>${primary.desc}</p><div class="profile-mix">${primary.code} ${profile.share[primary.code].toFixed(0)}% <span>·</span> ${second.code} ${profile.share[second.code].toFixed(0)}% <span>·</span> ${profile.user.name} · ${profile.user.major}</div></article><div class="locked-feature result-paywall"><div class="locked-content" inert><article class="result-analysis"><div class="section-kicker">六维人格分布</div><div class="radar-layout"><div class="radar-wrap"><!-- radar --></div><div class="score-list">${scoreRows}</div></div></article></div><div class="locked-overlay"><span class="lock-icon" aria-hidden="true"></span><strong>解锁完整分析报告</strong><span>查看六维雷达图与逐维倾向解读</span><button class="button button-primary" type="button" data-unlock>立即解锁</button></div></div></div><section class="result-section"><div class="section-title-row"><h3>与你更接近的竞赛方向</h3><span>人格权重 × 截图赛事权重</span></div><div class="match-grid">${matches}</div><p class="match-formula">匹配度 = Σ（个人维度比例 × 赛事对应维度权重）。赛事权重录自参考图，表示比赛侧重点，不代表你的个人能力。</p></section><section class="result-section"><div class="section-title-row"><h3>给你的方向建议</h3><span>根据本次答题生成</span></div><p class="insight-copy">${profile.user.name}，从这次的回答看，你最容易被<strong>${primary.title}</strong>吸引，尤其适合先从<strong>${profile.contestMatches[0].name}</strong>了解赛制与组队方式。${overlap}综合题选择了<strong>${TYPES.find(t=>t.code===profile.refinement).title}</strong>，这为该方向提供了轻量加权，但不会单独决定最终类型。建议先用一个小项目或一场校内选拔验证兴趣，再决定投入强度。</p></section>`;
  $('.radar-wrap',$('#resultContent')).innerHTML=radarSvg(profile);
  bindPaywallButtons();
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    $$('.score-bar',$('#resultContent')).forEach(bar=>{bar.style.width=`${bar.dataset.scoreWidth}%`});
    $$('.score-pct',$('#resultContent')).forEach(label=>{
      const target=Number(label.dataset.scoreValue)||0,start=performance.now(),duration=700;
      const tick=now=>{const p=Math.min(1,(now-start)/duration);label.textContent=`${(target*p).toFixed(1)}%`;if(p<1)requestAnimationFrame(tick)};
      requestAnimationFrame(tick);
    });
  }));
}
function setProfile(profile){state.profile=profile;localStorage.setItem(storage.profile,JSON.stringify(profile));localStorage.removeItem(storage.draft);updateAssistantContext();}
async function submitResult(){
  const profile=calculate();setProfile(profile);$('#nextStep').disabled=true;$('#nextStep').textContent='正在保存…';
  try{const res=await fetch('/api/results',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:profile.user.name,major:profile.user.major,answers:profile.answers,refinement:profile.refinement,raw:profile.raw,share:profile.share,primary:profile.primary,second:profile.second,consent:true})});if(!res.ok)throw new Error('save failed');$('#chatStatus').textContent='测试结果已保存到学校 CMTI 服务。'}catch{$('#chatStatus').textContent='当前无法连接学校服务；结果暂存在此设备中。'}
  $('#nextStep').disabled=false;$('#nextStep').textContent='查看我的结果 →';goView('result');
}
function updateAssistantContext(){const p=state.profile;if(!p){$('#assistantContext').textContent='完成 CMTI 测试后，你的维度偏好会作为本次对话背景。';return}const sorted=[...TYPES].sort((a,b)=>p.share[b.code]-p.share[a.code]).slice(0,3);$('#assistantContext').textContent=`${p.user.major} · ${sorted.map(t=>`${t.title} ${p.share[t.code].toFixed(0)}%`).join(' / ')}。AI 对话只传递这些偏好摘要，不包含姓名。`}

let paywallTrigger=null;
function openPaywall(event){const dialog=$('#paywallDialog');paywallTrigger=event?.currentTarget||null;if(dialog&&typeof dialog.showModal==='function')dialog.showModal()}
function unlockPremiumDemo(){
  $('.site-shell').classList.add('premium-demo-unlocked');
  $$('.locked-content').forEach(content=>{content.inert=false;if(typeof content.removeAttribute==='function')content.removeAttribute('aria-hidden')});
  const assistantBadge=$('#assistantView .module-badge'),directoryBadge=$('#directoryView .module-badge');
  if(assistantBadge)assistantBadge.textContent='AI 助手 · 已解锁';
  if(directoryBadge)directoryBadge.textContent='完整版 · 已解锁';
}
function closePaywall(){const dialog=$('#paywallDialog');if(dialog?.open)dialog.close();unlockPremiumDemo();const trigger=paywallTrigger;paywallTrigger=null;if(trigger&&typeof trigger.focus==='function')window.setTimeout(()=>trigger.focus(),0)}
function bindPaywallButtons(){
  $$('[data-unlock]').forEach(button=>{if(button.dataset.paywallBound)return;button.dataset.paywallBound='true';button.addEventListener('click',openPaywall)});
}

function appendMessage(text,who){const d=document.createElement('div');d.className=`message ${who}`;const b=document.createElement('div');b.className='message-bubble';b.textContent=text;if(who==='assistant'){const av=document.createElement('div');av.className='assistant-avatar';av.textContent='C';d.append(av,b)}else d.append(b);$('#chatMessages').append(d);$('#chatMessages').scrollTop=$('#chatMessages').scrollHeight;return d}
function demoReply(question){const p=state.profile;if(!p)return '你可以先完成 CMTI 测试，我就能结合你的六维偏好给出更贴近你的竞赛建议。也可以先告诉我你感兴趣的方向、每周可投入时间和已有经验。';const best=TYPES.find(t=>t.code===p.primary),contest=p.contestMatches[0];if(/计划|准备|备赛|一个月/.test(question))return `结合你的${best.title}倾向，可以把接下来一个月分成四段：第 1 周了解赛制并补基础；第 2 周跟着一份入门材料完成小练习；第 3 周做一次限时模拟或小型项目；第 4 周复盘薄弱点、确认组队和报名。你当前最贴近 ${contest.name}，可以先找一场往年题或赛题试水。每周可投入时间不同，计划也应相应调整。`;if(/队友|组队/.test(question))return `你的主倾向是${best.name}，可优先找一位擅长${TYPES.find(t=>t.code===p.second).title}的队友互补。组队前一起做一次小练习或短周期项目，确认沟通节奏、时间投入和分工方式，比只看标签更可靠。`;return `从你的结果看，${best.name}是当前最突出的兴趣方向，${contest.name}与这组倾向匹配度最高（${contest.match.toFixed(0)}%）。建议先查看该赛事最近一届的赛题、组队规则和校内选拔安排，再做一个两周的小尝试。测试反映的是当前兴趣，不是能力上限；如果做着做着兴趣变化，随时可以重新探索。`}
async function sendChat(question){const q=question.trim();if(!q)return;appendMessage(q,'user');$('#chatInput').value='';$('#chatInput').disabled=true;$('.send-button').disabled=true;const pending=appendMessage('wait…','assistant');try{const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q,conversationId:cozeConversationId,userId:cozeUserId,profile:state.profile?{major:state.profile.user.major,share:state.profile.share,primary:state.profile.primary,second:state.profile.second}:null})});const data=await res.json();if(data.conversationId)cozeConversationId=data.conversationId;pending.remove();appendMessage(data.reply||demoReply(q),'assistant');$('#chatStatus').textContent=data.mode==='coze'?'回答由学校配置的 AI 助手生成。':'当前展示的是本地演示建议；配置 AI 服务后可使用个性化对话。'}catch{pending.remove();appendMessage(demoReply(q),'assistant');$('#chatStatus').textContent='网络暂不可用，先为你显示本地演示建议。'}finally{$('#chatInput').disabled=false;$('.send-button').disabled=false;$('#chatInput').focus()}}

function showWuxuanEasterEgg(name,major){
  if(name!=='武暄'){startQuiz(name,major);return}
  const dialog=$('#easterEggDialog');
  dialog.dataset.name=name;dialog.dataset.major=major;
  dialog.showModal();
}
function closeWuxuanEasterEgg(){const dialog=$('#easterEggDialog');const name=dialog.dataset.name,major=dialog.dataset.major;dialog.close();if(name&&major)startQuiz(name,major)}
$('#entryForm').addEventListener('submit',e=>{e.preventDefault();const name=$('#studentName').value,major=$('#studentMajor').value.trim();if(!name.trim()||!major||!$('#privacyConsent').checked)return;showWuxuanEasterEgg(name,major)});
$('#openPrivacy').addEventListener('click',e=>{e.preventDefault();$('#privacyDialog').showModal()});
$('#nextStep').addEventListener('click',()=>{if(state.step<24){if(!state.answers[state.step]){$(`#q${state.step}-1`).focus();return}transitionToStep(state.step+1)}else if(state.refinement)submitResult();else{$('input[name=refinement]').focus()}});
$('#prevStep').addEventListener('click',()=>{if(state.step>0)transitionToStep(state.step-1)});
$$('[data-easter-close]').forEach(button=>button.addEventListener('click',closeWuxuanEasterEgg));
$('#easterEggDialog').addEventListener('cancel',e=>{e.preventDefault();closeWuxuanEasterEgg()});
$$('[data-paywall-close]').forEach(button=>button.addEventListener('click',closePaywall));
$('#paywallDialog').addEventListener('cancel',e=>{e.preventDefault();closePaywall()});
$('#paywallDialog').addEventListener('click',e=>{if(e.target===$('#paywallDialog'))closePaywall()});
$('#exitQuiz').addEventListener('click',()=>{state.user=null;state.step=0;goView('result')});
$('#retakeTest').addEventListener('click',()=>{state.profile=null;state.user=null;state.answers=Array(24).fill(null);state.refinement=null;localStorage.removeItem(storage.profile);goView('result')});
$$('.nav-item').forEach(b=>b.addEventListener('click',()=>goView(b.dataset.view)));
$('#chatForm').addEventListener('submit',e=>{e.preventDefault();sendChat($('#chatInput').value)});
$$('[data-prompt]').forEach(b=>b.addEventListener('click',()=>sendChat(b.dataset.prompt)));
renderDirectory();
bindPaywallButtons();
fetch('/api/health').then(r=>r.json()).then(info=>{if(info.aiConfigured)$('#chatStatus').textContent='已连接学校配置的 AI 助手；提问时仅发送问题和兴趣摘要。';else $('#chatStatus').textContent='AI 服务尚未配置；当前可使用本地演示建议。'}).catch(()=>{});
try{const saved=localStorage.getItem(storage.profile);if(saved){state.profile=refreshContestMatches(JSON.parse(saved));state.user=state.profile.user;localStorage.setItem(storage.profile,JSON.stringify(state.profile));updateAssistantContext()}}catch{}
