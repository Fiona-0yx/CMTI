import http from 'node:http';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import contests from './contest-weights.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'results.json');
async function loadEnvFile() {
  try {
    const content = await readFile(path.join(ROOT, '.env'), 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!match || match[1] in process.env) continue;
      const value = match[2].replace(/^(['"])(.*)\1$/, '$2');
      process.env[match[1]] = value;
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
await loadEnvFile();
const PORT = Number(process.env.PORT || 4174);
const HOST = process.env.HOST || '0.0.0.0';
const ADMIN_PASSWORD = process.env.CMTI_ADMIN_PASSWORD || '';
const COZE_TOKEN = process.env.COZE_API_TOKEN || '';
const COZE_BOT_ID = process.env.COZE_BOT_ID || '7688608892233777215';
const COZE_BASE = (process.env.COZE_API_BASE || 'https://api.coze.cn').replace(/\/$/, '');
const SESSION_TTL = 6 * 60 * 60 * 1000;
const TYPE_CODES = ['A', 'E', 'I', 'S', 'H', 'M'];
const sessions = new Map();
const loginAttempts = new Map();
let writeQueue = Promise.resolve();

const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
function json(res, status, data, headers={}) {
  res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers});
  res.end(JSON.stringify(data));
}
function cookies(req) { return Object.fromEntries((req.headers.cookie || '').split(';').map(x=>x.trim()).filter(Boolean).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),decodeURIComponent(x.slice(i+1))]})); }
function session(req) {
  const token=cookies(req).cmti_admin;
  const item=token&&sessions.get(token);
  if(!item)return null;
  if(item.expires<Date.now()){sessions.delete(token);return null;}
  item.expires=Date.now()+SESSION_TTL;
  return token;
}
function requireAdmin(req,res) { if(!session(req)){json(res,401,{error:'请先登录管理员后台。'});return false;}return true; }
async function body(req,limit=65536) {
  let size=0,buf=[];
  for await (const chunk of req) {size+=chunk.length;if(size>limit)throw Object.assign(new Error('请求内容过大'),{status:413});buf.push(chunk);}
  try{return JSON.parse(Buffer.concat(buf).toString('utf8'));}catch{throw Object.assign(new Error('请求格式无效'),{status:400});}
}
async function records() { try{return JSON.parse(await readFile(DATA_FILE,'utf8'));}catch(e){if(e.code==='ENOENT')return [];throw e;} }
function saveRecords(value) {
  writeQueue=writeQueue.then(async()=>{await mkdir(DATA_DIR,{recursive:true});const temp=DATA_FILE+'.tmp';await writeFile(temp,JSON.stringify(value,null,2),'utf8');await rename(temp,DATA_FILE);});
  return writeQueue;
}
function publicType(code) { return TYPE_CODES.includes(code)?code:null; }
function calculate(answers,refinement) {
  const raw={};for(let i=0;i<6;i++){const avg=answers.slice(i*4,i*4+4).reduce((sum,v)=>sum+(v-1)/6,0)/4;raw[TYPE_CODES[i]]=avg*100;}
  raw[refinement]*=1.10;
  const total=Object.values(raw).reduce((a,b)=>a+b,0);
  const share=total?Object.fromEntries(TYPE_CODES.map(k=>[k,raw[k]/total*100])):Object.fromEntries(TYPE_CODES.map(k=>[k,100/6]));
  const order=[...TYPE_CODES].sort((a,b)=>share[b]-share[a]);
  const contestMatches=contests.map(c=>({...c,match:TYPE_CODES.reduce((sum,k)=>sum+share[k]/100*c.weights[k],0)})).sort((a,b)=>b.match-a.match).slice(0,5);
  return {raw,share,primary:order[0],second:order[1],contestMatches};
}
function validAnswers(answers) { return Array.isArray(answers)&&answers.length===24&&answers.every(x=>Number.isInteger(x)&&x>=1&&x<=7); }
function securityHeaders() {
  return {'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'same-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"};
}

async function cozeReply(message,profile,priorConversationId,userId) {
  if(!COZE_TOKEN||!COZE_BOT_ID)return null;
  const headers={Authorization:`Bearer ${COZE_TOKEN}`,'Content-Type':'application/json',Accept:'application/json'};
  async function upstreamError(response,step) {
    let detail='';
    try { detail=(await response.text()).slice(0,2000); } catch { detail='(无法读取错误正文)'; }
    if(COZE_TOKEN) detail=detail.split(COZE_TOKEN).join('[REDACTED]');
    console.error(`[coze] ${step} failed: HTTP ${response.status} ${response.statusText}; body: ${detail}`);
    return new Error(`Coze ${step} failed (${response.status})`);
  }
  console.log(`[coze] chat start: bot=${COZE_BOT_ID}, user=${userId}`);
  const context=profile?`用户完成了 CMTI 竞赛兴趣探索。专业：${profile.major||'未提供'}。六个维度归一化比例：${TYPE_CODES.map(k=>`${k} ${Number(profile.share?.[k]||0).toFixed(1)}%`).join('、')}。主倾向代码：${publicType(profile.primary)||'未知'}，次倾向代码：${publicType(profile.second)||'未知'}。请把这些信息仅作为兴趣参考，不要将其说成测得能力或心理诊断。\n\n用户问题：${message}`:message;
  const request={bot_id:COZE_BOT_ID,user_id:userId,stream:false,additional_messages:[{role:'user',content:context,content_type:'text'}]};
  if(priorConversationId)request.conversation_id=priorConversationId;
  const response=await fetch(`${COZE_BASE}/v3/chat`,{method:'POST',headers,body:JSON.stringify(request)});
  if(!response.ok)throw await upstreamError(response,'chat');
  const result=await response.json();
  if(result.code&&result.code!==0){console.error(`[coze] chat API error: code=${result.code}; msg=${String(result.msg||result.message||'').slice(0,2000)}`);throw new Error('Coze chat API error');}
  let data=result.data||{},chatId=data.id,conversationId=data.conversation_id;
  if(!chatId||!conversationId){console.error('[coze] chat response missing data.id or data.conversation_id');throw new Error('Coze chat response incomplete');}
  console.log(`[coze] chat accepted: conversation_id=${conversationId}, chat_id=${chatId}`);
  let status=data.status;
  for(let i=0;i<24&&status!=='completed'&&status!=='failed'&&status!=='requires_action';i++){
    await new Promise(resolve=>setTimeout(resolve,900));
    const poll=await fetch(`${COZE_BASE}/v3/chat/retrieve?conversation_id=${encodeURIComponent(conversationId)}&chat_id=${encodeURIComponent(chatId)}`,{headers});
    if(!poll.ok)throw await upstreamError(poll,'chat/retrieve');
    const payload=await poll.json();data=payload.data||data;status=data.status;
    console.log(`[coze] retrieve ${i+1}: status=${status}`);
  }
  if(status!=='completed'){console.error(`[coze] retrieve ended without completed status: ${status}`);throw new Error('Coze chat did not complete');}
  const messages=await fetch(`${COZE_BASE}/v3/chat/message/list?conversation_id=${encodeURIComponent(conversationId)}&chat_id=${encodeURIComponent(chatId)}`,{headers});
  if(!messages.ok)throw await upstreamError(messages,'chat/message/list');
  const list=await messages.json();
  const items=Array.isArray(list.data)?list.data:(Array.isArray(list.data?.messages)?list.data.messages:[]);
  const answer=items.filter(m=>m?.role==='assistant'&&(m?.type==='answer'||!m?.type)).at(-1)?.content;
  if(typeof answer!=='string'||!answer.trim()){console.error(`[coze] message/list contained no assistant text; items=${items.length}`);return null;}
  console.log(`[coze] reply received: ${answer.length} chars`);
  return {reply:answer,conversationId};
}

async function api(req,res,url) {
  if(req.method==='GET'&&url.pathname==='/api/health'){json(res,200,{ok:true,aiConfigured:Boolean(COZE_TOKEN&&COZE_BOT_ID)});return true;}
  if(req.method==='POST'&&url.pathname==='/api/results'){
    const input=await body(req);
    const name=String(input.name||'').trim(),major=String(input.major||'').trim(),refinement=publicType(input.refinement);
    if(input.consent!==true||!name||name.length>60||!major||major.length>80||!validAnswers(input.answers)||!refinement){json(res,400,{error:'请检查资料、隐私同意和答题内容。'});return true;}
    const score=calculate(input.answers,refinement);
    const record={id:randomUUID(),name,major,answers:input.answers,refinement,...score,consentedAt:new Date().toISOString(),createdAt:new Date().toISOString()};
    const all=await records();all.unshift(record);await saveRecords(all);
    json(res,201,{saved:true,id:record.id});return true;
  }
  if(req.method==='POST'&&url.pathname==='/api/admin/login'){
    const ip=req.socket.remoteAddress||'unknown',attempt=loginAttempts.get(ip)||{count:0,start:Date.now()};
    if(Date.now()-attempt.start>10*60*1000){attempt.count=0;attempt.start=Date.now();}
    if(attempt.count>=8){json(res,429,{error:'尝试次数过多，请 10 分钟后再试。'});return true;}
    const input=await body(req,4096),expected=ADMIN_PASSWORD;
    const supplied=String(input.password||'');
    if(!expected){json(res,503,{error:'管理员尚未配置 CMTI_ADMIN_PASSWORD。'});return true;}
    const hash=s=>createHash('sha256').update(s).digest();
    if(!supplied||!hash(supplied).equals(hash(expected))){attempt.count++;loginAttempts.set(ip,attempt);json(res,401,{error:'密码不正确。'});return true;}
    loginAttempts.delete(ip);const token=randomBytes(32).toString('base64url');sessions.set(token,{expires:Date.now()+SESSION_TTL});
    json(res,200,{ok:true},{'Set-Cookie':`cmti_admin=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=${SESSION_TTL/1000}${req.socket.encrypted?'; Secure':''}`});return true;
  }
  if(req.method==='POST'&&url.pathname==='/api/admin/logout'){
    const token=session(req);if(token)sessions.delete(token);
    json(res,200,{ok:true},{'Set-Cookie':'cmti_admin=; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=0'});return true;
  }
  if(req.method==='GET'&&url.pathname==='/api/admin/results'){
    if(!requireAdmin(req,res))return true;
    const all=await records();json(res,200,{results:all.map(({id,name,major,primary,second,share,createdAt})=>({id,name,major,primary,second,share,createdAt}))});return true;
  }
  if(req.method==='DELETE'&&url.pathname.startsWith('/api/admin/results/')){
    if(!requireAdmin(req,res))return true;
    const id=decodeURIComponent(url.pathname.slice('/api/admin/results/'.length));const all=await records(),next=all.filter(r=>r.id!==id);
    if(next.length===all.length){json(res,404,{error:'找不到这条记录。'});return true;}
    await saveRecords(next);json(res,200,{deleted:true});return true;
  }
  if(req.method==='POST'&&url.pathname==='/api/chat'){
    const input=await body(req,16384),message=String(input.message||'').trim();
    if(!message||message.length>1200){json(res,400,{error:'问题不能为空且不超过 1200 字。'});return true;}
    const profile=input.profile&&typeof input.profile==='object'?input.profile:null;
    const conversationId=typeof input.conversationId==='string'&&input.conversationId.length<=128?input.conversationId:null;
    const userId=typeof input.userId==='string'&&/^[a-zA-Z0-9-]{8,80}$/.test(input.userId)?input.userId:'cmti-anonymous-student';
    try{const result=await cozeReply(message,profile,conversationId,userId);if(result){json(res,200,{...result,mode:'coze'});return true;}}
    catch(error){console.error(`[coze] request failed: ${error?.message||error}`);}
    json(res,200,{mode:'demo',reply:null});return true;
  }
  return false;
}

const server=http.createServer(async(req,res)=>{
  Object.entries(securityHeaders()).forEach(([k,v])=>res.setHeader(k,v));
  try{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname.startsWith('/api/')){if(await api(req,res,url))return;json(res,404,{error:'未找到接口。'});return;}
    let pathname=url.pathname==='/'?'/index.html':url.pathname==='/admin'?'/admin.html':url.pathname;
    let decoded;try{decoded=decodeURIComponent(pathname)}catch{res.writeHead(400);res.end('Bad request');return;}
    const file=path.resolve(ROOT,'.'+decoded);
    if(!file.startsWith(ROOT+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
    const ext=path.extname(file);res.setHeader('Content-Type',mime[ext]||'application/octet-stream');
    // Frontend code and markup must reflect changes immediately during school deployment.
    res.setHeader('Cache-Control',['.html','.js','.css'].includes(ext)?'no-store':'public, max-age=3600');
    const stream=createReadStream(file);stream.on('error',()=>{if(!res.headersSent){res.writeHead(404);res.end('Not found');}});stream.pipe(res);
  }catch(error){if(!res.headersSent)json(res,error.status||500,{error:error.status?error.message:'服务器暂时无法处理请求。'});else res.end();}
});

server.listen(PORT,HOST,()=>console.log(`CMTI is running on ${HOST}:${PORT}`));
