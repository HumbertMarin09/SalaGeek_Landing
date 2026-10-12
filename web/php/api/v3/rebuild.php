<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

$config = sg_config();
$user = sg_require_user();
sg_require_csrf();
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') sg_json(['error' => 'Método no permitido'], 405);
sg_json(['rebuild' => sg_dispatch($config), 'actor' => $user['email']]);
