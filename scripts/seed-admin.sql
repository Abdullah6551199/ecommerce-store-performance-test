-- Seed Initial Admin User
-- Email: admin@example.com
-- Password: admin123
INSERT INTO users (id, email, password_hash, role, created_at)
VALUES ('admin-init-user', 'admin@example.com', '$2b$10$ObV9nwqz.wYdS.Hmck6J.eeeIbGm1jfR8Cu7WsVksjJKSwgfyH6kC', 'admin', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO UPDATE SET password_hash = excluded.password_hash;
