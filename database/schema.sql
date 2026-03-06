-- ============================================================
-- PostPal Database Schema
-- Compatible with phpMyAdmin / MySQL
-- ============================================================

CREATE DATABASE IF NOT EXISTS postpal_db;
USE postpal_db;

-- ============================================================
-- USERS TABLE
-- Stores registered user accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  profile_picture VARCHAR(255) DEFAULT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- POSTS TABLE
-- Stores all community posts
-- author_type: 'user' or 'admin'
-- status: PENDING (user posts) or APPROVED (admin posts)
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  author_type ENUM('user', 'admin') DEFAULT 'user',
  is_anonymous TINYINT(1) DEFAULT 0,
  topic VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  image_path VARCHAR(255) DEFAULT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  rejection_reason VARCHAR(255) DEFAULT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- POST LIKES TABLE
-- Tracks which users liked which posts (prevents duplicate likes)
-- ============================================================
CREATE TABLE IF NOT EXISTS post_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_like (post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- COMMENTS TABLE
-- Stores comments on posts
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- REPORTS TABLE
-- Users can report posts for moderation
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  reason ENUM('Spam', 'Harassment', 'Misinformation', 'Other') NOT NULL,
  details TEXT DEFAULT NULL,
  status ENUM('PENDING', 'DISMISSED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- SAMPLE ADMIN USER
-- Default admin: admin@postpal.com / password: admin123
-- ============================================================
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@postpal.com', '$2b$10$FFFL.Ir203odf3FsI.a7SOyPnvoLPB5wpC0SeGhGKfLHMhQ50zz6i', 'admin')
ON DUPLICATE KEY UPDATE password_hash = '$2b$10$FFFL.Ir203odf3FsI.a7SOyPnvoLPB5wpC0SeGhGKfLHMhQ50zz6i', role = 'admin';
