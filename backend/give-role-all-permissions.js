import pool from './src/config/database.js';

async function giveRoleAllPermissions() {
  try {
    const roleId = 1; // Change this to the role ID you want to give all permissions
    
    // Check if role exists
    const [role] = await pool.execute('SELECT id FROM roles WHERE id = ?', [roleId]);
    if (role.length === 0) {
      console.log(`Role ${roleId} does not exist`);
      process.exit(1);
    }
    
    // Delete existing permissions for this role
    await pool.execute('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);
    console.log(`Cleared existing permissions for role ${roleId}`);

    // Give role ALL permissions
    await pool.execute(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT ?, id FROM permissions
    `, [roleId]);
    console.log(`Role ${roleId} now has ALL permissions`);

    // Verify permissions
    const [permissions] = await pool.execute(`
      SELECT COUNT(*) as total_permissions FROM permissions
    `);
    
    const [rolePermissions] = await pool.execute(`
      SELECT COUNT(*) as role_permissions FROM role_permissions WHERE role_id = ?
    `, [roleId]);

    console.log(`Total permissions in system: ${permissions[0].total_permissions}`);
    console.log(`Role ${roleId} permissions assigned: ${rolePermissions[0].role_permissions}`);
    
    if (permissions[0].total_permissions === rolePermissions[0].role_permissions) {
      console.log(`✅ SUCCESS: Role ${roleId} has ALL permissions!`);
    } else {
      console.log(`❌ ERROR: Role ${roleId} does not have all permissions`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

giveRoleAllPermissions();