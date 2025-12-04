/**
 * Comprehensive Role Permission Fix Script
 * 
 * This script ensures all roles have the necessary permissions to avoid
 * "insufficient permissions" errors throughout the application.
 * 
 * Run: node backend/fix-all-role-permissions.js
 */

import pool from './src/config/database.js';

// Define comprehensive permissions for each role
const ROLE_PERMISSIONS = {
  1: ['*'], // Owner - has all permissions (handled separately)
  
  2: [ // Sys Admin
    'user.manage',
    'role.manage',
    'audit.view',
    'settings.manage',
    'report.view',
    'customer.view',
    'order.view',
    'invoice.view',
    'payment.view',
  ],
  
  3: [ // Accountant
    'invoice.create',
    'invoice.view',
    'invoice.send',
    'payment.create',
    'payment.view',
    'payment.refund',
    'journal.create',
    'journal.view',
    'pos.create',
    'pos.view',
    'report.view',
    'customer.view',
    'order.view',
    'supplier.view',
  ],
  
  4: [ // Controller
    'order.view',
    'order.update',
    'inventory.manage',
    'material.view',
    'material.create',
    'supplier.view',
    'report.view',
    'ai.view',
    'workorder.view',
    'customer.view',
  ],
  
  5: [ // Reception
    'customer.create',
    'customer.view',
    'customer.manage',
    'lead.create',
    'lead.view',
    'lead.manage',
    'quote.create',
    'quote.view',
    'quote.manage',
    'quote.approve',
    'order.view',
    'order.create',
    'pos.create',
    'pos.view',
    'material.view',
    'file.upload',
    'file.view',
    'invoice.view',
    'payment.view',
  ],
  
  6: [ // Technician
    'worklog.create',
    'workorder.view',
    'workorder.update',
    'order.view',
    'order.update',
    'material.view',
    'file.view',
  ],
  
  7: [ // Production Manager
    'workorder.view',
    'workorder.create',
    'workorder.update',
    'worklog.create',
    'order.view',
    'order.update',
    'material.view',
    'material.create',
    'supplier.view',
    'inventory.manage',
    'report.view',
    'file.view',
    'customer.view',
  ],
  
  8: [ // Inventory Manager
    'inventory.manage',
    'material.view',
    'material.create',
    'material.update',
    'stock.move',
    'stock.adjust',
    'po.create',
    'po.view',
    'po.approve',
    'supplier.view',
    'supplier.create',
    'report.view',
    'order.view',
  ],
  
  9: [ // Sales Rep
    'customer.manage',
    'customer.view',
    'customer.create',
    'lead.manage',
    'lead.view',
    'lead.create',
    'quote.manage',
    'quote.view',
    'quote.create',
    'quote.approve',
    'order.view',
    'order.create',
    'pos.create',
    'pos.view',
    'report.view',
    'file.upload',
    'file.view',
    'invoice.view',
    'payment.view',
  ],
  
  10: [ // Marketing Manager
    'campaign.view',
    'campaign.create',
    'campaign.update',
    'campaign.manage',
    'ad.create',
    'ad.view',
    'ad.edit',
    'ad.delete',
    'marketing.analytics',
    'lead.view',
    'lead.manage',
    'report.view',
    'ai.view',
    'customer.view',
  ],
  
  11: [ // POS Cashier
    'pos.create',
    'pos.view',
    'customer.view',
    'customer.create',
    'invoice.create',
    'invoice.view',
    'payment.create',
    'payment.view',
    'material.view',
    'lead.create',
    'quote.create',
  ],
  
  12: [ // Support Agent
    'conversation.view',
    'conversation.create',
    'message.send',
    'customer.view',
    'customer.manage',
    'order.view',
    'file.view',
    'file.upload',
  ],
};

async function fixAllRolePermissions() {
  let connection;
  
  try {
    connection = await pool.getConnection();
    console.log('✅ Connected to database');
    
    // Get all permissions from database
    const [permissions] = await connection.execute(
      'SELECT id, code FROM permissions'
    );
    
    const permissionMap = new Map();
    permissions.forEach(p => {
      permissionMap.set(p.code, p.id);
    });
    
    console.log(`📋 Found ${permissions.length} permissions in database`);
    
    // Process each role
    for (const [roleId, permissionCodes] of Object.entries(ROLE_PERMISSIONS)) {
      const roleIdNum = parseInt(roleId);
      
      // Skip owner role - it has special handling
      if (roleIdNum === 1) {
        console.log(`\n👑 Role 1 (Owner): Has all permissions (special handling)`);
        continue;
      }
      
      console.log(`\n🔧 Processing Role ${roleId}:`);
      
      // Get role name
      const [roles] = await connection.execute(
        'SELECT name FROM roles WHERE id = ?',
        [roleIdNum]
      );
      
      if (roles.length === 0) {
        console.log(`   ⚠️  Role ${roleId} not found, skipping...`);
        continue;
      }
      
      const roleName = roles[0].name;
      console.log(`   Role: ${roleName}`);
      
      // Remove existing permissions for this role (to start fresh)
      await connection.execute(
        'DELETE FROM role_permissions WHERE role_id = ?',
        [roleIdNum]
      );
      
      // Add all required permissions
      let addedCount = 0;
      let missingCount = 0;
      
      for (const permCode of permissionCodes) {
        const permId = permissionMap.get(permCode);
        
        if (!permId) {
          console.log(`   ⚠️  Permission "${permCode}" not found in database`);
          missingCount++;
          continue;
        }
        
        // Check if already exists (shouldn't after delete, but just in case)
        const [existing] = await connection.execute(
          'SELECT role_id FROM role_permissions WHERE role_id = ? AND permission_id = ?',
          [roleIdNum, permId]
        );
        
        if (existing.length === 0) {
          await connection.execute(
            'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
            [roleIdNum, permId]
          );
          addedCount++;
        }
      }
      
      console.log(`   ✅ Added ${addedCount} permissions`);
      if (missingCount > 0) {
        console.log(`   ⚠️  ${missingCount} permissions not found in database`);
      }
      
      // Verify
      const [finalPerms] = await connection.execute(
        `SELECT p.code FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role_id = ?
         ORDER BY p.code`,
        [roleIdNum]
      );
      
      console.log(`   📊 Total permissions: ${finalPerms.length}`);
      console.log(`   Permissions: ${finalPerms.map(p => p.code).join(', ')}`);
    }
    
    console.log('\n✅ All role permissions updated successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Users should log out and log back in to refresh their JWT tokens');
    console.log('   2. Check the frontend permission mapping in frontend/src/utils/apiClient.ts');
    console.log('   3. Test each role to ensure they can access their required features');
    
  } catch (error) {
    console.error('❌ Error fixing role permissions:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
    await pool.end();
  }
}

// Run the script
fixAllRolePermissions()
  .then(() => {
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });

