<?php
declare(strict_types=1);

$user = Middleware::requireRole(['ngo'], true);
$input = Request::jsonBody();

$donationIdRaw = $input['donation_id'] ?? null;
if (!is_int($donationIdRaw) && !is_string($donationIdRaw)) {
    Response::error('Missing or invalid donation_id', 400, 400);
}
if (!is_numeric($donationIdRaw)) {
    Response::error('Missing or invalid donation_id', 400, 400);
}
$donationId = (int) $donationIdRaw;
if ($donationId <= 0) {
    Response::error('Missing or invalid donation_id', 400, 400);
}

$pdo = Database::pdo();
$pdo->beginTransaction();
try {
    // Lock donation row to enforce "one accepted pickup at a time"
    $stmt = $pdo->prepare('SELECT d.*, u.name AS donor_name FROM food_donations d JOIN users u ON u.id = d.donor_id WHERE d.id = ? FOR UPDATE');
    $stmt->execute([$donationId]);
    $donation = $stmt->fetch();
    if (!is_array($donation)) {
        $pdo->rollBack();
        Response::error('Donation not found', 404, 404);
    }

    $now = date('Y-m-d H:i:s');
    if ((string) $donation['status'] !== 'available') {
        $pdo->rollBack();
        Response::error('Donation not available', 400, 400);
    }
    if ((string) $donation['available_from'] > $now || (string) $donation['available_until'] < $now) {
        $pdo->rollBack();
        Response::error('Donation is outside availability window', 400, 400);
    }

    // Create pickup request and accept immediately (matches frontend "Accept Request").
    $stmt = $pdo->prepare('INSERT INTO pickup_requests (donation_id, requester_id, status) VALUES (?, ?, \'accepted\')');
    try {
        $stmt->execute([$donationId, (int) $user['id']]);
    } catch (PDOException $e) {
        if (($e->errorInfo[1] ?? null) === 1062) {
            $pdo->rollBack();
            Response::error('You already requested this donation', 409, 409);
        }
        throw $e;
    }
    $pickupId = (int) $pdo->lastInsertId();

    $stmt = $pdo->prepare('UPDATE food_donations SET status = \'pending_pickup\' WHERE id = ?');
    $stmt->execute([$donationId]);

    // Reject any other pending requests if they exist (defensive)
    $stmt = $pdo->prepare('UPDATE pickup_requests SET status = \'rejected\' WHERE donation_id = ? AND id <> ? AND status = \'pending\'');
    $stmt->execute([$donationId, $pickupId]);

    // Notify donor
    $donorId = (int) $donation['donor_id'];
    $donorMsg = "Your donation \"{$donation['food_type']}\" has been accepted for pickup by {$user['name']}.";
    Notifications::create($pdo, $donorId, 'pickup_accepted', $donorMsg);

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    throw $e;
}

Response::successData([
    'id' => $pickupId,
    'donation_id' => $donationId,
    'status' => 'accepted',
], 'Pickup accepted');

