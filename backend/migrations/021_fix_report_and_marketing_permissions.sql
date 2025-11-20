-- 021_fix_report_and_marketing_permissions.sql
-- Ensure sys_admin (and marketing_manager) can access reports, campaigns, and AI
-- Run this after 001_create_tables.sql and 010_seed_roles_permissions_users.sql

/* 1. Ensure permissions used by routes exist */

INSERT IGNORE INTO permissions (code, description) VALUES
  ('report.view',        'View financial and operational reports'),
  ('campaign.view',      'View marketing campaigns'),
  ('campaign.create',    'Create marketing campaigns'),
  ('campaign.update',    'Update marketing campaigns'),
  ('ai.view',            'View AI predictions and insights');

/* 2. Grant report / campaign / AI permissions to sys_admin */

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'report.view',
  'campaign.view',
  'campaign.create',
  'campaign.update',
  'ai.view'
)
WHERE r.name = 'sys_admin';

/* 3. Ensure marketing_manager has full campaign + AI access (view/create/update + reports) */

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'campaign.view',
  'campaign.create',
  'campaign.update',
  'adperformance.view',
  'lead.manage',
  'report.view',
  'ai.view'
)
WHERE r.name = 'marketing_manager';
