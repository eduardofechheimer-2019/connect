// Service worker simples: guarda a "casca" do app para abrir rápido e funcionar como PWA.
// Dados (mensagens, fotos) vêm sempre do Firebase.
const CACHE = 'connect-v9';
const SHELL = ['./', 'index.html', 'styles.css?v=9', 'app.js?v=9', 'firebase-config.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Rede primeiro (para sempre pegar a versão nova), cache se estiver offline.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});

// ---------- notificações push ----------
// O servidor (functions/index.js) manda: title, body, badge, s (= grupo.conversa), tag.
self.addEventListener('push', e => {
  let d = {};
  try { const j = e.data ? e.data.json() : {}; d = j.data || j; } catch (err) {}
  const n = parseInt(d.badge || '0', 10);
  e.waitUntil(Promise.all([
    self.registration.showNotification(d.title || 'Connect', {
      body: d.body || 'Nova mensagem', tag: d.tag || 'connect', renotify: true,
      icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', data: { s: d.s || '' }
    }),
    ('badge' in d && self.navigator && 'setAppBadge' in self.navigator) ? (n ? self.navigator.setAppBadge(n) : self.navigator.clearAppBadge()).catch(() => {}) : null
  ]));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const s = (e.notification.data && e.notification.data.s) || '';
  const url = new URL(s ? './?s=' + encodeURIComponent(s) : './', self.registration.scope).href;
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if ('focus' in c) { c.postMessage({ type: 'open', s }); return c.focus(); } }
    return clients.openWindow(url);
  }));
});
