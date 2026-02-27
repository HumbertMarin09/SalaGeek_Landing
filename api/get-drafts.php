<?php
/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 GET DRAFTS - Sala Geek Admin API
 * ═══════════════════════════════════════════════════════════════
 * 
 * Obtiene la lista de borradores desde GitHub.
 * Los borradores se guardan en blog/data/drafts.json
 * 
 * GET /api/get-drafts.php
 * 
 * ═══════════════════════════════════════════════════════════════
 */

require_once __DIR__ . '/config.php';

// Configurar CORS y manejar preflight
setCorsHeaders();
handlePreflight();

// Solo GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Método no permitido'], 405);
}

// Requiere autenticación
requireAuth();

// Rate limiting para endpoints admin
if (!checkRateLimit(ADMIN_RATE_LIMIT_WINDOW, ADMIN_RATE_LIMIT_MAX, 'get_drafts')) {
    jsonResponse(['error' => 'Demasiadas solicitudes'], 429);
}

try {
    // Obtener drafts.json de GitHub
    $url = 'https://api.github.com/repos/' . GITHUB_REPO . '/contents/blog/data/drafts.json?ref=' . GITHUB_BRANCH;
    
    $result = httpRequest($url, 'GET', null, [
        'Authorization: token ' . GITHUB_TOKEN,
        'Accept: application/vnd.github.v3+json',
        'User-Agent: SalaGeek-Admin'
    ]);
    
    // Si no existe drafts.json, devolver array vacío
    if ($result['httpCode'] === 404) {
        jsonResponse([
            'success' => true,
            'drafts' => []
        ]);
    }
    
    if (!$result['success']) {
        throw new Exception('Error al obtener borradores de GitHub');
    }
    
    $content = base64_decode($result['data']['content']);
    // Eliminar BOM si existe
    $content = stripBOM($content);
    $draftsData = json_decode($content, true);
    // Reparar posible doble-codificación UTF-8
    $draftsData = repairDoubleEncodedUTF8($draftsData);
    
    jsonResponse([
        'success' => true,
        'drafts' => $draftsData['drafts'] ?? []
    ]);
    
} catch (Exception $e) {
    logError('Get drafts failed', [
        'error' => $e->getMessage()
    ]);
    
    jsonResponse([
        'error' => 'Error al obtener borradores',
        'message' => $e->getMessage()
    ], 500);
}
