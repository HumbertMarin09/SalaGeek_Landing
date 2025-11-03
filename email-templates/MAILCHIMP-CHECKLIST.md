# ✅ Checklist Mailchimp Setup - Sala Geek

## FASE 1: Cuenta Mailchimp ✅
- [ ] Registrado en mailchimp.com/es
- [ ] Email verificado
- [ ] Perfil completado (Business: Sala Geek, Website: salageek.com)

## FASE 2: Crear Audience
- [ ] Dashboard → **Audience** → **Create Audience**
- [ ] Configuración:
  - **Audience name:** `Suscriptores Sala Geek`
  - **Default From email:** `contacto@salageek.com`
  - **Default From name:** `Sala Geek`
  - **Remind people how they signed up:** `Te suscribiste en salageek.com para recibir noticias geek`
- [ ] Guardar

## FASE 3: Verificar Dominio (CRÍTICO para deliverability)
- [ ] **Audience** → **Settings** → **Audience name and defaults**
- [ ] Scroll down → **Domain authentication**
- [ ] Clic en **"Authenticate a domain"**
- [ ] Ingresar: `salageek.com`
- [ ] Mailchimp te dará 3 registros DNS:
  ```
  Tipo: CNAME
  Host: k1._domainkey
  Value: dkim.mailchimp.com
  
  Tipo: CNAME
  Host: k2._domainkey
  Value: dkim2.mailchimp.com
  
  Tipo: TXT
  Host: @
  Value: v=spf1 include:servers.mailchimp.net ?all
  ```

### Agregar en Namecheap:
1. Ve a https://ap.www.namecheap.com/Domains/DomainControlPanel/salageek.com/advancedns
2. Clic en **"Add New Record"** (3 veces, uno por cada registro)
3. Copia EXACTAMENTE los valores que te dio Mailchimp
4. TTL: Automatic
5. Guarda todo
6. **Espera 15-30 minutos** para propagación
7. Vuelve a Mailchimp → **"Verify"**

- [ ] Registros DNS agregados en Namecheap
- [ ] Esperado 15-30 mins
- [ ] Dominio verificado en Mailchimp (luz verde ✅)

## FASE 4: Crear Welcome Automation
- [ ] Dashboard → **Automations**
- [ ] **Create** → **Email** → **"Welcome new subscribers"**
- [ ] Name: `Bienvenida Sala Geek`
- [ ] **Begin**

### Configurar Trigger:
- [ ] **Trigger:** When someone subscribes
- [ ] **Audience:** Suscriptores Sala Geek
- [ ] **Delay:** None (enviar inmediatamente)
- [ ] **Save**

### Diseñar Email:
- [ ] Clic en **"Design Email"**
- [ ] **Email subject:** `¡Bienvenido a Sala Geek! 🎮🎬`
- [ ] **Preview text:** `Gracias por unirte a la comunidad geek más activa`
- [ ] **From name:** Sala Geek
- [ ] **From email:** contacto@salageek.com

### Importar HTML:
- [ ] Selecciona **"Code your own"**
- [ ] Clic en **"Paste in code"**
- [ ] Abre: `email-templates/welcome-email.html`
- [ ] Copia TODO el contenido
- [ ] Pégalo en Mailchimp
- [ ] **Preview** → Revisa en móvil y desktop
- [ ] **Save and Continue**

### Activar:
- [ ] Review final
- [ ] **Start Sending** (toggle a ON)
- [ ] Automation activa ✅

## FASE 5: Zapier Integration (conecta Formspree con Mailchimp)
- [ ] Ir a https://zapier.com/sign-up
- [ ] Crear cuenta gratuita
- [ ] **Create Zap**

### Configurar Trigger (Formspree):
- [ ] **App:** Formspree
- [ ] **Event:** New Submission
- [ ] **Connect Account** → Login en Formspree
- [ ] **Form:** Selecciona tu form (contacto@salageek.com)
- [ ] **Test trigger** → Debe mostrar últimas suscripciones
- [ ] **Continue**

### Configurar Action (Mailchimp):
- [ ] **App:** Mailchimp
- [ ] **Event:** Add/Update Subscriber
- [ ] **Connect Account** → Login en Mailchimp
- [ ] **Audience:** Suscriptores Sala Geek
- [ ] **Email Address:** Map field `email` de Formspree
- [ ] **Status:** Subscribed
- [ ] **Test action** → Debe crear suscriptor de prueba
- [ ] **Continue**

### Activar Zap:
- [ ] **Name:** `Formspree → Mailchimp - Sala Geek`
- [ ] **Turn on Zap**
- [ ] Zap activo ✅

## FASE 6: Testing Completo
- [ ] Ir a https://salageek.com
- [ ] Scroll hasta el formulario de newsletter
- [ ] Suscribirse con email de prueba
- [ ] Verificar en Mailchimp que llegó el contacto (Audience → View contacts)
- [ ] Revisar bandeja del email de prueba
- [ ] Confirmar que llegó el welcome email
- [ ] Verificar:
  - [ ] Subject correcto
  - [ ] Logo carga
  - [ ] Links funcionan
  - [ ] Botón CTA funciona
  - [ ] Redes sociales funcionan
  - [ ] Se ve bien en móvil
  - [ ] Se ve bien en desktop

## FASE 7: Monitoreo (primeros días)
- [ ] Dashboard Mailchimp → **Reports**
- [ ] Revisar:
  - [ ] Open Rate (objetivo: >25%)
  - [ ] Click Rate (objetivo: >3%)
  - [ ] Bounces (debe ser <2%)
  - [ ] Unsubscribes (debe ser <1%)

---

## 🆘 Troubleshooting

### No llega el email de verificación de Mailchimp:
- Revisa spam
- Usa otro navegador/modo incógnito
- Prueba con otro email

### No puedo verificar dominio:
- Espera 30-60 mins (propagación DNS)
- Verifica que copiaste EXACTAMENTE los valores
- Usa herramienta: https://mxtoolbox.com/SuperTool.aspx

### Zapier no encuentra mi form de Formspree:
- Asegúrate de haber hecho login correcto
- Verifica que tu form tenga al menos 1 submission
- Refresca la búsqueda

### El welcome email va a spam:
- NECESITAS verificar dominio (Fase 3)
- Espera 24-48h después de verificar
- Pide a usuarios que agreguen a contactos

---

## 📊 Métricas Esperadas

### Primera semana:
- Open Rate: 40-60% (emails de bienvenida tienen mejor tasa)
- Click Rate: 5-10%
- Unsubscribe: <0.5%

### Después:
- Open Rate: 25-35% (newsletter regular)
- Click Rate: 3-5%
- Unsubscribe: <1%

---

## 🎯 Próximos Pasos (después de setup)

1. **Crear segunda automatización:** Follow-up después de 3 días
2. **Diseñar primera newsletter:** Enviar a todos los suscriptores
3. **Segmentar audiencia:** Por intereses (cine, gaming, anime)
4. **A/B Testing:** Probar diferentes subject lines

---

**¿Necesitas ayuda en algún paso?** Responde con el número de fase donde estás atascado.
