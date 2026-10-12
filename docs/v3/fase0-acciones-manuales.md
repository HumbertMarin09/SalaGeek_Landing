# Acciones manuales de la Fase 0

La llave de despliegue ya existe en esta máquina. La privada no se commitea: `C:\Users\humbe\.ssh\sg-ci`. La pública, para pegar en hPanel → SSH Access → Add SSH Key:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINxMpkXFWd8ZEN1yU8++pF99QqvCUXp/OdawC3GIUWJm sg-ci salageek deploy
```

Huella: `SHA256:tTn6ZKAEIdg6RSiQK2g8G6AnP08M7NrgCKC3iNvjezs`.

Estas acciones solo se pueden hacer desde hPanel y GitHub. Sin ellas el workflow de deploy no tiene a dónde conectar, y no se tocó `public_html` de salageek.com.

## hPanel

1. Confirmar en Avanzado → GIT que main no se despliega solo. Si ese auto-deploy existe, desactívalo: el admin de la v2 ya escribe en GitHub y un pull automático pisaría archivos.
2. Activar SSH y agregar la llave pública de arriba.
3. Crear el subdominio `v3.salageek.com` con carpeta `public_html/v3` y SSL.
4. Crear la base `…_sgv3_stg` y su usuario. Anotar `SELECT VERSION();`.
5. PHP 8.3 o superior, con `pdo_mysql`, `gd` (WebP), `curl`, `mbstring` y `fileinfo`.
6. Generar un respaldo manual y, por SSH, `tar -czf ~/backups/salageek-v2-2026-10-12.tar.gz` del `public_html` actual. Descargar esa copia. No borrar nada del sitio en producción.

## GitHub

Environments `staging` y `production`. El de production exige tu aprobación.

Secrets, por environment: `HOSTINGER_SSH_HOST`, `HOSTINGER_SSH_PORT` (`65002`), `HOSTINGER_SSH_USER`, `HOSTINGER_SSH_KEY` (la privada de `sg-ci`), `HOSTINGER_KNOWN_HOSTS`, `HOSTINGER_HOME`, `DEPLOY_PATH`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `MAILCHIMP_API_KEY`, `MAILCHIMP_AUDIENCE_ID`, `MAILCHIMP_DC`, `RECAPTCHA_SECRET_KEY`, `CONTACT_EMAIL`, `DISPATCH_TOKEN`, `ADMIN_SEED_EMAIL`, `ADMIN_SEED_NAME`, `ADMIN_SEED_PASSWORD_HASH`.

Variables: `LEGACY_SYNC_ENABLED=true`, `CUTOVER_APPROVED=false`, `SITE_URL`.

`DISPATCH_TOKEN` es un token fine-grained de este repo, solo con lectura y escritura de Contents.

## Google

Agregar `v3.salageek.com` a los dominios permitidos de reCAPTCHA.

## Prueba de conexión, cuando el host y el usuario existan

```
ssh -p 65002 -i ~/.ssh/sg-ci USUARIO@HOST "echo ok && mysql --version"
```

Hasta tener ese usuario y ese host, la prueba no se puede correr desde aquí.
