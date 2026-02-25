<?php
/**
 * ========================================
 * API: Track Article Views - Sala Geek
 * ========================================
 * 
 * Registra y devuelve las vistas de un artículo.
 * 
 * POST /api/track-view.php  → Incrementa y devuelve vistas
 *   Body: { "slug": "nombre-del-articulo" }
 * 
 * GET  /api/track-view.php?slug=nombre  → Solo devuelve vistas (sin incrementar)
 * 
 * Almacena conteos en blog/data/views.json
 * Usa cookies para evitar que el mismo visitante infle el conteo.
 */

// CORS headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Ruta al archivo de vistas
$viewsFile = __DIR__ . '/../blog/data/views.json';

/**
 * Carga el archivo de vistas
 */
function loadViews($filePath) {
    if (!file_exists($filePath)) {
        return [];
    }
    $content = file_get_contents($filePath);
    if ($content === false || $content === '') {
        return [];
    }
    $data = json_decode($content, true);
    return is_array($data) ? $data : [];
}

/**
 * Guarda el archivo de vistas con bloqueo
 */
function saveViews($filePath, $views) {
    $dir = dirname($filePath);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    
    $fp = fopen($filePath, 'c');
    if (!$fp) {
        return false;
    }
    
    if (flock($fp, LOCK_EX)) {
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($views, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);
        return true;
    }
    
    fclose($fp);
    return false;
}

/**
 * Sanitiza el slug del artículo
 */
function sanitizeSlug($slug) {
    // Solo permite letras, números, guiones y guiones bajos
    $slug = preg_replace('/[^a-zA-Z0-9\-_]/', '', $slug);
    // Limita longitud
    return substr($slug, 0, 200);
}

/**
 * Verifica si este visitante ya vio el artículo (cookie-based)
 */
function hasVisitorViewed($slug) {
    $cookieName = 'sg_views';
    if (!isset($_COOKIE[$cookieName])) {
        return false;
    }
    $viewed = json_decode($_COOKIE[$cookieName], true);
    if (!is_array($viewed)) {
        return false;
    }
    return in_array($slug, $viewed);
}

/**
 * Marca el artículo como visto por este visitante (cookie 24h)
 */
function markAsViewed($slug) {
    $cookieName = 'sg_views';
    $viewed = [];
    
    if (isset($_COOKIE[$cookieName])) {
        $decoded = json_decode($_COOKIE[$cookieName], true);
        if (is_array($decoded)) {
            $viewed = $decoded;
        }
    }
    
    if (!in_array($slug, $viewed)) {
        $viewed[] = $slug;
        // Mantener solo los últimos 100 slugs para no exceder tamaño de cookie
        if (count($viewed) > 100) {
            $viewed = array_slice($viewed, -100);
        }
    }
    
    setcookie($cookieName, json_encode($viewed), [
        'expires' => time() + 86400, // 24 horas
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
}

// ============================================
// Manejar petición
// ============================================

$method = $_SERVER['REQUEST_METHOD'];

// Obtener slug
$slug = '';
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $slug = isset($input['slug']) ? sanitizeSlug($input['slug']) : '';
} elseif ($method === 'GET') {
    $slug = isset($_GET['slug']) ? sanitizeSlug($_GET['slug']) : '';
}

if (empty($slug)) {
    http_response_code(400);
    echo json_encode(['error' => 'Slug requerido', 'views' => 0]);
    exit;
}

// Cargar vistas actuales
$views = loadViews($viewsFile);

if ($method === 'POST') {
    // Incrementar vista solo si el visitante no la ha visto recientemente
    if (!hasVisitorViewed($slug)) {
        $views[$slug] = isset($views[$slug]) ? $views[$slug] + 1 : 1;
        
        if (!saveViews($viewsFile, $views)) {
            http_response_code(500);
            echo json_encode(['error' => 'Error guardando vistas', 'views' => 0]);
            exit;
        }
        
        markAsViewed($slug);
    }
    
    $count = isset($views[$slug]) ? $views[$slug] : 0;
    echo json_encode(['slug' => $slug, 'views' => $count, 'success' => true]);
    
} elseif ($method === 'GET') {
    $count = isset($views[$slug]) ? $views[$slug] : 0;
    echo json_encode(['slug' => $slug, 'views' => $count]);
    
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
