# 🚀 Guía Paso a Paso: Configurar Automation en Mailchimp

## 📧 Objetivo
Configurar secuencia de 3 emails automáticos que se envían cuando alguien se suscribe a tu newsletter.

---

## ✅ Pre-requisitos

Antes de empezar, asegúrate de tener:
- [ ] Cuenta de Mailchimp activa
- [ ] Lista de audiencia creada (donde se suscribe la gente)
- [ ] Los 3 archivos HTML listos:
  - `welcome-email.html`
  - `follow-up-day3.html`
  - `feedback-email.html`

---

## 📋 PASO 1: Crear la Automation

### 1.1 Ir a Automations
1. En Mailchimp, haz clic en **"Automations"** en el menú izquierdo
2. Haz clic en **"Create"** (botón azul arriba a la derecha)

### 1.2 Seleccionar tipo de automation
1. Busca y selecciona **"Welcome new subscribers"**
   - Dice: "Say hello to people when they join your audience"
2. Haz clic en **"Select"**

### 1.3 Configurar automation básica
1. **Automation name:** "Onboarding Geeky Weekly"
2. **Audience:** Selecciona tu lista de suscriptores
3. Haz clic en **"Begin"**

---

## 📧 PASO 2: Configurar Email 1 (Welcome - Día 0)

### 2.1 Configurar Trigger
1. En "Workflow settings", verifica que el trigger sea:
   - **When:** Signup form (cuando alguien se suscribe)
   - **Trigger immediately:** SÍ
2. Haz clic en **"Save"**

### 2.2 Diseñar el Email 1
1. Haz clic en **"Design Email"**
2. **Email Subject:**
   ```
   ¡Bienvenido a Sala Geek! 🎮🎬
   ```
3. **Preview text:**
   ```
   🎉 ¡Bienvenido a la comunidad geek más activa!
   ```
4. **From name:** Sala Geek
5. **From email address:** Tu email verificado (ej: contacto@salageek.com)
6. Haz clic en **"Continue"**

### 2.3 Importar HTML del Welcome Email
1. En el editor, selecciona **"Code your own"** (opción HTML)
2. Abre el archivo `welcome-email.html` en tu computadora
3. **Copia TODO el código** (Ctrl+A, Ctrl+C)
4. **Pega el código** en el editor de Mailchimp
5. Haz clic en **"Save and Continue"**

### 2.4 Enviar Email de Prueba
1. Haz clic en **"Send a test email"**
2. Ingresa tu email personal
3. Revisa que:
   - [ ] Logo carga correctamente
   - [ ] Colores se ven bien
   - [ ] Links funcionan
   - [ ] Botones son clickeables
   - [ ] Se ve bien en móvil

### 2.5 Guardar Email 1
1. Haz clic en **"Save and Close"**

---

## 📧 PASO 3: Agregar Email 2 (Follow-Up - Día 3)

### 3.1 Agregar nuevo email a la automation
1. En tu automation, haz clic en **"Add an email"**
2. Selecciona **"Add an email"** (no journey point)

### 3.2 Configurar Delay (Espera de 3 días)
1. Haz clic en el botón **"+"** después del Email 1
2. Selecciona **"Delay"**
3. Configurar:
   - **Wait:** 3 days
   - **Time of day:** Any time (o elige horario específico)
4. Haz clic en **"Save"**

### 3.3 Diseñar Email 2
1. Haz clic en **"Design Email"**
2. **Email Subject (elige uno):**
   ```
   🎁 Psst... hay un Easter Egg esperándote
   ```
   O
   ```
   3 días para tu primer Geeky Weekly (+ sorpresa)
   ```
   O
   ```
   ¿Ya exploraste Sala Geek? Te dejamos una pista 👀
   ```
3. **Preview text:**
   ```
   🎁 Descubre los Easter Eggs escondidos en Sala Geek
   ```
4. **From name:** Sala Geek
5. **From email address:** Mismo email que Email 1
6. Haz clic en **"Continue"**

### 3.4 Importar HTML del Follow-Up Day 3
1. Selecciona **"Code your own"**
2. Abre el archivo `follow-up-day3.html`
3. **Copia TODO el código**
4. **Pega** en Mailchimp
5. ✅ **No requiere actualizaciones:** Este email es evergreen (funciona siempre)
   - Incluye 3 Easter Eggs permanentes del sitio
   - Se envía automáticamente a cada nuevo suscriptor

### 3.5 Enviar Email de Prueba
1. **Send test email** a tu correo
2. Revisar todo funciona
3. **Save and Close**

---

## 📧 PASO 4: Agregar Email 3 (Feedback - Día 7)

### 4.1 Agregar tercer email
1. Haz clic en **"Add an email"** de nuevo

### 4.2 Configurar Delay (Espera de 4 días más)
1. Agrega otro **"Delay"**
2. Configurar:
   - **Wait:** 4 days (total = 7 días desde suscripción)
   - **Time of day:** Any time (cualquier horario funciona)
3. **Save**

### 4.3 Diseñar Email 3
1. **Design Email**
2. **Email Subject (elige uno):**
   ```
   📧 ¿Cómo va tu experiencia en Sala Geek?
   ```
   O
   ```
   ⭐ Tu opinión nos importa - 30 segundos de feedback
   ```
   O
   ```
   🎮 Una semana juntos - ¿Qué te parece Geeky Weekly?
   ```
3. **Preview text:**
   ```
   💬 Cuéntanos qué te parece el contenido y cómo podemos mejorar
   ```
4. **From name:** Sala Geek
5. **From email:** Mismo
6. **Continue**

### 4.4 Importar HTML del Feedback Email
1. **Code your own**
2. Abrir `feedback-email.html`
3. **Copiar TODO**
4. **Pegar** en Mailchimp
5. ✅ **No requiere actualizaciones:** Email evergreen de feedback
   - 4 preguntas genéricas
   - CTA con mailto: pre-rellenado
   - Funciona sin importar cuándo se suscriban

### 4.5 Enviar Email de Prueba
1. **Send test email** a tu correo
2. Probar el botón "Enviar Mi Feedback"
3. **Save and Close**

---

## 🎯 PASO 5: Revisar y Activar Automation

### 5.1 Revisar Timeline Completa
Tu automation debe verse así:

```
┌─────────────────────────────────────────┐
│  TRIGGER: Signup form                   │
│  ⬇ Immediately                          │
│  📧 Email 1: Bienvenida                 │
│  ⬇ Wait 3 days                          │
│  📧 Email 2: Easter Egg Challenge       │
│  ⬇ Wait 4 days                          │
│  📧 Email 3: Feedback Request           │
└─────────────────────────────────────────┘
```

### 5.2 Checklist Final
- [ ] Los 3 emails están configurados
- [ ] Delays correctos (3 días, 4 días)
- [ ] Subject lines atractivos
- [ ] Test emails enviados y revisados
- [ ] Links funcionan en los 3 emails
- [ ] Imágenes cargan correctamente
- [ ] Merge tags funcionan (*|FNAME|*, etc)
- [ ] Botón mailto: del Email 3 funciona correctamente

### 5.3 Activar Automation
1. Haz clic en **"Start workflow"** (botón verde)
2. Confirma que quieres activarla
3. **¡LISTO!** 🎉

---

## 📊 PASO 6: Monitorear Resultados

### 6.1 Ver estadísticas
1. Ve a **Automations** → "Onboarding Geeky Weekly"
2. Haz clic en cada email para ver:
   - **Open rate** (% que abrió el email)
   - **Click rate** (% que hizo clic en links)
   - **Unsubscribe rate** (% que se dio de baja)

### 6.2 Métricas objetivo (semana 1-4)

| Email | Open Rate | Click Rate | Unsub |
|-------|-----------|------------|-------|
| Email 1 | 60-70% | 15-20% | < 0.2% |
| Email 2 | 35-45% | 10-15% | < 0.3% |
| Email 3 | 40-50% | 5-10% | < 0.3% |

### 6.3 Optimización continua
**Después de 2 semanas (mínimo 50 suscriptores):**
- Si open rate < 30% → Cambiar subject line
- Si click rate < 5% → Mejorar CTAs
- Si unsub > 0.5% → Revisar frecuencia/contenido

---

## 🔧 TROUBLESHOOTING

### Problema: "No puedo importar HTML"
**Solución:**
- Asegúrate de seleccionar "Code your own" template
- Si no aparece, ve a Settings → Templates → Enable custom code

### Problema: "Merge tags no funcionan"
**Solución:**
- Verifica que estés usando la sintaxis correcta: `*|FNAME|*`
- Asegúrate que tu audiencia tiene ese campo personalizado

### Problema: "Imágenes no cargan"
**Solución:**
- Verifica URLs de imágenes (deben ser HTTPS)
- Logo debe estar en servidor público
- Prueba abriendo la URL en navegador

### Problema: "Email cae en spam"
**Solución:**
- Verifica SPF y DKIM en Mailchimp Settings
- Evita palabras spam ("gratis", "urgente")
- Mantén ratio 60% texto / 40% imágenes
- No uses solo imágenes

### Problema: "Quiero pausar la automation"
**Solución:**
1. Ve a Automations → Tu automation
2. Haz clic en **"Pause"**
3. Los suscriptores actuales en proceso continuarán
4. Nuevos suscriptores NO entrarán hasta reactivar

---

## 📝 Notas Adicionales

### Editar un email después de activar
1. **Pausa** la automation
2. Haz cambios en el email
3. **Reactiva** la automation
4. ⚠️ Los cambios NO afectan emails ya enviados

### A/B Testing (Plan Premium)
Si tienes plan premium:
1. Crea 2 versiones del subject line
2. Mailchimp envía ambas a grupos pequeños
3. Gana el que tiene mejor open rate
4. Resto recibe la versión ganadora

### Segmentación avanzada
Puedes crear condiciones:
- Solo si abrió Email 1 → enviar Email 2
- Si NO abrió Email 1 → enviar recordatorio
- Si hizo clic en X link → enviar contenido relacionado

---

## 🎉 ¡Éxito!

Tu automation está configurada. Ahora cada nuevo suscriptor recibirá:
1. **Día 0:** Bienvenida + expectativa
2. **Día 3:** Easter Eggs permanentes (evergreen)
3. **Día 7:** Feedback request (aumenta engagement)
4. **Cada Viernes 10 AM:** Geeky Weekly (envío manual)

**Ventajas del sistema:**
- ✅ **100% evergreen:** Los 3 emails funcionan sin actualizaciones semanales
- ✅ **Email 2:** 3 Easter Eggs permanentes del sitio (doble click logo, long-press input, Konami Code)
- ✅ **Email 3:** Recopila feedback valioso y aumenta conexión con suscriptores
- ✅ **Sin timing issues:** Funciona sin importar qué día se suscriban

---

## 📞 ¿Necesitas Ayuda?

Si algo no funciona:
1. Revisa esta guía paso a paso
2. Verifica el Troubleshooting
3. Pídemelo y te ayudo 😊

**Última actualización:** Noviembre 2025  
**Versión:** 1.0

---

¡Buena suerte con tu estrategia de email marketing! 🚀
