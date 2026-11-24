import { firebaseConfig, vapidKey } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { initializeFirestore, persistentLocalCache, collection, doc, addDoc, setDoc, getDoc, updateDoc, onSnapshot, query, where, orderBy, serverTimestamp, arrayUnion } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js';
import { getMessaging, getToken, isSupported } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging.js';

const app = document.getElementById('app');
const CONFIGURED = firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('COLE');

// ---------- ícones ----------
const LOGO = `<svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true"><g stroke="#fff" stroke-width="1.6" opacity=".9"><path d="M15 15 6 7M15 15l9-8M15 15l-9 8M15 15l9 8M15 15V3"/></g><circle cx="15" cy="15" r="4" fill="#fff"/><circle cx="6" cy="7" r="2.6" fill="#8fc4ff"/><circle cx="24" cy="7" r="2.6" fill="#fff"/><circle cx="6" cy="23" r="2.6" fill="#fff"/><circle cx="24" cy="23" r="2.6" fill="#8fc4ff"/><circle cx="15" cy="3" r="2.2" fill="#fff"/></svg>`;
const I = {
  plus:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  back:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  chev:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>',
  down:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>',
  search:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7b8781" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  check:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
  send:'<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20l18-8L3 4v6l12 2-12 2z"/></svg>',
  mic:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  trash:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  share:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 8l5-5 5 5M5 13v6h14v-6"/></svg>',
  people:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="8" r="3.4"/><circle cx="17" cy="9" r="2.6"/><path d="M2.5 19c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5zM15.5 13.6c3 .1 5.3 1.8 6 5.4h-4.6c-.3-2-.8-3.6-1.4-5.4z"/></svg>',
  google:'<svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>'
};

// ---------- utilidades ----------
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ms = t => !t ? 0 : t.toMillis ? t.toMillis() : +t;
const hhmm = t => new Date(t).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
const when = t => { if(!t) return ''; const d=new Date(t), n=new Date(); if(d.toDateString()===n.toDateString()) return hhmm(t);
  const y=new Date(n); y.setDate(n.getDate()-1); if(d.toDateString()===y.toDateString()) return 'Ontem';
  if(n-d < 6*864e5) return d.toLocaleDateString('pt-BR',{weekday:'short'}).replace('.','').replace(/^./,c=>c.toUpperCase());
  return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}); };
const dur = x => { x=Math.round(x||0); return Math.floor(x/60)+':'+String(x%60).padStart(2,'0'); };
const ini = s => (String(s||'?').replace('#','').trim()[0]||'?').toUpperCase();
const rand = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), b => b.toString(36).padStart(2,'0')).join('').slice(0,20);
const prev = m => !m ? '' : m.kind==='img'?'📷 Foto':m.kind==='vid'?'🎥 Vídeo':m.kind==='aud'?'🎤 Áudio'+(m.dur?' ('+dur(m.dur)+')':''):m.text;
const STOP = new Set('a o os as de da do das dos e em no na nos nas num numa um uma uns umas para pra pro pros por com sem que se me te lhe voce vc voces vcs vamos vou eu ele ela nos gente pessoal galera oi ola bom boa dia tarde noite tudo isso esse essa este esta aqui la ja mas ou como qual quando onde ao aos tem ter vai vao ser esta estao foi muito mais menos meu minha seu sua quem alguem hoje amanha topa topam bora sim nao ai hein ne entao tambem the'.split(' '));
const autoTitle = m => {
  const d=new Date(), tag=d.getDate()+'_'+String(d.getMonth()+1).padStart(2,'0');
  if(m.kind && m.kind!=='text') return {img:'#foto',vid:'#video',aud:'#audio'}[m.kind]+tag;
  const w=(m.text||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(x=>x.length>2&&!STOP.has(x));
  return w.length ? '#'+w.slice(0,2).join('') : '#papo'+tag;
};

// ---------- ambiente ----------
const UA = navigator.userAgent;
const IOS = /iPhone|iPad|iPod/.test(UA) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
const ANDROID = /Android/.test(UA);
const INAPP = /FBAN|FBAV|FB_IAB|Instagram|WhatsApp|Line\/|Snapchat|TikTok|musical_ly|Twitter|LinkedInApp|GSA\//i.test(UA) || (IOS && !/Safari\//.test(UA)) || (ANDROID && /; wv\)/.test(UA));
const STANDALONE = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
let installEvt = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; render(); });
addEventListener('appinstalled', () => { installEvt = null; S.modal = null; render(); });
const lsGet = k => { try { return localStorage.getItem(k); } catch(e){ return null; } };
const lsSet = (k,v) => { try { localStorage.setItem(k,v); } catch(e){} };

// ---------- estado ----------
const S = { openReq:new URLSearchParams(location.search).get('s'), ready:false, user:null, groups:[], ses:{}, msgs:[], view:'home', open:null, grp:null, cur:null,
  sel:new Set(), q:'', q2:'', modal:null, anim:false, rec:null, up:0, toast:'', viewU:'', pending:false,
  join:new URLSearchParams(location.search).get('join'), joinInfo:null };
const U = { groups:null, ses:{}, msgs:null };
let auth, db, st, fapp;
const uid = () => S.user && S.user.uid;
const me = () => ({ name: S.user.displayName || (S.user.email||'').split('@')[0] || 'Eu', photo: S.user.photoURL || '' });
const G = id => S.groups.find(g => g.id === id);
const sessionsOf = gid => (S.ses[gid] || []).slice().sort((a,b) => ms(b.updatedAt)-ms(a.updatedAt));
const curS = () => (S.ses[S.grp]||[]).find(s => s.id === S.cur);
const nameOf = (u, g) => u===uid() ? 'Você' : (g && g.memberInfo && g.memberInfo[u] && g.memberInfo[u].name) || 'Alguém';
const short = (u, g) => nameOf(u, g).split(' ')[0];
const unread = s => s.lastMsg && s.lastMsg.from!==uid() && ms(s.lastMsg.at) > ms(s.reads && s.reads[uid()]);
const toast = t => { S.toast=t; render(); clearTimeout(toast.t); toast.t=setTimeout(()=>{S.toast='';render()}, 3200); };
const fail = e => { console.error(e); toast('Algo deu errado: '+(e && (e.code||e.message) || e)); };

// ---------- Firebase ----------
if (CONFIGURED) {
  const fa = initializeApp(firebaseConfig); fapp = fa;
  auth = getAuth(fa);
  db = initializeFirestore(fa, { localCache: persistentLocalCache() });
  st = getStorage(fa);
  onAuthStateChanged(auth, u => {
    S.user = u; S.ready = true; stopAll();
    if (u) { watchGroups(); if (S.join) loadInvite(); if (NOTIF() && Notification.permission==='granted') registerPush(); } else setBadge(0);
    render();
  });
} else { S.ready = true; }

function stopAll(){ U.groups && U.groups(); U.groups=null; Object.values(U.ses).forEach(f=>f()); U.ses={}; U.msgs && U.msgs(); U.msgs=null; S.groups=[]; S.ses={}; }

function watchGroups(){
  U.groups = onSnapshot(query(collection(db,'groups'), where('members','array-contains',uid())), snap => {
    S.groups = snap.docs.map(d => ({ id:d.id, ...d.data({serverTimestamps:'estimate'}) }));
    const ids = new Set(S.groups.map(g => g.id));
    for (const id in U.ses) if (!ids.has(id)) { U.ses[id](); delete U.ses[id]; delete S.ses[id]; }
    S.groups.forEach(g => {
      if (U.ses[g.id]) return;
      U.ses[g.id] = onSnapshot(query(collection(db,'groups',g.id,'sessions'), where('members','array-contains',uid())), sn => {
        S.ses[g.id] = sn.docs.map(d => ({ id:d.id, g:g.id, ...d.data({serverTimestamps:'estimate'}) }));
        setBadge(totalUnread()); render(true); if (S.view==='chat') markRead(); if (S.openReq) tryOpenReq();
      }, fail);
    });
    render(true);
  }, fail);
}

// ---------- contador no ícone e notificações ----------
const NOTIF = () => 'Notification' in window && 'serviceWorker' in navigator;
function totalUnread(){ return Object.values(S.ses).reduce((n,l)=>n+l.filter(unread).length,0); }
function setBadge(n){
  try { if (!('setAppBadge' in navigator)) return; n ? navigator.setAppBadge(n).catch(()=>{}) : navigator.clearAppBadge().catch(()=>{}); } catch(e){}
}
async function clearNotifs(sid){
  try { const reg=await navigator.serviceWorker.ready; (await reg.getNotifications({tag:sid})).forEach(n=>n.close()); } catch(e){}
}
async function enableNotifs(){
  if (!NOTIF()) return toast(IOS?'Instale o Connect na tela inicial para ativar as notificações.':'Este navegador não suporta notificações.');
  const p = await Notification.requestPermission();
  if (p!=='granted') { toast('Notificações não permitidas. Dá para ativar depois nos Ajustes do celular.'); render(); return; }
  setBadge(totalUnread()); await registerPush(); toast('Notificações ativadas!'); render();
}
async function registerPush(){
  try {
    if (!vapidKey || !(await isSupported())) return;
    const reg = await navigator.serviceWorker.ready;
    const token = await getToken(getMessaging(fapp), { vapidKey, serviceWorkerRegistration: reg });
    if (!token) return;
    const key='connect-push-'+uid();
    if (lsGet(key)===token) return;
    await setDoc(doc(db,'users',uid()), { tokens: arrayUnion(token), name: me().name }, { merge:true });
    lsSet(key, token);
  } catch(e){ console.warn('push', e); }
}

function openChat(gid, sid){
  clearNotifs(sid);
  if(!history.state) history.pushState({v:1},'');
  S.grp=gid; S.open=gid; S.cur=sid; S.msgs=[]; S.view='chat'; S.modal=null; S.q='';
  U.msgs && U.msgs();
  U.msgs = onSnapshot(query(collection(db,'groups',gid,'sessions',sid,'messages'), orderBy('at')), sn => {
    S.msgs = sn.docs.map(d => ({ id:d.id, ...d.data({serverTimestamps:'estimate'}) }));
    render(true); markRead();
  }, fail);
  render(); markRead();
}
function tryOpenReq(){
  const [gid,sid]=(S.openReq||'').split('.'); if(!gid||!sid) { S.openReq=null; return; }
  if ((S.ses[gid]||[]).some(s=>s.id===sid)) { S.openReq=null; history.replaceState(history.state,'',location.pathname); openChat(gid,sid); }
}
navigator.serviceWorker && navigator.serviceWorker.addEventListener('message', e => {
  if (e.data && e.data.type==='open' && S.user) { S.openReq=e.data.s; tryOpenReq(); }
});
function leaveChat(){ U.msgs && U.msgs(); U.msgs=null; S.cur=null; S.msgs=[]; if(S.rec) stopRec(false); }

function markRead(){
  const s=curS(); if(!s || !unread(s)) return;
  updateDoc(doc(db,'groups',S.grp,'sessions',s.id), {[`reads.${uid()}`]: serverTimestamp()}).catch(()=>{});
}

async function send(m){
  const s=curS(); if(!s) return;
  const sref = doc(db,'groups',S.grp,'sessions',s.id);
  const base = { from:uid(), fromName:me().name, at:serverTimestamp(), kind:m.kind||'text', text:m.text||'', url:m.url||'', dur:m.dur||0 };
  await addDoc(collection(sref,'messages'), base);
  const upd = { lastMsg:{ from:uid(), fromName:me().name, kind:base.kind, text:base.text.slice(0,200), dur:base.dur, at:serverTimestamp() },
    updatedAt:serverTimestamp(), [`reads.${uid()}`]:serverTimestamp() };
  if (!s.title && base.kind!=='sys') upd.title = autoTitle(base);
  await updateDoc(sref, upd);
}

async function upload(file, kind, d){
  if (file.size > 60*1024*1024) return toast('Arquivo grande demais (máx. 60 MB).');
  const gid=S.grp, sid=S.cur, ext=(file.type.split('/')[1]||'bin').split(';')[0].replace('quicktime','mov');
  S.up++; render();
  try {
    const r = ref(st, `media/${gid}/${sid}/${Date.now()}_${rand().slice(0,6)}.${ext}`);
    await uploadBytes(r, file, { contentType: file.type || 'application/octet-stream' });
    const url = await getDownloadURL(r);
    if (S.cur===sid) await send({ kind, url, dur:d });
    else { // usuário saiu do chat durante o envio
      const prevCur=S.cur, prevGrp=S.grp; S.cur=sid; S.grp=gid; await send({kind,url,dur:d}); S.cur=prevCur; S.grp=prevGrp; }
  } catch(e){ fail(e); } finally { S.up--; render(); }
}

async function createGroup(name){
  const gref = await addDoc(collection(db,'groups'), { name, owner:uid(), members:[uid()], memberInfo:{[uid()]:me()}, createdAt:serverTimestamp() });
  const token = rand();
  await setDoc(doc(db,'invites',token), { gid:gref.id, name, by:uid() });
  await updateDoc(gref, { invite:token });
  S.open=gref.id; S.grp=gref.id; S.modal='invite'; render();
}
const inviteUrl = g => location.origin + location.pathname + '?join=' + g.invite;
async function shareInvite(g){
  const url = inviteUrl(g);
  if (navigator.share) { try { await navigator.share({ title:'Connect', text:`Entra no grupo ${g.name} no Connect:`, url }); return; } catch(e){ if(e.name==='AbortError') return; } }
  try { await navigator.clipboard.writeText(url); toast('Link copiado!'); } catch(e){ toast('Copie o link acima.'); }
}
async function loadInvite(){
  try {
    const snap = await getDoc(doc(db,'invites',S.join));
    if (!snap.exists()) { toast('Convite inválido ou expirado.'); clearJoin(); return; }
    S.joinInfo = snap.data();
    if (S.groups.some(g=>g.id===S.joinInfo.gid)) { S.open=S.joinInfo.gid; clearJoin(); render(); return; }
    S.modal='join'; render();
  } catch(e){ fail(e); clearJoin(); }
}
function clearJoin(){ S.join=null; history.replaceState(history.state,'',location.pathname); }
async function acceptJoin(){
  const { gid } = S.joinInfo, token=S.join;
  try {
    await updateDoc(doc(db,'groups',gid), { members:arrayUnion(uid()), [`memberInfo.${uid()}`]:me(), lastInvite:token });
    S.open=gid; clearJoin(); S.joined=S.joinInfo.name; S.modal=STANDALONE()?null:'install'; if(!S.modal) toast('Você entrou no grupo!'); render();
  } catch(e){ fail(e); }
}
async function startSession(){
  const gid=S.grp, members=[uid(), ...S.sel];
  const r = await addDoc(collection(db,'groups',gid,'sessions'), { members, createdBy:uid(), createdAt:serverTimestamp(), updatedAt:serverTimestamp(), title:'', lastMsg:null, reads:{} });
  openChat(gid, r.id);
}
async function addPeople(ids){
  const s=curS(), g=G(S.grp);
  await updateDoc(doc(db,'groups',S.grp,'sessions',s.id), { members:arrayUnion(...ids) });
  await send({ kind:'sys', text:`${me().name.split(' ')[0]} chamou ${ids.map(i=>short(i,g)).join(', ')} para a conversa` });
}

// ---------- áudio ----------
async function startRec(){
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) throw 0;
    const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
    const mr = new MediaRecorder(stream), ch=[];
    mr.ondataavailable = e => e.data.size && ch.push(e.data); mr.start();
    S.rec = { mr, ch, stream, t0:Date.now() }; render();
    S.recT = setInterval(() => { const el=document.getElementById('rt'); if(el&&S.rec) el.textContent=dur((Date.now()-S.rec.t0)/1000); }, 250);
  } catch(e){ S.modal='nomic'; render(); }
}
function stopRec(ok){
  const r=S.rec; if(!r) return; clearInterval(S.recT); const d=(Date.now()-r.t0)/1000;
  r.mr.onstop = () => { r.stream.getTracks().forEach(t=>t.stop());
    if (ok && r.ch.length) upload(new Blob(r.ch, { type:r.mr.mimeType || 'audio/webm' }), 'aud', d); };
  r.mr.stop(); S.rec=null; render();
}

// ---------- telas ----------
const avatarBtn = () => `<button class="ib" data-act="profile" aria-label="Minha conta">${S.user.photoURL?`<img class="avimg" src="${esc(S.user.photoURL)}" alt="" referrerpolicy="no-referrer">`:`<span class="avt">${ini(me().name)}</span>`}</button>`;
const check = on => `<span class="ck">${on?I.check:''}</span>`;
const backBar = (title, sub='', right='') => `<header class="top"><button class="ib" data-act="back" aria-label="Voltar">${I.back}</button><div style="flex:1"><h1>${esc(title)}</h1>${sub?`<small>${esc(sub)}</small>`:''}</div>${right}</header>`;

const V = {
  setup(){ return `<div class="login"><div class="logo">${LOGO}Connect</div><p>Falta configurar o Firebase: cole o bloco <b>firebaseConfig</b> em <code>firebase-config.js</code>.</p></div>`; },
  login(){ const nw=S.mode==='new'; return `<div class="login"><div class="logo">${LOGO}Connect</div><p>${S.join?'Você recebeu um convite para um grupo. Entre para aceitar.':'Conversas rápidas com quem você escolher do seu grupo de amigos.'}</p>
    ${INAPP?`<div class="warn"><b>Você está num navegador dentro de outro app.</b> Para entrar com Google e instalar o Connect, abra este link no ${IOS?'Safari':'Chrome'}${IOS?' (toque em ⋯ ou no ícone de bússola e escolha "Abrir no Safari")':' (toque em ⋮ e escolha "Abrir no Chrome")'}.<button class="cta ghost wb" data-act="copylink">Copiar link</button><span style="font-size:13px;opacity:.85">Ou entre com e-mail aqui embaixo.</span></div>`:''}
    <button class="gbtn" data-act="login">${I.google} Entrar com Google</button>
    <div class="or">ou com e-mail</div>
    <form class="lform" id="lf">${nw?'<input class="lin" id="ln" placeholder="Seu nome" autocomplete="name" required maxlength="40">':''}
      <input class="lin" id="le" type="email" placeholder="E-mail" autocomplete="email" required>
      <input class="lin" id="lp" type="password" placeholder="Senha (mín. 6 caracteres)" autocomplete="${nw?'new-password':'current-password'}" required minlength="6">
      <button class="gbtn" style="justify-content:center">${nw?'Criar conta':'Entrar'}</button></form>
    <button class="lk" data-act="mode">${nw?'Já tenho conta':'Primeira vez? Criar conta'}</button>${nw?'':'<button class="lk" data-act="reset">Esqueci a senha</button>'}</div>`; },
  home(){
    const q=S.q.toLowerCase();
    const list=S.groups.map(g=>{const ss=sessionsOf(g.id); return {g,ss,t:Math.max(ms(g.createdAt),...ss.map(s=>ms(s.updatedAt))),u:ss.filter(unread).length}})
      .filter(o=>!q||o.g.name.toLowerCase().includes(q)).sort((a,b)=>b.t-a.t);
    return `<header class="top"><div class="logo">${LOGO}Connect</div><span class="sp"></span><button class="ib" data-act="newgroup" aria-label="Criar grupo">${I.plus}</button>${avatarBtn()}</header><div class="body">
      ${S.groups.length>3?`<label class="search">${I.search}<input id="q" placeholder="Buscar grupo" value="${esc(S.q)}" aria-label="Buscar grupo"></label>`:''}
      ${!STANDALONE()&&!lsGet('connect-hide-install')?`<div class="ibar"><span style="flex:1"><b>Instale o Connect</b> na tela inicial para abrir como um app.</span><button class="cta" style="width:auto;height:38px;padding:0 14px;font-size:14px" data-act="install">Como?</button><button class="ib" data-act="hideinst" aria-label="Fechar" style="width:36px;height:36px">✕</button></div>`:''}
      ${NOTIF()&&Notification.permission==='default'&&(STANDALONE()||!IOS)?`<div class="ibar"><span style="flex:1"><b>Ative as notificações</b> para ver mensagens novas no ícone do app.</span><button class="cta" style="width:auto;height:38px;padding:0 14px;font-size:14px" data-act="notif">Ativar</button></div>`:''}
      <div class="sec">Grupos <span class="cnt">${S.groups.length}</span></div>
      ${list.map(({g,ss,t,u})=>{const open=S.open===g.id; return `<div class="grp ${open?'open':''}" id="grp-${g.id}"><button class="row ghead" data-act="group" data-id="${g.id}" aria-expanded="${open}"><span class="av g">${I.people}</span>
        <span class="rc"><span class="rt"><b class="gt">${esc(g.name)}</b><span class="tm ${u?'on':''}">${when(t)}</span></span>
        <span class="l3"><span>${g.members.length} ${g.members.length===1?'membro':'membros'} · ${ss.length} ${ss.length===1?'conversa':'conversas'}</span>${u?`<span class="badge">${u}</span>`:''}</span></span><span class="arr">${I.chev}</span></button>
        ${open?drawer(g,ss):''}</div>`}).join('')
        || `<div class="empty">${S.q?'Nenhum grupo encontrado.':'Você ainda não tem grupos.<br><br>Toque no <b>+</b> lá em cima para criar o primeiro e convidar seus amigos.'}</div>`}
      </div>`;
  },
  select(){
    const g=G(S.grp), q=S.q.toLowerCase(), n=S.sel.size;
    const others=g.members.filter(m=>m!==uid()), list=others.filter(m=>nameOf(m,g).toLowerCase().includes(q));
    return backBar(g.name, `${g.members.length} membros`)+`<div class="body">
      <div class="sec">Selecionar amigos <span class="cnt">${n}</span><span style="flex:1"></span>${others.length>1?`<button class="link" data-act="all">${n===others.length?'Limpar':'Todos'}</button>`:''}</div>
      ${others.length>6?`<label class="search" style="margin-top:0">${I.search}<input id="q" placeholder="Buscar contato" value="${esc(S.q)}" aria-label="Buscar contato"></label>`:''}
      <div class="chips">${[...S.sel].map(m=>`<button class="chip" data-act="tog" data-id="${m}"><i>${ini(nameOf(m,g))}</i>${esc(short(m,g))} ✕</button>`).join('')}</div>
      ${list.map(m=>`<button class="row ${S.sel.has(m)?'on':''}" data-act="tog" data-id="${m}"><span class="av sm">${ini(nameOf(m,g))}</span><span class="rc"><b>${esc(nameOf(m,g))}</b></span>${check(S.sel.has(m))}</button>`).join('')}
    </div><div class="foot"><button class="cta" data-act="start" ${n?'':'disabled'}>${n===0?'Escolha quem vai conversar':n===1?`Conversar com ${esc(short([...S.sel][0],g))}`:`Iniciar conversa com ${n} amigos`} →</button></div>`;
  },
  chat(){
    const s=curS(), g=G(S.grp);
    if(!s||!g) return backBar('Conversa')+`<div class="empty">Carregando…</div>`;
    const big=s.members.length>2;
    const sub=`${g.name} · ${s.members.length}/${g.members.length} conectados`;
    const msgs=S.msgs.map(m=>m.kind==='sys'?`<div class="sys">${esc(m.text)}</div>`:`<div class="msg ${m.from===uid()?'me':''} ${m.kind!=='text'?'hasm':''}">${m.from!==uid()&&big?`<div class="who">${esc((m.fromName||nameOf(m.from,g)).split(' ')[0])}</div>`:''}${body(m)}<div class="mt">${m.at?hhmm(ms(m.at)):''}</div></div>`).join('');
    const rest=g.members.filter(m=>!s.members.includes(m)).length;
    return backBar(s.title||'Nova conversa', sub, `<button class="ib" data-act="info" aria-label="Detalhes da conversa">${I.down}</button>`)+
      `<div class="chatbody" id="cb"><div class="sys">${S.msgs.length?'Conversa entre '+esc(s.members.filter(m=>m!==uid()).map(m=>short(m,g)).join(', '))+' e você':'O nome da conversa é criado automaticamente com a primeira mensagem.'}</div>${msgs}${S.up?`<div class="sys">Enviando ${S.up>1?S.up+' arquivos':'arquivo'}…</div>`:''}</div>
      <div class="members">${s.members.filter(m=>m!==uid()).map(m=>`<span class="chip"><i>${ini(nameOf(m,g))}</i>${esc(short(m,g))}</span>`).join('')}${rest?`<button class="chip add" data-act="addppl">+ ${rest} do grupo</button>`:''}</div>
      ${S.rec?`<div class="compose recbar"><button class="ib" style="color:#c62828" data-act="recx" aria-label="Descartar áudio">${I.trash}</button><span class="dot"></span><b id="rt">0:00</b><span style="flex:1;color:var(--mut)">Gravando…</span><button class="send" data-act="recok" aria-label="Enviar áudio">${I.send}</button></div>`
       :`<form class="compose" id="cf"><label class="ib att" for="fmedia" role="button" tabindex="0" aria-label="Enviar foto ou vídeo" style="cursor:pointer">${I.plus}</label><input id="msg" placeholder="Mensagem" autocomplete="off" aria-label="Mensagem"><button class="send" id="sb" type="button" data-act="rec" aria-label="Gravar áudio">${I.mic}</button></form>`}`;
  }
};
const body = m => m.kind==='img'?`<button class="media" data-act="view" data-u="${esc(m.url)}"><img src="${esc(m.url)}" alt="Foto" loading="lazy"></button>`
  : m.kind==='vid'?`<video class="media" src="${esc(m.url)}" controls playsinline preload="metadata"></video>`
  : m.kind==='aud'?`<audio src="${esc(m.url)}" controls preload="metadata"></audio>` : esc(m.text);

function drawer(g, all){
  const q=S.q2.toLowerCase(), alone=g.members.length<2;
  const list=all.filter(s=>!q||((s.title||'')+' '+s.members.map(m=>nameOf(m,g)).join(' ')+' '+prev(s.lastMsg)).toLowerCase().includes(q));
  const rows=list.map(s=>{const l=s.lastMsg; return `<button class="row" data-act="open" data-id="${s.id}" data-g="${g.id}">
      <span class="rc"><span class="rt"><b>${esc(s.title||'Nova conversa')}</b><span class="tm ${unread(s)?'on':''}">${when(ms(s.updatedAt))}</span></span>
      <span class="l2"><b style="color:var(--brand)">${s.members.length}/${g.members.length}</b> conectados · ${esc(s.members.filter(m=>m!==uid()).map(m=>short(m,g)).join(', '))}</span>
      <span class="l3"><span>${l?esc(l.from===uid()?'Você: ':(l.fromName||'').split(' ')[0]+': ')+esc(prev(l)):'<i>Sem mensagens ainda</i>'}</span>${unread(s)?`<span class="badge">•</span>`:''}</span></span></button>`}).join('');
  return `<div class="drawer ${S.anim?'anim':''}"><div class="dtools"><button class="pill" data-act="new" ${alone?'disabled':''}>${I.plus} Nova Sessão</button><button class="pill alt" data-act="invite">${I.share} Convidar</button>
    ${all.length>3?`<label class="search sm">${I.search}<input id="q2" placeholder="Buscar conversa" value="${esc(S.q2)}" aria-label="Buscar conversa"></label>`:''}</div>
    ${rows||`<div class="empty" style="padding:18px">${S.q2?'Nenhuma conversa encontrada.':alone?'Convide amigos para o grupo para começar a conversar.':'Nenhuma conversa ainda. Toque em <b>Nova Sessão</b>.'}</div>`}</div>`;
}

const M = {
  newgroup:()=>`<form class="sheet" id="ngf"><h2>Novo grupo</h2><input class="fld" id="ngn" placeholder="Nome do grupo, ex.: #ficaadica" maxlength="40" required><button class="cta">Criar e convidar amigos</button></form>`,
  invite:()=>{const g=G(S.grp); if(!g||!g.invite) return `<div class="sheet"><h2>Preparando convite…</h2></div>`;
    return `<div class="sheet"><h2>Convidar para ${esc(g.name)}</h2><div class="note" style="padding-top:0">Mande este link para os amigos. Quem abrir e entrar com Google passa a fazer parte do grupo.</div><div class="linkbox">${esc(inviteUrl(g))}</div><button class="cta" data-act="share">${I.share} Compartilhar link</button></div>`},
  join:()=>`<div class="sheet"><h2>Entrar no grupo ${esc(S.joinInfo.name)}?</h2><div class="note" style="padding-top:0">Os membros vão ver seu nome e foto do Google.</div><button class="cta" data-act="accept">Entrar no grupo</button><button class="cta ghost" data-act="decline">Agora não</button></div>`,
  info:()=>{const s=curS(), g=G(S.grp); if(!s) return ''; return `<form class="sheet" id="rnf"><h2>Nome da conversa</h2><input class="fld" id="rnn" value="${esc(s.title||'')}" placeholder="#nomedaconversa" maxlength="40"><button class="cta">Salvar nome</button><div class="sub" style="margin-top:12px">Participantes (${s.members.length}/${g.members.length})</div>${s.members.map(m=>`<div class="row"><span class="av sm">${ini(nameOf(m,g))}</span><span class="rc">${esc(nameOf(m,g))}</span></div>`).join('')}</form>`},
  addppl:()=>{const s=curS(), g=G(S.grp); return `<div class="sheet"><h2>Chamar mais gente do ${esc(g.name)}</h2>${g.members.filter(m=>!s.members.includes(m)).map(m=>`<button class="row" data-act="addone" data-id="${m}"><span class="av sm">${ini(nameOf(m,g))}</span><span class="rc"><b>${esc(nameOf(m,g))}</b></span>${I.plus}</button>`).join('')}</div>`},
  install:()=>{
    const acct = S.user && (S.user.providerData||[]).some(p=>p.providerId==='google.com') ? 'a mesma conta Google' : `o mesmo e-mail (${esc(S.user&&S.user.email||'')})`;
    const head = S.joined ? `<h2>Você entrou no ${esc(S.joined)}! 🎉</h2><div class="note" style="padding-top:0;font-size:15px">Agora instale o Connect para abrir direto pela tela inicial:</div>` : `<h2>Instalar o Connect</h2>`;
    let steps;
    if (installEvt) steps = `<button class="cta" data-act="doinstall">Instalar app</button>`;
    else if (IOS && INAPP) steps = `<ol class="steps"><li>Abra este link no <b>Safari</b> (toque em ⋯ ou na bússola → "Abrir no Safari").</li><li>No Safari, toque em <b>Compartilhar</b> <span class="ic">⬆︎</span>.</li><li>Escolha <b>"Adicionar à Tela de Início"</b> e toque em Adicionar.</li></ol><button class="cta ghost" data-act="copylink">Copiar link</button>`;
    else if (IOS) steps = `<ol class="steps"><li>Toque em <b>Compartilhar</b> <span class="ic">⬆︎</span> na barra do Safari.</li><li>Role e escolha <b>"Adicionar à Tela de Início"</b>.</li><li>Toque em <b>Adicionar</b>.</li></ol>`;
    else if (ANDROID) steps = `<ol class="steps"><li>No Chrome, toque no menu <b>⋮</b> no canto de cima.</li><li>Escolha <b>"Instalar app"</b> ou <b>"Adicionar à tela inicial"</b>.</li><li>Confirme em <b>Instalar</b>.</li></ol>`;
    else steps = `<ol class="steps"><li>No Chrome ou Edge, clique no ícone de instalar na barra de endereço.</li><li>Ou abra este link no celular e siga as instruções de lá.</li></ol>`;
    return `<div class="sheet">${head}${steps}<div class="note">Depois, abra o Connect pelo ícone, entre com ${acct} e toque em <b>Ativar notificações</b> para ver as mensagens novas no ícone.</div><button class="link" data-act="closem" style="display:block;margin:0 auto">Agora não</button></div>`;
  },
  profile:()=>`<div class="sheet"><h2>${esc(me().name)}</h2><div class="note" style="padding-top:0">${esc(S.user.email||'')}</div>${STANDALONE()?'':'<button class="cta" data-act="install">Instalar na tela inicial</button>'}${NOTIF()&&Notification.permission==='default'&&(STANDALONE()||!IOS)?'<button class="cta" data-act="notif">Ativar notificações</button>':''}${NOTIF()&&Notification.permission==='denied'?'<div class="note">Notificações bloqueadas. Ative nos Ajustes do celular → Notificações → Connect.</div>':''}<button class="cta ghost" data-act="logout">Sair da conta</button></div>`,
  nomic:()=>`<div class="sheet"><h2>Microfone indisponível</h2><div class="note" style="padding-top:0;font-size:15px">Permita o uso do microfone para o Connect nas configurações do celular ou do navegador. Enquanto isso, dá para enviar um áudio já gravado:</div><label class="cta" for="faudio">${I.mic} Escolher arquivo de áudio</label></div>`,
  view:()=>`<img class="full" src="${esc(S.viewU)}" alt="Foto" data-act="close2">`
};

function render(soft){
  if (soft && S.view==='chat' && [...app.querySelectorAll('video,audio')].some(x=>!x.paused)) { S.pending=true; return; }
  S.pending=false;
  if (soft && S.rec) { // não recria a barra de gravação; só a lista
    const cb=document.getElementById('cb'); if (cb && S.view==='chat') { const tmp=document.createElement('div'); tmp.innerHTML=V.chat(); const nb=tmp.querySelector('#cb'); if(nb){cb.innerHTML=nb.innerHTML; cb.scrollTop=cb.scrollHeight;} }
    return;
  }
  const ob=app.querySelector('.body,.chatbody'), stay=ob&&S.lastView===S.view, st0=stay?ob.scrollTop:0, nearEnd=ob&&ob.id==='cb'&&ob.scrollHeight-ob.scrollTop-ob.clientHeight<120;
  const inp=document.getElementById('msg'), keep=inp?inp.value:'', focus=document.activeElement&&document.activeElement.id;
  const fv={}; app.querySelectorAll('.sheet input[id],.lform input[id]').forEach(i=>fv[i.id]=i.value);
  let html;
  if (!S.ready) html='<div class="login"><div class="empty" style="color:#fff">Carregando…</div></div>';
  else if (!CONFIGURED) html=V.setup();
  else if (!S.user) html=V.login();
  else { if(['select','chat'].includes(S.view)&&!G(S.grp)) S.view='home'; html=V[S.view](); }
  if (S.modal && S.user) html+=`<div class="scrim" data-act="close">${M[S.modal]()}</div>`;
  if (S.toast) html+=`<div class="toast" role="status">${esc(S.toast)}</div>`;
  app.innerHTML=html;
  for(const k in fv){ const i=document.getElementById(k); if(i) i.value=fv[k]; }
  const m=document.getElementById('msg'); if(m){ m.value=keep; if(keep.trim()) setSend(true); if(focus==='msg') m.focus({preventScroll:true}); }
  if (focus==='q'||focus==='q2'){ const q=document.getElementById(focus); if(q){q.focus(); q.setSelectionRange(q.value.length,q.value.length);} }
  const nb=app.querySelector('.body,.chatbody');
  if (nb) { if (nb.id==='cb') { if(!stay||nearEnd) nb.scrollTop=nb.scrollHeight; else nb.scrollTop=st0; }
    else if (stay) nb.scrollTop=st0; else if (S.view==='home'&&S.open){ const el=document.getElementById('grp-'+S.open); el&&el.scrollIntoView({block:'start'}); } }
  S.lastView=S.view;
  const f=document.querySelector('.sheet .fld'); if(f&&focus!==f.id&&S.modal!=='info') f.focus();
}
function setSend(t){ const b=document.getElementById('sb'); if(!b) return; b.type=t?'submit':'button'; if(t) b.removeAttribute('data-act'); else b.dataset.act='rec'; b.innerHTML=t?I.send:I.mic; b.setAttribute('aria-label',t?'Enviar':'Gravar áudio'); }
const go = v => { if(S.view==='chat'&&v!=='chat') leaveChat(); if(v!=='home'&&!history.state) history.pushState({v:1},''); S.view=v; S.q=''; S.modal=null; render(); };

// ---------- eventos ----------
app.addEventListener('click', e => {
  const b=e.target.closest('[data-act]'); if(!b) return;
  const a=b.dataset.act, id=b.dataset.id;
  if (a==='close'){ if(e.target===b){ if(S.modal==='join') clearJoin(); S.modal=null; render(); } return; }
  switch(a){
    case 'login': signInWithPopup(auth, new GoogleAuthProvider()).catch(err => {
        if (['auth/popup-blocked','auth/operation-not-supported-in-this-environment','auth/web-storage-unsupported'].includes(err.code)) toast('Este navegador bloqueou o login do Google. Abra no Safari/Chrome ou entre com e-mail.');
        else if (!['auth/popup-closed-by-user','auth/cancelled-popup-request'].includes(err.code)) fail(err); }); break;
    case 'mode': S.mode=S.mode==='new'?'':'new'; render(); break;
    case 'reset': { const em=(document.getElementById('le')||{}).value; if(!em) { toast('Digite seu e-mail acima.'); break; }
        sendPasswordResetEmail(auth, em).then(()=>toast('Enviamos um e-mail para trocar a senha.')).catch(fail); break; }
    case 'logout': S.modal=null; setBadge(0); signOut(auth); break;
    case 'profile': S.modal='profile'; render(); break;
    case 'notif': enableNotifs(); break;
    case 'install': S.joined=null; S.modal='install'; render(); break;
    case 'doinstall': if(installEvt){ installEvt.prompt(); installEvt.userChoice.finally(()=>{installEvt=null; S.modal=null; render();}); } break;
    case 'hideinst': lsSet('connect-hide-install','1'); render(); break;
    case 'closem': S.modal=null; render(); break;
    case 'copylink': navigator.clipboard.writeText(location.href).then(()=>toast('Link copiado! Cole no '+(IOS?'Safari':'Chrome')+'.')).catch(()=>toast('Copie o endereço na barra do navegador.')); break;
    case 'back': if(history.state&&history.state.v) history.back(); else go('home'); break;
    case 'group': S.open=S.open===id?null:id; S.grp=S.open; S.q2=''; S.anim=!!S.open; render(); S.anim=false; break;
    case 'new': S.sel=new Set(); go('select'); break;
    case 'invite': S.modal='invite'; render(); break;
    case 'share': shareInvite(G(S.grp)); break;
    case 'accept': acceptJoin(); break;
    case 'decline': clearJoin(); S.modal=null; render(); break;
    case 'tog': S.sel.has(id)?S.sel.delete(id):S.sel.add(id); render(); break;
    case 'all': { const o=G(S.grp).members.filter(m=>m!==uid()); S.sel=S.sel.size===o.length?new Set():new Set(o); render(); break; }
    case 'start': b.disabled=true; startSession().catch(fail); break;
    case 'open': openChat(b.dataset.g, id); break;
    case 'info': S.modal='info'; render(); break;
    case 'addppl': S.modal='addppl'; render(); break;
    case 'addone': S.modal=null; render(); addPeople([id]).catch(fail); break;
    case 'newgroup': S.modal='newgroup'; render(); break;
    case 'view': S.viewU=b.dataset.u; S.modal='view'; render(); break;
    case 'close2': S.modal=null; render(); break;
    case 'rec': startRec(); break;
    case 'recx': stopRec(false); break;
    case 'recok': stopRec(true); break;
  }
});
app.addEventListener('input', e => {
  if (e.target.id==='q'){ S.q=e.target.value; render(); }
  else if (e.target.id==='q2'){ S.q2=e.target.value; render(); }
  else if (e.target.id==='msg') setSend(!!e.target.value.trim());
});
app.addEventListener('submit', e => {
  e.preventDefault();
  if (e.target.id==='lf'){
    const em=document.getElementById('le').value.trim(), pw=document.getElementById('lp').value, nm=document.getElementById('ln');
    const msg={ 'auth/invalid-credential':'E-mail ou senha incorretos.', 'auth/wrong-password':'E-mail ou senha incorretos.', 'auth/user-not-found':'Conta não encontrada. Toque em "Criar conta".',
      'auth/email-already-in-use':'Esse e-mail já tem conta. Toque em "Já tenho conta".', 'auth/weak-password':'A senha precisa ter pelo menos 6 caracteres.', 'auth/invalid-email':'E-mail inválido.' };
    const err = x => toast(msg[x.code] || ('Algo deu errado: '+x.code));
    if (nm) createUserWithEmailAndPassword(auth, em, pw).then(async c => { await updateProfile(c.user, { displayName:nm.value.trim() }); S.user={...c.user, displayName:nm.value.trim(), uid:c.user.uid, email:c.user.email, photoURL:null}; render(); }).catch(err);
    else signInWithEmailAndPassword(auth, em, pw).catch(err);
    return;
  }
  if (e.target.id==='cf'){ const i=document.getElementById('msg'), x=i.value.trim(); if(!x) return; i.value=''; setSend(false); send({kind:'text',text:x}).catch(fail); }
  else if (e.target.id==='ngf'){ const n=document.getElementById('ngn').value.trim(); if(!n) return; S.modal=null; render(); createGroup(n).catch(fail); }
  else if (e.target.id==='rnf'){ let n=document.getElementById('rnn').value.trim(); S.modal=null; render();
    if(n){ n=n.startsWith('#')?n.replace(/\s+/g,''):'#'+n.replace(/\s+/g,''); updateDoc(doc(db,'groups',S.grp,'sessions',S.cur),{title:n}).catch(fail); } }
});
document.getElementById('fmedia').addEventListener('change', e => {
  [...e.target.files].forEach(f => upload(f, f.type.startsWith('video')?'vid':'img')); e.target.value='';
});
document.getElementById('faudio').addEventListener('change', e => {
  const f=e.target.files[0]; e.target.value=''; if(!f) return; S.modal=null;
  const u=URL.createObjectURL(f), a=new Audio(); a.preload='metadata';
  a.onloadedmetadata=()=>{ upload(f,'aud',isFinite(a.duration)?a.duration:0); URL.revokeObjectURL(u); };
  a.onerror=()=>upload(f,'aud',0); a.src=u;
});
document.addEventListener('pause', () => { if (S.pending) render(); }, true);
document.addEventListener('visibilitychange', () => { if (!document.hidden && S.user) { setBadge(totalUnread()); if (S.view==='chat'&&S.cur) clearNotifs(S.cur); } });
addEventListener('popstate', () => { if (S.view!=='home') go('home'); });
render();
