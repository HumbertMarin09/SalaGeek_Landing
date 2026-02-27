/**
 * ============================================================================
 * 🚀 SALA GEEK - SERVICE WORKER
 * ============================================================================
 *
 * PWA Service Worker que proporciona:
 * - Caché inteligente de recursos estáticos
 * - Funcionamiento offline con fallback page
 * - Actualización automática en segundo plano
 * - Push notifications ready (futuro)
 * - Precarga de recursos críticos
 *
 * Estrategias de caché:
 * - Cache First: Assets estáticos (CSS, JS, imágenes)
 * - Network First: HTML y API calls
 * - Stale While Revalidate: Fuentes y recursos externos
 *
 * @version 1.0.0
 * @author Sala Geek
 * ============================================================================
 */

const STATIC_CACHE = "sg-static-v7";
const DYNAMIC_CACHE = "sg-dynamic-v7";
const IMAGE_CACHE = "sg-images-v7";

// Recursos para pre-cachear (instalar inmediatamente)
const PRECACHE_ASSETS = [
  "/",
  "/404.html",
  "/src/css/normalize.css",
  "/src/css/style.min.css",
  "/src/css/blog.min.css",
  "/src/js/script.min.js",
  "/src/js/performance-boost.min.js",
  "/src/images/SalaGeek_LOGO.webp",
  "/src/images/Icono_SG.ico",
  "/manifest.json",
  "/blog/data/articles-summary.json",
];

// Recursos que siempre intentan network first
const NETWORK_FIRST_ROUTES = ["/blog/", "/api/"];

// Recursos que usan cache first
const CACHE_FIRST_ROUTES = ["/src/css/", "/src/js/", "/src/images/", "/assets/"];

// ============================================================================
// EVENTO: INSTALL
// ============================================================================

self.addEventListener("install", (event) => {
  console.log("[SW] Instalando Service Worker...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Precacheando recursos críticos");
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log("[SW] ✅ Instalación completada");
        // Activar inmediatamente sin esperar
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("[SW] ❌ Error en instalación:", error);
      })
  );
});

// ============================================================================
// EVENTO: ACTIVATE
// ============================================================================

self.addEventListener("activate", (event) => {
  console.log("[SW] Activando Service Worker...");

  event.waitUntil(
    Promise.all([
      // Limpiar cachés antiguas
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Eliminar cachés que no sean las versiones actuales
              return (
                name.startsWith("sg-") &&
                name !== STATIC_CACHE &&
                name !== DYNAMIC_CACHE &&
                name !== IMAGE_CACHE
              );
            })
            .map((name) => {
              console.log("[SW] Eliminando caché antigua:", name);
              return caches.delete(name);
            })
        );
      }),
      // Tomar control de todos los clientes inmediatamente
      self.clients.claim(),
    ]).then(() => {
      console.log("[SW] ✅ Activación completada");
      // Notificar a los clientes que hay nueva versión
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: "SW_UPDATED",
            message: "Service Worker actualizado",
          });
        });
      });
    })
  );
});

// ============================================================================
// EVENTO: FETCH - Interceptar requests
// ============================================================================

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar requests del mismo origen o CDNs permitidas
  if (
    !url.origin.includes(self.location.origin) &&
    !url.origin.includes("fonts.googleapis.com") &&
    !url.origin.includes("fonts.gstatic.com")
  ) {
    return;
  }

  // Ignorar requests que no sean GET
  if (request.method !== "GET") {
    return;
  }

  // Ignorar requests a analytics y ads
  if (
    url.pathname.includes("google") &&
    (url.pathname.includes("analytics") || url.pathname.includes("ads"))
  ) {
    return;
  }

  // Determinar estrategia basada en el tipo de recurso
  event.respondWith(determineStrategy(request, url));
});

// ============================================================================
// ESTRATEGIAS DE CACHÉ
// ============================================================================

async function determineStrategy(request, url) {
  const pathname = url.pathname;

  // Network First para páginas HTML y APIs
  if (
    request.mode === "navigate" ||
    NETWORK_FIRST_ROUTES.some((route) => pathname.startsWith(route))
  ) {
    return networkFirst(request);
  }

  // Cache First para assets estáticos
  if (CACHE_FIRST_ROUTES.some((route) => pathname.startsWith(route))) {
    // Imágenes van a su propio caché
    if (pathname.includes("/images/")) {
      return cacheFirst(request, IMAGE_CACHE);
    }
    return cacheFirst(request, STATIC_CACHE);
  }

  // Stale While Revalidate para fuentes
  if (url.origin.includes("fonts.")) {
    return staleWhileRevalidate(request);
  }

  // Default: Network First
  return networkFirst(request);
}

/**
 * Network First - Intenta red primero, fallback a caché
 * Ideal para contenido dinámico (HTML, APIs)
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    // Si es exitoso, guardar en caché
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[SW] Network failed, trying cache:", request.url);

    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Si es navegación, mostrar página offline
    if (request.mode === "navigate") {
      return caches.match("/404.html");
    }

    // Fallback genérico
    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

/**
 * Cache First - Usa caché primero, actualiza en background
 * Ideal para assets estáticos (CSS, JS, imágenes)
 */
async function cacheFirst(request, cacheName = STATIC_CACHE) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Actualizar caché en background (no bloquea)
    updateCache(request, cacheName);
    return cachedResponse;
  }

  // Si no está en caché, obtener de red y guardar
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.error("[SW] Cache miss and network failed:", request.url);
    return new Response("", { status: 404 });
  }
}

/**
 * Stale While Revalidate - Devuelve caché inmediatamente, actualiza en background
 * Ideal para recursos que cambian poco (fuentes, librerías)
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  // Fetch en background
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    })
    .catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

/**
 * Actualiza caché en background sin bloquear
 */
async function updateCache(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse);
      // Limitar tamaño de caches dinámicas
      if (cacheName === DYNAMIC_CACHE) {
        await trimCache(cacheName, 50);
      } else if (cacheName === IMAGE_CACHE) {
        await trimCache(cacheName, 80);
      }
    }
  } catch (error) {
    // Silently fail - el recurso se actualizará en el próximo request
  }
}

/**
 * Limita el número de entradas en un cache
 */
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    if (keys.length - 1 > maxItems) {
      await trimCache(cacheName, maxItems);
    }
  }
}

// ============================================================================
// EVENTO: MESSAGE - Comunicación con la página
// ============================================================================

self.addEventListener("message", (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;

    case "CACHE_URLS":
      // Permitir que la página solicite cachear URLs específicas
      if (payload && payload.urls) {
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.addAll(payload.urls);
        });
      }
      break;

    case "CLEAR_CACHE":
      // Limpiar cachés específicas
      if (payload && payload.cacheName) {
        caches.delete(payload.cacheName);
      }
      break;

    case "GET_CACHE_STATUS":
      // Devolver estado de cachés
      getCacheStatus().then((status) => {
        event.ports[0].postMessage(status);
      });
      break;
  }
});

/**
 * Obtiene estadísticas de las cachés
 */
async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};

  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    status[name] = keys.length;
  }

  return status;
}

// ============================================================================
// EVENTO: PUSH (Preparado para futuro)
// ============================================================================

self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body || "Nueva notificación de Sala Geek",
    icon: "/src/images/SalaGeek_LOGO.webp",
    badge: "/src/images/Icono_SG.ico",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
    },
    actions: [
      { action: "open", title: "Ver" },
      { action: "close", title: "Cerrar" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title || "Sala Geek", options));
});

// ============================================================================
// EVENTO: NOTIFICATION CLICK
// ============================================================================

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") return;

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Buscar si ya hay una ventana abierta
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Si no hay ventana, abrir una nueva
      return clients.openWindow(urlToOpen);
    })
  );
});

// ============================================================================
// EVENTO: SYNC (Background Sync - futuro)
// ============================================================================

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-newsletter") {
    event.waitUntil(syncNewsletter());
  }
});

async function syncNewsletter() {
  // Futuro: sincronizar suscripciones pendientes cuando vuelva la conexión
  console.log("[SW] Background sync ejecutado");
}

console.log("[SW] Service Worker cargado - Sala Geek PWA Ready 🚀");
