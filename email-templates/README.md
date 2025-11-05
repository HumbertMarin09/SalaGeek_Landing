# 📧 Email Templates - Sala Geek

Esta carpeta contiene todos los archivos relacionados con el sistema de newsletters **Geeky Weekly**.

---

## 📁 Estructura de Archivos

### 🎨 Templates

- **`newsletter-template.html`** - Plantilla HTML principal para Mailchimp (responsive, dark mode)
- **`welcome-email.html`** - Email de bienvenida automático (configurado en Mailchimp)

### 📝 Contenido

- **`edicion-1-bienvenida.md`** - Contenido de la primera edición (Nov 8, 2025)
- *Cada semana se creará: `edicion-X-[tema].md`*

### 📚 Documentación

- **`NEWSLETTER-STRATEGY.md`** - Estrategia completa del newsletter
- **`GUIA-IMPLEMENTACION.md`** - Guía paso a paso para Mailchimp 2025
- **`MAILCHIMP-CHECKLIST.md`** - Checklist pre-envío
- **`README-EMAIL-SETUP.md`** - Setup inicial de Mailchimp


---

## 🔄 Workflow Semanal

### Cada Viernes

1. **Buscar noticias**: Pedir "Busca noticias de la semana"
2. **Crear nueva edición**: Copilot creará `edicion-X-[tema].md` con contenido actualizado
3. **Subir a Mailchimp**:
   - Duplicar campaña anterior
   - Reemplazar variables `*|VARIABLE|*` con nuevo contenido
4. **Enviar**: Viernes 18:00 hora local


---

## 🎯 Archivos Clave

### Para editar contenido

👉 **`edicion-X-[tema].md`** - Contenido semanal actualizado

### Para cambiar diseño

👉 **`newsletter-template.html`** - Template HTML

### Para dudas

👉 **`GUIA-IMPLEMENTACION.md`** - Instrucciones paso a paso


---

## 📊 Métricas Objetivo

- **Open Rate**: 25-30%+
- **Click Rate**: 3-5%+
- **Unsubscribe**: <1%


**Última actualización:** Noviembre 4, 2025  
**Newsletter:** Geeky Weekly #1 programado para Nov 8, 2025
