<?php
declare(strict_types=1);

$input = Request::jsonBody();

$name = Validator::requireString($input, 'name', 2, 120);
$email = Validator::email($input, 'email');
$password = Validator::password($input, 'password');
$role = Validator::enum($input, 'role', ['donor', 'ngo', 'admin']);
$phone = Validator::phone($input, 'phone');
$address = Validator::optionalString($input, 'address', 255);
$lat = Validator::optionalFloat($input, 'lat');
$lng = Validator::optionalFloat($input, 'lng');

if ($role === 'admin') {
    Response::error('Admin accounts cannot be self-registered', 403, 403);
}

if ($lat !== null && ($lat < -90 || $lat > 90)) {
    Response::error('Invalid latitude', 400, 400);
}
if ($lng !== null && ($lng < -180 || $lng > 180)) {
    Response::error('Invalid longitude', 400, 400);
}

$pdo = Database::pdo();
$stmt = $pdo->prepare('INSERT INTO users (name, email, password_hash, role, phone, address, lat, lng, is_verified, is_active, token_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1, 0)');
$hash = password_hash($password, PASSWORD_BCRYPT);

try {
    $stmt->execute([$name, $email, $hash, $role, $phone, $address, $lat, $lng]);
} catch (PDOException $e) {
    if (($e->errorInfo[1] ?? null) === 1062) {
        Response::error('Email already in use', 409, 409);
    }
    throw $e;
}

$userId = (int) $pdo->lastInsertId();

Response::successData([
    'id' => $userId,
    'name' => $name,
    'email' => $email,
    'role' => $role,
    'phone' => $phone,
    'address' => $address,
    'is_verified' => 0,
], 'Registered successfully');

