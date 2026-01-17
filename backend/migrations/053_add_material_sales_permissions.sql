-- Migration: Add Material Sales Permissions
-- Adds permissions for material sales feature

-- Insert new permissions for material sales
INSERT IGNORE INTO permissions (code, description) VALUES
('material.sell', 'Record material sales'),
('material.manage', 'Manage material settings including pricing');

-- Assign material.sell permission to roles that should be able to record sales
-- Receptionist (role_id 5), Sales Rep (role_id 9), POS Cashier (role_id 11)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 5, id FROM permissions WHERE code = 'material.sell'
UNION ALL
SELECT 9, id FROM permissions WHERE code = 'material.sell'
UNION ALL
SELECT 11, id FROM permissions WHERE code = 'material.sell';

-- Assign material.manage permission to Admin roles (Owner role_id 1, Sys Admin role_id 2)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions WHERE code = 'material.manage'
UNION ALL
SELECT 2, id FROM permissions WHERE code = 'material.manage';

-- Also allow Inventory Manager (role_id 8) to manage materials
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 8, id FROM permissions WHERE code = 'material.manage';

