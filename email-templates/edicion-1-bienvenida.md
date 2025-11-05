# 📧 Geeky Weekly - Edición #1

**Fecha de envío sugerida**: Viernes 8 de Noviembre 2025, 18:00
**Asunto del email**: 🎮 ¡Bienvenido a Sala Geek! La Momia regresa + Metroid Prime 4

---

## Variables de Mailchimp para la plantilla

### Header

- `*|ISSUE_NUMBER|*` = 1
- `*|DATE:F j "de" F "de" Y|*` = Auto (Mailchimp)

### Intro

```text
*|INTRO_TEXT|* = 
¡Gracias por unirte a la comunidad geek de habla hispana más apasionada! 🎉 Cada semana te traeremos lo mejor de películas, series, anime, videojuegos y tecnología. Todo en un solo lugar, sin distracciones, directo a tu bandeja de entrada. ¡Prepárate para estar siempre un paso adelante en la cultura geek!
```

---

## 🔥 Lo Más Hot de la Semana

### 🎬 PELÍCULAS & SERIES

**Noticia 1:**

```text
*|MOVIE_NEWS_1_TITLE|* = Brendan Fraser y Rachel Weisz REGRESAN para nueva película de La Momia
*|MOVIE_NEWS_1_CONTENT|* = 
¡CONFIRMADO HOY! Los protagonistas originales están de vuelta. Brendan Fraser y Rachel Weisz retomarán sus icónicos papeles en una nueva entrega de La Momia, dirigida por los creadores de Scream 6. Universal apuesta fuerte por traer de vuelta la magia de las películas originales. Los fans están celebrando en redes sociales.
```

**Noticia 2:**

```text
*|MOVIE_NEWS_2_TITLE|* = Stranger Things 5 revela su tráiler MÁS INTENSO rumbo al gran final
*|MOVIE_NEWS_2_CONTENT|* = 
Netflix lanzó ESTA SEMANA el tráiler más dramático de la quinta y última temporada. El Upside Down más peligroso que nunca. Los fans están analizando cada frame buscando pistas sobre el destino de Eleven y el grupo. La temporada final llega el próximo mes. Prepárate para el cierre épico de una era.
```

---

### 🎮 GAMING

**Noticia 1:**

```text
*|GAMING_NEWS_1_TITLE|* = Metroid Prime 4: Beyond - Tráiler final confirma lanzamiento DUAL en Switch y Switch 2
*|GAMING_NEWS_1_CONTENT|* = 
¡BOMBAZO! Nintendo confirmó HOY que Metroid Prime 4: Beyond llegará el 4 de diciembre tanto a Switch como a Switch 2. El nuevo tráiler muestra a Samus en acción con gráficos increíbles en Unreal Engine 5. Después de años de espera, Samus Aran regresa en grande. Los fans están eufóricos.
```

**Noticia 2:**

```text
*|GAMING_NEWS_2_TITLE|* = Nintendo Switch 2: El lanzamiento de consola MÁS EXITOSO de la historia
*|GAMING_NEWS_2_CONTENT|* = 
Los analistas confirman HOY que Switch 2 rompió TODOS los récords con más de 10 millones de unidades vendidas en su ventana de lanzamiento. Retrocompatibilidad, nuevo hardware potente y títulos como Hyrule Warriors crearon la tormenta perfecta. Es oficialmente la consola más exitosa jamás lanzada.
```

---

### 🌸 ANIME & MANGA

**Noticia 1:**

```text
*|ANIME_NEWS_1_TITLE|* = Studio Ghibli y grandes editoras DEMANDAN a OpenAI por IA generativa
*|ANIME_NEWS_1_CONTENT|* = 
¡NOTICIA DE ÚLTIMO MOMENTO! Studio Ghibli, Shueisha (Dragon Ball, One Piece), Square Enix y Bandai Namco se unieron HOY para exigir a OpenAI que detenga el uso no autorizado de su contenido para entrenar IA. La coalición japonesa (CODA) denuncia infracción masiva de copyright. Esta batalla legal cambiará el futuro de la IA y el anime.
```

**Noticia 2:**

```text
*|ANIME_NEWS_2_TITLE|* = Kodansha Studios: Tus mangas favoritos llegarán a Hollywood
*|ANIME_NEWS_2_CONTENT|* = 
La editorial de Attack on Titan y Vinland Saga anunció HOY su nuevo estudio de live-action. Con Chloé Zhao (Eternals) involucrada, finalmente veremos adaptaciones de alto presupuesto. Después del éxito de One Piece en Netflix, Hollywood se toma en serio las adaptaciones de manga. La era dorada del anime live-action comienza.
```

---

## ⭐ DESTACADO DE LA SEMANA

```text
*|FEATURED_TITLE|* = Bienvenido a Sala Geek: Lo que puedes esperar cada semana

*|FEATURED_PARAGRAPH_1|* = 
Cada viernes (o domingo, según prefieras votarlo) recibirás un resumen curado de las noticias más importantes del mundo geek. Nada de spam, nada de clickbait. Solo contenido que realmente importa, con nuestra opinión honesta incluida.

*|FEATURED_PARAGRAPH_2|* = 
Aquí encontrarás: 🎬 Estrenos y reseñas de películas/series | 🎮 Noticias de videojuegos y ofertas | 🌸 Lo mejor del anime y manga | 💻 Tecnología y gadgets geek | 🎨 Eventos, cosplay y cultura pop.

*|FEATURED_PARAGRAPH_3|* = 
Pero lo más importante: esta es TU comunidad. Queremos saber qué opinas, qué te gustaría ver, y qué temas te apasionan. Al final de cada newsletter encontrarás una pregunta o encuesta. ¡Tu voz cuenta!
```

---

## 💬 PREGUNTA DE LA SEMANA

```text
*|QUESTION_OF_WEEK|* = 
### 💬 Pregunta de la Semana

**¿Qué te emociona más: Brendan Fraser en La Momia o Metroid Prime 4 en Switch 2?** 

Responde en nuestras redes sociales. ¿Team nostalgia cinematográfica o team nueva era de Nintendo? ¡Queremos saber tu opinión!
```

---

## 📅 PRÓXIMA SEMANA

```text
*|UPCOMING_1|* = Todo sobre el regreso de La Momia: Brendan Fraser está de vuelta
*|UPCOMING_2|* = Guía completa de Metroid Prime 4: Lo que necesitas saber antes del lanzamiento
*|UPCOMING_3|* = La batalla legal Ghibli vs OpenAI: ¿Qué significa para el futuro del anime?
```

---

## 📝 NOTAS DE IMPLEMENTACIÓN EN MAILCHIMP

### Paso 1: Crear la campaña

1. En Mailchimp, ve a **Campaigns** → **Create Campaign** → **Email**
2. Selecciona **Regular Campaign**
3. Nombre: "Newsletter #1 - Bienvenida"

### Paso 2: Configurar destinatarios

1. Selecciona tu lista principal
2. Segmento: **Todos los suscriptores** (para esta primera edición)

### Paso 3: Configurar el email

**From name**: Sala Geek  
**From email**: Tu email verificado en Mailchimp

**Subject line**:

```text
🎮 ¡Bienvenido a Sala Geek! Tu dosis semanal de cultura geek comienza aquí
```

**Preview text**:

```text
Gracias por unirte. Cada semana lo mejor de películas, series, anime, gaming y tech en tu inbox.
```

### Paso 4: Diseño del email

1. Selecciona **Code your own** o **Import HTML**
2. Copia y pega el contenido de `newsletter-template.html`
3. Reemplaza todas las variables `*|VARIABLE|*` con el contenido de arriba

### Paso 5: Prueba antes de enviar

1. Envía un **Test Email** a tu email personal
2. Verifica en:
   - Desktop (Gmail, Outlook)
   - Mobile (iOS Mail, Gmail app)
   - Dark mode
3. Revisa todos los links funcionan
4. Confirma imágenes cargan correctamente

### Paso 6: Programar envío

- **Fecha**: Viernes 8 de noviembre, 2025
- **Hora**: 18:00 hora local (ajusta según tu audiencia principal)
- Alternativamente: Domingo 10 de noviembre, 2025 a las 10:00


---

## 🎨 VARIANTES DE ASUNTO (A/B Testing)

Si quieres probar qué funciona mejor, prueba estos 2 asuntos:

**Opción A (con emoji + curiosidad):**

```text
🎮 ¡Bienvenido a Sala Geek! Tu dosis semanal de cultura geek comienza aquí
```

**Opción B (sin emoji + beneficio directo):**

```text
Bienvenido a Sala Geek: Películas, gaming, anime y tech cada semana
```

Mailchimp te permitirá testear ambos con 50% de tu lista y enviar el ganador al resto.


---

## 📊 MÉTRICAS OBJETIVO PARA EDICIÓN #1

### Open Rate

- **Mínimo aceptable**: 20%
- **Objetivo**: 30%+
- **Excelente**: 40%+

### Click Rate

- **Mínimo aceptable**: 2%
- **Objetivo**: 5%+
- **Excelente**: 8%+

### Unsubscribe Rate

- **Máximo aceptable**: 1%
- **Objetivo**: <0.5%

**Nota**: La primera edición suele tener open rates más altos porque los suscriptores acaban de registrarse y están interesados.


---

## ✅ CHECKLIST FINAL ANTES DE ENVIAR

- [ ] Plantilla HTML subida a Mailchimp
- [ ] Todas las variables `*|VARIABLE|*` reemplazadas con contenido
- [ ] Logo de Sala Geek carga correctamente
- [ ] Todos los enlaces funcionan (Facebook, Instagram, TikTok, web)
- [ ] Link de unsuscribe presente y funcional
- [ ] Test email enviado y revisado en desktop + mobile
- [ ] Asunto y preview text optimizados
- [ ] Horario de envío programado (Viernes 18h o Domingo 10h)
- [ ] Segmento de audiencia seleccionado (todos los suscriptores)
- [ ] Revisión ortográfica completa

---

## 🚀 PROMOCIÓN POST-ENVÍO

Después de enviar el newsletter, promociona en redes

### Facebook Post

```text
🎮 ¡Acabamos de enviar nuestro primer Geeky Weekly!

Si te suscribiste, revisa tu inbox. Si no lo hiciste, ¿qué esperas?

📧 Cada semana: Películas, series, anime, gaming y tech
🔥 Sin spam, solo lo mejor de la cultura geek
✨ 100% gratis

Suscríbete en: salageek.com

#SalaGeek #Newsletter #CulturaGeek #Gaming #Anime
```

### Instagram Story

```text
[Imagen del newsletter en mobile]

"Primera edición de Geeky Weekly ya enviada 📧

Swipe up para suscribirte ⬆️"

[Link a salageek.com]
```

### TikTok

```text
Video corto (15-30s) mostrando:
- Abriendo el email
- Scrolling rápido del contenido
- "Todo lo que necesitas saber en 5 minutos"
- CTA: "Link en bio para suscribirte"
```

---

## 💡 TIPS PRO

1. **Responde a TODOS los que respondan tu newsletter**
   - Genera lealtad
   - Obtén feedback valioso
   - Humaniza la marca

2. **Monitorea las primeras 24 horas**
   - 50% de los opens ocurren en las primeras 24h
   - Ajusta horario si es necesario

3. **Pide feedback explícitamente**
   - "¿Qué te pareció? Responde este email"
   - Usa las respuestas para mejorar #2

4. **Celebra el milestone**
   - Comparte en redes que enviaste tu primer newsletter
   - Genera FOMO en quienes no están suscritos

---

**Fecha de creación**: 4 de noviembre, 2025  
**Listo para enviar**: Viernes 8 de noviembre, 2025  
**Target**: Primera audiencia (suscriptores iniciales)

