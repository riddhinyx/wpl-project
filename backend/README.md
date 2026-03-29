# WPL Food Redistribution Platform — PHP Backend

Pure PHP 8.2+ JSON API backend (JWT auth) for the `frontend/` app. Roles supported: `donor`, `ngo`, `admin`.

## Setup

1. Create a MySQL database and tables:
   - Import `schema.sql` into MySQL 8.0+
2. Configure environment variables (recommended: `backend/.env`).
3. Point your web server document root to this repo (or the folder containing `.htaccess`).

## Environment variables

This backend supports a local dotenv file at `backend/.env` (loaded automatically by `backend/core/bootstrap.php`).
Copy `backend/.env.example` to `backend/.env` and edit values.

- `APP_ENV` = `development` | `production`
- `APP_TIMEZONE` = `Asia/Kolkata`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_CHARSET`
- `JWT_SECRET` (set a strong random value in production)
- `JWT_ISSUER`
- `JWT_TTL_SECONDS`
- `CORS_ALLOWED_ORIGINS` (comma-separated) or `*`
- `NOTIFY_RADIUS_KM` (default `20`)

## Auth

- JWT is returned by `POST /api/auth/login` and must be sent as `Authorization: Bearer <token>` on protected endpoints.
- `POST /api/auth/logout` revokes the current token by incrementing `users.token_version`.

Admin accounts cannot be self-registered (`POST /api/auth/register` rejects `role=admin`). Create an admin user directly in DB (insert into `users` with `role='admin'` and a bcrypt `password_hash`).

## Cron

Expire donations past `available_until`:

- `php cron/expire_donations.php`

Run it every few minutes via cron:

- `*/5 * * * * /usr/bin/php /path/to/project/cron/expire_donations.php`

## API examples (curl)

### Auth

- Register:
  - `curl -s -X POST http://localhost/api/auth/register -H 'Content-Type: application/json' -d '{"name":"Donor One","email":"donor@example.com","password":"password123","role":"donor","phone":"+91 99999 00000","address":"Pune"}'`
- Login:
  - `curl -s -X POST http://localhost/api/auth/login -H 'Content-Type: application/json' -d '{"email":"donor@example.com","password":"password123","role":"donor"}'`
- Me:
  - `curl -s http://localhost/api/auth/me -H 'Authorization: Bearer TOKEN'`

### Donor

- Create donation:
  - `curl -s -X POST http://localhost/api/donations -H 'Authorization: Bearer TOKEN' -H 'Content-Type: application/json' -d '{"food_type":"Rice","quantity":10,"unit":"kg","pickup_address":"123 Street","pickup_lat":18.5204,"pickup_lng":73.8567,"available_from":"2026-03-27 10:00:00","available_until":"2026-03-27 15:00:00"}'`
- My donations:
  - `curl -s http://localhost/api/donations/my -H 'Authorization: Bearer TOKEN'`
- Update donation (only `available`):
  - `curl -s -X PUT http://localhost/api/donations/1 -H 'Authorization: Bearer TOKEN' -H 'Content-Type: application/json' -d '{"quantity":12}'`
- Cancel donation:
  - `curl -s -X DELETE http://localhost/api/donations/1 -H 'Authorization: Bearer TOKEN'`

### NGO

- List available (optionally with proximity):
  - `curl -s 'http://localhost/api/donations/available?lat=18.52&lng=73.85&radius_km=20' -H 'Authorization: Bearer TOKEN'`
- Accept pickup:
  - `curl -s -X POST http://localhost/api/pickups -H 'Authorization: Bearer TOKEN' -H 'Content-Type: application/json' -d '{"donation_id":1}'`
- My pickups:
  - `curl -s http://localhost/api/pickups/my -H 'Authorization: Bearer TOKEN'`
- Complete + log distribution:
  - `curl -s -X PUT http://localhost/api/pickups/1/complete -H 'Authorization: Bearer TOKEN' -H 'Content-Type: application/json' -d '{"beneficiary_count":25,"notes":"Delivered to community kitchen"}'`

### Admin

- List users:
  - `curl -s 'http://localhost/api/admin/users?role=ngo' -H 'Authorization: Bearer TOKEN'`
- Verify user:
  - `curl -s -X PUT http://localhost/api/admin/users/2/verify -H 'Authorization: Bearer TOKEN'`
- Deactivate user:
  - `curl -s -X DELETE http://localhost/api/admin/users/2 -H 'Authorization: Bearer TOKEN'`
- Donations:
  - `curl -s http://localhost/api/admin/donations -H 'Authorization: Bearer TOKEN'`
- Stats:
  - `curl -s http://localhost/api/admin/stats -H 'Authorization: Bearer TOKEN'`

### Notifications

- List:
  - `curl -s http://localhost/api/notifications -H 'Authorization: Bearer TOKEN'`
- Mark as read:
  - `curl -s -X PUT http://localhost/api/notifications/1/read -H 'Authorization: Bearer TOKEN'`

## Response format

Success:

```json
{ "success": true, "data": {}, "message": "" }
```

Error:

```json
{ "success": false, "error": "message", "code": 400 }
```
Updated by Riddhi - tested backend integration