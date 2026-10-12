<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

$config = sg_config();
$pdo = sg_db($config);
$user = sg_require_user();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $stmt = $pdo->query('SELECT id, path, mime, width, height, bytes, alt, created_at FROM media ORDER BY id DESC LIMIT 40');
    sg_json(['images' => $stmt->fetchAll()]);
}

if ($method !== 'POST') sg_json(['error' => 'Método no permitido'], 405);
sg_require_csrf();
if (empty($_FILES['file']['tmp_name'])) sg_json(['error' => 'Falta el archivo'], 422);
$info = getimagesize($_FILES['file']['tmp_name']);
if (!$info) sg_json(['error' => 'No es una imagen'], 422);
$mime = $info['mime'] ?? '';
$loaders = [
    'image/jpeg' => 'imagecreatefromjpeg',
    'image/png' => 'imagecreatefrompng',
    'image/webp' => 'imagecreatefromwebp',
    'image/gif' => 'imagecreatefromgif',
];
if (!isset($loaders[$mime]) || $_FILES['file']['size'] > 8 * 1024 * 1024) {
    sg_json(['error' => 'Formato o tamaño no permitido'], 422);
}
$image = $loaders[$mime]($_FILES['file']['tmp_name']);
if (!$image) sg_json(['error' => 'No se pudo leer la imagen'], 422);
$root = (string) ($config['uploadRoot'] ?? (__DIR__ . '/../../uploads'));
$folder = $root . '/' . gmdate('Y/m');
if (!is_dir($folder) && !mkdir($folder, 0755, true)) sg_json(['error' => 'No se pudo crear la carpeta'], 500);
$name = gmdate('YmdHis') . '-' . bin2hex(random_bytes(3));
$saved = [];
foreach ([1600, 960, 480] as $target) {
    $width = imagesx($image);
    $height = imagesy($image);
    $scale = min(1, $target / max($width, 1));
    $copy = imagescale($image, (int) max(1, $width * $scale));
    $file = $folder . '/' . $name . '-' . $target . '.webp';
    imagewebp($copy, $file, 82);
    imagedestroy($copy);
    $public = '/uploads/' . gmdate('Y/m') . '/' . $name . '-' . $target . '.webp';
    $saved[] = $public;
    $insert = $pdo->prepare('INSERT INTO media (path, mime, width, height, bytes, alt) VALUES (?, \'image/webp\', ?, ?, ?, ?)');
    $insert->execute([$public, imagesx($image), imagesy($image), filesize($file) ?: 0, (string) ($_POST['alt'] ?? '')]);
}
imagedestroy($image);
sg_audit($pdo, $user['email'], 'upload', 'media', $saved[0]);
sg_json(['paths' => $saved]);
