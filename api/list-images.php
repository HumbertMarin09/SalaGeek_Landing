<?php
/**
 * ═══════════════════════════════════════════════════════════════
 * 🖼️ LIST IMAGES - Sala Geek Admin API
 * ═══════════════════════════════════════════════════════════════
 * 
 * Lista las imágenes del directorio src/images/blog en GitHub.
 * Reemplaza: /.netlify/functions/list-images
 * 
 * GET /api/list-images.php
 * GET /api/list-images.php?folder=src/images/weekly-news
 * 
 * ═══════════════════════════════════════════════════════════════
 */

require_once __DIR__ . '/config.php';

// Configurar CORS y manejar preflight
setCorsHeaders();
handlePreflight();

// Solo permitir GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Método no permitido'], 405);
}

// Requiere autenticación
requireAuth();

// Rate limiting para endpoints admin
if (!checkRateLimit(ADMIN_RATE_LIMIT_WINDOW, ADMIN_RATE_LIMIT_MAX, 'list_images')) {
    jsonResponse(['error' => 'Demasiadas solicitudes'], 429);
}

// Verificar configuración de GitHub
if (GITHUB_TOKEN === 'TU_GITHUB_TOKEN_AQUI' || empty(GITHUB_TOKEN)) {
    jsonResponse([
        'error' => 'Error de configuración: GitHub token no configurado',
        'hint' => 'Configura GITHUB_TOKEN en las variables de entorno de Hostinger'
    ], 500);
}

// Obtener carpeta (por defecto src/images/blog)
$folder = $_GET['folder'] ?? 'src/images/blog';

// Validar que la carpeta sea segura (prevenir path traversal)
$folder = str_replace(['..', '\\'], '', $folder);
$allowedFolders = ['src/images/blog', 'src/images/weekly-news', 'src/images'];

// Verificar que la carpeta esté permitida o sea un subdirectorio de las permitidas
$isAllowed = false;
foreach ($allowedFolders as $allowed) {
    if (strpos($folder, $allowed) === 0) {
        $isAllowed = true;
        break;
    }
}

if (!$isAllowed) {
    jsonResponse(['error' => 'Carpeta no permitida'], 403);
}

try {
    // Obtener contenido del directorio desde GitHub
    $url = 'https://api.github.com/repos/' . GITHUB_REPO . '/contents/' . $folder . '?ref=' . GITHUB_BRANCH;
    
    $result = httpRequest($url, 'GET', null, [
        'Authorization: token ' . GITHUB_TOKEN,
        'Accept: application/vnd.github.v3+json',
        'User-Agent: SalaGeek-Admin'
    ]);
    
    // Si el directorio no existe, devolver lista vacía
    if ($result['httpCode'] === 404) {
        jsonResponse([
            'success' => true,
            'images' => [],
            'count' => 0,
            'folder' => $folder
        ]);
    }
    
    if (!$result['success']) {
        throw new Exception('Error al obtener contenido de GitHub: ' . ($result['error'] ?? 'Unknown error'));
    }
    
    $contents = $result['data'];
    
    // Si no es un array, algo salió mal
    if (!is_array($contents)) {
        jsonResponse([
            'success' => true,
            'images' => [],
            'count' => 0,
            'folder' => $folder
        ]);
    }
    
    // Filtrar solo archivos de imagen
    $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    $images = [];
    
    foreach ($contents as $item) {
        // Solo archivos, no directorios
        if ($item['type'] !== 'file') {
            continue;
        }
        
        // Obtener extensión
        $extension = strtolower(pathinfo($item['name'], PATHINFO_EXTENSION));
        
        if (!in_array($extension, $imageExtensions)) {
            continue;
        }
        
        $images[] = [
            'name' => $item['name'],
            'path' => $item['path'],
            'url' => "https://raw.githubusercontent.com/" . GITHUB_REPO . "/" . GITHUB_BRANCH . "/" . $item['path'],
            'size' => $item['size'],
            'sha' => $item['sha']
        ];
    }
    
    // Ordenar por nombre descendente (más reciente primero, asumiendo nombres con timestamp)
    usort($images, function($a, $b) {
        return strcmp($b['name'], $a['name']);
    });
    
    jsonResponse([
        'success' => true,
        'images' => $images,
        'count' => count($images),
        'folder' => $folder
    ]);
    
} catch (Exception $e) {
    logError('List images failed', [
        'error' => $e->getMessage(),
        'folder' => $folder
    ]);
    
    // Proporcionar hints útiles según el error
    $hint = '';
    if (strpos($e->getMessage(), '401') !== false) {
        $hint = 'GitHub token es inválido o expiró. Verifica GITHUB_TOKEN.';
    } elseif (strpos($e->getMessage(), '404') !== false) {
        $hint = 'Repositorio o ruta no encontrada. Verifica GITHUB_REPO y GITHUB_BRANCH.';
    }
    
    jsonResponse([
        'error' => 'Error al listar imágenes',
        'message' => $e->getMessage(),
        'hint' => $hint
    ], 500);
}
