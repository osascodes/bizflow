const CACHE = "bizflow-v4";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function isAppPath(url) {
  return [
    "/dashboard",
    "/inventory",
    "/sales",
    "/customers",
    "/debts",
    "/expenses",
    "/storefront",
    "/analytics",
    "/activity",
    "/staff",
    "/notifications",
    "/settings",
  ].some((path) => url.pathname === path || url.pathname.startsWith(path + "/"));
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!isAppPath(url) || request.mode !== "navigate") return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && !response.redirected) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response("Open this page once while online.", {
          status: 503,
          headers: { "Content-Type": "text/plain" },
        });
      })
  );
});
