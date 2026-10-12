# Cambio de dominio

Este paso no corre solo. Hace falta el environment `production` de GitHub con tu aprobación y `CUTOVER_APPROVED=true`. El job de producción usa rsync sin `--delete`.

1. Congela el admin de la v2 durante la ventana.
2. Respalda: hPanel, `tar -czf ~/backups/salageek-pre-cutover.tar.gz` de `public_html`, descarga local, y `mysqldump` de la base v3.
3. Crea la base de producción si no es la de staging. `npx prisma migrate deploy`, sincronización final de artículos y de `views.json` de producción, y `npm run db:seed:admin`.
4. Publica en `public_html` con el workflow `v3 deploy` en target `production`. El `.htaccess` de producción bloquea la API v2 aunque sus archivos sigan en disco. No toca `public_html/v3/` ni `uploads/`.
5. Revisa `https://salageek.com/` y las URLs de artículos sin `.html`. Reenvía el sitemap en Search Console.
6. Pon `LEGACY_SYNC_ENABLED=false`.
7. Vuelta atrás: `tar -xzf ~/backups/salageek-pre-cutover.tar.gz -C ~/domains/salageek.com`. No se borró nada, así que el tar restaura lo sobrescrito.
8. Después, un PR de `v3` a `main` sin borrar archivos de la v2.

Antes de aprobar, el job debe poder mostrar un `rsync --dry-run` con cero borrados. Hoy el workflow de producción ya publica sin `--delete`. No lo dispares hasta tener el respaldo.
