<?php
declare(strict_types=1);

$admin = Middleware::requireRole(['admin'], false);
$pdo = Database::pdo();
$method = Request::method();
$params = $GLOBALS['routeParams'] ?? [];

if ($method === 'GET') {
    $role = Request::query('role');
    $sql = 'SELECT id, name, email, role, phone, address, lat, lng, is_verified, is_active, created_at FROM users';
    $bind = [];
    if ($role !== null) {
        if (!in_array($role, ['donor', 'ngo', 'admin'], true)) {
            Response::error('Invalid role filter', 400, 400);
        }
        $sql .= ' WHERE role = ?';
        $bind[] = $role;
    }
    $sql .= ' ORDER BY created_at DESC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($bind);

    $users = [];
    while ($row = $stmt->fetch()) {
        $users[] = [
            'id' => (int) $row['id'],
            'name' => (string) $row['name'],
            'email' => (string) $row['email'],
            'role' => (string) $row['role'],
            'phone' => (string) $row['phone'],
            'address' => $row['address'],
            'lat' => $row['lat'] !== null ? (float) $row['lat'] : null,
            'lng' => $row['lng'] !== null ? (float) $row['lng'] : null,
            'is_verified' => (int) $row['is_verified'],
            'is_active' => (int) $row['is_active'],
            'created_at' => (string) $row['created_at'],
        ];
    }

    Response::successData($users);
}

if ($method === 'PUT') {
    $id = isset($params['id']) ? (int) $params['id'] : 0;
    if ($id <= 0) {
        Response::error('Invalid user id', 400, 400);
    }
    $stmt = $pdo->prepare('UPDATE users SET is_verified = 1 WHERE id = ?');
    $stmt->execute([$id]);
    Response::success([], 'User verified');
}

if ($method === 'DELETE') {
    $id = isset($params['id']) ? (int) $params['id'] : 0;
    if ($id <= 0) {
        Response::error('Invalid user id', 400, 400);
    }
    $stmt = $pdo->prepare('UPDATE users SET is_active = 0, token_version = token_version + 1 WHERE id = ?');
    $stmt->execute([$id]);
    Response::success([], 'User deactivated');
}

Response::error('Method not allowed', 405, 405);

