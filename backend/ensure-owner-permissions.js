/**
 * Ensure Owner Role Has All Permissions
 * 
 * This script ensures the Owner role (role_id: 1) has all permissions
 * including user.manage for user management functionality.
 * 
 * Run: node backend/ensure-owner-permissions.js
 */

import pool from './src/config/database.js';

async function ensureOwnerPermissions() {
  let connection;
  
  try {
    connection = await pool.getConnection();
    console.log('✅ Connected to database');
    
    // Get all permissions from database
    const [permissions] = await connection.execute(
      'SELECT id, code FROM permissions ORDER BY id'
    );
    
    console.log(`📋 Found ${permissions.length} permissions in database`);
    
    // Check if Owner role exists
    const [roles] = await connection.execute(
      'SELECT id, name FROM roles WHERE id = 1'
    );
    
    if (roles.length === 0) {
      console.error('❌ Owner role (ID: 1) not found!');
      return;
    }
    
    console.log(`👑 Owner role found: ${roles[0].name} (ID: ${roles[0].id})\n`);
    
    // Get current permissions for Owner
    const [currentPerms] = await connection.execute(
      `SELECT p.id, p.code FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = 1
       ORDER BY p.code`
    );
    
    console.log(`📊 Owner currently has ${currentPerms.length} permissions`);
    
    // Grant all permissions to Owner
    let addedCount = 0;
    let existingCount = 0;
    
    for (const perm of permissions) {
      // Check if permission already exists
      const [existing] = await connection.execute(
        'SELECT role_id FROM role_permissions WHERE role_id = 1 AND permission_id = ?',
        [perm.id]
      );
      
      if (existing.length === 0) {
        await connection.execute(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES (1, ?)',
          [perm.id]
        );
        addedCount++;
        console.log(`   ✅ Added: ${perm.code}`);
      } else {
        existingCount++;
      }
    }
    
    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Added ${addedCount} new permissions`);
    console.log(`   📋 Already had ${existingCount} permissions`);
    console.log(`   📊 Total permissions: ${permissions.length}`);
    
    // Verify user.manage permission specifically
    const [userManageCheck] = await connection.execute(
      `SELECT p.code FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = 1 AND p.code = 'user.manage'`
    );
    
    if (userManageCheck.length > 0) {
      console.log(`\n✅ Owner has user.manage permission - User management enabled!`);
    } else {
      console.log(`\n⚠️  WARNING: Owner does NOT have user.manage permission!`);
    }
    
    // Final verification - list all permissions
    const [finalPerms] = await connection.execute(
      `SELECT p.code FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = 1
       ORDER BY p.code`
    );
    
    console.log(`\n📋 Owner's complete permission list (${finalPerms.length} permissions):`);
    finalPerms.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.code}`);
    });
    
    console.log('\n✅ Owner permissions updated successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Owner user should log out and log back in to refresh JWT token');
    console.log('   2. Test user management functionality');
    
  } catch (error) {
    console.error('❌ Error ensuring owner permissions:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
    await pool.end();
  }
}

// Run the script
ensureOwnerPermissions()
  .then(() => {
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });

