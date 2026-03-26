-- WPL Food Redistribution Platform - MySQL 8.0+ schema
-- Charset/collation chosen for full Unicode support.

CREATE DATABASE IF NOT EXISTS wpl_food_platform
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE wpl_food_platform;

-- Users: 3 roles as required by the current frontend: donor, ngo, admin
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('donor','ngo','admin') NOT NULL,
  phone VARCHAR(32) NOT NULL,
  address VARCHAR(255) NULL,
  lat DECIMAL(10,7) NULL,
  lng DECIMAL(10,7) NULL,
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  token_version INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role_verified_active (role, is_verified, is_active),
  KEY idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS food_donations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donor_id BIGINT UNSIGNED NOT NULL,
  food_type VARCHAR(120) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(16) NOT NULL,
  description TEXT NULL,
  pickup_address VARCHAR(255) NOT NULL,
  pickup_lat DECIMAL(10,7) NULL,
  pickup_lng DECIMAL(10,7) NULL,
  available_from DATETIME NOT NULL,
  available_until DATETIME NOT NULL,
  status ENUM('available','pending_pickup','collected','distributed','expired') NOT NULL DEFAULT 'available',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_donations_donor (donor_id, created_at),
  KEY idx_donations_status_until (status, available_until),
  CONSTRAINT fk_donations_donor
    FOREIGN KEY (donor_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pickup_requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donation_id BIGINT UNSIGNED NOT NULL,
  requester_id BIGINT UNSIGNED NOT NULL,
  requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending','accepted','rejected','completed') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (id),
  UNIQUE KEY uq_pickup_request_once (donation_id, requester_id),
  KEY idx_pickup_donation_status (donation_id, status),
  KEY idx_pickup_requester (requester_id, requested_at),
  CONSTRAINT fk_pickup_donation
    FOREIGN KEY (donation_id) REFERENCES food_donations(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pickup_requester
    FOREIGN KEY (requester_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  message VARCHAR(500) NOT NULL,
  type VARCHAR(40) NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user_read (user_id, is_read, created_at),
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS distribution_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pickup_request_id BIGINT UNSIGNED NOT NULL,
  distributed_by BIGINT UNSIGNED NOT NULL,
  distributed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  beneficiary_count INT UNSIGNED NOT NULL,
  notes TEXT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_distribution_one_log (pickup_request_id),
  KEY idx_distribution_by_time (distributed_by, distributed_at),
  CONSTRAINT fk_distribution_pickup
    FOREIGN KEY (pickup_request_id) REFERENCES pickup_requests(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_distribution_by
    FOREIGN KEY (distributed_by) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

