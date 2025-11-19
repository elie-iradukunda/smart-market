import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    // Run table creation
    const createTablesFile = fs.readFileSync(path.join(__dirname, '001_create_tables.sql'), 'utf8');
    const createStatements = createTablesFile.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of createStatements) {
      await pool.execute(statement);
    }
    console.log('Tables created successfully');

    // Run seed data
    const seedDataFile = fs.readFileSync(path.join(__dirname, '002_seed_data.sql'), 'utf8');
    const seedStatements = seedDataFile.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of seedStatements) {
      await pool.execute(statement);
    }
    console.log('Seed data inserted successfully');

    console.log('Database migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();