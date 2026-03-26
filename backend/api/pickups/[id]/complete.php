<?php
declare(strict_types=1);

$user = Middleware::requireRole(['ngo'], true);
$params = $GLOBALS['routeParams'] ?? [];
$id = isset($params['id']) ? (int) $params['id'] : 0;
if ($id <= 0) {
    Response::error('Invalid pickup id', 400, 400);
}

$input = Request::jsonBody();
$beneficiaryCountRaw = $input['beneficiary_count'] ?? null;
if (!is_int($beneficiaryCountRaw) && !is_string($beneficiaryCountRaw)) {
    Response::error('Missing or invalid beneficiary_count', 400, 400);
}
if (!is_numeric($beneficiaryCountRaw) || (int) $beneficiaryCountRaw <= 0) {
    Response::error('beneficiary_count must be > 0', 400, 400);
}
$beneficiaryCount = (int) $beneficiaryCountRaw;
$notes = Validator::optionalString($input, 'notes', 5000);

$pdo = Database::pdo();
$pdo->beginTransaction();

try {
    $stmt = $pdo->prepare('
        SELECT pr.id, pr.donation_id, pr.requester_id, pr.status,
               d.donor_id, d.food_type
        FROM pickup_requests pr
        JOIN food_donations d ON d.id = pr.donation_id
        WHERE pr.id = ?
        FOR UPDATE
    ');
    $stmt->execute([$id]);
    $pickup = $stmt->fetch();
    if (!is_array($pickup)) {
        $pdo->rollBack();
        Response::error('Pickup not found', 404, 404);
    }
    if ((int) $pickup['requester_id'] !== (int) $user['id']) {
        $pdo->rollBack();
        Response::error('Forbidden', 403, 403);
    }
    if ((string) $pickup['status'] !== 'accepted') {
        $pdo->rollBack();
        Response::error('Only accepted pickups can be completed', 400, 400);
    }

    $stmt = $pdo->prepare('UPDATE pickup_requests SET status = \'completed\' WHERE id = ?');
    $stmt->execute([$id]);

    $stmt = $pdo->prepare('
        INSERT INTO distribution_logs (pickup_request_id, distributed_by, beneficiary_count, notes)
        VALUES (?, ?, ?, ?)
    ');
    $stmt->execute([$id, (int) $user['id'], $beneficiaryCount, $notes]);

    $stmt = $pdo->prepare('UPDATE food_donations SET status = \'distributed\' WHERE id = ?');
    $stmt->execute([(int) $pickup['donation_id']]);

    // Notify donor
    $donorMsg = "Your donation \"{$pickup['food_type']}\" was marked as distributed (beneficiaries: {$beneficiaryCount}).";
    Notifications::create($pdo, (int) $pickup['donor_id'], 'donation_distributed', $donorMsg);

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    throw $e;
}

Response::success([], 'Pickup completed and distribution logged');

