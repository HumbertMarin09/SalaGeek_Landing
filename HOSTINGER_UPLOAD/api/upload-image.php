<?php
/**
 * ═══════════════════════════════════════════════════════════════
 * 📤 UPLOAD IMAGE - Sala Geek Admin API
 * ═══════════════════════════════════════════════════════════════
 * 
 * Sube imágenes al directorio src/images/blog en GitHub.
 * Reemplaza: /.netlify/functions/upload-image
 * 
 * POST /api/upload-image.php
 * Body: { filename, content (base64), folder? }
 * 
 * ═══════════════════════════════════════════════════════════════
 */

require_once __DIR__ . '/config.php';

// Configurar CORS y manejar preflight
setCorsHeaders();
handlePreflight();

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Método no permitido'], 405);
}

// Requiere autenticación
requireAuth();

// Rate limiting (10 subidas por 5 minutos)
if (!checkRateLimit(300, 10, 'upload_image')) {
    jsonResponse(['error' => 'Demasiadas subidas. Intenta en 5 minutos.'], 429);
}

// Verificar configuración de GitHub
if (GITHUB_TOKEN === 'TU_GITHUB_TOKEN_AQUI' || empty(GITHUB_TOKEN)) {
    jsonResponse([
        'error' => 'Error de configuración: GitHub token no configurado'
    ], 500);
}

// Obtener datos
$body = getRequestBody();
$filename = $body['filename'] ?? '';
$content = $body['content'] ?? '';
$folder = $body['folder'] ?? 'src/images/blog';

// Validaciones
if (empty($filename) || empty($content)) {
    jsonResponse(['error' => 'Filename y content son requeridos'], 400);
}

// Validar que el contenido es base64 válido
$cleanContent = preg_replace('/\s/', '', $content);
if (!preg_match('/^[A-Za-z0-9+\/=]+$/', $cleanContent)) {
    jsonResponse(['error' => 'El contenido debe estar codificado en base64'], 400);
}

// Validar extensión de archivo
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
$extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

if (!in_array($extension, $allowedExtensions)) {
    jsonResponse([
        'error' => 'Tipo de archivo no permitido. Usa: ' . implode(', ', $allowedExtensions)
    ], 400);
}

// Validar tamaño (máximo 5MB en base64 ≈ 6.67MB string)
$maxSize = 7 * 1024 * 1024; // 7MB de string base64
if (strlen($content) > $maxSize) {
    jsonResponse(['error' => 'La imagen es demasiado grande. Máximo 5MB.'], 400);
}

// Generar nombre único
$uniqueFilename = generateUniqueFilename($filename);
$filePath = $folder . '/' . $uniqueFilename;

try {
    // Subir a GitHub
    $url = 'https://api.github.com/repos/' . GITHUB_REPO . '/contents/' . $filePath;
    
    $data = [
        'message' => "📸 Upload image: {$uniqueFilename}",
        'content' => $cleanContent, // Ya está en base64
        'branch' => GITHUB_BRANCH
    ];
    
    $result = httpRequest($url, 'PUT', $data, [
        'Authorization: token ' . GITHUB_TOKEN,
        'Accept: application/vnd.github.v3+json',
        'User-Agent: SalaGeek-Admin'
    ]);
    
    if (!$result['success']) {
        throw new Exception('Error al subir imagen a GitHub: ' . json_encode($result['data']));
    }
    
    // Construir URL de la imagen
    $imageUrl = "https://raw.githubusercontent.com/" . GITHUB_REPO . "/" . GITHUB_BRANCH . "/" . $filePath;
    
    jsonResponse([
        'success' => true,
        'filename' => $uniqueFilename,
        'path' => $filePath,
        'url' => $imageUrl,
        'sha' => $result['data']['content']['sha'] ?? null
    ]);
    
} catch (Exception $e) {
    logError('Upload image failed', [
        'error' => $e->getMessage(),
        'filename' => $filename
    ]);
    
    jsonResponse([
        'error' => 'Error al subir imagen',
        'message' => $e->getMessage()
    ], 500);
}

/**
 * Genera un nombre de archivo único
 */
function generateUniqueFilename($originalName) {
    $timestamp = time();
    $extension = pathinfo($originalName, PATHINFO_EXTENSION);
    $baseName = pathinfo($originalName, PATHINFO_FILENAME);
    
    // Limpiar nombre base
    $cleanName = preg_replace('/[^a-z0-9]/', '-', strtolower($baseName));
    $cleanName = preg_replace('/-+/', '-', $cleanName);
    $cleanName = substr($cleanName, 0, 30);
    
    return "{$timestamp}-{$cleanName}.{$extension}";
}
