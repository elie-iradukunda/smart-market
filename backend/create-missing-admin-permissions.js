import pool from './src/config/database.js';

async function createMissingAdminPermissions() {
  try {
    const missingPermissions = [
      { code: 'user.view', description: 'View users' },
      { code: 'material.create', description: 'Create materials' },
      { code: 'po.create', description: 'Create purchase orders' },
      { code: 'po.view', description: 'View purchase orders' },
      { code: 'po.approve', description: 'Approve purchase orders' },
    ];
    
    console.log('📝 Creating missing permissions...\n');
    
    let createdCount = 0;
    let existingCount = 0;
    
    for (const perm of missingPermissions) {
      // Check if permission already exists
      const [existing] = await pool.execute(
        'SELECT id FROM permissions WHERE code = ?',
        [perm.code]
      );
      
      if (existing.length > 0) {
        console.log(`  ⏭️  Already exists: ${perm.code}`);
        existingCount++;
      } else {
        await pool.execute(
          'INSERT INTO permissions (code, description) VALUES (?, ?)',
          [perm.code, perm.description]
        );
        console.log(`  ✅ Created: ${perm.code}`);
        createdCount++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Created: ${createdCount} permissions`);
    console.log(`   Already existed: ${existingCount} permissions`);
    console.log(`\n✅ All required permissions are now in the database!`);
    console.log(`\n💡 Next step: Run 'node update-admin-permissions.js' to assign them to the Admin role.`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createMissingAdminPermissions();
