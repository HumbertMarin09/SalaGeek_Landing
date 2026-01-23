# 🚀 Guía de Configuración: Hostinger

## Estado: ✅ MIGRACIÓN COMPLETADA

---

## 📋 PASO 1: Credenciales a Configurar

Edita el archivo `api/config.php` con las siguientes credenciales:

### 🔑 TABLA DE CREDENCIALES

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|-----------------|
| `RECAPTCHA_SECRET_KEY` | Clave secreta de reCAPTCHA v3 | [Google reCAPTCHA Console](https://www.google.com/recaptcha/admin) |
| `MAILCHIMP_API_KEY` | API Key de Mailchimp | Mailchimp → Account → Extras → API Keys |
| `MAILCHIMP_AUDIENCE_ID` | ID de la lista/audiencia | Mailchimp → Audience → Settings → Audience name and defaults |
| `MAILCHIMP_DC` | Datacenter (ej: `us5`) | Los caracteres después del `-` en tu API Key |
| `GITHUB_TOKEN` | Personal Access Token | GitHub → Settings → Developer settings → Tokens |
| `GITHUB_REPO` | Formato: `usuario/repo` | Tu repositorio de GitHub |
| `ADMIN_EMAIL` | Email del administrador | Tu email |
| `ADMIN_PASSWORD_HASH` | Hash bcrypt de la contraseña | Ver instrucciones abajo |
| `CONTACT_EMAIL` | Email para formulario | Donde recibirás mensajes |

---

## 📋 PASO 2: Información que necesito de ti

Copia esta sección, completa los datos y envíamela:

```
═══════════════════════════════════════════════════════
CREDENCIALES PARA CONFIGURAR - SALA GEEK
═══════════════════════════════════════════════════════

🔐 reCAPTCHA v3
───────────────────────────────────────────────────────
Secret Key: _________________________________________
(Site Key ya configurada: 6LcJzwUsAAAAAC-ecsG89N36b8nnVCt64UOTHKqB)


📧 Mailchimp
───────────────────────────────────────────────────────
API Key: ____________________________________________
Audience/List ID: ___________________________________
Datacenter (ej: us5, us21): _________________________


🐙 GitHub (para gestión de artículos)
───────────────────────────────────────────────────────
Personal Access Token: ______________________________
Repositorio (usuario/repo): _________________________
Branch (normalmente main): __________________________


👤 Panel de Administración
───────────────────────────────────────────────────────
Email de admin: _____________________________________
Contraseña deseada: _________________________________


📬 Formulario de Contacto (Media Kit)
───────────────────────────────────────────────────────
Email para recibir mensajes: ________________________

═══════════════════════════════════════════════════════
```

---

## 📋 PASO 3: Cómo generar el hash de contraseña

Una vez que me des la contraseña, yo generaré el hash. O puedes hacerlo tú:

```bash
# En terminal con PHP instalado:
php -r "echo password_hash('TU_CONTRASEÑA', PASSWORD_DEFAULT);"
```

El resultado será algo como: `$2y$10$abc123...` (esto va en `ADMIN_PASSWORD_HASH`)

---

## 📋 PASO 4: Validaciones después de subir

### ✅ Checklist de pruebas

| # | Funcionalidad | URL/Acción | Cómo probar |
|---|---------------|------------|-------------|
| 1 | Página principal | `salageek.com` | Debe cargar sin errores |
| 2 | Newsletter Hero | Suscribirse con email real | Debe aparecer en Mailchimp |
| 3 | Newsletter Footer | Suscribirse con otro email | Debe aparecer en Mailchimp |
| 4 | Blog | `salageek.com/blog` | Lista de artículos visible |
| 5 | Admin Login | `salageek.com/admin` | Formulario de login visible |
| 6 | Admin Auth | Entrar con credenciales | Acceso al panel |
| 7 | Crear artículo | Desde admin, nuevo artículo | Verificar en GitHub |
| 8 | Subir imagen | Desde admin, subir imagen | Verificar en GitHub |
| 9 | Media Kit | `salageek.com/media-kit` | Página carga completa |
| 10 | Formulario contacto | Enviar desde Media Kit | Email recibido |
| 11 | URL /privacidad | `salageek.com/privacidad` | Página de privacidad |
| 12 | URL /terminos | `salageek.com/terminos` | Términos y condiciones |
| 13 | Página 404 | URL que no existe | Página 404 personalizada |

---

## 📋 PASO 5: Configuración DNS

### Opción A: Usar Nameservers de Hostinger

En **Namecheap**:
1. Ve a Domain List → tu dominio → Manage
2. En "Nameservers", selecciona "Custom DNS"
3. Agrega los nameservers de Hostinger:
   - `ns1.hostinger.com`
   - `ns2.hostinger.com`

### Opción B: Usar registros A

En **Namecheap** (Advanced DNS):
```
Tipo    Host    Valor                TTL
A       @       [IP de Hostinger]    Automatic
A       www     [IP de Hostinger]    Automatic
```

> La IP la obtienes en Hostinger → Hosting → Manage → Website → IP Address

---

## 📂 Resumen de archivos del proyecto

### APIs PHP (carpeta `/api/`)
| Archivo | Función |
|---------|---------|
| `config.php` | Configuración centralizada (⚠️ EDITAR ESTE) |
| `mailchimp-subscribe.php` | Suscripción newsletter |
| `auth.php` | Login/logout admin |
| `save-article.php` | CRUD de artículos |
| `upload-image.php` | Subir imágenes |
| `list-images.php` | Listar imágenes |
| `contact-form.php` | Formulario Media Kit |

### Configuración
| Archivo | Función |
|---------|---------|
| `.htaccess` | Reglas Apache (redirecciones, seguridad) |
| `sw.js` | Service Worker (cache offline) |

---

## ⚠️ Requisitos de Hostinger

- ✅ PHP 7.4 o superior
- ✅ Extensiones: `curl`, `json`, `mbstring`
- ✅ Función `mail()` habilitada
- ✅ SSL/HTTPS activo

> Hostinger incluye todo esto por defecto en sus planes de hosting compartido.

---

## 🆘 Solución de problemas comunes

### Error 500 en las APIs
```
Solución: Revisar logs en Hostinger → Archivos → Logs → Error Log
```

### Newsletter no funciona
```
Verificar:
1. API Key de Mailchimp correcta
2. Audience ID correcto
3. Datacenter correcto (debe coincidir con API Key)
```

### No puedo hacer login en admin
```
Verificar:
1. Hash de contraseña generado correctamente
2. Email coincide exactamente
3. Sesiones PHP funcionando
```

### Formulario de contacto no envía
```
Verificar:
1. Función mail() habilitada en Hostinger
2. Email de destino correcto en config.php
3. No hay bloqueo de spam en el servidor
```

---

**Documento actualizado: 22 de enero de 2026**
