import pool from './src/config/database.js';

async function debugRoles() {
  try {
    console.log('🔍 Debugging Roles Query...');
    
    const [roles] = await pool.execute(`
      SELECT r.*, COUNT(u.id) AS usersCount
      FROM roles r
      LEFT JOIN users u ON u.role_id = r.id
      GROUP BY r.id, r.name, r.description
      ORDER BY r.name
    `);
    
    console.log('✅ Query executed successfully.');
    console.log('📊 Results:');
    console.log(JSON.stringify(roles, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugRoles();
