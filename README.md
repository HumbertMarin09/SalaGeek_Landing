# 🎮 Sala Geek - Landing Page# 🎮 Sala Geek - Landing Page

[![Version](https://img.shields.io/badge/version-1.73.0-blue.svg)](https://github.com/HumbertMarin09/SalaGeek_Landing)[![Version](https://img.shields.io/badge/version-1.73.0-blue.svg)](https://github.com/HumbertMarin09/SalaGeek_Landing)

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[![Status](https://img.shields.io/badge/status-production-success.svg)](https://salageek.com)[![Status](https://img.shields.io/badge/status-production-success.svg)]()

Landing page oficial de **Sala Geek**, tu espacio definitivo para mantenerte al día con lo último en películas, series, anime y videojuegos. Incluye sistema completo de Easter Eggs, Achievement Tracker, animaciones avanzadas y diseño responsive optimizado.Landing page oficial de **Sala Geek**, tu espacio definitivo para mantenerte al día con lo último en películas, series, anime y videojuegos. Incluye sistema completo de Easter Eggs, Achievement Tracker, animaciones avanzadas y diseño responsive optimizado.

---

## 📋 Tabla de Contenidos## 📋 Tabla de Contenidos

- [Características](#-características)- [Características](#-características)

- [Tecnologías](#-tecnologías)- [Tecnologías](#-tecnologías)

- [Estructura del Proyecto](#-estructura-del-proyecto)- [Estructura del Proyecto](#-estructura-del-proyecto)

- [Sistema de Easter Eggs](#-sistema-de-easter-eggs)- [Sistema de Easter Eggs](#-sistema-de-easter-eggs)

- [Achievement Tracker API](#-achievement-tracker-api)- [Achievement Tracker API](#-achievement-tracker-api)

- [Instalación](#-instalación)- [Instalación](#-instalación)

- [Personalización](#-personalización)- [Personalización](#-personalización)

- [Performance](#-performance)- [Performance](#-performance)

- [Deployment](#-deployment)- [Deployment](#-deployment)

- [Debugging](#-debugging)- [Debugging](#-debugging)

- [Changelog](#-changelog)- [Changelog](#-changelog)

- [Contacto](#-contacto)

---

---

## ✨ Características

## ✨ Características

### 🎯 Funcionalidades Principales

### 🎯 Funcionalidades Principales

- **Hero Section Animado**: Typewriter effect, floating badges, gradient backgrounds

- **Hero Section Animado**: Typewriter effect, floating badges, gradient backgrounds- **Sistema de Easter Eggs**: 9 Easter Eggs interactivos (6 móvil + 3 desktop exclusivos)

- **Sistema de Easter Eggs**: 9 Easter Eggs interactivos (6 móvil + 3 desktop exclusivos)- **Achievement Tracker**: Sistema de logros con persistencia localStorage y niveles dinámicos

- **Achievement Tracker**: Sistema de logros con persistencia localStorage y niveles dinámicos- **Audio 8-bit**: Sistema de sonidos retro con Web Audio API

- **Audio 8-bit**: Sistema de sonidos retro con Web Audio API- **Animaciones Avanzadas**: Parallax, glitch effects, confetti celebration

- **Animaciones Avanzadas**: Parallax, glitch effects, confetti celebration- **Newsletter**: Integración completa con Mailchimp (Geeky Weekly)

- **Newsletter**: Integración completa con Mailchimp (Geeky Weekly)- **Lazy Loading**: Carga optimizada de componentes dinámicos

- **Lazy Loading**: Carga optimizada de componentes dinámicos- **Design Tokens**: Sistema de variables CSS para fácil personalización

- **Design Tokens**: Sistema de variables CSS para fácil personalización

### 🎨 Diseño

### 🎨 Diseño

- **Tema Oscuro**: Paleta de colores moderna (#0a0e27, #ffd166, #e76f51)

- **Tema Oscuro**: Paleta de colores moderna (#0a0e27, #ffd166, #e76f51)- **Responsive**: Optimizado para desktop (>968px), tablet (768-968px) y móvil (<768px)

- **Responsive**: Optimizado para desktop (>968px), tablet (768-968px) y móvil (<768px)- **Accesibilidad**: WCAG 2.1 AA compliant (touch targets 44px+, contraste optimizado)

- **Accesibilidad**: WCAG 2.1 AA compliant (touch targets 44px+, contraste optimizado)- **Performance**: Core Web Vitals optimizados (94+ Lighthouse Mobile Score)

- **Performance**: Core Web Vitals optimizados (94+ Lighthouse Mobile Score)

## 🚀 Estructura del Proyecto

---

````text

## 🛠 TecnologíasSG_Landing/

├── index.html              # Página principal (Landing Page)

- **HTML5**: Semántico y accesible├── README.md              # Este archivo

- **CSS3**: Variables CSS (Design Tokens), Grid, Flexbox, Custom Animations├── package.json           # Configuración del proyecto

- **JavaScript (Vanilla)**: ES6+, Web Audio API, localStorage, Intersection Observer├── src/

- **Mailchimp API**: Newsletter automation│   ├── css/

- **Netlify**: Hosting + Serverless Functions│   │   ├── normalize.css  # Reset CSS

│   │   └── style.css      # Estilos principales

---│   ├── js/

│   │   └── script.js      # JavaScript principal

## 📁 Estructura del Proyecto│   ├── images/            # Recursos gráficos

│   └── pages/

```│       ├── partials/

SG_Landing/│       │   ├── header.html  # Header compartido

├── index.html                  # Página principal (v1.73.0)│       │   └── footer.html  # Footer compartido

├── README.md                   # Este archivo│       └── legal/

├── package.json                # Configuración npm│           ├── cookies.html

││           ├── privacy.html

├── src/│           └── terms.html

│   ├── css/├── email-templates/        # 📧 Sistema de Newsletter

│   │   ├── normalize.css       # CSS reset│   ├── README.md          # Guía de la carpeta

│   │   └── style.css           # Estilos principales (v1.09.0 / cache v109)│   ├── newsletter-template.html  # Template HTML principal

│   ││   ├── edicion-X-[tema].md       # Contenido semanal

│   ├── js/│   ├── NEWSLETTER-STRATEGY.md    # Estrategia completa

│   │   └── script.js           # JavaScript principal (v1.73.0 / cache v74)│   ├── GUIA-IMPLEMENTACION.md    # Guía Mailchimp

│   ││   └── welcome-email.html        # Email de bienvenida

│   ├── images/├── netlify/

│   │   ├── logo.webp           # Logo principal│   └── functions/         # Serverless functions (Mailchimp API)

│   │   └── hero-image.webp     # Imagen hero└── docs/                  # Documentación archivada

│   │```

│   └── pages/

│       ├── partials/## 🎨 Secciones de la Landing Page

│       │   ├── header.html     # Header dinámico

│       │   └── footer.html     # Footer dinámico### 1. Hero

│       └── legal/

│           ├── cookies.html    # Política de cookies- Título principal con gradiente

│           ├── privacy.html    # Política de privacidad- Subtítulo descriptivo

│           └── terms.html      # Términos de servicio- 2 CTA buttons (Primario y Secundario)

│- Badges animados de categorías

├── email-templates/             # 📧 Newsletter System

│   ├── newsletter-template.html### 2. Features (Características)

│   ├── welcome-email.html

│   └── NEWSLETTER-STRATEGY.md- 4 cards con iconos

│- Contenido Curado

└── netlify/- Actualizaciones Diarias

    └── functions/               # Serverless (Mailchimp API)- Comunidad Activa

```- Multiplataforma



---### 3. Stats (Estadísticas)



## 🎮 Sistema de Easter Eggs- 50K+ Seguidores

- 500+ Artículos

### Arquitectura- 24/7 Cobertura

- 4 Categorías

- **Achievement Tracker** con persistencia en localStorage

- **Niveles dinámicos** basados en plataforma (móvil: 6 eggs, desktop: 9 eggs)### 4. Testimonials (Testimonios)

- **Audio System** con tonos 8-bit (Web Audio API)

- **Confetti Celebration** al completar todos los Easter Eggs- 3 testimonios de usuarios

- Avatares personalizados

### Easter Eggs Disponibles- Calificaciones 5 estrellas



#### 📱 Móvil + Desktop (6 total)### 5. Newsletter



| # | Nombre | Acción | Efecto | ID |- Formulario de suscripción

|---|--------|--------|--------|-----|- Validación de email

| 1 | **Konami Code** 🎮 | `↑↑↓↓←→←→BA` | Matrix Rain effect | `konami` |- Confirmación visual

| 2 | **Glitch Stats** 📊 | Long press Newsletter (600ms) | Stats glitcheadas | `glitch` |- Nota de seguridad

| 3 | **Retro Mode** 👾 | Long press CTA (600ms) | Modo 8-bit | `retro` |

| 4 | **Thanos Snap** 💥 | Double tap Copyright | Desintegración | `thanos` |### 6. Social Media

| 5 | **Combo Breaker** 🤓 | Long press "Sala Geek" footer (600ms) | Inversión colores | `combo` |

| 6 | **Secret Message** 🏆 | Scroll hasta el final | Mensaje revelado | `scroll` |- Enlaces a Facebook, Instagram y TikTok

- Cards interactivas con hover effects

#### 🖥 Solo Desktop (3 adicionales)

## 🛠️ Tecnologías Utilizadas

| # | Nombre | Acción | Efecto | ID |

|---|--------|--------|--------|-----|- **HTML5** - Estructura semántica

| 7 | **Matrix Rain** 🟢 | Click en Matrix rain | Remover efecto | `matrix` |- **CSS3** - Estilos modernos con Grid y Flexbox

| 8 | **Corner Secret** 🔲 | Click 4 esquinas (30s) | Unlock achievement | `corner` |- **JavaScript (Vanilla)** - Sin dependencias externas

| 9 | **Shake Unlock** 🎯 | Zigzag rápido mouse | Easter Egg secreto | `shake` |- **CSS Variables** - Tematización consistente

- **IntersectionObserver API** - Animaciones on-scroll

> **Nota**: Combo Breaker (egg #5) está en debug mode. Se activa con `easterEggTracker.unlock('combo')` en consola.

## 📱 Responsive Design

### Sistema de Niveles

La landing page está completamente optimizada para:

#### Móvil (6 Easter Eggs disponibles)

- 📱 Móviles (< 480px)

| Nivel | Easter Eggs | Porcentaje | Emoji |- 📱 Tablets (480px - 768px)

|-------|-------------|------------|-------|- 💻 Desktop (768px - 968px)

| Novato | 0/6 | 0% | 🌱 |- 🖥️ Large Screens (> 968px)

| Explorador | 1/6 | 16% | 🔍 |

| Cazador | 2/6 | 33% | 🎯 |## 🎯 SEO Optimizado

| Maestro | 3/6 | 50% | 🎓 |

| Leyenda | 4-5/6 | 66-83% | ⭐ |- Meta tags descriptivos

| Dios Geek | 6/6 | 100% ✅ | 👑 |- Estructura semántica HTML5

- Alt text en todas las imágenes

#### Desktop (9 Easter Eggs disponibles)- URLs amigables

- Tiempo de carga optimizado

| Nivel | Easter Eggs | Porcentaje | Emoji |

|-------|-------------|------------|-------|## 🚀 Cómo Usar

| Novato | 0/9 | 0% | 🌱 |

| Explorador | 1/9 | 11% | 🔍 |1. **Abrir directamente:**

| Cazador | 2-3/9 | 22-33% | 🎯 |   - Abre `index.html` en tu navegador

| Maestro | 4-5/9 | 44-55% | 🎓 |

| Leyenda | 6-8/9 | 66-88% | ⭐ |2. **Con servidor local:**

| Dios Geek | 9/9 | 100% ✅ | 👑 |

   ```bash

---   # Usando Python

   python -m http.server 8000

## 🏆 Achievement Tracker API

   # Usando Node.js (http-server)

### Métodos Públicos   npx http-server -p 8000

````

````javascript

// Desbloquear un Easter Egg3. **Visita:**

easterEggTracker.unlock('konami');

   ```text

// Obtener cantidad de Easter Eggs desbloqueados   http://localhost:8000

const count = easterEggTracker.getUnlockedCount();  // 3   ```



// Verificar si un Easter Egg está desbloqueado## 📝 Personalización

const isUnlocked = easterEggTracker.isUnlocked('konami');  // true

### Colores

// Obtener nivel actual

const level = easterEggTracker.getLevel();  // "Cazador"Los colores principales se definen en `:root` en `style.css`:



// Reset completo (borrar todo progreso)```css

easterEggTracker.reset();--accent-primary: #FFD166;    /* Amarillo dorado */

```--accent-secondary: #E76F51;  /* Rojo coral */

--bg-primary: #0a0e27;        /* Azul oscuro */

### localStorage Structure--bg-secondary: #1a1f3a;      /* Azul medio */

````

````json

{### Newsletter Integration

  "easterEggs": {

    "konami": true,✅ **Sistema completo integrado con Mailchimp**

    "glitch": true,

    "retro": false,## ✨ Características

    "thanos": false,

    "combo": false,- Landing page responsiva y optimizada

    "scroll": true,- Formulario conectado a Mailchimp API (netlify/functions/)

    "matrix": false,- Diseño dark mode con temática geek/gaming

    "corner": false,

    "shake": false- Email de bienvenida automático configurado

  }- Newsletter semanal "Geeky Weekly" programado

}

```📧 **Ver carpeta `email-templates/` para gestionar el newsletter**



### Eventos Personalizados## 🔗 Enlaces Importantes



```javascript- **Website:** <https://salageek.com>

// Escuchar cuando se desbloquea un Easter Egg- **Facebook:** <https://www.facebook.com/SalaGeek19>

document.addEventListener('easterEggUnlocked', (e) => {- **Instagram:** <https://www.instagram.com/sala_geek/>

  console.log('Desbloqueado:', e.detail.id);- **TikTok:** <https://www.tiktok.com/@salageek19>

  console.log('Progreso:', e.detail.count + '/' + e.detail.total);

});## 📊 Performance

````

- **Lighthouse Score:** 94 (Mobile) / 98 (Desktop)

---- **Hosting:** Netlify

- **CDN:** Global edge network

## 🚀 Instalación

## 📧 Newsletter

### Desarrollo Local

**Geeky Weekly** - Newsletter semanal con lo mejor de la cultura geek

````bash

# 1. Clonar repositorio- **Frecuencia:** Viernes 18:00

git clone https://github.com/HumbertMarin09/SalaGeek_Landing.git- **Plataforma:** Mailchimp

cd SalaGeek_Landing- **Suscriptores objetivo:** 1000+ en 3 meses



# 2. Servir localmente## � Licencia

# Opción A: Python

python -m http.server 8080© 2025 Sala Geek. Todos los derechos reservados.



# Opción B: Node.js## 👥 Contacto

npx http-server -p 8080

- **Email:** <contacto@salageek.com>

# Opción C: VS Code Live Server- **Ubicación:** Ciudad de México, México

# Instalar extensión y click derecho > "Open with Live Server"



# 3. Abrir navegador---

# http://localhost:8080

```**Última actualización:** Noviembre 4, 2025

**Versión:** 1.0 - Production Ready + Newsletter System

### Testing de Easter Eggs

---

```javascript

// Consola del navegador (F12)Hecho con ♥ para la comunidad geek


// Ver progreso actual
easterEggTracker.getUnlockedCount();

// Desbloquear todos (testing)
['konami', 'glitch', 'retro', 'thanos', 'combo', 'scroll', 'matrix', 'corner', 'shake']
  .forEach(id => easterEggTracker.unlock(id));

// Reset para volver a probar
easterEggTracker.reset();
````

---

## 🎨 Personalización

### Colores (CSS Variables)

```css
/* src/css/style.css */

:root {
  /* 🎨 Paleta principal */
  --accent-primary: #ffd166; /* Amarillo dorado (CTA) */
  --accent-secondary: #e76f51; /* Naranja coral (hover) */

  /* 🌑 Backgrounds */
  --bg-primary: #0a0e27; /* Fondo oscuro */
  --bg-secondary: #1a1f3a; /* Tarjetas */

  /* 📝 Textos */
  --text-primary: #f0f2f7; /* Headings */
  --text-secondary: #b8bfd9; /* Body */

  /* ⚡ Transiciones */
  --transition: 0.3s ease;
}
```

### Actualizar Versiones (Cache Busting)

```html
<!-- index.html -->

<!-- Incrementar versión después de cambios en CSS -->
<link rel="stylesheet" href="/src/css/style.css?v=110" />

<!-- Incrementar versión después de cambios en JS -->
<script defer src="/src/js/script.js?v=75"></script>
```

**Regla**: Incrementar +1 en cada actualización del archivo correspondiente.

### Agregar Nuevo Easter Egg

```javascript
/* src/js/script.js - SECCIÓN 6: SISTEMA DE EASTER EGGS */

// 1. Agregar ID al tracker init
easterEggs: {
  // ... existentes
  nuevo: false; // ← Agregar aquí
}

// 2. Crear función de activación
function activarNuevoEasterEgg() {
  if (easterEggTracker.isUnlocked("nuevo")) return;

  // Tu efecto aquí
  console.log("¡Nuevo Easter Egg!");

  easterEggTracker.unlock("nuevo");
}

// 3. Vincular evento
document.querySelector(".selector").addEventListener("click", activarNuevoEasterEgg);
```

---

## ⚡ Performance

### Core Web Vitals (Target)

- **LCP (Largest Contentful Paint)**: < 2.5s ✅
- **FID (First Input Delay)**: < 100ms ✅
- **CLS (Cumulative Layout Shift)**: < 0.1 ✅

### Lighthouse Scores

- **Mobile**: 94 (Performance), 100 (Accessibility), 100 (Best Practices), 100 (SEO)
- **Desktop**: 98 (Performance), 100 (Accessibility), 100 (Best Practices), 100 (SEO)

### Optimizaciones Implementadas

#### Recursos

- ✅ Preload de CSS y JS críticos
- ✅ Cache busting automático (versiones v109, v74)
- ✅ WebP images con fallback
- ✅ Lazy loading de componentes (header, footer)

#### JavaScript

- ✅ Defer loading de scripts no críticos
- ✅ Debounce en scroll handlers (200ms)
- ✅ RequestAnimationFrame para animaciones
- ✅ Intersection Observer para lazy loading

#### CSS

- ✅ Variables CSS (evita repetición de valores)
- ✅ Will-change en elementos animados
- ✅ Transform/opacity para animaciones (GPU-accelerated)

#### Responsive

- ✅ **Móvil**: Partículas desactivadas (ahorro 40% CPU)
- ✅ Touch targets mínimo 44px (WCAG 2.1 AA)
- ✅ Botones y badges aumentados (legibilidad)

---

## 📦 Deployment

### GitHub Pages

```bash
# 1. Configurar repositorio
git remote add origin https://github.com/HumbertMarin09/SalaGeek_Landing.git

# 2. Push al branch gh-pages
git checkout -b gh-pages
git push -u origin gh-pages

# 3. Configurar en Settings > Pages
# Source: Deploy from branch (gh-pages)
```

**URL**: `https://HumbertMarin09.github.io/SalaGeek_Landing/`

### Netlify (Recomendado)

```bash
# 1. Conectar repositorio en Netlify
# 2. Configuración auto-detectada:
#    Build command: (none)
#    Publish directory: /
#    Functions directory: netlify/functions

# 3. Deploy automático en cada push
```

**Features**:

- ✅ HTTPS automático
- ✅ Serverless functions (Mailchimp API)
- ✅ Deploy previews en PRs
- ✅ CDN global

### Vercel

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Production
vercel --prod
```

---

## 🐛 Debugging

### Debugging Easter Eggs

```javascript
// Chrome DevTools (F12 > Console)

// 1. Ver estado actual del tracker
easterEggTracker;

// 2. Ver qué está guardado en localStorage
localStorage.getItem("easterEggs");

// 3. Forzar desbloqueo de Easter Egg específico
easterEggTracker.unlock("combo"); // Activa Combo Breaker

// 4. Ver nivel actual
easterEggTracker.getLevel();

// 5. Ver progreso
console.log(easterEggTracker.getUnlockedCount() + "/" + easterEggTracker.totalEggs);
```

### Remote Debugging (Móvil)

#### Android

```bash
# 1. Habilitar "Depuración USB" en dispositivo
# 2. Conectar vía USB
# 3. Abrir Chrome desktop > chrome://inspect
# 4. Select device y "inspect"
```

#### iOS

```bash
# 1. Habilitar "Web Inspector" en Settings > Safari > Advanced
# 2. Conectar vía USB
# 3. Abrir Safari desktop > Develop > [Tu iPhone] > [página]
```

### Common Issues

**Issue**: Easter Egg no se activa en móvil  
**Fix**: Verificar long press duration (600ms mínimo para evitar menú sistema)

**Issue**: Tracker muestra 9 eggs en móvil  
**Fix**: Verificado en v1.73.0 - Ahora detecta plataforma correctamente

**Issue**: Nivel no se actualiza  
**Fix**: Verificado en v1.73.0 - updateUI() se llama siempre

---

## 📚 Mantenimiento

### Actualizar Versión

```javascript
/* src/js/script.js - Línea 3 */
Version: 1.74.0  // ← Incrementar

/* src/css/style.css - Línea 3 */
Version: 1.10.0  // ← Incrementar
```

```html
<!-- index.html - Cache busters -->
<link rel="stylesheet" href="/src/css/style.css?v=110" />
<!-- Incrementar -->
<script defer src="/src/js/script.js?v=75"></script>
<!-- Incrementar -->
```

### Checklist de Actualización

- [ ] Incrementar versión en header de archivo modificado
- [ ] Incrementar cache buster en `index.html`
- [ ] Probar en desktop y móvil
- [ ] Verificar que no hay errores en consola
- [ ] Commit con mensaje descriptivo
- [ ] Push a origin/main

---

## 📊 Changelog

### v1.75.0 (2025-11-06) - Performance Boost & Final Cleanup ✅

**Optimizaciones de Performance**

- ⚡ Minificación completa: CSS 29% más ligero (31.69 KB), JS 50% más ligero (65.47 KB)
- ⚡ Performance Boost system: Passive listeners, debounce, throttle, RAF
- ⚡ Time to Interactive mejorado: 14.9s → 8.2s (45% más rápido)
- ⚡ Preconnect optimizado con fetchpriority para recursos críticos
- ⚡ Netlify build processing habilitado (minificación adicional)

**Bug Fixes**

- 🐛 Fix: TikTok social card mismo tamaño en tablet (1073px-680px)
- 🐛 Fix: TikTok card ancho completo en móvil (<680px)

**Cleanup & Mantenimiento**

- 🧹 Eliminado SalaGeek_LOGO.png (duplicado innecesario)
- 🧹 Eliminadas referencias a Formspree (no se usa, newsletter vía Mailchimp)
- 📚 Documentación completa: HTML, JS, netlify.toml, package.json
- 🔖 Versiones finales: CSS v1.11.0, JS v1.75.0
- 🔖 Cache busters actualizados: CSS v136, JS v95

**Performance Metrics**

- First Contentful Paint: 407ms ✅
- Largest Contentful Paint: 1.5s ✅
- Time to Interactive: 8.2s ✅
- GTmetrix Grade: C (funcional, optimizado)
- PageSpeed: 79% móvil, 96% desktop

**Estado: PRODUCTION READY** 🚀

- Código limpio y documentado
- Performance optimizada
- Sin dependencias innecesarias
- Listo para Newsletter del viernes

### v1.73.0 (2025-11-05) - Optimización Completa

**Refactor & Documentación**

- ♻️ JavaScript documentado con 6 secciones y JSDoc completo
- ♻️ CSS documentado con Design Tokens y performance notes
- 📚 README completo con Easter Eggs, API, deployment guides

**Bug Fixes**

- 🐛 Fix: Tracker init correcto (siempre llama updateUI)
- 🐛 Fix: Nivel se muestra correctamente (0/6 móvil, 0/9 desktop)
- 🐛 Fix: Eliminado getLevel() duplicado

**UX Improvements**

- ✨ Botones móvil aumentados (1.1-1.2rem, font-weight 600)
- ✨ Badges hero móvil aumentadas (icons 1.5rem, text 0.85rem)

**Performance**

- ⚡ Cache busters actualizados (JS v74, CSS v109)
- ⚡ No functional regressions - Zero breaking changes

### v1.72.0 (2025-11-05) - Easter Eggs System

**Features**

- 🎮 9 Easter Eggs completos (6 móvil + 3 desktop)
- 🏆 Achievement Tracker con niveles dinámicos
- 🎵 Audio system 8-bit con Web Audio API
- 🎊 Confetti celebration al completar todos

**Mobile Optimizations**

- 📱 Platform-specific tracker (6 eggs móvil, 9 desktop)
- 📱 Long press 600ms (evita menú sistema)
- 📱 Tracker collapsed por default en móvil

### v1.69.0 (2025-11-04) - Foundation

- 🎨 Hero section con typewriter effect
- 📧 Newsletter integration (Mailchimp)
- 🎭 Animaciones parallax y glitch
- 📱 Responsive design completo
- ♿ WCAG 2.1 AA compliance

---

## 🔗 Enlaces

- **Website**: https://salageek.com
- **Facebook**: https://www.facebook.com/SalaGeek19
- **Instagram**: https://www.instagram.com/sala_geek/
- **TikTok**: https://www.tiktok.com/@salageek19

---

## 📧 Newsletter

**Geeky Weekly** - Viernes 18:00 (GMT-6)  
**Plataforma**: Mailchimp  
**Templates**: `email-templates/`  
**Estrategia completa**: `email-templates/NEWSLETTER-STRATEGY.md`

---

## 📄 Licencia

© 2025 Sala Geek. Todos los derechos reservados.

---

## 📞 Contacto

- **Email**: contacto@salageek.com
- **Ubicación**: Ciudad de México, México
- **Issues**: [GitHub Issues](https://github.com/HumbertMarin09/SalaGeek_Landing/issues)

---

<p align="center">
  <strong>Hecho con ❤️ y ☕ para la comunidad geek</strong><br>
  Última actualización: Noviembre 5, 2025 | Versión 1.73.0
</p>
