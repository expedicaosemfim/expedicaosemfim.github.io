// Expedição Sem Fim — service worker
// Estratégia: "network-first" para o próprio site.
// -> Com internet, sempre pega a versão mais nova (nada de cache travado).
// -> Sem internet, abre a última versão guardada (funciona offline na estrada).
const CACHE = 'esf-app-v1';

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (_) { return; }

  // Só controla os arquivos do próprio site (HTML). Supabase, mapas de
  // satélite, fotos e fontes passam direto pra rede, sem interferência.
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() =>
        caches.match(req).then(r => r || caches.match('./index.html'))
      )
  );
});
