INSERT IGNORE INTO roles (id, name, description) VALUES 
(1, 'owner', 'System owner with complete access and all privileges');

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;
