/* Service worker : rend l'application utilisable hors ligne quand elle est installée depuis un site web (téléphone).
   Les fichiers de l'application sont mis en cache à l'installation ; les PDF des sujets sont mis en cache la première fois qu'on les ouvre.
   Après une mise à jour de l'application, changer VERSION pour forcer le rafraîchissement du cache. */
var PREFIX = 'bts-sio:' + self.registration.scope + ':';
var VERSION = PREFIX + 'v26';
var ASSETS = 'bts-sio-assets:' + self.registration.scope;
var FILES = ['./', 'index.html', 'css/style.css', 'js/app.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/favicon.ico', 'icons/icon-32.png', 'icons/apple-touch-icon.png',
  'data/questions.js', 'data/corrections.js', 'data/docs_questions.js', 'data/notions.js', 'data/explications.js', 'data/entrainement.js', 'data/entrainement_plus.js',
  'data/tp_sisr.js', 'data/oral.js', 'data/methode.js', 'data/glossaire.js', 'data/schemas.js', 'data/erreurs.js', 'data/python.js', 'data/pentest.js', 'data/media.js', 'data/qcm.js', 'js/study.js', 'js/config.js', 'css/study.css'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) { return Promise.all(keys.filter(function (k) { return k.indexOf(PREFIX) === 0 && k !== VERSION; }).map(async function (k) {
    var old = await caches.open(k), assets = await caches.open(ASSETS), requests = await old.keys();
    for (var request of requests) if (/\.(pdf|wav)$/i.test(new URL(request.url).pathname)) {
      var response = await old.match(request);
      if (response && response.status === 200) { try { await assets.put(request,response); } catch (error) { return; } }
    }
    await caches.delete(k);
  })); }).then(function () { return self.clients.claim(); }));
});
/* Les lecteurs audio/PDF demandent parfois une plage d'octets pour reprendre ou avancer. */
async function withRange(request, response) {
  var range = request.headers.get('Range'); if (!range) return response;
  var match = /^bytes=(\d*)-(\d*)$/.exec(range); if (!match || (!match[1] && !match[2])) return response;
  var buffer = await response.arrayBuffer(), size = buffer.byteLength;
  var start = match[1] ? Number(match[1]) : Math.max(0,size-Number(match[2]));
  var end = match[1] ? (match[2] ? Math.min(Number(match[2]),size-1) : size-1) : size-1;
  if (start > end || start >= size) return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
  var headers = new Headers(response.headers); headers.set('Content-Range','bytes '+start+'-'+end+'/'+size); headers.set('Content-Length',String(end-start+1)); headers.set('Accept-Ranges','bytes');
  return new Response(buffer.slice(start,end+1),{status:206,headers:headers});
}
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.registration.scope)) return;
  e.respondWith((async function () {
    var media = /\.(pdf|wav)$/i.test(new URL(e.request.url).pathname), cache = await caches.open(media ? ASSETS : VERSION);
    var hit = await cache.match(e.request,{ignoreSearch:true}); if (hit) return withRange(e.request,hit);
    var response = await fetch(e.request);
    if (response.status === 200) e.waitUntil(cache.put(e.request,response.clone()).catch(function () {}));
    return response;
  })());
});
