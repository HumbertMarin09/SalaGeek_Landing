const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://pagead2.googlesyndication.com https://adservice.google.com https://*.google.com https://*.googleadservices.com https://*.googlesyndication.com https://*.doubleclick.net https://*.adtrafficquality.google https://connect.facebook.net https://giscus.app",
  "style-src 'self' 'unsafe-inline' https://giscus.app",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self' https://*.google.com https://*.googleapis.com https://*.googlesyndication.com https://*.googleadservices.com https://*.doubleclick.net https://*.adtrafficquality.google https://*.facebook.com https://*.facebook.net https://raw.githubusercontent.com https://api.github.com https://giscus.app",
  "frame-src 'self' https://www.google.com/recaptcha/ https://*.google.com https://*.googlesyndication.com https://*.doubleclick.net https://*.adtrafficquality.google https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://giscus.app",
].join('; ');

export type HtaccessEnv = 'staging' | 'production';

export function renderHtaccess(env: HtaccessEnv): string {
  const stagingGuard =
    env === 'staging'
      ? `RewriteCond %{HTTP_HOST} !^v3\\.salageek\\.com$ [NC]
RewriteRule ^ - [R=404,L]
Header always set X-Robots-Tag "noindex, nofollow"`
      : `RewriteCond %{HTTP_HOST} ^www\\.(.*)$ [NC]
RewriteRule ^(.*)$ https://%1/$1 [R=301,L]
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]`;

  return `# Generado por web/scripts/render-htaccess.ts. No editar en el servidor.
<IfModule mod_headers.c>
    Header always set Content-Security-Policy "${CSP}"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set X-Frame-Options "DENY"
${env === 'staging' ? '    Header always set X-Robots-Tag "noindex, nofollow"\n' : ''}    <FilesMatch "\\.(html|htm)$">
        Header set Cache-Control "no-cache"
    </FilesMatch>
</IfModule>
<IfModule mod_rewrite.c>
    RewriteEngine On
    ${stagingGuard}
    RewriteRule ^api/v3/_ - [F,L]
    RewriteRule ^api/(auth|save-article|upload-image|list-images|get-drafts|track-view|mailchimp-subscribe|contact-form)\\.php$ - [F,L]
    RewriteRule ^media-kit/?$ /media-kit.html [L]
    RewriteRule ^privacidad/?$ /privacidad.html [L]
    RewriteRule ^terminos/?$ /terminos.html [L]
    RewriteRule ^cookies/?$ /cookies.html [L]
    RewriteRule ^admin/?$ /admin/index.html [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^blog/articulos/([^/]+)/?$ /blog/articulos/$1.html [L]
</IfModule>
ErrorDocument 404 /404.html
Options -Indexes
<FilesMatch "^(htaccess|\\.env)">
    Require all denied
</FilesMatch>
`;
}
