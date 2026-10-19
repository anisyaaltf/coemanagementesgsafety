-- Schema untuk ESG Calendar of Event System (Database MySQL: coe)

CREATE DATABASE IF NOT EXISTS `coe`;
USE `coe`;

DROP TABLE IF EXISTS `event_pics`;
DROP TABLE IF EXISTS `event_histories`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `pics`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `nrp` VARCHAR(50) UNIQUE NULL,
  `no_wa` VARCHAR(20) NULL,
  `email` VARCHAR(100) UNIQUE NOT NULL,
  `email_verified_at` TIMESTAMP NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) DEFAULT 'user',
  `remember_token` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `pics` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `no_telp` VARCHAR(20) NULL,
  `status` ENUM('Active', 'Inactive') DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `events` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `judul` VARCHAR(255) NOT NULL,
  `tanggal_mulai` DATE NOT NULL,
  `tanggal_selesai` DATE NOT NULL,
  `waktu_mulai` TIME NULL,
  `waktu_selesai` TIME NULL,
  `lokasi` VARCHAR(255) NULL,
  `deskripsi` TEXT NULL,
  `status` ENUM('new', 'updated', 'pending', 'completed') DEFAULT 'new',
  `priority` ENUM('priority', 'standard') DEFAULT 'standard',
  `dibuat_oleh` VARCHAR(100) NULL,
  `diperbarui_oleh` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Pivot untuk M:N (Event <-> PIC)
CREATE TABLE `event_pics` (
  `event_id` BIGINT NOT NULL,
  `pic_id` BIGINT NOT NULL,
  PRIMARY KEY (`event_id`, `pic_id`),
  FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`pic_id`) REFERENCES `pics`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel untuk History Log Event
CREATE TABLE `event_histories` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `event_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `perubahan` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data Dummy Awal
INSERT INTO `users` (`id`, `name`, `nrp`, `no_wa`, `email`, `password`, `role`) VALUES 
(1, 'Admin Safety', '12345678', '081234567890', 'admin@safety.local', '$2y$12$Rr+wGIh0F60VvUj3WTXlDk0l0tV+SFfH5tTugVCkNEM=', 'admin');

INSERT INTO `pics` (`id`, `nama`, `email`, `no_telp`, `status`) VALUES 
(1, 'Citra', 'citra@safety.local', '08123456789', 'Active'),
(2, 'Andi', 'andi@safety.local', '08111222333', 'Active'),
(3, 'Budi', 'budi@safety.local', '08999888777', 'Active'),
(4, 'Deni', 'deni@safety.local', '081333444555', 'Active');

INSERT INTO `events` (`id`, `judul`, `tanggal_mulai`, `tanggal_selesai`, `waktu_mulai`, `waktu_selesai`, `lokasi`, `deskripsi`, `status`, `priority`, `dibuat_oleh`) VALUES 
(1, 'Safety Patrol Area Casting', '2026-09-02', '2026-09-02', '13:00:00', '15:00:00', 'Area Casting', 'Inspeksi rutin harian di area casting.', 'new', 'priority', 'Admin Safety'),
(2, 'Safety Meeting Bulanan', '2026-09-03', '2026-09-03', '08:00:00', '10:00:00', 'Meeting Room 2', 'Meeting bulanan HSE.', 'updated', 'priority', 'Admin Safety'),
(3, 'Training K3 Karyawan Baru', '2026-09-03', '2026-09-03', '09:00:00', '12:00:00', 'Training Center', 'Training K3 untuk karyawan baru.', 'pending', 'standard', 'Admin Safety');

INSERT INTO `event_pics` (`event_id`, `pic_id`) VALUES 
(1, 1),
(2, 2),
(2, 3),
(3, 4);

