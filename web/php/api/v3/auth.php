<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

$config = sg_config();
$pdo = sg_db($config);
$action = $_GET['action'] ?? 'me';
$body = sg_body();

if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'local';
    sg_rate_limit($pdo, 'login:' . $ip, 5, 300);
    $email = strtolower(trim((string) ($body['email'] ?? '')));
    $password = (string) ($body['password'] ?? '');
    $stmt = $pdo->prepare('SELECT id, email, name, password_hash FROM admin_users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($password, (string) $user['password_hash'])) {
        sg_json(['error' => 'Credenciales incorrectas'], 401);
    }
    sg_session();
    session_regenerate_id(true);
    $_SESSION['admin'] = ['id' => (int) $user['id'], 'email' => $user['email'], 'name' => $user['name']];
    $touch = $pdo->prepare('UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP(3) WHERE id = ?');
    $touch->execute([(int) $user['id']]);
    sg_json(['user' => $_SESSION['admin'], 'csrfToken' => sg_csrf()]);
}

if ($action === 'logout' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    sg_session();
    $_SESSION = [];
    session_destroy();
    sg_json(['ok' => true]);
}

if ($action === 'me') {
    $user = sg_require_user();
    sg_json(['user' => $user, 'csrfToken' => sg_csrf()]);
}

if ($action === 'change-password' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = sg_require_user();
    sg_require_csrf();
    $next = (string) ($body['newPassword'] ?? '');
    if (strlen($next) < 10) {
        sg_json(['error' => 'La contraseña nueva necesita 10 caracteres'], 422);
    }
    $hash = password_hash($next, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?');
    $stmt->execute([$hash, $user['id']]);
    sg_audit($pdo, $user['email'], 'change-password', 'admin', (string) $user['id']);
    sg_json(['ok' => true]);
}

sg_json(['error' => 'Acción desconocida'], 404);
