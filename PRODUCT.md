# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Fans hispanohablantes que entran a ponerse al día con películas, series, anime y videojuegos.

Las marcas aparecen en el media kit como audiencia secundaria de esa página. No son el usuario principal.

## Product Purpose

Sala Geek publica cobertura gratuita en español para que esa audiencia se mantenga al día, y resume la semana en la newsletter Geeky Weekly. El producto existe desde 2017 y vive en [salageek.com](https://salageek.com).

Éxito, en los términos confirmados, es que el lector encuentre esa cobertura y pueda suscribirse al resumen semanal. No hay una métrica numérica de éxito confirmada.

## Positioning

Cobertura diaria gratuita en español de cine, series, anime y videojuegos, más el resumen semanal Geeky Weekly.

Algunas páginas también mencionan cómics y tecnología. Eso está en el copy vigente; no quedó confirmado como parte del encargo principal.

## Operating Context

- El lector usa el sitio público y el blog en español, y se suscribe a Geeky Weekly por correo.
- Quien publica usa el panel en `admin/` (autenticación, guardado de artículos y subida de imágenes).
- La newsletter sale por Mailchimp.
- Contacto público: contacto@salageek.com y el formulario de contacto.
- Presencia social: Facebook [@SalaGeek19](https://facebook.com/SalaGeek19), Instagram [@sala_geek](https://instagram.com/sala_geek), TikTok [@salageek19](https://tiktok.com/@salageek19), X [@Sala_Geek](https://x.com/Sala_Geek).
- Producción está en Hostinger Premium (hosting compartido con PHP). La v2 sigue ahí hasta el cambio de dominio.
- La v3 se publica primero en `v3.salageek.com`, dentro de `public_html/v3`.

## Capabilities and Constraints

Capacidades de la v2 que pasan a la v3: landing, blog con artículos, newsletter Geeky Weekly, panel de administración, formulario de contacto, consentimiento de cookies, media kit y easter eggs con logros en el navegador.

La v3 retira la PWA y HubSpot. Un service worker de un solo uso desregistra la app instalable de la v2.

Restricciones que el trabajo futuro debe conservar:

- Contenido gratuito.
- Idioma de cara al público: español.
- Despliegue en Hostinger Premium. El plan no ejecuta Node.js, así que el sitio público es estático.
- Nombre de la newsletter: Geeky Weekly.
- Las URLs públicas de la v2, incluidos los artículos sin `.html` en la canónica.

Stack decidido para la v3, en la rama `v3` y la carpeta `web/`:

- Astro 7 estático para el sitio público y el shell del admin.
- Prisma ORM 7.10.0 con `@prisma/adapter-mariadb` sobre una MySQL nueva. La v2 no tiene base de datos: su contenido vive en JSON, HTML e imágenes, y no se borra.
- PHP sin dependencias para el admin, las vistas, Geeky Weekly y el contacto.
- GitHub Actions compila y publica por SSH. `salageek.com` no cambia hasta una aprobación explícita.

Decisiones abiertas:

- Las cifras de audiencia, alcance, engagement y los superlativos del sitio («comunidad más grande», «#1», «+1M», «75%», «27K+», «20.000», «10K») no están confirmadas. El trabajo futuro no debe repetirlas como prueba ni inventar números en su lugar.
- No quedó definido un estándar de accesibilidad más allá de lo que el sitio ya implementa.

## Brand Commitments

- Nombre: Sala Geek.
- Dominio: salageek.com.
- En activo desde 2017.
- Correo público: contacto@salageek.com.
- Newsletter: Geeky Weekly.
- El copy público está en español y se dirige al lector de tú.
- El logo se conserva tal cual: `src/images/SalaGeek_LOGO.webp` y `src/images/Icono_SG.ico`. No se recolorea, no se deforma y no se le ponen efectos.

## Evidence on Hand

- Sitio en producción: https://salageek.com
- Artículos y datos del blog: `blog/articulos/`, `blog/data/articles.json`
- Páginas legales: `src/pages/legal/`
- Media kit: `src/pages/media-kit.html` (el copy existe; sus métricas no están confirmadas)
- Plantilla de newsletter: `templates/newsletter/geeky-weekly-template.html`
- Imagen social: `src/images/social-card.png`

No hay testimonios, casos de estudio ni auditorías de audiencia confirmados. No fabricarlos.

## Product Principles

1. El lector llega a ponerse al día; la cobertura en español de cine, series, anime y videojuegos es el trabajo del producto.
2. El contenido sigue siendo gratuito. Geeky Weekly es el resumen semanal, no un acceso de pago.
3. No se inventan ni se citan como prueba cifras de audiencia, rankings ni engagement.
4. El español de cara al lector se conserva.
5. La v2 permanece publicada e intacta hasta el cambio de dominio. La v3 usa el stack decidido arriba y no borra los JSON, el HTML, las imágenes ni la audiencia de Mailchimp.
