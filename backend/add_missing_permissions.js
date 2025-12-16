import pool from './src/config/database.js';

const missingPermissions = [
  { code: 'user.manage', description: 'Create and manage user accounts' },
  { code: 'role.manage', description: 'Create and manage roles and permissions' },
  { code: 'audit.view', description: 'View audit logs' },
  { code: 'settings.manage', description: 'Manage system-wide settings' },
  { code: 'customer.manage', description: 'Create and manage customers' },
  { code: 'customer.update', description: 'Update existing customers' },
  { code: 'lead.manage', description: 'Create and manage leads' },
  { code: 'lead.view', description: 'View leads' },
  { code: 'quote.manage', description: 'Create and manage quotes and quote items' },
  { code: 'quote.view', description: 'View quotes' },
  { code: 'order.create', description: 'Create new orders' },
  { code: 'workorder.view', description: 'View work orders' },
  { code: 'inventory.manage', description: 'Manage materials, suppliers, and purchase orders' },
  { code: 'supplier.view', description: 'View suppliers' },
  { code: 'po.view', description: 'View purchase orders' },
  { code: 'po.approve', description: 'Approve purchase orders' },
  { code: 'invoice.view', description: 'View invoices' },
  { code: 'invoice.send', description: 'Send invoices to customers' },
  { code: 'payment.view', description: 'View payments' },
  { code: 'payment.refund', description: 'Process payment refunds' },
  { code: 'pos.view', description: 'View POS sales history' },
  { code: 'campaign.manage', description: 'Manage marketing campaigns' },
  { code: 'campaign.launch', description: 'Launch marketing campaigns' },
  { code: 'ad.create', description: 'Create ads' },
  { code: 'ad.view', description: 'View ads' },
  { code: 'ad.edit', description: 'Edit ads' },
  { code: 'ad.delete', description: 'Delete ads' },
  { code: 'conversation.create', description: 'Create conversations' },
  { code: 'message.create', description: 'Create/send messages' },
  { code: 'file.view', description: 'View uploaded files' }
];

(async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('✅ Connected to database');

    let addedCount = 0;
    for (const perm of missingPermissions) {
      // Check if permission already exists
      const [existing] = await connection.execute(
        'SELECT id FROM permissions WHERE code = ?',
        [perm.code]
      );

      if (existing.length === 0) {
        await connection.execute(
          'INSERT INTO permissions (code, description) VALUES (?, ?)',
          [perm.code, perm.description]
        );
        console.log(`✅ Added permission: ${perm.code}`);
        addedCount++;
      } else {
        console.log(`⏭️  Permission already exists: ${perm.code}`);
      }
    }

    console.log(`\n📊 Summary: Added ${addedCount} new permissions`);

    // Show total permissions
    const [total] = await connection.execute('SELECT COUNT(*) as count FROM permissions');
    console.log(`📋 Total permissions in database: ${total[0].count}`);

  } catch (error) {
    console.error('❌ Error adding permissions:', error);
  } finally {
    if (connection) {
      connection.release();
    }
    await pool.end();
  }
})();
