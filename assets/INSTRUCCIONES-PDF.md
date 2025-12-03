# Instrucciones para Generar el PDF del Media Kit

## Opción 1: Usando el Navegador (Recomendado)

### Google Chrome / Microsoft Edge

1. **Abre el archivo HTML**:
   - Navega a: `c:\Users\humbe\OneDrive\Documentos\Diseño Web\Paginas Diseñadas\SG_Landing\assets\mediakit-print.html`
   - Haz clic derecho → "Abrir con" → Google Chrome o Microsoft Edge

2. **Abre el diálogo de impresión**:
   - Presiona `Ctrl + P` (Windows)
   - O ve a Menú (⋮) → Imprimir

3. **Configura las opciones de impresión**:
   ```
   Destino: Guardar como PDF
   Páginas: Todas
   Diseño: Vertical
   Tamaño de papel: A4
   Márgenes: Ninguno (o Predeterminado)
   Opciones:
     ✓ Gráficos de fondo (muy importante)
     ✓ Encabezados y pies de página: DESACTIVADO
   Escala: 100%
   ```

4. **Guarda el PDF**:
   - Haz clic en "Guardar" o "Imprimir"
   - Nombre sugerido: `SalaGeek_MediaKit_2025.pdf`
   - Guarda en: `c:\Users\humbe\OneDrive\Documentos\Diseño Web\Paginas Diseñadas\SG_Landing\assets\`

### Firefox

1. Abre el archivo HTML en Firefox
2. `Ctrl + P`
3. Destino: **Microsoft Print to PDF**
4. Formato de papel: A4
5. Márgenes: Ninguno
6. ✓ Imprimir fondos
7. Guardar como `SalaGeek_MediaKit_2025.pdf`

---

## Opción 2: Usando wkhtmltopdf (Línea de Comandos)

### Instalación

1. Descarga desde: https://wkhtmltopdf.org/downloads.html
2. Instala el ejecutable

### Comando

```powershell
cd "c:\Users\humbe\OneDrive\Documentos\Diseño Web\Paginas Diseñadas\SG_Landing\assets"

wkhtmltopdf --page-size A4 --margin-top 0 --margin-bottom 0 --margin-left 0 --margin-right 0 --enable-local-file-access mediakit-print.html SalaGeek_MediaKit_2025.pdf
```

---

## Opción 3: Herramientas Online (Rápido)

### HTML to PDF Converter

1. Ve a: https://www.sejda.com/html-to-pdf
2. Sube el archivo `mediakit-print.html`
3. Espera la conversión
4. Descarga como `SalaGeek_MediaKit_2025.pdf`

### Alternativas Online

- https://cloudconvert.com/html-to-pdf
- https://www.ilovepdf.com/html-to-pdf

---

## ✅ Verificación del PDF Final

Después de generar el PDF, verifica:

- [ ] 4 páginas totales
- [ ] Portada con logo y título "SALA GEEK"
- [ ] Página 2: Estadísticas y demografía
- [ ] Página 3: Tabla de servicios con precios en **MXN**
- [ ] Página 4: Marcas ideales y contacto
- [ ] Colores correctos (fondo oscuro en portada, verde #06ffa5)
- [ ] Todas las tipografías legibles
- [ ] Sin bordes blancos extraños

---

## 📝 Notas Importantes

1. **Chrome/Edge son los navegadores recomendados** porque respetan mejor los estilos de impresión
2. **IMPORTANTE**: Asegúrate de activar "Gráficos de fondo" para ver los colores y gradientes
3. Si el PDF se ve cortado, prueba con margen "Predeterminado" en lugar de "Ninguno"
4. El archivo HTML está optimizado para tamaño A4 (210mm x 297mm)

---

## 🔄 Actualizar el PDF

Después de generar `SalaGeek_MediaKit_2025.pdf`:

1. Verifica que el archivo esté en: `/assets/SalaGeek_MediaKit_2025.pdf`
2. El botón de descarga en la página web ya apunta a esta ubicación
3. Haz commit del PDF al repositorio:

```powershell
cd "c:\Users\humbe\OneDrive\Documentos\Diseño Web\Paginas Diseñadas\SG_Landing"
git add assets/SalaGeek_MediaKit_2025.pdf
git commit -m "docs(marketing): add Media Kit PDF with MXN pricing"
git push origin main
```

---

## 🎯 Resultado Final

El PDF debe verse profesional, con:
- Portada impactante con fondo oscuro
- Información clara y organizada
- Tablas de precios en pesos mexicanos
- Contacto visible
- 4 páginas optimizadas para impresión o envío digital

¡Listo para enviar a marcas potenciales! 🚀
