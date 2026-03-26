<?php
declare(strict_types=1);

require_once __DIR__ . '/../core/bootstrap.php';

$pdo = Database::pdo();
$now = date('Y-m-d H:i:s');

$pdo->beginTransaction();
try {
    // Find donations that should expire
    $stmt = $pdo->prepare("
        SELECT id
        FROM food_donations
        WHERE available_until < ?
          AND status IN ('available','pending_pickup')
        FOR UPDATE
    ");
    $stmt->execute([$now]);
    $ids = [];
    while ($row = $stmt->fetch()) {
        $ids[] = (int) $row['id'];
    }

    $expiredCount = 0;
    if (count($ids) > 0) {
        $placeholders = implode(',', array_fill(0, count($ids), '?'));

        $stmt = $pdo->prepare("UPDATE food_donations SET status = 'expired' WHERE id IN ({$placeholders})");
        $stmt->execute($ids);
        $expiredCount = $stmt->rowCount();

        // Reject any outstanding pickup requests for expired donations
        $stmt = $pdo->prepare("UPDATE pickup_requests SET status = 'rejected' WHERE donation_id IN ({$placeholders}) AND status IN ('pending','accepted')");
        $stmt->execute($ids);
    }

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    throw $e;
}

if (PHP_SAPI === 'cli') {
    fwrite(STDOUT, "Expired donations updated: {$expiredCount}\n");
    exit(0);
}

Response::successData(['expired_updated' => $expiredCount]);

