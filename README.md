# 🎮 Sala Geek - Landing Page

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/HumbertMarin09/SalaGeek_Landing)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-production-success.svg)](https://salageek.com)

Landing page oficial de **Sala Geek**, tu espacio definitivo para mantenerte al día con lo último en películas, series, anime y videojuegos.

---

## ✨ Características

- **Hero Section Animado**: Typewriter effect, floating badges, gradient backgrounds
- **Sistema de Easter Eggs**: 15 Easter Eggs interactivos (9 Desktop + 6 Mobile)
- **Achievement Tracker**: Sistema de logros con persistencia localStorage
- **Blog Dinámico**: Sistema de artículos con filtros y paginación
- **Newsletter**: Integración completa con Mailchimp (Geeky Weekly)
- **PWA**: Progressive Web App con manifest.json
- **Responsive**: Optimizado para desktop, tablet y móvil
- **Performance**: Core Web Vitals optimizados (94+ Lighthouse)

---

## 🛠 Tecnologías

- **HTML5**: Semántico y accesible
- **CSS3**: Variables CSS (Design Tokens), Grid, Flexbox
- **JavaScript (Vanilla)**: ES6+, Web Audio API, localStorage
- **PHP 7.4+**: APIs backend
- **Mailchimp API**: Newsletter automation
- **Hostinger**: Hosting compartido con PHP

---

## 📁 Estructura del Proyecto

```
SG_Landing/
├── index.html                    # Página principal
├── 404.html                      # Página de error
├── .htaccess                     # Configuración Apache
├── api/                          # APIs PHP
│   ├── config.php                # Configuración centralizada
│   ├── mailchimp-subscribe.php   # Suscripción newsletter
│   ├── auth.php                  # Autenticación admin
│   ├── save-article.php          # CRUD artículos
│   ├── upload-image.php          # Subida de imágenes
│   ├── list-images.php           # Listado de imágenes
│   └── contact-form.php          # Formulario de contacto
├── admin/                        # Panel de administración
├── blog/
│   ├── index.html                # Blog principal
│   ├── articulos/                # Artículos del blog
│   └── data/
│       ├── articles.json         # Datos completos de artículos
│       └── articles-summary.json # Resumen ligero (homepage)
├── src/
│   ├── css/
│   │   ├── style.css             # Estilos principales
│   │   ├── blog.css              # Estilos del blog
│   │   ├── easter-eggs.css       # Achievement Tracker
│   │   └── media-kit.css         # Media Kit
│   ├── js/
│   │   ├── script.js             # JavaScript principal
│   │   ├── blog-engine.js        # Motor del blog
│   │   ├── performance-boost.js  # Optimizaciones
│   │   ├── cookie-consent.js     # Gestión de cookies
│   │   ├── features-plus.js      # Funcionalidades extras
│   │   └── monetization.js       # Sistema de ads
│   ├── images/                   # Recursos gráficos
│   └── pages/
│       ├── media-kit.html        # Media Kit
│       ├── legal/                # Páginas legales
│       └── partials/             # Header y Footer
├── templates/
│   ├── email/                    # Templates de email
│   └── newsletter/               # Newsletter semanal
└── assets/                       # Media Kit PDF
```

---

## 🚀 Instalación

```bash
# Clonar repositorio
git clone https://github.com/HumbertMarin09/SalaGeek_Landing.git

# Instalar dependencias (desarrollo)
npm install

# Minificar CSS y JS
npm run minify

# Servidor local
npx http-server . -p 3000
```

---

## 📦 Scripts Disponibles

```bash
npm run minify:css    # Minificar CSS
npm run minify:js     # Minificar JS
npm run minify        # Minificar todo
npm run format        # Formatear código con Prettier
```

---

## 🌐 Deployment

El proyecto se despliega en **Hostinger** (hosting compartido con PHP).

**URL de producción:** [https://salageek.com](https://salageek.com)

### Configuración requerida en Hostinger:

1. Subir todos los archivos vía FTP o File Manager
2. Configurar variables en `api/config.php`
3. Apuntar DNS del dominio a Hostinger

---

## 📧 Contacto

- **Web**: [salageek.com](https://salageek.com)
- **Email**: contacto@salageek.com
- **Facebook**: [@SalaGeek19](https://facebook.com/SalaGeek19)
- **Instagram**: [@sala_geek](https://instagram.com/sala_geek)
- **TikTok**: [@salageek19](https://tiktok.com/@salageek19)
- **X (Twitter)**: [@Sala_Geek](https://x.com/Sala_Geek)

---

**Hecho con 💜 por Sala Geek** | © 2017-2026
