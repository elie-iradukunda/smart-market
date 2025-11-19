import pool from './src/config/database.js';

async function createRole12() {
  try {
    // Check existing roles
    const [roles] = await pool.execute('SELECT * FROM roles ORDER BY id');
    console.log('Existing roles:');
    roles.forEach(role => console.log(`ID: ${role.id}, Name: ${role.name}`));
    
    // Create role 12 if it doesn't exist
    const [existing] = await pool.execute('SELECT id FROM roles WHERE id = 12');
    if (existing.length === 0) {
      await pool.execute(
        'INSERT INTO roles (id, name, description) VALUES (12, "Super User", "User with complete system access")'
      );
      console.log('✅ Role 12 created successfully');
    } else {
      console.log('Role 12 already exists');
    }
    
    // Give role 12 ALL permissions
    await pool.execute('DELETE FROM role_permissions WHERE role_id = 12');
    await pool.execute(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT 12, id FROM permissions
    `);
    
    // Verify
    const [permCount] = await pool.execute('SELECT COUNT(*) as count FROM permissions');
    const [rolePermCount] = await pool.execute('SELECT COUNT(*) as count FROM role_permissions WHERE role_id = 12');
    
    console.log(`Total permissions: ${permCount[0].count}`);
    console.log(`Role 12 permissions: ${rolePermCount[0].count}`);
    console.log('✅ Role 12 now has ALL permissions!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createRole12();