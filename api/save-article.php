<?php
/**
 * ═══════════════════════════════════════════════════════════════
 * 💾 SAVE ARTICLE - Sala Geek Admin API
 * ═══════════════════════════════════════════════════════════════
 * 
 * Gestión de artículos vía GitHub API.
 * Reemplaza: /.netlify/functions/save-article
 * 
 * Endpoints:
 * - POST   /api/save-article.php → Crear/actualizar artículo
 * - DELETE /api/save-article.php → Eliminar artículo
 * 
 * ═══════════════════════════════════════════════════════════════
 */

require_once __DIR__ . '/config.php';

// Configurar CORS y manejar preflight
setCorsHeaders();
handlePreflight();

// Requiere autenticación
requireAuth();

// Rate limiting para admin (20 operaciones por 10 minutos)
if (!checkRateLimit(ADMIN_RATE_LIMIT_WINDOW, ADMIN_RATE_LIMIT_MAX, 'save_article')) {
    jsonResponse(['error' => 'Demasiadas solicitudes. Intenta en 10 minutos.'], 429);
}

// Verificar que GitHub está configurado
if (GITHUB_TOKEN === 'TU_GITHUB_TOKEN_AQUI' || empty(GITHUB_TOKEN)) {
    logError('GITHUB_TOKEN not configured');
    jsonResponse([
        'error' => 'Error de configuración: GitHub token no configurado',
        'hint' => 'Configura GITHUB_TOKEN en las variables de entorno de Hostinger'
    ], 500);
}

// Router por método HTTP
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        handleCreateOrUpdate();
        break;
    case 'DELETE':
        handleDelete();
        break;
    default:
        jsonResponse(['error' => 'Método no permitido'], 405);
}

/**
 * Obtiene un archivo de GitHub
 */
function getGitHubFile($path) {
    $url = 'https://api.github.com/repos/' . GITHUB_REPO . '/contents/' . $path . '?ref=' . GITHUB_BRANCH;
    
    $result = httpRequest($url, 'GET', null, [
        'Authorization: token ' . GITHUB_TOKEN,
        'Accept: application/vnd.github.v3+json',
        'User-Agent: SalaGeek-Admin'
    ]);
    
    if ($result['httpCode'] === 404) {
        return null;
    }
    
    if (!$result['success']) {
        throw new Exception('Error al obtener archivo de GitHub: ' . ($result['error'] ?? 'Unknown error'));
    }
    
    return $result['data'];
}

/**
 * Guarda un archivo en GitHub
 */
function saveGitHubFile($path, $content, $message, $sha = null) {
    $url = 'https://api.github.com/repos/' . GITHUB_REPO . '/contents/' . $path;
    
    $data = [
        'message' => $message,
        'content' => base64_encode($content),
        'branch' => GITHUB_BRANCH
    ];
    
    if ($sha) {
        $data['sha'] = $sha;
    }
    
    $result = httpRequest($url, 'PUT', $data, [
        'Authorization: token ' . GITHUB_TOKEN,
        'Accept: application/vnd.github.v3+json',
        'User-Agent: SalaGeek-Admin'
    ]);
    
    if (!$result['success']) {
        $error = is_array($result['data']) ? json_encode($result['data']) : $result['data'];
        throw new Exception('Error al guardar en GitHub: ' . $error);
    }
    
    return $result['data'];
}

/**
 * Elimina un archivo de GitHub
 */
function deleteGitHubFile($path, $sha, $message) {
    $url = 'https://api.github.com/repos/' . GITHUB_REPO . '/contents/' . $path;
    
    $data = [
        'message' => $message,
        'sha' => $sha,
        'branch' => GITHUB_BRANCH
    ];
    
    $result = httpRequest($url, 'DELETE', $data, [
        'Authorization: token ' . GITHUB_TOKEN,
        'Accept: application/vnd.github.v3+json',
        'User-Agent: SalaGeek-Admin'
    ]);
    
    if (!$result['success']) {
        throw new Exception('Error al eliminar de GitHub: ' . json_encode($result['data']));
    }
    
    return $result['data'];
}

/**
 * Crear o actualizar artículo
 */
function handleCreateOrUpdate() {
    $body = getRequestBody();
    
    $article = $body['article'] ?? null;
    $htmlContent = $body['htmlContent'] ?? null;
    $isNew = $body['isNew'] ?? true;
    
    // Validaciones
    if (!$article) {
        jsonResponse(['error' => 'Datos del artículo requeridos'], 400);
    }
    
    if (empty($article['title']) || empty($article['slug'])) {
        jsonResponse(['error' => 'Título y slug son requeridos'], 400);
    }
    
    if (!$htmlContent) {
        jsonResponse(['error' => 'Contenido HTML requerido'], 400);
    }
    
    try {
        // Obtener articles.json actual
        $articlesFile = getGitHubFile('blog/data/articles.json');
        $articlesSha = null;
        
        if ($articlesFile) {
            $articlesContent = base64_decode($articlesFile['content']);
            $articles = json_decode($articlesContent, true);
            $articlesSha = $articlesFile['sha'];
        } else {
            $articles = ['articles' => [], 'categories' => []];
        }
        
        // Buscar si el artículo ya existe
        $existingIndex = -1;
        foreach ($articles['articles'] as $index => $a) {
            if ($a['id'] === $article['id']) {
                $existingIndex = $index;
                break;
            }
        }
        
        // Actualizar o agregar artículo
        if ($existingIndex >= 0) {
            $articles['articles'][$existingIndex] = $article;
        } else {
            array_unshift($articles['articles'], $article);
        }
        
        // Ordenar por fecha (más reciente primero)
        usort($articles['articles'], function($a, $b) {
            return strtotime($b['publishDate']) - strtotime($a['publishDate']);
        });
        
        // Guardar articles.json
        $commitMessage = $isNew 
            ? "📝 New article: {$article['title']}" 
            : "✏️ Update article: {$article['title']}";
        
        saveGitHubFile(
            'blog/data/articles.json',
            json_encode($articles, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
            $commitMessage,
            $articlesSha
        );
        
        // Guardar archivo HTML
        $htmlPath = "blog/articulos/{$article['slug']}.html";
        $existingHtml = getGitHubFile($htmlPath);
        
        $htmlCommitMessage = $isNew
            ? "📄 Create article HTML: {$article['slug']}"
            : "📄 Update article HTML: {$article['slug']}";
        
        saveGitHubFile(
            $htmlPath,
            $htmlContent,
            $htmlCommitMessage,
            $existingHtml['sha'] ?? null
        );
        
        jsonResponse([
            'success' => true,
            'message' => $isNew ? 'Artículo creado correctamente' : 'Artículo actualizado correctamente',
            'article' => $article
        ]);
        
    } catch (Exception $e) {
        logError('Save article failed', [
            'error' => $e->getMessage(),
            'article' => $article['title'] ?? 'unknown'
        ]);
        
        jsonResponse(['error' => $e->getMessage()], 500);
    }
}

/**
 * Eliminar artículo
 */
function handleDelete() {
    $body = getRequestBody();
    
    $id = $body['id'] ?? null;
    $slug = $body['slug'] ?? null;
    
    if (!$id || !$slug) {
        jsonResponse(['error' => 'ID y slug son requeridos'], 400);
    }
    
    try {
        // Obtener articles.json
        $articlesFile = getGitHubFile('blog/data/articles.json');
        
        if (!$articlesFile) {
            jsonResponse(['error' => 'No se encontró el archivo de artículos'], 404);
        }
        
        $articlesContent = base64_decode($articlesFile['content']);
        $articles = json_decode($articlesContent, true);
        
        // Filtrar el artículo a eliminar
        $articles['articles'] = array_filter($articles['articles'], function($a) use ($id) {
            return $a['id'] !== $id;
        });
        
        // Reindexar array
        $articles['articles'] = array_values($articles['articles']);
        
        // Guardar articles.json actualizado
        saveGitHubFile(
            'blog/data/articles.json',
            json_encode($articles, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
            "🗑️ Delete article: {$slug}",
            $articlesFile['sha']
        );
        
        // Eliminar archivo HTML
        $htmlPath = "blog/articulos/{$slug}.html";
        $htmlFile = getGitHubFile($htmlPath);
        
        if ($htmlFile) {
            deleteGitHubFile(
                $htmlPath,
                $htmlFile['sha'],
                "🗑️ Delete article HTML: {$slug}"
            );
        }
        
        jsonResponse([
            'success' => true,
            'message' => 'Artículo eliminado correctamente'
        ]);
        
    } catch (Exception $e) {
        logError('Delete article failed', [
            'error' => $e->getMessage(),
            'slug' => $slug
        ]);
        
        jsonResponse(['error' => $e->getMessage()], 500);
    }
}
