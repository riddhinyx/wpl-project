<?php
declare(strict_types=1);

$user = Middleware::requireRole(['ngo'], true);
$pdo = Database::pdo();

$stmt = $pdo->prepare('
    SELECT pr.id, pr.donation_id, pr.requested_at, pr.status,
           d.food_type, d.quantity, d.unit, d.pickup_address, d.pickup_lat, d.pickup_lng,
           d.available_from, d.available_until, d.status AS donation_status,
           u.id AS donor_id, u.name AS donor_name, u.phone AS donor_phone
    FROM pickup_requests pr
    JOIN food_donations d ON d.id = pr.donation_id
    JOIN users u ON u.id = d.donor_id
    WHERE pr.requester_id = ?
    ORDER BY pr.requested_at DESC
');
$stmt->execute([(int) $user['id']]);

$items = [];
while ($row = $stmt->fetch()) {
    $items[] = [
        'id' => (int) $row['id'],
        'status' => (string) $row['status'],
        'requested_at' => (string) $row['requested_at'],
        'donation' => [
            'id' => (int) $row['donation_id'],
            'status' => (string) $row['donation_status'],
            'food_type' => (string) $row['food_type'],
            'quantity' => (float) $row['quantity'],
            'unit' => (string) $row['unit'],
            'pickup_address' => (string) $row['pickup_address'],
            'pickup_lat' => $row['pickup_lat'] !== null ? (float) $row['pickup_lat'] : null,
            'pickup_lng' => $row['pickup_lng'] !== null ? (float) $row['pickup_lng'] : null,
            'available_from' => (string) $row['available_from'],
            'available_until' => (string) $row['available_until'],
            'donor' => [
                'id' => (int) $row['donor_id'],
                'name' => (string) $row['donor_name'],
                'phone' => (string) $row['donor_phone'],
            ],
        ],
    ];
}

Response::successData($items);

