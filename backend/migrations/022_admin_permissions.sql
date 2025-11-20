-- 022_admin_permissions.sql
-- Ensure owner and sys_admin have full access for Admin dashboard nav items
-- Run this after 001_create_tables.sql, 010_seed_roles_permissions_users.sql and 021_fix_report_and_marketing_permissions.sql

/* 1. Ensure all permission codes used by admin nav / widgets exist */

INSERT IGNORE INTO permissions (code, description) VALUES
  ('user.view',          'View user accounts'),
  ('user.manage',        'Create and manage user accounts'),
  ('role.manage',        'Create and manage roles and permissions'),
  ('audit.view',         'View audit logs'),
  ('settings.manage',    'Manage system-wide settings'),
  ('report.view',        'View financial and operational reports'),
  ('campaign.view',      'View marketing campaigns'),
  ('campaign.create',    'Create marketing campaigns'),
  ('campaign.update',    'Update marketing campaigns'),
  ('ai.view',            'View AI predictions and insights');

/* 2. OWNER: ensure owner truly has ALL permissions (including any created later) */

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON 1=1
WHERE r.name = 'owner';

/* 3. SYS_ADMIN: grant all admin-related permissions explicitly */

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'user.view',
  'user.manage',
  'role.manage',
  'audit.view',
  'settings.manage',
  'report.view',
  'campaign.view',
  'campaign.create',
  'campaign.update',
  'ai.view'
)
WHERE r.name = 'sys_admin';
