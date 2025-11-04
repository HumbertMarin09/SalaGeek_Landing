# Script para optimizar imágenes de Sala Geek
# Convierte PNG a WebP y reduce tamaño

param(
    [string]$InputImage = "src\images\SalaGeek_LOGO.png",
    [string]$OutputWebP = "src\images\SalaGeek_LOGO.webp"
)

Write-Host "🖼️ Optimizador de imágenes para Sala Geek" -ForegroundColor Cyan
Write-Host ""

# Verificar que existe la imagen
if (-not (Test-Path $InputImage)) {
    Write-Host "❌ Error: No se encontró la imagen: $InputImage" -ForegroundColor Red
    exit 1
}

# Obtener tamaño original
$originalSize = (Get-Item $InputImage).Length / 1MB
Write-Host "📊 Tamaño original: $([math]::Round($originalSize, 2)) MB" -ForegroundColor Yellow

Write-Host ""
Write-Host "Para optimizar la imagen, necesitas instalar cwebp (WebP converter):" -ForegroundColor White
Write-Host ""
Write-Host "Opción 1 (Recomendado) - Usar herramienta online:" -ForegroundColor Green
Write-Host "  1. Ve a: https://squoosh.app/" -ForegroundColor White
Write-Host "  2. Sube: $InputImage" -ForegroundColor White
Write-Host "  3. Selecciona formato: WebP" -ForegroundColor White
Write-Host "  4. Ajusta calidad: 80-85%" -ForegroundColor White
Write-Host "  5. Descarga como: SalaGeek_LOGO.webp" -ForegroundColor White
Write-Host "  6. Guarda en: src\images\" -ForegroundColor White
Write-Host ""
Write-Host "Opción 2 - Instalar herramienta local:" -ForegroundColor Green
Write-Host "  winget install Google.WebP" -ForegroundColor White
Write-Host ""
Write-Host "Después de optimizar, ejecuta este script de nuevo." -ForegroundColor Cyan
