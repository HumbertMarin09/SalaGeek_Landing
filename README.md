# 🎮 Sala Geek - Landing Page

Landing page oficial de Sala Geek, tu espacio definitivo para mantenerte al día con lo último en películas, series, anime y videojuegos.

## 📋 Características

- **Hero Section** - Presentación impactante con CTA's destacados
- **Features** - Muestra las características principales del servicio
- **Estadísticas** - Números que respaldan la comunidad
- **Testimonios** - Opiniones reales de usuarios satisfechos
- **Newsletter** - Formulario de suscripción integrado
- **Redes Sociales** - Enlaces a todas las plataformas sociales
- **Diseño Responsivo** - Optimizado para móvil, tablet y escritorio
- **Animaciones Suaves** - Transiciones y efectos visuales atractivos

## 🚀 Estructura del Proyecto

```text
SG_Landing/
├── index.html              # Página principal (Landing Page)
├── README.md              # Este archivo
├── package.json           # Configuración del proyecto
├── src/
│   ├── css/
│   │   ├── normalize.css  # Reset CSS
│   │   └── style.css      # Estilos principales
│   ├── js/
│   │   └── script.js      # JavaScript principal
│   ├── images/            # Recursos gráficos
│   └── pages/
│       ├── partials/
│       │   ├── header.html  # Header compartido
│       │   └── footer.html  # Footer compartido
│       └── legal/
│           ├── cookies.html
│           ├── privacy.html
│           └── terms.html
├── email-templates/        # 📧 Sistema de Newsletter
│   ├── README.md          # Guía de la carpeta
│   ├── newsletter-template.html  # Template HTML principal
│   ├── edicion-X-[tema].md       # Contenido semanal
│   ├── NEWSLETTER-STRATEGY.md    # Estrategia completa
│   ├── GUIA-IMPLEMENTACION.md    # Guía Mailchimp
│   └── welcome-email.html        # Email de bienvenida
├── netlify/
│   └── functions/         # Serverless functions (Mailchimp API)
└── docs/                  # Documentación archivada
```

## 🎨 Secciones de la Landing Page

### 1. Hero

- Título principal con gradiente
- Subtítulo descriptivo
- 2 CTA buttons (Primario y Secundario)
- Badges animados de categorías

### 2. Features (Características)

- 4 cards con iconos
- Contenido Curado
- Actualizaciones Diarias
- Comunidad Activa
- Multiplataforma

### 3. Stats (Estadísticas)

- 50K+ Seguidores
- 500+ Artículos
- 24/7 Cobertura
- 4 Categorías

### 4. Testimonials (Testimonios)

- 3 testimonios de usuarios
- Avatares personalizados
- Calificaciones 5 estrellas

### 5. Newsletter

- Formulario de suscripción
- Validación de email
- Confirmación visual
- Nota de seguridad

### 6. Social Media

- Enlaces a Facebook, Instagram y TikTok
- Cards interactivas con hover effects

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos con Grid y Flexbox
- **JavaScript (Vanilla)** - Sin dependencias externas
- **CSS Variables** - Tematización consistente
- **IntersectionObserver API** - Animaciones on-scroll

## 📱 Responsive Design

La landing page está completamente optimizada para:

- 📱 Móviles (< 480px)
- 📱 Tablets (480px - 768px)
- 💻 Desktop (768px - 968px)
- 🖥️ Large Screens (> 968px)

## 🎯 SEO Optimizado

- Meta tags descriptivos
- Estructura semántica HTML5
- Alt text en todas las imágenes
- URLs amigables
- Tiempo de carga optimizado

## 🚀 Cómo Usar

1. **Abrir directamente:**
   - Abre `index.html` en tu navegador

2. **Con servidor local:**

   ```bash
   # Usando Python
   python -m http.server 8000
   
   # Usando Node.js (http-server)
   npx http-server -p 8000
   ```

3. **Visita:**

   ```text
   http://localhost:8000
   ```

## 📝 Personalización

### Colores

Los colores principales se definen en `:root` en `style.css`:

```css
--accent-primary: #FFD166;    /* Amarillo dorado */
--accent-secondary: #E76F51;  /* Rojo coral */
--bg-primary: #0a0e27;        /* Azul oscuro */
--bg-secondary: #1a1f3a;      /* Azul medio */
```

### Newsletter Integration

✅ **Sistema completo integrado con Mailchimp**

## ✨ Características

- Landing page responsiva y optimizada
- Formulario conectado a Mailchimp API (netlify/functions/)
- Diseño dark mode con temática geek/gaming

- Email de bienvenida automático configurado
- Newsletter semanal "Geeky Weekly" programado

📧 **Ver carpeta `email-templates/` para gestionar el newsletter**

## 🔗 Enlaces Importantes

- **Website:** <https://salageek.com>
- **Facebook:** <https://www.facebook.com/SalaGeek19>
- **Instagram:** <https://www.instagram.com/sala_geek/>
- **TikTok:** <https://www.tiktok.com/@salageek19>

## 📊 Performance

- **Lighthouse Score:** 94 (Mobile) / 98 (Desktop)
- **Hosting:** Netlify
- **CDN:** Global edge network

## 📧 Newsletter

**Geeky Weekly** - Newsletter semanal con lo mejor de la cultura geek

- **Frecuencia:** Viernes 18:00
- **Plataforma:** Mailchimp
- **Suscriptores objetivo:** 1000+ en 3 meses

## � Licencia

© 2025 Sala Geek. Todos los derechos reservados.

## 👥 Contacto

- **Email:** <contacto@salageek.com>
- **Ubicación:** Ciudad de México, México


---

**Última actualización:** Noviembre 4, 2025  
**Versión:** 1.0 - Production Ready + Newsletter System

---

Hecho con ♥ para la comunidad geek
