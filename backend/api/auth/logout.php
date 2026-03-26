<?php
declare(strict_types=1);

$user = Middleware::requireAuth();

$pdo = Database::pdo();
$stmt = $pdo->prepare('UPDATE users SET token_version = token_version + 1 WHERE id = ?');
$stmt->execute([(int) $user['id']]);

setcookie('token', '', [
    'expires' => time() - 3600,
    'path' => '/',
    'secure' => isset($_SERVER['HTTPS']),
    'httponly' => true,
    'samesite' => 'Lax',
]);

Response::success([], 'Logged out');

