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
    
    // Validar formato de slug (solo alfanuméricos, guiones y puntos)
    if (!preg_match('/^[a-z0-9][a-z0-9\-\.]*[a-z0-9]$/', $article['slug'])) {
        jsonResponse(['error' => 'Formato de slug inválido. Solo letras minúsculas, números y guiones.'], 400);
    }
    
    if (!$htmlContent) {
        jsonResponse(['error' => 'Contenido HTML requerido'], 400);
    }
    
    try {
        $isDraft = ($article['status'] ?? 'published') === 'draft';
        
        // MANEJO DE DRAFTS.JSON
        $draftsFile = getGitHubFile('blog/data/drafts.json');
        $draftsSha = null;
        $drafts = ['drafts' => []];
        
        if ($draftsFile) {
            $draftsContent = base64_decode($draftsFile['content']);
            $drafts = json_decode($draftsContent, true);
            $draftsSha = $draftsFile['sha'];
        }
        
        // Buscar si existe en drafts
        $draftIndex = -1;
        foreach ($drafts['drafts'] as $index => $d) {
            if ($d['id'] === $article['id']) {
                $draftIndex = $index;
                break;
            }
        }
        
        // MANEJO DE ARTICLES.JSON
        $articlesFile = getGitHubFile('blog/data/articles.json');
        $articlesSha = null;
        
        if ($articlesFile) {
            $articlesContent = base64_decode($articlesFile['content']);
            $articles = json_decode($articlesContent, true);
            $articlesSha = $articlesFile['sha'];
        } else {
            $articles = ['articles' => [], 'categories' => []];
        }
        
        // Buscar si existe en articles
        $existingIndex = -1;
        foreach ($articles['articles'] as $index => $a) {
            if ($a['id'] === $article['id']) {
                $existingIndex = $index;
                break;
            }
        }
        
        // LÓGICA DE GUARDADO
        if ($isDraft) {
            // Es borrador: guardar en drafts.json
            if ($draftIndex >= 0) {
                $drafts['drafts'][$draftIndex] = $article;
            } else {
                array_unshift($drafts['drafts'], $article);
            }
            
            // Ordenar por fecha
            usort($drafts['drafts'], function($a, $b) {
                return strtotime($b['publishDate']) - strtotime($a['publishDate']);
            });
            
            // Guardar drafts.json
            saveGitHubFile(
                'blog/data/drafts.json',
                json_encode($drafts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
                "📝 " . ($draftIndex >= 0 ? "Update" : "Save") . " draft: {$article['title']}",
                $draftsSha
            );
            
            // Remover de articles.json si existía
            if ($existingIndex >= 0) {
                array_splice($articles['articles'], $existingIndex, 1);
                saveGitHubFile(
                    'blog/data/articles.json',
                    json_encode($articles, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
                    "📝 Move to draft: {$article['title']}",
                    $articlesSha
                );
            }
        } else {
            // Es publicado: guardar en articles.json
            if ($existingIndex >= 0) {
                $articles['articles'][$existingIndex] = $article;
            } else {
                array_unshift($articles['articles'], $article);
            }
            
            // Ordenar por fecha
            usort($articles['articles'], function($a, $b) {
                return strtotime($b['publishDate']) - strtotime($a['publishDate']);
            });
            
            // Guardar articles.json
            saveGitHubFile(
                'blog/data/articles.json',
                json_encode($articles, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
                "📝 " . ($existingIndex >= 0 ? "Update" : "Publish") . " article: {$article['title']}",
                $articlesSha
            );
            
            // Remover de drafts.json si existía
            if ($draftIndex >= 0) {
                array_splice($drafts['drafts'], $draftIndex, 1);
                saveGitHubFile(
                    'blog/data/drafts.json',
                    json_encode($drafts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
                    "✅ Publish draft: {$article['title']}",
                    $draftsSha
                );
            }
        }
        
        // Guardar archivo HTML (siempre, sea borrador o publicado)
        $htmlPath = "blog/articulos/{$article['slug']}.html";
        $existingHtml = getGitHubFile($htmlPath);
        
        $htmlCommitMessage = $isDraft
            ? ($isNew ? "📝 Create draft: {$article['slug']}" : "📝 Update draft: {$article['slug']}")
            : ($isNew ? "📄 Publish article: {$article['slug']}" : "📄 Update article: {$article['slug']}");
        
        saveGitHubFile(
            $htmlPath,
            $htmlContent,
            $htmlCommitMessage,
            $existingHtml['sha'] ?? null
        );
        
        // ═══════════════════════════════════════════════════════════
        // GUARDAR ARCHIVOS LOCALMENTE EN HOSTINGER
        // El deploy desde GitHub puede tardar. Escribimos los archivos
        // directamente en el servidor para que los cambios sean
        // visibles al instante en el sitio publicado.
        // ═══════════════════════════════════════════════════════════
        try {
            $baseDir = realpath(__DIR__ . '/..');
            
            // Guardar HTML del artículo localmente
            $localHtmlPath = $baseDir . '/blog/articulos/' . $article['slug'] . '.html';
            $htmlDir = dirname($localHtmlPath);
            if (!is_dir($htmlDir)) {
                mkdir($htmlDir, 0755, true);
            }
            file_put_contents($localHtmlPath, $htmlContent);
            
            // Guardar articles.json localmente
            $localArticlesPath = $baseDir . '/blog/data/articles.json';
            $articlesDir = dirname($localArticlesPath);
            if (!is_dir($articlesDir)) {
                mkdir($articlesDir, 0755, true);
            }
            file_put_contents($localArticlesPath, json_encode($articles, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            
            // Guardar drafts.json localmente (si se modificó)
            if ($isDraft || $draftIndex >= 0) {
                $localDraftsPath = $baseDir . '/blog/data/drafts.json';
                file_put_contents($localDraftsPath, json_encode($drafts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            }
        } catch (Exception $localErr) {
            // No fallar si la escritura local falla - GitHub es la fuente de verdad
            logError('Local file write failed (non-critical)', [
                'error' => $localErr->getMessage()
            ]);
        }
        
        $statusMsg = $isDraft ? 'guardado como borrador' : ($isNew ? 'publicado' : 'actualizado');
        
        jsonResponse([
            'success' => true,
            'message' => "Artículo {$statusMsg} correctamente",
            'article' => $article,
            'isDraft' => $isDraft
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
    $isDraft = $body['isDraft'] ?? false;
    
    if (!$id || !$slug) {
        jsonResponse(['error' => 'ID y slug son requeridos'], 400);
    }
    
    // Validar formato de slug para prevenir path traversal
    if (!preg_match('/^[a-z0-9][a-z0-9\-\.]*[a-z0-9]$/', $slug)) {
        jsonResponse(['error' => 'Formato de slug inválido'], 400);
    }
    
    try {
        // Eliminar de articles.json O drafts.json según corresponda
        $fileName = $isDraft ? 'blog/data/drafts.json' : 'blog/data/articles.json';
        $dataFile = getGitHubFile($fileName);
        
        if (!$dataFile) {
            jsonResponse(['error' => 'No se encontró el archivo de datos'], 404);
        }
        
        $content = base64_decode($dataFile['content']);
        $data = json_decode($content, true);
        
        $key = $isDraft ? 'drafts' : 'articles';
        
        // Filtrar el artículo a eliminar
        $data[$key] = array_filter($data[$key], function($a) use ($id) {
            return $a['id'] !== $id;
        });
        
        // Reindexar array
        $data[$key] = array_values($data[$key]);
        
        // Guardar JSON actualizado
        saveGitHubFile(
            $fileName,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
            "🗑️ Delete " . ($isDraft ? "draft" : "article") . ": {$slug}",
            $dataFile['sha']
        );
        
        // Eliminar archivo HTML
        $htmlPath = "blog/articulos/{$slug}.html";
        $htmlFile = getGitHubFile($htmlPath);
        
        if ($htmlFile) {
            deleteGitHubFile(
                $htmlPath,
                $htmlFile['sha'],
                "🗑️ Delete HTML: {$slug}"
            );
        }
        
        // Eliminar archivos locales en Hostinger para reflejo inmediato
        try {
            $baseDir = realpath(__DIR__ . '/..');
            
            // Eliminar HTML local
            $localHtmlPath = $baseDir . '/blog/articulos/' . $slug . '.html';
            if (file_exists($localHtmlPath)) {
                unlink($localHtmlPath);
            }
            
            // Actualizar JSON local
            $localJsonPath = $baseDir . '/' . $fileName;
            file_put_contents($localJsonPath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        } catch (Exception $localErr) {
            logError('Local delete failed (non-critical)', ['error' => $localErr->getMessage()]);
        }
        
        jsonResponse([
            'success' => true,
            'message' => ($isDraft ? 'Borrador' : 'Artículo') . ' eliminado correctamente'
        ]);
        
    } catch (Exception $e) {
        logError('Delete article failed', [
            'error' => $e->getMessage(),
            'slug' => $slug,
            'isDraft' => $isDraft
        ]);
        
        jsonResponse(['error' => $e->getMessage()], 500);
    }
}
