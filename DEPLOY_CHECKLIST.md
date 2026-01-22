# ✅ Checklist de Deploy - Optimizaciones Netlify

## Pre-Deploy

- [x] Rate limiting agregado a `mailchimp-subscribe.js`
- [x] Rate limiting agregado a `upload-image.js`  
- [x] Rate limiting agregado a `save-article.js`
- [x] Service Worker actualizado a v2 con `articles.json` en caché
- [x] `loadPartial()` optimizado en `script.js` (usa caché del navegador)
- [x] Headers de caché optimizados en `netlify.toml`
- [x] Build processing desactivado para JS en `netlify.toml`
- [x] `script.min.js` regenerado (reducción del 50.75%)
- [x] Sin errores de sintaxis en ningún archivo

## Deploy

### 1. Commit de los cambios
```bash
git add netlify/functions/mailchimp-subscribe.js
git add netlify/functions/upload-image.js
git add netlify/functions/save-article.js
git add sw.js
git add src/js/script.js
git add src/js/script.min.js
git add netlify.toml
git add OPTIMIZACIONES_NETLIFY.md
git add DEPLOY_CHECKLIST.md

git commit -m "🚀 Optimizaciones críticas para reducir consumo de créditos Netlify

- Rate limiting en funciones serverless (mailchimp, upload, save-article)
- Service Worker v2 con caché de articles.json
- Caché del navegador habilitado en loadPartial (header/footer)
- Headers de caché optimizados (5min HTML, 1h partials, 5min JSON)
- Build processing desactivado para archivos ya minificados
- Reducción estimada: 70% menos peticiones, 75% menos costos"

git push
```

### 2. Verificar en Netlify Dashboard

#### Build & Deploy
1. Ir a: `Site > Deploys`
2. Esperar que el build termine
3. Verificar que el deploy sea exitoso (verde)

#### Funciones
1. Ir a: `Site > Functions`
2. Ver las 4 funciones listadas:
   - ✅ `mailchimp-subscribe`
   - ✅ `upload-image`
   - ✅ `save-article`
   - ✅ `list-images`

#### Monitoreo Inicial (Primeras 24h)
1. Ir a: `Site > Analytics > Functions`
2. Revisar:
   - Invocaciones por función
   - Errores 429 (rate limiting funcionando)
   - Duración promedio de ejecución

3. Ir a: `Site > Analytics > Bandwidth`
4. Comparar con días previos
5. Debería ver reducción inmediata

## Post-Deploy

### Pruebas Funcionales

#### 1. Probar Newsletter
```
1. Ir a https://salageek.com
2. Suscribirse con email de prueba
3. ✅ Debería funcionar normal la primera vez
4. Intentar suscribirse 3 veces más rápido
5. ✅ Debería mostrar error 429 después de la 3ra vez
```

#### 2. Probar Service Worker
```
1. Abrir DevTools > Application > Service Workers
2. Debería ver: "sg-cache-v2" (versión actualizada)
3. Ver: Application > Cache Storage
4. ✅ Verificar que existe caché "sg-static-v2"
5. ✅ Verificar que incluye "/blog/data/articles.json"
```

#### 3. Probar Caché de Partials
```
1. Abrir https://salageek.com
2. DevTools > Network tab
3. Buscar: "header.html"
4. Primer load: Status 200 (desde servidor)
5. Recargar página (F5)
6. ✅ Segundo load: Status 200 (from cache) o 304 (not modified)
```

#### 4. Probar Admin (si tienes acceso)
```
1. Ir a https://salageek.com/admin
2. Login con Netlify Identity
3. Subir una imagen
4. ✅ Primera subida: OK
5. Subir 10 imágenes rápido
6. ✅ Después de la 10ma: Error 429
7. Esperar 5 minutos
8. ✅ Volver a funcionar
```

## Monitoreo Continuo (Semana 1)

### Días 1-3
- Revisar Analytics cada día
- Buscar errores inesperados en Functions Log
- Verificar que el sitio funciona normal para usuarios

### Días 4-7
- Comparar métricas:
  - Bandwidth: Debería bajar 60-70%
  - Function invocations: Debería bajar 75-85%
  - Build minutes: Debería bajar 10-15%

### Si hay problemas

#### Service Worker no actualiza
```bash
# Forzar nueva versión
# Editar sw.js línea 23:
const CACHE_VERSION = 'sg-cache-v3';
const STATIC_CACHE = 'sg-static-v3';
# etc... y redeploy
```

#### Rate limiting muy restrictivo
```javascript
// En mailchimp-subscribe.js, ajustar:
const MAX_REQUESTS = 5; // en vez de 3
const RATE_LIMIT_WINDOW = 120 * 1000; // 2 minutos en vez de 1
```

#### Caché causa contenido viejo
```toml
# En netlify.toml, reducir max-age:
[[headers]]
  for = "/blog/data/*.json"
  [headers.values]
    Cache-Control = "public, max-age=60" # 1 minuto en vez de 5
```

## Rollback de Emergencia

Si algo sale muy mal:

### Opción 1: Rollback en Netlify
```
1. Ir a: Site > Deploys
2. Encontrar el deploy anterior (antes de las optimizaciones)
3. Click en "..." > "Publish deploy"
4. Confirmar rollback
```

### Opción 2: Revert Git
```bash
git revert HEAD
git push
```

### Opción 3: Deshabilitar Service Worker temporalmente
```javascript
// En sw.js, línea 1, agregar:
return; // Deshabilita todo el SW

// O en index.html, comentar el registro:
// if ('serviceWorker' in navigator) { ...
```

## Métricas de Éxito

Después de 1 semana, deberías ver:

| Métrica | Meta | Status |
|---------|------|--------|
| Bandwidth reducido | >60% | [ ] |
| Functions invocations reducidas | >75% | [ ] |
| 429 errors en logs | Algunos visibles | [ ] |
| Errores de usuarios reales | 0 | [ ] |
| Tiempo de carga del sitio | Igual o mejor | [ ] |
| Core Web Vitals | Igual o mejor | [ ] |

## Notas Finales

- **NO PANIC**: Rate limiting puede causar algunos 429, es NORMAL
- **Usuarios reales** no deberían ver errores (límites son generosos)
- **Bots y scrapers** serán bloqueados (esto es BUENO)
- **Costos** deberían bajar dramáticamente en el siguiente billing cycle

---

**¿Todo listo?** Deploy con confianza! 🚀

Creado: 21/01/2026  
Última actualización: 21/01/2026
