<?php
declare(strict_types=1);

$user = Middleware::requireAuth();
$pdo = Database::pdo();

$stmt = $pdo->prepare('
    SELECT id, message, type, is_read, created_at
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 200
');
$stmt->execute([(int) $user['id']]);

$items = [];
while ($row = $stmt->fetch()) {
    $items[] = [
        'id' => (int) $row['id'],
        'message' => (string) $row['message'],
        'type' => (string) $row['type'],
        'is_read' => (int) $row['is_read'],
        'created_at' => (string) $row['created_at'],
    ];
}

Response::successData($items);

