<?php
declare(strict_types=1);

Middleware::requireRole(['admin'], false);
$pdo = Database::pdo();

$stmt = $pdo->prepare('
    SELECT d.id, d.donor_id, u.name AS donor_name, u.email AS donor_email, u.phone AS donor_phone,
           d.food_type, d.quantity, d.unit, d.description, d.pickup_address, d.pickup_lat, d.pickup_lng,
           d.available_from, d.available_until, d.status, d.created_at
    FROM food_donations d
    JOIN users u ON u.id = d.donor_id
    ORDER BY d.created_at DESC
');
$stmt->execute();

$items = [];
while ($row = $stmt->fetch()) {
    $items[] = [
        'id' => (int) $row['id'],
        'donor' => [
            'id' => (int) $row['donor_id'],
            'name' => (string) $row['donor_name'],
            'email' => (string) $row['donor_email'],
            'phone' => (string) $row['donor_phone'],
        ],
        'food_type' => (string) $row['food_type'],
        'quantity' => (float) $row['quantity'],
        'unit' => (string) $row['unit'],
        'description' => $row['description'],
        'pickup_address' => (string) $row['pickup_address'],
        'pickup_lat' => $row['pickup_lat'] !== null ? (float) $row['pickup_lat'] : null,
        'pickup_lng' => $row['pickup_lng'] !== null ? (float) $row['pickup_lng'] : null,
        'available_from' => (string) $row['available_from'],
        'available_until' => (string) $row['available_until'],
        'status' => (string) $row['status'],
        'created_at' => (string) $row['created_at'],
    ];
}

Response::successData($items);

