# 📝 Guía: Cómo Agregar Artículos al Blog

## 🚀 Flujo de Trabajo Simple

### **Opción 1: Artículo Completo (HTML)**

1. **Duplica el template**:
   ```
   Copia: blog/articulos/_template-clean.html
   Renombra: blog/articulos/mi-nuevo-articulo.html
   ```

2. **Edita el contenido**:
   - Busca los comentarios `📝 EDITA AQUÍ`
   - Reemplaza todos los `[PLACEHOLDERS]`
   - Escribe tu contenido en la sección `article-content`

3. **Actualiza articles.json**:
   ```json
   {
     "id": "mi-nuevo-articulo",
     "title": "Título del Artículo Completo",
     "slug": "mi-nuevo-articulo",
     "excerpt": "Descripción breve...",
     "content": "/blog/articulos/mi-nuevo-articulo.html",
     "image": "/src/images/blog/imagen.webp",
     "category": "gaming",
     "categoryDisplay": "Gaming",
     "tags": ["tag1", "tag2"],
     "author": "Sala Geek",
     "publishDate": "2026-01-15T10:00:00Z",
     "modifiedDate": "2026-01-15T10:00:00Z",
     "readTime": "8 min",
     "views": 0,
     "featured": false,
     "trending": false
   }
   ```

4. **Listo** - El artículo aparece automáticamente en el blog

---

## 🎨 Categorías Disponibles

| ID | Nombre | Color | SVG |
|----|--------|-------|-----|
| `series` | Series | Azul | TV |
| `peliculas` | Películas | Morado | Film |
| `gaming` | Gaming | Verde | Gamepad |
| `anime` | Anime | Rosa | Layers |
| `tecnologia` | Tecnología | Cyan | Monitor |

---

## 💬 Configurar Giscus (Comentarios)

Giscus usa **GitHub Discussions** como backend. Es gratis, sin spam, y no necesitas base de datos.

### **Paso 1: Habilitar Discussions en tu Repo**

1. Ve a tu repo de GitHub
2. **Settings** → **General** → Marca **Discussions**

### **Paso 2: Instalar Giscus App**

1. Ve a: https://github.com/apps/giscus
2. Clic en **Install**
3. Selecciona tu repo (`SG_Landing`)

### **Paso 3: Obtener Configuración**

1. Ve a: https://giscus.app/es
2. Completa el formulario:
   - **Repositorio**: `tu-usuario/SG_Landing`
   - **Mapeo**: `pathname`
   - **Categoría**: `Announcements` (o crea una "Blog Comments")
   - **Tema**: `dark`
   - **Idioma**: `es`

3. Copia el código generado

### **Paso 4: Actualizar Template**

Reemplaza en `_template-clean.html` línea 237:

```html
<script src="https://giscus.app/client.js"
  data-repo="TU-USUARIO/SG_Landing"
  data-repo-id="R_xxxxx"
  data-category="Blog Comments"
  data-category-id="DIC_xxxxx"
  data-mapping="pathname"
  data-strict="0"
  data-reactions-enabled="1"
  data-emit-metadata="0"
  data-input-position="top"
  data-theme="dark"
  data-lang="es"
  data-loading="lazy"
  crossorigin="anonymous"
  async>
</script>
```

**¡Listo!** Ahora cada artículo tiene su propia sección de comentarios vinculada a GitHub Discussions.

---

## 📊 Propiedades de articles.json

```json
{
  "id": "identificador-unico",           // Slug interno
  "title": "Título completo",            // Máx 100 caracteres
  "slug": "url-amigable",               // Sin espacios, solo guiones
  "excerpt": "Descripción...",          // 150-200 caracteres
  "content": "/blog/articulos/xxx.html", // Ruta al archivo HTML
  "image": "/src/images/blog/xxx.webp", // Imagen 1200x630px
  "category": "gaming",                  // Ver tabla arriba
  "categoryDisplay": "Gaming",           // Nombre visible
  "tags": ["tag1", "tag2"],             // Array de tags
  "author": "Sala Geek",                // Autor
  "publishDate": "2026-01-15T10:00:00Z", // ISO 8601
  "modifiedDate": "2026-01-15T10:00:00Z", // ISO 8601
  "readTime": "8 min",                   // Tiempo estimado
  "views": 0,                            // Contador visual
  "featured": false,                     // true = aparece en carousel
  "trending": true                       // true = aparece en trending
}
```

---

## 🖼️ Optimizar Imágenes

1. **Tamaño recomendado**: 1200x630px (Open Graph)
2. **Formato**: WebP (mejor compresión)
3. **Herramientas**:
   - https://squoosh.app/
   - https://tinypng.com/

---

## 🔍 SEO Tips

### **Title**
- 50-60 caracteres
- Keyword al inicio
- Ejemplo: "GTA 6: Fecha de Lanzamiento y Gameplay | Sala Geek"

### **Meta Description**
- 150-160 caracteres
- Include CTA
- Ejemplo: "🎮 Rockstar confirma GTA 6 para 2026. Nuevo gameplay de Vice City, fecha oficial y todo lo que sabemos. ¡Míralo ahora!"

### **Estructura H1-H6**
```
H1: Título principal (solo uno)
  H2: Sección principal
    H3: Subsección
    H3: Subsección
  H2: Otra sección
    H3: Subsección
```

### **Internal Links**
- Mínimo 3-5 links a otros artículos
- Usa texto anchor descriptivo
- Ejemplo: `<a href="/blog/articulos/gta-5-vs-gta-6.html">comparativa entre GTA 5 y GTA 6</a>`

---

## 🎯 Marcar como Featured

Para que un artículo aparezca en el carousel destacado del blog:

```json
{
  "featured": true
}
```

Solo los primeros 3 artículos con `featured: true` aparecen en el carousel.

---

## 🔥 Marcar como Trending

Para que aparezca en la sección "Trending":

```json
{
  "trending": true
}
```

---

## 🧪 Testing Local

1. **Inicia servidor local**:
   ```bash
   npx serve
   ```

2. **Abre**:
   ```
   http://localhost:3000/blog/
   ```

3. **Verifica**:
   - ✅ Artículo aparece en grid
   - ✅ Filtros funcionan
   - ✅ Links funcionan
   - ✅ Imágenes cargan
   - ✅ Artículos relacionados aparecen

---

## 📱 Responsive

El sistema es 100% responsive:
- **Mobile**: Grid 1 columna
- **Tablet**: Grid 2 columnas
- **Desktop**: Grid 3 columnas

---

## 🎨 Personalizar Estilos

Los estilos están en:
```
src/css/blog.css
src/css/blog.min.css  (versión comprimida)
```

---

## 💡 Tips Rápidos

1. **Usa imágenes WebP** - Carga 30% más rápido
2. **Escribe mínimo 1500 palabras** - Mejor SEO
3. **Incluye blockquotes** - Rompe la monotonía
4. **Agrega listas** - Fácil de escanear
5. **Links externos** - 2-3 fuentes confiables
6. **Tags relevantes** - 3-5 máximo

---

## 🚨 Errores Comunes

### **Artículo no aparece en blog**
- ✅ Verifica que esté en `articles.json`
- ✅ Revisa que el JSON sea válido (usa JSONLint.com)
- ✅ Asegúrate que `publishDate` sea correcta

### **Imagen no carga**
- ✅ Verifica ruta en `"image": "/src/images/blog/xxx.webp"`
- ✅ Asegúrate que el archivo exista
- ✅ Revisa mayúsculas/minúsculas

### **Comentarios no aparecen**
- ✅ Verifica configuración de Giscus
- ✅ Asegúrate que Discussions esté habilitado
- ✅ Revisa que `data-repo` sea correcto

---

## 📞 Soporte

Si algo no funciona:
1. Revisa la consola del navegador (F12)
2. Verifica que `blog-engine.js` esté cargando
3. Asegúrate que `articles.json` sea válido

---

**¡Listo para crear contenido épico! 🚀**
