// Script to run admin setup migrations
// This creates the user_permissions table and 3 admin users

import pool from '../src/config/database.js';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration(filePath) {
  try {
    const sql = readFileSync(filePath, 'utf8');
    
    // Remove comments and split by semicolon
    const cleanedSql = sql
      .split('\n')
      .map(line => {
        // Remove single-line comments
        const commentIndex = line.indexOf('--');
        if (commentIndex !== -1) {
          return line.substring(0, commentIndex);
        }
        return line;
      })
      .join('\n');
    
    // Split by semicolon and filter out empty statements
    const statements = cleanedSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.match(/^\s*$/));
    
    // Use query() instead of execute() for DDL statements
    const connection = await pool.getConnection();
    try {
      for (const statement of statements) {
        if (statement.trim()) {
          await connection.query(statement);
        }
      }
      console.log(`✅ Migration completed: ${filePath}`);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(`❌ Migration failed: ${filePath}`, error.message);
    throw error;
  }
}

async function createAdminUsers() {
  try {
    const password = 'Admin123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add is_super_admin column if it doesn't exist
    const connection = await pool.getConnection();
    try {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE COMMENT 'Super admin flag for users with all privileges'
      `);
      console.log('✅ Added is_super_admin column to users table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  is_super_admin column already exists');
      } else {
        throw error;
      }
    } finally {
      connection.release();
    }

    // Ensure owner role exists and has all permissions
    await pool.execute(`
      INSERT IGNORE INTO roles (id, name, description) 
      VALUES (1, 'owner', 'System owner with complete access and all privileges')
    `);

    // Grant all permissions to owner role
    const [permissions] = await pool.execute('SELECT id FROM permissions');
    for (const perm of permissions) {
      await pool.execute(`
        INSERT IGNORE INTO role_permissions (role_id, permission_id)
        VALUES (1, ?)
      `, [perm.id]);
    }

    // Create 3 admin users
    const adminUsers = [
      {
        name: 'System Administrator',
        email: 'admin@topdesign.com',
        phone: '+250788000001',
        role_id: 1,
        is_super_admin: true
      },
      {
        name: 'Operations Admin',
        email: 'ops.admin@topdesign.com',
        phone: '+250788000002',
        role_id: 1,
        is_super_admin: true
      },
      {
        name: 'IT Administrator',
        email: 'it.admin@topdesign.com',
        phone: '+250788000003',
        role_id: 1,
        is_super_admin: true
      }
    ];

    for (const admin of adminUsers) {
      await pool.execute(`
        INSERT INTO users (name, email, phone, password_hash, role_id, status, is_super_admin)
        VALUES (?, ?, ?, ?, ?, 'active', ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          phone = VALUES(phone),
          password_hash = VALUES(password_hash),
          role_id = VALUES(role_id),
          status = 'active',
          is_super_admin = VALUES(is_super_admin)
      `, [admin.name, admin.email, admin.phone, hashedPassword, admin.role_id, admin.is_super_admin]);
      
      console.log(`✅ Created/Updated admin user: ${admin.email}`);
    }

    console.log('\n📝 Admin users created successfully!');
    console.log('Default password for all admin users: Admin123!');
    console.log('Please change passwords after first login.\n');
  } catch (error) {
    console.error('❌ Failed to create admin users:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting admin setup...\n');

    // Run migrations
    const migration1 = join(__dirname, '../migrations/050_add_user_permissions_table.sql');
    const migration2 = join(__dirname, '../migrations/051_create_three_admin_users.sql');

    await runMigration(migration1);
    await runMigration(migration2);

    // Create admin users
    await createAdminUsers();

    console.log('✅ Admin setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Admin setup failed:', error);
    process.exit(1);
  }
}

main();

