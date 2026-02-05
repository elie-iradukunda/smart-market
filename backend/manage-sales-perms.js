import pool from './src/config/database.js';

async function manageSalesPermissions() {
  try {
    // 1. List all roles to find Sales
    const [roles] = await pool.execute('SELECT * FROM roles');
    console.log('--- Roles ---');
    roles.forEach(r => console.log(`ID: ${r.id}, Name: ${r.name}`));

    const salesRole = roles.find(r => r.name.toLowerCase().includes('sales'));
    if (!salesRole) {
      console.error('Sales role not found!');
      process.exit(1);
    }
    console.log(`\nFound Sales Role: ID ${salesRole.id}`);

    // 2. List all permissions
    const [permissions] = await pool.execute('SELECT * FROM permissions');
    console.log('\n--- All Permissions ---');
    permissions.forEach(p => console.log(`ID: ${p.id}, Code: ${p.code}, Desc: ${p.description}`));

    // 3. Clear and Assign all permissions to Sales role
    console.log(`\nAssigning all ${permissions.length} permissions to Role ID ${salesRole.id}...`);
    await pool.execute('DELETE FROM role_permissions WHERE role_id = ?', [salesRole.id]);
    
    const values = permissions.map(p => `(${salesRole.id}, ${p.id})`).join(', ');
    if (values) {
      await pool.execute(`INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`);
    }

    console.log('✅ Successfully assigned all permissions to the Sales role.');
    
    // 4. Double check
    const [check] = await pool.execute('SELECT COUNT(*) as count FROM role_permissions WHERE role_id = ?', [salesRole.id]);
    console.log(`Verification: Sales role now has ${check[0].count} permissions.`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

manageSalesPermissions();
