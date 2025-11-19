import pool from './src/config/database.js';

async function giveAdminAllPermissions() {
  try {
    // Delete existing permissions for role 1 (Admin)
    await pool.execute('DELETE FROM role_permissions WHERE role_id = 1');
    console.log('Cleared existing admin permissions');

    // Give Admin (role_id = 1) ALL permissions
    await pool.execute(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT 1, id FROM permissions
    `);
    console.log('Admin now has ALL permissions');

    // Verify permissions
    const [permissions] = await pool.execute(`
      SELECT COUNT(*) as total_permissions FROM permissions
    `);
    
    const [adminPermissions] = await pool.execute(`
      SELECT COUNT(*) as admin_permissions FROM role_permissions WHERE role_id = 1
    `);

    console.log(`Total permissions in system: ${permissions[0].total_permissions}`);
    console.log(`Admin permissions assigned: ${adminPermissions[0].admin_permissions}`);
    
    if (permissions[0].total_permissions === adminPermissions[0].admin_permissions) {
      console.log('✅ SUCCESS: Admin has ALL permissions!');
    } else {
      console.log('❌ ERROR: Admin does not have all permissions');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

giveAdminAllPermissions();