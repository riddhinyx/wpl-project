<?php
declare(strict_types=1);

$user = Middleware::requireAuth();
$params = $GLOBALS['routeParams'] ?? [];
$id = isset($params['id']) ? (int) $params['id'] : 0;
if ($id <= 0) {
    Response::error('Invalid notification id', 400, 400);
}

$pdo = Database::pdo();
$stmt = $pdo->prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?');
$stmt->execute([$id, (int) $user['id']]);

if ($stmt->rowCount() === 0) {
    Response::error('Notification not found', 404, 404);
}

Response::success([], 'Marked as read');

