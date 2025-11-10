# 📰 Weekly News Images

Esta carpeta contiene las imágenes para la **noticia destacada** de la sección "Esta Semana en el Mundo Geek".

## 🎯 Uso

Solo necesitas **1 imagen** por semana para la noticia DESTACADA (la primera con el badge dorado).

## 📐 Especificaciones de Imagen

- **Dimensiones:** 1200 x 675px (ratio 16:9)
- **Formato:** JPG (mejor compresión) o WebP (más moderno)
- **Peso máximo:** 200KB
- **Calidad:** 80-85% (balance calidad/peso)

## 📝 Naming Convention

Usa nombres descriptivos en minúsculas con guiones:

```
✅ CORRECTO:
gta6-delay.jpg
stranger-things-s5-preview.jpg
pokemon-legends-za-dlc.jpg

❌ INCORRECTO:
IMG_1234.jpg
foto.jpg
imagen-destacada.jpg
```

## 🔄 Actualización Semanal

Cada **jueves** (cuando prepares el newsletter):

1. **Descarga** la imagen de la noticia destacada
2. **Optimiza** con TinyPNG o Squoosh.app (si pesa >200KB)
3. **Renombra** con nombre descriptivo
4. **Guarda** en esta carpeta
5. **Actualiza** en `index.html` línea ~755:
   ```html
   <img 
     src="/src/images/weekly-news/NOMBRE-ARCHIVO.jpg" 
     alt="Título de la noticia"
   />
   ```

## 🌐 Fuentes Recomendadas de Imágenes

### Gratuitas (con atribución):
- **Unsplash**: https://unsplash.com (fotos generales)
- **Pexels**: https://pexels.com (fotos + videos)
- **Pixabay**: https://pixabay.com (libre de derechos)

### Gaming/Geek específicas:
- **Prensa oficial** de estudios (Rockstar, Nintendo, PlayStation)
- **IGN / GameSpot** (citar fuente en alt text)
- **Steam / Epic Games** (capturas oficiales)

### Sitios de screenshots:
- **SteamGridDB**: https://steamgriddb.com
- **MobyGames**: https://mobygames.com

## ⚖️ Copyright & Fair Use

- Prioriza imágenes **oficiales de prensa** (press kits)
- Usa **capturas de pantalla** propias cuando sea posible
- Evita arte de fans sin permiso
- Cita fuente en `alt` text si no es tuya

## 🛠️ Herramientas de Optimización

### Online:
- **TinyPNG**: https://tinypng.com (compresión inteligente)
- **Squoosh**: https://squoosh.app (Google, avanzado)
- **Compressor.io**: https://compressor.io

### Desktop:
- **ImageOptim** (Mac): https://imageoptim.com
- **FileOptimizer** (Windows): https://sourceforge.net/projects/nikkhokkho

### Photoshop:
1. File → Export → Save for Web (Legacy)
2. JPG | Quality 80 | Progressive
3. Resize to 1200x675px

## 📊 Ejemplo de Flujo Semanal

```
🗓️ JUEVES 9:00 AM
├── Seleccionar noticia destacada del newsletter
├── Buscar imagen oficial en Google Images / prensa
├── Descargar imagen (mínimo 1200px ancho)
├── Optimizar con TinyPNG (target: <200KB)
├── Renombrar: gta6-delay.jpg
├── Guardar en /src/images/weekly-news/
└── Actualizar index.html línea 755

✅ LISTO - La imagen se verá en la noticia destacada
```

## 🎨 Tips de Selección

### ✅ Buenas imágenes:
- Screenshots oficiales del juego/película/serie
- Arte promocional de alta calidad
- Capturas con logo/título visible
- Colores vibrantes que contrasten con fondo oscuro

### ❌ Evitar:
- Imágenes borrosas o pixeladas
- Memes o fan art de baja calidad
- Texto ilegible o muy pequeño
- Fondos blancos (choca con dark mode)

## 🔍 Alt Text

El `alt` text debe ser descriptivo para SEO y accesibilidad:

```html
✅ CORRECTO:
alt="GTA 6 retrasado hasta finales de 2026"
alt="Stranger Things Temporada 5 primeros 5 minutos revelados"

❌ INCORRECTO:
alt="Imagen destacada"
alt="Noticia gaming"
alt="foto"
```

## 📱 Responsive

La imagen se adapta automáticamente a móvil:
- **Desktop**: 240px altura
- **Tablet**: 200px altura  
- **Mobile**: 180px altura

El CSS ya maneja esto con `object-fit: cover`.

---

**Última actualización:** Noviembre 2025  
**Mantenedor:** Humberto Marin  
**Consultas:** contacto@salageek.com
