<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

$config = sg_config();
$pdo = sg_db($config);
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $slug = (string) ($_GET['slug'] ?? '');
    $stmt = $pdo->prepare('SELECT v.count FROM article_views v JOIN articles a ON a.id = v.article_id WHERE a.slug = ?');
    $stmt->execute([$slug]);
    sg_json(['count' => (int) ($stmt->fetchColumn() ?: 0)]);
}

if ($method === 'POST') {
    $slug = (string) (sg_body()['slug'] ?? '');
    $seen = json_decode($_COOKIE['sg_views'] ?? '[]', true);
    if (!is_array($seen)) $seen = [];
    $stmt = $pdo->prepare('SELECT id FROM articles WHERE slug = ? AND deleted_at IS NULL');
    $stmt->execute([$slug]);
    $id = $stmt->fetchColumn();
    if (!$id) sg_json(['error' => 'No encontrado'], 404);
    if (!in_array($slug, $seen, true)) {
        $upsert = $pdo->prepare('INSERT INTO article_views (article_id, count, updated_at) VALUES (?, 1, CURRENT_TIMESTAMP(3)) ON DUPLICATE KEY UPDATE count = count + 1, updated_at = CURRENT_TIMESTAMP(3)');
        $upsert->execute([$id]);
        $seen[] = $slug;
        setcookie('sg_views', json_encode($seen), [
            'expires' => time() + 86400,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }
    $count = $pdo->prepare('SELECT count FROM article_views WHERE article_id = ?');
    $count->execute([$id]);
    sg_json(['count' => (int) ($count->fetchColumn() ?: 0)]);
}

sg_json(['error' => 'Método no permitido'], 405);
