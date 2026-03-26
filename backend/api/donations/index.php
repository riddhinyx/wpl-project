<?php
declare(strict_types=1);

$method = Request::method();

if ($method === 'POST') {
    $user = Middleware::requireRole(['donor'], true);
    $input = Request::jsonBody();

    $foodType = Validator::requireString($input, 'food_type', 2, 120);
    $quantity = Validator::requireFloat($input, 'quantity');
    if ($quantity <= 0) {
        Response::error('Quantity must be greater than 0', 400, 400);
    }
    $unit = Validator::requireString($input, 'unit', 1, 16);
    $description = Validator::optionalString($input, 'description', 5000);
    $pickupAddress = Validator::requireString($input, 'pickup_address', 5, 255);
    $pickupLat = Validator::optionalFloat($input, 'pickup_lat');
    $pickupLng = Validator::optionalFloat($input, 'pickup_lng');
    $availableFrom = Validator::requireDateTime($input, 'available_from');
    $availableUntil = Validator::requireDateTime($input, 'available_until');

    if (strtotime($availableUntil) <= strtotime($availableFrom)) {
        Response::error('available_until must be after available_from', 400, 400);
    }
    if ($pickupLat !== null && ($pickupLat < -90 || $pickupLat > 90)) {
        Response::error('Invalid pickup_lat', 400, 400);
    }
    if ($pickupLng !== null && ($pickupLng < -180 || $pickupLng > 180)) {
        Response::error('Invalid pickup_lng', 400, 400);
    }

    $pdo = Database::pdo();
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare(
            'INSERT INTO food_donations (donor_id, food_type, quantity, unit, description, pickup_address, pickup_lat, pickup_lng, available_from, available_until, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, \'available\')'
        );
        $stmt->execute([
            (int) $user['id'],
            $foodType,
            $quantity,
            $unit,
            $description,
            $pickupAddress,
            $pickupLat,
            $pickupLng,
            $availableFrom,
            $availableUntil,
        ]);
        $donationId = (int) $pdo->lastInsertId();

        // Notify verified NGOs within configurable radius (default 20km).
        $config = require __DIR__ . '/../../config/config.php';
        $radiusKm = (float) $config['donations']['notify_radius_km'];
        $message = "New donation available: {$foodType} ({$quantity} {$unit}) at {$pickupAddress}";

        if ($pickupLat !== null && $pickupLng !== null) {
            $sql = '
                SELECT id,
                       (6371 * ACOS(
                           COS(RADIANS(:lat)) * COS(RADIANS(lat)) * COS(RADIANS(lng) - RADIANS(:lng)) +
                           SIN(RADIANS(:lat)) * SIN(RADIANS(lat))
                       )) AS distance_km
                FROM users
                WHERE role = \'ngo\' AND is_verified = 1 AND is_active = 1
                  AND lat IS NOT NULL AND lng IS NOT NULL
                HAVING distance_km <= :radius
                ORDER BY distance_km ASC
            ';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':lat' => $pickupLat,
                ':lng' => $pickupLng,
                ':radius' => $radiusKm,
            ]);
        } else {
            $stmt = $pdo->prepare('SELECT id FROM users WHERE role = \'ngo\' AND is_verified = 1 AND is_active = 1');
            $stmt->execute();
        }

        while ($row = $stmt->fetch()) {
            Notifications::create($pdo, (int) $row['id'], 'donation_new', $message);
        }

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }

    Response::successData([
        'id' => $donationId,
        'status' => 'available',
    ], 'Donation created');
}

// GET: list available donations (NGO role only)
$user = Middleware::requireRole(['ngo'], true);

$lat = Request::query('lat');
$lng = Request::query('lng');
$radiusKm = Request::query('radius_km');

$pdo = Database::pdo();
$now = date('Y-m-d H:i:s');

if ($lat !== null && $lng !== null && $radiusKm !== null) {
    if (!is_numeric($lat) || !is_numeric($lng) || !is_numeric($radiusKm)) {
        Response::error('Invalid lat/lng/radius_km', 400, 400);
    }
    $latF = (float) $lat;
    $lngF = (float) $lng;
    $radiusF = (float) $radiusKm;
    if ($radiusF <= 0 || $radiusF > 500) {
        Response::error('radius_km out of range', 400, 400);
    }

    $sql = '
        SELECT d.id, d.donor_id, u.name AS donor_name, u.phone AS donor_phone,
               d.food_type, d.quantity, d.unit, d.description,
               d.pickup_address, d.pickup_lat, d.pickup_lng,
               d.available_from, d.available_until, d.status, d.created_at,
               (6371 * ACOS(
                   COS(RADIANS(:lat)) * COS(RADIANS(d.pickup_lat)) * COS(RADIANS(d.pickup_lng) - RADIANS(:lng)) +
                   SIN(RADIANS(:lat)) * SIN(RADIANS(d.pickup_lat))
               )) AS distance_km
        FROM food_donations d
        JOIN users u ON u.id = d.donor_id
        WHERE d.status = \'available\'
          AND d.available_from <= :now
          AND d.available_until >= :now
          AND d.pickup_lat IS NOT NULL AND d.pickup_lng IS NOT NULL
        HAVING distance_km <= :radius
        ORDER BY distance_km ASC, d.created_at DESC
    ';
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':lat' => $latF,
        ':lng' => $lngF,
        ':now' => $now,
        ':radius' => $radiusF,
    ]);
} else {
    $stmt = $pdo->prepare('
        SELECT d.id, d.donor_id, u.name AS donor_name, u.phone AS donor_phone,
               d.food_type, d.quantity, d.unit, d.description,
               d.pickup_address, d.pickup_lat, d.pickup_lng,
               d.available_from, d.available_until, d.status, d.created_at
        FROM food_donations d
        JOIN users u ON u.id = d.donor_id
        WHERE d.status = \'available\'
          AND d.available_from <= ?
          AND d.available_until >= ?
        ORDER BY d.created_at DESC
    ');
    $stmt->execute([$now, $now]);
}

$donations = [];
while ($row = $stmt->fetch()) {
    $donations[] = [
        'id' => (int) $row['id'],
        'donor' => [
            'id' => (int) $row['donor_id'],
            'name' => (string) $row['donor_name'],
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
        'distance_km' => array_key_exists('distance_km', $row) ? (float) $row['distance_km'] : null,
    ];
}

Response::successData($donations);

