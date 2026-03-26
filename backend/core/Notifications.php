<?php
declare(strict_types=1);

final class Notifications
{
    public static function create(PDO $pdo, int $userId, string $type, string $message): void
    {
        $stmt = $pdo->prepare('INSERT INTO notifications (user_id, message, type, is_read) VALUES (?, ?, ?, 0)');
        $stmt->execute([$userId, $message, $type]);
    }
}

