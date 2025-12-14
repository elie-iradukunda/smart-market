# Admin Setup Guide

This guide explains how to set up the enhanced admin system with 3 admin users and custom user permissions.

## Features

1. **3 Admin Users** - Pre-configured admin accounts with full privileges
2. **Custom User Permissions** - Ability to grant specific permissions to individual users beyond their role
3. **Global Dashboard** - Unified dashboard accessible to all users
4. **Enhanced RBAC** - Role-based + user-specific permission system

## Database Setup

### Step 1: Run Migrations

Run the migration scripts to create the necessary database tables:

```bash
cd backend
node scripts/run-admin-setup.js
```

This script will:
- Create the `user_permissions` table for custom permissions
- Add `is_super_admin` column to `users` table
- Create 3 admin users with full privileges
- Grant all permissions to the owner role

### Step 2: Verify Admin Users

After running the migration, you should have 3 admin users:

1. **System Administrator**
   - Email: `admin@topdesign.com`
   - Phone: `+250788000001`
   - Password: `Admin123!`

2. **Operations Admin**
   - Email: `ops.admin@topdesign.com`
   - Phone: `+250788000002`
   - Password: `Admin123!`

3. **IT Administrator**
   - Email: `it.admin@topdesign.com`
   - Phone: `+250788000003`
   - Password: `Admin123!`

**⚠️ IMPORTANT**: Change passwords after first login!

## Admin Capabilities

### 1. Create Roles
- Navigate to `/admin/roles`
- Click "Create Role"
- Assign permissions to the role

### 2. Assign Permissions to Roles
- Go to `/admin/roles/:id`
- Select permissions for the role
- Save changes

### 3. Add Users
- Navigate to `/admin/users`
- Click "New User"
- Fill in user details and assign a role

### 4. Custom User Permissions
- Go to `/admin/users/:id` (user detail page)
- Click "Manage Permissions"
- Select additional permissions for the user
- These permissions are granted in addition to role permissions

## Global Dashboard

All users can now access a unified dashboard at:
- `/dashboard` or `/dashboard/global`

The global dashboard shows:
- Today's sales
- Total revenue
- Outstanding invoices
- Open work orders
- Total orders
- Total customers
- Quick access to all modules

## API Endpoints

### User Permissions

- `GET /api/users/:user_id/permissions` - Get all permissions for a user (role + custom)
- `POST /api/users/:user_id/permissions` - Grant a single permission
- `POST /api/users/:user_id/permissions/bulk` - Grant multiple permissions
- `DELETE /api/users/:user_id/permissions/:permission_id` - Revoke a permission
- `DELETE /api/users/:user_id/permissions` - Revoke all custom permissions

## Permission System

The system now supports two types of permissions:

1. **Role Permissions** - Inherited from the user's role
2. **Custom Permissions** - Granted directly to the user

When checking permissions, the system:
1. Checks if user is super admin (has all access)
2. Checks role-based permissions
3. Checks custom user permissions
4. Grants access if any check passes

## Super Admin Flag

Users with `is_super_admin = TRUE` have:
- Full access to all features
- Ability to manage all users, roles, and permissions
- Bypass all permission checks

## Frontend Routes

- `/dashboard` - Global dashboard (default)
- `/dashboard/global` - Global dashboard
- `/admin/users` - User management
- `/admin/users/:id` - User details
- `/admin/users/:user_id/permissions` - Manage user permissions
- `/admin/roles` - Role management

## Troubleshooting

### Migration Fails

If the migration fails, check:
1. Database connection is working
2. MySQL user has CREATE TABLE and ALTER TABLE permissions
3. No conflicting table/column names exist

### Admin Users Can't Login

1. Verify users were created: `SELECT * FROM users WHERE email LIKE '%admin@topdesign.com'`
2. Check password hash is set
3. Verify `status = 'active'`
4. Check `role_id = 1` (owner role)

### Permissions Not Working

1. Verify `user_permissions` table exists
2. Check RBAC middleware is checking custom permissions
3. Verify user has `is_super_admin` flag if needed
4. Check permission codes match between frontend and backend

## Security Notes

- Always change default passwords after setup
- Use strong passwords for admin accounts
- Regularly audit user permissions
- Monitor admin user activity
- Consider implementing permission expiration dates

## Next Steps

1. Run the migration script
2. Login with one of the admin accounts
3. Change passwords
4. Create additional roles as needed
5. Assign permissions to users
6. Test the global dashboard

