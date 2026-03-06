-- ============================================================
-- FIX ADMIN PASSWORD
-- Run this in phpMyAdmin if you already imported schema.sql
-- This updates the admin account with the correct bcrypt hash
-- Password: admin123
-- ============================================================

UPDATE users
SET password_hash = '$2b$10$FFFL.Ir203odf3FsI.a7SOyPnvoLPB5wpC0SeGhGKfLHMhQ50zz6i',
    role = 'admin'
WHERE email = 'admin@postpal.com';

-- If admin user doesn't exist yet, insert it:
INSERT INTO users (username, email, password_hash, role)
SELECT 'admin', 'admin@postpal.com', '$2b$10$FFFL.Ir203odf3FsI.a7SOyPnvoLPB5wpC0SeGhGKfLHMhQ50zz6i', 'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@postpal.com'
);
