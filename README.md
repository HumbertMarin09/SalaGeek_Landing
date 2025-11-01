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

El formulario está preparado para integrarse con cualquier servicio de email marketing. Modifica la función `initNewsletterForm()` en `script.js` para conectar con tu API.

## 🔗 Enlaces Importantes

- Facebook: <https://www.facebook.com/SalaGeek19>
- Instagram: <https://www.instagram.com/sala_geek/>
- TikTok: <https://www.tiktok.com/@salageek19>

## 📄 Licencia

© 2025 Sala Geek. Todos los derechos reservados.

## 👥 Contacto

- Email: <contacto@salageek.com>
- Ubicación: Ciudad de México, México

---

Hecho con ♥ para la comunidad geek
