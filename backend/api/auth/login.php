<?php
declare(strict_types=1);

$input = Request::jsonBody();
$email = Validator::email($input, 'email');
$password = Validator::password($input, 'password');
$role = Validator::enum($input, 'role', ['donor', 'ngo', 'admin']);

$pdo = Database::pdo();
$stmt = $pdo->prepare('SELECT id, name, email, password_hash, role, phone, address, lat, lng, is_verified, is_active, token_version, created_at FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();
if (!is_array($user)) {
    Response::error('Invalid credentials', 401, 401);
}
if ((int) $user['is_active'] !== 1) {
    Response::error('Account deactivated', 403, 403);
}
if ((string) $user['role'] !== $role) {
    Response::error('Role mismatch', 403, 403);
}
if (!password_verify($password, (string) $user['password_hash'])) {
    Response::error('Invalid credentials', 401, 401);
}

$token = Auth::issueToken($user);

Response::successData([
    'token' => $token,
    'user' => [
        'id' => (int) $user['id'],
        'name' => (string) $user['name'],
        'email' => (string) $user['email'],
        'role' => (string) $user['role'],
        'phone' => (string) $user['phone'],
        'address' => $user['address'],
        'lat' => $user['lat'] !== null ? (float) $user['lat'] : null,
        'lng' => $user['lng'] !== null ? (float) $user['lng'] : null,
        'is_verified' => (int) $user['is_verified'],
        'created_at' => (string) $user['created_at'],
    ],
], 'Logged in');

