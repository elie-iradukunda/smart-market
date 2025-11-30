import pool from './src/config/database.js';

async function createMissingPermissions() {
  try {
    const missingPermissions = [
      { code: 'customer.create', description: 'Create new customers' },
      { code: 'customer.update', description: 'Update existing customers' },
      { code: 'lead.create', description: 'Create new leads' },
      { code: 'lead.view', description: 'View leads' },
      { code: 'quote.create', description: 'Create new quotes' },
      { code: 'order.create', description: 'Create new orders' },
      { code: 'message.create', description: 'Create/send messages' },
      { code: 'message.view', description: 'View messages' },
      { code: 'pos.view', description: 'View POS sales history' },
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
    console.log(`\n💡 Next step: Run 'node update-receptionist-permissions.js' to assign them to the Receptionist role.`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createMissingPermissions();
