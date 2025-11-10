# 📬 Geeky Weekly - Guía de Uso

## 🎯 Estructura Optimizada (Basada en Data 2025)

Este template está diseñado con **best practices de email marketing** basadas en investigación de Mailchimp, HubSpot y Litmus para maximizar **engagement y retención**.

---

## 📊 Métricas Objetivo

| Métrica | Benchmark Industria | Meta Geeky Weekly |
|---------|-------------------|------------------|
| **Open Rate** | 35.63% | 40-45% |
| **Click Rate** | 2.62% | 4-5% |
| **Read Time** | 8.97 seg | 15-20 seg |

---

## 🏗️ Secciones del Newsletter (5 en total)

### 1️⃣ **Header Compacto + Social Proof**
- Logo de Sala Geek
- Título "🔥 Geeky Weekly"
- Fecha dinámica (Mailchimp merge tag)
- Badge social proof: "🔥 X+ geeks leyendo esta semana"
- CTA principal: "Ver en SalaGeek.com"

**Merge Tags usados:**
```
*|DATE:l, j \d\e F, Y|*  → Viernes, 15 de Noviembre, 2025
*|STATS:UNIQUEOPENS|*+   → Número de opens únicos
```

---

### 2️⃣ **Top 5 Headlines** (Optimizado para Escaneo Rápido)
**Diseño:** Números grandes con gradiente + título en una línea + link directo

**Reglas:**
- ✅ Títulos máximo 60 caracteres
- ✅ Usar emojis relevantes (🎮 🎬 🕹️ 🎯 ⚡)
- ✅ Links directos sin descripciones largas
- ❌ No agregar párrafos descriptivos

**Plantilla por item:**
```html
<span class="top5-number">[1-5]</span>
<a href="[URL]">[EMOJI] [TÍTULO MÁXIMO 60 CHARS]</a>
<a href="[URL]" class="top5-link">Leer más →</a>
```

---

### 3️⃣ **Spotlight Semanal** (Alternar contenido)

**Opción A: Trailer de la Semana** 🎬
- Usar GIF animado del trailer (3-5 segundos loop) para mayor impacto
- Link directo al video completo
- CTA: "🔥 Ver Más"

**Opción B: Lanzamiento Gamer** 🎮
- Imagen del juego/producto
- Datos: Fecha, Precio, Plataformas
- CTA: "🔥 Ver Más"

**Recomendación:** Alternar semanalmente (Semana 1: Trailer, Semana 2: Lanzamiento, etc.)

---

### 4️⃣ **Easter Egg Challenge** (Gamificación)

**Elementos:**
1. Pista visual (opcional - imagen/meme)
2. Descripción del Easter Egg del sitio web
3. Contador de progreso: "[X] / 4 Easter Eggs encontrados"
4. CTA social: "Compártelo y etiquétanos"

**Easter Eggs disponibles del sitio:**
- Doble click en el logo "Sala Geek"
- Long press (3 seg) en input del newsletter
- Código Konami: ↑ ↑ ↓ ↓ ← → ← → B A
- Hover en el logo (desktop)

**Tracking de progreso:**
Usar Mailchimp custom fields para trackear cuántos Easter Eggs ha encontrado cada suscriptor.

---

### 5️⃣ **CTA Social + Compartir**

**Elementos:**
- Iconos de redes sociales (Facebook, Instagram, TikTok, Twitter)
- Botón principal: "Visitar SalaGeek.com"
- Link para compartir el newsletter

**Redes sociales:**
- 📘 Facebook: https://www.facebook.com/SalaGeek19
- 📷 Instagram: https://www.instagram.com/sala_geek/
- 🎵 TikTok: https://www.tiktok.com/@salageek19
- 🐦 Twitter: @Sala_Geek

---

## 🎨 Paleta de Colores

```css
/* Primarios */
--amarillo-dorado: #ffd166;  /* CTA, badges, highlights */
--naranja-coral: #e76f51;    /* Gradientes, accents */
--azul-logo: #0d6efd;        /* Header gradient */

/* Backgrounds */
--fondo-oscuro: #071428;     /* Body background */
--fondo-primario: #0a0e27;   /* Container */
--fondo-card: #1a1f3a;       /* Sections */

/* Textos */
--texto-principal: #f0f2f7;  /* Headings */
--texto-secundario: #a0aec0; /* Body text */
--texto-terciario: #718096;  /* Hints */

/* Bordes */
--borde-sutil: #2d3748;
```

---

## 📱 Optimización Mobile-First

### Tamaños de Fuente
- **Desktop:** H1: 32px, H2: 24px, H3: 18px, Body: 16px
- **Mobile:** H1: 26px, H2: 20px, H3: 17px, Body: 16px

### Botones (CTA)
- Tamaño mínimo: **44x44px** (Apple HIG)
- Padding: 16px 36px
- Font: 17px bold
- Mobile: 100% width

### Espaciado
- Section padding desktop: 24px
- Section padding mobile: 16-20px
- Margin entre secciones: 20px

---

## 🔧 Cómo Usar en Mailchimp

### 1. Importar Template
1. Ir a **Campaigns** → **Email** → **Regular Campaign**
2. En "Design Email", elegir **Code your own**
3. Click en **Import HTML**
4. Copiar todo el código de `geeky-weekly-template.html`
5. Pegar y click **Save and Continue**

### 2. Reemplazar Placeholders

Buscar y reemplazar los siguientes textos:

**Top 5 (5 items):**
```
[URL_NOTICIA_1-5] → URL de la noticia
[TÍTULO NOTICIA 1-5] → Título corto con emoji
```

**Spotlight Semanal:**
```
[TÍTULO DEL CONTENIDO DESTACADO] → Título del trailer o lanzamiento
[URL_VIDEO_O_ARTICULO] → Link al contenido
[URL_IMAGEN_GIF_O_THUMBNAIL] → Imagen destacada (GIF recomendado)
```

**Easter Egg:**
```
[DESCRIPCIÓN DEL EASTER EGG] → Pista de cómo encontrarlo
[X] / 4 Easter Eggs → Progreso del suscriptor
```

### 3. Personalización Avanzada

**Mailchimp Merge Tags disponibles:**
```
*|FNAME|*                 → Nombre del suscriptor
*|EMAIL|*                 → Email del suscriptor
*|DATE:l, j \d\e F, Y|*   → Fecha en español
*|STATS:UNIQUEOPENS|*     → Número de opens
*|UPDATE_PROFILE|*        → Link actualizar perfil
*|UNSUB|*                 → Link desuscribirse
```

**Ejemplo de saludo personalizado:**
```html
<p>¡Hola *|FNAME:Geek|*!</p>
<!-- Mostrará: "¡Hola Juan!" o "¡Hola Geek!" si no hay nombre -->
```

---

## 📧 Preheader Text (Preview Text)

El preview text actual está optimizado:
```
✨ Top 5 novedades gaming + Trailer épico + Easter Egg secreto 🎮 No te lo pierdas
```

**Reglas:**
- Máximo 90 caracteres
- Usar emojis estratégicos
- Mencionar beneficios claros
- Crear FOMO (Fear of Missing Out)

---

## ✅ Checklist Pre-Envío

### Contenido
- [ ] 5 noticias del Top 5 completadas con URLs
- [ ] Spotlight semanal (trailer o lanzamiento) configurado
- [ ] Easter Egg de la semana definido
- [ ] Fecha actualizada (automático con merge tag)
- [ ] Social proof badge funcional

### Testing
- [ ] Test email enviado a tu correo
- [ ] Revisado en móvil (iOS + Android)
- [ ] Revisado en desktop (Gmail, Outlook, Apple Mail)
- [ ] Todos los links funcionan correctamente
- [ ] Imágenes cargan correctamente
- [ ] CTA botones son clickeables

### Optimización
- [ ] Subject line A/B test configurado
- [ ] Segmento "Geeky Weekly Subscribers" seleccionado
- [ ] Preview text visible y atractivo
- [ ] Unsubscribe link visible en el footer

---

## 📈 Mejores Prácticas

### Subject Lines (Asuntos) Recomendados

**Fórmulas que funcionan:**
```
🔥 Geeky Weekly #[NUM]: [HEADLINE MÁS IMPACTANTE]
🎮 Tu Dosis Semanal: [NOTICIA TRENDING] + Easter Egg
⚡ [NOMBRE], esto explotó esta semana en gaming
🕹️ Top 5 + [LANZAMIENTO DESTACADO] | Geeky Weekly
```

**Reglas de Subject Lines:**
- Máximo 60 caracteres (móvil)
- 1 emoji máximo al inicio
- Personalización con *|FNAME|* aumenta open rate 45%
- Evitar palabras spam: "gratis", "urgente", "!!!!"

### Mejores Días/Horas para Enviar

**Data recomendada:**
- **Día:** Viernes (engagement +23% vs otros días)
- **Hora:** 10:00 AM - 12:00 PM (timezone local del suscriptor)
- **Frecuencia:** Semanal (no sobre-saturar)

### Segmentación

**Crear segmentos en Mailchimp:**
1. **Activos:** Abrieron últimos 3 newsletters
2. **Hunters:** Click en "Easter Egg" alguna vez
3. **Gamers:** Clicks en lanzamientos de juegos
4. **Content Consumers:** High read time (>15 seg)

---

## 🚫 Qué NO Hacer

❌ **No agregar afiliados** (por ahora - decisión del cliente)
❌ **No incluir opiniones personales** sin contenido factual
❌ **No usar más de 1 CTA principal** por sección
❌ **No enviar si hay <5 noticias de calidad**
❌ **No usar subject lines con "Re:" o "Fwd:"**
❌ **No enviar más de 1 vez por semana**

---

## 🎯 KPIs a Trackear

### Por Newsletter
- Open rate
- Click-through rate (CTR)
- Read time
- Unsubscribe rate
- Bounce rate

### Por Sección
- Top 5: Cuál item tiene más clicks
- Spotlight: Engagement vs otras secciones
- Easter Egg: % que hace click en CTA social

### Herramientas Recomendadas
- Mailchimp Analytics (incluido)
- Google Analytics (trackear tráfico desde newsletter)
- Bitly (acortar URLs y trackear clicks individuales)

---

## 🔄 Cronología Semanal Recomendada

| Día | Tarea |
|-----|-------|
| **Lunes** | Recopilar noticias destacadas de la semana |
| **Martes** | Seleccionar Top 5 + Spotlight (trailer o lanzamiento) |
| **Miércoles** | Crear/actualizar template en Mailchimp |
| **Jueves AM** | Test email + revisión en devices |
| **Jueves PM** | Configurar envío para Viernes 10 AM |
| **Viernes** | Envío automático + monitorear métricas |
| **Sábado/Domingo** | Analizar performance + ideas para próxima semana |

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [Mailchimp Merge Tags](https://mailchimp.com/help/all-the-merge-tags-cheat-sheet/)
- [Email Design Best Practices - Litmus](https://litmus.com/blog/email-design-best-practices)
- [Email Marketing Benchmarks - Mailchimp](https://mailchimp.com/resources/email-marketing-benchmarks/)

### Inspiración
- [Really Good Emails](https://reallygoodemails.com/)
- [Milled - Gaming Newsletters](https://milled.com/)

---

## 🆘 Soporte

**Creado por:** GitHub Copilot para Sala Geek  
**Fecha:** Noviembre 2025  
**Versión:** 1.0 - Optimizado Mobile-First  
**Basado en:** Mailchimp, HubSpot & Litmus Best Practices 2025

---

## 🎉 Próximos Pasos

1. **Subir template a Mailchimp**
2. **Crear campaña de prueba**
3. **Enviar test a equipo**
4. **Recopilar feedback**
5. **Programar primer envío oficial**
6. **Iterar basado en métricas**

¡Éxito con Geeky Weekly! 🚀
