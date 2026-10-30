/* MRM64 anti-hacker app — service worker (version 17)
   Job: let Chrome offer a real "Install app", and keep the app
   fresh. Pages are always fetched from the network first, so a
   newly published version replaces the old one by itself; the
   cache below is only an offline fallback. Activation codes and
   all progress live in localStorage under their own keys, which
   this worker never touches, so updating never wipes them. */
var CACHE = "mrm64-antihacker-v17";

self.addEventListener("install", function (e) {
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url;
  try { url = new URL(e.request.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return res;
    }).catch(function () {
      return caches.match(e.request);
    })
  );
});
