// Quick test to check permissions for different roles
import pool from './src/config/database.js';

async function testPermissions() {
  try {
    console.log('Testing permissions for different roles...\n');

    // Test Sales Rep (role_id = 9)
    const [salesRepPerms] = await pool.execute(`
      SELECT p.code FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = 9
      ORDER BY p.code
    `);

    console.log('Sales Rep (role 9) permissions:');
    console.log(salesRepPerms.map(p => p.code));
    console.log(`Total: ${salesRepPerms.length}\n`);

    // Test Technician (role_id = 6)
    const [techPerms] = await pool.execute(`
      SELECT p.code FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = 6
      ORDER BY p.code
    `);

    console.log('Technician (role 6) permissions:');
    console.log(techPerms.map(p => p.code));
    console.log(`Total: ${techPerms.length}\n`);

    // Test Owner (role_id = 1) - should have all permissions
    const [ownerPerms] = await pool.execute(`
      SELECT p.code FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = 1
      ORDER BY p.code
    `);

    console.log('Owner (role 1) permissions:');
    console.log(`Total: ${ownerPerms.length} (should be 60)\n`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

testPermissions();

