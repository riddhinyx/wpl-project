<?php
declare(strict_types=1);

$user = Middleware::requireRole(['donor'], true);
$params = $GLOBALS['routeParams'] ?? [];
$id = isset($params['id']) ? (int) $params['id'] : 0;
if ($id <= 0) {
    Response::error('Invalid donation id', 400, 400);
}

$pdo = Database::pdo();
$stmt = $pdo->prepare('SELECT * FROM food_donations WHERE id = ? LIMIT 1');
$stmt->execute([$id]);
$donation = $stmt->fetch();
if (!is_array($donation)) {
    Response::error('Donation not found', 404, 404);
}
if ((int) $donation['donor_id'] !== (int) $user['id']) {
    Response::error('Forbidden', 403, 403);
}

$method = Request::method();

if ($method === 'DELETE') {
    // Cancel donation: delete record (will cascade pickup_requests).
    $stmt = $pdo->prepare('DELETE FROM food_donations WHERE id = ?');
    $stmt->execute([$id]);
    Response::success([], 'Donation cancelled');
}

if ($method !== 'PUT') {
    Response::error('Method not allowed', 405, 405);
}

if ((string) $donation['status'] !== 'available') {
    Response::error('Only available donations can be edited', 400, 400);
}

$input = Request::jsonBody();

$fields = [];
$values = [];
$availableFromNew = (string) $donation['available_from'];
$availableUntilNew = (string) $donation['available_until'];

if (array_key_exists('food_type', $input)) {
    $fields[] = 'food_type = ?';
    $values[] = Validator::requireString($input, 'food_type', 2, 120);
}
if (array_key_exists('quantity', $input)) {
    $q = Validator::requireFloat($input, 'quantity');
    if ($q <= 0) {
        Response::error('Quantity must be greater than 0', 400, 400);
    }
    $fields[] = 'quantity = ?';
    $values[] = $q;
}
if (array_key_exists('unit', $input)) {
    $fields[] = 'unit = ?';
    $values[] = Validator::requireString($input, 'unit', 1, 16);
}
if (array_key_exists('description', $input)) {
    $fields[] = 'description = ?';
    $values[] = Validator::optionalString($input, 'description', 5000);
}
if (array_key_exists('pickup_address', $input)) {
    $fields[] = 'pickup_address = ?';
    $values[] = Validator::requireString($input, 'pickup_address', 5, 255);
}
if (array_key_exists('pickup_lat', $input)) {
    $lat = Validator::optionalFloat($input, 'pickup_lat');
    if ($lat !== null && ($lat < -90 || $lat > 90)) {
        Response::error('Invalid pickup_lat', 400, 400);
    }
    $fields[] = 'pickup_lat = ?';
    $values[] = $lat;
}
if (array_key_exists('pickup_lng', $input)) {
    $lng = Validator::optionalFloat($input, 'pickup_lng');
    if ($lng !== null && ($lng < -180 || $lng > 180)) {
        Response::error('Invalid pickup_lng', 400, 400);
    }
    $fields[] = 'pickup_lng = ?';
    $values[] = $lng;
}
if (array_key_exists('available_from', $input)) {
    $availableFromNew = Validator::requireDateTime($input, 'available_from');
    $fields[] = 'available_from = ?';
    $values[] = $availableFromNew;
}
if (array_key_exists('available_until', $input)) {
    $availableUntilNew = Validator::requireDateTime($input, 'available_until');
    $fields[] = 'available_until = ?';
    $values[] = $availableUntilNew;
}

if (count($fields) === 0) {
    Response::error('No fields to update', 400, 400);
}

if (strtotime($availableUntilNew) <= strtotime($availableFromNew)) {
    Response::error('available_until must be after available_from', 400, 400);
}

$values[] = $id;
$sql = 'UPDATE food_donations SET ' . implode(', ', $fields) . ' WHERE id = ?';
$stmt = $pdo->prepare($sql);
$stmt->execute($values);

Response::success([], 'Donation updated');
