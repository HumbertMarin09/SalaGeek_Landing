# 🔐 Configuración de Variables de Entorno en Netlify

## ⚠️ IMPORTANTE: Configurar antes de que funcione el formulario

Para que el formulario de newsletter funcione con Mailchimp, necesitas configurar las variables de entorno en Netlify.

---

## 📋 **Pasos para Configurar en Netlify:**

### 1. **Accede al Dashboard de Netlify**
   - Ve a: https://app.netlify.com/
   - Login con tu cuenta
   - Selecciona el sitio **SalaGeek_Landing** (o como se llame tu proyecto)

### 2. **Ve a Site Settings**
   - Clic en **Site configuration** en el menú izquierdo
   - Luego clic en **Environment variables**

### 3. **Agregar Variables de Entorno**

Haz clic en **Add a variable** y agrega las siguientes 3 variables:

#### Variable 1: MAILCHIMP_API_KEY
```
Key: MAILCHIMP_API_KEY
Value: [TU_API_KEY_DE_MAILCHIMP]
Scopes: All (Production, Deploy Previews, Branch deploys)
```
**Nota:** Usa la API key que te di anteriormente (empieza con `05ba...` y termina en `-us5`)

#### Variable 2: MAILCHIMP_AUDIENCE_ID
```
Key: MAILCHIMP_AUDIENCE_ID
Value: [TU_AUDIENCE_ID]
Scopes: All (Production, Deploy Previews, Branch deploys)
```
**Nota:** Usa el Audience ID que te di anteriormente (empieza con `b22...`)

#### Variable 3: MAILCHIMP_DC
```
Key: MAILCHIMP_DC
Value: us5
Scopes: All (Production, Deploy Previews, Branch deploys)
```

### 4. **Guardar y Redesplegar**
   - Clic en **Save** después de agregar cada variable
   - Ve a **Deploys** en el menú principal
   - Clic en **Trigger deploy** → **Deploy site**

---

## ✅ **Verificar que Funciona:**

1. Espera a que se complete el deploy (1-2 minutos)
2. Ve a tu sitio: https://salageek.com
3. Scroll hasta el formulario de newsletter
4. Suscríbete con un email de prueba
5. Deberías ver el mensaje de éxito
6. Revisa tu bandeja de entrada (y spam) para el email de bienvenida

---

## 🔍 **Troubleshooting:**

### Problema: "Error del servidor" al suscribirse
- Verifica que las 3 variables estén configuradas correctamente en Netlify
- Asegúrate de haber hecho un nuevo deploy después de agregar las variables
- Revisa los logs de funciones en Netlify: **Functions** → **mailchimp-subscribe** → **Logs**

### Problema: No llega el email de bienvenida
- Verifica en Mailchimp que la automatización esté activa
- Ve a **Automations** → **Bienvenida Sala Geek** → Debe estar **ON**
- Revisa la carpeta de spam
- Verifica que el dominio esté verificado en Mailchimp

### Problema: GitHub rechaza el push por "secrets"
- Esto es correcto, las API keys NO deben estar en el código
- Las variables de entorno en Netlify son la forma correcta y segura

---

## 📊 **Monitoreo:**

### Ver suscriptores en Mailchimp:
- Ve a **Audience** → **All contacts**
- Deberías ver los nuevos suscriptores aparecer en tiempo real

### Ver logs de la función:
- Netlify Dashboard → **Functions** → **mailchimp-subscribe**
- Clic en cualquier invocación para ver detalles

---

## 🎉 **¡Listo!**

Una vez configuradas las variables, tu formulario estará 100% funcional y los suscriptores recibirán el email de bienvenida automáticamente.
