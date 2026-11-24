// Envia notificação push (e o número do ícone) a cada mensagem nova.
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

// ⚠️ Use a MESMA região do seu Firestore (Firestore Database → aparece no topo, ex.: europe-west1).
const REGION = 'europe-west1';

initializeApp();
const db = getFirestore();

const preview = m => m.kind === 'img' ? '📷 Foto' : m.kind === 'vid' ? '🎥 Vídeo' : m.kind === 'aud' ? '🎤 Áudio' : (m.text || '');
const ms = t => (t && t.toMillis ? t.toMillis() : 0);

// Quantas conversas esta pessoa tem com mensagens não lidas (o número do ícone).
async function unreadCount(uid, extraSid) {
  const groups = await db.collection('groups').where('members', 'array-contains', uid).get();
  let n = 0, sawExtra = false;
  for (const g of groups.docs) {
    const ses = await g.ref.collection('sessions').where('members', 'array-contains', uid).get();
    for (const s of ses.docs) {
      const d = s.data(), l = d.lastMsg, read = d.reads && d.reads[uid];
      const isUnread = l && l.from !== uid && ms(l.at) > ms(read);
      if (s.id === extraSid) { sawExtra = true; n += 1; } else if (isUnread) n += 1;
    }
  }
  return sawExtra ? n : n + 1;
}

exports.notifyNewMessage = onDocumentCreated({ document: 'groups/{gid}/sessions/{sid}/messages/{mid}', region: REGION }, async event => {
  const m = event.data && event.data.data();
  if (!m || m.kind === 'sys') return;
  const { gid, sid } = event.params;
  const [gSnap, sSnap] = await Promise.all([db.doc(`groups/${gid}`).get(), db.doc(`groups/${gid}/sessions/${sid}`).get()]);
  if (!sSnap.exists) return;
  const g = gSnap.data() || {}, s = sSnap.data();
  const recipients = (s.members || []).filter(u => u !== m.from);
  const first = (m.fromName || 'Alguém').split(' ')[0];
  const where = s.title || g.name || 'Connect';

  await Promise.all(recipients.map(async uid => {
    const uSnap = await db.doc(`users/${uid}`).get();
    const tokens = (uSnap.exists && uSnap.data().tokens) || [];
    if (!tokens.length) return;
    const badge = await unreadCount(uid, sid);
    const res = await getMessaging().sendEachForMulticast({
      tokens,
      data: { title: `${first} · ${where}`, body: preview(m).slice(0, 180), badge: String(badge), s: `${gid}.${sid}`, tag: sid },
      webpush: { headers: { Urgency: 'high', TTL: '86400' } }
    });
    // Remove aparelhos que não existem mais.
    const dead = [];
    res.responses.forEach((r, i) => {
      const c = r.error && r.error.code;
      if (c === 'messaging/registration-token-not-registered' || c === 'messaging/invalid-registration-token') dead.push(tokens[i]);
    });
    if (dead.length) await uSnap.ref.update({ tokens: FieldValue.arrayRemove(...dead) });
  }));
});
