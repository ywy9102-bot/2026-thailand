/* 서비스 워커: 한 번 열어 본 뒤에는 인터넷이 없어도 앱이 열리도록 핵심 파일을 기기에 저장해 둬요.
   - 버전은 등록 주소의 ?v= 값에서 읽어요(app.js가 APP_VER로 등록). 버전이 바뀌면 새 저장소를 만들고 옛 것은 지워요.
   - 화면(index.html)은 인터넷이 되면 항상 새로 받고, 안 될 때만 저장본을 보여 줘요. 나머지 파일은 저장본을 먼저 써요.
   - 같은 사이트의 GET 요청만 다뤄요(날씨·환율·지도 타일 같은 외부 요청은 건드리지 않아요). */
const V = new URL(self.location.href).searchParams.get('v') || '0';
const PREFIX = 'thai2026-';
const CACHE = PREFIX + V;
const CORE = ['./', 'index.html', 'style.css?v=' + V, 'app.js?v=' + V, 'play.js?v=' + V, 'story.js?v=' + V, 'foodmap.js?v=' + V, 'thai.js?v=' + V, 'manifest.json', 'icon-180.png', 'icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== self.location.origin || url.pathname.endsWith('/sw.js')) return;
  if(req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => {
      if(res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put('index.html', copy)); }
      return res;
    }).catch(() => caches.match('index.html', { ignoreSearch: true }).then(r => r || caches.match('./', { ignoreSearch: true }))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if(res.ok && res.type === 'basic'){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  })));
});
