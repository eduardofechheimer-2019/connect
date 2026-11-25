import { firebaseConfig, vapidKey } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { initializeFirestore, persistentLocalCache, collection, doc, addDoc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, serverTimestamp, arrayUnion } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js';
import { getMessaging, getToken, isSupported } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js';

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
  wa:'<svg width="33" height="33" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 18.8z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5"/></svg>',
  phone:'<svg width="25" height="25" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></svg>',
  video:'<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="6" width="13.5" height="12" rx="2.5"/><path d="M17 10.2l5-3v9.6l-5-3z"/></svg>',
  hang:'<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 9c-1.6 0-3.2.3-4.6.8v3.1c0 .4-.2.7-.6.9-1 .5-1.9 1.1-2.7 1.8-.2.2-.4.3-.7.3s-.5-.1-.7-.3L.3 13.2a1 1 0 0 1 0-1.4C3.4 8.9 7.5 7 12 7s8.6 1.9 11.7 4.8a1 1 0 0 1 0 1.4l-2.4 2.4c-.2.2-.4.3-.7.3s-.5-.1-.7-.3c-.8-.7-1.7-1.3-2.7-1.8-.4-.2-.6-.5-.6-.9V9.8C15.2 9.3 13.6 9 12 9z"/></svg>',
  flip:'<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h3l2-3h8l2 3h3v12H3z"/><path d="M9 13a3 3 0 0 0 5.2 2M15 13a3 3 0 0 0-5.2-2"/><path d="M14.5 15.5v-2h-2M9.5 10.5v2h2"/></svg>',
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
const prev = m => !m ? '' : m.kind==='img'?'📷 Foto':m.kind==='vid'?'🎥 Vídeo':m.kind==='aud'?'🎤 Áudio'+(m.dur?' ('+dur(m.dur)+')':''):m.kind==='doc'?'📄 '+(m.text||'Arquivo'):m.text;
const STOP = new Set('a o os as de da do das dos e em no na nos nas num numa um uma uns umas para pra pro pros por com sem que se me te lhe voce vc voces vcs vamos vou eu ele ela nos gente pessoal galera oi ola bom boa dia tarde noite tudo isso esse essa este esta aqui la ja mas ou como qual quando onde ao aos tem ter vai vao ser esta estao foi muito mais menos meu minha seu sua quem alguem hoje amanha topa topam bora sim nao ai hein ne entao tambem the'.split(' '));
const autoTitle = m => {
  const d=new Date(), tag=d.getDate()+'_'+String(d.getMonth()+1).padStart(2,'0');
  if(m.kind && m.kind!=='text') return ({img:'#foto',vid:'#video',aud:'#audio',doc:'#arquivo'}[m.kind]||'#papo')+tag;
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
    if (u) { watchGroups(); watchCalls(); if (S.join) loadInvite(); if (NOTIF() && Notification.permission==='granted') registerPush(); } else setBadge(0);
    render();
  });
} else { S.ready = true; }

function stopAll(){ U.calls && U.calls(); U.calls=null; U.groups && U.groups(); U.groups=null; Object.values(U.ses).forEach(f=>f()); U.ses={}; U.msgs && U.msgs(); U.msgs=null; S.groups=[]; S.ses={}; }

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
  const base = { from:uid(), fromName:me().name, at:serverTimestamp(), kind:m.kind||'text', text:m.text||'', url:m.url||'', dur:m.dur||0, size:m.size||0 };
  await addDoc(collection(sref,'messages'), base);
  const upd = { lastMsg:{ from:uid(), fromName:me().name, kind:base.kind, text:base.text.slice(0,200), dur:base.dur, at:serverTimestamp() },
    updatedAt:serverTimestamp(), [`reads.${uid()}`]:serverTimestamp() };
  if (!s.title && base.kind!=='sys') upd.title = autoTitle(base);
  await updateDoc(sref, upd);
}

async function upload(file, kind, d){
  if (file.size > 60*1024*1024) return toast('Arquivo grande demais (máx. 60 MB).');
  const gid=S.grp, sid=S.cur, nm=file.name||'', ext=(nm.includes('.')?nm.split('.').pop():(file.type.split('/')[1]||'bin').split(';')[0].replace('quicktime','mov')).toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,8)||'bin';
  S.up++; render();
  try {
    const r = ref(st, `media/${gid}/${sid}/${Date.now()}_${rand().slice(0,6)}.${ext}`);
    await uploadBytes(r, file, { contentType: file.type || 'application/octet-stream' });
    const url = await getDownloadURL(r);
    const extra = kind==='doc' ? { text:nm||'Arquivo', size:file.size } : {};
    if (S.cur===sid) await send({ kind, url, dur:d, ...extra });
    else { // usuário saiu do chat durante o envio
      const prevCur=S.cur, prevGrp=S.grp; S.cur=sid; S.grp=gid; await send({kind,url,dur:d,...extra}); S.cur=prevCur; S.grp=prevGrp; }
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
    return `<header class="top"><button class="ib" data-act="back" aria-label="Voltar">${I.back}</button><button class="ttl" data-act="info" aria-label="Detalhes da conversa"><h1>${esc(s.title||'Nova conversa')}</h1><small>${esc(sub)}</small></button><button class="ib" data-act="wachat" aria-label="Avisar no WhatsApp">${I.wa}</button><button class="ib" data-act="call" data-t="audio" aria-label="Chamada de voz">${I.phone}</button><button class="ib" data-act="call" data-t="video" aria-label="Chamada de vídeo">${I.video}</button></header>`+
      `<div class="chatbody" id="cb"><div class="sys">${S.msgs.length?'Conversa entre '+esc(s.members.filter(m=>m!==uid()).map(m=>short(m,g)).join(', '))+' e você':'O nome da conversa é criado automaticamente com a primeira mensagem.'}</div>${msgs}${S.up?`<div class="sys">Enviando ${S.up>1?S.up+' arquivos':'arquivo'}…</div>`:''}</div>
      <div class="members">${s.members.filter(m=>m!==uid()).map(m=>`<span class="chip"><i>${ini(nameOf(m,g))}</i>${esc(short(m,g))}</span>`).join('')}${rest?`<button class="chip add" data-act="addppl">+ ${rest} do grupo</button>`:''}</div>
      ${S.rec?`<div class="compose recbar"><button class="ib" style="color:#c62828" data-act="recx" aria-label="Descartar áudio">${I.trash}</button><span class="dot"></span><b id="rt">0:00</b><span style="flex:1;color:var(--mut)">Gravando…</span><button class="send" data-act="recok" aria-label="Enviar áudio">${I.send}</button></div>`
       :`<form class="compose" id="cf"><button type="button" class="ib att" data-act="pick" aria-label="Anexar foto, vídeo ou arquivo">${I.plus}</button><textarea id="msg" rows="1" placeholder="Mensagem" aria-label="Mensagem"></textarea><button class="send" id="sb" type="button" data-act="rec" aria-label="Gravar áudio">${I.mic}</button></form>`}`;
  }
};
const body = m => m.kind==='img'?`<button class="media" data-act="view" data-u="${esc(m.url)}"><img src="${esc(m.url)}" alt="Foto" loading="lazy"></button>`
  : m.kind==='vid'?`<video class="media" src="${esc(m.url)}" controls playsinline preload="metadata"></video>`
  : m.kind==='aud'?`<audio src="${esc(m.url)}" controls preload="metadata"></audio>`
  : m.kind==='doc'?`<a class="doc" href="${esc(m.url)}" target="_blank" rel="noopener"><span class="dic">📄</span><span><b>${esc(m.text||'Arquivo')}</b><small>${m.size?(m.size>1048576?(m.size/1048576).toFixed(1)+' MB':Math.max(1,Math.round(m.size/1024))+' KB'):'Abrir'}</small></span></a>` : esc(m.text);

function drawer(g, all){
  const q=S.q2.toLowerCase(), alone=g.members.length<2;
  const list=all.filter(s=>!q||((s.title||'')+' '+s.members.map(m=>nameOf(m,g)).join(' ')+' '+prev(s.lastMsg)).toLowerCase().includes(q));
  const rows=list.map(s=>{const l=s.lastMsg; return `<button class="row" data-act="open" data-id="${s.id}" data-g="${g.id}">
      <span class="rc"><span class="rt"><b>${esc(s.title||'Nova conversa')}</b><span class="tm ${unread(s)?'on':''}">${when(ms(s.updatedAt))}</span></span>
      <span class="l2"><b style="color:var(--brand)">${s.members.length}/${g.members.length}</b> conectados · ${esc(s.members.filter(m=>m!==uid()).map(m=>short(m,g)).join(', '))}</span>
      <span class="l3"><span>${l?esc(l.from===uid()?'Você: ':(l.fromName||'').split(' ')[0]+': ')+esc(prev(l)):'<i>Sem mensagens ainda</i>'}</span>${unread(s)?`<span class="badge">•</span>`:''}</span></span></button>`}).join('');
  return `<div class="drawer ${S.anim?'anim':''}"><div class="dtools"><button class="pill" data-act="new" ${alone?'disabled':''}>${I.plus} Nova Sessão</button>${g.owner===uid()?`<button class="pill wa" data-act="invite">${I.wa} Convidar</button>`:''}
    ${all.length>3?`<label class="search sm">${I.search}<input id="q2" placeholder="Buscar conversa" value="${esc(S.q2)}" aria-label="Buscar conversa"></label>`:''}</div>
    ${rows||`<div class="empty" style="padding:18px">${S.q2?'Nenhuma conversa encontrada.':alone?(g.owner===uid()?'Convide amigos para o grupo para começar a conversar.':'Ainda não há outros membros no grupo.'):'Nenhuma conversa ainda. Toque em <b>Nova Sessão</b>.'}</div>`}</div>`;
}

const M = {
  newgroup:()=>`<form class="sheet" id="ngf"><h2>Novo grupo</h2><input class="fld" id="ngn" placeholder="Nome do grupo, ex.: #ficaadica" maxlength="40" required><button class="cta">Criar e convidar amigos</button></form>`,
  invite:()=>{const g=G(S.grp); if(!g||!g.invite) return `<div class="sheet"><h2>Preparando convite…</h2></div>`;
    const txt=`Você já conhece o Connect? Veja como suas conversas em grupo vão ficar mais dinâmicas 🚀\nEntre no grupo *${g.name}*: ${inviteUrl(g)}`;
    return `<div class="sheet"><h2>Convidar para o Connect</h2><div class="note" style="padding-top:0;font-size:16px">Mande para quem ainda não usa o Connect. Pelo link, a pessoa instala o app e já entra no grupo <b>${esc(g.name)}</b>.</div>
      <div class="waprev">${esc(txt)}</div>
      <a class="cta wabtn" href="https://wa.me/?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">${I.wa} Enviar no WhatsApp</a>
      <button class="cta ghost" data-act="copy" data-t="${esc(txt)}">Copiar texto</button></div>`},
  callpick:()=>{const s=curS(), g=G(S.grp), t=S.callType; return `<div class="sheet"><h2>${t==='video'?'Chamada de vídeo':'Chamada de voz'} com…</h2><div class="note" style="padding-top:0">Por enquanto as chamadas são a dois.</div>${s.members.filter(m=>m!==uid()).map(m=>`<button class="row" data-act="callto" data-id="${m}"><span class="av sm">${ini(nameOf(m,g))}</span><span class="rc"><b>${esc(nameOf(m,g))}</b></span>${t==='video'?I.video:I.phone}</button>`).join('')}</div>`},
  wachat:()=>{const s=curS(), g=G(S.grp); if(!s) return '';
    const url=location.origin+location.pathname+'?s='+g.id+'.'+s.id;
    const txt=`Oi! Te chamei para a conversa *${s.title||'Nova conversa'}* (grupo ${g.name}) no Connect 👉 ${url}`;
    return `<div class="sheet"><h2>Avisar no WhatsApp</h2><div class="note" style="padding-top:0;font-size:16px">Abre o WhatsApp com esta mensagem pronta. Você escolhe para quem mandar, por exemplo para quem ainda não viu a conversa.</div>
      <div class="waprev">${esc(txt)}</div>
      <a class="cta wabtn" href="https://wa.me/?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">${I.wa} Abrir WhatsApp</a>
      <button class="cta ghost" data-act="copy" data-t="${esc(txt)}">Copiar texto</button>
      <div class="note">Só quem participa desta conversa consegue abri-la pelo link.</div></div>`},
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
  const m=document.getElementById('msg'); if(m){ m.value=keep; if(keep) grow(m); if(keep.trim()) setSend(true); if(focus==='msg') m.focus({preventScroll:true}); }
  if (focus==='q'||focus==='q2'){ const q=document.getElementById(focus); if(q){q.focus(); q.setSelectionRange(q.value.length,q.value.length);} }
  const nb=app.querySelector('.body,.chatbody');
  if (nb) { if (nb.id==='cb') { if(!stay||nearEnd) nb.scrollTop=nb.scrollHeight; else nb.scrollTop=st0; }
    else if (stay) nb.scrollTop=st0; else if (S.view==='home'&&S.open){ const el=document.getElementById('grp-'+S.open); el&&el.scrollIntoView({block:'start'}); } }
  S.lastView=S.view;
  const f=document.querySelector('.sheet .fld'); if(f&&focus!==f.id&&S.modal!=='info') f.focus();
}
function grow(t){ t.style.height='auto'; t.style.height=Math.min(t.scrollHeight,132)+'px'; }
function setSend(t){ const b=document.getElementById('sb'); if(!b) return; b.type=t?'submit':'button'; if(t) b.removeAttribute('data-act'); else b.dataset.act='rec'; b.innerHTML=t?I.send:I.mic; b.setAttribute('aria-label',t?'Enviar':'Gravar áudio'); }
const go = v => { if(S.view==='chat'&&v!=='chat') leaveChat(); if(v!=='home'&&!history.state) history.pushState({v:1},''); S.view=v; S.q=''; S.modal=null; render(); };

// ---------- chamadas (WebRTC, aparelho a aparelho) ----------
const callBox = document.createElement('div'); callBox.id='call'; document.body.appendChild(callBox);
let C = null, iceCache = null, ringCtx = null, ringT = null;
const STUN = [{ urls:['stun:stun.cloudflare.com:3478','stun:stun.l.google.com:19302'] }];
async function getIce(){
  if (iceCache && iceCache.exp > Date.now()) return iceCache.list;
  try {
    const r = await httpsCallable(getFunctions(fapp,'me-west1'),'getIceServers')();
    let x = r.data && r.data.iceServers; x = !x ? [] : Array.isArray(x) ? x : [x];
    iceCache = { list:[...STUN, ...x], exp:Date.now()+3600e3 }; return iceCache.list;
  } catch(e){ console.warn('ice', e); return STUN; }
}
function ring(kind){
  stopRing();
  try { ringCtx = new (window.AudioContext||window.webkitAudioContext)();
    const beep = () => { if(!ringCtx) return; const o=ringCtx.createOscillator(), g=ringCtx.createGain(); o.frequency.value = kind==='in'?620:425; g.gain.value=.07; o.connect(g); g.connect(ringCtx.destination); o.start(); o.stop(ringCtx.currentTime + (kind==='in'?.8:1.1)); };
    beep(); ringT = setInterval(beep, kind==='in'?1600:3200);
  } catch(e){}
  if (kind==='in' && navigator.vibrate) navigator.vibrate([400,200,400,200,400]);
}
function stopRing(){ clearInterval(ringT); ringT=null; if(ringCtx){ ringCtx.close().catch(()=>{}); ringCtx=null; } }
const media = (type, facing='user') => navigator.mediaDevices.getUserMedia({ audio:{ echoCancellation:true, noiseSuppression:true }, video: type==='video' ? { facingMode:facing, width:{ideal:640}, height:{ideal:480} } : false });
function addCand(c){ if (!C || !C.pc) return; if (C.pc.remoteDescription) C.pc.addIceCandidate(c).catch(()=>{}); else C.pend.push(c); }
function flushCands(){ if (!C) return; const p=C.pend; C.pend=[]; p.forEach(c=>C.pc.addIceCandidate(c).catch(()=>{})); }
function wirePc(){
  const pc = C.pc; C.local.getTracks().forEach(t => pc.addTrack(t, C.local));
  C.remote = new MediaStream();
  pc.ontrack = e => { (e.streams[0] ? e.streams[0].getTracks() : [e.track]).forEach(t => { if(!C.remote.getTracks().includes(t)) C.remote.addTrack(t); }); attachMedia(); };
  pc.onconnectionstatechange = () => { if (!C) return; const st=pc.connectionState;
    if (st==='connected') { stopRing(); if (C.status!=='active') { C.status='active'; C.t0=C.t0||Date.now(); clearInterval(C.tick); C.tick=setInterval(()=>{ const el=document.getElementById('cst'); if(el&&C&&C.t0) el.textContent=dur((Date.now()-C.t0)/1000); },1000); } drawCall(); }
    else if (st==='disconnected') { C.status='reconnecting'; drawCall(); }
    else if (st==='failed') { toast('Não foi possível conectar a chamada.'); hangup('ended'); } };
}
async function startCall(type, to){
  if (C) return toast('Você já está numa chamada.');
  if (!navigator.mediaDevices || !window.RTCPeerConnection) return toast('Este navegador não faz chamadas.');
  const s=curS(), g=G(S.grp);
  C = { role:'caller', type, peer:to, peerName:nameOf(to,g), gid:S.grp, sid:s.id, title:s.title||g.name, status:'calling', unsub:[], pend:[], early:[], ready:false, muted:false, camOff:false, facing:'user' };
  drawCall();
  try { C.local = await media(type); } catch(e){ C=null; drawCall(); return toast('Permita o uso do microfone'+(type==='video'?' e da câmera':'')+' para ligar.'); }
  if (!C) return; drawCall();
  const ice = await getIce(); if (!C) return;
  const pc = C.pc = new RTCPeerConnection({ iceServers:ice }); wirePc();
  const cref = C.ref = doc(collection(db,'calls'));
  pc.onicecandidate = e => { if (!e.candidate || !C) return; const c=e.candidate.toJSON(); if (C.ready) addDoc(collection(cref,'cand'),{side:'caller',c}).catch(()=>{}); else C.early.push(c); };
  try {
    const offer = await pc.createOffer(); await pc.setLocalDescription(offer);
    await setDoc(cref, { from:uid(), fromName:me().name, to, gid:C.gid, sid:C.sid, title:C.title, type, status:'ringing', offer:{type:offer.type, sdp:offer.sdp}, createdAt:serverTimestamp() });
  } catch(e){ fail(e); return endCall(true,'ended'); }
  if (!C) return;
  C.ready=true; C.early.forEach(c=>addDoc(collection(cref,'cand'),{side:'caller',c}).catch(()=>{})); C.early=[];
  ring('out');
  C.unsub.push(onSnapshot(cref, snap => { if (!C) return; const d=snap.data(); if (!d) return endCall(false,'ended');
    if (d.answer && !pc.currentRemoteDescription) { pc.setRemoteDescription(d.answer).then(flushCands).catch(()=>{}); stopRing(); C.status='connecting'; drawCall(); }
    if (['declined','ended','busy'].includes(d.status)) endCall(false, d.status); }, () => endCall(false,'ended')));
  C.unsub.push(onSnapshot(query(collection(cref,'cand'), where('side','==','callee')), sn => sn.docChanges().forEach(ch => { if (ch.type==='added') addCand(ch.doc.data().c); }), ()=>{}));
  C.timer = setTimeout(() => { if (C && C.status==='calling') hangup('missed'); }, 45000);
}
function watchCalls(){
  U.calls = onSnapshot(query(collection(db,'calls'), where('to','==',uid())), sn => {
    sn.docChanges().forEach(ch => {
      if (ch.type!=='added') return; const d=ch.doc.data({serverTimestamps:'estimate'});
      if (d.status!=='ringing' || Date.now()-ms(d.createdAt) > 50000) return;
      if (C) { updateDoc(ch.doc.ref,{status:'busy'}).catch(()=>{}); return; }
      C = { role:'callee', ref:ch.doc.ref, type:d.type, peer:d.from, peerName:d.fromName||'Alguém', gid:d.gid, sid:d.sid, title:d.title, offer:d.offer, status:'ringing', unsub:[], pend:[], muted:false, camOff:false, facing:'user' };
      ring('in'); drawCall();
      C.unsub.push(onSnapshot(ch.doc.ref, snap => { if (!C) return; const x=snap.data(); if (!x || ['ended','missed'].includes(x.status)) endCall(false, x ? x.status : 'ended'); }, () => endCall(false,'ended')));
      C.timer = setTimeout(() => { if (C && C.status==='ringing') endCall(true,'missed'); }, 50000);
    });
  }, e => console.warn('calls', e));
}
async function acceptCall(){
  if (!C) return; stopRing(); C.status='connecting'; drawCall();
  try { C.local = await media(C.type); } catch(e){ toast('Permita o microfone'+(C.type==='video'?' e a câmera':'')+' para atender.'); return hangup('declined'); }
  if (!C) return;
  const ice = await getIce(); if (!C) return;
  const pc = C.pc = new RTCPeerConnection({ iceServers:ice }); wirePc();
  const ref = C.ref;
  pc.onicecandidate = e => { if (e.candidate) addDoc(collection(ref,'cand'),{side:'callee',c:e.candidate.toJSON()}).catch(()=>{}); };
  try {
    await pc.setRemoteDescription(C.offer);
    const ans = await pc.createAnswer(); await pc.setLocalDescription(ans);
    await updateDoc(ref, { answer:{type:ans.type, sdp:ans.sdp}, status:'accepted' });
  } catch(e){ fail(e); return hangup('ended'); }
  if (!C) return;
  C.unsub.push(onSnapshot(query(collection(ref,'cand'), where('side','==','caller')), sn => sn.docChanges().forEach(ch => { if (ch.type==='added') addCand(ch.doc.data().c); }), ()=>{}));
  drawCall();
}
function hangup(status='ended'){ if (!C) return; if (C.ref) updateDoc(C.ref,{status}).catch(()=>{}); endCall(true, status); }
function endCall(mine, status){
  if (!C) return; const c=C; C=null;
  stopRing(); clearTimeout(c.timer); clearInterval(c.tick);
  c.unsub.forEach(f=>{ try{f()}catch(e){} }); try { c.pc && c.pc.close(); } catch(e){}
  c.local && c.local.getTracks().forEach(t=>t.stop());
  if (c.role==='caller' && c.ref && c.ready) {
    const secs = c.t0 ? (Date.now()-c.t0)/1000 : 0;
    const label = (c.type==='video'?'📹 Chamada de vídeo':'📞 Chamada de voz') + (secs ? ' · '+dur(secs) : status==='declined' ? ' recusada' : status==='busy' ? ' · ocupado' : ' não atendida');
    addDoc(collection(db,'groups',c.gid,'sessions',c.sid,'messages'), { from:uid(), fromName:me().name, at:serverTimestamp(), kind:'sys', text:label, url:'', dur:0, size:0 }).catch(()=>{});
    setTimeout(() => deleteDoc(c.ref).catch(()=>{}), 4000);
  }
  if (!mine && c.role==='caller') { const m={declined:'Chamada recusada', busy:'Está em outra chamada'}[status]; if (m) toast(m); }
  drawCall();
}
function attachMedia(){
  if (!C) return;
  const lv=document.getElementById('lv'), rv=document.getElementById('rv'), ra=document.getElementById('ra');
  if (lv && C.local && lv.srcObject!==C.local) { lv.srcObject=C.local; lv.play().catch(()=>{}); }
  const r = rv || ra; if (r && C.remote && r.srcObject!==C.remote) { r.srcObject=C.remote; r.play().catch(()=>{}); }
}
function drawCall(){
  if (!C) { callBox.innerHTML=''; callBox.className=''; return; }
  const vid=C.type==='video', active=C.status==='active';
  const st={ calling:'Chamando…', ringing: vid?'Chamada de vídeo':'Chamada de voz', connecting:'Conectando…', reconnecting:'Reconectando…', active:C.t0?dur((Date.now()-C.t0)/1000):'' }[C.status];
  callBox.className='on';
  callBox.innerHTML = `<div class="cwrap ${vid?'vid':''} ${active?'active':''}">
    ${vid ? `<video id="rv" autoplay playsinline></video>${C.local?`<video id="lv" autoplay playsinline muted class="${C.facing==='user'?'mirror':''}"></video>`:''}` : '<audio id="ra" autoplay></audio>'}
    <div class="chead"><div class="cav">${ini(C.peerName)}</div><div class="cname">${esc(C.peerName)}</div><div class="cst" id="cst">${st}</div>${C.title?`<div class="ctitle">${esc(C.title)}</div>`:''}</div>
    <div class="cbtns">${C.status==='ringing'
      ? `<button class="cb red" data-c="decline">${I.hang}<span>Recusar</span></button><button class="cb green" data-c="accept">${vid?I.video:I.phone}<span>Atender</span></button>`
      : `<button class="cb ${C.muted?'off':''}" data-c="mute">${I.mic}<span>${C.muted?'Sem som':'Microfone'}</span></button>${vid?`<button class="cb ${C.camOff?'off':''}" data-c="cam">${I.video}<span>Câmera</span></button><button class="cb" data-c="flip">${I.flip}<span>Virar</span></button>`:''}<button class="cb red" data-c="hang">${I.hang}<span>Encerrar</span></button>`}</div></div>`;
  attachMedia();
}
callBox.addEventListener('click', async e => {
  const b=e.target.closest('[data-c]'); if (!b || !C) return;
  switch (b.dataset.c) {
    case 'accept': acceptCall(); break;
    case 'decline': hangup('declined'); break;
    case 'hang': hangup('ended'); break;
    case 'mute': C.muted=!C.muted; C.local && C.local.getAudioTracks().forEach(t=>t.enabled=!C.muted); drawCall(); break;
    case 'cam': C.camOff=!C.camOff; C.local && C.local.getVideoTracks().forEach(t=>t.enabled=!C.camOff); drawCall(); break;
    case 'flip': try {
        const facing = C.facing==='user' ? 'environment' : 'user';
        const ns = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:facing } }), nt = ns.getVideoTracks()[0];
        const sender = C.pc && C.pc.getSenders().find(x=>x.track && x.track.kind==='video'); if (sender) await sender.replaceTrack(nt);
        C.local.getVideoTracks().forEach(t=>{ t.stop(); C.local.removeTrack(t); }); C.local.addTrack(nt); nt.enabled=!C.camOff; C.facing=facing;
        const lv=document.getElementById('lv'); if (lv) { lv.srcObject=null; } drawCall();
      } catch(err){ toast('Não deu para trocar de câmera.'); } break;
  }
});
addEventListener('pagehide', () => { if (C) hangup('ended'); });

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
    case 'wachat': S.modal='wachat'; render(); break;
    case 'call': { const s=curS(), o=s.members.filter(m=>m!==uid()); S.callType=b.dataset.t;
      if (o.length===1) startCall(S.callType, o[0]); else { S.modal='callpick'; render(); } break; }
    case 'callto': S.modal=null; render(); startCall(S.callType, id); break;
    case 'copy': navigator.clipboard.writeText(b.dataset.t).then(()=>{b.textContent='Copiado ✓'}).catch(()=>toast('Não deu para copiar.')); break;
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
    case 'pick': document.getElementById('fmedia').click(); break;
    case 'rec': startRec(); break;
    case 'recx': stopRec(false); break;
    case 'recok': stopRec(true); break;
  }
});
app.addEventListener('input', e => {
  if (e.target.id==='q'){ S.q=e.target.value; render(); }
  else if (e.target.id==='q2'){ S.q2=e.target.value; render(); }
  else if (e.target.id==='msg') { setSend(!!e.target.value.trim()); grow(e.target); }
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
  if (e.target.id==='cf'){ const i=document.getElementById('msg'), x=i.value.trim(); if(!x) return; i.value=''; grow(i); setSend(false); send({kind:'text',text:x}).catch(fail); }
  else if (e.target.id==='ngf'){ const n=document.getElementById('ngn').value.trim(); if(!n) return; S.modal=null; render(); createGroup(n).catch(fail); }
  else if (e.target.id==='rnf'){ let n=document.getElementById('rnn').value.trim(); S.modal=null; render();
    if(n){ n=n.startsWith('#')?n.replace(/\s+/g,''):'#'+n.replace(/\s+/g,''); updateDoc(doc(db,'groups',S.grp,'sessions',S.cur),{title:n}).catch(fail); } }
});
app.addEventListener('keydown', e => {
  if (e.target.id==='msg' && e.key==='Enter' && !e.shiftKey && matchMedia('(pointer:fine)').matches) { e.preventDefault(); const f=document.getElementById('cf'); f && f.requestSubmit(); }
});
document.getElementById('fmedia').addEventListener('change', e => {
  [...e.target.files].forEach(f => upload(f, f.type.startsWith('video/')?'vid':f.type.startsWith('image/')?'img':f.type.startsWith('audio/')?'aud':'doc')); e.target.value='';
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
