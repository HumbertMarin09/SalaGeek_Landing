<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

$config = sg_config();
$pdo = sg_db($config);
$user = sg_require_user();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'GET') {
    sg_require_csrf();
}

function sg_article(PDO $pdo, string $id): ?array {
    $stmt = $pdo->prepare('SELECT a.*, c.name AS category_name, au.name AS author_name FROM articles a JOIN categories c ON c.id = a.category_id JOIN authors au ON au.id = a.author_id WHERE a.id = ? AND a.deleted_at IS NULL');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

if ($method === 'GET' && isset($_GET['id'])) {
    $row = sg_article($pdo, (string) $_GET['id']);
    if (!$row) sg_json(['error' => 'No encontrado'], 404);
    sg_json(['article' => $row]);
}

if ($method === 'GET') {
    $status = $_GET['status'] ?? '';
    $q = '%' . ($_GET['q'] ?? '') . '%';
    $page = max(1, (int) ($_GET['page'] ?? 1));
    $where = 'a.deleted_at IS NULL';
    $params = [];
    if ($status === 'DRAFT' || $status === 'PUBLISHED') {
        $where .= ' AND a.status = ?';
        $params[] = $status;
    }
    if (($_GET['q'] ?? '') !== '') {
        $where .= ' AND (a.title LIKE ? OR a.excerpt LIKE ?)';
        $params[] = $q;
        $params[] = $q;
    }
    $count = $pdo->prepare("SELECT COUNT(*) FROM articles a WHERE $where");
    $count->execute($params);
    $total = (int) $count->fetchColumn();
    $offset = ($page - 1) * 20;
    $stmt = $pdo->prepare("SELECT a.id, a.slug, a.title, a.status, a.published_at, a.category_id FROM articles a WHERE $where ORDER BY a.updated_at DESC LIMIT 20 OFFSET $offset");
    $stmt->execute($params);
    sg_json(['articles' => $stmt->fetchAll(), 'page' => $page, 'pageCount' => max(1, (int) ceil($total / 20))]);
}

if ($method === 'POST' && (($_GET['action'] ?? '') === 'publish' || ($_GET['action'] ?? '') === 'unpublish')) {
    $id = (string) ($_GET['id'] ?? '');
    $status = $_GET['action'] === 'publish' ? 'PUBLISHED' : 'DRAFT';
    $stmt = $pdo->prepare('UPDATE articles SET status = ?, published_at = COALESCE(published_at, CURRENT_TIMESTAMP(3)) WHERE id = ? AND deleted_at IS NULL');
    $stmt->execute([$status, $id]);
    sg_audit($pdo, $user['email'], (string) $_GET['action'], 'article', $id);
    sg_json(['ok' => true, 'rebuild' => sg_dispatch($config)]);
}

if ($method === 'POST') {
    $body = sg_body();
    $id = substr(bin2hex(random_bytes(8)), 0, 16);
    $words = str_word_count(strip_tags((string) ($body['bodyHtml'] ?? '')));
    $author = $pdo->query('SELECT id FROM authors ORDER BY id LIMIT 1')->fetchColumn();
    if (!$author) {
        $pdo->exec("INSERT INTO authors (name, slug) VALUES ('Sala Geek', 'sala-geek')");
        $author = $pdo->lastInsertId();
    }
    $stmt = $pdo->prepare('INSERT INTO articles (id, slug, title, excerpt, body_html, cover_image, category_id, author_id, status, featured, trending, read_minutes, meta_description, no_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, \'DRAFT\', ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))');
    $stmt->execute([
        $id,
        (string) ($body['slug'] ?? $id),
        (string) ($body['title'] ?? 'Sin título'),
        (string) ($body['excerpt'] ?? ''),
        (string) ($body['bodyHtml'] ?? ''),
        $body['coverImage'] ?? null,
        (string) ($body['categoryId'] ?? 'tecnologia'),
        $author,
        !empty($body['featured']) ? 1 : 0,
        !empty($body['trending']) ? 1 : 0,
        max(1, (int) ceil($words / 200)),
        $body['metaDescription'] ?? null,
        !empty($body['noIndex']) ? 1 : 0,
    ]);
    sg_audit($pdo, $user['email'], 'create', 'article', $id);
    sg_json(['article' => sg_article($pdo, $id)], 201);
}

if ($method === 'PUT') {
    $id = (string) ($_GET['id'] ?? '');
    $body = sg_body();
    $words = str_word_count(strip_tags((string) ($body['bodyHtml'] ?? '')));
    $stmt = $pdo->prepare('UPDATE articles SET title = ?, slug = ?, excerpt = ?, body_html = ?, cover_image = ?, category_id = ?, featured = ?, trending = ?, read_minutes = ?, meta_description = ?, no_index = ?, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ? AND deleted_at IS NULL');
    $stmt->execute([
        (string) ($body['title'] ?? ''),
        (string) ($body['slug'] ?? ''),
        (string) ($body['excerpt'] ?? ''),
        (string) ($body['bodyHtml'] ?? ''),
        $body['coverImage'] ?? null,
        (string) ($body['categoryId'] ?? 'tecnologia'),
        !empty($body['featured']) ? 1 : 0,
        !empty($body['trending']) ? 1 : 0,
        max(1, (int) ceil($words / 200)),
        $body['metaDescription'] ?? null,
        !empty($body['noIndex']) ? 1 : 0,
        $id,
    ]);
    sg_audit($pdo, $user['email'], 'update', 'article', $id);
    sg_json(['article' => sg_article($pdo, $id), 'rebuild' => 'skipped']);
}

if ($method === 'DELETE') {
    $id = (string) ($_GET['id'] ?? '');
    $stmt = $pdo->prepare('UPDATE articles SET deleted_at = CURRENT_TIMESTAMP(3) WHERE id = ?');
    $stmt->execute([$id]);
    sg_audit($pdo, $user['email'], 'delete', 'article', $id);
    sg_json(['ok' => true, 'rebuild' => sg_dispatch($config)]);
}

sg_json(['error' => 'Método no permitido'], 405);
