-- Add communication permissions to role 1 (Admin)
INSERT INTO role_permissions (role_id, permission) VALUES 
(1, 'communication.send'),
(1, 'communication.view'),
(1, 'communication.manage');

-- Verify the permissions were added
SELECT rp.*, r.name as role_name 
FROM role_permissions rp 
JOIN roles r ON rp.role_id = r.id 
WHERE rp.permission LIKE 'communication.%';