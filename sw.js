const V='fanbazar-v1';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  const sameOrigin=u.origin===location.origin,sdk=u.hostname==='www.gstatic.com'&&u.pathname.startsWith('/firebasejs/');
  if(!sameOrigin&&!sdk)return; // Firestore/Auth requests go straight to the network
  if(sdk){ // SDK files are versioned: cache-first
    e.respondWith(caches.open(V).then(async c=>{const m=await c.match(r);if(m)return m;const n=await fetch(r);if(n.ok)c.put(r,n.clone());return n}));return}
  // app files: network-first so updates arrive, cache as offline fallback
  e.respondWith(fetch(r).then(n=>{if(n.ok){const cp=n.clone();caches.open(V).then(c=>c.put(r,cp))}return n}).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));
});
