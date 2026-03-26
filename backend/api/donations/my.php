<?php
declare(strict_types=1);

$user = Middleware::requireRole(['donor'], true);

$pdo = Database::pdo();
$stmt = $pdo->prepare('
    SELECT id, food_type, quantity, unit, description, pickup_address, pickup_lat, pickup_lng,
           available_from, available_until, status, created_at
    FROM food_donations
    WHERE donor_id = ?
    ORDER BY created_at DESC
');
$stmt->execute([(int) $user['id']]);

$items = [];
while ($row = $stmt->fetch()) {
    $items[] = [
        'id' => (int) $row['id'],
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

